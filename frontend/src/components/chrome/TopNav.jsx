/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * TopNav — navigation integrated into the environment.
 * Primary: ABOUT / DOMAINS / EXPLORE / METHODOLOGY. Right: ACCESS.
 * ============================================================ */

import React, { useState } from "react";
import { Fingerprint, Menu, X } from "lucide-react";

const ITEMS = [
  { id: "about", label: "About" },
  { id: "domains", label: "Domains" },
  { id: "explore", label: "Explore" },
  { id: "methodology", label: "Methodology" },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="#4D7FE8" strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="20" cy="20" rx="17" ry="7" fill="none" stroke="#3D9FA1" strokeWidth="1" opacity="0.55" transform="rotate(-24 20 20)" />
      <circle cx="20" cy="20" r="6" fill="#3D9FA1" opacity="0.95" />
      <circle cx="20" cy="4.5" r="2.6" fill="#4D7FE8" />
      <circle cx="33.5" cy="28" r="2.6" fill="#4DAF83" />
      <circle cx="6.5" cy="28" r="2.6" fill="#8D75C7" />
    </svg>
  );
}

export default function TopNav({ activeRoute, onNavigate, onOpenAccess, isAuthenticated, sessionEmail }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (id) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 pt-3.5">
        <div
          className="flex items-center justify-between gap-4 rounded-2xl px-4 sm:px-5 py-2.5 glass"
          style={{ borderRadius: "1.25rem" }}
          role="banner"
        >
          {/* brand */}
          <button type="button" onClick={() => go("about")} className="flex items-center gap-3 text-left group" aria-label="Multidimensional Knowledge System — About">
            <BrandMark />
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold tracking-[0.14em] text-[0.98rem] text-ink">
                MULTIDIMENSIONAL
              </span>
              <span className="font-mono text-[0.56rem] tracking-widest2 text-ink-secondary">
                KNOWLEDGE SYSTEM
              </span>
            </span>
          </button>

          {/* primary nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {ITEMS.map((it) => (
              <button
                key={it.id}
                type="button"
                className="nav-link"
                data-active={activeRoute === it.id}
                aria-current={activeRoute === it.id ? "page" : undefined}
                onClick={() => go(it.id)}
              >
                {it.label}
              </button>
            ))}
          </nav>

          {/* right cluster */}
          <div className="flex items-center gap-2.5">
            <span className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[0.56rem] tracking-widest2 uppercase text-ink-secondary bg-white/60 border border-white/80 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cross animate-pulse" aria-hidden="true" />
              Research Prototype
            </span>

            <button
              type="button"
              onClick={onOpenAccess}
              className="flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-[0.78rem] text-white transition-all duration-300 shadow-glow-core hover:brightness-110"
              style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 60%, #3D9FA1 100%)" }}
              aria-haspopup="dialog"
            >
              <Fingerprint className="w-4 h-4" aria-hidden="true" />
              {isAuthenticated ? "Account" : "Access"}
            </button>

            <button
              type="button"
              className="md:hidden grid place-items-center w-9 h-9 rounded-xl bg-white/70 border border-white text-ink"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>

        {/* mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-2 rounded-2xl glass overflow-hidden" role="navigation" aria-label="Mobile">
            {ITEMS.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => go(it.id)}
                className={`w-full text-left px-5 py-3.5 text-sm font-semibold border-b last:border-b-0 border-ink/5 transition-colors ${
                  activeRoute === it.id ? "text-ink bg-white/70" : "text-ink-secondary hover:bg-white/50"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
