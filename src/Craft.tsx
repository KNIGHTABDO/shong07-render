import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, keyValue, noise, precise, subpixel} from './math';
import type {Fx} from './types';
type Of<K extends Fx['type']> = Extract<Fx, {type: K}>;

// Damped vertical slam: -28/+14/-6 px, settled by frame 7 at 60 fps.
export const slamOffset = (fx: Of<'slam'>, t: number) => ({
  y: (fx.amp ?? 28) / 28 * keyValue([[0, -28], [2 / 60, 14], [4 / 60, -6], [7 / 60, 0]], t, 0),
  rot: (fx.rot ?? 2.5) * Math.pow(1 - clamp(t / fx.dur), 2),
});
// Impact frame: first half threshold silhouette (inverted), second half luma flash that keeps blacks.
export const impactFilter = (t: number, dur: number) => t < dur / 2 ? 'grayscale(1) contrast(16) brightness(1.15) invert(1)' : 'grayscale(1) brightness(1.9) contrast(1.7)';

export const Subtitle: React.FC<{fx: Of<'sub'>; time: number}> = ({fx, time}) => {
  const pop = easeOut(time / (4 / 60)), out = clamp((fx.dur - time) / (3 / 60));
  const glow = (c: string) => `0 0 8px ${c}f2, 0 0 32px ${c}a6, 0 3px 5px #000d`;
  const words = fx.text.split(/\s+/u).filter(Boolean);
  return <div dir="rtl" style={{position: 'absolute', left: 540, top: fx.y ?? 1100, width: 960, transform: `translate(-50%, -50%) scale(${precise(.82 + .18 * pop)})`, filter: `blur(${precise(8 * (1 - pop))}px)`, opacity: Math.min(clamp(time / (2 / 60)), out), fontFamily: 'Cairo', fontWeight: 800, fontSize: fx.size ?? 66, lineHeight: 1.45, textAlign: 'center', color: '#fff'}}>
    {words.map((w, i) => {
      const start = fx.words?.[i] ?? 0, p = easeOut((time - start) / (4 / 60));
      const red = fx.red?.includes(i), c = red ? '#ff2d2d' : fx.color;
      return <React.Fragment key={i}><span style={{display: 'inline-block', opacity: p, transform: `translate3d(0, ${subpixel((1 - p) * 18)}px, 0) scale(${precise(.85 + .15 * p)})`, color: red ? '#ffe9e9' : '#fff', textShadow: glow(c)}}>{w}</span>{i < words.length - 1 ? ' ' : ''}</React.Fragment>;
    })}
  </div>;
};

export const KickBar: React.FC<{fx: Of<'kick'>; time: number}> = ({fx, time}) => {
  const inP = easeOut(time / .25), outP = clamp((fx.dur - time) / .2);
  const dot = .55 + .45 * Math.abs(Math.sin(time * 4));
  return <div style={{position: 'absolute', left: 70, top: (fx.y ?? 300) - 30 * (1 - inP), width: 940, opacity: Math.min(inP, outP), display: 'flex', alignItems: 'center', gap: 22, padding: '18px 24px', borderRadius: 22, background: 'rgba(11,12,14,.86)', boxShadow: '0 10px 40px #000a, inset 0 0 0 2px #53fc1833', fontFamily: 'Cairo', color: '#fff'}}>
    <div style={{width: 92, height: 92, borderRadius: 46, background: 'linear-gradient(135deg,#1d1f22,#3a3d42)', boxShadow: '0 0 0 4px #53fc18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40, color: '#53fc18'}}>K</div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: 36, lineHeight: 1.1}}>{fx.channel}<span style={{fontSize: 22, color: '#0b0c0e', background: '#53fc18', borderRadius: 11, padding: '0 8px'}}>✓</span></div>
      <div dir="rtl" style={{fontSize: 30, fontWeight: 700, color: '#d8dbe0', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden'}}>{fx.title}</div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6}}>
      <div style={{background: '#e91916', borderRadius: 8, padding: '2px 14px', fontWeight: 900, fontSize: 26, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 8}}><span style={{width: 12, height: 12, borderRadius: 6, background: '#fff', opacity: dot}}/>LIVE</div>
      {fx.viewers ? <div style={{fontSize: 24, color: '#53fc18', fontWeight: 700}}>● {fx.viewers}</div> : null}
    </div>
  </div>;
};

export const Waveform: React.FC<{fx: Of<'wave'>; time: number}> = ({fx, time}) => {
  const n = 41, idx = Math.floor(time * fx.rate), c = fx.color ?? '#ff3040';
  const fade = Math.min(clamp(time / .15), clamp((fx.dur - time) / .15));
  return <div style={{position: 'absolute', left: 0, width: 1080, top: (fx.y ?? 1560) - 90, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: fade, filter: `drop-shadow(0 0 10px ${c}) drop-shadow(0 0 26px ${c}88)`}}>
    {Array.from({length: n}, (_, i) => {
      const d = Math.abs(i - (n - 1) / 2), v = fx.env[Math.max(0, idx - Math.round(d))] ?? 0;
      return <div key={i} style={{width: 10, borderRadius: 5, height: subpixel(8 + 150 * v * (1 - d / n * .6)), background: c}}/>;
    })}
  </div>;
};

export const Embers: React.FC<{fx: Of<'embers'>; time: number}> = ({fx, time}) => {
  const c = fx.color ?? '#ffb04a', seed = fx.seed ?? 'emb';
  const fade = Math.min(clamp(time / .3), clamp((fx.dur - time) / .3));
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: fade, pointerEvents: 'none'}}>
    {Array.from({length: fx.count ?? 36}, (_, i) => {
      const r = (k: string) => (noise(`${seed}${k}`, i) + 1) / 2;
      const speed = 180 + 420 * r('s'), size = 3 + 6 * r('z');
      const y = 2050 - ((time * speed + r('p') * 2100) % 2150);
      const x = r('x') * 1080 + Math.sin(time * (1 + 2 * r('w')) + i) * 40 * r('a');
      const flick = .5 + .5 * Math.abs(Math.sin(time * (6 + 9 * r('f')) + i));
      return <div key={i} style={{position: 'absolute', left: subpixel(x), top: subpixel(y), width: size, height: size, borderRadius: size, background: '#fff6e0', opacity: flick, boxShadow: `0 0 ${size * 2}px ${size}px ${c}`}}/>;
    })}
  </AbsoluteFill>;
};

export const Vignette: React.FC<{amount?: number}> = ({amount = .6}) => <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse 75% 62% at 50% 50%, transparent 52%, rgba(0,0,0,${amount}) 100%)`}}/>;

export const Grain: React.FC<{amount?: number; frame: number}> = ({amount = .06, frame}) => <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
  <filter id={`grain-${frame % 6}`}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={frame % 6}/></filter>
  <rect width="100%" height="100%" filter={`url(#grain-${frame % 6})`}/>
</svg>;
