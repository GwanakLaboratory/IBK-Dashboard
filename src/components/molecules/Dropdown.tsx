import { ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type DropdownOption = {
  value: string;
  label: string;
  /** 목록에서 오른쪽에 붙는 보라 표시 (예: "AI 추천") */
  badge?: string;
};

type DropdownProps = {
  /** 스크린리더용 이름 (예: "카드상품") */
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  /** 버튼 왼쪽 아이콘 (예: 달력) */
  icon?: LucideIcon;
  /** 펼친 목록을 버튼의 어느 쪽에 맞출지 (기본 왼쪽) */
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  /** 버튼 너비 등 (예: 'min-w-40') */
  className?: string;
};

const SIZE_CLASS_NAME = {
  sm: 'h-9 rounded-lg px-3 text-xs',
  md: 'h-10 rounded-lg px-3.5 text-sm',
};

/** 직접 그린 목록이 펼쳐지는 드롭다운. 바깥을 누르거나 Esc 를 누르면 닫힌다. */
export function Dropdown({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  align = 'left',
  size = 'md',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-2.5 border border-slate-300 bg-white font-bold text-slate-900 ${SIZE_CLASS_NAME[size]}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {Icon && <Icon className="size-4 shrink-0 text-slate-500" />}
          <span className="truncate">{selected?.label}</span>
        </span>
        <ChevronDown
          className={`size-3 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.4}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute top-full z-20 mt-1.5 flex max-h-80 min-w-full flex-col gap-0.5 overflow-y-auto rounded-xl border border-slate-300 bg-white p-1.5 shadow-lg ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-left text-sm ${
                  isSelected
                    ? 'bg-blue-50 font-bold text-blue-700'
                    : 'font-medium text-gray-900 hover:bg-slate-50'
                }`}
              >
                {option.label}
                {option.badge && (
                  <span className="ml-auto text-2xs font-bold text-violet-700">
                    {option.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
