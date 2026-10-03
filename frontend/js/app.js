/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Master Application Orchestrator
 *
 * Coordinates:
 * - Routing & Authentication Guards
 * - Ambient Scientific Background & Convergence Visuals
 * - Query Execution Lifecycle (idle -> loading -> result | error)
 * - Dimension Navigation & Transition Sequences
 * ============================================================ */

(function () {
  const $ = (id) => document.getElementById(id);

  // State elements in Explorer
  const stateEls = {
    idle: $("state-idle"),
    loading: $("state-loading"),
    error: $("state-error"),
    result: $("state-result"),
  };

  function showExplorerState(stateName) {
    Object.entries(stateEls).forEach(([key, el]) => {
      if (!el) return;
      el.hidden = key !== stateName;
    });
  }

  function setExplorerError(code, message) {
    const codeEl = $("error-code");
    const msgEl = $("error-message");
    if (codeEl) codeEl.textContent = code || "ERROR";
    if (msgEl) msgEl.textContent = message || "An unexpected error occurred.";
    showExplorerState("error");
  }

  // ------------------------------------------------------------
  // Query Execution Handler
  // ------------------------------------------------------------
  async function executeQuery(rawQuery) {
    const query = (rawQuery || "").trim();
    const input = $("query-input");
    if (input) input.value = query;

    if (!query) {
      setExplorerError("EMPTY_QUERY", "Please enter a concept, topic, question, or cross-domain query.");
      return;
    }

    showExplorerState("loading");

    try {
      const payload = await window.MKS_API.fetchAnswer(query);
      showExplorerState("result");
      window.MKS_RENDER.renderAnswer(payload, stateEls.result);

      // Wire interactive dimension tabs in navigator
      const dimTabs = stateEls.result.querySelectorAll(".dim-tab.active-dim");
      dimTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const dim = tab.getAttribute("data-dim");
          const targetCard = $("dim-panel-" + dim.toLowerCase());
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
            targetCard.style.outline = "2px solid var(--color-cross)";
            setTimeout(() => {
              targetCard.style.outline = "none";
            }, 1200);
          }
        });
      });
    } catch (err) {
      const normalized = window.MKS_API.normalizeError(err);
      setExplorerError(normalized.code, normalized.message);
    }
  }

  // ------------------------------------------------------------
  // Example Chips Population
  // ------------------------------------------------------------
  function initExampleChips() {
    const container = $("example-chips");
    if (!container) return;

    const queries = window.MKS_API.EXAMPLE_QUERIES || [];
    container.innerHTML = queries
      .map(
        (q) => `<button type="button" class="example-chip-btn" data-query="${q.replace(/"/g, "&quot;")}">${q}</button>`
      )
      .join("");

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".example-chip-btn");
      if (btn) {
        const q = btn.getAttribute("data-query");
        if (q) executeQuery(q);
      }
    });
  }

  // ------------------------------------------------------------
  // Authentication UI Binding
  // ------------------------------------------------------------
  function initAuthBindings() {
    const form = $("login-form");
    const emailInput = $("login-email");
    const passInput = $("login-password");
    const togglePassBtn = $("toggle-password-btn");
    const errorAlert = $("login-error-alert");
    const logoutBtn = $("logout-btn");
    const mobileLogoutBtn = $("mobile-logout-btn");

    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener("click", () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        togglePassBtn.textContent = isPass ? "Hide" : "Show";
        togglePassBtn.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (errorAlert) errorAlert.hidden = true;

        const email = emailInput ? emailInput.value : "";
        const password = passInput ? passInput.value : "";

        const result = window.MKS_AUTH.login(email, password);
        if (!result.success) {
          if (errorAlert) {
            errorAlert.textContent = result.error;
            errorAlert.hidden = false;
          }
          return;
        }

        // Trigger cinematic Login -> Intro transition
        window.MKS_ANIMATIONS.playLoginToIntroTransition(() => {
          window.location.hash = "#/intro";
        });
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => window.MKS_AUTH.logout());
    }
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", () => window.MKS_AUTH.logout());
    }
  }

  // ------------------------------------------------------------
  // UI Event Handlers
  // ------------------------------------------------------------
  function initUIEventHandlers() {
    // Analyze button
    const analyzeBtn = $("analyze-btn");
    const queryInput = $("query-input");
    if (analyzeBtn && queryInput) {
      analyzeBtn.addEventListener("click", () => executeQuery(queryInput.value));
      queryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          executeQuery(queryInput.value);
        }
      });
    }

    // Retry button in error state
    const retryBtn = $("retry-query-btn");
    if (retryBtn && queryInput) {
      retryBtn.addEventListener("click", () => executeQuery(queryInput.value));
    }

    // Intro CTA Button -> Explore with transition
    const introCta = $("intro-cta-btn");
    if (introCta) {
      introCta.addEventListener("click", (e) => {
        e.preventDefault();
        window.MKS_ANIMATIONS.playIntroToExploreTransition(() => {
          window.location.hash = "#/explore";
        });
      });
    }

    // Domain page "Analyze in Explorer" buttons
    document.querySelectorAll(".domain-search-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.getAttribute("data-query");
        window.location.hash = "#/explore";
        setTimeout(() => {
          if (q) executeQuery(q);
        }, 80);
      });
    });

    // Backend indicator badge
    const badge = $("backend-badge");
    if (badge && window.MKS_API && window.MKS_API.CONFIG) {
      badge.textContent = `Backend: ${window.MKS_API.CONFIG.backend}`;
    }
  }

  // ------------------------------------------------------------
  // Route Change Listener (Visual Updates)
  // ------------------------------------------------------------
  function initVisualRouteListeners() {
    window.addEventListener("mks:route-change", (e) => {
      const view = e.detail && e.detail.view;
      if (view === "login") {
        window.MKS_ANIMATIONS.renderConvergenceVisualization("login-convergence-visual", { width: 580 });
      } else if (view === "intro") {
        window.MKS_ANIMATIONS.renderConvergenceVisualization("intro-convergence-visual", { width: 700 });
      }
    });
  }

  // ------------------------------------------------------------
  // Application Bootstrap
  // ------------------------------------------------------------
  function init() {
    // 1. Render continuous background
    window.MKS_ANIMATIONS.renderGlobalBackground("global-bg");

    // 2. Initialize example query chips
    initExampleChips();

    // 3. Bind authentication actions
    initAuthBindings();

    // 4. Bind search & interactive controls
    initUIEventHandlers();

    // 5. Visual route listeners
    initVisualRouteListeners();

    // 6. Start the hash router
    window.MKS_ROUTER.initRouter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
