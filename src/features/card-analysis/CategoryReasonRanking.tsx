import type { ReasonImpact } from '@/features/reason-analysis/reasonAnalytics';

const SCORE_AXIS_TICKS = [0, 25, 50, 75, 100];

type RankingTone = 'red' | 'primary';

// [1위 순위 뱃지, 1위 막대, 2~3위 막대, 4위~ 막대, 1위 점수]
const TONE_CLASS_NAME: Record<
  RankingTone,
  {
    topBadge: string;
    topBar: string;
    upperBar: string;
    lowerBar: string;
    topValue: string;
  }
> = {
  red: {
    topBadge: 'bg-red-500 text-white',
    topBar: 'bg-red-500',
    upperBar: 'bg-red-300',
    lowerBar: 'bg-red-300',
    topValue: 'text-gray-900',
  },
  primary: {
    topBadge: 'bg-primary text-white',
    topBar: 'bg-primary',
    upperBar: 'bg-[#8AA3FF]',
    lowerBar: 'bg-[#C3D0FF]',
    topValue: 'text-primary',
  },
};

type CategoryReasonRankingProps = {
  reasonImpacts: ReasonImpact[];
  tone?: RankingTone;
  /** 여기 포함된 사유에는 '공통' 뱃지를 붙인다. (예: 다른 순위 목록에도 있는 사유) */
  sharedLabels?: string[];
};

export function CategoryReasonRanking({
  reasonImpacts,
  tone = 'red',
  sharedLabels,
}: CategoryReasonRankingProps) {
  const toneClassName = TONE_CLASS_NAME[tone];

  return (
    <div className="flex flex-col gap-3.5">
      {reasonImpacts.map((reason, reasonIndex) => {
        const isTopReason = reasonIndex === 0;
        const isShared = sharedLabels?.includes(reason.label) ?? false;
        const barClassName = isTopReason
          ? toneClassName.topBar
          : reasonIndex < 3
            ? toneClassName.upperBar
            : toneClassName.lowerBar;

        return (
          <div key={reason.label} className="flex items-center gap-3">
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                isTopReason
                  ? toneClassName.topBadge
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {reasonIndex + 1}
            </span>
            <div className="flex w-[150px] shrink-0 items-center gap-1.5">
              <span
                className={`truncate text-[13px] ${
                  isTopReason
                    ? 'font-bold text-gray-900'
                    : 'font-medium text-gray-700'
                }`}
              >
                {reason.label}
              </span>
              {isShared && (
                <span className="inline-flex h-[18px] shrink-0 items-center rounded bg-violet-50 px-1.5 text-[10px] font-bold text-violet-700">
                  공통
                </span>
              )}
            </div>
            <div className="h-3.5 flex-1 overflow-hidden rounded bg-gray-100">
              <div
                className={`h-full rounded ${barClassName}`}
                style={{ width: `${Math.min(100, reason.averageScore)}%` }}
              />
            </div>
            <span
              className={`w-8 text-right text-[13px] font-bold ${
                isTopReason ? toneClassName.topValue : 'text-gray-900'
              }`}
            >
              {Math.round(reason.averageScore)}
            </span>
          </div>
        );
      })}

      <div className="flex justify-between pl-[184px] pr-11 text-[10px] text-gray-400">
        {SCORE_AXIS_TICKS.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}
