import { RotateCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { customers } from '@/data/customers';

export type CustomerSearchField = 'name' | 'phoneNumber' | 'id';

type CustomerSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  searchField: CustomerSearchField;
  onSearchFieldChange: (searchField: CustomerSearchField) => void;
  disabled?: boolean;
};

const SEARCH_FIELD_OPTIONS: {
  key: CustomerSearchField;
  label: string;
  placeholder: string;
  inputMode: 'text' | 'tel';
}[] = [
  { key: 'name', label: '이름', placeholder: '예) 홍길동', inputMode: 'text' },
  {
    key: 'phoneNumber',
    label: '전화번호',
    placeholder: '예) 010-1234-5678',
    inputMode: 'tel',
  },
  {
    key: 'id',
    label: '회원번호',
    placeholder: '예) CUS-10000',
    inputMode: 'text',
  },
];

export function CustomerSearchBar({
  value,
  onValueChange,
  searchField,
  onSearchFieldChange,
  disabled = false,
}: CustomerSearchBarProps) {
  const navigate = useNavigate();
  const activeOption =
    SEARCH_FIELD_OPTIONS.find((option) => option.key === searchField) ??
    SEARCH_FIELD_OPTIONS[0];

  function handleLookup() {
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
    navigate('/customer-detail');
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="inline-flex gap-1 rounded-lg bg-gray-100 p-1">
        {SEARCH_FIELD_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={disabled}
            onClick={() => onSearchFieldChange(option.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              option.key === searchField
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } ${disabled && option.key !== searchField ? 'cursor-not-allowed opacity-50 hover:text-gray-500' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
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
            className="w-full pl-9"
          />
        </div>
        <Button onClick={handleLookup} disabled={disabled}>
          조회
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          초기화
        </Button>
      </div>
    </div>
  );
}
