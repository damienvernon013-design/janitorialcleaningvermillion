const CRM_ENDPOINT = "https://thequotemasters.com/crm_api/api.php?action=push_lead";
const ZIP_REGEX = /^\d{5}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://janitorialcleaningvermillion.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const token = process.env.CRM_API_TOKEN;
  if (!token) {
    res.status(500).json({ ok: false, error: "Server is not configured" });
    return;
  }

  const body = req.body || {};

  const firstName = sanitizeString(body.name, 100);
  const businessName = sanitizeString(body.business, 150);
  const phone = sanitizeString(body.phone, 20).replace(/[^\d]/g, "");
  const email = sanitizeString(body.email, 150);
  const notesParts = [];
  if (sanitizeString(body.sqft, 50)) notesParts.push(`Sq ft: ${sanitizeString(body.sqft, 50)}`);
  if (sanitizeString(body.service, 100)) notesParts.push(`Service: ${sanitizeString(body.service, 100)}`);
  if (sanitizeString(body.notes, 1000)) notesParts.push(sanitizeString(body.notes, 1000));
  const utmSource = sanitizeString(body.utm_source, 255);
  const zip = sanitizeString(body.zip, 5);

  if (!firstName || !phone || !email) {
    res.status(400).json({ ok: false, error: "Name, phone, and email are required" });
    return;
  }

  if (!EMAIL_REGEX.test(email)) {
    res.status(400).json({ ok: false, error: "Invalid email address" });
    return;
  }

  if (phone.length < 10) {
    res.status(400).json({ ok: false, error: "Invalid phone number" });
    return;
  }

  const payload = {
    zip: ZIP_REGEX.test(zip) ? zip : "",
    customer: {
      company_name: businessName,
      first_name: firstName,
      last_name: "",
      position: "",
      phone,
      email,
      email2: "",
      address: "",
      service_address: "",
      notes: notesParts.join(" | "),
    },
    questions: [],
    appointments: [],
    number_of_quotes: "1",
    utm_source: utmSource,
  };

  try {
    const crmResponse = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await crmResponse.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!crmResponse.ok) {
      res.status(502).json({ ok: false, error: "CRM rejected the request" });
      return;
    }

    res.status(200).json({ ok: true, data });
  } catch (err) {
    res.status(502).json({ ok: false, error: "Unable to reach CRM" });
  }
};
