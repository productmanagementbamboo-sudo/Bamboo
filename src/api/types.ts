// Domain types. These are the shapes the future backend API should return.

export type VehicleType = 'car' | 'moto';
export type PolicyKind = 'salis' | 'badane'; // ثالث | بدنه
export type PolicyStatus = 'active' | 'pending' | 'docs';

export interface Plate { seg1: string; letter: string; seg2: string; city: string }

export interface Endorsement { t: string; code: string; amount: number; status: 'done' | 'review' }

export interface Policy {
  id: string;
  kind: PolicyKind;
  name: string;
  car: string;
  plate: string;
  issued: string;   // Jalali
  expires: string;  // Jalali
  status: PolicyStatus;
  premium: number;
  endorse: Endorsement[];
  code?: string | null;   // کد یکتای بیمه مرکزی
  track?: string;         // کد پیگیری موقت بامبو
  secs?: number;          // time-to-issue, for the success screen
}

export type ClaimLink = 'wait' | 'paid' | 'rej';
export interface Claim {
  id: string;
  branch: 'fin' | 'bod';
  kind: PolicyKind;
  policyId: string;
  title: string;
  date: string;
  place: string;
  desc: string;
  finType?: 'car' | 'non';
  link?: ClaimLink;
  amount: number | null;
}

export interface Payment { t: string; d: string; a: number }
export interface WalletTx { t: string; d: string; a: number; in: boolean }
export interface Installment { t: string; next: number; nextDate: string; remaining: number }

export interface Contact {
  id: number;
  name: string;
  rel: string;
  phone: string;
  docs: boolean;
  sos: boolean;
  status: 'active' | 'pending';
}

export interface VehicleInfo {
  type: string; usage: string; brand: string; model: string;
  fuel: string; year: string; thirdPartyDiscount: string; driverDiscount: string;
  title: string;
}

export interface Quote { base: number; discount: number; total: number; vehicle: VehicleInfo }

export type BnplProvider = 'tara' | 'dp';
export interface BnplOffer { provider: BnplProvider; count: number; perInstallment: number }

/** Switches that force the error paths from the PRDs (demo only). */
export interface DemoFlags {
  shahkar: boolean;  // mobile ≠ national code owner
  sanehab: boolean;  // pricing service is slow
  central: boolean;  // central insurance is down after payment
  blur: boolean;
  oldCar: boolean;
  prevDep: boolean;
  tags: boolean;
}
