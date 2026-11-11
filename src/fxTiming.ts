import {clamp, frames, smoothstep} from './math.ts';
import type {Fx} from './types.ts';
export const centered = (fx: Fx) => fx.type === 'whip' || fx.type === 'zoomThrough' || (fx.type === 'spin' && !fx.hold);
export function activeFx(fx: Fx, frame: number, fps = 60): number | null {
  const start = frames(fx.at, fps), length = Math.max(1, frames(fx.dur, fps));
  if (fx.type === 'spin' && fx.hold) return frame >= start ? (frame - start) / fps : null;
  const first = centered(fx) ? start - Math.floor(length / 2) : start;
  return frame >= first && frame < first + length ? (frame - first) / fps : null;
}
export function transitionState(fx: Fx, frame: number, fps = 60) {
  const dt = (frame - frames(fx.at, fps)) / fps;
  const peak = smoothstep(1 - Math.abs(dt) / (fx.dur / 2));
  return {dt, peak, incoming: dt >= 0};
}
export function rotationCover(degrees: number): number {
  const r = degrees * Math.PI / 180;
  return Math.max(Math.abs(Math.cos(r)) + 1920 / 1080 * Math.abs(Math.sin(r)), Math.abs(Math.cos(r)) + 1080 / 1920 * Math.abs(Math.sin(r)));
}
export const spinAngle = (fx: Extract<Fx, {type: 'spin'}>) => Math.abs(fx.deg) * (fx.dir === 'ccw' ? -1 : 1);
export const holdProgress = (time: number, dur: number) => smoothstep(clamp(time / dur));
