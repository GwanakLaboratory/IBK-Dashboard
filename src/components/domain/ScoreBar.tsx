import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';

type ScoreBarProps = {
  /** 이탈 예측 점수 0–100 */
  score: number;
  /** 막대 너비 (기본 w-16) */
  barClassName?: string;
};

/** 이탈 예측 점수 숫자 + 위험도 색 막대 */
export function ScoreBar({ score, barClassName = 'w-16' }: ScoreBarProps) {
  const meta = RISK_LEVEL_META[getRiskLevelFromScore(score)];

  return (
    <span className="flex items-center gap-2.5">
      <span className={`w-6 text-sm font-bold ${meta.textClassName}`}>
        {score}
      </span>
      <span
        className={`h-1.5 shrink-0 overflow-hidden rounded-full bg-slate-100 ${barClassName}`}
      >
        <span
          className={`block h-full rounded-full ${meta.barClassName}`}
          style={{ width: `${score}%` }}
        />
      </span>
    </span>
  );
}
