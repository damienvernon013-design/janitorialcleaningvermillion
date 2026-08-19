(function () {
  function initQuoteForm(box) {
    var button = box.querySelector("button");
    if (!button) return;

    var statusEl = document.createElement("p");
    statusEl.className = "quote-box-status";
    statusEl.setAttribute("role", "status");
    statusEl.setAttribute("aria-live", "polite");
    button.insertAdjacentElement("afterend", statusEl);

    button.addEventListener("click", function () {
      var name = (box.querySelector("#name") || {}).value || "";
      var business = (box.querySelector("#business") || {}).value || "";
      var phone = (box.querySelector("#phone") || {}).value || "";
      var email = (box.querySelector("#email") || {}).value || "";
      var sqft = (box.querySelector("#sqft") || {}).value || "";
      var service = (box.querySelector("#service") || {}).value || "";
      var notes = (box.querySelector("#notes") || {}).value || "";

      statusEl.textContent = "";
      statusEl.className = "quote-box-status";

      if (!name.trim() || !phone.trim() || !email.trim()) {
        statusEl.textContent = "Please fill in your name, phone, and email.";
        statusEl.className = "quote-box-status quote-box-status-error";
        return;
      }

      button.disabled = true;
      button.textContent = "Submitting...";

      var utmSource = typeof window.vjcGetUtmSource === "function" ? window.vjcGetUtmSource() : "";

      fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          business: business,
          phone: phone,
          email: email,
          sqft: sqft,
          service: service,
          notes: notes,
          utm_source: utmSource,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.ok) {
            statusEl.textContent = "Thanks — your request was submitted. We respond by the next business day.";
            statusEl.className = "quote-box-status quote-box-status-success";
            box.querySelectorAll("input, select, textarea").forEach(function (el) {
              el.value = "";
            });
            button.textContent = "Submit Quote Request";
            button.disabled = false;
          } else {
            throw new Error((result.data && result.data.error) || "Submission failed");
          }
        })
        .catch(function () {
          statusEl.textContent = "Something went wrong. Please call us at (866) 958-8773 or try again.";
          statusEl.className = "quote-box-status quote-box-status-error";
          button.textContent = "Submit Quote Request";
          button.disabled = false;
        });
    });
  }

  document.querySelectorAll(".quote-box").forEach(initQuoteForm);
})();
