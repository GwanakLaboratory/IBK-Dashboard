import { type ReactNode } from 'react';
import { SectionTitle } from '@/components/molecules/SectionTitle';
import { type CampaignView } from '@/features/marketing/campaign/campaignModel';

type CampaignSummaryPanelProps = {
  view: CampaignView;
  /** 단계 이동 버튼. 요약을 보면서 바로 넘어갈 수 있게 예상 반응 아래에 둔다. */
  actions?: ReactNode;
  /** 발송 대상 아래에 붙는 AI 분석 (대상 세그먼트 단계에서만 넘긴다) */
  insight?: ReactNode;
};

/** 대상 세그먼트 단계에서 요약 패널에 보여주는 AI 분석 */
export function SegmentInsight({ view }: { view: CampaignView }) {
  const segmentName = view.matchedPreset
    ? `'${view.matchedPreset.label}'`
    : view.personaLabel;

  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-violet-200 bg-violet-50 px-3.5 py-3">
      <span className="text-[11px] font-bold text-violet-600">AI 분석</span>
      <span className="text-[13px] leading-relaxed text-gray-900">
        {view.matchedPreset && `${view.matchedPreset.basis}. `}
        {segmentName} 세그먼트 {view.segmentCount.toLocaleString('ko-KR')}명은{' '}
        {view.pickedCategoryLabel
          ? `결제 내역상 '${view.pickedCategoryLabel}' 이용 비중이 높아요.`
          : `'${view.topReasonLabel}' 비중이 가장 높아요.`}
      </span>
      <span className="text-xs font-semibold text-violet-600">
        추천 {view.recommendedTheme.label} ×{' '}
        {view.recommendedChannel.shortLabel} · 예상 반응{' '}
        {view.recommendedRate.toFixed(1)}%
      </span>
    </div>
  );
}

export function CampaignSummaryPanel({
  view,
  actions,
  insight,
}: CampaignSummaryPanelProps) {
  return (
    <aside className="sticky top-0 flex flex-col gap-3">
      <SectionTitle title="발송 요약" />
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-white px-5 py-[18px] shadow-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-600">발송 대상</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-bold tracking-tight text-primary">
              {view.targetCount.toLocaleString('ko-KR')}
            </span>
            <span className="text-sm font-semibold text-gray-900">명</span>
          </div>
        </div>

        {insight}

        <dl className="flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-600">세그먼트</dt>
            <dd className="text-right font-semibold text-gray-900">
              {view.segmentLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-600">문구 테마</dt>
            <dd className="font-semibold text-gray-900">{view.theme.label}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-600">채널</dt>
            <dd className="font-semibold text-gray-900">
              {view.channel.label}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-600">예상 반응</dt>
            <dd className="font-bold text-violet-600">
              {view.responders.toLocaleString('ko-KR')}명 (
              {view.responseRate.toFixed(1)}%)
            </dd>
          </div>
        </dl>

        {actions}
      </div>
    </aside>
  );
}
