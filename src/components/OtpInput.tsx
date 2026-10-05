import { useEffect, useRef } from 'react';
import { digitsOnly, faN } from '@/lib/format';

/** Four boxes over one real input, so paste and SMS autofill work. */
export function OtpInput({ value, onChange, length = 4, autoFocus = true }: {
  value: string; onChange(v: string): void; length?: number; autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <div className="otp-wrap">
      <div className="otp-row">
        {Array.from({ length }, (_, i) => (
          <div key={i} className={`otp-box ${value[i] ? '' : 'empty'}`}>{value[i] ? faN(value[i]) : '•'}</div>
        ))}
      </div>
      <input
        ref={ref}
        className="otp-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label="کد تایید"
        value={value}
        onChange={(e) => onChange(digitsOnly(e.target.value, length))}
      />
    </div>
  );
}
