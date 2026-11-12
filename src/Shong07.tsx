// Edit 07 — SHoNgxxBoNg "SAME GUY" on the RYLES ref audio (24 fps, 765 f).
// v3 (Fable restructure): four ideas, one continuous forward push, subject centred, designed voids, one hue per phase.
//  8.0  plaque, high-key cool white → optical bloom, crystal shards shed toward the lens over white
//  9.7  navy closes in, shards fly past with DOF (a few carry his face across the years) → two glints become catchlights
// 12.15 his eye, cyan-teal, slow push; one thin ring per onset (1M/5M/10M/24.1M) → through the black pupil
// 15.95 him in the orange jumpsuit, small in a black void, growing (Flow) → top light 18.4 → into the orange chest
// 19.05 orange bloom becomes the Monument Valley horizon glow, purple dusk → 19.75 pink frosted ruler, years play inside it
//       as an eye-strip → taut 21.85, roll 22.7 → fills frame, blooms white 24.5
// Perf rule: no CSS blur / backdrop-filter. Defocus = pre-baked *_b assets. Halation/softening = ffmpeg post pass.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {FC_EYES, FC_LOCK, PR_EYES, SCREEN} from './s07data';

export const FPS = 24, DUR_F = 765;
const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const C = (f: string) => staticFile(`s07/${f}`);
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
const ss = (x: number) => {x = clamp(x); return x * x * (3 - 2 * x);};
const io = (x: number) => {x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const ein = (x: number) => Math.pow(clamp(x), 3);
const eout = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const hash = (i: number) => {const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};
const pulse = (t: number, at: number, a = .04, d = .35) => t < at - a ? 0 : t < at ? (t - at + a) / a : Math.exp(-(t - at) / d);
const lerpTab = (tab: number[][], x: number, k: number) => {
  if (x <= tab[0][0]) return tab[0][k];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) return mix(tab[i - 1][k], tab[i][k], (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]));
  return tab[tab.length - 1][k];
};
const rgb = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(mix(v, b[i], t))).join(',')})`;

// frame-sequence clips (24 fps jpgs), src in seconds
const N: Record<string, number> = {p_reveal: 240, p_march: 240, p_close: 240, amer_d: 96, hand18: 96, eyeP: 96, plqA: 82, plqB: 62, plqB_b: 62, amer_b: 96, void: 96, room: 95,
  'y18/ga': 24, 'y18/gb': 24, 'y18/gc': 192, 'y18/fc': 192, 'y18/ga_b': 24, 'y18/gb_b': 24, 'y18/gc_b': 192};
const seq = (name: string, src: number) => C(`${name}/${String(clamp(Math.round(src * 24) + 1, 1, N[name])).padStart(3, '0')}.jpg`);
const Seq: React.FC<{name: string; src: number; z?: number; ox?: number; oy?: number; filter?: string; style?: React.CSSProperties}> =
  ({name, src, z = 1, ox = .5, oy = .5, filter, style}) =>
    <AbsoluteFill style={{transformOrigin: `${ox * W}px ${oy * H}px`, transform: `scale(${z})`, ...style}}>
      <Img src={seq(name, src)} style={{width: W, height: H, objectFit: 'cover', filter}}/>
    </AbsoluteFill>;

// ---------- timeline (seconds) ----------
const T = {a0: 8.0, light: 8.6, navy: 9.7, dark: 11.5, iris: 12.15, pupil: 15.65, void: 15.95, motes: 16.35, top: 18.4,
  orange: 19.05, ruler: 19.75, taut: 21.85, roll: 22.7, fill: 23.5, white: 24.5};

// ---------- A: crystal shards (3D, fly toward the lens) ----------
const PLQ = [.47 * W, .27 * H];                       // plaque in plqB
const F = 900;                                        // focal length (px)
const FACES = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2026];
const SHARDS = Array.from({length: 60}, (_, i) => {
  const ts = 8.68 + Math.pow(hash(i * 3.1), 1.3) * 2.3;          // spawn time, dense on the lyric
  const face = i % 5 === 2 && ts > 9.45 ? FACES[(i * 3) % FACES.length] : 0;
  const ang = hash(i * 5.7) * Math.PI * 2, spread = 120 + hash(i * 7.3) * 380;
  const k = 3 + Math.floor(hash(i * 9.1) * 3);                    // crystal polygon variant
  return {i, ts, face, z0: 7, v: 4.2 + hash(i * 2.9) * 3.4, dx: Math.cos(ang) * spread, dy: Math.sin(ang) * spread * .7,
    s0: face ? 230 : 60 + hash(i * 4.4) * 110, rot0: hash(i * 6.6) * 360, vr: (hash(i * 8.8) - .5) * 160, k};
});
const POLY = ['50% 0%, 100% 38%, 78% 100%, 18% 92%, 0% 30%', '20% 0%, 100% 12%, 82% 100%, 0% 70%', '50% 0%, 100% 100%, 0% 100%',
  '0% 18%, 70% 0%, 100% 62%, 40% 100%', '30% 0%, 100% 30%, 70% 100%, 0% 80%, 10% 20%', '50% 0%, 95% 50%, 50% 100%, 5% 50%'];

const Shards: React.FC<{t: number; navy: number}> = ({t, navy}) => <AbsoluteFill>
  {SHARDS.map(s => {
    const age = t - s.ts; if (age < 0) return null;
    const z = s.z0 - s.v * age; if (z < .25) return null;
    const ox = PLQ[0] + (CX - PLQ[0]) * span(t, 9.4, 11.2), oy = PLQ[1] + (CY * .9 - PLQ[1]) * span(t, 9.4, 11.2);
    const wx = (ox - CX) * s.z0 / F + s.dx / F * age * 3.2, wy = (oy - CY) * s.z0 / F + s.dy / F * age * 3.2;
    const x = CX + wx * F / z, y = CY + wy * F / z, sz = s.s0 * 2.2 / z;
    const near = z < 1.1, far = z > 4.5;                          // DOF: near + far use the baked blur
    const op = clamp(age * 6) * clamp((z - .25) / .5) * (far ? .55 : 1);
    if (x < -sz || x > W + sz || y < -sz || y > H + sz) return null;
    const rot = s.rot0 + s.vr * age;
    if (s.face) return <div key={s.i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, opacity: op * .9,
      transform: `rotate(${rot * .35}deg)`, clipPath: `polygon(${POLY[s.k]})`, mixBlendMode: 'screen'}}>
      {/* the face seen THROUGH glass: refracted twice (offset, mirrored, colour-split), cool-tinted, glass sheen on top */}
      <Img src={C(`${near || far ? 'faces_b' : 'faces'}/f${s.face}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        filter: 'saturate(.35) brightness(.85) contrast(1.1)', opacity: .8}}/>
      <Img src={C(`faces_b/f${s.face}.jpg`)} style={{position: 'absolute', left: '-18%', top: '-6%', width: '136%', height: '112%', objectFit: 'cover',
        transform: 'scaleX(-1)', opacity: .35, filter: 'hue-rotate(160deg) saturate(.6)'}}/>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${rot}deg, rgba(225,240,255,.75) 0%, rgba(60,95,180,.15) 38%, rgba(0,0,0,0) 55%, rgba(200,225,255,.55) 100%)`}}/>
    </div>;
    // crystal: white-cyan glass over white, catches navy later
    const glass = navy < .5
      ? `linear-gradient(${rot}deg, rgba(255,255,255,.95), rgba(95,130,200,.7) 45%, rgba(255,255,255,.9))`
      : `linear-gradient(${rot}deg, rgba(220,235,255,.9), rgba(60,90,170,.35) 50%, rgba(235,245,255,.75))`;
    return <div key={s.i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz * .8,
      opacity: op * (near ? .45 : .9), transform: `rotate(${rot}deg)`, clipPath: `polygon(${POLY[s.k]})`, background: glass}}/>;
  })}
</AbsoluteFill>;

// optical glint: soft halo + anamorphic streak (gradients only, no blur)
const Glint: React.FC<{x: number; y: number; a: number; s: number; warm?: boolean}> = ({x, y, a, s, warm}) => a <= .01 ? null :
  <div style={{position: 'absolute', left: x, top: y, opacity: clamp(a), mixBlendMode: 'screen'}}>
    <div style={{position: 'absolute', left: -s, top: -s, width: 2 * s, height: 2 * s, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${warm ? 'rgba(255,170,90,.55)' : 'rgba(200,225,255,.5)'} 12%, transparent 62%)`}}/>
    <div style={{position: 'absolute', left: -s * 3, top: -s * .05, width: s * 6, height: s * .1,
      background: `radial-gradient(ellipse, rgba(255,255,255,.9), ${warm ? 'rgba(255,150,70,.35)' : 'rgba(150,190,255,.35)'} 40%, transparent 70%)`}}/>
  </div>;

// ---------- A2: the diamond — its facets refract the plaque, then his eye; it shrinks into the iris ----------
const GEM0 = 9.35, SPARK = [10.05, 10.65, 10.98, 11.57];
type Pt = [number, number];
const Gem: React.FC<{t: number; aSrcB: number; plqZ: number; p0: Pt}> = ({t, aSrcB, plqZ, p0}) => {
  const shrink = io(span(t, GEM0, 10.45)), dive = io(span(t, 11.45, 12.1));
  const R = (t < 11.45 ? mix(1400, 340, shrink) : mix(340, 85, dive)) * (1 + .025 * Math.sin((t - GEM0) * 5.2) * (1 - dive));
  const gx = mix(CX, p0[0], dive), gy = mix(CY * .96, p0[1], dive);
  const rot = (18 * (t - GEM0) + 40 * dive) * Math.PI / 180;
  const k = ss(span(t, GEM0, 9.8)) * (1 - io(span(t, 11.7, 12.1)));          // refraction strength: 0 at both ends (seamless)
  const em = ss(span(t, 11.3, 11.72));                                         // plaque → eye inside the facets
  const eSrc = Math.max(0, EYE_S0 + (t - T.iris) * EYE_V);
  const yaw = (16 * Math.sin((t - GEM0) * 2.1) + 6) * (1 - dive) * Math.PI / 180, fy = Math.cos(yaw);   // slow Y-tumble → foreshortening
  const P = (a: number, r: number): Pt => [gx + Math.cos(a) * r * fy, gy + Math.sin(a) * r];
  const Tv = (i: number) => P(rot + i * Math.PI / 4, R * .52), Ov = (i: number) => P(rot + (i + .5) * Math.PI / 4, R);
  const fac: {pts: Pt[]; kind: number; a: number}[] = [{pts: [0, 1, 2, 3, 4, 5, 6, 7].map(Tv), kind: 0, a: 0}];
  for (let i = 0; i < 8; i++) {
    fac.push({pts: [Tv(i), Tv(i + 1), Ov(i)], kind: 1, a: rot + (i + .5) * Math.PI / 4});
    fac.push({pts: [Ov(i - 1), Tv(i), Ov(i)], kind: 2, a: rot + i * Math.PI / 4});
  }
  // each edge glints only when it faces the travelling light (selective, varied width)
  const lA = rot * 2.6 + 1.2 + (t - GEM0) * .9;
  const eSeen = new Set<string>(), edges: [Pt, Pt, number][] = [];
  fac.forEach(fc => fc.pts.forEach((a, i) => {
    const b = fc.pts[(i + 1) % fc.pts.length], key = [a, b].map(p => p.map(v => v.toFixed(0)).join(':')).sort().join('|');
    if (eSeen.has(key)) return; eSeen.add(key);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    edges.push([a, b, Math.pow(Math.abs(Math.cos(ang - lA)), 6) * (.55 + .45 * hash(edges.length * 1.7))]);
  }));
  const content = <>
    {em < 1 && <AbsoluteFill style={{transform: `translate(${(gx - PLQ[0]) * shrink}px, ${(gy - PLQ[1]) * shrink}px)`, opacity: 1 - em}}>
      <Seq name="plqB" src={aSrcB} z={plqZ} ox={.47} oy={.3} filter={`saturate(.3) contrast(1.05) brightness(${mix(1.3, .95, shrink)})`}/>
      <AbsoluteFill style={{background: '#d6e4ff', mixBlendMode: 'soft-light', opacity: .55}}/>
    </AbsoluteFill>}
    {em > 0 && <AbsoluteFill style={{transform: `translate(${gx - p0[0]}px, ${gy - p0[1]}px)`, opacity: em}}>
      <Seq name="eyeP" src={eSrc} z={1} ox={lerpTab(PUP, EYE_S0, 1)} oy={lerpTab(PUP, EYE_S0, 2)} filter={`saturate(.3) contrast(1.12) brightness(${mix(1.25, .82, dive)})`}/>
      <AbsoluteFill style={{background: '#1aa6b4', mixBlendMode: 'color', opacity: .55}}/>
      <AbsoluteFill style={{background: '#0d5e6e', mixBlendMode: 'soft-light', opacity: .5}}/>
    </AbsoluteFill>}
  </>;
  const poly = (pts: Pt[]) => `polygon(${pts.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(',')})`;
  const op = ss(span(t, GEM0 - .02, GEM0 + .06)) * (1 - ss(span(t, T.iris + .02, T.iris + .22)));
  const edgeA = ss(span(t, GEM0, GEM0 + .3)) * (1 - io(span(t, 11.85, 12.15)));
  return <AbsoluteFill style={{opacity: op}}>
    {/* caustic glow around the stone once it sits on the dark */}
    <div style={{position: 'absolute', left: gx - R * 1.9, top: gy - R * 1.9, width: R * 3.8, height: R * 3.8, borderRadius: '50%', mixBlendMode: 'screen',
      background: 'radial-gradient(circle, rgba(140,200,255,.32) 0%, rgba(60,110,200,.12) 35%, transparent 62%)', opacity: ss(span(t, 9.9, 10.5))}}/>
    {fac.map((fc, i) => {
      const light = Math.pow(Math.max(0, Math.cos(fc.a * 1 - rot * 3.5 - 1.1)), 3);       // light rolls across the crown as it turns
      const bright = fc.kind === 0 ? 1 : mix(1, .62 + .75 * light, k);
      const tr = fc.kind === 0 ? `scale(${1 + .04 * k})`
        : fc.kind === 1 ? `translate(${Math.cos(fc.a) * 46 * k}px, ${Math.sin(fc.a) * 46 * k}px) scale(${1 + .12 * k})`
        : `rotate(${(hash(i * 2.3) - .5) * 50 * k}deg) scale(${1 + .24 * k})`;
      return <AbsoluteFill key={i} style={{clipPath: poly(fc.pts)}}>
        <AbsoluteFill style={{transformOrigin: `${gx}px ${gy}px`, transform: tr, filter: bright === 1 ? undefined : `brightness(${bright.toFixed(3)})`}}>{content}</AbsoluteFill>
        {fc.kind > 0 && <AbsoluteFill style={{mixBlendMode: 'screen', opacity: k * (.12 + .4 * light),
          background: `linear-gradient(${(fc.a * 180 / Math.PI + 90).toFixed(1)}deg, rgba(255,255,255,0) 20%, rgba(215,238,255,.9) 52%, rgba(255,255,255,0) 80%)`}}/>}
      </AbsoluteFill>;
    })}
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: edgeA}}>
      {edges.map(([a, b, g], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(200,230,255,1)" strokeOpacity={.04 + .22 * g} strokeWidth={2 + 6 * g} strokeLinecap="round"/>)}
      {edges.map(([a, b, g], i) => <line key={`b${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#f6faff" strokeOpacity={.1 + .85 * g} strokeWidth={.7 + 1.6 * g} strokeLinecap="round"/>)}
    </svg>
    {SPARK.map((s, j) => {const v = Ov(j * 3 + 1), sz = [1.25, .6, .95, .45][j], dur = [.32, .18, .26, .15][j];
      return <Glint key={j} x={v[0]} y={v[1]} a={pulse(t, s, .025, dur) * [1, .75, .9, .7][j]} s={mix(170, 95, shrink) * sz}/>;})}
    <Glint x={gx} y={gy} a={pulse(t, 11.91, .03, .22) * 1.2} s={260}/>
  </AbsoluteFill>;
};

// ---------- B: eye ----------
// pupil centre (frac) + pupil radius (px) in eyeP by src second (measured on frames)
const PUP = [[0, .563, .488, 6], [.5, .569, .483, 9], [1.0, .573, .5, 14], [1.25, .6, .505, 20], [1.6, .55, .48, 35], [2.0, .497, .465, 60],
  [2.66, .494, .463, 88], [3.8, .496, .48, 220], [4.0, .496, .48, 225]];
const EYE_S0 = 1.6, EYE_V = (3.9 - EYE_S0) / (T.pupil - T.iris);
const BEATS = [14.85, 15.1, 15.5];
const PUP_END = [lerpTab(PUP, 3.9, 1), lerpTab(PUP, 3.9, 2)];
const PR_END = lerpTab(PUP, 3.9, 3) * 1.06 * 3.4 * 1.42 * 1.05;      // pupil radius at the cut (passes the frame corners)

// ---------- A→B: inside the diamond (push into the plaque's facet → interior → pull back → falling stones → iris ring) ----------
const DI = [.47 * W, .483 * H];                                       // his pupil at 12.15
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};
const RING_N = 10, T_RING = 10.85;
const DROPS = Array.from({length: 24}, (_, i) => {
  const layer = i < 9 ? 0 : i < 17 ? 1 : 2, ring = i >= 9 && i < 9 + RING_N ? i - 9 : -1;
  return {k: 1 + (i * 5) % 8, layer, ring, x: .04 + .92 * rnd(i), ym: ring >= 0 ? .15 + .7 * rnd(i + 50) : -.15 + 1.3 * rnd(i + 50),
    rot: rnd(i + 90) * 360, spin: (rnd(i + 130) - .5) * 200, s: [70, 150, 280][layer] * (.8 + .4 * rnd(i + 170)), v: [360, 780, 1450][layer] * (.85 + .3 * rnd(i + 210))};
});
const sInt = (t: number) => 2.2 * Math.pow(9 / 2.2, Math.pow(span(t, 9.22, 12.1), 1.6));      // one push through the stone, never reverses
const rotInt = (t: number) => -9 * (t - 9.22) - 30 * io(span(t, 10.0, 12.1));
const Stone: React.FC<{k: number; x: number; y: number; s: number; r: number; a: number; blur?: number; trail?: number}> = ({k, x, y, s, r, a, blur = 0, trail = 0}) => a <= .01 ? null :
  <>{Array.from({length: trail > 6 ? 7 : 1}, (_, j) => <Img key={j} src={C(`dia/d${k}.png`)} style={{position: 'absolute', left: x - s / 2, top: y - s / 2 - trail * .5 * j / 6, width: s, height: s,
    transform: `rotate(${r}deg)`, mixBlendMode: 'screen', opacity: trail > 6 ? a * (j ? .32 : .75) : a, filter: blur > .2 ? `blur(${blur}px)` : undefined}}/>)}</>;

// ---------- B2: 2018 bedroom (Flow dolly) + real 2018 footage on the monitor ----------
const SWID = SCREEN.map(r => r[2] - r[0]);
const roomK = (sw: number) => {                       // fractional Flow frame whose screen width = sw
  if (sw <= SWID[0]) return 0;
  for (let i = 1; i < SWID.length; i++) if (sw <= SWID[i]) return i - 1 + (sw - SWID[i - 1]) / (SWID[i] - SWID[i - 1]);
  return SWID.length - 1;
};
const FC = {x: 17 / 1280, y: 232 / 720, w: 318 / 1280, h: 179 / 720};   // facecam rect inside the 2018 gameplay frame
const FCS = 1.55, S_END = FCS / FC.w;                // facecam shown at 1.55x, eye-locked at frame centre
// unified zoom: room push hands its log-scale velocity to a Hermite curve that peaks, then eases out into the drift
const ZD = .85, Z1 = 18.4 + ZD, Z_LZ = Math.log((FCS / FC.w) / 1.04);
const Z_M0 = Math.log(8.67) * 1.3 / (18.4 - 15.65) * ZD, Z_M1 = .03 / (19.75 - Z1) * ZD;
const hz = (u: number) => Z_M0 * (u ** 3 - 2 * u * u + u) + Z_LZ * (-2 * u ** 3 + 3 * u * u) + Z_M1 * (u ** 3 - u * u);
const hzd = (u: number) => Z_M0 * (3 * u * u - 4 * u + 1) + Z_LZ * (6 * u - 6 * u * u) + Z_M1 * (3 * u * u - 2 * u);
const fmask = (f: number): React.CSSProperties => {
  if (f < .05) return {};
  const m = `linear-gradient(90deg, transparent, #000 ${f}%, #000 ${100 - f}%, transparent), linear-gradient(180deg, transparent, #000 ${f * 1.4}%, #000 ${100 - f * 1.4}%, transparent)`;
  return {maskImage: m, WebkitMaskImage: m, maskComposite: 'intersect', WebkitMaskComposite: 'source-in'} as React.CSSProperties;
};
const fcI = (t: number) => clamp(Math.round((t - T.motes) * 24), 0, FC_EYES.length - 1);
const DUST = Array.from({length: 16}, (_, i) => ({x: hash(i * 4.1), y: hash(i * 6.3), s: 2 + hash(i * 8.9) * 4, ph: hash(i * 2.7)}));

// ---------- 0: intro — 2018 webcam → floor of his faces, one row per year, flown over → white ----------
const I = {glow: .25, open: 1.05, tag: 1.6, click: 4.25, up: 7.3};
// ---------- D: outro — whip into the prison-series studio (now), dusk cowboy emerges from the dark, card ----------
// "The Hatch": lights out → slam on the kick (23.75) → eyes in the slot go live (prison) → slot opens + pull back (24.01) → land (24.688)
// v13 "Break open": felt dim → strip eyes go live → on the kick the ruler splits, halves fly apart, pull back through the gap (no black hold)
const HT = {lo: 23.30, live: 23.42, slam: 23.75, rel: 24.01, land: 24.688};
const hEase = (u: number) => 1 - Math.pow(1 - Math.pow(clamp(u), 1.6), 3);
const RS = 1.03;                                                    // ruler scale frozen at the slam
const SLOT = {x: CX + 5 * RS, y: CY - 7.7 * RS, ioc: 205 * RS};      // eye midpoint + spacing of the 2026 strip in the slot
const shakeY = (t: number) => t < HT.slam ? 0 : 4 * Math.exp(-(t - HT.slam) / .12) * Math.cos((t - HT.slam) * 70);
const rollAt = (t: number) => t < HT.slam ? -5 - 4 * io(span(t, 22.6, 23.6)) : mix(-9, 0, eout(span(t, HT.slam, 24.25)));
const eoutX = (u: number) => u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u));
const apL = (t: number) => SH / 2 * Math.exp(Math.log(9) * eoutX(span(t, HT.slam, 24.2)));    // aperture half-height (ruler-local px)
const apW = (t: number) => SW * Math.exp(Math.log(3.2) * eoutX(span(t, HT.slam, HT.rel)));    // aperture width (ruler-local px)
// pull-back weight: 1 at the kick, .55 on the 24.01 onset, 0 on 24.688 (velocity-matched legs)
const pullG = (t: number) => t < HT.slam ? 1 : t < HT.rel ? 1 - .45 * (u => .3 * u + .7 * Math.pow(u, 2.93))(span(t, HT.slam, HT.rel))
  : .55 * Math.pow(1 - span(t, HT.rel, HT.land), 5);
const prSrc = (t: number) => .25 + (t - HT.slam);
const prEye = (src: number) => PR_EYES[clamp(Math.round(src * 24), 0, PR_EYES.length - 1)];
const PRF = 'brightness(1.02) saturate(.95) contrast(.95)';
const O = {whip: 23.75, dark: 25.0, dusk: 26.25, card: 29.7, end: 31.875};

// ---------- C: ruler ----------
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2026];
const Y0 = 20.1, Y1 = 23.3;
const TICK = 300, RH = 210;
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const SW = 900, SH = SW * 250 / 1100;                 // eye-strip window in the ruler body

const Ruler: React.FC<{t: number; yi: number}> = ({t, yi}) => {
  const slide = eout(span(t, T.ruler, 20.7));
  const taut = pulse(t, T.taut, .03, .22);
  const roll = rollAt(t), slam = t >= HT.slam ? 1 : 0, bodyA = 1 - slam;
  const liveA = ss(span(t, HT.live, 23.70)), tintA = 1 - span(t, HT.live, 23.72);
  const ps = prSrc(t), pe = prEye(ps);
  const grow = 0;
  const sc = mix(1, 14, grow) * (1 + .03 * span(t, T.ruler, T.fill));
  const yr = 2018 + (yi < 6 ? yi : 6 + (yi - 6) * 2);  // tick position (2025 skipped in the plates)
  const track = -((yr - 2018) * TICK) + (1 - slide) * 2700;
  const L = 9 * TICK + 1800, x0 = 900;
  const count = 24.1e6 * Math.pow(clamp((t - Y0) / (23.5 - Y0)), 2.1);
  const stripOp = ss(span(t, 20.0, 20.5));
  return <AbsoluteFill style={{transformOrigin: `${CX}px ${CY}px`, transform: `translateY(${shakeY(t)}px) rotate(${roll}deg) scale(${sc}) scaleY(${1 + taut * .07})`}}>
    {/* frosted pink body */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2, width: L, height: RH, borderRadius: 8,
      background: 'linear-gradient(180deg, rgba(255,226,242,.78) 0%, rgba(246,176,214,.62) 50%, rgba(255,222,240,.78) 100%)',
      boxShadow: '0 0 0 1.5px rgba(255,255,255,.85) inset, 0 0 30px rgba(255,255,255,.45), 0 0 130px rgba(255,110,195,.55)', opacity: bodyA}}/>
    {/* hot specular core streak */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2 + RH * .14, width: L, height: RH * .16, mixBlendMode: 'screen', opacity: bodyA,
      background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.85) 45%, rgba(255,255,255,0))'}}/>
    {/* the years, eye-locked, inside the ruler (window fixed under the cursor) */}
    <div style={{position: 'absolute', left: CX - SW / 2, top: CY - SH / 2, width: SW, height: SH, opacity: stripOp * slide * (1 - slam), overflow: 'hidden',
      maskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)'}}>
      {YEARS.map((y, i) => {
        const d = Math.abs(yi - i), a = i === YEARS.length - 1 && yi >= i ? 1 : clamp(1.5 - d * 1.5);
        return a <= 0 ? null : <Img key={y} src={C(`strips/y${y}.jpg`)} style={{position: 'absolute', inset: 0, width: SW, height: SH, opacity: a}}/>;
      })}
      {liveA > 0 && <div style={{position: 'absolute', inset: 0, opacity: liveA}}>
        <Img src={seq('p_reveal', ps)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', filter: PRF,
          transform: `translate(${SW / 2 + 5}px, ${SH / 2 - 7.7}px) rotate(${-pe[3]}rad) scale(${205 / pe[2]}) translate(${-pe[0]}px, ${-pe[1]}px)`}}/>
        <div style={{position: 'absolute', inset: 0, background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .3}}/>
      </div>}
      <div style={{position: 'absolute', inset: 0, background: 'rgba(250,170,215,.32)', mixBlendMode: 'soft-light', opacity: tintA}}/>
      <div style={{position: 'absolute', inset: 0, opacity: tintA, background: 'linear-gradient(180deg, rgba(255,230,245,.35), rgba(255,230,245,0) 30%, rgba(255,230,245,0) 70%, rgba(255,230,245,.35))'}}/>
    </div>
    {/* on the kick: the ruler splits along its long axis, the halves fly apart (motion-blurred), their rims are the aperture edge */}
    {slam > 0 && t < 24.2 && (() => {
      const dA = Math.abs(apL(t + 1 / 48) - apL(t - 1 / 48)), n = dA > 6 ? 6 : 1;
      return <div style={{position: 'absolute', inset: 0, opacity: 1 - ss(span(t, 23.95, 24.15))}}>
        {Array.from({length: n}, (_, j) => {
          const a = apL(t + (n === 1 ? 0 : (j / (n - 1) - .5) * .6 / 24));
          const half = (top: boolean) => <div style={{position: 'absolute', left: CX - x0 + track, width: L, height: RH / 2, top: top ? CY - a - RH / 2 : CY + a, borderRadius: 8,
            background: top ? 'linear-gradient(180deg, rgba(255,226,242,.78), rgba(246,176,214,.62))' : 'linear-gradient(180deg, rgba(246,176,214,.62), rgba(255,222,240,.78))',
            boxShadow: '0 0 0 1.5px rgba(255,255,255,.85) inset, 0 0 30px rgba(255,255,255,.45), 0 0 90px rgba(255,110,195,.5)'}}/>;
          const rim = (y: number) => <div style={{position: 'absolute', left: CX - x0 + track, width: L, top: y - 1.5, height: 3, background: 'rgba(255,240,250,.95)',
            boxShadow: '0 0 18px rgba(255,200,235,.9), 0 0 50px rgba(255,120,200,.6)'}}/>;
          return <div key={j} style={{position: 'absolute', inset: 0, opacity: 1 / (j + 1)}}>{half(true)}{half(false)}{rim(CY - a)}{rim(CY + a)}</div>;
        })}
      </div>;
    })()}
    {/* ticks + micro-type, moving with the body */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2, width: L, height: RH, opacity: 1 - slam}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 8, height: 14, background: 'linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,0))'}}/>
      {Array.from({length: 9 * 10 + 1}, (_, k) => {
        const major = k % 10 === 0, x = x0 + (k / 10) * TICK;
        return <div key={k} style={{position: 'absolute', left: x, top: 0, width: major ? 2.5 : 1.2, height: major ? 34 : (k % 5 === 0 ? 22 : 13), background: 'rgba(95,25,70,.85)'}}/>;
      })}
      {Array.from({length: 9}, (_, k) => {
        const y = 2018 + k, on = 1 - clamp(Math.abs(yr - y) * 1.2);
        return <div key={y} style={{position: 'absolute', left: x0 + k * TICK - 80, width: 160, top: 38, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500,
          fontSize: 19, letterSpacing: 8, color: `rgba(95,25,70,${.55 + .45 * on})`}}>{y}</div>;
      })}
    </div>
    {/* counter as micro-type on the lower edge */}
    <div style={{position: 'absolute', left: CX + 24, top: CY + RH / 2 - 34, fontFamily: 'Inter', fontWeight: 500, fontSize: 18, letterSpacing: 7,
      fontVariantNumeric: 'tabular-nums', color: 'rgba(110,40,85,.75)', opacity: span(t, Y0, Y0 + .3) * (1 - slam)}}>{fmt(count)} SUBSCRIBERS</div>
    {/* cursor hairline */}
    <div style={{position: 'absolute', left: CX - 1, top: CY - RH / 2 - 26, width: 2, height: RH + 52, background: 'rgba(255,255,255,.95)',
      boxShadow: '0 0 10px rgba(255,255,255,.9)', opacity: slide * (1 - slam)}}/>
  </AbsoluteFill>;
};


// eye-locked years montage: cuts on the vocal hits, one accelerating push, punch on every cut
const MONT: [number, number][] = [[4.25, 2018], [5.61, 2019], [5.96, 2020], [6.49, 2021], [6.67, 2022], [7.13, 2023], [7.67, 2024], [7.84, 2026]];
const EYE_Y = .40 * H;
// per-year eye-lock (CSS matrix C,S,tx,ty at origin 0 0; YuNet-measured) → both eyes land on (.435,.40)/(.565,.40)
const YLOCK: Record<number, number[]> = {2019: [.9886, .0034, 0, 6.8], 2020: [1.0943, .001, -87.7, -45.1], 2021: [.9513, -.0661, 4.8, 78.8],
  2022: [1.0049, .046, 31.4, -73.6], 2023: [1.1606, .0093, -138.9, -90.0], 2024: [1.0522, -.0927, -111.7, 62.0], 2026: [1.0054, -.0562, -32.4, 52.8]};
const mtx = (m: number[]) => `matrix(${m[0]},${m[1]},${-m[1]},${m[0]},${m[2]},${m[3]})`;
// A: one tilt-up whip carries the hand frame down and drops the 2018 face in from above (no cut, no flash)
const WT: [number, number][] = [[4.125, 0], [4.17, .1], [4.21, .52], [4.25, .93], [4.29, .995], [4.33, 1.008], [4.46, 1]];
const WTAN = WT.map((_, i) => {                                       // Fritsch-Carlson monotone tangents, 0 at ends/extrema
  if (i === 0 || i === WT.length - 1) return 0;
  const d0 = (WT[i][1] - WT[i - 1][1]) / (WT[i][0] - WT[i - 1][0]), d1 = (WT[i + 1][1] - WT[i][1]) / (WT[i + 1][0] - WT[i][0]);
  return d0 * d1 <= 0 ? 0 : 3 * d0 * d1 / (2 * Math.max(d0, d1) + Math.min(d0, d1));
});
const whipD = (t: number) => {
  if (t <= WT[0][0]) return 0;
  if (t >= WT[WT.length - 1][0]) return H;
  let i = 0; while (t > WT[i + 1][0]) i++;
  const [x0, y0] = WT[i], [x1, y1] = WT[i + 1], h = x1 - x0, u = (t - x0) / h, u2 = u * u, u3 = u2 * u;
  return H * ((2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * WTAN[i] + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * WTAN[i + 1]);
};
const hSrc = (t: number) => t < 4.125 ? mix(0, 3.96, span(t, I.open, 4.125)) : mix(3.96, 2.9, span(t, 4.125, I.click));
const montZ = (t: number) => {
  let z = 1 + .2 * ein(span(t, I.click, 7.84)) + 1.6 * ein(span(t, 7.86, T.a0));
  for (const [c] of MONT) if (t >= c && c !== I.click) z *= 1 + .06 * Math.exp(-(t - c) / .16);
  return z;
};
const Intro: React.FC<{t: number}> = ({t}) => {
  const cur = MONT.filter(m => t >= m[0]).pop();
  const track = mix(48, 22, eout(span(t, I.tag, I.tag + 1.4)));
  const yrA = span(t, I.tag, I.tag + .8) * (1 - span(t, 7.8, 7.88));
  const label = <div style={{position: 'absolute', left: 0, right: 0, top: H - 210, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontWeight: 300,
    fontSize: 78, letterSpacing: track, paddingLeft: track, color: '#fff', opacity: .92 * yrA, textShadow: '0 2px 34px rgba(0,0,0,.55)'}}>{cur ? cur[1] : 2018}</div>;
  if (t < 4.125) {
    // a hairline of light opens into a slit; the 2018 webcam is behind it, over-exposed, settling
    const line = eout(span(t, I.glow, I.open)), lineA = span(t, I.glow, I.glow + .08) * (1 - span(t, I.open + .1, I.open + .5));
    const slit = eout(span(t, I.open, I.open + .65)), mh = slit * 62;
    const expo = 1 + 1.3 * (1 - eout(span(t, I.open, I.open + .8)));
    const ant = ein(span(t, 4.04, 4.125)), hs = mix(1.12, 1, span(t, I.open, I.click)) * (1 + .035 * ant);
    const hsrc = hSrc(t);
    const mask = `linear-gradient(180deg, transparent ${50 - mh - 7}%, #000 ${50 - mh}%, #000 ${50 + mh}%, transparent ${50 + mh + 7}%)`;
    const edge = (y: number) => <div style={{position: 'absolute', left: CX - line * W * .6, width: line * W * 1.2, top: y - 1, height: 2, opacity: lineA,
      background: 'linear-gradient(90deg, transparent, rgba(235,246,255,.95) 25%, #fff 50%, rgba(235,246,255,.95) 75%, transparent)'}}/>;
    return <AbsoluteFill style={{background: '#000'}}>
      {t >= I.open && <AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask}}>
        <AbsoluteFill style={{transform: `translateY(${10 * ant}px)`}}>
          <Seq name="hand18" src={hsrc} z={hs} filter={`saturate(.75) contrast(1.06) brightness(${.95 * expo})`}/>
        </AbsoluteFill>
        <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .45}}/>
      </AbsoluteFill>}
      {lineA > 0 && <>
        <div style={{position: 'absolute', left: CX - line * W * .75, width: line * W * 1.5, top: CY - 90, height: 180, opacity: lineA * (1 - slit * .7), mixBlendMode: 'screen',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(150,205,255,.5) 0%, rgba(60,120,200,.15) 35%, transparent 68%)'}}/>
        {edge(CY - mh / 100 * H)}{edge(CY + mh / 100 * H)}
      </>}
      {label}
    </AbsoluteFill>;
  }
  const face18 = (ts: number, dy: number, op: number, key: string) => {
    const fi = clamp(Math.round((ts - I.click) * 24), 0, FC_LOCK.length - 1), g = eout(span(ts, I.click, 4.55));
    return <AbsoluteFill key={key} style={{transform: `translateY(${dy}px)`, opacity: op, overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${CX}px ${EYE_Y}px`, transform: `scale(${1.1 * montZ(ts)})`}}>
        <Img src={C(`y18/fc/${String(fi + 1).padStart(3, '0')}.jpg`)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0',
          transform: mtx(FC_LOCK[fi]), filter: `saturate(${.72 * mix(.85, 1, g)}) contrast(1.08) brightness(${mix(1.3, 1, g)})`}}/>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .4}}/>
    </AbsoluteFill>;
  };
  if (t < 4.46) {
    const dD = Math.abs(whipD(t + 1 / 48) - whipD(t - 1 / 48)), nW = dD > 8 ? 12 : 1;
    const ts = Array.from({length: nW}, (_, j) => nW === 1 ? t : t + (j / (nW - 1) - .5) * .6 / 24);
    const hk = span(t, 4.125, I.click);
    return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {ts.map((u, j) => {
        const D = whipD(u);
        return <AbsoluteFill key={j} style={{opacity: 1 / (j + 1)}}>
          {D < H && <AbsoluteFill style={{transform: `translateY(${D + 10}px)`, overflow: 'hidden'}}>
            <Seq name="hand18" src={hSrc(u)} z={1.035} filter={`saturate(.75) contrast(1.06) brightness(${mix(.95, 1.45, hk)})`}/>
            <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .45 * (1 - hk)}}/>
          </AbsoluteFill>}
          {face18(u, D - H, 1, 'f')}
        </AbsoluteFill>;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,.55) 100%)'}}/>
      {label}
    </AbsoluteFill>;
  }
  const c = cur!, ci = MONT.indexOf(c);
  const z = montZ(t), v = Math.log(montZ(t + 1 / FPS) / z);
  const n = v > .012 ? 6 : 1;
  const flash = Math.exp(-(t - c[0]) / .08);
  const white = ein(span(t, 7.9, T.a0));
  const lx = hash(ci * 3.3 + 1) > .5 ? 12 : 88;
  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    {Array.from({length: n}, (_, j) => {
      const live = c[1] === 2018, fi = clamp(Math.round((t - c[0]) * 24), 0, FC_LOCK.length - 1);
      const src = live ? C(`y18/fc/${String(fi + 1).padStart(3, '0')}.jpg`) : C(`years/y${c[1]}.jpg`);
      return <AbsoluteFill key={j} style={{transformOrigin: `${CX}px ${EYE_Y}px`, transform: `scale(${1.1 * z * Math.exp(-v * 1.8 * j / Math.max(1, n - 1))})`, opacity: 1 / (j + 1)}}>
        <Img src={src} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: mtx(live ? FC_LOCK[fi] : YLOCK[c[1]]),
          filter: ci === 0 ? `saturate(${.72 * mix(.85, 1, eout(span(t, I.click, 4.55)))}) contrast(1.08) brightness(${mix(1.3, 1, eout(span(t, I.click, 4.55)))})`
            : `saturate(.72) contrast(1.08) brightness(${1 + .65 * flash})`}}/>
      </AbsoluteFill>;
    })}
    <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .4}}/>
    <AbsoluteFill style={{background: `radial-gradient(circle at ${lx}% 35%, rgba(255,190,120,.85) 0%, rgba(255,120,60,.3) 25%, transparent 55%)`,
      mixBlendMode: 'screen', opacity: ci === 0 ? 0 : .55 * flash}}/>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 45%, rgba(0,0,0,.55) 100%)'}}/>
    {label}
    <AbsoluteFill style={{background: '#f4f7ff', opacity: white}}/>
  </AbsoluteFill>;
};

const whiteD = (_t: number) => 0;
// ---------- "Thirty Days": frosted bars glide past the lens; each one hides a cut to another day ----------
const WIPES: [number, number][] = [[24.80, 25.12], [25.40, 25.72], [25.95, 26.30]];   // studio → march → cell door → dusk
const wipeX = (t: number, k: number) => mix(-420, W + 420, io(span(t, WIPES[k][0], WIPES[k][1])));
const camX = (t: number) => -26 * (t - HT.slam);                         // the pull-back never settles: slow lateral drift
const clipL = (x: number): React.CSSProperties => ({clipPath: `inset(0 ${clamp(W - x, 0, W)}px 0 0)`});
const Bar: React.FC<{x: number; w: number; blur: number; a: number; ticks?: boolean}> = ({x, w, blur, a, ticks}) =>
  <div style={{position: 'absolute', left: x - w / 2, top: -40, width: w, height: H + 80, opacity: a, backdropFilter: `blur(${blur}px) brightness(1.18) saturate(1.1)`,
    WebkitBackdropFilter: `blur(${blur}px) brightness(1.18)`, background: 'linear-gradient(90deg, rgba(255,255,255,.02), rgba(235,245,255,.16) 30%, rgba(255,255,255,.22) 50%, rgba(235,245,255,.16) 70%, rgba(255,255,255,.02))',
    boxShadow: 'inset 2px 0 0 rgba(255,255,255,.18), inset -2px 0 0 rgba(255,255,255,.18)'}}>
    {ticks && <div style={{position: 'absolute', left: '42%', width: '16%', top: 0, bottom: 0, opacity: .35,
      background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.9) 0 2px, transparent 2px 36px)'}}/>}
  </div>;
const PrScene: React.FC<{t: number; name: string; s0: number; z: number; rot?: number; f?: string}> = ({t, name, s0, z, rot = 0, f = ''}) =>
  <AbsoluteFill style={{transformOrigin: `${CX}px ${CY}px`, transform: `translateX(${camX(t) * 1.4}px) rotate(${rot}deg) scale(${z})`}}>
    <Seq name={name} src={s0} filter={`brightness(1.02) saturate(.95) contrast(.95) ${f}`}/>
    <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .3}}/>
  </AbsoluteFill>;
const Outro: React.FC<{t: number}> = ({t}) => {
  if (t >= O.card) {
    const a = span(t, O.card, O.card + .12);
    const txt = (y: number, fs: number, ls: number, op: number, s: string) =>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: fs, letterSpacing: ls,
        color: `rgba(255,255,255,${op})`, opacity: a}}>{s}</div>;
    return <AbsoluteFill style={{background: '#000'}}>
      {txt(CY - 14, 22, 11, .92, 'SHoNgxxBoNg')}
      {txt(CY + 30, 13, 9, .5, '2018 — 2026')}
      {txt(H - 90, 11, 6, .38, '© 2026 TOWN COPYRIGHT RESERVED')}
    </AbsoluteFill>;
  }
  const pr = (t: number) => {
    // eye-locked pull-back through the split ruler: from the slot's eyes (s0) out to the wide studio, landing on 24.688; then a slow creep
    const at = (t: number) => {
      const src = prSrc(t), ey = prEye(src);
      const Ex = ey[0], Ey = ey[1], s0 = SLOT.ioc / ey[2], g = pullG(t);
      const s = Math.exp(Math.log(1.05) + (Math.log(s0) - Math.log(1.05)) * g) * mix(1, 1 / 1.05, span(t, HT.land, 26.0))
        * (1 + .1 * ein(span(t, O.dusk - .3, O.dusk + .08)));
      const rho = -ey[3] * g, Px = mix(Ex, SLOT.x, g), Py = mix(Ey, SLOT.y, g);
      return {src, tr: `translate(${Px}px, ${Py}px) rotate(${rho}rad) scale(${s}) translate(${-Ex}px, ${-Ey}px)`, ls: Math.log(s)};
    };
    const c0 = at(t), dl = Math.abs(at(t + 1 / 48).ls - at(t - 1 / 48).ls);
    const N = clamp(Math.ceil(dl * 120), 1, 12);
    const smp = N === 1 ? [c0] : Array.from({length: N}, (_, j) => at(t + (j / (N - 1) - .5) * .5 / 24));
    const dim = 1 - ein(span(t, O.dusk - .3, O.dusk + .08));
    const M = 900, masked = t < 24.25;
    let mk: React.CSSProperties = {};
    if (masked) {
      const a = apL(t) * RS, w = apW(t) * RS, cy = M + CY, cx = M + CX, fv = 2, fh = 2 + w * .18 * (1 - span(t, HT.slam, HT.rel));
      const m = `linear-gradient(180deg, transparent ${cy - a}px, #000 ${cy - a + fv}px, #000 ${cy + a - fv}px, transparent ${cy + a}px), ` +
        `linear-gradient(90deg, transparent ${cx - w / 2}px, #000 ${cx - w / 2 + fh}px, #000 ${cx + w / 2 - fh}px, transparent ${cx + w / 2}px)`;
      mk = {maskImage: m, WebkitMaskImage: m, maskComposite: 'intersect', WebkitMaskComposite: 'source-in'} as React.CSSProperties;
    }
    return <AbsoluteFill style={{transformOrigin: `${CX}px ${CY}px`, transform: `translateY(${shakeY(t)}px) rotate(${rollAt(t)}deg)`}}>
      <div style={{position: 'absolute', left: -M, top: -M, width: W + 2 * M, height: H + 2 * M, ...mk}}>
        <div style={{position: 'absolute', left: M, top: M, width: W, height: H, background: '#000', filter: `brightness(${1.02 * dim}) saturate(.95) contrast(.95)`}}>
          {smp.map((c, j) => <Img key={j} src={seq('p_reveal', c.src)} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0',
            transform: c.tr, opacity: 1 / (j + 1)}}/>)}
          <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .3}}/>
        </div>
      </div>
    </AbsoluteFill>;
  };
  // the day ladder on top of the studio pull-back
  const dk = ss(span(t, O.dark - .1, O.dark + .25)) * (1 - ss(span(t, 25.5, 25.8)));         // 25.0: lights drop, the orange stays
  const days = (t: number) => <>
    <AbsoluteFill style={{transform: `translateX(${t > 24.3 ? camX(t) - camX(24.3) : 0}px)`}}>{pr(t)}</AbsoluteFill>
    {t >= WIPES[0][0] && <AbsoluteFill style={clipL(wipeX(t, 0))}>
      <PrScene t={t} name="p_march" s0={1.2 + (t - WIPES[0][0]) * .9} z={1.3} rot={mix(-3, 3, span(t, WIPES[0][0], WIPES[1][1]))}
        f={`brightness(${1 - .22 * dk}) contrast(${1 + .15 * dk}) saturate(${1 + .45 * dk})`}/></AbsoluteFill>}
    {t >= WIPES[1][0] && <AbsoluteFill style={clipL(wipeX(t, 1))}>
      <PrScene t={t} name="p_close" s0={1.0 + (t - WIPES[1][0]) * .8} z={mix(1.24, 1.3, span(t, WIPES[1][0], 26.3))}/></AbsoluteFill>}
  </>;
  const dayN = Math.round(1 + 29 * ss(span(t, 24.35, 25.75)));
  const dayA = ss(span(t, 24.3, 24.6)) * (1 - ss(span(t, 25.95, 26.15)));
  const bars = <>
    {[0, 1, 2].map(k => t > WIPES[k][0] && t < WIPES[k][1] && <Bar key={k} x={wipeX(t, k)} w={520} blur={26} a={1} ticks/>)}
    {[[180, 140, 1.0], [1150, 90, 1.6], [1700, 200, .7]].map(([x0, w, v], k) =>
      <Bar key={`a${k}`} x={((x0 + v * 900 * (t - 24.25)) % (W + 400)) - 200} w={w} blur={18} a={.55 * ss(span(t, 24.2, 24.6)) * (1 - ss(span(t, 26.0, 26.3)))}/>)}
    <div style={{position: 'absolute', left: 0, right: 0, top: H - 210, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontWeight: 300, fontSize: 78,
      letterSpacing: 22, paddingLeft: 22, color: '#fff', opacity: .92 * dayA, textShadow: '0 2px 34px rgba(0,0,0,.55)'}}>DAY {String(dayN).padStart(2, '0')}</div>
  </>;
  if (t < WIPES[2][0]) return <AbsoluteFill style={{background: '#000'}}>{days(t)}{t > 24.2 && bars}</AbsoluteFill>;
  // dusk: the last bar carries the cell-door close-up off; the jumpsuit orange gives way to the sunset
  const e = eout(span(t, WIPES[2][0], O.dusk + .6));
  const z = 1 + .06 * span(t, O.dusk, O.card);
  return <AbsoluteFill style={{background: '#000'}}>
    {t < WIPES[2][1] && days(t)}
    <AbsoluteFill style={t < WIPES[2][1] ? clipL(wipeX(t, 2)) : {}}>
      <AbsoluteFill style={{transformOrigin: `${.5 * W}px ${.42 * H}px`, transform: `scale(${z})`}}>
        <Seq name="amer_d" src={.2 + (t - O.dusk)} filter={`brightness(${mix(.75, 1.1, e)}) contrast(${mix(1.25, 1.02, e)}) saturate(${mix(1.25, 1, e)})`}/>
      </AbsoluteFill>
    </AbsoluteFill>
    {t < 26.35 && bars}
  </AbsoluteFill>;
};

export const Shong07: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;

  // ===== A: plaque, high-key white → bloom =====
  const showA = t >= T.a0 - .05 && t < 9.45;
  const aSrcA = .4 + (t - T.a0) * .9;
  const aSrcB = .55 + (t - T.light) * .48;                              // no freeze: keeps moving into the light
  // one uninterrupted push: plaque 1.06 → 1.25 (9.35) → ×11 through its brightest facet (10.15), never reverses
  const plqZf = (t: number) => t < T.light ? mix(1.0, 1.06, span(t, T.a0, T.light))
    : 1.06 * Math.exp(Math.log(13.75 / 1.06) * Math.pow(Math.min(1.1, (t - T.light) / (9.45 - T.light)), 3.8));
  const plqZ = plqZf(t);
  const plqDl = Math.log(plqZf(t + 1 / 48) / plqZf(t - 1 / 48)), plqN = t >= T.light && plqDl > .03 ? 10 : 1;
  const thru = ss(span(t, 9.0, 9.4));                               // blur + light lead the zoom (plqB is soft above ~5x)
  const flash = .9 * (t < 9.32 ? ss(span(t, 9.0, 9.32)) : 1 - ss(span(t, 9.32, 9.75)));            // light peak hides the cut into the stone
  const bloom = ss(span(t, 8.95, T.navy));                              // baked-blur bloom over the plaque
  const whiteUp = ein(span(t, 9.2, T.navy + .05));
  const glintA = pulse(t, T.light, .05, .5) + .5 * pulse(t, 9.05, .05, .3) + .5 * pulse(t, 9.35, .05, .3);

  // ===== A→B: white → navy → near-black =====
  const navy = span(t, T.navy, T.dark);
  const fieldCol = rgb([244, 247, 255], [10, 22, 52], ss(span(t, T.navy, 10.4)));
  const fieldDark = ss(span(t, 10.7, T.dark + .3));
  const vig = 1 - ss(span(t, T.navy, 11.0));                            // vignette radius closes from the edges
  const showField = t >= T.navy - .05 && t < T.iris + .3;

  // ===== B: eye =====
  // ===== A→B: inside the diamond =====
  const showD = t >= 9.22 && t < 12.15;
  const intA = ss(span(t, 9.22, 9.42)), si = sInt(t), ri = rotInt(t);
  const intDl = Math.log(sInt(t + 1 / 48) / sInt(t - 1 / 48)), intN = intDl > .035 ? 4 : 1;      // push streak
  const tealX = ss(span(t, 9.8, 11.0)), kalA = .24 * (1 - span(t, 9.85, 10.4));
  const intB = mix(1, .5, ss(span(t, 10.6, 11.8)));
  const revR = 60 * Math.pow(1500 / 60, io(span(t, 11.0, 12.05)));      // the centre facet opens into his eye
  const revA = ss(span(t, 10.95, 11.25)), rimA = .75 * revA * (1 - span(t, 11.75, 12.05));
  const preZ = t < T.iris ? mix(.7, 1, eout(span(t, 11.0, T.iris))) : 1;
  const eyeSrc = clamp(EYE_S0 + (t - T.iris) * EYE_V, 0, 3.95);
  const eIn = 1, eG = 1;                       // the ring of stones dissolves into the iris
  const eSpread = 0, eN = 1;
  const ghostA = 0;
  const pcx = lerpTab(PUP, eyeSrc, 1), pcy = lerpTab(PUP, eyeSrc, 2), pr = lerpTab(PUP, eyeSrc, 3);
  // hard zoom punches on the three onsets, then an accelerating push until the pupil edge leaves the frame at 15.65
  const zStep = t < 14.85 ? 1 : t < 15.1 ? 1.5 : t < 15.5 ? 2.25 : 3.4;
  const eyeZ = preZ * mix(1.0, 1.06, span(t, T.iris, 14.85)) * zStep * (1 + .05 * span(t, 14.85, 15.5)) * mix(1, 1.42, (u => .85 * (2 * u - u * u) + .15 * u)(span(t, 15.5, T.pupil)));
  const showEye = t > 10.95 && t < T.pupil;
  const PX = pcx * W, PY = pcy * H, PR = pr * eyeZ;
  const hit = BEATS.reduce((a, h) => a + pulse(t, h, .03, .18), 0);
  const gaSrc = clamp(t - 14.95, 0, .99);
  const reflW = 230 * PR / PR_END, reflA = mix(.5, 1, span(t, 14.85, T.pupil));
  // two shard glints → catchlights (aimed at the eye's opening pupil)
  const p0x = .47 * W, p0y = .483 * H, p0r = lerpTab(PUP, EYE_S0, 3);
  const gl = io(span(t, T.dark - .2, T.iris + .05));
  const catchA = span(t, T.dark - .3, T.dark) * (1 - span(t, T.iris + .3, T.iris + .9));

  // ===== B2: the pupil's reflection becomes the monitor (hard match cut at 15.65) =====
  const showRoom = t >= T.pupil && t < T.top + .35;
  const ru = span(t, T.pupil, T.top);
  // one lateral arc toward his 2018 eye, starting mid-push and finishing with the zoom landing
  const eyN = FC_EYES[fcI(t)], ExN = (FC.x + eyN[0] * FC.w) * W, EyN = (FC.y + eyN[1] * FC.h) * H;
  const q = Math.pow(ss(span(t, 17.7, Z1)), 2.5);
  const zsN = 1.04 * Math.exp(hz(span(t, T.top, Z1)));
  const kick = 1 + .04 * (pulse(t, T.void, .02, .15) + pulse(t, T.motes, .02, .15));
  const sw = t >= T.top ? zsN : .12 * Math.pow(8.67, .7 * ru + .3 * ru * ru) * kick;                // screen width (frac of W): 12% → 104%
  const rk = roomK(Math.min(sw, SWID[SWID.length - 1])), rk0 = Math.floor(rk), rk1 = Math.min(SWID.length - 1, rk0 + 1), rkf = rk - rk0;
  const rr = SCREEN[rk0].map((v, i) => mix(v, SCREEN[rk1][i], rkf));
  const sx0 = rr[0] * W, sy0 = rr[1] * H, sW = (rr[2] - rr[0]) * W, sH = (rr[3] - rr[1]) * H, scx = sx0 + sW / 2, scy = sy0 + sH / 2;
  const rExtra = sw * W / sW;
  const PxN = CX + 1.04 * (ExN - CX) * (1 - q), PyN = CY + 1.04 * (EyN - CY) * (1 - q);
  const TX = t >= T.top ? PxN + zsN * (CX - ExN) : mix(PUP_END[0] * W, CX, ss(ru)) + q * (CX - ExN) * sw;
  const TY = t >= T.top ? PyN + zsN * (CY - EyN) : mix(PUP_END[1] * H, CY, ss(ru)) + q * (CY - EyN) * sw;
  const game: [string, number] = t < T.void ? ['y18/ga', gaSrc] : t < T.motes ? ['y18/gb', t - T.void] : ['y18/gc', t - T.motes];
  const gSat = .6 + .4 * ss(span(t, T.top, T.orange));
  const rb = .35 + .65 * ss(span(t, T.pupil, 16.15));

  // ===== B3: gameplay → 2018 facecam, zoom lands on his eyes =====
  const showZoom = t >= T.top && t < Z1;
  const ey = FC_EYES[fcI(t)];
  const Ex = (FC.x + ey[0] * FC.w) * W, Ey = (FC.y + ey[1] * FC.h) * H;   // his eye in gameplay-frame px
  const S0 = 1.04, uz = span(t, T.top, Z1), G = hz(uz);
  const zs = S0 * Math.exp(G);
  const Px = CX + S0 * (Ex - CX) * (1 - q), Py = CY + S0 * (Ey - CY) * (1 - q);
  const vf = t < Z1 ? hzd(uz) / ZD / 24 : 0;                              // log-scale change per frame
  const blurK = vf > .012 ? [0, 1, 2, 3, 4].map(j => Math.exp(-vf * .7 * j / 4)) : [1];
  const gcA = 1, gcDim = 1 - .4 * ss(span(t, 18.72, 19.0)), fcA = ss(span(t, 18.72, 18.95));
  const feather = 6 * (1 - ss(span(t, 18.95, Z1)));
  const pop = f === Math.round(T.top * 24) ? 1 : 0;

  // ===== B4: 2018 face, eye-locked; ruler grows over it =====
  const showCam = t >= Z1 && t < T.white + .1;
  const camS = FCS * (1 + .03 * span(t, Z1, T.ruler) + .04 * span(t, T.ruler, T.white));

  // ===== C: ruler =====
  const yi = clamp((t - Y0) / (Y1 - Y0)) * (YEARS.length - 1);
  const showR = t > T.ruler && t < T.white + .5;
  const whiteOut = 0;
  const lk = io(span(t, HT.lo, HT.slam));                                // felt dim, never to black
  const camDim = t < HT.slam ? mix(1, .38, lk) : mix(.38, .2, eout(span(t, HT.slam, 24.0)));
  const vigA = t < HT.slam ? 1 : t < WIPES[2][0] ? mix(1, .4, ss(span(t, HT.slam, 24.3))) : mix(.4, 1, span(t, WIPES[2][0], O.dusk + .2));

  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    {/* ===== 0: intro ===== */}
    {t < T.a0 && <Intro t={t}/>}

    {/* ===== A ===== */}
    {showA && <AbsoluteFill>
      {t < T.light
        ? <Seq name="plqA" src={aSrcA} z={plqZ} ox={.6} oy={.4} filter="saturate(.5) contrast(.95) brightness(1.14)"/>
        : Array.from({length: plqN}, (_, j) => <Seq key={j} name="plqB" src={aSrcB} z={plqZ * Math.exp(-plqDl * j / Math.max(1, plqN - 1))} ox={PLQ[0] / W} oy={PLQ[1] / H}
            style={{opacity: 1 / (j + 1)}} filter={`saturate(${.5 - .3 * bloom}) contrast(.95) brightness(${(1.14 + .3 * bloom) * mix(1, 1.5, thru)}) blur(${14 * thru}px)`}/>)}
      {t >= T.light && bloom > 0 && <Seq name="plqB_b" src={aSrcB} z={plqZ} ox={PLQ[0] / W} oy={PLQ[1] / H} style={{opacity: bloom * .6, mixBlendMode: 'screen'}}/>}
      <AbsoluteFill style={{background: '#d6e4ff', mixBlendMode: 'soft-light', opacity: .55}}/>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 47% 30%, #fff 0%, rgba(255,255,255,.7) 35%, rgba(235,242,255,.35) 75%)', opacity: .25}}/>
      <Glint x={PLQ[0]} y={PLQ[1]} a={glintA} s={mix(220, 520, clamp(glintA))}/>
    </AbsoluteFill>}

    {/* ===== A→B: inside the diamond ===== */}
    {showD && <AbsoluteFill style={{background: '#02080c', opacity: intA}}>
      {Array.from({length: intN}, (_, j) => <AbsoluteFill key={`i${j}`} style={{transform: `translate(${DI[0] - CX}px, ${DI[1] - CY}px) rotate(${ri}deg) scale(${si * Math.exp(-intDl * j / 3)})`,
        opacity: 1 / (j + 1), filter: `brightness(${intB})`}}>
        <Img src={C('dia/interior.jpg')} style={{position: 'absolute', width: W, height: H, objectFit: 'cover'}}/>
        <Img src={C('dia/interior_teal.jpg')} style={{position: 'absolute', width: W, height: H, objectFit: 'cover', opacity: tealX}}/>
        {j === 0 && kalA > .01 && [0, 120, 240].map(a => <AbsoluteFill key={a} style={{transform: `rotate(${a}deg) scale(.62)`, mixBlendMode: 'screen', opacity: kalA}}>
          <Seq name="plqB" src={aSrcB} filter="saturate(.7) contrast(1.1) blur(2px)"/>
        </AbsoluteFill>)}
      </AbsoluteFill>)}
      <AbsoluteFill style={{background: `radial-gradient(circle at ${DI[0]}px ${DI[1]}px, transparent 35%, rgba(0,0,0,${.5 * tealX}) 100%)`}}/>
    </AbsoluteFill>}

    {/* ===== B: eye, cyan-teal; the 2018 screen reflected in the pupil ===== */}
    {showEye && <AbsoluteFill style={t < 12.05 ? {opacity: revA, WebkitMaskImage: `radial-gradient(circle ${revR}px at ${DI[0]}px ${DI[1]}px, #000 78%, transparent 100%)`,
      maskImage: `radial-gradient(circle ${revR}px at ${DI[0]}px ${DI[1]}px, #000 78%, transparent 100%)`} : {}}>
      {Array.from({length: eN}, (_, j) => <Seq key={j} name="eyeP" src={eyeSrc} z={eyeZ * (1 + eSpread * j / Math.max(1, eN - 1))} ox={pcx} oy={pcy} style={{opacity: 1 / (j + 1)}}
        filter={t < T.iris ? `saturate(${mix(1, .3, eG)}) contrast(${mix(1, 1.12, eG)}) brightness(.82) blur(${4 * (1 - span(t, 11.3, 11.9))}px)`
          : `saturate(.3) contrast(1.12) brightness(${.82 + .18 * hit})`}/>)}
      {/* the only diamond left: a refraction of his own face */}
      {ghostA > 0 && [[1.03, 1.5], [.975, -1.5]].map(([gs, gr], k) => <AbsoluteFill key={`g${k}`} style={{mixBlendMode: 'screen', opacity: ghostA,
        transformOrigin: `${pcx * W}px ${pcy * H}px`, transform: `rotate(${gr}deg) scale(${gs})`}}>
        <Seq name="eyeP" src={eyeSrc} z={eyeZ} ox={pcx} oy={pcy} filter={`brightness(${mix(1.8, 1, eIn)})`}/>
      </AbsoluteFill>)}
      <AbsoluteFill style={{background: '#1aa6b4', mixBlendMode: 'color', opacity: .55 * eG}}/>
      <AbsoluteFill style={{background: '#0d5e6e', mixBlendMode: 'soft-light', opacity: .5 * eG}}/>
      {/* pupil pure black */}
      <div style={{position: 'absolute', left: PX - PR * 1.1, top: PY - PR * 1.1, width: PR * 2.2, height: PR * 2.2, borderRadius: '50%',
        background: 'radial-gradient(circle, #000 0%, #000 72%, transparent 92%)', opacity: ss(span(t, T.iris, 12.4))}}/>
      {t >= 14.85 && <div style={{position: 'absolute', left: PX - reflW / 2, top: PY - reflW * 9 / 32, width: reflW, height: reflW * 9 / 16, borderRadius: reflW * .02,
        overflow: 'hidden', opacity: reflA, boxShadow: `0 0 ${reflW * .35}px rgba(150,200,255,${.35 * reflA})`}}>
        <Img src={seq('y18/ga', gaSrc)} style={{width: '100%', height: '100%', filter: 'saturate(.6) brightness(1.05)'}}/>
      </div>}
    </AbsoluteFill>}

    {rimA > .01 && <div style={{position: 'absolute', left: DI[0] - revR * .9, top: DI[1] - revR * .9, width: revR * 1.8, height: revR * 1.8, borderRadius: '50%',
      boxShadow: `0 0 ${12 + revR * .08}px ${2 + revR * .02}px rgba(190,250,255,.8), inset 0 0 ${10 + revR * .1}px rgba(150,240,255,.6)`, mixBlendMode: 'screen', opacity: rimA}}/>}
    {flash > .005 && <AbsoluteFill style={{background: 'radial-gradient(circle at 47% 30%, #fff 0%, #fff 45%, #eef4ff 100%)', opacity: flash}}/>}
    {/* ===== B2: the 2018 bedroom; the reflection is now the monitor ===== */}
    {showRoom && <AbsoluteFill>
      <AbsoluteFill style={{transformOrigin: `${scx}px ${scy}px`, transform: `translate(${TX - scx}px, ${TY - scy}px) scale(${rExtra})`}}>
        <Img src={C(`room/${String(rk0 + 1).padStart(3, '0')}.jpg`)} style={{position: 'absolute', width: W, height: H, filter: `brightness(${rb})`}}/>
        {rkf > .02 && <Img src={C(`room/${String(rk1 + 1).padStart(3, '0')}.jpg`)} style={{position: 'absolute', width: W, height: H, opacity: rkf, filter: `brightness(${rb})`}}/>}
        {/* spill light from the screen onto desk/walls, jumps with each content cut */}
        <div style={{position: 'absolute', left: scx - sW * 1.4, top: scy - sH * 1.5, width: sW * 2.8, height: sH * 3, mixBlendMode: 'screen', opacity: .4 * rb,
          maskImage: 'radial-gradient(ellipse closest-side, #000 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse closest-side, #000 20%, transparent 100%)'}}>
          <Img src={seq(game[0] + '_b', game[1])} style={{width: '100%', height: '100%'}}/>
        </div>
        <div style={{position: 'absolute', left: sx0, top: sy0, width: sW, height: sH, overflow: 'hidden', borderRadius: sW * .006}}>
          <Img src={seq(game[0], game[1])} style={{width: '100%', height: '100%', filter: `saturate(${gSat}) brightness(.96)`}}/>
          <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${sW * .05}px rgba(0,0,0,.5)`}}/>
        </div>
      </AbsoluteFill>
      {DUST.map((d, i) => {
        const g = 1 + ru * 2.2, x = TX + (d.x - .5) * W * g, y = TY + (d.y - .5) * H * g + Math.sin((t + d.ph * 6) * 1.3) * 12;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: d.s * g, height: d.s * g, borderRadius: '50%', mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(210,230,255,.9), transparent 70%)', opacity: .55 * (1 - span(ru, .75, 1))}}/>;
      })}
    </AbsoluteFill>}

    {/* ===== B3: gameplay full frame → zoom onto his 2018 webcam eyes ===== */}
    {showZoom && <AbsoluteFill>
      {blurK.map((k, j) =>
        <AbsoluteFill key={j} style={{transformOrigin: `${Px}px ${Py}px`, transform: `scale(${k})`, opacity: 1 / (j + 1)}}>
          {gcA > .001 && <Img src={seq('y18/gc', t - T.motes)} style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0', opacity: gcA,
            transform: `translate(${Px - zs * Ex}px, ${Py - zs * Ey}px) scale(${zs})`, filter: `saturate(${gSat}) brightness(${gcDim * (1 + .5 * pop)})`}}/>}
          {fcA > .001 && <Img src={seq('y18/fc', t - T.motes)} style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0', opacity: fcA,
            transform: `translate(${Px - zs * FC.w * ey[0] * W}px, ${Py - zs * FC.h * ey[1] * H}px) scale(${zs * FC.w})`,
            filter: `saturate(${gSat}) contrast(1.06)`, ...fmask(feather)}}/>}
        </AbsoluteFill>)}
      {pop > 0 && <AbsoluteFill style={{background: '#cfe6ff', mixBlendMode: 'screen', opacity: .35}}/>}
    </AbsoluteFill>}

    {/* ===== B4: 2018 face, eyes locked at frame centre ===== */}
    {showCam && <AbsoluteFill>
      <Img src={seq('y18/fc', t - T.motes)} style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0',
        transform: `translate(${CX - camS * ey[0] * W}px, ${CY - camS * ey[1] * H}px) scale(${camS})`, filter: `contrast(1.06) brightness(${camDim}) saturate(${mix(1, .6, lk)}) blur(${14 * lk}px)`}}/>
      <div style={{position: 'absolute', left: 0, right: 0, top: CY + 190, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: 18,
        letterSpacing: 12, color: 'rgba(255,255,255,.85)', opacity: span(t, T.orange, T.orange + .15) * (1 - span(t, T.ruler - .05, T.ruler + .25))}}>2018</div>
    </AbsoluteFill>}
    {t >= T.a0 && t < T.a0 + .35 && <AbsoluteFill style={{background: '#fff', opacity: 1 - eout(span(t, T.a0, T.a0 + .32))}}/>}
    {/* ===== D: outro ===== */}
    {t >= O.whip && <Outro t={t}/>}
    {/* ===== C: ruler ===== */}
    {showR && t < 24.2 && <Ruler t={t} yi={yi}/>}
    {showR && t < O.whip && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #fff 0%, rgba(255,240,248,.9) 40%, rgba(255,220,240,.6) 100%)', opacity: whiteOut}}/>}

    {/* lifted blacks (~3%) */}
    <AbsoluteFill style={{background: '#08080e', mixBlendMode: 'lighten', opacity: t < O.whip ? 1 - whiteOut : 1}}/>
    {/* global finish: vignette + grain (halation/softening happen in the ffmpeg post pass) */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.45) 100%)', opacity: t < O.whip ? 1 - whiteOut : vigA}}/>
    <AbsoluteFill style={{opacity: .1, mixBlendMode: 'overlay'}}>
      <Img src={C(`grain/g${f % 6}.png`)} style={{width: W, height: H}}/>
    </AbsoluteFill>
    <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - eout(span(t, .2, .9)), span(t, O.end - .3, O.end - .05))}}/>
    <Audio src={C('audio.wav')}/>
  </AbsoluteFill>;
};
