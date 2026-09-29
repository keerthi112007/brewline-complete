# Brewline landing page – how I understood and built it

## How I understood the requirement
The brief asks for a client-style landing page that turns visitors into leads. For a coffee subscription, the visitor's main questions are: what is it, why is it better than what I buy now, what does it cost, can I trust it, and how do I start. I organised the page around answering those questions in order.

## How I structured the page
| Section | Purpose |
|---|---|
| Hero | One clear promise (roasted Tuesday, at your door Thursday) and two actions: See plans, How it works |
| Trust strip | Four quick promises (roasted to order, free shipping, 30-day promise, recyclable bags) right below the hero |
| How it works | Three steps that remove the fear of commitment |
| Features / services | Four reasons to choose Brewline |
| Coffee finder quiz | Interactive step that recommends a coffee and pre-fills the form |
| Pricing | Solo / Duo / Office with a monthly / yearly toggle; Duo highlighted as most popular |
| Testimonials | Stats plus three customer quotes |
| FAQ | Answers objections (skipping, freshness, refunds, shipping, packaging) |
| Call to action | A second push toward signing up |
| Contact / lead form | Validated form that saves leads through the Express API |

## How the implementation supports usability and clarity
- Responsive layout with a mobile menu; dark and light themes.
- Every "Choose plan" button pre-selects that plan in the form.
- Client-side and server-side validation, inline error messages, honeypot and rate limiting against spam.
- Accessible: labelled fields, live status messages, visible focus states, reduced-motion support.
- Admin dashboard (`/admin.html`) to view, search, export and delete leads.

## Branding
The logo is a coffee bean with a flowing crease line and two steam wisps on a saffron circle, with an indigo "Brewline" wordmark. Files: `logo.svg` (full lockup), `logo-mark.svg` (icon only), `favicon.svg` (browser tab).
