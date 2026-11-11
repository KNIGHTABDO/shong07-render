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
import {FC_EYES, SCREEN} from './s07data';

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
const N: Record<string, number> = {p_reveal: 240, amer_d: 96, hand18: 96, eyeP: 96, plqA: 82, plqB: 62, plqB_b: 62, amer_b: 96, void: 96, room: 95,
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
const SHARDS = Array.from({length: 46}, (_, i) => {
  const ts = 8.68 + Math.pow(hash(i * 3.1), 1.3) * 2.3;          // spawn time, dense on the lyric
  const face = i % 5 === 2 && ts > 9.45 ? FACES[(i * 3) % FACES.length] : 0;
  const ang = hash(i * 5.7) * Math.PI * 2, spread = 120 + hash(i * 7.3) * 380;
  const k = 3 + Math.floor(hash(i * 9.1) * 3);                    // crystal polygon variant
  return {i, ts, face, z0: 7, v: 4.2 + hash(i * 2.9) * 3.4, dx: Math.cos(ang) * spread, dy: Math.sin(ang) * spread * .7,
    s0: face ? 150 : 40 + hash(i * 4.4) * 70, rot0: hash(i * 6.6) * 360, vr: (hash(i * 8.8) - .5) * 160, k};
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
    if (s.face) return <div key={s.i} style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, opacity: op * .95,
      transform: `rotate(${rot * .2}deg)`, clipPath: `polygon(${POLY[s.k]})`}}>
      <Img src={C(`${near || far ? 'faces_b' : 'faces'}/f${s.face}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.45), rgba(170,200,255,.05) 45%, rgba(255,255,255,.25))'}}/>
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

// ---------- B: eye ----------
// pupil centre (frac) + pupil radius (px) in eyeP by src second (measured on frames)
const PUP = [[0, .563, .488, 6], [.5, .569, .483, 9], [1.0, .573, .5, 14], [1.25, .6, .505, 20], [1.6, .55, .48, 35], [2.0, .497, .465, 60],
  [2.66, .494, .463, 88], [3.8, .496, .48, 220], [4.0, .496, .48, 225]];
const EYE_S0 = 1.6, EYE_V = (3.9 - EYE_S0) / (T.pupil - T.iris);
const BEATS = [14.85, 15.1, 15.5];
const PUP_END = [lerpTab(PUP, 3.9, 1), lerpTab(PUP, 3.9, 2)];
const PR_END = lerpTab(PUP, 3.9, 3) * 1.06 * 3.4 * 1.42 * 1.05;      // pupil radius at the cut (passes the frame corners)

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
const TGAP = 70, TROW = H + TGAP, TCOL = W + TGAP, ROWS = 15, FLY = 9 * TROW, PERS = 1600;
const yrRow = (k: number) => YEARS[Math.min(YEARS.length - 1, Math.floor(k * 7 / 9))];
// ---------- D: outro — whip into the prison-series studio (now), dusk cowboy emerges from the dark, card ----------
const O = {whip: 24.5, dark: 25.0, dusk: 26.25, card: 29.7, end: 31.875};

// ---------- C: ruler ----------
const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2026];
const Y0 = 20.1, Y1 = 23.3;
const TICK = 300, RH = 210;
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const SW = 900, SH = SW * 250 / 1100;                 // eye-strip window in the ruler body

const Ruler: React.FC<{t: number; yi: number}> = ({t, yi}) => {
  const slide = eout(span(t, T.ruler, 20.7));
  const taut = pulse(t, T.taut, .03, .22);
  const roll = -5 - 34 * io(span(t, T.roll - .1, 23.6));
  const grow = ein(span(t, T.fill, T.white));
  const sc = mix(1, 14, grow) * (1 + .03 * span(t, T.ruler, T.fill));
  const yr = 2018 + (yi < 6 ? yi : 6 + (yi - 6) * 2);  // tick position (2025 skipped in the plates)
  const track = -((yr - 2018) * TICK) + (1 - slide) * 2700;
  const L = 9 * TICK + 1800, x0 = 900;
  const count = 24.1e6 * Math.pow(clamp((t - Y0) / (23.5 - Y0)), 2.1);
  const stripOp = ss(span(t, 20.0, 20.5));
  return <AbsoluteFill style={{transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${roll}deg) scale(${sc}) scaleY(${1 + taut * .07})`}}>
    {/* frosted pink body */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2, width: L, height: RH, borderRadius: 8,
      background: 'linear-gradient(180deg, rgba(255,226,242,.78) 0%, rgba(246,176,214,.62) 50%, rgba(255,222,240,.78) 100%)',
      boxShadow: '0 0 0 1.5px rgba(255,255,255,.85) inset, 0 0 30px rgba(255,255,255,.45), 0 0 130px rgba(255,110,195,.55)'}}/>
    {/* hot specular core streak */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2 + RH * .14, width: L, height: RH * .16, mixBlendMode: 'screen',
      background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.85) 45%, rgba(255,255,255,0))'}}/>
    {/* the years, eye-locked, inside the ruler (window fixed under the cursor) */}
    <div style={{position: 'absolute', left: CX - SW / 2, top: CY - SH / 2, width: SW, height: SH, opacity: stripOp * slide,
      maskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)'}}>
      {YEARS.map((y, i) => {
        const d = Math.abs(yi - i), a = i === YEARS.length - 1 && yi >= i ? 1 : clamp(1.5 - d * 1.5);
        return a <= 0 ? null : <Img key={y} src={C(`strips/y${y}.jpg`)} style={{position: 'absolute', inset: 0, width: SW, height: SH, opacity: a}}/>;
      })}
      <div style={{position: 'absolute', inset: 0, background: 'rgba(250,170,215,.32)', mixBlendMode: 'soft-light'}}/>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,230,245,.35), rgba(255,230,245,0) 30%, rgba(255,230,245,0) 70%, rgba(255,230,245,.35))'}}/>
    </div>
    {/* ticks + micro-type, moving with the body */}
    <div style={{position: 'absolute', left: CX - x0 + track, top: CY - RH / 2, width: L, height: RH}}>
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
      fontVariantNumeric: 'tabular-nums', color: 'rgba(110,40,85,.75)', opacity: span(t, Y0, Y0 + .3) * (1 - grow)}}>{fmt(count)} SUBSCRIBERS</div>
    {/* cursor hairline */}
    <div style={{position: 'absolute', left: CX - 1, top: CY - RH / 2 - 26, width: 2, height: RH + 52, background: 'rgba(255,255,255,.95)',
      boxShadow: '0 0 10px rgba(255,255,255,.9)', opacity: slide * (1 - grow)}}/>
  </AbsoluteFill>;
};


const Intro: React.FC<{t: number}> = ({t}) => {
  const glow = eout(span(t, I.glow, I.open)) * (1 - span(t, I.open, I.open + .5));
  const reveal = eout(span(t, I.open, I.open + .55));
  const hs = mix(1.12, 1, span(t, I.open, I.click));
  const hsrc = Math.min(3.96, Math.max(0, t - I.open) * 1.25);
  const tag = span(t, I.tag, I.tag + .2) * (1 - span(t, I.click - .2, I.click));
  if (t < I.click) return <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(170,225,255,${.9 * glow}) 0%, rgba(60,140,200,${.35 * glow}) ${6 + 18 * glow}%, transparent ${16 + 40 * glow}%)`}}/>
    {t >= I.open && <AbsoluteFill style={{maskImage: `radial-gradient(circle at 50% 50%, #000 ${reveal * 85}%, transparent ${reveal * 85 + 25}%)`,
      WebkitMaskImage: `radial-gradient(circle at 50% 50%, #000 ${reveal * 85}%, transparent ${reveal * 85 + 25}%)`}}>
      <Seq name="hand18" src={hsrc} z={hs} filter="saturate(.75) contrast(1.06) brightness(.95)"/>
      <AbsoluteFill style={{background: '#1a6f9a', mixBlendMode: 'soft-light', opacity: .45}}/>
    </AbsoluteFill>}
    <div style={{position: 'absolute', left: 0, right: 0, top: CY + 380, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: 18,
      letterSpacing: 12, color: 'rgba(255,255,255,.85)', opacity: tag}}>2018</div>
  </AbsoluteFill>;
  // floor flight
  const tip = eout(span(t, I.click, I.click + .8));
  const up = io(span(t, I.up, T.a0));
  const pitch = 76 * tip - 34 * up;
  const camZ = -1500 * eout(span(t, I.click, I.click + 1.3)), camY = 260 * tip - 200 * up;
  const fly = FLY * Math.pow(span(t, I.click + .15, T.a0), 1.6);
  const sn = Math.sin(pitch * Math.PI / 180);
  const white = ein(span(t, I.up + .25, T.a0));
  const tiles: React.ReactElement[] = [];
  for (let k = ROWS - 1; k >= 0; k--) for (let c = -4; c <= 4; c++) {
    const top = -k * TROW + fly, Yt = top - CY, Yb = top + H - CY;
    if (Yt * sn + camZ > PERS - 60) continue;                 // passed under the camera
    const depth = -(Yb * sn + camZ);
    const op = 1 - span(depth, 4500, 13500);
    if (op <= 0) continue;
    const hand = k === 0 && c === 0;
    tiles.push(<div key={`${k}_${c}`} style={{position: 'absolute', left: c * TCOL, top: -k * TROW, width: W, height: H, opacity: op, overflow: 'hidden', borderRadius: 10 * tip}}>
      <Img src={hand ? seq('hand18', 3.96) : C(`years/y${yrRow(k)}.jpg`)} style={{width: W, height: H, filter: hand ? 'saturate(.75) contrast(1.06) brightness(.95)' : 'saturate(.8) contrast(1.04)'}}/>
      {!hand && <div style={{position: 'absolute', inset: 0, background: '#cfe0f5', mixBlendMode: 'soft-light', opacity: .4}}/>}
    </div>);
  }
  return <AbsoluteFill style={{background: 'linear-gradient(180deg, #e9eef6 0%, #f7f9fc 45%, #eef2f8 100%)', overflow: 'hidden'}}>
    <AbsoluteFill style={{transformOrigin: `${CX}px ${CY}px`, transformStyle: 'preserve-3d',
      transform: `perspective(${PERS}px) translateY(${camY}px) translateZ(${camZ}px) rotateX(${pitch}deg) translateY(${fly}px)`}}>
      {tiles}
    </AbsoluteFill>
    {/* horizon haze */}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(247,249,252,.9) 0%, rgba(247,249,252,0) 38%)', opacity: tip}}/>
    <AbsoluteFill style={{background: '#fff', opacity: white}}/>
  </AbsoluteFill>;
};

const whiteD = (t: number) => 1 - eout(span(t, O.whip, O.whip + .35));
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
  if (t < O.dusk) {
    // whip down into the studio, then low-key push; darkens out before the dusk
    const u = span(t, O.whip, O.dark), pos = eout(u), y0 = -H * (1 - pos);
    const v = t < O.dark ? 3 * Math.pow(1 - u, 2) * H / ((O.dark - O.whip) * 24) : 0;   // px per frame
    const blur = v > 6 ? [0, 1, 2, 3, 4].map(j => -v * .8 * j / 4) : [0];
    const src = 1.0 + (t - O.whip);
    const z = 1 + .07 * span(t, O.dark, O.dusk);
    const dim = 1 - .9 * ein(span(t, O.dusk - .32, O.dusk));
    return <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transformOrigin: `${.55 * W}px ${.33 * H}px`, transform: `scale(${z})`, filter: `brightness(${.62 * dim + .38 * whiteD(t) * 0}) saturate(.78) contrast(1.08)`}}>
        {blur.map((d, j) => <AbsoluteFill key={j} style={{opacity: 1 / (j + 1)}}>
          {[0, 1].map(r => <Img key={r} src={seq('p_reveal', src)} style={{position: 'absolute', left: 0, top: y0 + d + r * H, width: W, height: H}}/>)}
        </AbsoluteFill>)}
        <AbsoluteFill style={{background: '#0b1630', mixBlendMode: 'multiply', opacity: .35}}/>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: whiteD(t)}}/>
    </AbsoluteFill>;
  }
  // dusk: highlights (sky, horizon) emerge first from black
  const e = eout(span(t, O.dusk, O.dusk + .75));
  const z = 1 + .06 * span(t, O.dusk, O.card);
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transformOrigin: `${.5 * W}px ${.42 * H}px`, transform: `scale(${z})`}}>
      <Seq name="amer_d" src={.2 + (t - O.dusk)} filter={`brightness(${mix(.12, 1, e)}) contrast(${mix(2.6, 1.05, e)}) saturate(${mix(.6, 1, e)})`}/>
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const Shong07: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;

  // ===== A: plaque, high-key white → bloom =====
  const showA = t >= T.a0 - .05 && t < T.navy + .3;
  const aSrcA = .4 + (t - T.a0) * .9;
  const aSrcB = .55 + (t - T.light) * .48;                              // no freeze: keeps moving into the light
  const plqZ = t < T.light ? mix(1.0, 1.06, span(t, T.a0, T.light)) : mix(1.06, 1.3, ein(span(t, T.light, T.navy + .3)));
  const bloom = ss(span(t, 8.95, T.navy));                              // baked-blur bloom over the plaque
  const whiteUp = ein(span(t, 9.2, T.navy + .05));
  const glintA = pulse(t, T.light, .05, .5) + .5 * pulse(t, 9.05, .05, .3) + .5 * pulse(t, 9.35, .05, .3);

  // ===== A→B: white → navy → near-black =====
  const navy = span(t, T.navy, T.dark);
  const fieldCol = rgb([244, 247, 255], [10, 22, 52], ss(span(t, T.navy, 10.7)));
  const fieldDark = ss(span(t, 10.7, T.dark + .3));
  const vig = 1 - ss(span(t, T.navy, 11.0));                            // vignette radius closes from the edges
  const showField = t >= T.navy - .05 && t < T.iris + .3;

  // ===== B: eye =====
  const eyeSrc = clamp(EYE_S0 + Math.max(0, t - T.iris) * EYE_V, 0, 3.95);
  const pcx = lerpTab(PUP, eyeSrc, 1), pcy = lerpTab(PUP, eyeSrc, 2), pr = lerpTab(PUP, eyeSrc, 3);
  // hard zoom punches on the three onsets, then an accelerating push until the pupil edge leaves the frame at 15.65
  const zStep = t < 14.85 ? 1 : t < 15.1 ? 1.5 : t < 15.5 ? 2.25 : 3.4;
  const eyeZ = mix(1.0, 1.06, span(t, T.iris, 14.85)) * zStep * (1 + .05 * span(t, 14.85, 15.5)) * mix(1, 1.42, (u => .85 * (2 * u - u * u) + .15 * u)(span(t, 15.5, T.pupil)));
  const eyeIn = ss(span(t, T.iris - .25, T.iris + .5));
  const showEye = t > T.iris - .3 && t < T.pupil;
  const PX = pcx * W, PY = pcy * H, PR = pr * eyeZ;
  const hit = BEATS.reduce((a, h) => a + pulse(t, h, .03, .18), 0);
  const gaSrc = clamp(t - 14.95, 0, .99);
  const reflW = 230 * PR / PR_END, reflA = mix(.5, 1, span(t, 14.85, T.pupil));
  // two shard glints → catchlights (aimed at the eye's opening pupil)
  const p0x = lerpTab(PUP, EYE_S0, 1) * W, p0y = lerpTab(PUP, EYE_S0, 2) * H, p0r = lerpTab(PUP, EYE_S0, 3);
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
  const whiteOut = ss(span(t, 23.9, T.white));

  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    {/* ===== 0: intro ===== */}
    {t < T.a0 && <Intro t={t}/>}

    {/* ===== A ===== */}
    {showA && <AbsoluteFill>
      {t < T.light
        ? <Seq name="plqA" src={aSrcA} z={plqZ} ox={.6} oy={.4} filter="saturate(.5) contrast(.95) brightness(1.14)"/>
        : <Seq name="plqB" src={aSrcB} z={plqZ} ox={.47} oy={.3} filter={`saturate(${.5 - .3 * bloom}) contrast(.95) brightness(${1.14 + .3 * bloom})`}/>}
      {t >= T.light && bloom > 0 && <Seq name="plqB_b" src={aSrcB} z={plqZ} ox={.47} oy={.3} style={{opacity: bloom, mixBlendMode: 'screen'}}/>}
      <AbsoluteFill style={{background: '#d6e4ff', mixBlendMode: 'soft-light', opacity: .55}}/>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 47% 30%, #fff 0%, rgba(255,255,255,.7) 35%, rgba(235,242,255,.35) 75%)', opacity: .25 + .75 * whiteUp}}/>
      <AbsoluteFill style={{background: '#f4f7ff', opacity: whiteUp}}/>
      <Glint x={PLQ[0]} y={PLQ[1]} a={glintA} s={mix(220, 520, clamp(glintA))}/>
    </AbsoluteFill>}

    {/* ===== white → navy field ===== */}
    {showField && <AbsoluteFill>
      <AbsoluteFill style={{background: fieldCol}}/>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, transparent ${mix(4, 85, vig)}%, rgba(6,14,38,1) ${mix(40, 140, vig)}%)`, opacity: ss(span(t, T.navy, 10.2))}}/>
      <AbsoluteFill style={{background: '#010208', opacity: fieldDark * .92}}/>
    </AbsoluteFill>}
    {t > 8.65 && t < T.iris + .2 && <Shards t={t} navy={navy}/>}
    {/* two glints that become the eye's catchlights */}
    {t > T.dark - .3 && t < T.iris + .9 && <>
      <Glint x={mix(CX - 380, p0x - p0r * .35, gl)} y={mix(CY - 160, p0y - p0r * .4, gl)} a={catchA} s={mix(140, 26, gl)}/>
      <Glint x={mix(CX + 420, p0x + p0r * .3, gl)} y={mix(CY + 120, p0y - p0r * .25, gl)} a={catchA * .8} s={mix(110, 16, gl)}/>
    </>}

    {/* ===== B: eye, cyan-teal; the 2018 screen reflected in the pupil ===== */}
    {showEye && <AbsoluteFill style={{opacity: eyeIn}}>
      <Seq name="eyeP" src={eyeSrc} z={eyeZ} ox={pcx} oy={pcy} filter={`saturate(.3) contrast(1.12) brightness(${.82 + .18 * hit})`}/>
      <AbsoluteFill style={{background: '#1aa6b4', mixBlendMode: 'color', opacity: .55}}/>
      <AbsoluteFill style={{background: '#0d5e6e', mixBlendMode: 'soft-light', opacity: .5}}/>
      {/* pupil pure black */}
      <div style={{position: 'absolute', left: PX - PR * 1.1, top: PY - PR * 1.1, width: PR * 2.2, height: PR * 2.2, borderRadius: '50%',
        background: 'radial-gradient(circle, #000 0%, #000 72%, transparent 92%)'}}/>
      {t >= 14.85 && <div style={{position: 'absolute', left: PX - reflW / 2, top: PY - reflW * 9 / 32, width: reflW, height: reflW * 9 / 16, borderRadius: reflW * .02,
        overflow: 'hidden', opacity: reflA, boxShadow: `0 0 ${reflW * .35}px rgba(150,200,255,${.35 * reflA})`}}>
        <Img src={seq('y18/ga', gaSrc)} style={{width: '100%', height: '100%', filter: 'saturate(.6) brightness(1.05)'}}/>
      </div>}
    </AbsoluteFill>}

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
        transform: `translate(${CX - camS * ey[0] * W}px, ${CY - camS * ey[1] * H}px) scale(${camS})`, filter: 'contrast(1.06)'}}/>
      <div style={{position: 'absolute', left: 0, right: 0, top: CY + 190, textAlign: 'center', fontFamily: 'Inter', fontWeight: 500, fontSize: 18,
        letterSpacing: 12, color: 'rgba(255,255,255,.85)', opacity: span(t, T.orange, T.orange + .15) * (1 - span(t, T.ruler - .05, T.ruler + .25))}}>2018</div>
    </AbsoluteFill>}
    {t >= T.a0 && t < T.a0 + .35 && <AbsoluteFill style={{background: '#fff', opacity: 1 - eout(span(t, T.a0, T.a0 + .32))}}/>}
    {/* ===== D: outro ===== */}
    {t >= O.whip && <Outro t={t}/>}
    {/* ===== C: ruler ===== */}
    {showR && t < O.whip + .02 && <Ruler t={t} yi={yi}/>}
    {showR && t < O.whip && <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #fff 0%, rgba(255,240,248,.9) 40%, rgba(255,220,240,.6) 100%)', opacity: whiteOut}}/>}

    {/* lifted blacks (~3%) */}
    <AbsoluteFill style={{background: '#08080e', mixBlendMode: 'lighten', opacity: t < O.whip ? 1 - whiteOut : 1}}/>
    {/* global finish: vignette + grain (halation/softening happen in the ffmpeg post pass) */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.45) 100%)', opacity: t < O.whip ? 1 - whiteOut : 1 - whiteD(t)}}/>
    <AbsoluteFill style={{opacity: .1, mixBlendMode: 'overlay'}}>
      <Img src={C(`grain/g${f % 6}.png`)} style={{width: W, height: H}}/>
    </AbsoluteFill>
    <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - eout(span(t, .2, .9)), span(t, O.end - .3, O.end - .05))}}/>
    <Audio src={C('audio.wav')}/>
  </AbsoluteFill>;
};
