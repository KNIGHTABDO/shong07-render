import React from 'react';
import {AbsoluteFill, Audio, Composition, registerRoot, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {GradeDefs} from './Grades';
import {ShotRenderer} from './ShotRenderer';
import {activeFx, FxOverlay, SceneFx} from './Fx';
import {TownStamp} from './TownStamp';
import {Matte, matteAt, matteSceneTransform} from './Light';
import {frames} from './math';
import type {Edit, MainProps, Manifest} from './types';
async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(staticFile(url));
  if (!response.ok) throw new Error(`Missing prepared asset: ${url} (${response.status}). Run prep in CI first.`);
  return response.json();
}
// Module initialization runs in every renderer tab; each font loader blocks its
// own render until the font is ready, including Arabic shaping and stills.
const fontPromises = [
  loadFont({family: 'Black Ops One', url: staticFile('fonts/stencil.ttf'), weight: '400'}),
  loadFont({family: 'Share Tech Mono', url: staticFile('fonts/mono.ttf'), weight: '400'}),
  loadFont({family: 'Cairo', url: staticFile('fonts/arabic.ttf'), weight: '100 1000'}),
  loadFont({family: 'Anton', url: staticFile('fonts/brand.ttf'), weight: '400'}),
  loadFont({family: 'Cormorant Garamond', url: staticFile('fonts/serif.ttf'), weight: '300 700'}),
  loadFont({family: 'Inter', url: staticFile('fonts/sans.ttf'), weight: '100 900'}),
  loadFont({family: 'Mrs Saint Delafield', url: staticFile('fonts/script.ttf'), weight: '400'}),
  loadFont({family: 'Nimbus Roman', url: staticFile('fonts/roman.otf'), weight: '400'}),
  loadFont({family: 'Nimbus Roman', url: staticFile('fonts/roman-bold.otf'), weight: '700'}),
  loadFont({family: 'Noto Music', url: staticFile('fonts/music.ttf'), weight: '400'}),
];
// Drawn above the TOWN stamp and grade overlays: words and UI chrome.
const TOP = new Set(['text', 'sub', 'kick', 'wave']);
// Light fx that must sit above the matte bars (streaks/flashes bleed over the black).
const OVER = new Set(['streaks', 'paparazzi', 'blackout', 'flash']);
// Colour washes that must stay inside the picture (under the matte bars).
const UNDER = new Set(['lightLeak']);
const Main: React.FC<MainProps> = ({edit, manifest}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  if (!edit || !manifest) throw new Error('Composition requires prep metadata');
  const stamp = edit.townStamp;
  const stampTime = stamp ? (frame - frames(stamp.at, fps)) / fps : -1;
  const stamped = Boolean(stamp && stampTime >= 0 && stampTime < stamp.dur);
  let shots = edit.shots.filter(s => frame >= frames(s.at, fps) && frame < frames(s.at, fps) + frames(s.dur, fps)).map(shot => ({shot, time: (frame - frames(shot.at, fps)) / fps}));
  if (stamped && stampTime < .15 && !shots.length) {
    const prior = edit.shots.filter(s => s.at < stamp!.at).at(-1);
    if (prior) shots = [{shot: prior, time: Math.min(prior.dur - 1 / fps, stamp!.at - prior.at - 1 / fps)}];
  }
  const matte = matteAt(edit.matte, frame / fps);
  const sceneTf = matteSceneTransform(matte, W, H);
  return <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
    <GradeDefs/>
    <svg width="0" height="0" style={{position: 'absolute'}}><defs>
      <filter id="channel-red" colorInterpolationFilters="sRGB"><feColorMatrix values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
      <filter id="channel-cyan" colorInterpolationFilters="sRGB"><feColorMatrix values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>
    </defs></svg>
    <AbsoluteFill style={{transform: sceneTf}}><SceneFx effects={edit.fx} frame={frame} fps={fps}>
      {shots.map(({shot, time}) => {
        const meta = manifest.shots[shot.id];
        if (!meta) throw new Error(`Missing prepared shot ${shot.id}`);
        return <ShotRenderer key={shot.id} shot={shot} meta={meta} time={time} bg={edit.bg}/>;
      })}
    </SceneFx></AbsoluteFill>
    {edit.fx.filter(fx => UNDER.has(fx.type)).map((fx, i) => {const time = activeFx(fx, frame, fps); return time === null ? null : <FxOverlay key={`u${i}`} fx={fx} time={time} frame={frame}/>;})}
    <Matte m={matte} W={W} H={H}/>
    {edit.fx.filter(fx => !TOP.has(fx.type) && !OVER.has(fx.type) && !UNDER.has(fx.type)).map((fx, i) => {const time = activeFx(fx, frame, fps); return time === null ? null : <FxOverlay key={i} fx={fx} time={time} frame={frame}/>;})}
    {edit.fx.filter(fx => OVER.has(fx.type)).map((fx, i) => {const time = activeFx(fx, frame, fps); return time === null ? null : <FxOverlay key={`o${i}`} fx={fx} time={time} frame={frame}/>;})}
    {stamped && stamp ? <TownStamp {...stamp} time={stampTime}/> : null}
    {edit.fx.filter(fx => TOP.has(fx.type)).map((fx, i) => {const time = activeFx(fx, frame, fps); return time === null ? null : <FxOverlay key={i} fx={fx} time={time} frame={frame}/>;})}
    {edit.watermark !== false && !stamped ? <div style={{position: 'absolute', right: 50, bottom: 72, fontFamily: 'Black Ops One', fontSize: 34, color: '#f2eddf', opacity: .35, letterSpacing: 3}}>TOWN</div> : null}
    <Sequence from={0} durationInFrames={frames(edit.duration, fps)}><Audio src={staticFile(edit.audio)}/></Sequence>
  </AbsoluteFill>;
};
import {WarpTest} from './WarpTest';
import {Wanted} from './Wanted';
import {Frequency, P as FP} from './Frequency';
import {Clone04} from './Clone04';
import {Whiplash05} from './Whiplash05';
import {Sxb06} from './Sxb06';
import {Shong07} from './Shong07';
const Root: React.FC = () => <><Composition id="Shong07" component={Shong07} width={1920} height={1080} fps={24} durationInFrames={765} defaultProps={{}}/><Composition id="Wanted" component={Wanted} width={1920} height={816} fps={30} durationInFrames={599} defaultProps={{}}/><Composition id="FreqPilot" component={Frequency} width={1080} height={1920} fps={30} durationInFrames={Math.round(FP.dur * 30)} defaultProps={{}}/><Composition id="Whiplash05" component={Whiplash05} width={1920} height={1080} fps={30} durationInFrames={659} defaultProps={{}}/><Composition id="Sxb06" component={Sxb06} width={1500} height={1080} fps={30} durationInFrames={814} defaultProps={{}}/><Composition id="Clone04" component={Clone04} width={1920} height={1204} fps={24000 / 1001} durationInFrames={289} defaultProps={{}}/><Composition id="WarpTest" component={WarpTest} width={540} height={960} fps={60} durationInFrames={144} defaultProps={{}}/><Composition id="Main" component={Main} width={1080} height={1920} fps={60} durationInFrames={480} defaultProps={{editUrl: 'edit.json'}} calculateMetadata={async ({props}) => {
  const [edit, manifest] = await Promise.all([loadJson<Edit>(props.editUrl), loadJson<Manifest>('shots/manifest.json')]);
  if (edit.fps !== 60) throw new Error('TOWN kit requires 60 fps');
  await Promise.all(fontPromises);
  const fps = props.profile === 'preview' ? 30 : 60;
  const [width, height] = edit.canvas ?? [1080, 1920];
  return {fps, width, height, durationInFrames: frames(edit.duration, fps), props: {...props, edit, manifest}};
}}/></>;
registerRoot(Root);
