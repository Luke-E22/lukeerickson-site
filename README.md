# lukeerickson.com

A fast personal credibility site for **Luke Erickson** — a home page (`/`), a name-rich
résumé page (`/resume`), and a "My Story" narrative page (`/about/me`) — built to rank for
"Luke Erickson" and to make anyone who lands on it take him seriously.

Hand-coded static HTML/CSS/JS. No framework, no build step, no dependencies. Deploys on any
static host. Built on the approved **Luke Erickson Design System** (Newsreader + Hanken Grotesk,
soft sky-blue / dusty-coral accents, drifting clouds, dark default with a light/dark toggle).

---

## What's here

```
index.html              Home: hero · about · experience · moments · contact
resume.html             Full virtual résumé (all roles, education, skills)
about/me/index.html     "My Story" — long-form narrative bio, served at /about/me
                        (ProfilePage + Person + BreadcrumbList JSON-LD)
assets/
  css/styles.css        The full design system + page styles (one file).
                        ⚠ The CSS is INLINED into each page for performance:
                        after editing styles.css, run  python3 tools/inline-css.py
                        to re-inject it into index.html, resume/, and about/me/.
  js/main.js            Motion + interactions (vanilla): clouds, parallax, reveals,
                        marquee, theme toggle, 3-level motion setting, contact form
  fonts/*.woff2         Self-hosted Newsreader + Hanken Grotesk (font-display: swap)
  img/                  Descriptively named, name-bearing photos (luke-erickson-*.jpg)
  og/                   1200×630 Open Graph image + PWA/apple-touch icons
  logo/                 LE monogram SVGs
  luke-erickson-resume.pdf   Branded, downloadable résumé — regenerate with
                             python3 tools/build-resume-pdf.py (source: tools/resume-print.html)
robots.txt  sitemap.xml  site.webmanifest  _redirects
```

## Preview locally

```bash
python3 -m http.server 4188 --directory ~/lukeerickson-site
# open http://localhost:4188  (the résumé is at /resume.html locally)
```

## Deploy

Upload the folder to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages, S3…).
Three things to set so SEO is clean:

1. **One canonical host.** The site declares `https://lukeerickson.com` (apex, no `www`) as
   canonical. Point DNS at the host and **301-redirect `www.lukeerickson.com` → `lukeerickson.com`**
   and force HTTPS. `_redirects` already does this on Netlify/Cloudflare Pages.
2. **Clean `/resume` URL.** The résumé canonical is `/resume` (not `/resume.html`) because a
   name-rich URL captures "Luke Erickson resume" searches.
   - Netlify / Cloudflare Pages: handled by `_redirects` (already included).
   - Vercel: add `vercel.json` → `{ "cleanUrls": true }`.
   - Apache: `RewriteRule ^resume$ resume.html [L]`.
   - GitHub Pages / naive hosts: `resume.html` is also linked directly, so it works regardless;
     for a true `/resume` URL, rename to `resume/index.html` (and change its asset paths to `../assets/…`).
3. Submit `sitemap.xml` in Google Search Console after the verification tag is set (below).

---

# ⚠️ ACTION LIST — fill these before launch

Nothing below was invented. Every gap is a labeled placeholder or a sample value to confirm.

## A. Placeholders to fill (search the files for `[PLACEHOLDER`)

| # | Where | What's needed |
|---|-------|---------------|
| 1 | `index.html` + `resume.html` `<head>` | **Google Search Console** verification token (`<meta name="google-site-verification">`). |
| 2 | `index.html` `<head>` (commented) | **GA4 Measurement ID** (`G-XXXXXXX`). Uncomment the analytics snippet once you have it. |
| 3 | Both pages — JSON-LD `sameAs` **and** the visible social buttons | Real profile URLs: **LinkedIn**, **X**, **Instagram**, the **Startup Ventura founder article**, your **Candid/GuideStar** nonprofit profile, and the **New West Symphony board** page. (Startup Ventura's URL is already wired in.) The on-page links and the schema must use the *same* URLs — update both. |
| 4 | `index.html` contact `<form action>` | **Form endpoint URL** (e.g. Formspree, Basin, Netlify Forms, or your own). Until set, the form shows the success card locally but does not deliver. |
| 5 | `index.html` (commented `twitter:site`) | Optional `@handle` for the Twitter/X card. |

## B. Sample content to confirm or replace (matches the layout; treat as drafts)

| # | Where | Item | Note |
|---|-------|------|------|
| 6 | Hero stats | **2025 · Founded Startup Ventura**, **$3B+ · Board exit value assembled**, **10+ · Years building & selling** | All three are drawn from your CV / Startup Ventura (board of execs with $3B+ combined exit value; ~10+ yrs of roles since 2014). Confirm the framing, or swap in other proof points (e.g. Candid Platinum Seal, City of Ventura partnership). The mock's original "120+ founders / 2019 / 40+ programs" was **not** used — those were unverified and 2019 was wrong (you launched in 2025). |
| 7 | "Along the way" marquee | gener8tor · Startup Ventura · Popl · One Tap · University of Utah · New West Symphony · Rotary Club of Ventura · City of Ventura | All are CV/SV-supported affiliations. Confirm **New West Symphony** and **Rotary** framing; add/remove any. |
| 8 | Job title | Site shows **"Founder & Executive Director."** | Your CV says **"Chairman and Executive Director"**; startupventura.com says **"Chairman and Managing Director"** (founder). **Pick one title and make it identical** across this site, your CV/LinkedIn, and startupventura.com — title consistency strengthens the search "identity graph." Tell me your preferred wording and I'll set it everywhere (hero eyebrow, résumé, PDF, JSON-LD). |
| 9 | "Moments" gallery captions | 12 of your photos | These are **your** photos; captions came with the design. Several are photo-verified (the Popl/Nasdaq billboard; the engraved **"Rookie Rotarian of the Year 2025"** plaque). Please confirm each caption, **especially "Forbes 30 Under 30 · LA Tech Week"** — keep it only if accurate (it currently reads as *attending* an LA Tech Week event, not as being a list honoree). If the Rotary award is official, I can add it to the schema `award` field too. |
| 10 | Contact + résumé | Email shown as **lukeericksonwork@gmail.com** | This is your real, working address (so nothing is broken at launch). For a more premium look, set up and switch to **luke@lukeerickson.com** — say the word and I'll change it everywhere. |
| 11 | About paragraph | Family background | The brief mentioned the **Erickson family's history in Midwest oil & gas** — I did **not** assert it (unverified). If you want it in, send the exact, accurate detail and I'll weave it in. The current text (Hudson WI → University of Utah → One Tap → Startup Ventura) is all confirmed. |
| 12 | About / résumé wording | One Tap | I wrote "founded and **led/ran** One Tap," not "exited/sold," because a sale isn't documented. If One Tap was sold or had a defined exit, tell me and I'll phrase it accordingly. |
| 13 | Testimonial section | **Omitted** | Per the brief, a pull-quote section ships only with a real, attributable, permissioned quote. The markup is in `index.html` (commented out) ready to enable — send a quote + name/title. |

---

## Decisions & accuracy notes

- **Facts are exact, prose is original.** Every title, employer, location, and date matches your
  CV verbatim; the role *descriptions* are rewritten in original prose (unique text reads and ranks
  better than pasted LinkedIn wording). Roles, reverse-chronological: Startup Ventura (Mar 2025–),
  Popl (Nov 2024–Mar 2026), One Tap (2022–Mar 2025), Artemis Health (2021–22), Blerp (2020–21),
  Stew B's (2014–19). Education: B.S. Business Management, University of Utah, 2023.
- **No fabrication.** Removed the mock's unverified stats and the "Ventura County's *first*"
  superlative (your CV/SV say "a nonprofit accelerator," not "the first").
- **Startup Ventura details** pulled from startupventura.com: 501(c)(3), launched 2025, gener8tor
  partnership, Ventura County. The `taxID` 39-2204612 in the schema came from the brief — confirm it.
- **SEO:** each page's `<title>` and meta description lead with "Luke Erickson"; self-referencing
  canonicals; Person JSON-LD (validated) on both pages; OG/Twitter cards with a 1200×630 headshot;
  one `H1` per page (his name), clean H2/H3 order; sitemap + robots.
- **Performance & a11y:** hero image preloaded (not lazy) + right-sized to its display box; fonts
  self-hosted with preload + swap; every image has width/height (CLS-safe); below-fold images lazy +
  async-decoded; JS deferred, passive listeners + rAF; WCAG AA contrast in both themes; visible focus
  rings; full keyboard nav; `prefers-reduced-motion` honored; a 3-level motion control (rich/calm/still).

## Quality pass

Reviewed by a multi-agent audit across six dimensions (accuracy, SEO/structured-data, accessibility,
performance, design-fidelity, markup/links), with adversarial verification of every important finding.
All confirmed issues were fixed: the "first" superlative, light-theme contrast on muted/eyebrow text,
focus rings on text links, JSON-LD URL consistency, oversized LCP image, and design-token purity.
