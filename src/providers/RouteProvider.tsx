import {
  Navigate,
  RouterProvider as BaseRouterProvider,
  createBrowserRouter,
} from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardAnalysisPage } from '@/features/card-analysis/CardAnalysisPage';
import { CardDetailPage } from '@/features/card-analysis/CardDetailPage';
import { CardProductListPage } from '@/features/card-analysis/CardProductListPage';
import { DashboardCausePage } from '@/features/dashboard/DashboardCausePage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { DashboardTrendPage } from '@/features/dashboard/DashboardTrendPage';
import { CustomerAnalysisPage } from '@/features/customer-detail/CustomerAnalysisPage';
import { CustomerDetailPage } from '@/features/customer-detail/CustomerDetailPage';
import { CustomerProfilePage } from '@/features/customer-detail/CustomerProfilePage';
import { HighRiskExtractionPage } from '@/features/marketing/HighRiskExtractionPage';
import { MarketingCampaignPage } from '@/features/marketing/MarketingCampaignPage';
import { PerformanceReportPage } from '@/features/performance/PerformanceReportPage';

const DEFAULT_PATH = '/dashboard';

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to={DEFAULT_PATH} replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/dashboard/trend', element: <DashboardTrendPage /> },
      { path: '/dashboard/cause', element: <DashboardCausePage /> },
      { path: '/card-analysis', element: <CardAnalysisPage /> },
      { path: '/card-list', element: <CardProductListPage /> },
      { path: '/card-list/:productName', element: <CardDetailPage /> },
      { path: '/customer-detail', element: <CustomerDetailPage /> },
      { path: '/customer-analysis', element: <CustomerAnalysisPage /> },
      {
        path: '/customer-detail/:customerId',
        element: <CustomerProfilePage />,
      },
      { path: '/marketing/extraction', element: <HighRiskExtractionPage /> },
      { path: '/marketing/campaign', element: <MarketingCampaignPage /> },
      { path: '/performance', element: <PerformanceReportPage /> },
      { path: '*', element: <Navigate to={DEFAULT_PATH} replace /> },
    ],
  },
]);

export default function RouteProvider() {
  return <BaseRouterProvider router={router} />;
}
