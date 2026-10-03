/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * DomainConvergenceNexus — the major visual centerpiece.
 *
 * Three living domain structures (Astronomy orbital system,
 * Biology helix + cell, Classical Tamil manuscript glyph)
 * flow along animated paths into one KNOWLEDGE CORE, from
 * which the four dimensional strands radiate (1D→2D→3D→4D).
 * Pure SVG + CSS animation. Nodes respond to hover.
 * ============================================================ */

import React from "react";
import { DOMAINS, DIMENSIONS } from "../../domains.js";

function DomainGlyph({ id }) {
  if (id === "astro") {
    return (
      <g>
        <circle cx="0" cy="0" r="20" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        <ellipse cx="0" cy="0" rx="30" ry="11" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-22)" opacity="0.75" />
        <circle cx="0" cy="0" r="7.5" fill="currentColor" opacity="0.9" />
        <circle cx="27" cy="-9" r="2.6" fill="currentColor" />
        <circle cx="-24" cy="12" r="1.8" fill="currentColor" opacity="0.8" />
      </g>
    );
  }
  if (id === "bio") {
    return (
      <g>
        <circle cx="0" cy="0" r="20" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
        <circle cx="0" cy="0" r="6.5" fill="currentColor" opacity="0.9" />
        <circle cx="-8" cy="-6" r="3" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.9" />
        <circle cx="8" cy="7" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
        <path d="M -4 -20 Q 4 -10 -4 0 Q -12 10 -4 20" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
        <path d="M 6 -20 Q -2 -10 6 0 Q 14 10 6 20" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
        <line x1="-1" y1="-14" x2="4" y2="-14" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <line x1="-3" y1="-4" x2="2" y2="-4" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        <line x1="-1" y1="6" x2="4" y2="6" stroke="currentColor" strokeWidth="1.2" opacity="0.8" />
        <line x1="-3" y1="15" x2="2" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      </g>
    );
  }
  return (
    <g>
      <path d="M -22 -14 L 22 -14" stroke="#D4A359" strokeWidth="1.4" opacity="0.8" />
      <path d="M -20 16 L 20 16" stroke="#D4A359" strokeWidth="1.4" opacity="0.8" />
      <path d="M -16 -8 L 16 -8 L 16 10 L -16 10 Z" fill="#FFFDF6" stroke="#D4A359" strokeWidth="1" transform="rotate(-4)" />
      <text x="0" y="6" textAnchor="middle" fontFamily="'Noto Sans Tamil','Latha','Nirmala UI',sans-serif" fontSize="16" fontWeight="600" fill="currentColor" transform="rotate(-4)">
        அ
      </text>
      <path d="M -12 -3.5 L 12 -3.5" stroke="currentColor" strokeWidth="0.8" opacity="0.4" transform="rotate(-4)" />
      <path d="M -12 3 L 10 3" stroke="currentColor" strokeWidth="0.8" opacity="0.4" transform="rotate(-4)" />
    </g>
  );
}

/**
 * Flows: three streams from domain glyphs into the Knowledge Core,
 * with flowing dashes; the Core breathes; four dimension spokes
 * radiate below as the dimensional expansion.
 */
export default function DomainConvergenceNexus({ onSelectDomain, compact = false, activeDomain = null }) {
  const W = 960;
  const H = compact ? 430 : 500;
  const CX = W / 2;
  const CY = compact ? 200 : 225;

  const anchors = {
    astro: { x: CX - 330, y: CY - 108 },
    bio: { x: CX + 330, y: CY - 108 },
    tamil: { x: CX + 288, y: CY + 122 },
  };

  const paths = {
    astro: `M ${anchors.astro.x + 52} ${anchors.astro.y + 26} C ${CX - 210} ${CY - 84}, ${CX - 140} ${CY - 44}, ${CX - 58} ${CY - 8}`,
    bio: `M ${anchors.bio.x - 52} ${anchors.bio.y + 26} C ${CX + 210} ${CY - 84}, ${CX + 140} ${CY - 44}, ${CX + 58} ${CY - 8}`,
    tamil: `M ${anchors.tamil.x - 56} ${anchors.tamil.y - 30} C ${CX + 190} ${CY + 92}, ${CX + 120} ${CY + 46}, ${CX + 52} ${CY + 10}`,
  };

  const spokes = DIMENSIONS.map((d, i) => {
    const spread = (i - 1.5) * 78;
    const x2 = CX + spread;
    const y2 = CY + (compact ? 158 : 178);
    return { d, x1: CX, y1: CY + 46, x2, y2 };
  });

  return (
    <div className={`relative w-full mx-auto ${compact ? "max-w-[760px]" : "max-w-[980px]"} select-none`} aria-label="Three domains converging into the Knowledge Core">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" role="img">
        <defs>
          <radialGradient id="nexusCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3D9FA1" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#4D7FE8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4D7FE8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nexusFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4D7FE8" />
            <stop offset="50%" stopColor="#3D9FA1" />
            <stop offset="100%" stopColor="#8D75C7" />
          </linearGradient>
          <linearGradient id="nexusSpoke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3D9FA1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3D9FA1" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* aura */}
        <circle cx={CX} cy={CY} r="150" fill="url(#nexusCoreGlow)" className="nexus-aura" />

        {/* domain streams */}
        {Object.entries(paths).map(([id, d]) => {
          const dom = DOMAINS.find((x) => x.id === id);
          const isActive = activeDomain === id;
          return (
            <g key={id} className="nexus-stream" style={{ ["--stream-accent"]: dom.accent }}>
              <path d={d} fill="none" stroke={dom.accent} strokeOpacity={isActive ? 0.85 : 0.5} strokeWidth="1.6" className="nexus-flow-line" />
              <path d={d} fill="none" stroke={dom.accent} strokeOpacity="0.9" strokeWidth="2.4" strokeDasharray="1.5 14" strokeLinecap="round" className="nexus-flow-dash" />
            </g>
          );
        })}

        {/* domain glyphs */}
        {DOMAINS.map((dom) => {
          const a = anchors[dom.id];
          const isActive = activeDomain === dom.id;
          return (
            <g
              key={dom.id}
              transform={`translate(${a.x}, ${a.y})`}
              className="nexus-node cursor-pointer"
              onClick={() => onSelectDomain && onSelectDomain(dom.id)}
              role="button"
              tabIndex={0}
              aria-label={`Explore ${dom.full}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectDomain && onSelectDomain(dom.id);
              }}
              style={{ color: dom.accent }}
            >
              <circle r="46" fill={dom.accentSoft} stroke={dom.accent} strokeOpacity={isActive ? 0.85 : 0.4} strokeWidth="1.2" className="nexus-node-halo" />
              <g className="nexus-node-art">
                <DomainGlyph id={dom.id} />
              </g>
              <text y="66" textAnchor="middle" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" fontSize="13.5" fill="#17324D">
                {dom.name}
              </text>
              <text y="82" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" letterSpacing="1.6" fill={dom.accent}>
                {dom.full.split(" / ")[1] ? dom.full.split(" / ")[1].toUpperCase() : "LITERATURE"}
              </text>
            </g>
          );
        })}

        {/* KNOWLEDGE CORE */}
        <g transform={`translate(${CX}, ${CY})`} className="nexus-core">
          <circle r="92" fill="none" stroke="#3D9FA1" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 6" className="nexus-ring-slow" />
          <circle r="74" fill="none" stroke="#4D7FE8" strokeOpacity="0.3" strokeWidth="1.1" className="nexus-ring-rev" />
          <circle r="56" fill="rgba(255,255,255,0.55)" stroke="#3D9FA1" strokeOpacity="0.55" strokeWidth="1.4" className="nexus-core-breathe" />
          <circle r="30" fill="none" stroke="#3D9FA1" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="5 4" className="nexus-ring-rev" />
          <circle r="10" fill="#3D9FA1" className="nexus-core-dot" />
          <circle r="20" fill="none" stroke="#3D9FA1" strokeOpacity="0.35" strokeWidth="1" className="nexus-core-pulse" />
          <text y="-14" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9.5" letterSpacing="2.4" fill="#0e6f73" fontWeight="700">
            KNOWLEDGE
          </text>
          <text y="26" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontSize="24" fill="#17324D">
            Core
          </text>
        </g>

        {/* dimensional spokes */}
        {spokes.map(({ d, x1, y1, x2, y2 }, i) => (
          <g key={d.id} className="nexus-spoke">
            <path
              d={`M ${x1} ${y1} C ${x1 + (x2 - x1) * 0.25} ${y1 + 34}, ${x2 - (x2 - x1) * 0.2} ${y2 - 26}, ${x2} ${y2}`}
              fill="none"
              stroke={d.accent}
              strokeOpacity="0.4"
              strokeWidth="1.3"
              strokeDasharray="3 7"
              strokeLinecap="round"
              className="nexus-spoke-line"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
            <circle cx={x2} cy={y2} r="5" fill={d.accent} opacity="0.75" />
            <text x={x2} y={y2 + 22} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="700" fontSize="11" fill={d.accent}>
              {d.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
