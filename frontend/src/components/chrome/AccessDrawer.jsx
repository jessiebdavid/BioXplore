/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * AccessDrawer — optional access mechanism.
 * Opens as a translucent right-side panel; the observatory
 * stays fully alive and visible behind it. Uses the existing
 * demo auth service (no invented providers).
 * ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { X, Mail, Lock, LogOut, ArrowRight, BadgeCheck } from "lucide-react";
import { login, logout } from "../../services/engine.js";

export default function AccessDrawer({ open, onClose, isAuthenticated, session, onAuthChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    if (open) {
      setError("");
      const t = setTimeout(() => emailRef.current && emailRef.current.focus(), 420);
      const onKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(t);
        window.removeEventListener("keydown", onKey);
      };
    }
    return undefined;
  }, [open, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    // small delay mirrors the original demo behaviour
    setTimeout(() => {
      const res = login(email, password);
      setBusy(false);
      if (res.success) {
        onAuthChange(res.session);
      } else {
        setError(res.error || "Authentication failed.");
      }
    }, 350);
  };

  const signOut = () => {
    logout();
    onAuthChange(null);
  };

  return (
    <>
      {/* scrim — light, the page remains visible */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(23, 50, 77, 0.18)", WebkitBackdropFilter: "blur(2px)", backdropFilter: "blur(2px)" }}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label="Access the system"
        className={`fixed z-[70] top-0 right-0 h-full w-[min(420px,100vw)] p-3 sm:p-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0 visible" : "translate-x-[110%] invisible"
        }`}
      >
        <div className="glass-deep h-full rounded-3xl flex flex-col overflow-hidden relative">
          {/* interior atmosphere */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-56 pointer-events-none opacity-70"
            style={{ background: "radial-gradient(80% 100% at 70% 0%, rgba(61,159,161,0.25) 0%, transparent 70%)" }}
          />

          <div className="relative flex items-center justify-between px-6 pt-6">
            <span className="eyebrow !text-cross-glow">Access the System</span>
            <button
              type="button"
              onClick={onClose}
              className="grid place-items-center w-8 h-8 rounded-lg bg-white/8 border border-white/15 text-sky-100/80 hover:bg-white/15 transition"
              aria-label="Close access panel"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="relative px-6 pb-6 pt-2 overflow-y-auto flex-1">
              <h2 className="font-display text-3xl text-sky-50 mt-3 leading-tight">Enter the research environment</h2>
              <p className="text-[0.8rem] text-sky-200/60 mt-2 leading-relaxed">
                Access is optional. The public observatory — About, Domains, Explore and Methodology — remains open to every visitor.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-400/12 border border-red-300/30 px-4 py-3 text-[0.78rem] text-red-200" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-3.5">
                <label className="block">
                  <span className="font-mono text-[0.58rem] tracking-widest2 uppercase text-sky-200/60">Research email</span>
                  <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-white/7 border border-white/15 px-3.5 py-3 focus-within:border-cross-glow/60 transition">
                    <Mail className="w-4 h-4 text-sky-300/70 shrink-0" aria-hidden="true" />
                    <input
                      ref={emailRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="scholar@research.edu"
                      autoComplete="username"
                      className="flex-1 bg-transparent outline-none text-[0.88rem] text-sky-50 placeholder:text-sky-200/30"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="font-mono text-[0.58rem] tracking-widest2 uppercase text-sky-200/60">Passphrase</span>
                  <div className="mt-1.5 flex items-center gap-2.5 rounded-xl bg-white/7 border border-white/15 px-3.5 py-3 focus-within:border-cross-glow/60 transition">
                    <Lock className="w-4 h-4 text-sky-300/70 shrink-0" aria-hidden="true" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="flex-1 bg-transparent outline-none text-[0.88rem] text-sky-50 placeholder:text-sky-200/30"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={busy}
                  className="group w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-[0.9rem] text-white transition-all duration-300 shadow-glow-core hover:brightness-110 disabled:opacity-60"
                  style={{ background: "linear-gradient(120deg, #16557A 0%, #0E7C7B 60%, #3D9FA1 100%)" }}
                >
                  {busy ? "Calibrating…" : "Enter System"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </form>

              <p className="mt-5 text-center text-[0.68rem] text-sky-200/45 leading-relaxed">
                Frontend demo authentication — your session lives only in this browser.
              </p>
            </div>
          ) : (
            <div className="relative px-6 pb-6 pt-2 flex-1 flex flex-col">
              <h2 className="font-display text-3xl text-sky-50 mt-3">Session active</h2>
              <div className="mt-6 rounded-2xl bg-white/6 border border-white/12 px-5 py-5 flex items-center gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-cross/20 border border-cross/40 text-cross-glow">
                  <BadgeCheck style={{ width: 20, height: 20 }} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-sky-50 truncate">{(session && session.email) || "Research Scholar"}</div>
                  <div className="font-mono text-[0.62rem] tracking-wider text-sky-200/55 mt-0.5">
                    {(session && session.role) || "Research Scholar"}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-[0.8rem] text-sky-200/60 leading-relaxed">
                Your access session is stored locally for this demonstration. The knowledge engine, dimensions and domains are identical for all visitors.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-semibold text-sky-100 hover:bg-white/12 transition"
              >
                <LogOut style={{ width: 15, height: 15 }} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
