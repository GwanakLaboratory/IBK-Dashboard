import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Gauge } from 'lucide-react';
import { Navigate, useParams } from 'react-router';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { CustomerSearchBar } from '@/features/customer-detail/CustomerSearchBar';
import { CustomerReasonRadar } from '@/features/customer-detail/CustomerReasonRadar';
import { CustomerRiskScoreTrendChart } from '@/features/customer-detail/CustomerRiskScoreTrendChart';
import { CustomerTrendChart } from '@/features/customer-detail/CustomerTrendChart';
import { customers } from '@/data/customers';
import { maskName } from '@/utils/format';
import { RISK_LEVEL_META } from '@/utils/risk';

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

  const mostRecentUsedAt = customer.transactions.reduce(
    (latestDate, transaction) =>
      transaction.date > latestDate ? transaction.date : latestDate,
    customer.transactions[0]?.date ?? '-',
  );

  const memberInfoItems: { label: string; value?: string; node?: ReactNode }[] =
    [
      { label: '이름', value: maskName(customer.name) },
      { label: '회원 고유번호', value: customer.id },
      { label: '전화번호', value: customer.phoneNumber },
      { label: '카드 상품', value: customer.cardProduct },
      { label: '가입일', value: customer.joinedAt },
      { label: '최근 이용일', value: mostRecentUsedAt },
      { label: '성별', value: customer.gender },
      { label: '나이', value: `${customer.age}세` },
    ];
  const riskIconColorClassName = RISK_LEVEL_META[
    customer.riskLevel
  ].dotColorClassName.replace('bg-', 'text-');

  return (
    <div>
      <PageHeading title="회원 상세 정보" />

      <CustomerSearchBar value={lookupValue} onValueChange={setLookupValue} />

      <CardGrid columns={2} breakpoint="lg">
        <StatCard
          label="이탈 예측 점수"
          value={`${customer.predictionScore}점`}
          Icon={Gauge}
        />
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">위험도</p>
            <div className="flex items-center gap-2">
              <RiskIndicator riskLevel={customer.riskLevel} />
              <p className="text-xl font-semibold text-gray-900">
                {RISK_LEVEL_META[customer.riskLevel].label}
              </p>
            </div>
          </div>
          <AlertTriangle className={`h-6 w-6 ${riskIconColorClassName}`} />
        </div>
      </CardGrid>

      <CardGrid columns={1}>
        <Card title="회원 정보">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {memberInfoItems.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-500">{item.label}</p>
                {item.node ?? (
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </CardGrid>

      <CardGrid columns={2} breakpoint="lg">
        <Card
          title="카드 사용량 추이"
          description="최근 10개월 (과거 9개월 + 현재) 사용액 추이"
        >
          <CustomerTrendChart monthly={customer.monthly} />
        </Card>
        <Card
          title="이탈 스코어 변동 추이"
          description="최근 4개월 (과거 3개월 + 현재) 이탈 스코어 추이"
        >
          <CustomerRiskScoreTrendChart
            riskScoreTrend={customer.riskScoreTrend}
          />
        </Card>
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
                    className="h-full rounded-full bg-gray-400"
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
    </div>
  );
}
