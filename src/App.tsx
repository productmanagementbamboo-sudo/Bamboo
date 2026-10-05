import type { ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AppShell } from '@/layout/AppShell';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { HomePage } from '@/features/home/HomePage';
import { InsurancesPage } from '@/features/policies/InsurancesPage';
import { AssistantPage } from '@/features/assistant/AssistantPage';
import { ClaimsPage } from '@/features/claims/ClaimsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { ContactsPage } from '@/features/profile/ContactsPage';
import { InstallmentsPage } from '@/features/profile/InstallmentsPage';
import { PaymentsPage } from '@/features/profile/PaymentsPage';
import { WalletPage } from '@/features/wallet/WalletPage';
import { ThirdPartyFlow } from '@/features/issuance/ThirdPartyFlow';
import { BodyFlow } from '@/features/issuance/BodyFlow';
import { EndorseFlow } from '@/features/endorse/EndorseFlow';
import { ComingSoon } from '@/features/misc/ComingSoon';

const auth = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;
const soon = (title: string) => <ComingSoon title={title} />;

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      // Tabs
      { path: '/', element: <HomePage /> },
      { path: '/insurances', element: auth(<InsurancesPage />) },
      { path: '/assistant', element: <AssistantPage /> },
      { path: '/claims', element: auth(<ClaimsPage />) },
      { path: '/profile', element: auth(<ProfilePage />) },

      // Profile & money
      { path: '/profile/me', element: auth(<UserProfilePage />) },
      { path: '/profile/contacts', element: auth(<ContactsPage />) },
      { path: '/profile/installments', element: auth(<InstallmentsPage />) },
      { path: '/profile/payments', element: auth(<PaymentsPage />) },
      { path: '/wallet', element: auth(<WalletPage />) },

      // Purchase
      { path: '/issue/third-party', element: <ThirdPartyFlow /> },
      { path: '/issue/body', element: <BodyFlow /> },
      { path: '/endorse', element: auth(<EndorseFlow />) },

      // Not ported yet (phase 2+)
      { path: '/accident', element: soon('تصادف کردم') },
      { path: '/claim/new', element: auth(soon('اعلام خسارت')) },
      { path: '/claims/:id', element: auth(soon('پرونده‌ی خسارت')) },
      { path: '/advisor', element: soon('دستیار خرید بیمه') },
      { path: '/inbl/*', element: auth(soon('مزایای نگهداری')) },
      { path: '/assistant/docguide', element: soon('مستندسازی صحنه') },
      { path: '/assistant/fault', element: soon('تعیین مقصر') },
      { path: '/assistant/police', element: soon('گزارش راهور') },
      { path: '/assistant/service/:kind', element: soon('امداد') },
      { path: '/assistant/support', element: soon('تماس حمایتی') },
      { path: '/assistant/ride', element: soon('حمل‌ونقل جایگزین') },
      { path: '/assistant/survey', element: soon('پرسشنامه‌ی علت تصادف') },
      { path: '/assistant/carcal', element: soon('تقویم فنی خودرو') },
      { path: '/assistant/mind', element: soon('پکیج سلامت روان') },
      { path: '*', element: soon('صفحه پیدا نشد') },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
