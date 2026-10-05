import { SubHeader } from '@/components/ui';
import { toman } from '@/lib/format';
import { useApp } from '@/store/app';

export function PaymentsPage() {
  const payments = useApp((s) => s.payments);
  return (
    <>
      <SubHeader title="پرداخت‌های من" backTo="/profile" />
      <div className="white-page">
        {payments.map((x, i) => (
          <div key={i} className="tx-row">
            <div className="l"><div className="t">{x.t}</div><div className="s">{x.d}</div></div>
            <div className="amt">{toman(x.a)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
