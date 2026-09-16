import { RotateCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { customers } from '@/data/customers';

type CustomerSearchBarProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function CustomerSearchBar({
  value,
  onValueChange,
}: CustomerSearchBarProps) {
  const navigate = useNavigate();

  function handleLookup() {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }
    const matchedCustomer = customers.find(
      (customer) =>
        customer.id === trimmedValue ||
        customer.name === trimmedValue ||
        customer.phoneNumber === trimmedValue,
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
    <div className="mt-6 flex items-center gap-2">
      <Search className="h-5 w-5 text-gray-600" />
      <Input
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleLookup();
          }
        }}
        placeholder="이름 / 전화번호 / 회원번호로 조회"
        className="flex-1"
      />
      <Button onClick={handleLookup}>조회</Button>
      <Button variant="outline" onClick={handleReset}>
        <RotateCcw className="h-3.5 w-3.5" />
        초기화
      </Button>
    </div>
  );
}
