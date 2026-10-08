import { useState } from 'react';
import { DeltaBadge } from '@/components/domain/DeltaBadge';
import { RankBadge } from '@/components/domain/RankBadge';
import { PageHeader, UpdatedAtLabel } from '@/components/layout/PageHeader';
import { Dropdown } from '@/components/molecules/Dropdown';
import { Card } from '@/components/molecules/Card';
import { MonthSelect } from '@/components/molecules/MonthSelect';
import { Tabs } from '@/components/molecules/Tabs';
import {
  RiskTrendComboChart,
  RiskTrendLegend,
} from '@/features/overview/RiskTrendComboChart';
import {
  REASON_RISK_CHANGES,
  MONTHS,
  RISK_COUNTS,
  RISK_RATIOS,
  formatNumber,
  fullMonthLabel,
} from '@/data/overview';

/* 대시보드 · 고객 이탈 인사이트 (한 화면 요약) */

const TOP5_GRID = 'grid grid-cols-[40px_minmax(0,1fr)_90px_90px_90px_90px]';

export function OverviewPage() {
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1]);
  const [range, setRange] = useState<6 | 12>(6);
  const [unit, setUnit] = useState<'ratio' | 'count'>('ratio');
  const [metric, setMetric] = useState<'count' | 'ratio'>('count');

  const idx = MONTHS.indexOf(month);
  const updatedAt = `20${month.slice(0, 2)}.${String(Number(month.slice(3)) + 1).padStart(2, '0')}.01`;

  // KPI
  const risk = RISK_COUNTS[idx];
  const ratio = RISK_RATIOS[idx];
  const total = Math.round((risk / ratio) * 100);
  const prevRatio = RISK_RATIOS[idx - 1];
  const ratioDelta = ratio - prevRatio;

  // 추이
  const start = Math.max(0, idx - range + 1);

  // 이탈 사유별 위험 고객 (TOP 5는 이번 달 고객 수와 전월 대비 증감)
  const curScale = RISK_COUNTS[idx] / RISK_COUNTS[11];
  const prevScale = RISK_COUNTS[idx - 1] / RISK_COUNTS[10];
  const reasons = REASON_RISK_CHANGES.map(([name, prev, cur]) => ({
    name,
    prev: Math.round(prev * prevScale),
    cur: Math.round(cur * curScale),
  }));
  const groups = reasons.map((reason) => ({
    name: reason.name,
    count: reason.cur,
    ratio: (reason.cur / RISK_COUNTS[idx]) * 100,
  }));
  const maxGroupCount = Math.max(...groups.map((group) => group.count));
  const topRows = [...reasons].sort(
    (a, b) => b.cur - b.prev - (a.cur - a.prev),
  );

  return (
    <>
      <PageHeader
        section="status"
        titleSize="lg"
        actions={
          <div className="flex items-center gap-3.5">
            <UpdatedAtLabel date={updatedAt} />
            <MonthSelect
              options={MONTHS.slice(6)
                .reverse()
                .map((option) => ({
                  value: option,
                  label: fullMonthLabel(option),
                }))}
              value={month}
              onChange={setMonth}
            />
          </div>
        }
      />

      {/* 핵심 지표 */}
      <div className="grid grid-cols-[minmax(0,1fr)_max-content_minmax(0,0.8fr)] rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-center gap-2.5 px-6 py-5">
          <span className="text-lg font-bold text-blue-700">
            최근 2개월 이용 고객
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold leading-none tracking-tight">
              {formatNumber(total)}
            </span>
            <span className="text-xl font-bold">명</span>
          </div>
          <span className="text-xs text-gray-600">
            직전 2개월 신용카드 이용실적이 있는 고객
          </span>
          <span className="inline-flex h-7 items-center self-start rounded-full bg-slate-100 px-2.5 text-xs text-gray-600">
            전체 카드 고객의 100% 기준치 아님
          </span>
        </div>

        <div className="flex flex-col justify-center gap-3 border-x border-slate-100 px-6 py-5">
          <span className="text-lg font-bold">최근 이용 고객 구성</span>
          <div className="flex items-baseline justify-between">
            <CompositionValue
              label="이탈 위험 고객"
              value={risk}
              dotClassName="bg-red-500"
              labelClassName="text-red-700"
              valueClassName="text-red-600"
            />
            <CompositionValue
              label="위험 외 고객"
              value={total - risk}
              dotClassName="bg-blue-700"
              labelClassName="text-blue-800"
              valueClassName="text-blue-700"
            />
          </div>
          <div className="flex h-8 gap-0.5 overflow-hidden rounded-lg text-xs font-bold text-white">
            <div
              className="flex min-w-16 shrink-0 items-center justify-center whitespace-nowrap bg-red-500"
              style={{ width: `${ratio}%` }}
            >
              {ratio.toFixed(1)}%
            </div>
            <div className="flex min-w-16 grow items-center justify-center bg-blue-700">
              {(100 - ratio).toFixed(1)}%
            </div>
          </div>
          <span className="whitespace-nowrap text-xs text-gray-600">
            최근 2개월 이용 고객{' '}
            <strong className="text-slate-900">{formatNumber(total)}명</strong>{' '}
            중{' '}
            <strong className="text-red-600">
              {formatNumber(risk)}명({ratio.toFixed(1)}%)
            </strong>
            이 이번 달 미이용 위험으로 예측됩니다.
          </span>
        </div>

        <div className="flex flex-col justify-center gap-3 px-6 py-5">
          <span className="text-lg font-bold text-red-700">위험 비중</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-bold leading-none tracking-tight">
              {ratio.toFixed(1)}
            </span>
            <span className="text-xl font-bold">%</span>
          </div>
          <div className="flex items-center gap-2">
            <DeltaBadge delta={ratioDelta} size="md" />
            <span className="text-xs text-gray-500">
              (전월 {prevRatio.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 추이 */}
      <Card
        title="이탈 위험 고객 추이"
        titleSize="lg"
        gapClassName="gap-2.5"
        className="pb-3"
        actions={
          <div className="flex items-center gap-6">
            <RiskTrendLegend />
            <Dropdown
              label="추이 기간"
              size="sm"
              align="right"
              value={String(range)}
              onChange={(value) => setRange(Number(value) as 6 | 12)}
              options={[
                { value: '6', label: '최근 6개월' },
                { value: '12', label: '최근 12개월' },
              ]}
              className="w-32"
            />
          </div>
        }
        titleAddon={
          <Tabs
            label="표시 기준"
            tabs={[
              { key: 'count', label: '고객 수' },
              { key: 'ratio', label: '위험 비중' },
            ]}
            value={metric}
            onChange={setMetric}
          />
        }
      >
        <div className="-mb-1.5 flex justify-between text-2xs text-gray-500">
          <span>고객 수 (명)</span>
          <span>위험 비중 (%)</span>
        </div>
        <RiskTrendComboChart
          months={MONTHS.slice(start, idx + 1)}
          counts={RISK_COUNTS.slice(start, idx + 1)}
          ratios={RISK_RATIOS.slice(start, idx + 1)}
          focus={metric}
        />
      </Card>

      {/* 하단 */}
      <div className="grid shrink-0 grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-4">
        <Card
          title="주요 이탈 사유별 이탈 위험 비중"
          titleSize="lg"
          actions={
            <Tabs
              label="표시 단위"
              tabs={[
                { key: 'count', label: '고객 수' },
                { key: 'ratio', label: '비중' },
              ]}
              value={unit}
              onChange={setUnit}
            />
          }
        >
          <ul className="flex grow flex-col justify-around gap-1.5">
            {groups.map((group, index) => {
              const isTop = index === 0;
              const width =
                unit === 'ratio'
                  ? group.ratio
                  : (group.count / maxGroupCount) * 100;
              return (
                <li
                  key={group.name}
                  className="grid min-h-8 grid-cols-[22px_164px_minmax(0,1fr)_72px] items-center gap-3"
                >
                  <RankBadge rank={index + 1} />
                  <span
                    className={`whitespace-nowrap text-xs text-gray-900 ${isTop ? 'font-bold' : 'font-medium'}`}
                  >
                    {group.name}
                  </span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${isTop ? 'bg-red-500' : 'bg-blue-300'}`}
                      style={{ width: `${width.toFixed(1)}%` }}
                    />
                  </div>
                  <span
                    className={`text-right text-sm font-bold ${isTop ? 'text-red-600' : 'text-gray-900'}`}
                  >
                    {unit === 'ratio'
                      ? `${group.ratio.toFixed(1)}%`
                      : `${formatNumber(group.count)}명`}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title="전월 대비 위험 증감 TOP5"
          titleSize="lg"
          titleAddon={
            <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600">
              고객 수
            </span>
          }
        >
          <div className="flex flex-col">
            <div
              className={`${TOP5_GRID} h-8 items-center gap-2 border-b border-slate-200 px-1 text-xs font-semibold text-slate-500`}
            >
              <span>순위</span>
              <span>이탈 사유</span>
              <span className="text-right">전월</span>
              <span className="text-right">이번 달</span>
              <span className="text-right">증감</span>
              <span className="text-right">증감률</span>
            </div>
            {topRows.map((row, index) => (
              <div
                key={row.name}
                className={`${TOP5_GRID} h-10 items-center gap-2 border-b border-slate-100 px-1 text-xs`}
              >
                <RankBadge rank={index + 1} highlight="dark" size="md" />
                <span className="truncate font-semibold text-slate-900">
                  {row.name}
                </span>
                <span className="text-right text-slate-500">
                  {formatNumber(row.prev)}
                </span>
                <span className="text-right font-semibold text-slate-900">
                  {formatNumber(row.cur)}
                </span>
                <span className="text-right font-bold text-red-600">
                  +{formatNumber(row.cur - row.prev)}
                </span>
                <span className="text-right font-bold text-red-600">
                  +{(((row.cur - row.prev) / row.prev) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function CompositionValue({
  label,
  value,
  dotClassName,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: number;
  dotClassName: string;
  labelClassName: string;
  valueClassName: string;
}) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${labelClassName}`}
      >
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
        {label}
      </span>
      <span
        className={`whitespace-nowrap text-2xl font-bold leading-none tracking-tight ${valueClassName}`}
      >
        {formatNumber(value)}
        <span className="ml-1 text-sm font-semibold">명</span>
      </span>
    </div>
  );
}
