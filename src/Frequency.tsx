// Edit 04 — "88.88 / نفس التردد": firas palindrome (Snoop ↔ Abu Fahda). Nolan grammar: Tenet inversion, Prestige mirror, IMAX band-open.
// PILOT timeline: A raw Snoop → F flash → B gloved palm → H strobe → X mirror (IMAX, 88.88 written, push-through + flip) → H' → B' bare palm → F' → A' raw Abu → loop.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const F = (f: string) => staticFile(`f04/${f}`);
const W = 1080, H = 1920, BAND = Math.round(W / 2.39), BT = (H - BAND) / 2; // scope band 1080x452
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const io = (x: number) => {x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const out = (x: number) => 1 - Math.pow(1 - clamp(x), 4);
const inn = (x: number) => Math.pow(clamp(x), 3);
const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const n1 = (t: number, s = 1) => Math.sin(t * 37.1 * s + 1.3) * .5 + Math.sin(t * 91.7 * s + 4.1) * .3 + Math.sin(t * 13.3 * s) * .2;

// ---------- timeline (s) ----------
export const P = {
  A: [0, 1.6], F: [1.6, 1.73], B: [1.73, 2.6], H: [2.6, 3.0], X: [3.0, 6.0], H2: [6.0, 6.4], B2: [6.4, 7.27], F2: [7.27, 7.4], A2: [7.4, 9.0],
  dur: 9.0, mid: 4.5,
} as const;
// mirror centre (normalised) — measured on the Sol plates
const MIR = {x: .5, y: .44}; // push-through target = the reflection's face
const WR = {x: .5, y: .575}; // 88.88 written on the fog below the face
// palm landing point in the hand plates (normalised, plate space)
const PALM = {x: .575, y: .42}, PALM2 = {x: .45, y: .42};

// ---------- spark path ----------
type Pt = [number, number, number]; // t, x, y (px)
function cr(p: Pt[], t: number, ease = false): [number, number] {
  if (t <= p[0][0]) return [p[0][1], p[0][2]];
  if (t >= p[p.length - 1][0]) return [p[p.length - 1][1], p[p.length - 1][2]];
  let i = 1; while (p[i][0] < t) i++;
  const p0 = p[Math.max(0, i - 2)], p1 = p[i - 1], p2 = p[i], p3 = p[Math.min(p.length - 1, i + 1)];
  const l = (t - p1[0]) / (p2[0] - p1[0]), u = ease ? io(l) * .55 + l * .45 : l;
  const c = (a: number, b: number, c_: number, d: number) => .5 * (2 * b + (-a + c_) * u + (2 * a - 5 * b + 4 * c_ - d) * u * u + (-a + 3 * b - 3 * c_ + d) * u * u * u);
  return [c(p0[1], p1[1], p2[1], p3[1]), c(p0[2], p1[2], p2[2], p3[2])];
}
const spiral = (t0: number, t1: number, cx: number, cy: number, r0: number, turns: number, ph = 0): Pt[] =>
  Array.from({length: 33}, (_, i) => {const u = i / 32, a = ph + u * turns * Math.PI * 2, r = r0 * (1 - u) ** 1.3; return [mix(t0, t1, u), cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8] as Pt;});

// Path for the whole pilot. Second half = the first half's paths mirrored in x and time (inversion).
const PATH_A: Pt[] = [[0.1, -60, BT - 40], [0.45, 260, BT + 120], [0.85, 520, BT + 250], [1.1, 560, BT + 230], ...spiral(1.2, 1.6, W / 2, H / 2, 300, 1.6, Math.PI)];
function pathB(t: number, inv: boolean): [number, number] {
  const pp = inv ? PALM2 : PALM, px = pp.x * W, py = pp.y * H; // plate zooms about the palm, so the palm is fixed
  const pts: Pt[] = [[P.B[0], W / 2, BT - 30], [P.B[0] + .14, mix(W / 2, px, .5) - 40, py - 160], [P.B[0] + .3, px, py - 6], [P.B[1], px, py - 10]];
  return cr(pts, t, true);
}

// ---------- the spark: lit, bloomed, trailed, casts light ----------
const Spark: React.FC<{x: number; y: number; trail: [number, number][]; e: number; hue: 'cold' | 'warm'; t: number}> = ({x, y, trail, e, hue, t}) => {
  if (e <= .001) return null;
  const flick = 1 + .08 * n1(t, 2.3);
  const col = hue === 'cold' ? '150,200,255' : '255,190,120';
  const s = e * flick;
  const d = trail.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
  return <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
    {/* light spill onto the plate */}
    <div style={{position: 'absolute', left: x - 520, top: y - 520, width: 1040, height: 1040, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(${col},${.22 * s}) 0%, rgba(${col},${.08 * s}) 30%, rgba(${col},0) 65%)`}}/>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs><filter id="sblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="sblur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
      {trail.length > 1 ? <>
        <path d={d} stroke={`rgba(${col},${.55 * s})`} strokeWidth={22} fill="none" strokeLinecap="round" filter="url(#sblur)"/>
        <path d={d} stroke={`rgba(255,255,255,${.85 * s})`} strokeWidth={3.2} fill="none" strokeLinecap="round" filter="url(#sblur2)"/>
      </> : null}
    </svg>
    {/* anamorphic streak */}
    <div style={{position: 'absolute', left: x - 260 * s, top: y - 3, width: 520 * s, height: 6, borderRadius: 6,
      background: `linear-gradient(90deg, transparent, rgba(${col},${.55 * s}), rgba(255,255,255,${.8 * s}), rgba(${col},${.55 * s}), transparent)`, filter: 'blur(1.5px)'}}/>
    {[110, 46, 18].map((r, i) => <div key={i} style={{position: 'absolute', left: x - r * s, top: y - r * s, width: 2 * r * s, height: 2 * r * s, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(${i === 2 ? '255,255,255' : col},${[.35, .6, 1][i] * Math.min(1, s)}) 0%, rgba(${col},0) 70%)`}}/>)}
    <div style={{position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: `0 0 12px 4px rgba(255,255,255,${s})`}}/>
  </AbsoluteFill>;
};
function trailOf(fn: (t: number) => [number, number], t: number, lo: number, hi: number, ahead: boolean, len = .22, n = 40): [number, number][] {
  const r: [number, number][] = [];
  for (let i = 0; i <= n; i++) {const tt = ahead ? t + len * i / n : t - len * i / n; if (tt < lo || tt > hi) break; r.push(fn(tt));}
  return r;
}

// ---------- 88.88 handwriting (one continuous stroke per 8, a tap for the dot) ----------
function eightPts(cx: number, cy: number, w: number, h: number, seed: number): [number, number][] {
  const p: [number, number][] = [];
  for (let i = 0; i <= 90; i++) {
    const a = -.15 + (i / 90) * (Math.PI * 2 + .3);
    let x = w / 2 * Math.sin(2 * a) * .95, y = -h / 2 * Math.cos(a);
    if (y < 0) {x *= .82; y *= .9;}
    x += 4 * Math.sin(i * .21 + seed) + y * .12; // slant + hand wobble
    p.push([cx + x, cy + y]);
  }
  return p;
}
type Glyph = {pts: [number, number][]; t0: number; t1: number};
function glyphs(cx: number, cy: number, sc: number, t0: number): Glyph[] {
  const w = 120 * sc, h = 190 * sc, g = 150 * sc, dur = .16, gap = .035;
  const xs = [-2.1 * g + 20 * sc, -1.1 * g + 20 * sc, 1.1 * g - 20 * sc, 2.1 * g - 20 * sc].map(v => cx + v * .9);
  const out_: Glyph[] = []; let t = t0;
  xs.forEach((x, i) => {
    out_.push({pts: eightPts(x, cy, w, h, i * 1.7), t0: t, t1: t + dur}); t += dur + gap;
    if (i === 1) { // the dot
      const dx = cx, dy = cy + h / 2 - 8 * sc;
      out_.push({pts: Array.from({length: 10}, (_, k) => [dx + 9 * sc * Math.cos(k), dy + 9 * sc * Math.sin(k)] as [number, number]), t0: t, t1: t + .06}); t += .06 + gap;
    }
  });
  return out_;
}
function penAt(gs: Glyph[], t: number): [number, number] | null {
  for (const g of gs) if (t >= g.t0 - .05 && t <= g.t1) {const u = clamp((t - g.t0) / (g.t1 - g.t0)); return g.pts[Math.min(g.pts.length - 1, Math.floor(u * (g.pts.length - 1)))];}
  return null;
}
const Writing: React.FC<{gs: Glyph[]; t: number; glow: number; flipX?: boolean; hue: 'cold' | 'warm'}> = ({gs, t, glow, flipX, hue}) => {
  const col = hue === 'cold' ? '170,215,255' : '255,200,140';
  const paths = gs.map(g => {const u = clamp((t - g.t0) / (g.t1 - g.t0)); if (u <= 0) return null; const n = Math.max(2, Math.floor(u * g.pts.length));
    return g.pts.slice(0, n).map(([a, b], k) => `${k ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ');});
  const tf = flipX ? 'scaleX(-1)' : undefined;
  return <>
  {/* the finger wipes the fog: darker, clearer glass behind the stroke */}
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: tf, mixBlendMode: 'multiply'}}>
    <defs><filter id="wfog"><feGaussianBlur stdDeviation="7"/></filter></defs>
    {paths.map((d, i) => d ? <path key={i} d={d} stroke="rgba(40,40,40,.55)" strokeWidth={34} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#wfog)"/> : null)}
  </svg>
  {/* faint second reflection off the back of thick glass */}
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: `${tf ?? ''} translate(9px, 4px)`, mixBlendMode: 'screen', opacity: .25 * glow}}>
    {paths.map((d, i) => d ? <path key={i} d={d} stroke={`rgb(${col})`} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"/> : null)}
  </svg>
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, transform: tf, mixBlendMode: 'screen'}}>
    <defs><filter id="wglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
      <filter id="wcore" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
    {gs.map((g, i) => {
      const u = clamp((t - g.t0) / (g.t1 - g.t0)); if (u <= 0) return null;
      const n = Math.max(2, Math.floor(u * g.pts.length));
      const d = g.pts.slice(0, n).map(([a, b], k) => `${k ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
      const hot = clamp(1 - (t - g.t1) / .6) * .7 + .3; // fresh stroke is hotter
      return <g key={i}>
        <path d={d} stroke={`rgba(${col},${.5 * glow * hot})`} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#wglow)"/>
        <path d={d} stroke={`rgba(255,250,240,${.95 * glow})`} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#wcore)"/>
      </g>;
    })}
  </svg></>;
};

// ---------- plates ----------
const Plate: React.FC<{src: string; z?: number; ox?: number; oy?: number; flip?: boolean; f?: string}> = ({src, z = 1, ox = .5, oy = .5, flip, f}) =>
  <AbsoluteFill style={{transformOrigin: `${ox * 100}% ${oy * 100}%`, transform: `scale(${z})${flip ? ' scaleX(-1)' : ''}`, filter: f}}>
    <Img src={src} style={{width: W, height: H, objectFit: 'cover'}}/>
  </AbsoluteFill>;
/** Raw 16:9 Kick clip in the band. (sx, sy) = source px placed at band top-left-centre; s = scale. */
const Raw: React.FC<{src: string; from: number; sx: number; sy: number; s: number; f?: string; rate?: number}> = ({src, from, sx, sy, s, f, rate = 1}) =>
  <div style={{position: 'absolute', left: W / 2 - sx * s, top: BT - sy * s, width: 1920 * s, height: 1080 * s, filter: f}}>
    <OffthreadVideo src={src} startFrom={Math.round(from * 30)} playbackRate={rate} muted style={{width: '100%', height: '100%'}}/>
  </div>;
const RAWC = 'saturate(.55) contrast(1.18) brightness(.72) hue-rotate(-8deg)';
const RAWW = 'saturate(.7) contrast(1.2) brightness(.62) sepia(.35)';
const COLD = 'saturate(.62) contrast(1.12) brightness(.92) hue-rotate(-6deg)';
const WARM = 'saturate(.8) contrast(1.1) brightness(.95) sepia(.28)';
const Tint: React.FC<{c: string; o: number; m?: React.CSSProperties['mixBlendMode']}> = ({c, o, m = 'soft-light'}) => <AbsoluteFill style={{background: c, opacity: o, mixBlendMode: m}}/>;

export const Frequency: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const inS = (s: readonly [number, number]) => t >= s[0] && t < s[1];
  const layers: React.ReactNode[] = [];
  let spark: React.ReactNode = null;
  let band = 1; // 1 = scope band, 0 = full IMAX
  let flash = 0, black = 0, glassK = 0;

  // ---- A: raw Snoop, spark drops in, crush to black, spiral ----
  if (inS(P.A)) {
    const crush = span(t, 1.12, 1.4);
    layers.push(<Raw key="a" src={F('snoop.mp4')} from={0.3} sx={880} sy={470} s={.99} f={`${RAWC} brightness(${mix(1, .0, inn(crush))}) contrast(${1 + 1.6 * crush})`}/>);
    layers.push(<Tint key="at" c="#163a66" o={.35}/>);
    const lift = Math.exp(-Math.pow((t - .85) / .12, 2)); // exposure bloom when it lands
    if (lift > .01) layers.push(<AbsoluteFill key="al" style={{background: `radial-gradient(circle at 52% 52%, rgba(190,220,255,${.35 * lift}), transparent 60%)`, mixBlendMode: 'screen'}}/>);
    const fn = (tt: number) => cr(PATH_A, tt);
    const [x, y] = fn(t);
    spark = <Spark x={x} y={y} trail={trailOf(fn, t, .1, 1.6, false)} e={span(t, .1, .3) * (1 - .55 * span(t, 1.3, 1.6))} hue="cold" t={t}/>;
  }
  // ---- F: white double flash (reality break) ----
  if (inS(P.F)) {const f = Math.floor((t - P.F[0]) * fps); flash = [1, .15, .95, .4][f] ?? 0;}
  // ---- B: gloved palm, spark lands ----
  if (inS(P.B)) {
    const u = span(t, P.B[0], P.B[1]), z = 1 + .18 * out(u);
    const land = Math.exp(-Math.pow((t - (P.B[0] + .3)) / .08, 2));
    layers.push(<Plate key="b" src={F('b_snoop_hand.png')} z={z} ox={PALM.x} oy={PALM.y} f={`${COLD} brightness(${1 + .5 * land})`}/>);
    layers.push(<Tint key="bt" c="#1b3d66" o={.45}/>);
    const fn = (tt: number) => pathB(tt, false); const [x, y] = fn(t);
    spark = <Spark x={x} y={y} trail={trailOf(fn, t, P.B[0], P.B[1], false)} e={.8 + .5 * land} hue="cold" t={t}/>;
  }
  // ---- H / H2: black strobe (accelerating in, decelerating out) ----
  const strobe = (s: readonly [number, number], accel: boolean) => {
    const u = span(t, s[0], s[1]), k = accel ? u * u : 1 - (1 - u) * (1 - u);
    return Math.floor(k * 9) % 2 === 0;
  };
  if (inS(P.H)) {
    if (strobe(P.H, true)) layers.push(<Plate key="h" src={F('x1_mirror_snoop.png')} z={1.25} f={`${COLD} brightness(.7)`}/>); else black = 1;
    spark = <Spark x={W / 2} y={H / 2} trail={[]} e={.7} hue="cold" t={t}/>;
  }
  if (inS(P.H2)) {
    if (strobe(P.H2, false)) layers.push(<Plate key="h2" src={F('b_abu_hand.png')} z={1.15} f={`${WARM} brightness(.7)`}/>); else black = 1;
    spark = <Spark x={W / 2} y={H / 2} trail={[]} e={.7} hue="warm" t={t}/>;
  }
  // ---- X: the turnstile (palindromic about P.mid: write → push in → FLIP → pull out → un-write) ----
  if (inS(P.X)) {
    const x0 = P.X[0], mid = P.mid, side2 = t >= mid;
    const rt = side2 ? 2 * mid - t : t; // mirrored time
    const bu = span(rt, x0, x0 + .2); band = bu >= 1 ? 0 : 1 - out(bu) * (1 + .06 * Math.sin(bu * Math.PI)); band = clamp(band);
    const mx = WR.x * W, my = WR.y * H;
    const gs = glyphs(mx, my, .62, x0 + .25);
    const writeEnd = gs[gs.length - 1].t1;
    const push = inn(span(rt, writeEnd + .03, mid)); const z = 1 + .1 * io(span(rt, x0, writeEnd)) + 3.2 * push;
    const near = clamp(1 - Math.abs(t - mid) / .12); // glass pass (both sides of the flip)
    const egg = Math.abs(t - mid) < 1.01 / 30; // the 2 frames that straddle the flip: both reflections at once
    const hue = side2 ? 'warm' : 'cold';
    layers.push(<AbsoluteFill key={side2 ? 'x2' : 'x1'} style={{transformOrigin: `${MIR.x * 100}% ${MIR.y * 100}%`, transform: `scale(${z})`, filter: `blur(${push * 7}px)${near > 0 ? ' url(#glass)' : ''}`}}>
      <Plate src={F(side2 ? 'x2_mirror_abu.png' : 'x1_mirror_snoop.png')} f={side2 ? WARM : COLD}/>
      <Tint c={side2 ? '#7a3e10' : '#16345a'} o={side2 ? .35 : .4}/>
      {egg ? <AbsoluteFill style={{opacity: .5}}><Plate src={F(side2 ? 'x1_mirror_snoop.png' : 'x2_mirror_abu.png')} f={side2 ? COLD : WARM}/></AbsoluteFill> : null}
      <Writing gs={gs} t={rt} glow={1} flipX={side2} hue={hue}/>
    </AbsoluteFill>);
    glassK = near;
    const sx = (x: number) => side2 ? W - x : x;
    const pen = penAt(gs, rt);
    if (pen) spark = <Spark x={sx(pen[0])} y={pen[1]} trail={[]} e={1} hue={hue} t={t}/>;
    else if (rt < gs[0].t0) {
      const fn = (tt: number) => {const [x, y] = cr([[x0, -40, my - 60], [x0 + .12, .2 * W, my - 30], [gs[0].t0, gs[0].pts[0][0], gs[0].pts[0][1]]], tt, true); return [sx(x), y] as [number, number];};
      const [x, y] = fn(rt); spark = <Spark x={x} y={y} trail={trailOf(fn, rt, x0, gs[0].t0, false)} e={1} hue={hue} t={t}/>;
    }
    flash = Math.max(flash, (egg ? .3 : .85) * inn(span(rt, mid - .12, mid)));
  }
  // ---- B2: bare palm, spark lifts OFF (inverse of B: trail ahead of the spark) ----
  if (inS(P.B2)) {
    const rt = P.B[0] + (P.B2[1] - t); // time-reversed B
    const u = span(t, P.B2[0], P.B2[1]), z = 1 + .18 * out(1 - u);
    const land = Math.exp(-Math.pow((rt - (P.B[0] + .3)) / .08, 2));
    layers.push(<Plate key="b2" src={F('b_abu_hand.png')} z={z} ox={PALM2.x} oy={PALM2.y} f={`${WARM} brightness(${1 + .5 * land})`}/>);
    layers.push(<Tint key="b2t" c="#7a3e10" o={.38}/>);
    const fn = (tt: number) => {const [x, y] = pathB(tt, true); return [x, y] as [number, number];};
    spark = <Spark x={fn(rt)[0]} y={fn(rt)[1]} trail={trailOf(fn, rt, P.B[0], P.B[1], false)} e={.8 + .5 * land} hue="warm" t={t}/>;
  }
  if (inS(P.F2)) {
    const f = Math.floor((t - P.F2[0]) * fps); flash = [.4, .95, 0, 1][f] ?? 0;
    if (f === 2) layers.push(<AbsoluteFill key="sel"><Img src={F('sel.jpg')} style={{position: 'absolute', left: (W - 1700) / 2, top: BT - 20, width: 1700, height: 956 * 1, objectFit: 'cover', filter: 'contrast(1.2) saturate(.6)'}}/></AbsoluteFill>);
  }
  // ---- A2: raw Abu, the spark spirals OUT of the black, frame un-crushes, spark exits top-left (= frame 0) ----
  if (inS(P.A2)) {
    const rt = P.A[0] + (P.A2[1] - t); // time-reversed A
    const crush = span(rt, 1.12, 1.4);
    layers.push(<Raw key="a2" src={F('abu.mp4')} from={5.0} sx={800} sy={420} s={.85} f={`${RAWW} brightness(${mix(1, 0, inn(crush))}) contrast(${1 + 1.6 * crush})`}/>);
    layers.push(<Tint key="a2t" c="#7a3e10" o={.38}/>);
    layers.push(<AbsoluteFill key="a2s" style={{background: 'linear-gradient(180deg, rgba(0,0,0,.6) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(0,0,0,.35) 100%)', top: BT, height: BAND}}/>);
    const fn = (tt: number) => cr(PATH_A, tt);
    const [x, y] = fn(rt);
    spark = <Spark x={x} y={y} trail={trailOf(fn, rt, .1, 1.6, false)} e={span(rt, .1, .3) * (1 - .55 * span(rt, 1.3, 1.6))} hue="warm" t={t}/>;
  }

  const bh = BT * band;
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <svg width="0" height="0" style={{position: 'absolute'}}><defs>
      <filter id="glass" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.003 0.05" numOctaves={2} seed={7} result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale={90 * glassK} xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx={18 * glassK} result="ro"/>
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx={-18 * glassK} result="bo"/>
        <feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/>
      </filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={frame % 29}/><feColorMatrix type="saturate" values="0"/></filter>
    </defs></svg>
    <AbsoluteFill style={{transform: `translate(${(n1(t, .7) * .6).toFixed(2)}px, ${(n1(t + 3, .6) * .8).toFixed(2)}px)`}}>{layers}</AbsoluteFill>
    {spark}
    {/* halation-ish vignette + grain */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,.55) 100%)'}}/>
    <AbsoluteFill style={{filter: 'url(#grain)', opacity: .09, mixBlendMode: 'overlay'}}/>
    {black ? <AbsoluteFill style={{background: '#000'}}/> : null}
    {black ? spark : null}
    {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}}/> : null}
    {/* scope band bars (IMAX opens when band→0) */}
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: bh, background: '#000'}}/>
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: bh, background: '#000'}}/>
    <Sequence from={0}><Audio src={F('pilot_mix.wav')}/></Sequence>
  </AbsoluteFill>;
};
