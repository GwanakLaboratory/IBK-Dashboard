import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  helperText?: string;
  icon?: LucideIcon;
  iconColorClassName?: string;
};

export function StatCard({
  label,
  value,
  helperText,
  icon: Icon,
  iconColorClassName = 'bg-gray-100 text-gray-500',
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-5 shadow-sm">
      {Icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColorClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {helperText && (
          <p className="mt-0.5 text-xs text-gray-400">{helperText}</p>
        )}
      </div>
    </div>
  );
}
