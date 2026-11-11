// Speed-ramp helpers learned from tutorials (L1K1 / Creators Club / Alight Motion recipe).
// All return SOURCE seconds for a given timeline offset t (seconds into the shot).

const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  let t = x;
  for (let i = 0; i < 8; i++) {
    const cx = 3*x1*t*(1-t)**2 + 3*x2*t*t*(1-t) + t**3 - x;
    const d = 3*x1*(1-t)**2 + 6*(x2-x1)*t*(1-t) + 3*(1-x2)*t*t;
    if (Math.abs(d) < 1e-6) break; t = Math.min(1, Math.max(0, t - cx/d));
  }
  return 3*y1*t*(1-t)**2 + 3*y2*t*t*(1-t) + t**3;
};
/** L1K1 "secret sauce" flow curve. */
export const flow = bez(0.6, 0, 0.4, 1);

/** Integrate a speed function numerically -> source time. */
const integrate = (speed: (t: number) => number, t: number, steps = 240) => {
  let s = 0; const h = t / steps;
  for (let i = 0; i < steps; i++) s += speed((i + 0.5) * h) * h;
  return s;
};

/** U-shaped speed: enters fast (hi), smooth valley (lo) at `valley` (0..1 of dur), exits fast (out).
 *  Video 4 numbers: 2.5x -> 0.2-0.3x -> 2.5x with wide flat handles. Never 1.0x after the drop. */
export const uSpeed = (dur: number, {hi = 2.6, lo = 0.3, out = 2.6, valley = 0.45, flat = 0.35} = {}) => (t: number) => {
  const x = Math.min(1, Math.max(0, t / dur));
  const curve = (u: number) => {
    const half = flat / 2;
    if (Math.abs(u - valley) < half) return lo;
    if (u < valley) { const k = (u / Math.max(1e-6, valley - half)); return hi + (lo - hi) * flow(Math.min(1, k)); }
    const k = (u - valley - half) / Math.max(1e-6, 1 - valley - half); return lo + (out - lo) * flow(Math.min(1, k));
  };
  return integrate((tt) => curve(Math.min(1, tt / dur)), x * dur);
};

/** L1K1 boomerang: ping-pong between source tA and tB, one leg per beat, flow-eased. */
export const boomerang = (tA: number, tB: number, beat: number) => (t: number) => {
  const leg = Math.floor(t / beat), f = flow((t % beat) / beat);
  return leg % 2 === 0 ? tA + (tB - tA) * f : tB + (tA - tB) * f;
};

/** Bell-curve slide offset (px) across a cut at t=0; velocity peaks (≈peakPxS) exactly on the cut. */
export const bellSlide = (t: number, span = 0.25, peakPxS = 1200) => {
  // integral of a gaussian velocity with sigma = span/2.5 -> erf-shaped displacement
  const sigma = span / 2.5, x = t / (sigma * Math.SQRT2);
  const erf = (z: number) => { const s = Math.sign(z), a = Math.abs(z), k = 1 / (1 + 0.3275911 * a);
    return s * (1 - (((((1.061405429*k - 1.453152027)*k) + 1.421413741)*k - 0.284496736)*k + 0.254829592) * k * Math.exp(-a*a)); };
  return peakPxS * sigma * Math.sqrt(Math.PI / 2) * erf(x);
};
