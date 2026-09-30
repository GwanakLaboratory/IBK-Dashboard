import { SectionTitle } from '@/components/molecules/SectionTitle';
import {
  SCHEDULED_SEND_LABEL,
  SEND_CHANNELS,
  type SendChannelKey,
} from '@/data/marketing';
import { AiInsightBox } from '@/features/marketing/campaign/AiInsightBox';
import type {
  CampaignDraft,
  CampaignView,
  SendTiming,
} from '@/features/marketing/campaign/campaignModel';

const TIMING_OPTIONS: {
  key: SendTiming;
  label: string;
  description: string;
}[] = [
  { key: 'now', label: '즉시 발송', description: '확인 후 바로 발송' },
  { key: 'schedule', label: '예약 발송', description: SCHEDULED_SEND_LABEL },
];

type ChannelStepProps = {
  draft: CampaignDraft;
  view: CampaignView;
  onSelectChannel: (channel: SendChannelKey) => void;
  onSelectTiming: (timing: SendTiming) => void;
};

export function ChannelStep({
  draft,
  view,
  onSelectChannel,
  onSelectTiming,
}: ChannelStepProps) {
  const variantDelta = view.theme.variants[view.variantIndex].rateDelta;
  const recommendedChannelRate =
    view.recommendedChannel.baseRate + variantDelta;

  return (
    <div className="flex flex-col gap-6">
      <AiInsightBox>
        이 세그먼트는 {view.recommendedChannel.label} 반응률이 가장 높아요 (
        {recommendedChannelRate.toFixed(1)}%).{' '}
        {view.recommendedChannel.key === 'tm'
          ? '대상이 2만 명 이하라 상담원 연결도 가능합니다.'
          : '모바일 알림에 반응이 빠른 세그먼트예요.'}
      </AiInsightBox>

      <section className="flex flex-col gap-3">
        <SectionTitle title="발송 채널" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {SEND_CHANNELS.map((channel) => {
            const isSelected = channel.key === view.channel.key;
            return (
              <button
                key={channel.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectChannel(channel.key)}
                className={`flex min-h-[110px] flex-col items-start justify-center gap-2 rounded-xl px-[18px] py-4 text-left text-gray-900 ${
                  isSelected
                    ? 'border border-primary bg-blue-50'
                    : 'border border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-bold">{channel.label}</span>
                  {channel.key === view.recommendedChannel.key && (
                    <span className="inline-flex h-5 items-center rounded-full bg-violet-100 px-1.5 text-[11px] font-bold text-violet-600">
                      AI 추천
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600">
                  {channel.description}
                </span>
                <span className="text-xs">
                  예상 반응률{' '}
                  <strong>
                    {(channel.baseRate + variantDelta).toFixed(1)}%
                  </strong>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle title="발송 시점" />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {TIMING_OPTIONS.map((timing) => {
            const isSelected = timing.key === draft.timing;
            return (
              <button
                key={timing.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectTiming(timing.key)}
                className={`flex min-h-16 flex-1 flex-col items-start gap-1 rounded-[10px] px-4 py-3 text-left text-gray-900 ${
                  isSelected
                    ? 'border border-primary bg-blue-50'
                    : 'border border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <span className="text-sm font-bold">{timing.label}</span>
                <span className="text-xs text-gray-600">
                  {timing.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
