import {
  ageGroupChurnStats,
  customers as dummyCustomers,
  genderChurnStats,
  ibkCreditCardInfoByName,
  ibkCreditCardInfos,
  ibkCreditCards,
  memberCohortChurnStats,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
} from '@/data/dummy';
import type { Customer } from '@/types/churn';

// Reasons are sorted by score (highest first) so that consumers can safely
// treat `churnReasons[0]` as the top reason without relying on the source
// data's ordering being correct.
export const customers: Customer[] = dummyCustomers.map((customer) => ({
  ...customer,
  churnReasons: [...customer.churnReasons].sort(
    (reasonA, reasonB) => reasonB.score - reasonA.score,
  ),
}));

export {
  ageGroupChurnStats,
  genderChurnStats,
  ibkCreditCardInfoByName,
  ibkCreditCardInfos,
  ibkCreditCards,
  memberCohortChurnStats,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  productUsageStats,
};
