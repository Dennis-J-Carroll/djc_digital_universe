import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Term } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const toSuperscript = (num: number) => {
  const map: Record<string, string> = {0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹','-':'⁻'};
  return String(num).split('').map(d => map[d] || d).join('');
};

export const formatTerm = (t: Term, isFirst: boolean) => {
  const val = Math.abs(t.value);
  const sign = t.value >= 0 ? (isFirst ? '' : '+ ') : '- ';

  if (t.type === 'variable') {
    const expStr = (t.exponent && t.exponent !== 1) ? toSuperscript(t.exponent) : '';
    if (val === 1) return `${sign}${t.variable}${expStr}`;
    return `${sign}${val}${t.variable}${expStr}`;
  }
  return `${sign}${val}`;
};

