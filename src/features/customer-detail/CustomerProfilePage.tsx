import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { Navigate, useParams } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { CustomerPaymentSection } from '@/features/customer-detail/CustomerPaymentSection';
import { CustomerCreditScoreTrendChart } from '@/features/customer-detail/CustomerCreditScoreTrendChart';
import { CustomerSearchBar } from '@/features/customer-detail/CustomerSearchBar';
import { CustomerReasonRadar } from '@/features/customer-detail/CustomerReasonRadar';
import { CustomerRiskScoreTrendChart } from '@/features/customer-detail/CustomerRiskScoreTrendChart';
import { CustomerTrendChart } from '@/features/customer-detail/CustomerTrendChart';
import { customers } from '@/data/customers';
import { maskName, maskPhoneNumber } from '@/utils/format';
import { getLastUsedAt, RISK_LEVEL_META } from '@/utils/risk';

export function CustomerProfilePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = customers.find((item) => item.id === customerId);
  const [lookupValue, setLookupValue] = useState(customerId ?? '');

  useEffect(() => {
    setLookupValue(customerId ?? '');
  }, [customerId]);

  if (!customer) {
    return <Navigate to="/customer-detail" replace />;
  }

  const mostRecentUsedAt = getLastUsedAt(customer) ?? '-';
  const latestCreditScore =
    customer.creditScoreHistory[customer.creditScoreHistory.length - 1]?.score;
  const latestMonthlyUsage =
    customer.monthly[customer.monthly.length - 1]?.usage;
  const profileChips = [
    { label: '성별·나이', value: `${customer.gender} · ${customer.age}세` },
    { label: '가입일', value: customer.joinedAt },
    { label: '최근 이용일', value: mostRecentUsedAt },
    {
      label: '신용점수',
      value: latestCreditScore === undefined ? '-' : `${latestCreditScore}점`,
    },
    {
      label: '이번 달 사용액',
      value:
        latestMonthlyUsage === undefined
          ? '-'
          : `${latestMonthlyUsage.toLocaleString('ko-KR')}만원`,
    },
  ];
  const riskTextColorClassName = RISK_LEVEL_META[
    customer.riskLevel
  ].dotColorClassName.replace('bg-', 'text-');

  const previousMonthScore =
    customer.riskScoreTrend[customer.riskScoreTrend.length - 2]?.score;
  const monthDelta =
    previousMonthScore === undefined
      ? null
      : customer.predictionScore - previousMonthScore;
  const earliestScore = customer.riskScoreTrend[0]?.score;

  return (
    <Screen>
      <PageHeading />

      <CustomerSearchBar
        value={lookupValue}
        onValueChange={setLookupValue}
        searchField="id"
        onSearchFieldChange={() => {}}
        disabled
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold text-gray-900">
              {maskName(customer.name)}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                RISK_LEVEL_META[customer.riskLevel].badgeClassName
              }`}
            >
              <RiskIndicator riskLevel={customer.riskLevel} />
              {RISK_LEVEL_META[customer.riskLevel].label}
            </span>
          </div>
          <div className="-mt-2 flex flex-wrap items-center gap-2.5 text-sm text-gray-500">
            <span>{customer.id}</span>
            <span className="h-3 w-px bg-gray-300" />
            <span>{customer.productName}</span>
            <span className="h-3 w-px bg-gray-300" />
            <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
              <Phone className="h-3.5 w-3.5 text-gray-500" aria-hidden />
              {maskPhoneNumber(customer.phoneNumber)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {profileChips.map((chip) => (
              <div
                key={chip.label}
                className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <span className="text-xs text-gray-500">{chip.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {chip.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-xl border border-border bg-white p-5 shadow-sm lg:col-span-1">
          <p className="text-sm font-semibold text-gray-500">이탈 예측 점수</p>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[44px] font-bold leading-none ${riskTextColorClassName}`}
            >
              {customer.predictionScore}
            </span>
            <span className="text-lg font-semibold text-gray-400">/ 100</span>
          </div>
          <div className="relative mt-2">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
              <div className="w-[40%] bg-green-200" />
              <div className="w-[30%] bg-yellow-200" />
              <div className="w-[30%] bg-red-200" />
            </div>
            <div
              className="absolute top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"
              style={{ left: `${customer.predictionScore}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            {monthDelta === null ? (
              '이전 달 데이터 없음'
            ) : (
              <>
                전월 대비{' '}
                <strong
                  className={monthDelta >= 0 ? 'text-red-600' : 'text-blue-600'}
                >
                  {monthDelta >= 0 ? '+' : ''}
                  {monthDelta}점
                </strong>
                {earliestScore !== undefined && (
                  <> · 3개월 전 {earliestScore}점</>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-base font-semibold text-gray-900">이용 추이</p>
        <CardGrid columns={3} breakpoint="lg">
          <Card title="카드 사용량 추이" description="기간별 사용액 추이">
            <CustomerTrendChart monthly={customer.monthly} />
          </Card>
          <Card
            title="신용점수 변동 추이"
            description="기간별 신용점수 추이 및 카드 발급 심사 기준선 (0~1000점)"
          >
            <CustomerCreditScoreTrendChart
              creditScoreHistory={customer.creditScoreHistory}
            />
          </Card>
          <Card
            title="이탈 스코어 변동 추이"
            description="최근 4개월 (과거 3개월 + 현재) 이탈 스코어 추이"
          >
            <CustomerRiskScoreTrendChart
              riskScoreTrend={customer.riskScoreTrend}
            />
          </Card>
        </CardGrid>
      </div>

      <CustomerPaymentSection customer={customer} />

      <CardGrid columns={2} breakpoint="lg">
        <Card title="이탈 이유 레이더" description="10개 이유별 기여 점수">
          <CustomerReasonRadar churnReasons={customer.churnReasons} />
        </Card>
        <Card title="이탈 이유 상세" description="점수 높은 순">
          <ul className="space-y-2.5">
            {customer.churnReasons.map((reason, reasonIndex) => (
              <li
                key={reason.label}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-4 text-xs text-gray-400">
                  {reasonIndex + 1}
                </span>
                <span className="flex-1 text-gray-700">{reason.label}</span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${reason.score}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-gray-900">
                  {reason.score}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </CardGrid>
    </Screen>
  );
}
