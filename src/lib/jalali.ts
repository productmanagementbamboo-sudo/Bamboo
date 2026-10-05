import { enN } from './format';

interface Parts { year: number; month: number; day: number }

function parts(d: Date): Parts {
  const o: Record<string, number> = {};
  new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' })
    .formatToParts(d)
    .forEach((p) => {
      if (p.type !== 'literal') o[p.type] = +p.value;
    });
  return { year: o.year, month: o.month, day: o.day };
}

const dayOfYear = (m: number, d: number) => (m <= 6 ? (m - 1) * 31 + d : 186 + (m - 7) * 30 + d);

/** Approximate days from today until a Jalali date string («۱۴۰۶/۰۴/۱۲»). */
export function daysUntil(jalali: string): number {
  const [y, m, d] = enN(jalali).split('/').map(Number);
  if (!y || !m || !d) return 0;
  const t = parts(new Date());
  return Math.max(0, (y - t.year) * 365 + dayOfYear(m, d) - dayOfYear(t.month, t.day));
}
