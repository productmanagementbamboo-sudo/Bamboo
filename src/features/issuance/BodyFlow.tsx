import { useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import {
  ApiError, BODY_ADDONS, BODY_VALUE, issueAtCentral, quoteBody, type BodyAddon, type BodyQuote,
} from '@/api/mock';
import type { Plate, Policy, VehicleType } from '@/api/types';
import { FlowProgress, ToggleRow, useBack } from '@/components/ui';
import { fmtBig, toman, todayFa } from '@/lib/format';
import { DEFAULT_PLATES, isPlateComplete, plateText } from '@/lib/plate';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { Checkout, type CheckoutResult } from './Checkout';
import { Inspection } from './Inspection';
import { OcrSheet } from './OcrSheet';
import { FlowHeader, IssuedStep, QuoteButton, SanehabError, VehicleFields, VehicleInfoPanel } from './shared';
import { VerifyIdentity } from './VerifyIdentity';

// Prototype: quote → vehicle info → OTP → pay → documents → done (6 steps).
// Here vehicle info folds into the quote and OTP is skipped for members.
// Order stays "pay first, then documents" so the price is locked in.
type Step = 'quote' | 'otp' | 'pay' | 'docs' | 'done';
const TITLES: Record<Step, string> = {
  quote: 'قیمت و پوشش بدنه',
  otp: 'تایید هویت',
  pay: 'تسویه و پرداخت',
  docs: 'تکمیل مدارک و بازدید',
  done: 'صدور موفق',
};

const midValue = (t: VehicleType) => {
  const v = BODY_VALUE[t];
  return Math.round((v.low + v.high) / 2 / v.step) * v.step;
};
const DEFAULT_ADDONS = BODY_ADDONS.filter((a) => 'default' in a && a.default).map((a) => a.k) as BodyAddon[];

export function BodyFlow() {
  const [params] = useSearchParams();
  const resumeId = params.get('resume');
  // Read once: completing the documents changes the policy status mid-flow.
  const [resumed] = useState(() =>
    resumeId ? useApp.getState().policies.find((p) => p.id === resumeId && p.status === 'docs') ?? null : null);
  if (resumeId && !resumed) return <Navigate to="/insurances" replace />;
  return <BodyFlowInner resumed={resumed} />;
}

function BodyFlowInner({ resumed }: { resumed: Policy | null }) {
  const leave = useBack('/');
  const auth = useApp((s) => s.auth);
  const purchase = useApp((s) => s.purchase);

  const [steps] = useState<Step[]>(() =>
    resumed ? ['docs', 'done'] : auth ? ['quote', 'pay', 'docs', 'done'] : ['quote', 'otp', 'pay', 'docs', 'done']);
  const [i, setI] = useState(0);
  const step = steps[i];
  const t0 = useRef(Date.now());

  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [plate, setPlate] = useState<Plate>(DEFAULT_PLATES.car);
  const [nationalId, setNationalId] = useState('0012345678');
  const [value, setValue] = useState(midValue('car'));
  const [addons, setAddons] = useState<BodyAddon[]>(DEFAULT_ADDONS);
  const [quote, setQuote] = useState<BodyQuote | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(resumed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { sanehab } = useApp((s) => s.demo);
  const toggleDemo = useApp((s) => s.toggleDemo);

  const go = (n: number) => { setI(n); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const next = () => go(Math.min(i + 1, steps.length - 1));
  // After paying, going back would mean paying twice: leave instead.
  const back = () => (i === 0 || step === 'docs' || step === 'done' ? leave() : go(i - 1));
  const changed = <T,>(set: (v: T) => void) => (v: T) => { set(v); setQuote(null); };
  const ready = isPlateComplete(plate, vehicleType) && nationalId.length === 10;
  const range = BODY_VALUE[vehicleType];

  const runQuote = async () => {
    setLoading(true); setError(false);
    try {
      setQuote(await quoteBody({ vehicleType, value, addons }));
    } catch (e) {
      if (e instanceof ApiError) setError(true);
    } finally {
      setLoading(false);
    }
  };

  const paid = (r: CheckoutResult) => {
    if (!quote) return;
    setPolicy(purchase({
      kind: 'badane', total: quote.total, useWallet: r.useWallet, investAmount: r.investAmount,
      car: vehicleType === 'moto' ? 'موتورسیکلت ' + quote.vehicle.brand : quote.vehicle.brand + ' ' + quote.vehicle.model,
      plate: plateText(plate, vehicleType), code: null, track: '',
      secs: 0, installments: r.installments,
    }));
    toast('پرداخت انجام شد. حالا مدارک رو کامل کن');
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
              vehicleType={vehicleType}
              onType={(t) => { setVehicleType(t); setPlate(DEFAULT_PLATES[t]); setValue(midValue(t)); setQuote(null); }}
              plate={plate} onPlate={changed(setPlate)} nationalId={nationalId} onNationalId={changed(setNationalId)}
            />
            <div className="field">
              <label htmlFor="bv">ارزش تخمینی خودرو (پوشش اصلی)</label>
              <div className="value-card">
                <div className="vc-src">از سامانه‌ی قیمت یک خودروفروش معتبر (نمونه) · به‌روز امروز</div>
                <div className="vc-range" style={{ fontSize: 13, margin: '4px 0 8px' }}>
                  رنج مجاز: {fmtBig(range.low)} تا {fmtBig(range.high)} تومان
                </div>
                <div className="range-value" style={{ fontSize: 22 }}>{toman(value)}</div>
                <input id="bv" type="range" min={range.low} max={range.high} step={range.step} value={value}
                  onChange={(e) => { setValue(+e.target.value); setQuote(null); }} />
                <div className="range-scale"><span>{fmtBig(range.low)}</span><span>{fmtBig(range.high)}</span></div>
                <div className="s11" style={{ marginTop: 8 }}>هر جای این رنج رو می‌تونی انتخاب کنی. بیرون از رنج مجاز نیست.</div>
              </div>
            </div>
            <div className="field-grid">
              <div className="field"><label>تاریخ شروع</label><div className="input filled">{todayFa()}</div></div>
              <div className="field"><label>تاریخ پایان</label><div className="input filled">{todayFa(365)}</div></div>
            </div>
            <div className="field"><label>پوشش‌های فرعی (روی قیمت اثر می‌گذارند)</label></div>
            <div style={{ borderRadius: 14, overflow: 'hidden' }}>
              {BODY_ADDONS.map((a) => (
                <ToggleRow key={a.k} label={a.t} sub={'sub' in a ? a.sub : undefined} on={addons.includes(a.k)}
                  onToggle={() => { setAddons((x) => (x.includes(a.k) ? x.filter((k) => k !== a.k) : [...x, a.k])); setQuote(null); }} />
              ))}
            </div>
            <QuoteButton show={!quote} ready={ready} loading={loading} onRun={runQuote} />
            {error && <SanehabError onRetry={() => { if (sanehab) toggleDemo('sanehab'); runQuote(); }} />}
            {quote && (
              <>
                <div className="price-card">
                  <div className="small">{quote.vehicle.title}</div>
                  <div className="big">{toman(quote.total)}</div>
                  <div className="small">حق‌بیمه بر اساس ارزش خودرو + پوشش‌های فرعی انتخابی</div>
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
            payLabel="پرداخت و ادامه به تکمیل مدارک"
            zeroLabel="تسویه کامل با کیف‌پول و ادامه به تکمیل مدارک"
            lines={[
              { label: 'قیمت پایه', value: toman(quote.base) },
              { label: 'پوشش‌های فرعی انتخابی', value: '+' + toman(quote.addons) },
              { label: 'تخفیف کد BAMBOO10', value: '−' + toman(quote.discount), disc: true },
            ]}
            onPaid={paid}
          />
        )}
        {step === 'docs' && policy && (
          <DocsStep policy={policy} startedAt={t0.current} onIssued={(p) => { setPolicy(p); next(); }} />
        )}
        {step === 'done' && policy && <IssuedStep policy={policy} onPolicy={setPolicy} />}
      </div></div></div>
    </>
  );
}

function DocsStep({ policy, startedAt, onIssued }: { policy: Policy; startedAt: number; onIssued(p: Policy): void }) {
  const navigate = useNavigate();
  const completeBodyDocs = useApp((s) => s.completeBodyDocs);
  const [complete, setComplete] = useState(false);
  const [ocr, setOcr] = useState(false);
  const [busy, setBusy] = useState(false);

  const finish = async () => {
    setBusy(true);
    const central = await issueAtCentral();
    const p = completeBodyDocs(policy.id, central.code, central.track, Math.round((Date.now() - startedAt) / 1000));
    setBusy(false);
    if (p) onIssued(p);
  };

  return (
    <>
      <div className="ok-band">پرداختت با موفقیت انجام شد. بیمه‌نامه بعد از تکمیل مدارک و بازدید آنلاین صادر می‌شه.</div>
      <button className="edit-link link-btn" onClick={() => setOcr(true)}>نیاز به اسکن مجدد مدارک دارم</button>
      <div className="note-band">حالا ۴ زاویه اصلی خودرو را طبق راهنما عکس بگیر — این بخش برای همه الزامی است.</div>
      <Inspection onComplete={setComplete} />
      <button className="btn-primary" disabled={!complete || busy} onClick={finish}>تکمیل و صدور بیمه‌نامه</button>
      <button className="edit-link link-btn" style={{ color: 'var(--ink-soft)' }} onClick={() => navigate('/')}>
        بعداً ادامه می‌دم (بیمه‌نامه تا تکمیل مدارک صادر نمی‌شه)
      </button>
      <OcrSheet open={ocr} onClose={() => setOcr(false)} />
    </>
  );
}
