import { useState } from 'react';
import { checkInspectionShot } from '@/api/mock';
import { Icon } from '@/components/Icon';
import { faN } from '@/lib/format';
import { toast } from '@/store/ui';

const SHOTS = ['جلو', 'سمت راست', 'عقب', 'سمت چپ'];
type Quality = 'idle' | 'chk' | 'ok' | 'bad';

/** Guided 4-angle photo capture with live quality checks (light, sharpness, framing). */
export function Inspection({ onComplete }: { onComplete(done: boolean): void }) {
  const [shots, setShots] = useState([false, false, false, false]);
  const [q, setQ] = useState<Quality>('idle');
  const [failedOnce, setFailedOnce] = useState(false);
  const done = shots.filter(Boolean).length;
  const cur = Math.min(done, 3);
  const busy = q === 'chk';

  const take = async () => {
    if (busy || done >= 4) return;
    setQ('chk');
    const ok = await checkInspectionShot(done, failedOnce);
    if (!ok) {
      setFailedOnce(true);
      setQ('bad');
      toast('تصویر تاره. دوباره بگیر');
      setTimeout(() => setQ('idle'), 1300);
      return;
    }
    const next = shots.map((s, i) => s || i === done);
    setShots(next);
    setQ('ok');
    setTimeout(() => setQ('idle'), 700);
    onComplete(next.every(Boolean));
  };

  const chip = (label: string) => {
    const cls = q === 'chk' ? 'chk' : q === 'bad' && label === 'وضوح' ? 'bad' : q === 'ok' ? 'ok' : '';
    return <span key={label} className={cls}>{label}</span>;
  };

  return (
    <>
      <div className={`camera-view ${q === 'bad' ? 'badc' : q === 'ok' ? 'okc' : ''}`}>
        <div className="cam-badge">{done === 4 ? 'همه‌ی زاویه‌ها ثبت شد' : `زاویه ${faN(cur + 1)} از ۴ · ${SHOTS[cur]}`}</div>
        <div className="car-outline" />
        <div className="qc-row">{['نور', 'وضوح', 'کادر'].map(chip)}</div>
        <button className="shutter" onClick={take} disabled={done === 4 || busy} aria-label="ثبت عکس" />
      </div>
      <div className="shot-thumbs">
        {SHOTS.map((l, i) => (
          <div key={l} className={`th ${shots[i] ? 'ok' : ''} ${i === cur && done < 4 ? 'cur' : ''}`}>
            {shots[i] ? <Icon name="check" size={16} /> : faN(i + 1)}<small>{l}</small>
          </div>
        ))}
      </div>
    </>
  );
}
