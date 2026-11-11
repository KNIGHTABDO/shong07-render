// Edit 02 v2 — firas "WANTED": layered 1:1 clone of ref02 (adnnksgi). Times are measured from the ref (s).
// Look: hazy cream duotone, bloom, refractive rain on glass, grunge, oval vignette; cutouts as soft silhouettes.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const A = (f: string) => staticFile(`w02/${f}`);
const V = (f: string) => staticFile(`w02/v2/${f}`);
const W = 1920, H = 816;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (x: number) => x;
const io = (x: number) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const settle = (x: number) => 1 - Math.pow(1 - x, 4);        // ≈ cubic-bezier(.16,1,.3,1)
const whip = (x: number) => x * x * x;                       // ≈ cubic-bezier(.7,0,.84,0)
type Ease = (x: number) => number;
type K = [number, number, Ease?][];
function key(t: number, k: K): number {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const [t0, v0] = k[i - 1], [t1, v1, e = io] = k[i];
    return v0 + (v1 - v0) * e((t - t0) / (t1 - t0));
  }
  return k[k.length - 1][1];
}
const pulse = (t: number, c: number, up: number, down: number) => t < c - up || t > c + down ? 0 : t < c ? settle((t - c + up) / up) : 1 - io((t - c) / down);
const noise = (t: number, s = 1) => Math.sin(t * 37.1 * s + 1.3) * .5 + Math.sin(t * 91.7 * s + 4.1) * .3 + Math.sin(t * 13.3 * s) * .2;
const shake = (t: number, t0: number, dur: number, amp: number): [number, number] => {
  const p = (t - t0) / dur; if (p < 0 || p > 1) return [0, 0];
  const e = Math.pow(1 - p, 2) * amp; return [noise(t, 3) * e, noise(t + 9, 3.3) * e];
};

const SERIF = 'Cormorant Garamond', SANS = 'Inter', SCRIPT = 'Mrs Saint Delafield';

type Cam = {x: number; y: number; s: number; r: number; rx?: number; ry?: number};
const camT = (c: Cam) => `translate(${c.x}px,${c.y}px) scale(${c.s}) rotate(${c.r}deg)`;

/** Image placed by centre (px) and width. */
const Cut: React.FC<{src: string; x: number; y: number; w: number; ar: number; style?: React.CSSProperties}> = ({src, x, y, w, ar, style}) =>
  <Img src={src} style={{position: 'absolute', left: x - w / 2, top: y - w / ar / 2, width: w, height: w / ar, ...style}}/>;
const Cover: React.FC<{src: string; s?: number; style?: React.CSSProperties}> = ({src, s = 1, style}) =>
  <Img src={src} style={{position: 'absolute', left: W * (1 - s) / 2, top: H * (1 - s) / 2, width: W * s, height: H * s, objectFit: 'cover', ...style}}/>;

// cutout aspect ratios (after keying + crop)
const AR = {trio: 1608 / 896, heli: 1560 / 659, cam: 722 / 356, snoop: 707 / 613, gun: 905 / 890, sniper: 1633 / 317, plane: 1424 / 859, birds: 1363 / 710, ridge: 2400 / 709};
const SIL = 'brightness(.34) contrast(1.15) saturate(.5)';             // soft dark silhouette
const RIM = (c = 'rgba(255,226,170,.55)') => `drop-shadow(0 0 3px ${c}) drop-shadow(0 0 14px rgba(255,220,160,.25))`;

/** Spaced serif caps (LOCK IN, MISTER YOU DONE …). */
const Spaced: React.FC<{text: string; x: number; y: number; size: number; color?: string; op?: number; blur?: number; track?: number; style?: React.CSSProperties; reveal?: number}> =
  ({text, x, y, size, color = '#ded7c8', op = .8, blur = 0, track = .5, style, reveal}) =>
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: SERIF, fontWeight: 500, fontSize: size, letterSpacing: `${track}em`,
      color, opacity: op, whiteSpace: 'pre', filter: blur ? `blur(${blur}px)` : undefined, textShadow: '0 0 10px rgba(0,0,0,.35)', ...style}}>{reveal === undefined ? text : <>{text.slice(0, Math.round(reveal * text.length))}<span style={{opacity: 0}}>{text.slice(Math.round(reveal * text.length))}</span></>}</div>;

// ---------- the WANTED poster (newspaper style like the ref) ----------
const RedX: React.FC<{x: number; y: number; s: number; p: number}> = ({x, y, s, p}) => p <= 0 ? null :
  <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', overflow: 'visible'}}>
    <path d="M12 10 L88 92" stroke="#9e2a24" strokeWidth={13} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p * 2)} opacity={.9}/>
    <path d="M86 12 L14 88" stroke="#9e2a24" strokeWidth={13} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(p * 2 - 1)} opacity={.9}/>
  </svg>;

const Poster: React.FC<{w: number; photo?: 'mug' | 'crew'; xs?: number; ego?: number; style?: React.CSSProperties}> = ({w, photo = 'mug', xs = 0, ego = 0, style}) => {
  const h = w * 1.32, u = w / 100;
  return <div style={{position: 'absolute', width: w, height: h, background: '#d4d0c6', boxShadow: '0 18px 40px rgba(0,0,0,.6)', overflow: 'hidden', ...style}}>
    <Img src={A('grunge.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: .55}}/>
    <div style={{position: 'absolute', top: 3 * u, width: '100%', textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 21 * u, lineHeight: 1, color: '#1b1a17', letterSpacing: '-.01em'}}>WANTED</div>
    <div style={{position: 'absolute', top: 25.5 * u, left: 8 * u, right: 8 * u, height: 6 * u, background: '#1d1c19', color: '#e4e0d6', fontFamily: SERIF, fontWeight: 600,
      fontSize: 3.9 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '.08em'}}>HAVE YOU SEEN THIS PERSON?</div>
    <div style={{position: 'absolute', top: 34 * u, left: 16 * u, width: 68 * u, height: 74 * u, background: '#e9e7e1', overflow: 'hidden', outline: `${.6 * u}px solid #1d1c19`}}>
      {photo === 'mug'
        ? <Img src={V('mugshot.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.1)'}}/>
        : <><Img src={V('city_up.png')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(1.15)'}}/>
          <Img src={V('trio_a.png')} style={{position: 'absolute', left: '-35%', bottom: 0, width: '170%', filter: 'grayscale(1) brightness(.55) contrast(1.2)'}}/></>}
      {xs > 0 && <><RedX x={30} y={44} s={26 * u} p={clamp(xs * 2)}/><RedX x={70} y={44} s={26 * u} p={clamp(xs * 2 - 1)}/></>}
      {ego > 0 && <div style={{position: 'absolute', top: '62%', width: '100%', textAlign: 'center', fontFamily: 'Anton', fontSize: 15 * u, lineHeight: .95, color: '#f1ead9',
        opacity: ego, textShadow: '0 0 6px rgba(255,240,210,.5)', letterSpacing: '.02em'}}>EGO<br/>PLAYING</div>}
    </div>
    <div style={{position: 'absolute', top: 110 * u, width: '100%', textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 10 * u, color: '#1b1a17', lineHeight: 1}}>ABU FAHDA</div>
    <div style={{position: 'absolute', top: 120.5 * u, width: '100%', textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 5.4 * u, color: '#1b1a17'}}>$1,000,000 REWARD</div>
    <div style={{position: 'absolute', top: 127.2 * u, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 2.6 * u, color: '#2b2925'}}>Please call the IAA if you have any information</div>
  </div>;
};

/** Map + poster table, flat (camera + 3D tilt applied by caller). */
const Desk: React.FC<{slide: number; px?: number; py?: number; pr?: number; pw?: number; photo?: 'mug' | 'crew'; xs?: number; ego?: number; lyric?: boolean}> =
  ({slide, px = 1060, py = 90, pr = 6, pw = 520, photo, xs, ego, lyric}) => <>
  <Img src={A('ls_map.png')} style={{position: 'absolute', left: -300, top: -300, width: W + 600, height: H + 600, objectFit: 'cover', filter: 'grayscale(.6) sepia(.5) brightness(1.15) contrast(.9)'}}/>
  <Img src={A('grunge.jpg')} style={{position: 'absolute', left: -300, top: -300, width: W + 600, height: H + 600, mixBlendMode: 'multiply', opacity: .6}}/>
  <div style={{position: 'absolute', left: 300, top: 290, fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, color: '#4a453b', opacity: .55, mixBlendMode: 'multiply', letterSpacing: '.08em'}}>made by knight<br/>on remotion</div>
  {lyric && <>
    <div style={{position: 'absolute', left: 1000, top: 190, fontFamily: SERIF, fontWeight: 700, fontSize: 78, lineHeight: 1.15, color: '#1d1a15', letterSpacing: '.28em', opacity: .9, whiteSpace: 'pre', transform: 'rotate(-4deg)'}}>{'F I X E D  U P ,\nF E L I X ,  M Y\nF A I T H  T O\nT H E  R O O F'}</div>
    {[480, 1560].map(x => <div key={x} style={{position: 'absolute', left: x, top: -300, width: 9, height: H + 600, background: '#ff1000', boxShadow: '0 0 14px 4px rgba(255,20,0,.8)', filter: 'saturate(3) blur(1.5px)', transform: 'rotate(3deg)'}}/>)}
  </>}
  <Poster w={pw} photo={photo} xs={xs} ego={ego} style={{left: px + 700 * (1 - slide), top: py - 420 * (1 - slide), transform: `rotate(${pr + 14 * (1 - slide)}deg)`}}/>
</>;

// magnifier_a.png geometry (px of the keyed image): lens centre, lens radius, image width — measured after keying
const MAG = {cx: 255, cy: 280, r: 235, w: 800};
/** Magnifying glass: sharp z× copy of `children` (the same world) inside a circle + rim image. */
const Lens: React.FC<{cx: number; cy: number; r: number; children: React.ReactNode; z?: number}> = ({cx, cy, r, children, z = 1.35}) => <>
  <div style={{position: 'absolute', inset: 0, clipPath: `circle(${r}px at ${cx}px ${cy}px)`}}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${z})`, filter: 'contrast(1.15) brightness(1.08)'}}>{children}</div>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent 70%, rgba(0,0,0,.35) 100%)`}}/>
  </div>
  <Img src={V('magnifier_a.png')} style={{position: 'absolute', left: cx - r * MAG.cx / MAG.r, top: cy - r * MAG.cy / MAG.r, width: r * MAG.w / MAG.r, filter: 'brightness(.55) drop-shadow(14px 20px 22px rgba(0,0,0,.7))'}}/>
</>;

// ---------- scope reticle ----------
const Scope: React.FC<{y: number; r: number}> = ({y, r}) => {
  const cx = W / 2, cy = H / 2 + y;
  return <div style={{position: 'absolute', inset: 0}}>
    <div style={{position: 'absolute', left: -400, top: -400, width: W + 800, height: H + 800, background: `radial-gradient(circle ${r}px at ${cx + 400}px ${cy + 400}px, transparent 96%, rgba(6,5,4,.38) 99.5%)`}}/>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle ${r * 1.02}px at ${cx}px ${cy}px, transparent 75%, rgba(0,0,0,.55) 100%)`}}/>
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      <g stroke="#0b0a08" strokeWidth={3} opacity={1}>
        <line x1={cx - r} y1={cy} x2={cx - 26} y2={cy}/><line x1={cx + 26} y1={cy} x2={cx + r} y2={cy}/>
        <line x1={cx} y1={cy - r} x2={cx} y2={cy - 26}/><line x1={cx} y1={cy + 26} x2={cx} y2={cy + r}/>
        <line x1={cx - r} y1={cy} x2={cx - r * .62} y2={cy} strokeWidth={4}/><line x1={cx + r * .62} y1={cy} x2={cx + r} y2={cy} strokeWidth={4}/>
        <line x1={cx} y1={cy + r * .62} x2={cx} y2={cy + r} strokeWidth={4}/>
      </g>
      {[-4, -3, -2, -1, 1, 2, 3, 4].map(i => <g key={i} fill="#0b0a08"><rect x={cx + i * r * .11 - 1} y={cy - (i % 2 ? 7 : 12)} width={2} height={i % 2 ? 14 : 24}/><rect x={cx - (i % 2 ? 7 : 12)} y={cy + i * r * .11 - 1} width={i % 2 ? 14 : 24} height={2}/></g>)}
    </svg>
  </div>;
};

// ---------- subs ----------
const SUBS: [number, number, string][] = [
  [0.0, 2.07, "cause i'm locked in, locked in, when I'm with yah"],
  [2.07, 3.73, "locked in, locked in, when I'm with yah"],
  [3.73, 5.17, 'mister you done made me new'],
  [5.17, 7.07, 'fixed up, felix, my faith to the roof'],
  [7.07, 9.57, 'built up, the spirit come through\nPray up, enemy go poof'],
  [9.57, 11.95, "way up, my ego playing, break 'em down, we"],
  [11.95, 12.95, "don't need them goofs"],
  [12.95, 14.1, '이성 잃었던 짐승에서\n(Was a senseless animal)'],
  [14.1, 15.47, "you're my shepherd now"],
  [15.47, 20, 'I call on you to make your move'],
];
const Subs: React.FC<{t: number}> = ({t}) => {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return null;
  return <div style={{position: 'absolute', left: 0, width: W, bottom: 30, display: 'flex', justifyContent: 'center'}}>
    <div style={{fontFamily: /[가-힣]/.test(s[2]) ? `${SANS}, 'Noto Sans CJK KR', 'Noto Serif CJK KR'` : SANS, fontSize: 31, fontWeight: 400, color: '#f1efe9', textAlign: 'center',
      whiteSpace: 'pre', lineHeight: 1.22, textShadow: '0 1px 3px rgba(0,0,0,.95), 0 0 8px rgba(0,0,0,.6)'}}>{s[2]}</div></div>;
};

// ---------- cream over-exposure flashes [centre, half-width, peak] ----------
const FLASH: [number, number, number][] = [[0.93, .12, .95], [2.19, .07, .9], [3.84, .2, .55], [6.55, .07, .7], [9.57, .08, .9], [10.68, .08, .95], [11.68, .09, .85], [15.40, .06, 1]];
const flashAt = (t: number) => Math.max(0, ...FLASH.map(([c, w, p]) => {const d = Math.abs(t - c) / w; return d >= 1 ? 0 : p * (1 - d * d);}));
// warm → cold sky (3.75–4.0)
const coldAt = (t: number) => t < 3.75 ? 0 : t < 4.0 ? (t - 3.75) / .25 : t < 5.17 ? 1 : 0;

// ---------- shots ----------
type Shot = {cam: Cam; world: React.ReactNode; fg?: React.ReactNode; persp?: boolean; wb?: string};
// projector screen hole in projector_room_a (fractions of frame) — measured after keying
const ROOM = {l: .207, t: .031, w: .585, h: .763}; // plate drawn contain: h 816, w 1451, left 234.5

const City: React.FC<{t: number; heliX: number; lockIn?: boolean; flare?: boolean}> = ({t, heliX, lockIn, flare}) => <>
  <Cover src={V('city_up.png')} s={1.15}/>
  <Cut src={V('heli_a.png')} x={heliX} y={150 + Math.sin(t * 2) * 8} w={600} ar={AR.heli} style={{filter: 'brightness(.3) blur(3px)', transform: 'rotate(-8deg)'}}/>
  <Cut src={V('birds_a.png')} x={1460 + t * 30} y={150} w={520} ar={AR.birds} style={{filter: 'brightness(.25) blur(1px)'}}/>
  {flare && <div style={{position: 'absolute', left: 820, top: 160, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,200,.95), rgba(255,223,158,.45) 35%, transparent 70%)'}}/>}
  <Cut src={V('trio_a.png')} x={W / 2} y={H - 1150 / AR.trio / 2 + 60} w={1150} ar={AR.trio} style={{filter: `${SIL} ${RIM()}`}}/>
  {lockIn && <><Spaced text="LOCK IN" x={420} y={404} size={27} op={.75}/><Spaced text="LOCK IN" x={1500} y={404} size={27} op={.75}/></>}
</>;

const MisterText: React.FC<{t: number}> = ({t}) => {
  const a = clamp((t - 3.65) / .2), b = clamp((t - 3.95) / .25), o = clamp((4.75 - t) / .12);
  return <>
    <Spaced text="M I S T E R   Y O U   D O N E" x={W / 2} y={360} size={36} color="#ffffff" op={1 * o * a} track={.3}
      style={{transform: `translate(-50%,-50%) scale(${1.3 - .3 * settle(a)})`, filter: `blur(${(1 - a) * 10}px)`, textShadow: '0 2px 10px rgba(0,0,0,.65)'}}/>
    <div style={{position: 'absolute', left: W / 2 + 30, top: 430, transform: `translate(-50%,-50%) rotate(-4deg) scale(${1.3 - .3 * settle(b)})`, fontFamily: SCRIPT, fontSize: 120,
      color: '#e2ddd2', opacity: .45 * b * o, filter: `blur(${(1 - b) * 10}px)`, textShadow: '0 0 14px rgba(0,0,0,.3)', whiteSpace: 'pre'}}>Made me new</div>
  </>;
};

/** Breaking-news graphic shown on the projector/TV (fills its parent). */
const News: React.FC = () => <div style={{position: 'absolute', inset: 0, background: '#1b2a30', overflow: 'hidden', fontFamily: SANS, containerType: 'size'}}>
  <Img src={V('city_up.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(.6)'}}/>
  <Img src={V('trio_a.png')} style={{position: 'absolute', left: '12%', bottom: '-6%', width: '76%', filter: 'grayscale(1) brightness(.5) contrast(1.2)'}}/>
  <div style={{position: 'absolute', right: '6%', top: '30%', width: '30%', height: '40%', background: 'radial-gradient(ellipse, rgba(139,26,20,.75), transparent 65%)', mixBlendMode: 'multiply'}}/>
  <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: '13%', background: 'linear-gradient(90deg,#bfe6f2,#86c6dc)', color: '#0b1a20', fontWeight: 900, fontSize: '8cqh',
    display: 'flex', alignItems: 'center', paddingLeft: '4%', letterSpacing: '.04em'}}>BREAKING NEWS</div>
  <div style={{position: 'absolute', left: '4%', right: '16%', bottom: '7%', height: '20%', background: '#f1f1ee', color: '#16191b', fontWeight: 800, display: 'flex', alignItems: 'center', paddingLeft: '3%',
    lineHeight: 1.05, fontSize: '6.6cqh'}}>SCRAP GANG LEADER ABU FAHDA<br/>AND TWO MEMBERS FOUND DEAD</div>
  <div style={{position: 'absolute', right: '4%', bottom: '7%', width: '11%', height: '20%', background: '#c4161c', color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8cqh'}}>LIVE</div>
</div>;

const Credit: React.FC<{t: number; t0: number; t1: number; lines: string[]; x: number; y: number}> = ({t, t0, t1, lines, x, y}) => {
  const a = clamp((t - t0) / .17) * clamp((t1 - t) / .17); if (a <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'perspective(900px) rotateY(-22deg) rotate(-6deg)', fontFamily: SANS, fontSize: 34, lineHeight: 1.25, color: '#c8e6ec',
    opacity: a, filter: `blur(${(1 - a) * 6}px)`, textShadow: '2px 0 0 rgba(255,60,60,.45), -2px 0 0 rgba(60,220,255,.45), 0 0 14px #4ac2db'}}>{lines.map(l => <div key={l}>{l}</div>)}</div>;
};

function shot(t: number): Shot {
  const cx = W / 2, cy = H / 2;
  // S1 0–0.92 — map + poster in extreme 3D tilt, poster slides in, punch-zoom out
  if (t < 0.92) {
    const s = key(t, [[0, 1.05], [0.8, 1.18, lin], [0.92, 2.1, whip]]);
    return {persp: true, cam: {x: key(t, [[0, 0], [0.8, -70, lin]]), y: key(t, [[0, 0], [0.8, 25, lin]]), s, r: key(t, [[0, -20], [0.8, -25, lin]]), rx: key(t, [[0, 25], [0.8, 30, lin]]), ry: key(t, [[0, 16], [0.8, 20, lin]])},
      world: <Desk slide={settle(clamp(t / .55))}/>};
  }
  // S2 0.92–2.19 — city, heli, crew low angle; huge camcorder in front, LCD shows the crew sharp
  if (t < 2.19) {
    const [sx, sy] = shake(t, .92, .22, 8);
    const s = key(t, [[.92, 1.35], [1.22, 1, settle], [2.1, 1.06, lin], [2.19, 1.12, whip]]);
    const r = key(t, [[.92, -12], [1.22, -6, settle], [2.1, -9, lin]]);
    const drift = key(t, [[.92, 0], [2.19, -40, lin]]);
    const world = <City t={t} heliX={340 + drift * .5} lockIn/>;
    const camX = 386 + drift * 1.4, camY = -224, cw = 3100, ch = cw / AR.cam;
    const hole = {x: camX + cw * .042, y: camY + ch * .315, w: cw * .274, h: ch * .326};
    return {cam: {x: sx, y: sy, s, r}, world: <div style={{position: 'absolute', inset: 0, filter: 'blur(7px) brightness(.8)'}}>{world}</div>,
      fg: <div style={{position: 'absolute', inset: 0, transform: `rotate(${-8 + (r + 6) * .4}deg) translate(${sx * 1.4}px,${sy * 1.4}px)`, transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, overflow: 'hidden', background: '#ccc'}}>
          <div style={{position: 'absolute', left: -hole.x, top: -hole.y, width: W, height: H, transformOrigin: `${hole.x + hole.w / 2}px ${hole.y + hole.h / 2}px`, transform: 'scale(1.15)', filter: 'contrast(1.12)'}}>{world}</div>
        </div>
        <Img src={V('camcorder_a.png')} style={{position: 'absolute', left: camX, top: camY, width: cw, height: ch, filter: 'brightness(.22) contrast(1.2) blur(1.5px)'}}/>
      </div>};
  }
  // S3 2.19–3.5 — Snoop from behind, poster double-exposed in his head; poster flies off diagonally 3.22–3.5
  if (t < 3.5) {
    const s = key(t, [[2.19, 1.25], [2.45, 1.02, settle], [3.25, 1.12, lin]]);
    const fly = clamp((t - 3.22) / .28);
    const sw = 1700, sh = sw / AR.snoop, sl = cx - sw / 2 + 40, st = 70;
    const mask = `url(${V('snoop_back_a.png')})`;
    return {cam: {x: 0, y: key(t, [[2.45, 0], [3.25, -16, lin]]), s, r: key(t, [[2.19, 3], [2.45, 0, settle]])},
      world: <>
        <Cover src={V('wall_street.png')} s={1.15} style={{filter: 'blur(9px) brightness(1.1)'}}/>
        <Spaced text="LOCK IN" x={430} y={404} size={27} blur={3} op={.6}/><Spaced text="LOCK IN" x={1600} y={404} size={27} op={.75}/>
        <Img src={V('snoop_back_a.png')} style={{position: 'absolute', left: sl, top: st, width: sw, height: sh, filter: 'brightness(.12) blur(1.5px)'}}/>
        <div style={{position: 'absolute', left: sl, top: st, width: sw, height: sh, WebkitMaskImage: mask, WebkitMaskSize: '100% 100%', maskImage: mask, maskSize: '100% 100%', opacity: 1 - fly}}>
          <div style={{position: 'absolute', inset: 0, background: '#16150f'}}/>
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: 'radial-gradient(ellipse 24% 40% at 50% 30%, #000 55%, transparent 100%)', maskImage: 'radial-gradient(ellipse 24% 40% at 50% 30%, #000 55%, transparent 100%)'}}>
            <Poster w={520} photo="crew" style={{left: sw / 2 - 260, top: -30, opacity: .78}}/>
          </div>
        </div>
        {fly > 0 && <Poster w={620} photo="crew" style={{left: key(fly, [[0, 500], [1, 2100, whip]]), top: key(fly, [[0, 120], [1, -900, whip]]), transform: `rotate(${-8 + 50 * whip(fly)}deg) scale(${1 + fly})`, filter: `blur(${fly * 14}px)`}}/>}
        {fly > .5 && <Cover src={V('clouds.png')} s={1.3} style={{opacity: (fly - .5) * 2, filter: 'grayscale(.75) blur(12px)'}}/>}
      </>};
  }
  // S4 3.5–5.17 — sky pan, warm→cold, "MISTER YOU DONE / Made me new", plane crosses, spin-zoom out
  if (t < 5.17) {
    const s = key(t, [[3.5, 1.3], [3.65, 1.1, settle], [5.05, 1.12, lin], [5.17, 1.8, whip]]) + .08 * pulse(t, 3.68, .04, .3);
    const r = key(t, [[3.5, -4], [5.05, 2, lin], [5.17, 25, whip]]);
    const pl = clamp((t - 4.72) / .45);
    return {cam: {x: 0, y: key(t, [[3.5, 160], [3.75, 30, settle], [5.17, -30, lin]]), s, r},
      world: <>
        <Cover src={V('clouds.png')} s={1.3} style={{filter: 'saturate(1.3) contrast(1.5) brightness(.62) hue-rotate(12deg) blur(1.5px)'}}/>
        {t < 3.62 && <Spaced text="LOCK IN" x={1500} y={430} size={26} color="#2b2d2f" op={.8}/>}
        {t > 3.65 && t < 4.75 && <MisterText t={t}/>}
        {pl > 0 && pl < 1 && <Cut src={V('plane_a.png')} x={key(pl, [[0, 1500], [1, 200, lin]])} y={key(pl, [[0, 760], [1, 60, lin]])} w={key(pl, [[0, 2600], [1, 700, lin]])} ar={AR.plane}
          style={{transform: 'rotate(-35deg)', filter: 'brightness(.18) blur(5px)'}}/>}
      </>};
  }
  // S5 5.17–6.57 — magnifier over the poster on the map; whip to the printed lyric
  if (t < 6.57) {
    const pan = key(t, [[5.45, 0], [5.65, 1, io]]);
    const s = key(t, [[5.17, 1.2], [5.45, .92, settle], [5.65, .95], [6.45, 1.05, lin], [6.57, 1.25, whip]]);
    const lx = key(t, [[5.17, 1250], [5.45, 1020, settle], [5.65, 960, io], [6.45, 1010, lin]]), ly = key(t, [[5.17, 560], [5.45, 360, settle], [5.65, 400, io], [6.45, 420, lin]]);
    const cam = {x: pan * 140, y: key(t, [[6.4, 0], [6.57, 260, whip]]), s, r: key(t, [[5.17, -18], [5.45, -12, settle], [5.65, -2, io]]), rx: 22, ry: 0};
    const world = <Desk slide={settle(clamp((t - 5.17) / .4))} lyric pw={380} px={760} py={120}/>;
    return {persp: true, cam, world, wb: 'blur(4px) brightness(1.12) contrast(.92)',
      fg: <>
        <Lens cx={lx} cy={ly} r={195}><World cam={cam} persp>{world}</World></Lens>
        {t > 5.8 && <div style={{position: 'absolute', inset: 0, opacity: key(t, [[5.8, 0], [5.95, .8], [6.4, .5], [6.5, 0]]),
          background: 'linear-gradient(90deg, rgba(120,18,12,.75), transparent 14%, transparent 78%, rgba(170,30,18,.6) 83%, transparent 88%, rgba(120,18,12,.7))', mixBlendMode: 'screen'}}/>}
      </>};
  }
  // S6 6.57–8.85 — crew low angle full frame, heli; dark occlusion wipe 7.62–8.0 flips the Dutch tilt
  if (t < 8.85) {
    const s = key(t, [[6.57, 1.15], [7.62, 1.25, lin], [8.0, 1.1, settle], [8.85, 1.16, lin]]);
    const r = key(t, [[6.57, 16], [7.62, 12, lin], [7.82, -12, io], [8.85, -8, lin]]);
    const occ = clamp((t - 7.58) / .45);
    return {cam: {x: key(t, [[7.9, -60], [8.85, 70, lin]]), y: 0, s, r},
      world: <City t={t} heliX={key(t, [[6.57, 420], [8.85, 300, lin]])} flare/>,
      fg: occ > 0 && occ < 1 ? <div style={{position: 'absolute', left: key(occ, [[0, -1300], [1, 2400, lin]]), top: -300, width: 1500, height: H + 600, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, #050403 55%, rgba(5,4,3,0) 72%)', filter: 'blur(20px)'}}/> : null};
  }
  // S7 8.85–9.57 — gunman profile silhouette at sunset, muzzle flash 9.02
  if (t < 9.57) {
    const [sx, sy] = shake(t, 9.02, .22, 14);
    const s = key(t, [[8.85, 1.05], [9.02, 1.12, settle], [9.3, 1.15, lin], [9.57, .85, whip]]) + .1 * pulse(t, 9.04, .02, .18);
    const gw = 1050, gx = 1060, gy = 470;
    const fl = clamp(1 - Math.abs(t - 9.04) / .06);
    return {cam: {x: key(t, [[8.85, 115], [9.02, 0, settle]]) + sx, y: sy, s, r: key(t, [[9.3, 0], [9.57, -14, whip]])},
      world: <>
        <Cover src={V('sunset_trees.png')} s={1.1} style={{filter: 'blur(7px) brightness(1.05)'}}/>
        <Cut src={V('gunman_a.png')} x={gx} y={gy} w={gw} ar={AR.gun} style={{filter: `brightness(.16) contrast(1.4) saturate(.4) ${RIM('rgba(255,196,110,.95)')} drop-shadow(0 0 2px rgba(255,214,150,.9))`}}/>
        {fl > 0 && <div style={{position: 'absolute', left: gx - gw / 2 - 40, top: gy - gw / AR.gun / 2 + gw / AR.gun * .26 - 60, width: 120, height: 120, borderRadius: '50%',
          background: 'radial-gradient(circle, #fff8e0 0%, #ffcf6a 30%, rgba(255,140,40,0) 70%)', transform: `scale(${1 + fl * 1.5})`, opacity: fl}}/>}
        <div style={{position: 'absolute', left: 1480, top: 300, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,190,.8), transparent 65%)', mixBlendMode: 'screen'}}/>
      </>};
  }
  // S8 9.57–11.63 — poster close-up, magnifier, red X's, WAY UP / EGO PLAYING; whip down
  if (t < 11.63) {
    const s = key(t, [[9.57, 1.15], [10.4, .86, settle], [11.4, .9, lin]]) + .1 * pulse(t, 10.7, .04, .5);
    const cam = {x: 0, y: key(t, [[11.4, 0], [11.63, -330, whip]]), s, r: key(t, [[9.57, 8], [10.4, -3, settle], [11.4, 2, lin]])};
    const world = <>
      <Desk slide={1} pw={760} px={580} py={-60} pr={2} xs={clamp((t - 9.85) / .6)} ego={clamp((t - 10.7) / .2)}/>
      <Spaced text="W A Y  U P" x={330} y={400} size={46} color="#3a352d" op={t > 9.65 ? .85 : 0} track={.3}/>
    </>;
    const lx = key(t, [[9.57, 1380], [10.4, 1000, settle], [11.4, 760, lin]]), ly = key(t, [[9.57, 520], [10.4, 380, settle]]);
    return {cam, world, wb: 'blur(7px) brightness(.72)', fg: <Lens cx={lx} cy={ly} r={170}><World cam={cam}>{world}</World></Lens>};
  }
  // S8b 11.63–12.6 — dark navy: WE DON'T NEED THEM GOOFS over giant blurred "need"
  if (t < 12.6) {
    const s = key(t, [[11.63, 1.05], [12.6, 1.2, lin]]);
    return {cam: {x: 0, y: 0, s, r: 0},
      world: <>
        <div style={{position: 'absolute', inset: 0, background: '#0b0f15'}}/>
        <div style={{position: 'absolute', inset: 0, opacity: .07, filter: 'blur(6px)'}}><Desk slide={1} pw={760} px={580} py={-300} pr={2} xs={1}/></div>
        <div style={{position: 'absolute', left: cx, top: 690, transform: 'translate(-50%,-50%)', fontFamily: SANS, fontWeight: 700, fontSize: 380, color: '#dfe6ee', opacity: .3, filter: 'blur(7px)', letterSpacing: '-.02em'}}>need</div>
        <Spaced text="W E  D O N ' T  N E E D  T H E M  G O O F S" x={cx} y={470} size={30} color="#c4ccd4" op={.9} track={.25} reveal={clamp((t - 11.68) / .6)}/>
        <div style={{position: 'absolute', left: 1480, top: 330, width: 500, height: 120, background: 'radial-gradient(ellipse, rgba(255,230,190,.9), rgba(255,200,140,.25) 30%, transparent 70%)', mixBlendMode: 'screen'}}/>
      </>};
  }
  // S9 12.6–13.91 — fade up: Snoop prone in the bushes, zoom into the scope
  if (t < 13.91) {
    const s = key(t, [[12.7, 1.2], [13.2, 1.05, settle], [13.72, 1.12, lin], [13.91, 2.4, whip]]);
    const sw = 1500, sx0 = 1000, sy0 = 545;
    const scopeX = sx0 - sw / 2 + sw * .756, scopeY = sy0 - sw / AR.sniper / 2 + sw / AR.sniper * .26;
    const pull = clamp((t - 13.72) / .19);
    return {cam: {x: key(t, [[12.7, -230], [13.2, 0, settle]]) + (cx - scopeX) * whip(pull), y: (cy - scopeY) * whip(pull), s, r: key(t, [[12.7, -6], [13.2, -2, settle]])},
      world: <>
        <Cover src={V('bush_scene.png')} s={1.1} style={{filter: 'blur(3px)'}}/>
        <Cut src={V('sniper_a.png')} x={sx0} y={sy0} w={sw} ar={AR.sniper} style={{filter: `${SIL} ${RIM('rgba(255,230,180,.5)')}`}}/>
        <Img src={V('ridge_a.png')} style={{position: 'absolute', left: -140, top: 360, width: 2200, height: 2200 / AR.ridge, filter: 'brightness(.3) contrast(1.2) saturate(.5) blur(1.5px)'}}/>
        <div style={{position: 'absolute', left: -200, right: -200, bottom: -120, height: 420, background: 'radial-gradient(ellipse 45% 60% at 22% 100%, rgba(7,6,4,.97) 40%, transparent 100%), linear-gradient(to top, rgba(7,6,4,.9), transparent 70%)', filter: 'blur(14px)'}}/>
      </>};
  }
  // S10 13.91–15.47 — aerial road through the scope; scope slides up; shot at 14.30
  if (t < 15.47) {
    const [sx, sy] = shake(t, 14.3, .25, 16);
    const s = key(t, [[13.91, 1.45], [14.25, 1.05, settle], [15.3, 1.14, lin]]) + .2 * pulse(t, 14.32, .03, .3);
    const scy = key(t, [[13.95, H], [14.3, 0, settle]]) + sy * 1.3;
    return {cam: {x: sx, y: sy, s, r: key(t, [[13.91, 12], [14.25, 4, settle], [15.3, 8, lin]])},
      world: <Cover src={V('sunset_trees.png')} s={1.25} style={{filter: 'blur(14px) sepia(1) saturate(3) hue-rotate(-12deg) brightness(.95) contrast(1.25)'}}/>,
      fg: <>
        {[[180, 160, 260], [420, 620, 200], [1560, 140, 300], [1760, 520, 240], [300, 420, 160], [1420, 700, 180]].map(([bx, by, br], i) =>
          <div key={i} style={{position: 'absolute', left: bx - br, top: by - br + scy * .3, width: br * 2, height: br * 2, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,170,60,.75), rgba(230,120,30,.35) 55%, transparent 72%)', filter: 'blur(10px)', mixBlendMode: 'screen'}}/>)}
        <div style={{position: 'absolute', inset: 0, clipPath: `circle(470px at ${W / 2}px ${H / 2 + scy}px)`}}>
          <div style={{position: 'absolute', inset: 0, background: '#dccfb4'}}/>
          <div style={{position: 'absolute', left: W / 2 - 1300 + key(t, [[13.91, 260], [15.47, 40, lin]]), top: H / 2 + scy - 1300 + key(t, [[13.91, 220], [15.47, 60, lin]]), width: 2600, height: 2600, transform: 'rotate(-32deg)'}}>
            <Img src={V('aerial_road.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(.4) blur(2px) brightness(1.6) contrast(.9)', opacity: .45}}/>
          </div>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle 470px at ${W / 2}px ${H / 2 + scy}px, rgba(255,248,230,.25), transparent 55%, rgba(40,30,20,.45) 100%)`}}/>
        </div>
        <Scope y={scy} r={470}/>
        <div style={{position: 'absolute', left: cx - 3, top: 0, width: 6, height: H, background: 'linear-gradient(transparent, rgba(255,246,224,.7), transparent)', filter: 'blur(3px)',
          opacity: .5 + .5 * pulse(t, 14.32, .02, .4)}}/>
      </>};
  }
  // S11 15.47–15.9 — black beat
  if (t < 15.9) return {cam: {x: 0, y: 0, s: 1, r: 0}, world: <div style={{position: 'absolute', inset: 0, background: '#040709'}}/>};
  // S12 15.9–18.03 — projector room, news on the screen, Abu Fahda silhouette; credits
  if (t < 18.03) {
    return {cam: {x: 0, y: 0, s: key(t, [[15.9, .92], [18.03, .84, lin]]), r: 0},
      world: <>
        <div style={{position: 'absolute', inset: 0, background: '#020405'}}/>
        <div style={{position: 'absolute', left: ROOM.l * W, top: ROOM.t * H, width: ROOM.w * W, height: ROOM.h * H}}><News/></div>
        <Img src={V('projector_room_a.png')} style={{position: 'absolute', left: 234.5, top: 0, width: 1451, height: 816}}/>
        <div style={{position: 'absolute', left: ROOM.l * W - 80, top: ROOM.t * H - 60, width: ROOM.w * W + 160, height: ROOM.h * H + 120, background: 'radial-gradient(ellipse, rgba(138,232,255,.25), transparent 70%)', mixBlendMode: 'screen'}}/>
      </>,
      fg: <Credit t={t} t0={16.4} t1={18.03} lines={['song : adonai', 'by : rua young']} x={150} y={560}/>};
  }
  // S13 18.03–end — 3D-angled screen close-up
  return {persp: true, cam: {x: key(t, [[18.03, 260], [20, 220, lin]]), y: 0, s: key(t, [[18.03, .84], [18.25, .88, settle], [20, .92, lin]]), r: -4, rx: 4, ry: -15},
    world: <><div style={{position: 'absolute', inset: 0, background: '#04090b'}}/><div style={{position: 'absolute', left: 260, top: 40, width: 1400, height: 736}}><News/></div></>,
    fg: <><Credit t={t} t0={18.08} t1={20} lines={['produced by knight', 'for kick.com/firas']} x={110} y={440}/>
      <div style={{position: 'absolute', left: 620, top: 34, fontFamily: SANS, fontStyle: 'italic', fontSize: 20, color: '#d8eef2', opacity: .45 * clamp((t - 18.1) / .3)}}>apologies for the interruption, we have breaking news</div></>};
}

/** World layer under the camera transform (optionally 3D). */
const World: React.FC<{cam: Cam; persp?: boolean; mb?: boolean; children: React.ReactNode}> = ({cam, persp, mb, children}) =>
  <div style={{position: 'absolute', inset: 0, ...(persp ? {perspective: 900} : {})}}>
    <div style={{position: 'absolute', inset: 0, transform: `${camT(cam)}${persp ? ` rotateX(${cam.rx ?? 0}deg) rotateY(${cam.ry ?? 0}deg)` : ''}`, transformOrigin: '50% 50%',
      filter: mb ? 'url(#mb)' : undefined}}>{children}</div>
  </div>;

// ---------- composition ----------
export const Wanted: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const sh = shot(t), prev = shot(Math.max(0, t - 1 / fps));
  const c = sh.cam, p = prev.cam;
  // motion blur from camera velocity (within one shot)
  const same = Math.abs(p.s - c.s) < .6 && Math.abs(p.r - c.r) < 30;
  const vx = same ? Math.abs(c.x - p.x) + Math.abs(c.r - p.r) * 14 + Math.abs(c.s - p.s) * 380 : 0;
  const vy = same ? Math.abs(c.y - p.y) + Math.abs(c.s - p.s) * 220 : 0;
  const bx = Math.min(32, vx * .3), by = Math.min(32, vy * .3);
  const mb = bx > .5 || by > .5;

  const cold = coldAt(t), fl = flashAt(t);
  const teal = t >= 15.5, navy = t >= 11.63 && t < 12.6;
  const black = t < .22 ? 1 - t / .22 : t > 12.45 && t < 12.7 ? (t - 12.45) / .25 : t >= 12.7 && t < 13.15 ? 1 - (t - 12.7) / .45 : t >= 15.47 && t < 15.9 ? 1 : t >= 15.9 && t < 17.6 ? 1 - io((t - 15.9) / 1.7) * .92 : 0;

  // grade: near-monochrome cream (warm) / cold blue / navy / teal
  const grade = teal
    ? 'grayscale(1) sepia(.6) hue-rotate(150deg) saturate(1.5) brightness(.8) contrast(1.15)'
    : navy ? 'grayscale(1) sepia(.5) hue-rotate(185deg) saturate(1.3) brightness(.9) contrast(1.05)'
      : `grayscale(${.72 - cold * .62}) sepia(${.55 * (1 - cold)}) saturate(${1 + cold * 1.1}) brightness(${1.02 + fl * 1.3}) contrast(${1.04 + cold * .12 - fl * .3})`;
  const layer = (blur: boolean) => <><div style={{position: 'absolute', inset: 0, filter: sh.wb}}><World cam={c} persp={sh.persp} mb={!blur && mb}>{sh.world}</World></div>{sh.fg}</>;

  return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <svg width={0} height={0} style={{position: 'absolute'}}><defs>
      <filter id="mb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${bx} ${by}`}/></filter>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={frame % 23}/><feColorMatrix type="saturate" values="0"/></filter>
    </defs></svg>
    <div style={{position: 'absolute', inset: 0, filter: grade}}>
      {layer(false)}
      <div style={{position: 'absolute', inset: 0, filter: 'blur(26px) brightness(1.25)', mixBlendMode: 'screen', opacity: teal || navy ? .25 : t > 2.19 && t < 3.3 ? .25 : .42}}>{layer(true)}</div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 50% 45%, rgba(235,226,208,.38), rgba(235,226,208,.08) 70%, transparent)', mixBlendMode: 'screen', opacity: teal || navy ? .25 : t > 2.19 && t < 3.3 ? .3 : 1}}/>
      <Img src={A('grunge.jpg')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'overlay', opacity: .35}}/>
    </div>
    {fl > 0 && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 48%, rgba(250,244,230,${fl}), rgba(240,230,210,${fl * .7}) 60%, rgba(120,110,95,${fl * .4}))`}}/>}
    {t > 10.6 && t < 10.8 && <div style={{position: 'absolute', inset: 0, boxShadow: `inset 30px 0 40px rgba(0,255,255,${fl * .6}), inset -30px 0 40px rgba(255,60,60,${fl * .5})`}}/>}
    <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${A('rain_v2.png')})`, backgroundSize: '1280px 544px', filter: 'blur(.4px)', opacity: teal || navy ? .55 : .75}}/>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 72% 78% at 50% 50%, transparent 36%, rgba(6,6,5,.68) 70%, rgba(4,4,3,.98) 100%)'}}/>
    <div style={{position: 'absolute', inset: 0, filter: 'url(#grain)', opacity: .07, mixBlendMode: 'overlay'}}/>
    <div style={{position: 'absolute', inset: 0, background: cold > .5 ? '#cfd3d6' : '#d6cebf', mixBlendMode: 'multiply', opacity: fl > .8 ? .4 : 1}}/>
    {black > 0 && <div style={{position: 'absolute', inset: 0, background: '#000', opacity: clamp(black)}}/>}
    <Subs t={t}/>
    <Audio src={A('mix.wav')}/>
  </AbsoluteFill>;
};
