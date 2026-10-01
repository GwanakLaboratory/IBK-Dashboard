import { useNavigate } from 'react-router';
import { productUsageStats } from '@/data/customers';

type ProductSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function ProductSearchBar({
  value,
  onValueChange,
  disabled = false,
}: ProductSearchBarProps) {
  const navigate = useNavigate();

  function handleLookup() {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    const matchedProduct = productUsageStats.find(
      (stat) => stat.productName === trimmedValue,
    );
    if (matchedProduct) {
      navigate(`/card-list/${encodeURIComponent(matchedProduct.productName)}`);
    }
  }

  function handleReset() {
    onValueChange('');
    navigate('/card-list');
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-5 py-4">
      <div className="text-sm font-medium text-gray-900">상품명</div>
      <label htmlFor="product-search-input" className="sr-only">
        검색어
      </label>
      <input
        id="product-search-input"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleLookup();
          }
        }}
        placeholder="카드 상품명으로 조회"
        className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={handleLookup}
        disabled={disabled}
        className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        조회
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="h-10 shrink-0 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        초기화
      </button>
    </div>
  );
}
