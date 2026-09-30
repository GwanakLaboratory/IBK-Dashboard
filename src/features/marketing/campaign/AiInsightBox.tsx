import { Sparkles } from 'lucide-react';
import { type ReactNode } from 'react';

type AiInsightBoxProps = {
  title?: string;
  children: ReactNode;
};

export function AiInsightBox({ title, children }: AiInsightBoxProps) {
  return (
    <div className="flex gap-3 rounded-[10px] border border-violet-200 bg-violet-50 px-4 py-3.5">
      <Sparkles className="mt-0.5 h-[18px] w-[18px] shrink-0 text-violet-600" />
      <div className="flex flex-1 flex-col gap-1">
        {title && (
          <span className="text-xs font-bold text-violet-600">{title}</span>
        )}
        <span className="text-[13px] leading-relaxed text-violet-950">
          {children}
        </span>
      </div>
    </div>
  );
}
