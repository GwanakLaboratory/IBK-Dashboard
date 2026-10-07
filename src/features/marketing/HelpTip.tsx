import { useEffect, useRef, useState } from 'react';

type HelpTipProps = {
  /** 버튼의 스크린리더용 이름 */
  label: string;
  text: string;
  /** 말풍선을 버튼의 어느 쪽에 맞출지 */
  align?: 'left' | 'right';
};

/** 표 머리글 옆 작은 ? 버튼. 누르면 기준 설명 말풍선이 뜨고 바깥을 누르면 닫힌다. */
export function HelpTip({ label, text, align = 'left' }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="inline-flex size-4 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold leading-none text-slate-500"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className={`absolute top-6 z-10 w-56 whitespace-normal rounded-lg bg-slate-900 px-3 py-2.5 text-left text-xs font-medium leading-normal text-white ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
