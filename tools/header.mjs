// Profile banner: drifting parallax starfield (seamless loop) with a decoding neon name.
// Usage: node header.mjs <outDir>   -> writes header.svg and header-narrow.svg
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname);
const font = (f) => fs.readFileSync(path.join(here, 'fonts', f));
const face = (fam, w, file) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${font(file + '.woff2').toString('base64')}) format('woff2');}`;
const C = { pink: '#FF2E97', cyan: '#2DE2E6', yellow: '#FFD319', purple: '#B14CFF', blue: '#3B5BFF', text: '#F6F2FF' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let seed = 41;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const NAME = 'SUNNY BAGAL';

function header(narrow) {
  seed = 41;
  const W = narrow ? 420 : 880, H = narrow ? 210 : 280, cx = W / 2;
  const size = narrow ? 40 : 66, ls = narrow ? 2.5 : 4, nameY = narrow ? 96 : 124, roleY = narrow ? 132 : 170, roleSize = narrow ? 13 : 16;
  const cw = size * 0.6, L = size * 1.1;            // fixed-width cells, like a terminal
  const total = NAME.length * cw + (NAME.length - 1) * ls;
  const x0 = cx - total / 2 - cw * 0.4;
  const k = narrow ? 0.5 : 1;                       // fewer stars on the small banner

  // ---- starfield: each layer spans one full width, drawn twice and slid left by exactly W (perfect loop)
  const layers = [
    { count: 150 * k, r: [0.35, 0.8], op: [0.25, 0.6], dur: 160, tw: 0.25, colors: ['#FFFFFF', '#CFC6FF'] },
    { count: 70 * k, r: [0.7, 1.3], op: [0.45, 0.85], dur: 90, tw: 0.35, colors: ['#FFFFFF', '#FFFFFF', C.cyan, '#FFC2E2'] },
    { count: 26 * k, r: [1.2, 2.0], op: [0.75, 1], dur: 48, tw: 0.5, colors: ['#FFFFFF', C.pink, C.cyan, C.yellow] },
  ];
  const starLayers = layers.map((Ly, li) => {
    const out = [];
    for (let i = 0; i < Ly.count; i++) {
      const x = rnd() * W, y = rnd() * H, r = Ly.r[0] + rnd() * (Ly.r[1] - Ly.r[0]);
      const op = (Ly.op[0] + rnd() * (Ly.op[1] - Ly.op[0])).toFixed(2), col = pick(Ly.colors);
      const cls = rnd() < Ly.tw ? ` class="tw" style="animation-duration:${(1.6 + rnd() * 3.4).toFixed(1)}s;animation-delay:${(-rnd() * 5).toFixed(1)}s"` : '';
      const sparkle = li === 2 && r > 1.6;
      for (const ox of [0, W]) {
        const X = (x + ox).toFixed(1), Y = y.toFixed(1);
        out.push(sparkle
          ? `<g${cls} opacity="${op}"><circle cx="${X}" cy="${Y}" r="${r.toFixed(2)}" fill="${col}"/><path d="M${X} ${(y - r * 4).toFixed(1)}V${(y + r * 4).toFixed(1)}M${(x + ox - r * 4).toFixed(1)} ${Y}H${(x + ox + r * 4).toFixed(1)}" stroke="${col}" stroke-width=".7" stroke-opacity=".8"/></g>`
          : `<circle${cls} cx="${X}" cy="${Y}" r="${r.toFixed(2)}" fill="${col}" opacity="${op}"/>`);
      }
    }
    return `<g class="L${li}">${out.join('')}</g>`;
  }).join('\n');

  // ---- name: each letter is a reel of random glyphs that steps up and locks on the real letter
  const pool = [...'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@*+=<>/'];
  const reelCss = [], reels = [], glow = [];
  let lastLock = 0;
  [...NAME].forEach((ch, i) => {
    if (ch === ' ') return;
    const K = 8 + i, x = (x0 + i * (cw + ls)).toFixed(1);
    const dur = 0.5 + i * 0.09, lock = 0.2 + dur;
    lastLock = Math.max(lastLock, lock);
    let col = `<text x="${x}" y="${nameY}" fill="#FFFFFF">${ch}</text>`;
    for (let j = 1; j <= K; j++) col += `<text x="${x}" y="${(nameY + j * L).toFixed(1)}" fill="${j % 3 === 0 ? C.pink : C.cyan}" fill-opacity=".85">${esc(pick(pool))}</text>`;
    reelCss.push(`.r${i}{animation:r${i} ${dur.toFixed(2)}s steps(${K}) .2s both}@keyframes r${i}{from{transform:translateY(${(-K * L).toFixed(1)}px)}}`);
    reels.push(`<g class="r${i}">${col}</g>`);
    glow.push(`<text class="g" style="animation-delay:${lock.toFixed(2)}s,${(lock + 0.6).toFixed(2)}s" x="${x}" y="${nameY}">${ch}</text>`);
  });
  const cursorX = x0 + NAME.length * (cw + ls) + 4;

  const css = `
${layers.map((Ly, li) => `.L${li}{animation:drift ${Ly.dur}s linear infinite}`).join('\n')}
@keyframes drift{to{transform:translateX(${-W}px)}}
.tw{animation-name:tw;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
.neb{animation:neb 40s ease-in-out infinite alternate}@keyframes neb{to{transform:translate(-40px,8px)}}
.neb2{animation:neb2 34s ease-in-out infinite alternate}@keyframes neb2{to{transform:translate(50px,-10px)}}
.shoot{animation:shoot 9s linear 2.5s infinite;opacity:0}.shoot2{animation:shoot 13s linear 7s infinite;opacity:0}
@keyframes shoot{0%{transform:translate(0,0);opacity:0}2%{opacity:1}9%{transform:translate(${narrow ? -120 : -230}px,${narrow ? 30 : 48}px);opacity:0}100%{transform:translate(${narrow ? -120 : -230}px,${narrow ? 30 : 48}px);opacity:0}}
.nm{font-family:'CP','Chakra Petch',system-ui,sans-serif;font-weight:700;font-size:${size}px}
${reelCss.join('\n')}
.g{fill:${C.purple};opacity:0;animation:glowOn .7s steps(1) both,breathe 3.2s ease-in-out infinite alternate}
@keyframes glowOn{0%{opacity:0}15%{opacity:1}30%{opacity:.25}45%{opacity:1}60%{opacity:.45}75%,100%{opacity:1}}
@keyframes breathe{from{opacity:1}to{opacity:.62}}
.cur{animation:blink 1s steps(1) ${(lastLock + 0.2).toFixed(2)}s infinite both}@keyframes blink{0%{opacity:1}50%{opacity:0}}
.role{font-family:'JB',ui-monospace,monospace;font-weight:500;font-size:${roleSize}px;fill:${C.text};fill-opacity:.88;animation:fade .6s ease-out ${(lastLock - 0.1).toFixed(2)}s both}@keyframes fade{from{opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.g{opacity:1}}`;

  const body = `<defs>
  <radialGradient id="sp" cx=".5" cy=".55" r=".8"><stop offset="0" stop-color="#140A33"/><stop offset=".6" stop-color="#090520"/><stop offset="1" stop-color="#030210"/></radialGradient>
  <radialGradient id="hush"><stop offset="0" stop-color="#05030F" stop-opacity=".8"/><stop offset=".6" stop-color="#05030F" stop-opacity=".45"/><stop offset="1" stop-color="#05030F" stop-opacity="0"/></radialGradient>
  <filter id="nb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${narrow ? 26 : 40}"/></filter>
  <linearGradient id="trail" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".15" stop-color="${C.cyan}" stop-opacity=".8"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></linearGradient>
  <clipPath id="win"><rect x="0" y="${(nameY - size * 0.8).toFixed(1)}" width="${W}" height="${(size * 0.95).toFixed(1)}"/></clipPath>
  <linearGradient id="tube" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.purple}"/><stop offset=".5" stop-color="#D24DFF"/><stop offset="1" stop-color="${C.pink}"/></linearGradient>
  <filter id="halo" x="-30%" y="-120%" width="160%" height="340%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${narrow ? 4 : 6}" result="a"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${narrow ? 11 : 18}" result="b"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="${narrow ? 22 : 36}" result="c"/>
    <feMerge><feMergeNode in="c"/><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="a"/><feMergeNode in="a"/></feMerge>
  </filter>
  <filter id="core" x="-10%" y="-40%" width="120%" height="180%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${narrow ? 1.6 : 2.4}" result="b"/><feFlood flood-color="#E2A8FF"/><feComposite in2="b" operator="in" result="w"/>
    <feGaussianBlur in="SourceAlpha" stdDeviation=".8" result="b2"/><feFlood flood-color="#FFFFFF"/><feComposite in2="b2" operator="in" result="w2"/>
    <feMerge><feMergeNode in="w"/><feMergeNode in="w"/><feMergeNode in="w2"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="curglow" x="-100%" y="-50%" width="300%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#sp)"/>
<g class="neb" filter="url(#nb)" opacity=".55"><ellipse cx="${W * 0.72}" cy="${H * 0.35}" rx="${170 * (narrow ? 0.55 : 1)}" ry="${70 * (narrow ? 0.7 : 1)}" fill="${C.purple}"/><ellipse cx="${W * 0.82}" cy="${H * 0.55}" rx="${110 * (narrow ? 0.55 : 1)}" ry="${50 * (narrow ? 0.7 : 1)}" fill="${C.pink}" opacity=".7"/></g>
<g class="neb2" filter="url(#nb)" opacity=".45"><ellipse cx="${W * 0.2}" cy="${H * 0.7}" rx="${160 * (narrow ? 0.55 : 1)}" ry="${60 * (narrow ? 0.7 : 1)}" fill="${C.blue}"/><ellipse cx="${W * 0.32}" cy="${H * 0.3}" rx="${90 * (narrow ? 0.55 : 1)}" ry="${40 * (narrow ? 0.7 : 1)}" fill="${C.cyan}" opacity=".5"/></g>
${starLayers}
<ellipse cx="${cx}" cy="${nameY + (narrow ? 8 : 14)}" rx="${narrow ? 190 : 330}" ry="${narrow ? 52 : 70}" fill="url(#hush)"/>
<g class="shoot"><line x1="${W * 0.78}" y1="${narrow ? 14 : 18}" x2="${W * 0.78 + (narrow ? 50 : 90)}" y2="${narrow ? -8 : -20}" stroke="url(#trail)" stroke-width="1.6" stroke-linecap="round"/></g>
<g class="shoot2"><line x1="${W * 0.45}" y1="10" x2="${W * 0.45 + (narrow ? 40 : 70)}" y2="-20" stroke="url(#trail)" stroke-width="1.3" stroke-linecap="round"/></g>
<g class="nm" fill="url(#tube)" filter="url(#halo)">${glow.join('')}</g>
<g class="nm" clip-path="url(#win)" filter="url(#core)">${reels.join('')}</g>
<rect class="cur" x="${cursorX.toFixed(1)}" y="${(nameY - size * 0.72).toFixed(1)}" width="${(cw * 0.62).toFixed(1)}" height="${(size * 0.74).toFixed(1)}" fill="${C.pink}" filter="url(#curglow)"/>
<text class="role" x="${cx}" y="${roleY}" text-anchor="middle"><tspan fill="${C.pink}">~/</tspan> backend engineer</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
<title id="t">Sunny Bagal — backend engineer</title><desc id="d">Sunny Bagal, backend engineer, over a drifting starfield.</desc>
<style>${face('CP', 700, 'cp700')}${face('JB', 500, 'jb500')}${css}</style>
${body}
</svg>
`;
}

fs.writeFileSync(path.join(OUT, 'header.svg'), header(false));
fs.writeFileSync(path.join(OUT, 'header-narrow.svg'), header(true));
console.log('header.svg, header-narrow.svg');
