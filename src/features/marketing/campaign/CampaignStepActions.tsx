import { Download } from 'lucide-react';

type CampaignStepActionsProps = {
  /** panel: 요약 패널 안에 세로로 쌓는다 · bar: 좁은 화면 하단에 가로로 놓는다 */
  layout: 'panel' | 'bar';
  isLastStep: boolean;
  nextLabel: string;
  isNextDisabled: boolean;
  sendLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
  onSend: () => void;
};

const SECONDARY_BUTTON_CLASS_NAME =
  'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-gray-300 bg-white px-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-50';

export function CampaignStepActions({
  layout,
  isLastStep,
  nextLabel,
  isNextDisabled,
  sendLabel,
  onPrev,
  onNext,
  onDownload,
  onSend,
}: CampaignStepActionsProps) {
  const primaryButton = isLastStep ? (
    <button
      type="button"
      onClick={onSend}
      className="h-[46px] flex-1 rounded-[10px] bg-primary px-4 text-[15px] font-bold text-white hover:opacity-90"
    >
      {sendLabel}
    </button>
  ) : (
    <button
      type="button"
      disabled={isNextDisabled}
      onClick={onNext}
      className="h-12 flex-1 rounded-[10px] bg-primary px-4 text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-40"
    >
      {nextLabel}
    </button>
  );

  const secondaryButtons = (
    <>
      <span
        onClick={onPrev}
        className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[10px] bg-white px-3 text-sm font-semibold text-gray-500 hover:bg-gray-50"
      >
        ← 이전 단계
      </span>
      {isLastStep && (
        <button
          type="button"
          onClick={onDownload}
          className={SECONDARY_BUTTON_CLASS_NAME}
        >
          <Download className="h-4 w-4 text-green-700" />
          대상자 엑셀
        </button>
      )}
    </>
  );

  if (layout === 'bar') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-2">{secondaryButtons}</div>
        {primaryButton}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex">{primaryButton}</div>
      <div className="flex gap-2">{secondaryButtons}</div>
    </div>
  );
}
