// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * input.js — Mouse + touch + drag handling for Triangle Playground.
 * Exposes window.InputManager
 */
(function () {
  'use strict';

  function InputManager(canvas) {
    this.canvas = canvas;
    this.engine = null;
    this.mouse = { x: -9999, y: -9999, active: false };
    this.drag = {
      active: false,
      anchorId: -1,
      clusterIds: new Set(),
      offsetX: 0, offsetY: 0,
      startX: 0, startY: 0,
      moved: false,
      offsets: {},
      frozenBonds: new Set()
    };
    this.DRAG_THRESHOLD = 6;
    this._bindEvents();
  }

  InputManager.prototype.setEngine = function (engine) {
    this.engine = engine;
  };

  InputManager.prototype.startDrag = function (x, y) {
    if (!this.engine) return false;
    var hit = this.engine.findTriangleAt(x, y);
    if (!hit) return false;

    this.drag.startX = x;
    this.drag.startY = y;
    this.drag.moved = false;
    this.drag.active = true;
    this.drag.anchorId = hit.id;
    this.drag.offsetX = hit.x - x;
    this.drag.offsetY = hit.y - y;
    this.mouse.active = false;

    var cluster = this.engine.findClusterOf(hit);
    this.drag.clusterIds = cluster || new Set([hit.id]);

    this.drag.offsets = {};
    var tris = this.engine.tris;
    var anchorX = hit.x, anchorY = hit.y;
    this.drag.clusterIds.forEach(function (id) {
      var t = tris[id];
      this.drag.offsets[id] = { rx: t.x - anchorX, ry: t.y - anchorY };
    }.bind(this));

    this.drag.frozenBonds = new Set();
    var bonds = this.engine.bonds;
    var clusterIds = this.drag.clusterIds;
    var bk = this.engine.bondKey.bind(this.engine);
    bonds.forEach(function (key) {
      var parts = key.split('-');
      var a = parseInt(parts[0]);
      var b = parseInt(parts[1]);
      if (clusterIds.has(a) && clusterIds.has(b)) {
        this.drag.frozenBonds.add(key);
      }
    }.bind(this));

    return true;
  };

  InputManager.prototype.moveDrag = function (x, y) {
    if (!this.drag.active || !this.engine) return;

    if (!this.drag.moved) {
      var dx = x - this.drag.startX;
      var dy = y - this.drag.startY;
      if (dx * dx + dy * dy < this.DRAG_THRESHOLD * this.DRAG_THRESHOLD) return;
      this.drag.moved = true;
    }

    var now = performance.now();
    var tris = this.engine.tris;
    var RETAIN_MS = this.engine.RETAIN_MS;

    var anchor = tris[this.drag.anchorId];
    if (!anchor) return;
    anchor.x = x + this.drag.offsetX;
    anchor.y = y + this.drag.offsetY;
    anchor.vx = 0;
    anchor.vy = 0;
    anchor.attracted = true;
    anchor.attractT = 1;
    anchor.retainUntil = now + RETAIN_MS;

    this.drag.clusterIds.forEach(function (id) {
      if (id === this.drag.anchorId) return;
      var t = tris[id];
      t.attracted = true;
      t.attractT = 1;
      t.retainUntil = now + RETAIN_MS;
    }.bind(this));

    this.canvas.style.cursor = 'grabbing';
  };

  InputManager.prototype.endDrag = function () {
    if (!this.drag.active) return;

    if (!this.drag.moved && this.drag.clusterIds.size > 1 && this.engine) {
      this.engine.disperseCluster(this.drag.clusterIds);
    }

    this.drag.active = false;
    this.drag.anchorId = -1;
    this.drag.clusterIds = new Set();
    this.drag.offsets = {};
    this.drag.frozenBonds = new Set();
    this.mouse.active = true;
    this.canvas.style.cursor = '';
  };

  InputManager.prototype._bindEvents = function () {
    var self = this;
    var canvas = this.canvas;

    // Mouse
    canvas.addEventListener('mousedown', function (e) {
      self.startDrag(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousemove', function (e) {
      self.mouse.x = e.clientX;
      self.mouse.y = e.clientY;
      if (self.drag.active) {
        self.moveDrag(e.clientX, e.clientY);
      } else {
        self.mouse.active = true;
        if (self.engine) {
          var hover = self.engine.findTriangleAt(e.clientX, e.clientY);
          canvas.style.cursor = hover ? 'grab' : '';
        }
      }
    });

    canvas.addEventListener('mouseup', function () {
      self.endDrag();
    });

    canvas.addEventListener('mouseleave', function () {
      self.mouse.active = false;
      if (self.drag.active) {
        self.drag.active = false;
        self.drag.clusterIds = new Set();
      }
    });

    // Touch — bound on ALL devices (game needs touch on mobile)
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      if (!self.startDrag(touch.clientX, touch.clientY)) {
        self.mouse.x = touch.clientX;
        self.mouse.y = touch.clientY;
        self.mouse.active = true;
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      if (self.drag.active) {
        self.moveDrag(touch.clientX, touch.clientY);
      } else {
        self.mouse.x = touch.clientX;
        self.mouse.y = touch.clientY;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
      self.endDrag();
      self.mouse.active = false;
    });

    canvas.addEventListener('touchcancel', function () {
      self.drag.active = false;
      self.drag.clusterIds = new Set();
      self.mouse.active = false;
    });
  };

  window.InputManager = InputManager;
})();
