// Builds the Nic Hau emblem SVGs, traced from the gold-foil business card.
//
//   node tools/emblem.mjs            -> writes into assets/img/
//
// Outputs:
//   emblem.svg       flat gold emblem (for print, social images, anywhere)
//   emblem-foil.svg  foil-gradient emblem with a slow light sweep (hero)
//   favicon.svg      scissors mark on a black tile
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] || path.join(here, '..', 'assets', 'img');
const font = opentype.parse(
  fs.readFileSync(
    path.join(here, 'node_modules/@fontsource/marcellus/files/marcellus-latin-400-normal.woff')
  ).buffer
);

const GOLD = '#D9B85A';
const INK = '#0E0F13';
const W = 952, H = 930;
const CX = 477, CY = 460;
const R_OUT = 370, R_IN = 351;

const f = (n) => +n.toFixed(2);
const rad = (d) => (d * Math.PI) / 180;
const pt = (r, a) => [f(CX + r * Math.cos(rad(a))), f(CY + r * Math.sin(rad(a)))];

function arc(r, a0, a1) {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
const ring = (a0, a1) => arc(R_OUT, a0, a1) + arc(R_IN, a0, a1);

// Crescent between two points: outer bulge radius r1, flatter inner radius r2.
const crescent = ([ax, ay], [bx, by], r1, r2, sweep) =>
  `M${ax} ${ay}A${r1} ${r1} 0 0 ${sweep} ${bx} ${by}A${r2} ${r2} 0 0 ${1 - sweep} ${ax} ${ay}Z`;

// Four-point sparkle with fine diagonal rays.
function sparkle(cx, cy, R) {
  const r = R * 0.1;
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = rad(i * 45 - 90);
    const len = i % 2 === 0 ? R : r;
    pts.push(`${f(cx + len * Math.cos(a))} ${f(cy + len * Math.sin(a))}`);
  }
  const d = R * 0.42;
  const rays = [45, 135, 225, 315]
    .map((deg) => {
      const a = rad(deg);
      return `M${f(cx + r * 1.6 * Math.cos(a))} ${f(cy + r * 1.6 * Math.sin(a))}L${f(cx + d * Math.cos(a))} ${f(cy + d * Math.sin(a))}`;
    })
    .join('');
  return { star: `M${pts.join('L')}Z`, rays };
}

function word(text, x, baseline, size, tracking, align = 'left') {
  const glyphs = font.stringToGlyphs(text);
  const advance = (g) => (g.advanceWidth / font.unitsPerEm) * size;
  const width = glyphs.reduce((w, g, i) => w + advance(g) + (i < glyphs.length - 1 ? tracking : 0), 0);
  let cursor = align === 'right' ? x - width : x;
  return glyphs
    .map((g) => {
      const d = g.getPath(cursor, baseline, size).toPathData(2);
      cursor += advance(g) + tracking;
      return d;
    })
    .join('');
}

// The small sign beside the right blade tip: a disc with a six-point star cut
// out, cupped by a crescent above (horns up) and one below (horns down).
function sign(cx, cy, s, tilt, paint, ground) {
  const star = [];
  for (let i = 0; i < 12; i++) {
    const a = rad(i * 30 - 90);
    const len = i % 2 === 0 ? s * 0.42 : s * 0.2;
    star.push(`${f(cx + len * Math.cos(a))} ${f(cy + len * Math.sin(a))}`);
  }
  const w = s * 1.05, top = cy - s * 0.76, bot = cy + s * 0.76;
  const moon = (y, dir) =>
    `M${f(cx - w)} ${f(y - dir * s * 0.9)}Q${cx} ${f(y + dir * s * 0.75)} ${f(cx + w)} ${f(y - dir * s * 0.9)}Q${cx} ${f(y + dir * s * 0.02)} ${f(cx - w)} ${f(y - dir * s * 0.9)}Z`;
  return `<g transform="rotate(${tilt} ${cx} ${cy})">
    <circle cx="${cx}" cy="${cy}" r="${f(s * 0.8)}" fill="${paint}"/>
    <path fill="${ground}" d="M${star.join('L')}Z"/>
    <path fill="${paint}" d="${moon(top, 1)}${moon(bot, -1)}"/>
  </g>`;
}

// --- Scissors -------------------------------------------------------------
const PIVOT = [478, 437];
const bladeL = 'M318 30 L474 326 Q492 372 503 414 L466 440 Q446 412 432 382 L421 360 Z';
const bladeR = 'M650 30 L548 322 Q536 372 522 408 Q506 384 488 352 Z';
const shankR = 'M486 452 C516 488 546 528 557 566 C563 586 572 600 588 612';
const shankL = 'M468 458 C450 484 428 500 416 526 C404 554 400 584 392 612';
const tangL = 'M460 452 L436 512 L452 498 Z';
const ringL = { cx: 333, cy: 676, rx: 60, ry: 68, rot: -8 };
const ringR = { cx: 624, cy: 674, rx: 60, ry: 68, rot: 8 };
const ellipse = (e, grow = 0, attrs = '') =>
  `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx + grow}" ry="${e.ry + grow}" transform="rotate(${e.rot} ${e.cx} ${e.cy})" ${attrs}/>`;

const spark1 = sparkle(268, 305, 44);
const spark2 = sparkle(690, 305, 44);
const spark3 = sparkle(477, 600, 30);
const lettering = word('NIC', 204, 492, 104, 6) + word('HAU', 772, 492, 104, 6, 'right');

// The artwork itself. `paint` is the foil, `ground` is the card stock showing
// through (screw slot, ring grooves, the star in the sign).
function art(paint, ground, { withText = true } = {}) {
  return `<g fill="none" stroke="${paint}" stroke-width="5" stroke-linecap="round">
    <path d="${ring(-106, -74)}${ring(-64, 55)}${ring(125, 244)}${ring(73, 107)}"/>
    <path d="M${CX} 50V172M${CX} 750V872M38 ${CY - 2}H162M792 ${CY - 2}H916"/>
    <circle cx="${CX}" cy="40" r="9"/>
    <circle cx="${CX}" cy="882" r="9"/>
    <path d="M18 ${CY - 2}l10 -10l10 10l-10 10ZM916 ${CY - 2}l10 -10l10 10l-10 10Z"/>
    <path d="${spark1.rays}${spark2.rays}${spark3.rays}" stroke-width="2.4"/>
  </g>
  <g fill="${paint}">
    <path d="${crescent([633, 756], [710, 834], 78, 128, 0)}${crescent([321, 756], [244, 834], 78, 128, 1)}"/>
    <path d="${spark1.star}${spark2.star}${spark3.star}"/>
    <path d="${bladeL}${bladeR}${tangL}"/>
  </g>
  <g fill="none" stroke="${paint}" stroke-linecap="round">
    <path d="${shankR}" stroke-width="21"/>
    <path d="${shankL}" stroke-width="18"/>
    ${ellipse(ringL, 0, 'stroke-width="22"')}
    ${ellipse(ringR, 0, 'stroke-width="22"')}
  </g>
  <g fill="none" stroke="${ground}" stroke-width="3">
    ${ellipse(ringL, 3)}
    ${ellipse(ringR, 3)}
  </g>
  <circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="25" fill="${paint}"/>
  <circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="12" fill="none" stroke="${ground}" stroke-width="3.5"/>
  <circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="4.5" fill="${ground}"/>
  ${sign(672, 66, 19, -22, paint, ground)}
  ${withText ? `<path fill="${paint}" stroke="${paint}" stroke-width="2.2" stroke-linejoin="round" d="${lettering}"/>` : ''}`;
}

const head = (extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Nic Hau"${extra}>
  <title>Nic Hau</title>`;

const flat = `${head()}
  ${art(GOLD, INK)}
</svg>
`;

// Hot-foil look: a metallic gradient plus a band of light that sweeps across
// the emblem every few seconds. At rest (and with reduced motion) the band
// sits off-canvas, so the emblem is always fully visible.
const foil = `${head()}
  <defs>
    <linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="832" y2="930">
      <stop offset="0" stop-color="#A9872F"/>
      <stop offset=".2" stop-color="#E8CC78"/>
      <stop offset=".38" stop-color="#C6A246"/>
      <stop offset=".56" stop-color="#F2DC92"/>
      <stop offset=".76" stop-color="#B48F37"/>
      <stop offset="1" stop-color="#DDBF68"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#FFF6D8" stop-opacity="0"/>
      <stop offset=".5" stop-color="#FFF6D8" stop-opacity=".8"/>
      <stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/>
    </linearGradient>
    <mask id="shape" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      ${art('#fff', '#000')}
    </mask>
  </defs>
  <style>
    .sheen { transform: translateX(-480px); }
    @media (prefers-reduced-motion: no-preference) {
      .sheen { animation: sweep 9s cubic-bezier(.5, 0, .3, 1) 1s infinite; }
    }
    @keyframes sweep {
      0% { transform: translateX(-480px); }
      40%, 100% { transform: translateX(1500px); }
    }
  </style>
  ${art('url(#foil)', INK)}
  <g mask="url(#shape)">
    <g transform="skewX(-20)">
      <rect class="sheen" x="0" y="-60" width="240" height="${H + 120}" fill="url(#sheen)"/>
    </g>
  </g>
</svg>
`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="${INK}"/>
  <g transform="translate(-2.9 3.8) scale(0.0727)">
    <path fill="${GOLD}" d="${bladeL}${bladeR}${tangL}"/>
    <g fill="none" stroke="${GOLD}" stroke-linecap="round">
      <path d="${shankR}" stroke-width="30"/>
      <path d="${shankL}" stroke-width="24"/>
      ${ellipse(ringL, 0, 'stroke-width="30"')}
      ${ellipse(ringR, 0, 'stroke-width="30"')}
    </g>
    <circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="32" fill="${GOLD}"/>
    <circle cx="${PIVOT[0]}" cy="${PIVOT[1]}" r="10" fill="${INK}"/>
  </g>
</svg>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'emblem.svg'), flat);
fs.writeFileSync(path.join(outDir, 'emblem-foil.svg'), foil);
fs.writeFileSync(path.join(outDir, 'favicon.svg'), favicon);
console.log(`Emblem SVGs written to ${outDir}`);
