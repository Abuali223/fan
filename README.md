# Nexora — Premium Digital Studio Website

A production-grade, multi-page marketing website built with **vanilla HTML5,
CSS3 and JavaScript (ES2023)** — no frameworks, no Bootstrap, no jQuery.
Minimalist, premium, fully responsive and accessible.

## ✨ Highlights

- **Modern UI/UX** — minimalist, premium look built on a clean design system
- **Fully responsive** — mobile, tablet and desktop (CSS Grid + Flexbox)
- **Dark / Light mode** — respects OS preference, remembers your choice
- **Accessible (WCAG 2.1 AA)** — semantic HTML, keyboard support, ARIA, skip link, focus states, reduced-motion
- **SEO-ready** — meta tags, Open Graph/Twitter cards, JSON-LD, `sitemap.xml`, `robots.txt`
- **Fast** — lazy-loaded images, `IntersectionObserver`, minimal, modular code
- **Zero dependencies** — everything is hand-written vanilla code

### Interactive features

Loading screen · Sticky navbar · Mobile menu · Scroll progress bar ·
Scroll-reveal animations · Animated statistics counters · Testimonials slider ·
FAQ accordion · Gallery filtering · Image lightbox · Form validation ·
Toast notifications · Back-to-top button · Button ripple effect.

## 📁 Project structure

```
.
├── index.html              # Home (all 10 sections)
├── about.html              # Story, values, team
├── gallery.html            # Filterable portfolio + lightbox
├── contact.html            # Contact form + details
│
├── css/
│   ├── style.css           # Design system + components/sections
│   ├── responsive.css      # Breakpoints (desktop-first)
│   └── animations.css      # Keyframes + scroll-reveal + reduced-motion
│
├── js/
│   ├── app.js              # Core: loader, progress, back-to-top, FAQ, slider, toasts
│   ├── navbar.js           # Sticky header, mobile menu, scroll-spy
│   ├── darkmode.js         # Theme toggle + persistence
│   ├── gallery.js          # Filtering + accessible lightbox
│   ├── animation.js        # Reveal, counters, ripple, lazy-load
│   └── validation.js       # Form validation + draft autosave + newsletter
│
├── assets/
│   ├── images/             # SVG hero/about visuals + gallery + OG image
│   ├── icons/              # favicon.svg
│   └── fonts/              # Font strategy (see fonts/README.md)
│
├── robots.txt
├── sitemap.xml
└── site.webmanifest
```

## 🚀 Running locally

It's a static site — no build step. Open `index.html` directly, or serve it
(recommended, so relative paths and the manifest behave):

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

## 🎨 Customization

- **Colors / spacing / radii** — edit the CSS variables in `css/style.css`
  under `:root` (and `[data-theme="dark"]` for dark mode).
- **Brand palette**: `#0F172A` · `#2563EB` · `#38BDF8` · `#FFFFFF`.
- **Font** — Poppins, loaded via Google Fonts. To self-host, see
  `assets/fonts/README.md`.
- **Content** — copy is in English and lives directly in the HTML; edit freely.

## 🔌 Wiring up the contact form

The form is validated on the client and currently simulates sending. To make it
live, add your endpoint in `js/validation.js` (look for the
`Simulated send` comment) — e.g. `fetch("/api/contact", …)`.

## 🌐 Before deploying

1. Replace `https://www.nexora.example/` with your real domain in every page's
   `<link rel="canonical">` / Open Graph tags, plus `sitemap.xml` and
   `robots.txt`.
2. (Optional) Generate a PNG version of `assets/images/og-image.svg` for the
   widest social-preview support.

## 📄 License

Free to use and adapt for your own projects.
