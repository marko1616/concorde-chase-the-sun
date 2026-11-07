"""Build a self-contained, silent-by-default player using Python's standard library."""
from pathlib import Path
import argparse
import base64
import json

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audio', type=Path, help='Optional local MP3 to embed for private playback')
    parser.add_argument('--output', type=Path, default=ROOT / 'build/index.html')
    args = parser.parse_args()
    src = ROOT / 'source'
    art = {
        'svg': {p.stem: p.read_text(encoding='utf-8') for p in sorted((src / 'assets').glob('*.svg'))},
        'fonts': {p.stem: base64.b64encode(p.read_bytes()).decode('ascii') for p in sorted((src / 'assets').glob('*.woff'))},
        'raster': {key: base64.b64encode((src / 'assets' / name).read_bytes()).decode('ascii')
                   for key, name in [('world', 'world-relief.webp'), ('region', 'africa-relief.webp')]},
    }
    values = {'__ART__': json.dumps(art, ensure_ascii=False),
              '__MP3__': base64.b64encode(args.audio.read_bytes()).decode('ascii') if args.audio else ''}
    for token, filename in [('__AUDIO__', 'audio-cues.json'), ('__GEOGRAPHY__', 'geography.json'),
                            ('__MOTION__', 'motion.js'), ('__FILM__', 'film.js'),
                            ('__ATLAS__', 'atlas.js'), ('__NARRATIVE__', 'narrative.js')]:
        values[token] = (src / filename).read_text(encoding='utf-8')
    html = (ROOT / 'production/player-template.html').read_text(encoding='utf-8')
    for token, value in values.items():
        html = html.replace(token, value.replace('</script', '<\\/script'))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(html, encoding='utf-8')
    print('Built', args.output)


if __name__ == '__main__':
    main()
