import { Square } from 'lucide-react';
import { type ReactNode } from 'react';

type SectionTitleProps = {
  title: string;
  description?: string;
  /** 제목 줄 오른쪽에 붙는 요소 (탭, 링크 등) */
  actions?: ReactNode;
  className?: string;
};

/** Card 헤더와 같은 "■ 제목 / 설명" 모양. 흰 박스 없이 섹션 제목만 필요할 때 쓴다. */
export function SectionTitle({
  title,
  description,
  actions,
  className = '',
}: SectionTitleProps) {
  return (
    <header className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h2 className="flex items-center gap-3 text-base font-semibold text-gray-900">
          <Square className="h-2 w-2 bg-gray-900" />
          {title}
        </h2>
        {description && (
          <p className="mt-1 pl-5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3.5 self-end">
          {actions}
        </div>
      )}
    </header>
  );
}
