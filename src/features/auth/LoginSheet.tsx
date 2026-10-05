import { useEffect, useState } from 'react';
import { login, sendOtp } from '@/api/mock';
import { Sheet, Spinner } from '@/components/ui';
import { useCountdown } from '@/components/Countdown';
import { OtpInput } from '@/components/OtpInput';
import { digitsOnly, faN, isMobile, maskMobile, mmss } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast, useUi } from '@/store/ui';

type Step = 'phone' | 'code' | 'verifying';

export function LoginSheet() {
  const { open, onDone } = useUi((s) => s.login);
  const closeLogin = useUi((s) => s.closeLogin);
  const setAuth = useApp((s) => s.setAuth);
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (open) { setStep('phone'); setMobile(''); setCode(''); }
  }, [open]);

  const send = async () => { setCode(''); setStep('code'); await sendOtp(mobile); };

  // Submit as soon as the 4th digit lands — no extra button tap.
  useEffect(() => {
    if (step !== 'code' || code.length !== 4) return;
    setStep('verifying');
    login(mobile, code).then(() => {
      closeLogin();
      setAuth(true);
      toast('خوش اومدی');
      onDone?.();
    });
  }, [code, step, mobile, closeLogin, setAuth, onDone]);

  return (
    <Sheet open={open} title="ورود یا ثبت‌نام" onClose={closeLogin}>
      {step === 'phone' && (
        <>
          <div className="s11" style={{ marginBottom: 10 }}>با شماره‌ای وارد شو که به نام خودته. لازم نیست رمز بسازی.</div>
          <div className="field">
            <label htmlFor="lg-mob">شماره موبایل</label>
            <input id="lg-mob" className="input ltr-input" inputMode="numeric" autoComplete="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={faN(mobile)} onChange={(e) => setMobile(digitsOnly(e.target.value, 11))}
              onKeyDown={(e) => e.key === 'Enter' && isMobile(mobile) && send()} autoFocus />
          </div>
          <button className="edit-link plain link-btn" onClick={() => setMobile('09121234567')}>پر کردن با شماره‌ی نمونه</button>
          <button className="btn-primary" style={{ marginTop: 10 }} disabled={!isMobile(mobile)} onClick={send}>دریافت کد</button>
        </>
      )}
      {step === 'code' && <CodeStep mobile={mobile} code={code} setCode={setCode} onResend={send} onEdit={() => setStep('phone')} />}
      {step === 'verifying' && (
        <div className="center-text" style={{ padding: '26px 0' }}><div className="h"><Spinner />در حال ورود…</div></div>
      )}
    </Sheet>
  );
}

function CodeStep({ mobile, code, setCode, onResend, onEdit }: {
  mobile: string; code: string; setCode(v: string): void; onResend(): void; onEdit(): void;
}) {
  const { left, restart } = useCountdown(120);
  return (
    <>
      <div className="s11" style={{ marginBottom: 12 }}>
        کد ۴ رقمی به {maskMobile(mobile)} ارسال شد. (دمو: هر ۴ رقمی قبوله){' '}
        <button className="link-btn inline-link" onClick={onEdit}>تغییر شماره</button>
      </div>
      <OtpInput value={code} onChange={setCode} />
      <div className="timer" style={{ marginTop: 12 }}>
        {left > 0 ? <>ارسال مجدد تا <span className="t">{mmss(left)}</span></> : (
          <button className="edit-link plain link-btn" onClick={() => { restart(); onResend(); }}>ارسال مجدد کد</button>
        )}
      </div>
    </>
  );
}
