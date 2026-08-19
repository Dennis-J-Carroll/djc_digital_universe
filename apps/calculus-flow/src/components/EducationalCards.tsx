import { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Card {
  title: string;
  latex: string;
  display?: boolean;
  description: string;
  tag: string;
}

interface Category {
  icon: string;
  label: string;
  cards: Card[];
}

function KaTeXFormula({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: display,
    trust: false,
  });
  return (
    <span
      className={display ? 'block' : 'inline'}
      style={{ color: '#22d3ee' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const CATEGORIES: Category[] = [
  {
    icon: '\u{1F4D0}',
    label: 'LIMIT DEFINITIONS',
    cards: [
      {
        title: 'Epsilon-Delta Definition',
        latex: '\\lim_{x\\to c} f(x) = L \\iff \\forall\\varepsilon>0,\\; \\exists\\delta>0 : 0<|x-c|<\\delta \\Rightarrow |f(x)-L|<\\varepsilon',
        display: true,
        description: 'For every epsilon neighborhood around L, there exists a delta neighborhood around c such that all x within delta of c (except c itself) map to values within epsilon of L.',
        tag: 'Limit Definitions',
      },
      {
        title: 'Squeeze Theorem',
        latex: '\\text{If } g(x) \\le f(x) \\le h(x) \\text{ and } \\lim g(x) = \\lim h(x) = L, \\text{ then } \\lim f(x) = L',
        display: true,
        description: 'When a function is trapped between two functions that approach the same limit, it must also approach that limit.',
        tag: 'Limit Definitions',
      },
      {
        title: 'Continuity',
        latex: 'f \\text{ continuous at } c \\iff \\lim_{x\\to c} f(x) = f(c)',
        display: true,
        description: 'A function is continuous at a point when its limit equals its value there — you can draw it without lifting your pencil.',
        tag: 'Limit Definitions',
      },
    ],
  },
  {
    icon: '\u{1F4CA}',
    label: 'RIEMANN SUMS',
    cards: [
      {
        title: 'Left Riemann Sum',
        latex: 'L_n = \\sum_{i=0}^{n-1} f(x_i) \\cdot \\Delta x',
        display: true,
        description: 'Uses the left endpoint of each subinterval to determine rectangle height. Tends to underestimate increasing functions and overestimate decreasing functions.',
        tag: 'Riemann Sums',
      },
      {
        title: 'Right Riemann Sum',
        latex: 'R_n = \\sum_{i=1}^{n} f(x_i) \\cdot \\Delta x',
        display: true,
        description: 'Uses the right endpoint of each subinterval. Tends to overestimate increasing functions and underestimate decreasing functions.',
        tag: 'Riemann Sums',
      },
      {
        title: 'Midpoint Riemann Sum',
        latex: 'M_n = \\sum_{i=1}^{n} f\\!\\left(\\dfrac{x_{i-1}+x_i}{2}\\right) \\cdot \\Delta x',
        display: true,
        description: 'Uses the midpoint of each subinterval. Generally the most accurate of the three basic Riemann sum methods for the same n.',
        tag: 'Riemann Sums',
      },
      {
        title: 'Definite Integral as Limit',
        latex: '\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} \\sum_{i=1}^{n} f(x_i^*) \\cdot \\Delta x',
        display: true,
        description: 'The definite integral is the limit of Riemann sums as the number of rectangles approaches infinity and their width approaches zero.',
        tag: 'Riemann Sums',
      },
    ],
  },
  {
    icon: '\u{1F4C8}',
    label: 'DERIVATIVES',
    cards: [
      {
        title: 'Limit Definition of Derivative',
        latex: "f'(x) = \\lim_{h\\to 0} \\dfrac{f(x+h) - f(x)}{h}",
        display: true,
        description: 'The derivative is the limit of the difference quotient — the slope of the secant line as the two points collapse into one.',
        tag: 'Derivatives',
      },
      {
        title: 'Power Rule',
        latex: '\\dfrac{d}{dx}\\left[x^n\\right] = n\\cdot x^{n-1}',
        display: true,
        description: 'Bring the exponent down as a coefficient, then subtract one from the exponent. The most frequently used differentiation rule.',
        tag: 'Derivatives',
      },
      {
        title: 'Chain Rule',
        latex: "\\dfrac{d}{dx}\\left[f(g(x))\\right] = f'(g(x)) \\cdot g'(x)",
        display: true,
        description: 'When differentiating a composition of functions, differentiate the outer function (keeping the inner) and multiply by the derivative of the inner function.',
        tag: 'Derivatives',
      },
      {
        title: 'Product Rule',
        latex: "\\dfrac{d}{dx}\\left[f(x)\\cdot g(x)\\right] = f'(x)\\cdot g(x) + f(x)\\cdot g'(x)",
        display: true,
        description: 'The derivative of a product is the derivative of the first times the second plus the first times the derivative of the second.',
        tag: 'Derivatives',
      },
    ],
  },
  {
    icon: '∫',
    label: 'INTEGRALS',
    cards: [
      {
        title: 'Power Rule for Integration',
        latex: '\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C \\qquad (n \\neq -1)',
        display: true,
        description: 'Increase the exponent by one and divide by the new exponent. The reverse of the differentiation power rule.',
        tag: 'Integrals',
      },
      {
        title: 'Substitution Rule',
        latex: "\\int f(g(x))\\cdot g'(x)\\,dx = \\int f(u)\\,du \\qquad u = g(x)",
        display: true,
        description: "A change of variables technique. Let u equal the inner function, then substitute du for g'(x)dx to simplify the integral.",
        tag: 'Integrals',
      },
      {
        title: 'Integration by Parts',
        latex: '\\int u\\,dv = u\\cdot v - \\int v\\,du',
        display: true,
        description: 'The integral analog of the product rule. Choose u to be a function that simplifies when differentiated, and dv to be something you can integrate.',
        tag: 'Integrals',
      },
    ],
  },
  {
    icon: '⇄',
    label: 'FUNDAMENTAL THEOREM',
    cards: [
      {
        title: 'FTC Part I',
        latex: '\\dfrac{d}{dx}\\int_a^x f(t)\\,dt = f(x)',
        display: true,
        description: 'If you define a function as the accumulated area under a curve from a fixed point to x, then the derivative of that function gives you back the original curve.',
        tag: 'Fundamental Theorem',
      },
      {
        title: 'FTC Part II',
        latex: "\\int_a^b f(x)\\,dx = F(b) - F(a) \\qquad \\text{where } F' = f",
        display: true,
        description: 'To evaluate a definite integral, find any antiderivative F, then subtract its value at the lower bound from its value at the upper bound.',
        tag: 'Fundamental Theorem',
      },
      {
        title: 'Net Change Theorem',
        latex: "\\int_a^b F'(x)\\,dx = F(b) - F(a)",
        display: true,
        description: "The integral of a rate of change gives the net change. If F'(x) is velocity, then the integral gives displacement.",
        tag: 'Fundamental Theorem',
      },
    ],
  },
];

function EducationalCard({ card }: { card: Card }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="glass-card"
      style={{
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#22d3ee';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(34, 211, 238, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1a2248';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-body font-medium uppercase px-2 py-0.5"
              style={{
                background: 'rgba(34, 211, 238, 0.08)',
                color: '#22d3ee',
                borderRadius: 9999,
                letterSpacing: '0.02em',
              }}
            >
              {card.tag}
            </span>
          </div>
          <h3
            className="font-heading text-[14px] font-semibold uppercase mb-2"
            style={{ color: '#e2e8f0', letterSpacing: '0.04em' }}
          >
            {card.title}
          </h3>
          <div className="katex-formula overflow-x-auto py-1">
            <KaTeXFormula latex={card.latex} display={card.display} />
          </div>
        </div>
        <span
          className="text-lg mt-1 shrink-0"
          style={{
            color: '#94a3b8',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-block',
          }}
        >
          &#9662;
        </span>
      </div>
      <div
        style={{
          maxHeight: expanded ? 300 : 0,
          opacity: expanded ? 1 : 0,
          overflow: 'hidden',
          transition: expanded
            ? 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            : 'max-height 250ms cubic-bezier(0.4, 0, 1, 1), opacity 250ms cubic-bezier(0.4, 0, 1, 1)',
        }}
      >
        <p
          className="font-body text-[14px] leading-relaxed pt-3"
          style={{ color: '#94a3b8' }}
        >
          {card.description}
        </p>
      </div>
    </div>
  );
}

export default function EducationalCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mx-auto"
      style={{ maxWidth: 900, marginTop: 32, paddingBottom: 64 }}
    >
      <div
        className="text-center mb-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}
      >
        <h2
          className="font-heading text-[14px] font-semibold uppercase inline-flex items-center gap-2"
          style={{ color: '#94a3b8', letterSpacing: '0.08em' }}
        >
          <span style={{ color: '#22d3ee' }}>&#x222B;</span>
          LIMIT DEFINITIONS &amp; CALCULUS THEOREMS
        </h2>
      </div>

      <div className="flex flex-col gap-8">
        {CATEGORIES.map((category, catIdx) => (
          <div key={category.label}>
            <h3
              className="font-heading text-[13px] font-semibold uppercase mb-4 flex items-center gap-2"
              style={{
                color: '#64748b',
                letterSpacing: '0.06em',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 0.4s ease-out ${catIdx * 0.1}s, transform 0.4s ease-out ${catIdx * 0.1}s`,
              }}
            >
              <span>{category.icon}</span>
              {category.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.cards.map((card, cardIdx) => (
                <div
                  key={card.title}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.4s ease-out ${(catIdx * 0.1) + (cardIdx * 0.06)}s, transform 0.4s ease-out ${(catIdx * 0.1) + (cardIdx * 0.06)}s`,
                  }}
                >
                  <EducationalCard card={card} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
