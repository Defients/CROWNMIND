import type { ECSWorld, EntityId } from '../engine';
import type { HealthComponent, CombatComponent } from '../engine/Component';
import type { Dungeon, DungeonRoom, DungeonRoomType, Expedition } from '../types/dungeons';
import { BALANCE } from '../utils/balance';
import type { SeededRNG } from '../utils/rng';
import { rollItemDrop, rollBossDrop, addItemToInventory } from './EquipmentSystem';
import type { Item } from '../types/equipment';

export function generateDungeon(level: number, seed: number, entranceEntityId: EntityId, rng: SeededRNG): Dungeon {
  const roomCount = rng.int(BALANCE.dungeons.minRooms, BALANCE.dungeons.maxRooms);
  const rooms: DungeonRoom[] = [];
  const dungeonId = `dng_${entranceEntityId}_${seed}`;

  for (let i = 0; i < roomCount; i++) {
    let type: DungeonRoomType;
    if (i === 0) type = 'combat';
    else if (i === roomCount - 1) type = 'boss';
    else if (i === roomCount - 2) type = 'exit';
    else {
      const roll = rng.next();
      if (roll < 0.4) type = 'combat';
      else if (roll < 0.6) type = 'treasure';
      else if (roll < 0.75) type = 'trap';
      else if (roll < 0.9) type = 'shrine';
      else type = 'combat';
    }

    const connections: number[] = [];
    if (i > 0) connections.push(i - 1);
    if (i < roomCount - 1) connections.push(i + 1);
    if (rng.chance(0.2) && i > 1) connections.push(rng.int(0, i - 2));

    rooms.push({
      id: `${dungeonId}_room_${i}`,
      type,
      isCleared: false,
      monsters: [],
      rewards: [],
      connections,
    });
  }

  return {
    id: dungeonId,
    entranceEntityId,
    level,
    rooms,
    status: 'unexplored',
    currentRoomIndex: 0,
    seed,
  };
}

export function processExpedition(
  world: ECSWorld,
  dungeon: Dungeon,
  expedition: Expedition,
  rng: SeededRNG,
  onLog: (text: string) => void
): { dungeon: Dungeon; expedition: Expedition; completed: boolean } {
  if (!expedition.isActive || dungeon.status !== 'inProgress') {
    return { dungeon, expedition, completed: false };
  }

  const speed = BALANCE.dungeons.expeditionSpeed;
  expedition.progress += speed;

  if (expedition.progress < 1) {
    return { dungeon, expedition, completed: false };
  }
  expedition.progress = 0;

  const room = dungeon.rooms[dungeon.currentRoomIndex];
  if (!room) return { dungeon, expedition, completed: false };

  const result = resolveRoom(world, dungeon, room, expedition, rng, onLog);
  dungeon.rooms[dungeon.currentRoomIndex] = result.room;

  if (result.allHeroesDead) {
    dungeon.status = 'failed';
    expedition.isActive = false;
    onLog(`Expedition failed in ${dungeon.id}. Heroes will revive at Town Hall.`);
    return { dungeon, expedition, completed: false };
  }

  room.isCleared = true;

  if (room.type === 'boss' || room.type === 'exit') {
    dungeon.status = 'cleared';
    expedition.isActive = false;
    onLog(`Dungeon ${dungeon.id} cleared! All rewards collected.`);
    return { dungeon, expedition, completed: true };
  }

  const nextRoomIdx = room.connections.find(c => c > dungeon.currentRoomIndex && !dungeon.rooms[c]?.isCleared);
  if (nextRoomIdx !== undefined) {
    dungeon.currentRoomIndex = nextRoomIdx;
  } else {
    const altNext = room.connections.find(c => !dungeon.rooms[c]?.isCleared);
    if (altNext !== undefined) {
      dungeon.currentRoomIndex = altNext;
    } else {
      dungeon.status = 'cleared';
      expedition.isActive = false;
      onLog(`Dungeon ${dungeon.id} cleared!`);
      return { dungeon, expedition, completed: true };
    }
  }

  return { dungeon, expedition, completed: false };
}

function resolveRoom(
  world: ECSWorld,
  dungeon: Dungeon,
  room: DungeonRoom,
  expedition: Expedition,
  rng: SeededRNG,
  onLog: (text: string) => void
): { room: DungeonRoom; allHeroesDead: boolean } {
  const heroIds = expedition.squadHeroIds;
  let allHeroesDead = false;

  switch (room.type) {
    case 'combat': {
      const monsterLevel = dungeon.level * 2 + Math.floor(dungeon.currentRoomIndex / 3);
      const monsterCount = rng.int(1, 3);
      let totalMonsterHp = monsterCount * (50 + monsterLevel * 20);
      let totalMonsterAtk = monsterCount * (10 + monsterLevel * 5);

      for (const heroId of heroIds) {
        const health = world.getComponent<HealthComponent>(heroId, 'Health');
        const combat = world.getComponent<CombatComponent>(heroId, 'Combat');
        if (!health || !combat || health.hp <= 0) continue;

        const heroDmg = Math.max(1, combat.attack - 5);
        totalMonsterHp -= heroDmg;

        const monsterDmg = Math.max(1, Math.floor(totalMonsterAtk / monsterCount) - combat.defense);
        health.hp -= monsterDmg;

        if (health.hp <= 0) {
          health.hp = 0;
          onLog(`Hero fell in dungeon combat!`);
        }
      }

      const aliveHeroes = heroIds.filter(id => {
        const h = world.getComponent<HealthComponent>(id, 'Health');
        return h && h.hp > 0;
      });
      allHeroesDead = aliveHeroes.length === 0;

      if (!allHeroesDead && rng.chance(0.3)) {
        const drop = rollItemDrop(dungeon.level, rng, 2);
        if (drop) {
          room.rewards.push({ item: drop, chance: 1 });
          const firstAlive = aliveHeroes[0];
          if (firstAlive) addItemToInventory(world, firstAlive, drop.id);
          onLog(`Found ${drop.name} in dungeon!`);
        }
      }
      break;
    }

    case 'treasure': {
      const drop = rollItemDrop(dungeon.level, rng, 3);
      if (drop) {
        room.rewards.push({ item: drop, chance: 1 });
        const aliveHero = heroIds.find(id => {
          const h = world.getComponent<HealthComponent>(id, 'Health');
          return h && h.hp > 0;
        });
        if (aliveHero) addItemToInventory(world, aliveHero, drop.id);
        onLog(`Treasure room: found ${drop.name}!`);
      }
      break;
    }

    case 'trap': {
      for (const heroId of heroIds) {
        const health = world.getComponent<HealthComponent>(heroId, 'Health');
        if (!health || health.hp <= 0) continue;
        const trapDmg = Math.floor(health.maxHp * 0.15);
        health.hp -= trapDmg;
        onLog(`Trap hit a hero for ${trapDmg} damage!`);
        if (health.hp <= 0) health.hp = 0;
      }
      const aliveHeroes = heroIds.filter(id => {
        const h = world.getComponent<HealthComponent>(id, 'Health');
        return h && h.hp > 0;
      });
      allHeroesDead = aliveHeroes.length === 0;
      break;
    }

    case 'shrine': {
      for (const heroId of heroIds) {
        const health = world.getComponent<HealthComponent>(heroId, 'Health');
        if (!health || health.hp <= 0) continue;
        health.hp = Math.min(health.maxHp, health.hp + Math.floor(health.maxHp * 0.5));
      }
      onLog(`Shrine room: party healed for 50%!`);
      break;
    }

    case 'boss': {
      const bossLevel = dungeon.level * 4 + 10;
      let bossHp = 200 + bossLevel * 50;
      const bossAtk = 30 + bossLevel * 5;

      for (const heroId of heroIds) {
        const health = world.getComponent<HealthComponent>(heroId, 'Health');
        const combat = world.getComponent<CombatComponent>(heroId, 'Combat');
        if (!health || !combat || health.hp <= 0) continue;

        const heroDmg = Math.max(1, combat.attack - 8);
        bossHp -= heroDmg;

        if (bossHp > 0) {
          const bossDmg = Math.max(1, bossAtk - combat.defense);
          health.hp -= bossDmg;
          if (health.hp <= 0) {
            health.hp = 0;
            onLog(`Hero fell fighting the boss!`);
          }
        }
      }

      const aliveHeroes = heroIds.filter(id => {
        const h = world.getComponent<HealthComponent>(id, 'Health');
        return h && h.hp > 0;
      });
      allHeroesDead = aliveHeroes.length === 0;

      if (!allHeroesDead) {
        const bossDrop = rollBossDrop(dungeon.level, rng);
        room.rewards.push({ item: bossDrop, chance: 1 });
        const firstAlive = aliveHeroes[0];
        if (firstAlive) addItemToInventory(world, firstAlive, bossDrop.id);
        onLog(`Boss defeated! Dropped ${bossDrop.name}!`);
      }
      break;
    }

    case 'exit':
      break;
  }

  return { room, allHeroesDead };
}

export function startExpedition(
  dungeonId: string,
  heroIds: EntityId[],
  day: number
): Expedition {
  return {
    id: `exp_${dungeonId}_${day}`,
    dungeonId,
    squadHeroIds: heroIds,
    progress: 0,
    loot: [],
    isActive: true,
    startedDay: day,
  };
}

export function canEnterDungeon(dungeon: Dungeon, currentDay: number): boolean {
  if (dungeon.status === 'inProgress') return false;
  if (dungeon.status === 'cleared') {
    return false;
  }
  return dungeon.status === 'unexplored';
}

export function reviveHeroes(world: ECSWorld, heroIds: EntityId[]): void {
  for (const id of heroIds) {
    const health = world.getComponent<HealthComponent>(id, 'Health');
    if (health) {
      health.hp = Math.floor(health.maxHp * BALANCE.dungeons.revivePenaltyHp);
    }
  }
}
