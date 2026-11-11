export type Keys<T> = [number, T][];
export type Crop = {cx: number; cy: number; zoom: number};
export type Grade = 'cold' | 'hero' | 'night' | 'mono' | 'redmono' | 'none' | 'teal' | 'synth' | 'crimson';
export type GlCut = {kind: 'pinch' | 'whip' | 'zoom'; len: number; dir?: [number, number]; center?: [number, number]};
export type Shot = {
  id: string; src: string; t0: number; t1: number; at: number; dur: number;
  speed?: Keys<number>; fitSpeed?: boolean; layout: 'window' | 'full'; crop: Crop | Keys<Crop>;
  grade?: Grade; mblur?: number; reverse?: boolean; freezeAt?: number | null; interp?: 1 | 4;
  rot?: Keys<number>; flip?: boolean; exposure?: Keys<number>; bloom?: number; still?: string;
  gl?: {in?: GlCut; out?: GlCut}; lut?: boolean;
  cutout?: {png: string; text: string; color?: string; size?: number; y?: number; at?: number; spacing?: number};
};
export type HudData = {
  color?: string; speed?: Keys<number>; altitude?: Keys<number>; roll?: Keys<number>;
  pitch?: Keys<number>; heading?: Keys<number>; g?: Keys<number>;
  box?: [number, number, number, number, number][];
  callsign?: string; airframe?: string; lines?: string[]; result?: 'PASSED' | 'SPLASH';
};
type Timed = {at: number; dur: number};
export type Fx = Timed & (
  {type: 'flash'; color?: string} |
  {type: 'shake'; amp?: number; axis?: 'x' | 'y' | 'both'; seed?: string} |
  {type: 'zoomPunch'; amount?: number} |
  {type: 'zoomThrough'; amount?: number; center?: [number, number]} |
  {type: 'spin'; deg: number; dir: 'cw' | 'ccw'; hold?: boolean} |
  {type: 'lightLeak'; color: string} |
  {type: 'whip'; dir?: 'left' | 'right' | 'up' | 'down'; amount?: number} |
  {type: 'rgbSplit'; amount?: number} |
  {type: 'strobe'; rateHz?: number; color?: string; duty?: number} |
  {type: 'letterbox'; height?: number} |
  {type: 'text'; text: string; font?: string; style: 'stencil' | 'arabicGlow' | 'hud' | 'title'; pos?: [number, number]; anim?: 'type' | 'pop' | 'slam'; color?: string; size?: number} |
  {type: 'hud'; mode: 'boot' | 'flight' | 'lock' | 'takeoff'; data?: HudData} |
  {type: 'impact'} |
  {type: 'slam'; amp?: number; rot?: number} |
  {type: 'sub'; text: string; color: string; words?: number[]; red?: number[]; y?: number; size?: number} |
  {type: 'kick'; channel: string; title: string; viewers?: string; y?: number} |
  {type: 'wave'; env: number[]; rate: number; color?: string; y?: number} |
  {type: 'embers'; color?: string; count?: number; seed?: string} |
  {type: 'vignette'; amount?: number} |
  {type: 'spot'; pos: [number, number]; rx?: number; ry?: number; boost?: number; dark?: number; shade?: number} |
  {type: 'smoke'; x0?: number; x1?: number; color?: string; amount?: number; count?: number; seed?: string} |
  {type: 'grain'; amount?: number} |
  {type: 'streaks'; colors?: string[]; count?: number; angle?: number; black?: number; seed?: string} |
  {type: 'paparazzi'; rate?: number; full?: number; seed?: string; color?: string} |
  {type: 'flare'; pos: [number, number]; color?: string; width?: number; pulse?: number; amount?: number} |
  {type: 'shutterBar'; y?: number; height?: number; every?: number; strobe?: boolean} |
  {type: 'blackout'; fade?: number}
);
/** Living frame: black matte insets (fractions of canvas) eased from the previous key over dur seconds. */
export type MatteKey = {at: number; dur?: number; top?: number; bottom?: number; left?: number; right?: number;
  ease?: 'out' | 'inout' | 'back' | 'snap'; radius?: number; border?: string; rebate?: string; shrink?: number; pop?: number};
export type Edit = {
  fps: 60; duration: number; audio: string; shots: Shot[]; fx: Fx[];
  bg?: 'blur' | 'black'; watermark?: boolean; lut?: string; canvas?: [number, number]; matte?: MatteKey[];
  townStamp?: {at: number; dur: number; word?: string; color?: string; accent?: string; topline?: string; subline?: string};
};
export type PreparedShot = {start: number; fps: number; count: number; width: number; height: number; path: string; interpolation: string};
export type Manifest = {version: 1; preview: boolean; shots: Record<string, PreparedShot>};
export type MainProps = {editUrl: string; profile?: 'full' | 'preview'; edit?: Edit; manifest?: Manifest};
