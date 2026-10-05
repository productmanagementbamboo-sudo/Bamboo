import { NavLink } from 'react-router';
import { Icon, type IconName } from '@/components/Icon';

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'خانه', icon: 'home' },
  { to: '/insurances', label: 'بیمه‌ها', icon: 'list' },
  { to: '/assistant', label: 'حادثه', icon: 'scale' },
  { to: '/claims', label: 'خسارت', icon: 'bandage' },
  { to: '/profile', label: 'پروفایل', icon: 'user' },
];

export function BottomNav() {
  return (
    <nav className="bottomnav">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon name={t.icon} />
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
