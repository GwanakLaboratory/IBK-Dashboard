import { SectionTitle } from '@/components/molecules/SectionTitle';
import { SCHEDULED_SEND_LABEL } from '@/data/marketing';
import {
  fillPreviewName,
  type CampaignDraft,
  type CampaignStep,
  type CampaignView,
} from '@/features/marketing/campaign/campaignModel';

type ReviewStepProps = {
  draft: CampaignDraft;
  view: CampaignView;
  onEditStep: (step: Exclude<CampaignStep, 0>) => void;
};

export function ReviewStep({ draft, view, onEditStep }: ReviewStepProps) {
  const targetCountLabel = view.targetCount.toLocaleString('ko-KR');
  const reviewRows: {
    label: string;
    value: string;
    step: Exclude<CampaignStep, 0>;
  }[] = [
    {
      label: '발송 대상',
      value: `${targetCountLabel}명 · ${view.segmentLabel}`,
      step: 1,
    },
    {
      label: '문구',
      value: `[${view.theme.label}] ${fillPreviewName(view.message)}`,
      step: 2,
    },
    { label: '채널', value: view.channel.label, step: 3 },
    {
      label: '발송 시점',
      value:
        draft.timing === 'now'
          ? '즉시 발송'
          : `예약 발송 · ${SCHEDULED_SEND_LABEL}`,
      step: 3,
    },
    {
      label: '예상 반응',
      value: `${view.responders.toLocaleString('ko-KR')}명 (${view.responseRate.toFixed(1)}%)`,
      step: 3,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <SectionTitle title="발송 내용 확인" />
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {reviewRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-b-0"
            >
              <span className="w-[110px] shrink-0 text-[13px] text-gray-600">
                {row.label}
              </span>
              <span className="flex-1 text-sm font-semibold text-gray-900">
                {row.value}
              </span>
              <button
                type="button"
                onClick={() => onEditStep(row.step)}
                className="h-[30px] shrink-0 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                수정
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
