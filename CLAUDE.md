# CLAUDE.md

Guidance for working in this repository.

## What this project is

A static HTML/CSS microsite for **Vermillion Janitorial Cleaning** (janitorialcleaningvermillion.com), a commercial cleaning business in Dakota County, MN. Deployed on Vercel, already connected to a GitHub repo (`main` branch auto-deploys).

- **No frontend framework, no build step.** Every page is a hand-authored `index.html` file under a directory matching its URL path (e.g. `services/nightly-janitorial-service/index.html` → `/services/nightly-janitorial-service/`).
- **One dynamic piece**: `api/submit-lead.js`, a Vercel serverless function (Node runtime, CommonJS) that proxies quote-form submissions to the CRM-QM API.
- Shared styling in `styles.css` (single global stylesheet, CSS custom properties for tokens). Shared client JS in `js/`.

## Structure

```
/index.html                     Homepage (has the quote form)
/about/, /contact/, /pricing/, /our-process/, /why-choose-us/, /faq/,
/insured-and-bonded/, /privacy/, /request-a-quote/  Standalone pages
/services/                      Service overview + one dir per service
/service-areas/                 Area overview + one dir per town,
                                 each town has nested per-service pages
/resources/                     Long-form informational articles
/api/submit-lead.js             Vercel serverless function → CRM proxy
/js/quote-form.js               Client-side form handler
/js/utm.js                      UTM capture/persistence for attribution
/styles.css                     Global stylesheet
/sitemap.xml, /robots.txt
```

Every page follows the same template shape: `<head>` with title/description/canonical/OG tags + LocalBusiness JSON-LD, then header/nav, a `.page-hero`, `.content-wrap` body content, and a shared footer. When adding a new page, copy an existing sibling page as the template rather than starting from scratch — keep the header/nav/footer byte-for-byte identical across pages (all 45 pages currently match).

## The lead API (`api/submit-lead.js`)

- Proxies to `https://thequotemasters.com/crm_api/api.php?action=push_lead`.
- Requires `CRM_API_TOKEN` set as a Vercel environment variable. **Never hardcode the token or put it in any client-side file** — it must only ever be read via `process.env.CRM_API_TOKEN` inside the serverless function.
- The CRM payload's `industry` and `questions[]` fields are intentionally omitted (see `HANDSOFF.md` for why). Don't add guessed values for these — get real codes from the CRM owner first.
- Validates name/phone/email server-side before forwarding; the client (`js/quote-form.js`) also validates before submitting, but the API function does not trust the client.

## Conventions to follow

- **Consistency across pages is load-bearing.** Phone number is always `(866) 958-8773` / `tel:8669588773`, email is always `ops@thequotemasters.com`, business name is always "Vermillion Janitorial Cleaning". If you change one, grep for all occurrences and update them together.
- **New pages must be added to `sitemap.xml`.** The site was audited to have 100% parity between real pages and sitemap entries — keep it that way.
- Any new page with internal links must resolve to a real directory with an `index.html` — there's no server-side routing/redirects layer to fall back on.
- No test suite exists for the CRM integration (explicitly out of scope per project instructions). Don't add one without checking with the user first — this was a deliberate choice, not an oversight.
- No secrets in the repo, ever. `.gitignore` excludes `.env*`; `.env.example` documents the required var name only.
