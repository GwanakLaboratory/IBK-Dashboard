import { Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';

type AiInsightBoxProps = {
  /** 문장 뒤에 파란색으로 강조할 추천 요약 */
  highlight?: string;
  children: ReactNode;
};

/** AI 분석 한 줄 바 (보라 "AI 분석" 칩 + 설명 + 추천 강조) */
export function AiInsightBox({ highlight, children }: AiInsightBoxProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-[18px] py-3.5">
      <span className="inline-flex h-[26px] shrink-0 items-center gap-1.5 rounded-full bg-violet-50 px-2.5 text-xs font-bold text-violet-700">
        <Sparkles className="size-[13px]" />
        AI 분석
      </span>
      <span className="text-sm text-gray-800">{children}</span>
      {highlight && (
        <span className="text-sm font-bold text-blue-700">{highlight}</span>
      )}
    </div>
  );
}
