# CROWNMIND — Presentation Engine II

Implemented and validated on September 6, 2026 (America/New_York).
Baseline: `16d8bdf869bd25a57c2d341db59c164e47a5680a`.

## Scope and contract

The world now occupies the full stage between the resource bar and command dock.
A compact Sovereign lens explains the current phase and next action; selection opens
an inspector over the map; strategic work opens one grouped workspace. The setup
screen uses a seed-responsive, explicitly illustrative realm study.

This is a presentation refactor. Simulation systems, ECS implementation, RNG,
world generation, AI decisions, resource rules, combat, diplomacy, equipment,
progression, save schema, and the existing static-host base path are unchanged.
No production dependency was added. Actual saved configurations remain loadable,
including speeds and modes not offered as setup presets.

The existing spell buttons had no connected callbacks in GameScreen. The inspector
now explains that limitation instead of presenting working-looking controls.
This work does not introduce spell or bounty mechanics.

## Visual language

Obsidian glass and cartographic framing surround a readable procedural kingdom.
Gold marks Sovereign authority, violet marks cognition, cyan marks inspection and
selected intent, green marks vitality, and rose marks hostile pressure. Shape,
labels, and placement supplement color.

Heroes and buildings have stronger silhouettes, ground contact, restrained life,
damage feedback, veteran/equipment markers, and screen-sized labels at useful
zoom levels. Forest canopies remain legible at normal zoom. Roads, resource
deposits, shores, and discovered fog boundaries stay tied to the real map.

The discovered Spire carries branching ground corruption, orbiting arc segments,
rising motes, and a phase-dependent tint at the edge of the interface. Hidden
lairs do not gain map markers or camera targets merely because they exist in ECS.
Night lighting remains mild enough to preserve inspection. Seasonal color,
rain, storm, snow, and fog use separate screen-space atmosphere.

## Ownership and clocks

| Owner | Lifetime and responsibility |
| --- | --- |
| GameScreen | One PixiApp per mounted run/configuration; owns store subscriptions and the existing simulation interval |
| PixiApp | Async initialization, resize observer, ticker, ECS read snapshot, renderer coordination, final teardown |
| SceneManager | Permanent shared world, terrain, building, entity, overlay, effects, atmosphere and UI parents |
| TileRenderer | Lazy cell registry; updates changed content and visible bounds without rebuilding shared layers |
| EntityRenderer | Entity-ID registry; persistent sprite, shadow, health graphic and label; retires only its own removed entities |
| EffectRenderer | Permanent selection/path graphics and a bounded pool of semantic signals |
| AnimationRenderer | Permanent building-activity root and one reusable Graphics object |
| AmbientRenderer | Permanent lighting and weather graphics; lighting changes only when relevant state/size changes |
| MinimapRenderer | Retained world/viewport graphics; content on state change, viewport on camera change |
| Camera | Pointer/keyboard listeners, follow/easing, coordinate transforms and viewport revision |
| CameraDirector | Bounded priority queue and explicit manual-control lease |

Simulation updates deserialize the renderer's ECS snapshot once and derive
transitions. Frame updates handle camera easing, entity interpolation, selection,
environment and existing signal lifetimes. Ambient animation continues while the
simulation is paused, using a separate capped real-time delta and visual speed.
No presentation module imports or consumes the simulation RNG. Existing procedural
texture painters use their own cosmetic randomness; coordinate variations and
ambient paths use a stateless hash.

Shared layer-clearing methods were removed. The animation root is never detached
by another renderer. Final application destruction recursively disposes the scene,
removes the ticker and listeners, and disconnects ResizeObserver. Cancellation
during asynchronous GPU initialization destroys the resolved application without
attaching a canvas. Scene setup failure after GPU initialization can also be
cleaned up before the instance reaches its initialized state.

## Semantic events and truthful cognition

`PresentationEventDeriver` copies minimal transition metadata because simulation
states can share nested ECS objects. It emits observed construction, progression,
loss, discovery, research, bounty, diplomacy, expedition, raid, combat, spawn,
phase and terminal-result transitions. Initial mount, a different seed, and a
backward clock establish a new baseline without replaying historical effects.

Transient signals have semantic colors/shapes, priority and finite lifetimes.
Only transitions with a supported position receive a world signal. Routine
combat stays out of the DOM event card; the presentation log holds at most 32
meaningful events. The full existing simulation chronicle remains available.

The cognition workspace exposes the actual plan, saving target, next action,
confidence, fear, military/Spire readiness, strategic memory, and recent recorded
decisions. Selecting a decision shows its recorded reason, expected benefit,
risk and treasury before/after. These are decision records, not invented thoughts
or proof that an expected benefit occurred.

Decision records do not contain target IDs. A unique, observed, current-world name
match can offer an explicitly labeled association for inspection. Ambiguous names
and hidden targets produce no association. The UI does not present that match as
the decision's historical target. Movement lines use actual chosen movement paths.
Threat coverage is labeled relative pressure, not a prediction of attack timing.

## Camera authority

Manual pan, wheel zoom, minimap navigation, recenter and explicit focus requests
clear follow where applicable and suspend Director takeover for 12 seconds.
Director suggestions expire after 10 seconds, are capped at 12 entries, and have
a 7-second shot cooldown. Events already near center do not force a reframe;
long-distance cuts require high priority. Follow, open workspaces and reduced
motion suppress new Director shots and cancel any Director shot already in motion.
Explicit user focus and follow retain their own camera authority.
The interface shows why the Director is held.

Selection uses the displayed interpolated entity position. Follow tracks that
same position. Recenter returns to the actual Pyahhold location, not map origin.
Arrow keys pan without colliding with S for Squads or D for Diplomacy.

## Quality and accessibility

| Quality | Maximum DPR | Ambient motes | Weather primitives | Concurrent semantic signals |
| --- | ---: | ---: | ---: | ---: |
| Low | 1 | 24 | 35 | 8 |
| Medium | 1.5 | 60 | 90 | 14 |
| High | 2 | 100 | 160 | 20 |

The real device DPR is also respected. Existing Settings persistence now feeds
the renderer; changes apply without reloading. Lower quality reduces decorative
work while retaining terrain, entities, selection and important information.
Off-screen entities and emitters are culled. The tile registry is bounded by the
map cell count; the diagnostic timing buffer holds at most 600 samples.

Reduced motion disables traveling ambient motes, precipitation movement, idle
bobbing, easing and automatic Director shots. Semantic marks remain readable.
All workspaces and a realm entity roster are accessible through DOM controls.
Modal focus wraps, returns to the invoking control, and excludes hidden/disabled
targets. Input fields and modified key combinations do not trigger game shortcuts.

The inspected desktop range was 1280×720 through 2560×1440. Smaller screens have
layout fallbacks, but phone/touch and assistive-technology certification are not
claimed.

## Navigation

| Group | Workspaces and shortcuts |
| --- | --- |
| Realm | Economy E, Technology T, Objectives J |
| Forces | Squads S, Equipment Q, Skills K |
| World | Factions F, Diplomacy D, Dungeons G, Rivals V |
| Mind | Cognition C, Chronicle L |
| Camera/time | Drag or arrows to pan; wheel/buttons to zoom; H follow; R Director; M overlays; Space pause; 1/2/4 speed |

Escape closes the active workspace. Contextual inspection opens without resizing
the canvas. Deep panels load on demand.

## Verification and reproduction

From a clean install:

```sh
npm ci
npm run lint
npm test
npm run build
```

Validation recorded for this implementation:

- TypeScript: PASS.
- Tests: 60/60 across nine files; the original 40 tests remain passing.
- Production build: PASS. Base remains `/CROWNMIND/`. The built static app and all
  twelve workspaces load without local asset errors; the diagnostic bridge is absent.
- Exact-state determinism: PASS for three baseline scenarios, each repeated in
  an isolated module graph, with presentation derivation at every tick.
- Browser: 20 assertions PASS in headless Chrome with WebGL, including actual
  selection, moving follow, manual override, Director discovery shot, all twelve
  workspaces, nine overlays, five weather types, live Low quality, reduced motion,
  modal focus, canvas size, three restart cycles and IndexedDB reload/load parity.
- Lifecycle: unit coverage for cancellation while GPU initialization is pending
  and cleanup after scene setup fails.

Baseline hashes and browser observations are in
`docs/evidence/presentation-engine-ii/`. The determinism tests cover temperate
small/observer, arid standard/hard/sandbox and tundra large/observer configurations:
180, 180 and 120 ticks respectively, each run twice. The hash compares the entire
serialized state, including logs and RNG. Isolated module graphs are necessary
because the original AI module retains log counters between independent runs.
Those simulation counters were not changed to make the test pass.

The optional browser harness is `scripts/validate-presentation.cjs`. It requires
an externally available Playwright installation and a browser, and adds no runtime
dependency. Start a fresh Vite development server at port 4303, then run:

```sh
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4303 --strictPort
# In another terminal:
node scripts/validate-presentation.cjs
```

Environment variables: `PLAYWRIGHT_MODULE` (module or absolute installed path),
`CHROME_EXECUTABLE` (optional local browser), `PRESENTATION_URL` (development URL),
and `PRESENTATION_OUTPUTS` (evidence folder). The development-only diagnostic
bridge is excluded from production. The harness explicitly stages weather and
Spire discovery in a copied in-memory state for presentation inspection; its
screenshots do not claim that an autonomous run reached those phases.

## Performance evidence and remaining limits

The browser verifies that terrain/entity/activity display objects retain identity
across real simulation updates. This addresses the baseline allocation/ownership
problem directly. Frame times in the evidence are short headless observations,
not guaranteed FPS or a controlled cross-hardware benchmark.

The initial JavaScript chunk decreased from 815.54 kB to approximately 776.61 kB
through lazy strategic panels. Vite's existing 500 kB warning remains. CSS grew
to support the new presentation. Additional renderer/vendor splitting can be
evaluated separately; this work does not hide the warning by raising its limit.

Existing deep panels retain their domain controls inside the new navigation.
They are less visually bespoke than the world and cognition surfaces. Existing
unwired tactical spell controls remain a gameplay-integration limitation.
No claim is made about exhaustive seed coverage, long-session GPU memory,
all browsers, real mobile devices, formal WCAG conformance or live deployment.

Presentation self-audit: 92/100 — mechanical safety 20/20, renderer 14/15,
identity 13/15, UX 14/15, cognition 9/10, effects/camera/environment 9/10,
performance 4/5, accessibility 4/5, validation/code quality 5/5.
The strongest vector is preserved mechanics with explicit presentation ownership;
the weakest is the depth of bespoke visual treatment in secondary panels.
