import type { ECSWorld } from './ECSWorld';

export abstract class System {
  abstract update(world: ECSWorld, dt: number): void;
  readonly priority: number = 0;
  readonly name: string = this.constructor.name;
}

export class SystemScheduler {
  private systems: System[] = [];

  register(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  unregister(systemName: string): void {
    this.systems = this.systems.filter(s => s.name !== systemName);
  }

  updateAll(world: ECSWorld, dt: number): void {
    for (const system of this.systems) {
      system.update(world, dt);
    }
  }

  getSystems(): System[] {
    return [...this.systems];
  }

  clear(): void {
    this.systems = [];
  }
}
