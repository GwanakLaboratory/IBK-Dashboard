import { type ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: string;
  helperText?: string;
  indicator?: ReactNode;
};

export function StatCard({
  label,
  value,
  helperText,
  indicator,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm text-gray-500">
        {indicator}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {helperText && (
        <p className="mt-0.5 text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
