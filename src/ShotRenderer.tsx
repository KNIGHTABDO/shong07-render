import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {clamp, cropAt, cropGeometry, easeOut, frameIndex, precise, shutterTimes, smoothValue, subpixel} from './math';
import {gradeFilter} from './Grades';
import {rotationCover} from './fxTiming';
import type {PreparedShot, Shot} from './types';
import {GlWarp, warpCut, type WarpParams} from './GlWarp';
const geom = (g: ReturnType<typeof cropGeometry>) => Object.fromEntries(Object.entries(g).map(([k, v]) => [k, subpixel(v)]));
export const ShotRenderer: React.FC<{shot: Shot; meta: PreparedShot; time: number; bg?: 'blur' | 'black'}> = ({shot, meta, time, bg = 'blur'}) => {
  const {width: W, height: H} = useVideoConfig();
  const height = shot.layout === 'window' ? Math.min(H, Math.round(W * 1.25)) : H;
  const u = clamp(time / shot.dur);
  const crop = cropAt(shot.crop, u);
  const samples = shutterTimes(shot, time);
  // Stills (single prepared frames used for cutouts) are always 16:9 sources.
  const sw = shot.still ? 1920 : meta.width, sh = shot.still ? 1080 : meta.height;
  let glp: WarpParams | null = null;
  const gi = shot.gl?.in, go = shot.gl?.out;
  if (gi && time < gi.len) glp = {...warpCut(time / gi.len, gi.kind, gi.dir ?? [1, 0], shot.id.length), center: gi.center};
  else if (go && time > shot.dur - go.len) glp = {...warpCut(-(shot.dur - time) / go.len, go.kind, go.dir ?? [1, 0], shot.id.length), center: go.center};
  const picture = (targetHeight: number) => {
    const geometry = geom(cropGeometry(crop, sw, sh, W, targetHeight));
    if (glp && !shot.still) {
      const g = cropGeometry(crop, sw, sh, W, targetHeight);
      const src = staticFile(`${meta.path}/${String(frameIndex(shot, samples[0], meta)).padStart(5, '0')}.jpg`);
      return <GlWarp a={src} b={src} p={glp} width={W} height={targetHeight} geo={[g.left / W, g.top / targetHeight, g.width / W, g.height / targetHeight]}/>;
    }
    if (shot.still) return <Img src={staticFile(shot.still)} style={{position: 'absolute', ...geometry, maxWidth: 'none'}}/>;
    return samples.map((sample, i) => <Img key={i} src={staticFile(`${meta.path}/${String(frameIndex(shot, sample, meta)).padStart(5, '0')}.jpg`)} style={{position: 'absolute', ...geometry, maxWidth: 'none', opacity: 1 / (i + 1)}}/>);
  };
  const rot = smoothValue(shot.rot, u, 0);
  const exposure = smoothValue(shot.exposure, u, 1);
  const bloom = shot.bloom ?? 0;
  const cut = shot.cutout;
  let title: React.ReactNode = null;
  if (cut) {
    const t = time - (cut.at ?? 0), p = easeOut(t / .12), c = cut.color ?? '#bfe8ff';
    title = t < 0 ? null : <div style={{position: 'absolute', left: 0, width: W, top: cut.y ?? H * .42, transform: `translateY(-50%) scale(${precise(1 + 1.4 * (1 - p))})`, opacity: clamp(t / .05), textAlign: 'center', fontFamily: 'Cairo', fontWeight: 900, fontSize: cut.size ?? 230, lineHeight: 1, letterSpacing: cut.spacing ?? 0, color: '#fff', textShadow: `0 0 14px ${c}, 0 0 48px ${c}cc, 0 0 110px ${c}88`, whiteSpace: 'nowrap'}} dir="rtl">{cut.text}</div>;
  }
  const inner = <>
    <div style={{position: 'absolute', inset: 0, filter: exposure === 1 ? undefined : `brightness(${precise(exposure)})`}}>
      {picture(height)}
      {title}
      {cut ? <Img src={staticFile(cut.png)} style={{position: 'absolute', ...geom(cropGeometry(crop, sw, sh, W, height)), maxWidth: 'none'}}/> : null}
    </div>
    {bloom > 0 ? <>
      <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: bloom, filter: 'url(#bloom-key) blur(22px)'}}>{picture(height)}</div>
      <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: bloom * .7, filter: 'url(#bloom-key) blur(80px)'}}>{picture(height)}</div>
    </> : null}
  </>;
  // flip: mirror the picture horizontally (new camera side without new footage)
  const framed = shot.flip ? <div style={{position: 'absolute', inset: 0, transform: 'scaleX(-1)'}}>{inner}</div> : inner;
  return <>
    {shot.layout === 'window' && bg === 'blur' ? <div style={{position: 'absolute', inset: 0, overflow: 'hidden', transform: 'scale(1.1)', filter: `${gradeFilter(shot.grade) === 'none' ? '' : gradeFilter(shot.grade)} blur(40px) brightness(0.45) saturate(0.75)`}}>{picture(H)}</div> : null}
    <div style={{position: 'absolute', left: 0, top: (H - height) / 2, width: W, height, overflow: 'hidden', filter: gradeFilter(shot.grade), boxShadow: shot.layout === 'window' ? '0 0 30px 10px #0009' : undefined, borderRadius: shot.layout === 'window' ? 28 : 0}}>
      {rot ? <div style={{position: 'absolute', inset: 0, transform: `rotate(${precise(rot)}deg) scale(${precise(rotationCover(Math.abs(rot)))})`}}>{framed}</div> : framed}
    </div>
  </>;
};
