/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Epistemic Observatory Result Renderer (Optical Focal Planes)
 *
 * Renders query results as 7 continuous optical focal planes:
 * 1. [PLANE 01] Query Understanding & Deconstruction
 * 2. [PLANE 02] Activated Epistemic Dimensions (1D, 2D, 3D, 4D)
 * 3. [PLANE 03] Retrieved Knowledge (1D Literal Facts & Classical Tamil Manuscript; 2D Context)
 * 4. [PLANE 04] Relationship Analysis (3D Topological Vector Graph & Mapped Links)
 * 5. [PLANE 05] Cross-Domain Epistemic Analysis (with Epistemic Warning Notice)
 * 6. [PLANE 06] Final Result (Multidimensional Synthesis & 4D Temporal Dynamics)
 * 7. [PLANE 07] Sources & Archival Provenance Ledger
 *
 * Strict Semantics Preserved:
 * - 1D = Literal / Text / direct facts
 * - 2D = Interpretation / Context
 * - 3D = Symbol / Concept / Relationship
 * - 4D = Future / Hypothetical / Temporal
 * - Zero emojis, archival typography, spatial layout
 * ============================================================ */

(function () {
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getEvidenceBadgeClass(label) {
    const norm = (label || "").toUpperCase();
    if (norm.includes("FACT")) return "chip-evidence chip-fact";
    if (norm.includes("OBSERVATIONAL")) return "chip-evidence chip-obs";
    if (norm.includes("TEXTUAL")) return "chip-evidence chip-textual";
    if (norm.includes("INTERPRETATION")) return "chip-evidence chip-interp";
    if (norm.includes("ANALOGY")) return "chip-evidence chip-analogy";
    if (norm.includes("HYPOTHESIS") || norm.includes("SPECULATION")) return "chip-evidence chip-hypo";
    return "chip-evidence";
  }

  function getDomainBadgeClass(domain) {
    const norm = (domain || "").toLowerCase();
    if (norm.includes("astro")) return "chip-domain chip-astro";
    if (norm.includes("bio")) return "chip-domain chip-bio";
    if (norm.includes("tamil")) return "chip-domain chip-tamil";
    return "chip-domain chip-cross";
  }

  // ------------------------------------------------------------
  // PLANE 01: Query Understanding & Deconstruction
  // ------------------------------------------------------------
  function renderQueryUnderstanding(queryData) {
    if (!queryData) return "";

    const domains = queryData.domains || [];
    const entities = queryData.entities || [];
    const concepts = queryData.concepts || [];

    const domainChips = domains
      .map((d) => `<span class="chip ${getDomainBadgeClass(d)}">[${escapeHtml(d).toUpperCase()}]</span>`)
      .join(" ");

    const entityChips = entities
      .map((e) => `<span class="chip chip-entity">${escapeHtml(e)}</span>`)
      .join(" ");

    const conceptChips = concepts
      .map((c) => `<span class="chip chip-concept">${escapeHtml(c)}</span>`)
      .join(" ");

    return `
      <section class="optical-plane" id="plane-query-understanding" aria-label="Query Understanding">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 01 // QUERY DECONSTRUCTION &amp; SPECTRAL DECOMPOSITION]</span>
            <h3 class="plane-title">Query Understanding</h3>
          </div>
          <span class="plane-tag">[INPUT: ${escapeHtml(queryData.input_type || "PROMPT")}]</span>
        </div>

        <div class="qu-grid">
          <div class="qu-item">
            <span class="qu-label">Detected Research Domains</span>
            <div class="chip-wrap">${domainChips || '<span style="color: var(--ink-muted);">None detected</span>'}</div>
          </div>
          <div class="qu-item">
            <span class="qu-label">Epistemic Intent</span>
            <span class="qu-value-highlight">${escapeHtml(queryData.intent || "Cross-Dimensional Knowledge Synthesis")}</span>
          </div>
          <div class="qu-item full-width">
            <span class="qu-label">Extracted Scientific &amp; Cultural Entities</span>
            <div class="chip-wrap">${entityChips || '<span style="color: var(--ink-muted);">None</span>'}</div>
          </div>
          <div class="qu-item full-width">
            <span class="qu-label">Extracted Concepts &amp; Epistemic Markers</span>
            <div class="chip-wrap">${conceptChips || '<span style="color: var(--ink-muted);">None</span>'}</div>
          </div>
        </div>
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 02: Activated Epistemic Dimensions Navigator
  // ------------------------------------------------------------
  function renderDimensionNavigator(sections) {
    const activeDims = new Set((sections || []).map((s) => s.dimension));

    return `
      <section class="optical-plane" id="plane-activated-dimensions" aria-label="Activated Epistemic Dimensions">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 02 // ACTIVATED EPISTEMIC DIMENSIONS]</span>
            <h3 class="plane-title">Dimensional Activation Profile</h3>
          </div>
          <span class="plane-tag">[TAXONOMY: 1D - 4D]</span>
        </div>

        <div class="dim-nav-tabs">
          <button class="dim-tab ${activeDims.has("1D") ? "active-dim" : "inactive-dim"}" data-dim="1D">
            <span class="dim-num">[1D]</span>
            <span class="dim-desc">Text / Literal</span>
          </button>
          <button class="dim-tab ${activeDims.has("2D") ? "active-dim" : "inactive-dim"}" data-dim="2D">
            <span class="dim-num">[2D]</span>
            <span class="dim-desc">Interpretation / Context</span>
          </button>
          <button class="dim-tab ${activeDims.has("3D") ? "active-dim" : "inactive-dim"}" data-dim="3D">
            <span class="dim-num">[3D]</span>
            <span class="dim-desc">Symbol / Concept / Relationship</span>
          </button>
          <button class="dim-tab ${activeDims.has("4D") ? "active-dim" : "inactive-dim"}" data-dim="4D">
            <span class="dim-num">[4D]</span>
            <span class="dim-desc">Future / Hypothetical / Temporal</span>
          </button>
        </div>
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 03: Retrieved Knowledge (Tamil Manuscript, Facts, Context)
  // ------------------------------------------------------------
  function renderTamilVerseManuscript(item) {
    const meta = item.source_metadata || {};
    return `
      <div class="tamil-verse-manuscript">
        <div class="verse-header">
          <div>
            <span class="verse-badge">[CANONICAL CORPUS // SANGAM &amp; CLASSICAL TAMIL]</span>
            <h4 class="verse-title">${escapeHtml(item.verse_title || "Classical Verse")}</h4>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-tamil); font-weight: 700;">
            KURAL ${escapeHtml(item.kural_number || meta.kural_number || "—")}
          </span>
        </div>

        <div class="verse-meta-row">
          <span>CHAPTER: <strong>${escapeHtml(item.chapter || meta.chapter || "Classical Chapter")}</strong></span>
          <span>•</span>
          <span>AUTHOR: <strong>${escapeHtml(item.author || meta.author || "Thiruvalluvar")}</strong></span>
          <span>•</span>
          <span>METER: <strong>Kural Venpa</strong></span>
        </div>

        <div class="tamil-script-block">
          <div class="tamil-line">${escapeHtml(item.tamil_line_1 || item.tamil_text || "")}</div>
          ${item.tamil_line_2 ? `<div class="tamil-line">${escapeHtml(item.tamil_line_2)}</div>` : ""}
        </div>

        ${
          item.literal_translation
            ? `
          <div class="verse-literal-box">
            <div class="verse-box-label">LITERAL PHILOLOGICAL TRANSLATION (1D)</div>
            <div class="verse-box-content">${escapeHtml(item.literal_translation)}</div>
          </div>
        `
            : ""
        }

        ${
          item.interpretation
            ? `
          <div class="verse-interpretation-box">
            <div class="verse-box-label">HERMENEUTIC &amp; ECOLOGICAL CONTEXT (2D)</div>
            <div class="verse-box-content">${escapeHtml(item.interpretation)}</div>
          </div>
        `
            : ""
        }

        <div class="verse-source-box">
          <strong>PROVENANCE:</strong> ${escapeHtml(item.source || meta.source || "Classical Tamil Sangam Literature")}
        </div>
      </div>
    `;
  }

  function renderRetrievedKnowledge(sections) {
    if (!Array.isArray(sections) || sections.length === 0) return "";

    const sec1D = sections.find((s) => s.dimension === "1D");
    const sec2D = sections.find((s) => s.dimension === "2D");

    const parts = [];

    // 1D: Literal / Text
    if (sec1D) {
      parts.push(`
        <div id="dim-panel-1d" class="knowledge-section">
          <div class="plane-registration-bar">
            <div>
              <span class="plane-coord">+ [DIMENSION 1D // LITERAL EMPIRICAL FACTS &amp; PRIMARY TEXT]</span>
              <h4 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500;">Direct Empirical Data &amp; Verified Sources</h4>
            </div>
            <span class="plane-tag">[LEVEL: 1D.LITERAL]</span>
          </div>
      `);

      // Render Tamil Verse Folios if present
      if (Array.isArray(sec1D.verse_cards) && sec1D.verse_cards.length > 0) {
        sec1D.verse_cards.forEach((v) => {
          parts.push(renderTamilVerseManuscript(v));
        });
      }

      // Render Empirical Facts Ledger
      if (Array.isArray(sec1D.facts) && sec1D.facts.length > 0) {
        parts.push('<div class="facts-grid">');
        sec1D.facts.forEach((f) => {
          parts.push(`
            <div class="fact-item">
              <span class="fact-label">${escapeHtml(f.entity || f.label || "Fact")}</span>
              <div class="fact-value">${escapeHtml(f.value || f.content || f)}</div>
            </div>
          `);
        });
        parts.push("</div>");
      }

      // Render Section Description
      if (sec1D.content) {
        parts.push(`
          <div class="context-mechanism-box" style="margin-top: 1rem;">
            <p>${escapeHtml(sec1D.content)}</p>
          </div>
        `);
      }

      parts.push("</div>");
    }

    // 2D: Interpretation / Context
    if (sec2D) {
      parts.push(`
        <div id="dim-panel-2d" class="knowledge-section" style="margin-top: 2rem;">
          <div class="plane-registration-bar">
            <div>
              <span class="plane-coord">+ [DIMENSION 2D // INTERPRETATION &amp; CONTEXTUAL MECHANISMS]</span>
              <h4 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500;">Environmental &amp; Regulatory Mechanisms</h4>
            </div>
            <span class="plane-tag">[LEVEL: 2D.CONTEXT]</span>
          </div>

          <div class="context-mechanism-box">
            <p>${escapeHtml(sec2D.content || "Contextual mechanisms mapped across physical boundaries and cellular environments.")}</p>
          </div>
        </div>
      `);
    }

    return `
      <section class="optical-plane" id="plane-retrieved-knowledge" aria-label="Retrieved Knowledge">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 03 // RETRIEVED KNOWLEDGE LEDGER]</span>
            <h3 class="plane-title">Retrieved Knowledge</h3>
          </div>
          <span class="plane-tag">[1D &amp; 2D SYNTHESIS]</span>
        </div>
        ${parts.join("")}
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 04: Relationship Analysis (3D Graph & Mapped Links)
  // ------------------------------------------------------------
  function renderRelationshipAnalysis(relationships) {
    const rels = Array.isArray(relationships) ? relationships : [];

    const relRows = rels.map((r) => {
      const evClass = getEvidenceBadgeClass(r.evidence_label);
      return `
        <div class="rel-row">
          <div class="rel-entities">
            <span>${escapeHtml(r.from_entity || "Source")}</span>
            <span class="rel-arrow">─►</span>
            <span>${escapeHtml(r.to_entity || "Target")}</span>
          </div>
          <div class="rel-badges">
            <span class="chip-rel-type">${escapeHtml(r.relationship_type || "RELATIONSHIP")}</span>
            <span class="chip ${evClass}">[${escapeHtml(r.evidence_label || "EVIDENCE")}]</span>
          </div>
          ${r.description ? `<p class="rel-desc">${escapeHtml(r.description)}</p>` : ""}
        </div>
      `;
    }).join("");

    return `
      <section class="optical-plane" id="dim-panel-3d" aria-label="Relationship Analysis">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 04 // TOPOLOGICAL RELATIONSHIP NETWORK &amp; VECTOR GRAPH]</span>
            <h3 class="plane-title">Relationship Analysis</h3>
          </div>
          <span class="plane-tag">[LEVEL: 3D.TOPOLOGY]</span>
        </div>

        <div class="graph-container-wrapper">
          <div id="graph-viewport-mount" class="graph-viewport"></div>
          <p class="graph-instructions">
            OPTICAL BENCH: HOVER OR FOCUS A NODE TO SPOTLIGHT DIRECT CAUSAL CHAINS AND DIM EXTANEOUS TOPOLOGY.
          </p>
        </div>

        <div class="relationship-list" style="margin-top: 1.5rem;">
          <span class="section-eyebrow">MAPPED TOPOLOGICAL EDGES (${rels.length})</span>
          ${relRows || '<p style="color: var(--ink-muted); font-size: 0.85rem;">No explicit relationship pairs mapped.</p>'}
        </div>
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 05: Cross-Domain Epistemic Analysis
  // ------------------------------------------------------------
  function renderCrossDomainAnalysis(crossDomain) {
    if (!crossDomain) return "";

    return `
      <section class="optical-plane" id="plane-cross-domain-analysis" aria-label="Cross-Domain Epistemic Analysis">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 05 // CROSS-DOMAIN EPISTEMIC ANALYSIS]</span>
            <h3 class="plane-title">Interdisciplinary Synthesis</h3>
          </div>
          <span class="plane-tag">[SYNTHESIS: MULTI-DISCIPLINARY]</span>
        </div>

        <!-- Strict Epistemic Warning Notice -->
        <div class="epistemic-warning-card">
          <div class="epistemic-warning-header">
            <span class="warning-badge">EPISTEMIC BOUNDARY NOTICE</span>
            <h4 class="epistemic-warning-title">Non-Conflation of Empirical Causality &amp; Hermeneutic Analogy</h4>
          </div>
          <p class="epistemic-warning-body">
            ${escapeHtml(
              crossDomain.epistemic_warning ||
                "This cross-domain synthesis establishes an epistemological resonance rather than literal physical identity. Biological metabolic cycles, relativistic spacetime mechanics, and classical Sangam hydraulic ethics operate within distinct epistemological paradigms."
            )}
          </p>
        </div>

        ${
          crossDomain.synthesis
            ? `
          <div class="cross-domain-synthesis-box">
            <div class="section-eyebrow" style="color: var(--color-cross); margin-bottom: 0.5rem;">SYNTHESIS PROSE</div>
            <p>${escapeHtml(crossDomain.synthesis)}</p>
          </div>
        `
            : ""
        }
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 06: Final Result (Multidimensional Summary & 4D Temporal Dynamics)
  // ------------------------------------------------------------
  function renderFinalResult(summary, sec4D) {
    let timelineHtml = "";
    if (sec4D && Array.isArray(sec4D.timeline) && sec4D.timeline.length > 0) {
      const steps = sec4D.timeline
        .map(
          (step, idx) => `
        <div class="timeline-step">
          <div class="step-num">T${idx + 1}</div>
          <div class="step-content">
            <strong style="font-family: var(--font-mono); font-size: 0.85rem; display: block; margin-bottom: 0.2rem;">
              ${escapeHtml(step.epoch || step.label || "Epoch")}
            </strong>
            <span>${escapeHtml(step.description || step.content || step)}</span>
          </div>
        </div>
      `
        )
        .join("");

      timelineHtml = `
        <div id="dim-panel-4d" class="timeline-container">
          <div class="plane-registration-bar">
            <div>
              <span class="plane-coord">+ [DIMENSION 4D // FUTURE / HYPOTHETICAL / TEMPORAL HORIZON]</span>
              <h4 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500;">Chronological Progression &amp; Future Dynamics</h4>
            </div>
            <span class="plane-tag">[LEVEL: 4D.TEMPORAL]</span>
          </div>
          <div class="timeline-track">${steps}</div>
        </div>
      `;
    } else if (sec4D && sec4D.content) {
      timelineHtml = `
        <div id="dim-panel-4d" class="timeline-container">
          <div class="plane-registration-bar">
            <div>
              <span class="plane-coord">+ [DIMENSION 4D // TEMPORAL DYNAMICS]</span>
              <h4 style="font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500;">Temporal Dynamics &amp; Projections</h4>
            </div>
            <span class="plane-tag">[LEVEL: 4D.TEMPORAL]</span>
          </div>
          <div class="context-mechanism-box">
            <p>${escapeHtml(sec4D.content)}</p>
          </div>
        </div>
      `;
    }

    return `
      <section class="optical-plane" id="plane-final-result" aria-label="Final Result">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 06 // MULTIDIMENSIONAL SYNTHESIS &amp; 4D PROJECTION]</span>
            <h3 class="plane-title">Final Synthesis</h3>
          </div>
          <span class="plane-tag">[EPISTEMIC HORIZON]</span>
        </div>

        <div class="summary-body">
          ${escapeHtml(summary || "Multidimensional knowledge synthesis completed across active epistemic dimensions.")}
        </div>

        ${timelineHtml}
      </section>
    `;
  }

  // ------------------------------------------------------------
  // PLANE 07: Archival Sources & Provenance Ledger
  // ------------------------------------------------------------
  function renderSourcesLedger(sources) {
    const list = Array.isArray(sources) ? sources : [];
    if (list.length === 0) return "";

    const items = list
      .map(
        (src, idx) => `
      <div class="source-item">
        <span class="plane-coord">[REF ${String(idx + 1).padStart(2, "0")}]</span>
        <div class="source-title">${escapeHtml(src.title || src.name || "Archival Source")}</div>
        <div class="source-meta">
          <span>DOMAIN: <strong>${escapeHtml(src.domain || "Cross-Domain")}</strong></span>
          ${src.author ? `<span> • AUTHOR: <strong>${escapeHtml(src.author)}</strong></span>` : ""}
          ${src.year ? `<span> • YEAR: <strong>${escapeHtml(src.year)}</strong></span>` : ""}
        </div>
        ${src.citation ? `<div class="source-citation">${escapeHtml(src.citation)}</div>` : ""}
      </div>
    `
      )
      .join("");

    return `
      <section class="optical-plane" id="plane-sources" aria-label="Archival Sources &amp; Provenance">
        <div class="plane-registration-bar">
          <div>
            <span class="plane-coord">+ [PLANE 07 // ARCHIVAL PROVENANCE &amp; BIBLIOGRAPHY]</span>
            <h3 class="plane-title">Sources &amp; Citations</h3>
          </div>
          <span class="plane-tag">[GROUNDING CORPUS]</span>
        </div>

        <div class="sources-grid">
          ${items}
        </div>
      </section>
    `;
  }

  // ------------------------------------------------------------
  // Master Render Method: Strict 7-Stage Output
  // ------------------------------------------------------------
  function renderAnswer(payload, container) {
    if (!container || !payload) return;

    const queryData = payload.query || {};
    const sections = Array.isArray(payload.sections) ? payload.sections : [];
    const relationships = Array.isArray(payload.relationships) ? payload.relationships : [];
    const crossDomain = payload.cross_domain || null;
    const summary = payload.summary || "";
    const sources = Array.isArray(payload.sources) ? payload.sources : [];

    const sec4D = sections.find((s) => s.dimension === "4D");

    const htmlParts = [
      '<div class="optical-focal-stage">',
      renderQueryUnderstanding(queryData),
      renderDimensionNavigator(sections),
      renderRetrievedKnowledge(sections),
      renderRelationshipAnalysis(relationships),
      crossDomain ? renderCrossDomainAnalysis(crossDomain) : "",
      renderFinalResult(summary, sec4D),
      renderSourcesLedger(sources),
      "</div>",
    ];

    container.innerHTML = htmlParts.join("");

    // Mount 3D SVG Graph into its designated container
    if (window.MKS_GRAPH && typeof window.MKS_GRAPH.renderGraph === "function") {
      window.MKS_GRAPH.renderGraph("graph-viewport-mount", relationships);
    }
  }

  window.MKS_RENDER = {
    renderAnswer,
  };
})();
