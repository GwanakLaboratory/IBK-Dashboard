import {
  Navigate,
  RouterProvider as BaseRouterProvider,
  createBrowserRouter,
} from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CardAnalysisPage } from '@/features/card-analysis/CardAnalysisPage';
import { CardDetailPage } from '@/features/card-analysis/CardDetailPage';
import { CardProductListPage } from '@/features/card-analysis/CardProductListPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CustomerAnalysisPage } from '@/features/customer-detail/CustomerAnalysisPage';
import { CustomerDetailPage } from '@/features/customer-detail/CustomerDetailPage';
import { CustomerProfilePage } from '@/features/customer-detail/CustomerProfilePage';

const DEFAULT_PATH = '/dashboard';

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to={DEFAULT_PATH} replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/card-analysis', element: <CardAnalysisPage /> },
      { path: '/card-list', element: <CardProductListPage /> },
      { path: '/card-list/:productName', element: <CardDetailPage /> },
      { path: '/customer-detail', element: <CustomerDetailPage /> },
      { path: '/customer-analysis', element: <CustomerAnalysisPage /> },
      {
        path: '/customer-detail/:customerId',
        element: <CustomerProfilePage />,
      },
      { path: '*', element: <Navigate to={DEFAULT_PATH} replace /> },
    ],
  },
]);

export default function RouteProvider() {
  return <BaseRouterProvider router={router} />;
}
