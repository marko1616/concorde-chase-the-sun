> 归档说明：下文保留 v7 制作时的历史记录。旧 ZIP、MP4、production 检查报告和旧版对照不随本 Git 仓库重复分发；本仓库的当前构建方式、素材范围与实际验收分别见 BUILD.md、ASSETS.md、VALIDATION.md。文中的相对路径以原 v7 交付根目录为基准。

# v7 source validation

- 11,220 samples across the timeline: finite positive camera scale and finite aircraft poses; all established ground views use the dorsal aircraft; ordinary map-axis projection error < 1e-8 pixels.
- Deterministic A–B–A seeking at representative action times, plus all six actual local-insert midpoints. Cached corona artwork remains deterministic across seeking.
- 234 scene, insert, projection and beat-boundary samples render without browser errors.
- All six local inserts start > 2.5 seconds after the chapter boundary and occupy 9.1%–13.9% of the picture. The quiet optical/archival panels move no faster than 10.3/12.5 pixels per second.
- 0.15-second samples during visible insert intervals show zero bright-airframe pixels inside the panel bounds. This is a conservative image-mask check of aircraft overlap, distinct from manual typography/diagram inspection.
- 36 altitude-pointer angles preserve the order dial/window → digits → hand/spindle; varying window crops correctly reflect transient hand occlusion.
- Actual UI events passed: 20 chapter buttons, chapter jump, playback speed, play/pause, seek and resume.

## Quiet passages / continuous frames

Same renderer, 15 fps audit sampling, 192×108 comparison image, RGB mean absolute difference on a 0–255 scale. These compare motion discontinuities, not beauty or subjective listening.

| Interval | v6 maximum frame difference | v7 maximum frame difference |
|---|---:|---:|
| 64.5–67.5 s | 30.57 | 4.70 |
| 67.5–73.6 s | 37.20 | 1.86 |
| 175.9–184.2 s | 26.90 | 6.55 |

Raw samples and policy checks: `production/music-motion-audit.json`. Re-running its v6/v7 comparison requires `--baseline-html` pointing to the retained v6 player; v6 is not duplicated into this archive.

## Kick versus clap

- Separate low-frequency bands from the high-frequency clap/noise band; retained data in `production/drum-band-analysis.json`.
- Eleven selected low-dominant kick cues match the retained onset table within 0.001 s. Every kick response reaches its designed near-peak at +75 ms; it is zero at every listed clap timestamp.
- Full-frame difference around the steady post-release kick moments averages 8.916, versus 2.328 around competing clap moments: 3.83×. Initial pullback and final scene handoff are excluded from this comparison because they are continuous phrase transitions, not standalone beat effects.
- The frame check exposed a separate late projection shutter landing on clap; that transition was moved to the next kick and the unnecessary intermediate aircraft projection removed.
- Main effects are rigid aircraft poses, wing material/contour reveal, four nacelle flow paths, accelerating reference layers and curved pressure graphics. The old post-release zoom staircase and corner beat text counter are removed.

Receipts: `production/checks-v7.json`, `production/local-composition-check.json`, `production/kick-choreography-check.json`. These are objective render checks, not human listening certification. Diagrams, corona, flow graphics and readings are illustrative.

## Packaging and final media

This ZIP is the editable source package. Its clean-rebuild and extracted-player receipt is provided beside it as `production/package-verification.json`, avoiding a self-referential archive hash. Final video decoding/detection evidence is provided alongside the MP4 as `.render.json`, `VALIDATION.md` and `production/encoded-verification.json`.

## Final-tail correction

The first encoded candidate exposed two low-motion intervals in the results passage and a dim final title. Both were corrected before delivery: scene 16 now retains continuous depth-reference motion, and the title reaches full opacity before the final hold. Changes begin after 156.8 s. A source-scope review and 97 pixel-identical comparisons across 0–150 s support reusing that unchanged prefix and re-rendering the tail. The resulting assembled MP4 is fully decoded and checked again. See production/tail-fix-check.json and the final media receipt.

Final reference-layer visibility is amplified smoothly during 156.8–168.465 s, preserving the energetic results passage and easing down with the music. Low-motion detection during the deliberate final deceleration (after 185.2 s) is distinguished from the exact frozen hold beginning at 185.65 s.
