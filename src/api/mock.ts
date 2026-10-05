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
