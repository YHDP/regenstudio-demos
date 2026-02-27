/**
 * renderer.js — Canvas drawing for Triangle Playground.
 * Exposes window.Renderer
 */
(function () {
  'use strict';

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0;
    this.H = 0;
    this.dpr = 1;
  }

  Renderer.prototype.resize = function () {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  Renderer.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.W, this.H);
  };

  // --- Helper ---
  function drawTrianglePath(ctx, s, h) {
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.667);
    ctx.lineTo(s * 0.5, h * 0.333);
    ctx.lineTo(-s * 0.5, h * 0.333);
    ctx.closePath();
  }

  // --- Dust ---
  Renderer.prototype.drawDust = function (dust) {
    var ctx = this.ctx;
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i];
      ctx.globalAlpha = d.opacity;
      ctx.fillStyle = '#C8D6E0';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // --- Bond lines ---
  Renderer.prototype.drawBonds = function (tris, bonds, cfg) {
    if (bonds.size === 0) return;
    var ctx = this.ctx;
    bonds.forEach(function (key) {
      var parts = key.split('-');
      var a = tris[parseInt(parts[0])];
      var b = tris[parseInt(parts[1])];
      if (!a || !b) return;
      var alpha = cfg.bondLineOpacity * Math.min(a.attractT, b.attractT);
      if (alpha < 0.004) return;

      var r = Math.round((a.color.r + b.color.r) / 2);
      var g = Math.round((a.color.g + b.color.g) / 2);
      var bl = Math.round((a.color.b + b.color.b) / 2);

      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + bl + ',' + alpha + ')';
      ctx.lineWidth = 0.8;

      var mx = (a.x + b.x) / 2;
      var my = (a.y + b.y) / 2;
      var dx = b.x - a.x;
      var dy = b.y - a.y;
      var perpX = -dy * 0.05;
      var perpY = dx * 0.05;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(mx + perpX, my + perpY, b.x, b.y);
      ctx.stroke();
    });
  };

  // --- Trails ---
  Renderer.prototype.drawTrails = function (tris) {
    var ctx = this.ctx;
    for (var i = 0; i < tris.length; i++) {
      var t = tris[i];
      if (t.trail.length < 2) continue;
      var c = t.color;
      for (var j = 0; j < t.trail.length - 1; j++) {
        var progress = j / t.trail.length;
        var alpha = progress * 0.06 * t.attractT;
        if (alpha < 0.002) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        var tp = t.trail[j];
        var trailSize = t.size * 0.4 * progress;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  // --- Triangles ---
  Renderer.prototype.drawTriangles = function (tris, cfg) {
    var ctx = this.ctx;
    for (var i = 0; i < tris.length; i++) {
      var t = tris[i];
      var c = t.color;
      var s = t.size;
      var h = s * 0.866 * t.skew;

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);

      // Glow
      if (cfg.glowRadius > 0 && t.bondCount > 0 && t.attractT > 0.2) {
        ctx.globalAlpha = t.attractT * cfg.glowOpacity;
        ctx.shadowColor = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
        ctx.shadowBlur = cfg.glowRadius * t.attractT;
        drawTrianglePath(ctx, s * 1.1, h * 1.1);
        ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Main fill
      ctx.globalAlpha = t.opacity;
      drawTrianglePath(ctx, s, h);
      ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
      ctx.fill();

      // Edge stroke on bonded
      if (t.bondCount > 0 && t.attractT > 0.15) {
        ctx.strokeStyle = 'rgba(36,54,68,' + (t.attractT * 0.12) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();
    }
  };

  // --- Attraction field ---
  Renderer.prototype.drawAttractionField = function (mouse, cfg) {
    if (!mouse.active) return;
    var ctx = this.ctx;
    var grad = ctx.createRadialGradient(
      mouse.x, mouse.y, 0,
      mouse.x, mouse.y, cfg.attractRadius
    );
    grad.addColorStop(0, 'rgba(0, 145, 75, 0.03)');
    grad.addColorStop(0.5, 'rgba(0, 155, 187, 0.015)');
    grad.addColorStop(1, 'rgba(0, 145, 75, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, cfg.attractRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  // --- Game-specific (stubs for Phase 3/4) ---
  Renderer.prototype.drawTargetPattern = function () {};
  Renderer.prototype.drawLockedBonds = function () {};
  Renderer.prototype.drawTimerBar = function () {};
  Renderer.prototype.drawScorePopup = function () {};

  window.Renderer = Renderer;
})();
