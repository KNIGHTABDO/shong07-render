// Edit 06 — SXB × Prison Break, 1:1 clone of ref06 (800x576 @ 30 fps, 814 f) on the ref's own audio.
// Pass 1 (f0-404) = Prison Break, pass 2 (f405-814) = the same plan re-shot from SXB's IRL 30-day prison series.
// v1: pass 1 = the ref's PB footage + SXB flashes (186, 391); f413-792 = SXB; 793-813 black.
// Geometry in REF px (800x576), scaled by S at draw time.
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30, DUR_F = 814;
const C = (f: string) => staticFile(`s06/${f}`);
const RW = 800, RH = 576, W = 1500, H = 1080, S = W / RW;
const R = (v: number) => v * S;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (x: number, a: number, b: number) => clamp((x - a) / (b - a));
const io = (x: number) => {x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const hash = (i: number) => {const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s);};

// teal/orange PB grade (least-squares fit: yellow walls -> teal grey, orange suit -> burnt orange, blue bars -> teal)
const GRADE = 'url(#pbgrade)';
const Defs: React.FC = () => <svg width={0} height={0} style={{position: 'absolute'}}>
  <filter id="pbgrade" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values="1.354 -1.491 1.037 0 -.013  .351 -.047 .678 0 .003  .087 .302 .58 0 .01  0 0 0 1 0"/>
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0 .03 .16 .36 .58 .78 .9"/><feFuncG type="table" tableValues="0 .04 .18 .38 .6 .8 .93"/><feFuncB type="table" tableValues=".02 .07 .21 .4 .6 .79 .92"/>
    </feComponentTransfer>
  </filter>
  <filter id="thr" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncR type="discrete" tableValues="0 0 1 1"/><feFuncG type="discrete" tableValues="0 0 1 1"/><feFuncB type="discrete" tableValues="0 .02 1 1"/></feComponentTransfer></filter>
  <filter id="crush" colorInterpolationFilters="sRGB">
    <feComponentTransfer><feFuncR type="table" tableValues="0 0 0 .2 .7 1"/><feFuncG type="table" tableValues="0 0 0 .22 .72 1"/><feFuncB type="table" tableValues="0 0 .01 .24 .72 1"/></feComponentTransfer></filter>
  <filter id="hblur" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${R(26)} 0`}/></filter>
  <filter id="vsmear" x="0" y="-10%" width="100%" height="120%"><feGaussianBlur stdDeviation={`0 ${R(40)}`}/></filter>
  <filter id="grain06"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={4}/><feColorMatrix type="saturate" values="0"/></filter>
</svg>;

// one shot from a source clip: `at` = comp frame where the clip starts, `from` = source second at that frame
type ClipP = {src: string; at: number; from: number; rate?: number; z?: number; ax?: number; ay?: number; dx?: number; dy?: number; filter?: string; skew?: number; rot?: number; mask?: string; style?: React.CSSProperties};
const Clip: React.FC<ClipP> = ({src, at, from, rate = 1, z = 1, ax = RW / 2, ay = RH / 2, dx = 0, dy = 0, filter = GRADE, skew = 0, rot = 0, mask, style}) =>
  <AbsoluteFill style={{overflow: 'hidden', ...style}}>
    <Sequence from={at} layout="none">
      <AbsoluteFill style={{transformOrigin: `${R(ax)}px ${R(ay)}px`, transform: `translate(${R(dx)}px, ${R(dy)}px) scale(${z}) skewX(${skew}deg) rotate(${rot}deg)`, filter,
        ...(mask ? {WebkitMaskImage: `url(${C(mask)})`, WebkitMaskSize: 'cover', WebkitMaskPosition: 'center'} : {})}}>
        <OffthreadVideo src={C(src)} startFrom={Math.round(from * FPS)} playbackRate={rate} muted style={{width: W, height: H, objectFit: 'cover'}}/>
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>;

// silhouette flash: subject filled with a flat tone on black (ref f433, 470, 528)
const Sil: React.FC<{mask: string; fill: string; z?: number; ax?: number; ay?: number; dx?: number; dy?: number}> = ({mask, fill, z = 1, ax = RW / 2, ay = RH / 2, dx = 0, dy = 0}) =>
  <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transformOrigin: `${R(ax)}px ${R(ay)}px`, transform: `translate(${R(dx)}px, ${R(dy)}px) scale(${z})`, background: fill,
      WebkitMaskImage: `url(${C(mask)})`, WebkitMaskSize: 'cover', WebkitMaskPosition: 'center'}}/>
  </AbsoluteFill>;

// LED-screen macro: RGB subpixel stripes over the picture (ref f453, 458, 496)
const Led: React.FC<{k?: number; pitch?: number}> = ({k = 1, pitch = 2.4}) => <>
  <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: k, background: `repeating-linear-gradient(90deg, #ff2a1a 0 ${R(pitch / 3)}px, #1aff5a ${R(pitch / 3)}px ${R(2 * pitch / 3)}px, #2a6aff ${R(2 * pitch / 3)}px ${R(pitch)}px)`}}/>
  <AbsoluteFill style={{mixBlendMode: 'screen', opacity: .35 * k, background: 'rgba(80,120,130,1)'}}/>
</>;

// horizontal band glitch: strips of the same clip shifted sideways
const Bands: React.FC<{f: number; seed: number; clip: ClipP; n?: number}> = ({f, seed, clip, n = 7}) => <>
  {Array.from({length: n}, (_, i) => {
    const h0 = hash(seed * 31 + i * 7 + f), y = hash(h0 * 13) * RH, h = 6 + hash(h0 * 17) * 60, dx = (hash(h0 * 23) - .5) * 160;
    return <AbsoluteFill key={i} style={{clipPath: `inset(${R(y)}px 0 ${Math.max(0, H - R(y + h))}px 0)`}}>
      <Clip {...clip} dx={(clip.dx || 0) + dx} filter={`${clip.filter || GRADE} brightness(1.4)`}/>
    </AbsoluteFill>;
  })}
</>;

const Paper: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 60%, #6b5038 0%, #3a2a1c 55%, #120c08 100%)'}}>
  <div style={{position: 'absolute', left: R(40), top: R(150), width: R(330), height: R(420), background: '#a68a6c', opacity: .55, transform: 'rotate(-1.5deg)'}}/>
  <div style={{position: 'absolute', left: R(28), top: R(296), width: R(760), fontFamily: "'Nimbus Roman', 'Times New Roman', serif", fontSize: R(46), lineHeight: 1.0,
    color: '#1e140c', opacity: .85, transform: 'rotate(-1.5deg)', textShadow: '0 0 1px rgba(0,0,0,.5)'}}>‘SXB’ Still Inside<br/>Despite 30-Day Sentence</div>
  <div style={{position: 'absolute', left: R(44), top: R(398), width: R(300), height: R(140), opacity: .35,
    background: `repeating-linear-gradient(180deg, #2a1d12 0 ${R(2)}px, transparent ${R(2)}px ${R(9)}px)`, transform: 'rotate(-1.5deg)'}}/>
  <div style={{position: 'absolute', left: R(260), top: R(0), width: R(500), height: R(300), opacity: .5,
    background: `repeating-linear-gradient(180deg, #d9c7ae 0 ${R(1.5)}px, transparent ${R(1.5)}px ${R(14)}px), #6b5843`, transform: 'rotate(1deg)'}}/>
</AbsoluteFill>;

// ---------- pass-2 pilot shots (f413-535) ----------
const STROBE = new Set([415, 418, 421, 422, 424]);
const Pass2: React.FC<{f: number}> = ({f}) => {
  // A: SXB walks away down the block toward the bars (ref: Michael's back at the plans wall), f413-435
  if (f >= 413 && f <= 435) {
    if (STROBE.has(f)) return <AbsoluteFill style={{background: '#000'}}/>;
    if (f === 433) return <AbsoluteFill style={{background: '#000'}}><AbsoluteFill style={{clipPath: `inset(0 0 0 ${R(252)}px)`}}><Sil mask="m_back.png" fill="linear-gradient(180deg,#f2c2a2,#c47a58)" z={1.85} ax={400} ay={300} dx={-250} dy={40}/></AbsoluteFill>
      {/* matte lost the dark head wrap: rebuild the head + neck so the flash reads as a full figure like ref f433 */}
      <div style={{position: 'absolute', left: 890 - 105, top: 190, width: 210, height: 250, borderRadius: '50% 50% 44% 44%', background: '#dfa686'}}/>
      <div style={{position: 'absolute', left: 890 - 62, top: 400, width: 124, height: 70, borderRadius: 30, background: '#dfa686'}}/></AbsoluteFill>;
    const z = mix(1.25, 1.33, span(f, 413, 435));
    return <AbsoluteFill style={{background: '#000'}}>
      <Clip src="back.mp4" at={413} from={5.1} z={z} ax={400} ay={300} dx={-230} filter={`${GRADE} brightness(${f === 416 ? .45 : .9})`}/>
      <AbsoluteFill style={{mixBlendMode: 'screen', opacity: f < 416 ? .9 : .25, background: 'radial-gradient(ellipse at 0% 45%, rgba(255,140,40,.85), rgba(255,90,20,0) 38%)'}}/>
    </AbsoluteFill>;
  }
  // B: dark drift over the block (ref dark pan over the wall), f436-448
  if (f >= 436 && f <= 448) return <Clip src="back.mp4" at={436} from={6.0} z={1.7} ax={560} ay={200} dx={mix(20, -30, span(f, 436, 448))} filter={`${GRADE} brightness(.42) contrast(1.15)`}/>;
  // C: newspaper insert, f449-450
  if (f === 449 || f === 450) return <Paper/>;
  // D: blurred orange jumpsuit close (ref skin blur), LED texture on 453, f451-457
  if (f >= 451 && f <= 457) return <AbsoluteFill style={{background: '#000'}}>
    <Clip src="standup.mp4" at={451} from={0.6} z={2.6} ax={560} ay={300} dx={mix(-30, 40, span(f, 451, 457))} filter={`${GRADE} blur(${R(f === 453 ? 6 : 12)}px) brightness(${f >= 455 ? .45 : .8})`}/>
    {f === 453 ? <Led k={1}/> : null}
  </AbsoluteFill>;
  // E: LED macro on the screen-like bars (ref f458)
  if (f === 458) return <AbsoluteFill style={{background: '#000'}}>
    <Clip src="bars.mp4" at={458} from={2.0} z={3.4} ax={520} ay={230} filter={`${GRADE} brightness(3.4) contrast(1.5)`}/><AbsoluteFill style={{background: 'rgba(200,225,235,.28)', mixBlendMode: 'screen'}}/><Led k={1} pitch={5}/>
    <Bands f={f} seed={3} clip={{src: 'bars.mp4', at: 458, from: 2.0, z: 3.4, ax: 520, ay: 230}} n={3}/>
  </AbsoluteFill>;
  if (f >= 459 && f <= 463) return <Clip src="standup.mp4" at={459} from={1.0} z={2.2} ax={560} ay={300} filter={`${GRADE} blur(${R(10)}px) brightness(.3)`}/>;
  // F: eye strip on black (ref f464)
  if (f === 464) return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{clipPath: `inset(${R(144)}px ${W - R(470)}px ${H - R(188)}px ${R(340)}px)`}}>
      <Clip src="close.mp4" at={464} from={1.0} z={.62} ax={398} ay={226} dx={7} dy={-88}/>
    </AbsoluteFill>
  </AbsoluteFill>;
  // G: SXB facing the warden (ref confrontation two-shot), f465-481
  if (f >= 465 && f <= 481) {
    const cl: ClipP = {src: 'office.mp4', at: 465, from: 2.0, z: mix(1.68, 1.76, span(f, 465, 481)), ax: 672, ay: 235, dx: -72, dy: -70};
    if (f === 470) return <Sil mask="m_office.png" fill="linear-gradient(180deg,#ffffff,#e9d9c8)" z={cl.z} ax={cl.ax} ay={cl.ay} dx={cl.dx! - 267} dy={cl.dy}/>;
    if (f === 471) return <AbsoluteFill style={{background: '#000'}}><Clip {...cl} dx={cl.dx! - 267} mask="m_office.png"/></AbsoluteFill>;
    return <AbsoluteFill style={{background: '#000'}}>
      <Clip {...cl} filter={f === 472 || f === 473 ? `${GRADE} contrast(2.1) brightness(1.15) saturate(.7)` : GRADE}/>
      {f === 465 ? <AbsoluteFill style={{mixBlendMode: 'multiply', background: `repeating-linear-gradient(90deg, #ff3b2a 0 ${R(1)}px, #5a1a14 ${R(1)}px ${R(2)}px)`}}/> : null}
    </AbsoluteFill>;
  }
  // white zoom-blur transition, f482-483
  if (f === 482 || f === 483) return <Clip src="reveal.mp4" at={482} from={0.4} z={f === 482 ? 2.2 : 1.9} ax={430} ay={300} filter={`${GRADE} blur(${R(14)}px) brightness(2.2)`}/>;
  // H: SXB at the mic, slow push up the jumpsuit (ref chest-tattoo reveal), f484-505
  if (f >= 484 && f <= 505) {
    const cl: ClipP = {src: 'reveal.mp4', at: 484, from: 0.5, z: mix(1.55, 1.68, io(span(f, 484, 505))), ax: 430, ay: 320, dy: mix(-24, 6, span(f, 484, 505))};
    if (f === 493) return <Clip {...cl} skew={9} z={(cl.z || 1) * 1.08}/>;
    if (f === 494 || f === 495) return <AbsoluteFill style={{background: '#fff'}}>
      <Clip {...cl} filter={`url(#thr)`} style={{clipPath: `inset(0 ${W - R(f === 494 ? 560 : 800)}px 0 0)`}}/>
      {f === 494 ? <Clip {...cl} dx={-150} filter="url(#thr) invert(1)" style={{clipPath: `inset(0 0 0 ${R(560)}px)`}}/> : null}
    </AbsoluteFill>;
    if (f === 496) return <AbsoluteFill style={{background: '#000'}}>
      <Clip {...cl}/><Led k={.9}/>
      {[[220, 60], [330, 48], [470, 70], [560, 40]].map(([x, w], i) => <AbsoluteFill key={i} style={{clipPath: `inset(0 ${W - R(x + w)}px 0 ${R(x)}px)`, mixBlendMode: 'screen'}}>
        <Clip {...cl} filter={`${GRADE} url(#vsmear) sepia(1) saturate(4) hue-rotate(-20deg) brightness(.9)`}/></AbsoluteFill>)}
    </AbsoluteFill>;
    return <Clip {...cl}/>;
  }
  // horizontal whip out, f506-508
  if (f >= 506 && f <= 508) return <AbsoluteFill style={{background: '#000'}}>
    <Clip src="reveal.mp4" at={506} from={1.25} z={1.7} ax={430} ay={300} dx={-(f - 505) * 90} filter={`${GRADE} url(#hblur) brightness(${f === 508 ? 1.3 : .8})`}/>
    {f === 508 ? <Bands f={f} seed={8} clip={{src: 'bars.mp4', at: 508, from: 1.0, z: 1.06}} n={6}/> : null}
  </AbsoluteFill>;
  // I: guard checks the bars (ref cell-bars wide), f509-535; silhouette flash on 528
  if (f >= 509 && f <= 529) {
    const z = mix(1.06, 1.11, span(f, 509, 535));
    if (f === 528) return <Sil mask="m_bars.png" fill="linear-gradient(180deg,#f2c2a2,#c47a58)" z={z} ax={400} ay={300}/>;
    return <Clip src="bars.mp4" at={509} from={1.0} z={z} ax={400} ay={300} filter={`${GRADE} brightness(1.2)`}/>;
  }
  return null;
};

// ---------- pass-2 tail (f530-792) ----------
// helpers: a rect window of a clip on black (eye strips / squares), ref px
const Win: React.FC<{x0: number; y0: number; x1: number; y1: number; clip: ClipP; rot?: number}> = ({x0, y0, x1, y1, clip, rot = 0}) =>
  <AbsoluteFill style={{transformOrigin: `${R((x0 + x1) / 2)}px ${R((y0 + y1) / 2)}px`, transform: `rotate(${rot}deg)`}}>
    <AbsoluteFill style={{clipPath: `inset(${R(y0)}px ${W - R(x1)}px ${H - R(y1)}px ${R(x0)}px)`}}><Clip {...clip}/></AbsoluteFill>
  </AbsoluteFill>;
const Black: React.FC<{children?: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: '#000'}}>{children}</AbsoluteFill>;
// SXB face crops (close.mp4 @1s: eyes ~ (400,200) ref px, face 106 px wide)
const FACE = (at: number, z: number, cx: number, cy: number, extra: Partial<ClipP> = {}): ClipP => ({src: 'close.mp4', at, from: 1.0, z, ax: 400, ay: 200, dx: cx - 400, dy: cy - 200, ...extra});

// blueprint of his block (ref f560-574 "MODIFICATIONS STORAGE BUILD")
const Blueprint: React.FC<{f: number}> = ({f}) => {
  const t = span(f, 560, 574), ink = '#3b4650';
  const cells = Array.from({length: 8}, (_, i) => i);
  const plan = <svg width={R(1600)} height={R(1200)} viewBox="0 0 1600 1200" style={{position: 'absolute', left: 0, top: 0}}>
    <defs><pattern id="bpg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b9c3c9" strokeWidth="1"/></pattern></defs>
    <rect width="1600" height="1200" fill="#eef1f0"/><rect width="1600" height="1200" fill="url(#bpg)" opacity=".7"/>
    <g fill="none" stroke={ink} strokeWidth="5">
      <rect x="120" y="140" width="1360" height="900"/><rect x="140" y="160" width="1320" height="860" strokeWidth="2"/>
      {cells.map(i => <rect key={i} x={160 + i * 160} y={180} width={140} height={240}/>)}
      {cells.map(i => <rect key={'b' + i} x={160 + i * 160} y={780} width={140} height={240}/>)}
      {cells.map(i => <path key={'d' + i} d={`M${175 + i * 160} 420 h110 M${175 + i * 160} 780 h110`} strokeWidth="9" strokeDasharray="6 6"/>)}
      <path d="M160 600 H1440" strokeWidth="2" strokeDasharray="30 12"/>
      <path d="M700 420 V560 H980 V780" stroke="#1d242a" strokeWidth="14" strokeDasharray="4 14"/>
      <circle cx="700" cy="420" r="26" strokeWidth="4"/><path d="M674 420h52M700 394v52" strokeWidth="3"/>
    </g>
    <g fill={ink} fontFamily="'DejaVu Sans Mono', monospace" fontSize="22" letterSpacing="2">
      {cells.map(i => <text key={i} x={175 + i * 160} y={310}>{`C-${String(i + 1).padStart(2, '0')}`}</text>)}
      {cells.map(i => <text key={'t' + i} x={175 + i * 160} y={910}>{`C-${String(i + 9).padStart(2, '0')}`}</text>)}
      <text x="760" y="590">CORRIDOR</text><text x="1000" y="700">MESS</text><text x="190" y="700">GUARD STN</text>
    </g>
  </svg>;
  const title = <div style={{position: 'absolute', left: R(20), top: R(330), transform: 'rotate(-9deg)', transformOrigin: '0 0', fontFamily: 'Anton, sans-serif', fontSize: R(112), lineHeight: .95,
    color: 'transparent', WebkitTextStroke: `${R(2.4)}px #2e3a44`, letterSpacing: R(2)}}>CELL BLOCK C<br/>DAY 4 OF 30</div>;
  if (f <= 565) {
    // tight tilted pan over the plan; 561 = grey negative frame
    const z = mix(1.05, .95, t * 2.3), x = mix(-260, -340, span(f, 560, 565));
    return <AbsoluteFill style={{background: '#eef1f0', filter: f === 561 ? 'invert(.85) grayscale(1) contrast(1.3)' : 'none'}}>
      <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${R(x)}px, ${R(-160)}px) scale(${z}) rotate(${f === 560 ? -7 : -2}deg)`}}>{plan}</AbsoluteFill>
    </AbsoluteFill>;
  }
  const blur = f === 566 ? 'url(#hblur) blur(4px)' : 'none', x = mix(-60, -200, span(f, 566, 574));
  return <AbsoluteFill style={{background: '#eef1f0', filter: blur}}>
    <AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${R(x)}px, ${R(-120)}px) scale(.7) rotate(-9deg)`}}>{plan}</AbsoluteFill>
    <AbsoluteFill style={{transform: `translate(${R(mix(0, -40, span(f, 567, 574)))}px, 0)`}}>{title}</AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0) 40%, rgba(150,160,165,.45) 100%)'}}/>
  </AbsoluteFill>;
};

// light-streak starburst (ref f722-730)
const Burst: React.FC<{f: number}> = ({f}) => {
  const k = span(f, 721, 730), n = 15, cx = 470, cy = 330;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 55%, #18262c 0%, #070b0d 70%)'}}>
    <svg width={W} height={H} viewBox={`0 0 ${RW} ${RH}`} style={{position: 'absolute', inset: 0, filter: `blur(${R(.8)}px)`}}>
      <defs><linearGradient id="ray" x1="0" x2="1"><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor="#bfe7f0" stopOpacity=".9"/><stop offset="1" stopColor="#5fb2c4" stopOpacity="0"/></linearGradient></defs>
      {Array.from({length: n}, (_, i) => {
        const a = 120 + i * (230 / n) + hash(i) * 8 + k * 6, L = (60 + hash(i * 3) * 220) * (0.35 + k);
        return <rect key={i} x={0} y={-1.2 - hash(i * 5) * 1.5} width={L} height={2.4 + hash(i * 5) * 3} fill="url(#ray)" transform={`translate(${cx} ${cy}) rotate(${a})`}/>;
      })}
      <circle cx={cx} cy={cy} r={6 + 10 * k} fill="#fff"/><circle cx={cx} cy={cy} r={30 + 30 * k} fill="#cdeef5" opacity=".25"/>
    </svg>
  </AbsoluteFill>;
};

const Pass2b: React.FC<{f: number}> = ({f}) => {
  // yard -> SXB block wide, heavy horizontal motion blur settling (ref f530-543)
  if (f >= 530 && f <= 543) {
    const b = 1 - span(f, 530, 543);
    return <Clip src="march.mp4" at={530} from={0.2} z={mix(1.9, 1.5, span(f, 530, 543))} ax={400} ay={380} dx={mix(260, 0, io(span(f, 530, 541)))} dy={-40}
      filter={`${GRADE} blur(${R(3 * b)}px) ${b > .25 ? 'url(#hblur)' : ''} brightness(1.35) saturate(1.1)`}/>;
  }
  if (f === 544) return <Black><Win x0={250} y0={156} x1={562} y1={219} clip={FACE(544, 1.5, 405, 188)}/></Black>;
  if (f === 545) return <Black><Clip {...FACE(545, 1.6, 400, 220)} filter="grayscale(1) invert(1) contrast(1.15) brightness(1.05)"
    style={{WebkitMaskImage: 'radial-gradient(ellipse 30% 62% at 50% 62%, #000 75%, transparent 100%)'}}/></Black>;
  if (f === 546) return <Black><Win x0={212} y0={62} x1={394} y1={287} clip={FACE(546, 2.2, 300, 150)}/><Win x0={469} y0={312} x1={606} y1={437} clip={FACE(546, 1.2, 560, 330, {from: 4.0})}/></Black>;
  // SXB stares into the lens (ref Michael's yard stare), f547-558
  if (f >= 547 && f <= 558) return <Clip {...FACE(547, mix(1.78, 1.84, span(f, 547, 558)), 400, 190, {from: 0.4})}/>;
  if (f === 559) return <Black><Win x0={250} y0={160} x1={560} y1={228} clip={FACE(559, 1.6, 405, 192)}/></Black>;
  if (f >= 560 && f <= 574) return <Blueprint f={f}/>;
  // night: lamp-lit office in the dark (ref dark vent), f575-589
  if (f >= 575 && f <= 589) return <Clip src="darkoffice.mp4" at={575} from={0.6} z={mix(1.25, 1.32, span(f, 575, 589))} ax={460} ay={260} dx={-90} dy={40}
    filter={`${GRADE} brightness(1.3) contrast(1.1)`}/>;
  // bars in the dark, tilted into stripes (ref vent stripes), f590-601
  if (f >= 590 && f <= 601) return <Clip src="darkcell.mp4" at={590} from={2.4} z={2.1} ax={290} ay={240} dx={100} dy={20} rot={-38}
    filter={`${GRADE} contrast(1.3) brightness(1.15)`}/>;
  // hands on the tablet (ref hands bolt), f602-622; 604 white sketch, 608 colour negative, 622 smear
  if (f >= 602 && f <= 622) {
    const cl: ClipP = {src: 'hands.mp4', at: 602, from: 0.2, z: mix(2.7, 2.85, span(f, 602, 621)), ax: 465, ay: 380, dx: -65, dy: -90};
    if (f === 604) return <Clip {...cl} filter="grayscale(1) invert(1) contrast(2.2) brightness(1.5)"/>;
    if (f === 608) return <Clip {...cl} filter={`${GRADE} invert(1) saturate(1.6) contrast(1.3)`}/>;
    return <Clip {...cl} filter={f >= 621 ? `${GRADE} url(#hblur) brightness(1.2)` : GRADE}/>;
  }
  // SXB looks down at it (ref looking down), f623-637
  if (f >= 623 && f <= 637) return <Clip src="hands.mp4" at={623} from={4.6} z={mix(3.1, 3.0, span(f, 623, 637))} ax={325} ay={150} dx={135} dy={-20}
    filter={f <= 624 ? `${GRADE} url(#hblur)` : GRADE}/>;
  // turns over the shoulder in the dark, f638-652
  if (f >= 638 && f <= 652) return <Clip src="close.mp4" at={638} from={7.6} z={1.7} ax={530} ay={180} dx={-160} dy={-10} filter={`${GRADE} brightness(.85) contrast(1.15)`}/>;
  if (f === 653) return <Black><Win x0={338} y0={150} x1={494} y1={231} rot={-10} clip={FACE(653, 1.4, 415, 190, {filter: `${GRADE} brightness(1.3)`})}/></Black>;
  // tray macro, red flare (ref ring macro), f654-661
  if (f >= 654 && f <= 661) {
    const cl: ClipP = {src: 'tray.mp4', at: 654, from: 2.8, z: 2.3, ax: 600, ay: 300, dx: -200, dy: 0, filter: `${GRADE} brightness(.75) contrast(1.2)`};
    return <AbsoluteFill style={{background: '#000'}}>
      <Clip {...cl} filter={f === 659 ? `${cl.filter} url(#hblur) brightness(1.4)` : cl.filter}/>
      {f >= 656 && f <= 658 ? <AbsoluteFill style={{mixBlendMode: 'screen', background: 'radial-gradient(ellipse 18% 14% at 28% 12%, rgba(255,20,20,.95), rgba(255,0,0,0))'}}/> : null}
    </AbsoluteFill>;
  }
  // the bunks (ref bunk), f662-672; 673 white sketch
  if (f >= 662 && f <= 673) {
    const cl: ClipP = {src: 'bunk.mp4', at: 662, from: 2.2, z: mix(1.55, 1.62, span(f, 662, 673)), ax: 560, ay: 300, dx: -120};
    return f === 673 ? <Clip {...cl} filter="grayscale(1) invert(1) contrast(1.6) brightness(1.7) opacity(.9)"/> : <Clip {...cl} filter={`${GRADE} brightness(1.15)`}/>;
  }
  // jumpsuit shoulder close (ref bicep tattoo), f674-682
  if (f >= 674 && f <= 682) return <Clip src="lean.mp4" at={674} from={3.4} z={mix(1.9, 1.95, span(f, 674, 682))} ax={380} ay={270} dx={20} filter={`${GRADE} brightness(1.05)`}/>;
  // sepia CCTV / outside-wall montage, f683-697
  if (f >= 683 && f <= 697) {
    const sep = `sepia(1) saturate(2.4) hue-rotate(-12deg) contrast(1.25)`;
    if (f === 697) return <Clip {...FACE(697, 2.6, 400, 240)} filter="grayscale(1) invert(1) sepia(.2) hue-rotate(170deg) saturate(2) contrast(1.6)"/>;
    if (f <= 684) return <Clip src="exterior.mp4" at={683} from={2.0} z={1.45} ax={470} ay={260} filter={`${sep} brightness(.6)`}/>;
    if (f <= 690) {
      const k = span(f, 685, 690);
      return <AbsoluteFill style={{background: '#000'}}>
        <Clip src="cctv.mp4" at={685} from={3.0} z={1.4} ax={330} ay={300} filter={`${sep} brightness(${f === 687 ? 2.4 : 1.15})`}/>
        <div style={{position: 'absolute', left: R(260 - 30 * k), top: R(170 - 20 * k), width: R(250 + 60 * k), height: R(220 + 40 * k), border: `${R(9)}px solid rgba(255,250,235,.95)`,
          boxShadow: `0 0 ${R(40)}px ${R(10)}px rgba(255,220,160,.8), inset 0 0 ${R(30)}px rgba(255,220,160,.6)`, filter: 'blur(1px)', transform: 'rotate(-2deg)'}}/>
        {f === 690 ? <AbsoluteFill style={{background: 'rgba(255,240,220,.35)', mixBlendMode: 'screen'}}/> : null}
      </AbsoluteFill>;
    }
    return <AbsoluteFill style={{background: '#000'}}>
      <Clip src="exterior.mp4" at={691} from={3.0} z={1.5} ax={470} ay={250} filter={`${sep} brightness(${f <= 692 ? .7 : .45})`}/>
      {f <= 692 ? <svg width={W} height={H} viewBox={`0 0 ${RW} ${RH}`} style={{position: 'absolute', inset: 0}}><path d="M250 120 L620 100 M350 115 L345 210" stroke="#fff6e8" strokeWidth="4" fill="none"/></svg> : null}
    </AbsoluteFill>;
  }
  if (f >= 698 && f <= 700) return <AbsoluteFill style={{background: '#06090b'}}/>;
  // eyes CU, f701-714 (702-703 pale neg, 704-705 red dither, 706/707 squares, 710-712 colour glitch, 713 strip + green smear)
  if (f >= 701 && f <= 714) {
    const cl = FACE(701, 5.0, 400, 175, {from: 0.8});
    if (f === 702 || f === 703) return <Clip {...cl} filter="grayscale(1) invert(1) sepia(.3) hue-rotate(150deg) contrast(.8) brightness(1.4)"/>;
    if (f === 704 || f === 705) return <AbsoluteFill><Clip {...cl}/>
      <AbsoluteFill style={{clipPath: `inset(${R(250)}px 0 0 0)`, mixBlendMode: 'hard-light', opacity: .85, background: `repeating-linear-gradient(90deg, #b8262a 0 ${R(3)}px, #6fa7b4 ${R(3)}px ${R(5)}px, #b8262a ${R(5)}px ${R(9)}px)`}}/></AbsoluteFill>;
    if (f === 706) return <Black><Win x0={75} y0={50} x1={350} y1={310} clip={FACE(706, 3.0, 250, 170, {from: 0.8})}/></Black>;
    if (f === 707) return <Black><Win x0={340} y0={110} x1={465} y1={235} clip={FACE(707, 2.4, 400, 175)}/><Win x0={590} y0={85} x1={775} y1={375} clip={FACE(707, 2.4, 650, 140)}/><Win x0={140} y0={315} x1={400} y1={510} clip={FACE(707, 2.4, 300, 300)}/></Black>;
    if (f >= 710 && f <= 712) return <AbsoluteFill><Clip {...cl} filter={`${GRADE} blur(${R(5)}px) saturate(2.5) contrast(1.4) brightness(1.3)`}/>
      <Bands f={f} seed={f} clip={{...cl, filter: 'sepia(1) saturate(3) hue-rotate(-30deg)'}} n={5}/></AbsoluteFill>;
    if (f === 713) return <Black><Win x0={0} y0={0} x1={800} y1={230} clip={cl}/>
      <AbsoluteFill style={{clipPath: `inset(${R(230)}px 0 0 0)`}}><Clip {...cl} filter="url(#vsmear) sepia(1) hue-rotate(100deg) saturate(3) brightness(.9)"/></AbsoluteFill></Black>;
    return <Clip {...cl}/>;
  }
  // dark light-streaks (ref tunnel), f715-721, then starburst 722-730
  if (f >= 715 && f <= 721) return <AbsoluteFill style={{background: '#06090b'}}>
    <Clip src="darkcell.mp4" at={715} from={1.0} z={mix(2.4, 3.2, span(f, 715, 721))} ax={300} ay={150} dx={120} dy={60} rot={-22}
      filter={`${GRADE} contrast(1.5) brightness(${f >= 720 ? .6 : 1.4}) ${f >= 719 ? 'url(#hblur)' : ''}`} style={{WebkitMaskImage: 'radial-gradient(ellipse 45% 30% at 60% 40%, #000 30%, transparent 100%)'}}/>
  </AbsoluteFill>;
  if (f >= 722 && f <= 730) return <Burst f={f}/>;
  // shoving the guard (ref rooftop lunge), f731-748
  if (f >= 731 && f <= 748) {
    const blur = f <= 733 || f === 748;
    return <Clip src="scuffle.mp4" at={731} from={4.7} z={mix(1.45, 1.4, span(f, 731, 748))} ax={500} ay={280} dx={f <= 733 ? mix(-80, 0, span(f, 731, 734)) : 0}
      filter={`${GRADE} brightness(1.75) contrast(.85) saturate(.8) ${blur ? 'url(#hblur)' : ''}`}/>;
  }
  // back of his head -> whip -> he turns to camera (ref f749-768)
  if (f >= 749 && f <= 754) return <Clip src="close.mp4" at={749} from={9.2} z={2.1} ax={482} ay={173} dx={-82} dy={47} filter={`${GRADE} brightness(1.15)`}/>;
  if (f >= 755 && f <= 768) return <Clip {...FACE(755, mix(1.5, 1.58, span(f, 757, 768)), 400, 210, {from: 0.3})} filter={f <= 757 ? `${GRADE} url(#hblur) blur(${R(f === 757 ? 1 : 3)}px)` : `${GRADE} brightness(1.1)`}/>;
  // grey sketch 769, white skin blowout 770-778
  if (f === 769) return <Clip src="lean.mp4" at={769} from={3.5} z={2.2} ax={380} ay={260} filter="grayscale(1) invert(1) contrast(1.8) brightness(1.1)"/>;
  if (f >= 770 && f <= 778) return <Clip src="lean.mp4" at={770} from={3.5} z={mix(2.0, 2.06, span(f, 770, 778))} ax={380} ay={260} filter="grayscale(.6) brightness(2.5) contrast(.8) sepia(.15) hue-rotate(160deg)"/>;
  // dark corridor push under the lamp, 785-787 washed white, 788-792 glitch
  if (f >= 779 && f <= 792) {
    const cl: ClipP = {src: 'darkoffice.mp4', at: 779, from: 0.3, z: mix(1.6, 2.1, span(f, 779, 792)), ax: 460, ay: 120, dx: -60, dy: 60};
    if (f <= 784) return <Clip {...cl} filter={`${GRADE} brightness(1.3) contrast(1.1)`}/>;
    if (f <= 787) return <Clip {...cl} filter={`${GRADE} grayscale(.5) brightness(${f === 785 ? 3.2 : 2.6}) blur(${R(2)}px)`}/>;
    return <AbsoluteFill style={{background: '#f3f5f2'}}>
      <Clip {...cl} from={6.5} z={1.2} ax={400} ay={300} dx={0} dy={0} filter={`url(#thr) ${f >= 790 ? 'invert(1)' : ''}`} style={{opacity: f === 792 ? .35 : 1}}/>
      <Bands f={f} seed={f * 3} clip={{...cl, filter: 'sepia(1) saturate(4) hue-rotate(-25deg) brightness(1.4)'}} n={f === 792 ? 3 : 6}/>
    </AbsoluteFill>;
  }
  return null;
};

// pass 1: single-frame SXB flashes hidden in the ref's white blowouts
const FLASH1: Record<number, ClipP> = {
  186: FACE(186, 1.9, 420, 220),
  391: {src: 'lean.mp4', at: 391, from: 3.5, z: 2.0, ax: 380, ay: 260},
};

export const Sxb06: React.FC = () => {
  const f = useCurrentFrame();
  const built = f >= 413 && f <= 792;
  const fl = FLASH1[f];
  return <AbsoluteFill style={{background: '#000'}}>
    <Defs/>
    {/* pass 1 + the f405-412 hinge: the ref's own Prison Break footage */}
    {f < 413 ? <OffthreadVideo src={C('ref06.mp4')} muted style={{width: W, height: H, objectFit: 'fill'}}/> : null}
    {fl ? <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: .85}}><Clip {...fl} filter="grayscale(1) contrast(2.4) brightness(1.7)"/></AbsoluteFill> : null}
    {built ? (f <= 529 ? <Pass2 f={f}/> : <Pass2b f={f}/>) : null}
    {built ? <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,8,10,.55) 100%)'}}/>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: .09, mixBlendMode: 'overlay'}}><rect width={W} height={H} filter="url(#grain06)" transform={`translate(${(f * 37) % 50},${(f * 53) % 50})`}/></svg>
    </> : null}
    <Audio src={C('ref06.wav')}/>
  </AbsoluteFill>;
};
