/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * API Layer (Canonical Integration Point)
 *
 * MOCK MODE (default): answers evaluated via js/mock-engine.js.
 * LIVE MODE: POST {query, options} to Part A's /query and return its JSON.
 *
 * Switch: set window.MKS_CONFIG = { backend: "live", endpoint: "http://127.0.0.1:8001/query" }
 * before js/api.js loads, or edit DEFAULT_CONFIG below.
 * ============================================================ */

const DEFAULT_CONFIG = {
  backend: "mock", // "mock" | "live"
  endpoint: "http://127.0.0.1:8001/query", // Part A: POST /query
  timeoutMs: 15000,
};

const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.MKS_CONFIG || {});

const EXAMPLE_QUERIES = [
  "Black holes",
  "Plasma oscillation",
  "Radiation laws",
  "Kepler's laws",
  "Gene expression",
  "Thirukkural",
  "Nature in Tholkappiyam",
  "Black hole vs white hole",
  "Can biological rhythms be compared conceptually with orbital periods?",
];

function normalizeError(raw) {
  // Backend error contract: {"error": {"code": ..., "message": ...}}
  if (raw && raw.error && raw.error.code) {
    return {
      code: raw.error.code,
      message: raw.error.message || "Request failed.",
      details: raw.error.details || null,
    };
  }
  if (raw && raw.code) {
    return {
      code: raw.code,
      message: raw.message || "An error occurred.",
      details: raw.details || null,
    };
  }
  return {
    code: "NETWORK_ERROR",
    message: (raw && raw.message) || "Could not reach the knowledge service.",
    details: null,
  };
}

async function fetchAnswer(query, options) {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    throw {
      code: "EMPTY_QUERY",
      message: "Please enter a concept, topic, question, or cross-domain query.",
    };
  }

  if (CONFIG.backend === "live") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    try {
      const res = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, options: options || {} }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw normalizeError(data);
      }
      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw {
          code: "TIMEOUT",
          message: `Query evaluation timed out after ${CONFIG.timeoutMs / 1000}s.`,
        };
      }
      throw normalizeError(err);
    }
  }

  // MOCK MODE: evaluate via MKS_MOCK_ENGINE
  if (window.MKS_MOCK_ENGINE && typeof window.MKS_MOCK_ENGINE.evaluate === "function") {
    return await window.MKS_MOCK_ENGINE.evaluate(trimmed, options);
  }

  throw {
    code: "MOCK_ENGINE_MISSING",
    message: "Client mock engine is not initialized.",
  };
}

window.MKS_API = {
  CONFIG,
  EXAMPLE_QUERIES,
  fetchAnswer,
  normalizeError,
};
