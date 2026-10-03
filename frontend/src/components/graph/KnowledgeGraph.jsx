/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * KnowledgeGraph — the 3D relationship instrument.
 * Uses ONLY real relationship data. Labels frozen. Evidence
 * classes visually distinct; conceptual edges rendered dashed.
 * ============================================================ */

import React, { useMemo, useState } from "react";
import { Network } from "lucide-react";

export default function KnowledgeGraph({ relationships = [], height = 460, title = "Knowledge Graph" }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const layout = useMemo(() => {
    const W = 900;
    const H = height;
    const cx = W / 2;
    const cy = H / 2;

    const nodes = [];
    const nodeIndex = new Map();
    const push = (id) => {
      if (!id || nodeIndex.has(id)) return;
      nodeIndex.set(id, nodes.length);
      nodes.push({ id });
    };
    relationships.forEach((r) => {
      push(r.from);
      push(r.to);
    });

    // radial layout: by degree — hubs closer to center
    const degree = new Map();
    nodes.forEach((n) => degree.set(n.id, 0));
    relationships.forEach((r) => {
      degree.set(r.from, (degree.get(r.from) || 0) + 1);
      degree.set(r.to, (degree.get(r.to) || 0) + 1);
    });
    const maxDeg = Math.max(1, ...degree.values());

    const positioned = nodes.map((n, i) => {
      const deg = degree.get(n.id) || 0;
      const ring = deg >= Math.max(2, maxDeg - 1) ? 0.32 : 0.62;
      const golden = i * 2.399963;
      const jitter = ((i * 7919) % 100) / 100 * 0.55;
      const ang = golden + jitter;
      const rx = ring * (W / 2) * 0.92;
      const ry = ring * (H / 2) * 0.86;
      return {
        ...n,
        x: cx + rx * Math.cos(ang),
        y: cy + ry * Math.sin(ang),
        degree: deg,
      };
    });

    const posById = Object.fromEntries(positioned.map((n) => [n.id, n]));
    const edges = relationships
      .map((r, i) => {
        const a = posById[r.from];
        const b = posById[r.to];
        if (!a || !b) return null;
        // curved edge
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const nx = -(b.y - a.y);
        const ny = b.x - a.x;
        const len = Math.hypot(nx, ny) || 1;
        const bow = Math.min(34, len * 0.12);
        const qx = mx + (nx / len) * bow * (i % 2 === 0 ? 1 : -1);
        const qy = my + (ny / len) * bow * (i % 2 === 0 ? 1 : -1);
        return { ...r, a, b, qx, qy, key: `e-${i}` };
      })
      .filter(Boolean);

    return { W, H, cx, cy, nodes: positioned, edges, posById };
  }, [relationships, height]);

  const focus = hovered || selected;
  const relatedIds = useMemo(() => {
    if (!focus) return null;
    const set = new Set([focus]);
    relationships.forEach((r) => {
      if (r.from === focus) set.add(r.to);
      if (r.to === focus) set.add(r.from);
    });
    return set;
  }, [focus, relationships]);

  if (!relationships.length) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <Network className="w-8 h-8 mx-auto text-ink-faint mb-3" aria-hidden="true" />
        <p className="text-sm text-ink-secondary">No explicit relationship pairs were mapped for this query.</p>
      </div>
    );
  }

  const relOfFocus = selected ? relationships.filter((r) => r.from === selected || r.to === selected) : [];

  return (
    <div className="glass-deep rounded-3xl overflow-hidden relative">
      {/* header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Network className="w-4 h-4 text-cross-glow" aria-hidden="true" />
          <span className="font-mono text-[0.62rem] font-bold tracking-widest2 uppercase text-sky-100/80">{title}</span>
        </div>
        <span className="font-mono text-[0.58rem] tracking-widest text-sky-200/40 uppercase hidden sm:block">
          Hover to spotlight · Click to pin
        </span>
      </div>

      <svg
        viewBox={`0 0 ${layout.W} ${layout.H}`}
        className="w-full block"
        style={{ height: "auto", maxHeight: height + 40 }}
        role="img"
        aria-label="Relationship network of retrieved knowledge"
      >
        <defs>
          <marker id="kg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="rgba(190,214,232,0.8)" />
          </marker>
          <marker id="kg-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#7FD8D8" />
          </marker>
          <radialGradient id="kg-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3D9FA1" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3D9FA1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient field */}
        <circle cx={layout.cx} cy={layout.cy} r={height * 0.42} fill="url(#kg-core)" />
        {[0.3, 0.55, 0.8].map((f) => (
          <ellipse
            key={f}
            cx={layout.cx}
            cy={layout.cy}
            rx={(layout.W / 2) * f}
            ry={(layout.H / 2) * f}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 7"
          />
        ))}

        {/* edges */}
        {layout.edges.map((e) => {
          const active = !focus || e.from === focus || e.to === focus;
          const color = e.typeMeta.color;
          const conceptual = e.isConceptual;
          return (
            <g key={e.key} opacity={active ? 1 : 0.14} className="transition-opacity duration-500">
              <path
                d={`M ${e.a.x} ${e.a.y} Q ${e.qx} ${e.qy} ${e.b.x} ${e.b.y}`}
                fill="none"
                stroke={focus && active ? color : "rgba(190,214,232,0.45)"}
                strokeWidth={focus && active ? 2.1 : 1.2}
                strokeDasharray={conceptual ? "5 6" : "none"}
                markerEnd={focus && active ? "url(#kg-arrow-active)" : "url(#kg-arrow)"}
                className="kg-edge"
              />
              {/* flowing pulse on active edges */}
              {focus && active && (
                <circle r="2.6" fill={color}>
                  <animateMotion dur="1.6s" repeatCount="indefinite" path={`M ${e.a.x} ${e.a.y} Q ${e.qx} ${e.qy} ${e.b.x} ${e.b.y}`} />
                </circle>
              )}
              <text
                x={e.qx}
                y={e.qy - 7}
                textAnchor="middle"
                className="font-mono"
                fontSize="8.6"
                fontWeight="700"
                letterSpacing="0.8"
                fill={focus && active ? color : "rgba(190,214,232,0.55)"}
              >
                {e.type}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {layout.nodes.map((n) => {
          const dim = focus ? (relatedIds && relatedIds.has(n.id) ? 1 : 0.18) : 1;
          const isFocus = focus === n.id;
          const hub = n.degree >= 2;
          const r = hub ? 15 : 11;
          const accent = hub ? "#7FD8D8" : "#9DB8D6";
          return (
            <g
              key={n.id}
              transform={`translate(${n.x}, ${n.y})`}
              opacity={dim}
              className="cursor-pointer transition-opacity duration-500"
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(selected === n.id ? null : n.id)}
              role="button"
              tabIndex={0}
              aria-label={`Entity ${n.id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(selected === n.id ? null : n.id);
              }}
            >
              {isFocus && <circle r={r + 14} fill="rgba(127,216,216,0.12)" />}
              <circle r={r} fill="#132A40" stroke={accent} strokeWidth={isFocus ? 2.2 : 1.4} />
              <circle r={hub ? 5 : 3.4} fill={accent} />
              {isFocus && <circle r={r + 7} fill="none" stroke={accent} strokeWidth="1" opacity="0.5" className="nexus-core-pulse" />}
              <text
                y={r + 15}
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans',sans-serif"
                fontSize="10.5"
                fontWeight="600"
                fill="#E5EFF7"
              >
                {n.id.length > 26 ? `${n.id.slice(0, 24)}…` : n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* selection detail strip */}
      {selected && relOfFocus.length > 0 && (
        <div className="px-6 pb-5 space-y-2">
          {relOfFocus.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
              <span className="text-xs font-semibold text-sky-50">{r.from}</span>
              <span className="text-cross-glow font-mono text-xs">→</span>
              <span className="text-xs font-semibold text-sky-50">{r.to}</span>
              <span className="chip-rel !bg-white/10 !border-white/20 !text-sky-100/85">{r.type}</span>
              {r.evidenceLabel && <span className={r.evidenceCls}>{r.evidenceLabel}</span>}
              {r.description && <span className="w-full text-[0.68rem] leading-relaxed text-sky-200/65">{r.description}</span>}
            </div>
          ))}
        </div>
      )}

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3.5 border-t border-white/10">
        <span className="font-mono text-[0.55rem] tracking-widest2 uppercase text-sky-200/40 mr-1">Relationship types</span>
        {[
          ["DIRECT SCIENTIFIC RELATIONSHIP", "#9DB8D6", false],
          ["BIOLOGICAL RELATIONSHIP", "#7FC9A8", false],
          ["ASTRONOMICAL RELATIONSHIP", "#8AB8F0", false],
          ["TEXTUAL RELATIONSHIP", "#B9A3E3", false],
          ["CONCEPTUAL RELATIONSHIP", "#D6A87F", true],
          ["CROSS-DOMAIN ANALOGY", "#7FD8D8", true],
          ["INTERPRETATION", "#D6A87F", true],
          ["HYPOTHESIS", "#E8B96F", true],
          ["NO ESTABLISHED RELATIONSHIP", "#8CA0B3", true],
        ].map(([label, color, dashed]) => (
          <span key={label} className="inline-flex items-center gap-1.5 font-mono text-[0.55rem] tracking-wider text-sky-100/60">
            <svg width="18" height="6" aria-hidden="true">
              <line x1="0" y1="3" x2="18" y2="3" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "3 3" : "none"} />
            </svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
