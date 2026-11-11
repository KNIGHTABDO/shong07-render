import type {Crop, Keys, PreparedShot, Shot} from './types.ts';
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const smoothstep = (t: number) => {const u = clamp(t); return u * u * (3 - 2 * u);};
export const subpixel = (n: number) => Math.round(n * 64) / 64;
export const precise = (n: number) => Math.round(n * 1e6) / 1e6;
export const frames = (seconds: number, fps = 60) => Math.round(seconds * fps);
export function keyValue(keys: Keys<number> | undefined, time: number, fallback: number): number {
  if (!keys?.length) return fallback;
  if (time <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (time <= keys[i][0]) return mix(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
  }
  return keys[keys.length - 1][1];
}
// C1 interpolation, monotone within every interval, with zero endpoint slopes.
export function smoothValue(keys: Keys<number> | undefined, time: number, fallback: number): number {
  if (!keys?.length) return fallback;
  if (time <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t, b] = keys[i], [aTime, a] = keys[i - 1];
    if (time <= t) return clamp(mix(a, b, smoothstep((time - aTime) / (t - aTime))), Math.min(a,b), Math.max(a,b));
  }
  return keys[keys.length - 1][1];
}
// Exact antiderivative of smoothstep: u^3 - u^4/2. No integration drift.
export function speedIntegral(keys: Keys<number> | undefined, u: number): number {
  const points = keys?.length ? keys : [[0, 1], [1, 1]] as Keys<number>;
  const end = clamp(u);
  let area = Math.min(end, points[0][0]) * points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t0, a] = points[i - 1], [t1, b] = points[i];
    if (end <= t0) break;
    const span = t1 - t0, p = clamp((end - t0) / span);
    area += span * (a * p + (b - a) * (p ** 3 - .5 * p ** 4));
  }
  const [last, value] = points[points.length - 1];
  if (end > last) area += (end - last) * value;
  return area;
}
export function sourceTime(shot: Shot, time: number): number {
  if (shot.freezeAt != null) return clamp(shot.freezeAt, shot.t0, shot.t1);
  const u = clamp(time / shot.dur);
  const delta = speedIntegral(shot.speed, u) * (shot.fitSpeed === false ? shot.dur : (shot.t1 - shot.t0) / speedIntegral(shot.speed, 1));
  return clamp(shot.reverse ? shot.t1 - delta : shot.t0 + delta, shot.t0, shot.t1);
}
export function velocity(shot: Shot, time: number): number {
  if (shot.freezeAt != null) return 0;
  return smoothValue(shot.speed, clamp(time / shot.dur), 1) * (shot.fitSpeed === false ? 1 : (shot.t1 - shot.t0) / (shot.dur * speedIntegral(shot.speed, 1)));
}
export function shutterTimes(shot: Shot, time: number): number[] {
  const blur = shot.mblur ?? 0, speed = Math.abs(velocity(shot, time));
  const count = speed > 1.2 && blur > 0 ? Math.min(6, Math.max(2, 1 + Math.ceil(speed * blur))) : 1;
  return Array.from({length: count}, (_, i) => time + (count === 1 ? 0 : (i / (count - 1) - .5) * blur / 60));
}
export const frameIndex = (shot: Shot, time: number, meta: PreparedShot) => clamp(Math.round((sourceTime(shot, time) - meta.start) * meta.fps), 0, meta.count - 1) + 1;
export function cropAt(crop: Crop | Keys<Crop>, u: number): Crop {
  if (!Array.isArray(crop)) return crop;
  return {cx: smoothValue(crop.map(([t, c]) => [t, c.cx]), u, .5), cy: smoothValue(crop.map(([t, c]) => [t, c.cy]), u, .5), zoom: smoothValue(crop.map(([t, c]) => [t, c.zoom]), u, 1)};
}
export function cropGeometry(crop: Crop, sw: number, sh: number, width: number, height: number) {
  const scale = Math.max(width / sw, height / sh) * crop.zoom;
  const w = sw * scale, h = sh * scale;
  return {width: w, height: h, left: clamp(width / 2 - crop.cx * w, width - w, 0), top: clamp(height / 2 - crop.cy * h, height - h, 0)};
}
// Stable, independent of render order, threads, and JavaScript random state.
export function noise(seed: string, frame: number): number {
  let h = 2166136261;
  for (const c of `${seed}:${frame}`) {h ^= c.charCodeAt(0); h = Math.imul(h, 16777619);}
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13;
  return (h >>> 0) / 4294967295 * 2 - 1;
}
