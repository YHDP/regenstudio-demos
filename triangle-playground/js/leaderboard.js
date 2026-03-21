// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * leaderboard.js — Leaderboard client for Triangle Playground.
 * Submits scores to and fetches scores from Supabase edge function.
 * Exposes window.Leaderboard
 */
(function () {
  'use strict';

  var API_URL = 'https://uemspezaqxmkhenimwuf.supabase.co/functions/v1/tp-leaderboard';

  function Leaderboard() {
    this.submitEl = document.getElementById('leaderboard-submit');
    this.nameInput = document.getElementById('leaderboard-name');
    this.submitBtn = document.getElementById('btn-submit-score');
    this.statusEl = document.getElementById('leaderboard-status');
    this.titleEl = document.getElementById('leaderboard-title');
    this.listEl = document.getElementById('leaderboard-list');

    this._currentMode = null;
    this._currentScore = 0;
    this._currentLevel = null;
    this._submitted = false;
    this._highlightName = null;

    // Restore last used nickname
    this._savedName = localStorage.getItem('tp-nickname') || '';

    this._bindSubmit();
  }

  Leaderboard.prototype._bindSubmit = function () {
    var self = this;
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', function () {
        self._submit();
      });
    }
    if (this.nameInput) {
      this.nameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') self._submit();
      });
    }
  };

  /**
   * Show leaderboard for a mode. Call this when game-over overlay appears.
   */
  Leaderboard.prototype.show = function (mode, score, levelReached) {
    this._currentMode = mode;
    this._currentScore = score;
    this._currentLevel = levelReached || null;
    this._submitted = false;
    this._highlightName = null;

    // Reset submit form
    if (this.submitEl) this.submitEl.style.display = '';
    if (this.nameInput) this.nameInput.value = this._savedName;
    if (this.statusEl) this.statusEl.textContent = '';
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Submit';
    }

    // Update title
    if (this.titleEl) {
      this.titleEl.textContent = mode === 'rush' ? 'Cluster Rush Top 15' : 'Constellation Top 15';
    }

    // Fetch and display leaderboard
    this._fetchLeaderboard(mode);
  };

  Leaderboard.prototype._submit = function () {
    if (this._submitted) return;
    var name = this.nameInput ? this.nameInput.value.trim() : '';
    if (!name) {
      if (this.statusEl) this.statusEl.textContent = 'Enter a nickname first';
      return;
    }
    if (name.length > 20) name = name.slice(0, 20);

    this._submitted = true;
    this._highlightName = name;

    // Save nickname for next time
    localStorage.setItem('tp-nickname', name);
    this._savedName = name;

    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Saving...';
    }

    var self = this;
    var body = {
      nickname: name,
      score: this._currentScore,
      mode: this._currentMode
    };
    if (this._currentLevel != null) {
      body.level_reached = this._currentLevel;
    }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.error) {
        if (self.statusEl) self.statusEl.textContent = 'Error: ' + data.error;
        self._submitted = false;
        if (self.submitBtn) {
          self.submitBtn.disabled = false;
          self.submitBtn.textContent = 'Submit';
        }
        return;
      }
      if (self.statusEl) {
        self.statusEl.textContent = 'Saved! You are #' + data.rank;
      }
      if (self.submitEl) {
        // Hide form, keep status visible
        if (self.nameInput) self.nameInput.style.display = 'none';
        if (self.submitBtn) self.submitBtn.style.display = 'none';
      }
      // Refresh leaderboard
      self._fetchLeaderboard(self._currentMode);
    })
    .catch(function () {
      if (self.statusEl) self.statusEl.textContent = 'Could not connect. Try again.';
      self._submitted = false;
      if (self.submitBtn) {
        self.submitBtn.disabled = false;
        self.submitBtn.textContent = 'Submit';
      }
    });
  };

  Leaderboard.prototype._fetchLeaderboard = function (mode) {
    var self = this;
    if (this.listEl) this.listEl.innerHTML = '<div class="leaderboard-empty">Loading...</div>';

    fetch(API_URL + '?mode=' + encodeURIComponent(mode) + '&limit=15')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.leaderboard || data.leaderboard.length === 0) {
        if (self.listEl) self.listEl.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
      }
      self._renderList(data.leaderboard);
    })
    .catch(function () {
      if (self.listEl) self.listEl.innerHTML = '<div class="leaderboard-empty">Could not load leaderboard</div>';
    });
  };

  Leaderboard.prototype._renderList = function (entries) {
    if (!this.listEl) return;
    var html = '';
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var isHighlight = this._highlightName && e.nickname === this._highlightName && e.score === this._currentScore;
      html += '<div class="leaderboard-row' + (isHighlight ? ' highlight' : '') + '">';
      html += '<span class="leaderboard-rank">' + (i + 1) + '</span>';
      html += '<span class="leaderboard-name">' + this._escapeHtml(e.nickname) + '</span>';
      html += '<span class="leaderboard-score">' + e.score + '</span>';
      html += '</div>';
    }
    this.listEl.innerHTML = html;
  };

  Leaderboard.prototype._escapeHtml = function (str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /**
   * Fetch and render a mini leaderboard into any container element.
   * Used on the intro screen.
   */
  Leaderboard.prototype.fetchInto = function (mode, containerEl, limit) {
    if (!containerEl) return;
    var self = this;
    limit = limit || 5;
    containerEl.innerHTML = '<div class="leaderboard-empty">Loading...</div>';

    fetch(API_URL + '?mode=' + encodeURIComponent(mode) + '&limit=' + limit)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.leaderboard || data.leaderboard.length === 0) {
        containerEl.innerHTML = '<div class="leaderboard-empty">No scores yet</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < data.leaderboard.length; i++) {
        var e = data.leaderboard[i];
        html += '<div class="leaderboard-row">';
        html += '<span class="leaderboard-rank">' + (i + 1) + '</span>';
        html += '<span class="leaderboard-name">' + self._escapeHtml(e.nickname) + '</span>';
        html += '<span class="leaderboard-score">' + e.score + '</span>';
        html += '</div>';
      }
      containerEl.innerHTML = html;
    })
    .catch(function () {
      containerEl.innerHTML = '<div class="leaderboard-empty">Could not load</div>';
    });
  };

  window.Leaderboard = Leaderboard;
})();
