# Brewline – full-stack landing page

Responsive landing page (HTML/CSS/JS) served by an Express API that captures and stores leads.

## Run it
1. Install Node.js 18 or newer.
2. In this folder run: `npm install`
3. Start: `npm start` (or `npm run dev` to auto-restart)
4. Open http://localhost:3000

## Structure
- `public/` – frontend (index.html, admin.html, styles.css, script.js, logo.svg, logo-mark.svg, favicon.svg)
- `server.js` – Express server, validation, rate limiting, static hosting
- `data/leads.json` – created automatically; stores submitted leads

## API
- `POST /api/leads` – body: `name`, `email`, `plan` (Solo/Duo/Office), `method`. Returns 201, 400 (field errors), 409 (duplicate) or 429.
- `GET /api/leads` – header `x-admin-token` required (set `ADMIN_TOKEN` env var; default `change-me`).
- `GET /api/health` – status check.

## Deploy
Any Node host (Render, Railway, Fly.io) works: set `ADMIN_TOKEN`, run `npm start`. For production, swap the JSON file for a database such as PostgreSQL or MongoDB.

## Features
- Dark / light theme (remembers your choice, follows your system setting first time)
- How-it-works steps, coffee-finder quiz (pre-fills the lead form), FAQ accordion
- Monthly / yearly pricing toggle, validated lead form, newsletter signup
- Admin dashboard at http://localhost:3000/admin.html (enter your ADMIN_TOKEN): search, stats, CSV export, delete leads

## Extra API endpoints (admin ones need the `x-admin-token` header)
- `POST /api/subscribe` – body: `email`
- `GET /api/leads?format=csv` – download leads as CSV
- `DELETE /api/leads/:id` – remove a lead
- `GET /api/subscribers` – list newsletter subscribers

## Branding
- `logo.svg` (full logo), `logo-mark.svg` (icon), `favicon.svg` (browser tab icon). Colours: indigo `#1d1f52`, saffron `#ffb627`.

## Documentation
- `REQUIREMENT_UNDERSTANDING.md` – how the brief was interpreted and how the page is structured.
