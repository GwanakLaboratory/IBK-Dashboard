import { Check } from 'lucide-react';
import { type ReactNode } from 'react';
import type {
  CampaignSectionStep,
  SectionState,
} from '@/features/marketing/campaign/campaignModel';

type CampaignFormSectionProps = {
  step: CampaignSectionStep;
  title: string;
  state: SectionState;
  /** 완료 시 요약, 잠김 시 안내 문구 ('이전 단계를 마치면 열려요') */
  summary?: string;
  onReopen: () => void;
  footHint: string;
  nextLabel: string;
  isNextDisabled?: boolean;
  onNext: () => void;
  children: ReactNode;
};

export function CampaignFormSection({
  step,
  title,
  state,
  summary,
  onReopen,
  footHint,
  nextLabel,
  isNextDisabled,
  onNext,
  children,
}: CampaignFormSectionProps) {
  const isOpen = state === 'open';
  const isDone = state === 'done';
  const isLocked = state === 'locked';

  return (
    <section
      className={`rounded-xl bg-white ${isOpen ? 'border border-blue-200' : 'border border-border'}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          if (isDone) onReopen();
        }}
        className={`flex min-h-[60px] w-full items-center gap-3 px-6 text-left ${
          isDone ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <span
          className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isOpen
              ? 'bg-primary text-white'
              : isDone
                ? 'bg-blue-100 text-primary'
                : 'border border-gray-300 bg-white text-gray-400'
          }`}
        >
          {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : step}
        </span>
        <span
          className={`shrink-0 text-sm ${
            isLocked ? 'font-semibold text-gray-400' : 'font-bold text-gray-900'
          }`}
        >
          {title}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
          {summary}
        </span>
        {isDone && (
          <span className="shrink-0 text-xs font-semibold text-primary">
            변경
          </span>
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 px-6 pb-6 pt-1">
          {children}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-600">{footHint}</span>
            <button
              type="button"
              disabled={isNextDisabled}
              onClick={onNext}
              className="h-11 rounded-[10px] bg-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
