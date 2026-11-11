import React from 'react';
import {clamp, easeOut, keyValue, mix} from './math';
import type {HudData} from './types';
const MONO = '"Share Tech Mono", monospace';
const Cross: React.FC<{x?: number; y?: number; size?: number}> = ({x = 540, y = 960, size = 30}) => <g><path d={`M${x - size} ${y}h${size - 10}m20 0h${size - 10}M${x} ${y - size}v${size - 10}m0 20v${size - 10}`}/><circle cx={x} cy={y} r="4"/></g>;
function Tape({x, value, label, right = false}: {x: number; value: number; label: string; right?: boolean}) {
  const step = 20, unit = 3.8, base = Math.floor(value / step) * step;
  return <g>
    <text x={x} y="660" textAnchor="middle" fontSize="24">{label}</text>
    <path d={`M${x} 700v520`} opacity=".5"/>
    {Array.from({length: 9}, (_, i) => {
      const v = base + (i - 4) * step, y = 960 - (v - value) * unit;
      return <g key={i} opacity={clamp(1 - Math.abs(y - 960) / 290)}><path d={`M${x} ${y}h${right ? -18 : 18}`}/><text x={x + (right ? 25 : -25)} y={y + 8} textAnchor={right ? 'start' : 'end'} fontSize="24">{String(Math.max(0, v)).padStart(3, '0')}</text></g>;
    })}
    <path d={`M${x + (right ? -5 : 5)} 960l${right ? -15 : 15} -12v24z`} fill="currentColor"/>
    <rect x={x - 46} y="1260" width="92" height="48" fill="#020a07"/>
    <text x={x} y="1293" textAnchor="middle" fontSize="32">{Math.round(value)}</text>
  </g>;
}
export const Hud: React.FC<{mode: 'boot' | 'flight' | 'lock' | 'takeoff'; data?: HudData; time: number; dur: number}> = ({mode, data = {}, time, dur}) => {
  const color = data.color ?? '#7CFF9B';
  const roll = keyValue(data.roll, time, 0), pitch = keyValue(data.pitch, time, mode === 'takeoff' ? easeOut(time / dur) * 24 : 0);
  const speed = keyValue(data.speed, time, 220), altitude = keyValue(data.altitude, time, 120);
  const heading = keyValue(data.heading, time, 220), g = keyValue(data.g, time, 1.2);
  const bootLines = data.lines ?? ['SYS CHECK... OK', `AIRFRAME: ${data.airframe ?? 'CHALLENGER'}`, `CALLSIGN: ${data.callsign ?? '22'}`, 'FLIGHT CONTROL / ARMED'];
  const draw = easeOut(time / .9);
  const boxKeys = data.box ?? [[0, .5, .5, .25, .17]];
  const target = [1, 2, 3, 4].map(i => keyValue(boxKeys.map(row => [row[0], row[i]]), time, .5));
  const acquire = easeOut(time / .55);
  const bx = mix(540, target[0] * 1080, acquire), by = mix(960, target[1] * 1920, acquire);
  const bw = mix(700, target[2] * 1080, acquire), bh = mix(700, target[3] * 1920, acquire);
  return <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{position: 'absolute', inset: 0, color, filter: `drop-shadow(0 0 5px ${color}80)`, fontFamily: MONO}}>
    <g fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="square">
      <path d="M90 390v-45h150M990 390v-45H840M90 1510v65h150M990 1510v65H840" opacity=".7"/>
      <g fill="currentColor" stroke="none" fontSize="23" letterSpacing="4"><text x="90" y="315">TOWN / AEROSPACE</text><text x="990" y="315" textAnchor="end">CH—{data.callsign ?? '22'}</text></g>
      {mode === 'boot' ? <g>
        <g strokeDasharray="1800" strokeDashoffset={1800 * (1 - draw)}><path d="M170 800H430M650 800H910M170 1120H430M650 1120H910M540 580v230M540 1110v230"/><circle cx="540" cy="960" r="115"/></g>
        <Cross/>
        <g fill="currentColor" stroke="none" fontSize="29" letterSpacing="2">
          {bootLines.map((line, i) => <text key={line} x="174" y={1400 + i * 42}>{line.slice(0, Math.max(0, Math.floor((time - i * .22) * 28)))}</text>)}
          <text x="540" y="540" textAnchor="middle" fontSize="22">{time > .6 ? 'SYSTEM ONLINE' : 'INITIALIZING_'}</text>
        </g>
      </g> : null}
      {mode === 'flight' || mode === 'takeoff' ? <g>
        <Tape x={175} value={speed} label="KM/H"/><Tape x={905} value={altitude} label="ALT" right/>
        <svg x="270" y="630" width="540" height="650" viewBox="270 630 540 650" overflow="hidden">
          <g transform={`rotate(${-roll} 540 960) translate(0 ${pitch * 9})`} opacity=".85">
            {Array.from({length: 13}, (_, i) => {
              const n = i - 6, y = 960 + n * 88;
              return <g key={i} strokeDasharray={n > 0 ? '10 8' : undefined}><path d={`M${n === 0 ? 290 : 340} ${y}H490m100 0H${n === 0 ? 790 : 740}`}/><text x="308" y={y + 8} fill="currentColor" stroke="none" fontSize="23">{Math.abs(n * 5)}</text></g>;
            })}
          </g>
        </svg>
        <Cross size={48}/>
        <svg x="280" y="410" width="520" height="90" viewBox="280 410 520 90" overflow="hidden">
          {Array.from({length: 13}, (_, i) => {
            const val = Math.floor(heading / 10) * 10 + (i - 6) * 10, x = 540 + (val - heading) * 7;
            return <g key={i}><path d={`M${x} 455v15`}/><text x={x} y="440" fill="currentColor" stroke="none" textAnchor="middle" fontSize="22">{((val % 360) + 360) % 360}</text></g>;
          })}
        </svg>
        <path d="M530 488l10 -12 10 12"/>
        <g fill="currentColor" stroke="none"><text x="175" y="1430" fontSize="31">G {g.toFixed(1)}</text><text x="905" y="1430" textAnchor="end" fontSize="24">{mode === 'takeoff' ? 'CLIMB POSITIVE' : 'FLIGHT / NOMINAL'}</text>
          {mode === 'takeoff' ? <text x="540" y="610" textAnchor="middle" fontSize={time > .85 ? 65 : 38} letterSpacing="7">{time < .45 ? 'V1' : time < .85 ? 'ROTATE' : 'AIRBORNE'}</text> : null}
        </g>
      </g> : null}
      {mode === 'lock' ? <g opacity={time < .6 && Math.floor(time * 12) % 2 ? .3 : 1}>
        <g transform={`translate(${bx - bw / 2} ${by - bh / 2})`}>
          <path d={`M0 38V0h38M${bw - 38} 0h38v38M${bw} ${bh - 38}v38h-38M38 ${bh}H0v-38`} strokeWidth="3"/>
          <path d={`M${bw / 2 - 12} ${bh / 2}h24m-12 -12v24`} opacity=".65"/>
          <text x="0" y="-25" fill="currentColor" stroke="none" fontSize="30" letterSpacing="6">{time < .5 ? 'ACQUIRE' : time < dur * .7 ? 'LOCK' : data.result ?? 'PASSED'}</text>
          <text x={bw} y={bh + 38} fill="currentColor" stroke="none" textAnchor="end" fontSize="22">TGT 01 / {Math.round(clamp(time / .6) * 100)}%</text>
        </g>
      </g> : null}
      <g fill="currentColor" stroke="none" fontSize="21" letterSpacing="3"><text x="90" y="1630">REC ●</text><text x="990" y="1630" textAnchor="end">{time.toFixed(2).padStart(6, '0')} / {mode.toUpperCase()}</text></g>
    </g>
  </svg>;
};
