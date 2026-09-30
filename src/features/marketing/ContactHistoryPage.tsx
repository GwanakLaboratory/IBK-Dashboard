import { CheckCircle2, ChevronRight, Clock, Send, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { CardGrid } from '@/components/molecules/CardGrid';
import { PageHeading } from '@/components/molecules/PageHeading';
import { StatCard } from '@/components/molecules/StatCard';
import { ChannelBadge } from '@/components/domain/ChannelBadge';
import { CAMPAIGN_HISTORY, CONTACT_HISTORY_SUMMARY } from '@/data/marketing';
import { SectionTitle } from '@/components/molecules/SectionTitle';

const SUMMARY_STAT_CARDS = [
  {
    label: '총 접촉',
    count: CONTACT_HISTORY_SUMMARY.total,
    Icon: Send,
  },
  {
    label: '반응',
    count: CONTACT_HISTORY_SUMMARY.responded,
    Icon: CheckCircle2,
  },
  {
    label: '무반응',
    count: CONTACT_HISTORY_SUMMARY.noResponse,
    Icon: XCircle,
  },
  {
    label: '응답 대기',
    count: CONTACT_HISTORY_SUMMARY.pending,
    Icon: Clock,
  },
];

export function ContactHistoryPage() {
  const navigate = useNavigate();

  return (
    <Screen>
      <PageHeading />

      <CardGrid columns={4} breakpoint="lg">
        {SUMMARY_STAT_CARDS.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={`${tile.count.toLocaleString('ko-KR')}건`}
            Icon={tile.Icon}
          />
        ))}
      </CardGrid>

      <CardGrid columns={1}>
        <div className="grid gap-6">
          <SectionTitle
            title="캠페인별 접촉 이력"
            description="최신순 · 캠페인을 누르면 대상 세그먼트와 반응 결과를 볼 수 있어요"
          />

          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#F7F8FA] text-xs text-gray-600">
                    <th className="px-5 py-3 text-left font-semibold">
                      발송일
                    </th>
                    <th className="px-3 py-3 text-left font-semibold">
                      대상 세그먼트
                    </th>
                    <th className="px-3 py-3 text-left font-semibold">채널</th>
                    <th className="px-3 py-3 text-right font-semibold">대상</th>
                    <th className="px-5 py-3 text-left font-semibold">
                      반응 현황
                    </th>
                    <th className="w-8 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGN_HISTORY.map((campaign) => {
                    const total = campaign.members.length;
                    const respondedCount = campaign.members.filter(
                      (member) => member.response === '반응',
                    ).length;
                    const pendingCount = campaign.members.filter(
                      (member) => member.response === '대기',
                    ).length;
                    const rate =
                      total === 0 ? 0 : (respondedCount / total) * 100;
                    const pendingRate =
                      total === 0 ? 0 : (pendingCount / total) * 100;

                    return (
                      <tr
                        key={campaign.id}
                        className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                        onClick={() =>
                          navigate(`/marketing/history/${campaign.id}`)
                        }
                      >
                        <td className="px-5 py-3 text-gray-600">
                          {campaign.date}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-900">
                              {campaign.segmentLabel}
                            </span>
                            <span className="text-xs text-gray-500">
                              {campaign.sourceLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <ChannelBadge channel={campaign.channel} />
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-gray-900">
                          {total}명
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="bg-primary"
                                style={{ width: `${rate}%` }}
                              />
                              <div
                                className="bg-sky-300"
                                style={{ width: `${pendingRate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              반응{' '}
                              <strong className="text-primary">
                                {rate.toFixed(0)}%
                              </strong>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardGrid>
    </Screen>
  );
}
