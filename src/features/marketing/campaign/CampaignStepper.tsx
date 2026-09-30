import { Fragment } from 'react';
import { Check } from 'lucide-react';
import type { CampaignStep } from '@/features/marketing/campaign/campaignModel';

type StepDefinition = {
  step: Exclude<CampaignStep, 0>;
  label: string;
  isAi: boolean;
};

const STEPS: StepDefinition[] = [
  { step: 1, label: '대상 세그먼트', isAi: false },
  { step: 2, label: '문구 생성', isAi: true },
  { step: 3, label: '발송 채널', isAi: false },
  { step: 4, label: '확인 및 발송', isAi: false },
];

type CampaignStepperProps = {
  currentStep: CampaignStep;
  onStepClick: (step: Exclude<CampaignStep, 0>) => void;
};

export function CampaignStepper({
  currentStep,
  onStepClick,
}: CampaignStepperProps) {
  return (
    <nav aria-label="발송 단계" className="px-6 py-2">
      <ol className="flex items-center">
        {STEPS.map((item, index) => {
          const isCurrent = item.step === currentStep;
          const isDone = item.step < currentStep;
          const isLast = index === STEPS.length - 1;

          return (
            <Fragment key={item.step}>
              <li>
                <button
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => onStepClick(item.step)}
                  className={`w-26 flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 transition-colors ${
                    isCurrent ? 'bg-primary' : ''
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      isCurrent
                        ? 'bg-white text-primary'
                        : isDone
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      item.step
                    )}
                  </span>

                  <span
                    className={`text-sm ${
                      isCurrent
                        ? 'font-semibold text-white'
                        : isDone
                          ? 'font-semibold text-gray-900'
                          : 'font-medium text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>

              {!isLast && (
                <li
                  aria-hidden
                  className={`mx-2 h-px flex-1 rounded-full ${
                    isDone ? 'bg-blue-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
