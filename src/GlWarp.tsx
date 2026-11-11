// Uber transition shader: lens warp (barrel/pincushion) + mirror edges + radial zoom blur
// + directional (whip) blur + shake + exposure/lift, mixing two JPEG frames A/B.
// Render in CI with `--gl=swangle` (GitHub runners have no GPU).
import React, {useEffect, useRef} from 'react';
import {continueRender, delayRender} from 'remotion';

export type WarpParams = {
  mix: number;        // 0 = A, 1 = B (hard cut at apex => step)
  warp: number;       // lens k: <0 pincushion (edges pulled in), >0 barrel
  scale: number;      // 1 = fit; >1 zoom in
  zoomBlur: number;   // radial blur strength 0..0.4
  dir: [number, number]; // whip blur vector in uv units (e.g. [0.12,0])
  shake: [number, number]; // uv offset
  rot: number;        // radians
  expo: number;       // +1 = white flash, -1 = black
  center?: [number, number]; // zoom/warp centre (subject lock), uv
  ca?: number;        // radial chromatic dispersion 0..0.06 (S_WarpChroma-like)
};

const FRAG = `precision highp float;
uniform sampler2D A; uniform sampler2D B; uniform vec2 res; uniform vec2 sizeA; uniform vec2 sizeB; uniform vec4 geo; uniform float useGeo;
uniform float mixv, warp, scale, zb, rot, expo, ca; uniform vec2 dir, shake, ctr;
varying vec2 vUv;
vec2 mirror(vec2 u){ return 1.0 - abs(mod(u, 2.0) - 1.0); }
vec2 cover(vec2 uv, vec2 img){ // object-fit: cover, output aspect res
  float ra = res.x/res.y, ri = img.x/img.y;
  vec2 s = ra > ri ? vec2(1.0, ri/ra) : vec2(ra/ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
vec2 xform(vec2 uv){
  vec2 p = uv - ctr; p.x *= res.x/res.y;
  float r2 = dot(p,p); p *= 1.0 + warp * r2;           // lens
  float c = cos(rot), s = sin(rot); p = mat2(c,-s,s,c) * p;
  p /= scale; p.x /= res.x/res.y;
  return p + ctr + shake;
}
vec2 fit(vec2 u, vec2 img){ return useGeo > 0.5 ? (u - geo.xy) / geo.zw : cover(u, img); }
vec4 tapA(vec2 u){ return texture2D(A, mirror(fit(u, sizeA))); }
vec4 tapB(vec2 u){ return texture2D(B, mirror(fit(u, sizeB))); }
void main(){
  vec2 uv = xform(vec2(vUv.x, 1.0 - vUv.y));
  vec4 acc = vec4(0.0); float tot = 0.0;
  for (int i = 0; i < 24; i++) {
    float t = float(i) / 23.0; float w = 1.0 - 0.6*t;
    vec2 u = uv + dir * (t - 0.5);                      // whip
    u = ctr + (u - ctr) * (1.0 - zb * t);               // radial zoom
    vec2 d = (u - ctr) * ca;
    vec4 cs = vec4(mix(tapA(u+d), tapB(u+d), mixv).r, mix(tapA(u), tapB(u), mixv).g, mix(tapA(u-d), tapB(u-d), mixv).b, 1.0);
    acc += cs * w; tot += w;
  }
  vec4 col = acc / tot;
  col.rgb = expo >= 0.0 ? col.rgb * (1.0 + 2.0 * expo) : col.rgb * (1.0 + expo); // exposure, never lifts blacks
  gl_FragColor = vec4(col.rgb, 1.0);
}`;
const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.0,1.0); }`;

const loadImg = (src: string) => new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = bad; i.src = src; });

/** geo = image rect in normalized screen units [left, top, w, h] (from cropGeometry); omit for object-fit cover. */
export const GlWarp: React.FC<{a: string; b: string; p: WarpParams; width?: number; height?: number; geo?: [number, number, number, number]}> = ({a, b, p, width = 1080, height = 1920, geo}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<{gl: WebGLRenderingContext; prog: WebGLProgram; ta: WebGLTexture; tb: WebGLTexture} | null>(null);
  useEffect(() => {
    let alive = true; const handle = delayRender('glwarp');
    (async () => {
      const cv = ref.current!;
      if (!glRef.current) {
        const gl = cv.getContext('webgl', {preserveDrawingBuffer: true})!;
        const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader'); return s; };
        const prog = gl.createProgram()!; gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const tex = () => { const t = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, t); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); return t; };
        glRef.current = {gl, prog, ta: tex(), tb: tex()};
      }
      const {gl, prog, ta, tb} = glRef.current;
      const [ia, ib] = await Promise.all([loadImg(a), loadImg(b)]);
      if (!alive) { continueRender(handle); return; }
      const up = (unit: number, t: WebGLTexture, img: HTMLImageElement) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); };
      up(0, ta, ia); up(1, tb, ib);
      const U = (n: string) => gl.getUniformLocation(prog, n);
      gl.uniform1i(U('A'), 0); gl.uniform1i(U('B'), 1);
      gl.uniform2f(U('res'), width, height); gl.uniform2f(U('sizeA'), ia.width, ia.height); gl.uniform2f(U('sizeB'), ib.width, ib.height);
      gl.uniform1f(U('mixv'), p.mix); gl.uniform1f(U('warp'), p.warp); gl.uniform1f(U('scale'), p.scale); gl.uniform1f(U('zb'), p.zoomBlur);
      gl.uniform1f(U('rot'), p.rot); gl.uniform1f(U('expo'), p.expo); gl.uniform1f(U('useGeo'), geo ? 1 : 0); gl.uniform4f(U('geo'), ...(geo ?? [0, 0, 1, 1])); gl.uniform1f(U('ca'), p.ca ?? 0);
      gl.uniform2f(U('dir'), p.dir[0], p.dir[1]); gl.uniform2f(U('shake'), p.shake[0], p.shake[1]);
      const c = p.center ?? [0.5, 0.5]; gl.uniform2f(U('ctr'), c[0], c[1]);
      gl.viewport(0, 0, width, height); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      continueRender(handle);
    })().catch((e) => { console.error(e); continueRender(handle); });
    return () => { alive = false; };
  }, [a, b, p.mix, p.warp, p.scale, p.zoomBlur, p.rot, p.expo, p.dir[0], p.dir[1], p.shake[0], p.shake[1], p.center?.[0], p.center?.[1], p.ca, width, height, geo?.join(',')]);
  return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}/>;
};

// --- Tutorial transition curve (Alight Motion recipe, decoded by Argon) ---
const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  let t = x; for (let i = 0; i < 6; i++) { const cx = 3*x1*t*(1-t)**2 + 3*x2*t*t*(1-t) + t**3 - x; const d = 3*x1*(1-t)**2 + 6*(x2-x1)*t*(1-t) + 3*(1-x2)*t*t; if (Math.abs(d) < 1e-6) break; t -= cx/d; t = Math.min(1, Math.max(0, t)); }
  return 3*y1*t*(1-t)**2 + 3*y2*t*t*(1-t) + t**3;
};
export const easeIn = bez(0.65, 0, 0.95, 0.2);
export const easeOut = bez(0.05, 0.85, 0.3, 1);

/** u in [-1,1]: -1..0 = last ~12 frames of A, 0..1 = first ~24 frames of B. Cut at 0. */
export const warpCut = (u: number, kind: 'pinch' | 'whip' | 'zoom', dir: [number, number] = [1, 0], shakeSeed = 0): WarpParams => {
  const a = u < 0 ? easeIn(1 + u) : 0;           // 0→1 approaching cut
  const b = u >= 0 ? 1 - easeOut(Math.min(1, u)) : 0; // 1→0 after cut
  const k = Math.max(a, b);
  const decay = u >= 0 ? Math.max(0, 1 - u) : 0;
  const shakeAmp = 0.035 * decay * decay; // ~200px@6Hz-ish on 1080 width, decaying
  const ph = (u * 24 / 60) * 6 * Math.PI * 2 + shakeSeed;
  const base: WarpParams = {mix: u < 0 ? 0 : 1, warp: 0, scale: 1, zoomBlur: 0, dir: [0, 0], shake: [Math.sin(ph) * shakeAmp, Math.cos(ph * 1.3) * shakeAmp * 0.6], rot: 0, expo: 0, ca: 0.045 * k};
  if (kind === 'pinch') return {...base, warp: u < 0 ? -1.47 * a : -3.08 * b * 0.6, scale: u < 0 ? 1 - 0.094 * a : 1 + 0.092 * b, zoomBlur: 0.18 * k, expo: -0.35 * k};
  if (kind === 'zoom') return {...base, scale: u < 0 ? 1 + 0.6 * a : 1 + 0.5 * b, zoomBlur: 0.32 * k, expo: 0.25 * k * k};
  return {...base, dir: [dir[0] * 0.22 * k, dir[1] * 0.22 * k], shake: [base.shake[0] + dir[0] * (u < 0 ? -0.25 * a : 0.25 * b), base.shake[1] + dir[1] * (u < 0 ? -0.25 * a : 0.25 * b)], warp: 0.25 * k};
};
