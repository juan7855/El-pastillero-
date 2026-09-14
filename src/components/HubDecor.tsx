import React from "react";
import { clamp } from "../lib/useElementSize";

/** Chrome chain drawn link-by-link between two points (pixel space). */
export const Chain: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active?: boolean;
  dim?: boolean;
}> = ({ x1, y1, x2, y2, active, dim }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const step = clamp(dist / 9, 13, 26);
  const count = Math.max(2, Math.floor(dist / step));
  const L = clamp(step * 0.52, 6.4, 11);

  const links = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    return {
      x: x1 + dx * t,
      y: y1 + dy * t,
      rot: angle + (i % 2 === 0 ? 0 : 90),
      key: i,
    };
  });

  return (
    <g opacity={dim ? 0.3 : 1} style={{ transition: "opacity .3s ease" }}>
      <g filter="url(#chain-glow)" opacity={active ? 0.85 : 0.35}>
        {links.map((l) => (
          <ellipse key={`g${l.key}`} cx={l.x} cy={l.y} rx={L} ry={L * 0.66} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill="none" stroke="rgb(var(--accent))" strokeWidth={L * 0.5} />
        ))}
      </g>
      <g>
        {links.map((l) => (
          <g key={l.key} transform={`rotate(${l.rot} ${l.x} ${l.y})`}>
            <ellipse cx={l.x} cy={l.y} rx={L} ry={L * 0.66} fill="none" stroke="#08090b" strokeWidth={L * 0.78} opacity={0.9} />
            <ellipse cx={l.x} cy={l.y} rx={L} ry={L * 0.66} fill="none" stroke="url(#chain-chrome)" strokeWidth={L * 0.5} />
            <ellipse cx={l.x} cy={l.y} rx={L * 0.99} ry={L * 0.64} fill="none" stroke="#ffffff" strokeWidth={L * 0.12} opacity={0.55} />
          </g>
        ))}
      </g>
    </g>
  );
};

/** Radiating perspective grid + concentric rings behind the emblem. */
export const RadialGrid: React.FC<{ size: number }> = ({ size }) => {
  const rings = [0.24, 0.4, 0.56, 0.72, 0.92];
  const spokes = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  const R = size * 0.62;
  return (
    <svg
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      className="pointer-events-none absolute"
      style={{ width: size, height: size, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
    >
      <g className="spin-slow" opacity={0.5}>
        {rings.map((k, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={0}
            rx={R * k}
            ry={R * k * 0.94}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.075 - i * 0.006}
            strokeWidth={1}
          />
        ))}
        {spokes.map((a) => (
          <line
            key={a}
            x1={0}
            y1={0}
            x2={0}
            y2={-R}
            stroke="#ffffff"
            strokeOpacity={0.055}
            strokeWidth={1}
            transform={`rotate(${a})`}
          />
        ))}
      </g>
      <g className="spin-rev" opacity={0.55}>
        <ellipse cx={0} cy={0} rx={R * 0.5} ry={R * 0.14} fill="none" stroke="rgb(var(--accent))" strokeOpacity={0.16} strokeWidth={1.4} />
        <ellipse cx={0} cy={0} rx={R * 0.72} ry={R * 0.2} fill="none" stroke="#ffffff" strokeOpacity={0.07} strokeWidth={1.2} />
      </g>
    </svg>
  );
};

/** All chains for the hub. */
export const ChainLayer: React.FC<{
  w: number;
  h: number;
  center: { x: number; y: number };
  nodes: { id: string; x: number; y: number }[];
  centerR: number;
  orbR: number;
  activeId: string | null;
  hoverId: string | null;
}> = ({ w, h, center, nodes, centerR, orbR, activeId, hoverId }) => {
  if (!w || !h) return null;
  const cx = (center.x / 100) * w;
  const cy = (center.y / 100) * h;
  return (
    <svg width={w} height={h} className="pointer-events-none absolute inset-0">
      <defs>
        <linearGradient id="chain-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "#ffffff" }} />
          <stop offset="35%" style={{ stopColor: "#b9bfc7" }} />
          <stop offset="52%" style={{ stopColor: "#5d636b" }} />
          <stop offset="70%" style={{ stopColor: "#dfe4ea" }} />
          <stop offset="100%" style={{ stopColor: "#8b9199" }} />
        </linearGradient>
        <filter id="chain-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      {nodes.map((n) => {
        const nx = (n.x / 100) * w;
        const ny = (n.y / 100) * h;
        const dx = cx - nx;
        const dy = cy - ny;
        const d = Math.hypot(dx, dy) || 1;
        return (
          <Chain
            key={n.id}
            x1={cx + (dx / d) * centerR * 0.94}
            y1={cy + (dy / d) * centerR * 0.94}
            x2={nx + (-dx / d) * (orbR + 4)}
            y2={ny + (-dy / d) * (orbR + 4)}
            active={activeId === n.id || hoverId === n.id}
            dim={!!activeId && activeId !== n.id}
          />
        );
      })}
    </svg>
  );
};
