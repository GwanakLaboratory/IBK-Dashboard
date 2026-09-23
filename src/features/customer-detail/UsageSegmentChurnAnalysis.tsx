import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';
import { ChurnRateComparisonChart } from '@/features/customer-detail/ChurnRateComparisonChart';
import { buildUsageSegmentChurnStats } from '@/features/customer-detail/usageSegmentChurn';
import { usageChurnHistogram } from '@/data/customers';

const DEFAULT_THRESHOLD_1_MANWON = 30;
const DEFAULT_THRESHOLD_2_MANWON = 100;

export function UsageSegmentChurnAnalysis() {
  const [appliedThreshold1Manwon, setAppliedThreshold1Manwon] = useState(
    DEFAULT_THRESHOLD_1_MANWON,
  );
  const [appliedThreshold2Manwon, setAppliedThreshold2Manwon] = useState(
    DEFAULT_THRESHOLD_2_MANWON,
  );

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [draftThreshold1Input, setDraftThreshold1Input] = useState(
    String(appliedThreshold1Manwon),
  );
  const [draftThreshold2Input, setDraftThreshold2Input] = useState(
    String(appliedThreshold2Manwon),
  );

  const items = useMemo(
    () =>
      buildUsageSegmentChurnStats(
        usageChurnHistogram,
        appliedThreshold1Manwon * 10000,
        appliedThreshold2Manwon * 10000,
      ),
    [appliedThreshold1Manwon, appliedThreshold2Manwon],
  );

  const draftThreshold1 = Number(draftThreshold1Input);
  const draftThreshold2 = Number(draftThreshold2Input);
  const isDraftValid =
    Number.isFinite(draftThreshold1) &&
    Number.isFinite(draftThreshold2) &&
    draftThreshold1 > 0 &&
    draftThreshold2 > draftThreshold1;

  function openSettingsModal() {
    setDraftThreshold1Input(String(appliedThreshold1Manwon));
    setDraftThreshold2Input(String(appliedThreshold2Manwon));
    setIsSettingsModalOpen(true);
  }

  function handleConfirmSettings() {
    if (!isDraftValid) {
      return;
    }
    setAppliedThreshold1Manwon(draftThreshold1);
    setAppliedThreshold2Manwon(draftThreshold2);
    setIsSettingsModalOpen(false);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-600">
          현재 구간{' '}
          <span className="text-gray-900">
            ~{appliedThreshold1Manwon}만원 / {appliedThreshold1Manwon}~
            {appliedThreshold2Manwon}만원 / {appliedThreshold2Manwon}만원~
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={openSettingsModal}>
          <SlidersHorizontal className="h-4 w-4" />
          구간 설정
        </Button>
      </div>

      <ChurnRateComparisonChart items={items} />

      {isSettingsModalOpen && (
        <Modal onClose={() => setIsSettingsModalOpen(false)}>
          <h3 className="text-base font-semibold text-gray-900">구간 설정</h3>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              소액 · 중간 경계 (만원)
              <Input
                type="number"
                min={1}
                value={draftThreshold1Input}
                onChange={(event) =>
                  setDraftThreshold1Input(event.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              중간 · 고액 경계 (만원)
              <Input
                type="number"
                min={1}
                value={draftThreshold2Input}
                onChange={(event) =>
                  setDraftThreshold2Input(event.target.value)
                }
              />
            </label>
            {!isDraftValid && (
              <p className="text-xs text-red-500">
                경계1 &lt; 경계2, 모두 0보다 큰 값을 입력해주세요.
              </p>
            )}
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
              disabled={!isDraftValid}
            >
              확인
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
