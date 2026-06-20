/*
 * Wood Passport · tree-generator.js
 *
 * Coherent-yet-random fractal-triangle tree generator for the Wood Pass deck
 * template. Extracted from the cover IIFE that originally lived inline in
 * deck.html.
 *
 * Algorithm:
 *   - Seeded LCG PRNG (same seed → same tree, deterministic across reloads)
 *   - Recursive binary branching with occasional asymmetric 3rd branch
 *   - Branches drawn as tapered triangles (wider at base, narrower at tip)
 *   - Terminal cluster of Regen-palette leaf triangles at depth 0
 *
 * Public surface:
 *   window.WoodTree.generate(svgEl, opts)
 *   window.WoodTree.reroll(svgEl, newSeed)
 *   window.WoodTree.deriveDefaultSeed(slideIndex)
 *   window.WoodTree.paletteBark
 *   window.WoodTree.paletteLeaves
 *
 * Copyright 2026 Regen Studio B.V. · PolyForm Noncommercial 1.0.0
 */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  /* Bark gradient — darkest at trunk (depth = maxDepth) → lightest at tips. */
  const BARK = ['#2a1808', '#3a2110', '#5b3f29', '#7a5836', '#9c7548', '#bf9866'];

  /* Regen 6-colour leaf palette — canonical, must match design-tokens.js. */
  const LEAVES = ['#008545', '#65DD35', '#FFA92D', '#E71846', '#93093F', '#009BBB'];

  /* Linear-congruential PRNG. Returns a closure so each tree has its own stream. */
  function makeRand(seed) {
    let s = (Number(seed) | 0) || 1;
    if (s <= 0) s = 1;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function makeLeaf(x, y, size, rotDeg, color, opacity) {
    const leaf = document.createElementNS(NS, 'polygon');
    const r = rotDeg * Math.PI / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const pts = [[0, -size], [-size * 0.62, size * 0.42], [size * 0.62, size * 0.42]];
    leaf.setAttribute(
      'points',
      pts
        .map(([px, py]) => (x + px * c - py * s).toFixed(1) + ',' + (y + px * s + py * c).toFixed(1))
        .join(' ')
    );
    leaf.setAttribute('fill', color);
    leaf.setAttribute('opacity', opacity.toFixed(2));
    return leaf;
  }

  function makeBranch(x1, y1, x2, y2, baseW, tipW, color) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return null;
    const nx = -dy / len, ny = dx / len;
    const branch = document.createElementNS(NS, 'polygon');
    const pts = [
      [x1 + nx * baseW, y1 + ny * baseW],
      [x1 - nx * baseW, y1 - ny * baseW],
      [x2 - nx * tipW,  y2 - ny * tipW],
      [x2 + nx * tipW,  y2 + ny * tipW]
    ];
    branch.setAttribute(
      'points',
      pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')
    );
    branch.setAttribute('fill', color);
    return branch;
  }

  /*
   * Generate a tree inside the given SVG element.
   *
   * opts:
   *   seed              integer (required) — PRNG seed
   *   baseX, baseY      tree base coordinates in SVG viewBox space
   *   initialAngle      degrees, 0 = up (default 0)
   *   initialLength     trunk length in SVG units (default 100)
   *   maxDepth          recursion cap (default 7)
   *   leafScale         multiplier on terminal leaf size (default 1.0)
   *   branchAsymmetry   0..1, chance of asymmetric 3rd branch (default 0.22)
   *   bark              palette override (defaults to BARK)
   *   leaves            palette override (defaults to LEAVES)
   */
  function generate(svgEl, opts) {
    if (!svgEl) return;
    opts = opts || {};
    const seed            = opts.seed != null ? opts.seed : 4242;
    const baseX           = opts.baseX != null ? opts.baseX : 300;
    const baseY           = opts.baseY != null ? opts.baseY : 680;
    const initialAngle    = opts.initialAngle != null ? opts.initialAngle : 0;
    const initialLength   = opts.initialLength != null ? opts.initialLength : 100;
    const maxDepth        = opts.maxDepth != null ? opts.maxDepth : 7;
    const leafScale       = opts.leafScale != null ? opts.leafScale : 1.0;
    const branchAsymmetry = opts.branchAsymmetry != null ? opts.branchAsymmetry : 0.22;
    const bark            = opts.bark   || BARK;
    const leaves          = opts.leaves || LEAVES;

    const rand = makeRand(seed);
    const jitter = function (amt) { return (rand() - 0.5) * 2 * amt; };

    const branchFrag = document.createDocumentFragment();
    const leafFrag   = document.createDocumentFragment();

    function recurse(x1, y1, angleDeg, length, depth) {
      const rad = (angleDeg - 90) * Math.PI / 180;
      const x2 = x1 + Math.cos(rad) * length;
      const y2 = y1 + Math.sin(rad) * length;

      const baseW = Math.max(0.6, length * 0.11);
      const tipW  = Math.max(0.3, length * 0.055);
      const colorIdx = Math.min(bark.length - 1, Math.max(0, maxDepth - depth));
      const branch = makeBranch(x1, y1, x2, y2, baseW, tipW, bark[colorIdx]);
      if (branch) branchFrag.appendChild(branch);

      if (depth === 0 || length < 5) {
        // Leaves cluster TIGHT to the branch tip — jitter scales with branch length
        // but stays small enough that leaves visibly belong to the branch.
        const leafCount = 4 + Math.floor(rand() * 5);
        const leafJitter = Math.max(2, length * 0.45);
        for (let i = 0; i < leafCount; i++) {
          const lx = x2 + jitter(leafJitter);
          const ly = y2 + jitter(leafJitter * 0.85);
          const lsize = (4 + rand() * 7) * leafScale;
          const lrot = rand() * 360;
          const lcolor = leaves[Math.floor(rand() * leaves.length)];
          const lop = 0.78 + rand() * 0.20;
          leafFrag.appendChild(makeLeaf(lx, ly, lsize, lrot, lcolor, lop));
        }
        return;
      }

      const ang1 = angleDeg - 18 - rand() * 14;
      const ang2 = angleDeg + 18 + rand() * 14;
      const len1 = length * (0.66 + rand() * 0.10);
      const len2 = length * (0.66 + rand() * 0.10);
      recurse(x2, y2, ang1, len1, depth - 1);
      recurse(x2, y2, ang2, len2, depth - 1);

      if (depth > 3 && rand() < branchAsymmetry) {
        const ang3 = angleDeg + jitter(38);
        const len3 = length * (0.55 + rand() * 0.15);
        recurse(x2, y2, ang3, len3, depth - 2);
      }
    }

    recurse(baseX, baseY, initialAngle, initialLength, maxDepth);

    svgEl.appendChild(branchFrag);
    svgEl.appendChild(leafFrag);
  }

  /* Clear an SVG (preserve <defs>, <style>, and any element marked
   * data-tree-keep="true") and regenerate the tree from a new seed.
   */
  function reroll(svgEl, newSeed, opts) {
    if (!svgEl) return;
    const keep = [];
    for (const child of Array.from(svgEl.children)) {
      const tag = child.tagName && child.tagName.toLowerCase();
      if (tag === 'defs' || tag === 'style' || child.dataset.treeKeep === 'true') {
        keep.push(child);
      } else {
        svgEl.removeChild(child);
      }
    }
    generate(svgEl, Object.assign({}, opts || {}, { seed: newSeed }));
  }

  /* Default seed derived from slide index. Large prime for good distribution. */
  function deriveDefaultSeed(slideIndex) {
    const i = (Number(slideIndex) | 0) + 1;
    return (i * 1747) % 999983;
  }

  global.WoodTree = {
    generate: generate,
    reroll: reroll,
    deriveDefaultSeed: deriveDefaultSeed,
    paletteBark: BARK.slice(),
    paletteLeaves: LEAVES.slice()
  };
})(window);
