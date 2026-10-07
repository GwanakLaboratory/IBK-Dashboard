import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/molecules/Modal';
import {
  CAMPAIGN_SENDER,
  CAMPAIGN_SOURCE_META,
  CAMPAIGN_STATUS_META,
  type Campaign,
} from '@/data/campaign';
import { findSendChannel } from '@/data/marketing';

type CampaignDetailModalProps = {
  campaign: Campaign;
  onClose: () => void;
};

const formatNumber = (value: number) => value.toLocaleString('ko-KR');

/** 접촉 이력 표에서 캠페인을 누르면 뜨는 상세 모달 */
export function CampaignDetailModal({
  campaign,
  onClose,
}: CampaignDetailModalProps) {
  const channel = findSendChannel(campaign.channel);
  const source = CAMPAIGN_SOURCE_META[campaign.source];
  const status = CAMPAIGN_STATUS_META[campaign.status];
  const isKakao = campaign.channel === 'kakao';
  const stats = [
    { label: '발송일', value: campaign.date },
    { label: '발송 대상', value: `${formatNumber(campaign.count)}명` },
    {
      label: '반응률',
      value:
        campaign.responseRate == null
          ? '발송 전'
          : `${campaign.responseRate.toFixed(1)}%`,
    },
    {
      label: '이용 재개',
      value:
        campaign.returned == null
          ? '–'
          : `${formatNumber(campaign.returned)}명`,
    },
  ];

  return (
    <Modal
      label={`${campaign.name} 상세`}
      onClose={onClose}
      className="max-w-[560px] overflow-hidden"
    >
      <div className="flex items-start gap-3 border-b border-slate-100 px-6 pb-4 pt-5">
        <div className="flex min-w-0 grow flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill className={source.className}>{source.label}</Pill>
            <Pill className={channel.chipClassName}>{channel.shortLabel}</Pill>
            <Pill className={status.className}>{status.label}</Pill>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{campaign.name}</h2>
          <span className="text-xs text-slate-500">{campaign.segment}</span>
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <X className="size-4" strokeWidth={2.4} />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">{stat.label}</span>
              <span className="whitespace-nowrap text-lg font-bold text-slate-900">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* 텔레마케팅은 문구 대신 상담원이 직접 안내한다 */}
        {campaign.channel !== 'tm' && (
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-bold text-slate-900">보낸 문구</span>
            <div
              className={`flex flex-col gap-1.5 rounded-2xl border px-4 py-3.5 ${
                isKakao
                  ? 'border-amber-200 bg-yellow-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span
                className={`text-xs font-bold ${CAMPAIGN_SENDER[campaign.channel].className}`}
              >
                {CAMPAIGN_SENDER[campaign.channel].label}
              </span>
              <span className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
                {campaign.message}
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Pill({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full px-2 text-2xs font-bold ${className}`}
    >
      {children}
    </span>
  );
}
