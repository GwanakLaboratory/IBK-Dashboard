import { Check, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { Tabs } from '@/components/molecules/Tabs';
import {
  AI_SEGMENT_PRESETS,
  RISK_SEGMENT_VALUE,
  type AiSegmentPreset,
  type SegmentGroupKey,
} from '@/data/marketing';
import {
  getExtractPool,
  getPickedOptions,
  getSegmentCount,
  isSamePick,
  SEGMENT_GROUPS,
  type CampaignDraft,
  type CampaignView,
  type TargetMode,
} from '@/features/marketing/campaign/campaignModel';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const RISK_LEVEL_BY_SEGMENT_VALUE = Object.fromEntries(
  (Object.entries(RISK_SEGMENT_VALUE) as [RiskLevel, string][]).map(
    ([riskLevel, value]) => [value, riskLevel],
  ),
) as Record<string, RiskLevel>;

const TARGET_MODE_TABS: { key: TargetMode; label: string }[] = [
  { key: 'ai', label: 'AI 추천 세그먼트' },
  { key: 'filter', label: '조건 직접 선택' },
  { key: 'random', label: '무작위 추출' },
];

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
  view: CampaignView;
  onClearLinkedTarget: () => void;
  onSelectTargetMode: (mode: TargetMode) => void;
  onToggleSegment: (groupKey: SegmentGroupKey, value: string) => void;
  onApplyPreset: (preset: AiSegmentPreset) => void;
  onToggleExtractRisk: (riskLevel: RiskLevel) => void;
  onExtractSizeChange: (size: number) => void;
  onApplyRandom: () => void;
  onDownloadCsv: () => void;
};

export function TargetSegmentStep({
  draft,
  view,
  onClearLinkedTarget,
  onSelectTargetMode,
  onToggleSegment,
  onApplyPreset,
  onToggleExtractRisk,
  onExtractSizeChange,
  onApplyRandom,
  onDownloadCsv,
}: TargetSegmentStepProps) {
  const showInsight = draft.targetMode !== 'random';

  return (
    <div className="flex flex-col gap-4">
      {draft.linkedTarget && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3.5 py-3 text-xs font-semibold text-blue-900"
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

      <Tabs
        variant="segmented"
        tabs={TARGET_MODE_TABS}
        value={draft.targetMode}
        onChange={onSelectTargetMode}
      />

      {draft.targetMode === 'ai' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#ECEEF3] bg-[#FAFAFC] p-5 text-gray-900">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-[18px] w-[18px] text-violet-600" />
            <span className="text-sm font-bold">AI 추천 세그먼트</span>
            <span className="text-xs text-gray-500">
              이탈 위험 · 반응 가능성 · 연간 이용금액을 함께 분석했어요
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                  className={`flex flex-col items-stretch gap-3 rounded-2xl bg-white px-5 py-[18px] text-left ${
                    isSelected
                      ? 'border border-violet-600'
                      : 'border border-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                        isSelected
                          ? 'bg-violet-600'
                          : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-bold text-gray-900">
                      {preset.label}
                    </span>
                    <span className="shrink-0 self-start rounded-md bg-violet-100 px-2 text-[12px] font-bold leading-[22px] text-violet-600">
                      {preset.recommendation}
                    </span>
                  </div>
                  <span className="pl-7 text-xs text-gray-500">
                    {preset.condition}
                  </span>
                  <div className="flex gap-2 rounded-lg bg-[#F7F8FA] px-3 py-2.5">
                    <span className="text-xs leading-relaxed text-gray-600">
                      {preset.basis}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 border-t border-gray-100 pt-2.5 text-xs text-gray-500">
                    <span>
                      대상{' '}
                      <strong className="font-bold text-gray-900">
                        {presetCount.toLocaleString('ko-KR')}명
                      </strong>
                    </span>
                    <span className="h-2.5 w-px bg-border" />
                    <span>
                      평균 이탈점수{' '}
                      <strong className="font-bold text-gray-900">
                        {preset.averageChurnScore}
                      </strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {draft.targetMode === 'filter' && (
        <div className="grid gap-x-8 gap-y-5 rounded-xl border border-border bg-white px-6 py-[22px] shadow-sm md:grid-cols-2">
          {SEGMENT_GROUPS.map((group) => {
            const pickedCount = getPickedOptions(
              draft.segmentPick,
              group,
            ).length;
            const isRiskGroup = group.key === 'risk';
            return (
              <div key={group.key} className="flex flex-col gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold text-gray-900">
                    {group.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {pickedCount ? `${pickedCount}개 선택` : '전체 (미선택)'}
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
                        onClick={() => onToggleSegment(group.key, option.value)}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs ${getOptionClassName(
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
      )}

      {showInsight && <SegmentInsight view={view} />}

      {draft.targetMode === 'random' && (
        <RandomExtractPanel
          draft={draft}
          onToggleExtractRisk={onToggleExtractRisk}
          onExtractSizeChange={onExtractSizeChange}
          onApplyRandom={onApplyRandom}
          onDownloadCsv={onDownloadCsv}
        />
      )}
    </div>
  );
}

/** 대상 선택 단계에서 보여주는 AI 분석 (세그먼트 근거 · 추천 테마 × 채널). */
function SegmentInsight({ view }: { view: CampaignView }) {
  const segmentName = view.matchedPreset
    ? `'${view.matchedPreset.label}'`
    : view.personaLabel;

  return (
    <div className="flex gap-2.5 rounded-[10px] border border-[#ECEEF3] bg-[#FAFAFC] px-3.5 py-3">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-violet-600">AI 분석</span>
        <span className="text-xs leading-relaxed text-gray-900">
          {view.matchedPreset && `${view.matchedPreset.basis}. `}
          {segmentName} 세그먼트 {view.segmentCount.toLocaleString('ko-KR')}명은{' '}
          {view.pickedCategoryLabel
            ? `결제 내역상 '${view.pickedCategoryLabel}' 이용 비중이 높아요.`
            : `'${view.topReasonLabel}' 비중이 가장 높아요.`}
        </span>
        <span className="text-xs font-semibold text-gray-700">
          추천 {view.recommendedTheme.label} ×{' '}
          {view.recommendedChannel.shortLabel} · 예상 반응{' '}
          {view.recommendedRate.toFixed(1)}%
        </span>
      </div>
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
    <div className="flex flex-col gap-[18px] rounded-xl border border-border bg-white px-6 py-5 shadow-sm">
      <span className="text-xs text-gray-500">
        선택한 위험 그룹 안에서 인원수만큼 무작위로 뽑아요 · 실험군/대조군
        구성에 활용
      </span>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-gray-900">
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
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs ${
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
            className="text-xs font-bold text-gray-900"
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
          className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3.5 py-3 text-xs font-semibold text-blue-900"
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {selectedLabel} · {draft.extractedCount.toLocaleString('ko-KR')}명
          추출 완료 · 다음 단계에서 이 대상으로 문구를 생성합니다
        </div>
      )}
    </div>
  );
}
