import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';
import { Empty, SubHeader } from '@/components/ui';
import { toman } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { AmountSheet } from './AmountSheet';

export function WalletPage() {
  const navigate = useNavigate();
  const { wallet, walletTx, withdraw } = useApp();
  const [withdrawing, setWithdrawing] = useState(false);
  return (
    <>
      <SubHeader title="کیف پول" backTo="/profile" />
      <div className="white-page">
        <div className="wallet-hero">
          <div className="k">موجودی نقدی</div>
          <div className="v">{toman(wallet.cash)}</div>
          <div className="s11">پول خسارت‌ها اینجا می‌نشیند و در خرید بعدی خودکار پیشنهاد می‌شود.</div>
        </div>
        <button className="btn-secondary" style={{ margin: '12px 0' }}
          onClick={() => (wallet.cash > 0 ? setWithdrawing(true) : toast('موجودی نقدی نداری'))}>برداشت از حساب</button>
        <div className="section-tag">مزایای نگهداری</div>
        <button className="inbl-promo" onClick={() => navigate('/inbl')}>
          <span className="promo-ic"><Icon name="gift2" size={17} /></span>
          <span className="tx"><b>با نگه‌داشتن موجودی، تخفیف و بیمه‌ی رایگان بگیر</b><br />ببین با چقدر سرمایه‌گذاری چی به‌دست می‌آری.</span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="section-tag">آخرین تراکنش‌ها</div>
        {walletTx.length ? walletTx.map((x, i) => (
          <div key={i} className="tx-row">
            <div className="l"><div className="t">{x.t}</div><div className="s">{x.d}</div></div>
            <div className="amt" style={{ color: x.in ? 'var(--forest)' : 'var(--ink)' }}>{x.in ? '+' : '−'}{toman(x.a)}</div>
          </div>
        )) : <Empty>هنوز تراکنشی نداری.</Empty>}
      </div>
      <AmountSheet open={withdrawing} title="برداشت از حساب" assetLabel="موجودی نقدی" max={wallet.cash} initial={500000}
        confirmLabel="ثبت درخواست برداشت" onClose={() => setWithdrawing(false)}
        onConfirm={(v) => { withdraw(v); setWithdrawing(false); toast('درخواست برداشت ثبت شد'); }} />
    </>
  );
}
