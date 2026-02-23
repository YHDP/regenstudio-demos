// Session guard — redirects to gate.html if no valid 24h session
(function () {
  var config = window.DEMO_GUARD;
  if (!config || !config.demoId) return;

  var key = 'demo_session_' + config.demoId;
  try {
    var raw = localStorage.getItem(key);
    if (raw) {
      var session = JSON.parse(raw);
      var age = Date.now() - session.granted_at;
      if (session.demo_id === config.demoId && age < 24 * 60 * 60 * 1000) {
        return; // session valid — allow page load
      }
    }
  } catch (e) { /* invalid JSON — fall through to redirect */ }

  window.location.replace('./gate.html');
})();
