import type { Plate, VehicleType } from '@/api/types';

export const DEFAULT_PLATES: Record<VehicleType, Plate> = {
  car: { seg1: '۴۷', letter: 'ب', seg2: '۴۳۶', city: '۴۰' },
  moto: { seg1: '۱۱۲', letter: '', seg2: '۴۵۶۷۸', city: '۴۰' },
};

export function plateText(p: Plate, type: VehicleType): string {
  return type === 'moto'
    ? `پلاک ${p.seg1}-${p.seg2} ایران ${p.city}`
    : `پلاک ${p.seg1} ${p.letter} ${p.seg2} ایران ${p.city}`;
}

export function isPlateComplete(p: Plate, type: VehicleType): boolean {
  if (type === 'moto') return p.seg1.length === 3 && p.seg2.length === 5;
  return p.seg1.length === 2 && p.letter.length === 1 && p.seg2.length === 3 && p.city.length === 2;
}

/** «پلاک ۱۲ ب ۳۴۵ ایران ۶۸» → «۱۲ ب ۳۴۵ ۶۸» for compact cards. */
export function plateShort(text: string): string {
  return text.replace('پلاک ', '').replace(' ایران', '');
}
