/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * AboutPage — the product's identity. About-first landing.
 * What is this system · what domains it connects · what
 * multidimensional knowledge means · how to explore.
 * ============================================================ */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Telescope, BookOpenText, Dna } from "lucide-react";
import DomainConvergenceNexus from "../components/nexus/DomainConvergenceNexus.jsx";
import QueryBar from "../components/explorer/QueryBar.jsx";
import DimensionNavigator from "../components/dimensions/DimensionNavigator.jsx";
import { DOMAINS, DIMENSIONS } from "../domains.js";

const rise = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: (i) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.08 * i, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function AboutPage({ onSearch, isBusy, onNavigate, onSelectDomain, onOpenGraph }) {
  const [selectedDim, setSelectedDim] = useState("3D");

  return (
    <div className="relative z-10 mx-auto max-w-[1500px] px-4 sm:px-8 pt-28 md:pt-36 pb-24">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="max-w-3xl">
          <motion.div variants={rise} initial="hidden" animate="show" custom={0} className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 eyebrow bg-white/60 border border-white/90 rounded-full px-3.5 py-1.5 shadow-glass-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cross animate-pulse" aria-hidden="true" />
              Research Knowledge Engine
            </span>
            <span className="hidden sm:inline font-mono text-[0.6rem] tracking-widest2 text-ink-muted uppercase">Est. dimensions 1D–4D</span>
          </motion.div>

          <motion.h1
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-display font-semibold text-ink leading-[1.04] tracking-tight text-[2.9rem] sm:text-6xl lg:text-[4.6rem]"
          >
            Multidimensional
            <br />
            <span className="italic font-medium bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(100deg,#16557A 0%,#0E7C7B 45%,#3D9FA1 78%)" }}>
              Knowledge
            </span>
          </motion.h1>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-6 max-w-xl text-[0.95rem] md:text-base leading-relaxed text-ink-secondary"
          >
            Connect textual, contextual, conceptual and temporal knowledge across Astronomy, Biology and Classical Tamil
            Literature — one scientific system that thinks across domains and dimensions.
          </motion.p>

          {/* dimension ladder */}
          <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2">
            {DIMENSIONS.map((d, i) => (
              <React.Fragment key={d.id}>
                {i > 0 && <span className="font-mono text-ink-faint text-xs px-0.5" aria-hidden="true">→</span>}
                <span
                  className="inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.66rem] font-bold tracking-wider"
                  style={{ background: d.soft, color: d.accent, border: `1px solid ${d.accent}33` }}
                >
                  {d.id}
                  <span className="font-sans font-semibold text-ink-secondary hidden sm:inline">{d.name.split(" / ")[0]}</span>
                </span>
              </React.Fragment>
            ))}
          </motion.div>

          {/* CTA row */}
          <motion.div variants={rise} initial="hidden" animate="show" custom={4} className="mt-9 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate("explore")}
              className="group flex items-center gap-2.5 rounded-full px-6 py-3.5 font-bold text-[0.9rem] text-white shadow-glow-core transition-all duration-300 hover:brightness-110"
              style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 55%, #3D9FA1 100%)" }}
            >
              Enter the Observatory
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("methodology")}
              className="rounded-full px-6 py-3.5 font-semibold text-[0.9rem] text-ink bg-white/70 border border-white shadow-glass-sm hover:bg-white transition"
            >
              How the system thinks
            </button>
          </motion.div>
        </div>

        {/* ================= CONVERGENCE CENTERPIECE ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-[-1rem] lg:-mt-40 lg:ml-auto lg:w-[62%] pointer-events-auto"
        >
          <DomainConvergenceNexus
            onSelectDomain={onSelectDomain}
            compact
            onOpenGraph={onOpenGraph}
          />
          <p className="text-center mt-1 font-mono text-[0.6rem] tracking-widest2 uppercase text-ink-muted">
            Three domains · One knowledge system · Four dimensions
          </p>
        </motion.div>
      </section>

      {/* ================= QUERY INSTRUMENT ================= */}
      <motion.section
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        custom={0}
        className="mt-16 md:mt-20 max-w-3xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <Telescope className="w-4 h-4 text-cross" aria-hidden="true" />
          <h2 className="font-display text-2xl md:text-[1.7rem] font-semibold text-ink">Begin a research inquiry</h2>
        </div>
        <QueryBar onSubmit={onSearch} isBusy={isBusy} size="lg" />
      </motion.section>

      {/* ================= THREE DOMAINS STRIP ================= */}
      <motion.section
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        custom={1}
        className="mt-16"
      >
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <span className="eyebrow">Knowledge Domains</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mt-1.5">Three equal fields of inquiry</h2>
          </div>
          <button type="button" onClick={() => onNavigate("domains")} className="group nav-link !text-[0.8rem]" >
            Explore all domains
            <ArrowRight className="inline w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {DOMAINS.map((dom, i) => (
            <motion.button
              key={dom.id}
              type="button"
              onClick={() => onSelectDomain(dom.id)}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="luminous-edge glass rounded-3xl p-6 text-left group relative overflow-hidden"
              onMouseEnter={() => dom && window.dispatchEvent(new CustomEvent("mks:domain", { detail: { domain: dom.id } }))}
              onMouseLeave={() => window.dispatchEvent(new CustomEvent("mks:domain", { detail: { domain: "none" } }))}
            >
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle, ${dom.accentSoft}, transparent 70%)` }}
              />
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-11 h-11 rounded-2xl border" style={{ background: dom.accentSoft, borderColor: `${dom.accent}44`, color: dom.accent }}>
                  {dom.id === "astro" ? <Telescope style={{ width: 19, height: 19 }} /> : dom.id === "bio" ? <Dna style={{ width: 19, height: 19 }} /> : <BookOpenText style={{ width: 19, height: 19 }} />}
                </span>
                <span className="font-mono text-[0.58rem] tracking-widest2 uppercase" style={{ color: dom.accent }}>
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{dom.name}</h3>
              <p className="font-mono text-[0.6rem] tracking-widest2 uppercase mt-1" style={{ color: dom.accent }}>
                {dom.full.replace(`${dom.name} / `, "")}
              </p>
              <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-secondary">{dom.tagline}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-ink">
                Investigate
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ================= DIMENSION NAVIGATOR ================= */}
      <motion.section
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        custom={2}
        className="mt-16 grid lg:grid-cols-[1.15fr_1fr] gap-6 items-stretch"
      >
        <div>
          <span className="eyebrow">The Dimensional Method</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink mt-1.5 leading-tight">
            Every inquiry deepens through four dimensions
          </h2>
          <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-secondary max-w-xl">
            The system reads a query literally (1D), situates it in context (2D), maps its concepts and relationships (3D),
            and projects its temporal and hypothetical horizons (4D). Select a dimension to trace its meaning.
          </p>
          <div className="mt-6 glass rounded-2xl p-5 max-w-xl">
            <span className="font-mono text-[0.62rem] font-bold tracking-widest2" style={{ color: DIMENSIONS.find((d) => d.id === selectedDim).accent }}>
              {selectedDim} — {DIMENSIONS.find((d) => d.id === selectedDim).name.toUpperCase()}
            </span>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-ink">
              {DIMENSIONS.find((d) => d.id === selectedDim).desc}
            </p>
          </div>
        </div>
        <DimensionNavigator
          variant="dark"
          activeDimension={selectedDim}
          onSelect={(id) => setSelectedDim(id)}
        />
      </motion.section>

      {/* ================= GRAPH INVITATION ================= */}
      <motion.section
        variants={rise}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        custom={3}
        className="mt-16 glass rounded-3xl p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between relative overflow-hidden"
      >
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(60% 90% at 80% 40%, rgba(61,159,161,0.2), transparent 70%)" }} />
        <div className="relative max-w-2xl">
          <span className="eyebrow">Relationship Analysis</span>
          <h2 className="font-display text-3xl font-semibold text-ink mt-1.5">Knowledge, mapped as a living graph</h2>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-secondary">
            Entities and relationships retrieved by the engine are rendered as a navigable network — with frozen
            relationship types, evidence classes, and clear epistemic boundaries between scientific fact and conceptual analogy.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenGraph}
          className="group relative shrink-0 flex items-center gap-2.5 rounded-full px-6 py-3.5 font-bold text-[0.88rem] text-white shadow-glow-core transition hover:brightness-110"
          style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 55%, #3D9FA1 100%)" }}
        >
          Open the Knowledge Graph
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </motion.section>
    </div>
  );
}
