import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  /** 스크린리더용 이름 */
  label: string;
  onClose: () => void;
  /** 대화상자 너비·여백 (기본 max-w-md p-6) */
  className?: string;
  children: ReactNode;
};

/** 화면 가운데 흰 대화상자. 바깥을 누르거나 Esc 로 닫는다. */
export function Modal({
  label,
  onClose,
  className = 'max-w-md p-6',
  children,
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className={`w-full rounded-2xl border border-slate-200 bg-white shadow-xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
