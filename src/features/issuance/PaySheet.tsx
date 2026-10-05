import { useEffect, useState } from 'react';
import { BNPL, checkBnpl } from '@/api/mock';
import type { BnplOffer, BnplProvider } from '@/api/types';
import { Sheet, Spinner } from '@/components/ui';
import { faN, toman } from '@/lib/format';

export type Rail = 'cash' | 'bnpl';
export interface PayResult { method: string; installments?: { provider: string; count: number } }

/** Mock bank gateway / BNPL credit check. */
export function PaySheet({ open, rail, amount, onClose, onPaid }: {
  open: boolean; rail: Rail; amount: number; onClose(): void; onPaid(r: PayResult): void;
}) {
  const [provider, setProvider] = useState<BnplProvider>('tara');
  const [phase, setPhase] = useState<'pick' | 'check' | 'ok'>('pick');
  const [offer, setOffer] = useState<BnplOffer | null>(null);

  useEffect(() => {
    if (open) { setPhase('pick'); setOffer(null); }
  }, [open]);

  const check = async () => {
    setPhase('check');
    setOffer(await checkBnpl(provider, amount));
    setPhase('ok');
  };

  if (rail === 'cash') {
    return (
      <Sheet open={open} title="درگاه پرداخت (نمونه)" onClose={onClose}>
        <div className="asset-row"><span>مبلغ قابل پرداخت</span><span className="v">{toman(amount)}</span></div>
        <div className="list-card" style={{ border: '1px solid var(--line)' }}>
          <div className="s11">شماره کارت</div>
          <div className="t13" dir="ltr" style={{ textAlign: 'right' }}>•••• •••• •••• ۱۲۳۴</div>
          <div className="s11" style={{ marginTop: 6 }}>رمز دوم و CVV2 در درگاه واقعی وارد می‌شود.</div>
        </div>
        <div className="btn-pair">
          <button className="btn-primary" onClick={() => onPaid({ method: 'نقدی' })}>پرداخت موفق</button>
          <button className="btn-secondary" onClick={onClose}>انصراف</button>
        </div>
      </Sheet>
    );
  }

  const p = BNPL[provider];
  return (
    <Sheet open={open} title="پرداخت اقساطی" onClose={onClose}>
      {phase === 'pick' && (
        <>
          <div className="asset-row"><span>مبلغ قابل پرداخت</span><span className="v">{toman(amount)}</span></div>
          <div className="chip-row" style={{ marginBottom: 12 }}>
            {(Object.keys(BNPL) as BnplProvider[]).map((k) => (
              <button key={k} className={`chip ${provider === k ? 'sel' : ''}`} onClick={() => setProvider(k)}>{BNPL[k].name}</button>
            ))}
          </div>
          <div className="s11">{p.desc}</div>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={check}>استعلام آنی اعتبار</button>
        </>
      )}
      {phase === 'check' && (
        <div className="center-text" style={{ padding: '26px 0' }}><div className="h"><Spinner />استعلام اعتبار از {p.name}…</div></div>
      )}
      {phase === 'ok' && offer && (
        <>
          <div className="ok-band">اعتبار تأیید شد. {faN(offer.count)} قسط {toman(offer.perInstallment)}ی، قسط اول امروز. (نمونه)</div>
          <button className="btn-primary" style={{ marginTop: 12 }}
            onClick={() => onPaid({ method: `قسطی (${p.name})`, installments: { provider: p.name, count: offer.count } })}>
            تأیید و ثبت پرداخت قسطی
          </button>
        </>
      )}
    </Sheet>
  );
}
