# CROWNMIND: Veylthyr Rising — Evolution Pass

## Phase 1: Critical Bug Fixes

### 1. Fix `spawnRaid` crash (App.tsx:355)
- `state.rng` doesn't exist on `GameState` — will crash when debug "Spawn Raid" button is clicked
- **Fix:** Replace `state.rng` with `Math.random()` for this debug-only function

### 2. Fix restart handlers not setting gameStatus to 'playing' (App.tsx:312-319)
- `handleRestartSameSeed` and `handleRestartNewSeed` call `initializeGame()` which sets `gameStatus` to `'tutorial'`
- Clicking "Retry Seed" or "Next Seed" from the Run Report replays the tutorial instead of starting the game
- **Fix:** Set `newState.gameStatus = 'playing'` after `initializeGame()` in both handlers

### 3. Fix grid mutation in simulateTick (gameSimulation.ts:841)
- `simulateTick` mutates `state.grid` in-place via `state.grid[ex][ey].isExplored = true`
- This is a React state mutation that can cause subtle bugs
- **Fix:** Clone the grid at the start of simulateTick: `const grid = state.grid.map(col => col.map(cell => ({ ...cell })));`

### 4. Fix raid warning `daysUntilRaid` never calculated (gameSimulation.ts)
- `RaidWarning.daysUntilRaid` is never set in the simulation
- The raid warning banner in GameMap checks `raidWarning.daysUntilRaid !== undefined && raidWarning.daysUntilRaid >= 0 && raidWarning.daysUntilRaid <= 3` — always false
- **Fix:** Calculate `daysUntilRaid` when creating raid warnings based on monster distance to Town Hall

### 5. Fix monster priority check using invalid 'wander' status (GameMap.tsx:159)
- `m.status !== 'wander'` — 'wander' is not a valid `MonsterStatus` (`'roaming' | 'raiding' | 'defending' | 'dead'`)
- All monsters get +3 priority regardless of actual status
- **Fix:** Change to `m.status === 'raiding' || m.status === 'defending'`

## Phase 2: UX/Polish Improvements

### 6. Add spell cooldown indicators in InspectorPanel
- Spell buttons don't show cooldown state — players can't tell when spells will be ready
- **Fix:** Pass spell cooldown state to InspectorPanel, show cooldown overlay on buttons

### 7. Add pause indicator overlay on the map
- When game speed is 0 (paused), there's no visual indicator on the map
- **Fix:** Add a "PAUSED" overlay badge on the map viewport when `gameSpeed === 0`

### 8. Add Skip Tutorial button
- Returning players must click through all 4 tutorial cards every time
- **Fix:** Add a "Skip Tutorial" text button in the TutorialOverlay footer

### 9. Fix handlePlaceManualBounty mutating existing bounty (App.tsx:207)
- `existing.rewardGold += amount` mutates the state object directly
- **Fix:** Map over bounties to create a new array with the updated bounty

### 10. Add keyboard shortcut hints to UI
- Space=pause, 1/2/4=speed shortcuts exist but aren't visible
- **Fix:** Add small hint text near the speed controls

## Phase 3: Code Quality

### 11. Fix BountyStatus type mismatch in GameMap
- GameMap checks `bounty.status === 'completed'` but 'completed' is not in `BountyStatus` union
- **Fix:** Remove 'completed' checks or use 'claimed' which is the actual status used

### 12. Extract Town Hall coordinates as constants
- `(12, 32)` is hardcoded throughout gameSimulation.ts
- **Fix:** Add `TOWN_HALL_X = 12` and `TOWN_HALL_Y = 32` constants at the top of the file

## Phase 4: Validation
- Run TypeScript typecheck
- Run dev server to verify no runtime errors
- Test all debug buttons, restart flows, and spell casting
