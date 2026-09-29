import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Pagination } from '@/components/molecules/Pagination';
import {
  buildPriorityTargets,
  formatManwon,
  getMostCommonTopReason,
  type ContactChannel,
  type ContactResponse,
} from '@/features/customer-detail/priorityTargets';
import {
  CAMPAIGN_SEND_PATH,
  type CampaignLinkState,
} from '@/features/marketing/campaignLinkState';
import { maskName } from '@/utils/format';
import { getReasonShortLabel } from '@/utils/risk';
import type { Customer } from '@/types/churn';

const TARGETS_PER_PAGE = 10;
const HIGHLIGHTED_RANK_COUNT = 3;

const CHANNEL_TAG_CLASS_NAME: Record<ContactChannel, string> = {
  문자: 'bg-blue-100 text-blue-800',
  텔레마케팅: 'bg-violet-100 text-violet-800',
  카카오: 'bg-yellow-100 text-yellow-800',
};

const RESPONSE_TAG_CLASS_NAME: Record<ContactResponse, string> = {
  반응: 'bg-green-100 text-green-700',
  무반응: 'bg-gray-100 text-gray-600',
  대기: 'bg-sky-100 text-sky-700',
};

type PriorityTargetPanelProps = {
  customers: Customer[];
};

export function PriorityTargetPanel({ customers }: PriorityTargetPanelProps) {
  const priorityTargets = useMemo(
    () => buildPriorityTargets(customers),
    [customers],
  );
  // 회원 수에 맞춰 조회 범위를 만든다. (마지막은 항상 전체)
  const topOptions = useMemo(() => {
    const total = priorityTargets.length;
    return [...[10, 20].filter((count) => count < total), total];
  }, [priorityTargets.length]);

  const [topCount, setTopCount] = useState(topOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const topTargets = priorityTargets.slice(0, topCount);
  const averageScore =
    topTargets.length === 0
      ? 0
      : topTargets.reduce(
          (sum, target) => sum + target.customer.predictionScore,
          0,
        ) / topTargets.length;
  const annualUsageSum = topTargets.reduce(
    (sum, target) => sum + target.annualUsage,
    0,
  );
  const mostCommonReason = getMostCommonTopReason(topTargets);

  const totalPages = Math.max(
    1,
    Math.ceil(topTargets.length / TARGETS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageTargets = topTargets.slice(
    (safeCurrentPage - 1) * TARGETS_PER_PAGE,
    safeCurrentPage * TARGETS_PER_PAGE,
  );

  function handleTopCountChange(count: number) {
    setTopCount(count);
    setCurrentPage(1);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-8 rounded-xl border border-border bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-600">조회 범위</span>
          <div className="flex gap-1.5">
            {topOptions.map((count) => {
              const isSelected = count === topCount;
              const isAll = count === priorityTargets.length;

              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleTopCountChange(count)}
                  className={`h-9 rounded-lg border px-3.5 text-[13px] transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 font-bold text-primary'
                      : 'border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isAll ? `전체 ${count}명` : `상위 ${count}명`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-px self-stretch bg-gray-100" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">평균 이탈점수</span>
          <span className="text-[28px] font-bold text-red-700">
            {averageScore.toFixed(1)}
            <span className="text-sm font-bold text-gray-700"> 점</span>
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">
            연간 이용금액 합계{' '}
            <span className="text-gray-400">· 최근 12개월</span>
          </span>
          <span className="text-[28px] font-bold text-gray-900">
            {formatManwon(annualUsageSum)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">최다 이탈 사유</span>
          <span className="pt-1.5 text-lg font-bold text-gray-900">
            {mostCommonReason ? getReasonShortLabel(mostCommonReason) : '-'}
          </span>
        </div>

        <Link
          to={CAMPAIGN_SEND_PATH}
          state={
            {
              customerIds: topTargets.map((target) => target.customer.id),
              sourceLabel: `위험군 우선순위 ${topCount === priorityTargets.length ? '전체' : '상위'} ${topCount}명`,
            } satisfies CampaignLinkState
          }
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-[18px] text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          이 대상으로 마케팅 발송
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F8FA] text-left text-xs text-gray-600">
                <th className="w-14 px-4 py-3 text-center font-semibold">
                  순위
                </th>
                <th className="px-3 py-3 font-semibold">회원</th>
                <th className="w-[150px] px-3 py-3 font-semibold">이탈점수</th>
                <th className="px-3 py-3 text-right font-semibold">
                  연간 이용금액
                </th>
                <th className="px-3 py-3 font-semibold">핵심 사유</th>
                <th className="px-3 py-3 font-semibold">최근 접촉</th>
                <th className="py-3 pl-3 pr-5 font-semibold">권장 대응</th>
              </tr>
            </thead>
            <tbody>
              {pageTargets.map((target) => {
                const { customer, recentContact } = target;
                const isRising = target.scoreDelta > 0;

                return (
                  <tr
                    key={customer.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold ${
                          target.rank <= HIGHLIGHTED_RANK_COUNT
                            ? 'bg-red-700 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {target.rank}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        to={`/customer-detail/${customer.id}`}
                        className="flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-gray-900">
                          {maskName(customer.name)}
                        </span>
                        <span className="text-xs text-gray-500 underline-offset-2 hover:underline">
                          {customer.id}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-red-700">
                          {customer.predictionScore}
                        </span>
                        {target.scoreDelta !== 0 && (
                          <span
                            className={`inline-flex h-5 items-center rounded px-1.5 text-[11px] font-bold ${
                              isRising
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isRising ? '▲' : '▼'} {Math.abs(target.scoreDelta)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-gray-900">
                      {formatManwon(target.annualUsage)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        {target.reasonLabels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex h-6 items-center whitespace-nowrap rounded-md bg-gray-100 px-2 text-xs text-gray-700"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {recentContact ? (
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-[13px] text-gray-700">
                            {recentContact.date} {recentContact.channel}
                          </span>
                          <span
                            className={`inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-semibold ${RESPONSE_TAG_CLASS_NAME[recentContact.response]}`}
                          >
                            {recentContact.response}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400">
                          미접촉
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pl-3 pr-5">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span
                          className={`inline-flex h-6 items-center rounded-md px-2.5 text-xs font-semibold ${CHANNEL_TAG_CLASS_NAME[target.recommendedChannel]}`}
                        >
                          {target.recommendedChannel}
                        </span>
                        <span className="text-[13px] font-semibold text-gray-700">
                          {target.recommendedBenefit}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-[13px] text-gray-600">
            {topCount === priorityTargets.length ? '전체' : '상위'} {topCount}명
            중 {pageTargets.length}명 표시
          </span>
          {totalPages > 1 && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
