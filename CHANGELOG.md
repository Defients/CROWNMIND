# Changelog

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
