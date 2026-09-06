import type { ECSWorld, EntityId } from '../engine';
import type { SkillTreeComponent, CombatComponent, HealthComponent, HeroAIComponent } from '../engine/Component';
import { SKILL_TREES, getSkillTree } from '../types/skills';
import type { SkillNode, SkillEffect } from '../types/skills';
import { BALANCE } from '../utils/balance';

export function initSkillTree(world: ECSWorld, entityId: EntityId, heroClass: string): void {
  const tree = getSkillTree(heroClass);
  if (!tree) return;
  world.addComponent(entityId, {
    type: 'SkillTree', entityId,
    classId: heroClass,
    allocatedNodes: [],
    skillPoints: 0,
    ultimateChoice: null,
    ultimateCooldown: 0,
  });
}

export function allocateSkillPoint(world: ECSWorld, entityId: EntityId, nodeId: string): boolean {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree) return false;
  if (skillTree.skillPoints < 1) return false;
  if (skillTree.allocatedNodes.includes(nodeId)) return false;

  const tree = getSkillTree(skillTree.classId);
  if (!tree) return false;

  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return false;

  for (const req of node.requires) {
    if (!skillTree.allocatedNodes.includes(req)) return false;
  }

  if (node.mutuallyExclusiveWith) {
    for (const excl of node.mutuallyExclusiveWith) {
      if (skillTree.allocatedNodes.includes(excl)) return false;
    }
  }

  skillTree.allocatedNodes = [...skillTree.allocatedNodes, nodeId];
  skillTree.skillPoints -= 1;
  applyPassiveEffects(world, entityId, node.effects);
  return true;
}

export function chooseUltimate(world: ECSWorld, entityId: EntityId, choice: 'a' | 'b'): boolean {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree) return false;
  if (skillTree.ultimateChoice !== null) return false;

  const heroAI = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
  if (!heroAI || heroAI.level < BALANCE.skills.ultimateUnlockLevel) return false;

  const tree = getSkillTree(skillTree.classId);
  if (!tree) return false;

  const ult = choice === 'a' ? tree.ultimateOptions.a : tree.ultimateOptions.b;
  skillTree.ultimateChoice = ult.id;
  applyPassiveEffects(world, entityId, ult.effects);
  return true;
}

export function grantSkillPointOnLevelUp(world: ECSWorld, entityId: EntityId): void {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree) return;
  skillTree.skillPoints += BALANCE.skills.skillPointsPerLevel;
}

export function tryUseUltimate(world: ECSWorld, entityId: EntityId): boolean {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree || !skillTree.ultimateChoice) return false;
  if (skillTree.ultimateCooldown > 0) return false;

  const tree = getSkillTree(skillTree.classId);
  if (!tree) return false;

  const ult = skillTree.ultimateChoice === tree.ultimateOptions.a.id
    ? tree.ultimateOptions.a
    : tree.ultimateOptions.b;

  skillTree.ultimateCooldown = ult.cooldown ?? BALANCE.skills.ultimateCooldown;
  return true;
}

export function getUltimateCooldown(entityId: EntityId, world: ECSWorld): number {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  return skillTree?.ultimateCooldown ?? 0;
}

export function tickUltimateCooldowns(world: ECSWorld): void {
  const ids = world.query('SkillTree');
  for (const id of ids) {
    const st = world.getComponent<SkillTreeComponent>(id, 'SkillTree')!;
    if (st.ultimateCooldown > 0) st.ultimateCooldown--;
  }
}

export function getActiveSkillEffects(world: ECSWorld, entityId: EntityId): SkillEffect[] {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree) return [];
  const tree = getSkillTree(skillTree.classId);
  if (!tree) return [];

  const effects: SkillEffect[] = [];
  for (const nodeId of skillTree.allocatedNodes) {
    const node = tree.nodes.find(n => n.id === nodeId);
    if (node) effects.push(...node.effects);
  }
  if (skillTree.ultimateChoice) {
    const ult = skillTree.ultimateChoice === tree.ultimateOptions.a.id
      ? tree.ultimateOptions.a
      : tree.ultimateOptions.b;
    effects.push(...ult.effects);
  }
  return effects;
}

function applyPassiveEffects(world: ECSWorld, entityId: EntityId, effects: SkillEffect[]): void {
  const combat = world.getComponent<CombatComponent>(entityId, 'Combat');
  const health = world.getComponent<HealthComponent>(entityId, 'Health');
  const heroAI = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
  if (!combat || !health) return;

  for (const effect of effects) {
    switch (effect.stat) {
      case 'attack':
        if (effect.operation === 'add') combat.attack += effect.value;
        else combat.attack = Math.floor(combat.attack * effect.value);
        break;
      case 'defense':
        if (effect.operation === 'add') combat.defense += effect.value;
        else combat.defense = Math.floor(combat.defense * effect.value);
        break;
      case 'hp':
        if (effect.operation === 'add') {
          health.maxHp += effect.value;
          health.hp = Math.min(health.maxHp, health.hp + effect.value);
        } else {
          health.maxHp = Math.floor(health.maxHp * effect.value);
          health.hp = Math.min(health.maxHp, health.hp);
        }
        break;
      case 'speed':
        if (effect.operation === 'add') combat.speed += effect.value;
        else combat.speed *= effect.value;
        break;
      case 'range':
        if (effect.operation === 'add') combat.range += effect.value;
        else combat.range *= effect.value;
        break;
      case 'courage':
        if (heroAI) {
          if (effect.operation === 'add') heroAI.courage = Math.min(100, heroAI.courage + effect.value);
          else heroAI.courage = Math.min(100, Math.floor(heroAI.courage * effect.value));
        }
        break;
    }
  }
}

export function autoAllocateSkillPoints(world: ECSWorld, entityId: EntityId): void {
  const skillTree = world.getComponent<SkillTreeComponent>(entityId, 'SkillTree');
  if (!skillTree || skillTree.skillPoints < 1) return;
  const tree = getSkillTree(skillTree.classId);
  if (!tree) return;

  const heroAI = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
  const role = heroAI?.heroClass ?? '';

  for (const node of tree.nodes) {
    if (skillTree.skillPoints < 1) break;
    if (skillTree.allocatedNodes.includes(node.id)) continue;
    if (node.mutuallyExclusiveWith?.some(ex => skillTree.allocatedNodes.includes(ex))) continue;

    const meetsReqs = node.requires.every(r => skillTree.allocatedNodes.includes(r));
    if (!meetsReqs) continue;

    const isTank = role.includes('Fighter') || role.includes('Paladin') || role.includes('Runesmith');
    const isScout = role.includes('Scout') || role.includes('Archer');
    const isCaster = role.includes('Mage') || role.includes('Druid') || role.includes('Acolyte');

    let priority = 0;
    if (isTank && (node.effects.some(e => e.stat === 'defense' || e.stat === 'hp'))) priority = 3;
    else if (isScout && (node.effects.some(e => e.stat === 'speed' || e.stat === 'range'))) priority = 3;
    else if (isCaster && (node.effects.some(e => e.stat === 'attack'))) priority = 3;
    else priority = 1;

    if (priority > 0) {
      allocateSkillPoint(world, entityId, node.id);
    }
  }

  if (skillTree.skillPoints > 0 && skillTree.ultimateChoice === null) {
    const heroAI2 = world.getComponent<HeroAIComponent>(entityId, 'HeroAI');
    if (heroAI2 && heroAI2.level >= BALANCE.skills.ultimateUnlockLevel) {
      chooseUltimate(world, entityId, 'a');
    }
  }
}
