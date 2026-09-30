import { type ReactNode } from 'react';

type AiInsightBoxProps = {
  title?: string;
  children: ReactNode;
};

export function AiInsightBox({ title, children }: AiInsightBoxProps) {
  return (
    <div className="rounded-[10px] border border-[#ECEEF3] bg-[#FAFAFC] px-4 py-3.5">
      <div className="flex flex-col gap-1">
        {title && (
          <span className="text-xs font-bold text-violet-600">{title}</span>
        )}
        <span className="text-xs leading-relaxed text-gray-700">
          {children}
        </span>
      </div>
    </div>
  );
}
