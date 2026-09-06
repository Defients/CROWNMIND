# CROWNMIND: Veylthyr Rising

An indirect-control fantasy kingdom simulation where a sovereign AI bot (the Klÿ-Sovereign) guides autonomous heroes to defend Pyahhold and destroy the Veylthyr Spire before Day 60.

## Premise

You are not the ruler. The bot is. You watch the Klÿ-Sovereign make strategic decisions — building infrastructure, hiring heroes, placing bounties, researching upgrades, managing diplomacy, and launching dungeon expeditions. Heroes have their own personalities (courage, greed, caution) and act autonomously. You can intervene with spells and bounties, but the bot drives the core strategy.

## Game Modes

- **Observer** — Watch the AI play untouched. No interaction.
- **Co-Sovereign** — Limited Sovereign Favor to cast spells and place bounties. Each intervention costs 1 Favor.
- **Sandbox** — No limits. Free spells, free bounties, full debug access.
- **Endless** — No time limit. Survive and score as high as possible.
- **Daily Challenge** — Seeded daily run with special modifiers.
- **Rival Sovereigns** — Compete against AI-controlled rival kingdoms.
- **Campaign** — Scenario-driven objectives with custom starting conditions.

## Difficulty

- **Easy** — +Gold, reduced raid frequency, weaker monsters.
- **Standard** — Balanced.
- **Hard** — Reduced gold, more raids, stronger monsters, higher bounty costs.
- **Brutal** — Minimal resources, aggressive raids, deadly monsters.

## Controls

- **Spacebar** — Pause / Resume simulation
- **1 / 2 / 4** — Set game speed (Normal / Fast / Hyper)
- **Click** — Select any tile, hero, monster, building, or lair on the map
- **Drag** — Pan the map viewport
- **Zoom buttons** — Zoom in/out on the map
- **T** — Toggle Tech Tree panel
- **S** — Toggle Squad panel
- **E** — Toggle Economy panel
- **F** — Toggle Factions panel
- **D** — Toggle Diplomacy panel
- **G** — Toggle Dungeons panel
- **Q** — Toggle Equipment panel
- **K** — Toggle Skill Trees panel
- **V** — Toggle Rivals panel
- **J** — Toggle Scenario panel
- **R** — Toggle Director Mode
- **H** — Toggle Follow Selected
- **M** — Cycle map overlay modes
- **Escape** — Close active panel

## Hero Classes

- **Kiox-Bound Fighter** — Melee combatant. High attack, engages monsters directly.
- **Ymzo-Touched Scout** — Explorer. Reveals fog of war, discovers lairs.
- **Zeeya-Warded Acolyte** — Healer. Follows and mends injured allies.
- **Astryx Mage** — Ranged magical damage dealer with area attacks.
- **Kael Archer** — Long-range physical DPS with volley capabilities.
- **Vael Paladin** — Holy warrior combining melee and auras.
- **Faeling Druid** — Nature caster with healing and storm abilities.
- **Dwarven Runesmith** — Craftsmen who forge runes and wield battlehammers.

## Sovereign Spells

- **Rally Spark** (80g) — Boosts courage of nearby heroes to 100%.
- **Zeeya Mend** (100g) — Heals nearby heroes by 75 HP.
- **Astryx Flare** (150g) — Reveals fog in a 10-tile radius and damages monsters for 45 HP.
- **Diplomatic Envoy** (60g) — Improves faction standing without direct interaction.
- **Dungeon Reveal** (80g) — Reveals nearby hidden dungeons on the map.
- **Mass Rally** (200g) — Boosts courage of all heroes on the map.

## New Systems (v3.0)

- **Skill Trees** — Each hero class has a unique skill tree with passive nodes and ultimate abilities. Heroes earn skill points on level up.
- **Equipment** — Heroes equip weapons, armor, and accessories. Items drop from lairs and dungeon bosses. Shop inventory refreshes periodically.
- **Dungeons** — Procedurally generated dungeon expeditions with combat, treasure, trap, shrine, and boss rooms. Build an Adventurer's Guild to access.
- **Diplomacy** — Engage with factions through gifts, trade agreements, alliances, and non-aggression pacts. Quests from factions provide rewards.
- **Rival Sovereigns** — AI-controlled rival kingdoms compete for dominance. Each has unique personalities (aggressive, defensive, economic, balanced).
- **Scenarios** — Campaign scenarios with custom objectives, starting conditions, and modifiers. Endless mode tracks a composite score.

## Tech Tree

Six branches of research:

- **Military** — Combat upgrades, hero stats, bounty efficiency.
- **Economy** — Resource production, trade income, market efficiency.
- **Magic** — Spell power, mana generation, new spells.
- **Defense** — Building HP, guard towers, raid defense.
- **Diplomacy** — Faction standing bonuses, treaty duration, quest rewards.
- **Exploration** — Dungeon discovery, expedition speed, fog reveal radius.

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- PixiJS (map rendering)
- Zustand (state management)
- Seeded RNG (Mulberry32 + cyrb128) for deterministic simulation
- IndexedDB (save/load persistence)
- Google Generative AI (existing integration, preserved)

## Development

**Prerequisites:** Node.js

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Type check (tsc --noEmit)
npm run test     # Run unit tests
```

### Environment

Set `GEMINI_API_KEY` in your environment for the existing AI integration. See `.env.example`.

## Architecture

```
src/
  App.tsx                    — Root component, state management, game loop
  types/                     — All TypeScript interfaces and types
    game.ts                  — GameState, GameConfig, GameMode, Difficulty
    heroes.ts                — Hero classes, specializations, stats
    tech.ts                  — Tech tree nodes and branches
    world.ts                 — Factions, lairs, events, biomes
    diplomacy.ts             — Treaties, quests, diplomatic actions
    dungeons.ts              — Dungeon and expedition types
    equipment.ts             — Items, slots, rarity, templates
    skills.ts                — Skill trees, nodes, ultimates
    scenarios.ts             — Scenario configs, objectives, rivals
  engine/                    — ECS architecture
    ECSWorld.ts              — Entity-Component-System world
    Component.ts             — Component types and interfaces
  systems/                   — Game logic systems
    simulationRunner.ts      — Core simulation tick loop
    SovereignAISystem.ts     — AI sovereign decision-making
    SkillTreeSystem.ts       — Skill point allocation, ultimates
    EquipmentSystem.ts       — Equip/unequip, item drops, shop
    DungeonSystem.ts         — Dungeon generation, expeditions
    DiplomacySystem.ts       — Faction standing, treaties, quests
    RivalAISystem.ts         — Rival kingdom AI
    ScenarioSystem.ts        — Scenario objectives, endless score
  stores/                    — Zustand state stores
    gameStore.ts             — Main game state
    uiStore.ts               — UI panel/overlay state
    diplomacyStore.ts        — Diplomacy state
    dungeonStore.ts          — Dungeon/expedition state
    equipmentStore.ts        — Equipment/inventory state
  persistence/               — Save/load system
    SaveSerializer.ts        — Serialize/deserialize game state
    SeedCodec.ts             — Encode/decode game config to URL hash
    IndexedDBAdapter.ts      — IndexedDB storage adapter
  components/                — React UI components
    GameScreen.tsx           — Main game layout
    HudBar.tsx               — Top HUD with resources and panel toggles
    SovereignMindPanel.tsx   — AI brain visualization
    InspectorPanel.tsx       — Entity inspector + spell/bounty controls
    DiplomacyPanel.tsx       — Faction standings, treaties, quests
    DungeonPanel.tsx         — Dungeon list and active expeditions
    EquipmentPanel.tsx       — Hero equipment and inventory
    SkillTreePanel.tsx       — Hero skill trees and ultimates
    RivalPanel.tsx           — Rival sovereign status
    ScenarioPanel.tsx        — Scenario objectives and endless score
    EventLogPanel.tsx        — Chronological event log with filters
  hooks/
    useKeyboardShortcuts.ts  — Keyboard shortcut handler
```

The simulation runs on a tick-based loop. Each tick advances hero AI (targeting, movement, combat), monster AI (spawning, raiding, combat), the Sovereign Bot brain (phase determination, spending decisions, bounty placement, diplomacy, research), dungeon expeditions, rival AI, diplomacy rollovers, skill point allocation, equipment management, and win/loss condition checks. All randomness is seeded for deterministic replay.

## Deploy to Neocities

This project is configured for static hosting on Neocities at `https://deffy.me/CROWNMIND/`.

```bash
npm run build
```

After building, upload the contents of the `dist/` folder (not the `dist` folder itself) to the `/CROWNMIND/` directory on your Neocities site. `vite.config.ts` uses `base: '/CROWNMIND/'` so all asset URLs resolve correctly under that path.

**Notes for static hosting:**
- Neocities serves static files only; there is no server-side runtime.
- Any Gemini API integration would require a separate backend or a client-side key (not recommended for public sites).
- The production bundle is a single-page application and relies on client-side routing via state management, so no server rewrite rules are needed.
