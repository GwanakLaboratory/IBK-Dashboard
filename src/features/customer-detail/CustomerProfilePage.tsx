import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { Card } from '@/components/molecules/Card';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { CustomerSearchBar } from '@/features/customer-detail/CustomerSearchBar';
import { CustomerReasonRadar } from '@/features/customer-detail/CustomerReasonRadar';
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
      { label: '주민번호', value: customer.residentNumber },
      { label: '전화번호', value: customer.phoneNumber },
      { label: '예측점수', value: `${customer.predictionScore}점` },
      {
        label: '위험도',
        node: (
          <span className="mt-1 flex items-center gap-1.5">
            <RiskIndicator riskLevel={customer.riskLevel} />
            <span className="text-sm font-medium text-gray-900">
              {RISK_LEVEL_META[customer.riskLevel].label}
            </span>
          </span>
        ),
      },
      { label: '카드 상품', value: customer.cardProduct },
      { label: '가입일', value: customer.joinedAt },
      { label: '최근 이용일', value: mostRecentUsedAt },
      { label: '성별', value: customer.gender },
      { label: '나이', value: `${customer.age}세` },
    ];

  return (
    <div>
      <PageHeading title="회원 상세 정보" />

      <CustomerSearchBar value={lookupValue} onValueChange={setLookupValue} />

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
          title="카드 사용액 & 위험점수 추이"
          description="월별 실적 및 향후 3개월 예측 (점선 구간)"
        >
          <CustomerTrendChart monthly={customer.monthly} />
        </Card>
        <Card title="이탈 이유 레이더" description="10개 이유별 기여 점수">
          <CustomerReasonRadar churnReasons={customer.churnReasons} />
        </Card>
      </CardGrid>

      <CardGrid columns={1}>
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
