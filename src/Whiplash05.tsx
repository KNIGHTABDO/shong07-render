// Edit 05 — IAA × Whiplash, 1:1 clone of ref05 (1024x576 @ 30 fps, 659 f) on the ref's own audio.
// All geometry in REF px (1024x576), scaled by S at draw time. g = "ref frame" (second half f352-561 repeats g102-311).
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import WAVE from './w05_wave.json';

export const FPS = 30, DUR_F = 659;
const C = (f: string) => staticFile(`w05/${f}`);
const RW = 1024, RH = 576, W = 1920, H = 1080, S = W / RW;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
const out = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const io = (x: number) => {x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const hash = (i: number) => {const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};
const R = (v: number) => v * S;
const SERIF = "'Nimbus Roman', 'Times New Roman', serif";
const GOLD = '#e8a62a', WAVEY = '#ffd51c';

// ---------- plates (Sol 3:2, cover-cropped to 16:9) ----------
const Plate: React.FC<{src: string; z?: number; sx?: number; ax?: number; ay?: number; dx?: number; dy?: number; filter?: string; style?: React.CSSProperties}> =
  ({src, z = 1, sx = 1, ax = RW / 2, ay = RH / 2, dx = 0, dy = 0, filter, style}) =>
  <AbsoluteFill style={{overflow: 'hidden', ...style}}>
    <Img src={C(src)} style={{position: 'absolute', width: W, height: H, objectFit: 'cover', transformOrigin: `${R(ax)}px ${R(ay)}px`,
      transform: `translate(${R(dx)}px, ${R(dy)}px) scale(${z * sx}, ${z})`, filter}}/>
  </AbsoluteFill>;

// ---------- horizontal blur filter (directional, x only) ----------
const HB: React.FC<{id: string; s: number}> = ({id, s}) => <svg width={0} height={0} style={{position: 'absolute'}}>
  <filter id={id} x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${R(s)} 0`}/></filter></svg>;

// ---------- glitch = horizontal pixel-stretch strips of the image (ref f61, 78, 184, 216, 562) ----------
const Glitch: React.FC<{g: number; seed: number; a: string; b?: string; k?: number; n?: number; full?: boolean}> = ({g, seed, a, b, k = 1, n = 16, full}) => {
  const id = `gs${seed}`;
  const strips = Array.from({length: n}, (_, i) => {
    const h0 = hash(seed * 97 + i * 13 + Math.floor(g) * 7.3);
    const y = hash(h0 * 23) * RH, h = 3 + Math.pow(hash(h0 * 41), 1.6) * (full ? 90 : 55);
    const x = full ? 0 : hash(h0 * 11) * RW * .75, w = full ? RW : 70 + hash(h0 * 31) * 520;
    return {x, y, w, h, src: hash(h0 * 53) < .55 || !b ? a : b, sx: 3 + hash(h0 * 67) * 16, ax: hash(h0 * 71) * RW, dx: (hash(h0 * 61) - .5) * 140, br: .9 + hash(h0 * 79) * .9};
  });
  return <AbsoluteFill style={{opacity: k}}>
    <HB id={id} s={10}/>
    {full ? <Plate src={a} sx={1.6} ax={RW * hash(seed + g)} filter={`url(#${id}) brightness(1.15)`}/> : null}
    {strips.map((B, i) => <AbsoluteFill key={i} style={{clipPath: `inset(${R(B.y)}px ${Math.max(0, W - R(B.x + B.w))}px ${Math.max(0, H - R(B.y + B.h))}px ${R(B.x)}px)`}}>
      <Plate src={B.src} sx={B.sx} ax={B.ax} ay={B.y + B.h / 2} dx={B.dx} z={1.04} filter={`url(#${id}) brightness(${B.br.toFixed(2)})`}/>
    </AbsoluteFill>)}
  </AbsoluteFill>;
};

// ---------- waveform driven by the ref audio (filled symmetric lobes on a thin line, like the ref) ----------
const Wave: React.FC<{f: number; x0: number; x1: number; y: number; h: number; color?: string; k?: number; reveal?: number; p?: number; th?: number}> =
  ({f, x0, x1, y, h, color = WAVEY, k = 1, reveal = 1, p = 3.2, th = 1.1}) => {
  if (k <= 0) return null;
  const d = (WAVE as number[][])[Math.max(0, Math.min(DUR_F - 1, Math.round(f)))];
  const n = d.length;
  const taper = (u: number) => Math.min(1, u / .02, (1 - u) / .02);
  const A = (i: number) => th + Math.pow(d[i], p) * h * taper(i / (n - 1));
  const up: [number, number][] = [], lo: [number, number][] = [];
  for (let i = 0; i < n; i++) {const x = mix(x0, x1, i / (n - 1)); up.push([x, y - A(i)]); lo.push([x, y + A(i)]);}
  const dPath = crPath(up) + ' L' + crPath(lo.reverse()).slice(1) + ' Z';
  const cw = R(x0 + (x1 - x0) * reveal), cid = `wc${Math.round(y)}`;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: k, filter: `drop-shadow(0 0 ${R(2)}px ${color}) drop-shadow(0 0 ${R(6)}px ${color}77)`}}>
    <defs><clipPath id={cid}><rect x={0} y={0} width={cw} height={H}/></clipPath></defs>
    <path d={dPath} fill={color} clipPath={`url(#${cid})`}/>
  </svg>;
};

// ---------- typed text ----------
type Line = {s: string; x: number; y: number};
const Typed: React.FC<{lines: Line[]; chars: number; size: number; align?: 'center' | 'left'; blur?: number; dx?: number}> = ({lines, chars, size, align = 'center', blur = 0, dx = 0}) => {
  let left = chars;
  return <AbsoluteFill style={{filter: blur ? `blur(${R(blur)}px)` : undefined}}>
    {lines.map((L, i) => {
      const shown = Math.max(0, Math.min(L.s.length, Math.floor(left))); left -= L.s.length;
      if (shown <= 0) return null;
      // each line keeps its final layout: the hidden tail holds the width
      return <div key={i} style={{position: 'absolute', left: R(L.x + dx - 500), width: R(1000), top: R(L.y - size * .85), textAlign: align, whiteSpace: 'pre',
        fontFamily: SERIF, fontWeight: 700, fontSize: R(size), lineHeight: 1, color: '#fff8ee', transform: 'scaleX(.8)', transformOrigin: 'center', WebkitTextStroke: `${R(.55)}px #fff8ee`,
        textShadow: `0 0 ${R(2)}px rgba(0,0,0,.8), 0 0 ${R(6)}px rgba(255,220,160,.25)`}}>
        <span>{L.s.slice(0, shown)}</span><span style={{opacity: 0}}>{L.s.slice(shown)}</span>
      </div>;
    })}
  </AbsoluteFill>;
};

// ---------- S1 + title card ----------
const LEFT: [number, number][] = [[-4, 228], [55, 188], [100, 203], [118, 268], [112, 350], [103, 408], [124, 412], [152, 338], [176, 240], [192, 110], [214, 72], [250, 64], [290, 94], [324, 146], [343, 138], [344, 88], [332, 36]];
const crPath = (p: [number, number][]) => {
  let d = `M${R(p[0][0])},${R(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${R(c1[0])},${R(c1[1])} ${R(c2[0])},${R(c2[1])} ${R(p2[0])},${R(p2[1])}`;
  }
  return d;
};
const PL = crPath(LEFT), PR = crPath(LEFT.map(([x, y]) => [RW - x, y] as [number, number]));
const Parchment: React.FC<{g: number; burn: number}> = ({g, burn}) => {
  const draw = out(span(g, 29, 45)), clef = span(g, 29.5, 36), soft = span(g, 56, 60);
  const thr = mix(-.05, 1.05, burn); // burn mask threshold
  return <AbsoluteFill style={{filter: soft > 0 ? `blur(${R(6 * soft)}px) brightness(${1 - .55 * soft})` : undefined}}>
    <svg width={W} height={H}>
      <defs>
        <linearGradient id="pdark" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity=".05"/><stop offset=".55" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".28"/></linearGradient>
        <radialGradient id="pg" cx=".5" cy=".45" r=".75"><stop offset="0" stopColor="#c98a24"/><stop offset=".6" stopColor="#a8650f"/><stop offset="1" stopColor="#6e3a06"/></radialGradient>
        <filter id="pclouds" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0018 .0026" numOctaves={5} seed={9}/>
          <feColorMatrix type="matrix" values="0 0 0 0 .25  0 0 0 0 .12  0 0 0 0 .02  1.6 0 0 0 -.55"/></filter>
        <filter id="pveins" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".0028" numOctaves={3} seed={21}/>
          <feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .09  0 0 0 0 .01  -3 0 0 0 .55"/></filter>
        <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves={2} seed={3}/><feDisplacementMap in="SourceGraphic" scale={R(2.4)}/></filter>
        <filter id="burnN" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004" numOctaves={4} seed={14}/>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0"/>
          <feComponentTransfer><feFuncA type="linear" slope={14} intercept={-14 * (1 - thr) + 6}/></feComponentTransfer></filter>
        <filter id="burnE" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004" numOctaves={4} seed={14}/>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 0 0 0 0"/>
          <feComponentTransfer><feFuncA type="linear" slope={14} intercept={-14 * (1 - thr - .05) + 6}/></feComponentTransfer></filter>
        <mask id="bm"><rect width={W} height={H} filter={burn < 1 ? 'url(#burnN)' : undefined} fill="#fff"/></mask>
        <mask id="be"><rect width={W} height={H} filter={burn < 1 ? 'url(#burnE)' : undefined} fill="#fff"/></mask>
        <clipPath id="clefc"><rect x={0} y={R(18)} width={W} height={R(95 * clef)}/></clipPath>
      </defs>
      {burn < 1 ? <rect width={W} height={H} fill="#2a1204" mask="url(#be)" opacity={.85}/> : null}
      <g mask="url(#bm)">
        <rect width={W} height={H} fill="url(#pg)"/>
        <rect width={W} height={H} filter="url(#pclouds)" opacity={.85}/>
        <rect width={W} height={H} filter="url(#pveins)" opacity={.6}/>
        <rect width={W} height={H} fill="url(#pdark)"/>
        <g filter="url(#rough)" fill="none" stroke="#2a1405" strokeWidth={R(4.6)} strokeLinecap="round">
          {draw > 0 ? <><path d={PL} pathLength={1} strokeDasharray={`${draw} 1`}/><path d={PR} pathLength={1} strokeDasharray={`${draw} 1`}/></> : null}
        </g>
        {clef > 0 ? <text x={R(506)} y={R(98)} textAnchor="middle" fontFamily="'Noto Music'" fontSize={R(58)} fill="#2a1405" clipPath="url(#clefc)">{'\u{1D11E}'}</text> : null}
        <text x={R(512)} y={R(311)} textAnchor="middle" fontFamily={SERIF} fontSize={R(58)} fill="#24120a" letterSpacing={R(3)} transform={`translate(${R(512)},0) scale(.52,1) translate(${-R(512)},0)`}>IAA</text>
      </g>
    </svg>
  </AbsoluteFill>;
};

// ---------- HUD over the conductor's arm (ref 3.4-4.2) ----------
const O: [number, number] = [110, 22];
const TG: [number, number, string][] = [[376, 205, 'x: 604  y: 379'], [552, 303, 'x: 950  y: 571'], [640, 413, 'x: 1174  y: 763'], [556, 437, 'x: 1014  y: 827'],
  [482, 543, 'x: 980  y: 1019'], [22, 452, 'x: 34  y: 827'], [22, 306, 'x: 34  y: 571'], [10, 218, 'x: 18  y: 411'], [802, 252, 'x: 1462  y: 475'], [906, 236, 'x: 1590  y: 443'], [788, 46, 'x: 1398  y: 91'], [700, 418, '']];
const BOX: [number, number, number, number][] = [[507, 305, 895, 535], [780, 250, 825, 293], [850, 235, 968, 275], [728, 45, 845, 88], [490, -2, 650, 26], [88, 22, 134, 50], [0, 215, 30, 296], [70, 120, 102, 155], [505, 455, 645, 530], [-2, 455, 100, 462]];
const Hud: React.FC<{g: number}> = ({g}) => {
  const t = g - 102, k = span(t, 4.5, 6), jit = (i: number) => (hash(i * 3.1 + Math.floor(t / 2)) - .5) * 2;
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: k}}>
    {TG.map(([x, y], i) => {
      const cx = mix(O[0], x, .25) - 40 - i * 6, cy = mix(O[1], y, .85) + 30;
      const dr = out(span(t, 2 + i * .4, 9 + i * .4));
      return <path key={i} d={`M${R(O[0])},${R(O[1])} Q${R(cx)},${R(cy)} ${R(x)},${R(y)}`} pathLength={1} strokeDasharray={`0.004 0.006`} strokeDashoffset={0}
        stroke="rgba(255,255,255,.75)" strokeWidth={R(.9)} fill="none" style={{clipPath: `inset(0 ${(1 - dr) * 100}% 0 0)`}}/>;
    })}
    {BOX.map(([a, b, c, d], i) => <rect key={i} x={R(a + jit(i))} y={R(b + jit(i + 9))} width={R(c - a)} height={R(d - b)} fill="none" stroke="#c5c838" strokeWidth={R(1.1)} opacity={.9}/>)}
    {TG.map(([x, y, s], i) => s ? <g key={i}>
      <rect x={R(x - 3)} y={R(y - 3)} width={R(6)} height={R(6)} fill="none" stroke="#c5c838" strokeWidth={R(.9)}/>
      <text x={R(x + 4)} y={R(y - 5)} fontFamily="'Share Tech Mono', monospace" fontSize={R(6.5)} fill="#fff">{s}</text></g> : null)}
  </svg>;
};

// ---------- particles / fronds ----------
const Dust: React.FC<{t: number; n?: number}> = ({t, n = 160}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
  {Array.from({length: n}, (_, i) => {
    const x = hash(i * 1.7) * 640 + t * (1 + hash(i * 2.3) * 2.5), y = 80 + hash(i * 3.9) * 500 - t * (.5 + hash(i * 4.1) * 1.2);
    return <circle key={i} cx={R(x)} cy={R(y)} r={R(.5 + hash(i * 5.3) * 1.3)} fill={hash(i) > .3 ? '#ffd48a' : '#fff1c9'} opacity={.4 + .6 * hash(i * 6.1 + Math.floor(t / 3))}/>;
  })}
</svg>;
const Fronds: React.FC<{t: number}> = ({t}) => {
  if (t < 0 || t > 6) return null; const e = out(t / 5), fade = 1 - span(t, 3, 6);
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: fade}}>
    {Array.from({length: 120}, (_, i) => {
      const a = hash(i * 2.1) * Math.PI * 2, r0 = 20 + hash(i * 3.7) * 420 * e, cx = 512 + Math.cos(a) * r0 * 1.3, cy = 290 + Math.sin(a) * r0 * .7;
      const len = 14 + hash(i * 4.9) * 30, b = a + (hash(i * 6.3) - .5) * 1.6;
      return <path key={i} d={`M${R(cx)},${R(cy)} q${R(Math.cos(b + .6) * len * .5)},${R(Math.sin(b + .6) * len * .5)} ${R(Math.cos(b) * len)},${R(Math.sin(b) * len)}`}
        stroke={hash(i * 7.7) > .35 ? '#f2c44a' : '#2f5e55'} strokeWidth={R(2 + hash(i) * 3)} fill="none" strokeLinecap="round"/>;
    })}
  </svg>;
};

// ---------- gold light streak (ref 3.1-3.4, 11.47-11.73) ----------
// [x, y, w, h, opacity] in ref px, measured from ref f97 (gold block cluster lower middle)
const STREAK: number[][] = [[240, 268, 330, 30, .9], [610, 276, 300, 26, .85], [250, 300, 290, 18, 1], [600, 304, 340, 22, 1], [300, 330, 260, 10, .8],
  [620, 336, 260, 12, .8], [200, 356, 380, 8, .55], [560, 362, 380, 8, .6], [120, 230, 500, 5, .4], [700, 410, 300, 6, .45]];
const STREAK_K: [number, number][] = [[93, 0], [94, .35], [95, .5], [96, .9], [97, 1], [98, 1], [99, .75], [100, .55], [101, .06], [102, 0]];
const Streak: React.FC<{g: number}> = ({g}) => {
  const t = g - 93, k = pw(STREAK_K, g);
  return <AbsoluteFill style={{background: '#000'}}>
    <HB id="hbs" s={46}/><HB id="hbs2" s={14}/>
    <AbsoluteFill style={{opacity: k}}>
      <Plate src="p11_trumpet.jpg" z={1.25} dx={180 - 70 * t} dy={30} filter="url(#hbs) brightness(.85) contrast(1.6) sepia(.35) saturate(1.3) hue-rotate(8deg)"/>
      <AbsoluteFill style={{opacity: .2, mixBlendMode: 'screen'}}><Plate src="p03_band.jpg" z={1.2} dx={-120 + 60 * t} filter="url(#hbs) brightness(1.2) sepia(.6) hue-rotate(12deg)"/></AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', filter: 'url(#hbs2)'}}>
        <defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stopColor="#ff9a1e" stopOpacity="0"/><stop offset=".12" stopColor="#ffb53a" stopOpacity=".9"/><stop offset=".5" stopColor="#ffd84a"/><stop offset=".88" stopColor="#ffb53a" stopOpacity=".9"/><stop offset="1" stopColor="#ff9a1e" stopOpacity="0"/></linearGradient></defs>
        {STREAK.map(([x, y, w, h, o], i) => {
          const xx = x + 160 - t * (55 + 12 * (i % 3)), yy = y - 40 + (i % 2 ? -1 : 1) * t * 3;
          return <g key={i}>
            <rect x={R(xx)} y={R(yy)} width={R(w * .6)} height={R(h * 1.6)} fill="url(#sg)" opacity={o}/>
            <rect x={R(xx + w * .1)} y={R(yy + h * .6)} width={R(w * .45)} height={R(Math.max(1.5, h * .18))} fill="#fff4b0" opacity={o * .8}/>
          </g>;
        })}
      </svg>
    </AbsoluteFill>
  </AbsoluteFill>;
};

// ---------- texts ----------
const PARA: Line[] = [
  {s: 'Abdulsamad is the ruthless president and commander of the', x: 490, y: 63},
  {s: "IAA's elite agency of agents in Los Santos.", x: 490, y: 86},
  {s: 'Throughout the story we see Abdulsamad openly push his agents to the edge in order to make them bend to his will.', x: 490, y: 109},
  {s: 'He justifies this behavior with his reasoning', x: 490, y: 133},
  {s: 'being that he tries to get his agents to be the best version of themselves', x: 490, y: 157},
  {s: 'and although it works, his methods ended with him frozen in a capsule.', x: 490, y: 180},
];
const P5 = PARA.slice(0, 5).reduce((a, l) => a + l.s.length, 0);
const DRUM: Line[] = [
  {s: 'Snoop Marley is an ambitious young', x: 220, y: 56}, {s: 'IAA agent who dreams of', x: 220, y: 82},
  {s: 'becoming the greatest president', x: 220, y: 108}, {s: 'in the city, just like Abdulsamad', x: 220, y: 134}];
const DRUM_L: [number, number][] = [[153, 0], [154, .6], [155, 1.05], [156, 1.52], [157.5, 2], [158, 2.12], [162, 2.76], [164, 3], [170, 3.51], [176, 3.83], [178, 3.94], [179, 3.97]];
const lineChars = (L: Line[], u: number) => {let c = 0; for (let i = 0; i < L.length; i++) {const fr = clamp(u - i); c += Math.floor(L[i].s.length * fr + 1e-6); if (fr < 1) break;} return c;};
const pw = (tab: [number, number][], g: number) => {if (g <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (g <= tab[i][0]) return mix(tab[i - 1][1], tab[i][1], (g - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])); return tab[tab.length - 1][1];};
const TEMPO: [number, number][] = [[227.5, 0], [228, 1], [230, 2], [232, 3], [235, 6], [237, 7], [240, 8]];
const PARA6: [number, number][] = [[106, .05], [108, .25], [110, .45], [112, .62], [114, .73], [117, .88], [120, .93], [123, .99], [125, 1]];

// ---------- one ref frame g ----------
const Frame: React.FC<{g: number}> = ({g}) => {
  // S1 sax + burn to parchment
  if (g < 27) return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{opacity: span(g, 1, 22)}}><Plate src="p01_sax.jpg" z={1.06 - .02 * g / 27} filter="brightness(1.55)"/></AbsoluteFill>
    {g >= 24.5 ? <Parchment g={g} burn={span(g, 24.5, 30)}/> : null}
  </AbsoluteFill>;
  if (g < 30) return <AbsoluteFill><Plate src="p01_sax.jpg" z={1.04} filter="brightness(1.55)"/><Parchment g={g} burn={span(g, 24.5, 30)}/></AbsoluteFill>;
  if (g < 60) return <Parchment g={g} burn={1}/>;
  if (g < 62) return <AbsoluteFill style={{background: '#000'}}><Plate src="p03_band.jpg" filter="brightness(.35)"/><Glitch g={g} seed={1} a="p03_band.jpg" n={26}/></AbsoluteFill>;
  // band, hand whip at 75, glitch 78
  if (g < 80) {
    const t = g - 62, wh = span(g, 73.5, 76.5);
    return <AbsoluteFill style={{background: '#000'}}>
      <Plate src="p03_band.jpg" z={1.03 + .012 * t} dx={-.4 * t}/>
      {wh > 0 && wh < 1 ? <AbsoluteFill style={{background: `radial-gradient(ellipse ${R(260)}px ${R(330)}px at ${R(mix(1150, -150, wh))}px ${R(360)}px, rgba(8,4,0,.96), rgba(8,4,0,.85) 45%, rgba(0,0,0,0) 72%)`, filter: `blur(${R(14)}px)`}}/> : null}
      {g >= 78 ? <Glitch g={g} seed={2} a="p03_band.jpg" b="p04_drums_top.jpg"/> : null}
    </AbsoluteFill>;
  }
  if (g < 93) return <AbsoluteFill style={{background: '#000'}}><Plate src="p04_drums_top.jpg" z={1.02 + .004 * (g - 80)} ax={500} ay={300}/></AbsoluteFill>;
  if (g < 102) return <Streak g={g}/>;
  // conductor's arm + paragraph + HUD
  if (g < 126) {
    const t = g - 102, wb = pw([[102, 48], [103, 30], [104, 14], [105, 6], [106, 2], [107, 0]], g);
    const chars = g < 106 ? P5 : P5 + Math.floor(PARA[5].s.length * pw(PARA6, g));
    return <AbsoluteFill style={{background: '#000'}}>
      <HB id="hbw" s={wb}/>
      <AbsoluteFill style={{filter: wb > 0 ? 'url(#hbw)' : undefined}}>
        <Plate src="p06_arm.jpg" z={1.03 + .003 * t} dx={.5 * t + pw([[102, -90], [103, -45], [104, -15], [105, -5], [106, 0]], g)}/>
        <Typed lines={PARA} chars={chars} size={17.5} dx={pw([[102, -150], [103, -60], [104, -15], [105, -4], [106, 0]], g)}/>
      </AbsoluteFill>
      <Hud g={g}/>
    </AbsoluteFill>;
  }
  if (g < 141) {
    const t = g - 126, wv = 1 - span(g, 126, 132);
    return <AbsoluteFill style={{background: '#000'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><filter id="wavy"><feTurbulence type="fractalNoise" baseFrequency=".001 .02" numOctaves={2} seed={g}/><feDisplacementMap in="SourceGraphic" scale={R(70 * wv)}/></filter></svg>
      <AbsoluteFill style={{filter: wv > 0 ? 'url(#wavy)' : undefined, opacity: mix(1, .5, wv * wv)}}><Plate src="p07_keys.jpg" z={1.03 + .004 * t}/></AbsoluteFill>
    </AbsoluteFill>;
  }
  if (g < 152) return <AbsoluteFill style={{background: '#000'}}>
    <Plate src="p09a_cymbal.jpg" z={1.05 + .006 * (g - 141)} dx={-.6 * (g - 141)}/>
    {g >= 151 ? <Glitch g={g} seed={3} a="p09a_cymbal.jpg" b="p09b_snoop_profile.jpg" n={14}/> : null}
  </AbsoluteFill>;
  // Snoop profile + typed text + waveform
  if (g < 185) {
    const t = g - 152;
    return <AbsoluteFill style={{background: '#000'}}>
      <Plate src="p09b_snoop_profile.jpg" z={1.02 + .0025 * t} dx={-.25 * t}/>
      <Dust t={t}/>
      {g >= 153 && g < 180 ? <Typed lines={DRUM} chars={lineChars(DRUM, pw(DRUM_L, g))} size={20}/> : null}
      <Wave f={g} x0={81} x1={367} y={288} h={72} k={span(g, 152.5, 153.5)} reveal={out(span(g, 152.5, 155))} p={8.5}/>
      {g < 153 ? <>
        <div style={{position: 'absolute', left: R(75), top: R(32), width: R(292), height: R(134), background: '#f6f3ee', boxShadow: `0 0 ${R(6)}px #fff`}}/>
        <div style={{position: 'absolute', left: R(32), top: R(213), width: R(363), height: R(145), background: '#ffe81a', boxShadow: `0 0 ${R(8)}px #ffd000`}}/>
      </> : null}
      {g >= 180 && g < 181 ? <div style={{position: 'absolute', left: R(67), top: R(24), width: R(300), height: R(147), background: '#f4f2ee', boxShadow: `0 0 ${R(8)}px #fff`}}/> : null}
      {g >= 184 ? <Glitch g={g} seed={4} a="p09b_snoop_profile.jpg" b="p10_staff.jpg" full n={22}/> : null}
    </AbsoluteFill>;
  }
  if (g < 200) return <AbsoluteFill style={{background: '#000'}}><Plate src="p10_staff.jpg" z={1.12} dx={30 - 4 * (g - 185)} filter="blur(1px)"/></AbsoluteFill>;
  if (g < 218) return <AbsoluteFill style={{background: '#000'}}><Plate src="p11_trumpet.jpg" z={1.1} dx={20 - 2.4 * (g - 200)}/>{g >= 216 ? <Glitch g={g} seed={9} a="p11_trumpet.jpg" full n={20}/> : null}</AbsoluteFill>;
  // eyes split + "MY TEMPO"
  if (g < 249) {
    const t = g - 218, sp = 1;
    const word = 'MY TEMPO'.slice(0, Math.round(pw(TEMPO, g)));
    return <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{clipPath: `inset(${R(35)}px 0 ${H - R(288)}px 0)`}}><Plate src="p12a_abdul_eyes.jpg" z={1.02 + .002 * t} dy={-60}/></AbsoluteFill>
      {g >= 226 ? <AbsoluteFill style={{clipPath: `inset(${R(288)}px 0 ${H - R(540)}px 0)`}}>
        <Plate src="p12b_snoop_eyes.jpg" z={1.02 + .002 * t} dy={110}/>
        {g < 227 ? <Glitch g={g} seed={5} a="p12b_snoop_eyes.jpg" full n={24}/> : null}
      </AbsoluteFill> : null}
      {g < 219 ? <AbsoluteFill style={{clipPath: `inset(${R(35)}px ${W - R(420)}px ${H - R(288)}px 0)`}}><Glitch g={g} seed={10} a="p12a_abdul_eyes.jpg" n={8}/></AbsoluteFill> : null}
      {g >= 228 && g < 229 ? <>
        <div style={{position: 'absolute', left: R(85), top: R(241), width: R(96), height: R(100), background: '#050302'}}/>
        <div style={{position: 'absolute', left: R(849), top: R(241), width: R(85), height: R(100), background: '#050302'}}/>
      </> : null}
      {g >= 229 ? <>
        <div style={{position: 'absolute', left: R(118), top: R(262), fontFamily: "'DejaVu Sans'", fontSize: R(46), color: '#000', opacity: sp}}>♪</div>
        <div style={{position: 'absolute', left: R(856), top: R(262), fontFamily: "'DejaVu Sans'", fontSize: R(46), color: '#000', opacity: sp}}>♪</div>
        <div style={{position: 'absolute', left: R(61), top: R(361), width: R(3), height: R(4), borderRadius: R(2), background: '#fff'}}/>
        <div style={{position: 'absolute', left: R(963), top: R(374), width: R(3), height: R(4), borderRadius: R(2), background: '#fff'}}/>
      </> : null}
      <Wave f={g} x0={384} x1={661} y={288} h={54} k={g >= 226 ? 1 : 0} p={8.5}/>
      {word ? <div style={{position: 'absolute', left: R(462), top: R(270), fontFamily: SERIF, fontSize: R(26), color: '#fff', whiteSpace: 'pre', transform: 'scaleX(.62)', transformOrigin: 'left', textShadow: `0 0 ${R(4)}px rgba(255,210,60,.9)`}}>{word}</div> : null}
      {g >= 246 ? <>
        <AbsoluteFill style={{clipPath: `inset(${R(262)}px ${W - R(560)}px ${H - R(312)}px ${R(380)}px)`, background: 'repeating-linear-gradient(90deg,#fff 0 3px,#ffe9a0 3px 5px,#fff 5px 9px)', filter: `blur(${R(1)}px)`}}/>
        <Glitch g={g} seed={6} a="p12b_snoop_eyes.jpg" b="p12a_abdul_eyes.jpg" n={12}/>
      </> : null}
    </AbsoluteFill>;
  }
  if (g < 267) {
    const t = g - 249;
    return <AbsoluteFill style={{background: '#000'}}>
      <Plate src="p13_drummer_back.jpg" z={1.04 + .003 * t} filter={t < 4 ? `hue-rotate(${-25 * (1 - t / 4)}deg)` : undefined}/>
      <Fronds t={t}/>
    </AbsoluteFill>;
  }
  if (g < 279) {
    const t = g - 267;
    return <AbsoluteFill style={{background: '#000'}}>
      <Plate src="p14_capsule_ghost.jpg" z={1.03 + .003 * t} filter="grayscale(.9) brightness(1.6) contrast(1.3) sepia(.1) hue-rotate(170deg) saturate(.6)"/>
      <AbsoluteFill style={{opacity: .18, mixBlendMode: 'screen'}}><Plate src="p14_capsule_ghost.jpg" z={1.08} dx={-26 + 1.5 * t} filter="grayscale(1) contrast(1.6) blur(3px)"/></AbsoluteFill>
      {[[80, 1.3], [187, 1], [284, 1.4], [773, 1], [868, 1.3]].map(([x, s], i) => <div key={i} style={{position: 'absolute', left: R(x - 4 * s), top: R(405), width: R(8 * s), height: R(11 * s), borderRadius: '50%', background: '#fff', filter: `blur(${R(1.6)}px)`, opacity: .85}}/>)}
      <Wave f={g} x0={352} x1={672} y={490} h={17} color="#ffffff" p={3.5}/>
    </AbsoluteFill>;
  }
  if (g < 281) return <AbsoluteFill style={{background: '#fffdf6'}}/>;
  if (g < 312) {
    const t = g - 281;
    return <AbsoluteFill style={{background: '#000'}}>
      <Plate src="p16_hand_cue.jpg" z={1.02 + .0015 * t} filter={t < 2 ? `brightness(${1.8 - .4 * t})` : undefined}/>
      <Wave f={g} x0={352} x1={672} y={490} h={22} p={4.5}/>
      {g >= 311 ? <Glitch g={g} seed={11} a="p16_hand_cue.jpg" full n={22}/> : null}
    </AbsoluteFill>;
  }
  return null;
};

// end card flicker (measured per frame: text on 561-562, 565-566, 570-623, 627-628, 631-632)
const CARD_ON = (f: number) => (f >= 561 && f <= 562) || (f >= 565 && f <= 566) || (f >= 570 && f <= 623) || (f >= 627 && f <= 628) || (f >= 631 && f <= 632);

export const Whiplash05: React.FC = () => {
  const f = useCurrentFrame();
  const end = f >= 563;                     // ref: f312-562 repeats g61-311, black/card from 563
  const g = f >= 312 && f < 563 ? f - 251 : f;
  const ghost = !end && g >= 267 && g < 281;
  const br = g < 27 ? 1 : g < 60 ? .9 : g < 80 ? 1.45 : g < 93 ? 1.2 : g < 126 ? 1.1 : g < 141 ? 1.2 : g < 152 ? 1.1 : g < 185 ? 1.18 : g < 200 ? .96 : g < 218 ? .95 : g < 249 ? 1 : g < 267 ? 1.3 : g < 281 ? 1 : 1.25;
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    {end ? null : <AbsoluteFill style={{filter: ghost ? undefined : `brightness(${br}) contrast(1.06) saturate(1.08)`}}><Frame g={g}/></AbsoluteFill>}
    {/* vignette + grain */}
    {end ? null : <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}}/>}
    <AbsoluteFill style={{opacity: end ? .03 : .07, mixBlendMode: 'overlay'}}>
      <svg width={W} height={H}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 23}/></filter><rect width={W} height={H} filter="url(#grain)"/></svg>
    </AbsoluteFill>
    {/* the ref's corner watermark slot, now the TOWN credit */}
    {!end ? <div style={{position: 'absolute', left: 0, right: 0, top: R(545), textAlign: 'center', fontFamily: SERIF, fontSize: R(10.5), letterSpacing: R(.3), color: g < 60 ? 'rgba(230,170,70,.55)' : 'rgba(230,170,70,.22)'}}>© 2026  TOWN  COPYRIGHT RESERVED</div> : null}
    {CARD_ON(f) ? <div style={{position: 'absolute', left: 0, right: 0, top: R(281), textAlign: 'center', fontFamily: SERIF, fontSize: R(12.5), letterSpacing: R(.4), color: '#f4f4f4'}}>© 2026  TOWN  COPYRIGHT RESERVED</div> : null}
    <Audio src={C('ref05.wav')}/>
  </AbsoluteFill>;
};
