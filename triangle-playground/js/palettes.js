/**
 * palettes.js — Color palette presets for Triangle Playground.
 * Exposes window.Palettes
 */
(function () {
  'use strict';

  function hslToRgb(h, s, l) {
    var r, g, b;
    h = h / 360;
    s = s / 100;
    l = l / 100;
    if (s === 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2ch(p, q, h + 1 / 3);
      g = hue2ch(p, q, h);
      b = hue2ch(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function hue2ch(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function generateRandom() {
    var colors = [];
    for (var i = 0; i < 6; i++) {
      colors.push(hslToRgb(
        Math.floor(Math.random() * 360),
        60 + Math.floor(Math.random() * 41),
        40 + Math.floor(Math.random() * 31)
      ));
    }
    return colors;
  }

  var presets = {
    brand: {
      name: 'Brand',
      colors: [
        { r: 147, g: 9, b: 63 },
        { r: 231, g: 24, b: 70 },
        { r: 255, g: 169, b: 45 },
        { r: 101, g: 221, b: 53 },
        { r: 0, g: 145, b: 75 },
        { r: 0, g: 155, b: 187 }
      ]
    },
    mono: {
      name: 'Mono',
      colors: [
        { r: 20, g: 29, b: 53 },
        { r: 45, g: 62, b: 90 },
        { r: 75, g: 98, b: 125 },
        { r: 115, g: 137, b: 158 },
        { r: 160, g: 177, b: 192 },
        { r: 200, g: 210, b: 220 }
      ]
    },
    warm: {
      name: 'Warm',
      colors: [
        { r: 204, g: 30, b: 30 },
        { r: 230, g: 76, b: 20 },
        { r: 240, g: 140, b: 15 },
        { r: 200, g: 50, b: 80 },
        { r: 180, g: 20, b: 120 },
        { r: 255, g: 95, b: 50 }
      ]
    },
    cool: {
      name: 'Cool',
      colors: [
        { r: 20, g: 80, b: 200 },
        { r: 0, g: 150, b: 180 },
        { r: 30, g: 60, b: 160 },
        { r: 0, g: 180, b: 160 },
        { r: 55, g: 40, b: 140 },
        { r: 40, g: 120, b: 210 }
      ]
    },
    neon: {
      name: 'Neon',
      colors: [
        { r: 255, g: 0, b: 102 },
        { r: 0, g: 255, b: 102 },
        { r: 102, g: 0, b: 255 },
        { r: 255, g: 255, b: 0 },
        { r: 0, g: 204, b: 255 },
        { r: 255, g: 102, b: 0 }
      ]
    },
    random: {
      name: 'Random',
      colors: null
    }
  };

  window.Palettes = {
    presets: presets,
    get: function (key) {
      if (key === 'random') return generateRandom();
      var p = presets[key];
      return p ? p.colors : presets.brand.colors;
    },
    list: function () {
      var result = [];
      for (var k in presets) {
        if (presets.hasOwnProperty(k)) result.push({ key: k, name: presets[k].name });
      }
      return result;
    }
  };
})();
