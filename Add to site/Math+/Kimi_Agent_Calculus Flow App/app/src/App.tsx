import { useState, useCallback, useRef, useEffect } from 'react';
import type { RiemannType } from '@/lib/mathFunctions';
import { getFunctionPresets } from '@/lib/mathFunctions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ModeTabs from '@/components/ModeTabs';
import FunctionPresets from '@/components/FunctionPresets';
import CanvasBoard from '@/components/CanvasBoard';
import Controls from '@/components/Controls';
import AnalysisLog, { type LogEntry } from '@/components/AnalysisLog';
import EducationalCards from '@/components/EducationalCards';
import ToggleSwitch from '@/components/ToggleSwitch';

export type CanvasMode = 'riemann' | 'tangent' | 'area' | 'ftc' | 'limits';

let logIdCounter = 0;

function generateId() {
  return `log-${++logIdCounter}-${Date.now()}`;
}

export default function App() {
  // Core state
  const [activeMode, setActiveMode] = useState<CanvasMode>('riemann');
  const [intuitiveMode, setIntuitiveMode] = useState(false);
  const [activeFunctionKey, setActiveFunctionKey] = useState('velocity');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // Riemann state
  const [riemannN, setRiemannN] = useState(8);
  const [riemannType, setRiemannType] = useState<RiemannType>('left');
  const [showOverUnder, setShowOverUnder] = useState(false);
  const [riemannAnimating, setRiemannAnimating] = useState(false);
  const riemannAnimRef = useRef<number>(0);
  const sliderLogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderLastLoggedRef = useRef<number>(-1);

  // Tangent state
  const [tangentX, setTangentX] = useState(2);
  const [showSecant, setShowSecant] = useState(false);
  const [secantX, setSecantX] = useState(3);
  const [showNormal, setShowNormal] = useState(false);

  // Area state
  const [areaA, setAreaA] = useState(0.5);
  const [areaB, setAreaB] = useState(4);
  const [showAntiderivative, setShowAntiderivative] = useState(false);

  // FTC state
  const [ftcT, setFtcT] = useState(1);
  const [ftcPlaying, setFtcPlaying] = useState(false);
  const ftcAnimRef = useRef<number>(0);

  // Big Idea animation state
  const [bigIdeaActive, setBigIdeaActive] = useState(false);
  const [bigIdeaFrame, setBigIdeaFrame] = useState(0);
  const bigIdeaAnimRef = useRef<number>(0);
  const BIG_IDEA_TOTAL_FRAMES = 900; // 15s at 60fps

  // Limits state
  const [limitX, setLimitX] = useState(1);
  const [showEpsilonDelta, setShowEpsilonDelta] = useState(false);

  // Data readouts
  const [riemannData, setRiemannData] = useState({ area: 0, exactArea: 0, error: 0 });
  const [tangentData, setTangentData] = useState({ slope: 0, x: 0, y: 0 });
  const [areaData, setAreaData] = useState({ area: 0 });
  const [ftcData, setFtcData] = useState({ accumulatedArea: 0, fOfT: 0 });
  const [limitsData, setLimitsData] = useState({ currentValue: 0, distanceToLimit: 0, withinEpsilon: false });

  // Get current preset
  const presets = getFunctionPresets(activeMode);
  const preset = presets.find((p) => p.key === activeFunctionKey) ?? presets[0];

  // Helper: add log entry
  const addLog = useCallback((text: string, math?: string) => {
    setLogEntries((prev) => {
      const next = [...prev, {
        id: generateId(),
        mode: activeMode.charAt(0).toUpperCase() + activeMode.slice(1),
        text,
        math,
        timestamp: Date.now(),
      }];
      if (next.length > 50) next.shift();
      return next;
    });
  }, [activeMode]);

  // Mode change
  const handleModeChange = useCallback((mode: CanvasMode) => {
    setActiveMode(mode);
    // Reset to default function of the new mode (velocity for riemann, first for others)
    const newPresets = getFunctionPresets(mode);
    if (newPresets.length > 0) {
      const defaultKey = mode === 'riemann' ? 'velocity' : newPresets[0].key;
      setActiveFunctionKey(defaultKey);
    }
    // Reset mode-specific state
    if (mode === 'riemann') {
      setRiemannN(8);
      setRiemannType('left');
      setShowOverUnder(false);
      setRiemannAnimating(false);
    } else if (mode === 'tangent') {
      setTangentX(2);
      setShowSecant(false);
      setShowNormal(false);
    } else if (mode === 'area') {
      setAreaA(0.5);
      setAreaB(4);
      setShowAntiderivative(false);
    } else if (mode === 'ftc') {
      setFtcT(1);
      setFtcPlaying(false);
    } else if (mode === 'limits') {
      setLimitX(1);
      setShowEpsilonDelta(false);
    }
    setLogEntries([]);
  }, []);

  // Function change
  const handleFunctionChange = useCallback((key: string) => {
    setActiveFunctionKey(key);
    const p = presets.find((pr) => pr.key === key);
    if (p) {
      addLog(`Changed function to ${p.label}`);
    }
  }, [presets, addLog]);

  // Riemann animation
  useEffect(() => {
    if (!riemannAnimating) {
      if (riemannAnimRef.current) cancelAnimationFrame(riemannAnimRef.current);
      return;
    }
    let currentN = riemannN;
    const targetN = 100;
    const step = 0.5;

    const animate = () => {
      currentN += step;
      if (currentN >= targetN) {
        setRiemannN(targetN);
        setRiemannAnimating(false);
        addLog(`Animation complete: n = ${targetN}`, `Area \u2248 ${riemannData.area.toFixed(2)}`);
        return;
      }
      setRiemannN(Math.floor(currentN));
      riemannAnimRef.current = requestAnimationFrame(animate);
    };
    riemannAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (riemannAnimRef.current) cancelAnimationFrame(riemannAnimRef.current);
    };
  }, [riemannAnimating, riemannN, addLog, riemannData.area]);

  // FTC animation
  useEffect(() => {
    if (!ftcPlaying) {
      if (ftcAnimRef.current) cancelAnimationFrame(ftcAnimRef.current);
      return;
    }
    let currentT = ftcT;
    const targetT = 5;
    const step = 0.02;

    const animate = () => {
      currentT += step;
      if (currentT >= targetT) {
        setFtcT(targetT);
        setFtcPlaying(false);
        return;
      }
      setFtcT(currentT);
      ftcAnimRef.current = requestAnimationFrame(animate);
    };
    ftcAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (ftcAnimRef.current) cancelAnimationFrame(ftcAnimRef.current);
    };
  }, [ftcPlaying, ftcT]);

  // Big Idea animation (15s cinematic, 5 phases × 3s each)
  useEffect(() => {
    if (!bigIdeaActive) {
      if (bigIdeaAnimRef.current) cancelAnimationFrame(bigIdeaAnimRef.current);
      return;
    }
    let frame = 0;
    const animate = () => {
      frame += 1;
      // Phase 1 (frames 180-360): drive ftcT 0→5
      if (frame >= 180 && frame < 360) {
        const progress = (frame - 180) / 180;
        setFtcT(progress * 5);
      }
      setBigIdeaFrame(frame);
      if (frame >= BIG_IDEA_TOTAL_FRAMES) {
        setBigIdeaActive(false);
        return;
      }
      bigIdeaAnimRef.current = requestAnimationFrame(animate);
    };
    bigIdeaAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (bigIdeaAnimRef.current) cancelAnimationFrame(bigIdeaAnimRef.current);
    };
  }, [bigIdeaActive]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '1':
          handleModeChange('riemann');
          break;
        case '2':
          handleModeChange('tangent');
          break;
        case '3':
          handleModeChange('area');
          break;
        case '4':
          handleModeChange('ftc');
          break;
        case '5':
          handleModeChange('limits');
          break;
        case 'r':
        case 'R':
          if (activeMode === 'riemann') {
            setRiemannN(8);
            setRiemannType('left');
          } else if (activeMode === 'tangent') {
            setTangentX(2);
          } else if (activeMode === 'area') {
            setAreaA(0.5);
            setAreaB(4);
          } else if (activeMode === 'ftc') {
            setFtcT(1);
          } else if (activeMode === 'limits') {
            setLimitX(1);
          }
          break;
        case ' ':
          e.preventDefault();
          if (activeMode === 'riemann') {
            setRiemannAnimating((a) => !a);
          } else if (activeMode === 'ftc') {
            setFtcPlaying((p) => !p);
          }
          break;
        case '+':
        case '=':
          if (activeMode === 'riemann') setRiemannN((n) => Math.min(100, n + 1));
          break;
        case '-':
        case '_':
          if (activeMode === 'riemann') setRiemannN((n) => Math.max(2, n - 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, handleModeChange]);

  // Riemann sub-mode tabs
  const RiemannSubTabs = () => (
    <div className="flex flex-wrap justify-center gap-2 mx-auto px-3 sm:px-0" style={{ maxWidth: 900, marginBottom: 12 }}>
      {(['left', 'right', 'midpoint', 'trapezoid'] as const).map((t) => {
        const label = t === 'left' ? 'Left Sum' : t === 'right' ? 'Right Sum' : t === 'midpoint' ? 'Midpoint Sum' : 'Trapezoid';
        const isActive = riemannType === t;
        return (
          <button
            key={t}
            onClick={() => {
              setRiemannType(t);
              addLog(`Switched to ${label}`);
            }}
            className={isActive ? 'pill-small-active' : 'pill-small'}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  // Instructions text
  const instructionText = {
    riemann: 'Drag the slider to change the number of rectangles. Compare left, right, and midpoint sums.',
    tangent: 'Drag the point along the curve to see the tangent line and its slope at each position.',
    area: 'Drag the bounds to explore how the definite integral accumulates area under the curve.',
    ftc: 'Drag the upper bound to see how the derivative of the accumulated area equals the original function.',
    limits: 'Drag the point toward the limit to see how the function approaches its limiting value.',
  }[activeMode];

  // Build controls state
  const getControlsState = () => {
    switch (activeMode) {
      case 'riemann':
        return {
          type: 'controls' as const,
          mode: 'riemann' as const,
          n: riemannN,
          riemannType,
          showOverUnder,
          isAnimating: riemannAnimating,
          onNChange: (n: number) => setRiemannN(n),
          onRiemannTypeChange: (t: RiemannType) => setRiemannType(t),
          onToggleOverUnder: () => setShowOverUnder((v) => !v),
          onAnimate: () => {
            if (riemannAnimating) {
              setRiemannAnimating(false);
            } else {
              setRiemannAnimating(true);
              addLog('Started Riemann sum animation');
            }
          },
          onReset: () => {
            setRiemannN(8);
            setRiemannType('left');
            setShowOverUnder(false);
            setRiemannAnimating(false);
            setActiveFunctionKey('velocity');
            addLog('Reset Riemann sums');
          },
        };
      case 'tangent':
        return {
          type: 'controls' as const,
          mode: 'tangent' as const,
          showSecant,
          showNormal,
          onToggleSecant: () => {
            setShowSecant((v) => !v);
            addLog(showSecant ? 'Hid secant line' : 'Showed secant line');
          },
          onToggleNormal: () => {
            setShowNormal((v) => !v);
            addLog(showNormal ? 'Hid normal line' : 'Showed normal line');
          },
          onReset: () => {
            setTangentX(2);
            setShowSecant(false);
            setShowNormal(false);
            addLog('Reset tangent mode');
          },
        };
      case 'area':
        return {
          type: 'controls' as const,
          mode: 'area' as const,
          showAntiderivative,
          onToggleAntiderivative: () => {
            setShowAntiderivative((v) => !v);
            addLog(showAntiderivative ? 'Hid antiderivative' : 'Showed antiderivative');
          },
          onReset: () => {
            setAreaA(0.5);
            setAreaB(4);
            addLog('Reset area bounds');
          },
        };
      case 'ftc':
        return {
          type: 'controls' as const,
          mode: 'ftc' as const,
          isPlaying: ftcPlaying,
          bigIdeaActive,
          onPlay: () => {
            setFtcPlaying((p) => !p);
            addLog(ftcPlaying ? 'Paused FTC animation' : 'Started FTC animation');
          },
          onBigIdea: () => {
            if (bigIdeaActive) {
              setBigIdeaActive(false);
            } else {
              setBigIdeaFrame(0);
              setFtcT(0);
              setFtcPlaying(false);
              setActiveFunctionKey('polynomial');
              setBigIdeaActive(true);
              addLog('Started Big Idea animation');
            }
          },
          onReset: () => {
            setFtcT(1);
            setFtcPlaying(false);
            setBigIdeaActive(false);
            setBigIdeaFrame(0);
            addLog('Reset FTC mode');
          },
        };
      case 'limits':
        return {
          type: 'controls' as const,
          mode: 'limits' as const,
          showEpsilonDelta,
          onToggleEpsilonDelta: () => {
            setShowEpsilonDelta((v) => !v);
            addLog(showEpsilonDelta ? 'Hid epsilon-delta bands' : 'Showed epsilon-delta bands');
          },
          onApproachLeft: () => {
            const limitPoint = preset.limitPoint ?? 0;
            const startX = limitPoint - 2;
            setLimitX(startX);
            let currentX = startX;
            const animate = () => {
              currentX += 0.03;
              if (currentX >= limitPoint - 0.05) {
                setLimitX(limitPoint - 0.05);
                return;
              }
              setLimitX(currentX);
              requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            addLog('Approaching limit from left');
          },
          onApproachRight: () => {
            const limitPoint = preset.limitPoint ?? 0;
            const startX = limitPoint + 2;
            setLimitX(startX);
            let currentX = startX;
            const animate = () => {
              currentX -= 0.03;
              if (currentX <= limitPoint + 0.05) {
                setLimitX(limitPoint + 0.05);
                return;
              }
              setLimitX(currentX);
              requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            addLog('Approaching limit from right');
          },
          onReset: () => {
            setLimitX(1);
            setShowEpsilonDelta(false);
            addLog('Reset limits mode');
          },
        };
    }
  };

  // Riemann slider — onInput for continuous visual update, debounced log
  const RiemannSlider = () => {
    if (activeMode !== 'riemann') return null;

    const handleSliderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value);
      setRiemannN(n);

      // Debounce log: only log 250ms after user stops dragging
      if (!riemannAnimating) {
        if (sliderLogTimeoutRef.current) {
          clearTimeout(sliderLogTimeoutRef.current);
        }
        sliderLogTimeoutRef.current = setTimeout(() => {
          // Only log if value actually changed from last logged
          if (n !== sliderLastLoggedRef.current) {
            sliderLastLoggedRef.current = n;
            addLog(`Set rectangles to n = ${n}`);
          }
          sliderLogTimeoutRef.current = null;
        }, 250);
      }
    };

    return (
      <div className="mx-auto px-3 sm:px-6" style={{ maxWidth: 900, marginTop: 12, marginBottom: 12 }}>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-math text-[12px]" style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
            n =
          </span>
          <input
            type="range"
            min={2}
            max={100}
            value={riemannN}
            onInput={handleSliderInput}
            className="flex-1"
            style={{ touchAction: 'none' }}
          />
          <span
            className="font-math text-[14px] font-medium"
            style={{
              color: '#22d3ee',
              minWidth: 32,
              textAlign: 'right',
            }}
          >
            {riemannN}
          </span>
        </div>
      </div>
    );
  };

  // Readout display below canvas
  const Readout = () => {
    return (
      <div className="mx-auto text-center px-3 sm:px-6" style={{ maxWidth: 900, marginTop: 8 }}>
        {activeMode === 'riemann' && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-math text-[16px]" style={{ color: '#22d3ee' }}>
              Approximate Area &asymp; {riemannData.area.toFixed(2)}
            </span>
            <span className="font-math text-[12px]" style={{ color: '#64748b' }}>
              True Area = {riemannData.exactArea.toFixed(2)}
              {' '}
              <span style={{ color: riemannData.error > 5 ? '#f43f5e' : '#10b981' }}>
                | Error: {riemannData.error.toFixed(2)}%
              </span>
            </span>
          </div>
        )}

        {activeMode === 'tangent' && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-math text-[16px]" style={{ color: '#8b5cf6' }}>
              Slope = f&apos;({tangentData.x.toFixed(2)}) = {tangentData.slope.toFixed(2)}
            </span>
            <span className="font-math text-[12px]" style={{ color: '#64748b' }}>
              Point: ({tangentData.x.toFixed(2)}, {tangentData.y.toFixed(2)})
            </span>
          </div>
        )}

        {activeMode === 'area' && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-math text-[16px]" style={{ color: '#f59e0b' }}>
              &int; {'{'}a{'}'}^{'{'}b{'}'} f(x) dx &asymp; {areaData.area.toFixed(2)}
            </span>
            <span className="font-math text-[12px]" style={{ color: '#64748b' }}>
              a = {areaA.toFixed(2)}, b = {areaB.toFixed(2)}
            </span>
          </div>
        )}

        {activeMode === 'ftc' && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex justify-center gap-8">
              <span className="font-math text-[14px]" style={{ color: '#22d3ee' }}>
                &int; {'{'}0{'}'}^{'{'}t{'}'} f(x) dx = {ftcData.accumulatedArea.toFixed(2)}
              </span>
              <span className="font-math text-[14px]" style={{ color: '#8b5cf6' }}>
                F(t) = {ftcData.fOfT.toFixed(2)}
              </span>
            </div>
            <span className="font-body text-[13px] italic" style={{ color: '#94a3b8' }}>
              The derivative of the accumulated area equals the original function: d/dt &int;{'{'}0{'}'}^t f(x)dx = f(t)
            </span>
          </div>
        )}

        {activeMode === 'limits' && (
          <div className="flex flex-col items-center gap-1">
            <span className="font-math text-[14px]" style={{ color: '#22d3ee' }}>
              lim(x&rarr;{preset.limitPoint ?? 0}) {preset.label} = {preset.limitValue ?? 1}
            </span>
            <span className="font-math text-[12px]" style={{ color: '#94a3b8' }}>
              Current: f({limitX.toFixed(2)}) = {limitsData.currentValue.toFixed(4)}
            </span>
            {limitsData.withinEpsilon && (
              <span className="font-math text-[12px]" style={{ color: '#10b981' }}>
                |f(x) - L| = {limitsData.distanceToLimit.toFixed(4)} &lt; &epsilon;
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-[100dvh]" style={{ background: 'var(--bg-deep)' }}>
      <ParticleBackground />

      {/* Content layer */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section
          className="text-center mx-auto px-4 sm:px-6"
          style={{
            maxWidth: 900,
            paddingTop: 32,
            paddingBottom: 24,
          }}
        >
          <h1
            className="font-heading animate-glow-pulse"
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2), 0 0 120px rgba(34, 211, 238, 0.1)',
              opacity: 0,
              animation: 'fade-in-up 0.6s ease-out 0.1s forwards, glow-pulse 4s ease-in-out 0.7s infinite',
            }}
          >
            CALCULUS FLOW
          </h1>
          <p
            className="font-body"
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: '#94a3b8',
              marginTop: 8,
              letterSpacing: '0.02em',
              lineHeight: 1.6,
              opacity: 0,
              animation: 'fade-in-up 0.5s ease-out 0.3s forwards',
            }}
          >
            Interactive Curve Explorer
          </p>
        </section>

        {/* Controls Row */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mx-auto px-4 sm:px-6"
          style={{
            maxWidth: 900,
            marginBottom: 16,
            opacity: 0,
            animation: 'fade-in 0.4s ease-out 0.5s forwards',
          }}
        >
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <ToggleSwitch
              checked={intuitiveMode}
              onChange={setIntuitiveMode}
              label="Intuitive Mode"
            />
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('analysis-log');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                el.style.borderColor = '#22d3ee';
                setTimeout(() => {
                  el.style.borderColor = '#1a2248';
                }, 1000);
              }
            }}
            className="pill-inactive flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            Analysis Log
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ opacity: 0, animation: 'fade-in 0.4s ease-out 0.6s forwards' }}>
          <ModeTabs activeMode={activeMode} onModeChange={(mode: string) => handleModeChange(mode as CanvasMode)} />
        </div>

        {/* Function Presets */}
        <div style={{ opacity: 0, animation: 'fade-in 0.3s ease-out 0.7s forwards' }}>
          <FunctionPresets
            mode={activeMode}
            activeFunction={activeFunctionKey}
            onFunctionChange={handleFunctionChange}
          />
        </div>

        {/* Instruction */}
        <p
          className="text-center font-body mx-auto px-4 sm:px-6"
          style={{
            maxWidth: 900,
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 16,
            opacity: 0,
            animation: 'fade-in 0.3s ease-out 0.8s forwards',
          }}
        >
          {instructionText}
        </p>

        {/* Riemann sub-tabs */}
        {activeMode === 'riemann' && <RiemannSubTabs />}

        {/* Canvas */}
        <div
          className="mx-auto px-3 sm:px-6"
          style={{
            maxWidth: 900,
            position: 'relative',
            opacity: 0,
            animation: 'fade-in 0.4s ease-out 0.9s forwards',
          }}
        >
          <CanvasBoard
            mode={activeMode}
            preset={preset}
            riemannN={riemannN}
            riemannType={riemannType}
            showOverUnder={showOverUnder}
            tangentX={tangentX}
            showSecant={showSecant}
            secantX={secantX}
            showNormal={showNormal}
            areaA={areaA}
            areaB={areaB}
            showAntiderivative={showAntiderivative}
            ftcT={ftcT}
            limitX={limitX}
            showEpsilonDelta={showEpsilonDelta}
            onTangentXChange={setTangentX}
            onAreaAChange={setAreaA}
            onAreaBChange={setAreaB}
            onFtcTChange={setFtcT}
            onLimitXChange={setLimitX}
            onRiemannDataChange={setRiemannData}
            onTangentDataChange={setTangentData}
            onAreaDataChange={setAreaData}
            onFtcDataChange={setFtcData}
            onLimitsDataChange={setLimitsData}
            onSecantXChange={setSecantX}
            isAnimating={riemannAnimating}
            intuitiveMode={intuitiveMode}
          />
          {/* Big Idea overlay — 5 phases × 3s each */}
          {bigIdeaActive && (() => {
            const phase = bigIdeaFrame < 180 ? 0 : bigIdeaFrame < 360 ? 1 : bigIdeaFrame < 540 ? 2 : bigIdeaFrame < 720 ? 3 : 4;
            const phaseProgress = (bigIdeaFrame % 180) / 180;
            const fadeIn = phaseProgress < 0.15 ? phaseProgress / 0.15 : phaseProgress > 0.85 ? (1 - phaseProgress) / 0.15 : 1;
            const phases = [
              { title: 'The Fundamental Theorem of Calculus', sub: 'The deepest connection in all of mathematics' },
              { title: 'Watch area accumulate as t grows', sub: 'The shaded region expands — each moment adds more area' },
              { title: 'The lower curve traces F(t) = ∫₀ᵗ f(x) dx', sub: 'Every point records the total area gathered so far' },
              { title: 'The slope of F equals f', sub: 'How fast area accumulates = the function\'s current height' },
              { title: 'd/dt ∫₀ᵗ f(x) dx = f(t)', sub: 'Differentiation and integration are inverse operations' },
            ];
            const { title, sub } = phases[phase];
            return (
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  opacity: fadeIn,
                  transition: 'opacity 0.1s',
                  zIndex: 10,
                  background: 'rgba(10,14,39,0.82)',
                  border: '1px solid rgba(34,211,238,0.25)',
                  borderRadius: 12,
                  padding: '12px 24px',
                  maxWidth: 480,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <div style={{ color: '#22d3ee', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                  {title}
                </div>
                <div style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  {sub}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === phase ? '#22d3ee' : 'rgba(34,211,238,0.25)' }} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Readout */}
        <div style={{ opacity: 0, animation: 'fade-in 0.3s ease-out 1.0s forwards' }}>
          <Readout />
        </div>

        {/* Riemann Slider */}
        {activeMode === 'riemann' && (
          <div style={{ opacity: 0, animation: 'fade-in 0.3s ease-out 1.0s forwards' }}>
            <RiemannSlider />
          </div>
        )}

        {/* Action Controls */}
        <div style={{ opacity: 0, animation: 'fade-in 0.3s ease-out 1.1s forwards' }}>
          <Controls state={getControlsState()} />
        </div>

        {/* Analysis Log */}
        <div
          className="px-3 sm:px-6"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            opacity: 0,
            animation: 'fade-in 0.3s ease-out 1.2s forwards',
          }}
        >
          <AnalysisLog entries={logEntries} />
        </div>

        {/* Educational Cards */}
        <div
          className="px-3 sm:px-6"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            opacity: 0,
            animation: 'fade-in 0.3s ease-out 1.3s forwards',
          }}
        >
          <EducationalCards />
        </div>

        <Footer />
      </div>
    </div>
  );
}
