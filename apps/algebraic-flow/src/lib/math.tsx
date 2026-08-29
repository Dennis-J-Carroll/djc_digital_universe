import React from 'react';
import katex from 'katex';

interface TexProps {
  latex: string;
  display?: boolean;
  className?: string;
}

// Module-level cache: same LaTeX string rendered by multiple <Tex> instances
// shares one KaTeX call instead of recomputing per instance.
const katexCache = new Map<string, string>();

function renderLatex(latex: string, display: boolean): string {
  const key = `${display}:${latex}`;
  if (katexCache.has(key)) return katexCache.get(key)!;
  let html: string;
  try {
    html = katex.renderToString(latex, { displayMode: display, throwOnError: false, output: 'html' });
  } catch {
    html = `<span>${latex}</span>`;
  }
  katexCache.set(key, html);
  return html;
}

export const Tex: React.FC<TexProps> = ({ latex, display = false, className }) => {
  const html = renderLatex(latex, display);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Compatible with Term shape without creating a circular import
interface TermLike {
  type: string;
  value: number;
  variable?: string;
  exponent?: number;
}

/** Single term → LaTeX (negative sign included, no leading +) */
export function termToLatex(term: TermLike): string {
  const val = Math.abs(term.value);
  const neg = term.value < 0 ? '-' : '';
  if (term.type === 'constant') return `${neg}${val}`;
  const exp = term.exponent && term.exponent !== 1 ? `^{${term.exponent}}` : '';
  const coeff = val === 1 ? '' : String(val);
  return `${neg}${coeff}${term.variable}${exp}`;
}

/** Array of terms → LaTeX expression with proper signs */
export function termsToLatex(terms: TermLike[]): string {
  if (terms.length === 0) return '0';
  return terms
    .map((term, i) => {
      const val = Math.abs(term.value);
      const isNeg = term.value < 0;
      const sign = i === 0 ? (isNeg ? '-' : '') : isNeg ? ' - ' : ' + ';
      if (term.type === 'constant') return `${sign}${val}`;
      const exp = term.exponent && term.exponent !== 1 ? `^{${term.exponent}}` : '';
      const coeff = val === 1 ? '' : String(val);
      return `${sign}${coeff}${term.variable}${exp}`;
    })
    .join('');
}
