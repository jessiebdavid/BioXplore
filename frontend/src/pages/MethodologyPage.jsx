/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * MethodologyPage — how the system processes knowledge.
 * The 10 canonical stages + epistemic separation principles.
 * Stage copy mirrors the backend pipeline (no invented abilities).
 * ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldAlert, Scale, Landmark, Tags } from "lucide-react";

const STAGES = [
  { n: "01", name: "Natural Language Input", desc: "The researcher enters any topic, keyword, concept, sentence, question or cross-domain query.", accent: "#4D7FE8" },
  { n: "02", name: "Query Understanding", desc: "The system parses input type, epistemic intent, entities and concepts.", accent: "#4D7FE8" },
  { n: "03", name: "Domain Identification", desc: "Relevance is computed across Astronomy, Biology and Classical Tamil Literature.", accent: "#4D7FE8" },
  { n: "04", name: "Entity / Concept Extraction", desc: "Recognized entities and conceptual markers are structured from the query.", accent: "#4DAF83" },
  { n: "05", name: "Dimension Identification", desc: "The 1D–4D tiers are evaluated; only meaningful dimensions are activated.", accent: "#4DAF83" },
  { n: "06", name: "Knowledge Retrieval", desc: "Facts, formulas, classical verses and textual evidence are retrieved from the corpus.", accent: "#4DAF83" },
  { n: "07", name: "Relationship Analysis", desc: "Entities are linked into a typed topological network of relationships.", accent: "#8D75C7" },
  { n: "08", name: "Cross-Domain Analysis", desc: "Bridges across domains are examined — always as qualified analogies, never conflated causality.", accent: "#8D75C7" },
  { n: "09", name: "Evidence Classification", desc: "Every assertion carries an explicit evidence class, from established fact to hypothesis.", accent: "#D99B42" },
  { n: "10", name: "Result", desc: "The multidimensional answer is composed with full provenance and epistemic boundaries.", accent: "#D99B42" },
];

const RULES = [
  {
    icon: Scale,
    tag: "RULE 01 · CATEGORIAL DEMARCATION",
    title: "Scale & physical demarcation",
    body: "Astrophysical models and biological rhythms belong to distinct physical scales. Shared mathematical patterns — such as oscillation — are treated as structural isomorphisms, never as direct causal links.",
  },
  {
    icon: Landmark,
    tag: "RULE 02 · HISTORICAL INTEGRITY",
    title: "Philological & hermeneutic grounding",
    body: "Classical Tamil verses are read with philological integrity within their own civilizational context. Ancient poetic insight is honored as ethical and ecological wisdom — it is never retrofitted with modern physics claims.",
  },
  {
    icon: Tags,
    tag: "RULE 03 · EVIDENCE TYPING TRANSPARENCY",
    title: "Strict epistemic classification",
    body: "Conceptual relationships are not scientific evidence. Cross-domain analogies remain clearly qualified. Every relationship in the graph carries one of six explicit evidence classes.",
  },
];

const EVIDENCE_TAXONOMY = [
  { label: "ESTABLISHED FACT", cls: "ev-fact", note: "Directly established scientific knowledge" },
  { label: "OBSERVATIONAL EVIDENCE", cls: "ev-observation", note: "Grounded in empirical observation" },
  { label: "RETRIEVED TEXTUAL EVIDENCE", cls: "ev-textual", note: "Drawn from the classical corpus" },
  { label: "SCIENTIFIC INTERPRETATION", cls: "ev-interpretation", note: "Interpretation within a scientific framework" },
  { label: "CONCEPTUAL ANALOGY", cls: "ev-analogy", note: "Qualified cross-domain resonance — not proof" },
  { label: "HYPOTHESIS/SPECULATION", cls: "ev-hypothesis", note: "Explicitly tentative or hypothetical" },
];

function StageRow({ stage, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const fromLeft = i % 2 === 0;

  return (
    <li ref={ref} className="relative flex items-stretch gap-0">
      {/* node on the spine */}
      <div className="relative w-16 md:w-24 shrink-0 flex justify-center">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 200, damping: 18 }}
          className="relative z-10 grid place-items-center w-9 h-9 rounded-full bg-white font-mono text-[0.62rem] font-bold border-2 shadow-glass-sm"
          style={{ color: stage.accent, borderColor: stage.accent }}
        >
          {stage.n}
          <span className="absolute inset-0 rounded-full" style={{ border: `1px solid ${stage.accent}`, animation: "nexusPulse 3.2s ease-in-out infinite", animationDelay: `${i * 0.25}s` }} aria-hidden="true" />
        </motion.span>
        {/* connector to card */}
        <motion.span
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
          className={`absolute top-1/2 w-8 md:w-12 h-px ${fromLeft ? "left-1/2" : "right-1/2"}`}
          style={{ background: `linear-gradient(${fromLeft ? "90deg" : "270deg"}, ${stage.accent}66, transparent)`, transformOrigin: fromLeft ? "left" : "right" }}
          aria-hidden="true"
        />
      </div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, x: fromLeft ? 30 : -30, filter: "blur(4px)" }}
        animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-2xl px-5 py-4 mb-5 flex-1 relative overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-1" style={{ background: stage.accent, opacity: 0.5 }} aria-hidden="true" />
        <h3 className="font-semibold text-ink text-[0.95rem]">
          <span className="font-mono text-[0.6rem] tracking-widest2 mr-2" style={{ color: stage.accent }}>STAGE {stage.n}</span>
          {stage.name}
        </h3>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">{stage.desc}</p>
      </motion.div>
    </li>
  );
}

export default function MethodologyPage({ onNavigate }) {
  const spineRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!spineRef.current) return;
      const r = spineRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height;
      const passed = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
      setProgress((passed / total) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8 pt-28 md:pt-36 pb-24">
      <header className="max-w-3xl">
        <span className="eyebrow">System Architecture</span>
        <h1 className="font-display font-semibold text-ink leading-[1.05] text-4xl sm:text-5xl lg:text-[3.6rem] mt-3">
          Methodology &amp; <span className="italic font-medium" style={{ color: "#0E7C7B" }}>epistemic protocol</span>
        </h1>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-secondary max-w-xl">
          How a plain-language inquiry becomes a structured, evidence-classified multidimensional answer — through ten
          stages and three strict principles of epistemic separation.
        </p>
      </header>

      {/* pipeline */}
      <section className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="eyebrow">The Processing Pipeline</span>
          <span className="flex-1 h-px bg-ink/10" aria-hidden="true" />
          <span className="font-mono text-[0.6rem] tracking-widest2 text-ink-muted">10 STAGES</span>
        </div>

        <div ref={spineRef} className="relative">
          {/* spine with scroll-driven fill */}
          <div className="absolute left-8 md:left-12 top-2 bottom-2 w-px bg-ink/10" aria-hidden="true">
            <div
              className="w-full transition-[height] duration-200"
              style={{ height: `${progress}%`, background: "linear-gradient(180deg,#4D7FE8,#4DAF83,#8D75C7,#D99B42)" }}
            />
          </div>
          <ol className="relative">
            {STAGES.map((st, i) => (
              <StageRow key={st.n} stage={st} i={i} />
            ))}
          </ol>
        </div>
      </section>

      {/* principles */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="eyebrow">Anti-Conflation Principles</span>
          <span className="flex-1 h-px bg-ink/10" aria-hidden="true" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {RULES.map((r, i) => (
            <motion.article
              key={r.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="luminous-edge glass rounded-3xl p-6"
            >
              <r.icon className="w-5 h-5 text-cross" aria-hidden="true" />
              <span className="block mt-4 font-mono text-[0.58rem] font-bold tracking-widest2 text-temporal">{r.tag}</span>
              <h3 className="mt-1.5 font-display text-xl font-semibold text-ink">{r.title}</h3>
              <p className="mt-2.5 text-[0.82rem] leading-relaxed text-ink-secondary">{r.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* evidence taxonomy */}
      <section className="mt-12 glass rounded-3xl p-7 md:p-9">
        <div className="flex items-center gap-2.5 mb-2">
          <ShieldAlert className="w-4 h-4 text-temporal" aria-hidden="true" />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">The evidence taxonomy</h2>
        </div>
        <p className="text-[0.88rem] text-ink-secondary max-w-2xl leading-relaxed">
          Every retrieved statement carries exactly one of six evidence classes. The visual language of the system
          keeps scientific fact, textual evidence, interpretation, analogy and hypothesis permanently distinguishable.
        </p>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EVIDENCE_TAXONOMY.map((ev) => (
            <div key={ev.label} className="rounded-xl bg-white/55 border border-white px-4 py-3.5">
              <span className={`chip-evidence ${ev.cls}`}>{ev.label}</span>
              <p className="mt-2 text-[0.74rem] text-ink-secondary leading-relaxed">{ev.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 text-center glass rounded-3xl p-9">
        <h2 className="font-display text-3xl font-semibold text-ink">See the protocol in motion</h2>
        <p className="mt-2.5 text-[0.9rem] text-ink-secondary">Run an inquiry and watch the ten stages structure the answer.</p>
        <button
          type="button"
          onClick={() => onNavigate("explore")}
          className="mt-6 rounded-full px-7 py-3.5 font-bold text-[0.9rem] text-white shadow-glow-core transition hover:brightness-110"
          style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 55%, #3D9FA1 100%)" }}
        >
          Enter the Explorer
        </button>
      </section>
    </div>
  );
}
