import { Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const GENERATING_STAGES = [
  '세그먼트 특성 분석',
  '반응 이력으로 톤 맞추기',
  '문구 다듬기',
];

const SHIMMER_CLASS_NAME =
  'rounded-full bg-gradient-to-r from-violet-100 via-violet-50 to-violet-100 bg-[length:200%_100%] motion-safe:animate-ai-shimmer';

type AiGeneratingStateProps = {
  /** 전체 생성 연출 시간. 단계 표시를 이 시간에 맞춰 넘긴다. */
  durationMs: number;
  personaLabel: string;
  themeLabel: string;
  /** 제목 문구 (생략하면 "AI가 {테마} 문구를 만들고 있어요") */
  headline?: string;
};

/** AI 문구 생성 중 로딩 (흐르는 보라 테두리 + 단계 표시 + 스켈레톤) */
export function AiGeneratingState({
  durationMs,
  personaLabel,
  themeLabel,
  headline,
}: AiGeneratingStateProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((previous) =>
        Math.min(previous + 1, GENERATING_STAGES.length - 1),
      );
    }, durationMs / GENERATING_STAGES.length);
    return () => window.clearInterval(timer);
  }, [durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl bg-gradient-to-r from-violet-300 via-indigo-400 to-fuchsia-300 bg-[length:300%_100%] p-px motion-safe:animate-ai-gradient"
    >
      <div className="flex flex-col gap-4 rounded-xl bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex size-9 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-violet-400/40 motion-safe:animate-ping" />
            <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <Sparkles className="size-4 motion-safe:animate-pulse" />
            </span>
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-sm font-bold text-violet-900">
              {headline ?? `AI가 ${themeLabel} 문구를 만들고 있어요`}
              <span className="inline-flex gap-0.5" aria-hidden>
                {[
                  '[animation-delay:0ms]',
                  '[animation-delay:150ms]',
                  '[animation-delay:300ms]',
                ].map((delay) => (
                  <span
                    key={delay}
                    className={`size-1 rounded-full bg-violet-500 motion-safe:animate-bounce ${delay}`}
                  />
                ))}
              </span>
            </span>
            <span className="text-xs text-slate-500">
              {personaLabel} 세그먼트의 이탈 사유와 반응 이력을 참고해요
            </span>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-2">
          {GENERATING_STAGES.map((stage, index) => {
            const isDone = index < stageIndex;
            const isCurrent = index === stageIndex;
            return (
              <li key={stage} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors duration-300 ${
                    isDone
                      ? 'bg-violet-50 text-violet-700'
                      : isCurrent
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="size-3" strokeWidth={3} />
                  ) : (
                    <span
                      className={`size-1.5 rounded-full ${
                        isCurrent
                          ? 'bg-white motion-safe:animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    />
                  )}
                  {stage}
                </span>
                {index < GENERATING_STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className={`h-px w-4 ${isDone ? 'bg-violet-300' : 'bg-slate-200'}`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="grid grid-cols-2 gap-2.5" aria-hidden>
          {['A', 'B'].map((variant) => (
            <div
              key={variant}
              className="flex min-h-32 flex-col gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-5 items-center rounded-full bg-violet-100 px-2 text-2xs font-bold text-violet-400">
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
