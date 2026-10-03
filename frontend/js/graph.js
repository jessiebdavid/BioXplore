/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Dependency-Free Interactive SVG Relationship Graph (3D Panel)
 *
 * Epistemic Observatory Architectural Specification:
 * - Millimeter coordinate drafting grid with polar focal rings
 * - Precision vector nodes: Astronomy reticle (⊙), Biology hexagon, Classical Tamil epigraphy (அ)
 * - Calibrated hairline drafting edges with mechanical dashed flow
 * - Tabular monospaced evidence indices ([FACT], [OBS], [TEXT], [INTERP], [ANALOGY], [HYPO])
 * - Interactive spotlight inspection: isolates causal chains and dims extraneous nodes
 * - Zero emojis, zero glowing balls
 * ============================================================ */

(function () {
  const DOMAIN_CONFIG = {
    astronomy: {
      color: "#204A78",
      lightColor: "rgba(32, 74, 120, 0.08)",
      ruleColor: "rgba(32, 74, 120, 0.35)",
      type: "astro",
      label: "Astronomy",
    },
    biology: {
      color: "#1C5E43",
      lightColor: "rgba(28, 94, 67, 0.08)",
      ruleColor: "rgba(28, 94, 67, 0.35)",
      type: "bio",
      label: "Biology",
    },
    tamil: {
      color: "#823329",
      lightColor: "rgba(130, 51, 41, 0.08)",
      ruleColor: "rgba(130, 51, 41, 0.35)",
      type: "tamil",
      label: "Classical Tamil",
    },
    cross: {
      color: "#9E6E28",
      lightColor: "rgba(158, 110, 40, 0.08)",
      ruleColor: "rgba(158, 110, 40, 0.35)",
      type: "cross",
      label: "Cross-Domain",
    },
  };

  function inferDomain(entityName, relDomains) {
    const norm = (entityName || "").toLowerCase();
    if (
      norm.includes("black hole") ||
      norm.includes("white hole") ||
      norm.includes("singularity") ||
      norm.includes("kepler") ||
      norm.includes("orbit") ||
      norm.includes("radiation") ||
      norm.includes("plasma") ||
      norm.includes("earth planetary rotation") ||
      norm.includes("solar") ||
      norm.includes("stellar") ||
      norm.includes("nucleosynthesis")
    ) {
      return "astronomy";
    }
    if (
      norm.includes("dna") ||
      norm.includes("rna") ||
      norm.includes("protein") ||
      norm.includes("gene") ||
      norm.includes("mutation") ||
      norm.includes("circadian") ||
      norm.includes("suprachiasmatic") ||
      norm.includes("scn") ||
      norm.includes("cellular") ||
      norm.includes("enzyme") ||
      norm.includes("senescence") ||
      norm.includes("respiration") ||
      norm.includes("mitochondri")
    ) {
      return "biology";
    }
    if (
      norm.includes("thirukkural") ||
      norm.includes("tholkappiyam") ||
      norm.includes("thiruvalluvar") ||
      norm.includes("neer") ||
      norm.includes("vaan") ||
      norm.includes("ulagam") ||
      norm.includes("ethical") ||
      norm.includes("tamil") ||
      norm.includes("aram") ||
      norm.includes("rain") ||
      norm.includes("water")
    ) {
      return "tamil";
    }

    if (Array.isArray(relDomains) && relDomains.length > 0) {
      const d = relDomains[0].toLowerCase();
      if (d.includes("astro")) return "astronomy";
      if (d.includes("bio")) return "biology";
      if (d.includes("tamil")) return "tamil";
    }

    return "cross";
  }

  function getEvidenceBadgeConfig(label) {
    const norm = (label || "").toUpperCase();
    if (norm.includes("FACT")) return { text: "[FACT]", color: "#1C5E43" };
    if (norm.includes("OBSERVATIONAL")) return { text: "[OBS]", color: "#204A78" };
    if (norm.includes("TEXTUAL")) return { text: "[TEXT]", color: "#823329" };
    if (norm.includes("INTERPRETATION")) return { text: "[INTERP]", color: "#434E56" };
    if (norm.includes("ANALOGY")) return { text: "[ANALOGY]", color: "#9E6E28" };
    if (norm.includes("HYPOTHESIS") || norm.includes("SPECULATION")) return { text: "[HYPO]", color: "#9E6E28" };
    return { text: "[EVID]", color: "#66727B" };
  }

  function renderNodeVectorGlyph(domainType, color) {
    if (domainType === "astro") {
      // Precision astronomical vector reticle (center crosshair + target circle)
      return `
        <circle cx="0" cy="0" r="5" fill="none" stroke="${color}" stroke-width="0.9" />
        <circle cx="0" cy="0" r="1.2" fill="${color}" />
        <line x1="-9" y1="0" x2="-5" y2="0" stroke="${color}" stroke-width="0.8" />
        <line x1="5" y1="0" x2="9" y2="0" stroke="${color}" stroke-width="0.8" />
        <line x1="0" y1="-9" x2="0" y2="-5" stroke="${color}" stroke-width="0.8" />
        <line x1="0" y1="5" x2="0" y2="9" stroke="${color}" stroke-width="0.8" />
      `;
    }
    if (domainType === "bio") {
      // Precision molecular hexagonal ring
      return `
        <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill="none" stroke="${color}" stroke-width="0.9" />
        <circle cx="0" cy="0" r="1.2" fill="${color}" />
      `;
    }
    if (domainType === "tamil") {
      // Archival classical Tamil root ligature 'அ'
      return `
        <text x="0" y="4" text-anchor="middle" font-family="'Latha', 'Nirmala UI', serif" font-size="11" font-weight="700" fill="${color}">அ</text>
      `;
    }
    // Cross-domain: Precision diamond reticle
    return `
      <polygon points="0,-7 7,0 0,7 -7,0" fill="none" stroke="${color}" stroke-width="0.9" />
      <circle cx="0" cy="0" r="1.2" fill="${color}" />
    `;
  }

  function renderGraph(containerId, relationships) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!Array.isArray(relationships) || relationships.length === 0) {
      container.innerHTML = `
        <div class="empty-graph-notice" style="padding: 2rem; text-align: center; font-family: var(--font-mono); font-size: 0.8rem; color: var(--ink-muted);">
          [NOTICE: NO DIRECT TOPOLOGICAL EDGES MAPPED FOR CURRENT QUERY CONTEXT]
        </div>
      `;
      return;
    }

    // Extract unique nodes
    const nodeMap = new Map();
    relationships.forEach((rel) => {
      if (rel.from_entity && !nodeMap.has(rel.from_entity)) {
        const domKey = inferDomain(rel.from_entity, rel.domains);
        nodeMap.set(rel.from_entity, {
          id: rel.from_entity,
          domain: domKey,
          conf: DOMAIN_CONFIG[domKey],
          connected: new Set(),
        });
      }
      if (rel.to_entity && !nodeMap.has(rel.to_entity)) {
        const domKey = inferDomain(rel.to_entity, rel.domains);
        nodeMap.set(rel.to_entity, {
          id: rel.to_entity,
          domain: domKey,
          conf: DOMAIN_CONFIG[domKey],
          connected: new Set(),
        });
      }
      if (rel.from_entity && rel.to_entity) {
        nodeMap.get(rel.from_entity).connected.add(rel.to_entity);
        nodeMap.get(rel.to_entity).connected.add(rel.from_entity);
      }
    });

    const nodes = Array.from(nodeMap.values());
    const width = 800;
    const height = 440;
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = Math.min(width, height) * 0.44;
    const radiusY = Math.min(width, height) * 0.35;

    // Distribute nodes in elliptical perimeter
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      node.x = centerX + radiusX * Math.cos(angle);
      node.y = centerY + radiusY * Math.sin(angle);
    });

    // Build SVG Elements
    const svgParts = [];
    svgParts.push(`
      <svg class="mks-graph-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Dynamic Arrowhead Markers -->
          <marker id="arrow-default" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 2 L 10 5 L 0 8 z" fill="rgba(67, 78, 86, 0.65)" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 2 L 10 5 L 0 8 z" fill="#141A1E" />
          </marker>

          <!-- Graph Grid Pattern for Scientific Background -->
          <pattern id="graph-inner-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(67, 78, 86, 0.04)" stroke-width="0.75" />
          </pattern>
        </defs>

        <!-- Millimeter Coordinate Drafting Grid -->
        <rect width="${width}" height="${height}" fill="url(#graph-inner-grid)" />

        <!-- Optical Center Polar Coordinates -->
        <circle cx="${centerX}" cy="${centerY}" r="70" fill="none" stroke="rgba(67, 78, 86, 0.12)" stroke-width="0.8" stroke-dasharray="4 4" />
        <circle cx="${centerX}" cy="${centerY}" r="140" fill="none" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.7" />
        <circle cx="${centerX}" cy="${centerY}" r="210" fill="none" stroke="rgba(67, 78, 86, 0.05)" stroke-width="0.5" stroke-dasharray="6 6" />

        <!-- Polar Axis Crosshairs -->
        <line x1="${centerX - 240}" y1="${centerY}" x2="${centerX + 240}" y2="${centerY}" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.75" stroke-dasharray="6 4" />
        <line x1="${centerX}" y1="${centerY - 160}" x2="${centerX}" y2="${centerY + 160}" stroke="rgba(67, 78, 86, 0.08)" stroke-width="0.75" stroke-dasharray="6 4" />

        <!-- Center Stage Monospaced Coordinate Index -->
        <text x="${centerX}" y="${centerY - 8}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" font-weight="700" fill="rgba(67, 78, 86, 0.35)" letter-spacing="0.1em">TOPOLOGICAL INTERFEROMETER // 3D STAGE</text>
        <circle cx="${centerX}" cy="${centerY}" r="2" fill="rgba(67, 78, 86, 0.3)" />
    `);

    // Render Edges
    svgParts.push('<g class="graph-edges">');
    relationships.forEach((rel, idx) => {
      const source = nodeMap.get(rel.from_entity);
      const target = nodeMap.get(rel.to_entity);
      if (!source || !target) return;

      const isHypothesis =
        rel.evidence_label === "HYPOTHESIS / SPECULATION" ||
        rel.evidence_label === "CONCEPTUAL ANALOGY" ||
        rel.relationship_type === "CROSS-DOMAIN ANALOGY";

      const strokeDash = isHypothesis ? 'stroke-dasharray="5 4"' : 'stroke-dasharray="8 5"';
      const edgeClass = isHypothesis ? "edge-line edge-dashed anim-edge-pulse" : "edge-line edge-solid anim-edge-flow";
      const evBadge = getEvidenceBadgeConfig(rel.evidence_label);

      // Midpoint for relationship label
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      svgParts.push(`
        <g class="graph-edge-group" data-source="${source.id}" data-target="${target.id}" id="edge-${idx}">
          <line
            x1="${source.x}"
            y1="${source.y}"
            x2="${target.x}"
            y2="${target.y}"
            class="${edgeClass}"
            ${strokeDash}
            marker-end="url(#arrow-default)"
          />
          <g class="edge-label-badge" transform="translate(${midX}, ${midY})">
            <rect x="-68" y="-10" width="136" height="20" class="edge-badge-bg" />
            <text x="-56" y="3.5" text-anchor="start" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="800" fill="${evBadge.color}">
              ${evBadge.text}
            </text>
            <text x="4" y="3" text-anchor="middle" class="edge-badge-text">
              ${(rel.relationship_type || "RELATION").substring(0, 16)}
            </text>
          </g>
        </g>
      `);
    });
    svgParts.push("</g>");

    // Render Nodes
    svgParts.push('<g class="graph-nodes">');
    nodes.forEach((node) => {
      const conf = node.conf;
      svgParts.push(`
        <g class="graph-node" data-id="${node.id}" transform="translate(${node.x}, ${node.y})" tabindex="0" role="button" aria-label="Scientific Entity: ${node.id} (${conf.label})">
          <!-- Outer Inspection Halo -->
          <circle cx="0" cy="0" r="28" fill="${conf.lightColor}" class="node-halo" />
          <!-- Main Node Disc (Architectural Drafting Plinth) -->
          <circle cx="0" cy="0" r="20" fill="var(--bg-paper)" stroke="${conf.color}" stroke-width="1.6" class="node-circle" />
          <circle cx="0" cy="0" r="16" fill="none" stroke="${conf.ruleColor}" stroke-width="0.6" stroke-dasharray="2 2" />
          <!-- Vector Domain Icon Geometry (Zero Emoji) -->
          ${renderNodeVectorGlyph(conf.type, conf.color)}
          <!-- Monospaced Scientific Coordinate Label -->
          <g class="node-label-group" transform="translate(0, 32)">
            <rect x="-65" y="-9" width="130" height="18" fill="var(--bg-paper)" stroke="var(--rule-hairline)" stroke-width="0.75" />
            <text x="0" y="3.5" text-anchor="middle" class="node-label">
              ${node.id.length > 20 ? node.id.substring(0, 18) + "…" : node.id}
            </text>
          </g>
        </g>
      `);
    });
    svgParts.push("</g>");

    svgParts.push("</svg>");
    container.innerHTML = svgParts.join("");

    // Wire Interactive Spotlighting
    const svgEl = container.querySelector(".mks-graph-svg");
    const nodeEls = container.querySelectorAll(".graph-node");
    const edgeEls = container.querySelectorAll(".graph-edge-group");

    function highlightNode(nodeId) {
      if (!svgEl) return;
      svgEl.classList.add("has-selection");

      const nodeData = nodeMap.get(nodeId);
      const connectedIds = nodeData ? nodeData.connected : new Set();

      nodeEls.forEach((el) => {
        const id = el.getAttribute("data-id");
        if (id === nodeId || connectedIds.has(id)) {
          el.classList.add("highlighted");
          el.classList.remove("dimmed");
        } else {
          el.classList.add("dimmed");
          el.classList.remove("highlighted");
        }
      });

      edgeEls.forEach((el) => {
        const src = el.getAttribute("data-source");
        const tgt = el.getAttribute("data-target");
        if (src === nodeId || tgt === nodeId) {
          el.classList.add("highlighted");
          el.classList.remove("dimmed");
          const line = el.querySelector(".edge-line");
          if (line) line.setAttribute("marker-end", "url(#arrow-active)");
        } else {
          el.classList.add("dimmed");
          el.classList.remove("highlighted");
          const line = el.querySelector(".edge-line");
          if (line) line.setAttribute("marker-end", "url(#arrow-default)");
        }
      });
    }

    function clearHighlight() {
      if (!svgEl) return;
      svgEl.classList.remove("has-selection");
      nodeEls.forEach((el) => {
        el.classList.remove("highlighted", "dimmed");
      });
      edgeEls.forEach((el) => {
        el.classList.remove("highlighted", "dimmed");
        const line = el.querySelector(".edge-line");
        if (line) line.setAttribute("marker-end", "url(#arrow-default)");
      });
    }

    nodeEls.forEach((el) => {
      const id = el.getAttribute("data-id");
      el.addEventListener("mouseenter", () => highlightNode(id));
      el.addEventListener("focus", () => highlightNode(id));
      el.addEventListener("mouseleave", clearHighlight);
      el.addEventListener("blur", clearHighlight);
    });
  }

  window.MKS_GRAPH = {
    renderGraph,
    inferDomain,
  };
})();
