import { useNavigate } from 'react-router';
import { customers } from '@/data/customers';

export type CustomerSearchField = 'name' | 'phoneNumber' | 'id';

type CustomerSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  searchField: CustomerSearchField;
  onSearchFieldChange: (searchField: CustomerSearchField) => void;
  disabled?: boolean;
  /** 넘기면 회원 상세로 이동하는 대신 이 함수를 호출한다. */
  onLookup?: () => void;
  onReset?: () => void;
};

const SEARCH_FIELD_OPTIONS: {
  key: CustomerSearchField;
  label: string;
  placeholder: string;
  inputMode: 'text' | 'tel';
}[] = [
  {
    key: 'name',
    label: '이름',
    placeholder: '회원 이름을 입력하세요',
    inputMode: 'text',
  },
  {
    key: 'phoneNumber',
    label: '전화번호',
    placeholder: '010-0000-0000',
    inputMode: 'tel',
  },
  {
    key: 'id',
    label: '회원번호',
    placeholder: 'CUS-00000',
    inputMode: 'text',
  },
];

export function CustomerSearchBar({
  value,
  onValueChange,
  searchField,
  onSearchFieldChange,
  disabled = false,
  onLookup,
  onReset,
}: CustomerSearchBarProps) {
  const navigate = useNavigate();
  const activeOption =
    SEARCH_FIELD_OPTIONS.find((option) => option.key === searchField) ??
    SEARCH_FIELD_OPTIONS[0];

  function handleLookup() {
    if (onLookup) {
      onLookup();
      return;
    }
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    const matchedCustomer = customers.find(
      (customer) => customer[searchField] === trimmedValue,
    );
    if (matchedCustomer) {
      navigate(`/customer-detail/${matchedCustomer.id}`);
    }
  }

  function handleReset() {
    onValueChange('');
    if (onReset) {
      onReset();
      return;
    }
    navigate('/customer-detail');
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3">
      <div
        role="tablist"
        aria-label="검색 기준"
        className="flex gap-0.5 rounded-lg bg-gray-100 p-[3px]"
      >
        {SEARCH_FIELD_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={option.key === searchField}
            disabled={disabled}
            onClick={() => onSearchFieldChange(option.key)}
            className={`h-[34px] rounded-md px-3.5 text-sm transition-colors ${
              option.key === searchField
                ? 'bg-white font-bold text-primary shadow-sm'
                : 'font-medium text-gray-500 hover:text-gray-700'
            } ${disabled && option.key !== searchField ? 'cursor-not-allowed opacity-50 hover:text-gray-500' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label htmlFor="customer-search-input" className="sr-only">
        검색어
      </label>
      <input
        id="customer-search-input"
        type="text"
        inputMode={activeOption.inputMode}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleLookup();
          }
        }}
        placeholder={activeOption.placeholder}
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
