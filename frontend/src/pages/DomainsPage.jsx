/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * DomainsPage — three living knowledge environments of equal
 * visual weight, converging back into one system.
 * ============================================================ */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { DOMAINS, setAmbientDomain } from "../domains.js";
import DomainGlyph from "../components/nexus/DomainGlyph.jsx";

/* Domain environment artwork — SVG, one per domain, alive on hover */
function AstroArt() {
  return (
    <svg viewBox="0 0 420 300" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="astroPlanet" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#A9C6FB" />
          <stop offset="45%" stopColor="#4D7FE8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
      </defs>
      {[0.95, 0.72, 0.5].map((f, i) => (
        <ellipse key={i} cx="210" cy="150" rx={170 * f} ry={62 * f} fill="none" stroke="rgba(77,127,232,0.4)" strokeWidth="1.1"
          transform={`rotate(${-18 + i * 14} 210 150)`} className="dom-orbit" style={{ animationDuration: `${16 + i * 9}s`, animationDirection: i % 2 ? "reverse" : "normal" }} />
      ))}
      <circle cx="210" cy="150" r="52" fill="url(#astroPlanet)" />
      <ellipse cx="210" cy="150" rx="86" ry="22" fill="none" stroke="rgba(169,198,251,0.65)" strokeWidth="2" transform="rotate(-18 210 150)" />
      {[[120, 84], [318, 70], [96, 210], [330, 226], [258, 42]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill="#8FB4F2" className="dom-star" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <circle r="4" fill="#BDD4FA">
        <animateMotion dur="11s" repeatCount="indefinite" path="M 210 150 m -170 0 a 170 62 0 1 0 340 0 a 170 62 0 1 0 -340 0" />
      </circle>
    </svg>
  );
}

function BioArt() {
  return (
    <svg viewBox="0 0 420 300" className="w-full h-full" aria-hidden="true">
      {/* DNA helix */}
      <g transform="translate(96 0)">
        {[0, 1].map((s) => (
          <path key={s}
            d={Array.from({ length: 41 }, (_, i) => {
              const v = i / 40;
              const y = 30 + v * 240;
              const x = Math.sin(v * Math.PI * 4 + s * Math.PI) * 30;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            }).join(" ")}
            fill="none" stroke="rgba(77,175,131,0.75)" strokeWidth="2" className="dom-helix" style={{ animationDelay: `${s * -1.2}s` }} />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const v = i / 10;
          const y = 30 + v * 240;
          const x1 = Math.sin(v * Math.PI * 4) * 30;
          return <line key={i} x1={x1} y1={y} x2={-x1} y2={y} stroke="rgba(77,175,131,0.4)" strokeWidth="1.4" className="dom-rung" style={{ animationDelay: `${i * 0.16}s` }} />;
        })}
      </g>
      {/* cells */}
      {[[300, 92, 44], [336, 196, 30], [252, 220, 24]].map(([x, y, r], i) => (
        <g key={i} className="dom-cell" style={{ animationDelay: `${i * 0.9}s` }}>
          <circle cx={x} cy={y} r={r} fill="rgba(77,175,131,0.10)" stroke="rgba(77,175,131,0.55)" strokeWidth="1.4" />
          <circle cx={x - r * 0.25} cy={y - r * 0.2} r={r * 0.34} fill="rgba(77,175,131,0.35)" />
          <circle cx={x + r * 0.3} cy={y + r * 0.28} r={r * 0.16} fill="rgba(77,175,131,0.3)" />
        </g>
      ))}
      <circle r="3" fill="#8FD8B8">
        <animateMotion dur="9s" repeatCount="indefinite" path="M 40 250 C 140 190, 220 120, 380 60" />
      </circle>
    </svg>
  );
}

function TamilArt() {
  return (
    <svg viewBox="0 0 420 300" className="w-full h-full" aria-hidden="true">
      {/* palm-leaf folio */}
      <g transform="rotate(-5 210 160)">
        <rect x="118" y="66" width="184" height="196" rx="12" fill="#FFFDF6" stroke="#D4A359" strokeWidth="1.6" />
        <rect x="118" y="66" width="14" height="196" rx="7" fill="#E8CE9C" opacity="0.8" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="146" y1={92 + i * 20} x2="288" y2={92 + i * 20} stroke="rgba(110,62,28,0.28)" strokeWidth="2.4" strokeLinecap="round" />
        ))}
        <text x="210" y="172" textAnchor="middle" fontFamily="'Noto Sans Tamil','Latha','Nirmala UI',sans-serif" fontSize="64" fontWeight="600" fill="rgba(110,62,28,0.85)">அ</text>
      </g>
      {/* floating glyph motes */}
      {["ழ", "க", "ம்", "ய"].map((g, i) => (
        <text key={g} x={[52, 356, 74, 344][i]} y={[70, 96, 250, 236][i]} textAnchor="middle"
          fontFamily="'Noto Sans Tamil','Latha',sans-serif" fontSize="26" fill="rgba(141,117,199,0.5)"
          className="dom-glyph" style={{ animationDelay: `${i * 0.8}s` }}>
          {g}
        </text>
      ))}
      {/* temple silhouette hint */}
      <path d="M 348 250 L 348 214 L 356 200 L 364 214 L 364 250 Z" fill="rgba(212,163,89,0.5)" />
    </svg>
  );
}

const ART = { astro: AstroArt, bio: BioArt, tamil: TamilArt };

export default function DomainsPage({ onSearch, onSelectDomain, onNavigate }) {
  const [hovered, setHovered] = useState(null);

  const enter = (id) => {
    setHovered(id);
    setAmbientDomain(id);
  };
  const leave = () => {
    setHovered(null);
    setAmbientDomain(null);
  };

  return (
    <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-8 pt-28 md:pt-36 pb-24"
      onMouseLeave={leave}>
      <header className="max-w-3xl">
        <span className="eyebrow">Research Taxonomy</span>
        <h1 className="font-display font-semibold text-ink leading-[1.05] text-4xl sm:text-5xl lg:text-[3.6rem] mt-3">
          Three domains.
          <br />
          <span className="italic font-medium text-cross" style={{ color: "#0E7C7B" }}>One multidimensional system.</span>
        </h1>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-secondary max-w-xl">
          Astronomy, Biology and Classical Tamil Literature carry equal epistemic weight. Enter a field — its visual
          environment activates — then return to the convergence of the Knowledge Core.
        </p>
      </header>

      {/* three environments */}
      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        {DOMAINS.map((dom, i) => {
          const Art = ART[dom.id];
          const active = hovered === dom.id;
          const dimmed = hovered && !active;
          return (
            <motion.article
              key={dom.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => enter(dom.id)}
              onFocus={() => enter(dom.id)}
              onBlur={leave}
              className={`luminous-edge glass rounded-[1.75rem] overflow-hidden relative transition-all duration-700 ${dimmed ? "opacity-75 scale-[0.985]" : ""} ${active ? "shadow-[0_24px_70px_-24px_rgba(23,50,77,0.4)]" : ""}`}
              style={active ? { borderColor: `${dom.accent}66` } : undefined}
              aria-label={`${dom.full} environment`}
            >
              {/* artwork stage */}
              <div className="relative h-56 md:h-64 overflow-hidden" style={{ background: `linear-gradient(165deg, ${dom.accentSoft}, transparent 80%)` }}>
                <div className={`absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? "scale-[1.06]" : "scale-100"}`}>
                  <Art />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-14" style={{ background: "linear-gradient(transparent, rgba(255,255,255,0.75))" }} aria-hidden="true" />
                <span className="absolute top-4 left-5 font-mono text-[0.56rem] tracking-widest2 uppercase rounded-full bg-white/70 border border-white px-2.5 py-1" style={{ color: dom.accent }}>
                  Pillar {["I", "II", "III"][i]}
                </span>
              </div>

              {/* content */}
              <div className="relative p-6 md:p-7 -mt-6">
                <div className="glass rounded-2xl p-5">
                  <h2 className="font-display text-[1.7rem] font-semibold text-ink leading-tight">{dom.full.split(" / ")[0]}</h2>
                  <p className="font-mono text-[0.58rem] tracking-widest2 uppercase mt-1" style={{ color: dom.accent }}>
                    {dom.full.includes(" / ") ? dom.full.split(" / ")[1] : "Literature"}
                  </p>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-secondary">{dom.tagline}</p>

                  <dl className="mt-4 space-y-2 font-mono text-[0.62rem]">
                    <div className="flex gap-2"><dt className="text-ink-muted shrink-0 w-24">SCOPE</dt><dd className="text-ink font-semibold">{dom.scope}</dd></div>
                    <div className="flex gap-2"><dt className="text-ink-muted shrink-0 w-24">FRAMEWORK</dt><dd className="text-ink font-semibold">{dom.framework}</dd></div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {dom.themeTopics.map((t) => (
                      <span key={t} className="font-mono text-[0.56rem] font-semibold tracking-wide rounded-md px-2 py-1 border" style={{ color: dom.accent, background: dom.accentSoft, borderColor: `${dom.accent}33` }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSearch(dom.exampleQuery)}
                      className="group flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-[0.8rem] text-white transition hover:brightness-110"
                      style={{ background: `linear-gradient(120deg, ${dom.accent}, ${dom.accent}CC)` }}
                    >
                      <Sparkles style={{ width: 14, height: 14 }} aria-hidden="true" />
                      Analyze “{dom.exampleQuery}”
                    </button>
                  </div>
                  <button type="button" onClick={() => onSelectDomain(dom.id)} className="mt-2.5 w-full text-center text-[0.74rem] font-semibold text-ink-secondary hover:text-ink transition py-1">
                    Study this domain further
                    <ArrowRight className="inline w-3 h-3 ml-1" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* convergence */}
      <section className="mt-14 glass rounded-3xl p-8 md:p-10 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-2">
          <DomainGlyph id="astro" color="#4D7FE8" size={22} />
          <span className="font-mono text-ink-faint">+</span>
          <DomainGlyph id="bio" color="#4DAF83" size={22} />
          <span className="font-mono text-ink-faint">+</span>
          <DomainGlyph id="tamil" color="#8D75C7" size={22} />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">
          All fields converge into the <span className="italic" style={{ color: "#0E7C7B" }}>Knowledge Core</span>
        </h2>
        <p className="mt-3 text-[0.9rem] text-ink-secondary max-w-xl mx-auto leading-relaxed">
          Cross-domain analysis links structures across fields — always with explicit evidence classes and epistemic
          boundaries. Analogies remain analogies; facts remain facts.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => onSearch("Can biological rhythms be compared conceptually with orbital periods?")}
            className="rounded-full px-6 py-3 font-bold text-[0.85rem] text-white shadow-glow-core transition hover:brightness-110"
            style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 55%, #3D9FA1 100%)" }}
          >
            Run a cross-domain inquiry
          </button>
          <button
            type="button"
            onClick={() => onNavigate("methodology")}
            className="rounded-full px-6 py-3 font-semibold text-[0.85rem] text-ink bg-white/70 border border-white hover:bg-white transition"
          >
            See the method
          </button>
        </div>
      </section>
    </div>
  );
}
