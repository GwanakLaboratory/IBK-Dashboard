import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import type {
  MonthlyMemberActivityPoint,
  MonthlyRiskDistributionPoint,
} from '@/types/churn';

type RiskMemberFlowChartProps = {
  monthlyMemberActivity: MonthlyMemberActivityPoint[];
  monthlyRiskDistribution: MonthlyRiskDistributionPoint[];
};

const CURRENT_MONTH_COLOR = '#dc2626';
const PAST_MONTH_COLOR = '#f8b4b4';

export function RiskMemberFlowChart({
  monthlyMemberActivity,
  monthlyRiskDistribution,
}: RiskMemberFlowChartProps) {
  const flowData = useMemo(
    () =>
      monthlyMemberActivity.map((activity) => {
        const riskDistribution = monthlyRiskDistribution.find(
          (point) => point.month === activity.month,
        );
        const highRiskCount = riskDistribution
          ? Math.round((activity.activeMembers * riskDistribution.high) / 100)
          : 0;
        return {
          month: activity.month,
          highRiskCount,
          highRiskRatio: riskDistribution?.high ?? 0,
        };
      }),
    [monthlyMemberActivity, monthlyRiskDistribution],
  );
  const lastIndex = flowData.length - 1;

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={flowData}
          margin={{ top: 22, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis
            dataKey="month"
            axisLine={{ stroke: '#e3e7ee' }}
            tickLine={false}
            interval={0}
            height={40}
            tick={({ x, y, payload, index }) => (
              <g transform={`translate(${x},${y})`}>
                <text dy={12} textAnchor="middle" fontSize={12} fill="#4b5563">
                  {payload.value}
                </text>
                <text dy={27} textAnchor="middle" fontSize={12} fill="#6b7280">
                  {flowData[index]?.highRiskRatio}%
                </text>
              </g>
            )}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={({ active, label, payload }) => {
              if (!active || !payload?.length) {
                return null;
              }
              return (
                <div className="rounded-lg border border-white/40 bg-white/70 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {Number(payload[0]?.value).toLocaleString('ko-KR')}명
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="highRiskCount" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {flowData.map((point, index) => (
              <Cell
                key={point.month}
                fill={
                  index === lastIndex ? CURRENT_MONTH_COLOR : PAST_MONTH_COLOR
                }
              />
            ))}
            <LabelList
              dataKey="highRiskCount"
              position="top"
              content={({ x, y, width, value, index }) => {
                const isCurrent = index === lastIndex;
                return (
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) - 6}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={isCurrent ? 700 : 600}
                    fill={isCurrent ? '#b91c1c' : '#4b5563'}
                  >
                    {(Number(value) / 10000).toFixed(1)}만
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
