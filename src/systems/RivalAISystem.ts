import type { ECSWorld, EntityId } from '../engine';
import type { RivalSovereignComponent, PositionComponent, HealthComponent } from '../engine/Component';
import type { RivalConfig, SovereignPersonality } from '../types/scenarios';
import { RIVAL_PERSONALITIES } from '../types/scenarios';
import type { ResourceState } from '../types/resources';
import { BALANCE } from '../utils/balance';
import type { SeededRNG } from '../utils/rng';

export function createRivalKingdom(
  world: ECSWorld,
  config: RivalConfig,
  mapSize: number,
  playerTownHallPos: { x: number; y: number },
  rng: SeededRNG
): EntityId {
  const distance = mapSize * BALANCE.rivals.startingDistance;
  const angle = rng.float(0, Math.PI * 2);
  const x = Math.max(5, Math.min(mapSize - 5, Math.floor(playerTownHallPos.x + Math.cos(angle) * distance)));
  const y = Math.max(5, Math.min(mapSize - 5, Math.floor(playerTownHallPos.y + Math.sin(angle) * distance)));

  const id = world.createEntity();
  world.addComponent(id, { type: 'Position', entityId: id, x, y });
  world.addComponent(id, { type: 'Health', entityId: id, hp: 1500, maxHp: 1500 });
  world.addComponent(id, { type: 'Name', entityId: id, name: config.name });
  world.addComponent(id, {
    type: 'RivalSovereign', entityId: id,
    name: config.name,
    personality: config.personality,
    resources: {
      gold: config.startResources.gold ?? 400,
      wood: config.startResources.wood ?? 60,
      stone: config.startResources.stone ?? 50,
      food: config.startResources.food ?? 60,
      mana: config.startResources.mana ?? 20,
    },
    heroCount: config.startHeroes,
    townHallEntityId: id,
    isAlive: true,
  });
  world.addComponent(id, { type: 'Sprite', entityId: id, spriteType: 'rival', animationState: 'idle', animationFrame: 0, color: 0xff6600, size: 18 });

  return id;
}

export function runRivalAI(
  world: ECSWorld,
  rivalId: EntityId,
  day: number,
  rng: SeededRNG,
  onLog: (text: string) => void
): void {
  const rival = world.getComponent<RivalSovereignComponent>(rivalId, 'RivalSovereign');
  if (!rival || !rival.isAlive) return;

  const personality = RIVAL_PERSONALITIES[rival.personality as keyof typeof RIVAL_PERSONALITIES];
  if (!personality) return;

  const health = world.getComponent<HealthComponent>(rivalId, 'Health');
  if (health && health.hp <= 0) {
    rival.isAlive = false;
    onLog(`Rival kingdom ${rival.name} has fallen!`);
    return;
  }

  if (rng.chance(personality.economy)) {
    rival.resources.gold += rng.int(20, 50);
    rival.resources.wood += rng.int(5, 15);
    rival.resources.stone += rng.int(3, 10);
    rival.resources.food += rng.int(5, 15);
  }

  if (rng.chance(personality.aggression * 0.3) && rival.heroCount < 6) {
    if (rival.resources.gold >= 100 && rival.resources.food >= 10) {
      rival.resources.gold -= 100;
      rival.resources.food -= 10;
      rival.heroCount++;
      onLog(`Rival ${rival.name} hired a new hero.`);
    }
  }

  if (rng.chance(personality.aggression * 0.2)) {
    onLog(`Rival ${rival.name} is preparing an offensive.`);
  }

  if (rng.chance(personality.diplomacy * 0.15)) {
    onLog(`Rival ${rival.name} considers diplomatic relations.`);
  }
}

export function processRivalAITick(
  world: ECSWorld,
  day: number,
  rng: SeededRNG,
  onLog: (text: string) => void
): void {
  const rivalIds = world.query('RivalSovereign');
  for (const id of rivalIds) {
    runRivalAI(world, id, day, rng, onLog);
  }
}
