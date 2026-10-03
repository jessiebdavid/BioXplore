/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * QueryBar — the primary research instrument input.
 * The placeholder string is FROZEN and must never change.
 * ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { getExampleQueries, EXAMPLE_QUERY_META } from "../../services/engine.js";

export const FROZEN_PLACEHOLDER = "Enter a topic, keyword, concept, sentence, question, or cross-domain query...";

export default function QueryBar({ onSubmit, isBusy = false, autoFocus = false, size = "lg", initialQuery = "" }) {
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef(null);
  const examples = getExampleQueries();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const submit = (e) => {
    if (e) e.preventDefault();
    const q = value.trim();
    if (q && !isBusy && onSubmit) onSubmit(q);
  };

  const runExample = (q) => {
    if (isBusy) return;
    setValue(q);
    if (onSubmit) onSubmit(q);
  };

  const big = size === "lg";

  return (
    <div className="w-full">
      <form onSubmit={submit} className="relative" role="search">
        <div
          className={`luminous-edge relative flex items-center gap-3 rounded-full bg-white/85 shadow-glass-sm transition-all duration-500 ${
            big ? "pl-6 pr-2.5 py-2.5" : "pl-5 pr-2 py-1.5"
          }`}
          style={{ WebkitBackdropFilter: "blur(16px)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.95)" }}
        >
          <Search className={`${big ? "w-5 h-5" : "w-4 h-4"} text-ink-muted shrink-0`} strokeWidth={2.2} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={FROZEN_PLACEHOLDER}
            aria-label="Research query input"
            className={`flex-1 min-w-0 bg-transparent outline-none border-none text-ink placeholder:text-ink-muted/80 font-medium ${
              big ? "text-[0.98rem] py-1.5" : "text-sm"
            }`}
            spellCheck="false"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isBusy || !value.trim()}
            className={`group flex items-center gap-2 rounded-full font-semibold text-white transition-all duration-300 shadow-glow-core disabled:opacity-50 disabled:cursor-not-allowed ${
              big ? "px-4 sm:px-6 py-3 text-[0.8rem] sm:text-sm shrink-0" : "px-4 py-2 text-xs shrink-0"
            }`}
            style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 55%, #3D9FA1 100%)" }}
          >
            {isBusy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      {big && examples.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className="eyebrow mr-1">Try exploring</span>
          {examples.map((q) => {
            const meta = EXAMPLE_QUERY_META[q] || { domain: "cross" };
            const dotColor =
              meta.domain === "astro" ? "#4D7FE8" : meta.domain === "bio" ? "#4DAF83" : meta.domain === "tamil" ? "#8D75C7" : "#3D9FA1";
            return (
              <button key={q} type="button" className="query-chip" onClick={() => runExample(q)} title={`Run example query: ${q}`}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} aria-hidden="true" />
                <span className="max-w-[240px] truncate">{q}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
