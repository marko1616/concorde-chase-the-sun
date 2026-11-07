---
name: direct-music-led-technical-animation
description: Direct music-led technical films; fix kick/clap timing, intrusive explanations, rigid-body continuity, and quiet-to-climax motion before export.
---

# Direct music-led technical animation

Use for code-driven films that combine a persistent technical subject, musical phrasing, and explanatory inserts. Use the project's existing renderer; this skill governs visual direction and acceptance, not a replacement rendering framework. Do not turn a soundtrack correction into an unrelated redesign.

## 1. Establish the visual and factual contract

Read the current source, supplied references and accepted output before editing. Identify the main subject, palette, type, projection, camera model, final title, soundtrack version and precise criticized interval. Separate historical facts, schematic diagrams, uncalibrated instrument dynamics and poetic imagery in the captions and source notes. Verify technical claims against primary sources rather than treating reference artwork as evidence.

Record what must remain unchanged and which layer owns the correction. Pin any borrowed motion code and retain its license; studying a reference's export architecture does not reproduce its visual style. Keep project-specific times, colors and filenames in the project docs, not this reusable skill.

Check: the change has a bounded interval and named visual/technical invariants.

## 2. Identify the intended percussion before assigning actions

Read the actual soundtrack, not a generic BPM assumption. Map phrase energy, quiet passages, release points and deliberate ending holds. Inspect low-frequency kick energy separately from mid/high-frequency clap or snare transients using FFmpeg filtering or an isolated Python audio-analysis environment; tune bands to this recording. A full-band onset detector is only a candidate list, and band filtering is not clean stem separation.

Create a cue table with time, intended instrument, competing accent, action onset, action peak and confidence. Compare the suspected kick and clap neighborhoods in the audio and, when listening is available, audition them. If listening is unavailable, explicitly label the evidence as spectral/timing analysis. Do not silently snap all accents to a uniform grid or require every onset to cause motion.

Check: selected beats are distinguished from nearby competing beats and their visible response timing is intentional.

## 3. Map musical energy to visible physical actions

Assign emphasized beats to actions of the subject, material or world: banking, an attached contour reveal, nacelle flow, depth-layer acceleration or equivalent subject-specific changes. Keep text counters and global zoom secondary. Preserve rigid subject proportions; obtain perceived speed from reference layers at different depths rather than stretching an aircraft or instrument.

During quiet phrases, reduce motion amplitude and rate, lengthen reveals, and retain continuous low-energy travel where appropriate. Start a release with the musical phrase, not at an earlier chapter boundary. Continue meaningful movement while the music remains energetic, then taper it into a deliberate final hold.

Check: a motion inventory names what changes on each emphasized cue and what continues between cues.

## 4. Keep explanations local and subordinate

Let a scene establish before a secondary explanation appears. Put one concise diagram or result in actual negative space; size it from the composition rather than copying a universal percentage. Keep the primary subject and camera running through the insert. Avoid resetting the camera, relocating the subject or replacing the whole screen merely to teach a point.

Evaluate the complete entrance, readable interval and exit under the actual camera transform. Include neighboring scene transitions: a wing can enter an initially empty corner while the card is fading out. Shorten or reposition the insert if their paths overlap. Use continuous reveals for signal paths and plots; prevent scan wraparound and integer chapter switches from causing unintended flashes.

Check: the moving subject, instruments, title and insert remain legible throughout the interval, not only at its midpoint.

## 5. Preserve object identity and physical layer order

Carry one stable object through position, scale, orientation and occlusion changes. Hide incompatible 2D projections behind a genuine full occlusion before exchanging drawings; do not expose joined halves of unrelated views. Inspect adjacent frames at every projection boundary.

For counter-pointer instruments, derive needles and digit wheels from a shared continuous quantity; quantize only the displayed readout. Paint the dial/window and digits before the needle/spindle. Sweep the full needle range and accept real transient occlusion rather than repainting digits on top. Label invented damping and disturbances as design parameters, not measured aircraft data.

Check: subject geometry stays coherent and instrument layering remains physically consistent at crossings.

## 6. Review continuous sequences, not just attractive stills

Use the renderer's deterministic absolute-time entry point to capture A, B and A again; require identical A frames after seeking. Render contact sheets and short clips around quiet transitions, inserts, projection changes, kicks, competing claps and the ending. Sample densely enough for the shortest intended event and include both sides of each boundary.

Compare adjacent frames at intended and competing accents with one fixed resolution and metric. Inspect unexpected spikes and low-motion intervals rather than maximizing a numerical score. Check independent camera, shutter and projection transitions too: correcting a kick impulse does not fix a separate clap-timed cut. Treat image differences as timing/discontinuity evidence, not proof of beauty or subjective synchronization.

Check: every reported correction has a reproducible interval and observations from continuous frames or clips.

## 7. Validate the final encoded result and cover

Inspect the actual MP4 after rendering: fully decode it, verify frame count, dimensions, fps, duration and expected audio, and sample the edited intervals again. Use FFmpeg black/freeze detection as a locator; distinguish intended holds and dark scenes from failures before editing. Ensure the final title reaches its designed readable state before the hold.

When only a tail changes, reuse an earlier encoded prefix only after checking unchanged source scope, representative pixel comparisons, exact frame/chunk alignment and compatible encoding parameters. Decode and inspect the assembled boundary and complete output afterward; do not infer unchanged visuals merely from unchanged duration.

When the user chooses a film frame as the cover, extract that actual decoded frame and inspect its crop and text. Prefer this established visual language over generating a stylistically different cover. Record the source frame index and time; do not silently replace the user's chosen frame.

Check: acceptance refers to the delivered encoding and selected cover, not only the live renderer.

## 8. Preserve reproducibility when preparing public source

Keep editable source, cue records, asset notices and runtime inputs explicit. Separate generated outputs from tracked source, and replace container-specific executable paths with documented overrides. If the public package excludes a private soundtrack, preserve the private original and provide a usable silent clock or local-file audio path; keep browser-only audio selection separate from export audio input.

Test play/pause, seek, speed, chapter jumps and local audio through real controls. Rebuild from a clean extraction without an old generated HTML, then compare outputs and sample actual rendered frames. State which platform, audio path and full-film checks were actually tested. Apply a newly requested license only to material the project can license, retaining third-party notices and restrictions.

Check: another checkout can reproduce the documented workflow, and delivery distinguishes fresh verification from historical receipts.
