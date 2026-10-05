import type { Claim, Contact, Installment, Payment, Policy } from '@/api/types';

// Sample data from the prototype; replaced by API responses later.
export const seedPolicies: Policy[] = [
  { id: 'p1', kind: 'salis', name: 'بیمه شخص ثالث', car: 'پژو ۲۰۶ تیپ ۲', plate: 'پلاک ۱۲ ب ۳۴۵ ایران ۶۸', issued: '۱۴۰۵/۰۴/۱۲', expires: '۱۴۰۶/۰۴/۱۲', status: 'active', premium: 4365000, endorse: [] },
  { id: 'p2', kind: 'badane', name: 'بیمه بدنه', car: 'پژو ۲۰۶ تیپ ۲', plate: 'پلاک ۱۲ ب ۳۴۵ ایران ۶۸', issued: '۱۴۰۵/۰۵/۰۱', expires: '۱۴۰۶/۰۵/۰۱', status: 'active', premium: 19260000, endorse: [] },
];

export const seedClaims: Claim[] = [
  { id: 'C-0412', branch: 'fin', kind: 'salis', policyId: 'p1', title: 'خسارت مالی، ماشین طرف مقابل', date: '۱۴۰۵/۰۶/۰۲', place: 'بزرگراه همت', desc: 'برخورد از پشت در ترافیک', finType: 'car', link: 'wait', amount: null },
  { id: 'C-0178', branch: 'fin', kind: 'salis', policyId: 'p1', title: 'خسارت مالی، ماشین طرف مقابل', date: '۱۴۰۵/۰۲/۱۸', place: 'خیابان ولیعصر', desc: '', finType: 'car', link: 'paid', amount: 14200000 },
];

export const seedPayments: Payment[] = [
  { t: 'پرداخت بیمه بدنه', d: '۱۴۰۵/۰۵/۰۱', a: 19260000 },
  { t: 'قسط اول ثالث', d: '۱۴۰۵/۰۴/۱۲', a: 850000 },
  { t: 'پرداخت بیمه ثالث', d: '۱۴۰۵/۰۴/۱۲', a: 4365000 },
];

export const seedInstallments: Installment[] = [
  { t: 'اقساط بیمه ثالث (تارا)', next: 850000, nextDate: '۱۴۰۵/۰۷/۱۰', remaining: 3400000 },
];

export const seedContacts: Contact[] = [
  { id: 1, name: 'مریم رضایی', rel: 'همسر', phone: '09121234567', docs: true, sos: true, status: 'active' },
];
