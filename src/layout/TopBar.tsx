import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from '@/components/Icon';
import { useApp } from '@/store/app';
import { toast, useUi } from '@/store/ui';

export function TopBar() {
  const auth = useApp((s) => s.auth);
  const openLogin = useUi((s) => s.openLogin);
  return (
    <div className="topbar">
      <div className="brand"><span className="leaf" /> Bamboo</div>
      <div className="icons" style={{ position: 'relative' }}>
        {auth ? (
          <button className="icon-btn" aria-label="اعلان‌ها" onClick={() => toast('اعلان‌ها هنوز طراحی نشده')}>
            <Icon name="bell" /><span className="dot" />
          </button>
        ) : (
          <button className="login-pill" onClick={() => openLogin()}>ورود</button>
        )}
        <Menu />
      </div>
    </div>
  );
}

function Menu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { auth, theme, setTheme, setAuth } = useApp();
  const { openLogin, setDemoOpen } = useUi();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const item = (label: string, action: () => void, cls = '') => (
    <button className={`menu-item ${cls}`} onClick={() => { setOpen(false); action(); }}>{label}</button>
  );
  const themeBtn = (t: 'dark' | 'light', label: string) => (
    <button type="button" className={`theme-btn ${theme === t ? 'on' : ''}`} onClick={() => setTheme(t)}>{label}</button>
  );

  return (
    <div ref={ref}>
      <button className="icon-btn" aria-label="منو" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="menu" />
      </button>
      <div className={`menu-dropdown ${open ? 'show' : ''}`}>
        <div className="menu-item theme-row"><span>تم</span><span className="theme-seg">{themeBtn('dark', 'تیره')}{themeBtn('light', 'روشن')}</span></div>
        <div className="menu-sep" />
        {auth ? (
          <>
            {item('دارایی و اقساط', () => navigate('/profile/installments'))}
            {item('بیمه‌های من', () => navigate('/insurances'))}
            {item('خسارت‌های من', () => navigate('/claims'))}
            {item('کیف پول', () => navigate('/wallet'))}
            {item('اشتراک‌گذاری اطلاعات', () => navigate('/profile/contacts'))}
            <div className="menu-sep" />
            {item('حالت‌های نمایشی', () => setDemoOpen(true), 'muted')}
            {item('خروج از حساب کاربری', () => { setAuth(false); navigate('/'); toast('از حساب خارج شدی'); }, 'danger')}
          </>
        ) : (
          <>
            {item('ورود / ثبت‌نام', () => openLogin(), 'primary')}
            {item('صدور بیمه ثالث', () => navigate('/issue/third-party'))}
            {item('صدور بیمه بدنه', () => navigate('/issue/body'))}
            {item('دستیار خرید بیمه', () => navigate('/advisor'))}
            <div className="menu-sep" />
            {item('حالت‌های نمایشی', () => setDemoOpen(true), 'muted')}
          </>
        )}
      </div>
    </div>
  );
}
