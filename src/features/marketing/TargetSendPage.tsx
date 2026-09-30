import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/molecules/PageHeading';
import { customers } from '@/data/customers';
import {
  AI_SEGMENT_PRESETS,
  buildMessageThemes,
  DEFAULT_SEGMENT_PICK,
  RISK_SEGMENT_VALUE,
  type MessageThemeKey,
  type RecentCampaign,
  type SegmentGroupKey,
  type SegmentPick,
} from '@/data/marketing';
import { AiMessageStep } from '@/features/marketing/campaign/AiMessageStep';
import {
  AI_GENERATING_MS,
  buildCampaignView,
  getExtractPool,
  type CampaignDraft,
  type CampaignStep,
} from '@/features/marketing/campaign/campaignModel';
import {
  CampaignStartView,
  type StartOptionKey,
} from '@/features/marketing/campaign/CampaignStartView';
import { CampaignStepActions } from '@/features/marketing/campaign/CampaignStepActions';
import { CampaignStepper } from '@/features/marketing/campaign/CampaignStepper';
import {
  CampaignSummaryPanel,
  SegmentInsight,
} from '@/features/marketing/campaign/CampaignSummaryPanel';
import { ChannelStep } from '@/features/marketing/campaign/ChannelStep';
import { ReviewStep } from '@/features/marketing/campaign/ReviewStep';
import { SendCompleteModal } from '@/features/marketing/campaign/SendCompleteModal';
import { TargetSegmentStep } from '@/features/marketing/campaign/TargetSegmentStep';
import type { CampaignLinkState } from '@/features/marketing/campaignLinkState';
import { downloadCustomerCsv, shuffle } from '@/features/marketing/customerCsv';
import { RISK_LEVEL_ORDER } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const INITIAL_DRAFT: CampaignDraft = {
  step: 0,
  targetMode: 'filter',
  segmentPick: DEFAULT_SEGMENT_PICK,
  extractRiskLevels: ['high'],
  extractSize: 1000,
  extractedCount: null,
  linkedTarget: null,
  theme: null,
  variantIndex: 0,
  editedMessage: null,
  channel: null,
  timing: 'now',
  isAiLoading: false,
  isSent: false,
};

/** 대상 조건이 바뀌면 이후 단계에서 만든 결과는 다시 고르게 한다. */
const RESET_AFTER_TARGET_CHANGE: Partial<CampaignDraft> = {
  linkedTarget: null,
  theme: null,
  channel: null,
  variantIndex: 0,
  editedMessage: null,
  isSent: false,
};

const NEXT_LABEL: Partial<Record<CampaignStep, string>> = {
  1: '다음: 문구 생성 →',
  2: '다음: 발송 채널 →',
  3: '다음: 확인 및 발송 →',
};

function getRiskLevelsFromPick(pick: SegmentPick): RiskLevel[] {
  const values = pick.risk ?? [];
  return values.length
    ? RISK_LEVEL_ORDER.filter((riskLevel) =>
        values.includes(RISK_SEGMENT_VALUE[riskLevel]),
      )
    : RISK_LEVEL_ORDER;
}

const THEME_KEYS = buildMessageThemes('', '').map((theme) => theme.key);

function isThemeKey(value: string | undefined): value is MessageThemeKey {
  return THEME_KEYS.some((key) => key === value);
}

/**
 * 회원 상세·위험군 우선순위에서 대상을 넘겨받으면 대상 선택을 건너뛰고
 * STEP 2(AI 문구 생성)부터 시작한다.
 */
function createInitialDraft(
  linkState: CampaignLinkState | null,
): CampaignDraft {
  if (!linkState?.customerIds.length) {
    return INITIAL_DRAFT;
  }
  return {
    ...INITIAL_DRAFT,
    step: 2,
    segmentPick: {},
    linkedTarget: {
      customerIds: linkState.customerIds,
      label: linkState.sourceLabel,
      category: linkState.category,
    },
    theme: isThemeKey(linkState.theme) ? linkState.theme : null,
    isAiLoading: true,
  };
}

export function TargetSendPage() {
  const location = useLocation();
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    createInitialDraft(location.state as CampaignLinkState | null),
  );
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const aiTimerRef = useRef<number | null>(null);
  const view = useMemo(() => buildCampaignView(draft), [draft]);

  // 넘겨받은 대상으로 시작했다면 첫 문구 생성 연출을 마무리한다.
  useEffect(() => {
    aiTimerRef.current = window.setTimeout(() => {
      setDraft((previous) => ({ ...previous, isAiLoading: false }));
      aiTimerRef.current = null;
    }, AI_GENERATING_MS);
    return () => {
      if (aiTimerRef.current !== null) {
        window.clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  function updateDraft(patch: Partial<CampaignDraft>) {
    setDraft((previous) => ({ ...previous, ...patch }));
  }

  /** 문구를 새로 만드는 동작은 잠깐 생성 중 상태를 보여준 뒤 결과를 띄운다. */
  function runAi(patch: Partial<CampaignDraft> = {}) {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current);
    }
    updateDraft({ ...patch, isAiLoading: true, isSent: false });
    aiTimerRef.current = window.setTimeout(() => {
      updateDraft({ isAiLoading: false });
      aiTimerRef.current = null;
    }, AI_GENERATING_MS);
  }

  function goToStep(step: CampaignStep) {
    if (step === 2 && draft.step !== 2) {
      runAi({ step });
      return;
    }
    updateDraft({ step, isSent: false });
  }

  function handleStart(option: StartOptionKey) {
    const base = { ...INITIAL_DRAFT, ...RESET_AFTER_TARGET_CHANGE };
    if (option === 'ai') {
      const [topPreset] = AI_SEGMENT_PRESETS;
      setDraft({
        ...base,
        targetMode: 'filter',
        segmentPick: topPreset.pick,
        theme: topPreset.theme,
        channel: topPreset.channel,
      });
      runAi({ step: 2 });
      return;
    }
    setDraft({
      ...base,
      step: 1,
      targetMode: option === 'random' ? 'random' : 'filter',
    });
  }

  function handleNewCampaign() {
    setIsSendModalOpen(false);
    setDraft(INITIAL_DRAFT);
  }

  function handleReuse(campaign: RecentCampaign) {
    setDraft({
      ...INITIAL_DRAFT,
      step: 4,
      segmentPick: campaign.pick,
      theme: campaign.theme,
      channel: campaign.channel,
    });
  }

  function handleToggleSegment(groupKey: SegmentGroupKey, value: string) {
    const current = draft.segmentPick[groupKey] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    updateDraft({
      segmentPick: { ...draft.segmentPick, [groupKey]: next },
      ...RESET_AFTER_TARGET_CHANGE,
    });
  }

  function handleToggleExtractRisk(riskLevel: RiskLevel) {
    const current = draft.extractRiskLevels;
    updateDraft({
      extractRiskLevels: current.includes(riskLevel)
        ? current.filter((item) => item !== riskLevel)
        : [...current, riskLevel],
      extractedCount: null,
      isSent: false,
    });
  }

  function handleApplyRandom() {
    const pool = getExtractPool(draft.extractRiskLevels);
    updateDraft({
      extractedCount: Math.min(Math.max(draft.extractSize, 0), pool),
      ...RESET_AFTER_TARGET_CHANGE,
    });
  }

  /** 목데이터 회원 중 현재 대상 위험도에 해당하는 회원을 CSV로 내려받는다. */
  function handleDownloadCsv() {
    if (draft.linkedTarget) {
      const linkedIds = draft.linkedTarget.customerIds;
      downloadCustomerCsv(
        customers.filter((customer) => linkedIds.includes(customer.id)),
      );
      return;
    }
    const riskLevels =
      draft.targetMode === 'random'
        ? draft.extractRiskLevels
        : getRiskLevelsFromPick(draft.segmentPick);
    const pool = customers.filter((customer) =>
      riskLevels.includes(customer.riskLevel),
    );
    const rows =
      draft.targetMode === 'random'
        ? shuffle(pool).slice(0, draft.extractSize)
        : pool;
    downloadCustomerCsv(rows);
  }

  const isNextDisabled =
    draft.step === 1 &&
    draft.targetMode === 'random' &&
    draft.extractedCount === null;
  const targetCountLabel = view.targetCount.toLocaleString('ko-KR');

  function renderStepActions(layout: 'panel' | 'bar') {
    return (
      <CampaignStepActions
        layout={layout}
        isLastStep={draft.step === 4}
        nextLabel={NEXT_LABEL[draft.step] ?? ''}
        isNextDisabled={isNextDisabled}
        sendLabel={`${targetCountLabel}명에게 ${draft.timing === 'now' ? '발송하기' : '예약하기'}`}
        onPrev={() => goToStep((draft.step - 1) as CampaignStep)}
        onNext={() => goToStep((draft.step + 1) as CampaignStep)}
        onDownload={handleDownloadCsv}
        onSend={() => {
          updateDraft({ isSent: true });
          setIsSendModalOpen(true);
        }}
      />
    );
  }

  return (
    <Screen>
      <PageHeading />

      {draft.step === 0 ? (
        <CampaignStartView onStart={handleStart} onReuse={handleReuse} />
      ) : (
        <div className="flex flex-col gap-10">
          <CampaignStepper currentStep={draft.step} onStepClick={goToStep} />

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
            <div className="flex flex-col gap-4">
              {draft.step === 1 && (
                <TargetSegmentStep
                  draft={draft}
                  onClearLinkedTarget={() =>
                    updateDraft({ ...RESET_AFTER_TARGET_CHANGE })
                  }
                  onToggleSegment={handleToggleSegment}
                  onApplyPreset={(preset) =>
                    updateDraft({
                      ...RESET_AFTER_TARGET_CHANGE,
                      segmentPick: preset.pick,
                      theme: preset.theme,
                      channel: preset.channel,
                    })
                  }
                  onToggleExtractRisk={handleToggleExtractRisk}
                  onExtractSizeChange={(size) =>
                    updateDraft({ extractSize: size, extractedCount: null })
                  }
                  onApplyRandom={handleApplyRandom}
                  onDownloadCsv={handleDownloadCsv}
                />
              )}
              {draft.step === 2 && (
                <AiMessageStep
                  draft={draft}
                  view={view}
                  onRegenerate={() =>
                    runAi({
                      variantIndex:
                        (view.variantIndex + 1) % view.theme.variants.length,
                      editedMessage: null,
                    })
                  }
                  onSelectTheme={(theme) =>
                    runAi({ theme, variantIndex: 0, editedMessage: null })
                  }
                  onSelectVariant={(variantIndex) =>
                    updateDraft({
                      variantIndex,
                      editedMessage: null,
                      isSent: false,
                    })
                  }
                  onMessageChange={(message) =>
                    updateDraft({ editedMessage: message, isSent: false })
                  }
                />
              )}
              {draft.step === 3 && (
                <ChannelStep
                  draft={draft}
                  view={view}
                  onSelectChannel={(channel) =>
                    updateDraft({ channel, isSent: false })
                  }
                  onSelectTiming={(timing) => updateDraft({ timing })}
                />
              )}
              {draft.step === 4 && (
                <ReviewStep draft={draft} view={view} onEditStep={goToStep} />
              )}

              <div className="sticky bottom-0 -mx-1 border-t border-border bg-surface/95 px-1 py-3 backdrop-blur lg:hidden">
                {renderStepActions('bar')}
              </div>
            </div>

            <CampaignSummaryPanel
              view={view}
              insight={
                draft.step === 1 && draft.targetMode !== 'random' ? (
                  <SegmentInsight view={view} />
                ) : null
              }
              actions={
                <div className="hidden lg:block">
                  {renderStepActions('panel')}
                </div>
              }
            />
          </div>
        </div>
      )}

      {isSendModalOpen && (
        <SendCompleteModal
          view={view}
          timing={draft.timing}
          onClose={() => setIsSendModalOpen(false)}
          onNewCampaign={handleNewCampaign}
        />
      )}
    </Screen>
  );
}
