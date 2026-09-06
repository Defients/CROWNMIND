import React, { useMemo } from 'react';
import { Coins, TrendingUp, TrendingDown, Building2, Package, BarChart3 } from 'lucide-react';
import Panel from './ui/Panel';
import SectionHeader from './ui/SectionHeader';
import StatPill from './ui/StatPill';
import EmptyState from './ui/EmptyState';
import { useGameStore } from '../stores/gameStore';
import { ECSWorld } from '../engine';
import type { BuildingComponent, ResourceProducerComponent, ResourceConsumerComponent } from '../engine/Component';
import { RESOURCE_LABELS, RESOURCE_COLORS, RESOURCE_TYPES } from '../types/resources';

export default function EconomyPanel() {
  const state = useGameStore((s) => s.state);

  const economyData = useMemo(() => {
    if (!state) return null;
    const world = new ECSWorld();
    world.deserialize(state.world);

    const buildings = world.query('Building').map((id) => {
      const b = world.getComponent<BuildingComponent>(id, 'Building');
      return { id, type: b?.buildingType ?? 'Unknown', isBuilt: b?.isBuilt ?? false };
    });

    const buildingCounts = buildings.reduce<Record<string, number>>((acc, b) => {
      const key = b.isBuilt ? b.type : `${b.type} (planned)`;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const producers = world.query('ResourceProducer').map((id) => {
      const p = world.getComponent<ResourceProducerComponent>(id, 'ResourceProducer');
      return { resource: p?.resource ?? 'Unknown', rate: p?.rate ?? 0 };
    });

    const consumers = world.query('ResourceConsumer').map((id) => {
      const c = world.getComponent<ResourceConsumerComponent>(id, 'ResourceConsumer');
      return { resource: c?.resource ?? 'Unknown', rate: c?.rate ?? 0 };
    });

    const productionByResource: Record<string, number> = {};
    producers.forEach((p) => {
      productionByResource[p.resource] = (productionByResource[p.resource] ?? 0) + p.rate;
    });

    const consumptionByResource: Record<string, number> = {};
    consumers.forEach((c) => {
      consumptionByResource[c.resource] = (consumptionByResource[c.resource] ?? 0) + c.rate;
    });

    return {
      resources: state.resources,
      capacity: state.resourceCapacity,
      buildingCounts,
      productionByResource,
      consumptionByResource,
      stats: state.stats,
    };
  }, [state]);

  if (!economyData) return null;

  return (
    <Panel as="section" ariaLabel="Economy overview" className="p-3 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      <SectionHeader title="Economy" icon={BarChart3} color="text-[#f5c84b]" as="h2" />

      <div className="grid grid-cols-2 gap-1.5">
        <StatPill icon={Coins} label="Gold Earned" value={economyData.stats.goldEarned} color="gold" />
        <StatPill icon={Coins} label="Gold Spent" value={economyData.stats.goldSpent} color="danger" />
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionHeader title="Resources" icon={Package} color="text-[#26f4ff]" as="h3" />
        <div className="flex flex-col gap-1">
          {RESOURCE_TYPES.map((key) => {
            const value = economyData.resources[key];
            const cap = economyData.capacity[key];
            const prod = economyData.productionByResource[key] ?? 0;
            const cons = economyData.consumptionByResource[key] ?? 0;
            const net = prod - cons;
            const color = RESOURCE_COLORS[key as keyof typeof RESOURCE_COLORS] ?? '#eee8ff';
            return (
              <div
                key={key}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.12)]"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#eee8ff]/60">
                      {RESOURCE_LABELS[key as keyof typeof RESOURCE_LABELS] ?? key}
                    </span>
                    <span className="text-[10px] font-mono font-bold" style={{ color }}>
                      {Math.floor(value)}<span className="text-[#eee8ff]/30">/{cap}</span>
                    </span>
                  </div>
                  {net !== 0 && (
                    <div className="flex items-center gap-1 text-[9px] font-mono">
                      {net > 0 ? (
                        <span className="text-[#38e68b] flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />+{net.toFixed(1)}/day
                        </span>
                      ) : (
                        <span className="text-[#ff4d6d] flex items-center gap-0.5">
                          <TrendingDown className="w-2.5 h-2.5" />{net.toFixed(1)}/day
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionHeader title="Buildings" icon={Building2} color="text-[#38e68b]" as="h3" />
        {Object.keys(economyData.buildingCounts).length === 0 ? (
          <EmptyState icon={Building2} title="No Buildings" description="Buildings will appear as they are constructed." />
        ) : (
          <div className="flex flex-col gap-1">
            {Object.entries(economyData.buildingCounts).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#07040d] border border-[rgba(128,90,213,0.12)]"
              >
                <span className="text-[10px] font-mono text-[#eee8ff]/70">{type}</span>
                <span className="text-[10px] font-mono font-bold text-[#38e68b]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
