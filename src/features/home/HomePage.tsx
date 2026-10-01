import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { NAV_GROUPS } from '@/config/navigation';
import {
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
} from '@/data/customers';
import type { NavGroupKey } from '@/types/navigation';

const QUICK_LINK_TINT_CLASS_NAME: Record<NavGroupKey, string> = {
  status: 'bg-blue-50 text-primary',
  'risk-target': 'bg-red-50 text-red-600',
  marketing: 'bg-violet-50 text-violet-700',
  performance: 'bg-green-50 text-green-700',
};

function formatReferenceMonth(month: string) {
  const [year, monthNumber] = month.split('.');
  return `20${year}.${monthNumber}`;
}

export function HomePage() {
  const navigate = useNavigate();

  const latestUsage = monthlyTotalUsage[monthlyTotalUsage.length - 1];
  const latestActivity =
    monthlyMemberActivity[monthlyMemberActivity.length - 1];
  const latestRiskDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
  const latestHighRiskCount = Math.round(
    (latestActivity.activeMembers * latestRiskDistribution.high) / 100,
  );
  const overallChurnRate = useMemo(() => {
    const totalIssued = productUsageStats.reduce(
      (sum, stat) => sum + stat.issuedCount,
      0,
    );
    const totalCanceled = productUsageStats.reduce(
      (sum, stat) => sum + stat.canceledCount,
      0,
    );
    return totalIssued === 0 ? 0 : (totalCanceled / totalIssued) * 100;
  }, []);

  const riskMemberTrend = monthlyMemberActivity.slice(-5).map((activity) => {
    const riskDistribution = monthlyRiskDistribution.find(
      (point) => point.month === activity.month,
    );
    const highRiskCount = riskDistribution
      ? Math.round((activity.activeMembers * riskDistribution.high) / 100)
      : 0;
    return {
      month: activity.month,
      label: `${activity.month.split('.')[1]}월`,
      count: highRiskCount,
    };
  });
  riskMemberTrend[riskMemberTrend.length - 1] = {
    ...riskMemberTrend[riskMemberTrend.length - 1],
    label: '이번 달',
  };
  const previousMonthHighRiskCount =
    riskMemberTrend[riskMemberTrend.length - 2]?.count;
  const monthDelta =
    previousMonthHighRiskCount === undefined
      ? null
      : latestHighRiskCount - previousMonthHighRiskCount;

  const metrics = [
    {
      label: '위험군 회원',
      value: latestHighRiskCount.toLocaleString('ko-KR'),
      unit: '명',
      sub: '전체 회원 중 위험 등급',
      colorClassName: 'text-red-600',
      onClick: () => navigate('/customer-detail'),
    },
    {
      label: '전체 이탈률',
      value: overallChurnRate.toFixed(1),
      unit: '%',
      sub: '최근 12개월 누적',
      colorClassName: 'text-primary',
      onClick: () => navigate('/dashboard/trend', { state: { tab: 'churn' } }),
    },
    {
      label: '이용 가능 회원수',
      value: latestActivity.activeMembers.toLocaleString('ko-KR'),
      unit: '명',
      sub: '유효 카드 보유 기준',
      colorClassName: 'text-primary',
      onClick: () =>
        navigate('/dashboard/trend', { state: { tab: 'members' } }),
    },
    {
      label: '전체 카드 사용액',
      value: (latestUsage.usage / 10000).toFixed(1),
      unit: '억원',
      sub: '이번 달 누적',
      colorClassName: 'text-green-700',
      onClick: () => navigate('/dashboard/trend', { state: { tab: 'usage' } }),
    },
  ];

  return (
    <div className="isolate -m-10 flex min-h-[calc(100%+5rem)] flex-col overflow-hidden bg-surface pb-10">
      <div className="flex flex-1 flex-col gap-8">
        <div className="relative flex min-h-[180px] flex-1 items-center justify-between px-11">
          <div className="pointer-events-none absolute inset-x-0 -bottom-[100px] top-0 -z-10 bg-sidebar bg-[image:radial-gradient(1200px_400px_at_88%_0%,#1D2C5E_0%,rgba(29,44,94,0)_70%)]" />
          <div className="flex flex-col gap-3.5">
            <span className="text-sm font-semibold tracking-wide text-topbar-muted">
              이탈 리스크 관리의 시작
            </span>
            <span className="text-4xl font-bold tracking-tight text-white">
              IBK 카드 리스크 인사이트
            </span>
          </div>
          <span className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 text-xs text-topbar-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            기준월 {formatReferenceMonth(latestActivity.month)} · 매월 5일 갱신
          </span>
        </div>

        <div className="mx-11 rounded-2xl bg-white px-9 pb-3 pt-8 shadow-lg">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="text-base font-bold text-gray-900">
                위험군 회원 추이
              </span>
              {monthDelta !== null && (
                <span className="inline-flex h-[22px] items-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-700">
                  전월 대비 ▲ {monthDelta.toLocaleString('ko-KR')}명
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">최근 5개월 · 단위 명</span>
          </div>

          <div className="relative mt-4 flex items-center gap-4">
            <div className="absolute inset-x-[60px] top-1/2 h-0.5 -translate-y-1/2 bg-gray-200" />
            {riskMemberTrend.map((point, index) => {
              const isLast = index === riskMemberTrend.length - 1;
              return (
                <button
                  key={point.month}
                  type="button"
                  onClick={() =>
                    isLast
                      ? navigate('/customer-detail')
                      : navigate('/dashboard/trend', {
                          state: { tab: 'churn' },
                        })
                  }
                  className={`relative flex h-[88px] flex-1 flex-col items-center justify-center gap-1 rounded-full transition-colors ${
                    isLast
                      ? 'bg-primary text-white shadow-lg'
                      : 'border border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isLast ? 'text-white/80' : 'text-gray-500'
                    }`}
                  >
                    {point.label}
                  </span>
                  <span className="text-[22px] font-bold tracking-tight">
                    {point.count.toLocaleString('ko-KR')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4">
            {metrics.map((metric) => (
              <button
                key={metric.label}
                type="button"
                onClick={metric.onClick}
                className="flex min-h-[128px] flex-col items-center justify-center gap-1.5 rounded-2xl py-5 transition-colors hover:bg-gray-50"
              >
                <span className="text-xs font-medium text-gray-500">
                  {metric.label}
                </span>
                <span className="flex items-baseline gap-1">
                  <span
                    className={`text-[30px] font-bold tracking-tight ${metric.colorClassName}`}
                  >
                    {metric.value}
                  </span>
                  <span
                    className={`text-base font-semibold ${metric.colorClassName}`}
                  >
                    {metric.unit}
                  </span>
                </span>
                <span className="text-xs text-gray-500">{metric.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-11 flex flex-col gap-3.5">
          <span className="text-base font-bold text-gray-900">바로가기</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <Link
                  key={group.groupKey}
                  to={group.items[0].path}
                  className="flex h-24 items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span
                    className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ${
                      QUICK_LINK_TINT_CLASS_NAME[group.groupKey]
                    }`}
                  >
                    <GroupIcon
                      className="h-[22px] w-[22px]"
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-base font-bold text-gray-900">
                      {group.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {group.description}
                    </span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
