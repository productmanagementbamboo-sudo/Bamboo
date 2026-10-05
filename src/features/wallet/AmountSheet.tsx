import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui';
import { toman } from '@/lib/format';

/** Bottom sheet with a slider for picking an amount up to `max`. */
export function AmountSheet({ open, title, assetLabel, max, initial, note, confirmLabel, onConfirm, onClose }: {
  open: boolean; title: string; assetLabel: string; max: number; initial: number;
  note?: string; confirmLabel: string; onConfirm(v: number): void; onClose(): void;
}) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    if (open) setV(Math.min(initial, max));
  }, [open, initial, max]);
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <div className="asset-row"><span>{assetLabel}</span><span className="v">{toman(max)}</span></div>
      <div className="field"><label>مبلغ</label><div className="input filled">{toman(v)}</div></div>
      <input type="range" min={0} max={max} step={100000} value={v} aria-label="مبلغ"
        onChange={(e) => setV(+e.target.value)} style={{ width: '100%', marginTop: 10 }} />
      {note && <div className="risk-note">{note}</div>}
      <button className="btn-primary" style={{ marginTop: 14 }} disabled={!v} onClick={() => onConfirm(v)}>{confirmLabel}</button>
    </Sheet>
  );
}

export const LOTUS_NOTE =
  'این مبلغ تضمین‌شده نیست و بازخرید ممکن است چند روز کاری طول بکشد — قبل از تایید نهایی، زمان دقیق را از لوتوس پارسیان استعلام بگیرید.';
