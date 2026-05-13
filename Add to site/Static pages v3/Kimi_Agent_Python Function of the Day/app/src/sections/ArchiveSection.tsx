import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, ArrowRight } from 'lucide-react';
import {
  categories,
  getFunctionsByCategory,
  searchFunctions,
} from '../data/pythonFunctions';

gsap.registerPlugin(ScrollTrigger);

interface ArchiveSectionProps {
  className?: string;
}

export default function ArchiveSection({ className = '' }: ArchiveSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunctions = searchQuery
    ? searchFunctions(searchQuery)
    : getFunctionsByCategory(activeFilter);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: '-6vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Filters animation
      const filterPills = filtersRef.current?.querySelectorAll('.filter-pill');
      if (filterPills) {
        gsap.fromTo(
          filterPills,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            scrollTrigger: {
              trigger: filtersRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Search animation
      gsap.fromTo(
        searchRef.current,
        { x: '6vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: searchRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Grid cards animation
      const cards = gridRef.current?.querySelectorAll('.archive-card');
      if (cards) {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: '10vh', opacity: 0, rotate: 1 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              duration: 0.5,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, [filteredFunctions]);

  return (
    <section
      ref={sectionRef}
      id="archive"
      className={`section-flowing bg-[#F4D06F] py-[8vh] ${className}`}
    >
      <div className="px-[10vw]">
        {/* Section Title */}
        <h2
          ref={titleRef}
          className="font-display font-black text-[clamp(34px,4.2vw,64px)] text-black uppercase mb-8"
        >
          Explore the Archive
        </h2>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Filter Pills */}
          <div ref={filtersRef} className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFilter(cat.id);
                  setSearchQuery('');
                }}
                className={`filter-pill ${
                  activeFilter === cat.id && !searchQuery ? 'active' : 'bg-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div ref={searchRef} className="relative md:ml-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A2A2A]" />
            <input
              type="text"
              placeholder="Search functions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full md:w-[28vw] h-[6vh] pl-12"
            />
          </div>
        </div>

        {/* Archive Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredFunctions.map((func) => (
            <div key={func.id} className="archive-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-[clamp(18px,1.5vw,24px)] text-black">
                    {func.name}
                  </h3>
                  <span className="text-[clamp(12px,0.9vw,14px)] text-[#2A2A2A] capitalize">
                    {func.module}
                  </span>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[clamp(11px,0.8vw,13px)] font-medium capitalize"
                  style={{
                    backgroundColor:
                      func.category === 'itertools'
                        ? '#FFD166'
                        : func.category === 'datetime'
                        ? '#F4A6C3'
                        : func.category === 'math'
                        ? '#E94E77'
                        : func.category === 'random'
                        ? '#4B6BFB'
                        : func.category === 'collections'
                        ? '#F6D7C3'
                        : func.category === 'functools'
                        ? '#C9E8D8'
                        : '#B7C4E8',
                    color: 'black',
                  }}
                >
                  {func.category}
                </span>
              </div>

              <p className="text-[clamp(13px,1vw,16px)] text-[#2A2A2A] mb-4 line-clamp-2">
                {func.description}
              </p>

              <div className="code-block py-3 px-4 text-[clamp(11px,0.85vw,13px)] mb-4">
                <code>{func.signature}</code>
              </div>

              <button className="flex items-center gap-2 text-[#E94E77] font-medium text-[clamp(13px,1vw,16px)] hover:gap-3 transition-all">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filteredFunctions.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display font-bold text-xl text-black">
              No functions found
            </p>
            <p className="text-[#2A2A2A] mt-2">
              Try a different search term or filter
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
