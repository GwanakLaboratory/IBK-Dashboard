import { useMemo, useState } from 'react';
import { Select } from '@/components/molecules/Select';
import { ReasonImpactChart } from '@/features/reason-analysis/ReasonImpactChart';
import { getAverageReasonImpact } from '@/features/reason-analysis/reasonAnalytics';
import type { Customer } from '@/types/churn';

type FilterableReasonImpactChartProps = {
  customers: Customer[];
  options: string[];
  allOptionLabel: string;
  matchesOption: (customer: Customer, option: string) => boolean;
  emptyMessage: string;
};

const TOP_REASON_COUNT = 5;

type OptionFilter = string | 'all';

export function FilterableReasonImpactChart({
  customers,
  options,
  allOptionLabel,
  matchesOption,
  emptyMessage,
}: FilterableReasonImpactChartProps) {
  const [selectedOption, setSelectedOption] = useState<OptionFilter>('all');

  const filteredCustomers =
    selectedOption === 'all'
      ? customers
      : customers.filter((customer) => matchesOption(customer, selectedOption));

  const topReasonImpacts = useMemo(
    () => getAverageReasonImpact(filteredCustomers).slice(0, TOP_REASON_COUNT),
    [filteredCustomers],
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Select
          value={selectedOption}
          onChange={(event) =>
            setSelectedOption(event.target.value as OptionFilter)
          }
          className="w-auto min-w-[10rem]"
        >
          <option value="all">{allOptionLabel}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
      {topReasonImpacts.length > 0 ? (
        <ReasonImpactChart reasonImpacts={topReasonImpacts} />
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">{emptyMessage}</p>
      )}
    </div>
  );
}
