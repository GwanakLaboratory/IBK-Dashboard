import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  TrendPeriodFilter,
  type TrendPeriodMonths,
} from '@/features/customer-detail/TrendPeriodFilter';
import type { CreditScoreHistoryPoint } from '@/types/churn';

type CustomerCreditScoreTrendChartProps = {
  creditScoreHistory: CreditScoreHistoryPoint[];
};

const SCORE_COLOR = '#466CFF';
const MIN_ISSUANCE_COLOR = '#f59e0b';
const STABLE_APPROVAL_COLOR = '#9ca3af';

// IBK 카드 발급 심사 기준 (KCB 점수 기준)
const MIN_ISSUANCE_SCORE = 621; // 최소 발급 요건
const STABLE_APPROVAL_SCORE = 700; // 안정적 승인 구간

export function CustomerCreditScoreTrendChart({
  creditScoreHistory,
}: CustomerCreditScoreTrendChartProps) {
  const [periodMonths, setPeriodMonths] = useState<TrendPeriodMonths>(12);
  const visibleHistory = creditScoreHistory.slice(-periodMonths);

  return (
    <div>
      <TrendPeriodFilter value={periodMonths} onChange={setPeriodMonths} />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="95%">
          <LineChart
            data={visibleHistory}
            margin={{ top: 8, right: 28, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 1000]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              content={({ active, label, payload }) => {
                const score = payload?.[0]?.value;
                if (!active || score == null) {
                  return null;
                }

                return (
                  <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-sm text-gray-900">
                      신용점수: <span className="font-semibold">{score}점</span>
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={STABLE_APPROVAL_SCORE}
              stroke={STABLE_APPROVAL_COLOR}
              strokeDasharray="4 4"
              label={{
                value: `안정 승인 ${STABLE_APPROVAL_SCORE}점`,
                position: 'insideBottomRight',
                fontSize: 11,
                fill: STABLE_APPROVAL_COLOR,
              }}
            />
            <ReferenceLine
              y={MIN_ISSUANCE_SCORE}
              stroke={MIN_ISSUANCE_COLOR}
              strokeDasharray="4 4"
              label={{
                value: `발급 최소기준 ${MIN_ISSUANCE_SCORE}점`,
                position: 'insideBottomRight',
                fontSize: 11,
                fill: MIN_ISSUANCE_COLOR,
              }}
            />
            <Line
              dataKey="score"
              name="신용점수"
              stroke={SCORE_COLOR}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
