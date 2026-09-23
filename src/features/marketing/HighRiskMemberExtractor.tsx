import { useState } from 'react';
import { Download, Shuffle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';
import { Select } from '@/components/molecules/Select';
import { RiskIndicator } from '@/components/domain/RiskIndicator';
import { customers } from '@/data/customers';
import { maskName } from '@/utils/format';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { Customer, RiskLevel } from '@/types/churn';

type RiskGroupFilter = RiskLevel | 'all';

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

const DEFAULT_RISK_GROUP_FILTER: RiskGroupFilter = 'high';
const DEFAULT_SAMPLE_COUNT = 10;

function shuffle<T>(items: T[]): T[] {
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

function getRiskGroupLabel(riskGroupFilter: RiskGroupFilter) {
  return riskGroupFilter === 'all'
    ? '전체'
    : RISK_LEVEL_META[riskGroupFilter].label;
}

function getPool(riskGroupFilter: RiskGroupFilter) {
  return customers.filter(
    (customer) =>
      riskGroupFilter === 'all' || customer.riskLevel === riskGroupFilter,
  );
}

// CSV는 마케팅팀이 실제 연락에 사용하도록 실명/연락처를 그대로 담는다.
// (화면 표시는 다른 화면과 동일하게 마스킹된 이름을 보여준다.)
function downloadCsv(rows: Customer[]) {
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
  link.download = `고위험회원추출_${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function HighRiskMemberExtractor() {
  const [appliedRiskGroupFilter, setAppliedRiskGroupFilter] =
    useState<RiskGroupFilter>(DEFAULT_RISK_GROUP_FILTER);
  const [appliedSampleCount, setAppliedSampleCount] =
    useState(DEFAULT_SAMPLE_COUNT);
  const [extractedCustomers, setExtractedCustomers] = useState<Customer[]>([]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [draftRiskGroupFilter, setDraftRiskGroupFilter] =
    useState<RiskGroupFilter>(appliedRiskGroupFilter);
  const [draftSampleCountInput, setDraftSampleCountInput] = useState(
    String(appliedSampleCount),
  );

  const pool = getPool(appliedRiskGroupFilter);
  const draftPool = getPool(draftRiskGroupFilter);
  const draftSampleCount = Number(draftSampleCountInput);
  const isDraftCountValid =
    Number.isInteger(draftSampleCount) && draftSampleCount > 0;

  function openSettingsModal() {
    setDraftRiskGroupFilter(appliedRiskGroupFilter);
    setDraftSampleCountInput(String(appliedSampleCount));
    setIsSettingsModalOpen(true);
  }

  function handleConfirmSettings() {
    if (!isDraftCountValid) {
      return;
    }
    setAppliedRiskGroupFilter(draftRiskGroupFilter);
    setAppliedSampleCount(draftSampleCount);
    setExtractedCustomers(shuffle(draftPool).slice(0, draftSampleCount));
    setIsSettingsModalOpen(false);
  }

  function handleReExtract() {
    if (pool.length === 0) {
      return;
    }
    setExtractedCustomers(shuffle(pool).slice(0, appliedSampleCount));
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-600">
          대상 그룹{' '}
          <span className="font-medium text-gray-900">
            {getRiskGroupLabel(appliedRiskGroupFilter)}
          </span>
          {' · '}
          추출 인원수{' '}
          <span className="font-medium text-gray-900">
            {appliedSampleCount}명
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={openSettingsModal}>
          <SlidersHorizontal className="h-4 w-4" />
          추출 조건 설정
        </Button>
        <Button
          size="sm"
          onClick={handleReExtract}
          disabled={pool.length === 0}
        >
          <Shuffle className="h-4 w-4" />
          다시 추출
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCsv(extractedCustomers)}
          disabled={extractedCustomers.length === 0}
        >
          <Download className="h-4 w-4" />
          CSV 다운로드
        </Button>
      </div>

      <p className="mb-2 text-xs text-gray-400">
        대상군 {pool.length.toLocaleString('ko-KR')}명 중{' '}
        {extractedCustomers.length}명 추출됨
      </p>

      {extractedCustomers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="px-3 pb-2 font-medium">회원번호</th>
                <th className="px-3 pb-2 font-medium">이름</th>
                <th className="px-3 pb-2 font-medium">카드상품</th>
                <th className="px-3 pb-2 font-medium">위험도</th>
                <th className="px-3 pb-2 text-right font-medium">
                  이탈예측점수
                </th>
                <th className="px-3 pb-2 font-medium">주요 이탈 사유</th>
              </tr>
            </thead>
            <tbody>
              {extractedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-3 py-2.5 text-gray-500">{customer.id}</td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {maskName(customer.name)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {customer.productName}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <RiskIndicator riskLevel={customer.riskLevel} />
                      {RISK_LEVEL_META[customer.riskLevel].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900">
                    {customer.predictionScore}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">
                    {customer.churnReasons[0]?.label ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">
          "추출 조건 설정"에서 조건을 확인하고 추출해주세요.
        </p>
      )}

      {isSettingsModalOpen && (
        <Modal onClose={() => setIsSettingsModalOpen(false)}>
          <h3 className="text-base font-semibold text-gray-900">
            추출 조건 설정
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              대상 그룹
              <Select
                value={draftRiskGroupFilter}
                onChange={(event) =>
                  setDraftRiskGroupFilter(event.target.value as RiskGroupFilter)
                }
              >
                <option value="all">전체</option>
                {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => (
                  <option key={riskLevel} value={riskLevel}>
                    {RISK_LEVEL_META[riskLevel].label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              추출 인원수
              <Input
                type="number"
                min={1}
                value={draftSampleCountInput}
                onChange={(event) =>
                  setDraftSampleCountInput(event.target.value)
                }
              />
            </label>
            {!isDraftCountValid && (
              <p className="text-xs text-red-500">
                1 이상의 정수를 입력해주세요.
              </p>
            )}
            <p className="text-xs text-gray-400">
              대상군 {draftPool.length.toLocaleString('ko-KR')}명 중{' '}
              {isDraftCountValid
                ? Math.min(draftSampleCount, draftPool.length)
                : 0}
              명이 추출됩니다.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSettings}
              disabled={!isDraftCountValid || draftPool.length === 0}
            >
              확인
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
