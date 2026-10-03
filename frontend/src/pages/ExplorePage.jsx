/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * ExplorePage — the research instrument.
 * Idle → dimensional loading pathway → structured result.
 * Renders ONLY what the engine actually returns.
 * ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2, CheckCircle2, Compass, GitCompareArrows,
  ShieldAlert, BookMarked, Clock4, Quote, FileText, ArrowRight, XCircle,
} from "lucide-react";
import QueryBar from "../components/explorer/QueryBar.jsx";
import DimensionNavigator from "../components/dimensions/DimensionNavigator.jsx";
import KnowledgeGraph from "../components/graph/KnowledgeGraph.jsx";
import TamilVerseFolio from "../components/tamil/TamilVerseFolio.jsx";
import { DIMENSION_BY_ID } from "../domains.js";

/* ---------------- loading choreography ---------------- */

const PATHWAY_STAGES = [
  { id: "understand", label: "QUERY UNDERSTANDING", desc: "Interpreting input type, intent and entities" },
  { id: "domains", label: "DOMAIN IDENTIFICATION", desc: "Weighing Astronomy, Biology and Classical Tamil" },
  { id: "dimensions", label: "DIMENSION IDENTIFICATION", desc: "Activating 1D–4D tiers" },
  { id: "retrieve", label: "KNOWLEDGE RETRIEVAL", desc: "Gathering facts, verses and evidence" },
  { id: "relationships", label: "RELATIONSHIP ANALYSIS", desc: "Mapping the conceptual topology" },
  { id: "synthesize", label: "SYNTHESIS", desc: "Composing the multidimensional answer" },
];

function LoadingPathway() {
  const [stage, setStage] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    // The engine resolves in ~350ms; the pathway performs at most ~2.1s.
    PATHWAY_STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i + 1), 260 + i * 300));
    });
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <div className="glass rounded-3xl p-8 md:p-10" role="status" aria-label="Analyzing query">
      <div className="flex items-center gap-3 mb-8">
        <Loader2 className="w-4 h-4 animate-spin text-cross" aria-hidden="true" />
        <span className="eyebrow">Knowledge pathway active</span>
      </div>
      <div className="relative max-w-2xl mx-auto">
        {/* vertical conduit */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-ink/10" aria-hidden="true">
          <motion.div
            className="w-full"
            style={{ background: "linear-gradient(#4D7FE8,#4DAF83,#8D75C7,#D99B42)" }}
            initial={{ height: "0%" }}
            animate={{ height: `${(stage / PATHWAY_STAGES.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <ol className="space-y-5">
          {PATHWAY_STAGES.map((st, i) => {
            const done = i < stage;
            const current = i === stage;
            return (
              <li key={st.id} className="relative flex items-start gap-4 pl-0">
                <span
                  className={`relative z-10 grid place-items-center w-8 h-8 rounded-full border-2 shrink-0 transition-all duration-500 ${
                    done ? "bg-cross border-cross text-white" : current ? "bg-white border-cross" : "bg-white/70 border-ink/15 text-ink-faint"
                  }`}
                >
                  {done ? <CheckCircle2 style={{ width: 15, height: 15 }} /> : <span className="font-mono text-[0.6rem] font-bold">{String(i + 1).padStart(2, "0")}</span>}
                  {current && <span className="absolute inset-0 rounded-full border border-cross nexus-core-pulse" aria-hidden="true" />}
                </span>
                <div className={`pt-1 transition-all duration-500 ${done || current ? "opacity-100" : "opacity-40"}`}>
                  <div className="font-mono text-[0.66rem] font-bold tracking-widest2 text-ink">{st.label}</div>
                  <div className="text-[0.74rem] text-ink-secondary mt-0.5">{st.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------------- item renderers ---------------- */

function EvidenceChip({ label, cls }) {
  if (!label) return null;
  return <span className={cls || "chip-evidence"}>{label}</span>;
}

function DefinitionCard({ item, dim }) {
  const d = DIMENSION_BY_ID[dim];
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${d.accent}, transparent)` }} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-ink text-[0.95rem] leading-snug">{item.title}</h4>
        <EvidenceChip label={item.evidenceLabel} cls={item.evidenceCls} />
      </div>
      <p className="mt-2.5 text-[0.86rem] leading-relaxed text-ink-secondary">{item.text}</p>
      {item.formula && <div className="formula-block mt-3.5">{item.formula.replace(/\\\\/g, "\\")}</div>}
    </div>
  );
}

function AnalysisBlock({ item, dim }) {
  const d = DIMENSION_BY_ID[dim];
  return (
    <div className="rounded-2xl p-5 md:p-6 border" style={{ background: d.soft, borderColor: `${d.accent}30` }}>
      {item.title && <h4 className="font-semibold text-ink text-[0.95rem]">{item.title}</h4>}
      <p className={`text-[0.9rem] leading-relaxed text-ink ${item.title ? "mt-2" : ""}`}>{item.text}</p>
      {item.evidenceLabel && (
        <div className="mt-3">
          <EvidenceChip label={item.evidenceLabel} cls={item.evidenceCls} />
        </div>
      )}
    </div>
  );
}

function ComparisonTable({ table }) {
  if (!table) return null;
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ink/8 flex items-center gap-2.5">
        <GitCompareArrows className="w-4 h-4 text-cross" aria-hidden="true" />
        <span className="font-mono text-[0.62rem] font-bold tracking-widest2 text-ink-secondary">COMPARATIVE ANALYSIS</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.82rem]">
          <thead>
            <tr className="border-b border-ink/8">
              {table.columns.map((c) => (
                <th key={c} className="px-5 py-3 font-mono text-[0.6rem] tracking-widest2 uppercase text-ink-secondary font-bold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className="border-b border-ink/5 last:border-b-0 hover:bg-white/50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`px-5 py-3.5 align-top leading-relaxed ${j === 0 ? "font-semibold text-ink" : "text-ink-secondary"}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressionTrack({ item }) {
  return (
    <div className="rounded-2xl border p-5 md:p-6" style={{ background: "rgba(217,155,66,0.08)", borderColor: "rgba(217,155,66,0.35)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Clock4 className="w-4 h-4 text-temporal" aria-hidden="true" />
          <h4 className="font-semibold text-ink text-[0.95rem]">{item.title}</h4>
        </div>
        <EvidenceChip label={item.evidenceLabel} cls={item.evidenceCls} />
      </div>
      {item.text && <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-secondary">{item.text}</p>}
      <ol className="mt-4 space-y-0">
        {item.steps.map((step, i) => (
          <li key={i} className="relative flex gap-4 pb-4 last:pb-0">
            {i < item.steps.length - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-temporal/30" aria-hidden="true" />}
            <span className="relative z-10 grid place-items-center w-7 h-7 rounded-full bg-white border-2 border-temporal/60 font-mono text-[0.6rem] font-bold text-temporal shrink-0">
              T{i + 1}
            </span>
            <p className="pt-1 text-[0.84rem] leading-relaxed text-ink">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- section renderer ---------------- */

function DimensionSection({ section, index }) {
  const d = section.meta;
  const verses = section.items.filter((i) => i.kind === "verse");
  const others = section.items.filter((i) => i.kind !== "verse");

  return (
    <motion.section
      id={`dim-${section.dimension.toLowerCase()}`}
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-3xl p-6 md:p-8 dim-panel scroll-mt-28"
      data-active="true"
    >
      <div className="plane-bar">
        <div>
          <span className="plane-coord" style={{ color: d.accent }}>
            + [DIMENSION {section.dimension}]
          </span>
          <h3 className="plane-title mt-1">{section.title}</h3>
        </div>
        <span className="plane-tag">{d.name.toUpperCase()}</span>
      </div>

      {verses.length > 0 && (
        <div className={`grid gap-4 ${verses.length > 1 ? "lg:grid-cols-2" : ""}`}>
          {verses.map((v, i) => (
            <TamilVerseFolio key={i} verse={v} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {others.map((item, i) => {
          if (item.kind === "definition") return <DefinitionCard key={i} item={item} dim={section.dimension} />;
          if (item.kind === "progression") return <ProgressionTrack key={i} item={item} />;
          if (item.kind === "table") return <ComparisonTable key={i} table={{ columns: item.columns, rows: item.rows }} />;
          return <AnalysisBlock key={i} item={item} dim={section.dimension} />;
        })}
      </div>
    </motion.section>
  );
}

/* ---------------- query understanding ---------------- */

function QueryUnderstanding({ vm }) {
  const q = vm.query;
  const Row = ({ label, children, wide }) => (
    <div className={`rounded-xl bg-white/60 border border-white px-4 py-3.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-mono text-[0.56rem] font-bold tracking-widest2 text-ink-muted block mb-1.5">{label}</span>
      {children}
    </div>
  );

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="plane-bar">
        <div>
          <span className="plane-coord">+ [STAGE 01 // QUERY UNDERSTANDING]</span>
          <h3 className="plane-title mt-1">How the system read your inquiry</h3>
        </div>
        <span className="plane-tag">{q.inputType ? `[INPUT: ${String(q.inputType).toUpperCase()}]` : "[INPUT PARSED]"}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Row label="Detected domain(s)">
          {q.domains.length ? (
            <div className="flex flex-wrap gap-1.5">
              {q.domains.map((d, i) => (
                <span key={d} className={`chip-domain do-${q.domainTokens[i]}`}>{d}</span>
              ))}
            </div>
          ) : (
            <span className="text-[0.8rem] text-ink-muted">—</span>
          )}
        </Row>
        <Row label="Epistemic intent">
          {q.intent ? <span className="text-[0.84rem] font-semibold text-ink font-mono">{q.intent}</span> : <span className="text-[0.8rem] text-ink-muted">—</span>}
        </Row>
        {(q.entities.length > 0) && (
          <Row label="Entities" wide>
            <div className="flex flex-wrap gap-1.5">
              {q.entities.map((e) => (
                <span key={e} className="text-[0.72rem] font-semibold rounded-md bg-astro-soft text-astro-dark border border-astro/25 px-2 py-0.5">{e}</span>
              ))}
            </div>
          </Row>
        )}
        {(q.concepts.length > 0) && (
          <Row label="Concepts" wide>
            <div className="flex flex-wrap gap-1.5">
              {q.concepts.map((c) => (
                <span key={c} className="text-[0.72rem] font-semibold rounded-md bg-tamil-soft text-tamil-dark border border-tamil/25 px-2 py-0.5">{c}</span>
              ))}
            </div>
          </Row>
        )}
      </div>
    </section>
  );
}

/* ---------------- main page ---------------- */

const fade = {
  hidden: { opacity: 0, y: 30 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] } }),
};

export default function ExplorePage({ result, isBusy, error, onSearch, onNewQuery }) {
  const vm = useMemo(() => result, [result]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (vm && scrollRef.current) {
      // bring the result stage into view after transition
      const t = setTimeout(() => scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [vm]);

  return (
    <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8 pt-28 md:pt-36 pb-24">
      {/* instrument header */}
      <header className="mb-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Research Instrument</span>
            <h1 className="font-display font-semibold text-ink text-4xl sm:text-5xl mt-2">Explore</h1>
          </div>
          {vm && (
            <button
              type="button"
              onClick={onNewQuery}
              className="group flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-[0.8rem] text-ink bg-white/75 border border-white shadow-glass-sm hover:bg-white transition"
            >
              New inquiry
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-6">
          <QueryBar onSubmit={onSearch} isBusy={isBusy} size="sm" initialQuery={vm ? vm.queryText : ""} />
        </div>
      </header>

      {/* -------------------- IDLE -------------------- */}
      {!vm && !isBusy && !error && (
        <motion.section variants={fade} initial="hidden" animate="show" custom={0} className="glass rounded-3xl p-8 md:p-12 text-center">
          <Compass className="w-9 h-9 mx-auto text-cross/70" aria-hidden="true" />
          <h2 className="font-display text-3xl text-ink mt-4">The instrument is calibrated</h2>
          <p className="mt-3 text-[0.92rem] text-ink-secondary max-w-lg mx-auto leading-relaxed">
            Enter any topic, keyword, sentence or cross-domain question above. The system will identify the relevant
            domains, activate the meaningful dimensions, and compose a structured, evidence-classified answer.
          </p>
          <div className="mt-8 grid sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {["1D", "2D", "3D", "4D"].map((id) => {
              const d = DIMENSION_BY_ID[id];
              return (
                <div key={id} className="rounded-2xl border p-4 text-left" style={{ background: d.soft, borderColor: `${d.accent}30` }}>
                  <span className="font-mono text-[0.72rem] font-bold" style={{ color: d.accent }}>{id}</span>
                  <div className="text-[0.72rem] font-semibold text-ink mt-1.5 leading-snug">{d.name}</div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* -------------------- LOADING -------------------- */}
      {isBusy && <LoadingPathway />}

      {/* -------------------- ERROR -------------------- */}
      {error && !isBusy && (
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 md:p-10 text-center" role="alert">
          <XCircle className="w-9 h-9 mx-auto text-red-400" aria-hidden="true" />
          <h2 className="font-display text-3xl text-ink mt-4">No knowledge retrieved</h2>
          <p className="mt-3 font-mono text-[0.66rem] tracking-widest2 text-red-500 uppercase">[{error.code}]</p>
          <p className="mt-3 text-[0.9rem] text-ink-secondary max-w-lg mx-auto leading-relaxed">{error.message}</p>
          {error.details && Array.isArray(error.details.suggestedQueries) && error.details.suggestedQueries.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {error.details.suggestedQueries.slice(0, 6).map((q) => (
                <button key={q} type="button" className="query-chip" onClick={() => onSearch(q)}>{q}</button>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* -------------------- RESULT -------------------- */}
      {vm && !isBusy && (
        <div ref={scrollRef} className="space-y-6 scroll-mt-24">
          <QueryUnderstanding vm={vm} />

          {/* activated dimensions */}
          <section className="glass rounded-3xl p-6 md:p-8">
            <div className="plane-bar">
              <div>
                <span className="plane-coord">+ [STAGE 02 // ACTIVATED DIMENSIONS]</span>
                <h3 className="plane-title mt-1">Dimensional activation profile</h3>
              </div>
              <span className="plane-tag">ONLY ACTIVATED TIERS ILLUMINATE</span>
            </div>
            <DimensionNavigator
              variant="dark"
              activatedDimensions={vm.activatedDimensions}
              showStates
              onSelect={(id) => {
                const el = document.getElementById(`dim-${id.toLowerCase()}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </section>

          {/* knowledge sections by dimension */}
          {vm.sections.map((sec, i) => (
            <DimensionSection key={sec.dimension} section={sec} index={i} />
          ))}

          {/* relationship analysis */}
          <motion.section variants={fade} initial="hidden" animate="show" custom={1} className="scroll-mt-24" id="dim-3d-graph">
            <KnowledgeGraph relationships={vm.relationships} height={440} title="Relationship Analysis // Topological Network" />
            {vm.relationships.length > 0 && (
              <div className="glass rounded-3xl mt-4 p-6">
                <span className="eyebrow">Mapped topological edges ({vm.relationships.length})</span>
                <div className="mt-4 space-y-2.5">
                  {vm.relationships.map((rel) => (
                    <div key={rel.id} className="rounded-xl bg-white/55 border border-white px-4 py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] font-semibold text-ink min-w-0">
                        <span>{rel.from}</span>
                        <span className="font-mono text-cross">→</span>
                        <span>{rel.to}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 md:ml-auto">
                        <span className="chip-rel">{rel.type}</span>
                        <EvidenceChip label={rel.evidenceLabel} cls={rel.evidenceCls} />
                      </div>
                      {rel.description && <p className="w-full text-[0.72rem] leading-relaxed text-ink-secondary md:border-t md:border-ink/5 md:pt-2">{rel.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>

          {/* comparison table (dialect A comparison queries) */}
          {vm.comparisonTable && vm.comparisonTable.aspects && (
            <motion.section variants={fade} initial="hidden" animate="show" custom={2} className="glass rounded-3xl p-6 md:p-8">
              <div className="plane-bar">
                <div>
                  <span className="plane-coord">+ [COMPARATIVE PLANE]</span>
                  <h3 className="plane-title mt-1">{String(vm.comparisonTable.A)} vs {String(vm.comparisonTable.B)}</h3>
                </div>
              </div>
              <div className="space-y-3">
                {vm.comparisonTable.aspects.map((a, i) => (
                  <div key={i} className="rounded-xl bg-white/55 border border-white px-4 py-3.5">
                    <div className="font-mono text-[0.6rem] font-bold tracking-widest2 text-ink-muted uppercase">{a.aspect}</div>
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      <div>
                        <span className="font-mono text-[0.56rem] font-bold text-astro">{String(vm.comparisonTable.A).toUpperCase()}</span>
                        <ul className="mt-1 space-y-1">
                          {(a.A || []).map((t, j) => <li key={j} className="text-[0.8rem] text-ink leading-relaxed">{t}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="font-mono text-[0.56rem] font-bold text-cross">{String(vm.comparisonTable.B).toUpperCase()}</span>
                        <ul className="mt-1 space-y-1">
                          {(a.B || []).map((t, j) => <li key={j} className="text-[0.8rem] text-ink leading-relaxed">{t}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* cross-domain + warnings */}
          {(vm.crossDomain || vm.warnings.length > 0) && (
            <motion.section variants={fade} initial="hidden" animate="show" custom={3} className="space-y-4">
              {vm.warnings.map((w, i) => (
                <div key={i} className="epistemic-warning p-5 md:p-6" role="note">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-temporal" aria-hidden="true" />
                    <span className="font-mono text-[0.62rem] font-bold tracking-widest2 text-[#925310] uppercase">Epistemic boundary notice</span>
                  </div>
                  <p className="mt-2.5 text-[0.88rem] leading-relaxed text-ink">{w}</p>
                </div>
              ))}
              {vm.crossDomain && (
                <div className="glass rounded-3xl p-6 md:p-8">
                  <div className="plane-bar">
                    <div>
                      <span className="plane-coord" style={{ color: "#3D9FA1" }}>+ [CROSS-DOMAIN ANALYSIS]</span>
                      <h3 className="plane-title mt-1">Interdisciplinary synthesis</h3>
                    </div>
                    <span className="plane-tag">QUALIFIED · NON-CONFLATABLE</span>
                  </div>
                  {vm.crossDomain.epistemic_warning && (
                    <div className="epistemic-warning p-5 mb-4">
                      <p className="text-[0.86rem] leading-relaxed text-ink">{vm.crossDomain.epistemic_warning}</p>
                    </div>
                  )}
                  {vm.crossDomain.synthesis && (
                    <p className="text-[0.9rem] leading-relaxed text-ink">{vm.crossDomain.synthesis}</p>
                  )}
                </div>
              )}
            </motion.section>
          )}

          {/* final synthesis */}
          {vm.summary && (
            <motion.section variants={fade} initial="hidden" animate="show" custom={4} className="glass-deep rounded-3xl p-7 md:p-10 relative overflow-hidden">
              <div aria-hidden="true" className="absolute -right-20 -top-24 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(61,159,161,0.28), transparent 70%)" }} />
              <div className="relative">
                <div className="flex items-center gap-2.5">
                  <Quote className="w-4 h-4 text-cross-glow" aria-hidden="true" />
                  <span className="font-mono text-[0.62rem] font-bold tracking-widest2 text-sky-100/70 uppercase">Final multidimensional synthesis</span>
                </div>
                <p className="mt-5 font-display text-[1.35rem] md:text-[1.6rem] leading-relaxed text-sky-50 font-medium">{vm.summary}</p>
              </div>
            </motion.section>
          )}

          {/* sources */}
          {vm.sources.length > 0 && (
            <motion.section variants={fade} initial="hidden" animate="show" custom={5} className="glass rounded-3xl p-6 md:p-8">
              <div className="plane-bar">
                <div>
                  <span className="plane-coord">+ [PROVENANCE]</span>
                  <h3 className="plane-title mt-1">Sources &amp; citations</h3>
                </div>
                <span className="plane-tag">GROUNDING CORPUS · {vm.sources.length} REFERENCES</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {vm.sources.map((s, i) => (
                  <div key={s.id} className="rounded-xl bg-white/55 border border-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[0.58rem] font-bold text-ink-muted mt-1">[{String(i + 1).padStart(2, "0")}]</span>
                      <div className="min-w-0">
                        <div className="text-[0.84rem] font-semibold text-ink leading-snug flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ink-muted" aria-hidden="true" />
                          {s.title}
                        </div>
                        <div className="mt-1.5 font-mono text-[0.64rem] text-ink-secondary leading-relaxed">
                          {s.authors && <span>{s.authors}. </span>}
                          {s.year && <span className="font-bold">{s.year}. </span>}
                          {s.publication && <span className="italic">{s.publication}. </span>}
                        </div>
                        {s.doi && <div className="mt-1 font-mono text-[0.6rem] text-cross">DOI: {s.doi}</div>}
                        {s.citation && <div className="mt-1 font-mono text-[0.6rem] text-ink-muted">{s.citation}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {vm.notFound.length > 0 && (
                <div className="mt-5 rounded-xl bg-ink/4 border border-ink/8 px-4 py-3 flex items-start gap-2.5">
                  <BookMarked className="w-3.5 h-3.5 mt-0.5 text-ink-muted shrink-0" aria-hidden="true" />
                  <p className="text-[0.74rem] text-ink-secondary leading-relaxed">
                    <span className="font-mono font-bold">NOT FOUND IN CORPUS: </span>
                    {vm.notFound.join(" · ")}
                  </p>
                </div>
              )}
            </motion.section>
          )}
        </div>
      )}
    </div>
  );
}
