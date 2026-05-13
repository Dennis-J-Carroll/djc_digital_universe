import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Heart, Zap, Github, Twitter, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FooterSectionProps {
  className?: string;
}

export default function FooterSection({ className = '' }: FooterSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const stampsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(
        headlineRef.current,
        { y: '-4vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Content animation
      const contentElements = contentRef.current?.querySelectorAll('.content-item');
      if (contentElements) {
        gsap.fromTo(
          contentElements,
          { y: '3vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Links animation
      const linkElements = linksRef.current?.querySelectorAll('a');
      if (linkElements) {
        gsap.fromTo(
          linkElements,
          { y: '2vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            scrollTrigger: {
              trigger: linksRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Stamps animation
      gsap.fromTo(
        stampsRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: stampsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="footer"
      className={`section-flowing bg-[#B7C4E8] py-[8vh] ${className}`}
    >
      <div className="px-[10vw]">
        {/* Headline */}
        <h2
          ref={headlineRef}
          className="font-display font-black text-[clamp(34px,4vw,56px)] text-black mb-6"
        >
          Built for learners.
        </h2>

        {/* Content */}
        <div ref={contentRef} className="max-w-[60vw] mb-12">
          <p className="content-item text-[clamp(14px,1.2vw,18px)] text-[#2A2A2A] leading-relaxed mb-6">
            Python Function a Day is a tiny resource to help you write cleaner, 
            more expressive code—one function at a time. We believe that learning 
            happens best in small, consistent doses.
          </p>
          <p className="content-item text-[clamp(14px,1.2vw,18px)] text-[#2A2A2A] leading-relaxed">
            From built-in essentials to hidden gems in the standard library, 
            discover tools that will make your Python code more Pythonic.
          </p>
        </div>

        {/* Links */}
        <div
          ref={linksRef}
          className="flex flex-wrap items-center gap-8 mb-16"
        >
          <button
            onClick={() => scrollToSection('hero')}
            className="nav-link text-[clamp(14px,1.1vw,18px)]"
          >
            Today
          </button>
          <button
            onClick={() => scrollToSection('archive')}
            className="nav-link text-[clamp(14px,1.1vw,18px)]"
          >
            Archive
          </button>
          <button
            onClick={() => scrollToSection('collections')}
            className="nav-link text-[clamp(14px,1.1vw,18px)]"
          >
            Collections
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link text-[clamp(14px,1.1vw,18px)] flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
          <a
            href="mailto:hello@pyday.dev"
            className="nav-link text-[clamp(14px,1.1vw,18px)] flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Contact
          </a>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Copyright */}
          <p className="text-[clamp(12px,0.9vw,14px)] text-[#2A2A2A]">
            © 2026 Python Function a Day
          </p>

          {/* Stamps */}
          <div ref={stampsRef} className="flex items-center gap-4">
            <Star className="w-8 h-8 text-[#FFD166] fill-[#FFD166]" strokeWidth={2} />
            <Heart className="w-8 h-8 text-[#E94E77] fill-[#E94E77]" strokeWidth={2} />
            <Zap className="w-8 h-8 text-[#FFD166] fill-[#FFD166]" strokeWidth={2} />
          </div>

          {/* Social */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2A2A2A] hover:text-[#E94E77] transition-colors"
          >
            <Twitter className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
