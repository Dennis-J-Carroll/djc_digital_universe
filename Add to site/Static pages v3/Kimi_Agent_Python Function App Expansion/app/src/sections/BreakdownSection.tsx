import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface BreakdownSectionProps {
  className?: string;
}

const labels = [
  { text: 'Function name', color: '#FFD166', position: 'left' },
  { text: 'Iterable', color: '#F4A6C3', position: 'center' },
  { text: 'Key argument', color: '#4B6BFB', position: 'right' },
];

export default function BreakdownSection({ className = '' }: BreakdownSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement[]>([]);
  const linesRef = useRef<SVGPathElement[]>([]);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const stampsRef = useRef<HTMLDivElement[]>([]);

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
        cardRef.current,
        { x: '60vw', opacity: 0, rotate: 4 },
        { x: 0, opacity: 1, rotate: 0, ease: 'none' },
        0.02
      );

      scrollTl.fromTo(
        codeRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'none' },
        0.1
      );

      labelsRef.current.forEach((label, i) => {
        scrollTl.fromTo(
          label,
          { y: '30vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.14 + i * 0.04
        );
      });

      linesRef.current.forEach((line, i) => {
        const length = line.getTotalLength ? line.getTotalLength() : 100;
        scrollTl.fromTo(
          line,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, ease: 'none' },
          0.14 + i * 0.04
        );
      });

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { scale: 0, rotate: -20, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, ease: 'none' },
          0.08 + i * 0.03
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
        cardRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '-40vw', rotate: -6, opacity: 0, ease: 'power2.in' },
        0.7
      );

      labelsRef.current.forEach((label, i) => {
        scrollTl.fromTo(
          label,
          { y: 0, opacity: 1 },
          { y: '20vh', opacity: 0, ease: 'power2.in' },
          0.72 + i * 0.02
        );
      });

      linesRef.current.forEach((line, i) => {
        scrollTl.fromTo(
          line,
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.75 + i * 0.02
        );
      });

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { opacity: 1 },
          { opacity: 0, ease: 'power2.in' },
          0.76 + i * 0.02
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 1, rotate: 0, opacity: 1 },
          { scale: 1.3, rotate: 25, opacity: 0, ease: 'power2.in' },
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

  const addToLabelsRef = (el: HTMLDivElement | null, index: number) => {
    if (el) labelsRef.current[index] = el;
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
      id="breakdown"
      className={`section-pinned bg-[#B7C4E8] ${className}`}
    >
      {/* Decorative Blocks */}
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[8vw] top-[14vh] w-[4vw] h-[4vw] bg-[#FFD166]"
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

      {/* Stamps */}
      <div
        ref={addToStampsRef}
        className="absolute left-[10vw] top-[72vh]"
      >
        <Star className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[80vw] top-[46vh]"
      >
        <Heart className="w-12 h-12 text-[#E94E77] fill-[#E94E77]" strokeWidth={3} />
      </div>

      {/* Section Title */}
      <h2
        ref={titleRef}
        className="absolute left-[10vw] top-[10vh] font-display font-black text-[clamp(34px,4.2vw,64px)] text-black uppercase"
      >
        Function Breakdown
      </h2>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="card-main absolute left-[18vw] top-[22vh] w-[64vw] h-[56vh]"
      >
        {/* Card Header */}
        <div className="card-header bg-[#E94E77] text-white">
          Anatomy of a Function Call
        </div>

        {/* Card Content */}
        <div className="p-[3vw] flex flex-col items-center justify-center h-[calc(56vh-8vh)]">
          {/* Big Code Line */}
          <div
            ref={codeRef}
            className="font-mono text-[clamp(18px,2.5vw,32px)] bg-[#F6D7C3] px-8 py-4 border-3 border-black rounded-xl"
          >
            <code>
              <span className="text-[#4B6BFB] font-bold">sorted</span>
              <span className="text-black">(data, key=</span>
              <span className="text-[#E94E77]">lambda</span>
              <span className="text-black"> x: x[</span>
              <span className="text-[#FFD166]">"score"</span>
              <span className="text-black">])</span>
            </code>
          </div>
        </div>
      </div>

      {/* Label Blocks with Leader Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Leader lines */}
        <path
          ref={(el) => { if (el) linesRef.current[0] = el; }}
          d="M 28vw 45vh L 28vw 62vh"
          className="leader-line"
        />
        <path
          ref={(el) => { if (el) linesRef.current[1] = el; }}
          d="M 50vw 45vh L 50vw 62vh"
          className="leader-line"
        />
        <path
          ref={(el) => { if (el) linesRef.current[2] = el; }}
          d="M 72vw 45vh L 72vw 62vh"
          className="leader-line"
        />
      </svg>

      {/* Label Blocks */}
      {labels.map((label, index) => {
        const leftPosition = 22 + index * 20;
        return (
          <div
            key={label.text}
            ref={(el) => addToLabelsRef(el, index)}
            className="absolute top-[62vh] border-3 border-black rounded-xl flex items-center justify-center"
            style={{
              left: `${leftPosition}vw`,
              width: '16vw',
              height: '10vh',
              backgroundColor: label.color,
            }}
          >
            <span className="font-display font-bold text-[clamp(13px,1.2vw,18px)] text-black">
              {label.text}
            </span>
          </div>
        );
      })}
    </section>
  );
}
