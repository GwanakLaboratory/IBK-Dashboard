import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  /** 스크린리더용 이름 */
  label: string;
  onClose: () => void;
  children: ReactNode;
};

/** 화면 가운데 흰 대화상자. 바깥을 누르거나 Esc 로 닫는다. */
export function Modal({ label, onClose, children }: ModalProps) {
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
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}
