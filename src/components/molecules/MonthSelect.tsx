import { CalendarDays, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type MonthSelectProps = {
  /** 고를 수 있는 월 (최신 월이 앞) */
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

/** 달력 아이콘이 붙은 기준 월 드롭다운. 바깥을 누르면 닫힌다. */
export function MonthSelect({ options, value, onChange }: MonthSelectProps) {
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
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900"
      >
        <CalendarDays className="size-4 text-slate-500" />
        {selected?.label}
        <ChevronDown className="size-3 text-slate-400" strokeWidth={2.4} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="기준 월"
          className="absolute right-0 top-12 z-10 flex w-44 flex-col gap-0.5 rounded-xl border border-slate-300 bg-white p-1.5 shadow-lg"
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
                className={`h-9 rounded-md px-3 text-left text-sm ${
                  isSelected
                    ? 'bg-blue-50 font-bold text-blue-700'
                    : 'font-medium text-gray-900 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
