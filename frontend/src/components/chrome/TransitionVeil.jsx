/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * TransitionVeil — the cinematic route transition.
 * A luminous iris of the three domain streams converges into
 * the knowledge core, then the destination unfolds.
 * ============================================================ */

import React from "react";
import { motion } from "framer-motion";

export default function TransitionVeil({ active, label }) {
  return (
    <div className="transition-veil" aria-hidden={!active}>
      <motion.div
        initial={false}
        animate={
          active
            ? { opacity: [0, 1, 1, 0], scale: [0.92, 1, 1.06, 1.12] }
            : { opacity: 0, scale: 1.1 }
        }
        transition={{ duration: 1.05, times: [0, 0.3, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 grid place-items-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 46%, rgba(238,244,245,0) 0%, rgba(238,244,245,0.88) 62%, rgba(234,241,244,0.97) 100%)",
            opacity: 0.9,
          }}
        />
        <svg viewBox="0 0 400 240" className="relative w-[min(420px,70vw)]" style={{ opacity: 0.9 }}>
          {/* three converging streams */}
          {[
            { d: "M 30 60 C 120 60, 160 108, 197 116", c: "#4D7FE8" },
            { d: "M 370 60 C 280 60, 240 108, 203 116", c: "#4DAF83" },
            { d: "M 340 210 C 300 160, 250 130, 205 122", c: "#8D75C7" },
          ].map((s, i) => (
            <g key={i}>
              <path d={s.d} fill="none" stroke={s.c} strokeWidth="2" strokeLinecap="round" opacity="0.75" className="nexus-flow-dash" />
            </g>
          ))}
          {/* core */}
          <circle cx="200" cy="118" r="30" fill="none" stroke="#3D9FA1" strokeWidth="1.4" opacity="0.65" className="nexus-ring-rev" />
          <circle cx="200" cy="118" r="10" fill="#3D9FA1" opacity="0.9" className="nexus-core-breathe" />
          {label && (
            <text x="200" y="176" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="10" letterSpacing="4" fill="#48627A" fontWeight="700">
              {label.toUpperCase()}
            </text>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
