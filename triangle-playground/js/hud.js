/**
 * hud.js — HUD overlay for Triangle Playground.
 * Exposes window.HUD
 */
(function () {
  'use strict';

  function HUD() {
    this.statsEl = document.getElementById('hud-stats');
    this.gameEl = document.getElementById('hud-game');
    this.countEl = document.getElementById('hud-count');
    this.clustersEl = document.getElementById('hud-clusters');
    this.bondsEl = document.getElementById('hud-bonds');
    this.timerEl = document.getElementById('hud-timer');
    this.scoreEl = document.getElementById('hud-score');
    this.comboEl = document.getElementById('hud-combo');
    this.levelEl = document.getElementById('hud-level');
    this.toastContainer = document.getElementById('toast-container');
    this.smooth = { count: 0, clusters: 0, bonds: 0 };
    this.frame = 0;
  }

  HUD.prototype.updateStats = function (triCount, engine) {
    this.frame++;
    if (this.frame % 6 !== 0) return;

    var clusters = engine.countClusters();
    var bonds = engine.bonds.size;

    this.smooth.count += (triCount - this.smooth.count) * 0.3;
    this.smooth.clusters += (clusters - this.smooth.clusters) * 0.25;
    this.smooth.bonds += (bonds - this.smooth.bonds) * 0.25;

    if (this.countEl) this.countEl.textContent = Math.round(this.smooth.count);
    if (this.clustersEl) this.clustersEl.textContent = Math.round(this.smooth.clusters);
    if (this.bondsEl) this.bondsEl.textContent = Math.round(this.smooth.bonds);
  };

  HUD.prototype.setTimer = function (seconds) {
    if (!this.timerEl) return;
    var s = Math.max(0, Math.ceil(seconds));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    this.timerEl.textContent = m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  HUD.prototype.setScore = function (score) {
    if (this.scoreEl) this.scoreEl.textContent = score;
  };

  HUD.prototype.setCombo = function (combo) {
    if (!this.comboEl) return;
    if (combo > 1) {
      this.comboEl.textContent = 'x' + combo + ' combo';
      this.comboEl.classList.add('active');
    } else {
      this.comboEl.classList.remove('active');
    }
  };

  HUD.prototype.setLevel = function (name, number) {
    if (this.levelEl) this.levelEl.textContent = 'Level ' + number + ': ' + name;
  };

  HUD.prototype.showStats = function () {
    if (this.statsEl) this.statsEl.style.display = '';
    if (this.gameEl) this.gameEl.style.display = 'none';
  };

  HUD.prototype.showGame = function () {
    if (this.statsEl) this.statsEl.style.display = 'none';
    if (this.gameEl) this.gameEl.style.display = '';
  };

  HUD.prototype.hide = function () {
    if (this.statsEl) this.statsEl.style.display = 'none';
    if (this.gameEl) this.gameEl.style.display = 'none';
  };

  HUD.prototype.toast = function (message, duration) {
    if (!this.toastContainer) return;
    duration = duration || 2000;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    this.toastContainer.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(function () { el.remove(); }, 300);
    }, duration);
  };

  window.HUD = HUD;
})();
