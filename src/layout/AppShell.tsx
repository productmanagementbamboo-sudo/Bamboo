import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Toast } from '@/components/ui';
import { LoginSheet } from '@/features/auth/LoginSheet';
import { DemoSheet } from '@/features/demo/DemoSheet';
import { BottomNav } from './BottomNav';

// Full-screen task flows hide the tab bar so the user stays focused.
const FOCUS_ROUTES = ['/issue/', '/endorse', '/accident', '/claim/new'];

export function AppShell() {
  const { pathname } = useLocation();
  const focus = FOCUS_ROUTES.some((r) => pathname.startsWith(r));
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname]);
  return (
    <div className={`app ${focus ? 'focus' : ''}`}>
      <Outlet />
      {!focus && <BottomNav />}
      <LoginSheet />
      <DemoSheet />
      <Toast />
    </div>
  );
}
