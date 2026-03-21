// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * app.js — Main orchestrator for Triangle Playground.
 * Wires physics, renderer, input, HUD, and game modes together.
 * Manages intro screen, mode switching, countdown, and game lifecycle.
 */
(function () {
  'use strict';

  var MODE = { CREATIVE: 'creative', CONSTELLATION: 'constellation', RUSH: 'rush' };

  var DEFAULT_CFG = {
    count: 120,
    minSize: 10,
    maxSize: 28,
    driftSpeed: 0.4,
    attractRadius: 200,
    attractForce: 0.012,
    bondDist: 1.18,
    bondSpring: 0.055,
    separation: 0.85,
    separationRadius: 1.0,
    disperseForce: 2.8,
    dampFree: 0.989,
    dampBonded: 0.92,
    bondLineOpacity: 0.3,
    glowRadius: 6,
    glowOpacity: 0.12,
    dustCount: 40,
    dustSize: 1.5,
    dustSpeed: 0.15
  };

  // Fixed config for game modes — not adjustable by player
  var GAME_CFG = {
    count: 200,
    minSize: 10,
    maxSize: 28,
    driftSpeed: 0.4,
    attractRadius: 200,
    attractForce: 0.012,
    bondDist: 1.18,
    bondSpring: 0.055,
    separation: 0.85,
    separationRadius: 1.0,
    disperseForce: 2.8,
    dampFree: 0.989,
    dampBonded: 0.92,
    bondLineOpacity: 0.3,
    glowRadius: 6,
    glowOpacity: 0.12,
    dustCount: 40,
    dustSize: 1.5,
    dustSpeed: 0.15
  };

  function AppController() {
    this.canvas = document.getElementById('game-canvas');
    this.mode = null;
    this.running = true;
    this.frozen = false;

    var isMobile = window.innerWidth < 768;
    var isLowEnd = isMobile && (navigator.hardwareConcurrency || 4) < 4;

    this.cfg = {};
    for (var k in DEFAULT_CFG) {
      if (DEFAULT_CFG.hasOwnProperty(k)) this.cfg[k] = DEFAULT_CFG[k];
    }
    if (isLowEnd) {
      this.cfg.count = 50;
      this.cfg.dustCount = 15;
      this.cfg.glowRadius = 0;
      GAME_CFG.count = 80;
      GAME_CFG.dustCount = 15;
      GAME_CFG.glowRadius = 0;
    } else if (isMobile) {
      this.cfg.count = 80;
      this.cfg.dustCount = 25;
      this.cfg.attractRadius = 160;
      GAME_CFG.count = 150;
      GAME_CFG.dustCount = 25;
      GAME_CFG.attractRadius = 160;
    }

    this.palette = Palettes.get('brand');

    this.renderer = new Renderer(this.canvas);
    this.engine = new PhysicsEngine(this.cfg, window.innerWidth, window.innerHeight);
    this.input = new InputManager(this.canvas);
    this.input.setEngine(this.engine);
    this.hud = new HUD();

    this.creative = new CreativeMode(this);
    this.constellation = new ConstellationMode(this);
    this.rush = new ClusterRush(this);
    this.leaderboard = new Leaderboard();

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.introEl = document.getElementById('intro-screen');
    this.countdownEl = document.getElementById('countdown-overlay');
    this.countdownNumEl = document.getElementById('countdown-number');
  }

  AppController.prototype.init = function () {
    this.renderer.resize();
    this.engine.resize(this.renderer.W, this.renderer.H);
    this.engine.createTriangles(this.palette);
    this.engine.createDust();
    this.creative.init();
    this._bindModeButtons();
    this._bindInfoModal();
    this._bindResize();
    this._bindIntro();

    // Start render loop but don't show game UI yet
    if (!this.reducedMotion) {
      this._startLoop();
    }

    // Show intro screen (hides everything else)
    this._showIntro();
  };

  AppController.prototype._showIntro = function () {
    if (this.introEl) this.introEl.style.display = '';
    // Hide mode bar and HUD while on intro
    var modeBar = document.querySelector('.mode-bar');
    if (modeBar) modeBar.style.display = 'none';
    var hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    this.creative.hide();
    this.constellation.hide();
    this.rush.hide();

    // Fetch intro leaderboards
    this.leaderboard.fetchInto('constellation', document.getElementById('intro-lb-constellation'), 5);
    this.leaderboard.fetchInto('rush', document.getElementById('intro-lb-rush'), 5);
  };

  AppController.prototype._hideIntro = function () {
    if (this.introEl) this.introEl.style.display = 'none';
    var modeBar = document.querySelector('.mode-bar');
    if (modeBar) modeBar.style.display = '';
    var hud = document.getElementById('hud');
    if (hud) hud.style.display = '';
  };

  AppController.prototype._bindIntro = function () {
    var self = this;
    var btns = document.querySelectorAll('.intro-mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', (function (btn) {
        return function () {
          var mode = btn.dataset.mode;
          if (mode) {
            self._hideIntro();
            self.switchMode(mode);
          }
        };
      })(btns[i]));
    }
  };

  AppController.prototype._startLoop = function () {
    var self = this;
    function loop(time) {
      if (self.running) {
        if (!self.frozen) {
          self.engine.updateDust(time);
          self.engine.update(self.input.mouse, self.input.drag, performance.now());

          if (self.mode === MODE.CONSTELLATION) {
            self.constellation.tick(performance.now());
          } else if (self.mode === MODE.RUSH) {
            self.rush.tick(performance.now());
          }

          if (self.mode) {
            self.hud.updateStats(self.cfg.count, self.engine);
          }
        }
        // Always draw (so frozen state is visible)
        self._drawFrame(time);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  AppController.prototype._drawFrame = function (time) {
    this.renderer.clear();
    this.renderer.drawDust(this.engine.dust);

    // Draw constellation targets behind everything else
    if (this.mode === MODE.CONSTELLATION) {
      this.constellation.drawTargets(this.renderer.ctx, this.renderer.W, this.renderer.H);
    }

    this.renderer.drawBonds(this.engine.tris, this.engine.bonds, this.cfg);
    this.renderer.drawTrails(this.engine.tris);
    this.renderer.drawTriangles(this.engine.tris, this.cfg);
    this.renderer.drawAttractionField(this.input.mouse, this.cfg);
  };

  /**
   * Apply game config — locks physics to fixed values for fair gameplay.
   */
  AppController.prototype._applyGameCfg = function () {
    for (var k in GAME_CFG) {
      if (GAME_CFG.hasOwnProperty(k)) this.cfg[k] = GAME_CFG[k];
    }
    this.palette = Palettes.get('brand');
    this.resetTriangles();
  };

  /**
   * Fully reset triangles to fresh random positions with no bonds.
   */
  AppController.prototype.resetTriangles = function () {
    this.engine.createTriangles(this.palette);
    this.engine.createDust();
  };

  /**
   * Restore creative config from sliders (user's last settings).
   */
  AppController.prototype._applyCreativeCfg = function () {
    // Creative mode sliders store their own state — just restore defaults here
    // The creative.init() already captured defaults
  };

  /**
   * 3-2-1-GO countdown, then calls callback.
   */
  AppController.prototype.countdown = function (callback) {
    var self = this;
    var overlay = this.countdownEl;
    var numEl = this.countdownNumEl;
    if (!overlay || !numEl) { callback(); return; }

    var steps = ['3', '2', '1', 'GO'];
    var i = 0;

    overlay.style.display = '';

    function showNext() {
      if (i >= steps.length) {
        overlay.style.display = 'none';
        callback();
        return;
      }
      numEl.textContent = steps[i];
      // Reset animation
      numEl.style.animation = 'none';
      numEl.offsetHeight; // force reflow
      numEl.style.animation = '';
      i++;
      setTimeout(showNext, 800);
    }
    showNext();
  };

  AppController.prototype.switchMode = function (newMode) {
    this.creative.hide();
    this.constellation.hide();
    this.rush.hide();
    this.frozen = false;
    this.mode = newMode;

    switch (newMode) {
      case MODE.CREATIVE:
        this._applyCreativeCfg();
        this.creative.show();
        this.hud.showStats();
        break;
      case MODE.CONSTELLATION:
        this._applyGameCfg();
        this.constellation.show();
        this.hud.showGame();
        break;
      case MODE.RUSH:
        this._applyGameCfg();
        this.rush.show();
        this.hud.showGame();
        break;
    }

    // Update button states
    var btns = document.querySelectorAll('.mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.mode === newMode);
    }
  };

  AppController.prototype._bindModeButtons = function () {
    var self = this;
    var btns = document.querySelectorAll('.mode-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', (function (btn) {
        return function () {
          var mode = btn.dataset.mode;
          if (mode) self.switchMode(mode);
        };
      })(btns[i]));
    }
  };

  AppController.prototype._bindInfoModal = function () {
    var infoBtn = document.getElementById('info-btn');
    var infoOverlay = document.getElementById('overlay-info');
    var infoClose = document.getElementById('info-close');
    if (infoBtn && infoOverlay) {
      infoBtn.addEventListener('click', function () {
        infoOverlay.style.display = '';
      });
    }
    if (infoClose && infoOverlay) {
      infoClose.addEventListener('click', function () {
        infoOverlay.style.display = 'none';
      });
      infoOverlay.addEventListener('click', function (e) {
        if (e.target === infoOverlay) infoOverlay.style.display = 'none';
      });
    }
  };

  AppController.prototype._bindResize = function () {
    var self = this;
    window.addEventListener('resize', function () {
      self.renderer.resize();
      self.engine.resize(self.renderer.W, self.renderer.H);
      self.engine.createDust();
      if (self.reducedMotion) {
        self.engine.updateDust(0);
        self.engine.update(self.input.mouse, self.input.drag, performance.now());
        self._drawFrame(0);
      }
    });
  };

  // --- Init ---
  var app = new AppController();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { app.init(); });
  } else {
    app.init();
  }
})();
