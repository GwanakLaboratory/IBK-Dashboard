type DeltaBadgeProps = {
  /** 전월 대비 변화량 (양수면 ▲) */
  delta: number;
  /** 숫자 뒤 단위 (기본 %p) */
  unit?: string;
  /** 오르는 게 나쁜 지표인지 (이탈률 등). true 면 ▲ 빨강, ▼ 초록 */
  upIsBad?: boolean;
  fractionDigits?: number;
  size?: 'sm' | 'md';
};

const SIZE_CLASS_NAME = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-7 px-2.5 text-sm',
};

/** ▲ 0.1%p 처럼 증감을 보여주는 알약 배지 */
export function DeltaBadge({
  delta,
  unit = '%p',
  upIsBad = true,
  fractionDigits = 1,
  size = 'sm',
}: DeltaBadgeProps) {
  const isUp = delta > 0;
  const isFlat = delta === 0;
  const isBad = upIsBad ? isUp : !isUp;
  const colorClassName = isFlat
    ? 'bg-slate-100 text-slate-500'
    : isBad
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full font-bold ${SIZE_CLASS_NAME[size]} ${colorClassName}`}
    >
      {isFlat ? '–' : isUp ? '▲' : '▼'}{' '}
      {Math.abs(delta).toFixed(fractionDigits)}
      {unit}
    </span>
  );
}
