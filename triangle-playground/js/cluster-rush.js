/**
 * cluster-rush.js — Cluster Rush game mode.
 * 60 seconds to form as many bonds as possible.
 * Combo system rewards consecutive bond formation.
 * Uses countdown → timer → freeze-on-zero lifecycle.
 * Exposes window.ClusterRush
 */
(function () {
  'use strict';

  var RUSH_TIME = 60; // seconds

  function ClusterRush(app) {
    this.app = app;
    this.active = false;
    this.started = false;
    this.startTime = 0;
    this.score = 0;
    this.combo = 1;
    this.lastBondCount = 0;
    this.comboTimer = 0;
    this.peakBonds = 0;
    this.bestScore = parseInt(localStorage.getItem('tp-rush-best') || '0', 10);

    // Overlay elements (reuses game-over overlay)
    this.gameOverOverlay = document.getElementById('overlay-game-over');
    this.gameOverTitle = document.getElementById('game-over-title');
    this.finalScoreEl = document.getElementById('final-score');
    this.personalBestEl = document.getElementById('personal-best');
    this.backBtn = document.getElementById('btn-back-menu');
    this.playAgainBtn = document.getElementById('btn-play-again');

    this._bindButtons();
  }

  ClusterRush.prototype._bindButtons = function () {
    var self = this;

    // Back and play again are shared with constellation mode
    // They get rebound when this mode is active
  };

  ClusterRush.prototype.show = function () {
    this.active = true;
    this.score = 0;
    this.combo = 1;
    this.lastBondCount = 0;
    this.comboTimer = 0;
    this.peakBonds = 0;
    this.started = false;

    this.app.hud.setScore(0);
    this.app.hud.setTimer(RUSH_TIME);
    this.app.hud.setCombo(0);

    this._startWithCountdown();
  };

  ClusterRush.prototype.hide = function () {
    this.active = false;
    this.started = false;
    if (this.gameOverOverlay) this.gameOverOverlay.style.display = 'none';
  };

  ClusterRush.prototype._startWithCountdown = function () {
    var self = this;

    // Fully reset triangles to fresh random positions
    this.app.resetTriangles();

    // Ensure physics running
    this.app.frozen = false;

    this.app.countdown(function () {
      self.started = true;
      self.startTime = performance.now();
      self.lastBondCount = 0;
      self.score = 0;
      self.combo = 1;
      self.comboTimer = performance.now();
      self.app.hud.setScore(0);
    });
  };

  ClusterRush.prototype.start = function () {
    // Called by switchMode — show() already handles everything
  };

  ClusterRush.prototype.tick = function (now) {
    if (!this.active || !this.started) return;

    var elapsed = (now - this.startTime) / 1000;
    var remaining = Math.max(0, RUSH_TIME - elapsed);
    this.app.hud.setTimer(remaining);

    // Check if time's up
    if (remaining <= 0) {
      this._endRush();
      return;
    }

    // Track bond changes for scoring
    var currentBonds = this.app.engine.bonds.size;

    if (currentBonds > this.peakBonds) {
      this.peakBonds = currentBonds;
    }

    // New bonds formed since last tick
    var newBonds = currentBonds - this.lastBondCount;

    if (newBonds > 0) {
      // Award points for new bonds with combo multiplier
      var points = newBonds * 10 * this.combo;
      this.score += points;

      // Increase combo
      this.combo = Math.min(10, this.combo + 1);
      this.comboTimer = now;
      this.app.hud.setCombo(this.combo);
    } else if (newBonds < 0) {
      // Bonds were broken — losing bonds drops combo (but doesn't penalize score)
      if (now - this.comboTimer > 2000) {
        this.combo = Math.max(1, this.combo - 1);
        this.comboTimer = now;
        this.app.hud.setCombo(this.combo);
      }
    } else {
      // No change — combo decays after 3 seconds of inactivity
      if (now - this.comboTimer > 3000 && this.combo > 1) {
        this.combo = Math.max(1, this.combo - 1);
        this.comboTimer = now;
        this.app.hud.setCombo(this.combo);
      }
    }

    this.lastBondCount = currentBonds;

    // Cluster bonus — extra points for large clusters (every 2 seconds)
    if (Math.floor(elapsed * 2) % 2 === 0 && Math.floor(elapsed * 2) !== this._lastClusterCheck) {
      this._lastClusterCheck = Math.floor(elapsed * 2);
      var clusters = this.app.engine.countClusters();
      if (clusters > 0) {
        // Bonus for maintaining clusters
        this.score += clusters * 5;
      }
    }

    this.app.hud.setScore(this.score);
  };

  ClusterRush.prototype._endRush = function () {
    this.started = false;
    this.app.frozen = true;

    // Bonus for peak bonds achieved
    var peakBonus = this.peakBonds * 5;
    var finalBonds = this.app.engine.bonds.size;
    var retainBonus = finalBonds * 15;
    var finalScore = this.score + peakBonus + retainBonus;

    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      localStorage.setItem('tp-rush-best', String(this.bestScore));
    }

    // Rebind overlay buttons for rush mode
    var self = this;
    if (this.backBtn) {
      this.backBtn.onclick = function () {
        self.gameOverOverlay.style.display = 'none';
        self.app.frozen = false;
        self.app.switchMode('creative');
      };
    }
    if (this.playAgainBtn) {
      this.playAgainBtn.onclick = function () {
        self.gameOverOverlay.style.display = 'none';
        self.app.frozen = false;
        self.app.switchMode('rush');
      };
    }

    if (this.gameOverTitle) this.gameOverTitle.textContent = 'Time\'s Up!';
    if (this.finalScoreEl) this.finalScoreEl.textContent = finalScore;
    if (this.personalBestEl) {
      var breakdown = 'Bond points: ' + this.score +
        ' + Peak bonus: ' + peakBonus +
        ' + Retain bonus: ' + retainBonus;
      this.personalBestEl.innerHTML = breakdown +
        '<br>Personal best: ' + this.bestScore;
    }

    // Show leaderboard
    this.app.leaderboard.show('rush', finalScore);

    if (this.gameOverOverlay) this.gameOverOverlay.style.display = '';
  };

  window.ClusterRush = ClusterRush;
})();
