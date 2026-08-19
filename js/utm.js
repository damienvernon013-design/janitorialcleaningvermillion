(function () {
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  var STORAGE_KEY = "vjc_utm";

  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var hasUtm = UTM_KEYS.some(function (key) {
      return params.has(key);
    });
    if (!hasUtm) return;

    var utm = {};
    UTM_KEYS.forEach(function (key) {
      if (params.has(key)) utm[key] = params.get(key).slice(0, 255);
    });

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    } catch (e) {
      /* storage unavailable, ignore */
    }
  }

  function getUtmSource() {
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return "";
      var utm = JSON.parse(stored);
      return utm.utm_source || "";
    } catch (e) {
      return "";
    }
  }

  captureUtm();
  window.vjcGetUtmSource = getUtmSource;
})();
