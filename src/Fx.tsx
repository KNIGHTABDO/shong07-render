import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Blackout, Flare, Paparazzi, ShutterBar, Spot, Smoke, Streaks} from './Light';
import {clamp, easeOut, noise, precise, subpixel} from './math';
import {activeFx, holdProgress, rotationCover, spinAngle, transitionState} from './fxTiming';
import {Hud} from './Hud';
import {TextLayer} from './Text';
import {Embers, Grain, impactFilter, KickBar, slamOffset, Subtitle, Vignette, Waveform} from './Craft';
import type {Fx} from './types';
export {activeFx} from './fxTiming';
export const SceneFx: React.FC<{effects: Fx[]; frame: number; fps?: number; children: React.ReactNode}> = ({effects, frame, fps = 60, children}) => {
  const {width: W, height: H} = useVideoConfig();
  let x = 0, y = 0, scale = 1, split = 0, whipX = 0, whipY = 0, blur = 0, rotation = 0, radial = 0, angular = 0;
  const zooms: {amount: number; center: [number, number]}[] = [];
  let impact: string | undefined;
  effects.forEach((fx, i) => {
    const t = activeFx(fx, frame, fps); if (t === null) return;
    const p = clamp(t / fx.dur);
    if (fx.type === 'shake') {
      const a = (fx.amp ?? 24) * Math.pow(1 - p, 2), seed = fx.seed ?? String(i);
      if (fx.axis !== 'y') x += noise(`${seed}-x`, Math.round(frame * 60 / fps)) * a;
      if (fx.axis !== 'x') y += noise(`${seed}-y`, Math.round(frame * 60 / fps)) * a;
    }
    if (fx.type === 'slam') {const o = slamOffset(fx, t); y += o.y; rotation += o.rot;}
    if (fx.type === 'impact') impact = impactFilter(t, fx.dur);
    if (fx.type === 'zoomPunch') scale *= 1 + (fx.amount ?? .12) * (1 - easeOut(p));
    if (fx.type === 'rgbSplit') split += (fx.amount ?? 12) * Math.sin(Math.PI * p);
    if (fx.type === 'zoomThrough') {
      const {peak} = transitionState(fx, frame, fps);
      zooms.push({amount: (fx.amount ?? .35) * peak, center: fx.center ?? [W / 2, H / 2]});
      radial += .075 * peak;
    }
    if (fx.type === 'spin') {
      if (fx.hold) rotation += spinAngle(fx) * holdProgress(t, fx.dur);
      else {
        const {peak, incoming} = transitionState(fx, frame, fps);
        rotation += spinAngle(fx) * .5 * peak * (incoming ? -1 : 1);
        angular += 4 * peak;
      }
    }
    if (fx.type === 'whip') {
      const {peak, incoming} = transitionState(fx, frame, fps), d = fx.dir ?? 'left';
      const sign = d === 'left' || d === 'up' ? -1 : 1;
      const offset = sign * peak * (incoming ? -1 : 1) * (fx.amount ?? 180);
      if (d === 'left' || d === 'right') {x += offset; whipX = 1;} else {y += offset; whipY = 1;}
      blur = Math.max(blur, 10 + 70 * peak); scale *= 1.1;
    }
  });
  scale *= rotationCover(Math.abs(rotation) + angular) + (Math.abs(rotation) + angular > 0 ? .015 : 0);
  // Keep slide/shake and all directional blur samples covered at the canvas edges.
  scale *= 1 + Math.max(2 * (Math.abs(x) + blur * Math.abs(whipX)) / W, 2 * (Math.abs(y) + blur * Math.abs(whipY)) / H);
  const scene = (sample = 0) => {
    let content = <AbsoluteFill style={{transform: `translate3d(${subpixel(x + sample * blur * whipX)}px, ${subpixel(y + sample * blur * whipY)}px, 0) rotate(${precise(rotation + sample * angular)}deg) scale(${precise(scale * (1 + Math.abs(sample) * radial))})`}}>{children}</AbsoluteFill>;
    zooms.forEach((z, i) => {content = <AbsoluteFill key={i} style={{transformOrigin: `${z.center[0]}px ${z.center[1]}px`, transform: `scale(${1 + z.amount})`}}>{content}</AbsoluteFill>;});
    return content;
  };
  return <AbsoluteFill style={{overflow: 'hidden', filter: impact}}>
    {scene()}
    {blur + radial + angular > 0 ? Array.from({length: 8}, (_, i) => <AbsoluteFill key={i} style={{opacity: .065}}>{scene((i - 3.5) / 3.5)}</AbsoluteFill>) : null}
    {split > 0 ? <><AbsoluteFill style={{transform: `translateX(${-subpixel(split)}px)`, mixBlendMode: 'screen', opacity: .4, filter: 'url(#channel-red)'}}>{scene()}</AbsoluteFill><AbsoluteFill style={{transform: `translateX(${subpixel(split)}px)`, mixBlendMode: 'screen', opacity: .4, filter: 'url(#channel-cyan)'}}>{scene()}</AbsoluteFill></> : null}
  </AbsoluteFill>;
};
export const FxOverlay: React.FC<{fx: Fx; time: number; frame?: number}> = ({fx, time, frame = 0}) => {
  const {width: W, height: H, fps} = useVideoConfig();
  const p = clamp(time / fx.dur);
  if (fx.type === 'streaks') return <Streaks fx={fx} time={time} W={W} H={H}/>;
  if (fx.type === 'paparazzi') return <Paparazzi fx={fx} time={time} W={W} H={H}/>;
  if (fx.type === 'flare') return <Flare fx={fx} time={time} W={W} H={H}/>;
  if (fx.type === 'shutterBar') return <ShutterBar fx={fx} time={time} frame={frame} fps={fps} H={H}/>;
  if (fx.type === 'blackout') return <Blackout fx={fx} time={time}/>;
  // Highlight-only flash: color-dodge keeps true blacks black (no milky lift).
  if (fx.type === 'flash') return <AbsoluteFill style={{backgroundColor: dodgeColor(fx.color, .62 * Math.pow(1 - p, 2)), mixBlendMode: 'color-dodge'}}/>;
  if (fx.type === 'lightLeak') {
    const envelope = p < .25 ? easeOut(p / .25) : Math.pow(1 - (p - .25) / .75, 2);
    return <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: .65 * envelope, background: `radial-gradient(ellipse 45% 70% at ${subpixel(-25 + p * 150)}% 45%, ${fx.color} 0%, transparent 75%)`, filter: 'blur(55px)'}}/>;
  }
  if (fx.type === 'strobe') return Math.floor(time * (fx.rateHz ?? 15) * 10000) % 10000 < 10000 * (fx.duty ?? .25) ? <AbsoluteFill style={{backgroundColor: fx.color ?? '#fff'}}/> : null;
  if (fx.type === 'letterbox') return <><div style={{position: 'absolute', top: 0, width: '100%', height: fx.height ?? 180, background: '#000'}}/><div style={{position: 'absolute', bottom: 0, width: '100%', height: fx.height ?? 180, background: '#000'}}/></>;
  if (fx.type === 'text') return <TextLayer fx={fx} time={time}/>;
  if (fx.type === 'sub') return <Subtitle fx={fx} time={time}/>;
  if (fx.type === 'kick') return <KickBar fx={fx} time={time}/>;
  if (fx.type === 'wave') return <Waveform fx={fx} time={time}/>;
  if (fx.type === 'embers') return <Embers fx={fx} time={time}/>;
  if (fx.type === 'vignette') return <Vignette amount={fx.amount}/>;
  if (fx.type === 'spot') return <Spot fx={fx} time={time}/>;
  if (fx.type === 'smoke') return <Smoke fx={fx} time={time} W={W} H={H}/>;
  if (fx.type === 'grain') return <Grain amount={fx.amount} frame={frame}/>;
  if (fx.type === 'hud') return <Hud mode={fx.mode} data={fx.data} time={time} dur={fx.dur}/>;
  return null;
};

/** Exposure-style flash colour for color-dodge: channel/(1-k*c) brightens highlights, keeps #000 black. */
export function dodgeColor(color: string | undefined, k: number): string {
  const m = (color ?? '#ffffff').match(/rgba?\(([^)]+)\)/);
  let [r, g, b, a] = [255, 255, 255, 1];
  if (m) { const v = m[1].split(',').map(x => parseFloat(x)); [r, g, b] = v; a = v[3] ?? 1; }
  else if (/^#[0-9a-f]{6}/i.test(color ?? '')) { const h = color!.slice(1); [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  const f = Math.min(.9, k * Math.min(1, a * 1.6));
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}
