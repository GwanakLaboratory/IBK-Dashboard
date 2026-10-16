import type { TargetMember } from '@/data/target';
import i18n from '@/i18n';
import {
  ageGroupLabel,
  cardName,
  churnReasonLabel,
  genderLabel,
  memberNameLabel,
  riskLevelLabel,
} from '@/i18n/domain';
import { getRiskLevelFromScore } from '@/utils/risk';

/* 머리글 · 값 모두 내려받는 시점의 현재 언어로 만든다 */
const CSV_COLUMNS = [
  'id',
  'name',
  'product',
  'gender',
  'ageGroup',
  'riskLevel',
  'score',
  'reason',
] as const;

const csvHeader = () =>
  CSV_COLUMNS.map((column) => i18n.t(`marketingSend.csv.header.${column}`));

export function memberCsvRow(member: TargetMember): string[] {
  return [
    member.id,
    memberNameLabel(member.name),
    cardName(member.productId),
    genderLabel(member.gender),
    ageGroupLabel(member.ageGroup),
    riskLevelLabel(getRiskLevelFromScore(member.score)),
    String(member.score),
    churnReasonLabel(member.reason),
  ];
}

function toCsvLine(values: string[]) {
  return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(',');
}

/** 회원 CSV 내려받기 (엑셀에서 한글이 깨지지 않게 BOM 포함). 파일 이름을 안 주면 '발송대상' */
export function downloadTargetCsv(rows: string[][], fileName?: string) {
  const csv = [csvHeader(), ...rows].map(toCsvLine).join('\r\n');
  const url = URL.createObjectURL(
    new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }),
  );
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName ?? i18n.t('marketingSend.csv.fileName')}_${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
