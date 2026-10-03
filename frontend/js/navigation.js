/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Navigation & Client Router (Hash-Based, Zero Dependencies)
 *
 * Routes:
 * #/login        - Authentication Gateway
 * #/intro        - Landing & Three Domains -> One System
 * #/explore      - Multidimensional Knowledge Workspace
 * #/domains      - In-depth Domain Breakdown
 * #/methodology  - Research Pipeline & Epistemic Framework
 * #/about        - System Philosophy & Provenance
 * ============================================================ */

(function () {
  const VALID_ROUTES = ["#/login", "#/intro", "#/explore", "#/domains", "#/methodology", "#/about"];

  function normalizeRoute(hash) {
    const raw = (hash || window.location.hash || "").trim().toLowerCase();
    if (!raw || raw === "#" || raw === "#/") {
      return window.MKS_AUTH.isAuthenticated() ? "#/explore" : "#/login";
    }
    const match = VALID_ROUTES.find((r) => raw === r || raw.startsWith(r + "?") || raw.startsWith(r + "/"));
    return match || (window.MKS_AUTH.isAuthenticated() ? "#/explore" : "#/login");
  }

  function handleRoute() {
    let route = normalizeRoute(window.location.hash);
    const auth = window.MKS_AUTH.isAuthenticated();

    // Route guards
    if (route !== "#/login" && !auth) {
      window.location.hash = "#/login";
      return;
    }
    if (route === "#/login" && auth) {
      window.location.hash = "#/explore";
      return;
    }

    // Activate the appropriate view container
    const viewName = route.replace("#/", "");
    const allViews = document.querySelectorAll(".view-pane");
    allViews.forEach((v) => {
      if (v.id === `view-${viewName}`) {
        v.hidden = false;
        v.classList.add("active-view");
      } else {
        v.hidden = true;
        v.classList.remove("active-view");
      }
    });

    // Toggle navigation bar visibility (hidden on login screen)
    const navBar = document.getElementById("main-nav");
    if (navBar) {
      navBar.hidden = route === "#/login";
    }

    // Sync active navigation link
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === route) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });

    // Close mobile drawer if open
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu && !mobileMenu.hidden) {
      mobileMenu.hidden = true;
      const toggleBtn = document.getElementById("mobile-menu-toggle");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Dispatch event for view-specific initialization (e.g., animations)
    window.dispatchEvent(
      new CustomEvent("mks:route-change", {
        detail: { route, view: viewName },
      })
    );
  }

  function navigateTo(route) {
    if (window.location.hash === route) {
      handleRoute();
    } else {
      window.location.hash = route;
    }
  }

  function initRouter() {
    window.addEventListener("hashchange", handleRoute);

    // Mobile menu toggle listener
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener("click", () => {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
        mobileMenu.hidden = isExpanded;
      });
    }

    // Initial navigation
    handleRoute();
  }

  window.MKS_ROUTER = {
    initRouter,
    navigateTo,
    handleRoute,
  };
})();
