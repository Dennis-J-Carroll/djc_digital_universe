import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Heart, Star, Rss, Calendar, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SubscribeSectionProps {
  className?: string;
}

export default function SubscribeSection({ className = '' }: SubscribeSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const stampsRef = useRef<HTMLDivElement[]>([]);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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
        { scale: 0.85, opacity: 0, rotate: 2 },
        { scale: 1, opacity: 1, rotate: 0, ease: 'none' },
        0.02
      );

      const formFields = formRef.current?.querySelectorAll('.form-field');
      if (formFields) {
        formFields.forEach((field, i) => {
          scrollTl.fromTo(
            field,
            { y: '10vh', opacity: 0 },
            { y: 0, opacity: 1, ease: 'none' },
            0.1 + i * 0.04
          );
        });
      }

      scrollTl.fromTo(
        buttonRef.current,
        { x: '10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
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
        cardRef.current,
        { y: 0, opacity: 1 },
        { y: '-20vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        buttonRef.current,
        { scale: 1, opacity: 1 },
        { scale: 1.05, opacity: 0, ease: 'power2.in' },
        0.75
      );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
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
      id="subscribe"
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
        Get the Next Function
      </h2>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="card-main absolute left-[18vw] top-[22vh] w-[64vw] h-[56vh]"
      >
        {/* Card Header */}
        <div className="card-header bg-[#E94E77] text-white">
          Subscribe
        </div>

        {/* Card Content */}
        <div className="p-[3vw] flex flex-col justify-center h-[calc(56vh-8vh)]">
          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#C9E8D8] border-3 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-display font-bold text-[clamp(24px,2.5vw,36px)] text-black mb-3">
                You're subscribed!
              </h3>
              <p className="text-[clamp(14px,1.2vw,18px)] text-[#2A2A2A]">
                Check your inbox for today's function.
              </p>
            </div>
          ) : (
            <>
              <p className="form-field text-[clamp(14px,1.2vw,18px)] text-[#2A2A2A] mb-8">
                One email. No spam. Unsubscribe anytime.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="form-field flex-1">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full h-[7vh]"
                    required
                  />
                </div>
                <button
                  ref={buttonRef}
                  type="submit"
                  className="btn-primary w-full md:w-[18vw] h-[7vh] flex items-center justify-center"
                >
                  Subscribe
                </button>
              </form>

              {/* Secondary Options */}
              <div className="form-field flex items-center gap-6 mt-8">
                <a
                  href="#"
                  className="flex items-center gap-2 text-[#2A2A2A] hover:text-[#E94E77] transition-colors"
                >
                  <Rss className="w-4 h-4" />
                  <span className="text-[clamp(13px,1vw,16px)]">RSS feed</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-[#2A2A2A] hover:text-[#E94E77] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-[clamp(13px,1vw,16px)]">Add to calendar</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
