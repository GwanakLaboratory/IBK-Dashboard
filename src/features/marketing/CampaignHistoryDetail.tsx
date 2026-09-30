import { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { Link } from 'react-router';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/molecules/Card';
import { ChannelBadge } from '@/components/domain/ChannelBadge';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { customers } from '@/data/customers';
import {
  type CampaignHistoryEntry,
  type ContactResponse,
} from '@/data/marketing';
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
  const [query, setQuery] = useState('');
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('all');

  const members = campaign.members
    .map((member) => {
      const customer = customers.find((item) => item.id === member.customerId);
      return customer ? { member, customer } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const respondedCount = members.filter(
    ({ member }) => member.response === '반응',
  ).length;
  const pendingCount = members.filter(
    ({ member }) => member.response === '대기',
  ).length;
  const noResponseCount = members.length - respondedCount - pendingCount;
  const responseRate =
    members.length === 0 ? 0 : (respondedCount / members.length) * 100;
  const pendingRate =
    members.length === 0 ? 0 : (pendingCount / members.length) * 100;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = members.filter(({ member, customer }) => {
    const matchesQuery =
      !normalizedQuery ||
      customer.name.toLowerCase().includes(normalizedQuery) ||
      customer.id.toLowerCase().includes(normalizedQuery);
    const matchesResponseFilter =
      responseFilter === 'all' || member.response === responseFilter;
    return matchesQuery && matchesResponseFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-5 rounded-xl border border-border bg-white px-6 py-5 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/marketing/history"
            aria-label="목록으로"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="truncate text-lg font-bold text-gray-900">
                {campaign.segmentLabel}
              </span>
              <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-600">
                {campaign.sourceLabel}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
              <span>{campaign.date} 발송</span>
              <span className="h-3 w-px bg-gray-300" />
              <ChannelBadge channel={campaign.channel} />
              <span className="h-3 w-px bg-gray-300" />
              <span>
                대상{' '}
                <strong className="text-gray-900">{members.length}명</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card title="반응 현황">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold leading-none text-primary">
                {responseRate.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-primary">%</span>
            </div>
            <div className="flex h-3.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-primary"
                style={{ width: `${responseRate}%` }}
              />
              <div
                className="bg-sky-300"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1 rounded-[10px] bg-gray-50 px-3.5 py-3">
                <span className="text-xs text-gray-600">반응</span>
                <span className="text-lg font-bold text-gray-900">
                  {respondedCount}명
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-[10px] bg-gray-50 px-3.5 py-3">
                <span className="text-xs text-gray-600">대기</span>
                <span className="text-lg font-bold text-gray-900">
                  {pendingCount}명
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-[10px] bg-gray-50 px-3.5 py-3">
                <span className="text-xs text-gray-600">무반응</span>
                <span className="text-lg font-bold text-gray-900">
                  {noResponseCount}명
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="발송 문구">
          <div className="rounded-xl bg-[#F5F6F8] p-4">
            <div className="rounded-md rounded-tl-[4px] border border-border bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-900">
              {campaign.message}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름 또는 회원번호"
              className="h-9 w-56 pl-8 text-[13px]"
            />
          </div>
        </div>

        <Card title="대상 회원">
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="반응 상태"
                className="inline-flex gap-1 rounded-lg bg-gray-100 p-1"
              >
                {RESPONSE_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={responseFilter === option}
                    onClick={() => setResponseFilter(option)}
                    className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      responseFilter === option
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {option === 'all' ? '전체' : option}
                  </button>
                ))}
              </div>
              <span className="text-[13px] text-gray-600">
                {filteredMembers.length}명
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F7F8FA] text-xs text-gray-600">
                      <th className="px-5 py-3 text-left font-semibold">
                        회원
                      </th>
                      <th className="px-3 py-3 text-left font-semibold">
                        위험도
                      </th>
                      <th className="px-3 py-3 text-left font-semibold">
                        반응
                      </th>
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
        </Card>
      </div>
    </div>
  );
}
