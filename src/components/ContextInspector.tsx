import { Compass, Crosshair, X, Sword, ArrowUpRight } from 'lucide-react';
import type { GameState } from '../types/game';
import { useUIStore } from '../stores/uiStore';
import { component, isObserved, positionOf } from '../presentation/events';
import InspectorPanel from './InspectorPanel';

export default function ContextInspector({ state }: { state: GameState }) {
  const selection = useUIStore((s) => s.selection),
    close = useUIStore((s) => s.closeWorkspace);
  const id = selection.entityId;
  const hero = id == null ? undefined : component(state, id, 'HeroAI');
  const movement = id == null ? undefined : component(state, id, 'Movement');
  const targetName =
    hero?.targetEntityId == null ? undefined : component(state, hero.targetEntityId, 'Name')?.name;
  const tile =
    selection.selectionType === 'tile' && selection.x != null
      ? state.grid[selection.x]?.[selection.y!]
      : null;
  const roster = Object.keys(state.world.entities)
    .map(Number)
    .filter(
      (id) =>
        isObserved(state, id) &&
        (component(state, id, 'HeroAI') ||
          component(state, id, 'Building') ||
          component(state, id, 'Lair') ||
          component(state, id, 'Faction') ||
          component(state, id, 'MonsterAI'))
    );
  return (
    <aside className="context-inspector" aria-label="Contextual inspector">
      <header>
        <span>
          <Compass size={15} />
          OBSERVATION
        </span>
        <button onClick={close} aria-label="Close inspector">
          <X size={17} />
        </button>
      </header>
      <div className="context-body custom-scrollbar">
        {id != null && (
          <>
            <InspectorPanel state={state} gameMode={state.config.gameMode} />
            {hero && (
              <section className="intent-readout">
                <span className="eyebrow">Actual hero intent</span>
                <strong>{hero.status}</strong>
                <p>
                  {targetName
                    ? `Target: ${targetName}`
                    : movement?.targetX != null
                      ? `Destination: ${movement.targetX}, ${movement.targetY}`
                      : 'No current destination recorded.'}
                </p>
                <div className="context-actions">
                  <button onClick={useUIStore.getState().toggleFollowSelected}>
                    <Crosshair size={14} />
                    Follow
                  </button>
                  <button onClick={() => useUIStore.getState().openWorkspace('equipment')}>
                    <Sword size={14} />
                    Equipment
                  </button>
                  <button onClick={() => useUIStore.getState().openWorkspace('skill')}>
                    Skills
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </section>
            )}
          </>
        )}
        {tile && (
          <section className="tile-readout">
            <span className="eyebrow">
              {tile.x}, {tile.y} / Explored terrain
            </span>
            <h3>{tile.terrain}</h3>
            <p>
              {tile.resourceDeposit
                ? `Resource deposit: ${tile.resourceDeposit}`
                : 'No resource deposit.'}
            </p>
            {tile.hasRoad && <p>Connected road</p>}
          </section>
        )}
        {id == null && !tile && (
          <div className="empty-instrument">
            <Compass size={28} />
            <h3>Choose a presence</h3>
            <p>Select something in the kingdom, or use the roster below.</p>
          </div>
        )}
        <details open={id == null} className="realm-roster">
          <summary>Observed realm · {roster.length} presences</summary>
          {roster.map((entityId) => {
            const h = component(state, entityId, 'HeroAI'),
              p = positionOf(state, entityId),
              health = component(state, entityId, 'Health');
            return (
              <button
                key={entityId}
                aria-pressed={id === entityId}
                onClick={() => {
                  const ui = useUIStore.getState();
                  ui.selectEntity(entityId, h ? 'hero' : 'entity');
                  if (p) ui.setCameraTarget({ ...p });
                }}
              >
                <span>{component(state, entityId, 'Name')?.name ?? `Entity ${entityId}`}</span>
                <small>
                  {health && health.hp <= 0
                    ? 'Fallen'
                    : h
                      ? `Level ${h.level} · ${h.status}`
                      : (component(state, entityId, 'Building')?.buildingType ??
                        component(state, entityId, 'Lair')?.threatLevel ??
                        'Observed')}
                </small>
              </button>
            );
          })}
        </details>
      </div>
    </aside>
  );
}
