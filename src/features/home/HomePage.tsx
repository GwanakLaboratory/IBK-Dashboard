import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { NAV_GROUPS } from '@/config/navigation';
import {
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
} from '@/data/customers';

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

  const metrics = [
    {
      label: '위험군 회원',
      value: `${latestHighRiskCount.toLocaleString('ko-KR')}명`,
      colorClassName: 'text-red-500',
      onClick: () => navigate('/dashboard#section-risk-summary'),
    },
    {
      label: '전체 이탈률',
      value: `${overallChurnRate.toFixed(1)}%`,
      colorClassName: 'text-primary',
      onClick: () => navigate('/dashboard/trend', { state: { tab: 'churn' } }),
    },
    {
      label: '이용 가능 회원수',
      value: `${latestActivity.activeMembers.toLocaleString('ko-KR')}명`,
      colorClassName: 'text-primary',
      onClick: () =>
        navigate('/dashboard/trend', { state: { tab: 'members' } }),
    },
    {
      label: '전체 카드 사용액',
      value: `${(latestUsage.usage / 10000).toFixed(1)}억원`,
      colorClassName: 'text-emerald-600',
      onClick: () => navigate('/dashboard/trend', { state: { tab: 'usage' } }),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <section className="relative -mx-10 -mt-8 flex h-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-sidebar to-sidebar px-10 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-widest text-topbar-muted">
          이탈 리스크 관리의 시작
        </p>
        <h1 className="relative mt-3 text-3xl font-bold leading-snug">
          IBK 카드 리스크 인사이트
        </h1>
      </section>

      <div className="relative -mt-16 rounded-2xl border border-border bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            위험군 회원 추이
          </p>
          <p className="text-xs text-gray-400">
            기준월 {formatReferenceMonth(latestActivity.month)} · 명
          </p>
        </div>

        <div className="mt-4 flex items-center">
          {riskMemberTrend.map((point, index) => {
            const isLast = index === riskMemberTrend.length - 1;
            return (
              <div key={point.month} className="flex flex-1 items-center">
                <div
                  className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-full py-3 text-center transition-colors ${
                    isLast
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <span
                    className={`text-[11px] font-medium ${
                      isLast ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {point.label}
                  </span>
                  <span className="text-base font-bold">
                    {point.count.toLocaleString('ko-KR')}
                  </span>
                </div>
                {index < riskMemberTrend.length - 1 && (
                  <div className="h-px w-3 shrink-0 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 divide-y divide-gray-100 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {metrics.map((metric) => (
            <button
              key={metric.label}
              type="button"
              onClick={metric.onClick}
              className="flex flex-col items-center gap-1 py-4 text-center transition-opacity hover:opacity-70"
            >
              <span className={`text-xl font-bold ${metric.colorClassName}`}>
                {metric.value}
              </span>
              <span className="text-xs text-gray-500">{metric.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-sm font-semibold text-gray-900">바로가기</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {NAV_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <Link
                key={group.groupKey}
                to={group.items[0].path}
                className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GroupIcon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {group.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
