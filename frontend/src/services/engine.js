/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Engine Bridge — canonical window.MKS_* layer → ES modules
 * The frozen semantics scripts load as side effects; their
 * contents are NEVER modified by this frontend.
 * ============================================================ */

import "../../js/mock-data.js";
import "../../js/mock-engine.js";
import "../../js/api.js";
import "../../js/auth.js";

const win = () => (typeof window !== "undefined" ? window : {});

/** Canonical knowledge evaluation (mock engine or live backend via MKS_API). */
export function fetchAnswer(query, options) {
  const api = win().MKS_API;
  if (api && typeof api.fetchAnswer === "function") return api.fetchAnswer(query, options);
  return Promise.reject({
    code: "SERVICE_UNAVAILABLE",
    message: "Knowledge engine service is initializing.",
  });
}

export function normalizeError(err) {
  const api = win().MKS_API;
  if (api && typeof api.normalizeError === "function") return api.normalizeError(err);
  return {
    code: (err && err.code) || "ERROR",
    message: (err && err.message) || "An unexpected error occurred during knowledge retrieval.",
    details: (err && err.details) || null,
  };
}

/** Canonical example queries from the frozen API layer. */
export function getExampleQueries() {
  const api = win().MKS_API;
  return (api && Array.isArray(api.EXAMPLE_QUERIES)) ? api.EXAMPLE_QUERIES : [];
}

/** Domain metadata for the example queries — visual only, text preserved exactly. */
export const EXAMPLE_QUERY_META = {
  "Black holes": { domain: "astro", icon: "orbit" },
  "Plasma oscillation": { domain: "astro", icon: "waves" },
  "Radiation laws": { domain: "astro", icon: "radiation" },
  "Kepler's laws": { domain: "astro", icon: "compass" },
  "Gene expression": { domain: "bio", icon: "dna" },
  Thirukkural: { domain: "tamil", icon: "scroll" },
  "Nature in Tholkappiyam": { domain: "tamil", icon: "leaf" },
  "Black hole vs white hole": { domain: "astro", icon: "scale" },
  "Can biological rhythms be compared conceptually with orbital periods?": { domain: "cross", icon: "link" },
};

/* ---------- Auth (simple frontend/demo-compatible session) ---------- */

export function getSession() {
  const auth = win().MKS_AUTH;
  return auth && typeof auth.getSession === "function" ? auth.getSession() : null;
}

export function isAuthenticated() {
  const auth = win().MKS_AUTH;
  if (auth && typeof auth.isAuthenticated === "function") return auth.isAuthenticated();
  try { return !!(win().localStorage.getItem("mks_auth_session") || "").trim(); } catch { return false; }
}

export function login(email, password) {
  const auth = win().MKS_AUTH;
  if (auth && typeof auth.login === "function") return auth.login(email, password);
  return { success: false, error: "Authentication service unavailable." };
}

export function logout() {
  const auth = win().MKS_AUTH;
  if (auth && typeof auth.logout === "function") auth.logout();
}
