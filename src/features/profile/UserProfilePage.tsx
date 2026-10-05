import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { SubHeader } from '@/components/ui';
import { digitsOnly, faN } from '@/lib/format';
import { useApp } from '@/store/app';
import { toast, useUi } from '@/store/ui';

export function UserProfilePage() {
  const user = useApp((s) => s.user);
  const setDemoOpen = useUi((s) => s.setDemoOpen);
  const [postal, setPostal] = useState('1435786912');
  const [addr, setAddr] = useState('تهران، خیابان ولیعصر، کوچه‌ی نمونه، پلاک ۱۲');
  return (
    <>
      <SubHeader title="اطلاعات من" backTo="/profile" />
      <div className="rose-page">
        <div className="profile-row">
          <div className="avatar"><Icon name="user" /></div>
          <div><div className="name">{user.name}</div><div className="sub">هویت با شاهکار تأیید شده</div></div>
        </div>
        <div className="list-card">
          <div className="tx-row"><div className="l"><div className="t">کد ملی</div></div><div className="amt">۰۰۱***۶۷۸</div></div>
          <div className="tx-row"><div className="l"><div className="t">شماره موبایل</div></div><div className="amt">۰۹۱۲***۴۵۶۷</div></div>
          <div className="tx-row">
            <div className="l"><div className="t">گواهینامه رانندگی</div><div className="s">از بیمه مرکزی دریافت شد</div></div>
            <div className="status done">ثبت شده</div>
          </div>
        </div>
        <div className="section-tag">آدرس، برای ارسال مدارک</div>
        <div className="field">
          <label htmlFor="up-postal">کد پستی</label>
          <input id="up-postal" className="input ltr-input" inputMode="numeric" value={faN(postal)}
            onChange={(e) => setPostal(digitsOnly(e.target.value, 10))} />
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="up-addr">آدرس</label>
          <textarea id="up-addr" className="input" value={addr} onChange={(e) => setAddr(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ marginTop: 12 }} disabled={postal.length !== 10 || !addr.trim()}
          onClick={() => toast('اطلاعات ذخیره شد')}>ذخیره</button>
        <div className="section-tag">مدارک ذخیره‌شده</div>
        <div className="assist-row">
          <div className="assist-icon" style={{ background: 'var(--rose-line)' }}><Icon name="lock" /></div>
          <div><div className="t">کارت ملی و کارت خودرو</div><div className="s">رمزگذاری‌شده نگهداری می‌شود و فقط برای صدور و خسارت استفاده می‌شود</div></div>
        </div>
        <button className="edit-link link-btn" style={{ marginTop: 14, width: '100%' }} onClick={() => setDemoOpen(true)}>
          حالت‌های نمایشی (فقط برای دمو)
        </button>
      </div>
    </>
  );
}
