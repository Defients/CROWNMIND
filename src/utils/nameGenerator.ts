import type { HeroClass } from '../types/heroes';
import type { FactionType, Biome } from '../types/world';
import { SeededRNG } from './rng';

const fighterFirstNames = [
  'Marn', 'Keth', 'Vaelen', 'Garr', 'Theron', 'Torin', 'Jarek', 'Bram', 'Kael', 'Drakon', 'Zarek', 'Orin', 'Sven', 'Boric', 'Aris'
];
const fighterSurnames = [
  'of the Kiox-Bound', 'the Iron-Handed', 'the Red-Scythe', 'of Pyahhold', 'the Unbroken', 'the Boulder', 'the Scarred', 'of the Rift'
];

const scoutFirstNames = [
  'Fera', 'Lukas', 'Sari', 'Niko', 'Lyra', 'Zeph', 'Sylas', 'Kyra', 'Orla', 'Kaelen', 'Tari', 'Rion', 'Jaya', 'Shade', 'Fenn'
];
const scoutSurnames = [
  'the Ymzo-Touched', 'the Mist-Walker', 'the Swift-Stride', 'the Eye-of-Crown', 'the Silent', 'the Wind-Runner', 'the Seeker'
];

const acolyteFirstNames = [
  'Elys', 'Myra', 'Caelia', 'Vesper', 'Lumina', 'Seraph', 'Kora', 'Selene', 'Aria', 'Thalia', 'Rhea', 'Vivia', 'Karis', 'Althea'
];
const acolyteSurnames = [
  'the Zeeya-Warded', 'the Light-Weaver', 'the Mend-Giver', 'the Soul-Shield', 'the Rune-Warder', 'of the Shrine', 'the Pure'
];

const mageFirstNames = [
  'Astral', 'Nyx', 'Pyrith', 'Eldra', 'Zorin', 'Caelum', 'Vash', 'Miri', 'Thex', 'Orym', 'Vaelith', 'Quill', 'Soren', 'Drael'
];
const mageSurnames = [
  'the Astryx-Touched', 'the Star-Caller', 'the Rift-Splitter', 'the Mana-Weaver', 'the Void-Seer', 'of the Astral Court'
];

const archerFirstNames = [
  'Ryn', 'Talia', 'Corin', 'Vex', 'Sable', 'Pike', 'Wren', 'Hawk', 'Bryn', 'Kestrel', 'Ash', 'Linnet', 'Drake', 'Sho'
];
const archerSurnames = [
  'the Kael-Bound', 'the Far-Sight', 'the Swift-Draw', 'the Eagle-Eye', 'the Wind-Singer', 'of the High Branch'
];

const paladinFirstNames = [
  'Galen', 'Auric', 'Seren', 'Dorum', 'Vala', 'Tyrel', 'Korin', 'Kassia', 'Roderick', 'Lyssia', 'Bran', 'Mira', 'Aldric', 'Cassius'
];
const paladinSurnames = [
  'the Vael-Bound', 'the Light-Bringer', 'the Shield of Pyahhold', 'the Oath-Keeper', 'the Divine-Hand', 'of the Sacred Vow'
];

const druidFirstNames = [
  'Sylvari', 'Thistle', 'Oakwen', 'Fern', 'Briar', 'Rowan', 'Moss', 'Willow', 'Hazel', 'Ashen', 'Ivy', 'Clover', 'Elm', 'Reed', 'Flora'
];
const druidSurnames = [
  'the Faeling-Born', 'the Storm-Caller', 'the Wild-Shape', 'the Green-Warden', 'of the Deep Wood', 'the Thorn-Weaver'
];

const runesmithFirstNames = [
  'Durin', 'Bifur', 'Dvalin', 'Farin', 'Fundin', 'Galar', 'Nordin', 'Thrain', 'Borin', 'Gimli', 'Gloin', 'Balin', 'Dori', 'Nori', 'Ori'
];
const runesmithSurnames = [
  'the Rune-Carver', 'the Forge-Hand', 'the Stone-Breaker', 'of the Deep Forge', 'the Iron-Word', 'the Hammer-Bound'
];

const monsterNames = [
  'Krax', 'Vyl', 'Zex', 'Torg', 'Grin', 'Skra', 'Pha', 'Gorg', 'Mor', 'Rax', 'Ves', 'Zor', 'Kry', 'Thax', 'Veyl'
];

const factionNames: Record<FactionType, string[]> = {
  village: ['Millbrook', 'Thornhaven', 'Ashford', 'Glimmerdale', 'Mossford', 'Brindle'],
  banditCamp: ['Crimson Fang Camp', 'Skullmark Raiders', 'Blackthorn Bandits', 'Dustwind Marauders'],
  ancientRuin: ['Elderstone Ruins', 'Forgotten Sanctum', 'Astral Remnants', 'Pre-Dawn Archive'],
  wanderingTrader: ['Merchant Olo', 'Trader Venn', 'Caravan Master Sira', 'Peddler Kex'],
  mercenaryCamp: ['Iron Blade Company', 'Free Lances', 'Golden Axes', 'Stormbreakers'],
  embassy: ['Embassy of Veyl', 'Diplomatic Mission', 'Azure Court Embassy', 'Highreach Consulate'],
  dragonLair: ['Pyrothrax Den', 'Emberwyrm Lair', 'Stormdrake Roost', 'Ancient Wyrmhold'],
};

const biomeSuffixes: Record<Biome, string> = {
  temperate: 'of the Verdant Expanse',
  arid: 'of the Sunscorched Wastes',
  tundra: 'of the Frozen Reach',
};

export function generateHeroName(heroClass: HeroClass, rng: SeededRNG): string {
  let firstNames: string[];
  let surnames: string[];

  switch (heroClass) {
    case 'Kiox-Bound Fighter':
      firstNames = fighterFirstNames; surnames = fighterSurnames; break;
    case 'Ymzo-Touched Scout':
      firstNames = scoutFirstNames; surnames = scoutSurnames; break;
    case 'Zeeya-Warded Acolyte':
      firstNames = acolyteFirstNames; surnames = acolyteSurnames; break;
    case 'Astryx Mage':
      firstNames = mageFirstNames; surnames = mageSurnames; break;
    case 'Kael Archer':
      firstNames = archerFirstNames; surnames = archerSurnames; break;
    case 'Vael Paladin':
      firstNames = paladinFirstNames; surnames = paladinSurnames; break;
    case 'Faeling Druid':
      firstNames = druidFirstNames; surnames = druidSurnames; break;
    case 'Dwarven Runesmith':
      firstNames = runesmithFirstNames; surnames = runesmithSurnames; break;
    default:
      firstNames = fighterFirstNames; surnames = fighterSurnames; break;
  }

  return `${rng.pick(firstNames)} ${rng.pick(surnames)}`;
}

export function generateMonsterName(type: string, rng: SeededRNG): string {
  const root = rng.pick(monsterNames);
  return `${root}-${type.split(' ')[0]}`;
}

export function generateFactionName(type: FactionType, rng: SeededRNG): string {
  const names = factionNames[type] || ['Unknown'];
  return rng.pick(names);
}

export function generateBiomeName(biome: Biome, rng: SeededRNG): string {
  const prefix = rng.pick(['New', 'Old', 'High', 'Low', 'Far', 'Near']);
  const roots = ['Astr', 'Veyl', 'Kiox', 'Ymzo', 'Zeeya', 'Kael', 'Pyah'];
  const root = rng.pick(roots);
  return `${prefix}${root}hold ${biomeSuffixes[biome]}`;
}
