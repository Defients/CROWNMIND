export type EntityId = number;

let nextEntityId = 1;

export function createEntityId(): EntityId {
  return nextEntityId++;
}

export function resetEntityIdCounter(start: number = 1): void {
  nextEntityId = start;
}

export function peekNextEntityId(): number {
  return nextEntityId;
}
