const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Latin digits → Persian digits. */
export const faN = (s: string | number): string => String(s).replace(/\d/g, (d) => FA_DIGITS[+d]);

/** Persian digits → Latin digits. */
export const enN = (s: string): string => s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));

/** Keep only Latin digits from user input (accepts Persian digits too). */
export const digitsOnly = (s: string, max?: number): string => {
  const d = enN(s).replace(/\D/g, '');
  return max ? d.slice(0, max) : d;
};

/** 4365000 → «۴,۳۶۵,۰۰۰» */
export const fmt = (n: number): string => faN(Math.round(n).toLocaleString('en-US'));

export const toman = (n: number): string => `${fmt(n)} تومان`;

/** 830000000 → «۸۳۰ میلیون», 1400000000 → «۱٫۴ میلیارد» */
export const fmtBig = (n: number): string => {
  if (n >= 1e9) return faN((n / 1e9).toFixed(2).replace(/\.?0+$/, '').replace('.', '٫')) + ' میلیارد';
  return faN(Math.round(n / 1e6)) + ' میلیون';
};

/** Seconds → «۰۲:۰۰» */
export const mmss = (s: number): string =>
  faN(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));

/** Jalali date string («۱۴۰۵/۰۷/۰۱») for today + offset days. */
export const todayFa = (offsetDays = 0): string =>
  new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(Date.now() + offsetDays * 864e5),
  );

export const isMobile = (s: string): boolean => /^09\d{9}$/.test(s);

/** «09121234567» → «۰۹۱۲***۴۵۶۷» */
export const maskMobile = (s: string): string => faN(s.slice(0, 4)) + '***' + faN(s.slice(-4));

export const randomDigits = (n: number): string =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
