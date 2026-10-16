import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
} from '@/data/overview';
import { churnReasonLabel } from '@/i18n/domain';
import { formatFullMonth, formatNumber } from '@/i18n/format';

/* 대시보드 · 고객 이탈 인사이트 (한 화면 요약) */

const TOP5_GRID = 'grid grid-cols-[40px_minmax(0,1fr)_90px_90px_90px_90px]';

export function OverviewPage() {
  const { t } = useTranslation();
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
                  label: formatFullMonth(option),
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
            {t('overview.kpi.activeCustomers.label')}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold leading-none tracking-tight">
              {formatNumber(total)}
            </span>
            <span className="text-xl font-bold">
              {t('common.unit.peopleSuffix')}
            </span>
          </div>
          <span className="text-xs text-gray-600">
            {t('overview.kpi.activeCustomers.description')}
          </span>
          <span className="inline-flex h-7 items-center self-start rounded-full bg-slate-100 px-2.5 text-xs text-gray-600">
            {t('overview.kpi.activeCustomers.note')}
          </span>
        </div>

        <div className="flex flex-col justify-center gap-3 border-x border-slate-100 px-6 py-5">
          <span className="text-lg font-bold">
            {t('overview.kpi.composition.label')}
          </span>
          <div className="flex items-baseline justify-between">
            <CompositionValue
              label={t('overview.kpi.composition.atRisk')}
              value={risk}
              dotClassName="bg-red-500"
              labelClassName="text-red-700"
              valueClassName="text-red-600"
            />
            <CompositionValue
              label={t('overview.kpi.composition.notAtRisk')}
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
            <Trans
              i18nKey="overview.kpi.composition.summary"
              values={{
                total: formatNumber(total),
                risk: formatNumber(risk),
                ratio: ratio.toFixed(1),
              }}
              components={{
                total: <strong className="text-slate-900" />,
                risk: <strong className="text-red-600" />,
              }}
            />
          </span>
        </div>

        <div className="flex flex-col justify-center gap-3 px-6 py-5">
          <span className="text-lg font-bold text-red-700">
            {t('overview.kpi.riskRatio.label')}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-bold leading-none tracking-tight">
              {ratio.toFixed(1)}
            </span>
            <span className="text-xl font-bold">%</span>
          </div>
          <div className="flex items-center gap-2">
            <DeltaBadge delta={ratioDelta} size="md" />
            <span className="text-xs text-gray-500">
              {t('overview.kpi.riskRatio.previous', {
                ratio: prevRatio.toFixed(1),
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 추이 */}
      <Card
        title={t('overview.trend.title')}
        titleSize="lg"
        gapClassName="gap-2.5"
        className="pb-3"
        actions={
          <div className="flex items-center gap-6">
            <RiskTrendLegend />
            <Dropdown
              label={t('overview.trend.range.label')}
              size="sm"
              align="right"
              value={String(range)}
              onChange={(value) => setRange(Number(value) as 6 | 12)}
              options={[
                { value: '6', label: t('overview.trend.range.last6') },
                { value: '12', label: t('overview.trend.range.last12') },
              ]}
              className="w-32"
            />
          </div>
        }
        titleAddon={
          <Tabs
            label={t('overview.trend.metric.label')}
            tabs={[
              { key: 'count', label: t('overview.trend.metric.count') },
              { key: 'ratio', label: t('overview.trend.metric.ratio') },
            ]}
            value={metric}
            onChange={setMetric}
          />
        }
      >
        <div className="-mb-1.5 flex justify-between text-2xs text-gray-500">
          <span>{t('overview.trend.axis.count')}</span>
          <span>{t('overview.trend.axis.ratio')}</span>
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
          title={t('overview.reasonShare.title')}
          titleSize="lg"
          actions={
            <Tabs
              label={t('overview.reasonShare.unit.label')}
              tabs={[
                { key: 'count', label: t('overview.reasonShare.unit.count') },
                { key: 'ratio', label: t('overview.reasonShare.unit.ratio') },
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
                    {churnReasonLabel(group.name)}
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
                      : t('common.unit.people', { count: group.count })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title={t('overview.topChanges.title')}
          titleSize="lg"
          titleAddon={
            <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-600">
              {t('overview.topChanges.badge')}
            </span>
          }
        >
          <div className="flex flex-col">
            <div
              className={`${TOP5_GRID} h-8 items-center gap-2 border-b border-slate-200 px-1 text-xs font-semibold text-slate-500`}
            >
              <span>{t('overview.topChanges.column.rank')}</span>
              <span>{t('overview.topChanges.column.reason')}</span>
              <span className="text-right">
                {t('overview.topChanges.column.previous')}
              </span>
              <span className="text-right">
                {t('overview.topChanges.column.current')}
              </span>
              <span className="text-right">
                {t('overview.topChanges.column.change')}
              </span>
              <span className="text-right">
                {t('overview.topChanges.column.changeRate')}
              </span>
            </div>
            {topRows.map((row, index) => (
              <div
                key={row.name}
                className={`${TOP5_GRID} h-10 items-center gap-2 border-b border-slate-100 px-1 text-xs last:border-b-0`}
              >
                <RankBadge rank={index + 1} highlight="dark" size="md" />
                <span className="truncate font-semibold text-slate-900">
                  {churnReasonLabel(row.name)}
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
  const { t } = useTranslation();
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
        <span className="ml-1 text-sm font-semibold">
          {t('common.unit.peopleSuffix')}
        </span>
      </span>
    </div>
  );
}
