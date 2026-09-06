import type { HeroClass } from './heroes';

export type SkillTier = 1 | 2 | 3;

export interface SkillEffect {
  stat: 'attack' | 'defense' | 'hp' | 'speed' | 'range' | 'courage';
  operation: 'add' | 'multiply';
  value: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tier: SkillTier;
  cost: number;
  requires: string[];
  mutuallyExclusiveWith?: string[];
  effects: SkillEffect[];
  isActive: boolean;
  cooldown?: number;
}

export interface SkillTree {
  classId: HeroClass;
  nodes: SkillNode[];
  ultimateOptions: { a: SkillNode; b: SkillNode };
}

export interface UltimateAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
}

export const SKILL_TREES: Record<HeroClass, SkillTree> = {
  'Kiox-Bound Fighter': {
    classId: 'Kiox-Bound Fighter',
    nodes: [
      { id: 'f_t1_power', name: 'Power Strike', description: '+20% attack damage', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'f_t1_tough', name: 'Toughness', description: '+30 max HP', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 30 }], isActive: false },
      { id: 'f_t1_quick', name: 'Quick Steps', description: '+15% speed', tier: 1, cost: 1, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 1.15 }], isActive: false },
      { id: 'f_t2_cleave', name: 'Cleave', description: 'Hit 2 adjacent enemies', tier: 2, cost: 1, requires: ['f_t1_power'], effects: [], isActive: true, cooldown: 0 },
      { id: 'f_t2_fortify', name: 'Fortify', description: '+50% DEF when HP<50%', tier: 2, cost: 1, requires: ['f_t1_tough'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.5 }], isActive: false },
      { id: 'f_t2_charge', name: 'Charge', description: 'Close gaps faster', tier: 2, cost: 1, requires: ['f_t1_quick'], effects: [{ stat: 'speed', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'f_t3_rampage', name: 'Rampage', description: 'ATK x1.5 for 5 ticks after kill', tier: 3, cost: 2, requires: ['f_t2_cleave'], mutuallyExclusiveWith: ['f_t3_bastion', 'f_t3_whirl'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 5 },
      { id: 'f_t3_bastion', name: 'Last Bastion', description: 'Taunt all enemies in 8 tiles', tier: 3, cost: 2, requires: ['f_t2_fortify'], mutuallyExclusiveWith: ['f_t3_rampage', 'f_t3_whirl'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 10 },
      { id: 'f_t3_whirl', name: 'Whirlwind', description: 'Hit all enemies in range', tier: 3, cost: 2, requires: ['f_t2_charge'], mutuallyExclusiveWith: ['f_t3_rampage', 'f_t3_bastion'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 8 },
    ],
    ultimateOptions: {
      a: { id: 'f_ult_unbreakable', name: 'Unbreakable', description: 'Immune to damage for 3 ticks', tier: 3, cost: 3, requires: [], effects: [], isActive: true, cooldown: 60 },
      b: { id: 'f_ult_berserk', name: 'Eternal Berserk', description: 'ATK x2 and immune to fear for 8 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
    },
  },
  'Ymzo-Touched Scout': {
    classId: 'Ymzo-Touched Scout',
    nodes: [
      { id: 's_t1_eagle', name: 'Eagle Eye', description: '+2 view range', tier: 1, cost: 1, requires: [], effects: [{ stat: 'range', operation: 'add', value: 2 }], isActive: false },
      { id: 's_t1_swift', name: 'Swift Feet', description: '+20% speed', tier: 1, cost: 1, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 's_t1_precise', name: 'Precise Shot', description: '+15% attack', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.15 }], isActive: false },
      { id: 's_t2_traps', name: 'Trap Mastery', description: 'Set damaging traps', tier: 2, cost: 1, requires: ['s_t1_eagle'], effects: [], isActive: true, cooldown: 0 },
      { id: 's_t2_evade', name: 'Evasion', description: '+25% speed, avoid first hit', tier: 2, cost: 1, requires: ['s_t1_swift'], effects: [{ stat: 'speed', operation: 'multiply', value: 1.25 }], isActive: false },
      { id: 's_t2_mark', name: 'Mark Target', description: 'Reveals and weakens target', tier: 2, cost: 1, requires: ['s_t1_precise'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 5 },
      { id: 's_t3_shadow', name: 'Shadow Strike', description: 'Backstab damage x2', tier: 3, cost: 2, requires: ['s_t2_traps'], mutuallyExclusiveWith: ['s_t3_silence', 's_t3_hunt'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 8 },
      { id: 's_t3_silence', name: 'Silencing Shot', description: 'Disable monster abilities', tier: 3, cost: 2, requires: ['s_t2_evade'], mutuallyExclusiveWith: ['s_t3_shadow', 's_t3_hunt'], effects: [{ stat: 'speed', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 10 },
      { id: 's_t3_hunt', name: 'Hunter\'s Focus', description: '+30% attack, +2 range', tier: 3, cost: 2, requires: ['s_t2_mark'], mutuallyExclusiveWith: ['s_t3_shadow', 's_t3_silence'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }, { stat: 'range', operation: 'add', value: 2 }], isActive: false },
    ],
    ultimateOptions: {
      a: { id: 's_ult_shadow_realm', name: 'Shadow Realm', description: 'Untargetable for 5 ticks, +100% next attack', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
      b: { id: 's_ult_storm_arrows', name: 'Storm of Arrows', description: 'Rain arrows on all monsters in 10 tiles', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 60 },
    },
  },
  'Zeeya-Warded Acolyte': {
    classId: 'Zeeya-Warded Acolyte',
    nodes: [
      { id: 'a_t1_mend', name: 'Enhanced Mend', description: '+50% heal amount', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: false },
      { id: 'a_t1_ward', name: 'Ward Self', description: '+30 HP, +5 DEF', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 30 }, { stat: 'defense', operation: 'add', value: 5 }], isActive: false },
      { id: 'a_t1_calm', name: 'Calm Spirit', description: '+15 courage', tier: 1, cost: 1, requires: [], effects: [{ stat: 'courage', operation: 'add', value: 15 }], isActive: false },
      { id: 'a_t2_aoe_heal', name: 'AoE Heal', description: 'Heal all allies in 3 tiles', tier: 2, cost: 1, requires: ['a_t1_mend'], effects: [], isActive: true, cooldown: 5 },
      { id: 'a_t2_cleanse', name: 'Cleanse', description: 'Remove negative effects', tier: 2, cost: 1, requires: ['a_t1_ward'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 8 },
      { id: 'a_t2_bless', name: 'Bless', description: '+10% ATK to nearby allies', tier: 2, cost: 1, requires: ['a_t1_calm'], effects: [{ stat: 'courage', operation: 'add', value: 10 }], isActive: true, cooldown: 10 },
      { id: 'a_t3_sanctuary', name: 'Sanctuary', description: 'Create healing zone', tier: 3, cost: 2, requires: ['a_t2_aoe_heal'], mutuallyExclusiveWith: ['a_t3_divine', 'a_t3_martyr'], effects: [{ stat: 'hp', operation: 'add', value: 50 }], isActive: true, cooldown: 15 },
      { id: 'a_t3_divine', name: 'Divine Fury', description: 'Smite enemies with holy power', tier: 3, cost: 2, requires: ['a_t2_cleanse'], mutuallyExclusiveWith: ['a_t3_sanctuary', 'a_t3_martyr'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 12 },
      { id: 'a_t3_martyr', name: 'Martyr\'s Gift', description: 'Sacrifice HP to fully heal allies', tier: 3, cost: 2, requires: ['a_t2_bless'], mutuallyExclusiveWith: ['a_t3_sanctuary', 'a_t3_divine'], effects: [{ stat: 'hp', operation: 'add', value: 60 }], isActive: true, cooldown: 20 },
    ],
    ultimateOptions: {
      a: { id: 'a_ult_mass_res', name: 'Mass Resurrection', description: 'Revive all fallen heroes at 50% HP', tier: 3, cost: 3, requires: [], effects: [], isActive: true, cooldown: 60 },
      b: { id: 'a_ult_divine_shield', name: 'Divine Shield', description: 'All allies invulnerable for 4 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'defense', operation: 'multiply', value: 10 }], isActive: true, cooldown: 60 },
    },
  },
  'Astryx Mage': {
    classId: 'Astryx Mage',
    nodes: [
      { id: 'm_t1_power', name: 'Arcane Power', description: '+25% spell damage', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.25 }], isActive: false },
      { id: 'm_t1_pool', name: 'Mana Pool', description: '+40 HP', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 40 }], isActive: false },
      { id: 'm_t1_focus', name: 'Arcane Focus', description: '+1 range', tier: 1, cost: 1, requires: [], effects: [{ stat: 'range', operation: 'add', value: 1 }], isActive: false },
      { id: 'm_t2_fireball', name: 'Fireball', description: 'AoE damage to adjacent enemies', tier: 2, cost: 1, requires: ['m_t1_power'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 5 },
      { id: 'm_t2_freeze', name: 'Frost Nova', description: 'Slow nearby enemies', tier: 2, cost: 1, requires: ['m_t1_pool'], effects: [{ stat: 'hp', operation: 'add', value: 30 }], isActive: true, cooldown: 8 },
      { id: 'm_t2_teleport', name: 'Blink', description: 'Teleport to safety when threatened', tier: 2, cost: 1, requires: ['m_t1_focus'], effects: [{ stat: 'speed', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 10 },
      { id: 'm_t3_meteor', name: 'Meteor', description: 'Massive AoE damage', tier: 3, cost: 2, requires: ['m_t2_fireball'], mutuallyExclusiveWith: ['m_t3_blizzard', 'm_t3_arcane'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.6 }], isActive: true, cooldown: 12 },
      { id: 'm_t3_blizzard', name: 'Blizzard', description: 'Slow and damage all in area', tier: 3, cost: 2, requires: ['m_t2_freeze'], mutuallyExclusiveWith: ['m_t3_meteor', 'm_t3_arcane'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.4 }], isActive: true, cooldown: 15 },
      { id: 'm_t3_arcane', name: 'Arcane Surge', description: 'Double spell damage for 5 ticks', tier: 3, cost: 2, requires: ['m_t2_teleport'], mutuallyExclusiveWith: ['m_t3_meteor', 'm_t3_blizzard'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }, { stat: 'range', operation: 'add', value: 2 }], isActive: true, cooldown: 15 },
    ],
    ultimateOptions: {
      a: { id: 'm_ult_meteor_storm', name: 'Meteor Storm', description: 'Massive AoE damage to all monsters in 10 tiles', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
      b: { id: 'm_ult_time_stop', name: 'Time Stop', description: 'Freeze all monsters for 5 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
    },
  },
  'Kael Archer': {
    classId: 'Kael Archer',
    nodes: [
      { id: 'r_t1_range', name: 'Long Shot', description: '+2 range', tier: 1, cost: 1, requires: [], effects: [{ stat: 'range', operation: 'add', value: 2 }], isActive: false },
      { id: 'r_t1_rapid', name: 'Rapid Fire', description: '+20% speed', tier: 1, cost: 1, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'r_t1_sharp', name: 'Sharpshooter', description: '+15% attack', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.15 }], isActive: false },
      { id: 'r_t2_volley', name: 'Volley Shot', description: 'Hit up to 3 targets', tier: 2, cost: 1, requires: ['r_t1_range'], effects: [{ stat: 'range', operation: 'add', value: 1 }], isActive: true, cooldown: 5 },
      { id: 'r_t2_piercing', name: 'Piercing Arrow', description: 'Ignore defense', tier: 2, cost: 1, requires: ['r_t1_rapid'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.25 }], isActive: true, cooldown: 6 },
      { id: 'r_t2_crippling', name: 'Crippling Shot', description: 'Slow target on hit', tier: 2, cost: 1, requires: ['r_t1_sharp'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 8 },
      { id: 'r_t3_rain', name: 'Arrow Rain', description: 'AoE arrow attack', tier: 3, cost: 2, requires: ['r_t2_volley'], mutuallyExclusiveWith: ['r_t3_sniper', 'r_t3_hunter'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.4 }], isActive: true, cooldown: 10 },
      { id: 'r_t3_sniper', name: 'Eagle Sniper', description: '+5 range, 50% crit', tier: 3, cost: 2, requires: ['r_t2_piercing'], mutuallyExclusiveWith: ['r_t3_rain', 'r_t3_hunter'], effects: [{ stat: 'range', operation: 'add', value: 5 }, { stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: false },
      { id: 'r_t3_hunter', name: 'Beast Hunter', description: '+30% damage to monsters', tier: 3, cost: 2, requires: ['r_t2_crippling'], mutuallyExclusiveWith: ['r_t3_rain', 'r_t3_sniper'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: false },
    ],
    ultimateOptions: {
      a: { id: 'r_ult_death_arrow', name: 'Arrow of Death', description: 'Instant kill target monster (non-boss)', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 3 }], isActive: true, cooldown: 60 },
      b: { id: 'r_ult_arrow_storm', name: 'Arrow Storm', description: 'Rain arrows on entire map for 5 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 60 },
    },
  },
  'Vael Paladin': {
    classId: 'Vael Paladin',
    nodes: [
      { id: 'p_t1_smite', name: 'Smite', description: '+20% attack', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'p_t1_aegis', name: 'Aegis', description: '+40 HP, +5 DEF', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 40 }, { stat: 'defense', operation: 'add', value: 5 }], isActive: false },
      { id: 'p_t1_faith', name: 'Unwavering Faith', description: '+20 courage', tier: 1, cost: 1, requires: [], effects: [{ stat: 'courage', operation: 'add', value: 20 }], isActive: false },
      { id: 'p_t2_aura', name: 'Aura of Protection', description: '+10% DEF to nearby allies', tier: 2, cost: 1, requires: ['p_t1_aegis'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 0 },
      { id: 'p_t2_judgment', name: 'Judgment', description: 'Holy damage attack', tier: 2, cost: 1, requires: ['p_t1_smite'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 5 },
      { id: 'p_t2_lay_hands', name: 'Lay on Hands', description: 'Heal self or ally', tier: 2, cost: 1, requires: ['p_t1_faith'], effects: [{ stat: 'hp', operation: 'add', value: 50 }], isActive: true, cooldown: 8 },
      { id: 'p_t3_crusade', name: 'Crusade', description: 'All allies gain +20% ATK', tier: 3, cost: 2, requires: ['p_t2_judgment'], mutuallyExclusiveWith: ['p_t3_guardian', 'p_t3_avenger'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 12 },
      { id: 'p_t3_guardian', name: 'Guardian Angel', description: 'Take damage for nearby allies', tier: 3, cost: 2, requires: ['p_t2_aura'], mutuallyExclusiveWith: ['p_t3_crusade', 'p_t3_avenger'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.4 }, { stat: 'hp', operation: 'add', value: 60 }], isActive: true, cooldown: 10 },
      { id: 'p_t3_avenger', name: 'Avenger\'s Wrath', description: 'Reflect 50% damage', tier: 3, cost: 2, requires: ['p_t2_lay_hands'], mutuallyExclusiveWith: ['p_t3_crusade', 'p_t3_guardian'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 10 },
    ],
    ultimateOptions: {
      a: { id: 'p_ult_holy_crusade', name: 'Holy Crusade', description: 'All heroes gain +50% ATK and DEF for 10 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }, { stat: 'defense', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 60 },
      b: { id: 'p_ult_judgment_day', name: 'Judgment Day', description: 'Smite all monsters on screen for massive damage', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
    },
  },
  'Faeling Druid': {
    classId: 'Faeling Druid',
    nodes: [
      { id: 'd_t1_bloom', name: 'Nature\'s Bloom', description: '+20% attack', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'd_t1_bark', name: 'Barkskin', description: '+30 HP, +4 DEF', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 30 }, { stat: 'defense', operation: 'add', value: 4 }], isActive: false },
      { id: 'd_t1_growth', name: 'Rapid Growth', description: '+15% speed', tier: 1, cost: 1, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 1.15 }], isActive: false },
      { id: 'd_t2_regen', name: 'Regen Aura', description: 'Allies regenerate HP', tier: 2, cost: 1, requires: ['d_t1_bloom'], effects: [{ stat: 'hp', operation: 'add', value: 20 }], isActive: true, cooldown: 0 },
      { id: 'd_t2_entangle', name: 'Entangle', description: 'Root enemies in place', tier: 2, cost: 1, requires: ['d_t1_bark'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.2 }], isActive: true, cooldown: 8 },
      { id: 'd_t2_swarm', name: 'Insect Swarm', description: 'Damage over time to enemies', tier: 2, cost: 1, requires: ['d_t1_growth'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.25 }], isActive: true, cooldown: 6 },
      { id: 'd_t3_terra', name: 'Terraform', description: 'Create terrain advantages', tier: 3, cost: 2, requires: ['d_t2_regen'], mutuallyExclusiveWith: ['d_t3_wild', 'd_t3_bloom2'], effects: [{ stat: 'hp', operation: 'add', value: 60 }], isActive: true, cooldown: 15 },
      { id: 'd_t3_wild', name: 'Call of the Wild', description: 'Summon temporary beast ally', tier: 3, cost: 2, requires: ['d_t2_entangle'], mutuallyExclusiveWith: ['d_t3_terra', 'd_t3_bloom2'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.4 }], isActive: true, cooldown: 12 },
      { id: 'd_t3_bloom2', name: 'Eternal Bloom', description: 'Double healing and regen', tier: 3, cost: 2, requires: ['d_t2_swarm'], mutuallyExclusiveWith: ['d_t3_terra', 'd_t3_wild'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }, { stat: 'hp', operation: 'add', value: 40 }], isActive: false },
    ],
    ultimateOptions: {
      a: { id: 'd_ult_natures_wrath', name: "Nature's Wrath", description: 'Massive AoE nature damage to all enemies in 8 tiles', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
      b: { id: 'd_ult_gaia_blessing', name: "Gaia's Blessing", description: 'Full heal all allies and buff DEF for 10 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'defense', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 60 },
    },
  },
  'Dwarven Runesmith': {
    classId: 'Dwarven Runesmith',
    nodes: [
      { id: 'rs_t1_rune', name: 'Rune Strike', description: '+20% attack', tier: 1, cost: 1, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'rs_t1_stone', name: 'Stone Body', description: '+50 HP, +6 DEF', tier: 1, cost: 1, requires: [], effects: [{ stat: 'hp', operation: 'add', value: 50 }, { stat: 'defense', operation: 'add', value: 6 }], isActive: false },
      { id: 'rs_t1_forge', name: 'Forge Speed', description: '+10% speed', tier: 1, cost: 1, requires: [], effects: [{ stat: 'speed', operation: 'multiply', value: 1.1 }], isActive: false },
      { id: 'rs_t2_rune_ward', name: 'Rune Ward', description: 'Absorb next hit', tier: 2, cost: 1, requires: ['rs_t1_stone'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 10 },
      { id: 'rs_t2_rune_blast', name: 'Rune Blast', description: 'Explode on hit', tier: 2, cost: 1, requires: ['rs_t1_rune'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.3 }], isActive: true, cooldown: 6 },
      { id: 'rs_t2_rune_speed', name: 'Rune of Speed', description: '+20% speed', tier: 2, cost: 1, requires: ['rs_t1_forge'], effects: [{ stat: 'speed', operation: 'multiply', value: 1.2 }], isActive: false },
      { id: 'rs_t3_anvil', name: 'Anvil of Doom', description: 'Stomp attack, AoE damage', tier: 3, cost: 2, requires: ['rs_t2_rune_blast'], mutuallyExclusiveWith: ['rs_t3_guardian', 'rs_t3_berserk'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.5 }], isActive: true, cooldown: 12 },
      { id: 'rs_t3_guardian', name: 'Rune Guardian', description: 'Become immovable, taunt all', tier: 3, cost: 2, requires: ['rs_t2_rune_ward'], mutuallyExclusiveWith: ['rs_t3_anvil', 'rs_t3_berserk'], effects: [{ stat: 'defense', operation: 'multiply', value: 1.5 }, { stat: 'hp', operation: 'add', value: 80 }], isActive: true, cooldown: 10 },
      { id: 'rs_t3_berserk', name: 'Rune Berserk', description: 'ATK x1.8, lose DEF', tier: 3, cost: 2, requires: ['rs_t2_rune_speed'], mutuallyExclusiveWith: ['rs_t3_anvil', 'rs_t3_guardian'], effects: [{ stat: 'attack', operation: 'multiply', value: 1.8 }, { stat: 'defense', operation: 'multiply', value: 0.7 }], isActive: true, cooldown: 8 },
    ],
    ultimateOptions: {
      a: { id: 'rs_ult_rune_storm', name: 'Rune Storm', description: 'Explode with runes, massive AoE damage', tier: 3, cost: 3, requires: [], effects: [{ stat: 'attack', operation: 'multiply', value: 2 }], isActive: true, cooldown: 60 },
      b: { id: 'rs_ult_iron fortress', name: 'Iron Fortress', description: 'Become invulnerable and taunt all enemies for 6 ticks', tier: 3, cost: 3, requires: [], effects: [{ stat: 'defense', operation: 'multiply', value: 3 }], isActive: true, cooldown: 60 },
    },
  },
};

export function getSkillTree(heroClass: string): SkillTree | undefined {
  return SKILL_TREES[heroClass as HeroClass];
}
