// Copyright 2024-2026 Regen Studio B.V.
// Licensed under PolyForm Noncommercial 1.0.0 — see LICENSE
/**
 * creative.js — Creative mode: sliders, palette picker, freeze/export.
 * Exposes window.CreativeMode
 */
(function () {
  'use strict';

  var SLIDERS = [
    { key: 'count',         label: 'Triangles',      min: 20,    max: 300,  step: 5,     fmt: '' },
    { key: 'attractRadius', label: 'Attract Radius',  min: 80,    max: 400,  step: 10,    fmt: 'px' },
    { key: 'attractForce',  label: 'Attract Force',   min: 0.003, max: 0.04, step: 0.001, fmt: '' },
    { key: 'bondDist',      label: 'Bond Distance',   min: 0.8,   max: 2.0,  step: 0.05,  fmt: 'x' },
    { key: 'bondSpring',    label: 'Bond Spring',     min: 0.01,  max: 0.15, step: 0.005, fmt: '' },
    { key: 'driftSpeed',    label: 'Drift Speed',     min: 0.1,   max: 1.5,  step: 0.05,  fmt: '' },
    { key: 'separation',    label: 'Separation',      min: 0.2,   max: 2.0,  step: 0.05,  fmt: '' },
    { key: 'disperseForce', label: 'Disperse Force',  min: 0.5,   max: 6.0,  step: 0.1,   fmt: '' },
    { key: 'dampFree',      label: 'Free Damping',    min: 0.96,  max: 0.999,step: 0.001, fmt: '' }
  ];

  var SHARE_URL = 'https://demos.regenstudio.world/triangle-playground/';
  var COMPANY_NAME = 'Regen Studio';
  var BLUESKY_HANDLE = '@regen-studio.bsky.social';
  var LINKEDIN_PAGE = 'https://linkedin.com/company/regen-studio';

  var SHARE_MSGS = {
    bluesky: 'I just created emergent art from an ecosystem of triangles\n\nMade with ' + BLUESKY_HANDLE + ' — designing innovations that regenerate humans, cities and nature.\n\n' + SHARE_URL,
    linkedin: 'I just created emergent art from an ecosystem of interactive triangles at ' + COMPANY_NAME + ' — designing innovations that regenerate humans, cities and nature.\n\nTry it yourself: ' + SHARE_URL + '\n\nFollow ' + COMPANY_NAME + ': ' + LINKEDIN_PAGE,
    mastodon: 'I just created emergent art from an ecosystem of triangles\n\nMade with @regen_studio@mastodon.social — designing innovations that regenerate humans, cities and nature.\n\n' + SHARE_URL + '\n\n#RegenerativeDesign #GenerativeArt #Innovation',
    reddit: 'Emergent Art — Interactive triangle ecosystem by Regen Studio',
    whatsapp: 'I just created emergent art from an ecosystem of triangles at ' + COMPANY_NAME + ' — try it yourself! ' + SHARE_URL,
    email: {
      subject: 'Emergent Art — Made with ' + COMPANY_NAME,
      body: 'I just created emergent art from an interactive ecosystem of triangles at ' + COMPANY_NAME + '.\n\n' + COMPANY_NAME + ' designs innovations that regenerate humans, cities and nature.\n\nTry it yourself: ' + SHARE_URL + '\n\nLearn more: ' + LINKEDIN_PAGE
    },
    native: 'I just created emergent art from an ecosystem of triangles at ' + COMPANY_NAME + ' — designing innovations that regenerate humans, cities and nature.'
  };

  function CreativeMode(app) {
    this.app = app;
    this.panelEl = document.getElementById('creative-panel');
    this.bodyEl = document.getElementById('panel-body');
    this.slidersEl = document.getElementById('sliders-container');
    this.paletteEl = document.getElementById('palette-container');
    this.freezeBtn = document.getElementById('btn-freeze');
    this.exportBtn = document.getElementById('btn-export');
    this.resetBtn = document.getElementById('btn-reset');
    this.toggleBtn = document.getElementById('panel-toggle');
    this.reopenBtn = document.getElementById('panel-reopen');
    this.shareStepEl = document.getElementById('share-step');
    this.paletteKey = 'brand';
    this.frozen = false;
    this.sliderInputs = {};
    this.sliderValues = {};
    this.defaults = null;
  }

  CreativeMode.prototype.init = function () {
    this.defaults = JSON.parse(JSON.stringify(this.app.cfg));
    this._buildSliders();
    this._buildPalette();
    this._bindActions();
  };

  CreativeMode.prototype._buildSliders = function () {
    if (!this.slidersEl) return;
    this.slidersEl.innerHTML = '';
    for (var i = 0; i < SLIDERS.length; i++) {
      var s = SLIDERS[i];
      var val = this.app.cfg[s.key];
      var group = document.createElement('div');
      group.className = 'slider-group';

      var label = document.createElement('div');
      label.className = 'slider-label';
      var nameSpan = document.createElement('span');
      nameSpan.textContent = s.label;
      var valSpan = document.createElement('span');
      valSpan.className = 'slider-value';
      valSpan.textContent = this._fmtVal(val, s);
      label.appendChild(nameSpan);
      label.appendChild(valSpan);

      var input = document.createElement('input');
      input.type = 'range';
      input.min = s.min;
      input.max = s.max;
      input.step = s.step;
      input.value = val;
      input.dataset.key = s.key;

      this.sliderInputs[s.key] = input;
      this.sliderValues[s.key] = valSpan;

      var self = this;
      input.addEventListener('input', (function (slider) {
        return function () {
          self._onSliderChange(slider, this.value);
        };
      })(s));

      group.appendChild(label);
      group.appendChild(input);
      this.slidersEl.appendChild(group);
    }
  };

  CreativeMode.prototype._fmtVal = function (val, s) {
    var n = parseFloat(val);
    if (s.step >= 1) return Math.round(n) + s.fmt;
    if (s.step >= 0.01) return n.toFixed(2) + s.fmt;
    return n.toFixed(3) + s.fmt;
  };

  CreativeMode.prototype._onSliderChange = function (slider, rawVal) {
    var val = parseFloat(rawVal);
    this.sliderValues[slider.key].textContent = this._fmtVal(val, slider);

    if (slider.key === 'count') {
      this.app.cfg.count = Math.round(val);
      this.app.engine.setTriangleCount(Math.round(val), this.app.palette);
    } else {
      this.app.cfg[slider.key] = val;
    }
  };

  CreativeMode.prototype._buildPalette = function () {
    if (!this.paletteEl) return;
    this.paletteEl.innerHTML = '';
    var heading = document.createElement('div');
    heading.className = 'slider-label';
    heading.innerHTML = '<span>Palette</span>';
    this.paletteEl.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'palette-grid';
    var presets = Palettes.list();
    var self = this;

    for (var i = 0; i < presets.length; i++) {
      var p = presets[i];
      var btn = document.createElement('button');
      btn.className = 'palette-btn' + (p.key === this.paletteKey ? ' active' : '');
      btn.dataset.palette = p.key;

      var preview = document.createElement('div');
      preview.className = 'palette-preview';
      var colors = p.key === 'random' ? Palettes.get('brand') : Palettes.get(p.key);
      for (var j = 0; j < colors.length; j++) {
        var dot = document.createElement('span');
        dot.style.background = 'rgb(' + colors[j].r + ',' + colors[j].g + ',' + colors[j].b + ')';
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = '50%';
        dot.style.display = 'inline-block';
        preview.appendChild(dot);
      }

      var name = document.createElement('span');
      name.className = 'palette-name';
      name.textContent = p.name;

      btn.appendChild(preview);
      btn.appendChild(name);
      btn.addEventListener('click', (function (key) {
        return function () { self._onPaletteChange(key); };
      })(p.key));
      grid.appendChild(btn);
    }
    this.paletteEl.appendChild(grid);
  };

  CreativeMode.prototype._onPaletteChange = function (key) {
    this.paletteKey = key;
    this.app.palette = Palettes.get(key);
    this.app.engine.recolorTriangles(this.app.palette);

    var btns = this.paletteEl.querySelectorAll('.palette-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].dataset.palette === key);
    }
  };

  CreativeMode.prototype._bindActions = function () {
    var self = this;

    if (this.freezeBtn) {
      this.freezeBtn.addEventListener('click', function () {
        self.frozen = !self.frozen;
        self.app.frozen = self.frozen;
        self.freezeBtn.textContent = self.frozen ? 'Unfreeze' : 'Freeze';
        if (self.exportBtn) self.exportBtn.style.display = self.frozen ? '' : 'none';
        if (!self.frozen && self.shareStepEl) {
          self.shareStepEl.classList.remove('revealed');
        }
      });
    }

    if (this.exportBtn) {
      this.exportBtn.addEventListener('click', function () {
        self._exportImage();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', function () {
        self._resetDefaults();
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', function () {
        if (self.panelEl) {
          self.panelEl.classList.toggle('collapsed');
          self._updateReopenBtn();
        }
      });
    }

    if (this.reopenBtn) {
      this.reopenBtn.addEventListener('click', function () {
        if (self.panelEl) {
          self.panelEl.classList.remove('collapsed');
          self._updateReopenBtn();
        }
      });
    }

    this._bindShareButtons();
  };

  CreativeMode.prototype._updateReopenBtn = function () {
    if (!this.reopenBtn || !this.panelEl) return;
    var collapsed = this.panelEl.classList.contains('collapsed');
    this.reopenBtn.classList.toggle('visible', collapsed);
  };

  CreativeMode.prototype._bindShareButtons = function () {
    var self = this;

    var nativeBtn = document.getElementById('share-native');
    if (nativeBtn) {
      if (!navigator.share) {
        nativeBtn.style.display = 'none';
      } else {
        nativeBtn.addEventListener('click', function () {
          navigator.share({ title: 'Emergent Art — ' + COMPANY_NAME, text: SHARE_MSGS.native, url: SHARE_URL }).catch(function () {});
        });
      }
    }

    var bskyBtn = document.getElementById('share-bluesky');
    if (bskyBtn) {
      bskyBtn.addEventListener('click', function () {
        window.open('https://bsky.app/intent/compose?text=' + encodeURIComponent(SHARE_MSGS.bluesky), '_blank', 'width=600,height=500');
        self.app.hud.toast('Attach your saved image to the post!');
      });
    }

    var liBtn = document.getElementById('share-linkedin');
    if (liBtn) {
      liBtn.addEventListener('click', function () {
        window.open('https://www.linkedin.com/feed/?shareActive=true&text=' + encodeURIComponent(SHARE_MSGS.linkedin), '_blank', 'width=600,height=600');
        self.app.hud.toast('Type @Regen Studio in the post to tag us!');
      });
    }

    var mastoBtn = document.getElementById('share-mastodon');
    if (mastoBtn) {
      mastoBtn.addEventListener('click', function () {
        window.open('https://s2f.kytta.dev/?text=' + encodeURIComponent(SHARE_MSGS.mastodon), '_blank', 'width=600,height=500');
        self.app.hud.toast('Attach your saved image to the post!');
      });
    }

    var redditBtn = document.getElementById('share-reddit');
    if (redditBtn) {
      redditBtn.addEventListener('click', function () {
        window.open('https://reddit.com/submit?url=' + encodeURIComponent(SHARE_URL) + '&title=' + encodeURIComponent(SHARE_MSGS.reddit), '_blank', 'width=600,height=500');
        self.app.hud.toast('Attach your saved image to the post!');
      });
    }

    var waBtn = document.getElementById('share-whatsapp');
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(SHARE_MSGS.whatsapp), '_blank');
      });
    }

    var emailBtn = document.getElementById('share-email');
    if (emailBtn) {
      emailBtn.addEventListener('click', function () {
        window.location.href = 'mailto:?subject=' + encodeURIComponent(SHARE_MSGS.email.subject) + '&body=' + encodeURIComponent(SHARE_MSGS.email.body);
      });
    }
  };

  CreativeMode.prototype._resetDefaults = function () {
    if (!this.defaults) return;
    for (var k in this.defaults) {
      if (this.defaults.hasOwnProperty(k)) {
        this.app.cfg[k] = this.defaults[k];
      }
    }
    // Update sliders
    for (var i = 0; i < SLIDERS.length; i++) {
      var s = SLIDERS[i];
      var input = this.sliderInputs[s.key];
      if (input) {
        input.value = this.defaults[s.key];
        this.sliderValues[s.key].textContent = this._fmtVal(this.defaults[s.key], s);
      }
    }
    // Reset palette
    this._onPaletteChange('brand');
    // Reset triangle count
    this.app.engine.setTriangleCount(this.defaults.count, this.app.palette);
    this.app.hud.toast('Reset to defaults');
  };

  CreativeMode.prototype._exportImage = function () {
    try {
      var dataUrl = this.app.renderer.canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'triangle-playground.png';
      a.click();
      this.app.hud.toast('Image saved');
      if (this.shareStepEl) {
        this.shareStepEl.classList.add('revealed');
      }
      if (this.exportBtn) {
        this.exportBtn.textContent = 'Download again';
      }
    } catch (e) {
      this.app.hud.toast('Export failed');
    }
  };

  CreativeMode.prototype.show = function () {
    if (this.panelEl) this.panelEl.style.display = '';
  };

  CreativeMode.prototype.hide = function () {
    if (this.panelEl) this.panelEl.style.display = 'none';
    if (this.reopenBtn) this.reopenBtn.classList.remove('visible');
    if (this.frozen) {
      this.frozen = false;
      this.app.frozen = false;
      if (this.freezeBtn) this.freezeBtn.textContent = 'Freeze';
      if (this.exportBtn) {
        this.exportBtn.style.display = 'none';
        this.exportBtn.textContent = 'Export Image';
      }
    }
    if (this.shareStepEl) this.shareStepEl.classList.remove('revealed');
  };

  window.CreativeMode = CreativeMode;
})();
