// Mock implementation of the backend. Every function is async and has the
// signature the real HTTP client should keep, so pages never change when the
// backend arrives — only this file gets replaced.
import type { BnplOffer, BnplProvider, Quote, VehicleInfo, VehicleType } from './types';
import { randomDigits } from '@/lib/format';
import { useApp } from '@/store/app';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const demo = () => useApp.getState().demo;

export class ApiError extends Error {
  constructor(public code: 'SANEHAB_SLOW' | 'SHAHKAR_MISMATCH' | 'PAYMENT_FAILED', message: string) {
    super(message);
  }
}

const VEHICLES: Record<VehicleType, VehicleInfo> = {
  car: {
    type: 'سواری', usage: 'شخصی', brand: 'پژو', model: '۲۰۶ تیپ ۲', fuel: 'بنزینی', year: '۱۴۰۴',
    thirdPartyDiscount: '۷۰٪', driverDiscount: '۷۰٪', title: 'پژو ۲۰۶ تیپ ۲ · مدل ۱۴۰۴',
  },
  moto: {
    type: 'موتورسیکلت', usage: 'شخصی', brand: 'هوندا', model: 'کلاسیک ۲۰۰cc', fuel: 'بنزینی', year: '۱۴۰۴',
    thirdPartyDiscount: '۷۰٪', driverDiscount: '۷۰٪', title: 'کلاسیک ۲۰۰cc · مدل ۱۴۰۴',
  },
};

// ---- Third-party (ثالث) pricing ----
export const SALIS_COVER_MIN = 70_000_000;
export const SALIS_COVER_MAX = 1_400_000_000;
const SALIS_BASE: Record<VehicleType, number> = { car: 4_200_000, moto: 1_600_000 };
const PROMO_DISCOUNT = 0.1; // کد BAMBOO10

/** استعلام قیمت ثالث از سنهاب */
export async function quoteThirdParty(input: { vehicleType: VehicleType; extraCover: number }): Promise<Quote> {
  if (demo().sanehab) {
    await wait(5000);
    throw new ApiError('SANEHAB_SLOW', 'کندی در سامانه مرکزی.');
  }
  await wait(900);
  const factor = 1 + ((input.extraCover - SALIS_COVER_MIN) / (SALIS_COVER_MAX - SALIS_COVER_MIN)) * 0.4;
  const base = Math.round((SALIS_BASE[input.vehicleType] * factor) / 1000) * 1000;
  const discount = Math.round(base * PROMO_DISCOUNT);
  return { base, discount, total: base - discount, vehicle: VEHICLES[input.vehicleType] };
}

/** ارسال کد تایید */
export async function sendOtp(_mobile: string): Promise<void> {
  await wait(300);
}

/** تطبیق کد و شاهکار (موبایل به نام صاحب کد ملی) */
export async function verifyOtp(_mobile: string, _code: string): Promise<void> {
  await wait(1300);
  if (demo().shahkar) throw new ApiError('SHAHKAR_MISMATCH', 'شماره موبایل وارد شده باید به نام صاحب کد ملی باشد.');
}

/** ورود با OTP — در دمو هر کد ۴ رقمی قبول است */
export async function login(_mobile: string, _code: string): Promise<void> {
  await wait(1000);
}

export const BNPL: Record<BnplProvider, { name: string; count: number; desc: string }> = {
  tara: { name: 'تارا', count: 4, desc: '۴ قسط، بدون کارمزد' },
  dp: { name: 'دیجی‌پی', count: 6, desc: 'تا ۶ قسط' },
};

/** استعلام آنی اعتبار اقساطی */
export async function checkBnpl(provider: BnplProvider, amount: number): Promise<BnplOffer> {
  await wait(1500);
  const count = BNPL[provider].count;
  return { provider, count, perInstallment: Math.round(amount / count / 1000) * 1000 };
}

/** صدور در بیمه مرکزی؛ اگر قطع باشد فقط کد پیگیری داریم */
export async function issueAtCentral(): Promise<{ code: string | null; track: string }> {
  await wait(200);
  const track = 'BMB-' + randomDigits(6);
  return demo().central ? { code: null, track } : { code: centralCode(), track };
}

export const centralCode = () =>
  'IR-' + Math.random().toString(16).slice(2, 6).toUpperCase() + '-' + randomDigits(4);

// ---- Body (بدنه) pricing ----
/** Allowed insured-value range from a dealer price feed (sample). */
export const BODY_VALUE: Record<VehicleType, { low: number; high: number; step: number }> = {
  car: { low: 830_000_000, high: 870_000_000, step: 1_000_000 },
  moto: { low: 88_000_000, high: 96_000_000, step: 100_000 },
};
const BODY_RATE = 0.022; // premium as a share of insured value (sample)

export const BODY_ADDONS = [
  { k: 'war', t: 'خسارت ناشی از جنگ', price: 900_000 },
  { k: 'theft', t: 'سرقت درجای لوازم و قطعات', price: 1_300_000, default: true },
  { k: 'market', t: 'نوسانات ارزش بازار', price: 700_000 },
  { k: 'natural', t: 'حوادث طبیعی', sub: 'سیل، زلزله، آتش‌سوزی', price: 1_200_000, default: true },
  { k: 'chemical', t: 'پاشیدن مواد شیمیایی', price: 400_000 },
  { k: 'glass', t: 'شکست شیشه', price: 450_000 },
  { k: 'commute', t: 'ایاب و ذهاب', price: 600_000 },
  { k: 'scratch', t: 'خراش با اجسام تیز', price: 350_000 },
  { k: 'deduct', t: 'فرانشیز', price: 550_000 },
  { k: 'depreciation', t: 'استهلاک', price: 500_000 },
  { k: 'valueloss', t: 'افت قیمت', price: 650_000 },
] as const;
export type BodyAddon = (typeof BODY_ADDONS)[number]['k'];

export interface BodyQuote extends Quote { addons: number }

/** استعلام قیمت بدنه */
export async function quoteBody(input: { vehicleType: VehicleType; value: number; addons: BodyAddon[] }): Promise<BodyQuote> {
  if (demo().sanehab) {
    await wait(5000);
    throw new ApiError('SANEHAB_SLOW', 'کندی در سامانه مرکزی.');
  }
  await wait(900);
  const base = Math.round((input.value * BODY_RATE) / 10000) * 10000;
  const discount = Math.round(base * PROMO_DISCOUNT);
  const addons = BODY_ADDONS.filter((a) => input.addons.includes(a.k)).reduce((s, a) => s + a.price, 0);
  return { base, discount, addons, total: base + addons - discount, vehicle: VEHICLES[input.vehicleType] };
}

/** کنترل کیفیت عکس بازدید (نور، وضوح، کادر) */
export async function checkInspectionShot(index: number, alreadyFailed: boolean): Promise<boolean> {
  await wait(900);
  return !(demo().blur && !alreadyFailed && index === 1);
}

/** خواندن مدرک با OCR — یک فیلد عمداً با اطمینان کم برمی‌گردد */
export async function scanDocument(): Promise<{ firstName: string; lastName: string; licence: string | null }> {
  await wait(1300);
  return { firstName: 'محمد', lastName: 'رضایی', licence: null };
}

/** آپلود مدرک الحاقیه */
export async function uploadDocument(): Promise<void> {
  await wait(800);
}

// ---- Endorsement (الحاقیه) ----
export const END_COVER_MIN = 1_066_000_000;
export const END_COVER_MAX = 1_400_000_000;
const END_RATE = 0.0009; // extra premium per toman of raised cover, yearly (sample)

/** Pro-rated cost of raising the third-party cover for the days left. */
export function endorsementCost(newCover: number, daysLeft: number): number {
  return Math.max(0, Math.round(((newCover - END_COVER_MIN) * END_RATE * (daysLeft / 365)) / 1000) * 1000);
}

export async function submitEndorsement(): Promise<{ code: string }> {
  await wait(600);
  return { code: 'END-' + randomDigits(4) };
}
