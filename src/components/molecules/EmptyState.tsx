import { Construction, type LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  Icon?: LucideIcon;
};

export function EmptyState({
  title = '준비 중인 화면입니다',
  description = '해당 기능은 아직 개발되지 않았습니다.',
  Icon = Construction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Icon className="h-8 w-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
