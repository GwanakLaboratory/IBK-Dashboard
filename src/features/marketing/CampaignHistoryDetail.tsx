import { useState } from 'react';
import { Link } from 'react-router';
import { Select } from '@/components/molecules/Select';
import { SectionTitle } from '@/components/molecules/SectionTitle';
import { ChannelBadge } from '@/components/domain/ChannelBadge';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { customers } from '@/data/customers';
import {
  CustomerSearchBar,
  type CustomerSearchField,
} from '@/features/customer-detail/CustomerSearchBar';
import {
  type CampaignHistoryEntry,
  type ContactResponse,
} from '@/data/marketing';
import { fillPreviewName } from '@/features/marketing/campaign/campaignModel';
import { maskName } from '@/utils/format';

type CampaignHistoryDetailProps = {
  campaign: CampaignHistoryEntry;
};

const RESPONSE_TAG_CLASS_NAME: Record<ContactResponse, string> = {
  반응: 'bg-green-100 text-green-700',
  무반응: 'bg-gray-100 text-gray-600',
  대기: 'bg-sky-100 text-sky-700',
};

type ResponseFilter = ContactResponse | 'all';

const RESPONSE_FILTER_OPTIONS: ResponseFilter[] = [
  'all',
  '반응',
  '무반응',
  '대기',
];

export function CampaignHistoryDetail({
  campaign,
}: CampaignHistoryDetailProps) {
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState<CustomerSearchField>('name');
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('all');

  const members = campaign.members
    .map((member) => {
      const customer = customers.find((item) => item.id === member.customerId);
      return customer ? { member, customer } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // 대상 회원 표는 샘플이므로, 반응 수치는 캠페인 전체 인원 기준으로 계산한다.
  const sampleSize = campaign.members.length;
  const samplePendingCount = campaign.members.filter(
    (member) => member.response === '대기',
  ).length;
  const targetCount = campaign.targetCount;
  const respondedCount = Math.min(campaign.respondedCount, targetCount);
  const pendingCount =
    sampleSize === 0
      ? 0
      : Math.min(
          targetCount - respondedCount,
          Math.round((targetCount * samplePendingCount) / sampleSize),
        );
  const noResponseCount = targetCount - respondedCount - pendingCount;
  const responseRate =
    targetCount === 0 ? 0 : (respondedCount / targetCount) * 100;
  const pendingRate =
    targetCount === 0 ? 0 : (pendingCount / targetCount) * 100;
  const formatCount = (count: number) => count.toLocaleString('ko-KR');

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = members.filter(({ member, customer }) => {
    const matchesQuery =
      !normalizedQuery ||
      customer[searchField].toLowerCase().includes(normalizedQuery);
    const matchesResponseFilter =
      responseFilter === 'all' || member.response === responseFilter;
    return matchesQuery && matchesResponseFilter;
  });

  return (
    <div className="flex flex-col gap-10">
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-2 px-6 py-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-lg font-bold text-gray-900">
              {campaign.segmentLabel}
            </span>
            <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-primary/10 px-2 text-xs font-semibold text-primary">
              {campaign.sourceLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-600">
            <span>{campaign.date} 발송</span>
            <span className="h-3 w-px bg-gray-300" />
            <ChannelBadge channel={campaign.channel} />
            <span className="h-3 w-px bg-gray-300" />
            <span>
              대상{' '}
              <strong className="text-gray-900">
                {formatCount(targetCount)}명
              </strong>
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500">발송 문구</span>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-900">
              {fillPreviewName(campaign.message)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-gray-100 bg-[#FAFBFC] px-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">
                  반응률
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-4xl font-bold leading-none text-primary">
                    {responseRate.toFixed(1)}
                  </span>
                  <span className="text-lg font-semibold text-primary">%</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatCount(respondedCount)} / {formatCount(targetCount)}명
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-primary"
                style={{ width: `${responseRate}%` }}
              />
              <div
                className="bg-sky-300"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: '반응', count: respondedCount, dot: 'bg-primary' },
              { label: '대기', count: pendingCount, dot: 'bg-sky-300' },
              { label: '무반응', count: noResponseCount, dot: 'bg-gray-300' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1.5 rounded-[10px] border border-gray-100 bg-white px-4 py-3.5"
              >
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  {item.label}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCount(item.count)}명
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <SectionTitle title="대상 회원" />
        <div className="grid gap-6">
          <CustomerSearchBar
            value={keyword}
            onValueChange={setKeyword}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
            onLookup={() => setQuery(keyword)}
            onReset={() => setQuery('')}
          />

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="response-filter"
              className="text-sm font-semibold text-gray-600"
            >
              반응
            </label>
            <Select
              id="response-filter"
              value={responseFilter}
              onChange={(event) =>
                setResponseFilter(event.target.value as ResponseFilter)
              }
            >
              {RESPONSE_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? '전체' : option}
                </option>
              ))}
            </Select>
            <span className="ml-auto text-sm text-gray-500">
              전체 <strong className="text-gray-900">{members.length}</strong>명
              중{' '}
              <strong className="text-primary">{filteredMembers.length}</strong>
              명 표시
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F7F8FA] text-xs text-gray-600">
                    <th className="px-5 py-3 text-left font-semibold">회원</th>
                    <th className="px-3 py-3 text-left font-semibold">
                      위험도
                    </th>
                    <th className="px-3 py-3 text-left font-semibold">반응</th>
                    <th className="px-3 py-3 text-left font-semibold">
                      반응 채널
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      반응 일시
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(({ member, customer }) => (
                    <tr
                      key={customer.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3">
                        <Link
                          to={`/customer-detail/${customer.id}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-gray-900 hover:text-primary hover:underline"
                        >
                          {maskName(customer.name)}
                          <span className="font-normal text-gray-500">
                            {customer.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <RiskBadge riskLevel={customer.riskLevel} />
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2.5 text-xs font-semibold ${RESPONSE_TAG_CLASS_NAME[member.response]}`}
                        >
                          {member.response}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <ChannelBadge channel={member.channel} />
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {member.respondedAt ?? '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm text-gray-500"
                      >
                        조건에 맞는 회원이 없어요
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
