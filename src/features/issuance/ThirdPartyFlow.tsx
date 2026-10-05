import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ApiError, SALIS_COVER_MAX, SALIS_COVER_MIN, centralCode, issueAtCentral, quoteThirdParty,
} from '@/api/mock';
import type { Plate, Policy, Quote, VehicleType } from '@/api/types';
import { Icon } from '@/components/Icon';
import { IrPlate } from '@/components/IrPlate';
import { FlowProgress, Spinner, SuccessBadge, useBack } from '@/components/ui';
import { digitsOnly, faN, mmss, toman } from '@/lib/format';
import { DEFAULT_PLATES, isPlateComplete, plateText } from '@/lib/plate';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { Checkout, type CheckoutResult } from './Checkout';
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
  const navigate = useNavigate();
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

  const go = (n: number) => { setI(n); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const next = () => go(Math.min(i + 1, steps.length - 1));
  const back = () => (i === 0 || step === 'done' ? leave() : go(i - 1));

  const paid = async (r: CheckoutResult) => {
    if (!quote) return;
    const central = await issueAtCentral();
    const p = purchase({
      kind: 'salis', total: quote.total, useWallet: r.useWallet, investAmount: r.investAmount,
      car: vehicleType === 'moto' ? 'موتورسیکلت ' + quote.vehicle.brand : quote.vehicle.brand + ' ' + quote.vehicle.model,
      plate: plateText(plate, vehicleType), code: central.code, track: central.track,
      secs: Math.round((Date.now() - t0.current) / 1000), installments: r.installments,
    });
    setPolicy(p);
    next();
  };

  return (
    <>
      <div className="subheader">
        <button className="back" onClick={back} aria-label="بازگشت"><Icon name="back" /></button>
        <h2>{TITLES[step]}</h2>
        <button className="help-btn" onClick={() => navigate('/advisor')} aria-label="کمک">؟</button>
      </div>
      <FlowProgress total={steps.length} current={i} />
      <div className="flow-page"><div className="flow-body"><div className="fstep active">
        {step === 'quote' && (
          <QuoteStep
            vehicleType={vehicleType}
            setVehicleType={(t) => { setVehicleType(t); setPlate(DEFAULT_PLATES[t]); setQuote(null); }}
            plate={plate} setPlate={(p) => { setPlate(p); setQuote(null); }}
            nationalId={nationalId} setNationalId={(v) => { setNationalId(v); setQuote(null); }}
            cover={cover} setCover={(v) => { setCover(v); setQuote(null); }}
            quote={quote} setQuote={setQuote} onContinue={next}
          />
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
        {step === 'done' && policy && <DoneStep policy={policy} onPolicy={setPolicy} />}
      </div></div></div>
    </>
  );
}

function QuoteStep(props: {
  vehicleType: VehicleType; setVehicleType(t: VehicleType): void;
  plate: Plate; setPlate(p: Plate): void;
  nationalId: string; setNationalId(v: string): void;
  cover: number; setCover(v: number): void;
  quote: Quote | null; setQuote(q: Quote): void; onContinue(): void;
}) {
  const { vehicleType, plate, nationalId, cover, quote } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const toggleSanehab = useApp((s) => s.toggleDemo);
  const sanehabSlow = useApp((s) => s.demo.sanehab);
  const ready = isPlateComplete(plate, vehicleType) && nationalId.length === 10;

  const run = async () => {
    setLoading(true); setError(false);
    try {
      props.setQuote(await quoteThirdParty({ vehicleType, extraCover: cover }));
    } catch (e) {
      if (e instanceof ApiError) setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="seg-toggle">
        {(['car', 'moto'] as const).map((t) => (
          <button key={t} className={vehicleType === t ? 'on' : ''} onClick={() => props.setVehicleType(t)}>
            {t === 'car' ? 'خودرو' : 'موتور'}
          </button>
        ))}
      </div>
      <div className="field">
        <label>{vehicleType === 'moto' ? 'شماره پلاک موتور' : 'شماره پلاک'}</label>
        <IrPlate value={plate} type={vehicleType} onChange={props.setPlate} />
      </div>
      <div className="field">
        <label htmlFor="nid">کد ملی مالک</label>
        <input id="nid" className="input ltr-input" inputMode="numeric" value={faN(nationalId)}
          onChange={(e) => props.setNationalId(digitsOnly(e.target.value, 10))} />
      </div>
      <div className="field">
        <label htmlFor="cover">سقف تعهدات مالی اضافی ثالث</label>
        <input id="cover" type="range" min={SALIS_COVER_MIN} max={SALIS_COVER_MAX} step={10_000_000} value={cover}
          onChange={(e) => props.setCover(+e.target.value)} />
        <div className="range-scale"><span>۷۰ میلیون</span><span>۱.۴ میلیارد</span></div>
        <div className="range-value">{toman(cover)}</div>
      </div>

      {!quote && (
        <button className="btn-primary" disabled={!ready || loading} onClick={run}>
          {loading ? <><Spinner />در حال استعلام از سنهاب…</> : 'استعلام قیمت'}
        </button>
      )}
      {error && (
        <div className="alert-band">
          کندی در سامانه مرکزی.{' '}
          <button className="link-btn inline-link" onClick={() => { if (sanehabSlow) toggleSanehab('sanehab'); run(); }}>تلاش مجدد</button>
        </div>
      )}

      {quote && (
        <>
          <div className="price-card">
            <div className="small">{quote.vehicle.title}</div>
            <div className="big">{toman(quote.base)}</div>
            <div className="small">نرخ مصوب بیمه مرکزی برای سقف انتخابی</div>
          </div>
          <button className="info-toggle" aria-expanded={showInfo} onClick={() => setShowInfo(!showInfo)}>
            <span>مشخصات خودرو از سنهاب</span>
            <span className="s11">{showInfo ? 'بستن' : 'نمایش و ویرایش'}</span>
          </button>
          {showInfo && <VehicleInfo quote={quote} />}
          <button className="btn-primary" onClick={props.onContinue}>تایید و ادامه</button>
        </>
      )}
    </>
  );
}

function VehicleInfo({ quote }: { quote: Quote }) {
  const v = quote.vehicle;
  const [editing, setEditing] = useState(false);
  const rows: [string, string][] = [
    ['نوع', v.type], ['کاربری', v.usage], ['برند', v.brand], ['تیپ', v.model],
    ['نوع سوخت', v.fuel], ['سال', v.year], ['درصد تخفیف ثالث', v.thirdPartyDiscount], ['درصد تخفیف راننده', v.driverDiscount],
  ];
  if (editing) {
    return (
      <>
        <div className="field-grid">
          {rows.map(([k, val]) => (
            <div key={k} className="field"><label>{k}</label><input className="input" defaultValue={val} /></div>
          ))}
        </div>
        <div className="note-band">تغییرات بعد از پرداخت توسط کارشناس بررسی می‌شه.</div>
      </>
    );
  }
  return (
    <>
      <div className="autofill-form">
        {rows.map(([k, val]) => <div key={k} className="af-row"><span className="k">{k}</span><span className="v">{val}</span></div>)}
      </div>
      <button className="edit-link link-btn" onClick={() => setEditing(true)}>اطلاعات درست نیست؟ ویرایش می‌کنم</button>
    </>
  );
}

function DoneStep({ policy, onPolicy }: { policy: Policy; onPolicy(p: Policy): void }) {
  const navigate = useNavigate();
  const activate = useApp((s) => s.activatePolicy);
  const ok = policy.status === 'active';
  return (
    <>
      <SuccessBadge />
      <div className="center-text">
        <div className="h">{ok ? 'بیمه‌نامه شما صادر شد' : 'پرداخت شما ثبت شد'}</div>
        <div className="s">{ok ? 'کد یکتای بیمه مرکزی' : 'کد پیگیری موقت بامبو'}</div>
      </div>
      <div className="code-pill" dir="ltr">{ok ? policy.code : policy.track}</div>
      <div className="note-band">
        {ok
          ? <>زمان کل: <b>{mmss(policy.secs ?? 0)}</b> · پیامک حاوی لینک PDF ارسال شد.</>
          : 'بیمه مرکزی الان پاسخ نمی‌دهد. صدور در صف پردازش است و پیامک نهایی حداکثر تا ۳۰ دقیقه‌ی دیگر می‌رسد.'}
      </div>
      {!ok && (
        <button className="btn-secondary" onClick={() => {
          const code = centralCode();
          activate(policy.id, code);
          onPolicy({ ...policy, status: 'active', code });
          toast('پیامک نهایی با لینک PDF ارسال شد');
        }}>شبیه‌سازی: بیمه مرکزی وصل شد</button>
      )}
      <button className="btn-primary" onClick={() => toast('دانلود PDF در این نمونه شبیه‌سازی شده')}>دانلود PDF بیمه‌نامه</button>
      <button className="btn-secondary" onClick={() => navigate('/profile/contacts')}>افراد مورد اعتماد رو اضافه کن</button>
      <button className="btn-secondary" onClick={() => navigate('/insurances', { replace: true })}>مشاهده بیمه‌های من</button>
    </>
  );
}
