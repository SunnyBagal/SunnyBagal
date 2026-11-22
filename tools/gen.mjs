// Generates the self-hosted SVG assets for the SunnyBagal profile README.
// Usage: node gen.mjs <outDir>
// Palette is taken from the profile avatar: neon pink, cyan, yellow and purple on deep indigo.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import * as si from 'simple-icons';

const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname);
const font = (f) => fs.readFileSync(path.join(here, 'fonts', f));

// ---------- palette ----------
const C = {
  bg: '#0E0A22', panel: '#130E2C', chip: '#1A1438', line: '#2E2560', lineSoft: '#231C4A',
  text: '#F6F2FF', muted: '#A79CD3', dim: '#6F64A0',
  pink: '#FF2E97', cyan: '#2DE2E6', yellow: '#FFD319', purple: '#B14CFF', orange: '#FF8A3D',
};

// ---------- fonts (Chakra Petch, subset + embedded) ----------
const FONTS = { 500: 'cp500', 600: 'cp600', 700: 'cp700' };
const metrics = {};
for (const [w, f] of Object.entries(FONTS)) {
  const b = font(f + '.woff');
  metrics[w] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}
// width of text incl. letter-spacing
const tw = (s, w, size, ls = 0) => metrics[w].getAdvanceWidth(s, size, { kerning: true }) + ls * s.length;
const fontCss = (ws) => ws.map((w) => `@font-face{font-family:'CP';font-weight:${w};src:url(data:font/woff2;base64,${font(FONTS[w] + '.woff2').toString('base64')}) format('woff2');}`).join('');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const warn = (what, w, max) => { if (w > max + 0.5) console.warn(`OVERFLOW: "${what}" ${w.toFixed(0)} > ${max.toFixed(0)}`); };

function svgDoc({ w, h, title, desc, css = '', body, weights = [500, 600, 700] }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${fontCss(weights)}
text{font-family:'CP','Chakra Petch',system-ui,-apple-system,'Segoe UI',sans-serif}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}

// chamfered box: square corners, top-right corner cut
const chamfer = (x, y, w, h, c = 12) => `M${x} ${y}H${x + w - c}L${x + w} ${y + c}V${y + h}H${x}Z`;

// ---------- header: chrome name over a live backend pipeline ----------
function header(narrow) {
  const W = narrow ? 420 : 880, H = narrow ? 270 : 320;
  const cx = W / 2;
  const name = 'SUNNY BAGAL';
  const nSize = narrow ? 44 : 72, nLs = narrow ? 3 : 6, nY = narrow ? 62 : 90;
  const role = 'BACKEND ENGINEER  ·  TYPESCRIPT  ·  POSTGRES';
  const rSize = narrow ? 11.5 : 15, rLs = narrow ? 2 : 3.5, rY = narrow ? 90 : 124;
  const roleW = tw(role, 600, rSize, rLs);
  warn('role', roleW, W - 24);

  // name as outlines so each letter can be laser-traced
  const f = metrics[700];
  const scale = nSize / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(name);
  const total = glyphs.reduce((a, g) => a + g.advanceWidth * scale + nLs, 0) - nLs;
  warn('name', total, W - 24);
  let gx = cx - total / 2, d = '';
  const letters = [];
  for (const g of glyphs) {
    const p = g.getPath(gx, nY, nSize).toPathData(2);
    if (p) letters.push(p);
    d += p; gx += g.advanceWidth * scale + nLs;
  }
  const capTop = nY - nSize * 0.72;
  const nameDone = 0.2 + letters.length * 0.13 + 0.4;

  // pipeline
  const nodes = narrow
    ? [['API', C.pink], ['QUEUE', C.purple], ['POSTGRES', C.cyan]]
    : [['CLIENT', C.muted], ['API', C.pink], ['QUEUE', C.purple], ['WORKER', C.yellow], ['POSTGRES', C.cyan]];
  const nW = narrow ? 90 : 124, nH = narrow ? 34 : 44, py = narrow ? 160 : 202;
  const hz = py + nH / 2 + (narrow ? 16 : 20);
  const x0 = narrow ? 14 : 34, x1 = W - (narrow ? 14 : 34) - nW;
  const step = (x1 - x0) / (nodes.length - 1);
  const nx = nodes.map((_, i) => x0 + i * step);
  const laneOut = py - 7, laneBack = py + 7;
  const startX = nx[0] + nW, endX = nx[nodes.length - 1];
  const D = narrow ? 4.2 : 5.2;          // seconds for a packet to cross
  const N = 8;                            // packets in flight per lane
  const t0 = nameDone + 0.6;             // pipeline starts after the name settles
  // a packet passes through every node; time it reaches node i's left edge
  const arrive = (i) => ((nx[i] - startX) / (endX - startX)) * D;

  const boxes = nodes.map(([label, col], i) => {
    const x = nx[i];
    const hit = i === 0 ? '' : `style="animation-delay:${(t0 + Math.max(0, arrive(i))).toFixed(2)}s"`;
    const lw = tw(label, 700, narrow ? 10.5 : 12.5, 1.6);
    warn(label, lw, nW - 10);
    return `<g>
  <path d="${chamfer(x, py - nH / 2, nW, nH, 8)}" fill="${C.panel}" stroke="${col}" stroke-opacity=".8"/>
  ${i === 0 ? '' : `<path class="hit" ${hit} d="${chamfer(x, py - nH / 2, nW, nH, 8)}" fill="${col}" fill-opacity=".18" stroke="${col}" stroke-width="2" filter="url(#soft)"/>`}
  <rect x="${x}" y="${py - nH / 2}" width="3" height="${nH}" fill="${col}"/>
  <text x="${x + nW / 2 + 1}" y="${py + (narrow ? 4 : 4.5)}" text-anchor="middle" font-size="${narrow ? 10.5 : 12.5}" font-weight="700" letter-spacing="1.6" fill="${C.text}">${label}</text>
</g>`;
  }).join('\n');

  // wires between boxes, two lanes: requests out (pink), acks back (cyan)
  const wires = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nx[i] + nW, b = nx[i + 1];
    wires.push(`<line x1="${a}" y1="${laneOut}" x2="${b}" y2="${laneOut}" stroke="${C.pink}" stroke-opacity=".6" filter="url(#soft)"/>`);
    wires.push(`<line x1="${a}" y1="${laneBack}" x2="${b}" y2="${laneBack}" stroke="${C.cyan}" stroke-opacity=".55" stroke-dasharray="4 4"/>`);
  }
  // packets ride over the boxes (boxes are drawn on top, so they look like they pass through)
  const packet = (y, from, to, col, i, back) => {
    const begin = (t0 + (back ? D * 0.5 : 0) + (i * D) / N).toFixed(2);
    return `<g opacity="0"><rect x="${back ? -3 : -27}" y="-2" width="30" height="4" fill="url(#${back ? 'tailL' : 'tailR'}${col.slice(1)})"/><rect x="-4" y="-3.5" width="8" height="7" fill="${col}" filter="url(#pk)"/>
  <animateMotion path="M${from} ${y}H${to}" dur="${D}s" begin="${begin}s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.06;.94;1" dur="${D}s" begin="${begin}s" repeatCount="indefinite"/></g>`;
  };
  const packets = [];
  for (let i = 0; i < N; i++) {
    packets.push(packet(laneOut, startX - 4, endX + 4, i % 3 === 2 ? C.yellow : C.pink, i, false));
    packets.push(packet(laneBack, endX + 4, startX - 4, C.cyan, i, true));
  }

  const vlines = [], hl = [], hcss = [];
  const vn = narrow ? 9 : 14;
  for (let i = -vn; i <= vn; i++) vlines.push(`<line x1="${(cx + i * (narrow ? 5 : 8)).toFixed(1)}" y1="${hz}" x2="${(cx + i * (narrow ? 64 : 88)).toFixed(1)}" y2="${H}"/>`);
  const K = 7, pos = (k) => hz + (H - hz) * Math.pow(k / K, 2);
  for (let k = 0; k <= K; k++) {
    const y0 = pos(k), y1 = pos(k + 1);
    hl.push(`<line class="h${k}" x1="0" y1="${y0.toFixed(2)}" x2="${W}" y2="${y0.toFixed(2)}"/>`);
    hcss.push(`.h${k}{animation:m${k} 1.4s linear infinite}@keyframes m${k}{to{transform:translateY(${(y1 - y0).toFixed(2)}px)}}`);
  }
  const css = `
${hcss.join('\n')}
.trace{stroke-dasharray:1 1;animation:draw .75s cubic-bezier(.5,0,.3,1) both}
@keyframes draw{from{stroke-dashoffset:1}}
.fillin{animation:fillin .9s ease-out ${nameDone.toFixed(2)}s both}
@keyframes fillin{from{opacity:0}}
.sheen{animation:sheen 6s ease-in-out ${(nameDone + 0.9).toFixed(2)}s infinite}
@keyframes sheen{0%{transform:translateX(${-W * 0.25}px)}35%,100%{transform:translateX(${W * 1.1}px)}}
.typed{animation:reveal 1.4s steps(${role.length}) ${(nameDone + 0.2).toFixed(2)}s both}
@keyframes reveal{from{width:0}}
.pipe{animation:pipe .8s ease-out ${(nameDone + 0.1).toFixed(2)}s both}
@keyframes pipe{from{opacity:0;transform:translateY(8px)}}
.hit{opacity:0;animation:hit ${(D / N).toFixed(3)}s ease-out infinite}
@keyframes hit{0%{opacity:1}60%,100%{opacity:0}}
.band{animation:drift 9s ease-in-out infinite alternate}
@keyframes drift{to{transform:translateY(10px)}}
`;
  const body = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#07051A"/><stop offset=".5" stop-color="#140A36"/><stop offset="1" stop-color="#0B0722"/>
  </linearGradient>
  <linearGradient id="bandg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.purple}" stop-opacity="0"/><stop offset=".35" stop-color="${C.purple}" stop-opacity=".35"/>
    <stop offset=".55" stop-color="${C.pink}" stop-opacity=".45"/><stop offset=".8" stop-color="#3B5BFF" stop-opacity=".25"/><stop offset="1" stop-color="#3B5BFF" stop-opacity="0"/>
  </linearGradient>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><rect x="10" y="10" width="1.4" height="1.4" fill="${C.muted}" opacity=".35"/></pattern>
  <linearGradient id="chrome" gradientUnits="userSpaceOnUse" x1="0" y1="${capTop}" x2="0" y2="${nY}">
    <stop offset="0" stop-color="#F2FCFF"/><stop offset=".42" stop-color="#8FDCFF"/><stop offset=".5" stop-color="#3A8BE0"/>
    <stop offset=".5" stop-color="#2A0E52"/><stop offset=".6" stop-color="#8A1E9E"/><stop offset=".82" stop-color="${C.pink}"/><stop offset="1" stop-color="${C.yellow}"/>
  </linearGradient>
  <linearGradient id="sheengrad" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="nameclip"><path d="${d}"/></clipPath>
  <clipPath id="roleclip"><rect class="typed" x="${cx - roleW / 2 - 2}" y="${rY - rSize - 4}" width="${roleW + 8}" height="${rSize + 10}"/></clipPath>
  <filter id="neon" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="${narrow ? 3.5 : 5}" result="b"/><feFlood flood-color="${C.pink}"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="pk" x="-200%" y="-400%" width="500%" height="900%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="blur" x="0" y="-50%" width="100%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  ${[C.pink, C.yellow, C.cyan].map((c) => `<linearGradient id="tailR${c.slice(1)}" x1="0" x2="1"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset="1" stop-color="${c}"/></linearGradient><linearGradient id="tailL${c.slice(1)}" x1="1" x2="0"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset="1" stop-color="${c}"/></linearGradient>`).join('')}
  <linearGradient id="floorfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff"/></linearGradient>
  <mask id="floormask" maskUnits="userSpaceOnUse" x="0" y="${hz}" width="${W}" height="${H - hz}"><rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#floorfade)"/></mask>
  <clipPath id="floorclip"><rect y="${hz}" width="${W}" height="${H - hz}"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect class="band" x="-20" y="${py - (narrow ? 70 : 90)}" width="${W + 40}" height="${narrow ? 130 : 160}" fill="url(#bandg)" filter="url(#blur)"/>
<rect width="${W}" height="${hz}" fill="url(#dots)"/>
<rect y="${hz}" width="${W}" height="${H - hz}" fill="#090619"/>
<g clip-path="url(#floorclip)" mask="url(#floormask)" stroke="${C.pink}" stroke-width="1.2" filter="url(#soft)">${vlines.join('')}${hl.join('')}</g>
<line x1="0" y1="${hz}" x2="${W}" y2="${hz}" stroke="${C.pink}" stroke-width="2" filter="url(#soft)"/>

<path class="fillin" d="${d}" fill="${C.pink}" opacity=".55" filter="url(#neon)"/>
<path class="fillin" d="${d}" fill="url(#chrome)"/>
<g clip-path="url(#nameclip)"><g class="sheen"><rect x="0" y="${capTop - 10}" width="${nSize * 0.9}" height="${nSize}" fill="url(#sheengrad)" transform="skewX(-20)"/></g></g>
<g fill="none" stroke="${C.pink}" stroke-width="${narrow ? 1.4 : 1.8}" stroke-linejoin="round" filter="url(#soft)">${letters.map((p, i) => `<path class="trace" style="animation-delay:${(0.2 + i * 0.13).toFixed(2)}s" d="${p}" pathLength="1"/>`).join('')}</g>
<g clip-path="url(#roleclip)"><text x="${cx}" y="${rY}" text-anchor="middle" font-size="${rSize}" font-weight="600" letter-spacing="${rLs}" fill="${C.cyan}">${esc(role)}</text></g>

<g class="pipe">
${wires.join('\n')}
${packets.join('\n')}
${boxes}
</g>
`;
  return svgDoc({ w: W, h: H, title: 'Sunny Bagal — backend engineer',
    desc: 'Sunny Bagal, backend engineer. Requests flow from client to API, through a queue and worker, into Postgres, with acknowledgements flowing back.', css, body, weights: [600, 700] });
}

// ---------- project metric strips ----------
function tiles({ title, desc, accent, items }, narrow) {
  const W = narrow ? 420 : 800, gap = narrow ? 8 : 10;
  const tW = narrow ? W : (W - gap * 2) / 3;
  const pad = 16;
  const rows = Math.max(...items.map((t) => t.bars.length));
  const tH = 70 + rows * 6;
  const css = `
.bar{transform-box:fill-box;transform-origin:left center;animation:grow 1.2s cubic-bezier(.2,.7,.2,1) both}
@keyframes grow{from{transform:scaleX(0)}}
.tile{animation:fade .6s ease-out both}
@keyframes fade{from{opacity:0;transform:translateY(6px)}}`;
  const parts = items.map((t, i) => {
    const x = narrow ? 0 : i * (tW + gap), y = narrow ? i * (tH + gap) : 0;
    const label = t.label.toUpperCase();
    const vW = tw(t.value, 700, 30) + (t.unit ? 4 + tw(t.unit, 600, 14) : 0);
    warn(label, tw(label, 600, 12, 1.4), tW - pad * 2 - 6);
    warn(`${t.value} + ${t.cmp}`, pad + vW + 12 + tw(t.cmp, 500, 13), tW - pad);
    const barX = pad, barW = tW - pad * 2;
    const bars = t.bars.map((b, j) => {
      const by = 64 + j * 6;
      const w = b.v === 0 ? 0 : Math.max(3, (b.v / t.max) * barW);
      return `<rect x="${barX}" y="${by}" width="${barW}" height="3" fill="${C.lineSoft}"/>` +
        `<rect class="bar" style="animation-delay:${(0.3 + i * 0.12 + j * 0.08).toFixed(2)}s" x="${barX}" y="${by}" width="${w.toFixed(1)}" height="3" fill="${b.hi ? accent : C.dim}"/>`;
    }).join('');
    return `<g transform="translate(${x},${y})"><g class="tile" style="animation-delay:${(i * 0.08).toFixed(2)}s">
<path d="${chamfer(0.5, 0.5, tW - 1, tH - 1)}" fill="${C.panel}" stroke="${C.line}"/>
<rect x="0" y="0" width="3" height="${tH}" fill="${accent}"/>
<text x="${pad}" y="24" font-size="12" font-weight="600" letter-spacing="1.4" fill="${C.muted}">${esc(label)}</text>
<text x="${pad - 1}" y="54" font-size="30" font-weight="700" fill="${C.text}">${esc(t.value)}<tspan font-size="14" font-weight="600" fill="${C.muted}" dx="4">${esc(t.unit || '')}</tspan></text>
<text x="${tW - pad}" y="53" text-anchor="end" font-size="13" font-weight="500" fill="${C.muted}">${esc(t.cmp)}</text>
${bars}
</g></g>`;
  }).join('\n');
  const H = narrow ? items.length * tH + (items.length - 1) * gap : tH;
  return svgDoc({ w: W, h: H, title, desc, css, body: parts });
}

const PROJECTS = {
  linea: {
    name: 'Linea', accent: C.pink,
    title: 'Linea — load-test results',
    desc: '10k-op replay: 188 ms to 0.59 ms. Acked ops per second with 20 clients: 30 to 894. p95 ack latency: 726 ms to 27 ms.',
    items: [
      { label: '10k-op replay', value: '0.59', unit: 'ms', cmp: 'from 188 ms', max: 188, bars: [{ v: 188 }, { v: 0.59, hi: true }] },
      { label: 'acked ops/s · 20 clients', value: '894', unit: '', cmp: 'from 30', max: 894, bars: [{ v: 30 }, { v: 894, hi: true }] },
      { label: 'p95 ack latency', value: '27', unit: 'ms', cmp: 'from 726 ms', max: 726, bars: [{ v: 726 }, { v: 27, hi: true }] },
    ],
  },
  recall: {
    name: 'Recall', accent: C.cyan,
    title: 'Recall — evaluation results',
    desc: 'nDCG@10 on BEIR SciFact: 0.72 versus the published BM25 0.665. Filtered top-10 recall for a 68-row user: 14% to 100%. Ingestion: 5,183 of 5,183 documents, 0 failed jobs.',
    items: [
      { label: 'nDCG@10 · BEIR SciFact', value: '0.72', unit: '', cmp: 'BM25 0.665', max: 1, bars: [{ v: 0.665 }, { v: 0.72, hi: true }] },
      { label: 'small-tenant top-10 recall', value: '100', unit: '%', cmp: 'from 14%', max: 100, bars: [{ v: 14 }, { v: 100, hi: true }] },
      { label: 'docs ingested · BullMQ', value: '5,183', unit: '', cmp: '0 failed', max: 5183, bars: [{ v: 0 }, { v: 5183, hi: true }] },
    ],
  },
  tracehound: {
    name: 'TraceHound', accent: C.yellow,
    title: 'TraceHound — held-out benchmark',
    desc: 'On 29 real pull requests: TraceHound caught 4 of 20 bugs, CodeRabbit 10, Greptile 12. Comments on the 9 clean PRs: TraceHound 2, CodeRabbit 15, Greptile 13. About $0.06 per PR on an open model.',
    items: [
      { label: 'bugs caught of 20', value: '4', unit: '', cmp: 'CodeRabbit 10 · Greptile 12', max: 20, bars: [{ v: 4, hi: true }, { v: 10 }, { v: 12 }] },
      { label: 'comments on 9 clean PRs', value: '2', unit: '', cmp: 'CodeRabbit 15 · Greptile 13', max: 15, bars: [{ v: 2, hi: true }, { v: 15 }, { v: 13 }] },
      { label: 'cost per PR', value: '$0.06', unit: '', cmp: 'open model', max: 1, bars: [] },
    ],
  },
};

// ---------- project title bars: neon divider + big name ----------
function titleBar(name, accent, narrow, divider = true) {
  const top = divider ? (narrow ? 18 : 24) : 0;
  const W = narrow ? 420 : 800, H = (narrow ? 52 : 60) + top;
  const size = narrow ? 28 : 34, y = H - 12;
  const label = name.toUpperCase();
  const css = `.nm{animation:slide .7s cubic-bezier(.2,.7,.2,1) .1s both}@keyframes slide{from{opacity:0;transform:translateX(-12px)}}
.ln{transform-box:fill-box;transform-origin:left center;animation:grow 1s cubic-bezier(.2,.7,.2,1) both}@keyframes grow{from{transform:scaleX(0)}}`;
  const body = `<defs>
  <linearGradient id="div" x1="0" x2="1"><stop offset="0" stop-color="${accent}"/><stop offset=".55" stop-color="${C.purple}" stop-opacity=".7"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></linearGradient>
  <filter id="g" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/><feFlood flood-color="${accent}" flood-opacity=".8"/><feComposite in2="b" operator="in" result="gl"/><feMerge><feMergeNode in="gl"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
${divider ? `<rect class="ln" x="0" y="${top}" width="${W}" height="2" fill="url(#div)"/>
<path d="M0 ${top - 4}H18L24 ${top + 2}H0Z" fill="${accent}"/>` : ''}
<text class="nm" x="0" y="${y}" font-size="${size}" font-weight="700" letter-spacing="3" fill="${accent}" filter="url(#g)">${esc(label)}</text>`;
  return svgDoc({ w: W, h: H, title: name, desc: `${name} project`, css, body, weights: [700] });
}

// ---------- stack ----------
const icon = (slug) => Object.values(si).find((i) => i && i.slug === slug);
const lum = (hex) => { const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
// AWS isn't in simple-icons; take the coloured mark from skill-icons
const awsInner = fs.readFileSync(path.join(here, 'aws.svg'), 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<rect[^>]*\/>/, '');
const STACK = [
  ['Languages', [['TypeScript', 'typescript'], ['JavaScript', 'javascript'], ['Python', 'python'], ['SQL']]],
  ['Backend', [['Node.js', 'nodedotjs'], ['Express', 'express'], ['Bun', 'bun', '#FBF0DF']], ['REST', 'WebSockets', 'SSE', 'OAuth 2.0']],
  ['Data', [['PostgreSQL', 'postgresql', '#5B8DEF'], ['pgvector'], ['Redis', 'redis'], ['BullMQ'], ['MongoDB', 'mongodb'], ['Drizzle', 'drizzle'], ['Prisma', 'prisma']]],
  ['Cloud', [['AWS', 'aws'], ['Docker', 'docker'], ['GitHub Actions', 'githubactions'], ['Linux', 'linux'], ['Git', 'git'], ['Railway', 'railway'], ['Render', 'render'], ['DigitalOcean', 'digitalocean'], ['Vercel', 'vercel']]],
  ['Testing', [['Vitest', 'vitest'], ['Supertest'], ['Testing Library', 'testinglibrary']], ['load testing']],
  ['AI', [['Claude API', 'claude'], ['OpenAI API']], ['RAG', 'embeddings', 'hybrid retrieval']],
  ['Frontend', [['React', 'react'], ['Next.js', 'nextdotjs'], ['Tailwind', 'tailwindcss']]],
];

function stack(narrow) {
  const W = narrow ? 420 : 800, padX = narrow ? 14 : 22, labelW = narrow ? 0 : 112;
  const chipH = 36, fs = 15, gapX = 7, gapY = 8;
  const left = padX + labelW, right = W - padX;
  let y = narrow ? 16 : 22;
  const out = [];
  let n = 0;
  STACK.forEach(([cat, chips, concepts = []], ri) => {
    const rowTop = y;
    if (narrow) y += 24;
    let x = left;
    const place = (w) => { if (x + w > right) { x = left; y += chipH + gapY; } const p = [x, y]; x += w + gapX; return p; };
    const delay = () => `style="animation-delay:${(0.05 + n++ * 0.025).toFixed(3)}s"`;
    for (const [name, slug, override] of chips) {
      const ic = slug && slug !== 'aws' && icon(slug);
      const hasIcon = !!ic || slug === 'aws';
      const w = 12 + (hasIcon ? 20 + 9 : 0) + tw(name, 600, fs) + 14;
      const [cx, cy] = place(w);
      let g = `<g class="chip" ${delay()}><rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${chipH}" fill="${C.chip}" stroke="${C.line}"/>`;
      let tx = cx + 12;
      if (slug === 'aws') {
        g += `<svg x="${cx + 10}" y="${cy + 6}" width="24" height="24" viewBox="20 50 216 156">${awsInner}</svg>`;
        tx += 29;
      } else if (ic) {
        let col = override || '#' + ic.hex;
        if (!override && lum(ic.hex) < 0.22) col = '#FFFFFF';
        g += `<svg x="${cx + 12}" y="${cy + 8}" width="20" height="20" viewBox="0 0 24 24"><path d="${ic.path}" fill="${col}"/></svg>`;
        tx += 29;
      }
      g += `<text x="${tx}" y="${cy + 23.5}" font-size="${fs}" font-weight="600" fill="${C.text}">${esc(name)}</text></g>`;
      out.push(g);
    }
    for (const k of concepts) {
      const w = 12 + tw(k, 500, fs - 1) + 12;
      const [cx, cy] = place(w);
      out.push(`<g class="chip" ${delay()}><rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${chipH}" fill="none" stroke="${C.line}" stroke-dasharray="4 3"/>` +
        `<text x="${cx + 12}" y="${cy + 23}" font-size="${fs - 1}" font-weight="500" fill="${C.cyan}">${esc(k)}</text></g>`);
    }
    out.push(`<text x="${padX}" y="${narrow ? rowTop + 14 : rowTop + 23}" font-size="13" font-weight="700" letter-spacing="1.6" fill="${C.pink}">${esc(cat.toUpperCase())}</text>`);
    y += chipH + 14;
    if (ri < STACK.length - 1) out.push(`<line x1="${padX}" y1="${y - 7}" x2="${right}" y2="${y - 7}" stroke="${C.lineSoft}"/>`);
    y += 4;
  });
  const H = Math.ceil(y + (narrow ? 4 : 6));
  const css = `.chip{animation:pop .45s ease-out both}@keyframes pop{from{opacity:0;transform:translateY(5px)}}`;
  const body = `<defs><linearGradient id="topline" x1="0" x2="1"><stop offset="0" stop-color="${C.pink}"/><stop offset=".5" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient></defs>
<path d="${chamfer(0.5, 0.5, W - 1, H - 1, 16)}" fill="${C.panel}" stroke="${C.line}"/>
<rect x="0" y="0" width="${W - 16}" height="3" fill="url(#topline)"/>
${out.join('\n')}`;
  const list = STACK.map(([cat, chips, concepts = []]) => `${cat}: ${[...chips.map((c) => c[0]), ...concepts].join(', ')}`).join('. ');
  return svgDoc({ w: W, h: H, title: 'Tech stack', desc: list, css, body });
}

// ---------- write ----------
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(OUT, f));
for (const narrow of [false, true]) {
  const sfx = narrow ? '-narrow.svg' : '.svg';
  fs.writeFileSync(path.join(OUT, `header${sfx}`), header(narrow));
  fs.writeFileSync(path.join(OUT, `stack${sfx}`), stack(narrow));
  for (const [k, p] of Object.entries(PROJECTS)) {
    fs.writeFileSync(path.join(OUT, `${k}${sfx}`), tiles(p, narrow));
    fs.writeFileSync(path.join(OUT, `${k}-title${sfx}`), titleBar(p.name, p.accent, narrow, k !== 'linea'));
  }
}
console.log(fs.readdirSync(OUT).map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)}KB`).join('\n'));
