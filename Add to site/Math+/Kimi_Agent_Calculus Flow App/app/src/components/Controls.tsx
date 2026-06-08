import type { RiemannType } from '@/lib/mathFunctions';

export interface RiemannControlsState {
  type: 'controls';
  mode: 'riemann';
  n: number;
  riemannType: RiemannType;
  showOverUnder: boolean;
  isAnimating: boolean;
  onNChange: (n: number) => void;
  onRiemannTypeChange: (t: RiemannType) => void;
  onToggleOverUnder: () => void;
  onAnimate: () => void;
  onReset: () => void;
}

export interface TangentControlsState {
  type: 'controls';
  mode: 'tangent';
  showSecant: boolean;
  showNormal: boolean;
  onToggleSecant: () => void;
  onToggleNormal: () => void;
  onReset: () => void;
}

export interface AreaControlsState {
  type: 'controls';
  mode: 'area';
  showAntiderivative: boolean;
  onToggleAntiderivative: () => void;
  onReset: () => void;
}

export interface FTCControlsState {
  type: 'controls';
  mode: 'ftc';
  isPlaying: boolean;
  bigIdeaActive: boolean;
  onPlay: () => void;
  onBigIdea: () => void;
  onReset: () => void;
}

export interface LimitsControlsState {
  type: 'controls';
  mode: 'limits';
  showEpsilonDelta: boolean;
  onToggleEpsilonDelta: () => void;
  onApproachLeft: () => void;
  onApproachRight: () => void;
  onReset: () => void;
}

type ControlsState =
  | RiemannControlsState
  | TangentControlsState
  | AreaControlsState
  | FTCControlsState
  | LimitsControlsState;

interface ControlsProps {
  state: ControlsState;
}

export default function Controls({ state }: ControlsProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-3 mx-auto"
      style={{ maxWidth: 900, marginTop: 20, marginBottom: 16 }}
    >
      {state.mode === 'riemann' && (
        <>
          <button
            onClick={state.onAnimate}
            className="pill-inactive"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {state.isAnimating ? '⏸ Pause' : '▶ Animate n → ∞'}
          </button>
          <button
            onClick={state.onToggleOverUnder}
            className={state.showOverUnder ? 'pill-active' : 'pill-inactive'}
          >
            Show Over/Under
          </button>
          <button onClick={state.onReset} className="pill-inactive">
            Reset
          </button>
        </>
      )}

      {state.mode === 'tangent' && (
        <>
          <button
            onClick={state.onToggleSecant}
            className={state.showSecant ? 'pill-active' : 'pill-inactive'}
          >
            Show Secant Line
          </button>
          <button
            onClick={state.onToggleNormal}
            className={state.showNormal ? 'pill-active' : 'pill-inactive'}
          >
            Show Normal
          </button>
          <button onClick={state.onReset} className="pill-inactive">
            Reset
          </button>
        </>
      )}

      {state.mode === 'area' && (
        <>
          <button onClick={state.onReset} className="pill-inactive">
            Reset Bounds
          </button>
          <button
            onClick={state.onToggleAntiderivative}
            className={state.showAntiderivative ? 'pill-active' : 'pill-inactive'}
          >
            Show Antiderivative
          </button>
        </>
      )}

      {state.mode === 'ftc' && (
        <>
          <button
            onClick={state.onPlay}
            className={state.isPlaying ? 'pill-active' : 'pill-inactive'}
          >
            {state.isPlaying ? '⏸ Pause' : '▶ Play Animation'}
          </button>
          <button
            onClick={state.onBigIdea}
            className={state.bigIdeaActive ? 'pill-active' : 'pill-inactive'}
            style={state.bigIdeaActive ? {} : { borderColor: '#f59e0b', color: '#f59e0b' }}
          >
            ✦ The Big Idea
          </button>
          <button onClick={state.onReset} className="pill-inactive">
            Reset
          </button>
        </>
      )}

      {state.mode === 'limits' && (
        <>
          <button onClick={state.onApproachLeft} className="pill-inactive">
            ← Approach from Left
          </button>
          <button onClick={state.onApproachRight} className="pill-inactive">
            Approach from Right →
          </button>
          <button
            onClick={state.onToggleEpsilonDelta}
            className={state.showEpsilonDelta ? 'pill-active' : 'pill-inactive'}
          >
            Show ε-δ Definition
          </button>
        </>
      )}
    </div>
  );
}
