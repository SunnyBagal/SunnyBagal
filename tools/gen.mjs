// Generates the self-hosted SVG assets for the SunnyBagal profile README.
// Usage: node gen.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import * as si from 'simple-icons';

const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname);
const font = (f) => fs.readFileSync(path.join(here, 'fonts', f));

// ---------- palette (matches sunnybagal.com: warm charcoal + gold) ----------
const THEMES = {
  dark: {
    card: '#171511', border: '#2B271F', inner: '#1D1A15', text: '#EEE8DC',
    muted: '#A39B8C', faint: '#8C8476', gold: '#E6B450', track: '#2A261F',
    other: '#5A5347', chip: '#1F1C17', chipBorder: '#332E26',
  },
  light: {
    card: '#FAF7F0', border: '#E4DBC8', inner: '#F2ECE0', text: '#1E1A13',
    muted: '#5F5749', faint: '#756C5B', gold: '#8C5F04', track: '#E9E1D1',
    other: '#BDB29C', chip: '#FFFDF8', chipBorder: '#E0D6C2',
  },
};

// ---------- fonts ----------
const FONTS = {
  sg400: { family: 'SG', weight: 400, file: 'sg400' },
  sg600: { family: 'SG', weight: 600, file: 'sg600' },
  jb400: { family: 'JB', weight: 400, file: 'jb400' },
  jb600: { family: 'JB', weight: 600, file: 'jb600' },
};
const metrics = {};
for (const [k, v] of Object.entries(FONTS)) {
  const b = font(v.file + '.woff');
  metrics[k] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}
const textWidth = (str, key, size) => metrics[key].getAdvanceWidth(str, size, { kerning: true });

function fontCss(keys) {
  return keys.map((k) => {
    const f = FONTS[k];
    const b64 = font(f.file + '.woff2').toString('base64');
    return `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
  }).join('');
}
const SG = `'SG','Space Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif`;
const JB = `'JB','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function svgDoc({ w, h, title, desc, fonts, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${fontCss(fonts)}
.sg{font-family:${SG}}.jb{font-family:${JB}}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
${body}
</svg>
`;
}

// ---------- header ----------
function header(theme, narrow = false) {
  if (narrow) return headerNarrow(theme);
  const c = THEMES[theme];
  const W = 880, H = 268;
  const tag = '> build it. measure it. publish the numbers.';
  const tagSize = 15;
  const tagW = textWidth(tag, 'jb400', tagSize);
  const n = tag.length;

  // decorative op log (nod to Linea's append-only log); no metrics are claimed here
  const ops = [
    ['add', 'stroke'], ['add', 'rect'], ['move', 'rect'], ['add', 'arrow'],
    ['style', 'stroke'], ['add', 'text'], ['undo', 'arrow'], ['move', 'text'],
    ['add', 'circle'], ['delete', 'rect'], ['add', 'stroke'], ['resize', 'circle'],
  ];
  const lineH = 21;
  const logX = 612, logY = 58, logW = 236, logH = 178;
  const lines = [];
  const all = [...ops, ...ops];
  all.forEach(([op, kind], i) => {
    const seq = 4118 + (i % ops.length);
    const y = 24 + i * lineH;
    lines.push(
      `<text x="16" y="${y}" class="jb" font-size="12" fill="${c.faint}">${seq}</text>` +
      `<text x="66" y="${y}" class="jb" font-size="12" fill="${op === 'undo' ? c.gold : c.muted}">${op}</text>` +
      `<text x="128" y="${y}" class="jb" font-size="12" fill="${c.muted}">${kind}</text>` +
      `<text x="${logW - 16}" y="${y}" class="jb" font-size="12" fill="${c.gold}" text-anchor="end">ack</text>`
    );
  });
  const cycle = ops.length * lineH;

  const css = `
.cursor{animation:type 2.6s steps(${n}) .5s both, blink 1.05s steps(1) 3.1s infinite}
.typed{animation:reveal 2.6s steps(${n}) .5s both}
@keyframes reveal{from{width:0}}
@keyframes type{from{transform:translateX(${-tagW}px)}}
@keyframes blink{50%{opacity:0}}
.scroll{animation:scroll 28s linear infinite}
@keyframes scroll{to{transform:translateY(${-cycle}px)}}
.u{animation:blink 1.05s steps(1) infinite}
.fade{animation:fade .8s ease-out both}
@keyframes fade{from{opacity:0;transform:translateY(6px)}}
`;
  const body = `
<defs>
  <clipPath id="tc"><rect class="typed" x="40" y="${214 - 16}" width="${tagW}" height="24"/></clipPath>
  <clipPath id="lc"><rect x="0" y="0" width="${logW}" height="${logH}" rx="10"/></clipPath>
  <linearGradient id="lf" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".28" stop-color="#fff"/>
    <stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="lm" maskUnits="userSpaceOnUse" x="0" y="0" width="${logW}" height="${logH}"><rect width="${logW}" height="${logH}" fill="url(#lf)"/></mask>
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${c.card}" stroke="${c.border}"/>
<g fill="${c.faint}"><circle cx="26" cy="24" r="5"/><circle cx="44" cy="24" r="5"/><circle cx="62" cy="24" r="5"/></g>
<text x="${W / 2}" y="28.5" class="jb" font-size="12" fill="${c.faint}" text-anchor="middle">sunnybagal — ~/</text>
<line x1="0" y1="46" x2="${W}" y2="46" stroke="${c.border}"/>

<g class="fade">
  <text x="40" y="88" class="jb" font-size="15" fill="${c.gold}" font-weight="600">sb<tspan class="u">_</tspan><tspan fill="${c.faint}" font-weight="400">  ~  $ whoami</tspan></text>
  <text x="38" y="146" class="sg" font-size="54" font-weight="600" fill="${c.text}" letter-spacing="-1">Sunny Bagal</text>
  <text x="40" y="180" class="sg" font-size="19" fill="${c.muted}">Backend engineer · Node.js · TypeScript · PostgreSQL</text>
</g>
<g clip-path="url(#tc)"><text x="40" y="214" class="jb" font-size="${tagSize}" fill="${c.text}">${esc(tag)}</text></g>
<rect class="cursor" x="${40 + tagW + 3}" y="${214 - 13}" width="8" height="16" fill="${c.gold}"/>

<g transform="translate(${logX},${logY})">
  <rect width="${logW}" height="${logH}" rx="10" fill="${c.inner}" stroke="${c.border}"/>
  <g clip-path="url(#lc)"><g mask="url(#lm)"><g class="scroll">${lines.join('')}</g></g></g>
</g>
<text x="${logX + logW}" y="${logY + logH + 18}" class="jb" font-size="11" fill="${c.faint}" text-anchor="end">append-only op log</text>
`;
  return svgDoc({
    w: W, h: H,
    title: 'Sunny Bagal — Backend engineer',
    desc: 'Sunny Bagal. Backend engineer: Node.js, TypeScript, PostgreSQL. Build it, measure it, publish the numbers.',
    fonts: ['sg400', 'sg600', 'jb400', 'jb600'], css, body,
  });
}

function headerNarrow(theme) {
  const c = THEMES[theme];
  const W = 420, H = 236;
  const tag = '> build it. measure it. publish the numbers.';
  const tagSize = 13;
  const tagW = textWidth(tag, 'jb400', tagSize);
  const n = tag.length;
  const css = `
.cursor{animation:type 2.6s steps(${n}) .5s both, blink 1.05s steps(1) 3.1s infinite}
.typed{animation:reveal 2.6s steps(${n}) .5s both}
@keyframes reveal{from{width:0}}
@keyframes type{from{transform:translateX(${-tagW}px)}}
@keyframes blink{50%{opacity:0}}
.u{animation:blink 1.05s steps(1) infinite}`;
  const body = `
<defs><clipPath id="tc"><rect class="typed" x="24" y="${206 - 14}" width="${tagW}" height="20"/></clipPath></defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="${c.card}" stroke="${c.border}"/>
<g fill="${c.faint}"><circle cx="22" cy="20" r="4"/><circle cx="36" cy="20" r="4"/><circle cx="50" cy="20" r="4"/></g>
<text x="${W / 2}" y="24" class="jb" font-size="11" fill="${c.faint}" text-anchor="middle">sunnybagal — ~/</text>
<line x1="0" y1="38" x2="${W}" y2="38" stroke="${c.border}"/>
<text x="24" y="74" class="jb" font-size="14" fill="${c.gold}" font-weight="600">sb<tspan class="u">_</tspan><tspan fill="${c.faint}" font-weight="400">  ~  $ whoami</tspan></text>
<text x="22" y="122" class="sg" font-size="42" font-weight="600" fill="${c.text}" letter-spacing="-1">Sunny Bagal</text>
<text x="24" y="152" class="sg" font-size="17" fill="${c.muted}">Backend engineer</text>
<text x="24" y="174" class="sg" font-size="17" fill="${c.muted}">Node.js · TypeScript · PostgreSQL</text>
<g clip-path="url(#tc)"><text x="24" y="206" class="jb" font-size="${tagSize}" fill="${c.text}">${esc(tag)}</text></g>
<rect class="cursor" x="${24 + tagW + 3}" y="${206 - 11}" width="7" height="14" fill="${c.gold}"/>`;
  return svgDoc({ w: W, h: H, title: 'Sunny Bagal — Backend engineer',
    desc: 'Sunny Bagal. Backend engineer: Node.js, TypeScript, PostgreSQL. Build it, measure it, publish the numbers.',
    fonts: ['sg400', 'sg600', 'jb400', 'jb600'], css, body });
}

const warn = (what, w, max) => { if (w > max) console.warn(`OVERFLOW: "${what}" ${w.toFixed(0)} > ${max.toFixed(0)}`); };

// ---------- metric tiles ----------
function tiles(theme, { title, desc, items }, narrow = false) {
  const c = THEMES[theme];
  const W = narrow ? 420 : 800, gap = 12;
  const tw = narrow ? W : (W - gap * 2) / 3;
  const pad = narrow ? 18 : 18;
  const fsS = 13;                       // small text
  const rowsOf = (t) => Math.max(t.bars.length, (t.lines || []).length);
  const maxRows = Math.max(...items.map(rowsOf));
  const top = narrow ? 82 : 128;        // y of first bar row
  const rowH = 21;
  const tileH = (t) => top + (narrow ? rowsOf(t) : maxRows) * rowH + 6;
  const css = `
.bar{transform-box:fill-box;transform-origin:left center;animation:grow 1.1s cubic-bezier(.2,.7,.2,1) both}
@keyframes grow{from{transform:scaleX(0)}}`;
  let yOff = 0;
  const parts = items.map((t, i) => {
    const h = tileH(t);
    const x = narrow ? 0 : i * (tw + gap);
    const y0 = narrow ? yOff : 0;
    if (narrow) yOff += h + gap;
    const inner = tw - pad * 2;
    const nameW = Math.max(...t.bars.map((b) => textWidth(b.name, 'jb400', fsS)), 0);
    const valW = Math.max(...t.bars.map((b) => textWidth(b.label, 'jb400', fsS)), 0);
    const barX = pad + nameW + 12, barW = tw - pad - valW - 10 - barX;
    const rows = t.bars.map((b, j) => {
      const y = top + j * rowH;
      const w = b.v === 0 ? 0 : Math.max(3, (b.v / t.max) * barW);
      return `<text x="${pad}" y="${y + 4.5}" class="jb" font-size="${fsS}" fill="${b.hi ? c.text : c.muted}">${esc(b.name)}</text>
<rect x="${barX}" y="${y - 4}" width="${barW.toFixed(1)}" height="9" rx="4.5" fill="${c.track}"/>
<rect class="bar" style="animation-delay:${0.25 + i * 0.12 + j * 0.08}s" x="${barX}" y="${y - 4}" width="${w.toFixed(1)}" height="9" rx="4.5" fill="${b.hi ? c.gold : c.other}"/>
<text x="${tw - pad}" y="${y + 4.5}" class="jb" font-size="${fsS}" fill="${b.hi ? c.text : c.muted}" text-anchor="end">${esc(b.label)}</text>`;
    }).join('\n');
    const lines = (t.lines || []).map((l, j) => {
      warn(l, textWidth(l, 'jb400', fsS), inner);
      return `<text x="${pad}" y="${top + j * rowH + 4.5}" class="jb" font-size="${fsS}" fill="${c.muted}">${esc(l)}</text>`;
    }).join('\n');
    const label = t.label.toUpperCase();
    const vSize = narrow ? 32 : 40, uSize = narrow ? 16 : 18;
    const vW = textWidth(t.value, 'sg600', vSize) + (t.unit ? 5 + textWidth(t.unit, 'sg400', uSize) : 0);
    warn(t.note, textWidth(t.note, 'jb400', fsS), inner);
    if (narrow) warn(label + ' + value', textWidth(label, 'jb600', 12.5) + 0.75 * label.length + 16 + vW, inner);
    else warn(label, textWidth(label, 'jb600', 12.5) + 0.75 * label.length, inner);
    const value = `${esc(t.value)}<tspan font-size="${uSize}" font-weight="400" fill="${c.muted}" dx="5">${esc(t.unit || '')}</tspan>`;
    const head = narrow
      ? `<text x="${pad}" y="34" class="jb" font-size="12.5" font-weight="600" fill="${c.gold}" letter-spacing=".75">${esc(label)}</text>
<text x="${tw - pad}" y="42" class="sg" font-size="${vSize}" font-weight="600" fill="${c.text}" text-anchor="end" letter-spacing="-.5">${value}</text>
<text x="${pad}" y="58" class="jb" font-size="${fsS}" fill="${c.faint}">${esc(t.note)}</text>`
      : `<text x="${pad}" y="34" class="jb" font-size="12.5" font-weight="600" fill="${c.gold}" letter-spacing=".75">${esc(label)}</text>
<text x="${pad - 1}" y="82" class="sg" font-size="${vSize}" font-weight="600" fill="${c.text}" letter-spacing="-.5">${value}</text>
<text x="${pad}" y="106" class="jb" font-size="${fsS}" fill="${c.faint}">${esc(t.note)}</text>`;
    return `<g transform="translate(${x},${y0})">
<rect x="0.5" y="0.5" width="${tw - 1}" height="${h - 1}" rx="14" fill="${c.card}" stroke="${c.border}"/>
${head}
${rows}${lines}
</g>`;
  }).join('\n');
  const H = narrow ? yOff - gap : Math.max(...items.map(tileH));
  return svgDoc({ w: W, h: H, title, desc, fonts: ['sg400', 'sg600', 'jb400', 'jb600'], css, body: parts });
}

const PROJECTS = {
  linea: {
    title: 'Linea — benchmark results',
    desc: '10k-op replay: 188 ms to 0.59 ms. Acked ops per second with 20 clients: 30 to 894. p95 ack latency: 726 ms to 27 ms.',
    items: [
      { label: '10k-op replay', value: '0.59', unit: 'ms', note: 'lower is better', max: 188,
        bars: [{ name: 'before', v: 188, label: '188 ms' }, { name: 'after', v: 0.59, label: '0.59 ms', hi: true }] },
      { label: 'acked ops/s · 20 clients', value: '894', unit: 'ops/s', note: 'per-room group commit', max: 894,
        bars: [{ name: 'before', v: 30, label: '30' }, { name: 'after', v: 894, label: '894', hi: true }] },
      { label: 'p95 ack latency', value: '27', unit: 'ms', note: 'same 20-client load test', max: 726,
        bars: [{ name: 'before', v: 726, label: '726 ms' }, { name: 'after', v: 27, label: '27 ms', hi: true }] },
    ],
  },
  recall: {
    title: 'Recall — evaluation results',
    desc: 'nDCG@10 on BEIR SciFact: 0.72 versus the published BM25 0.665. Filtered top-10 recall for a 68-row user: 14% to 100%. Ingestion: 5,183 of 5,183 documents, 0 failed jobs.',
    items: [
      { label: 'nDCG@10 · BEIR SciFact', value: '0.72', unit: '', note: 'HNSW + full-text, RRF', max: 1,
        bars: [{ name: 'BM25', v: 0.665, label: '0.665' }, { name: 'Recall', v: 0.72, label: '0.72', hi: true }] },
      { label: 'top-10 recall · tenant', value: '100', unit: '%', note: '68-row user, exact scan', max: 100,
        bars: [{ name: 'before', v: 14, label: '14%' }, { name: 'after', v: 100, label: '100%', hi: true }] },
      { label: 'BullMQ ingestion', value: '5,183', unit: 'docs', note: 'idempotent retries', max: 5183,
        bars: [{ name: 'processed', v: 5183, label: '5,183', hi: true }, { name: 'failed', v: 0, label: '0' }] },
    ],
  },
  tracehound: {
    title: 'TraceHound — held-out benchmark',
    desc: 'On 29 real pull requests: TraceHound caught 4 of 20 bugs, CodeRabbit 10, Greptile 12. Comments on the 9 clean PRs: TraceHound 2, CodeRabbit 15, Greptile 13. Cost about $0.06 per PR on an open model.',
    items: [
      { label: 'bugs caught · 29 real PRs', value: '4', unit: '/ 20', note: 'blind, hand-graded', max: 20,
        bars: [{ name: 'TraceHound', v: 4, label: '4', hi: true }, { name: 'CodeRabbit', v: 10, label: '10' }, { name: 'Greptile', v: 12, label: '12' }] },
      { label: 'comments on 9 clean PRs', value: '2', unit: '', note: 'lower is better', max: 15,
        bars: [{ name: 'TraceHound', v: 2, label: '2', hi: true }, { name: 'CodeRabbit', v: 15, label: '15' }, { name: 'Greptile', v: 13, label: '13' }] },
      { label: 'cost per PR', value: '$0.06', unit: '', note: 'runs as a GitHub Action', max: 1,
        bars: [], lines: ['Nemotron 3.5 on Nebius', '$0.0603 per PR, run ledger'] },
    ],
  },
};

// ---------- stack panel ----------
const icon = (slug) => Object.values(si).find((i) => i && i.slug === slug);
const STACK = [
  ['Languages', [['TypeScript', 'typescript'], ['JavaScript', 'javascript'], ['Python', 'python'], ['SQL']]],
  ['Backend', [['Node.js', 'nodedotjs'], ['Express', 'express'], ['Bun', 'bun']], ['REST', 'WebSockets', 'SSE', 'OAuth 2.0']],
  ['Data & queues', [['PostgreSQL', 'postgresql'], ['pgvector'], ['Redis', 'redis'], ['BullMQ'], ['MongoDB', 'mongodb'], ['Drizzle', 'drizzle'], ['Prisma', 'prisma']], ['indexing', 'full-text search']],
  ['Cloud & DevOps', [['AWS (EC2, S3)'], ['Docker', 'docker'], ['GitHub Actions', 'githubactions'], ['Linux', 'linux'], ['Git', 'git'], ['Railway', 'railway'], ['Render', 'render'], ['DigitalOcean', 'digitalocean'], ['Vercel', 'vercel']]],
  ['Testing', [['Vitest', 'vitest'], ['Supertest'], ['Testing Library', 'testinglibrary']], ['integration + load tests']],
  ['AI', [['Claude API', 'claude'], ['OpenAI API']], ['RAG', 'embeddings', 'hybrid retrieval']],
  ['Frontend', [['React', 'react'], ['Next.js', 'nextdotjs'], ['Tailwind', 'tailwindcss']]],
];

function stack(theme, narrow = false) {
  const c = THEMES[theme];
  const W = narrow ? 420 : 800, padX = narrow ? 18 : 24, labelW = narrow ? 0 : 138, chipH = 32, fs = 13.5, rowGap = 10, lineGap = 8;
  const left = padX + labelW, right = W - padX;
  let y = narrow ? 22 : 24;
  const out = [];
  const rows = [];
  for (const [cat, chips, concepts = []] of STACK) {
    const rowTop = y;
    if (narrow) y += 22;
    let x = left;
    const place = (w) => { if (x + w > right) { x = left; y += chipH + lineGap; } const p = [x, y]; x += w + 7; return p; };
    const els = [];
    for (const [name, slug] of chips) {
      const ic = slug && icon(slug);
      const tw = textWidth(name, 'jb400', fs);
      const w = 12 + (ic ? 16 + 8 : 0) + tw + 12;
      const [cx, cy] = place(w);
      let g = `<rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${chipH}" rx="8" fill="${c.chip}" stroke="${c.chipBorder}"/>`;
      let tx = cx + 12;
      if (ic) {
        g += `<svg x="${cx + 12}" y="${cy + 8}" width="16" height="16" viewBox="0 0 24 24"><path d="${ic.path}" fill="${c.muted}"/></svg>`;
        tx += 24;
      }
      g += `<text x="${tx}" y="${cy + 21}" class="jb" font-size="${fs}" fill="${c.text}">${esc(name)}</text>`;
      els.push(g);
    }
    for (const k of concepts) {
      const tw = textWidth(k, 'jb400', fs - 1);
      const w = 10 + tw + 10;
      const [cx, cy] = place(w);
      els.push(`<rect x="${cx}" y="${cy}" width="${w.toFixed(1)}" height="${chipH}" rx="8" fill="none" stroke="${c.chipBorder}" stroke-dasharray="3 3"/>` +
        `<text x="${cx + 10}" y="${cy + 21}" class="jb" font-size="${fs - 1}" fill="${c.muted}">${esc(k)}</text>`);
    }
    out.push(`<text x="${padX}" y="${rowTop + (narrow ? 12 : 21)}" class="jb" font-size="12" font-weight="600" fill="${c.gold}" letter-spacing=".6">${esc(cat.toUpperCase())}</text>`);
    out.push(...els);
    rows.push(y + chipH);
    y += chipH + rowGap + 8;
    if (cat !== STACK[STACK.length - 1][0]) out.push(`<line x1="${padX}" y1="${y - 9}" x2="${right}" y2="${y - 9}" stroke="${c.border}"/>`);
  }
  const H = Math.ceil(y - 2);
  const body = `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="${c.card}" stroke="${c.border}"/>\n${out.join('\n')}`;
  const list = STACK.map(([cat, chips, concepts = []]) => `${cat}: ${[...chips.map((x) => x[0]), ...concepts].join(', ')}`).join('. ');
  return svgDoc({ w: W, h: H, title: 'Tech stack', desc: list, fonts: ['jb400', 'jb600'], body });
}

// ---------- write ----------
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.svg')) fs.unlinkSync(path.join(OUT, f));
for (const theme of ['dark', 'light']) for (const narrow of [false, true]) {
  const sfx = `${theme}${narrow ? '-narrow' : ''}.svg`;
  fs.writeFileSync(path.join(OUT, `header-${sfx}`), header(theme, narrow));
  fs.writeFileSync(path.join(OUT, `stack-${sfx}`), stack(theme, narrow));
  for (const [k, p] of Object.entries(PROJECTS)) fs.writeFileSync(path.join(OUT, `${k}-${sfx}`), tiles(theme, p, narrow));
}
console.log(fs.readdirSync(OUT).map((f) => `${f} ${(fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1)}KB`).join('\n'));
