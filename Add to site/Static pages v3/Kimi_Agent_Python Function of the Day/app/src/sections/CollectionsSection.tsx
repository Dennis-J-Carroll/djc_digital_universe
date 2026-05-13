import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Zap, Heart, Star } from 'lucide-react';
import { collections, getFunctionsByCategory } from '../data/pythonFunctions';

gsap.registerPlugin(ScrollTrigger);

interface CollectionsSectionProps {
  className?: string;
}

export default function CollectionsSection({ className = '' }: CollectionsSectionProps) {
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
        { y: '-8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );

      cardsRef.current.forEach((card, i) => {
        scrollTl.fromTo(
          card,
          { y: '70vh', opacity: 0, rotate: -3 },
          { y: 0, opacity: 1, rotate: 0, ease: 'none' },
          0.06 + i * 0.04
        );
      });

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
      cardsRef.current.forEach((card, i) => {
        scrollTl.fromTo(
          card,
          { x: 0, rotate: 0, opacity: 1 },
          { x: '-20vw', rotate: 4, opacity: 0, ease: 'power2.in' },
          0.7 + i * 0.02
        );
      });

      blocksRef.current.forEach((block, i) => {
        scrollTl.fromTo(
          block,
          { y: 0, opacity: 1 },
          { y: '-10vh', opacity: 0, ease: 'power2.in' },
          0.74 + i * 0.02
        );
      });

      stampsRef.current.forEach((stamp, i) => {
        scrollTl.fromTo(
          stamp,
          { scale: 1, rotate: 0, opacity: 1 },
          { scale: 1.2, rotate: 25, opacity: 0, ease: 'power2.in' },
          0.76 + i * 0.02
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

  const scrollToArchive = (_category: string) => {
    const archiveSection = document.getElementById('archive');
    if (archiveSection) {
      archiveSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="collections"
      className={`section-pinned bg-[#B7C4E8] ${className}`}
    >
      {/* Decorative Blocks */}
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[6vw] top-[12vh] w-[4vw] h-[4vw] bg-[#FFD166]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[84vw] top-[60vh] w-[5vw] h-[5vw] bg-[#4B6BFB]"
        style={{ borderRadius: '8px' }}
      />
      <div
        ref={addToBlocksRef}
        className="block-decoration absolute left-[78vw] top-[24vh] w-[6vw] h-[10vh] bg-[#C9E8D8]"
        style={{ borderRadius: '8px' }}
      />

      {/* Stamps */}
      <div
        ref={addToStampsRef}
        className="absolute left-[86vw] top-[16vh]"
      >
        <Zap className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[48vw] top-[80vh]"
      >
        <Heart className="w-12 h-12 text-[#E94E77] fill-[#E94E77]" strokeWidth={3} />
      </div>
      <div
        ref={addToStampsRef}
        className="absolute left-[10vw] top-[70vh]"
      >
        <Star className="w-12 h-12 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
      </div>

      {/* Section Title */}
      <h2
        ref={titleRef}
        className="absolute left-[10vw] top-[10vh] font-display font-black text-[clamp(34px,4.2vw,64px)] text-black uppercase"
      >
        Collections
      </h2>

      {/* Collection Cards */}
      <div className="absolute top-[28vh] left-0 right-0 flex justify-center gap-[4vw]">
        {collections.slice(0, 3).map((collection, index) => {
          const funcCount = getFunctionsByCategory(collection.id).length;
          
          return (
            <div
              key={collection.id}
              ref={(el) => addToCardsRef(el, index)}
              className="collection-card w-[24vw] h-[46vh] flex flex-col cursor-pointer"
              onClick={() => scrollToArchive(collection.id)}
            >
              {/* Card Header */}
              <div
                className="card-header"
                style={{ backgroundColor: collection.color, color: 'black' }}
              >
                <span className="text-2xl mr-2">{collection.emoji}</span>
                {collection.name}
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Big Emoji */}
                <span className="text-[clamp(48px,5vw,72px)] leading-none mb-4">
                  {collection.emoji}
                </span>

                {/* Title */}
                <h3 className="font-display font-bold text-[clamp(20px,2vw,28px)] text-black mb-3">
                  {collection.name}
                </h3>

                {/* Description */}
                <p className="text-[clamp(13px,1vw,16px)] text-[#2A2A2A] leading-relaxed flex-1">
                  {collection.description}
                </p>

                {/* Function Count */}
                <p className="text-[clamp(12px,0.9vw,14px)] text-[#2A2A2A] mt-4 mb-4">
                  {funcCount} function{funcCount !== 1 ? 's' : ''}
                </p>

                {/* Link */}
                <button className="flex items-center gap-2 text-[#E94E77] font-medium text-[clamp(13px,1vw,16px)] hover:gap-3 transition-all">
                  Open set
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
