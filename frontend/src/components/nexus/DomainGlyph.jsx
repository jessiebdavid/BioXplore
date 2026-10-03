/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * DomainGlyph — compact identity glyphs for the three domains.
 * ============================================================ */

import React from "react";

export default function DomainGlyph({ id, color = "#3D9FA1", size = 24 }) {
  const s = { width: size, height: size, color };
  if (id === "astro") {
    return (
      <svg viewBox="0 0 32 32" style={s} aria-hidden="true">
        <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-22 16 16)" />
        <circle cx="16" cy="16" r="3.4" fill="currentColor" />
        <circle cx="28" cy="10" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  if (id === "bio") {
    return (
      <svg viewBox="0 0 32 32" style={s} aria-hidden="true">
        <path d="M 11 3 Q 17 10 11 16 Q 5 22 11 29" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M 21 3 Q 15 10 21 16 Q 27 22 21 29" fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
        <line x1="12" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.4" />
        <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="1.4" />
        <line x1="12" y1="23" x2="20" y2="23" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" style={s} aria-hidden="true">
      <rect x="6" y="6" width="20" height="20" rx="3.5" fill="none" stroke="#D4A359" strokeWidth="1.4" transform="rotate(-4 16 16)" />
      <text x="16" y="21.5" textAnchor="middle" fontFamily="'Noto Sans Tamil','Latha','Nirmala UI',sans-serif" fontSize="13" fontWeight="600" fill="currentColor" transform="rotate(-4 16 16)">
        அ
      </text>
    </svg>
  );
}
