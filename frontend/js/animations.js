/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Scientific Visual Engine & Optical Instrument Diagrams
 *
 * Provides:
 * 1. Global Archival Coordinate Background (Astrolabe grid, molecular bonds, Tamil epigraphy)
 * 2. Tri-Domain Optical Interferometer / Astrolabe (Login & Intro)
 * 3. Optical Aperture Shutter Transitions (Focal plane shifts)
 * ============================================================ */

(function () {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function isReducedMotion() {
    return reducedMotionQuery.matches;
  }

  // ------------------------------------------------------------
  // 1. Global Archival Coordinate Background
  // ------------------------------------------------------------
  function renderGlobalBackground(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <svg class="bg-svg-canvas" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <!-- Millimeter Coordinate Grid Pattern -->
          <pattern id="archival-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(67, 78, 86, 0.045)" stroke-width="0.75" />
            <circle cx="60" cy="60" r="1" fill="rgba(67, 78, 86, 0.12)" />
          </pattern>
        </defs>

        <!-- Base Grid -->
        <rect width="1600" height="1000" fill="url(#archival-grid)" />

        <!-- Optical Center Reticle Axes -->
        <line x1="0" y1="500" x2="1600" y2="500" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.75" stroke-dasharray="8 6" />
        <line x1="800" y1="0" x2="800" y2="1000" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.75" stroke-dasharray="8 6" />

        <!-- Registration Crosshairs -->
        <g stroke="rgba(67, 78, 86, 0.18)" stroke-width="0.75">
          <path d="M 195 125 L 205 125 M 200 120 L 200 130" />
          <path d="M 1395 125 L 1405 125 M 1400 120 L 1400 130" />
          <path d="M 195 875 L 205 875 M 200 870 L 200 880" />
          <path d="M 1395 875 L 1405 875 M 1400 870 L 1400 880" />
          <path d="M 795 495 L 805 495 M 800 490 L 800 500" />
        </g>

        <!-- Astronomy: Astrolabe Coordinate Ellipses (Top Left) -->
        <g class="${isReducedMotion() ? "" : "anim-celestial-slow"}" opacity="0.6">
          <ellipse cx="320" cy="280" rx="260" ry="130" transform="rotate(-15 320 280)" fill="none" stroke="rgba(32, 74, 120, 0.22)" stroke-width="0.8" stroke-dasharray="6 4" />
          <ellipse cx="320" cy="280" rx="180" ry="80" transform="rotate(30 320 280)" fill="none" stroke="rgba(32, 74, 120, 0.16)" stroke-width="0.8" />
          <!-- Coordinate Crosshair -->
          <circle cx="320" cy="280" r="3" fill="none" stroke="#204A78" stroke-width="0.8" />
          <circle cx="320" cy="280" r="0.8" fill="#204A78" />
        </g>

        <!-- Biology: Precision Molecular Vector Bonds (Top Right) -->
        <g opacity="0.55" transform="translate(1180, 160)">
          <!-- Benzene / Nucleotide Vector Rings -->
          <polygon points="80,0 120,23 120,69 80,92 40,69 40,23" fill="none" stroke="rgba(28, 94, 67, 0.28)" stroke-width="0.85" />
          <polygon points="80,10 112,28 112,64 80,82 48,64 48,28" fill="none" stroke="rgba(28, 94, 67, 0.12)" stroke-width="0.6" stroke-dasharray="3 3" />
          <line x1="120" y1="46" x2="170" y2="46" stroke="rgba(28, 94, 67, 0.25)" stroke-width="0.85" />
          <polygon points="210,0 250,23 250,69 210,92 170,69 170,23" fill="none" stroke="rgba(28, 94, 67, 0.22)" stroke-width="0.85" />
          <circle cx="80" cy="0" r="2" fill="#1C5E43" />
          <circle cx="120" cy="69" r="2" fill="#1C5E43" />
          <circle cx="210" cy="92" r="2" fill="#1C5E43" />
        </g>

        <!-- Classical Tamil: Subtle Epigraphic Sangam Watermark (Bottom Plane) -->
        <g fill="rgba(130, 51, 41, 0.10)" font-family="'Latha', 'Nirmala UI', serif" font-weight="600">
          <text x="260" y="780" font-size="34">அ</text>
          <text x="560" y="860" font-size="28">ஞ</text>
          <text x="920" y="740" font-size="30">ய</text>
          <text x="1220" y="820" font-size="32">ழ</text>
          <text x="740" y="660" font-size="26">வ</text>
          <text x="400" y="870" font-size="22">அறம்</text>
          <text x="1060" y="700" font-size="22">நீர்</text>
        </g>
      </svg>
    `;
  }

  // ------------------------------------------------------------
  // 2. Tri-Domain Optical Interferometer / Astrolabe Diagram
  // ------------------------------------------------------------
  function renderConvergenceVisualization(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // ViewBox: 800 x 540 — perfectly balanced, responsive, non-clipped
    container.innerHTML = `
      <div class="convergence-chamber">
        <svg class="convergence-svg" viewBox="0 0 800 540" preserveAspectRatio="xMidYMid meet" aria-label="Tri-Domain Optical Interferometer Architecture">
          <defs>
            <!-- Marker Definitions for Vector Calibration Lines -->
            <marker id="marker-astro-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 8 4 L 0 7 z" fill="#204A78" />
            </marker>
            <marker id="marker-bio-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 8 4 L 0 7 z" fill="#1C5E43" />
            </marker>
            <marker id="marker-tamil-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 1 L 8 4 L 0 7 z" fill="#823329" />
            </marker>
          </defs>

          <!-- Instrument Frame & Coordinate Baseline -->
          <rect x="10" y="10" width="780" height="520" fill="none" stroke="rgba(67, 78, 86, 0.15)" stroke-width="0.8" />
          <line x1="400" y1="10" x2="400" y2="530" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.6" stroke-dasharray="4 4" />
          <line x1="10" y1="260" x2="790" y2="260" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.6" stroke-dasharray="4 4" />

          <!-- Corner Registration Crosses -->
          <g stroke="rgba(67, 78, 86, 0.3)" stroke-width="0.8">
            <path d="M 20 20 L 30 20 M 25 15 L 25 25" />
            <path d="M 770 20 L 780 20 M 775 15 L 775 25" />
            <path d="M 20 520 L 30 520 M 25 515 L 25 525" />
            <path d="M 770 520 L 780 520 M 775 515 L 775 525" />
          </g>

          <!-- Outer Astrolabe Calibrated Degree Ring (Center: 400, 260) -->
          <g transform="translate(400, 260)">
            <circle cx="0" cy="0" r="220" fill="none" stroke="rgba(67, 78, 86, 0.16)" stroke-width="0.8" />
            <circle cx="0" cy="0" r="226" fill="none" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.5" />
            <!-- Cardinal Degree Marks -->
            <line x1="0" y1="-220" x2="0" y2="-226" stroke="#56626B" stroke-width="1" />
            <line x1="220" y1="0" x2="226" y2="0" stroke="#56626B" stroke-width="1" />
            <line x1="0" y1="220" x2="0" y2="226" stroke="#56626B" stroke-width="1" />
            <line x1="-220" y1="0" x2="-226" y2="0" stroke="#56626B" stroke-width="1" />
          </g>

          <!-- Inter-Domain Triangulation Resonance Web -->
          <g stroke-width="0.8" opacity="0.7">
            <!-- Triad baseline: Astro (190, 130), Bio (610, 130), Tamil (400, 420) -->
            <polygon points="190,130 610,130 400,420" fill="none" stroke="rgba(67, 78, 86, 0.12)" stroke-dasharray="4 4" />
            <!-- Harmonic arcs connecting the domain apertures -->
            <path d="M 190 130 Q 400 90 610 130" fill="none" stroke="rgba(32, 74, 120, 0.3)" stroke-dasharray="3 3" />
            <path d="M 610 130 Q 530 300 400 420" fill="none" stroke="rgba(28, 94, 67, 0.3)" stroke-dasharray="3 3" />
            <path d="M 400 420 Q 270 300 190 130" fill="none" stroke="rgba(130, 51, 41, 0.3)" stroke-dasharray="3 3" />
          </g>

          <!-- Convergence Influx Lines to Center (400, 260) -->
          <g>
            <!-- Astronomy Vector Axis -->
            <line x1="190" y1="130" x2="350" y2="230" stroke="var(--color-astro)" stroke-width="1.4" stroke-dasharray="6 4" class="anim-vernier-flow" marker-end="url(#marker-astro-arrow)" />
            <!-- Biology Vector Axis -->
            <line x1="610" y1="130" x2="450" y2="230" stroke="var(--color-bio)" stroke-width="1.4" stroke-dasharray="6 4" class="anim-vernier-flow" marker-end="url(#marker-bio-arrow)" />
            <!-- Classical Tamil Vector Axis -->
            <line x1="400" y1="420" x2="400" y2="310" stroke="var(--color-tamil)" stroke-width="1.4" stroke-dasharray="6 4" class="anim-vernier-flow" marker-end="url(#marker-tamil-arrow)" />
          </g>

          <!-- Concentric 1D -> 2D -> 3D -> 4D Dimensional Expansion Calibration Rings -->
          <g transform="translate(400, 260)">
            <!-- 1D Dimension Ring: Literal / Text -->
            <circle cx="0" cy="0" r="54" fill="none" stroke="var(--color-1d)" stroke-width="1.2" />
            <!-- 2D Dimension Ring: Interpretation / Context -->
            <circle cx="0" cy="0" r="88" fill="none" stroke="var(--color-2d)" stroke-width="1.1" stroke-dasharray="5 4" />
            <!-- 3D Dimension Ring: Symbol / Concept / Relationship -->
            <circle cx="0" cy="0" r="124" fill="none" stroke="var(--color-3d)" stroke-width="1" stroke-dasharray="3 3" />
            <!-- 4D Dimension Ring: Future / Hypothetical / Temporal -->
            <circle cx="0" cy="0" r="162" fill="none" stroke="var(--color-4d)" stroke-width="0.9" stroke-dasharray="7 5" />

            <!-- Dimensional Calibration Indices -->
            <g font-family="'JetBrains Mono', 'Consolas', monospace" font-size="8" font-weight="700">
              <text x="0" y="-58" text-anchor="middle" fill="var(--color-1d)">[1D: LITERAL / TEXT]</text>
              <text x="96" y="3" text-anchor="start" fill="var(--color-2d)">[2D: CONTEXT]</text>
              <text x="0" y="136" text-anchor="middle" fill="var(--color-3d)">[3D: RELATIONSHIP]</text>
              <text x="-170" y="3" text-anchor="end" fill="var(--color-4d)">[4D: TEMPORAL]</text>
            </g>
          </g>

          <!-- Central Multidimensional Knowledge Core Aperture (400, 260) -->
          <g transform="translate(400, 260)">
            <!-- Instrument Reticle Housing -->
            <circle cx="0" cy="0" r="38" fill="var(--bg-plinth)" stroke="var(--ink-primary)" stroke-width="1.5" />
            <circle cx="0" cy="0" r="34" fill="none" stroke="var(--color-cross)" stroke-width="0.8" stroke-dasharray="4 3" class="${isReducedMotion() ? "" : "anim-reticle-slow"}" />
            <circle cx="0" cy="0" r="12" fill="none" stroke="var(--ink-secondary)" stroke-width="0.8" />
            <!-- Crosshair Lines -->
            <line x1="-38" y1="0" x2="-14" y2="0" stroke="var(--ink-primary)" stroke-width="1" />
            <line x1="14" y1="0" x2="38" y2="0" stroke="var(--ink-primary)" stroke-width="1" />
            <line x1="0" y1="-38" x2="0" y2="-14" stroke="var(--ink-primary)" stroke-width="1" />
            <line x1="0" y1="14" x2="0" y2="38" stroke="var(--ink-primary)" stroke-width="1" />
            <!-- Central Pivot Point -->
            <circle cx="0" cy="0" r="2.5" fill="var(--color-cross)" />

            <!-- Core Technical Identifier (Framed in Monospace) -->
            <g font-family="'JetBrains Mono', 'Consolas', monospace" font-size="7.5" font-weight="800" letter-spacing="0.12em">
              <text x="0" y="-7" text-anchor="middle" fill="var(--ink-primary)">MULTIDIMENSIONAL</text>
              <text x="0" y="6" text-anchor="middle" fill="var(--ink-primary)">KNOWLEDGE</text>
              <text x="0" y="18" text-anchor="middle" fill="var(--color-cross)" font-size="6.5">CORE // 1D-4D</text>
            </g>
          </g>

          <!-- Domain Station 1: Astronomy / Astrophysics (190, 130) -->
          <g transform="translate(190, 130)">
            <!-- Outer Keplerian Track -->
            <ellipse cx="0" cy="0" rx="48" ry="20" transform="rotate(-20)" fill="none" stroke="rgba(32, 74, 120, 0.3)" stroke-width="0.8" stroke-dasharray="3 3" />
            <!-- Station Frame -->
            <circle cx="0" cy="0" r="36" fill="var(--bg-paper)" stroke="var(--color-astro)" stroke-width="1.4" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(32, 74, 120, 0.25)" stroke-width="0.75" />
            <!-- Precision Astronomical Vector Glyph (Concentric Circles + Crosshair) -->
            <circle cx="0" cy="-6" r="8" fill="none" stroke="var(--color-astro)" stroke-width="1" />
            <circle cx="0" cy="-6" r="1.5" fill="var(--color-astro)" />
            <line x1="-12" y1="-6" x2="12" y2="-6" stroke="var(--color-astro)" stroke-width="0.8" />
            <!-- Typography -->
            <text x="0" y="12" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="800" fill="var(--color-astro)" letter-spacing="0.08em">ASTRONOMY</text>
            <text x="0" y="21" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="6" fill="var(--ink-muted)" letter-spacing="0.06em">ASTROPHYSICS</text>
          </g>

          <!-- Domain Station 2: Biology / Biological Systems (610, 130) -->
          <g transform="translate(610, 130)">
            <!-- Molecular Hexagonal Vector Frame -->
            <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="rgba(28, 94, 67, 0.3)" stroke-width="0.8" stroke-dasharray="3 3" />
            <!-- Station Frame -->
            <circle cx="0" cy="0" r="36" fill="var(--bg-paper)" stroke="var(--color-bio)" stroke-width="1.4" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(28, 94, 67, 0.25)" stroke-width="0.75" />
            <!-- Precision Biological Vector Glyph (Molecular Bonds Ring) -->
            <polygon points="0,-12 8,-7 8,3 0,8 -8,3 -8,-7" fill="none" stroke="var(--color-bio)" stroke-width="1" />
            <line x1="0" y1="-12" x2="0" y2="-16" stroke="var(--color-bio)" stroke-width="0.8" />
            <line x1="8" y1="3" x2="12" y2="5" stroke="var(--color-bio)" stroke-width="0.8" />
            <!-- Typography -->
            <text x="0" y="12" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="800" fill="var(--color-bio)" letter-spacing="0.08em">BIOLOGY</text>
            <text x="0" y="21" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="6" fill="var(--ink-muted)" letter-spacing="0.06em">BIO SYSTEMS</text>
          </g>

          <!-- Domain Station 3: Classical Tamil Literature (400, 420) -->
          <g transform="translate(400, 420)">
            <!-- Archival Sangam Lotus Coordinate Frame -->
            <rect x="-44" y="-44" width="88" height="88" rx="14" fill="none" stroke="rgba(130, 51, 41, 0.3)" stroke-width="0.8" stroke-dasharray="3 3" />
            <!-- Station Frame -->
            <circle cx="0" cy="0" r="36" fill="var(--bg-paper)" stroke="var(--color-tamil)" stroke-width="1.4" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(130, 51, 41, 0.25)" stroke-width="0.75" />
            <!-- Precision Epigraphic Glyph (Old Tamil Root Ligature 'அ') -->
            <text x="0" y="-1" text-anchor="middle" font-family="'Latha', 'Nirmala UI', serif" font-size="16" font-weight="700" fill="var(--color-tamil)">அ</text>
            <!-- Typography -->
            <text x="0" y="14" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="800" fill="var(--color-tamil)" letter-spacing="0.08em">CLASSICAL TAMIL</text>
            <text x="0" y="23" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="6" fill="var(--ink-muted)" letter-spacing="0.06em">SANGAM CORPUS</text>
          </g>
        </svg>
      </div>
    `;
  }

  // ------------------------------------------------------------
  // 3. Optical Aperture Shutter Transitions
  // ------------------------------------------------------------
  function playLoginToIntroTransition(callback) {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay || isReducedMotion()) {
      if (typeof callback === "function") callback();
      return;
    }

    overlay.innerHTML = `
      <div class="transition-shutter-reticle"></div>
      <div class="transition-status-text">CALIBRATING RETICLE // OPENING RESEARCH APERTURE</div>
    `;
    overlay.hidden = false;
    // Force reflow
    void overlay.offsetWidth;
    overlay.classList.add("active");

    setTimeout(() => {
      if (typeof callback === "function") callback();
      setTimeout(() => {
        overlay.classList.remove("active");
        setTimeout(() => {
          overlay.hidden = true;
          overlay.innerHTML = "";
        }, 320);
      }, 120);
    }, 420);
  }

  function playIntroToExploreTransition(callback) {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay || isReducedMotion()) {
      if (typeof callback === "function") callback();
      return;
    }

    overlay.innerHTML = `
      <div class="transition-shutter-reticle"></div>
      <div class="transition-status-text">ALIGNING FOCAL PLANES // INITIALIZING KNOWLEDGE WORKSPACE</div>
    `;
    overlay.hidden = false;
    void overlay.offsetWidth;
    overlay.classList.add("active");

    setTimeout(() => {
      if (typeof callback === "function") callback();
      setTimeout(() => {
        overlay.classList.remove("active");
        setTimeout(() => {
          overlay.hidden = true;
          overlay.innerHTML = "";
        }, 320);
      }, 120);
    }, 420);
  }

  window.MKS_ANIMATIONS = {
    renderGlobalBackground,
    renderConvergenceVisualization,
    playLoginToIntroTransition,
    playIntroToExploreTransition,
  };
})();
