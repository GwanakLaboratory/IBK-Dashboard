import { RotateCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
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
    <div className="mt-6 flex items-center gap-2">
      <Search className="h-5 w-5 text-gray-600" />
      <Input
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
        className="flex-1"
      />
      <Button onClick={handleLookup} disabled={disabled}>
        조회
      </Button>
      <Button variant="outline" onClick={handleReset}>
        <RotateCcw className="h-3.5 w-3.5" />
        초기화
      </Button>
    </div>
  );
}
