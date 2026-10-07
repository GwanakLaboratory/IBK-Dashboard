import { Check } from 'lucide-react';
import { type ReactNode } from 'react';

type SelectableCardProps = {
  selected: boolean;
  onSelect: () => void;
  /** 체크 표시 왼쪽에 놓일 첫 줄 (태그, 이름 등) */
  heading: ReactNode;
  children: ReactNode;
};

/** 여러 개 중 하나를 고르는 카드. 오른쪽 위 원형 체크로 선택을 표시한다. */
export function SelectableCard({
  selected,
  onSelect,
  heading,
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left ${
        selected
          ? 'border-blue-700 bg-blue-50/50 ring-1 ring-inset ring-blue-700'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span className="flex w-full items-center justify-between">
        {heading}
        <span
          className={`inline-flex size-5 items-center justify-center rounded-full ${
            selected
              ? 'bg-blue-700 text-white'
              : 'border border-slate-300 text-transparent'
          }`}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </span>
      {children}
    </button>
  );
}
