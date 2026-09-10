import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { RiskBadge } from '@/components/domain/RiskBadge';
import { getTopReason } from '@/utils/risk';
import type { Customer } from '@/types/churn';

type TopRiskCustomersTableProps = {
  customers: Customer[];
};

export function TopRiskCustomersTable({
  customers,
}: TopRiskCustomersTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
          <th className="pb-2 font-medium" />
          <th className="pb-2 font-medium">회원번호</th>
          <th className="pb-2 text-center font-medium">예측점수</th>
          <th className="pb-2 text-center font-medium">위험도</th>
          <th className="pb-2 font-medium">주요 이유</th>
          <th className="pb-2 text-right font-medium" />
        </tr>
      </thead>
      <tbody>
        {customers.map((customer, customerIndex) => {
          const topReason = getTopReason(customer);

          return (
            <tr
              key={customer.id}
              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <td className="py-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-xs font-semibold text-red-600">
                  {customerIndex + 1}
                </span>
              </td>
              <td className="py-3 font-medium">
                <Link
                  to={`/customer-detail/${customer.id}`}
                  className="text-primary hover:underline"
                >
                  {customer.id}
                </Link>
              </td>
              <td className="py-3 text-center font-semibold text-gray-900">
                {customer.predictionScore}
              </td>
              <td className="py-3 text-center">
                <RiskBadge riskLevel={customer.riskLevel} />
              </td>
              <td
                className="truncate py-3 text-gray-500"
                title={topReason.label}
              >
                {topReason.label}
              </td>
              <td className="py-3 text-right">
                <Link
                  to={`/customer-detail/${customer.id}`}
                  className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  상세보기
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
