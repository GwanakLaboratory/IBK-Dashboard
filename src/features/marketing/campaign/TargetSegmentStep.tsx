import { Check, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/molecules/SectionTitle';
import { AI_SEGMENT_PRESETS, type AiSegmentPreset } from '@/data/marketing';
import {
  getExtractPool,
  getPickedOptions,
  getSegmentCount,
  isSamePick,
  SEGMENT_GROUPS,
  type CampaignDraft,
} from '@/features/marketing/campaign/campaignModel';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import { RISK_SEGMENT_VALUE } from '@/data/marketing';
import type { SegmentGroupKey } from '@/data/marketing';
import type { RiskLevel } from '@/types/churn';

const RISK_LEVEL_BY_SEGMENT_VALUE = Object.fromEntries(
  (Object.entries(RISK_SEGMENT_VALUE) as [RiskLevel, string][]).map(
    ([riskLevel, value]) => [value, riskLevel],
  ),
) as Record<string, RiskLevel>;

// 위험도 옵션은 선택 시 해당 등급 색으로, 나머지 옵션은 primary 로 채운다.
const SELECTED_RISK_OPTION_CLASS_NAME: Record<RiskLevel, string> = {
  high: 'border-red-500 bg-red-50 font-bold text-red-700',
  medium: 'border-yellow-400 bg-yellow-50 font-bold text-yellow-700',
  low: 'border-emerald-500 bg-emerald-50 font-bold text-emerald-700',
};

function getOptionClassName(isSelected: boolean, riskLevel?: RiskLevel) {
  if (!isSelected) {
    return 'border-gray-300 bg-white font-medium text-gray-700 hover:border-gray-400';
  }
  return riskLevel
    ? SELECTED_RISK_OPTION_CLASS_NAME[riskLevel]
    : 'border-primary bg-primary font-semibold text-white';
}

type TargetSegmentStepProps = {
  draft: CampaignDraft;
  onClearLinkedTarget: () => void;
  onToggleSegment: (groupKey: SegmentGroupKey, value: string) => void;
  onApplyPreset: (preset: AiSegmentPreset) => void;
  onToggleExtractRisk: (riskLevel: RiskLevel) => void;
  onExtractSizeChange: (size: number) => void;
  onApplyRandom: () => void;
  onDownloadCsv: () => void;
};

export function TargetSegmentStep({
  draft,
  onClearLinkedTarget,
  onToggleSegment,
  onApplyPreset,
  onToggleExtractRisk,
  onExtractSizeChange,
  onApplyRandom,
  onDownloadCsv,
}: TargetSegmentStepProps) {
  const isRandom = draft.targetMode === 'random';

  return (
    <div className="flex flex-col gap-4">
      {draft.linkedTarget && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3.5 py-3 text-[13px] font-semibold text-blue-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1">
            {draft.linkedTarget.label} ·{' '}
            {draft.linkedTarget.customerIds.length.toLocaleString('ko-KR')}명을
            대상으로 불러왔어요
          </span>
          <button
            type="button"
            onClick={onClearLinkedTarget}
            className="h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            해제하고 조건으로 고르기
          </button>
        </div>
      )}

      {isRandom ? (
        <RandomExtractPanel
          draft={draft}
          onToggleExtractRisk={onToggleExtractRisk}
          onExtractSizeChange={onExtractSizeChange}
          onApplyRandom={onApplyRandom}
          onDownloadCsv={onDownloadCsv}
        />
      ) : (
        <div className="grid gap-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-gray-900">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-violet-600" />
              <span className="text-[15px] font-bold">AI 추천 세그먼트</span>
              <span className="text-xs text-violet-600/70">
                이탈 위험과 반응 가능성을 함께 고려했어요
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {AI_SEGMENT_PRESETS.map((preset) => {
                const isSelected =
                  !draft.linkedTarget &&
                  isSamePick(preset.pick, draft.segmentPick);
                const presetCount = getSegmentCount(preset.pick);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onApplyPreset(preset)}
                    className={`flex flex-col gap-2 rounded-xl bg-white px-4 py-3.5 text-left ${
                      isSelected
                        ? 'border border-violet-600 shadow-[0_0_0_1px_#7C3AED,0_4px_12px_rgba(124,58,237,0.12)]'
                        : 'border border-violet-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{preset.label}</span>
                      <span
                        className={`inline-flex h-[22px] shrink-0 items-center rounded-md px-2 text-[11px] font-bold ${
                          isSelected
                            ? 'bg-violet-600 text-white'
                            : 'bg-violet-50 text-violet-600'
                        }`}
                      >
                        {preset.recommendation}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {preset.condition}
                    </span>
                    <span className="text-xs leading-normal text-gray-700">
                      &ldquo;{preset.basis}&rdquo;
                    </span>
                    <span className="text-[11px] text-violet-600">
                      대상 약 {presetCount.toLocaleString('ko-KR')}명 · 평균
                      이탈점수 {preset.averageChurnScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <SectionTitle
              title="조건 직접 선택"
              description="조건을 누르는 대로 오른쪽 대상 인원이 좁혀집니다"
            />
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-xl border border-border bg-white px-6 py-[22px] shadow-sm md:grid-cols-2">
              {SEGMENT_GROUPS.map((group) => {
                const pickedCount = getPickedOptions(
                  draft.segmentPick,
                  group,
                ).length;
                const isRiskGroup = group.key === 'risk';
                return (
                  <div key={group.key} className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-bold text-gray-900">
                        {group.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {pickedCount
                          ? `${pickedCount}개 선택`
                          : '전체 (미선택)'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((option) => {
                        const isSelected = (
                          draft.segmentPick[group.key] ?? []
                        ).includes(option.value);
                        const riskLevel = isRiskGroup
                          ? RISK_LEVEL_BY_SEGMENT_VALUE[option.value]
                          : undefined;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              onToggleSegment(group.key, option.value)
                            }
                            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] ${getOptionClassName(
                              isSelected,
                              riskLevel,
                            )}`}
                          >
                            {riskLevel ? (
                              <span
                                className={`h-2 w-2 rounded-full ${RISK_LEVEL_META[riskLevel].dotColorClassName}`}
                              />
                            ) : (
                              isSelected && (
                                <Check className="h-3 w-3" strokeWidth={3} />
                              )
                            )}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type RandomExtractPanelProps = Pick<
  TargetSegmentStepProps,
  | 'draft'
  | 'onToggleExtractRisk'
  | 'onExtractSizeChange'
  | 'onApplyRandom'
  | 'onDownloadCsv'
>;

function RandomExtractPanel({
  draft,
  onToggleExtractRisk,
  onExtractSizeChange,
  onApplyRandom,
  onDownloadCsv,
}: RandomExtractPanelProps) {
  const pool = getExtractPool(draft.extractRiskLevels);
  const selectedLabel =
    RISK_LEVEL_DISPLAY_ORDER.filter((riskLevel) =>
      draft.extractRiskLevels.includes(riskLevel),
    )
      .map((riskLevel) => RISK_LEVEL_META[riskLevel].label)
      .join('·') || '그룹 미선택';

  return (
    <section className="flex flex-col gap-3">
      <SectionTitle
        title="무작위 추출"
        description="선택한 위험 그룹 안에서 인원수만큼 무작위로 뽑습니다 (실험군/대조군 구성에 활용)"
      />
      <div className="flex flex-col gap-[18px] rounded-xl border border-border bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-gray-900">
            대상 그룹{' '}
            <span className="font-medium text-gray-500">(복수 선택)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {RISK_LEVEL_DISPLAY_ORDER.map((riskLevel) => {
              const isSelected = draft.extractRiskLevels.includes(riskLevel);
              return (
                <button
                  key={riskLevel}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggleExtractRisk(riskLevel)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] ${
                    isSelected
                      ? 'border border-primary bg-blue-50 font-bold text-primary'
                      : 'border border-gray-300 bg-white font-medium text-gray-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${RISK_LEVEL_META[riskLevel].dotColorClassName}`}
                  />
                  {RISK_LEVEL_META[riskLevel].label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-gray-600">
            선택 그룹 모수 {pool.toLocaleString('ko-KR')}명
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-[220px] flex-col gap-2">
            <label
              htmlFor="extract-size"
              className="text-[13px] font-bold text-gray-900"
            >
              추출 인원수
            </label>
            <input
              id="extract-size"
              type="number"
              min={1}
              value={draft.extractSize}
              onChange={(event) =>
                onExtractSizeChange(Number(event.target.value))
              }
              className="h-[42px] rounded-lg border border-gray-300 px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onApplyRandom}
            disabled={pool === 0}
            className="h-[42px] rounded-lg bg-primary px-[18px] text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
          >
            추출하기
          </button>
          <button
            type="button"
            onClick={onDownloadCsv}
            className="flex h-[42px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 text-green-700" />
            CSV 다운로드
          </button>
        </div>

        {draft.extractedCount !== null && (
          <div
            role="status"
            className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3.5 py-3 text-[13px] font-semibold text-blue-900"
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {selectedLabel} · {draft.extractedCount.toLocaleString('ko-KR')}명
            추출 완료 · 다음 단계에서 이 대상으로 문구를 생성합니다
          </div>
        )}
      </div>
    </section>
  );
}
