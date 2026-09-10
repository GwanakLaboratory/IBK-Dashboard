import { ChevronLeft } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { Card } from '@/components/molecules/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { CustomerReasonRadar } from '@/features/customer-detail/CustomerReasonRadar';
import { CustomerTrendChart } from '@/features/customer-detail/CustomerTrendChart';
import { customers } from '@/data/customers';

function formatAmount(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function CustomerProfilePage() {
  const { customerId } = useParams<{ customerId: string }>();
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    return <Navigate to="/customer-detail" replace />;
  }

  const actualQuarters = customer.quarterly.filter(
    (quarter) => !quarter.predicted,
  );
  const latestQuarter = actualQuarters[actualQuarters.length - 1];
  const previousQuarter = actualQuarters[actualQuarters.length - 2];
  const usageChangePercent =
    previousQuarter && latestQuarter
      ? ((latestQuarter.usage - previousQuarter.usage) /
          previousQuarter.usage) *
        100
      : 0;
  const riskScoreChange =
    previousQuarter && latestQuarter
      ? latestQuarter.riskScore - previousQuarter.riskScore
      : 0;

  return (
    <div>
      <Link
        to="/customer-detail"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        목록으로
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">{customer.id}</h2>
        <RiskBadge riskLevel={customer.riskLevel} />
        <span className="text-sm text-gray-500">
          예측점수 {customer.predictionScore}
        </span>
      </div>

      {latestQuarter && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard
            label={`${latestQuarter.quarter} 사용액`}
            value={`${latestQuarter.usage}만원`}
          />
          <StatCard
            label={
              previousQuarter
                ? `${previousQuarter.quarter} → ${latestQuarter.quarter} 사용 변화`
                : '사용 변화'
            }
            value={`${usageChangePercent >= 0 ? '+' : ''}${usageChangePercent.toFixed(1)}%`}
          />
          <StatCard
            label={`${latestQuarter.quarter} 위험점수`}
            value={`${latestQuarter.riskScore}점`}
          />
          <StatCard
            label="분기 위험도 변화"
            value={`${riskScoreChange >= 0 ? '+' : ''}${riskScoreChange}점`}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="카드 사용액 & 위험점수 추이"
          description="월별 실적 및 향후 3개월 예측 (점선 구간)"
        >
          <CustomerTrendChart monthly={customer.monthly} />
        </Card>
        <Card title="이탈 이유 레이더" description="10개 이유별 기여 점수">
          <CustomerReasonRadar churnReasons={customer.churnReasons} />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        <Card
          title="최근 결제 내역"
          description={`최근 ${customer.transactions.length}건`}
        >
          <ul className="divide-y divide-gray-100">
            {customer.transactions.map((transaction, transactionIndex) => (
              <li
                key={`${transaction.date}-${transactionIndex}`}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.merchant}
                  </p>
                  <p className="text-xs text-gray-400">
                    {transaction.date} · {transaction.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {formatAmount(transaction.amount)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      transaction.status === '승인'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
