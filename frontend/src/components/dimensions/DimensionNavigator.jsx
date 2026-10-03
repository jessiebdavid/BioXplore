/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * DimensionNavigator — the 1D → 2D → 3D → 4D progression.
 * Frozen definitions; interactive; NOT all dimensions appear
 * active unless the result actually activated them.
 * ============================================================ */

import React, { useState } from "react";
import { DIMENSIONS } from "../../domains.js";

export default function DimensionNavigator({
  activeDimension = null,          // user-selected highlight
  activatedDimensions = null,      // set by an actual result (array of ids)
  onSelect = () => {},
  variant = "dark",                // "dark" glass | "light" glass
  showStates = false,              // show ACTIVATED / DORMANT states (results context)
}) {
  const [hovered, setHovered] = useState(null);
  const isActive = (id) => (activatedDimensions ? activatedDimensions.includes(id) : true);
  const isLit = (id) => (showStates ? isActive(id) : true);
  const focus = hovered || activeDimension;

  const light = variant === "light";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${light ? "glass" : "glass-deep"} p-6 md:p-7`}
      aria-label="Dimension navigator: 1D to 4D progression"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`eyebrow ${light ? "" : "!text-cross-glow"}`}>Dimensional Navigator</span>
        <span className={`font-mono text-[0.6rem] tracking-widest2 uppercase ${light ? "text-ink-muted" : "text-sky-200/50"}`}>
          1D → 4D
        </span>
      </div>

      {/* connecting wave */}
      <svg viewBox="0 0 640 84" className="w-full h-16 mb-1" aria-hidden="true">
        <defs>
          <linearGradient id="dimWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4D7FE8" />
            <stop offset="34%" stopColor="#4DAF83" />
            <stop offset="67%" stopColor="#8D75C7" />
            <stop offset="100%" stopColor="#D99B42" />
          </linearGradient>
        </defs>
        <path
          d="M 24 46 C 96 8, 160 8, 232 46 S 368 84, 440 46 S 568 8, 616 38"
          fill="none"
          stroke="url(#dimWave)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.75"
          className="dim-wave-draw"
        />
        <path
          d="M 24 46 C 96 8, 160 8, 232 46 S 368 84, 440 46 S 568 8, 616 38"
          fill="none"
          stroke="url(#dimWave)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.12"
          className="dim-wave-glow"
        />
      </svg>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 -mt-9">
        {DIMENSIONS.map((dim, i) => {
          const lit = isLit(dim.id);
          const focused = focus === dim.id;
          const selected = activeDimension === dim.id;
          return (
            <button
              key={dim.id}
              type="button"
              onMouseEnter={() => setHovered(dim.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(dim.id)}
              onBlur={() => setHovered(null)}
              onClick={() => onSelect(dim.id)}
              aria-pressed={selected}
              aria-label={`${dim.id} — ${dim.name}. ${dim.desc}`}
              className={`group relative flex flex-col items-center text-center rounded-2xl px-3 pt-9 pb-3 transition-all duration-500 border ${
                selected
                  ? "border-transparent"
                  : light
                  ? "border-white/70 hover:border-white"
                  : "border-white/10 hover:border-white/25"
              } ${lit ? "" : "opacity-45"}`}
              style={{
                background: selected
                  ? `linear-gradient(160deg, ${dim.soft}, transparent)`
                  : "transparent",
                boxShadow: selected ? `0 0 0 1.5px ${dim.accent}55, 0 14px 34px -14px ${dim.accent}66` : "none",
                transitionDelay: `${i * 40}ms`,
              }}
            >
              {/* orb */}
              <span
                className={`relative z-10 grid place-items-center rounded-full font-mono font-bold transition-all duration-500 ${
                  focused || selected ? "scale-110" : ""
                } ${dim.id === "1D" || dim.id === "3D" ? "w-12 h-12 text-sm" : "w-12 h-12 text-sm"} ${
                  light ? "bg-white" : "bg-[#132A40]"
                }`}
                style={{
                  color: dim.accent,
                  border: `1.6px solid ${dim.accent}`,
                  boxShadow: lit ? `0 0 ${focused || selected ? 26 : 14}px ${dim.accent}66, inset 0 0 12px ${dim.accent}22` : "none",
                }}
              >
                {dim.id}
                {lit && (
                  <span
                    className="absolute inset-0 rounded-full nexus-core-pulse"
                    style={{ border: `1px solid ${dim.accent}`, opacity: focused ? 0.8 : 0.35 }}
                    aria-hidden="true"
                  />
                )}
              </span>

              <span
                className={`mt-3 text-[0.78rem] font-bold leading-tight ${
                  light ? "text-ink" : "text-sky-50"
                }`}
              >
                {dim.name}
              </span>

              {/* hover meaning */}
              <span
                className={`grid transition-all duration-500 overflow-hidden ${
                  focused ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
              >
                <span className={`min-h-0 text-[0.62rem] leading-relaxed font-medium ${light ? "text-ink-secondary" : "text-sky-200/70"}`}>
                  {dim.desc}
                </span>
              </span>

              {showStates && (
                <span
                  className="mt-2 font-mono text-[0.55rem] font-bold tracking-widest2"
                  style={{ color: lit ? dim.accent : light ? "#8899A8" : "#7E93A6" }}
                >
                  {lit ? "● ACTIVATED" : "○ DORMANT"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
