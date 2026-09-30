import { Download } from 'lucide-react';
import { SectionTitle } from '@/components/molecules/SectionTitle';
import { SCHEDULED_SEND_LABEL } from '@/data/marketing';
import {
  fillPreviewName,
  type CampaignDraft,
  type CampaignSectionStep,
  type CampaignView,
} from '@/features/marketing/campaign/campaignModel';

type ReviewStepProps = {
  draft: CampaignDraft;
  view: CampaignView;
  onEditStep: (step: CampaignSectionStep) => void;
  onDownloadCsv: () => void;
  onSend: () => void;
};

export function ReviewStep({
  draft,
  view,
  onEditStep,
  onDownloadCsv,
  onSend,
}: ReviewStepProps) {
  const targetCountLabel = view.targetCount.toLocaleString('ko-KR');
  const sendLabel = `${targetCountLabel}명에게 ${
    draft.timing === 'now' ? '발송하기' : '예약하기'
  }`;
  const isScript = view.channel.key === 'tm';
  const reviewRows: {
    id: string;
    label: string;
    value: string;
    step: CampaignSectionStep;
  }[] = [
    {
      id: 'target',
      label: '발송 대상',
      value: `${targetCountLabel}명 · ${view.segmentLabel}`,
      step: 1,
    },
    {
      id: 'message',
      label: isScript ? '스크립트' : '문구',
      value: `[${view.theme.label}] ${fillPreviewName(view.message)}`,
      step: 2,
    },
    { id: 'channel', label: '채널', value: view.channel.label, step: 3 },
    {
      id: 'timing',
      label: '발송 시점',
      value:
        draft.timing === 'now'
          ? '즉시 발송'
          : `예약 발송 · ${SCHEDULED_SEND_LABEL}`,
      step: 3,
    },
    {
      id: 'response',
      label: '예상 반응',
      value: `${view.responders.toLocaleString('ko-KR')}명 (${view.responseRate.toFixed(1)}%)`,
      step: 3,
    },
  ];

  return (
    <div className="mt-3 flex flex-col gap-3">
      <SectionTitle title="발송 내용 확인" />
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-border bg-white">
        {reviewRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[160px_minmax(0,1fr)_auto] items-center gap-6 px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <span className="text-xs font-semibold text-gray-500">
              {row.label}
            </span>
            <span className="text-sm font-semibold leading-relaxed text-gray-900">
              {row.value}
            </span>
            <button
              type="button"
              onClick={() => onEditStep(row.step)}
              className="h-9 shrink-0 rounded-lg border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              수정
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-1.5">
        <button
          type="button"
          onClick={onDownloadCsv}
          className="flex h-[46px] items-center gap-2 rounded-[10px] border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4 text-green-700" />
          대상자 엑셀 받기
        </button>
        <button
          type="button"
          onClick={onSend}
          className="h-[46px] rounded-[10px] bg-primary px-6 text-sm font-bold text-white hover:opacity-90"
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
