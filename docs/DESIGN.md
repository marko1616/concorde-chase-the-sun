> 归档说明：下文保留 v7 制作时的历史记录。旧 ZIP、MP4、production 检查报告和旧版对照不随本 Git 仓库重复分发；本仓库的当前构建方式、素材范围与实际验收分别见 BUILD.md、ASSETS.md、VALIDATION.md。文中的相对路径以原 v7 交付根目录为基准。

# v7 directing decisions

## Principle

Musical phrase energy governs the scale, velocity and abruptness of visual motion. An onset detector also detects small transients in quiet phrases: those do not license large movement. Keep the main subject and camera uninterrupted when adding information. A new scene is not a cue to launch a second full-screen explanation immediately afterwards.

## Local science thread

| Entry–exit | Insert | Placement | Fade each side |
|---|---|---|---|
| 12.80–18.20 | Preparation file: meet, integrate, rehearse | Lower left | 1.3 s |
| 40.30–45.80 | Analogue FBW signal chain | Upper right | 1.25 s |
| 67.20–74.00 | Optical design / window and light path | Left of cabin window | 2.4 s |
| 104.10–108.75 | Corona / Fe XIV illustrative profile | Above aircraft, right | 1.1 s |
| 159.60–167.00 | Observing-time results | Upper left | 1.5 s |
| 178.00–184.35 | Research archive | Upper right | 2.0 s |

Each panel occupies less than 14% of the image. No panel has a whole-screen entry translation, camera reset or aircraft relocation. The main flight composition continues normally. Shared quintic fades have zero endpoint velocity/acceleration. Spatial drift is only a few pixels per second in quiet scenes. The preparation insert is a concise design-file summary, not a succession of pages and stamps. Light paths interpolate their terminal point rather than popping to the next vertex. Spectrum scanning makes one continuous pass; it never wraps abruptly.

The optical card does not appear at 65 seconds; the cabin composition remains uninterrupted there. Its later appearance uses a 2.4-second fade. The spectrum card finishes before the incompatible aircraft projection begins changing, including intermediate frames. Preparation/source disclaimers remain small secondary information, not dominant narrative content.

## Main-thread corrections

- Quiet title and annotation reveals use gentle opacity changes and short translations, not wide wipes.
- Autopilot information uses short, slow crossfades in the first musical rest.
- The cabin transition is lengthened. Pursuit transition and camera release wait until 73.842 s rather than anticipating the musical return.
- The second rapid map entry is moved to the existing measured 109.0322 s onset before the musical energy release; its return is lengthened across the reduced-energy build.
- Late scene transitions and the end-title reveal are lengthened. Their steady underlying motion continues rather than abruptly freezing.
- The pre-climax retains 6 buildup camera accents. The post-release section replaces all 9 old clap-timed detail zooms with 11 low-dominant kick cues from 131.541–143.0748 s. The 132.11 s clap-timed foreground wipe and the corner beat counter are removed. See the percussion section below.

## Corona

A cached high-resolution transparent Canvas drawing contains 1,100 cubic Bezier streamers and four families of curved loops, with angular asymmetry, variable density/width, inner halo and fading outer filaments. All seeds and control points are deterministic. The same artwork is used in the science inserts and the main total-eclipse disk. Its brightness follows the existing continuous eclipse phase; it does not flash or acquire a fast autonomous animation in a quiet phrase. The drawing follows the user's supplied morphological reference but is not represented as 1973 photographic evidence or a physical field model.

## Invariants

v6 files remain unchanged. Same soundtrack and 187-second output duration; same physical pointer-over-window layer order; same ordinary geographic projection and dorsal ground-view aircraft; same 20 seekable chapters. Scientific plots, hardware diagrams, route and sensor readings remain explicitly illustrative.

## Percussion correction / 2:15

The full-band onset list alternated low-frequency dominant beats with stronger clap/noise backbeats. Low energy is also present on some backbeats; this is not clean stem separation. A 25–90 Hz / 35–170 Hz / 180–850 Hz / 1.8–8.5 kHz comparison identifies the intended principal kick beats. At 135.0032 s the normalized sub-band peak is 1.241 with clap-band 0.692; at 135.5719 s they are 0.911 and 1.231. The old step-zoom used the latter. Timing and band evidence are retained in source/kick-cues.json and production/drum-band-analysis.json.

The new phrase follows the low-dominant kicks. It reveals the silhouette, banks the rigid airframe, advances a wing-attached leading-edge/material highlight, outlines all four nacelles and drives four aft flow traces. Background reference curves accelerate continuously on those kicks and then coast, with expanding pressure graphics behind the aircraft. Camera zoom is not the primary beat mechanism. Short impulse envelopes return to zero before the clap backbeat; the aircraft keeps its new pose between kicks. Pressure and flow graphics are editorial motion design, not aerodynamic simulation or actual flight maneuvers.

Verification checks each selected cue against the source onset table, ensures the impulse is inactive on clap timestamps, and compares full-frame motion around actual kick vs clap times. Frequency analysis and frame comparisons are objective checks; they do not claim human listening certification or aesthetic approval.

A frame-change check also caught an unrelated aircraft-view shutter starting on the final clap at 142.4961 s. The next composition now begins on 143.0748 s, and keeps the same ventral aircraft until the established ground-view occlusion; the unnecessary ventral→profile→dorsal double exchange is removed.

Final encoded review found low-motion intervals during the still-energetic results passage and incomplete end-title opacity. Continuous depth-reference travel now continues through scene 16, and the final title fades from 183.4 s to full opacity before the 185.65 s hold. These changes are strictly after 156.8 s; 97 pixel-identical prefix checks support reusing the first 150 seconds while exporting the corrected tail. The assembled film is decoded and inspected again in full.

Final reference-layer visibility is amplified smoothly during 156.8–168.465 s, preserving the energetic results passage and easing down with the music. Low-motion detection during the deliberate final deceleration (after 185.2 s) is distinguished from the exact frozen hold beginning at 185.65 s.
