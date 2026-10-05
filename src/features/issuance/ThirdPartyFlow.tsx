import { useRef, useState } from 'react';
import { ApiError, SALIS_COVER_MAX, SALIS_COVER_MIN, issueAtCentral, quoteThirdParty } from '@/api/mock';
import type { Plate, Policy, Quote, VehicleType } from '@/api/types';
import { FlowProgress, useBack } from '@/components/ui';
import { toman } from '@/lib/format';
import { DEFAULT_PLATES, isPlateComplete, plateText } from '@/lib/plate';
import { useApp } from '@/store/app';
import { Checkout, type CheckoutResult } from './Checkout';
import { FlowHeader, IssuedStep, QuoteButton, SanehabError, VehicleFields, VehicleInfoPanel } from './shared';
import { VerifyIdentity } from './VerifyIdentity';

// Prototype had 5 steps (quote → vehicle info → OTP → pay → done).
// Vehicle info now sits under the price on the quote step, and OTP is
// skipped for logged-in users: 4 steps for guests, 3 for members.
type Step = 'quote' | 'otp' | 'pay' | 'done';
const TITLES: Record<Step, string> = {
  quote: 'استعلام قیمت ثالث',
  otp: 'تایید هویت',
  pay: 'تسویه و پرداخت',
  done: 'صدور موفق',
};

export function ThirdPartyFlow() {
  const leave = useBack('/');
  const auth = useApp((s) => s.auth);
  const purchase = useApp((s) => s.purchase);

  const [steps] = useState<Step[]>(() => (auth ? ['quote', 'pay', 'done'] : ['quote', 'otp', 'pay', 'done']));
  const [i, setI] = useState(0);
  const step = steps[i];
  const t0 = useRef(Date.now());

  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [plate, setPlate] = useState<Plate>(DEFAULT_PLATES.car);
  const [nationalId, setNationalId] = useState('0012345678');
  const [cover, setCover] = useState(SALIS_COVER_MIN);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { sanehab } = useApp((s) => s.demo);
  const toggleDemo = useApp((s) => s.toggleDemo);

  const go = (n: number) => { setI(n); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const next = () => go(Math.min(i + 1, steps.length - 1));
  const back = () => (i === 0 || step === 'done' ? leave() : go(i - 1));
  const changed = <T,>(set: (v: T) => void) => (v: T) => { set(v); setQuote(null); };
  const ready = isPlateComplete(plate, vehicleType) && nationalId.length === 10;

  const runQuote = async () => {
    setLoading(true); setError(false);
    try {
      setQuote(await quoteThirdParty({ vehicleType, extraCover: cover }));
    } catch (e) {
      if (e instanceof ApiError) setError(true);
    } finally {
      setLoading(false);
    }
  };

  const paid = async (r: CheckoutResult) => {
    if (!quote) return;
    const central = await issueAtCentral();
    setPolicy(purchase({
      kind: 'salis', total: quote.total, useWallet: r.useWallet, investAmount: r.investAmount,
      car: vehicleType === 'moto' ? 'موتورسیکلت ' + quote.vehicle.brand : quote.vehicle.brand + ' ' + quote.vehicle.model,
      plate: plateText(plate, vehicleType), code: central.code, track: central.track,
      secs: Math.round((Date.now() - t0.current) / 1000), installments: r.installments,
    }));
    next();
  };

  return (
    <>
      <FlowHeader title={TITLES[step]} onBack={back} />
      <FlowProgress total={steps.length} current={i} />
      <div className="flow-page"><div className="flow-body"><div className="fstep active">
        {step === 'quote' && (
          <>
            <VehicleFields
              vehicleType={vehicleType} onType={(t) => { setVehicleType(t); setPlate(DEFAULT_PLATES[t]); setQuote(null); }}
              plate={plate} onPlate={changed(setPlate)} nationalId={nationalId} onNationalId={changed(setNationalId)}
            />
            <div className="field">
              <label htmlFor="cover">سقف تعهدات مالی اضافی ثالث</label>
              <input id="cover" type="range" min={SALIS_COVER_MIN} max={SALIS_COVER_MAX} step={10_000_000} value={cover}
                onChange={(e) => { setCover(+e.target.value); setQuote(null); }} />
              <div className="range-scale"><span>۷۰ میلیون</span><span>۱.۴ میلیارد</span></div>
              <div className="range-value">{toman(cover)}</div>
            </div>
            <QuoteButton show={!quote} ready={ready} loading={loading} onRun={runQuote} />
            {error && <SanehabError onRetry={() => { if (sanehab) toggleDemo('sanehab'); runQuote(); }} />}
            {quote && (
              <>
                <div className="price-card">
                  <div className="small">{quote.vehicle.title}</div>
                  <div className="big">{toman(quote.base)}</div>
                  <div className="small">نرخ مصوب بیمه مرکزی برای سقف انتخابی</div>
                </div>
                <VehicleInfoPanel quote={quote} />
                <button className="btn-primary" onClick={next}>تایید و ادامه</button>
              </>
            )}
          </>
        )}
        {step === 'otp' && <VerifyIdentity onVerified={next} />}
        {step === 'pay' && quote && (
          <Checkout
            total={quote.total}
            payLabel="پرداخت و نهایی‌سازی"
            lines={[
              { label: 'قیمت مصوب سنهاب', value: toman(quote.base) },
              { label: 'تخفیف کد BAMBOO10', value: '−' + toman(quote.discount), disc: true },
            ]}
            onPaid={paid}
          />
        )}
        {step === 'done' && policy && <IssuedStep policy={policy} onPolicy={setPolicy} />}
      </div></div></div>
    </>
  );
}
