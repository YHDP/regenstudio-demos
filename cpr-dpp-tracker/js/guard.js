// Session guard — redirects to gate.html if not authenticated
(function () {
  var storageKey = 'demo_access_cpr-dpp-tracker';
  if (sessionStorage.getItem(storageKey) !== 'granted') {
    window.location.replace('./gate.html');
  }
})();
