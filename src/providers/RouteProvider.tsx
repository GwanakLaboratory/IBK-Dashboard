import {
  Navigate,
  RouterProvider as BaseRouterProvider,
  createBrowserRouter,
} from 'react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ReasonAnalysisPage } from '@/features/reason-analysis/ReasonAnalysisPage';
import { CustomerDetailPage } from '@/features/customer-detail/CustomerDetailPage';
import { CustomerProfilePage } from '@/features/customer-detail/CustomerProfilePage';

const DEFAULT_PATH = '/dashboard';

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to={DEFAULT_PATH} replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/reason-analysis', element: <ReasonAnalysisPage /> },
      { path: '/customer-detail', element: <CustomerDetailPage /> },
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
