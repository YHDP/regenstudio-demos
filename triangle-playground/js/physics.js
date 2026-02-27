/**
 * physics.js — Triangle physics engine extracted from regenstudio-website/script.js.
 * Exposes window.PhysicsEngine
 */
(function () {
  'use strict';

  // --- Triangle ---
  function Triangle(id, cfg, palette, W, H) {
    this.id = id;
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * cfg.driftSpeed * 2;
    this.vy = (Math.random() - 0.5) * cfg.driftSpeed * 2;
    this.size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    this.radius = this.size * 0.58;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.01;
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.opacity = 0.5 + Math.random() * 0.25;
    this.baseOpacity = this.opacity;
    this.skew = 0.85 + Math.random() * 0.3;
    this.attracted = false;
    this.attractT = 0;
    this.bondCount = 0;
    this.retainUntil = 0;
    this.trail = [];
    this.trailMax = 4;
  }

  // --- Engine ---
  function PhysicsEngine(cfg, W, H) {
    this.cfg = cfg;
    this.W = W;
    this.H = H;
    this.tris = [];
    this.bonds = new Set();
    this.dust = [];
    this.grid = {};
    this.CELL = 80;
    this.RETAIN_MS = 25000;
  }

  PhysicsEngine.prototype.resize = function (W, H) {
    this.W = W;
    this.H = H;
  };

  PhysicsEngine.prototype.createTriangles = function (palette) {
    this.tris = [];
    this.bonds.clear();
    for (var i = 0; i < this.cfg.count; i++) {
      this.tris.push(new Triangle(i, this.cfg, palette, this.W, this.H));
    }
  };

  PhysicsEngine.prototype.setTriangleCount = function (n, palette) {
    var diff = n - this.tris.length;
    if (diff > 0) {
      var startId = this.tris.length;
      for (var i = 0; i < diff; i++) {
        this.tris.push(new Triangle(startId + i, this.cfg, palette, this.W, this.H));
      }
    } else if (diff < 0) {
      this.tris.length = n;
      // Clean up bonds referencing removed triangles
      var self = this;
      this.bonds.forEach(function (key) {
        var parts = key.split('-');
        if (parseInt(parts[0]) >= n || parseInt(parts[1]) >= n) {
          self.bonds.delete(key);
        }
      });
    }
    this.cfg.count = n;
  };

  PhysicsEngine.prototype.recolorTriangles = function (palette) {
    for (var i = 0; i < this.tris.length; i++) {
      this.tris[i].color = palette[Math.floor(Math.random() * palette.length)];
    }
  };

  // --- Dust ---
  PhysicsEngine.prototype.createDust = function () {
    this.dust = [];
    for (var i = 0; i < this.cfg.dustCount; i++) {
      this.dust.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - 0.5) * this.cfg.dustSpeed,
        vy: (Math.random() - 0.5) * this.cfg.dustSpeed,
        size: 0.5 + Math.random() * this.cfg.dustSize,
        opacity: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  PhysicsEngine.prototype.updateDust = function (time) {
    var W = this.W, H = this.H;
    for (var i = 0; i < this.dust.length; i++) {
      var d = this.dust[i];
      d.x += d.vx;
      d.y += d.vy;
      d.opacity = 0.06 + Math.sin(time * 0.0005 + d.phase) * 0.06;
      if (d.x < -10) d.x = W + 10;
      if (d.x > W + 10) d.x = -10;
      if (d.y < -10) d.y = H + 10;
      if (d.y > H + 10) d.y = -10;
    }
  };

  // --- Spatial hash ---
  PhysicsEngine.prototype.buildGrid = function () {
    this.grid = {};
    var CELL = this.CELL;
    for (var i = 0; i < this.tris.length; i++) {
      var t = this.tris[i];
      var k = Math.floor(t.x / CELL) + ',' + Math.floor(t.y / CELL);
      if (!this.grid[k]) this.grid[k] = [];
      this.grid[k].push(i);
    }
  };

  PhysicsEngine.prototype.getNeighborIndices = function (x, y, r) {
    var result = [];
    var CELL = this.CELL;
    var x0 = Math.floor((x - r) / CELL);
    var x1 = Math.floor((x + r) / CELL);
    var y0 = Math.floor((y - r) / CELL);
    var y1 = Math.floor((y + r) / CELL);
    for (var cx = x0; cx <= x1; cx++) {
      for (var cy = y0; cy <= y1; cy++) {
        var k = cx + ',' + cy;
        if (this.grid[k]) {
          var arr = this.grid[k];
          for (var j = 0; j < arr.length; j++) result.push(arr[j]);
        }
      }
    }
    return result;
  };

  // --- Bond utilities ---
  PhysicsEngine.prototype.bondKey = function (a, b) {
    return a < b ? a + '-' + b : b + '-' + a;
  };

  PhysicsEngine.prototype.findTriangleAt = function (x, y) {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < this.tris.length; i++) {
      var t = this.tris[i];
      var dx = x - t.x;
      var dy = y - t.y;
      var d = dx * dx + dy * dy;
      if (d < t.radius * t.radius * 4 && d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  };

  PhysicsEngine.prototype.findClusterOf = function (tri) {
    if (tri.bondCount < 1 || tri.attractT < 0.05) return null;
    var cluster = new Set();
    var queue = [tri.id];
    var bonds = this.bonds;
    cluster.add(tri.id);
    while (queue.length > 0) {
      var id = queue.shift();
      bonds.forEach(function (key) {
        var parts = key.split('-');
        var a = parseInt(parts[0]);
        var b = parseInt(parts[1]);
        if (a === id && !cluster.has(b)) { cluster.add(b); queue.push(b); }
        if (b === id && !cluster.has(a)) { cluster.add(a); queue.push(a); }
      });
    }
    return cluster.size > 1 ? cluster : null;
  };

  PhysicsEngine.prototype.disperseCluster = function (cluster) {
    var cfg = this.cfg;
    var tris = this.tris;
    cluster.forEach(function (id) {
      var t = tris[id];
      t.attracted = false;
      t.attractT = 0.03;
      t.retainUntil = 0;
      var angle = Math.random() * Math.PI * 2;
      t.vx += Math.cos(angle) * cfg.disperseForce * 1.5;
      t.vy += Math.sin(angle) * cfg.disperseForce * 1.5;
    });
  };

  PhysicsEngine.prototype.countClusters = function () {
    var visited = new Set();
    var clusterCount = 0;
    var bonds = this.bonds;
    var tris = this.tris;
    for (var i = 0; i < tris.length; i++) {
      if (visited.has(i) || tris[i].bondCount < 1) continue;
      clusterCount++;
      var queue = [i];
      visited.add(i);
      while (queue.length > 0) {
        var id = queue.shift();
        bonds.forEach(function (key) {
          var parts = key.split('-');
          var a = parseInt(parts[0]);
          var b = parseInt(parts[1]);
          if (a === id && !visited.has(b)) { visited.add(b); queue.push(b); }
          if (b === id && !visited.has(a)) { visited.add(a); queue.push(a); }
        });
      }
    }
    return clusterCount;
  };

  // --- Main physics update ---
  PhysicsEngine.prototype.update = function (mouse, drag, now) {
    this.buildGrid();

    var cfg = this.cfg;
    var tris = this.tris;
    var bonds = this.bonds;
    var ar = cfg.attractRadius;
    var ar2 = ar * ar;
    var isHovering = mouse.active;
    var RETAIN_MS = this.RETAIN_MS;
    var W = this.W, H = this.H;

    // Phase 1: Attraction state
    for (var i = 0; i < tris.length; i++) {
      var t = tris[i];
      var inRadius = false;
      if (isHovering) {
        var dx = mouse.x - t.x;
        var dy = mouse.y - t.y;
        inRadius = (dx * dx + dy * dy < ar2);
      }
      if (inRadius) {
        t.attracted = true;
        t.attractT = Math.min(1, t.attractT + 0.045);
        t.retainUntil = now + RETAIN_MS;
      } else if (t.attractT > 0.05 && now < t.retainUntil) {
        t.attracted = true;
        var remaining = (t.retainUntil - now) / RETAIN_MS;
        var decay = 0.001 * (1 - remaining);
        t.attractT = Math.max(0.05, t.attractT - decay);
      } else {
        t.attracted = false;
        t.attractT = Math.max(0, t.attractT - 0.025);
      }
    }

    // In-radius lookup
    var inRadiusLookup = new Uint8Array(tris.length);
    if (isHovering) {
      for (var i = 0; i < tris.length; i++) {
        var t = tris[i];
        var dx = mouse.x - t.x;
        var dy = mouse.y - t.y;
        if (dx * dx + dy * dy < ar2) inRadiusLookup[i] = 1;
      }
    }

    // Phase 2: Attraction force
    if (isHovering) {
      for (var i = 0; i < tris.length; i++) {
        var t = tris[i];
        if (t.attractT < 0.01) continue;
        var dx = mouse.x - t.x;
        var dy = mouse.y - t.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 1) continue;
        var closeness = Math.max(0, 1 - d / ar);
        var distFactor = Math.min(1, d / 45);
        var force = cfg.attractForce * closeness * distFactor * t.attractT;
        t.vx += (dx / d) * force * d * 0.14;
        t.vy += (dy / d) * force * d * 0.14;
      }
    }

    // Phase 2b: Drag cluster tethering
    var isDragging = drag.active && drag.moved && drag.anchorId >= 0;
    if (isDragging) {
      var anchor = tris[drag.anchorId];
      drag.clusterIds.forEach(function (id) {
        if (id === drag.anchorId) return;
        var t = tris[id];
        var off = drag.offsets[id];
        if (!off) return;
        var targetX = anchor.x + off.rx;
        var targetY = anchor.y + off.ry;
        t.vx += (targetX - t.x) * 0.08;
        t.vy += (targetY - t.y) * 0.08;
      });
    }

    // Phase 3: Separation + bonding
    var activeBonds = 0;
    var newBonds = new Set();
    var self = this;

    for (var i = 0; i < tris.length; i++) {
      var a = tris[i];
      if (a.attractT < 0.05) continue;
      var neighbors = this.getNeighborIndices(a.x, a.y, a.radius * 3 + cfg.maxSize);
      a.bondCount = 0;

      for (var ni = 0; ni < neighbors.length; ni++) {
        var j = neighbors[ni];
        if (j <= i) continue;
        var b = tris[j];
        if (b.attractT < 0.05) continue;

        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var d2 = dx * dx + dy * dy;
        var combinedR = a.radius + b.radius;
        var bondThresh = combinedR * cfg.bondDist;

        var isFrozen = isDragging && drag.frozenBonds.has(self.bondKey(a.id, b.id));
        if (!isFrozen && d2 > bondThresh * bondThresh) continue;

        var d = Math.sqrt(d2);
        if (d < 0.5) continue;

        var nx = dx / d;
        var ny = dy / d;

        var aDragged = isDragging && drag.clusterIds.has(a.id);
        var bDragged = isDragging && drag.clusterIds.has(b.id);
        var dragScale = (aDragged || bDragged) ? 0.15 : 1;

        // Separation
        var sepThresh = combinedR * cfg.separationRadius;
        if (d < sepThresh) {
          var overlap = sepThresh - d;
          var push = overlap * cfg.separation * dragScale;
          a.vx -= nx * push;
          a.vy -= ny * push;
          b.vx += nx * push;
          b.vy += ny * push;
        }

        // Bond spring
        var idealDist = combinedR * 1.02;
        var spring = (d - idealDist) * cfg.bondSpring * dragScale;
        a.vx += nx * spring;
        a.vy += ny * spring;
        b.vx -= nx * spring;
        b.vy -= ny * spring;

        newBonds.add(self.bondKey(a.id, b.id));
        a.bondCount++;
        b.bondCount++;
        activeBonds++;
      }
    }

    bonds.clear();
    newBonds.forEach(function (k) { bonds.add(k); });
    if (isDragging) {
      drag.frozenBonds.forEach(function (k) { bonds.add(k); });
    }

    // Phase 4: Integration
    for (var i = 0; i < tris.length; i++) {
      var t = tris[i];

      if (isDragging && t.id === drag.anchorId) continue;

      if (isDragging && drag.clusterIds.has(t.id)) {
        t.vx *= 0.85;
        t.vy *= 0.85;
      }

      // Trail
      if (t.attractT > 0.1) {
        t.trail.push({ x: t.x, y: t.y });
        if (t.trail.length > t.trailMax) t.trail.shift();
      } else if (t.trail.length > 0) {
        t.trail.shift();
      }

      var triRetaining = t.attracted && !inRadiusLookup[i] && now < t.retainUntil;

      if (t.attractT < 0.01) {
        // Free-floating
        var speed = Math.sqrt(t.vx * t.vx + t.vy * t.vy);
        if (speed < cfg.driftSpeed * 0.25) {
          var angle = Math.random() * Math.PI * 2;
          t.vx += Math.cos(angle) * 0.05;
          t.vy += Math.sin(angle) * 0.05;
        }
        t.vx *= cfg.dampFree;
        t.vy *= cfg.dampFree;
        t.opacity += (t.baseOpacity - t.opacity) * 0.035;
        t.rotSpeed += ((Math.random() - 0.5) * 0.01 - t.rotSpeed) * 0.008;
      } else if (triRetaining && t.bondCount > 0) {
        // Retention freeze
        t.vx *= 0.86;
        t.vy *= 0.86;
        t.rotSpeed *= 0.94;
        var retainOpacity = t.baseOpacity + t.attractT * 0.3;
        t.opacity += (retainOpacity - t.opacity) * 0.02;
      } else {
        // Actively attracted
        t.vx *= cfg.dampBonded;
        t.vy *= cfg.dampBonded;
        t.opacity += (Math.min(1, t.baseOpacity + t.attractT * 0.4) - t.opacity) * 0.06;
        if (t.bondCount > 0) {
          t.rotSpeed *= 0.9;
        }
      }

      // Disperse impulse at end of retention
      if (!t.attracted && t.attractT > 0.01 && t.attractT < 0.04) {
        var angle = Math.random() * Math.PI * 2;
        t.vx += Math.cos(angle) * cfg.disperseForce;
        t.vy += Math.sin(angle) * cfg.disperseForce;
      }

      t.x += t.vx;
      t.y += t.vy;
      t.rotation += t.rotSpeed;

      // Boundary wrap
      var pad = t.size * 2;
      if (t.x < -pad) t.x += W + pad * 2;
      if (t.x > W + pad) t.x -= W + pad * 2;
      if (t.y < -pad) t.y += H + pad * 2;
      if (t.y > H + pad) t.y -= H + pad * 2;
    }

    return { activeBonds: activeBonds };
  };

  window.PhysicsEngine = PhysicsEngine;
})();
