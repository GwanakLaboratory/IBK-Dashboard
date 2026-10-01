import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '@/components/molecules/Card';
import {
  CAMPAIGN_SEND_PATH,
  type CampaignLinkState,
} from '@/features/marketing/campaignLinkState';
import type { Customer, Transaction } from '@/types/churn';

const RECENT_PAYMENT_COUNT = 5;
const TOP_CATEGORY_COUNT = 5;
const TOP_CATEGORY_MONTHS = 3;
// 수수료 등 소비 업종이 아닌 항목은 주 이용 업종 비중에서 뺀다.
const NON_SPENDING_CATEGORIES = ['금융'];

// 업종 태그 색상. 목록에 없는 업종은 기본 회색.
const CATEGORY_TAG_CLASS_NAME: Record<string, string> = {
  카페: 'bg-amber-100 text-amber-800',
  외식: 'bg-amber-100 text-amber-800',
  음식배달: 'bg-pink-100 text-pink-800',
  편의점: 'bg-sky-100 text-sky-800',
  주유: 'bg-green-100 text-green-800',
  자동차: 'bg-green-100 text-green-800',
  대형마트: 'bg-violet-100 text-violet-800',
  백화점: 'bg-violet-100 text-violet-800',
  온라인쇼핑: 'bg-violet-100 text-violet-800',
  면세점: 'bg-violet-100 text-violet-800',
  뷰티: 'bg-rose-100 text-rose-800',
  여가: 'bg-teal-100 text-teal-800',
  도서: 'bg-teal-100 text-teal-800',
  구독: 'bg-indigo-100 text-indigo-800',
  금융: 'bg-slate-100 text-slate-700',
};
const DEFAULT_CATEGORY_TAG_CLASS_NAME = 'bg-gray-100 text-gray-700';

function sortByLatest(transactions: Transaction[]) {
  return [...transactions].sort((transactionA, transactionB) =>
    transactionB.date.localeCompare(transactionA.date),
  );
}

/** 마지막 결제일 기준 최근 N개월 승인 결제 금액으로 업종별 비중을 구한다. */
function getTopCategories(transactions: Transaction[]) {
  const approved = transactions.filter(
    (transaction) =>
      transaction.status === '승인' &&
      !NON_SPENDING_CATEGORIES.includes(transaction.category),
  );
  const latestDate = sortByLatest(approved)[0]?.date;
  if (!latestDate) {
    return [];
  }

  const fromDate = new Date(latestDate);
  fromDate.setMonth(fromDate.getMonth() - TOP_CATEGORY_MONTHS);
  const fromDateString = fromDate.toISOString().slice(0, 10);

  const amountByCategory = new Map<string, number>();
  approved
    .filter((transaction) => transaction.date > fromDateString)
    .forEach((transaction) => {
      amountByCategory.set(
        transaction.category,
        (amountByCategory.get(transaction.category) ?? 0) + transaction.amount,
      );
    });

  const totalAmount = [...amountByCategory.values()].reduce(
    (sum, amount) => sum + amount,
    0,
  );
  return [...amountByCategory.entries()]
    .map(([label, amount]) => ({
      label,
      amount,
      share: totalAmount === 0 ? 0 : (amount / totalAmount) * 100,
    }))
    .sort((categoryA, categoryB) => categoryB.share - categoryA.share)
    .slice(0, TOP_CATEGORY_COUNT);
}

type CustomerPaymentSectionProps = {
  customer: Customer;
};

export function CustomerPaymentSection({
  customer,
}: CustomerPaymentSectionProps) {
  const recentPayments = sortByLatest(customer.transactions).slice(
    0,
    RECENT_PAYMENT_COUNT,
  );
  const topCategories = getTopCategories(customer.transactions);
  const topCategoryLabel = topCategories[0]?.label;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section className="flex h-full flex-col">
        <header className="mb-4">
          <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900">
            <span className="h-2 w-2 bg-gray-900" />
            최근 결제 내역
          </h2>
          <p className="mt-1 pl-5 text-sm text-gray-500">
            최근 {RECENT_PAYMENT_COUNT}건
          </p>
        </header>
        <div className="flex-1 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F7F8FA] text-left text-xs text-gray-600">
                    <th className="py-2.5 pl-4 pr-3 font-semibold">결제일</th>
                    <th className="px-3 py-2.5 font-semibold">가맹점</th>
                    <th className="px-3 py-2.5 font-semibold">업종</th>
                    <th className="px-3 py-2.5 text-right font-semibold">
                      금액
                    </th>
                    <th className="py-2.5 pl-3 pr-4 text-center font-semibold">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => {
                    const isCanceled = payment.status === '취소';

                    return (
                      <tr
                        key={`${payment.date}-${payment.merchant}`}
                        className="border-t border-gray-100"
                      >
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-gray-600">
                          {payment.date.replace(/-/g, '.')}
                        </td>
                        <td className="px-3 py-3 font-semibold text-gray-900">
                          {payment.merchant}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-semibold ${
                              CATEGORY_TAG_CLASS_NAME[payment.category] ??
                              DEFAULT_CATEGORY_TAG_CLASS_NAME
                            }`}
                          >
                            {payment.category}
                          </span>
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 text-right font-bold ${
                            isCanceled
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {payment.amount.toLocaleString('ko-KR')}원
                        </td>
                        <td
                          className={`py-3 pl-3 pr-4 text-center ${
                            isCanceled
                              ? 'font-semibold text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {payment.status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-14 text-center text-sm text-gray-400">
              결제 내역이 없습니다.
            </p>
          )}
        </div>
      </section>

      <Card
        title="주 이용 업종"
        description={`최근 ${TOP_CATEGORY_MONTHS}개월 결제 금액 기준`}
        actions={
          topCategoryLabel && (
            <Link
              to={CAMPAIGN_SEND_PATH}
              state={
                {
                  customerIds: [customer.id],
                  sourceLabel: `${customer.id} 주 이용 업종 '${topCategoryLabel}'`,
                  theme: 'cashback',
                  category: topCategoryLabel,
                } satisfies CampaignLinkState
              }
              className="inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-bold text-violet-700 transition-colors hover:bg-violet-100"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              &apos;{topCategoryLabel}&apos; 캐시백 캠페인
            </Link>
          )
        }
      >
        {topCategories.length > 0 ? (
          <div className="flex h-full flex-col justify-between gap-2">
            {topCategories.map((category, categoryIndex) => {
              const isTop = categoryIndex === 0;
              const topShare = topCategories[0].share;

              return (
                <div
                  key={category.label}
                  className="grid grid-cols-[22px_76px_minmax(0,1fr)_84px_36px] items-center gap-2.5"
                >
                  <span
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[12px] font-bold ${
                      isTop
                        ? 'bg-violet-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {categoryIndex + 1}
                  </span>
                  <span className="truncate text-xs font-semibold text-gray-900">
                    {category.label}
                  </span>
                  <div className="h-2 overflow-hidden rounded bg-gray-100">
                    <div
                      className={`h-full rounded ${isTop ? 'bg-violet-700' : 'bg-violet-300'}`}
                      style={{
                        width: `${topShare === 0 ? 0 : (category.share / topShare) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-right text-xs text-gray-500">
                    {category.amount.toLocaleString('ko-KR')}원
                  </span>
                  <span className="text-right text-xs font-bold text-gray-900">
                    {Math.round(category.share)}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">
            최근 {TOP_CATEGORY_MONTHS}개월 결제 내역이 없습니다.
          </p>
        )}
      </Card>
    </div>
  );
}
