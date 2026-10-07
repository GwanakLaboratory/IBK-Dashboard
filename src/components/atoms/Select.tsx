import { ChevronDown } from 'lucide-react';
import { type SelectHTMLAttributes } from 'react';

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: { value: string; label: string }[];
};

/** 브라우저 기본 화살표를 숨기고 lucide 화살표를 붙인 드롭다운 */
export function Select({ options, className = '', ...props }: SelectProps) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-xs font-medium text-slate-900 outline-none focus:border-blue-700"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        strokeWidth={2}
      />
    </span>
  );
}
