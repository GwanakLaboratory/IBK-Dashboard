import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/molecules/PageHeading';
import { customers } from '@/data/customers';
import {
  buildMessageThemes,
  DEFAULT_SEGMENT_PICK,
  RISK_SEGMENT_VALUE,
  type MessageThemeKey,
  type SegmentGroupKey,
  type SegmentPick,
} from '@/data/marketing';
import { AiMessageStep } from '@/features/marketing/campaign/AiMessageStep';
import { CampaignFormSection } from '@/features/marketing/campaign/CampaignFormSection';
import {
  AI_GENERATING_MS,
  buildCampaignView,
  fillPreviewName,
  getExtractPool,
  getSectionState,
  type CampaignDraft,
  type CampaignSectionStep,
  type CampaignStep,
  type TargetMode,
} from '@/features/marketing/campaign/campaignModel';
import { ChannelStep } from '@/features/marketing/campaign/ChannelStep';
import { ReviewStep } from '@/features/marketing/campaign/ReviewStep';
import { SendCompleteModal } from '@/features/marketing/campaign/SendCompleteModal';
import { TargetSegmentStep } from '@/features/marketing/campaign/TargetSegmentStep';
import type { CampaignLinkState } from '@/features/marketing/campaignLinkState';
import { downloadCustomerCsv, shuffle } from '@/features/marketing/customerCsv';
import { RISK_LEVEL_ORDER } from '@/utils/risk';
import type { RiskLevel } from '@/types/churn';

const INITIAL_DRAFT: CampaignDraft = {
  step: 1,
  maxStep: 1,
  targetMode: 'ai',
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

/** 텔레마케팅은 전화 상담이라 "문구"가 아니라 상담원이 참고할 스크립트로 부른다. */
function getSectionTitle(step: CampaignSectionStep, isScript: boolean) {
  if (step === 1) return '대상 선택';
  if (step === 2) return isScript ? '스크립트 생성' : '문구 생성';
  return '채널 · 시점';
}

function getSectionNextLabel(step: CampaignSectionStep, isScript: boolean) {
  if (step === 1) {
    return isScript
      ? '이 대상으로 스크립트 만들기 →'
      : '이 대상으로 문구 만들기 →';
  }
  if (step === 2) {
    return isScript ? '이 스크립트로 채널 선택 →' : '이 문구로 채널 선택 →';
  }
  return '발송 내용 확인 →';
}

const THEME_KEYS = buildMessageThemes('', '').map((theme) => theme.key);

function isThemeKey(value: string | undefined): value is MessageThemeKey {
  return THEME_KEYS.some((key) => key === value);
}

function getRiskLevelsFromPick(pick: SegmentPick): RiskLevel[] {
  const values = pick.risk ?? [];
  return values.length
    ? RISK_LEVEL_ORDER.filter((riskLevel) =>
        values.includes(RISK_SEGMENT_VALUE[riskLevel]),
      )
    : RISK_LEVEL_ORDER;
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
    maxStep: 2,
    targetMode: 'filter',
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

  /**
   * 문구 생성 단계는 처음 도달할 때만 생성 연출을 보여준다. 이미 한 번
   * 지나간 뒤 "변경"으로 되돌아올 때는 만들어둔 문구를 바로 보여준다.
   */
  function goToStep(step: CampaignStep) {
    const nextMaxStep = Math.max(draft.maxStep, step) as CampaignStep;
    if (step === 2 && draft.step !== 2 && draft.maxStep < 3) {
      runAi({ step, maxStep: nextMaxStep });
      return;
    }
    updateDraft({ step, maxStep: nextMaxStep, isSent: false });
  }

  function handleSelectTargetMode(mode: TargetMode) {
    updateDraft({
      targetMode: mode,
      ...RESET_AFTER_TARGET_CHANGE,
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

  const isStep1NextDisabled =
    draft.targetMode === 'random' && draft.extractedCount === null;
  const targetCountLabel = view.targetCount.toLocaleString('ko-KR');
  const isScript = view.channel.key === 'tm';

  const sectionSummary: Record<CampaignSectionStep, string> = {
    1: `${targetCountLabel}명 · ${
      draft.linkedTarget
        ? draft.linkedTarget.label
        : draft.targetMode === 'random'
          ? '무작위 추출'
          : (view.matchedPreset?.label ?? view.segmentLabel)
    }`,
    2: `${view.theme.label} 테마 · ${fillPreviewName(view.message).slice(0, 36)}…`,
    3: `${view.channel.label} · ${draft.timing === 'now' ? '즉시 발송' : '예약 발송'}`,
  };
  const sectionFootHint: Record<CampaignSectionStep, string> = {
    1: `선택한 대상 ${targetCountLabel}명`,
    2: `${isScript ? '스크립트' : '문구'} ${view.message.length}자 · {이름}은 회원별로 바뀌어요`,
    3: `${view.channel.label} · ${draft.timing === 'now' ? '즉시 발송' : '예약 발송'}`,
  };

  function renderSection(step: CampaignSectionStep, children: React.ReactNode) {
    const state = getSectionState(draft, step);
    return (
      <CampaignFormSection
        step={step}
        title={getSectionTitle(step, isScript)}
        state={state}
        summary={
          state === 'done'
            ? sectionSummary[step]
            : state === 'locked'
              ? '이전 단계를 마치면 열려요'
              : undefined
        }
        onReopen={() => goToStep(step)}
        footHint={sectionFootHint[step]}
        nextLabel={getSectionNextLabel(step, isScript)}
        isNextDisabled={step === 1 ? isStep1NextDisabled : false}
        onNext={() => goToStep((step + 1) as CampaignStep)}
      >
        {children}
      </CampaignFormSection>
    );
  }

  return (
    <Screen>
      <PageHeading />

      <div className="flex flex-col gap-3">
        {renderSection(
          1,
          <TargetSegmentStep
            draft={draft}
            view={view}
            onClearLinkedTarget={() =>
              updateDraft({ ...RESET_AFTER_TARGET_CHANGE })
            }
            onSelectTargetMode={handleSelectTargetMode}
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
          />,
        )}

        {renderSection(
          2,
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
          />,
        )}

        {renderSection(
          3,
          <ChannelStep
            draft={draft}
            view={view}
            onSelectChannel={(channel) =>
              updateDraft({ channel, isSent: false })
            }
            onSelectTiming={(timing) => updateDraft({ timing })}
          />,
        )}

        {draft.step === 4 && (
          <ReviewStep
            draft={draft}
            view={view}
            onEditStep={goToStep}
            onDownloadCsv={handleDownloadCsv}
            onSend={() => {
              updateDraft({ isSent: true });
              setIsSendModalOpen(true);
            }}
          />
        )}
      </div>

      {isSendModalOpen && (
        <SendCompleteModal
          view={view}
          timing={draft.timing}
          onClose={() => setIsSendModalOpen(false)}
          onNewCampaign={() => {
            setIsSendModalOpen(false);
            setDraft(INITIAL_DRAFT);
          }}
        />
      )}
    </Screen>
  );
}
