// Standard Search — js/standard-search.js
// Autocomplete for searching standards by ID or full name.
// Initialises on all .std-search containers after families-v2.json loads.

(function () {
  'use strict';

  // ---------- INDEX ----------
  var index = [];   // [{id, name, type, familyLetter, familyName}]
  var ready = false;

  function buildIndex(families) {
    index = [];
    for (var i = 0; i < families.length; i++) {
      var fam = families[i];
      var stds = fam.standards || [];
      for (var j = 0; j < stds.length; j++) {
        var s = stds[j];
        index.push({
          id: s.id || '',
          name: s.name || '',
          type: (s.type || 'hEN').toUpperCase(),
          familyLetter: fam.letter || '',
          familyName: fam.name || ''
        });
      }
    }
    ready = true;
  }

  function search(query) {
    if (!ready || !query) return [];
    var q = query.toLowerCase();
    var results = [];
    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      var idMatch = entry.id.toLowerCase().indexOf(q) !== -1;
      var nameMatch = entry.name.toLowerCase().indexOf(q) !== -1;
      if (idMatch || nameMatch) {
        results.push({ entry: entry, idMatch: idMatch });
        if (results.length >= 20) break;
      }
    }
    // ID matches first, then name-only matches
    results.sort(function (a, b) {
      if (a.idMatch && !b.idMatch) return -1;
      if (!a.idMatch && b.idMatch) return 1;
      return 0;
    });
    return results;
  }

  // ---------- ESCAPE ----------
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // ---------- WIDGET ----------
  function initWidget(container) {
    var input = container.querySelector('.std-search__input');
    var dropdown = container.querySelector('.std-search__dropdown');
    if (!input || !dropdown) return;

    var activeIdx = -1;
    var currentResults = [];

    function render(results) {
      currentResults = results;
      activeIdx = -1;
      if (results.length === 0) {
        var q = input.value.trim();
        if (q.length > 0) {
          dropdown.innerHTML = '<div class="std-search__empty">No standards found</div>';
          dropdown.style.display = '';
        } else {
          dropdown.style.display = 'none';
        }
        return;
      }
      var html = '';
      for (var i = 0; i < results.length; i++) {
        var e = results[i].entry;
        var href = 'standard.html#std=' + encodeURIComponent(e.id) +
                   '&family=' + encodeURIComponent(e.familyLetter);
        var typeCls = e.type === 'EAD' ? 'std-search__item-type--ead' : 'std-search__item-type--hen';
        html += '<a href="' + href + '" class="std-search__item" data-idx="' + i + '">';
        html += '<span class="std-search__item-head">';
        html += '<span class="std-search__item-id">' + esc(e.id) + '</span>';
        html += '<span class="std-search__item-type ' + typeCls + '">' + esc(e.type) + '</span>';
        html += '<span class="std-search__item-family">' + esc(e.familyLetter) + '</span>';
        html += '</span>';
        if (e.name) {
          html += '<span class="std-search__item-name">' + esc(e.name) + '</span>';
        }
        html += '</a>';
      }
      dropdown.innerHTML = html;
      dropdown.style.display = '';
    }

    function setActive(idx) {
      var items = dropdown.querySelectorAll('.std-search__item');
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('std-search__item--active', i === idx);
      }
      activeIdx = idx;
      if (idx >= 0 && items[idx]) {
        items[idx].scrollIntoView({ block: 'nearest' });
      }
    }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (q.length < 2) {
        dropdown.style.display = 'none';
        currentResults = [];
        return;
      }
      render(search(q));
    });

    input.addEventListener('keydown', function (e) {
      if (dropdown.style.display === 'none') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = activeIdx + 1;
        if (next < currentResults.length) setActive(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = activeIdx - 1;
        if (prev >= 0) setActive(prev);
      } else if (e.key === 'Enter') {
        if (activeIdx >= 0) {
          e.preventDefault();
          var items = dropdown.querySelectorAll('.std-search__item');
          if (items[activeIdx]) items[activeIdx].click();
        }
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        input.blur();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    // Re-open on focus if value present
    input.addEventListener('focus', function () {
      var q = input.value.trim();
      if (q.length >= 2 && currentResults.length > 0) {
        dropdown.style.display = '';
      }
    });
  }

  // ---------- BOOT ----------
  function init() {
    fetch('data/families-v2.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        buildIndex(data);
        var widgets = document.querySelectorAll('.std-search');
        for (var i = 0; i < widgets.length; i++) {
          initWidget(widgets[i]);
        }
      })
      .catch(function (err) {
        console.warn('StandardSearch: could not load families data', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
