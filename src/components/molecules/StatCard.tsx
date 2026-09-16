import { LucideIcon } from 'lucide-react';
import { RiskIndicator } from '../domain/RiskIndicator';

type StatCardProps = {
  label: string;
  value: string;
  helperText?: string;
  indicator?: boolean;
  Icon?: LucideIcon;
  textSize?: string;
};

export function StatCard({
  label,
  value,
  helperText,
  indicator,
  Icon,
  textSize,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-5 shadow-sm">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {indicator && <RiskIndicator riskLevel="high" />}
          <p className="text-sm text-gray-500">{label}</p>
        </div>

        {Icon && (
          <Icon
            className={`h-6 w-6 ${indicator ? 'text-red-500' : 'text-gray-400'}`}
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
