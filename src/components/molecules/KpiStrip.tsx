import { type ReactNode } from 'react';

export type KpiItem = {
  label: string;
  /** 라벨 색 (기본 slate-900). 예: 'text-blue-700', 'text-red-700' */
  labelClassName?: string;
  value: string;
  unit?: string;
  /** 보조 문구 앞에 붙는 배지 (예: DeltaBadge) */
  badge?: ReactNode;
  sub?: ReactNode;
};

type KpiStripProps = {
  items: KpiItem[];
  /** 칸 전체 크기 (여백 · 라벨 · 숫자) */
  size?: 'md' | 'lg';
};

const SIZE_CLASS_NAME = {
  md: {
    cell: 'gap-2.5 px-6 py-5',
    label: 'text-sm',
    value: 'text-3xl',
    unit: 'text-base',
  },
  lg: {
    cell: 'gap-3 px-7 py-6',
    label: 'text-base',
    value: 'text-4xl',
    unit: 'text-lg',
  },
};

/** 흰 박스 하나를 칸으로 나눈 핵심 지표 줄 */
export function KpiStrip({ items, size = 'md' }: KpiStripProps) {
  const sizeClassName = SIZE_CLASS_NAME[size];

  return (
    <div
      className="grid divide-x divide-slate-100 rounded-2xl border border-slate-200 bg-white"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex min-w-0 flex-col justify-center ${sizeClassName.cell}`}
        >
          <span
            className={`font-bold ${sizeClassName.label} ${item.labelClassName ?? 'text-slate-900'}`}
          >
            {item.label}
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`${sizeClassName.value} font-bold leading-none tracking-tight`}
            >
              {item.value}
            </span>
            {item.unit && (
              <span className={`${sizeClassName.unit} font-bold`}>
                {item.unit}
              </span>
            )}
          </div>
          {(item.badge || item.sub) && (
            <div className="flex min-w-0 items-center gap-2">
              {item.badge}
              {item.sub && (
                <span className="truncate text-xs text-slate-500">
                  {item.sub}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
