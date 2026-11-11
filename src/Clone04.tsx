// Edit 04 — 1:1 clone of ref04 (BR2049 "light thread", IASARUU) with firas as Snoop. Ref = 918x576 @ 23.976 fps; we render 1920x1204.
// Every number below is in REF pixels / REF frames (measured from ref/ref04.mp4), scaled by S at draw time.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 24000 / 1001, DUR_F = 289;
const C = (f: string) => staticFile(`c04/${f}`);
const RW = 918, RH = 576, S = 1920 / RW, W = 1920, H = 1204;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
const io = (x: number) => {x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const out = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const inn = (x: number) => Math.pow(clamp(x), 2.2);
const hash = (i: number) => {const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};

// ---- plate anchors (REF px, in the plate's own framing; set from the Sol plates) ----
export const A = {
  palm: {x: 289, y: 412},     // s01: where the spark rests in the palm
  eye: {x: 459, y: 286},      // s03: pupil
  window: {x: 492, y: 275},   // s04: spark position (ref f66)
};

// ---- spark path ----
type Pt = [number, number, number]; // frame, x, y (REF px)
function cr(p: Pt[], f: number): [number, number] {
  if (f <= p[0][0]) return [p[0][1], p[0][2]];
  if (f >= p[p.length - 1][0]) return [p[p.length - 1][1], p[p.length - 1][2]];
  let i = 1; while (p[i][0] < f) i++;
  const p0 = p[Math.max(0, i - 2)], p1 = p[i - 1], p2 = p[i], p3 = p[Math.min(p.length - 1, i + 1)];
  const u = (f - p1[0]) / (p2[0] - p1[0]);
  const c = (a: number, b: number, c_: number, d: number) => .5 * (2 * b + (-a + c_) * u + (2 * a - 5 * b + 4 * c_ - d) * u * u + (-a + 3 * b - 3 * c_ + d) * u * u * u);
  return [c(p0[1], p1[1], p2[1], p3[1]), c(p0[2], p1[2], p2[2], p3[2])];
}
// ONE spark path, screen REF px, head position per frame (measured from ref frames 6,12,20,33-47; trail = 1 frame of motion blur)
const P: Pt[] = [[3, 274, -30], [6, 280, 16], [9, 290, 175], [12, 296, 327], [14, 293, 385], [16, 290, 408], [18, 289, 412], [30, 289, 413],
  [31, 318, 452], [32, 398, 494], [33, 480, 495], [34, 570, 482], [35, 700, 455], [36, 845, 370], [37, 852, 159], [38, 525, 48], [39, 192, 60],
  [40, 5, 138], [41, 111, 303], [42, 243, 339], [43, 345, 333], [44, 411, 312], [45, 459, 282], [46, 482, 259], [47, 504, 237]];
const Glow: React.FC<{x: number; y: number; e: number; trail?: [number, number][]; tw?: number; halo?: number}> = ({x, y, e, trail, tw = 1, halo = 1}) => {
  if (e <= .001) return null;
  const X = x * S, Y = y * S;
  const d = trail && trail.length > 1 ? trail.map(([a, b], i) => `${i ? 'L' : 'M'}${(a * S).toFixed(1)},${(b * S).toFixed(1)}`).join(' ') : '';
  return <AbsoluteFill style={{mixBlendMode: 'screen'}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="gb1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
        <filter id="gb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
        <radialGradient id="halo"><stop offset="0" stopColor="#dff2ff" stopOpacity="1"/><stop offset=".25" stopColor="#a9d8ff" stopOpacity=".55"/><stop offset="1" stopColor="#7fb8ff" stopOpacity="0"/></radialGradient>
      </defs>
      {d ? <>
        <path d={d} stroke={`rgba(170,210,255,${.45 * e})`} strokeWidth={18 * tw} fill="none" strokeLinecap="round" filter="url(#gb1)"/>
        <path d={d} stroke={`rgba(255,255,255,${.95 * e})`} strokeWidth={5 * tw} fill="none" strokeLinecap="round" filter="url(#gb2)"/>
      </> : null}
      {halo > 0 ? <><circle cx={X} cy={Y} r={110 * e * halo} fill="url(#halo)" opacity={.45}/>
      <circle cx={X} cy={Y} r={34 * e * halo} fill="url(#halo)"/></> : null}
      <circle cx={X} cy={Y} r={(halo > 0 ? 8 : 5) * Math.max(.6, e) * tw} fill="#fff" filter="url(#gb2)"/>
    </svg>
  </AbsoluteFill>;
};
const trailOf = (p: Pt[], f: number, len: number, n = 30): [number, number][] =>
  Array.from({length: n + 1}, (_, i) => cr(p, Math.max(p[0][0], f - len * i / n)));

// plate: covers the frame (plates are 3:2, the frame is 1.594:1) and zooms about an anchor (REF px)
const Plate: React.FC<{src: string; z?: number; ax?: number; ay?: number; dx?: number; dy?: number; style?: React.CSSProperties}> = ({src, z = 1, ax = RW / 2, ay = RH / 2, dx = 0, dy = 0, style}) =>
  <AbsoluteFill style={{overflow: 'hidden', ...style}}>
    <Img src={C(src)} style={{position: 'absolute', width: W, height: H, objectFit: 'cover', transformOrigin: `${ax * S}px ${ay * S}px`,
      transform: `translate(${dx * S}px, ${dy * S}px) scale(${z})`}}/>
  </AbsoluteFill>;
// real bloom: the plate itself, blurred, pushed and screened back on (light spills from the bright areas)
const Bloom: React.FC<{src: string; k: number; z?: number; ax?: number; ay?: number; r?: number}> = ({src, k, z, ax, ay, r = 26}) => k <= 0 ? null :
  <AbsoluteFill style={{mixBlendMode: 'screen', opacity: k, filter: `blur(${r}px) brightness(1.5)`}}><Plate src={src} z={z} ax={ax} ay={ay}/></AbsoluteFill>;

// ---- shot 1: palm, fog; the spark falls into the palm (f3-16), blooms (f16-23), storm clouds roll in (f24+),
//      the whole frame sinks to black (ref luma f29 105 -> f35 8) while the spark shoots off to the right as a streak ----
const DIM: [number, number][] = [[28, 1], [29, .95], [30, .87], [31, .78], [32, .6], [33, .43], [34, .24], [35, .1], [36, .03], [37, 0]];
const dimAt = (f: number) => {if (f <= DIM[0][0]) return 1; for (let i = 1; i < DIM.length; i++) if (f <= DIM[i][0]) return mix(DIM[i - 1][1], DIM[i][1], (f - DIM[i - 1][0]) / (DIM[i][0] - DIM[i - 1][0])); return 0;};
const Spark: React.FC<{f: number}> = ({f}) => {
  const [x, y] = cr(P, f), moving = f < 16 || f > 30.5;
  const halo = f >= 32 ? 0 : f > 30.5 ? .5 : f < 10 ? 2.6 : f < 16 ? 1.5 : 1;
  return <Glow x={x} y={y} e={f < 4 ? span(f, 3, 4) : f > 21 && f < 31 ? .7 : 1} trail={f > 30.5 ? trailOf(P, f, 1, 16) : f < 16 ? trailOf(P, f, .35, 8) : undefined} halo={halo} tw={f >= 42 ? mix(1, .75, span(f, 42, 47)) : 1}/>;
};
const Shot1: React.FC<{f: number}> = ({f}) => {
  const z = 1.0 + .035 * (f / 36), dy = -4 * (f / 36);            // slow push + rise
  const bloom = clamp(span(f, 15, 18) - span(f, 18, 24) * .85);     // exposure bloom f16-23 (ref luma 106->134->119)
  const storm = io(span(f, 23, 31));                                // clouds roll in over the sky
  const dim = dimAt(f), sky = clamp(1 - (1 - dim) * 1.12);          // sky goes first, the lit hand last
  const [sx, sy] = cr(P, f);
  const expo = f <= 15 ? mix(1.06, .89, f / 15) : mix(.89, 1, span(f, 15, 17)); // ref slow decay 126->106 before the bloom
  return <AbsoluteFill style={{background: '#000', filter: `brightness(${expo})`}}>
    <Plate src="s01_palm.jpg" z={z} dy={dy}/>
    <Bloom src="s01_palm.jpg" k={.06 + .12 * bloom} z={z} r={30}/>
    <AbsoluteFill style={{background: `radial-gradient(circle at ${sx * S}px ${sy * S}px, rgba(200,235,255,${.35 * bloom}) 0%, rgba(160,210,240,${.14 * bloom}) 30%, rgba(150,200,230,0) 70%)`, mixBlendMode: 'screen'}}/>
    {storm > 0 ? <AbsoluteFill style={{opacity: storm, mixBlendMode: 'multiply'}}>
      <svg width={W} height={H}><defs><filter id="cl" filterUnits="userSpaceOnUse" x={-700} y={-300} width={W + 1400} height={H + 600}>
        <feTurbulence type="fractalNoise" baseFrequency=".0016 .0038" numOctaves={5} seed={4}/>
        <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/>
        <feComponentTransfer><feFuncR type="table" tableValues="1 1 .92 .5 .26 .2"/><feFuncG type="table" tableValues="1 1 .95 .6 .33 .27"/><feFuncB type="table" tableValues="1 1 .95 .6 .33 .27"/></feComponentTransfer></filter>
        <linearGradient id="skyfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff"/><stop offset=".55" stopColor="#fff" stopOpacity=".75"/><stop offset="1" stopColor="#fff" stopOpacity=".2"/></linearGradient>
        <mask id="skym"><rect width={W} height={H} fill="url(#skyfade)"/></mask></defs>
        <g mask="url(#skym)"><g transform={`translate(${f * 7 - 300}, ${f * 1.5})`}><rect x={-400} y={-300} width={W + 1000} height={H + 600} filter="url(#cl)"/></g></g></svg>
    </AbsoluteFill> : null}
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(120,150,150,${.5 * storm}) 0%, rgba(255,255,255,0) 70%)`, mixBlendMode: 'multiply'}}/>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,${1 - sky}) 0%, rgba(0,0,0,${1 - sky}) 45%, rgba(0,0,0,${1 - dim}) 100%)`}}/>
    <Spark f={f}/>
  </AbsoluteFill>;
};

// ---- shot 2: black void, the streak loops round the frame and curls into the centre ----
const Shot2: React.FC<{f: number}> = ({f}) => <AbsoluteFill style={{background: '#000'}}><Spark f={f}/></AbsoluteFill>;

// ---- shot 3: eye (measured from ref f48-64) ----
// f48 closed lid macro; f49 white; f50 half-open, dark; f51 overexposed vertical whip (eye low, white surround);
// f52-53 settle (iris ~.63-.65 W, pupil (526,200)); f54-56 hold, pupil glow peaks; f56-58 push (iris .69 -> .82 W);
// f57-61 curly white flecks spread over iris + skin, a thin ring round the pupil, the glow shrinks to a spark;
// f62-64 the frame shatters into falling white blocks (pre-rendered per-pixel: tools/shatter.py -> shat_62..64.jpg)
const EYE = {x: 512, y: 224};               // pupil in s03_eye_mid (REF px)
const EZ: [number, number][] = [[51, 1.02], [52, 1.02], [53, 1.03], [56, 1.08], [57, 1.16], [58, 1.25], [61, 1.3]];
const ez = (f: number) => {for (let i = 1; i < EZ.length; i++) if (f <= EZ[i][0]) return mix(EZ[i - 1][1], EZ[i][1], io((f - EZ[i - 1][0]) / (EZ[i][0] - EZ[i - 1][0]))); return EZ[EZ.length - 1][1];};
// ref f57-61: thin (~2 px @918) wiggly S-curls + tiny specks, white-cyan with a soft blue glow, mostly over the iris, none in the pupil
const FLECKS = Array.from({length: 520}, (_, i) => {
  const dot = i >= 330;
  const r = (dot ? 60 + hash(i * 1.3) * 470 : 70 + Math.sqrt(hash(i * 1.7)) * 340 + (hash(i * 8.1) < .18 ? 160 : 0)), a = hash(i * 3.3) * Math.PI * 2;
  const x = EYE.x + Math.cos(a) * r * 1.05, y = EYE.y + Math.sin(a) * r * .85;
  const len = dot ? 2 + hash(i * 5.1) * 5 : 14 + hash(i * 5.1) * 34, dir = hash(i * 7.7) * Math.PI * 2, curl = (hash(i * 9.9) - .5) * 2.6;
  const t = 56.6 + Math.pow(hash(i * 2.9), .8) * 4.6;
  return {x, y, len, dir, curl, t, dot, w: dot ? 1.2 + hash(i * 4.4) * 1.4 : .9 + hash(i * 4.4) * .9, o: .55 + hash(i * 6.6) * .45};
});
const Flecks: React.FC<{f: number; z: number; dx: number; dy: number}> = ({f, z, dx, dy}) => {
  const P2 = (x: number, y: number) => [((x - EYE.x) * z + EYE.x + dx) * S, ((y - EYE.y) * z + EYE.y + dy) * S];
  const paths = FLECKS.map((k, i) => {
    if (f < k.t) return null; const g = clamp((f - k.t) / .8);
    const L = k.len * g, ux = Math.cos(k.dir), uy = Math.sin(k.dir), nx = -uy, ny = ux, c = L * k.curl * .55;
    const [x0, y0] = P2(k.x, k.y), [x1, y1] = P2(k.x + ux * L, k.y + uy * L);
    const [ax, ay] = P2(k.x + ux * L * .33 + nx * c, k.y + uy * L * .33 + ny * c), [bx, by] = P2(k.x + ux * L * .66 - nx * c, k.y + uy * L * .66 - ny * c);
    return <path key={i} d={`M${x0},${y0} C${ax},${ay} ${bx},${by} ${x1},${y1}`} stroke={`rgba(240,250,255,${k.o})`} strokeWidth={k.w * S * z * 1.15} fill="none" strokeLinecap="round"/>;
  });
  return <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    <defs><filter id="fk" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b2"/>
      <feColorMatrix in="b2" type="matrix" values=".55 0 0 0 0  0 .8 0 0 0  0 0 1.2 0 0  0 0 0 1.6 0" result="b2c"/>
      <feMerge><feMergeNode in="b2c"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g filter="url(#fk)">{paths}</g>
  </svg>;
};
const Eye: React.FC<{f: number}> = ({f}) => {
  if (f === 48) return <Plate src="s03_eye_closed.jpg" z={1.5} ay={271}/>;
  if (f === 49) return <AbsoluteFill style={{background: '#eef4f6'}}/>;
  if (f === 50) return <><Plate src="s03_eye_half.jpg" z={1.04} style={{filter: 'brightness(.8) contrast(1.1)'}}/><Bloom src="s03_eye_half.jpg" k={.15} z={1.04}/></>;
  if (f >= 62) return <Plate src={`shat_${f}.jpg`}/>;
  const z = ez(f), dx = f === 51 ? 4 : f === 52 ? 6 : 0, dy = f === 51 ? 144 : f === 52 ? -22 : f === 53 ? -18 : mix(-18, 0, span(f, 53, 56));
  const blow = f === 51 ? .45 : f === 52 ? .2 : f === 53 ? .06 : 0;     // white, overexposed surround while the eye snaps open
  const mb = f === 51 ? '3 16' : f === 52 ? '4 4' : '0 0';
  const glow = f <= 51 ? .45 : f <= 58 ? mix(.8, 1.6, span(f, 52, 55.5)) : mix(1.6, .75, out(span(f, 58, 61)));   // ref: pupil still blazing at f58 (luma 197), a small star by f61
  const [px, py] = [(EYE.x - EYE.x) * z + EYE.x + dx, EYE.y + dy];
  const body = <>
    <Plate src="s03_eye_mid.jpg" z={z * 1.25} ax={EYE.x} ay={EYE.y} dx={dx} dy={dy} style={{filter: 'blur(24px) brightness(.95)'}}/>
    <Plate src="s03_eye_mid.jpg" z={z} ax={EYE.x} ay={EYE.y} dx={dx} dy={dy} style={{filter: `brightness(${mix(.86, .75, span(f, 56, 59))}) contrast(${mix(1.06, 1.2, span(f, 56, 59))}) saturate(.82) hue-rotate(20deg) blur(1px)`}}/>
    <Bloom src="s03_eye_mid.jpg" k={.14 + .3 * blow} z={z} ax={EYE.x} ay={EYE.y} r={22}/>
  </>;
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{filter: mb !== '0 0' ? `url(#mb${f})` : undefined}}>
      {body}
      {blow > 0 ? <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 44% at ${(px) / RW * 100}% ${(py + 40) / RH * 100}%, rgba(255,255,255,0) 55%, rgba(242,248,250,${blow}) 100%)`}}/> : null}
      {blow > 0 ? <AbsoluteFill style={{background: `rgba(235,245,248,${.35 * blow})`, mixBlendMode: 'screen'}}/> : null}
    </AbsoluteFill>
    {mb !== '0 0' ? <svg width={0} height={0}><filter id={`mb${f}`} x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation={mb}/></filter></svg> : null}
    {f >= 56.5 ? <Flecks f={f} z={z} dx={dx} dy={dy}/> : null}
    <AbsoluteFill style={{mixBlendMode: 'screen', background: `radial-gradient(circle at ${px * S}px ${py * S}px, rgba(225,238,255,${.85 * clamp(glow - .5)}) 0px, rgba(170,205,250,${.55 * clamp(glow - .5)}) ${60 * z * S}px, rgba(120,170,240,0) ${150 * z * S}px)`}}/>
    <Glow x={px} y={py} e={glow} halo={f >= 52 ? 1.6 : .6}/>
  </AbsoluteFill>;
};

// ---- shot 4: four building plates, one per frame (f65-68), the spark held near frame centre, a different light leak on each ----
const TW: {src: string; sx: number; sy: number; leak: string}[] = [
  {src: 's04b_towers.jpg', sx: 496, sy: 275, leak: 'prism'},
  {src: 's04_towers.jpg', sx: 494, sy: 283, leak: 'corner'},
  {src: 's04c_towers.jpg', sx: 490, sy: 288, leak: 'pink'},
  {src: 's04d_towers.jpg', sx: 490, sy: 302, leak: 'red'},
];
const Leak: React.FC<{k: string}> = ({k}) => {
  if (k === 'prism') return <AbsoluteFill style={{mixBlendMode: 'screen'}}>
    <AbsoluteFill style={{background: 'linear-gradient(118deg, rgba(235,248,255,.95) 0%, rgba(200,235,250,.85) 18%, rgba(120,190,235,.55) 30%, rgba(30,90,170,.35) 40%, rgba(0,0,0,0) 52%)'}}/>
    <AbsoluteFill style={{background: 'linear-gradient(62deg, rgba(0,0,0,0) 12%, rgba(170,220,250,.5) 14%, rgba(170,220,250,.25) 22%, rgba(0,0,0,0) 23%)'}}/>
    <AbsoluteFill style={{background: 'linear-gradient(140deg, rgba(0,0,0,0) 20%, rgba(210,240,255,.45) 21%, rgba(0,0,0,0) 34%)'}}/>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 12% 30% at 100% 42%, rgba(255,70,200,.9) 0%, rgba(255,70,200,0) 100%)', filter: 'blur(10px)'}}/>
  </AbsoluteFill>;
  if (k === 'corner') return <AbsoluteFill style={{mixBlendMode: 'screen', background: 'radial-gradient(ellipse 9% 16% at 99% 6%, rgba(255,90,210,.85) 0%, rgba(255,90,210,0) 100%)'}}/>;
  if (k === 'pink') return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: .45}}>
    <AbsoluteFill style={{background: 'linear-gradient(100deg, rgba(0,0,0,0) 48%, rgba(230,90,190,.35) 62%, rgba(250,170,225,.75) 80%, rgba(255,200,235,.6) 100%)'}}/>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(115deg, rgba(255,255,255,0) 0px, rgba(255,210,240,.12) 60px, rgba(255,255,255,0) 140px)', maskImage: 'linear-gradient(90deg, transparent 55%, #000 75%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 55%, #000 75%)'}}/>
  </AbsoluteFill>;
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: .4, background: 'radial-gradient(ellipse 30% 45% at 0% 0%, rgba(230,20,25,.95) 0%, rgba(160,10,15,.5) 45%, rgba(0,0,0,0) 100%)'}}/>;
};
const Towers: React.FC<{f: number}> = ({f}) => {
  const t = TW[clamp(f - 65, 0, 3)];
  return <AbsoluteFill style={{background: '#000'}}>
    <Plate src={t.src} z={1.04}/>
    <Leak k={t.leak}/>
    <Glow x={t.sx} y={t.sy} e={.85} halo={.8}/>
  </AbsoluteFill>;
};

// =====================================================================================================================
// f69-288 (measured shot map: see PLAN.md / ref frames).  Text per the user (2026-11-04): "250K" = firas's next Kick follower target, on palm / horse / root.
const TEAL = '54,230,192';
const ZoomBlur: React.FC<{src: string; z?: number; ax?: number; ay?: number; dx?: number; dy?: number; k: number; n?: number; cx?: number; cy?: number; style?: React.CSSProperties}> =
  ({src, z = 1, ax, ay, dx, dy, k, n = 7, cx = RW / 2, cy = RH / 2, style}) => <AbsoluteFill style={style}>
    {Array.from({length: n}, (_, i) => <AbsoluteFill key={i} style={{opacity: i ? 1 / (i + 1) : 1, transformOrigin: `${cx * S}px ${cy * S}px`, transform: `scale(${1 + k * i / (n - 1)})`}}>
      <Plate src={src} z={z} ax={ax} ay={ay} dx={dx} dy={dy}/></AbsoluteFill>)}
  </AbsoluteFill>;
const pathD = (p: [number, number][]) => {
  if (p.length < 3) return p.map(([x, y], i) => `${i ? 'L' : 'M'}${x * S},${y * S}`).join(' ');
  let d = `M${p[0][0] * S},${p[0][1] * S}`;
  for (let i = 0; i < p.length - 1; i++) {   // catmull-rom -> bezier
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6) * S},${(p1[1] + (p2[1] - p0[1]) / 6) * S} ${(p2[0] - (p3[0] - p1[0]) / 6) * S},${(p2[1] - (p3[1] - p1[1]) / 6) * S} ${p2[0] * S},${p2[1] * S}`;
  }
  return d;
};
// neon line (teal on the palm, white for the photo/root spark); fade = tail transparency along the path
const Neon: React.FC<{pts: [number, number][]; e?: number; col?: string; w?: number; fade?: boolean; id: string; dot?: boolean}> = ({pts, e = 1, col = TEAL, w = 1, fade, id, dot}) => {
  const d = pathD(pts), [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
  const st = (a: number) => fade ? `url(#${id}g${a})` : `rgba(${col},${a * e})`;
  return <AbsoluteFill style={{mixBlendMode: 'screen'}}><svg width={W} height={H}>
    <defs>
      <filter id={`${id}b1`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10 * w}/></filter>
      <filter id={`${id}b2`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={2}/></filter>
      {fade ? [.5, .95].map(a => <linearGradient key={a} id={`${id}g${a}`} gradientUnits="userSpaceOnUse" x1={x0 * S} y1={y0 * S} x2={x1 * S} y2={y1 * S}>
        <stop offset="0" stopColor={`rgb(${col})`} stopOpacity={0}/><stop offset="1" stopColor={`rgb(${col})`} stopOpacity={a * e}/></linearGradient>) : null}
    </defs>
    {dot ? <><circle cx={x1 * S} cy={y1 * S} r={16 * w} fill={`rgba(${col},${.6 * e})`} filter={`url(#${id}b1)`}/><circle cx={x1 * S} cy={y1 * S} r={5 * w} fill={`rgba(235,255,250,${e})`} filter={`url(#${id}b2)`}/></> : <>
      <path d={d} stroke={st(.5)} strokeWidth={16 * w} fill="none" strokeLinecap="round" filter={`url(#${id}b1)`}/>
      <path d={d} stroke={st(.95)} strokeWidth={5.5 * w} fill="none" strokeLinecap="round" filter={`url(#${id}b2)`}/>
      <path d={d} stroke={`rgba(240,255,250,${.8 * e})`} strokeWidth={1.8 * w} fill="none" strokeLinecap="round" opacity={fade ? .5 : 1}/></>}
  </svg></AbsoluteFill>;
};
// irregular shard polygons radiating from a centre (REF px)
const shards = (seed: number, n: number, cx: number, cy: number, r0: number, r1: number, s0: number, s1: number) => Array.from({length: n}, (_, i) => {
  const h = (k: number) => hash(seed * 31.7 + i * 7.13 + k * 1.91);
  const a = h(1) * Math.PI * 2, r = r0 + Math.pow(h(2), .7) * (r1 - r0), x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * .9;
  const sz = s0 + h(3) * (s1 - s0), nv = 3 + Math.floor(h(4) * 3), el = 1.4 + h(5) * 1.4;
  return Array.from({length: nv}, (_, j) => {
    const t = j / nv * Math.PI * 2 + h(6 + j) * .9, rr = sz * (.55 + h(9 + j) * .6);
    const u = Math.cos(t) * rr * el, v = Math.sin(t) * rr;                 // elongated along the radial direction
    return `${(x + u * Math.cos(a) - v * Math.sin(a)) * S},${(y + u * Math.sin(a) + v * Math.cos(a)) * S}`;
  }).join(' ');
});

// ---- shot 5: Snoop walks in green fog (f69-79); the towers' blue spark fades; a teal arc grows bottom-left; f79 shards burst ----
const WALK_B: [number, number][] = [[69, 1.42], [72, 1.0], [76, .86], [77, .88], [79, 1.1]];
const lerpK = (k: [number, number][], f: number) => {if (f <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (f <= k[i][0]) return mix(k[i - 1][1], k[i][1], (f - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return k[k.length - 1][1];};
const ARC: Record<number, [number, number][]> = {77: [[150, 415], [230, 425], [300, 410]], 78: [[180, 420], [280, 420], [360, 395]], 79: [[200, 410], [300, 405], [410, 370]]};
const Walk: React.FC<{f: number}> = ({f}) => <AbsoluteFill style={{background: '#000'}}>
  <AbsoluteFill style={{filter: `brightness(${lerpK(WALK_B, f)})`}}><Plate src="s05_walk.jpg" z={1 + .02 * span(f, 69, 80)} ax={640} ay={260}/></AbsoluteFill>
  {f <= 76 ? <Glow x={mix(492, 500, span(f, 69, 76))} y={mix(300, 306, span(f, 69, 76))} e={.8 * (1 - span(f, 69, 76.5))} halo={.7}/> : null}
  {ARC[f] ? <Neon id={`a${f}`} pts={ARC[f]} fade w={.8}/> : null}
  {f === 79 ? <AbsoluteFill style={{mixBlendMode: 'screen'}}><svg width={W} height={H}>
    <filter id="sh79"><feGaussianBlur stdDeviation="1.2"/></filter>
    <g filter="url(#sh79)">{shards(79, 46, 625, 175, 10, 180, 3, 10).map((p, i) => <polygon key={i} points={p} fill={`rgba(235,245,240,${.55 + .45 * hash(i)})`}/>)}</g></svg></AbsoluteFill> : null}
</AbsoluteFill>;

// ---- shot 6: transition f80 (walk shatters, palm shows through the shards) and the palm POV f81-94 ----
const palmDx = (f: number) => -90 + mix(0, 25, io(span(f, 81, 86))) + (f >= 85 ? (hash(f * 1.3) - .5) * 12 : 0);
const palmDy = (f: number) => 50 + (f >= 85 ? (hash(f * 2.7) - .5) * 9 : 0);
const PALM_TXT: Record<number, number> = {85: .8, 87: 1, 89: 1, 91: 1, 92: 1, 94: 1};
const TXT = '250K', TXT_K = 1.45;   // 4 glyphs instead of 8: scaled up to keep the ref's text footprint
const TealText: React.FC<{x: number; y: number; e: number; rot?: number; size?: number; blurX?: number; carved?: number; id: string}> = ({x, y, e, rot = -10, size = 28, blurX = 0, carved = 0, id}) =>
  <AbsoluteFill style={{mixBlendMode: carved ? 'normal' : 'screen'}}><svg width={W} height={H}>
    <defs><filter id={`${id}f`} x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation={`${8 + blurX} 8`} result="a"/><feGaussianBlur in="SourceGraphic" stdDeviation={`${1 + blurX} 1`} result="b"/>
      <feMerge><feMergeNode in="a"/><feMergeNode in="a"/><feMergeNode in="b"/></feMerge></filter>
      <filter id={`${id}c`}><feGaussianBlur stdDeviation="1.1"/></filter></defs>
    <g transform={`translate(${x * S},${y * S}) rotate(${rot})`} fontFamily="Share Tech Mono" fontSize={size * TXT_K * S} textAnchor="middle" dominantBaseline="central">
      {carved ? <><text x={1.2} y={1.6} fill={`rgba(170,190,180,${.25 * carved})`} filter={`url(#${id}c)`}>{TXT}</text>
        <text fill={`rgba(8,12,12,${.75 * carved})`} filter={`url(#${id}c)`}>{TXT}</text></> : null}
      {e > 0 ? <text fill={`rgba(${TEAL},${e})`} filter={`url(#${id}f)`}>{TXT}</text> : null}
      {e > 0 ? <text fill={`rgba(220,255,245,${.55 * e})`} style={{filter: blurX ? `blur(${blurX}px)` : undefined}}>{TXT}</text> : null}
    </g></svg></AbsoluteFill>;
const Palm: React.FC<{f: number}> = ({f}) => {
  if (f === 80) {
    const sh = shards(80, 190, 560, 280, 30, 520, 5, 24);
    return <AbsoluteFill style={{background: '#000'}}>
      <ZoomBlur src="s05_walk.jpg" k={.22} cx={560} cy={280} z={1.02} ax={640} ay={260} style={{filter: 'brightness(1.5)'}}/>
      <AbsoluteFill><svg width={W} height={H}><defs><mask id="pm80"><rect width={W} height={H} fill="#000"/>
        <circle cx={740 * S} cy={190 * S} r={190 * S} fill="#fff" filter="url(#pmb)"/>
        {sh.map((p, i) => i % 3 ? <polygon key={i} points={p} fill="#fff"/> : null)}</mask>
        <filter id="pmb"><feGaussianBlur stdDeviation="40"/></filter></defs>
        <g mask="url(#pm80)"><g transform={`translate(${-90 * S},${50 * S}) translate(${585 * S},${400 * S}) scale(1.15) translate(${-585 * S},${-400 * S})`}><image href={C('s06_palm_pov.jpg')} width={W} height={H} preserveAspectRatio="xMidYMid slice" style={{filter: 'brightness(1.15)'}}/></g></g>
        {sh.map((p, i) => i % 4 === 0 ? <polygon key={i} points={p} fill={`rgba(200,215,212,${.35 + .35 * hash(i * 3)})`}/> : null)}
        {sh.map((p, i) => i % 5 === 1 ? <polygon key={'k' + i} points={p} fill="rgba(10,14,14,.75)" transform={`translate(${7 * S},${5 * S})`}/> : null)}
      </svg></AbsoluteFill>
      <Neon id="c80" pts={[[182, 70], [90, 160], [42, 300], [100, 380], [192, 410]]} w={.9}/>
    </AbsoluteFill>;
  }
  if (f === 93) return <AbsoluteFill style={{background: '#000'}}/>;
  const dx = palmDx(f), dy = palmDy(f), zb = f === 81 ? .14 : f === 82 ? .05 : 0, txt = PALM_TXT[f] || 0;
  return <AbsoluteFill style={{background: '#000'}}>
    {zb ? <ZoomBlur src="s06_palm_pov.jpg" k={zb} dx={dx} dy={dy} z={1.15} ax={585} ay={400} cx={560} cy={260}/> : <Plate src="s06_palm_pov.jpg" dx={dx} dy={dy} z={1.15 + .02 * span(f, 81, 94)} ax={585} ay={400}/>}
    {f === 81 ? <Neon id="a81" pts={[[184, 70], [260, 35], [330, 30], [410, 50], [484, 90]]} w={.9}/> : null}
    {f === 82 ? <Neon id="a82" pts={[[486, 90], [596, 190]]} fade w={.9}/> : null}
    {f === 83 ? <Neon id="a83" pts={[[585, 185], [605, 215]]} fade w={.8}/> : null}
    {f === 84 ? <Neon id="a84" pts={[[618, 226], [620, 230]]} dot w={.8}/> : null}
    {txt ? <TealText id={`t${f}`} x={668 + dx} y={203 + dy} e={txt} size={36} blurX={f === 85 ? 7 : 0}/> : null}
  </AbsoluteFill>;
};

// ---- shot 7: the toy horse, the date glows on its flank (f95), black (f96), then it sits dark, the text fading to a carving (f97-111) ----
const Horse: React.FC<{f: number}> = ({f}) => {
  if (f === 96) return <AbsoluteFill style={{background: '#000'}}/>;
  const e = f === 95 ? 1 : mix(.32, .06, span(f, 97, 111));
  return <AbsoluteFill style={{background: '#000'}}>
    <Plate src="s07_horse.jpg" z={1 + .03 * span(f, 95, 111)} ax={630} ay={225} style={{filter: `brightness(${f === 95 ? 1.05 : .9})`}}/>
    <AbsoluteFill style={{mixBlendMode: 'screen', background: `radial-gradient(ellipse ${90 * S}px ${50 * S}px at ${630 * S}px ${225 * S}px, rgba(${TEAL},${.22 * e}) 0%, rgba(${TEAL},0) 100%)`}}/>
    <TealText id={`h${f}`} x={630} y={225} e={e} rot={-9} size={33} carved={f === 95 ? 0 : span(f, 97, 103) * .9}/>
  </AbsoluteFill>;
};

// ---- shot 8: smears (fx), the aerial with the blue star flare (f119-127), warps, black strobe, amber CRT ----
const FX: React.FC<{n: string; z?: number; dx?: number; style?: React.CSSProperties}> = ({n, z = 1, dx = 0, style}) => <Plate src={`fx/${n}.jpg`} z={z} dx={dx} style={style}/>;
const AERIAL_B: [number, number][] = [[118, .1], [119, .3], [120, .55], [121, .85], [122, 1.05], [123, .97], [124, .9], [125, .88], [126, .86], [127, 1.05]];
const Aerial: React.FC<{f: number}> = ({f}) => {
  const fl = f >= 121 ? (f <= 124 ? [mix(230, 182, (f - 121) / 3), mix(310, 270, (f - 121) / 3)] : [mix(182, 94, (f - 124) / 3), mix(270, 210, (f - 124) / 3)]) : null;
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{filter: `brightness(${lerpK(AERIAL_B, f)})`}}><Plate src="s08_aerial.jpg" z={1.06 - .03 * span(f, 119, 127)} ax={459} ay={300}/></AbsoluteFill>
    {fl ? <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      <AbsoluteFill style={{transformOrigin: `${fl[0] * S}px ${fl[1] * S}px`, transform: 'rotate(38deg)', background: `radial-gradient(ellipse ${300 * S}px ${26 * S}px at ${(fl[0] - 230) * S}px ${fl[1] * S}px, rgba(150,200,255,.55) 0%, rgba(90,150,255,0) 100%)`}}/>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${fl[0] * S}px ${fl[1] * S}px, rgba(235,245,255,.95) 0px, rgba(150,200,255,.6) ${28 * S}px, rgba(90,140,240,.28) ${100 * S}px, rgba(60,100,220,0) ${230 * S}px)`}}/>
      <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)`}}/>
      <svg width={W} height={H}><g transform={`translate(${fl[0] * S},${fl[1] * S})`}>
        <ellipse rx={3 * S} ry={70 * S} fill="rgba(200,230,255,.35)" filter="url(#fls)"/></g>
        <filter id="fls"><feGaussianBlur stdDeviation="3"/></filter></svg>
    </AbsoluteFill> : null}
  </AbsoluteFill>;
};
const STROBE: Record<number, string> = {143: '', 144: 'wp_144', 145: '', 146: 'amm_146', 147: '', 148: 'amm_148', 149: '', 150: 'amm_150'};
const Mid: React.FC<{f: number}> = ({f}) => {
  if (f <= 114) return <FX n={`hz_${f}`}/>;
  if (f <= 116) return <FX n={`ls_${f}`}/>;
  if (f === 117) return <FX n="ls_117"/>;
  if (f <= 127) return <Aerial f={f}/>;
  if (f <= 129) return <FX n={`ae_${f}`}/>;
  if (f <= 133) return <FX n={`wbc_${f}`}/>;
  if (f <= 142) return <FX n={`wp_${f}`}/>;
  if (f <= 150) return STROBE[f] ? <FX n={STROBE[f]}/> : <AbsoluteFill style={{background: '#000'}}/>;
  const gate = f >= 155;   // ref f155: the film gate drops in: hard black bottom edge, dark top lip, whole frame ~7% darker
  return <AbsoluteFill>
    <FX n="am_151" z={1 + .025 * span(f, 151, 161)} dx={-5 * span(f, 151, 161)} style={gate ? {filter: 'brightness(.92)'} : undefined}/>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(20,6,0,${gate ? .75 : .45}) 0px, rgba(20,6,0,0) ${8 * S}px, rgba(0,0,0,0) ${(gate ? 538 : 556) * S}px, rgba(0,0,0,.97) ${(gate ? 556 : 576) * S}px)`}}/>
    {gate ? <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(25,8,0,.55) 0px, rgba(25,8,0,0) ${45 * S}px, rgba(25,8,0,0) ${873 * S}px, rgba(25,8,0,.5) ${918 * S}px)`}}/> : null}
  </AbsoluteFill>;
};

// ---- shot 9: car (f162-176), photo (f177-197), the spark draws a hook and the photo dissolves into the root (f198-225) ----
const Car: React.FC<{f: number}> = ({f}) => {
  if (f <= 164) return <FX n={`car_${f}`}/>;
  if (f === 176) return <FX n="car_176"/>;
  if (f >= 177) return <FX n={`ph_${f}`}/>;
  return <Plate src="s11_car.jpg" z={1.0 + .035 * span(f, 165, 175)} ax={700} ay={250} dx={-6 * span(f, 165, 175)}/>;
};
const TREE = {x: 474, y: 214};
const HOOK: Pt[] = [[198, 474, 214], [199, 492, 196], [200, 540, 180], [201, 585, 115], [202, 700, 46], [202.5, 860, 92], [203, 815, 200], [204, 700, 262], [205, 648, 281], [206, 599, 307], [207, 551, 344], [208, 549, 345]]   // f205-208 measured on the ref's >=240 luma pixels;
const photoZ = (f: number) => f < 193 ? 1 + .02 * span(f, 179, 188) : mix(1.28, 1.42, span(f, 193, 206));
const photoD = (f: number): [number, number] => f < 193 ? [0, 0] : [51, 33];   // = (42,44) after the 14deg turn about TREE
const Photo: React.FC<{f: number}> = ({f}) => {
  if (f === 189 || f === 191) return <AbsoluteFill style={{background: '#f4f7f7'}}/>;
  if (f === 190 || f === 192) return <FX n={`px_${f}`}/>;
  const z = photoZ(f), rot = f >= 193 ? 14 : 0;
  const tx = (x: number, y: number): [number, number] => [(x - TREE.x) * z + TREE.x, (y - TREE.y) * z + TREE.y];
  const [pdx, pdy] = photoD(f), sx = TREE.x + (f < 193 ? 0 : 42), sy = TREE.y + (f < 193 ? 0 : 44);
  const sparkE = f <= 188 ? mix(.35, 1, span(f, 179, 188)) : f <= 197 ? mix(2.3, .8, out(span(f, 193, 197))) : .8;
  const halo = f <= 188 ? mix(.25, .8, span(f, 179, 188)) : f <= 197 ? mix(4.2, .6, out(span(f, 193, 197))) : .4;
    const head = f >= 198 ? cr(HOOK, f) : null;
  const photo = <AbsoluteFill style={{transformOrigin: `${TREE.x * S}px ${TREE.y * S}px`, transform: `rotate(${rot}deg)`}}>
      {rot ? <Plate src="s12_photo.jpg" z={z * 1.6} ax={TREE.x} ay={TREE.y} dx={pdx} dy={pdy} style={{filter: 'blur(14px) brightness(.55)'}}/> : null}
      <Plate src="s12_photo.jpg" z={z * (1 + .025 * Math.max(0, f - 203))} ax={TREE.x} ay={TREE.y} dx={pdx} dy={pdy}/>
    </AbsoluteFill>;
  const dis = f >= 202 && f <= 206, mk = (n: string): React.CSSProperties => ({maskImage: `url(${staticFile(`c04/fx/${n}_${f}.png`)})`, WebkitMaskImage: `url(${staticFile(`c04/fx/${n}_${f}.png`)})`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%'});
  return <AbsoluteFill style={{background: '#000'}}>
    {dis ? ['dk', 'df'].map(n => <Img key={n} src={staticFile(`c04/fx/${n}_${f}.png`)} style={{position: 'absolute', width: 1, height: 1, opacity: 0}}/>) : null}
    {dis ? <AbsoluteFill><ZoomBlur src="s14_root.jpg" k={f <= 203 ? .05 : [.04, .03, .02][f - 204]} cx={150} cy={250} z={1.12 - .02 * Math.max(0, f - 203)} ax={546} ay={355} style={{filter: "brightness(.82) contrast(1.15)"}}/></AbsoluteFill> : null}
    {dis ? <AbsoluteFill style={mk('dk')}>{photo}</AbsoluteFill> : photo}
    {dis ? <AbsoluteFill style={{...mk('df'), transform: `translate(${-26 * S * (1 + .3 * (f - 202))}px,${-20 * S * (1 + .3 * (f - 202))}px)`, filter: 'brightness(1.35) contrast(1.1)'}}>{photo}</AbsoluteFill> : null}
    {f >= 203 && f <= 206 ? <AbsoluteFill style={{mixBlendMode: 'screen', background: `radial-gradient(ellipse 45% 70% at 0% 30%, rgba(235,240,240,${[.4, .9, .85, .5][f - 203]}) 0%, rgba(235,240,240,0) 100%)`}}/> : null}
    {f <= 201 ? <Glow x={sx} y={sy} e={sparkE} halo={halo}/> : null}
    {head && f <= 201 ? <Neon id={`l${f}`} col="235,245,255" w={.75} pts={trailOf(HOOK, f, f - 198 + .01, 12)}/> : null}
    {head && f > 201 ? <Neon id={`l${f}`} col="235,245,255" w={1.25} pts={trailOf(HOOK, f, f >= 204 ? 2.3 : 1.6, 28)}/> : null}
  </AbsoluteFill>;
};
// hand-drawn single-stroke digits (60x100 box) for the root carving "250K"
const DIG: Record<string, string> = {
  '1': 'M18,22 L32,6 L32,96',
  '0': 'M30,6 C6,8 6,94 30,95 C54,94 54,8 30,6',
  '2': 'M8,28 C9,2 54,0 50,32 C47,56 16,74 6,96 L56,93',
  '6': 'M48,10 C26,-2 6,36 8,68 C10,100 52,100 50,70 C48,44 14,46 9,70',
  '5': 'M50,6 L14,7 L10,46 C30,33 55,44 52,70 C49,99 14,100 6,84',
  'K': 'M12,4 L11,96 M52,6 L12,60 M27,43 L55,96',
};
const ROOT_TXT: [string, number][] = [['2', 0], ['5', 82], ['0', 164], ['K', 262]];   // 250K, centred on 159
const RootText: React.FC<{f: number}> = ({f}) => {
  const glow = f < 209 ? 0 : f <= 212 ? 1 : mix(.85, .08, span(f, 213, 221)), bl = f <= 209 ? 0 : f <= 212 ? 1.5 * (f - 209) : 4 + 10 * span(f, 213, 220);
  const carved = f <= 208 ? .75 : span(f, 214, 222), draw = f >= 209 ? 1 : 0;   // ref f207/208: the carving is already there, dark
  const g = <g transform={`translate(${546 * S},${355 * S}) rotate(8) scale(${1.25 * S}) translate(-159,-50)`}>
    {ROOT_TXT.map(([c, x], i) => <path key={i} d={DIG[c]} transform={`translate(${x},${(i % 2) * 4})`} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}</g>;
  return <>
    {carved > 0 ? <AbsoluteFill><svg width={W} height={H}><filter id="cv"><feGaussianBlur stdDeviation="1.4"/></filter>
      <g stroke={`rgba(200,205,195,${.22 * carved})`} strokeWidth={9} filter="url(#cv)" transform={`translate(${2 * S},${2.5 * S})`}>{g}</g>
      <g stroke={`rgba(18,18,14,${.78 * carved})`} strokeWidth={8} filter="url(#cv)">{g}</g></svg></AbsoluteFill> : null}
    {glow > 0 && draw ? <AbsoluteFill style={{mixBlendMode: 'screen', filter: bl ? `blur(${bl}px)` : undefined}}><svg width={W} height={H}>
      <filter id="rg1" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter><filter id="rg2"><feGaussianBlur stdDeviation="2.2"/></filter>
      <g stroke={`rgba(190,215,255,${.95 * glow})`} strokeWidth={34} filter="url(#rg1)">{g}</g>
      <g stroke={`rgba(245,250,255,${glow})`} strokeWidth={9} filter="url(#rg2)">{g}</g>
      <g stroke={`rgba(255,255,255,${glow})`} strokeWidth={3.5}>{g}</g></svg></AbsoluteFill> : null}
  </>;
};
const Root: React.FC<{f: number}> = ({f}) => <AbsoluteFill style={{background: '#000'}}>
  {f === 207 ? <ZoomBlur src="s14_root.jpg" k={.035} n={9} cx={459} cy={300} z={1.07} ax={546} ay={355} style={{filter: 'brightness(1.08)'}}/>
    : <Plate src="s14_root.jpg" z={1.07 - .04 * span(f, 207, 225)} ax={546} ay={355} style={{filter: `brightness(${f <= 212 ? 1.08 : mix(1.08, .95, span(f, 212, 225))})`}}/>}
  {f <= 208 ? <AbsoluteFill style={{mixBlendMode: 'screen', background: `radial-gradient(ellipse 58% 62% at 50% 58%, rgba(230,242,245,0) 58%, rgba(230,242,245,${f === 207 ? .6 : .25}) 100%)`, filter: 'blur(10px)'}}/> : null}
  {f <= 208 ? <Neon id={`r${f}`} col="235,245,255" w={f === 207 ? 1.5 : .8} pts={f === 208 ? [[547, 345], [549, 346]] : f === 207 ? [[640, 282], [612, 300], [580, 323], [551, 344]] : trailOf(HOOK, f, 1.2, 16)} dot={f === 208}/> : null}
  {f >= 209 && f <= 213 ? <AbsoluteFill style={{mixBlendMode: 'screen', background: `radial-gradient(ellipse ${300 * S}px ${150 * S}px at ${546 * S}px ${355 * S}px, rgba(180,205,255,${f <= 212 ? .28 : .14}) 0%, rgba(150,180,255,0) 100%)`}}/> : null}
  <RootText f={f}/>
</AbsoluteFill>;

// ---- shot 10: amber desert, Vegas jump cuts (f226-236), white hits f237/240, walk + punch-in (f238-254), melt (f255-260), credit ----
const FIG = {w: 200, h: 465, cx: 99, feet: 442, fh: 417};        // s15_fig.png crop (1920-scale px), figure 417 px tall = .346 H
const JUMP: Record<number, [number, number, number] | null> = {226: [.30, .35, .68], 227: [.42, .21, .59], 228: null, 229: [.48, .19, .6]};
const Amber: React.FC<{f: number}> = ({f}) => {
  const j = f <= 229 ? JUMP[f] : [.49, .35, .67] as [number, number, number];
  const k = j ? j[1] / (FIG.fh / H) : 0;
  const drift = f >= 230 ? span(f, 230, 236) : 0;
  return <AbsoluteFill style={{background: '#000'}}>
    <Plate src="s15_empty.jpg" z={1.03 + .02 * drift} style={{filter: 'brightness(.97)'}}/>
    {j ? <Img src={C('s15_fig.png')} style={{position: 'absolute', width: FIG.w * k, height: FIG.h * k,
      left: j[0] * W - FIG.cx * k + drift * 4, top: j[2] * H - FIG.feet * k}}/> : null}
  </AbsoluteFill>;
};
const S16 = {x: 512, feet: 540};       // figure in s16_pad.jpg (REF px at z=1; figure .614 H tall)
const walkZ = (f: number) => f <= 239 ? 1.1 : mix(1.12, 1.72, inn(span(f, 241, 254)) * .7 + span(f, 241, 254) * .3);
const Walk16: React.FC<{f: number}> = ({f}) => {
  const z = walkZ(f);
  return <AbsoluteFill style={{background: '#000'}}>
    <Plate src="s16_pad.jpg" z={z} ax={S16.x} ay={S16.feet} dx={-30}/>
    {f === 241 ? <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(220,140,40,0) 40%, rgba(220,140,40,.75) 75%)'}}/> : null}
  </AbsoluteFill>;
};
const Credit: React.FC<{f: number}> = ({f}) => {
  if (f <= 260) return <FX n={`melt_${f}`}/>;
  if (f <= 262) return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}><filter id="res"><feTurbulence type="fractalNoise" baseFrequency=".0025 .004" numOctaves={4} seed={f}/>
    <feColorMatrix type="matrix" values="0 0 0 .3 -.12  0 0 0 .06 -.02  0 0 0 .03 -.01  0 0 0 0 1"/></filter><rect width={W} height={H} filter="url(#res)" opacity={f === 261 ? .22 : .32}/></svg></AbsoluteFill>;
  const sx = f === 263 ? 0 : f === 264 ? .4 : f === 265 ? .82 : 1, sy = f <= 264 ? .3 : f === 265 ? .75 : 1;
  const TW_ = .29 * W;
  return <AbsoluteFill style={{background: '#000'}}><svg width={W} height={H}>
    <filter id="cg" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    {f <= 265 ? <rect x={W / 2 - (f === 263 ? 70 : TW_ * .55 * Math.max(.4, sx))} y={.493 * H - 1.5} width={(f === 263 ? 140 : TW_ * 1.1 * Math.max(.4, sx))} height={3} fill={`rgba(255,255,255,${f === 263 ? .9 : .5})`} filter="url(#cg)"/> : null}
    {f >= 264 ? <g transform={`translate(${W / 2},${.493 * H}) scale(${sx},${sy})`} filter="url(#cg)">
      <text textAnchor="middle" dominantBaseline="central" fontFamily="Inter" fontWeight={800} fontStyle="italic" fontSize={27} textLength={TW_} lengthAdjust="spacingAndGlyphs" fill="#fff">© 2026 TOWN COPYRIGHT RESERVED</text></g> : null}
  </svg></AbsoluteFill>;
};

// ---- film finish: grain + gentle vignette on everything ----
const Finish: React.FC<{f: number}> = ({f}) => <>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.28) 110%)'}}/>
  <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: .22}}>
    <svg width={W} height={H}><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={f % 97} stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width={W} height={H} filter="url(#gr)"/></svg>
  </AbsoluteFill>
</>;

export const Clone04: React.FC = () => {
  const f = useCurrentFrame();
  let shot: React.ReactNode;
  if (f <= 36) shot = <Shot1 f={f}/>;
  else if (f <= 45) shot = <Shot2 f={f}/>;
  else if (f === 46) shot = <AbsoluteFill style={{background: '#f3f7f9'}}/>;
  else if (f === 47) shot = <Shot2 f={f}/>;
  else if (f <= 64) shot = <Eye f={f}/>;
  else if (f <= 68) shot = <Towers f={f}/>;
  else if (f <= 79) shot = <Walk f={f}/>;
  else if (f <= 94) shot = <Palm f={f}/>;
  else if (f <= 111) shot = <Horse f={f}/>;
  else if (f <= 161) shot = <Mid f={f}/>;
  else if (f <= 178) shot = <Car f={f}/>;
  else if (f <= 206) shot = <Photo f={f}/>;
  else if (f <= 225) shot = <Root f={f}/>;
  else if (f <= 236) shot = <Amber f={f}/>;
  else if (f === 237 || f === 240) shot = <AbsoluteFill style={{background: '#f6f3ee'}}/>;
  else if (f <= 254) shot = <Walk16 f={f}/>;
  else shot = <Credit f={f}/>;
  const white = f === 46 || f === 49 || f === 189 || f === 191 || f === 237 || f === 240;
  return <AbsoluteFill style={{background: '#000'}}>
    {shot}
    {!white && f < 263 ? <Finish f={f}/> : null}
    <Audio src={C('ref_audio.wav')}/>
  </AbsoluteFill>;
};
