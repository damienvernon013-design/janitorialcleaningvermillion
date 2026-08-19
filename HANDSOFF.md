# Handoff — Vermillion Janitorial Cleaning Microsite

## Status: READY TO LAUNCH

## What this is
A 45-page static HTML/CSS microsite for Vermillion Janitorial Cleaning (Dakota County, MN), plus one Vercel serverless function that submits quote-request leads to the CRM-QM system. No frontend build step — pages are hand-authored HTML served as-is.

## What was done in this session
- **Contact form API**: Added `api/submit-lead.js`, a Vercel serverless function that proxies form submissions to the CRM-QM `push_lead` endpoint (`https://thequotemasters.com/crm_api/api.php?action=push_lead`). The CRM Bearer token is read from the `CRM_API_TOKEN` environment variable server-side — it is never present in any HTML/JS shipped to the browser.
- **Wired the two quote forms** (`index.html` homepage form, `request-a-quote/index.html`) to actually submit. Added `js/quote-form.js` (client-side validation, fetch to `/api/submit-lead`, inline success/error status) and included it on both pages.
- **UTM tracking**: Added `js/utm.js`, loaded on every form page. Captures `utm_source`/`utm_medium`/`utm_campaign`/`utm_term`/`utm_content` from the query string on landing, stores them in `sessionStorage`, and `utm_source` is attached to the lead payload on submit so campaign attribution survives navigation within the session.
- **Fixed a dead link**: every page footer linked to `/privacy/`, which didn't exist. Added a minimal `privacy/index.html` matching the site's existing template/style, and added it to `sitemap.xml`.
- **Removed a stray empty directory** (`{services`) left over from prior work — not referenced anywhere, safe to delete.
- Added `.gitignore`, `.env.example`, and a minimal `package.json` (metadata only — no dependencies, no build step).
- Ran a full site-wide QA sweep: no broken internal links, no leftover placeholder/lorem-ipsum text, phone/email/business-name consistent across all 45 pages, all pages present in `sitemap.xml`, no hardcoded secrets anywhere in the repo.

## Required before the contact form works in production
The serverless function will 500 until this is set:

1. In the Vercel project dashboard → **Settings → Environment Variables**, add:
   - `CRM_API_TOKEN` = the Bearer token from the CRM-QM API docs (kept out of this repo and this file intentionally)
2. Redeploy (or trigger via a new push) so the function picks up the env var.

No local `.env` file is committed — `.gitignore` excludes `.env*`.

## Known intentional gaps (not blockers, flagged for the CRM owner)
- The CRM `PushLead` payload supports `industry` (integer code) and `questions[]` (question_id/answer_id pairs mapping to CRM-side custom fields), per the CRM-QM API doc. **These were intentionally omitted** from the current payload — the doc's example values (`industry: 23`, question IDs `1`/`2`/`3`) are generic placeholders, not confirmed codes for this business, and guessing wrong CRM taxonomy codes would silently miscategorize every lead. The lead's `sqft` and `service` dropdown selections are currently folded into the free-text `notes` field instead so the information isn't lost.
- **To wire real industry/question codes**: get the actual codes from whoever owns the CRM-QM configuration, then update the `payload` object in `api/submit-lead.js` (see the `questions: []` and missing `industry` key) to map `sqft`/`service` selections to the correct `question_id`/`answer_id` pairs.
- `zip` is currently not collected on the form (no ZIP input field exists on either quote form) — the API function silently sends an empty string, which is safely ignored server-side rather than causing a submission failure. Add a `zip` input to the forms if the CRM needs it.
- No appointment-slot picker exists on the form, so `appointments: []` is always sent empty. The CRM doc supports scheduling preferred slots; add UI for this if the business wants online scheduling.

## Testing notes
- **No automated test suite was set up for the CRM integration**, per explicit instruction for this session ("no testing crm"). The serverless function and client JS were syntax-checked (`node --check`) but not exercised against the live CRM endpoint.
- Before relying on this in production, do one real manual test submission from the live Vercel deployment and confirm the lead lands in the CRM.

## Deployment
Repo is already connected to Vercel (per prior setup) — no Vercel CLI action was taken or needed this session. Pushing to `origin/main` triggers the existing Vercel deployment pipeline.
