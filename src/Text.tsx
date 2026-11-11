import React from 'react';
import {clamp, easeOut, precise, subpixel} from './math';
import type {Fx} from './types';
export const TextLayer: React.FC<{fx: Extract<Fx, {type: 'text'}>; time: number}> = ({fx, time}) => {
  const arabic = fx.style === 'arabicGlow', color = fx.color ?? '#fff9ee';
  const fontFamily = fx.font ?? (arabic ? 'Cairo' : fx.style === 'stencil' ? 'Black Ops One' : 'Share Tech Mono');
  const progress = easeOut(time / (fx.anim === 'slam' ? .12 : .22));
  const scale = fx.anim === 'slam' ? 1 + (1 - progress) * 1.8 : fx.anim === 'pop' ? .65 + progress * .35 : 1;
  if (fx.style === 'title') {
    // Condensed tracked title (reference): tracking 0.16em -> 0.12em, 85% opacity, soft glow.
    const k = easeOut(time / .6), out = clamp((fx.dur - time) / .25);
    return <div style={{position: 'absolute', left: fx.pos?.[0] ?? 960, top: fx.pos?.[1] ?? 540, transform: `translate(-50%, -50%) scale(${precise(1.04 - .04 * k)})`, opacity: .85 * clamp(time / .12) * out,
      fontFamily: fx.font ?? 'Anton', fontSize: fx.size ?? 64, letterSpacing: `${precise(.16 - .04 * k)}em`, color, whiteSpace: 'nowrap', filter: `blur(${precise(4 * (1 - clamp(time / .18)))}px)`,
      textShadow: `0 0 18px ${fx.color ?? '#9fd8ff'}88, 0 2px 8px #000`}}>{fx.text}</div>;
  }
  const shadow = arabic ? `0 0 8px ${color}, 0 0 28px ${color}a0, 0 4px 6px #000` : '0 3px 12px #000';
  let offset = 0, wordIndex = 0;
  const content = (fx.text.match(/\S+|\s+/gu) ?? []).map((token, i) => {
    const start = offset; offset += [...token].length;
    if (/^\s+$/u.test(token)) return token;
    const index = wordIndex++;
    const revealed = fx.anim === 'type' ? [...token].slice(0, Math.max(0, Math.floor(time * 30) - start)).join('') : token;
    const p = arabic && fx.anim !== 'type' ? easeOut((time - index * .09) / .14) : 1;
    return <span key={i} style={{display: 'inline-block', position: 'relative', opacity: p, transform: `translate3d(0, ${subpixel((1 - p) * 22)}px, 0) scale(${precise(.8 + .2 * p)})`}}><span style={{visibility: 'hidden'}}>{token}</span><span style={{position: 'absolute', inset: 0, whiteSpace: 'nowrap'}}>{revealed}</span></span>;
  });
  return <div dir={arabic ? 'rtl' : 'ltr'} style={{position: 'absolute', left: fx.pos?.[0] ?? 540, top: fx.pos?.[1] ?? 1420, transform: `translate(-50%, -50%) scale(${precise(scale)})`, opacity: clamp(time / .07), fontFamily, fontSize: fx.size ?? (arabic ? 72 : 66), fontWeight: arabic ? 800 : 400, color, textShadow: shadow, textAlign: 'center', whiteSpace: 'pre-wrap', width: 940, lineHeight: 1.5}}>{content}</div>;
};
