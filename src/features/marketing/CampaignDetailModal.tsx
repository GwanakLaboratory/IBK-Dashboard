import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/molecules/Modal';
import {
  CAMPAIGN_SENDER_CLASS_NAME,
  CAMPAIGN_SOURCE_META,
  CAMPAIGN_STATUS_META,
  campaignMessage,
  campaignName,
  campaignSegment,
  type Campaign,
} from '@/data/campaign';
import { findSendChannel } from '@/data/marketing';
import { channelShortLabel } from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';

type CampaignDetailModalProps = {
  campaign: Campaign;
  onClose: () => void;
};

/** 접촉 이력 표에서 캠페인을 누르면 뜨는 상세 모달 */
export function CampaignDetailModal({
  campaign,
  onClose,
}: CampaignDetailModalProps) {
  const { t } = useTranslation();
  const name = campaignName(campaign.id);
  const channel = findSendChannel(campaign.channel);
  const source = CAMPAIGN_SOURCE_META[campaign.source];
  const status = CAMPAIGN_STATUS_META[campaign.status];
  const isKakao = campaign.channel === 'kakao';
  const stats = [
    { label: t('marketingHistory.table.column.date'), value: campaign.date },
    {
      label: t('marketingHistory.table.column.count'),
      value: t('marketingHistory.table.people', {
        value: formatNumber(campaign.count),
      }),
    },
    {
      label: t('marketingHistory.table.column.responseRate'),
      value:
        campaign.responseRate == null
          ? t('marketingHistory.table.notSent')
          : `${campaign.responseRate.toFixed(1)}%`,
    },
    {
      label: t('marketingHistory.table.column.returned'),
      value:
        campaign.returned == null
          ? '–'
          : t('marketingHistory.table.people', {
              value: formatNumber(campaign.returned),
            }),
    },
  ];

  return (
    <Modal
      label={t('marketingHistory.detail.label', { name })}
      onClose={onClose}
      className="max-w-[560px] overflow-hidden"
    >
      <div className="flex items-start gap-3 border-b border-slate-100 px-6 pb-4 pt-5">
        <div className="flex min-w-0 grow flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill className={source.className}>
              {t(`marketingHistory.source.${campaign.source}.label`)}
            </Pill>
            <Pill className={channel.chipClassName}>
              {channelShortLabel(campaign.channel)}
            </Pill>
            <Pill className={status.className}>
              {t(`marketingHistory.status.${campaign.status}`)}
            </Pill>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{name}</h2>
          <span className="text-xs text-slate-500">
            {campaignSegment(campaign.id)}
          </span>
        </div>
        <button
          type="button"
          aria-label={t('common.action.close')}
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
            <span className="text-sm font-bold text-slate-900">
              {t('marketingHistory.detail.message')}
            </span>
            <div
              className={`flex flex-col gap-1.5 rounded-2xl border px-4 py-3.5 ${
                isKakao
                  ? 'border-amber-200 bg-yellow-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span
                className={`text-xs font-bold ${CAMPAIGN_SENDER_CLASS_NAME[campaign.channel]}`}
              >
                {t(`marketingHistory.detail.sender.${campaign.channel}`)}
              </span>
              <span className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
                {campaignMessage(campaign.id)}
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
