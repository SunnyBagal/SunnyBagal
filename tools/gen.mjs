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

// ---------- experience & achievements ----------
const EXP = [
  { accent: C.pink, label: 'Experience', title: 'InteleCorp Software India', sub: 'Software Engineering Intern · Jan–Apr 2026',
    line: 'Led 4 interns building GeoGrid, a lead-gen platform', value: '1–3 ms', cap: 'repeat searches, Redis cell cache' },
  { accent: C.yellow, label: 'Achievement', title: 'HackerRank Orchestrate', sub: 'AI-agent hackathon · Oct 2026',
    line: 'Solo, 24 hours, against 4,094 participants', value: 'Top 6%', cap: 'rank 238' },
];
function experience(narrow) {
  const W = narrow ? 420 : 800, gap = 12;
  const cW = narrow ? W : (W - gap) / 2, cH = 168, pad = 20;
  const css = `.card{animation:fade .6s ease-out both}@keyframes fade{from{opacity:0;transform:translateY(6px)}}`;
  const cards = EXP.map((e, i) => {
    const x = narrow ? 0 : i * (cW + gap), y = narrow ? i * (cH + gap) : 0;
    const max = cW - pad * 2;
    warn(e.title, tw(e.title, 700, 22), max); warn(e.sub, tw(e.sub, 500, 14), max); warn(e.line, tw(e.line, 500, 14), max);
    const vW = tw(e.value, 700, 30);
    warn(e.cap, pad + vW + 12 + tw(e.cap, 500, 14), cW - pad);
    return `<g transform="translate(${x},${y})"><g class="card" style="animation-delay:${i * 0.1}s">
<path d="${chamfer(0.5, 0.5, cW - 1, cH - 1, 14)}" fill="${C.panel}" stroke="${C.line}"/>
<rect x="0" y="0" width="3" height="${cH}" fill="${e.accent}"/>
<text x="${pad}" y="28" font-size="12" font-weight="700" letter-spacing="1.8" fill="${e.accent}">${esc(e.label.toUpperCase())}</text>
<text x="${pad}" y="58" font-size="22" font-weight="700" fill="${C.text}">${esc(e.title)}</text>
<text x="${pad}" y="81" font-size="14" font-weight="500" fill="${C.muted}">${esc(e.sub)}</text>
<text x="${pad}" y="104" font-size="14" font-weight="500" fill="${C.text}" fill-opacity=".85">${esc(e.line)}</text>
<line x1="${pad}" y1="118" x2="${cW - pad}" y2="118" stroke="${C.lineSoft}"/>
<text x="${pad - 1}" y="152" font-size="30" font-weight="700" fill="${C.text}">${esc(e.value)}</text>
<text x="${pad + vW + 12}" y="151" font-size="14" font-weight="500" fill="${C.muted}">${esc(e.cap)}</text>
</g></g>`;
  }).join('\n');
  const H = narrow ? EXP.length * cH + (EXP.length - 1) * gap : cH;
  return svgDoc({ w: W, h: H, title: 'Experience and achievements',
    desc: EXP.map((e) => `${e.label}: ${e.title}, ${e.sub}. ${e.line}. ${e.value}, ${e.cap}.`).join(' '), css, body: cards });
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
  fs.writeFileSync(path.join(OUT, `stack${sfx}`), stack(narrow));
  fs.writeFileSync(path.join(OUT, `experience${sfx}`), experience(narrow));
  for (const [k, p] of Object.entries(PROJECTS)) {
    fs.writeFileSync(path.join(OUT, `${k}${sfx}`), tiles(p, narrow));
    fs.writeFileSync(path.join(OUT, `${k}-title${sfx}`), titleBar(p.name, p.accent, narrow, k !== 'linea'));
  }
}
console.log(fs.readdirSync(OUT).map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)}KB`).join('\n'));
