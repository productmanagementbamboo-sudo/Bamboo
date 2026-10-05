import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SubHeader } from '@/components/ui';
import { fmt, toman } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { AmountSheet, LOTUS_NOTE } from '@/features/wallet/AmountSheet';

export function InstallmentsPage() {
  const navigate = useNavigate();
  const { wallet, installments, cashOutInvest } = useApp();
  const [cashing, setCashing] = useState(false);
  return (
    <>
      <SubHeader title="دارایی و اقساط" backTo="/profile" />
      <div className="white-page">
        <div className="section-tag">موجودی کیف پول (نقدی، قابل استفاده آنی)</div>
        <div className="stat-card">
          <div><div className="k">موجودی نقدی</div><div className="v">{toman(wallet.cash)}</div></div>
          <button className="mini-btn" onClick={() => navigate('/wallet')}>کیف پول</button>
        </div>
        <div className="section-tag">سرمایه‌گذاری لوتوس پارسیان (نیازمند بازخرید، بدون بازده تضمین‌شده)</div>
        <div className="stat-card">
          <div><div className="k">ارزش فعلی دارایی</div><div className="v">{toman(wallet.invest)}</div></div>
          <button className="mini-btn" onClick={() => (wallet.invest > 0 ? setCashing(true) : toast('سرمایه‌ای برای نقد کردن نداری'))}>نقد کردن</button>
        </div>
        <div className="section-tag">اقساط باقی‌مانده (بدهی BNPL)</div>
        {installments.length ? installments.map((x, i) => (
          <div key={i} className="stat-card">
            <div><div className="k">{x.t}</div><div className="v">قسط بعدی {toman(x.next)}</div><div className="s11">مانده‌ی کل {fmt(x.remaining)} تومان</div></div>
            <div className="status pending">{x.nextDate}</div>
          </div>
        )) : <div className="s11">قسط فعالی نداری.</div>}
      </div>
      <AmountSheet open={cashing} title="افزایش موجودی از سرمایه‌گذاری" assetLabel="ارزش فعلی دارایی در لوتوس پارسیان"
        max={wallet.invest} initial={1000000} note={LOTUS_NOTE} confirmLabel="تایید و افزودن به کیف پول"
        onClose={() => setCashing(false)}
        onConfirm={(v) => { cashOutInvest(v); setCashing(false); toast(fmt(v) + ' تومان به کیف پول اضافه شد'); }} />
    </>
  );
}
