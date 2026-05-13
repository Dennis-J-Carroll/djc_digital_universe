import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getTodaysFunction } from '../data/pythonFunctions';
import { Zap, Heart, Star, ArrowRight, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const stampsRef = useRef<HTMLDivElement[]>([]);
  const handwrittenRef = useRef<HTMLSpanElement>(null);

  const todaysFunction = getTodaysFunction();

  // Auto-play entrance animation on load
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Card entrance
      tl.fromTo(
        cardRef.current,
        { y: '12vh', opacity: 0, rotate: -2 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.8 },
        0
      );

      // Header strip
      tl.fromTo(
        headerRef.current,
        { x: '-8vw', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5 },
        0.2
      );

      // Title
      tl.fromTo(
        titleRef.current,
        { y: '4vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.3
      );

      // Description
      tl.fromTo(
        descRef.current,
        { y: '3vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.4
      );

      // Code block
      tl.fromTo(
        codeBlockRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5 },
        0.35
      );

      // CTA button
      tl.fromTo(
        ctaRef.current,
        { y: '2vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.5
      );

      // Link
      tl.fromTo(
        linkRef.current,
        { y: '2vh', opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        0.55
      );

      // Decorative blocks
      blocksRef.current.forEach((block, i) => {
        tl.fromTo(
          block,
          { scale: 0, rotate: -20, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
          0.2 + i * 0.06
        );
      });

      // Stamps
      stampsRef.current.forEach((stamp, i) => {
        tl.fromTo(
          stamp,
          { scale: 0, rotate: -30 },
          { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.8)' },
          0.3 + i * 0.08
        );
      });

      // Handwritten label
      tl.fromTo(
        handwrittenRef.current,
        { x: '3vw', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4 },
        0.6
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll-driven exit animation
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
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back to top
            gsap.set(cardRef.current, { x: 0, rotate: 0, opacity: 1 });
            blocksRef.current.forEach(block => {
              gsap.set(block, { y: 0, rotate: 0, opacity: 1 });
            });
            stampsRef.current.forEach(stamp => {
              gsap.set(stamp, { scale: 1, rotate: 0, opacity: 1 });
            });
          },
        },
      });

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(
        cardRef.current,
        { x: 0, rotate: 0, opacity: 1 },
        { x: '-40vw', rotate: -6, opacity: 0, ease: 'power2.in' },
        0.7
      );

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { y: 0, rotate: 0, opacity: 1 },
          { y: '-10vh', rotate: 12, opacity: 0, ease: 'power2.in' },
          0.7 + i * 0.02
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 1, rotate: 0, opacity: 1 },
          { scale: 1.3, rotate: 25, opacity: 0, ease: 'power2.in' },
          0.75 + i * 0.02
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
      id="hero"
      className={`section-pinned bg-[#B7C4E8] ${className}`}
    >
      {/* Decorative Blocks */}
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[6vw] top-[10vh] w-[4.5vw] h-[4.5vw] bg-[#FFD166]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[10vw] top-[72vh] w-[5vw] h-[5vw] bg-[#4B6BFB]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[78vw] top-[20vh] w-[6vw] h-[10vh] bg-[#C9E8D8]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[82vw] top-[62vh] w-[5vw] h-[5vw] bg-[#F4A6C3]"
        style={{ borderRadius: '8px' }}
      />

      {/* Stamps */}
      <div
        ref={addToStampsRef}
        className="absolute left-[8vw] top-[26vh]"
      >
        <Zap className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[80vw] top-[46vh]"
      >
        <Heart className="w-12 h-12 text-[#E94E77] fill-[#E94E77]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[58vw] top-[76vh]"
      >
        <Star className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="card-main absolute left-[18vw] top-[18vh] w-[64vw] h-[56vh]"
      >
        {/* Card Header */}
        <div
          ref={headerRef}
          className="card-header bg-[#E94E77] text-white"
        >
          Today's Function
        </div>

        {/* Card Content */}
        <div className="p-[3vw] h-[calc(56vh-8vh)] flex flex-col">
          {/* Function Title */}
          <h1
            ref={titleRef}
            className="font-display font-black text-[clamp(32px,4vw,56px)] text-black leading-tight"
          >
            {todaysFunction.name}
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="mt-4 text-[clamp(14px,1.2vw,18px)] text-[#2A2A2A] max-w-[34vw] leading-relaxed"
          >
            {todaysFunction.description}
          </p>

          {/* Code Block */}
          <div
            ref={codeBlockRef}
            className="code-block absolute right-[3vw] top-[12vh] w-[20vw] min-h-[22vh]"
          >
            <code>{todaysFunction.example.split('\n').slice(0, 6).join('\n')}</code>
          </div>

          {/* Handwritten Label */}
          <span
            ref={handwrittenRef}
            className="font-handwriting text-[clamp(18px,1.8vw,26px)] text-[#E94E77] absolute right-[6vw] top-[36vh] rotate-[-8deg]"
          >
            Try it!
          </span>

          {/* CTA Button */}
          <button
            ref={ctaRef}
            onClick={() => scrollToSection('live-example')}
            className="btn-primary absolute left-[3vw] bottom-[12vh] w-[18vw] h-[7vh] flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Read the example
          </button>

          {/* Secondary Link */}
          <button
            ref={linkRef}
            onClick={() => scrollToSection('archive')}
            className="absolute left-[3vw] bottom-[5vh] text-[clamp(13px,1vw,16px)] font-medium text-[#2A2A2A] hover:text-[#E94E77] transition-colors flex items-center gap-1"
          >
            Browse the archive
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Static Logo (visible only on hero) */}
      <div className="absolute top-6 left-8 font-display font-black text-2xl text-black">
        PyDay
      </div>

      {/* Static Nav (visible only on hero) */}
      <div className="absolute top-6 right-8 hidden md:flex items-center gap-6">
        <button
          onClick={() => scrollToSection('archive')}
          className="nav-link"
        >
          Archive
        </button>
        <button
          onClick={() => scrollToSection('collections')}
          className="nav-link"
        >
          Collections
        </button>
        <button
          onClick={() => scrollToSection('footer')}
          className="nav-link"
        >
          About
        </button>
      </div>
    </section>
  );
}
