import React from 'react';
import type {Grade} from './types';
export const gradeFilter = (grade: Grade = 'none') => ({
  none: 'none', cold: 'saturate(0.6) url(#grade-cold)', hero: 'contrast(1.17) saturate(1.18) url(#grade-hero)',
  night: 'brightness(0.76) contrast(1.22) saturate(0.68) url(#grade-night)', mono: 'grayscale(1) contrast(1.35)', redmono: 'url(#grade-redmono) contrast(1.15)',
  teal: 'saturate(0.65) contrast(1.12) url(#grade-teal)', synth: 'contrast(1.18) saturate(1.22) url(#grade-synth)', crimson: 'contrast(1.15) url(#grade-crimson)',
}[grade]);
export const GradeDefs: React.FC = () => <svg width="0" height="0" style={{position: 'absolute'}} aria-hidden>
  <defs>
    <filter id="grade-cold" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.72 0.11 0.04 0 0.023  0.07 0.72 0.19 0 0.035  0.04 0.13 0.83 0 0.037  0 0 0 1 0"/></filter>
    <filter id="grade-hero" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1.06 0 0 0 0.012  0 1.00 0 0 0.005  0 0 0.92 0 0  0 0 0 1 0"/></filter>
    <filter id="grade-night" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.85 0 0 0 0  0 0.98 0 0 0.006  0 0 1.14 0 0.015  0 0 0 1 0"/></filter>
    <filter id="grade-teal" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.84 0.06 0 0 0.01  0.02 0.96 0.04 0 0.03  0 0.08 1.0 0 0.05  0 0 0 1 0"/></filter>
    <filter id="grade-synth" colorInterpolationFilters="sRGB"><feComponentTransfer>
      <feFuncR type="table" tableValues="0.035 0.34 0.68 1"/><feFuncG type="table" tableValues="0.015 0.32 0.65 0.97"/><feFuncB type="table" tableValues="0.10 0.37 0.66 0.93"/>
    </feComponentTransfer></filter>
    <filter id="grade-crimson" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0.85" result="base"/>
      <feColorMatrix in="SourceGraphic" type="saturate" values="1.55" result="hot"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 -2 -1 0 -0.15" result="redMask"/>
      <feComponentTransfer in="redMask" result="mask"><feFuncA type="linear" slope="3" intercept="0"/></feComponentTransfer>
      <feComposite in="hot" in2="mask" operator="in" result="reds"/>
      <feMerge><feMergeNode in="base"/><feMergeNode in="reds"/></feMerge>
    </filter>
    <filter id="bloom-key" colorInterpolationFilters="sRGB"><feComponentTransfer>
      <feFuncR type="linear" slope="6.5" intercept="-5.6"/><feFuncG type="linear" slope="6.5" intercept="-5.6"/><feFuncB type="linear" slope="6.5" intercept="-5.6"/>
    </feComponentTransfer></filter>
    <filter id="grade-redmono" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray"/>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 -2 -1 0 -0.20" result="redMask"/>
      <feComponentTransfer in="redMask" result="mask"><feFuncA type="linear" slope="4" intercept="0"/></feComponentTransfer>
      <feComposite in="SourceGraphic" in2="mask" operator="in" result="reds"/>
      <feMerge><feMergeNode in="gray"/><feMergeNode in="reds"/></feMerge>
    </filter>
  </defs>
</svg>;
