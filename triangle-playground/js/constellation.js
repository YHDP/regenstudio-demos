/**
 * constellation.js — Constellation Builder game mode.
 * Player herds triangles to cover all touchpoints with one connected cluster.
 * 7 levels with increasing node count and spacing.
 * Uses countdown → timer → freeze-on-zero lifecycle.
 * Exposes window.ConstellationMode
 */
(function () {
  'use strict';

  var LEVEL_TIME = 60; // seconds per level

  function ConstellationMode(app) {
    this.app = app;
    this.levels = [];
    this.currentLevel = 0;
    this.active = false;
    this.started = false;
    this.startTime = 0;
    this.elapsed = 0;
    this.score = 0;
    this.totalScore = 0;
    this.coveredNodes = 0;
    this.allCovered = false;
    this.bestScore = parseInt(localStorage.getItem('tp-constellation-best') || '0', 10);

    // Overlay elements
    this.introOverlay = document.getElementById('overlay-level-intro');
    this.scoreOverlay = document.getElementById('overlay-score');
    this.gameOverOverlay = document.getElementById('overlay-game-over');
    this.levelBadge = document.getElementById('level-badge');
    this.levelName = document.getElementById('level-name');
    this.levelDesc = document.getElementById('level-desc');
    this.previewCanvas = document.getElementById('level-preview');
    this.startBtn = document.getElementById('btn-start-level');
    this.scoreBreakdown = document.getElementById('score-breakdown');
    this.replayBtn = document.getElementById('btn-replay');
    this.nextLevelBtn = document.getElementById('btn-next-level');
    this.gameOverTitle = document.getElementById('game-over-title');
    this.finalScoreEl = document.getElementById('final-score');
    this.personalBestEl = document.getElementById('personal-best');
    this.backBtn = document.getElementById('btn-back-menu');
    this.playAgainBtn = document.getElementById('btn-play-again');

    this._loadLevels();
    this._bindButtons();
  }

  ConstellationMode.prototype._loadLevels = function () {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/levels.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          self.levels = data.levels || [];
        } catch (e) {
          self.levels = [];
        }
      }
    };
    xhr.send();
  };

  ConstellationMode.prototype._bindButtons = function () {
    var self = this;

    if (this.startBtn) {
      this.startBtn.addEventListener('click', function () {
        self._hideOverlay(self.introOverlay);
        self._startLevelWithCountdown();
      });
    }

    if (this.replayBtn) {
      this.replayBtn.addEventListener('click', function () {
        self._hideOverlay(self.scoreOverlay);
        self._restoreGamePhysics();
        self._showLevelIntro();
      });
    }

    if (this.nextLevelBtn) {
      this.nextLevelBtn.addEventListener('click', function () {
        self._hideOverlay(self.scoreOverlay);
        self._restoreGamePhysics();
        self.currentLevel++;
        if (self.currentLevel >= self.levels.length) {
          self._showGameOver();
        } else {
          self._showLevelIntro();
        }
      });
    }

    // backBtn and playAgainBtn are rebound in _showGameOver() via onclick
    // since both constellation and rush share the same game-over overlay
  };

  ConstellationMode.prototype.show = function () {
    this.active = true;
    this.currentLevel = 0;
    this.totalScore = 0;
    this._showLevelIntro();
  };

  ConstellationMode.prototype.hide = function () {
    this.active = false;
    this.started = false;
    this._hideOverlay(this.introOverlay);
    this._hideOverlay(this.scoreOverlay);
    this._hideOverlay(this.gameOverOverlay);
  };

  ConstellationMode.prototype._showLevelIntro = function () {
    var level = this.levels[this.currentLevel];
    if (!level) return;

    if (this.levelBadge) this.levelBadge.textContent = level.bonus ? 'Bonus Round' : 'Level ' + level.id;
    if (this.levelName) this.levelName.textContent = level.name;
    if (this.levelDesc) this.levelDesc.textContent = level.description;

    this._drawPreview(level);
    this._showOverlay(this.introOverlay);

    this.app.hud.setLevel(level.name, level.id);
    this.app.hud.setScore(0);
    this.app.hud.setTimer(LEVEL_TIME);
  };

  ConstellationMode.prototype._drawPreview = function (level) {
    if (!this.previewCanvas) return;
    var ctx = this.previewCanvas.getContext('2d');
    var W = this.previewCanvas.width;
    var H = this.previewCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#FAFBFC';
    ctx.fillRect(0, 0, W, H);

    // Bonus round: show "?" instead of nodes
    if (level.bonus) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#FFA92D';
      ctx.font = 'bold 72px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', W / 2, H / 2);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      return;
    }

    if (!level.nodes) return;

    // Draw touchpoint zones
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#009BBB';
    for (var i = 0; i < level.nodes.length; i++) {
      var n = level.nodes[i];
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, level.tolerance * (W / 800), 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw touchpoint dots
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#009BBB';
    for (var i = 0; i < level.nodes.length; i++) {
      var n = level.nodes[i];
      ctx.beginPath();
      ctx.arc(n.x * W, n.y * H, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  /**
   * Generate random touchpoints for bonus round.
   * Keeps nodes within center region and spaced apart.
   */
  ConstellationMode.prototype._generateBonusNodes = function (level) {
    var count = level.nodeCount || 5;
    var nodes = [];
    var minSpacing = 0.12;

    for (var i = 0; i < count; i++) {
      var attempts = 0;
      var x, y, tooClose;
      do {
        x = 0.25 + Math.random() * 0.50;
        y = 0.22 + Math.random() * 0.42;
        tooClose = false;
        for (var j = 0; j < nodes.length; j++) {
          var dx = x - nodes[j].x;
          var dy = y - nodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < minSpacing) {
            tooClose = true;
            break;
          }
        }
        attempts++;
      } while (tooClose && attempts < 50);
      nodes.push({ x: x, y: y });
    }

    level.nodes = nodes;
  };

  /**
   * Randomize physics config for bonus round.
   * Picks random but playable values for each parameter.
   */
  ConstellationMode.prototype._randomizePhysics = function () {
    var cfg = this.app.cfg;
    function rand(min, max) { return min + Math.random() * (max - min); }

    cfg.attractRadius = rand(120, 320);
    cfg.attractForce = rand(0.005, 0.03);
    cfg.bondDist = rand(0.9, 1.8);
    cfg.bondSpring = rand(0.02, 0.12);
    cfg.driftSpeed = rand(0.15, 1.0);
    cfg.separation = rand(0.3, 1.5);
    cfg.disperseForce = rand(1.0, 5.0);
    cfg.dampFree = rand(0.965, 0.995);
    cfg.dampBonded = rand(0.88, 0.96);
  };

  /**
   * Restore standard game physics after a bonus round.
   */
  ConstellationMode.prototype._restoreGamePhysics = function () {
    this.app._applyGameCfg();
  };

  ConstellationMode.prototype._startLevelWithCountdown = function () {
    var self = this;
    var level = this.levels[this.currentLevel];

    // Bonus round: generate random nodes and randomize physics
    if (level && level.bonus) {
      this._generateBonusNodes(level);
      this._randomizePhysics();
    }

    // Fully reset triangles to fresh random positions
    this.app.resetTriangles();

    // Ensure physics running
    this.app.frozen = false;

    this.app.countdown(function () {
      self.started = true;
      self.startTime = performance.now();
      self.score = 0;
      self.coveredNodes = 0;
      self.allCovered = false;
      self.app.hud.setScore(0);
    });
  };

  ConstellationMode.prototype.tick = function (now) {
    if (!this.active || !this.started) return;

    var level = this.levels[this.currentLevel];
    if (!level) return;

    this.elapsed = (now - this.startTime) / 1000;
    var remaining = Math.max(0, LEVEL_TIME - this.elapsed);
    this.app.hud.setTimer(remaining);

    // Check if time's up
    if (remaining <= 0) {
      this._endLevel(level);
      return;
    }

    // Calculate live score
    var result = this._calculateScore(level);
    this.score = result.score;
    this.coveredNodes = result.covered;
    this.allCovered = result.allInOneCluster;
    this.app.hud.setScore(this.score);

    // Show progress in level HUD — make cluster requirement clear
    var progressText = result.covered + '/' + level.nodes.length;
    if (result.allInOneCluster) {
      progressText += ' — connected!';
    } else if (result.covered === level.nodes.length) {
      progressText += ' — not one cluster yet!';
    } else if (result.covered > 0) {
      progressText += ' — need one cluster';
    }
    this.app.hud.setLevel(level.name + ' — ' + progressText, level.id);

    // All touchpoints covered in one cluster → level complete immediately
    if (result.allInOneCluster) {
      this._endLevel(level);
      return;
    }
  };

  /**
   * Score calculation:
   * - Each touchpoint covered by a bonded triangle = base points
   * - All touchpoints must be covered by triangles belonging to ONE connected cluster
   * - Big bonus when all nodes are in a single cluster
   */
  ConstellationMode.prototype._calculateScore = function (level) {
    var engine = this.app.engine;
    var W = engine.W;
    var H = engine.H;
    var tris = engine.tris;
    var tolerance = level.tolerance;
    var score = 0;
    var covered = 0;

    // For each touchpoint, find the closest bonded triangle
    var coveringTriIds = []; // triangle id covering each node (or -1)

    for (var n = 0; n < level.nodes.length; n++) {
      var node = level.nodes[n];
      var nx = node.x * W;
      var ny = node.y * H;
      var bestDist = Infinity;
      var bestTriId = -1;
      var nodeScore = 0;

      for (var i = 0; i < tris.length; i++) {
        var t = tris[i];
        var dx = t.x - nx;
        var dy = t.y - ny;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < tolerance) {
          var proximity = 1 - (dist / tolerance);
          var bondBonus = t.bondCount > 0 ? 2.0 : 0.5;
          nodeScore += Math.round(proximity * 10 * bondBonus);

          // Track closest bonded triangle for cluster check
          if (t.bondCount > 0 && dist < bestDist) {
            bestDist = dist;
            bestTriId = t.id;
          }
        }
      }

      if (bestTriId >= 0) {
        covered++;
      }
      coveringTriIds.push(bestTriId);
      score += nodeScore;
    }

    // Check if all covered nodes belong to one connected cluster
    var allInOneCluster = false;
    if (covered === level.nodes.length) {
      // Get the cluster of the first covering triangle
      var firstTri = tris[coveringTriIds[0]];
      if (firstTri) {
        var cluster = engine.findClusterOf(firstTri);
        if (cluster) {
          allInOneCluster = true;
          for (var n = 0; n < coveringTriIds.length; n++) {
            if (!cluster.has(coveringTriIds[n])) {
              allInOneCluster = false;
              break;
            }
          }
        }
      }

      if (allInOneCluster) {
        // Big bonus for single cluster covering all nodes
        score += level.nodes.length * 50;
      }
    }

    return { score: score, covered: covered, allInOneCluster: allInOneCluster };
  };

  ConstellationMode.prototype._endLevel = function (level) {
    this.started = false;
    this.app.frozen = true;

    var result = this._calculateScore(level);
    var finalScore = result.score;

    // Time bonus if all covered in one cluster
    var timeBonus = 0;
    if (result.allInOneCluster) {
      var timeLeft = Math.max(0, LEVEL_TIME - this.elapsed);
      timeBonus = Math.round(timeLeft * 5);
      finalScore += timeBonus;
    }

    this.totalScore += finalScore;

    // Bonus round always advances; normal levels require success
    var canAdvance = result.allInOneCluster || level.bonus;
    var isLastLevel = this.currentLevel + 1 >= this.levels.length;
    var isGameOver = !canAdvance || (canAdvance && isLastLevel);

    // Game over: failed a level OR completed the final level → straight to leaderboard
    if (isGameOver) {
      this._lastResult = result;
      this._lastTimeBonus = timeBonus;
      this._lastLevelScore = finalScore;
      this._showGameOver();
      return;
    }

    // Mid-game level complete → show score overlay to continue
    var titleEl = document.getElementById('score-title');
    if (titleEl) {
      titleEl.textContent = level.bonus ? 'Bonus Complete!' : 'Level Complete!';
    }

    if (this.scoreBreakdown) {
      var statusText = '<p style="color:var(--emerald);font-weight:600;">All ' + level.nodes.length + ' touchpoints covered in one cluster!</p>';
      if (timeBonus > 0) {
        statusText += '<p style="font-size:13px;color:#555;">Time bonus: +' + timeBonus + '</p>';
      }

      var levelLabel = level.bonus ? 'Bonus Round' : ('Level ' + level.id + ' of ' + this.levels.length);
      this.scoreBreakdown.innerHTML =
        '<div class="final-score">' + finalScore + '</div>' +
        statusText +
        '<p style="font-size:13px;color:#999;">' + levelLabel + ' &middot; Total: ' + this.totalScore + '</p>';
    }

    if (this.nextLevelBtn) {
      this.nextLevelBtn.style.display = '';
      this.nextLevelBtn.textContent = 'Next Level';
    }
    if (this.replayBtn) {
      this.replayBtn.textContent = 'Replay';
    }

    this._showOverlay(this.scoreOverlay);
  };

  ConstellationMode.prototype._showGameOver = function () {
    if (this.totalScore > this.bestScore) {
      this.bestScore = this.totalScore;
      localStorage.setItem('tp-constellation-best', String(this.bestScore));
    }

    var level = this.levels[this.currentLevel];
    var result = this._lastResult;
    var completedAll = result && result.allInOneCluster && (this.currentLevel + 1 >= this.levels.length);

    if (this.gameOverTitle) this.gameOverTitle.textContent = completedAll ? 'All Levels Complete!' : 'Game Over';
    if (this.finalScoreEl) this.finalScoreEl.textContent = this.totalScore;

    // Show context: why the game ended + personal best
    if (this.personalBestEl) {
      var info = '';
      if (result && !completedAll && level) {
        if (result.covered === level.nodes.length) {
          info = 'All touchpoints covered, but not in one cluster.<br>';
        } else {
          info = result.covered + ' of ' + level.nodes.length + ' touchpoints covered.<br>';
        }
        info += 'Reached level ' + level.id + ' of ' + this.levels.length + '<br>';
      }
      this.personalBestEl.innerHTML = info + 'Personal best: ' + this.bestScore;
    }

    // Rebind overlay buttons for constellation mode
    var self = this;
    if (this.backBtn) {
      this.backBtn.onclick = function () {
        self._hideOverlay(self.gameOverOverlay);
        self.app.frozen = false;
        self.app.switchMode('creative');
      };
    }
    if (this.playAgainBtn) {
      this.playAgainBtn.onclick = function () {
        self._hideOverlay(self.gameOverOverlay);
        self.app.frozen = false;
        self.currentLevel = 0;
        self.totalScore = 0;
        self._lastResult = null;
        self._showLevelIntro();
      };
    }

    // Show leaderboard immediately
    this.app.leaderboard.show('constellation', this.totalScore, this.currentLevel + 1);

    // Unfreeze
    this.app.frozen = false;

    this._showOverlay(this.gameOverOverlay);
  };

  ConstellationMode.prototype._showOverlay = function (el) {
    if (el) el.style.display = '';
  };

  ConstellationMode.prototype._hideOverlay = function (el) {
    if (el) el.style.display = 'none';
  };

  /**
   * Draw touchpoints on canvas — just circles, no connecting lines.
   * Covered nodes pulse green, uncovered ones pulse teal.
   */
  ConstellationMode.prototype.drawTargets = function (ctx, W, H) {
    if (!this.active || !this.started) return;
    var level = this.levels[this.currentLevel];
    if (!level) return;

    var engine = this.app.engine;
    var tris = engine.tris;
    var tolerance = level.tolerance;
    var time = performance.now() * 0.002;

    for (var i = 0; i < level.nodes.length; i++) {
      var n = level.nodes[i];
      var nx = n.x * W;
      var ny = n.y * H;

      // Check if this node is covered by a bonded triangle
      var isCovered = false;
      for (var j = 0; j < tris.length; j++) {
        var t = tris[j];
        if (t.bondCount < 1) continue;
        var dx = t.x - nx;
        var dy = t.y - ny;
        if (dx * dx + dy * dy < tolerance * tolerance) {
          isCovered = true;
          break;
        }
      }

      // Pulsing zone
      var pulse = 0.5 + Math.sin(time + i * 1.2) * 0.15;

      // Zone fill
      ctx.globalAlpha = isCovered ? 0.08 : 0.05 * pulse;
      ctx.fillStyle = isCovered ? '#00914B' : '#009BBB';
      ctx.beginPath();
      ctx.arc(nx, ny, tolerance, 0, Math.PI * 2);
      ctx.fill();

      // Zone ring
      ctx.globalAlpha = isCovered ? 0.3 : 0.15 * pulse;
      ctx.strokeStyle = isCovered ? '#00914B' : '#009BBB';
      ctx.lineWidth = isCovered ? 2 : 1;
      ctx.beginPath();
      ctx.arc(nx, ny, tolerance, 0, Math.PI * 2);
      ctx.stroke();

      // Center dot
      ctx.globalAlpha = isCovered ? 0.6 : 0.3;
      ctx.fillStyle = isCovered ? '#00914B' : '#009BBB';
      ctx.beginPath();
      ctx.arc(nx, ny, isCovered ? 4 : 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  window.ConstellationMode = ConstellationMode;
})();
