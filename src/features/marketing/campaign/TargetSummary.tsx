import { Download, Info, Send } from 'lucide-react';
import {
  formatCount,
  type TargetSummary as Summary,
} from '@/features/marketing/campaign/campaignModel';
import { StepHeading } from '@/features/marketing/campaign/TargetSelectPanel';

type TargetSummaryProps = {
  step: number;
  summary: Summary;
  onExtract: () => void;
  onSendToCmo: () => void;
};

const BIG_BUTTON_CLASS_NAME =
  'inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-xl text-base font-bold disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400';

/** 확인 후 전달: 선택 요약 + 대상 추출 · CMO 전달 */
export function TargetSummary({
  step,
  summary,
  onExtract,
  onSendToCmo,
}: TargetSummaryProps) {
  return (
    <>
      <section className="flex flex-col gap-3">
        <StepHeading step={step} title="확인 후 전달" />
        <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-white">
          <div className="flex min-w-0 flex-col justify-center gap-3 px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-blue-700">
                선택한 대상
              </span>
              <span className="inline-flex h-[26px] items-center rounded-full bg-blue-50 px-2.5 text-xs font-bold text-blue-700">
                {summary.chip}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {summary.items.map((item) => (
                <span
                  key={`${item.key}-${item.value}`}
                  className="inline-flex h-[30px] max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs"
                >
                  <span className="font-medium text-slate-500">{item.key}</span>
                  <span className="truncate font-bold text-slate-900">
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
            {summary.empty && (
              <span className="pt-2 text-sm text-slate-400">
                아직 고른 대상이 없어요. 위에서 세그먼트나 조건을 골라 주세요.
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2.5 border-l border-slate-100 px-7 py-5">
            <span className="text-lg font-bold text-blue-700">
              선택 조건에 해당하는 고객
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold leading-none tracking-tighter text-slate-900">
                {formatCount(summary.total)}
              </span>
              <span className="text-xl font-bold">명</span>
            </div>
            <span className="text-xs text-gray-600">{summary.note}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onExtract}
            disabled={summary.empty}
            className={`${BIG_BUTTON_CLASS_NAME} border border-blue-700 bg-white text-blue-700 hover:bg-blue-50`}
          >
            <Download className="size-5" />
            대상 추출하기
          </button>
          <span className="text-xs text-slate-500">
            선택 조건의 고객 목록을 엑셀로 내려받아요
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onSendToCmo}
            disabled={summary.empty}
            className={`${BIG_BUTTON_CLASS_NAME} bg-blue-700 text-white hover:bg-blue-800`}
          >
            <Send className="size-5" />
            CMO로 바로 전달하기
          </button>
          <span className="text-xs text-slate-500">
            카드마케팅시스템(CMO)에 대상 고객을 전달해요
          </span>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 self-center text-xs text-slate-500">
        <Info className="size-[15px]" />
        마케팅 문구 · 발송 채널 · 일정은 CMO에서 설정해요
      </span>
    </>
  );
}
