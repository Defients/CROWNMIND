# Changelog

## [Unreleased] — Presentation Engine II — 2026-09-06

### Changed
- Make the kingdom the main screen, with a compact Sovereign lens, contextual inspector,
  grouped command dock and twelve accessible strategic workspaces.
- Replace shared-layer reconstruction with persistent tile/entity registries,
  retained atmosphere/minimap graphics and a bounded semantic-effect pool.
- Present recorded Sovereign plans, constraints, reasons, risks and expected benefits,
  with clearly labeled current-world associations where evidence supports them.
- Enlarge hero/building silhouettes, add canopy depth and ground contact, and give
  the discovered Spire distinct corruption, light and motion.
- Apply real graphics quality limits and reduced-motion behavior to the renderer.

### Fixed
- Wire map hit testing to selection and make follow track the displayed moving entity.
- Recenter on the actual town hall; give manual control priority over Director shots.
- Dispose asynchronous/failed initialization safely and retain the building-activity root.
- Remove duplicate shortcut ownership, obsolete sidebars and misleading unwired spell buttons.
- Preserve modal focus and keep contextual inspection from resizing the world canvas.

### Validation
- 60 tests pass, including three full-state comparisons against the original revision,
  transition semantics, camera authority and initialization lifecycle.
- 20 WebGL browser assertions pass across workspaces, selection, follow, overlays,
  environment, settings, reduced motion, restart and IndexedDB reload/load.
- Typecheck and static production build pass. No simulation, RNG, save-schema or
  runtime dependency changes. Existing large-chunk warning remains.
- See [Presentation Engine II](docs/PRESENTATION_ENGINE_II.md) for architecture,
  reproduction instructions, evidence boundaries and remaining limits.

## [3.0.0] - Enhancement-First Polish

### Added
- 8 hero classes: Kiox-Bound Fighter, Ymzo-Touched Scout, Zeeya-Warded Acolyte, Astryx Mage, Kael Archer, Vael Paladin, Faeling Druid, Dwarven Runesmith
- Game modes: Observer, Sandbox, Co-Sovereign, Endless, Rival Sovereigns, Scenario
- Sovereign AI bot with phased decision-making, strategic memory, and build-order logic
- Diplomacy system: treaties, quests, faction standings, trade agreements
- Dungeon system: procedurally generated rooms, expeditions, loot
- Equipment system: 15 item templates across 5 rarities, auto-equip logic
- Skill tree system: class-specific specializations with auto-allocation
- Spells: Rally Spark, Zeeya Mend, Astryx Flare, Diplomatic Envoy, Dungeon Reveal, Mass Rally
- Tech tree with 3 branches (Economic, Military, Arcane)
- Weather and season system affecting production, movement, and monster aggression
- Fog of war, guard towers, bounty system, squad management
- Keyboard shortcuts for all panels and speed controls
- PixiJS renderer with camera, minimap, overlays, and ambient effects
- IndexedDB persistence with save/load and seed codec for URL sharing

### Fixed (Polish Pass)
- **EquipmentPanel**: Dynamic Tailwind class construction (`text-[${...}]`) replaced with inline `style` using `RARITY_COLORS` — icons now display correct rarity colors
- **DiplomacySystem**: Removed no-op hostile block that fetched `PositionComponent` but did nothing with it
- **nameGenerator**: Added missing name arrays for Faeling Druid and Dwarven Runesmith — previously fell through to fighter names
- **HudBar**: Memoized `liveHeroes` count with `useMemo`; removed `as any` casts on resource access
- **DungeonPanel**: Removed unused `useMemo` import
- **simulationRunner**: Removed `as any` casts in `checkScenarioObjectives` call, `computeDailyProduction`, and `findNearestEntity`
- **SovereignAISystem**: Typed `tryHire` parameter as `HeroClass` instead of `string`, removing `as any` cast
- **SovereignMindPanel**: Removed unnecessary `as any` on `riskColor` Badge prop
- **DiplomacySystem**: Replaced `as any` resource gains indexing with proper `keyof ResourceState` cast

### Removed
- **equipmentStore.ts**: Dead code — store was never synced in `gameStore.ts` and no component imported `useEquipmentStore`. EquipmentPanel reads directly from ECS world state via `useGameStore`.

### Backlog / RFC
- Shared ECSWorld instance for panels and renderer (architectural refactor)
- Hostile faction raids from DiplomacySystem (feature, not polish)
- ECSWorld.deserializeCached reference-equality cache
