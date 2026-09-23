export type TrendPeriodMonths = 3 | 6 | 12;

const PERIOD_OPTIONS: TrendPeriodMonths[] = [3, 6, 12];

type TrendPeriodFilterProps = {
  value: TrendPeriodMonths;
  onChange: (value: TrendPeriodMonths) => void;
};

export function TrendPeriodFilter({ value, onChange }: TrendPeriodFilterProps) {
  return (
    <div className="mb-4 flex gap-1.5">
      {PERIOD_OPTIONS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === period
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {period}개월
        </button>
      ))}
    </div>
  );
}
