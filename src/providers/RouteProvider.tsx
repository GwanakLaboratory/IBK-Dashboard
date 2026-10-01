import {
  Navigate,
  RouterProvider as BaseRouterProvider,
  createBrowserRouter,
} from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardAnalysisPage } from '@/features/card-analysis/CardAnalysisPage';
import { CardDetailPage } from '@/features/card-analysis/CardDetailPage';
import { CardProductListPage } from '@/features/card-analysis/CardProductListPage';
import { DashboardChurnPage } from '@/features/dashboard/DashboardChurnPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DashboardTrendPage } from '@/features/dashboard/DashboardTrendPage';
import { CustomerAnalysisPage } from '@/features/customer-detail/CustomerAnalysisPage';
import { CustomerDetailPage } from '@/features/customer-detail/CustomerDetailPage';
import { CustomerProfilePage } from '@/features/customer-detail/CustomerProfilePage';
import { HomePage } from '@/features/home/HomePage';
import { CampaignHistoryDetailPage } from '@/features/marketing/CampaignHistoryDetailPage';
import { ContactHistoryPage } from '@/features/marketing/ContactHistoryPage';
import { TargetSendPage } from '@/features/marketing/TargetSendPage';
import { ConversionPage } from '@/features/performance/ConversionPage';
import { EconomicImpactPage } from '@/features/performance/EconomicImpactPage';

const DEFAULT_PATH = '/dashboard';

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/trend', element: <DashboardTrendPage /> },
      { path: '/dashboard/churn', element: <DashboardChurnPage /> },
      { path: '/card-analysis', element: <CardAnalysisPage /> },
      { path: '/card-list', element: <CardProductListPage /> },
      { path: '/card-list/:productName', element: <CardDetailPage /> },
      { path: '/customer-detail', element: <CustomerDetailPage /> },
      { path: '/customer-analysis', element: <CustomerAnalysisPage /> },
      {
        path: '/customer-detail/:customerId',
        element: <CustomerProfilePage />,
      },
      { path: '/marketing/campaign', element: <TargetSendPage /> },
      { path: '/marketing/history', element: <ContactHistoryPage /> },
      {
        path: '/marketing/history/:campaignId',
        element: <CampaignHistoryDetailPage />,
      },
      {
        path: '/performance',
        element: <Navigate to="/performance/conversion" replace />,
      },
      { path: '/performance/conversion', element: <ConversionPage /> },
      { path: '/performance/economic', element: <EconomicImpactPage /> },
      { path: '*', element: <Navigate to={DEFAULT_PATH} replace /> },
    ],
  },
]);

export default function RouteProvider() {
  return <BaseRouterProvider router={router} />;
}
