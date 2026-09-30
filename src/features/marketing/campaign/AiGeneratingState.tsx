import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

const GENERATING_STAGES = [
  '세그먼트 특성 분석',
  '반응 이력으로 톤 맞추기',
  '문구 다듬기',
];

type AiGeneratingStateProps = {
  /** 전체 생성 연출 시간. 단계 표시를 이 시간에 맞춰 나눠 넘긴다. */
  durationMs: number;
  personaLabel: string;
  themeLabel: string;
  /** 텔레마케팅 채널은 "문구"가 아니라 상담원이 참고할 "스크립트"로 부른다. */
  isScript?: boolean;
};

const SHIMMER_CLASS_NAME =
  'rounded-full bg-[linear-gradient(90deg,#EDE9FE_0%,#F5F3FF_40%,#DDD6FE_50%,#F5F3FF_60%,#EDE9FE_100%)] bg-[length:200%_100%] motion-safe:animate-ai-shimmer';

export function AiGeneratingState({
  durationMs,
  personaLabel,
  themeLabel,
  isScript,
}: AiGeneratingStateProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const stageMs = durationMs / GENERATING_STAGES.length;
    const timer = window.setInterval(() => {
      setStageIndex((previous) =>
        Math.min(previous + 1, GENERATING_STAGES.length - 1),
      );
    }, stageMs);
    return () => window.clearInterval(timer);
  }, [durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[264px] rounded-xl bg-[linear-gradient(90deg,#C4B5FD,#818CF8,#F0ABFC,#A78BFA,#C4B5FD)] bg-[length:300%_100%] p-px shadow-lg shadow-violet-500/10 motion-safe:animate-ai-gradient"
    >
      <div className="flex w-full flex-col justify-between gap-4 rounded-[11px] bg-white px-6 py-4">
        <div className="flex items-center gap-3.5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-violet-400/40 motion-safe:animate-ping" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C3AED,#4F46E5)] text-white">
              <Sparkles className="h-5 w-5 motion-safe:animate-pulse" />
            </span>
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-sm font-bold text-violet-900">
              AI가 {themeLabel} {isScript ? '스크립트를' : '문구를'} 만들고
              있어요
              <span className="inline-flex gap-0.5" aria-hidden>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1 w-1 rounded-full bg-violet-500 motion-safe:animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
            </span>
            <span className="text-xs text-gray-500">
              {personaLabel} 세그먼트의 이탈 사유와 반응 이력을 참고해요
            </span>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {GENERATING_STAGES.map((stage, index) => {
            const isDone = index < stageIndex;
            const isCurrent = index === stageIndex;
            return (
              <li key={stage} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors duration-300 ${
                    isDone
                      ? 'bg-violet-100 text-violet-600'
                      : isCurrent
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCurrent
                          ? 'bg-white motion-safe:animate-pulse'
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                  {stage}
                </span>
                {index < GENERATING_STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className={`h-px w-4 ${isDone ? 'bg-violet-300' : 'bg-gray-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-hidden>
          {['A', 'B'].map((variant) => (
            <div
              key={variant}
              className="flex min-h-[130px] flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50 px-[18px] py-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-[22px] items-center rounded-full bg-violet-100 px-2 text-[12px] font-bold text-violet-400">
                  AI 생성 {variant}
                </span>
                <span className={`h-3 w-20 ${SHIMMER_CLASS_NAME}`} />
              </div>
              <span className={`h-3 w-full ${SHIMMER_CLASS_NAME}`} />
              <span className={`h-3 w-11/12 ${SHIMMER_CLASS_NAME}`} />
              <span className={`h-3 w-2/3 ${SHIMMER_CLASS_NAME}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
