import { useEffect, useState } from 'react';
import { scanDocument } from '@/api/mock';
import { Icon } from '@/components/Icon';
import { Sheet, Spinner } from '@/components/ui';
import { toast } from '@/store/ui';

type Phase = 'capture' | 'reading' | 'review';

/** Scan an ID card / licence; low-confidence fields must be filled by hand. */
export function OcrSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const [phase, setPhase] = useState<Phase>('capture');
  const [scan, setScan] = useState<{ firstName: string; lastName: string } | null>(null);
  const [licence, setLicence] = useState('');

  useEffect(() => {
    if (open) { setPhase('capture'); setLicence(''); }
  }, [open]);

  const read = async () => {
    setPhase('reading');
    const r = await scanDocument();
    setScan(r);
    setLicence(r.licence ?? '');
    setPhase('review');
  };

  return (
    <Sheet open={open} title="اسکن مدرک با OCR" onClose={onClose}>
      {phase === 'capture' && (
        <>
          <div className="id-card ocr-frame"><Icon name="camera" size={30} /></div>
          <div className="s11" style={{ margin: '8px 0' }}>کارت ملی یا گواهینامه رو داخل کادر بگیر.</div>
          <div className="btn-pair">
            <button className="btn-primary" onClick={read}>عکس بگیر</button>
            <button className="btn-secondary" onClick={read}>آپلود از گالری</button>
          </div>
        </>
      )}
      {phase === 'reading' && (
        <div className="center-text" style={{ padding: '30px 0' }}><div className="h"><Spinner />در حال خواندن مدرک…</div></div>
      )}
      {phase === 'review' && scan && (
        <>
          <div className="docimg">
            <span className="ph" /><span className="hl" style={{ top: 14 }} /><span className="hl" style={{ top: 44 }} />
            <span className="hl low" style={{ top: 74 }} />
          </div>
          <div className="s11" style={{ marginBottom: 8 }}>خوانده شد: نام و نام خانوادگی. یک فیلد با اطمینان کم خالی مونده و باید خودت وارد کنی.</div>
          <div className="field-grid">
            <div className="field"><label>نام</label><div className="input filled">{scan.firstName}</div></div>
            <div className="field"><label>نام خانوادگی</label><div className="input filled">{scan.lastName}</div></div>
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="ocr-lic">شماره گواهینامه</label>
            <input id="ocr-lic" className={`input ${licence.trim() ? '' : 'low'}`} inputMode="numeric"
              placeholder="خوانده نشد، لطفاً وارد کن" value={licence} onChange={(e) => setLicence(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ marginTop: 14 }} disabled={!licence.trim()}
            onClick={() => { onClose(); toast('اطلاعات با OCR به‌روز شد'); }}>تأیید</button>
        </>
      )}
    </Sheet>
  );
}
