import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  Percent,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { Tabs } from '@/components/molecules/Tabs';
import { RiskDistributionChart } from '@/features/dashboard/RiskDistributionChart';
import { RiskMemberFlowChart } from '@/features/dashboard/RiskMemberFlowChart';
import { SummaryMetricIndexChart } from '@/features/dashboard/SummaryMetricIndexChart';
import { SummaryMetricTrendChart } from '@/features/dashboard/SummaryMetricTrendChart';
import {
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
} from '@/data/customers';
import type { RiskLevel } from '@/types/churn';
import { StatCard } from '@/components/molecules/StatCard';

type SummaryMetricKey = 'usage' | 'members' | 'signup';
type SummaryMetricTab = 'all' | SummaryMetricKey;

// 전체 보기에서 지표마다 쓰는 고정 색 (카드 사용액은 단일 차트와 같은 파랑)
const SUMMARY_METRIC_OPTIONS: {
  key: SummaryMetricKey;
  label: string;
  color: string;
}[] = [
  { key: 'usage', label: '카드 사용액', color: '#1B4FD8' },
  { key: 'members', label: '이용 가능 회원', color: '#EB6834' },
  { key: 'signup', label: '신규 가입자', color: '#1BAF7A' },
];

function scrollToSection(sectionId: string) {
  document
    .getElementById(sectionId)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [summaryMetricTab, setSummaryMetricTab] =
    useState<SummaryMetricTab>('all');

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const sectionId = location.hash.slice(1);
    scrollToSection(sectionId);
  }, [location.hash]);

  const latestUsage = monthlyTotalUsage[monthlyTotalUsage.length - 1];
  const previousUsage = monthlyTotalUsage[monthlyTotalUsage.length - 2];
  const latestActivity =
    monthlyMemberActivity[monthlyMemberActivity.length - 1];
  const previousActivity =
    monthlyMemberActivity[monthlyMemberActivity.length - 2];
  const latestRiskDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
  const previousRiskDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 2];
  const earliestActivity = monthlyMemberActivity[0];
  const earliestRiskDistribution = monthlyRiskDistribution[0];

  const latestHighRiskCount = Math.round(
    (latestActivity.activeMembers * latestRiskDistribution.high) / 100,
  );
  const previousHighRiskCount = Math.round(
    (previousActivity.activeMembers * previousRiskDistribution.high) / 100,
  );
  const earliestHighRiskCount = Math.round(
    (earliestActivity.activeMembers * earliestRiskDistribution.high) / 100,
  );
  const latestRiskCounts: Record<RiskLevel, number> = {
    high: latestHighRiskCount,
    medium: Math.round(
      (latestActivity.activeMembers * latestRiskDistribution.mid) / 100,
    ),
    low: Math.round(
      (latestActivity.activeMembers * latestRiskDistribution.low) / 100,
    ),
  };

  const previousRiskCounts: Record<RiskLevel, number> = {
    high: previousHighRiskCount,
    medium: Math.round(
      (previousActivity.activeMembers * previousRiskDistribution.mid) / 100,
    ),
    low: Math.round(
      (previousActivity.activeMembers * previousRiskDistribution.low) / 100,
    ),
  };

  const usageDeltaPercent =
    ((latestUsage.usage - previousUsage.usage) / previousUsage.usage) * 100;
  const activeMembersDelta =
    latestActivity.activeMembers - previousActivity.activeMembers;
  const newSignupsDelta =
    latestActivity.newSignups - previousActivity.newSignups;
  const monthlyChurnRate =
    (latestActivity.canceledMembers / latestActivity.activeMembers) * 100;
  const previousMonthlyChurnRate =
    (previousActivity.canceledMembers / previousActivity.activeMembers) * 100;
  const monthlyChurnRateDeltaPp = monthlyChurnRate - previousMonthlyChurnRate;
  const highRiskCountDelta = latestHighRiskCount - previousHighRiskCount;
  const highRiskCountYearDeltaPercent =
    ((latestHighRiskCount - earliestHighRiskCount) / earliestHighRiskCount) *
    100;

  const statTiles: {
    label: string;
    value: string;
    unit: string;
    sub: string;
    Icon: LucideIcon;
    isRisk?: boolean;
    onClick: () => void;
  }[] = [
    {
      label: '월 카드 사용액',
      value: (latestUsage.usage / 10000).toFixed(1),
      unit: '억원',
      sub: `전월 대비 ${usageDeltaPercent >= 0 ? '+' : ''}${usageDeltaPercent.toFixed(1)}%`,
      Icon: CreditCard,
      onClick: () => navigate('/dashboard/trend', { state: { tab: 'usage' } }),
    },
    {
      label: '이용 가능 회원 수',
      value: latestActivity.activeMembers.toLocaleString('ko-KR'),
      unit: '명',
      sub: `전월 대비 ${activeMembersDelta >= 0 ? '+' : ''}${activeMembersDelta.toLocaleString('ko-KR')}`,
      Icon: Users,
      onClick: () =>
        navigate('/dashboard/trend', { state: { tab: 'members' } }),
    },
    {
      label: '신규 가입자 수',
      value: latestActivity.newSignups.toLocaleString('ko-KR'),
      unit: '명',
      sub: `전월 대비 ${newSignupsDelta >= 0 ? '+' : ''}${newSignupsDelta.toLocaleString('ko-KR')}`,
      Icon: UserPlus,
      onClick: () =>
        navigate('/dashboard/trend', { state: { tab: 'members' } }),
    },
    {
      label: '월 이탈률',
      value: monthlyChurnRate.toFixed(2),
      unit: '%',
      sub: `전월 대비 ${monthlyChurnRateDeltaPp >= 0 ? '+' : ''}${monthlyChurnRateDeltaPp.toFixed(2)}%p`,
      Icon: Percent,
      isRisk: true,
      onClick: () => navigate('/dashboard/churn'),
    },
    {
      label: '위험군 회원수',
      value: latestHighRiskCount.toLocaleString('ko-KR'),
      unit: '명',
      sub: `전월 대비 ${highRiskCountDelta >= 0 ? '+' : ''}${highRiskCountDelta.toLocaleString('ko-KR')}`,
      Icon: AlertTriangle,
      isRisk: true,
      onClick: () => scrollToSection('section-risk-summary'),
    },
  ];

  const summaryTrendData: Record<
    SummaryMetricKey,
    {
      data: { month: string; value: number }[];
      valueFormatter: (value: number) => string;
    }
  > = {
    usage: {
      data: monthlyTotalUsage.map((point) => ({
        month: point.month,
        value: point.usage / 10000,
      })),
      valueFormatter: (value) => `${value.toFixed(1)}억원`,
    },
    members: {
      data: monthlyMemberActivity.map((point) => ({
        month: point.month,
        value: point.activeMembers,
      })),
      valueFormatter: (value) => `${value.toLocaleString('ko-KR')}명`,
    },
    signup: {
      data: monthlyMemberActivity.map((point) => ({
        month: point.month,
        value: point.newSignups,
      })),
      valueFormatter: (value) => `${value.toLocaleString('ko-KR')}명`,
    },
  };

  return (
    <Screen>
      <PageHeading />

      <CardGrid columns={5} breakpoint="lg">
        {statTiles.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={tile.value}
            unit={tile.unit}
            helperText={tile.sub}
            Icon={tile.Icon}
            indicator={tile.isRisk}
            onClick={tile.onClick}
          />
        ))}
      </CardGrid>

      <CardGrid columns={1}>
        <Card
          title="주요 지표 추이"
          description="최근 12개월 · 월별"
          seeMoreHref="/dashboard/trend"
          actions={
            <Tabs
              variant="segmented"
              tabs={[{ key: 'all', label: '전체' }, ...SUMMARY_METRIC_OPTIONS]}
              value={summaryMetricTab}
              onChange={setSummaryMetricTab}
            />
          }
        >
          {summaryMetricTab === 'all' ? (
            <SummaryMetricIndexChart
              series={SUMMARY_METRIC_OPTIONS.map((option) => ({
                ...option,
                ...summaryTrendData[option.key],
              }))}
            />
          ) : (
            <SummaryMetricTrendChart
              data={summaryTrendData[summaryMetricTab].data}
              valueFormatter={summaryTrendData[summaryMetricTab].valueFormatter}
            />
          )}
        </Card>
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          id="section-risk-summary"
          title="위험도 분포"
          description={`전체 회원의 위험도별 구성비 · 20${latestActivity.month} 기준`}
        >
          <RiskDistributionChart
            countsByRiskLevel={latestRiskCounts}
            previousCountsByRiskLevel={previousRiskCounts}
            totalCustomerCount={latestActivity.activeMembers}
            previousTotalCustomerCount={previousActivity.activeMembers}
          />
        </Card>
        <Card
          title="위험군 규모 · 최근 3개월"
          description={`전체 회원의 ${latestRiskDistribution.high}%`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-7">
            <div className="flex shrink-0 flex-col gap-3 sm:w-[170px]">
              <div className="flex items-baseline gap-1">
                <span className="text-[32px] font-bold tracking-tight text-red-700">
                  {latestHighRiskCount.toLocaleString('ko-KR')}
                </span>
                <span className="text-sm font-semibold text-gray-900">명</span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">전월 대비</span>
                  <strong className="text-red-700">
                    {highRiskCountDelta >= 0 ? '+' : ''}
                    {highRiskCountDelta.toLocaleString('ko-KR')}
                  </strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">12개월 전 대비</span>
                  <strong className="text-red-700">
                    {highRiskCountYearDeltaPercent >= 0 ? '+' : ''}
                    {highRiskCountYearDeltaPercent.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <RiskMemberFlowChart
                monthlyMemberActivity={monthlyMemberActivity.slice(-3)}
                monthlyRiskDistribution={monthlyRiskDistribution}
              />
            </div>
          </div>
        </Card>
      </CardGrid>
    </Screen>
  );
}
