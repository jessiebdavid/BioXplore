/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * App shell — the observatory.
 * Routes: about (default) / domains / explore / methodology.
 * Heavy cinematic transitions between views; optional access
 * drawer; living background; real engine wiring throughout.
 * ============================================================ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import KnowledgeField from "./components/field/KnowledgeField.jsx";
import TopNav from "./components/chrome/TopNav.jsx";
import AccessDrawer from "./components/chrome/AccessDrawer.jsx";
import TransitionVeil from "./components/chrome/TransitionVeil.jsx";
import KnowledgeGraph from "./components/graph/KnowledgeGraph.jsx";

import AboutPage from "./pages/AboutPage.jsx";
import DomainsPage from "./pages/DomainsPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import MethodologyPage from "./pages/MethodologyPage.jsx";

import { fetchAnswer, normalizeError } from "./services/engine.js";
import { normalizeResult } from "./services/normalize.js";
import { isAuthenticated, getSession } from "./services/engine.js";

const ROUTES = ["about", "domains", "explore", "methodology"];

const ROUTE_LABEL = {
  about: "Knowledge Introduction",
  domains: "Domain Fields",
  explore: "Research Instrument",
  methodology: "Epistemic Protocol",
};

/* Direction-aware depth transition between views */
const variants = {
  enter: (dir) => ({
    opacity: 0,
    y: dir >= 0 ? 60 : -40,
    scale: 0.975,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    y: dir >= 0 ? -50 : 40,
    scale: dir >= 0 ? 1.03 : 0.97,
    filter: "blur(12px)",
    transition: { duration: 0.5, ease: [0.4, 0, 1, 1] },
  }),
};

export default function App() {
  const [route, setRoute] = useState(() => {
    const h = (window.location.hash || "").replace("#/", "").toLowerCase();
    return ROUTES.includes(h) ? h : "about";
  });
  const [direction, setDirection] = useState(1);
  const [veil, setVeil] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [auth, setAuth] = useState(() => ({ signedIn: isAuthenticated(), session: getSession() }));
  const [result, setResult] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [graphOpen, setGraphOpen] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const busyRef = useRef(false);

  /* ---------- routing ---------- */
  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || "").replace("#/", "").toLowerCase();
      const target = ROUTES.includes(h) ? h : "about";
      setRoute((prev) => {
        if (prev !== target) {
          setDirection(target === "about" ? -1 : 1);
        }
        return target;
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((next) => {
    if (next === route) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setDirection(next === "about" ? -1 : 1);
    setVeil(true);
    window.setTimeout(() => {
      setRoute(next);
      window.location.hash = `#/${next}`;
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 380);
    window.setTimeout(() => setVeil(false), 1000);
  }, [route]);

  /* ---------- ambient domain mood resets on route change ---------- */
  useEffect(() => {
    document.documentElement.removeAttribute("data-domain");
  }, [route]);

  /* ---------- search ---------- */
  const runSearch = useCallback(
    async (queryText) => {
      const q = (queryText || "").trim();
      if (!q || busyRef.current) return;
      busyRef.current = true;
      setIsBusy(true);
      setError(null);
      if (route !== "explore") {
        setDirection(1);
        setVeil(true);
        window.setTimeout(() => {
          setRoute("explore");
          window.location.hash = "#/explore";
          window.scrollTo({ top: 0, behavior: "auto" });
        }, 380);
        window.setTimeout(() => setVeil(false), 1000);
      }
      try {
        const payload = await fetchAnswer(q);
        setResult(normalizeResult(payload));
      } catch (err) {
        setResult(null);
        setError(normalizeError(err));
      } finally {
        busyRef.current = false;
        setIsBusy(false);
      }
    },
    [route]
  );

  const newQuery = useCallback(() => {
    setResult(null);
    setError(null);
    navigate("explore");
  }, [navigate]);

  const openGraph = useCallback(() => {
    // Graph opens with the current result's relationships, or a canonical
    // cross-domain sample from the frozen engine when idle.
    if (result && result.relationships.length) {
      setGraphData(result.relationships);
    } else {
      fetchAnswer("Can biological rhythms be compared conceptually with orbital periods?")
        .then((payload) => {
          const vm = normalizeResult(payload);
          setGraphData(vm.relationships);
        })
        .catch(() => setGraphData([]));
    }
    setGraphOpen(true);
  }, [result]);

  const onSelectDomain = useCallback(
    (domId) => {
      if (domId === "astro" || domId === "bio" || domId === "tamil") {
        navigate("domains");
      }
    },
    [navigate]
  );

  const onAuthChange = useCallback((session) => {
    setAuth({ signedIn: !!session, session });
  }, []);

  const pageProps = useMemo(
    () => ({
      onSearch: runSearch,
      isBusy,
      onNavigate: navigate,
    }),
    [runSearch, isBusy, navigate]
  );

  return (
    <div className="relative min-h-screen font-sans">
      <KnowledgeField />

      <TopNav
        activeRoute={route}
        onNavigate={navigate}
        onOpenAccess={() => setAccessOpen(true)}
        isAuthenticated={auth.signedIn}
        sessionEmail={auth.session && auth.session.email}
      />

      <AccessDrawer
        open={accessOpen}
        onClose={() => setAccessOpen(false)}
        isAuthenticated={auth.signedIn}
        session={auth.session}
        onAuthChange={onAuthChange}
      />

      <TransitionVeil active={veil} label={ROUTE_LABEL[route]} />

      <main className="relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={route}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {route === "about" && (
              <AboutPage
                {...pageProps}
                onSelectDomain={onSelectDomain}
                onOpenGraph={openGraph}
              />
            )}
            {route === "domains" && <DomainsPage {...pageProps} onSelectDomain={onSelectDomain} />}
            {route === "explore" && (
              <ExplorePage
                result={result}
                isBusy={isBusy}
                error={error}
                onSearch={runSearch}
                onNewQuery={newQuery}
              />
            )}
            {route === "methodology" && <MethodologyPage onNavigate={navigate} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* footer */}
      <footer className="relative z-10 border-t border-ink/8 py-8">
        <div className="mx-auto max-w-[1500px] px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[0.6rem] tracking-widest2 uppercase text-ink-muted">
            Multidimensional Knowledge System · Epistemic Observatory
          </span>
          <span className="font-mono text-[0.6rem] tracking-widest2 uppercase text-ink-faint">
            Astronomy · Biology · Classical Tamil — 1D → 4D
          </span>
        </div>
      </footer>

      {/* knowledge graph modal */}
      <AnimatePresence>
        {graphOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
            style={{ background: "rgba(23,50,77,0.35)", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
            onClick={() => setGraphOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Knowledge graph"
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-5xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setGraphOpen(false)}
                className="absolute -top-12 right-0 flex items-center gap-2 rounded-full px-4 py-2 text-[0.74rem] font-semibold text-ink bg-white/85 border border-white shadow-glass-sm hover:bg-white transition"
              >
                Close
                <X style={{ width: 14, height: 14 }} aria-hidden="true" />
              </button>
              <KnowledgeGraph relationships={graphData} height={480} title="Interactive Multi-Domain Knowledge Graph" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
