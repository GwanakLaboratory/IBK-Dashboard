import { RISK_LEVEL_META } from '@/utils/risk';
import type { Customer } from '@/types/churn';

const CSV_HEADER = [
  '회원번호',
  '이름',
  '전화번호',
  '카드상품',
  '가입일',
  '성별',
  '나이',
  '위험도',
  '이탈예측점수',
  '주요 이탈 사유',
];

export function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function toCsvRow(values: string[]) {
  return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(',');
}

// CSV는 마케팅팀이 실제 연락에 사용하도록 실명/연락처를 그대로 담는다.
// (화면 표시는 다른 화면과 동일하게 마스킹된 이름을 보여준다.)
export function downloadCustomerCsv(
  rows: Customer[],
  fileNamePrefix = '캠페인대상',
) {
  const lines = rows.map((customer) =>
    toCsvRow([
      customer.id,
      customer.name,
      customer.phoneNumber,
      customer.productName,
      customer.joinedAt,
      customer.gender,
      String(customer.age),
      RISK_LEVEL_META[customer.riskLevel].label,
      String(customer.predictionScore),
      customer.churnReasons[0]?.label ?? '',
    ]),
  );
  const csvContent = [toCsvRow(CSV_HEADER), ...lines].join('\r\n');
  const utf8Bom = '﻿';
  const blob = new Blob([utf8Bom + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  link.href = url;
  link.download = `${fileNamePrefix}_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
