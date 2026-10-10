// Builds the bookings QR code in the card's style: round gold dots and
// circular finder eyes with a quatrefoil centre.
//
//   node tools/qr.mjs [url]          -> writes assets/img/qr-bookings.svg
//
// The default URL is the one encoded on the printed card, so the website and
// the card always send people to the same booking page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'https://qrc-ai.com/rGX1a';
const out = process.argv[3] || path.join(here, '..', 'assets', 'img', 'qr-bookings.svg');
const GOLD = '#D9B85A';

// Level H tolerates the round dots and stylised eyes.
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size;
const quiet = 2;
const size = n + quiet * 2;
const on = (x, y) => qr.modules.data[y * n + x] === 1;
const inEye = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

const dots = [];
for (let y = 0; y < n; y++) {
  for (let x = 0; x < n; x++) {
    if (on(x, y) && !inEye(x, y)) {
      const cx = x + quiet + 0.5;
      const cy = y + quiet + 0.5;
      dots.push(`M${cx - 0.42} ${cy}a.42 .42 0 1 0 .84 0a.42 .42 0 1 0 -.84 0`);
    }
  }
}

function eye(ox, oy) {
  const cx = ox + quiet + 3.5;
  const cy = oy + quiet + 3.5;
  const centre = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r=".62"/>`)
    .join('');
  return `<circle cx="${cx}" cy="${cy}" r="3" fill="none" stroke="${GOLD}" stroke-width="1"/>${centre}`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code: book with Nic Hau">
  <g fill="${GOLD}">
    <path d="${dots.join('')}"/>
    ${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}
  </g>
</svg>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log(`QR (${n}x${n}, version ${qr.version}) for ${url} written to ${out}`);
