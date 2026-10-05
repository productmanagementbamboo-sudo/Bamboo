import type { DemoFlags } from '@/api/types';
import { Sheet, Switch } from '@/components/ui';
import { useApp } from '@/store/app';
import { useUi } from '@/store/ui';

const ROWS: [keyof DemoFlags, string][] = [
  ['shahkar', 'شاهکار: عدم تطبیق موبایل و کد ملی'],
  ['sanehab', 'سنهاب کند (بیش از ۵ ثانیه)'],
  ['central', 'بیمه مرکزی بعد از پرداخت قطع است'],
  ['blur', 'یکی از عکس‌های بازدید تار است'],
  ['oldCar', 'خودروی زیان‌دیده بالای ۱۰ سال است'],
  ['prevDep', 'افت قیمت این خودرو قبلاً گرفته شده'],
  ['tags', 'برچسب‌های داخلی قطعه‌ها (نمای زیان‌دیده)'],
];

export function DemoSheet() {
  const { demoOpen, setDemoOpen } = useUi();
  const { demo, toggleDemo } = useApp();
  return (
    <Sheet open={demoOpen} title="حالت‌های نمایشی" onClose={() => setDemoOpen(false)}>
      <div className="s11" style={{ marginBottom: 6 }}>حالت‌های خطای PRDها رو از اینجا روشن کن.</div>
      {ROWS.map(([k, label]) => (
        <div key={k} className="demo-row" role="switch" aria-checked={demo[k]} onClick={() => toggleDemo(k)} style={{ cursor: 'pointer' }}>
          <span>{label}</span><Switch on={demo[k]} />
        </div>
      ))}
    </Sheet>
  );
}
