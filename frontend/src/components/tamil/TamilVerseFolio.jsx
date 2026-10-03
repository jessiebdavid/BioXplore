/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * TamilVerseFolio — respectful presentation of Classical Tamil
 * verses. Renders ONLY fields that exist in the data.
 * ============================================================ */

import React from "react";
import { ScrollText } from "lucide-react";

export default function TamilVerseFolio({ verse }) {
  if (!verse) return null;
  const m = verse.meta || {};

  return (
    <article className="folio rounded-2xl p-6 md:p-8" lang="ta">
      <span className="folio-edge" aria-hidden="true" />

      <header className="relative flex flex-wrap items-start justify-between gap-3 pb-4 mb-5 border-b border-[#D4A359]/25">
        <div className="flex items-start gap-3">
          <ScrollText className="w-4.5 h-4.5 mt-1 text-[#8D75C7] shrink-0" style={{ width: 18, height: 18 }} aria-hidden="true" />
          <div>
            <span className="eyebrow" style={{ color: "#8D75C7" }}>
              Classical Tamil Corpus
            </span>
            <h4 className="font-display text-xl md:text-[1.4rem] font-semibold text-[#4A2B1D] mt-1 leading-snug">{verse.verseTitle}</h4>
          </div>
        </div>
        {m.verseNumber != null && (
          <span className="font-mono text-[0.62rem] font-bold tracking-wider text-[#7A5A22] bg-[#D4A359]/12 border border-[#D4A359]/40 rounded-md px-2.5 py-1">
            KURAL {m.verseNumber}
          </span>
        )}
      </header>

      {/* metadata ledger */}
      <dl className="relative flex flex-wrap gap-x-6 gap-y-1.5 mb-5 font-mono text-[0.62rem] tracking-wide text-[#8A6A3C]">
        {m.work && <div><dt className="inline">WORK </dt><dd className="inline font-semibold text-[#5E421C]">{m.work}</dd></div>}
        {m.chapter && <div><dt className="inline">CHAPTER </dt><dd className="inline font-semibold text-[#5E421C]">{m.chapter}</dd></div>}
        {m.section && <div><dt className="inline">SECTION </dt><dd className="inline font-semibold text-[#5E421C]">{m.section}</dd></div>}
        {m.author && <div><dt className="inline">AUTHOR </dt><dd className="inline font-semibold text-[#5E421C]">{m.author}</dd></div>}
        {m.meter && <div><dt className="inline">METER </dt><dd className="inline font-semibold text-[#5E421C]">{m.meter}</dd></div>}
        {m.era && <div><dt className="inline">ERA </dt><dd className="inline font-semibold text-[#5E421C]">{m.era}</dd></div>}
      </dl>

      {/* original verse */}
      {verse.tamilScript && (
        <div className="relative rounded-xl bg-[#D4A359]/8 border border-[#D4A359]/20 border-l-4 border-l-[#D4A359] px-6 py-5 mb-5">
          <p className="tamil-script whitespace-pre-line">{verse.tamilScript}</p>
        </div>
      )}

      {verse.transliteration && (
        <p className="relative font-display italic text-[1.02rem] text-[#6E4E28] mb-4 leading-relaxed">{verse.transliteration}</p>
      )}

      <div className="relative grid gap-3 md:grid-cols-2">
        {verse.translation && (
          <div className="rounded-xl bg-white/70 border border-[#D4A359]/20 px-5 py-4">
            <span className="font-mono text-[0.58rem] font-bold tracking-widest2 text-[#5B3B9E]">TRANSLATION (1D)</span>
            <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[#4A2B1D]">{verse.translation}</p>
          </div>
        )}
        {verse.literalMeaning && (
          <div className="rounded-xl bg-white/70 border border-[#D4A359]/20 px-5 py-4">
            <span className="font-mono text-[0.58rem] font-bold tracking-widest2 text-[#5B3B9E]">LITERAL MEANING (1D)</span>
            <p className="mt-1.5 text-[0.86rem] leading-relaxed text-[#4A2B1D]">{verse.literalMeaning}</p>
          </div>
        )}
      </div>

      {verse.provenance && (
        <footer className="relative mt-5 pt-3.5 border-t border-[#D4A359]/25 font-mono text-[0.62rem] tracking-wide text-[#8A6A3C]">
          <span className="font-bold text-[#5E421C]">PROVENANCE </span> {verse.provenance}
        </footer>
      )}

      {verse.evidenceLabel && (
        <div className="relative mt-3">
          <span className={verse.evidenceClass || "chip-evidence ev-textual"}>{verse.evidenceLabel}</span>
        </div>
      )}
    </article>
  );
}
