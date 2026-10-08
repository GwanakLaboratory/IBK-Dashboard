import type { TargetMember } from '@/data/target';
import { RISK_LEVEL_META, getRiskLevelFromScore } from '@/utils/risk';

const CSV_HEADER = [
  '회원번호',
  '이름',
  '카드상품',
  '성별',
  '연령',
  '위험도',
  '이탈 예측 점수',
  '주요 이탈 사유',
];

export function memberCsvRow(member: TargetMember): string[] {
  return [
    member.id,
    member.name,
    member.product,
    member.gender,
    member.ageGroup,
    RISK_LEVEL_META[getRiskLevelFromScore(member.score)].label,
    String(member.score),
    member.reason,
  ];
}

function toCsvLine(values: string[]) {
  return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(',');
}

/** 회원 CSV 내려받기 (엑셀에서 한글이 깨지지 않게 BOM 포함) */
export function downloadTargetCsv(rows: string[][], fileName = '발송대상') {
  const csv = [CSV_HEADER, ...rows].map(toCsvLine).join('\r\n');
  const url = URL.createObjectURL(
    new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }),
  );
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
