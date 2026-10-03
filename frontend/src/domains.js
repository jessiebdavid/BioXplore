/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Domain registry — visual identity for the three equal domains.
 * Copy echoes the existing DomainsView (same facts, no invention).
 * ============================================================ */

export const DOMAINS = [
  {
    id: "astro",
    name: "Astronomy",
    full: "Astronomy / Astrophysics",
    tagline: "Celestial objects, physical laws, universe and space-time.",
    accent: "#4D7FE8",
    accentSoft: "rgba(77,127,232,0.14)",
    accentGlow: "rgba(77,127,232,0.45)",
    scope: "Stellar to cosmological horizons",
    framework: "Empirical observation & mathematical physics",
    exampleQuery: "Black hole vs white hole",
    themeTopics: ["Celestial objects", "Physical laws", "Universe & space-time", "Gravitation & radiation"],
  },
  {
    id: "bio",
    name: "Biology",
    full: "Biology / Biological Systems",
    tagline: "Molecules, cells, organisms, life processes, evolution.",
    accent: "#4DAF83",
    accentSoft: "rgba(77,175,131,0.14)",
    accentGlow: "rgba(77,175,131,0.45)",
    scope: "Macromolecular to organismal systems",
    framework: "Molecular biology & mechanistic systems",
    exampleQuery: "Gene expression",
    themeTopics: ["Molecules and cells", "Organisms and systems", "Life processes", "Evolution and adaptation"],
  },
  {
    id: "tamil",
    name: "Classical Tamil",
    full: "Classical Tamil Literature",
    tagline: "Sangam literature, Thirukkural, linguistic and cultural knowledge.",
    accent: "#8D75C7",
    accentSoft: "rgba(141,117,199,0.15)",
    accentGlow: "rgba(141,117,199,0.45)",
    scope: "Civilizational & bioregional landscapes",
    framework: "Philological hermeneutics & ecological poetics",
    exampleQuery: "Nature in Tholkappiyam",
    themeTopics: ["Sangam literature", "Thirukkural", "Tholkappiyam", "Linguistic and cultural knowledge"],
  },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));

/* Dimension metadata — definitions are FROZEN. */
export const DIMENSIONS = [
  {
    id: "1D",
    name: "Text / Literal",
    desc: "Direct facts, definitions, equations, measurements, original Tamil text, literal meaning and translation.",
    accent: "#4D7FE8",
    soft: "rgba(77,127,232,0.12)",
  },
  {
    id: "2D",
    name: "Interpretation / Context",
    desc: "Physical, biological or literary context, mechanisms, conditions and meaning.",
    accent: "#4DAF83",
    soft: "rgba(77,175,131,0.12)",
  },
  {
    id: "3D",
    name: "Symbol / Concept / Relationship",
    desc: "Entities, concepts, relationships, cause-effect links and conceptual connections.",
    accent: "#8D75C7",
    soft: "rgba(141,117,199,0.12)",
  },
  {
    id: "4D",
    name: "Future / Hypothetical / Temporal",
    desc: "Change over time, progression, evolution, future scenarios, hypotheses and analogies.",
    accent: "#D99B42",
    soft: "rgba(217,155,66,0.14)",
  },
];

export const DIMENSION_BY_ID = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d]));

/** Broadcast the ambient domain mood to the living field. */
export function setAmbientDomain(token) {
  if (typeof document === "undefined") return;
  if (token) document.documentElement.setAttribute("data-domain", token);
  else document.documentElement.removeAttribute("data-domain");
  try {
    window.dispatchEvent(new CustomEvent("mks:domain", { detail: { domain: token || "none" } }));
  } catch {
    /* noop */
  }
}
