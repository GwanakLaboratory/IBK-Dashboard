import { Outlet } from 'react-router';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-dvh flex-col gap-0.5 bg-slate-900">
      <Header />
      <div className="flex min-w-0 flex-1 flex-row overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
