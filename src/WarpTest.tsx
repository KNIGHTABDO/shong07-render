import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {GlWarp, warpCut} from './GlWarp';
const KINDS = ['pinch', 'whip', 'zoom'] as const;
export const WarpTest: React.FC<{u?: number; kind?: 'pinch' | 'whip' | 'zoom'}> = ({u, kind}) => {
  const f = useCurrentFrame();
  const seg = Math.min(2, Math.floor(f / 48)), local = f % 48;
  const k = kind ?? KINDS[seg];
  const uu = u ?? (local < 24 ? -1 + local / 24 : (local - 24) / 24);
  const swap = seg % 2 === 1;
  return <AbsoluteFill style={{background: 'black'}}>
    <GlWarp a={staticFile(swap ? 'warptest/b.jpg' : 'warptest/a.jpg')} b={staticFile(swap ? 'warptest/a.jpg' : 'warptest/b.jpg')} p={warpCut(uu, k, [1, 0], 0.7)} width={540} height={960}/>
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', color: 'white', font: '700 28px sans-serif'}}>{k.toUpperCase()}</div>
  </AbsoluteFill>;
};
