import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';
import { toman } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { AmountSheet, LOTUS_NOTE } from '@/features/wallet/AmountSheet';
import { PaySheet, type PayResult, type Rail } from './PaySheet';

export interface CheckoutResult extends PayResult { useWallet: boolean; investAmount: number }

/** Invoice + wallet/Lotus balance + payment rail. Shared by all purchase flows. */
export function Checkout({ lines, total, payLabel, zeroLabel = 'تسویه کامل با کیف‌پول و نهایی‌سازی', onPaid }: {
  lines: { label: string; value: string; disc?: boolean }[];
  total: number;
  payLabel: string;
  zeroLabel?: string;
  onPaid(r: CheckoutResult): void;
}) {
  const navigate = useNavigate();
  const wallet = useApp((s) => s.wallet);
  // Improvement over the prototype: wallet balance is applied by default.
  const [useWallet, setUseWallet] = useState(wallet.cash > 0);
  const [invest, setInvest] = useState(0);
  const [rail, setRail] = useState<Rail | null>(null);
  const [investOpen, setInvestOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const applied = (useWallet ? wallet.cash : 0) + invest;
  const delta = Math.max(0, total - applied);
  const finish = (r: PayResult) => { setPayOpen(false); onPaid({ ...r, useWallet, investAmount: invest }); };

  const pay = () => {
    if (delta === 0) return finish({ method: 'کیف پول' });
    if (!rail) return toast('اول روش پرداخت رو انتخاب کن');
    setPayOpen(true);
  };

  return (
    <>
      <div className="invoice-card">
        {lines.map((l) => (
          <div key={l.label} className={`inv-row ${l.disc ? 'disc' : ''}`}><span>{l.label}</span><span>{l.value}</span></div>
        ))}
        <div className="inv-row total"><span>مبلغ فاکتور</span><span>{toman(total)}</span></div>
      </div>

      <div className="balance-box">
        <div className="check-row" role="checkbox" aria-checked={useWallet} tabIndex={0} onClick={() => setUseWallet(!useWallet)}>
          <div className={`checkbox ${useWallet ? 'on' : ''}`}><Icon name="check" size={13} /></div>
          <div className="lbl">استفاده از موجودی نقدی کیف پول</div>
          <div className="amt">{toman(wallet.cash)}</div>
        </div>
        <button className="invest-link" onClick={() => (wallet.invest > 0 ? setInvestOpen(true) : toast('سرمایه‌ای برای نقد کردن نداری'))}>
          {invest ? `${toman(invest)} از لوتوس اضافه شد` : 'افزایش موجودی از محل سرمایه‌گذاری لوتوس'}
          <span className="chev"><Icon name="chevron" size={14} /></span>
        </button>
        <div className="delta-box"><div className="k">مبلغ قابل پرداخت نهایی</div><div className="v">{toman(delta)}</div></div>
      </div>

      {delta > 0 && (
        <div>
          {([
            ['cash', 'card', 'نقدی (درگاه بانکی)', 'اتصال مستقیم به سریع‌ترین درگاه'],
            ['bnpl', 'calendar', 'اقساطی — تارا / دیجی‌پی', 'استعلام آنی اعتبار'],
          ] as const).map(([k, ic, t, s]) => (
            <button key={k} className={`rail-option ${rail === k ? 'selected' : ''}`} onClick={() => setRail(k)}>
              <div className="ic"><Icon name={ic} /></div><div><div className="t">{t}</div><div className="s">{s}</div></div>
            </button>
          ))}
        </div>
      )}
      {delta > 0 && applied > 0 && rail && (
        <div className="split-note show">
          {toman(applied)} از موجودی/سرمایه‌گذاری کسر شد؛ {toman(delta)} باقی‌مانده از طریق {rail === 'cash' ? 'درگاه بانکی' : 'اقساط تارا/دیجی‌پی'} پرداخت می‌شود.
        </div>
      )}

      <button className="inbl-promo" onClick={() => navigate('/inbl')}>
        <span className="promo-ic"><Icon name="gift2" size={16} /></span>
        <span className="tx">با <b>۵٬۰۰۰٬۰۰۰ تومان</b> در کیف‌پول متصل، این خرید ۲۰٪ ارزون‌تر می‌شد.</span>
        <Icon name="chevron" size={14} />
      </button>

      <button className="btn-primary" onClick={pay}>{delta === 0 ? zeroLabel : payLabel}</button>

      <AmountSheet open={investOpen} title="افزایش موجودی از سرمایه‌گذاری" assetLabel="ارزش فعلی دارایی در لوتوس پارسیان"
        max={wallet.invest} initial={invest || 1000000} note={LOTUS_NOTE} confirmLabel="تایید و افزودن به کیف پول"
        onClose={() => setInvestOpen(false)} onConfirm={(v) => { setInvest(v); setInvestOpen(false); }} />
      {rail && <PaySheet open={payOpen} rail={rail} amount={delta} onClose={() => setPayOpen(false)} onPaid={finish} />}
    </>
  );
}
