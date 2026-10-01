import { ArrowRight } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/molecules/Card';
import { ChurnTrendWithCampaigns } from '@/features/performance/ChurnTrendWithCampaigns';
import { RiskBadge } from '@/components/domain/RiskBadge';
import {
  CHANNEL_RESPONSE_RATES,
  CONTACT_HISTORY_SUMMARY,
  CONVERSION_AFTER_PERIOD,
  CONVERSION_BEFORE_PERIOD,
  CONVERSION_RISK_SHARE,
  CONVERSION_TARGET_COUNT,
  type ContactChannel,
} from '@/data/marketing';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const CHANNEL_BAR_COLOR: Record<ContactChannel, string> = {
  텔레마케팅: '#5B21B6',
  카카오: '#CA8A04',
  문자: '#1E40AF',
};

type RiskShareDonutProps = {
  period: 'before' | 'after';
};

function RiskShareDonut({ period }: RiskShareDonutProps) {
  const slices = RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => ({
    riskLevel,
    share: CONVERSION_RISK_SHARE[riskLevel][period],
  }));
  const isAfter = period === 'after';

  return (
    <div className="flex flex-col items-center gap-2.5">
      <span
        className={`text-xs font-bold ${isAfter ? 'text-primary' : 'text-gray-600'}`}
      >
        {isAfter
          ? `AFTER · ${CONVERSION_AFTER_PERIOD}`
          : `BEFORE · ${CONVERSION_BEFORE_PERIOD}`}
      </span>
      <div className="relative h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="share"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell
                  key={slice.riskLevel}
                  fill={RISK_LEVEL_META[slice.riskLevel].chartColor}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-600">위험 비중</span>
          <span
            className={`text-[32px] font-bold ${isAfter ? 'text-green-700' : 'text-red-700'}`}
          >
            {CONVERSION_RISK_SHARE.high[period]}%
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskShareDiff({ riskLevel }: { riskLevel: RiskLevel }) {
  const { before, after } = CONVERSION_RISK_SHARE[riskLevel];
  const diff = after - before;
  // 저위험은 늘어야, 위험·중위험은 줄어야 개선이다.
  const isImproved = riskLevel === 'low' ? diff > 0 : diff < 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-gray-50 px-4 py-3.5">
      <RiskBadge riskLevel={riskLevel} />
      <span className="text-sm text-gray-700">
        {before}% → <strong className="text-lg text-gray-900">{after}%</strong>
      </span>
      <span
        className={`text-xs font-bold ${isImproved ? 'text-green-700' : 'text-gray-600'}`}
      >
        {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}%p
      </span>
    </div>
  );
}

export function ConversionReport() {
  const responseRate =
    (CONTACT_HISTORY_SUMMARY.responded / CONTACT_HISTORY_SUMMARY.total) * 100;

  return (
    <div className="flex flex-col gap-14">
      <ChurnTrendWithCampaigns />

      <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card
          title={`마케팅 전후 위험도 분포 · 대상 ${CONVERSION_TARGET_COUNT.toLocaleString('ko-KR')}명`}
          description="6개월 단위 비교"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center justify-around gap-4 md:flex-row">
              <RiskShareDonut period="before" />
              <div className="flex flex-col items-center gap-1.5 text-primary">
                <ArrowRight className="h-6 w-10" strokeWidth={2.2} />
                <span className="text-xs font-bold">마케팅 실행</span>
              </div>
              <RiskShareDonut period="after" />
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => (
                <RiskShareDiff key={riskLevel} riskLevel={riskLevel} />
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-10">
          <Card title="반응률">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-baseline gap-1.5 text-primary">
                <span className="text-5xl font-bold leading-none">
                  {responseRate.toFixed(1)}
                </span>
                <span className="text-lg font-semibold">%</span>
              </div>
              <div className="flex h-3.5 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(CONTACT_HISTORY_SUMMARY.responded / CONTACT_HISTORY_SUMMARY.total) * 100}%`,
                  }}
                />
                <div
                  className="bg-sky-400"
                  style={{
                    width: `${(CONTACT_HISTORY_SUMMARY.pending / CONTACT_HISTORY_SUMMARY.total) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5 text-gray-900">
                  <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
                  반응{' '}
                  <strong>
                    {CONTACT_HISTORY_SUMMARY.responded.toLocaleString('ko-KR')}
                    명
                  </strong>
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" />
                  대기{' '}
                  <strong className="text-gray-900">
                    {CONTACT_HISTORY_SUMMARY.pending.toLocaleString('ko-KR')}명
                  </strong>
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gray-300" />
                  무반응{' '}
                  <strong className="text-gray-900">
                    {CONTACT_HISTORY_SUMMARY.noResponse.toLocaleString('ko-KR')}
                    명
                  </strong>
                </span>
              </div>
            </div>
          </Card>

          <Card title="채널별 반응률">
            <div className="flex flex-col gap-3.5">
              {CHANNEL_RESPONSE_RATES.map((item) => (
                <div
                  key={item.channel}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-[84px] font-semibold text-gray-900">
                    {item.channel}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    {/* 반응률 50%를 막대 끝으로 잡아 채널 간 차이가 잘 보이게 한다 */}
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(item.rate * 2, 100)}%`,
                        backgroundColor: CHANNEL_BAR_COLOR[item.channel],
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-gray-900">
                    {item.rate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
