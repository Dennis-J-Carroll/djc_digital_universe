import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Zap, Heart, RotateCcw } from 'lucide-react';
import { getTodaysFunction } from '../data/pythonFunctions';

gsap.registerPlugin(ScrollTrigger);

interface LiveExampleSectionProps {
  className?: string;
}

export default function LiveExampleSection({ className = '' }: LiveExampleSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const codeCardRef = useRef<HTMLDivElement>(null);
  const outputCardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const stampsRef = useRef<HTMLDivElement[]>([]);

  const [hasRun, setHasRun] = useState(false);
  const todaysFunction = getTodaysFunction();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE phase (0% - 30%)
      scrollTl.fromTo(
        titleRef.current,
        { y: '-8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      scrollTl.fromTo(
        codeCardRef.current,
        { x: '-60vw', opacity: 0, rotate: -3 },
        { x: 0, opacity: 1, rotate: 0, ease: 'none' },
        0.02
      );

      scrollTl.fromTo(
        outputCardRef.current,
        { x: '60vw', opacity: 0, rotate: 3 },
        { x: 0, opacity: 1, rotate: 0, ease: 'none' },
        0.06
      );

      scrollTl.fromTo(
        buttonRef.current,
        { y: '20vh', scale: 0.8, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, ease: 'none' },
        0.14
      );

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { scale: 0, rotate: -18, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, ease: 'none' },
          0.1 + i * 0.03
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 0, rotate: -20, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, ease: 'back.out(1.8)' },
          0.12 + i * 0.04
        );
      });

      // SETTLE phase (30% - 70%) - elements hold position

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(
        codeCardRef.current,
        { y: 0, opacity: 1 },
        { y: '-20vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        outputCardRef.current,
        { y: 0, opacity: 1 },
        { y: '-20vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(
        buttonRef.current,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.74
      );

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { x: 0, rotate: 0, opacity: 1 },
          { x: '10vw', rotate: 18, opacity: 0, ease: 'power2.in' },
          0.76 + i * 0.02
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 1, rotate: 0, opacity: 1 },
          { scale: 1.2, rotate: 25, opacity: 0, ease: 'power2.in' },
          0.78 + i * 0.02
        );
      });

      scrollTl.fromTo(
        titleRef.current,
        { y: 0, opacity: 1 },
        { y: '-6vh', opacity: 0, ease: 'power2.in' },
        0.8
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleRun = () => {
    setHasRun(true);
  };

  const handleReset = () => {
    setHasRun(false);
  };

  const addToBlocksRef = (el: HTMLDivElement | null) => {
    if (el && !blocksRef.current.includes(el)) {
      blocksRef.current.push(el);
    }
  };

  const addToStampsRef = (el: HTMLDivElement | null) => {
    if (el && !stampsRef.current.includes(el)) {
      stampsRef.current.push(el);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="live-example"
      className={`section-pinned bg-[#B7C4E8] ${className}`}
    >
      {/* Decorative Blocks */}
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[6vw] top-[14vh] w-[4vw] h-[4vw] bg-[#FFD166]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[84vw] top-[62vh] w-[5vw] h-[5vw] bg-[#4B6BFB]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[78vw] top-[26vh] w-[6vw] h-[10vh] bg-[#C9E8D8]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[80vw] top-[76vh] w-[8vw] h-[6vh] bg-[#F4A6C3]"
        style={{ borderRadius: '8px' }}
      />

      {/* Stamps */}
      <div
        ref={addToStampsRef}
        className="absolute left-[86vw] top-[18vh]"
      >
        <Zap className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[48vw] top-[82vh]"
      >
        <Heart className="w-12 h-12 text-[#E94E77] fill-[#E94E77]" strokeWidth={3} />
      </div>

      {/* Section Title */}
      <h2
        ref={titleRef}
        className="absolute left-[10vw] top-[10vh] font-display font-black text-[clamp(34px,4.2vw,64px)] text-black uppercase"
      >
        Live Example
      </h2>

      {/* Code Card */}
      <div
        ref={codeCardRef}
        className="card-main absolute left-[10vw] top-[24vh] w-[38vw] h-[52vh]"
      >
        <div className="card-header bg-[#FFD166] text-black">Code</div>
        <div className="p-6 h-[calc(52vh-8vh)]">
          <pre className="code-block h-full overflow-auto text-[clamp(11px,0.9vw,13px)]">
            <code>{todaysFunction.example}</code>
          </pre>
        </div>
      </div>

      {/* Output Card */}
      <div
        ref={outputCardRef}
        className="card-main absolute left-[52vw] top-[24vh] w-[38vw] h-[52vh]"
      >
        <div className="card-header bg-[#F4A6C3] text-black">Output</div>
        <div className="p-6 h-[calc(52vh-8vh)] flex items-center justify-center">
          {hasRun ? (
            <pre className="code-block w-full h-full overflow-auto text-[clamp(11px,0.9vw,13px)] bg-[#C9E8D8]">
              <code>{todaysFunction.output || 'No output available'}</code>
            </pre>
          ) : (
            <div className="text-center text-[#2A2A2A]">
              <Play className="w-12 h-12 mx-auto mb-4 text-[#E94E77] opacity-50" />
              <p className="font-display font-bold text-lg">Click Run to see output</p>
            </div>
          )}
        </div>
      </div>

      {/* Run Button */}
      <button
        ref={buttonRef}
        onClick={hasRun ? handleReset : handleRun}
        className="btn-primary absolute left-[10vw] top-[80vh] w-[16vw] h-[7vh] flex items-center justify-center gap-2"
      >
        {hasRun ? (
          <>
            <RotateCcw className="w-5 h-5" />
            Reset
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Run
          </>
        )}
      </button>
    </section>
  );
}
