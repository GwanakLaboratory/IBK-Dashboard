import { Check } from 'lucide-react';
import { Link } from 'react-router';
import { Modal } from '@/components/molecules/Modal';

export type CmoRow = { key: string; name: string; sub: string; count: string };

type SendCompleteModalProps = {
  subtitle: string;
  rows: CmoRow[];
  /** 확인 (선택을 처음 상태로 되돌린다) */
  onConfirm: () => void;
};

/** CMO 전달 완료 안내 */
export function SendCompleteModal({
  subtitle,
  rows,
  onConfirm,
}: SendCompleteModalProps) {
  const title = 'CMO로 전달했어요';

  return (
    <Modal label={title} onClose={onConfirm}>
      <div className="flex flex-col items-center gap-4">
        <span className="inline-flex size-[52px] items-center justify-center rounded-full bg-green-600 text-white">
          <Check className="size-[26px]" strokeWidth={2.8} />
        </span>
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <span className="text-sm text-slate-500">{subtitle}</span>
        </div>
        <ul className="flex w-full flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex items-center justify-between gap-4 px-4 py-3.5"
            >
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-sm font-bold text-slate-900">
                  {row.name}
                </span>
                <span className="text-xs leading-snug text-slate-500">
                  {row.sub}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold text-slate-900">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
        <div className="grid w-full grid-cols-2 gap-2.5 pt-1">
          <Link
            to="/marketing/history"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            접촉 이력에서 보기
          </Link>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 rounded-xl bg-blue-700 text-sm font-bold text-white hover:bg-blue-800"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}
