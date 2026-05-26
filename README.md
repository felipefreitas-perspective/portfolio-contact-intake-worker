# Portfolio Contact Intake Worker

Serverless contact intake project for adding a professional contact form to a static portfolio without exposing a personal email address.

The project is designed as a small portfolio-ready backend case study using Cloudflare Workers, Cloudflare D1, and a reusable frontend widget.

## Purpose

Add a contact section to the portfolio with this message:

```text
Contact
LinkedIn is the fastest way to reach me.
For project inquiries, use the contact form below.
```

The form should let visitors send project inquiries without publishing a personal email address on the website.

## Why This Matters

Exposing a personal email directly on a public site can increase spam and scraping risk.

Using a backend contact intake keeps the portfolio more professional and creates another small but real portfolio project:

- Static frontend on GitHub Pages
- Serverless API with Cloudflare Workers
- Data persistence with Cloudflare D1
- Basic validation and anti-spam controls
- Optional email or notification workflow
- Privacy-conscious contact handling

## Current Features

- Cloudflare Worker API for contact inquiry submissions.
- Cloudflare D1 schema for persistent inquiry storage.
- `GET /health` endpoint for deployment checks.
- `POST /inquiries` endpoint for form submissions.
- Required field validation for name, email, inquiry type, message, and consent.
- Basic email format validation.
- Allowed inquiry types: `project`, `consulting`, `collaboration`, and `other`.
- Honeypot field for lightweight spam reduction.
- CORS allowlist for local development and GitHub Pages.
- Privacy-conscious design with no raw IP storage.
- Reusable frontend widget with HTML injection, CSS styling, client-side submission, and success/error states.
- Email notification intentionally deferred until the storage flow is stable.

## Architecture

```text
GitHub Pages portfolio
  -> Reusable contact form widget
  -> Cloudflare Worker API
  -> Validation and honeypot spam check
  -> Cloudflare D1 database
  -> Optional email notification to Felipe
```

## Form Fields

- Name
- Email
- Inquiry type
- Message
- Consent checkbox
- Hidden honeypot field

Suggested consent text:

```text
I agree to be contacted back about this inquiry.
```

## Privacy Notes

Initial preference:

- Do not expose personal email on the public site.
- Do not store unnecessary sensitive data.
- Store only what is needed to respond to the inquiry.
- Consider adding basic retention rules later.

Stored fields:

- `id`
- `site_id`
- `name`
- `email`
- `inquiry_type`
- `message`
- `source_page`
- `status`
- `created_at`
- `updated_at`

Raw IP addresses are not stored. If IP-based spam controls are added later, the privacy notes should be updated first.

## Cloudflare Components

Current stack:

- Cloudflare Worker for the API
- Cloudflare D1 for submitted inquiries
- Frontend widget for static websites
- Optional Cloudflare Turnstile for future spam protection
- Optional Cloudflare secrets for email provider/API keys later

Possible notification options:

- Resend
- SendGrid
- MailChannels if available
- Gmail/Google Workspace later
- Store-only first, email notification later

## Folder Structure

```text
portfolio-contact-intake-worker/
  README.md
  .gitignore
  worker/
    package.json
    wrangler.toml
    schema.sql
    src/
      index.js
    migrations/
  frontend-widget/
    contact-form.js
    contact-form.css
  docs/
  tests/
```

## Current MVP Scope

The current implementation is intentionally simple:

- `POST /inquiries` receives project inquiries.
- The Worker validates required fields before writing to D1.
- The D1 table stores only the information needed to respond.
- A honeypot field is included for basic spam reduction.
- No raw IP address is stored.
- Email notification is intentionally deferred until the storage flow is stable.

This keeps the first version easy to inspect, easy to deploy, and safe to integrate into a public GitHub Pages portfolio.

### API Endpoints

```text
GET  /health
POST /inquiries
```

Example request:

```json
{
  "siteId": "portfolio",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "inquiryType": "project",
  "message": "I would like to discuss a dashboard and automation project.",
  "consent": true,
  "sourcePage": "https://lipeofreitas.github.io/#contact"
}
```

Valid inquiry types:

```text
project
consulting
collaboration
other
```

## Local Setup

Install Worker dependencies:

```powershell
cd "worker"
npm install
```

Create the D1 database in Cloudflare:

```powershell
npx wrangler d1 create portfolio_contact_intake
```

Copy the generated D1 `database_id` into:

```text
worker/wrangler.toml
```

Apply the schema locally:

```powershell
npm run db:migrate:local
```

Apply the schema remotely:

```powershell
npm run db:migrate:remote
```

Run locally:

```powershell
npm run dev
```

Deploy:

```powershell
npm run deploy
```

## Future Roadmap

1. Create D1 database in Cloudflare and replace the placeholder `database_id`.
2. Test local and remote submissions.
3. Embed the frontend widget into the GitHub Pages contact section.
4. Add Cloudflare Turnstile if spam becomes a concern.
5. Add optional email or workflow notification.
6. Add a simple admin/export workflow for reviewing stored inquiries.
7. Document setup, deployment, privacy decisions, and retention rules.

## Portfolio Angle

This project can be presented as a small serverless contact intake system:

> A privacy-conscious contact form for a static portfolio, built with GitHub Pages, Cloudflare Workers, and D1, designed to avoid exposing a personal email while still capturing project inquiries.
