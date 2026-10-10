# Nic Hau Hairdressing

Website for Nic Hau, a hair salon at 105 Church St, Richmond VIC 3121.

The design follows the gold-foil business card: matte black stock, foil gold, the scissors-and-stars emblem, dot-tipped title rules and the double-framed **Bookings** panel with its QR code.

It is a static site with no build step. Any static host can serve it as is, including GitHub Pages, Netlify, Vercel and Cloudflare Pages.

## Structure

```
index.html              the whole page: hero, services, studio, bookings + visit
assets/css/styles.css   design tokens (top of file) and all styles
assets/js/main.js       small enhancements (sticky header, mobile Book/Call dock)
assets/img/
  emblem-foil.svg       hero emblem with a slow foil light sweep
  emblem.svg            flat gold emblem (footer, print, socials)
  qr-bookings.svg       card-style QR code for the booking link
  favicon.svg, apple-touch-icon.png, og-image.png
site.webmanifest
tools/                  scripts that regenerate the SVGs above
```

## Run locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Common edits

| What | Where |
| --- | --- |
| Prices and services | `index.html`, the `#services` section. Each service is one `<li class="item">`. |
| Booking link | `index.html`. Replace every `https://qrc-ai.com/rGX1a` (5 places), then regenerate the QR code (below). |
| Phone number | `index.html`. Replace `tel:+61402810111` and the visible `0402 810 111`. Also update the JSON-LD block in `<head>`. |
| Hours | `index.html`, the Hours row in the `#visit` section. |
| Colours and fonts | The `:root` block at the top of `assets/css/styles.css`. |

## Regenerating the brand assets

The emblem is redrawn from the card as vector art. The lettering is converted to outlines from Marcellus. The QR code uses the card's round dots and circular eyes, at error-correction level H so it still scans.

```sh
cd tools
npm install
npm run build                            # emblem + QR (card's booking link)
node qr.mjs "https://your-booking-page"  # QR for a different link
```

## Before launch

- **Booking link.** The QR code on the printed card encodes `https://qrc-ai.com/rGX1a`, a dynamic-QR redirect. The site uses the same link, so it opens the same page as the card. Linking straight to the final booking page skips the redirect.
- **Prices.** The figures shown are placeholder "from" prices, set from what comparable Richmond salons charge. Replace them with the real price list.
- **Hours.** Currently "By appointment". Add opening days if there are set hours.
- **Social links.** No Instagram or Facebook link is included yet.
- **Domain.** The site is set up for `https://nichau.me` (canonical URL, `og:image`, JSON-LD). Update those three in `<head>` if the domain changes.
