# Fonts

The site uses **Poppins** as its primary typeface.

## Current strategy: Google Fonts (CDN)

Poppins is loaded in the `<head>` of every page via Google Fonts with
`preconnect` hints and `display=swap` for fast, non-blocking rendering:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

A robust system-font fallback stack is defined in `css/style.css`
(`--font-family`), so the layout stays intact even if the web font fails
to load.

## Optional: self-hosting (recommended for maximum performance & privacy)

To remove the external dependency (better Core Web Vitals + GDPR-friendly):

1. Download the Poppins `.woff2` files (e.g. from https://gwfh.mranftl.com
   or the official Google Fonts download).
2. Place them in this folder, e.g. `poppins-400.woff2`, `poppins-600.woff2`, …
3. Add `@font-face` rules to a `fonts.css` file and link it, then remove the
   Google Fonts `<link>` tags.

Example `@font-face`:

```css
@font-face {
  font-family: "Poppins";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("./poppins-400.woff2") format("woff2");
}
```
