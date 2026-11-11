import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, noise, subpixel} from './math';
export const TownStamp: React.FC<{time: number; dur: number; word?: string; color?: string; accent?: string; topline?: string; subline?: string}> = ({time, dur, word = 'TOWN', color = '#f2eddf', accent = '#f2eddf', topline, subline}) => {
  const impact = clamp((time - .15) / .1), line = easeOut((time - .4) / .65);
  const kick = time >= .15 && time < .35 ? Math.pow(1 - (time - .15) / .2, 2) : 0;
  const hold = 1 + .025 * clamp((time - .25) / Math.max(.1, dur - .25));
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', color}}>
    <AbsoluteFill style={{backgroundColor: '#000', opacity: clamp(time / .15)}}/>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translate3d(${subpixel(noise('town-x', Math.round(time * 60)) * kick * 5)}px, ${subpixel(noise('town-y', Math.round(time * 60)) * kick * 9)}px, 0) scale(${hold})`}}>
      {topline ? <div style={{position: 'absolute', top: 745, fontFamily: 'Anton', fontSize: 28, letterSpacing: 6, opacity: line}}>{topline}</div> : null}
      <div style={{opacity: impact, transform: `scale(${1 + (1 - easeOut(impact)) * 1.1})`, fontFamily: 'Anton', fontSize: 235, letterSpacing: 12, lineHeight: 1, textShadow: '0 0 16px #ffffff50, 0 0 45px #ffffff18'}}>{word}</div>
      <div style={{position: 'absolute', top: 1120, width: 625 * line, height: 2, backgroundColor: accent, boxShadow: '0 0 10px #fff3'}}/>
      {subline ? <div style={{position: 'absolute', top: 1170, fontFamily: 'Anton', fontSize: 26, letterSpacing: 6, opacity: line * .7}}>{subline}</div> : null}
    </AbsoluteFill>
    <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .025, pointerEvents: 'none'}}><filter id="town-grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="22"/></filter><rect width="100%" height="100%" filter="url(#town-grain)"/></svg>
  </AbsoluteFill>;
};
