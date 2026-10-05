import { useEffect, useState } from 'react';
import { ApiError, sendOtp, verifyOtp } from '@/api/mock';
import { useCountdown } from '@/components/Countdown';
import { OtpInput } from '@/components/OtpInput';
import { Spinner } from '@/components/ui';
import { digitsOnly, faN, isMobile, maskMobile, mmss } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast } from '@/store/ui';

/** Mobile + OTP, checked against Shahkar. Logs the user in on success. */
export function VerifyIdentity({ onVerified }: { onVerified(): void }) {
  const setAuth = useApp((s) => s.setAuth);
  const [mobile, setMobile] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = () => { setSent(true); setCode(''); setError(''); sendOtp(mobile); };

  useEffect(() => {
    if (code.length !== 4 || busy) return;
    setBusy(true);
    setError('');
    verifyOtp(mobile, code)
      .then(() => { setAuth(true); onVerified(); })
      .catch((e: unknown) => { setError(e instanceof ApiError ? e.message : 'خطا در تایید کد'); setCode(''); })
      .finally(() => setBusy(false));
  }, [code]);

  if (!sent) {
    return (
      <>
        <div className="field">
          <label htmlFor="vi-mob">شماره موبایل</label>
          <input id="vi-mob" className="input ltr-input" inputMode="numeric" autoComplete="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            value={faN(mobile)} onChange={(e) => setMobile(digitsOnly(e.target.value, 11))} autoFocus
            onKeyDown={(e) => e.key === 'Enter' && isMobile(mobile) && send()} />
        </div>
        <button className="edit-link plain link-btn" onClick={() => setMobile('09121234567')}>پر کردن با شماره‌ی نمونه</button>
        <div className="note-band">شماره‌ی موبایل باید به نام صاحب کد ملی باشد. همین را از شاهکار می‌پرسیم. با همین شماره وارد حسابت هم می‌شی.</div>
        <button className="btn-primary" disabled={!isMobile(mobile)} onClick={send}>دریافت کد</button>
      </>
    );
  }

  return (
    <>
      <div className="center-text">
        <div className="s">
          کد ارسال‌شده به {maskMobile(mobile)} را وارد کنید (دمو: هر ۴ رقمی){' '}
          <button className="link-btn inline-link" onClick={() => setSent(false)}>تغییر شماره</button>
        </div>
      </div>
      <OtpInput value={code} onChange={setCode} />
      <Timer onResend={() => { send(); toast('کد دوباره ارسال شد'); }} />
      {busy && <div className="center-text"><div className="s"><Spinner />در حال تطبیق با شاهکار…</div></div>}
      {error && <div className="otp-err">{error}</div>}
    </>
  );
}

function Timer({ onResend }: { onResend(): void }) {
  const { left, restart } = useCountdown(120);
  return left > 0
    ? <div className="timer">زمان باقی‌مانده: <span className="t">{mmss(left)}</span></div>
    : <button className="edit-link link-btn" onClick={() => { restart(); onResend(); }}>ارسال مجدد کد</button>;
}
