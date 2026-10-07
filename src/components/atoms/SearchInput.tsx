import { Search } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** 바깥 label 너비 등 (기본 grow) */
  className?: string;
};

/** 돋보기 아이콘이 붙은 검색 입력창 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = 'grow', ...props }, ref) => (
    <label
      className={`flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 focus-within:border-blue-700 ${className}`}
    >
      <Search className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
      <input
        ref={ref}
        type="search"
        className="min-w-0 grow bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        {...props}
      />
    </label>
  ),
);
SearchInput.displayName = 'SearchInput';
