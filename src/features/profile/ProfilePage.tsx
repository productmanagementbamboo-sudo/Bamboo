import { useNavigate } from 'react-router';
import { Icon, type IconName } from '@/components/Icon';
import { Chevron, TabHeader } from '@/components/ui';
import { useApp } from '@/store/app';

const TILES: [IconName, string, string][] = [
  ['folder', 'بیمه‌های من', '/insurances'],
  ['coin', 'دارایی و اقساط', '/profile/installments'],
  ['bandage', 'خسارت‌های من', '/claims'],
  ['receipt', 'پرداخت‌های من', '/profile/payments'],
  ['wallet', 'کیف پول', '/wallet'],
  ['gift2', 'مزایای نگهداری', '/inbl'],
];

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  return (
    <>
      <TabHeader title="پروفایل" />
      <div className="rose-page">
        <button className="profile-row" onClick={() => navigate('/profile/me')}>
          <div className="avatar"><Icon name="user" /></div>
          <div><div className="name">{user.name}</div><div className="sub">عضو بامبو از {user.since}</div></div>
          <Chevron />
        </button>
        <div className="profile-grid">
          {TILES.map(([ic, t, to]) => (
            <button key={to} className="p-card" onClick={() => navigate(to)}>
              <div className="p-icon"><Icon name={ic} /></div><div className="tile-t">{t}</div>
            </button>
          ))}
        </div>
        <button className="assist-row" style={{ marginTop: 12 }} onClick={() => navigate('/profile/contacts')}>
          <div className="assist-icon" style={{ background: 'var(--rose-line)' }}><Icon name="pin" /></div>
          <div>
            <div className="t">اشتراک‌گذاری اطلاعات</div>
            <div className="s">از پیش، اطلاعاتت را با فرد مورد اعتماد سهیم کن، اگر حادثه‌ای پیش بیاید او مطلع می‌شود</div>
          </div>
          <Chevron />
        </button>
      </div>
    </>
  );
}
