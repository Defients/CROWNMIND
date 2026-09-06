export type TechBranch = 'military' | 'economy' | 'magic' | 'defense' | 'diplomacy' | 'exploration';
export type TechEra = 'foundation' | 'expansion' | 'ascension';

export interface TechNode {
  id: string;
  name: string;
  branch: TechBranch;
  era: TechEra;
  description: string;
  cost: { gold: number; mana: number };
  researchTime: number;
  requires: string[];
  mutuallyExclusiveWith?: string[];
  effects: TechEffect[];
}

export interface TechEffect {
  type: 'attackMultiplier' | 'defenseMultiplier' | 'spireDamageMultiplier' | 'goldIncomeMultiplier'
    | 'xpMultiplier' | 'spellDamageMultiplier' | 'spellCostReduction' | 'guardTowerRangeMultiplier'
    | 'townHallHpBonus' | 'buildingHpMultiplier' | 'squadBonusMultiplier' | 'tradeRateMultiplier'
    | 'storageCapMultiplier' | 'monsterSlowMultiplier' | 'revealRaids' | 'saveFromLethal'
    | 'passiveCourageRegen' | 'autoEquipTier3' | 'thInvulnTicks' | 'fightToDeath'
    | 'aoeSpellUnlock' | 'resourceProductionMultiplier'
    | 'diplomacyBonus' | 'tradeRouteBonus' | 'allianceBonus' | 'grandAllianceBonus'
    | 'dungeonDiscoveryBonus' | 'dungeonLootBonus' | 'treasureHunterBonus' | 'ancientKnowledgeBonus';
  value: number;
  target?: string;
}

export const TECH_TREE: TechNode[] = [
  // === MILITARY ===
  { id: 'ironEdge', name: 'Iron Edge', branch: 'military', era: 'foundation', description: '+25% hero attack damage', cost: { gold: 180, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'attackMultiplier', value: 1.25 }] },
  { id: 'wardedMail', name: 'Warded Mail', branch: 'military', era: 'foundation', description: '-25% monster damage taken', cost: { gold: 200, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'defenseMultiplier', value: 0.75 }] },
  { id: 'spirebreakerArms', name: 'Spirebreaker Arms', branch: 'military', era: 'expansion', description: '+60% damage to Veylthyr Spire', cost: { gold: 300, mana: 30 }, researchTime: 12, requires: ['ironEdge'], effects: [{ type: 'spireDamageMultiplier', value: 1.6 }] },
  { id: 'heroTraining', name: 'Hero Training', branch: 'military', era: 'expansion', description: '+50% XP gain for all heroes', cost: { gold: 250, mana: 20 }, researchTime: 10, requires: ['wardedMail'], effects: [{ type: 'xpMultiplier', value: 1.5 }] },
  { id: 'warCollege', name: 'War College', branch: 'military', era: 'ascension', description: 'Squad bonuses doubled', cost: { gold: 400, mana: 50 }, researchTime: 15, requires: ['spirebreakerArms'], mutuallyExclusiveWith: ['eliteGuard'], effects: [{ type: 'squadBonusMultiplier', value: 2.0 }] },
  { id: 'eliteGuard', name: 'Elite Guard', branch: 'military', era: 'ascension', description: 'Auto-equip all heroes to tier 3 gear', cost: { gold: 400, mana: 50 }, researchTime: 15, requires: ['heroTraining'], mutuallyExclusiveWith: ['warCollege'], effects: [{ type: 'autoEquipTier3', value: 1 }] },

  // === ECONOMY ===
  { id: 'tradeRoutes', name: 'Trade Routes', branch: 'economy', era: 'foundation', description: 'Auto-convert surplus resources at Market', cost: { gold: 150, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'tradeRateMultiplier', value: 1.0 }] },
  { id: 'caravanPact', name: 'Caravan Pact', branch: 'economy', era: 'foundation', description: '+60% daily gold income', cost: { gold: 200, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'goldIncomeMultiplier', value: 1.6 }] },
  { id: 'banking', name: 'Banking', branch: 'economy', era: 'expansion', description: 'Earn interest on gold savings', cost: { gold: 250, mana: 10 }, researchTime: 10, requires: ['tradeRoutes'], effects: [{ type: 'goldIncomeMultiplier', value: 1.2 }] },
  { id: 'industrialMills', name: 'Industrial Mills', branch: 'economy', era: 'expansion', description: '+50% wood and stone production', cost: { gold: 250, mana: 10 }, researchTime: 10, requires: ['caravanPact'], effects: [{ type: 'resourceProductionMultiplier', value: 1.5, target: 'wood' }] },
  { id: 'grandBazaar', name: 'Grand Bazaar', branch: 'economy', era: 'ascension', description: 'Trade rate doubled', cost: { gold: 400, mana: 30 }, researchTime: 15, requires: ['banking'], mutuallyExclusiveWith: ['treasuryVault'], effects: [{ type: 'tradeRateMultiplier', value: 2.0 }] },
  { id: 'treasuryVault', name: 'Treasury Vault', branch: 'economy', era: 'ascension', description: 'Remove resource storage caps', cost: { gold: 400, mana: 30 }, researchTime: 15, requires: ['industrialMills'], mutuallyExclusiveWith: ['grandBazaar'], effects: [{ type: 'storageCapMultiplier', value: 999 }] },

  // === MAGIC ===
  { id: 'zeeyasMercy', name: "Zeeya's Mercy", branch: 'magic', era: 'foundation', description: '65% chance to save hero from lethal blow', cost: { gold: 220, mana: 20 }, researchTime: 8, requires: [], effects: [{ type: 'saveFromLethal', value: 0.65 }] },
  { id: 'spellAmplification', name: 'Spell Amplification', branch: 'magic', era: 'foundation', description: '+50% spell damage', cost: { gold: 180, mana: 25 }, researchTime: 8, requires: [], effects: [{ type: 'spellDamageMultiplier', value: 1.5 }] },
  { id: 'rallyAura', name: 'Rally Aura', branch: 'magic', era: 'expansion', description: 'Passive courage regeneration for nearby heroes', cost: { gold: 250, mana: 30 }, researchTime: 10, requires: ['zeeyasMercy'], effects: [{ type: 'passiveCourageRegen', value: 1 }] },
  { id: 'manaEfficiency', name: 'Mana Efficiency', branch: 'magic', era: 'expansion', description: '-30% spell mana cost', cost: { gold: 200, mana: 30 }, researchTime: 10, requires: ['spellAmplification'], effects: [{ type: 'spellCostReduction', value: 0.7 }] },
  { id: 'timeWarp', name: 'Time Warp', branch: 'magic', era: 'ascension', description: 'Slow all monsters by 30%', cost: { gold: 400, mana: 60 }, researchTime: 15, requires: ['rallyAura'], mutuallyExclusiveWith: ['arcaneStorm'], effects: [{ type: 'monsterSlowMultiplier', value: 0.7 }] },
  { id: 'arcaneStorm', name: 'Arcane Storm', branch: 'magic', era: 'ascension', description: 'Unlock massive AoE spell', cost: { gold: 400, mana: 60 }, researchTime: 15, requires: ['manaEfficiency'], mutuallyExclusiveWith: ['timeWarp'], effects: [{ type: 'aoeSpellUnlock', value: 1 }] },

  // === DEFENSE ===
  { id: 'guardTowerRange', name: 'Guard Tower Range', branch: 'defense', era: 'foundation', description: '+50% Guard Tower range', cost: { gold: 150, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'guardTowerRangeMultiplier', value: 1.5 }] },
  { id: 'reinforcedWalls', name: 'Reinforced Walls', branch: 'defense', era: 'foundation', description: 'Town Hall HP +500', cost: { gold: 180, mana: 0 }, researchTime: 8, requires: [], effects: [{ type: 'townHallHpBonus', value: 500 }] },
  { id: 'sentryNetwork', name: 'Sentry Network', branch: 'defense', era: 'expansion', description: 'Auto-detect raids before they arrive', cost: { gold: 250, mana: 15 }, researchTime: 10, requires: ['guardTowerRange'], effects: [{ type: 'revealRaids', value: 1 }] },
  { id: 'fortifications', name: 'Fortifications', branch: 'defense', era: 'expansion', description: 'All building HP x1.5', cost: { gold: 220, mana: 15 }, researchTime: 10, requires: ['reinforcedWalls'], effects: [{ type: 'buildingHpMultiplier', value: 1.5 }] },
  { id: 'aegisBarrier', name: 'Aegis Barrier', branch: 'defense', era: 'ascension', description: 'Town Hall invulnerable for 3 ticks when below 20% HP', cost: { gold: 400, mana: 40 }, researchTime: 15, requires: ['sentryNetwork'], mutuallyExclusiveWith: ['lastStand'], effects: [{ type: 'thInvulnTicks', value: 3 }] },
  { id: 'lastStand', name: 'Last Stand', branch: 'defense', era: 'ascension', description: 'Heroes fight to death, never flee', cost: { gold: 400, mana: 40 }, researchTime: 15, requires: ['fortifications'], mutuallyExclusiveWith: ['aegisBarrier'], effects: [{ type: 'fightToDeath', value: 1 }] },

  // === DIPLOMACY ===
  { id: 'culturalExchange', name: 'Cultural Exchange', branch: 'diplomacy', era: 'foundation', description: '+10 standing bonus on diplomatic actions', cost: { gold: 160, mana: 5 }, researchTime: 8, requires: [], effects: [{ type: 'diplomacyBonus', value: 10 }] },
  { id: 'tradeMastery', name: 'Trade Mastery', branch: 'diplomacy', era: 'expansion', description: 'Trade agreements yield +50% resources', cost: { gold: 250, mana: 15 }, researchTime: 10, requires: ['culturalExchange'], effects: [{ type: 'tradeRouteBonus', value: 1.5 }] },
  { id: 'coalitionFormation', name: 'Coalition Formation', branch: 'diplomacy', era: 'ascension', description: 'Alliances form faster and last longer', cost: { gold: 350, mana: 30 }, researchTime: 12, requires: ['tradeMastery'], mutuallyExclusiveWith: ['grandAlliance'], effects: [{ type: 'allianceBonus', value: 1.5 }] },
  { id: 'grandAlliance', name: 'Grand Alliance', branch: 'diplomacy', era: 'ascension', description: 'All allied factions send military aid automatically', cost: { gold: 400, mana: 40 }, researchTime: 15, requires: ['tradeMastery'], mutuallyExclusiveWith: ['coalitionFormation'], effects: [{ type: 'grandAllianceBonus', value: 1 }] },

  // === EXPLORATION ===
  { id: 'cartography', name: 'Cartography', branch: 'exploration', era: 'foundation', description: 'Reveal dungeons and ancient ruins faster', cost: { gold: 150, mana: 5 }, researchTime: 8, requires: [], effects: [{ type: 'dungeonDiscoveryBonus', value: 1.5 }] },
  { id: 'dungeonLore', name: 'Dungeon Lore', branch: 'exploration', era: 'expansion', description: 'Expeditions move 50% faster through dungeons', cost: { gold: 220, mana: 15 }, researchTime: 10, requires: ['cartography'], effects: [{ type: 'dungeonDiscoveryBonus', value: 1.5 }] },
  { id: 'treasureHunter', name: 'Treasure Hunter', branch: 'exploration', era: 'expansion', description: '+30% item drop chance in dungeons', cost: { gold: 250, mana: 20 }, researchTime: 10, requires: ['dungeonLore'], effects: [{ type: 'treasureHunterBonus', value: 1.3 }] },
  { id: 'ancientKnowledge', name: 'Ancient Knowledge', branch: 'exploration', era: 'ascension', description: 'Dungeons can unlock tech automatically', cost: { gold: 400, mana: 50 }, researchTime: 15, requires: ['treasureHunter'], effects: [{ type: 'ancientKnowledgeBonus', value: 1 }] },
];

export const TECH_BRANCHES: TechBranch[] = ['military', 'economy', 'magic', 'defense', 'diplomacy', 'exploration'];
export const TECH_ERAS: TechEra[] = ['foundation', 'expansion', 'ascension'];

export const ERA_UNLOCK_DAY: Record<TechEra, number> = {
  foundation: 1,
  expansion: 15,
  ascension: 30,
};

export function getTechById(id: string): TechNode | undefined {
  return TECH_TREE.find(t => t.id === id);
}

export function getTechsByBranch(branch: TechBranch): TechNode[] {
  return TECH_TREE.filter(t => t.branch === branch);
}

export function getTechsByEra(era: TechEra): TechNode[] {
  return TECH_TREE.filter(t => t.era === era);
}

export function canResearch(techId: string, unlockedTechs: string[], currentDay: number): boolean {
  const tech = getTechById(techId);
  if (!tech) return false;
  if (unlockedTechs.includes(techId)) return false;
  if (currentDay < ERA_UNLOCK_DAY[tech.era]) return false;
  if (!tech.requires.every(req => unlockedTechs.includes(req))) return false;
  if (tech.mutuallyExclusiveWith?.some(ex => unlockedTechs.includes(ex))) return false;
  return true;
}

export function getAvailableTechs(unlockedTechs: string[], currentDay: number): TechNode[] {
  return TECH_TREE.filter(t => canResearch(t.id, unlockedTechs, currentDay));
}
