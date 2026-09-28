import { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  helperText?: string;
  indicator?: boolean;
  Icon?: LucideIcon;
  textSize?: string;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  unit,
  helperText,
  indicator,
  Icon,
  textSize,
  onClick,
}: StatCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`flex flex-col gap-2 rounded-xl border border-border bg-white p-5 shadow-sm ${
        onClick
          ? 'cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50'
          : ''
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="text-sm text-gray-500">{label}</p>

        {Icon && (
          <div className="flex shrink-0 items-center justify-center lg:hidden xl:flex">
            <Icon
              className={`h-6 w-6 ${indicator ? 'text-red-500' : 'text-gray-400'}`}
            />
          </div>
        )}
      </div>

      <p className="flex w-full items-baseline gap-1">
        <span
          className={`font-extrabold tracking-tight ${textSize ?? 'text-[28px]'} ${
            indicator ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {value}
        </span>
        {unit && (
          <span
            className={`text-sm font-semibold ${
              indicator ? 'text-red-600' : 'text-gray-700'
            }`}
          >
            {unit}
          </span>
        )}
      </p>

      {helperText && (
        <p
          className={`text-xs ${indicator ? 'text-red-600' : 'text-gray-500'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
