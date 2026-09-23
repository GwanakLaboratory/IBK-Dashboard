import { LucideIcon } from 'lucide-react';
import { RiskIndicator } from '../domain/RiskIndicator';

type StatCardProps = {
  label: string;
  value: string;
  helperText?: string;
  indicator?: boolean;
  Icon?: LucideIcon;
  textSize?: string;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
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
      className={`flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-sm ${
        onClick
          ? 'cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50'
          : ''
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {indicator && <RiskIndicator riskLevel="high" />}
          <p className="text-sm text-gray-500">{label}</p>
        </div>

        {Icon && (
          <Icon
            className={`h-5 w-5 ${indicator ? 'text-red-500' : 'text-gray-400'}`}
          />
        )}
      </div>
      <p
        className={`w-full font-semibold text-gray-900 ${textSize ?? 'text-xl'}`}
      >
        {value}
      </p>
      {helperText && <p className="text-sm text-gray-400">{helperText}</p>}
    </div>
  );
}
