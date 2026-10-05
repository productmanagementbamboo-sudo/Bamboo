// Pieces shared by the third-party and body issuance flows.
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { centralCode } from '@/api/mock';
import type { Plate, Policy, Quote, VehicleType } from '@/api/types';
import { Icon } from '@/components/Icon';
import { IrPlate } from '@/components/IrPlate';
import { Spinner, SuccessBadge } from '@/components/ui';
import { digitsOnly, faN, mmss } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';
import { OcrSheet } from './OcrSheet';

export function FlowHeader({ title, onBack }: { title: string; onBack(): void }) {
  const navigate = useNavigate();
  return (
    <div className="subheader">
      <button className="back" onClick={onBack} aria-label="بازگشت"><Icon name="back" /></button>
      <h2>{title}</h2>
      <button className="help-btn" onClick={() => navigate('/advisor')} aria-label="کمک">؟</button>
    </div>
  );
}

/** Vehicle type toggle + plate + owner national ID. */
export function VehicleFields({ vehicleType, onType, plate, onPlate, nationalId, onNationalId }: {
  vehicleType: VehicleType; onType(t: VehicleType): void;
  plate: Plate; onPlate(p: Plate): void;
  nationalId: string; onNationalId(v: string): void;
}) {
  return (
    <>
      <div className="seg-toggle">
        {(['car', 'moto'] as const).map((t) => (
          <button key={t} className={vehicleType === t ? 'on' : ''} onClick={() => onType(t)}>
            {t === 'car' ? 'خودرو' : 'موتور'}
          </button>
        ))}
      </div>
      <div className="field">
        <label>{vehicleType === 'moto' ? 'شماره پلاک موتور' : 'شماره پلاک'}</label>
        <IrPlate value={plate} type={vehicleType} onChange={onPlate} />
      </div>
      <div className="field">
        <label htmlFor="nid">کد ملی مالک</label>
        <input id="nid" className="input ltr-input" inputMode="numeric" value={faN(nationalId)}
          onChange={(e) => onNationalId(digitsOnly(e.target.value, 10))} />
      </div>
    </>
  );
}

/** Collapsible vehicle data read from Sanehab, editable or re-scannable with OCR. */
export function VehicleInfoPanel({ quote }: { quote: Quote }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [ocr, setOcr] = useState(false);
  const v = quote.vehicle;
  const rows: [string, string][] = [
    ['نوع', v.type], ['کاربری', v.usage], ['برند', v.brand], ['تیپ', v.model],
    ['نوع سوخت', v.fuel], ['سال', v.year], ['درصد تخفیف ثالث', v.thirdPartyDiscount], ['درصد تخفیف راننده', v.driverDiscount],
  ];
  return (
    <>
      <button className="info-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>مشخصات خودرو از سنهاب</span>
        <span className="s11">{open ? 'بستن' : 'نمایش و ویرایش'}</span>
      </button>
      {open && !editing && (
        <>
          <div className="autofill-form">
            {rows.map(([k, val]) => <div key={k} className="af-row"><span className="k">{k}</span><span className="v">{val}</span></div>)}
          </div>
          <button className="edit-link link-btn" onClick={() => setEditing(true)}>اطلاعات درست نیست؟ ویرایش می‌کنم</button>
        </>
      )}
      {open && editing && (
        <>
          <div className="field-grid">
            {rows.map(([k, val]) => (
              <div key={k} className="field"><label>{k}</label><input className="input" defaultValue={val} /></div>
            ))}
          </div>
          <button className="id-card ocr-btn" onClick={() => setOcr(true)}>
            <div className="line" style={{ width: '60%' }} /><div className="line" style={{ width: '40%' }} />
            <span className="tag" style={{ top: 10, left: 10 }}>اسکن با OCR</span>
          </button>
          <div className="note-band">به‌جای تایپ دستی، مدارک رو اسکن کن تا فیلدها خودکار پر بشن. تغییرات بعد از پرداخت توسط کارشناس بررسی می‌شه.</div>
        </>
      )}
      <OcrSheet open={ocr} onClose={() => setOcr(false)} />
    </>
  );
}

/** Success screen after issuance; handles the "central insurance is down" case. */
export function IssuedStep({ policy, onPolicy }: { policy: Policy; onPolicy(p: Policy): void }) {
  const navigate = useNavigate();
  const activate = useApp((s) => s.activatePolicy);
  const ok = policy.status === 'active';
  const title = policy.kind === 'salis' ? 'بیمه‌نامه شما صادر شد' : 'بیمه بدنه شما فعال شد';
  return (
    <>
      <SuccessBadge />
      <div className="center-text">
        <div className="h">{ok ? title : 'پرداخت شما ثبت شد'}</div>
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

export function QuoteButton({ show, ready, loading, onRun }: { show: boolean; ready: boolean; loading: boolean; onRun(): void }) {
  if (!show) return null;
  return (
    <button className="btn-primary" disabled={!ready || loading} onClick={onRun}>
      {loading ? <><Spinner />در حال استعلام از سنهاب…</> : 'استعلام قیمت'}
    </button>
  );
}

export function SanehabError({ onRetry }: { onRetry(): void }) {
  return (
    <div className="alert-band">
      کندی در سامانه مرکزی.{' '}
      <button className="link-btn inline-link" onClick={onRetry}>تلاش مجدد</button>
    </div>
  );
}
