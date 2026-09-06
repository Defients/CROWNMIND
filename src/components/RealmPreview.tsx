import { useMemo } from 'react';
import type { Biome } from '../types/world';
import type { Difficulty } from '../types/game';
import { noise } from '../presentation/theme';

export default function RealmPreview({
  seed,
  biome,
  difficulty,
}: {
  seed: string;
  biome: Biome;
  difficulty: Difficulty;
}) {
  const cells = useMemo(() => {
    const salt = [...seed].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) | 0, 17);
    const palette =
      biome === 'arid'
        ? ['#5c5139', '#786746', '#957d52', '#4f5b42']
        : biome === 'tundra'
          ? ['#40586a', '#6d8793', '#a4b4b8', '#415d64']
          : ['#233e38', '#365a45', '#657651', '#4c6648'];
    const result: { x: number; y: number; color: string; tree: boolean }[] = [];
    for (let x = 0; x < 32; x++)
      for (let y = 0; y < 32; y++) {
        if (Math.hypot(x - 16, y - 16) > 15 + noise(x * 32 + y, salt) * 2) continue;
        const n = noise(x * 32 + y, salt),
          forest = Math.sin(x * 0.27) * Math.cos(y * 0.2) > 0.28;
        result.push({
          x: 320 + (x - y) * 8,
          y: 83 + (x + y) * 4.3,
          color: palette[forest ? 0 : n > 0.88 ? 2 : n > 0.55 ? 3 : 1],
          tree: forest && n > 0.38,
        });
      }
    return result;
  }, [seed, biome]);
  return (
    <svg
      viewBox="0 0 640 430"
      className="realm-preview"
      role="img"
      aria-label={`${biome} realm study for seed ${seed}. Illustrative terrain, not a map forecast.`}
    >
      <defs>
        <radialGradient id="realm-glow">
          <stop stopColor="#a9bf8433" />
          <stop offset="1" stopColor="#28433800" />
        </radialGradient>
        <linearGradient id="spire-stone" x2="1" y2="1">
          <stop stopColor="#805166" />
          <stop offset="1" stopColor="#251f36" />
        </linearGradient>
      </defs>
      <ellipse cx="320" cy="236" rx="265" ry="166" fill="url(#realm-glow)" />
      <g fill="none" stroke="#c4b47a" strokeWidth=".6">
        <ellipse cx="320" cy="259" rx="264" ry="143" opacity=".2" />
        <ellipse cx="320" cy="259" rx="280" ry="152" opacity=".1" />
        <path d="M20 259H80M560 259H620M320 75V101M320 401V425" opacity=".4" />
      </g>
      {cells.map((c, i) => (
        <g key={i}>
          <path d={`M${c.x} ${c.y}l8 4.3 -8 4.3 -8 -4.3Z`} fill={c.color} />
          {c.tree && (
            <path
              d={`M${c.x} ${c.y - 9}l4 12h-8Z`}
              fill={biome === 'tundra' ? '#608582' : '#1c3932'}
              stroke="#8aa07c"
              strokeOpacity=".15"
              strokeWidth=".5"
            />
          )}
        </g>
      ))}
      <g stroke="#d5ba76" strokeWidth="1" fill="none">
        <ellipse cx="320" cy="250" rx="58" ry="27" opacity=".35" />
        <path d="M325 244Q376 210 427 188" strokeDasharray="3 6" opacity=".7" />
      </g>
      <g transform="translate(320 227)">
        <path d="M-22 13L0 25 24 12 0 0Z" fill="#748578" />
        <path d="M-17 11V-13L0-22 17-13V11L0 20Z" fill="#718078" />
        <path d="M0-22V20L17 11V-13Z" fill="#405a51" />
        <path d="M-23-13L0-34 23-13 0-3Z" fill="#a38b5b" />
        <path d="M0-34L23-13 0-3Z" fill="#756643" />
        <path d="M-5 14V2Q0-5 5 2V20" fill="#182d2b" />
        <path d="M0-35V-57L15-51 0-46" fill="#d9be79" stroke="#d9be79" />
      </g>
      <g transform="translate(427 177)">
        <ellipse
          cy="12"
          rx="27"
          ry="12"
          fill="#cb536c"
          opacity={difficulty === 'easy' ? '.08' : difficulty === 'standard' ? '.15' : '.3'}
        />
        <path d="M-11 8L-4-33 0-54 6-31 11 8 0 17Z" fill="url(#spire-stone)" />
        <path d="M0-48L-2-18 3-5 0 12" stroke="#ef8293" strokeWidth="1.2" fill="none" />
      </g>
      <g fontFamily="monospace" fontSize="8" letterSpacing="1.5">
        <text x="321" y="284" textAnchor="middle" fill="#ddc58a">
          PYAHHOLD
        </text>
        <text x="469" y="157" fill="#c88291">
          VEYLTHYR
        </text>
        <text x="320" y="410" textAnchor="middle" fill="#99aaa4" fontSize="7">
          REALM STUDY · TERRAIN VARIES IN PLAY
        </text>
      </g>
    </svg>
  );
}
