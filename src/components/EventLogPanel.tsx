import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { GameLog, Milestone } from '../types/game';
import {
  Scroll, Swords, Crown, Coins, Sparkles, Skull, Hammer,
  Eye, EyeOff, Flag, Flame, ChevronDown, ChevronUp,
  Zap, Building, Compass,
} from 'lucide-react';
import Panel from './ui/Panel';

interface EventLogPanelProps {
  logs: GameLog[];
  milestones?: Milestone[];
}

type LogTypeFilter = 'all' | 'combat' | 'sovereign' | 'economy' | 'bounty' | 'discovery' | 'raid' | 'death' | 'milestones';

const filterConfig: { key: LogTypeFilter; label: string; types: string[] }[] = [
  { key: 'all', label: 'All', types: [] },
  { key: 'combat', label: 'Combat', types: ['combat'] },
  { key: 'sovereign', label: 'Sovereign', types: ['sovereign'] },
  { key: 'economy', label: 'Economy', types: ['building', 'general'] },
  { key: 'bounty', label: 'Bounty', types: ['bounty'] },
  { key: 'discovery', label: 'Discovery', types: ['event', 'intervention'] },
  { key: 'raid', label: 'Raid', types: ['raid'] },
  { key: 'death', label: 'Death', types: ['death'] },
  { key: 'milestones', label: 'Milestones', types: ['milestone'] },
];

export default function EventLogPanel({ logs, milestones = [] }: EventLogPanelProps) {
  const [filter, setFilter] = useState<LogTypeFilter>('all');
  const [isVerbose, setIsVerbose] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (filter === 'milestones') {
      return milestones.map(ms => ({
        id: ms.id, day: ms.day, text: ms.text, type: 'milestone' as const,
      }));
    }

    let result = logs;
    if (!isVerbose) {
      result = result.filter(log => log.type !== 'combat' && !log.text.includes('wanders') && !log.text.includes('patrolling'));
    }

    const cfg = filterConfig.find(f => f.key === filter);
    if (cfg && cfg.types.length > 0) {
      result = result.filter(log => cfg.types.includes(log.type));
    }

    return [...result].reverse();
  }, [logs, filter, isVerbose, milestones]);

  useEffect(() => {
    if (autoScroll && scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filteredLogs, autoScroll, isExpanded]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Swords className="w-3 h-3 text-[#ff4d6d]" />;
      case 'sovereign': return <Crown className="w-3 h-3 text-[#f5c84b]" />;
      case 'bounty': return <Coins className="w-3 h-3 text-[#f5c84b]" />;
      case 'event': return <Sparkles className="w-3 h-3 text-[#9b5cff]" />;
      case 'death': return <Skull className="w-3 h-3 text-[#ff4d6d] animate-bounce" />;
      case 'building': return <Building className="w-3 h-3 text-[#38e68b]" />;
      case 'raid': return <Flame className="w-3 h-3 text-[#ff4d6d] animate-pulse" />;
      case 'milestone': return <Flag className="w-3 h-3 text-[#f5c84b]" />;
      case 'intervention': return <Zap className="w-3 h-3 text-[#26f4ff]" />;
      default: return <Scroll className="w-3 h-3 text-[#eee8ff]/40" />;
    }
  };

  const getLogBorderColor = (type: string) => {
    switch (type) {
      case 'death': return 'border-[#ff4d6d]/40';
      case 'raid': return 'border-[#ff4d6d]/30';
      case 'milestone': return 'border-[#f5c84b]/30';
      case 'sovereign': return 'border-[#f5c84b]/20';
      case 'combat': return 'border-[#ff4d6d]/20';
      case 'building': return 'border-[#38e68b]/20';
      case 'event': return 'border-[#9b5cff]/20';
      default: return 'border-[rgba(128,90,213,0.15)]';
    }
  };

  const isImportant = (type: string) => type === 'death' || type === 'raid' || type === 'milestone';

  const renderEventCard = (log: GameLog, compact = false) => (
    <div
      id={`log-item-${log.id}`}
      className={`flex items-start gap-1.5 px-2 py-1 rounded-md border bg-[#07040d] ${getLogBorderColor(log.type)} ${isImportant(log.type) ? 'glow-danger' : ''} ${compact ? 'flex-shrink-0 min-w-[280px]' : ''}`}
    >
      <div className="flex items-center justify-center p-0.5 rounded bg-[#1a1028] mt-0.5 flex-shrink-0">
        {getLogIcon(log.type)}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[9px] font-semibold text-[#f5c84b] mr-1.5">D{log.day}</span>
        <span className={`font-sans text-[#eee8ff]/90 ${compact ? 'text-[10px]' : 'text-[11px]'} leading-snug`}>{log.text}</span>
      </div>
    </div>
  );

  return (
    <Panel id="event-log-panel" glow="subtle" className="flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(128,90,213,0.28)]">
        <div className="flex items-center gap-2">
          <Scroll className="w-3.5 h-3.5 text-[#f5c84b]" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#f5c84b] font-mono">Event Chronicle</h2>
          <span className="text-[9px] text-[#eee8ff]/40 font-mono">({filteredLogs.length})</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Auto-scroll toggle */}
          <button
            type="button"
            id="toggle-autoscroll-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            aria-pressed={autoScroll}
            aria-label="Toggle auto-scroll"
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
              autoScroll
                ? 'border-[#26f4ff]/30 bg-[#26f4ff]/5 text-[#26f4ff]'
                : 'border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/40 hover:text-[#eee8ff]'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
            title="Toggle auto-scroll"
          >
            <Compass className="w-3 h-3" aria-hidden="true" />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* Verbosity toggle */}
          <button
            type="button"
            id="toggle-verbosity-btn"
            onClick={() => setIsVerbose(!isVerbose)}
            aria-pressed={isVerbose}
            aria-label={isVerbose ? 'Switch to compact view' : 'Switch to verbose view'}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/60 hover:text-[#eee8ff] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
            title={isVerbose ? 'Compact view' : 'Verbose view'}
          >
            {isVerbose ? <EyeOff className="w-3 h-3" aria-hidden="true" /> : <Eye className="w-3 h-3" aria-hidden="true" />}
            <span className="hidden sm:inline">{isVerbose ? 'Compact' : 'Verbose'}</span>
          </button>

          {/* Expand/Collapse */}
          <button
            type="button"
            id="toggle-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border border-[rgba(128,90,213,0.28)] bg-[#1a1028] text-[#eee8ff]/60 hover:text-[#eee8ff] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50"
            title={isExpanded ? 'Collapse timeline' : 'Expand timeline'}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" aria-hidden="true" /> : <ChevronUp className="w-3 h-3" aria-hidden="true" />}
            <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[rgba(128,90,213,0.18)] overflow-x-auto custom-scrollbar">
        {filterConfig.map(f => (
          <button
            type="button"
            id={`filter-${f.key}-btn`}
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            aria-label={`Filter by ${f.label}`}
            className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-all border cursor-pointer ${
              filter === f.key
                ? 'bg-[#9b5cff]/20 border-[#9b5cff]/50 text-[#9b5cff]'
                : 'bg-transparent border-transparent text-[#eee8ff]/40 hover:text-[#eee8ff]'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b5cff]/50`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content: Collapsed (horizontal strip) or Expanded (vertical list) */}
      {isExpanded ? (
        <div
          ref={scrollRef}
          className="flex flex-col gap-1 p-2 overflow-y-auto custom-scrollbar max-h-[240px]"
        >
          {filteredLogs.length === 0 ? (
            <p className="text-center text-[11px] text-[#eee8ff]/40 py-4 italic">No chronicle entries match this filter.</p>
          ) : (
            filteredLogs.map(log => <React.Fragment key={log.id}>{renderEventCard(log)}</React.Fragment>)
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <p className="text-[11px] text-[#eee8ff]/40 italic">No entries match this filter.</p>
          ) : (
            filteredLogs.slice(0, 8).map(log => <React.Fragment key={log.id}>{renderEventCard(log, true)}</React.Fragment>)
          )}
        </div>
      )}
    </Panel>
  );
}
