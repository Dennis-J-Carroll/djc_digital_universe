import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, Play, Brain, Zap, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksSectionProps {
  className?: string;
}

const steps = [
  {
    number: '01',
    title: 'Read',
    description: 'A short explanation + one real-world snippet.',
    icon: BookOpen,
    headerColor: '#FFD166',
  },
  {
    number: '02',
    title: 'Run',
    description: 'Copy into your editor or try it in the browser.',
    icon: Play,
    headerColor: '#F4A6C3',
  },
  {
    number: '03',
    title: 'Remember',
    description: 'Show up tomorrow for the next function.',
    icon: Brain,
    headerColor: '#4B6BFB',
  },
];

export default function HowItWorksSection({ className = '' }: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
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
        { y: '-10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      cardsRef.current.forEach((card, i) => {
        scrollTl.fromTo(
          card,
          { y: '60vh', opacity: 0, rotate: 3 },
          { y: 0, opacity: 1, rotate: 0, ease: 'none' },
          0.06 * i
        );
      });

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { scale: 0, rotate: -18, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, ease: 'none' },
          0.08 + i * 0.03
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 0, rotate: -25, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, ease: 'back.out(1.6)' },
          0.1 + i * 0.04
        );
      });

      // SETTLE phase (30% - 70%) - elements hold position

      // EXIT phase (70% - 100%)
      cardsRef.current.forEach((card, i) => {
        scrollTl.fromTo(
          card,
          { y: 0, rotate: 0, opacity: 1 },
          { y: '-30vh', rotate: -4, opacity: 0, ease: 'power2.in' },
          0.7 + i * 0.02
        );
      });

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { x: 0, rotate: 0, opacity: 1 },
          { x: '10vw', rotate: 18, opacity: 0, ease: 'power2.in' },
          0.72 + i * 0.02
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 1, rotate: 0, opacity: 1 },
          { scale: 1.2, rotate: 30, opacity: 0, ease: 'power2.in' },
          0.75 + i * 0.02
        );
      });

      scrollTl.fromTo(
        titleRef.current,
        { y: 0, opacity: 1 },
        { y: '-8vh', opacity: 0, ease: 'power2.in' },
        0.75
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const addToCardsRef = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el;
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
      id="how-it-works"
      className={`section-pinned bg-[#B7C4E8] ${className}`}
    >
      {/* Decorative Blocks */}
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[8vw] top-[8vh] w-[4vw] h-[4vw] bg-[#FFD166]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[84vw] top-[40vh] w-[5vw] h-[5vw] bg-[#4B6BFB]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[6vw] top-[78vh] w-[6vw] h-[10vh] bg-[#C9E8D8]"
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
        How It Works
      </h2>

      {/* Cards */}
      <div className="absolute top-[30vh] left-0 right-0 flex justify-center gap-[4vw]">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const leftPosition = 10 + index * 28;
          
          return (
            <div
              key={step.number}
              ref={(el) => addToCardsRef(el, index)}
              className="card-main w-[24vw] h-[44vh] flex flex-col"
              style={{ left: `${leftPosition}vw` }}
            >
              {/* Card Header */}
              <div
                className="card-header"
                style={{ backgroundColor: step.headerColor, color: 'white' }}
              >
                <Icon className="w-5 h-5 mr-2" />
                Step {step.number}
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Big Number */}
                <span className="font-display font-black text-[clamp(48px,5vw,72px)] text-black leading-none">
                  {step.number}
                </span>

                {/* Title */}
                <h3 className="mt-4 font-display font-bold text-[clamp(20px,2vw,28px)] text-black">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[clamp(13px,1vw,16px)] text-[#2A2A2A] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
