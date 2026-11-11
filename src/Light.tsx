// Light + living-frame layer (IMG_0109 reference study): matte states, light streaks,
// paparazzi flashes, anamorphic headlight flares, shutter bar, blackout.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, mix, noise, precise, smoothstep, subpixel} from './math';
import type {Fx, MatteKey} from './types';
type Of<T extends Fx['type']> = Extract<Fx, {type: T}>;
const rnd = (seed: string, i: number) => (noise(seed, i) + 1) / 2;

// cubic-bezier(.16,1,.3,1) (expo-out-ish) from Argon's frame breakdown
const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  let t = x; for (let i = 0; i < 8; i++) { const cx = 3*x1*t*(1-t)**2 + 3*x2*t*t*(1-t) + t**3 - x; const d = 3*x1*(1-t)**2 + 6*(x2-x1)*t*(1-t) + 3*(1-x2)*t*t; if (Math.abs(d) < 1e-6) break; t = clamp(t - cx/d); }
  return 3*y1*t*(1-t)**2 + 3*y2*t*t*(1-t) + t**3;
};
const outE = bez(.16, 1, .3, 1), inoutE = bez(.65, 0, .35, 1);
const backE = (t: number) => { const c = 1.7, u = clamp(t) - 1; return 1 + (c + 1) * u ** 3 + c * u ** 2; };

export type MatteState = {top: number; bottom: number; left: number; right: number; radius: number; border?: string; rebate?: string; shrink: number; pop: number};
const ZERO: MatteState = {top: 0, bottom: 0, left: 0, right: 0, radius: 0, shrink: 0, pop: 0};
const full = (k: MatteKey, prev: MatteState): MatteState => ({top: k.top ?? 0, bottom: k.bottom ?? 0, left: k.left ?? 0, right: k.right ?? 0, radius: k.radius ?? 0, border: k.border, rebate: k.rebate, shrink: k.shrink ?? 0, pop: k.pop ?? 0});
export function matteAt(keys: MatteKey[] | undefined, t: number): MatteState {
  if (!keys?.length) return ZERO;
  let prev = ZERO, cur: MatteState | null = null;
  for (const k of keys) {
    if (k.at > t) break;
    const target = full(k, prev), d = k.dur ?? 0, e = k.ease ?? 'out';
    const raw = d <= 0 || e === 'snap' ? 1 : clamp((t - k.at) / d);
    const p = e === 'inout' ? inoutE(raw) : e === 'back' ? backE(raw) : e === 'snap' ? 1 : outE(raw);
    const from: MatteState = cur ?? prev;
    cur = {top: mix(from.top, target.top, p), bottom: mix(from.bottom, target.bottom, p), left: mix(from.left, target.left, p), right: mix(from.right, target.right, p),
      radius: mix(from.radius, target.radius, p), shrink: mix(from.shrink, target.shrink, p), border: raw < .5 ? from.border : target.border, rebate: raw < .5 ? from.rebate : target.rebate,
      pop: target.pop * (1 - easeOut((t - k.at) / .14))};
    prev = cur;
  }
  return cur ?? ZERO;
}
/** Transform that fits the whole scene inside the card when shrink=1 (picture resizes instead of cropping). */
export function matteSceneTransform(m: MatteState, W: number, H: number): string | undefined {
  if (m.shrink <= 0 && m.pop <= 0) return undefined;
  const w = 1 - m.left - m.right, h = 1 - m.top - m.bottom;
  const s = mix(1, Math.max(w, h), m.shrink) * (1 - .06 * m.pop);
  const cx = (m.left + w / 2 - .5) * W * m.shrink, cy = (m.top + h / 2 - .5) * H * m.shrink;
  return `translate(${subpixel(cx)}px, ${subpixel(cy)}px) scale(${precise(s)})`;
}
export const Matte: React.FC<{m: MatteState; W: number; H: number}> = ({m, W, H}) => {
  if (m.top + m.bottom + m.left + m.right < 1e-4 && !m.border) return null;
  const s = 1 - .06 * m.pop;
  const w = (1 - m.left - m.right) * W, h = (1 - m.top - m.bottom) * H;
  const l = m.left * W + w * (1 - s) / 2, t = m.top * H + h * (1 - s) / 2;
  return <div style={{position: 'absolute', left: subpixel(l), top: subpixel(t), width: subpixel(w * s), height: subpixel(h * s), borderRadius: m.radius,
    boxShadow: `0 0 0 ${W * 2}px #000`, outline: m.border ? `3px solid ${m.border}` : undefined, pointerEvents: 'none'}}>
    {m.rebate && m.left + m.right > .1 ? <div style={{position: 'absolute', left: '100%', top: 0, height: '100%', width: W * .0125, marginLeft: W * .004,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', fontFamily: 'Share Tech Mono', fontSize: W * .0062,
      letterSpacing: W * .0012, color: '#d49a45', opacity: .75, writingMode: 'vertical-rl', whiteSpace: 'nowrap'}}>
      <span>{m.rebate}</span><span>{'\u25B8 53'}</span><span>{m.rebate}</span></div> : null}
  </div>;
};

/** Diagonal coloured light streaks sweeping across (screen); optional black under-plate (0..1). */
export const Streaks: React.FC<{fx: Of<'streaks'>; time: number; W: number; H: number}> = ({fx, time, W, H}) => {
  const p = clamp(time / fx.dur), seed = fx.seed ?? 'stk', colors = fx.colors ?? ['#8a5cff', '#3f8cff', '#ff4fd8', '#ffffff'];
  const env = Math.sin(Math.PI * p), black = (fx.black ?? 0) * smoothstep(Math.min(p / .2, (1 - p) / .2, 1));
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {black > 0 ? <AbsoluteFill style={{background: '#000', opacity: black}}/> : null}
    <AbsoluteFill style={{mixBlendMode: 'screen', transform: `rotate(${fx.angle ?? -24}deg) scale(1.6)`}}>
      {Array.from({length: fx.count ?? 22}, (_, i) => {
        const r = (k: string) => rnd(`${seed}${k}`, i);
        const y = r('y') * H, len = W * (.25 + .7 * r('l')), th = 2 + 10 * r('t') ** 2;
        const speed = 1.2 + 2.2 * r('s'), x = -len + (W * 1.6 + len) * clamp(p * speed - r('d') * .6);
        const c = colors[Math.floor(r('c') * colors.length) % colors.length];
        return <div key={i} style={{position: 'absolute', left: subpixel(x - W * .3), top: subpixel(y), width: subpixel(len), height: th, borderRadius: th,
          background: `linear-gradient(90deg, transparent, ${c} 70%, #fff)`, opacity: env * (.55 + .45 * r('o')), boxShadow: `0 0 ${th * 3}px ${th}px ${c}`}}/>;
      })}
    </AbsoluteFill>
  </AbsoluteFill>;
};

/** Paparazzi: point flares at random spots (2-3 frames each) + occasional additive full-frame pulses. */
export const Paparazzi: React.FC<{fx: Of<'paparazzi'>; time: number; W: number; H: number}> = ({fx, time, W, H}) => {
  const seed = fx.seed ?? 'pap', rate = fx.rate ?? 14, slot = Math.floor(time * rate), c = fx.color ?? '#fff';
  const flares: React.ReactNode[] = [];
  for (let k = slot - 2; k <= slot; k++) {
    if (k < 0 || rnd(`${seed}on`, k) < .35) continue;
    const age = time * rate - k, a = Math.pow(clamp(1 - age / 2.2), 2);
    const x = rnd(`${seed}x`, k) * W, y = (.15 + .7 * rnd(`${seed}y`, k)) * H, r = H * (.05 + .12 * rnd(`${seed}r`, k));
    flares.push(<div key={k} style={{position: 'absolute', left: subpixel(x - r * 4), top: subpixel(y - r * 4), width: r * 8, height: r * 8, opacity: a,
      background: `radial-gradient(circle, #fff 0%, ${c} 6%, ${c}55 22%, transparent 60%)`}}/>);
  }
  const pulse = rnd(`${seed}f`, slot) < (fx.full ?? 0) ? clamp(1 - (time * rate - slot) * 1.6) : 0;
  return <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
    {flares}
    {pulse > 0 ? <AbsoluteFill style={{background: `rgb(${Math.round(150 * pulse)},${Math.round(150 * pulse)},${Math.round(150 * pulse)})`, mixBlendMode: 'color-dodge'}}/> : null}
  </AbsoluteFill>;
};

/** Anamorphic headlight flare: hot core + long horizontal streak, pulsing (Hz) — Deep Glow strobe look. */
export const Flare: React.FC<{fx: Of<'flare'>; time: number; W: number; H: number}> = ({fx, time, W, H}) => {
  const c = fx.color ?? '#9fd8ff', [px, py] = fx.pos, x = px * W, y = py * H, w = (fx.width ?? .9) * W;
  const fade = Math.min(clamp(time / .08), clamp((fx.dur - time) / .15));
  const pulse = fx.pulse ? .55 + .45 * Math.pow(Math.max(0, Math.cos(time * fx.pulse * Math.PI * 2)), 6) : 1;
  const a = (fx.amount ?? 1) * fade * pulse;
  return <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity: a}}>
    <div style={{position: 'absolute', left: subpixel(x - w / 2), top: subpixel(y - H * .012), width: w, height: H * .024, borderRadius: '50%',
      background: `linear-gradient(90deg, transparent, ${c}66 25%, #fff 50%, ${c}66 75%, transparent)`, filter: 'blur(3px)'}}/>
    <div style={{position: 'absolute', left: subpixel(x - H * .22), top: subpixel(y - H * .22), width: H * .44, height: H * .44,
      background: `radial-gradient(circle, #fff 0%, ${c}cc 8%, ${c}33 30%, transparent 65%)`}}/>
  </AbsoluteFill>;
};

/** Horizontal black shutter bar toggled every N frames with white strobes on the "on" frames. */
export const ShutterBar: React.FC<{fx: Of<'shutterBar'>; time: number; frame: number; fps: number; H: number}> = ({fx, time, frame, fps, H}) => {
  const n = Math.max(1, Math.round((fx.every ?? 3) * fps / 60)), on = Math.floor(frame / n) % 2 === 0;
  const strobe = fx.strobe !== false && on ? [.9, .15, .85, 0][Math.floor(time * fps / n) % 4] : 0;
  const h = (fx.height ?? .16) * H, y = (fx.y ?? .5) * H;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {on ? <div style={{position: 'absolute', left: 0, right: 0, top: subpixel(y - h / 2), height: h, background: '#000'}}/> : null}
    {strobe > 0 ? <AbsoluteFill style={{background: `rgb(${Math.round(140 * strobe)},${Math.round(140 * strobe)},${Math.round(140 * strobe)})`, mixBlendMode: 'color-dodge'}}/> : null}
  </AbsoluteFill>;
};

/** Luma dip to pure black: fade in, hold, fade out (fade seconds). */
export const Blackout: React.FC<{fx: Of<'blackout'>; time: number}> = ({fx, time}) => {
  const f = fx.fade ?? .07, o = Math.min(clamp(time / f), clamp((fx.dur - time) / f));
  return <AbsoluteFill style={{background: '#000', opacity: o, pointerEvents: 'none'}}/>;
};

/** Subject light: oval colour-dodge lift on the car (+~0.6 stop, blacks stay black) and a soft darkening outside it. */
export const Spot: React.FC<{fx: Of<'spot'>; time: number}> = ({fx, time}) => {
  const fade = Math.min(clamp(time / .1), clamp((fx.dur - time) / .1));
  const [x, y] = fx.pos, rx = (fx.rx ?? .3) * 100, ry = (fx.ry ?? .26) * 100, g = Math.round(255 * (fx.boost ?? .35)), d = fx.dark ?? .45;
  const at = `at ${precise(x * 100)}% ${precise(y * 100)}%`;
  if (fx.shade) return <AbsoluteFill style={{pointerEvents: 'none', opacity: fade, background: `radial-gradient(ellipse ${precise(rx)}% ${precise(ry)}% ${at}, rgba(0,0,0,${fx.shade}) 0%, rgba(0,0,0,${precise(fx.shade * .55)}) 50%, transparent 100%)`}}/>;
  return <AbsoluteFill style={{pointerEvents: 'none', opacity: fade}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse ${precise(rx * 1.7)}% ${precise(ry * 1.9)}% ${at}, transparent 50%, rgba(0,0,0,${d}) 100%)`}}/>
    <AbsoluteFill style={{background: `radial-gradient(ellipse ${precise(rx)}% ${precise(ry)}% ${at}, rgb(${g},${g},${g}) 0%, rgb(${g >> 1},${g >> 1},${g >> 1}) 55%, #000 100%)`, mixBlendMode: 'color-dodge'}}/>
  </AbsoluteFill>;
};

/** Volumetric smoke plume (screen): soft drifting blobs inside a horizontal band [x0,x1]. */
export const Smoke: React.FC<{fx: Of<'smoke'>; time: number; W: number; H: number}> = ({fx, time, W, H}) => {
  const seed = fx.seed ?? 'smk', c = fx.color ?? '#cfe8ff', x0 = (fx.x0 ?? 0) * W, x1 = (fx.x1 ?? .42) * W;
  const fade = Math.min(clamp(time / .35), clamp((fx.dur - time) / .3));
  return <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity: (fx.amount ?? .6) * fade, filter: 'blur(24px)'}}>
    {Array.from({length: fx.count ?? 16}, (_, i) => {
      const r = (k: string) => rnd(`${seed}${k}`, i);
      const size = H * (.22 + .35 * r('s')), drift = (12 + 30 * r('v')) * time;
      const x = x0 + (x1 - x0) * r('x') + drift * (r('d') - .3) * 2, y = H * (.35 + .6 * r('y')) - drift * 1.4;
      return <div key={i} style={{position: 'absolute', left: subpixel(x - size / 2), top: subpixel(y - size / 2), width: size, height: size * .7, borderRadius: '50%',
        background: `radial-gradient(ellipse, ${c} 0%, ${c}55 35%, transparent 70%)`, opacity: .25 + .4 * r('o')}}/>;
    })}
  </AbsoluteFill>;
};
