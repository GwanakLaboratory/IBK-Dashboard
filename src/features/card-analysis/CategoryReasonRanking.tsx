import type { ReasonImpact } from '@/features/reason-analysis/reasonAnalytics';

const SCORE_AXIS_TICKS = [0, 25, 50, 75, 100];

type CategoryReasonRankingProps = {
  reasonImpacts: ReasonImpact[];
};

export function CategoryReasonRanking({
  reasonImpacts,
}: CategoryReasonRankingProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {reasonImpacts.map((reason, reasonIndex) => {
        const isTopReason = reasonIndex === 0;

        return (
          <div key={reason.label} className="flex items-center gap-3">
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                isTopReason
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {reasonIndex + 1}
            </span>
            <span className="w-[150px] shrink-0 truncate text-[13px] text-gray-900">
              {reason.label}
            </span>
            <div className="h-3.5 flex-1 overflow-hidden rounded bg-gray-100">
              <div
                className={`h-full rounded ${
                  isTopReason ? 'bg-red-500' : 'bg-red-300'
                }`}
                style={{ width: `${Math.min(100, reason.averageScore)}%` }}
              />
            </div>
            <span className="w-8 text-right text-[13px] font-bold text-gray-900">
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
