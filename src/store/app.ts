import { create } from 'zustand';
import type {
  Claim, Contact, DemoFlags, Installment, Payment, Policy, PolicyKind, WalletTx,
} from '@/api/types';
import { todayFa } from '@/lib/format';
import { seedClaims, seedContacts, seedInstallments, seedPayments, seedPolicies } from './seed';

export type Theme = 'dark' | 'light';

export interface PurchaseInput {
  kind: PolicyKind;
  total: number;
  useWallet: boolean;
  investAmount: number;
  car: string;
  plate: string;
  code: string | null;
  track: string;
  secs: number;
  installments?: { provider: string; count: number };
}

interface AppState {
  auth: boolean;
  user: { name: string; since: string; mobile: string };
  theme: Theme;
  demo: DemoFlags;
  wallet: { cash: number; invest: number };
  walletTx: WalletTx[];
  policies: Policy[];
  claims: Claim[];
  payments: Payment[];
  installments: Installment[];
  contacts: Contact[];

  setAuth(v: boolean): void;
  setTheme(t: Theme): void;
  toggleDemo(k: keyof DemoFlags): void;
  purchase(input: PurchaseInput): Policy;
  activatePolicy(id: string, code: string): void;
  cashOutInvest(amount: number): void;
  withdraw(amount: number): void;
  addContact(c: Omit<Contact, 'id' | 'status'>): void;
  updateContact(id: number, patch: Partial<Contact>): void;
  removeContact(id: number): void;
}

const initialTheme = (): Theme => {
  try {
    return localStorage.getItem('bamboo-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

export const POLICY_LABEL: Record<PolicyKind, string> = { salis: 'بیمه شخص ثالث', badane: 'بیمه بدنه' };

export const useApp = create<AppState>()((set, get) => ({
  auth: false,
  user: { name: 'محمد رضایی', since: '۱۴۰۵', mobile: '09121234567' },
  theme: initialTheme(),
  demo: { shahkar: false, sanehab: false, central: false, blur: false, oldCar: false, prevDep: false, tags: false },
  wallet: { cash: 1_200_000, invest: 3_000_000 },
  walletTx: [],
  policies: seedPolicies,
  claims: seedClaims,
  payments: seedPayments,
  installments: seedInstallments,
  contacts: seedContacts,

  setAuth: (auth) => set({ auth }),

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('bamboo-theme', theme);
    } catch {
      /* storage unavailable */
    }
    set({ theme });
  },

  toggleDemo: (k) => set((s) => ({ demo: { ...s.demo, [k]: !s.demo[k] } })),

  purchase: (p) => {
    const s = get();
    const label = POLICY_LABEL[p.kind];
    const walletUsed = p.useWallet ? Math.min(s.wallet.cash, p.total) : 0;
    const investUsed = Math.min(p.investAmount, p.total - walletUsed);
    const tx: WalletTx[] = [];
    if (p.investAmount) tx.push({ t: 'نقد کردن از لوتوس', d: todayFa(), a: p.investAmount, in: true });
    if (walletUsed || investUsed) tx.push({ t: 'خرید ' + label.replace('شخص ', ''), d: todayFa(), a: walletUsed + investUsed, in: false });

    const isBody = p.kind === 'badane';
    const policy: Policy = {
      id: 'p' + Date.now(),
      kind: p.kind,
      name: label,
      car: p.car,
      plate: p.plate,
      issued: todayFa(),
      expires: todayFa(365),
      status: isBody ? 'docs' : p.code ? 'active' : 'pending',
      premium: p.total,
      endorse: [],
      code: isBody ? null : p.code,
      track: p.track,
      secs: p.secs,
    };

    const rest = p.total - walletUsed - investUsed;
    const inst: Installment[] = p.installments
      ? [{
          t: `اقساط ${label} (${p.installments.provider})`,
          next: Math.round(rest / p.installments.count / 1000) * 1000,
          nextDate: todayFa(30),
          remaining: Math.round((rest * (p.installments.count - 1)) / p.installments.count / 1000) * 1000,
        }]
      : [];

    set({
      wallet: {
        cash: s.wallet.cash - walletUsed + (p.investAmount - investUsed),
        invest: s.wallet.invest - p.investAmount,
      },
      walletTx: [...tx.reverse(), ...s.walletTx],
      policies: [policy, ...s.policies],
      payments: [{ t: 'پرداخت ' + label, d: todayFa(), a: p.total }, ...s.payments],
      installments: [...inst, ...s.installments],
    });
    return policy;
  },

  activatePolicy: (id, code) =>
    set((s) => ({ policies: s.policies.map((p) => (p.id === id ? { ...p, status: 'active', code } : p)) })),

  cashOutInvest: (amount) =>
    set((s) => ({
      wallet: { cash: s.wallet.cash + amount, invest: s.wallet.invest - amount },
      walletTx: [{ t: 'نقد کردن از لوتوس', d: todayFa(), a: amount, in: true }, ...s.walletTx],
    })),

  withdraw: (amount) =>
    set((s) => ({
      wallet: { ...s.wallet, cash: s.wallet.cash - amount },
      walletTx: [{ t: 'برداشت از حساب', d: todayFa(), a: amount, in: false }, ...s.walletTx],
    })),

  addContact: (c) =>
    set((s) => (s.contacts.length >= 3 ? s : { contacts: [...s.contacts, { ...c, id: Date.now(), status: 'pending' }] })),

  updateContact: (id, patch) =>
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  removeContact: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
}));
