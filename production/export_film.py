#!/usr/bin/env python3
"""Stream deterministic browser captures into resumable H.264 chunks, then mux music.

Contract: await __ready; __seek(t) paints synchronously; __capture(t,fps) returns a
JPEG data URL. The page owns actual temporal sampling. Its sRGB integration is
recorded as a preview approximation, not linear-light shutter integration.
"""
import argparse
import asyncio
import base64
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from PIL import Image
from playwright.async_api import async_playwright

# Portable defaults; explicit environment overrides remain available.
FFMPEG = Path(os.environ.get('FFMPEG_BIN') or shutil.which('ffmpeg') or 'ffmpeg')
CHROME = Path(os.environ['CHROME_BIN']) if os.environ.get('CHROME_BIN') else None
FONTCONFIG = Path(os.environ['FONTCONFIG_FILE']) if os.environ.get('FONTCONFIG_FILE') else None
LIBROOT = Path(os.environ['BROWSER_LIB_ROOT']) if os.environ.get('BROWSER_LIB_ROOT') else None
BROWSER_ARGS = ['--disable-dev-shm-usage', '--disable-gpu']


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def atomic_json(path, data):
    path = Path(path)
    tmp = path.with_name(path.name + '.tmp')
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    tmp.replace(path)


def source_fingerprint(html):
    extensions = {'.html', '.js', '.mjs', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.ttf', '.otf', '.json'}
    return {str(p.relative_to(html.parent)): digest(p) for p in sorted(html.parent.rglob('*'))
            if p.is_file() and p.suffix.lower() in extensions and not p.name.endswith('.render.json')
            and not any(part.startswith('.') for part in p.relative_to(html.parent).parts)}


def env_setup():
    if FONTCONFIG:
        os.environ['FONTCONFIG_FILE'] = str(FONTCONFIG)
    if LIBROOT:
        additions = [str(LIBROOT / 'usr/lib/x86_64-linux-gnu'), str(LIBROOT / 'lib/x86_64-linux-gnu')]
        os.environ['LD_LIBRARY_PATH'] = ':'.join(additions + ([os.environ['LD_LIBRARY_PATH']] if os.environ.get('LD_LIBRARY_PATH') else []))


async def open_page(playwright, html, errors):
    browser = await playwright.chromium.launch(executable_path=str(CHROME) if CHROME else None, args=BROWSER_ARGS)
    try:
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        page.set_default_timeout(120000)
        page.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
        page.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' else None)
        page.on('requestfailed', lambda r: errors.append('requestfailed: ' + r.url + ': ' + str(r.failure)))
        await page.goto(html.as_uri() + '?export=1', wait_until='load')
        await page.evaluate('async () => { await window.__ready; await document.fonts.ready; }')
        if errors:
            raise RuntimeError('\n'.join(errors))
        return browser, page
    except BaseException:
        await browser.close()
        raise


def jpeg_bytes(data):
    if not isinstance(data, str) or not data.startswith('data:image/jpeg;base64,'):
        raise ValueError('__capture must return a JPEG data URL')
    raw = base64.b64decode(data.partition(',')[2], validate=True)
    if raw[:2] != b'\xff\xd8' or raw[-2:] != b'\xff\xd9':
        raise ValueError('Invalid/truncated JPEG')
    return raw


async def inspect_page(html, fps):
    errors = []
    async with async_playwright() as p:
        browser, page = await open_page(p, html, errors)
        try:
            meta = await page.evaluate('''() => ({meta: window.__meta,
                seek: typeof window.__seek, capture: typeof window.__capture,
                canvas: [document.querySelector('#film')?.width, document.querySelector('#film')?.height]})''')
            if meta['seek'] != 'function' or meta['capture'] != 'function' or meta['canvas'] != [1920, 1080]:
                raise RuntimeError('Invalid composition contract: ' + repr(meta))
            dur = float(meta['meta']['dur'])
            if not math.isfinite(dur) or dur <= 0:
                raise RuntimeError('Invalid duration')
            ta, tb = min(1.25, dur * .2), dur * .63
            async def seek_image(t):
                return await page.evaluate('(t) => { window.__seek(t); return document.querySelector("#film").toDataURL("image/png"); }', t)
            a = await seek_image(ta)
            b = await seek_image(tb)
            aa = await seek_image(ta)
            if a != aa:
                raise RuntimeError('A-B-A deterministic seeking failed')
            cap = jpeg_bytes(await page.evaluate('([t,fps]) => window.__capture(t,fps)', [ta, fps]))
            with Image.open(io.BytesIO(cap)) as im:
                if im.size != (1920, 1080):
                    raise RuntimeError('Capture dimensions mismatch')
            if errors:
                raise RuntimeError('\n'.join(errors))
            return {'page': meta, 'deterministic_seek_ABA': True, 'sample_times': [ta, tb],
                    'different_action_samples': a != b, 'capture_dimensions': [1920, 1080], 'browser_errors': errors}
        finally:
            await browser.close()


async def render_chunk(job, args, workdir, identity):
    number, first, last = job
    path = workdir / f'chunk-{number:04d}.mp4'
    receipt = path.with_suffix('.json')
    if args.resume and receipt.exists() and path.exists():
        record = json.loads(receipt.read_text())
        if record.get('identity') == identity and record.get('sha256') == digest(path) and record.get('first_frame') == first and record.get('end_frame_exclusive') == last:
            print(f'RESUMED chunk {number}: frames {first}..{last-1}', flush=True)
            return record
    temp = path.with_name(path.stem + '.partial.mp4')
    log = workdir / f'chunk-{number:04d}.ffmpeg.log'
    errors = []
    begun = time.time()
    proc = None
    browser = None
    submitted = 0
    with log.open('wb') as lf:
        async with async_playwright() as p:
            try:
                browser, page = await open_page(p, args.html, errors)
                cmd = [str(FFMPEG), '-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe',
                       '-vcodec', 'mjpeg', '-framerate', str(args.fps), '-i', 'pipe:0', '-an',
                       '-c:v', 'libx264', '-preset', args.preset, '-crf', str(args.crf),
                       '-pix_fmt', 'yuv420p', '-threads', '2', '-r', str(args.fps),
                       '-video_track_timescale', str(args.fps * 1000), '-movflags', '+faststart', str(temp)]
                proc = await asyncio.create_subprocess_exec(*cmd, stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.DEVNULL, stderr=lf)
                for frame in range(first, last):
                    t = args.start + frame / args.fps
                    data = await page.evaluate('([t,fps]) => window.__capture(t,fps)', [t, args.fps])
                    if errors:
                        raise RuntimeError('\n'.join(errors))
                    raw = jpeg_bytes(data)
                    if proc.returncode is not None:
                        raise RuntimeError(f'Encoder stopped early ({proc.returncode}); see {log}')
                    proc.stdin.write(raw)
                    await proc.stdin.drain()  # bounded pipe, ordered frames, no capture backlog
                    submitted += 1
                    if submitted % 60 == 0 or frame == last - 1:
                        print(f'CHUNK {number}: {submitted}/{last-first} frames; t={t:.3f}; {time.time()-begun:.1f}s', flush=True)
                proc.stdin.close()
                await proc.stdin.wait_closed()
                code = await proc.wait()
                if code:
                    raise RuntimeError(f'Encoder exit {code}; see {log}')
                temp.replace(path)
                record = {'chunk': number, 'first_frame': first, 'end_frame_exclusive': last,
                          'frames': submitted, 'first_time': args.start + first / args.fps,
                          'last_time': args.start + (last-1) / args.fps,
                          'seconds': time.time()-begun, 'encoder_exit': code, 'browser_errors': errors,
                          'path': str(path), 'sha256': digest(path), 'identity': identity}
                atomic_json(receipt, record)
                return record
            finally:
                if proc and proc.returncode is None:
                    proc.terminate()
                    try:
                        await asyncio.wait_for(proc.wait(), 10)
                    except asyncio.TimeoutError:
                        proc.kill()
                        await proc.wait()
                if browser:
                    await browser.close()


def checked(cmd, log):
    with Path(log).open('wb') as f:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=f, check=True)


def validate_media(path, frames, fps, audio, log):
    command = [str(FFMPEG), '-hide_banner', '-v', 'info', '-nostats', '-progress', 'pipe:1',
               '-i', str(path), '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-']
    result = subprocess.run(command, capture_output=True, text=True)
    Path(log).write_text(result.stderr + '\n' + result.stdout)
    if result.returncode:
        raise RuntimeError(f'Full decode failed: {log}')
    counts = re.findall(r'^frame=(\d+)$', result.stdout, flags=re.M)
    decoded = int(counts[-1]) if counts else None
    header = result.stderr.split('Output #0')[0]
    video_match = re.search(r'Video: h264[^\n]*1920x1080[^\n]*?([\d.]+) fps', header)
    has_audio = bool(re.search(r'Audio: aac', header))
    if decoded != frames or not video_match or abs(float(video_match[1])-fps) > .01 or has_audio != audio:
        raise RuntimeError(f'Media metadata mismatch: frames={decoded}, expected={frames}, video={video_match}, AAC={has_audio}; see {log}')
    duration_match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', header)
    container_duration = sum(float(v)*m for v,m in zip(duration_match.groups(), (3600,60,1))) if duration_match else None
    if container_duration is None or abs(container_duration-frames/fps) > .06:
        raise RuntimeError(f'Unexpected container duration {container_duration}; expected about {frames/fps}')
    return {'full_decode_exit': 0, 'decoded_video_frames': decoded, 'size': [1920,1080],
            'fps': fps, 'decoded_video_duration': decoded/fps, 'container_duration_rounded_10ms': container_duration,
            'AAC_audio_present': has_audio, 'full_decode_log': str(log)}


async def run(args):
    begun = time.time()
    report_path = args.output.with_suffix('.render.json')
    workdir = args.output.parent / ('.' + args.output.stem + '-chunks')
    workdir.mkdir(parents=True, exist_ok=True)
    report = {'status': 'running', 'html': str(args.html), 'output': str(args.output),
              'audio': str(args.audio) if args.audio else None, 'fps': args.fps, 'workers': args.workers,
              'encoder': {'codec': 'libx264', 'preset': args.preset, 'crf': args.crf, 'pixel_format': 'yuv420p'},
              'ffmpeg': str(FFMPEG), 'chromium': str(CHROME) if CHROME else 'playwright-managed', 'browser_flags': BROWSER_ARGS,
              'reference': {'repository': 'https://github.com/feitangyuan/onetake',
                            'revision': 'abb6d17279cdc749e27e99aa534a062d8fd01ced',
                            'scope': 'Inspected deterministic seek, real temporal sampling, frame export and verification principles; independent Canvas JPEG streaming exporter, not upstream renderer or p5.brush.'},
              'frame_count_policy': 'ceil((end-start)*fps), sample at start+i/fps; final video may exceed audio by <1 frame',
              'motion_blur': {'owner': 'page.__capture', 'integration': 'sRGB temporal accumulation, preview approximation; NOT linear-light integration', 'implementation_verified_by_exporter': False},
              'unverified': ['Aesthetic acceptance and subjective music synchronization are not verified by this exporter.', 'Temporal sampling and shutter behavior must be audited in composition source.'],
              'disk_free_bytes_before': shutil.disk_usage(args.output.parent).free}
    try:
        info = await inspect_page(args.html, args.fps)
        dur = info['page']['meta']['dur']
        end = dur if args.end is None else args.end
        if args.start < 0 or end > dur + 1e-7 or end <= args.start:
            raise ValueError(f'Require 0 <= start < end <= {dur}')
        frames = math.ceil((end-args.start) * args.fps - 1e-9)
        fingerprints = source_fingerprint(args.html)
        settings = {'source': fingerprints, 'audio_sha256': digest(args.audio) if args.audio else None,
                    'fps': args.fps, 'start': args.start, 'end': end, 'frames': frames,
                    'crf': args.crf, 'preset': args.preset, 'chunk_frames': args.chunk_frames}
        identity = hashlib.sha256(json.dumps(settings, sort_keys=True).encode()).hexdigest()
        report.update({'preflight': info, 'start': args.start, 'end': end, 'frames': frames,
                       'video_duration': frames/args.fps, 'audio_trim_duration': end-args.start,
                       'input_fingerprints': settings, 'identity': identity})
        atomic_json(report_path, report)
        semaphore = asyncio.Semaphore(args.workers)
        jobs = [(n, first, min(first+args.chunk_frames, frames)) for n,first in enumerate(range(0, frames, args.chunk_frames))]
        async def guarded(job):
            async with semaphore:
                return await render_chunk(job, args, workdir, identity)
        tasks = [asyncio.create_task(guarded(j)) for j in jobs]
        try:
            records = await asyncio.gather(*tasks)
        except BaseException:
            for t in tasks:
                t.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
            raise
        records.sort(key=lambda r:r['first_frame'])
        listing = workdir / 'concat.txt'
        # All generated filenames are simple relative names, not shell-interpolated user paths.
        listing.write_text(''.join("file '" + Path(r['path']).name + "'\n" for r in records))
        silent = workdir / 'silent.mp4'
        checked([str(FFMPEG), '-hide_banner', '-v', 'error', '-y', '-f', 'concat', '-safe', '1', '-i', str(listing),
                 '-c:v', 'copy', '-an', '-movflags', '+faststart', str(silent)], workdir/'concat.log')
        final_tmp = workdir / 'final.mp4'
        if args.audio:
            checked([str(FFMPEG), '-hide_banner', '-v', 'error', '-y', '-i', str(silent), '-ss', str(args.start),
                     '-t', str(end-args.start), '-i', str(args.audio), '-map', '0:v:0', '-map', '1:a:0',
                     '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', str(final_tmp)], workdir/'mux.log')
        else:
            shutil.copyfile(silent, final_tmp)
        report['validation'] = validate_media(final_tmp, frames, args.fps, bool(args.audio), workdir/'decode.log')
        final_tmp.replace(args.output)
        report.update({'status': 'complete', 'chunks': records, 'seconds': time.time()-begun,
                       'output_sha256': digest(args.output), 'output_bytes': args.output.stat().st_size})
        atomic_json(report_path, report)
        print(json.dumps({'status': 'complete', 'output': str(args.output), 'frames': frames,
                          'seconds': report['seconds'], 'report': str(report_path)}), flush=True)
    except BaseException as exc:
        report.update({'status': 'failed', 'error': repr(exc), 'seconds': time.time()-begun})
        atomic_json(report_path, report)
        raise


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--html', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    ap.add_argument('--audio', type=Path)
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--workers', type=int, default=2)
    ap.add_argument('--start', type=float, default=0)
    ap.add_argument('--end', type=float)
    ap.add_argument('--chunk-frames', type=int, default=450)
    ap.add_argument('--crf', type=int, default=18)
    ap.add_argument('--preset', default='fast')
    ap.add_argument('--resume', action='store_true')
    ap.add_argument('--overwrite', action='store_true')
    args = ap.parse_args()
    args.html = args.html.resolve()
    args.output = args.output.resolve()
    args.audio = args.audio.resolve() if args.audio else None
    if args.fps < 1 or args.workers < 1 or args.chunk_frames < 1:
        ap.error('fps, workers and chunk-frames must be positive')
    for path in [p for p in [args.html, FFMPEG, CHROME, FONTCONFIG, args.audio] if p is not None]:
        if not path.is_file():
            ap.error(f'Missing dependency/input: {path}')
    if args.output.exists() and not args.overwrite:
        ap.error('Output exists; choose a new output or explicitly use --overwrite')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    env_setup()
    asyncio.run(run(args))


if __name__ == '__main__':
    main()
