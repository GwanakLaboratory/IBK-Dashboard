import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import { Card } from '@/components/molecules/Card';
import { ECONOMIC_IMPACT, MONTHLY_TARGET_SPEND } from '@/data/marketing';

const BEFORE_COLOR = '#B8C2D3';
const AFTER_COLOR = '#466CFF';

const CALCULATION_BASIS = [
  {
    label: '이용대금 증감액',
    description: '마케팅 후 6개월 누적 이용대금 − 마케팅 전 6개월 누적',
  },
  {
    label: '유지 회원수',
    description: '이탈 예측 회원 중 6개월 내 이용을 유지한 인원',
  },
  {
    label: '손실 방지 추정액',
    description: '유지 회원수 × 1인당 연간 수익 기여(가정치)',
  },
];

export function EconomicImpactReport() {
  const lossPreventedEok =
    (ECONOMIC_IMPACT.retainedMembers *
      ECONOMIC_IMPACT.annualContributionPerMemberManwon) /
    10000;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white px-7 py-6 shadow-sm">
          <span className="text-sm font-semibold text-gray-600">
            이용대금 증감액
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[56px] font-bold leading-none tracking-tight text-primary">
              +{ECONOMIC_IMPACT.spendDeltaEok.toFixed(1)}
            </span>
            <span className="text-xl font-semibold text-gray-900">억 원</span>
          </div>
          <span className="text-xs text-gray-600">
            마케팅 대상 전후 6개월 누적 ·{' '}
            <strong className="text-primary">
              +{ECONOMIC_IMPACT.spendDeltaPercent}%
            </strong>
          </span>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white px-7 py-6 shadow-sm">
          <span className="text-sm font-semibold text-gray-600">
            유지 회원수
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[56px] font-bold leading-none tracking-tight text-green-700">
              {ECONOMIC_IMPACT.retainedMembers.toLocaleString('ko-KR')}
            </span>
            <span className="text-xl font-semibold text-gray-900">명</span>
          </div>
          <span className="text-xs text-gray-600">
            이탈 예측 대비 이용을 유지한 회원
          </span>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-sidebar px-7 py-6 text-white shadow-sm">
          <span className="text-sm font-semibold text-blue-300">
            손실 방지 추정액
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[56px] font-bold leading-none tracking-tight">
              {lossPreventedEok.toFixed(1)}
            </span>
            <span className="text-xl font-semibold">억 원</span>
          </div>
          <span className="text-xs text-topbar-muted">
            유지 회원 {ECONOMIC_IMPACT.retainedMembers.toLocaleString('ko-KR')}
            명 × 1인당 연간 수익 기여{' '}
            {ECONOMIC_IMPACT.annualContributionPerMemberManwon}만 원
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <Card
          title="월별 이용대금 추이 · 마케팅 대상 (억 원)"
          actions={
            <div className="flex gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: BEFORE_COLOR }}
                />
                마케팅 전
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: AFTER_COLOR }}
                />
                마케팅 후
              </span>
            </div>
          }
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MONTHLY_TARGET_SPEND}
                margin={{ top: 22, right: 4, bottom: 0, left: 4 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 13, fill: '#4b5563' }}
                  axisLine={{ stroke: '#e3e7ee' }}
                  tickLine={false}
                  interval={0}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={false}
                >
                  {MONTHLY_TARGET_SPEND.map((point) => (
                    <Cell
                      key={point.month}
                      fill={point.isAfter ? AFTER_COLOR : BEFORE_COLOR}
                    />
                  ))}
                  <LabelList
                    dataKey="amount"
                    position="top"
                    content={({ x, y, width, value, index }) => (
                      <text
                        x={Number(x) + Number(width) / 2}
                        y={Number(y) - 6}
                        textAnchor="middle"
                        fontSize={13}
                        fontWeight={600}
                        fill={
                          MONTHLY_TARGET_SPEND[Number(index)]?.isAfter
                            ? AFTER_COLOR
                            : '#4b5563'
                        }
                      >
                        {Number(value).toFixed(1)}
                      </text>
                    )}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="산출 기준">
          <div className="flex h-full flex-col gap-3">
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-gray-700">
              {CALCULATION_BASIS.map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <strong className="text-gray-900">{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
            <span className="mt-auto rounded-lg bg-amber-100 px-3 py-2.5 text-xs leading-normal text-amber-800">
              수치는 목데이터이며, 수익 기여 단가는 재무팀 기준값으로 교체 필요
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
