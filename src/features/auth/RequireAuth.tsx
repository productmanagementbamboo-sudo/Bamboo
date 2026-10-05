import type { ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { useApp } from '@/store/app';
import { useUi } from '@/store/ui';

/** Renders children only when logged in; otherwise an inline login prompt. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useApp((s) => s.auth);
  const openLogin = useUi((s) => s.openLogin);
  if (auth) return <>{children}</>;
  return (
    <div className="white-page gate">
      <div className="gate-ic"><Icon name="lock" size={26} /></div>
      <div className="center-text">
        <div className="h">برای دیدن این بخش وارد شو</div>
        <div className="s">فقط با شماره موبایل، بدون رمز.</div>
      </div>
      <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => openLogin()}>ورود / ثبت‌نام</button>
    </div>
  );
}
