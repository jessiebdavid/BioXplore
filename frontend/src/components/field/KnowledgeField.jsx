/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * KnowledgeField — the living environment.
 *
 * One canvas, four depth layers:
 *   L1  distant star drift + orbital ellipses        (very slow)
 *   L2  knowledge network (nodes + flowing edges)    (slow drift)
 *   L3  DNA helix + molecular lattice                (gentle)
 *   L4  near particles + Tamil glyph motes           (responsive)
 *
 * The field reacts to: cursor position (light + parallax),
 * scroll (layer offsets), and a global "domain" mood that the
 * Domains page broadcasts via html[data-domain].
 * GPU-friendly: single rAF, canvas 2D, dpr-capped.
 * ============================================================ */

import React, { useEffect, useRef } from "react";

/* Frozen short glyph fragments (decorative atmosphere only — never content) */
const GLYPHS = ["அ", "ழ", "க", "ம்", "த", "ண", "ய", "நீ", "வா", "அறம்"];

const DOMAIN_TINT = {
  astro: [77, 127, 232],
  bio: [77, 175, 131],
  tamil: [141, 117, 199],
  cross: [61, 159, 161],
  none: [61, 159, 161],
};

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function KnowledgeField() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = reducedMotion();
    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    /* ---------- deterministic pseudo-random ---------- */
    let seed = 20771;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    /* ---------- pointer / scroll / domain state ---------- */
    const S = {
      t: 0,
      pointer: { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42, active: false },
      scroll: 0,
      domain: "none",
      tint: DOMAIN_TINT.none,
    };
    stateRef.current = S;

    const onPointer = (e) => {
      S.pointer.tx = e.clientX / Math.max(1, window.innerWidth);
      S.pointer.ty = e.clientY / Math.max(1, window.innerHeight);
      S.pointer.active = true;
    };
    const onScroll = () => {
      S.scroll = window.scrollY || 0;
    };
    const onDomain = () => {
      const d = document.documentElement.getAttribute("data-domain") || "none";
      S.domain = d;
      S.tint = DOMAIN_TINT[d] || DOMAIN_TINT.none;
    };
    const onVisibility = () => {
      if (!document.hidden && !reduced) start();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mks:domain", onDomain);
    document.addEventListener("visibilitychange", onVisibility);

    /* ---------- population ---------- */
    let stars = [];
    let orbits = [];
    let netNodes = [];
    let helix = null;
    let lattice = [];
    let motes = [];
    let glyphs = [];

    function build() {
      seed = 20771;
      stars = Array.from({ length: 90 }, () => ({
        x: rand() * W,
        y: rand() * H,
        r: 0.4 + rand() * 1.1,
        depth: 0.25 + rand() * 0.75,
        tw: rand() * Math.PI * 2,
        ts: 0.4 + rand() * 0.9,
      }));

      orbits = [
        { cx: 0.5, cy: 0.46, rx: 0.34, ry: 0.16, rot: -0.32, speed: 0.05, dots: 2, color: "77,127,232", w: 1.1 },
        { cx: 0.5, cy: 0.46, rx: 0.44, ry: 0.24, rot: 0.5, speed: -0.035, dots: 3, color: "61,159,161", w: 0.9 },
        { cx: 0.5, cy: 0.46, rx: 0.55, ry: 0.30, rot: -0.12, speed: 0.022, dots: 4, color: "141,117,199", w: 0.8 },
        { cx: 0.5, cy: 0.46, rx: 0.20, ry: 0.34, rot: 0.2, speed: -0.045, dots: 1, color: "217,155,66", w: 0.8 },
      ];

      const NET_N = 16;
      netNodes = Array.from({ length: NET_N }, (_, i) => ({
        bx: rand(),
        by: rand(),
        phase: rand() * Math.PI * 2,
        speed: 0.12 + rand() * 0.22,
        amp: 14 + rand() * 26,
        r: 1.6 + rand() * 2.4,
        depth: 0.5 + rand() * 0.5,
        hub: i === 0,
      }));
      // edges: connect each node to nearest 2
      netEdges = [];
      for (let i = 0; i < NET_N; i += 1) {
        const a = netNodes[i];
        const dists = netNodes
          .map((b, j) => ({ j, d: Math.hypot(a.bx - b.bx, a.by - b.by) }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2);
        dists.forEach(({ j }) => {
          if (!netEdges.some((e) => e[0] === j && e[1] === i)) netEdges.push([i, j]);
        });
      }

      helix = { cx: 0.86, cy: 0.30, len: Math.min(H * 0.42, 420), turns: 3.2, phase: 0 };

      lattice = Array.from({ length: 7 }, (_, i) => ({
        cx: 0.06 + rand() * 0.2,
        cy: 0.28 + rand() * 0.55,
        r: 26 + rand() * 34,
        bonds: 5 + Math.floor(rand() * 3),
        rot: rand() * Math.PI,
        speed: 0.02 + rand() * 0.03,
        depth: 0.4 + rand() * 0.4,
      }));

      motes = Array.from({ length: 34 }, () => ({
        x: rand() * W,
        y: rand() * H,
        vx: (rand() - 0.5) * 0.12,
        vy: (rand() - 0.5) * 0.10,
        r: 0.8 + rand() * 1.7,
        depth: 0.5 + rand() * 0.5,
        tw: rand() * Math.PI * 2,
      }));

      glyphs = Array.from({ length: 10 }, (_, i) => ({
        text: GLYPHS[i % GLYPHS.length],
        bx: 0.03 + rand() * 0.94,
        by: rand(),
        size: 15 + rand() * 20,
        phase: rand() * Math.PI * 2,
        speed: 0.05 + rand() * 0.07,
        amp: 16 + rand() * 22,
        depth: 0.35 + rand() * 0.5,
      }));
    }

    let netEdges = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    /* ---------- drawing helpers ---------- */
    const px = (nx) => nx * W;
    const py = (ny) => ny * H;

    function parallax(depth, scrollFactor) {
      const dx = (S.pointer.x - 0.5) * 26 * depth;
      const dy = (S.pointer.y - 0.5) * 18 * depth + (S.scroll * scrollFactor * depth);
      return [dx, dy];
    }

    function domainAlpha(base, weight) {
      // tint-related layers breathe up when their domain is active
      if (S.domain === "none") return base;
      return Math.min(0.85, base + weight);
    }

    function drawStars() {
      const [dx, dy] = parallax(0.3, 0.05);
      stars.forEach((s) => {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(S.t * s.ts + s.tw));
        const [tintR, tintG, tintB] = S.tint;
        const mix = S.domain === "none" ? 0 : 0.25;
        ctx.beginPath();
        ctx.arc(s.x + dx * s.depth, s.y + dy * s.depth, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(23 + (tintR - 23) * mix)}, ${Math.round(50 + (tintG - 50) * mix)}, ${Math.round(77 + (tintB - 77) * mix)}, ${0.16 * tw * s.depth})`;
        ctx.fill();
      });
    }

    function drawOrbits() {
      const [dx, dy] = parallax(0.55, 0.08);
      orbits.forEach((o, oi) => {
        const cx = px(o.cx) + dx;
        const cy = py(o.cy) + dy;
        const rx = px(o.rx);
        const ry = py(o.ry);
        const alpha = domainAlpha(0.13, oi === 0 && S.domain === "astro" ? 0.1 : 0.03);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(o.rot + Math.sin(S.t * 0.05 + oi) * 0.02);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${o.color}, ${alpha})`;
        ctx.lineWidth = o.w;
        ctx.stroke();

        // travelling bodies on the orbit
        for (let k = 0; k < o.dots; k += 1) {
          const ang = S.t * o.speed + (k * Math.PI * 2) / o.dots;
          const x = rx * Math.cos(ang);
          const y = ry * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(x, y, 2.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${o.color}, ${alpha + 0.25})`;
          ctx.fill();
          // soft trail
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, ang - 0.5, ang);
          ctx.strokeStyle = `rgba(${o.color}, ${alpha * 0.9})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    function drawNetwork() {
      const [dx, dy] = parallax(0.8, 0.14);
      const pos = netNodes.map((n) => {
        const wx = px(n.bx) + Math.sin(S.t * n.speed + n.phase) * n.amp + dx * n.depth;
        const wy = py(n.by) + Math.cos(S.t * n.speed * 0.8 + n.phase) * n.amp * 0.8 + dy * n.depth;
        return [wx, wy];
      });
      const alphaEdge = domainAlpha(0.10, S.domain === "cross" ? 0.08 : 0.0);

      netEdges.forEach(([i, j]) => {
        const [x1, y1] = pos[i];
        const [x2, y2] = pos[j];
        // flowing dash
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(61,159,161,0)`);
        grad.addColorStop(0.5, `rgba(61,159,161,${alphaEdge + 0.05})`);
        grad.addColorStop(1, `rgba(77,127,232,0)`);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();

        // travelling pulse
        const p = (S.t * 0.25 + i * 0.37) % 1;
        const qx = x1 + (x2 - x1) * p;
        const qy = y1 + (y2 - y1) * p;
        ctx.beginPath();
        ctx.arc(qx, qy, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(61,159,161,${alphaEdge + 0.18})`;
        ctx.fill();
      });

      netNodes.forEach((n, i) => {
        const [x, y] = pos[i];
        const pulse = 0.5 + 0.5 * Math.sin(S.t * 0.9 + n.phase * 2);
        const r = n.hub ? n.r + pulse * 2.4 : n.r;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        const [tr, tg, tb] = S.tint;
        const mix = S.domain === "none" ? 0 : 0.4;
        const cr = Math.round(61 + (tr - 61) * mix);
        const cg = Math.round(159 + (tg - 159) * mix);
        const cb = Math.round(161 + (tb - 161) * mix);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${0.5 * pulse + 0.2})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.beginPath();
        ctx.arc(x, y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.5)`;
        ctx.fill();
      });
    }

    function drawHelix() {
      if (!helix) return;
      const [dx, dy] = parallax(0.7, 0.10);
      const cx = px(helix.cx) + dx;
      const top = py(helix.cy) - helix.len / 2 + dy;
      const turns = helix.turns;
      const amp = 34;
      const alpha = domainAlpha(0.30, S.domain === "bio" ? 0.25 : 0.0);
      const t = S.t * 0.5;

      ctx.save();
      ctx.lineCap = "round";
      for (let strand = 0; strand < 2; strand += 1) {
        ctx.beginPath();
        for (let i = 0; i <= 60; i += 1) {
          const v = i / 60;
          const y = top + v * helix.len;
          const ang = v * Math.PI * 2 * turns + t + strand * Math.PI;
          const x = cx + Math.sin(ang) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(77,175,131,${alpha * 0.85})`;
        ctx.lineWidth = 1.7;
        ctx.stroke();
      }
      // base pairs
      for (let i = 0; i <= 22; i += 1) {
        const v = i / 22;
        const y = top + v * helix.len;
        const ang = v * Math.PI * 2 * turns + t;
        const x1 = cx + Math.sin(ang) * amp;
        const x2 = cx + Math.sin(ang + Math.PI) * amp;
        const fade = 0.5 + 0.5 * Math.cos(ang);
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = `rgba(77,175,131,${alpha * (0.18 + fade * 0.3)})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawLattice() {
      const [dx, dy] = parallax(0.65, 0.12);
      lattice.forEach((m, mi) => {
        const cx = px(m.cx) + dx * m.depth;
        const cy = py(m.cy) + dy * m.depth;
        const rot = m.rot + S.t * m.speed;
        const alpha = domainAlpha(0.14, S.domain === "bio" ? 0.1 : 0.0);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        // polygon molecule
        ctx.beginPath();
        for (let k = 0; k < m.bonds; k += 1) {
          const ang = (k / m.bonds) * Math.PI * 2;
          const x = Math.cos(ang) * m.r;
          const y = Math.sin(ang) * m.r;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(141,117,199,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // atoms
        for (let k = 0; k < m.bonds; k += 1) {
          const ang = (k / m.bonds) * Math.PI * 2;
          const x = Math.cos(ang) * m.r;
          const y = Math.sin(ang) * m.r;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(141,117,199,${alpha + 0.12})`;
          ctx.fill();
        }
        // spokes to center
        for (let k = 0; k < m.bonds; k += 1) {
          const ang = (k / m.bonds) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * m.r, Math.sin(ang) * m.r);
          ctx.strokeStyle = `rgba(141,117,199,${alpha * 0.45})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
        ctx.restore();
        void mi;
      });
    }

    function drawGlyphs() {
      const [dx, dy] = parallax(1.0, 0.20);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      glyphs.forEach((g) => {
        const x = px(g.bx) + Math.sin(S.t * g.speed + g.phase) * g.amp + dx * g.depth;
        const y = ((py(g.by) + S.t * 4 * g.speed + dy * g.depth) % (H + 60)) - 30;
        const alpha = domainAlpha(0.10, S.domain === "tamil" ? 0.14 : 0.0);
        ctx.font = `500 ${g.size}px "Noto Sans Tamil", "Latha", "Nirmala UI", sans-serif`;
        ctx.fillStyle = `rgba(141,117,199,${alpha})`;
        ctx.fillText(g.text, x, y);
      });
      ctx.restore();
    }

    function drawMotes() {
      motes.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < -10) m.x = W + 10;
        if (m.x > W + 10) m.x = -10;
        if (m.y < -10) m.y = H + 10;
        if (m.y > H + 10) m.y = -10;
        const tw = 0.5 + 0.5 * Math.sin(S.t * 1.4 + m.tw);
        const [dx, dy] = parallax(1.0, 0.22);
        const [tr, tg, tb] = S.tint;
        const mix = S.domain === "none" ? 0 : 0.3;
        ctx.beginPath();
        ctx.arc(m.x + dx, m.y + dy, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(61 + (tr - 61) * mix)}, ${Math.round(159 + (tg - 159) * mix)}, ${Math.round(161 + (tb - 161) * mix)}, ${0.12 + tw * 0.16})`;
        ctx.fill();
      });
    }

    function drawCursorLight() {
      if (!S.pointer.active) return;
      const x = S.pointer.x * W;
      const y = S.pointer.y * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 300);
      g.addColorStop(0, "rgba(255,255,255,0.16)");
      g.addColorStop(0.45, "rgba(213,233,240,0.08)");
      g.addColorStop(1, "rgba(213,233,240,0)");
      ctx.beginPath();
      ctx.arc(x, y, 300, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    /* ---------- frame ---------- */
    function frame() {
      S.t += 0.016;
      S.pointer.x += (S.pointer.tx - S.pointer.x) * 0.045;
      S.pointer.y += (S.pointer.ty - S.pointer.y) * 0.045;
      ctx.clearRect(0, 0, W, H);
      drawStars();
      drawOrbits();
      drawLattice();
      drawNetwork();
      drawHelix();
      drawGlyphs();
      drawMotes();
      drawCursorLight();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }

    resize();
    onDomain();
    if (reduced) {
      // Render a single calm static frame
      S.t = 3;
      ctx.clearRect(0, 0, W, H);
      drawStars();
      drawOrbits();
      drawLattice();
      drawNetwork();
      drawHelix();
      drawGlyphs();
      drawMotes();
    } else {
      start();
    }

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mks:domain", onDomain);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="knowledge-field" aria-hidden="true">
      <div className="kf-aurora kf-aurora-astro" />
      <div className="kf-aurora kf-aurora-bio" />
      <div className="kf-aurora kf-aurora-tamil" />
      <div className="kf-aurora kf-aurora-cross" />
      <canvas ref={canvasRef} className="kf-canvas" />
      <div className="kf-grid" />
      <div className="kf-vignette" />
    </div>
  );
}
