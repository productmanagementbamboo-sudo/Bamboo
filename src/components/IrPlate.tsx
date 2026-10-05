import type { Plate, VehicleType } from '@/api/types';
import { faN, digitsOnly } from '@/lib/format';

const num = (v: string, max: number) => faN(digitsOnly(v, max));

/** Iranian licence plate input (car or motorcycle layout). */
export function IrPlate({ value, type, onChange }: { value: Plate; type: VehicleType; onChange(p: Plate): void }) {
  const moto = type === 'moto';
  const set = (k: keyof Plate, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className={`ir-plate ${moto ? 'moto' : ''}`}>
      <div className="ir-plate-flag">
        <div className="flagbars">
          <span style={{ background: '#239f40' }} /><span style={{ background: '#fff' }} /><span style={{ background: '#da0000' }} />
        </div>
        <small>I.R.<br />IRAN</small>
      </div>
      <div className="ir-plate-main">
        <input inputMode="numeric" aria-label="بخش اول پلاک" value={value.seg1}
          onChange={(e) => set('seg1', num(e.target.value, moto ? 3 : 2))} />
        {!moto && (
          <input className="seg-letter" aria-label="حرف پلاک" maxLength={1} value={value.letter}
            onChange={(e) => set('letter', e.target.value.replace(/[^؀-ۿ]/g, '').slice(-1))} />
        )}
        <input inputMode="numeric" aria-label="بخش دوم پلاک" value={value.seg2}
          onChange={(e) => set('seg2', num(e.target.value, moto ? 5 : 3))} />
      </div>
      <div className="ir-plate-city">
        <span>ایران</span>
        <input inputMode="numeric" aria-label="کد شهر" value={value.city}
          onChange={(e) => set('city', num(e.target.value, 2))} />
      </div>
    </div>
  );
}
