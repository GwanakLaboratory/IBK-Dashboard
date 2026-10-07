import {
  Navigate,
  RouterProvider as BaseRouterProvider,
  createBrowserRouter,
} from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HistoryPage } from '@/features/marketing/HistoryPage';
import { SendPage } from '@/features/marketing/SendPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { PerformancePage } from '@/features/performance/PerformancePage';
import { CardDetailPage } from '@/features/target/CardDetailPage';
import { CustomerAnalysisPage } from '@/features/target/CustomerAnalysisPage';
import { CardsPage } from '@/features/target/CardsPage';
import { MemberDetailPage } from '@/features/target/MemberDetailPage';
import { MembersPage } from '@/features/target/MembersPage';

const DEFAULT_PATH = '/dashboard';

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to={DEFAULT_PATH} replace /> },
      { path: '/dashboard', element: <OverviewPage /> },
      { path: '/target', element: <CustomerAnalysisPage /> },
      { path: '/target/members', element: <MembersPage /> },
      { path: '/target/members/:memberId', element: <MemberDetailPage /> },
      { path: '/target/cards', element: <CardsPage /> },
      { path: '/target/cards/:cardName', element: <CardDetailPage /> },
      {
        path: '/marketing',
        element: <Navigate to="/marketing/send" replace />,
      },
      { path: '/marketing/send', element: <SendPage /> },
      { path: '/marketing/history', element: <HistoryPage /> },
      { path: '/performance', element: <PerformancePage /> },
      { path: '*', element: <Navigate to={DEFAULT_PATH} replace /> },
    ],
  },
]);

export default function RouteProvider() {
  return <BaseRouterProvider router={router} />;
}
