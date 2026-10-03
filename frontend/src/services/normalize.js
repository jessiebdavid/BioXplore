/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Result normalization — adapts BOTH payload dialects to one
 * canonical view model without altering semantics.
 *
 * Dialect A (mock engine / legacy renderer):
 *   { query, answer: { summary, sections[{dimension,title,items}], relationships,
 *                      comparison_table? }, sources, warnings, not_found }
 *   items: { type: definition|tamil_verse|comparison_table|temporal_progression|
 *                  contextual_analysis|concept_overview|bridge_description, ... }
 *   relationships: { from_entity, to_entity, relationship_type, evidence_label, domains, description }
 *
 * Dialect B (live Part-A backend M8 envelope):
 *   relationships: { source_entity, target_entity, relation, description, is_conceptual }
 *   items: { content, evidence_label, source }
 *
 * NOTHING here fabricates values — it only relabels existing fields.
 * ============================================================ */

const DIMENSION_META = {
  "1D": { id: "1D", name: "Text / Literal", glyph: "T", accent: "#4D7FE8", accentSoft: "rgba(77,127,232,0.12)", desc: "Direct facts, definitions, equations, measurements, original Tamil text, literal meaning and translation." },
  "2D": { id: "2D", name: "Interpretation / Context", glyph: "C", accent: "#4DAF83", accentSoft: "rgba(77,175,131,0.12)", desc: "Physical, biological or literary context, mechanisms, conditions and meaning." },
  "3D": { id: "3D", name: "Symbol / Concept / Relationship", glyph: "R", accent: "#8D75C7", accentSoft: "rgba(141,117,199,0.12)", desc: "Entities, concepts, relationships, cause-effect links and conceptual connections." },
  "4D": { id: "4D", name: "Future / Hypothetical / Temporal", glyph: "H", accent: "#D99B42", accentSoft: "rgba(217,155,66,0.14)", desc: "Change over time, progression, evolution, future scenarios, hypotheses and analogies." },
};

const DIMENSION_ORDER = ["1D", "2D", "3D", "4D"];

/** Relationship type → visual class (labels preserved verbatim). */
const RELATION_CLASS = {
  "DIRECT SCIENTIFIC RELATIONSHIP": { cls: "rel-direct", color: "#4D7FE8", dashed: false },
  "BIOLOGICAL RELATIONSHIP": { cls: "rel-bio", color: "#4DAF83", dashed: false },
  "ASTRONOMICAL RELATIONSHIP": { cls: "rel-astro", color: "#38BDF8", dashed: false },
  "TEXTUAL RELATIONSHIP": { cls: "rel-textual", color: "#8D75C7", dashed: false },
  "CONCEPTUAL RELATIONSHIP": { cls: "rel-concept", color: "#B4764A", dashed: true },
  "CROSS-DOMAIN ANALOGY": { cls: "rel-analogy", color: "#3D9FA1", dashed: true },
  "INTERPRETATION": { cls: "rel-interpretation", color: "#B4764A", dashed: true },
  "HYPOTHESIS": { cls: "rel-hypothesis", color: "#D99B42", dashed: true },
  "NO ESTABLISHED RELATIONSHIP": { cls: "rel-none", color: "#8899A8", dashed: true },
};

/** Evidence label → chip class (labels preserved verbatim). */
const EVIDENCE_CLASS = {
  "ESTABLISHED FACT": "ev-fact",
  "OBSERVATIONAL EVIDENCE": "ev-observation",
  "RETRIEVED TEXTUAL EVIDENCE": "ev-textual",
  "SCIENTIFIC INTERPRETATION": "ev-interpretation",
  "CONCEPTUAL ANALOGY": "ev-analogy",
  "HYPOTHESIS/SPECULATION": "ev-hypothesis",
  "HYPOTHESIS / SPECULATION": "ev-hypothesis",
  FACT: "ev-fact",
  EVIDENCE: "ev-observation",
  INTERPRETATION: "ev-interpretation",
  ANALOGY: "ev-analogy",
  HYPOTHESIS: "ev-hypothesis",
};

function evidenceClass(label) {
  if (!label) return "chip-evidence";
  return `chip-evidence ${EVIDENCE_CLASS[String(label).trim().toUpperCase()] || ""}`.trim();
}

function relationMeta(type) {
  if (!type) return { cls: "", color: "#8899A8", dashed: false };
  return RELATION_CLASS[String(type).trim().toUpperCase()] || { cls: "", color: "#8899A8", dashed: false };
}

/** Domain name → token. */
function domainToken(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("astro") || n.includes("astronom")) return "astro";
  if (n.includes("bio") || n.includes("life")) return "bio";
  if (n.includes("tamil") || n.includes("literat") || n.includes("classical")) return "tamil";
  if (n.includes("cross")) return "cross";
  return "cross";
}

/* ------------------------------------------------------------
 * Item normalization — every variant maps into a typed model
 * ------------------------------------------------------------ */

function normalizeItem(raw, fallbackDim) {
  if (raw == null) return null;

  // Dialect B: minimal { content, evidence_label, source }
  if (typeof raw === "string") {
    return { kind: "prose", dimension: fallbackDim, text: raw, evidenceLabel: null };
  }

  const type = raw.type || null;

  if (type === "tamil_verse" || raw.tamil_script || raw.tamil_line_1) {
    const meta = raw.source_metadata || {};
    return {
      kind: "verse",
      dimension: fallbackDim,
      verseTitle: raw.verse_title || meta.work || "Classical Verse",
      tamilScript: raw.tamil_script || [raw.tamil_line_1, raw.tamil_line_2].filter(Boolean).join("\n") || null,
      transliteration: raw.transliteration || null,
      translation: raw.translation || null,
      literalMeaning: raw.literal_meaning || raw.literal_translation || null,
      evidenceLabel: raw.evidence_label || null,
      meta: {
        work: meta.work || null,
        section: meta.section || raw.section || null,
        chapter: meta.chapter || raw.chapter || null,
        verseNumber: meta.verse_number || raw.kural_number || raw.verse_number || null,
        author: meta.author || raw.author || null,
        era: meta.historical_era || null,
        meter: meta.meter || null,
      },
      provenance: raw.source || meta.source || null,
    };
  }

  if (type === "comparison_table" || (raw.columns && raw.rows)) {
    return { kind: "table", dimension: fallbackDim, title: raw.title || "Comparison", columns: raw.columns || [], rows: raw.rows || [], evidenceLabel: raw.evidence_label || null };
  }

  if (type === "temporal_progression" || raw.progression_steps) {
    return {
      kind: "progression",
      dimension: "4D",
      title: raw.title || "Temporal Progression",
      text: raw.text || null,
      steps: raw.progression_steps || raw.timeline || [],
      evidenceLabel: raw.evidence_label || null,
    };
  }

  if (type === "definition" || type === "fact") {
    return {
      kind: "definition",
      dimension: fallbackDim,
      title: raw.title || raw.entity || raw.label || "Definition",
      text: raw.text || raw.content || raw.value || (typeof raw === "object" ? "" : String(raw)),
      formula: raw.formula || null,
      evidenceLabel: raw.evidence_label || null,
    };
  }

  if (type === "contextual_analysis" || type === "concept_overview" || type === "bridge_description") {
    return {
      kind: type === "bridge_description" ? "bridge" : "analysis",
      dimension: fallbackDim,
      title: raw.title || null,
      text: raw.text || raw.content || "",
      evidenceLabel: raw.evidence_label || null,
    };
  }

  // Dialect B bare item
  if (raw.content != null) {
    return {
      kind: "prose",
      dimension: fallbackDim,
      text: raw.content,
      evidenceLabel: raw.evidence_label || null,
      source: raw.source || null,
    };
  }

  // Generic fallback: serialize whatever fields exist
  const text = raw.text || raw.value || raw.description || null;
  if (text == null) return null;
  return { kind: "prose", dimension: fallbackDim, text, evidenceLabel: raw.evidence_label || null };
}

/* ------------------------------------------------------------
 * Section + relationship normalization
 * ------------------------------------------------------------ */

function normalizeSection(sec) {
  if (!sec || !sec.dimension) return null;
  const dim = DIMENSION_META[sec.dimension] ? sec.dimension : "1D";
  const items = (Array.isArray(sec.items) ? sec.items : [])
    .map((it) => normalizeItem(it, dim))
    .filter(Boolean);

  // Legacy variant: verse_cards / facts / content directly on the section
  if (Array.isArray(sec.verse_cards)) {
    sec.verse_cards.forEach((v) => {
      const n = normalizeItem({ ...v, type: "tamil_verse" }, dim);
      if (n) items.push(n);
    });
  }
  if (Array.isArray(sec.facts)) {
    sec.facts.forEach((f) => {
      const n = normalizeItem(typeof f === "string" ? f : { ...f, type: "definition" }, dim);
      if (n) items.push(n);
    });
  }
  if (sec.content && items.length === 0) {
    items.push({ kind: "analysis", dimension: dim, title: null, text: sec.content, evidenceLabel: null });
  }

  return {
    dimension: dim,
    meta: DIMENSION_META[dim],
    title: sec.title || DIMENSION_META[dim].name,
    items,
  };
}

function normalizeRelationship(rel, idx) {
  if (!rel) return null;
  const from = rel.from_entity || rel.source_entity || rel.source || null;
  const to = rel.to_entity || rel.target_entity || rel.target || null;
  const type = rel.relationship_type || rel.relation || "INTERPRETATION";
  const meta = relationMeta(type);
  return {
    id: `rel-${idx}`,
    from: from || "—",
    to: to || "—",
    type,
    typeMeta: meta,
    evidenceLabel: rel.evidence_label || null,
    evidenceCls: evidenceClass(rel.evidence_label),
    domains: Array.isArray(rel.domains) ? rel.domains.map(domainToken) : [],
    description: rel.description || null,
    isConceptual: rel.is_conceptual != null ? rel.is_conceptual : meta.dashed,
  };
}

/* ------------------------------------------------------------
 * Public: normalizeResult(payload)
 * ------------------------------------------------------------ */

export function normalizeResult(payload) {
  if (!payload) return null;

  const query = payload.query || {};
  const answer = payload.answer || payload; // dialect A nests under answer; dialect A' legacy flat
  const sectionsRaw = Array.isArray(answer.sections) ? answer.sections : [];
  const sections = sectionsRaw.map(normalizeSection).filter((s) => s && s.items.length > 0);
  sections.sort((a, b) => DIMENSION_ORDER.indexOf(a.dimension) - DIMENSION_ORDER.indexOf(b.dimension));

  const relationships = (Array.isArray(answer.relationships) ? answer.relationships : [])
    .map(normalizeRelationship)
    .filter(Boolean);

  // Sources: live envelope keeps them at top level; mock engine nests under answer
  const rawSources = Array.isArray(payload.sources)
    ? payload.sources
    : Array.isArray(answer.sources)
    ? answer.sources
    : [];
  const sources = rawSources.map((s, i) => ({
    id: `src-${i}`,
    title: s.title || s.name || "Archival Source",
    authors: s.authors || s.author || null,
    year: s.year || null,
    publication: s.publication || null,
    doi: s.doi || null,
    citation: s.citation || null,
    domain: s.domain ? domainToken(s.domain) : null,
  }));

  const rawWarnings = Array.isArray(payload.warnings)
    ? payload.warnings
    : Array.isArray(answer.warnings)
    ? answer.warnings
    : [];
  const warnings = rawWarnings.filter(Boolean);
  const notFound = Array.isArray(payload.not_found) ? payload.not_found.filter(Boolean) : [];
  const crossDomain = payload.cross_domain || null; // optional enrichment if engine provides it

  // Graph nodes derived strictly from relationship endpoints (no invented entities)
  const nodeMap = new Map();
  relationships.forEach((rel) => {
    [rel.from, rel.to].forEach((id) => {
      if (!nodeMap.has(id)) {
        const domainGuess = rel.domains.length ? rel.domains[0] : "cross";
        nodeMap.set(id, { id, domain: domainGuess });
      } else if (rel.domains.length && nodeMap.get(id).domain === "cross" && rel.domains[0] !== "cross") {
        nodeMap.get(id).domain = rel.domains[0];
      }
    });
  });
  const graph = {
    nodes: Array.from(nodeMap.values()),
    edges: relationships.map((r) => ({ from: r.from, to: r.to, relation: r })),
  };

  const activatedDimensions = sections.map((s) => s.dimension);

  return {
    queryText: query.text || payload.query_text || query.original_query || "",
    query: {
      text: query.text || "",
      inputType: query.input_type || null,
      domains: Array.isArray(query.domains) ? query.domains : [],
      domainTokens: (Array.isArray(query.domains) ? query.domains : []).map(domainToken),
      intent: query.intent || null,
      entities: Array.isArray(query.entities) ? query.entities : [],
      concepts: Array.isArray(query.concepts) ? query.concepts : [],
      dimensions: Array.isArray(query.dimensions) ? query.dimensions : activatedDimensions,
    },
    summary: answer.summary || "",
    sections,
    relationships,
    comparisonTable: answer.comparison_table || null,
    crossDomain,
    sources,
    warnings,
    notFound,
    graph,
    activatedDimensions,
    DIMENSION_META,
  };
}

export { DIMENSION_META, DIMENSION_ORDER, evidenceClass, relationMeta, domainToken };
