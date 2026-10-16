import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { EMPTY_CONDITION_PICK } from '@/data/marketing';
import {
  AI_GENERATING_MS,
  buildMessageView,
  buildSendSummary,
  countPendingMessages,
  EMPTY_MESSAGE_DRAFT,
  formatSchedule,
  getDecidedTargets,
  getExtractMembers,
  getMessageTargets,
  hasTemplate,
  INITIAL_SEND_DRAFT,
  rewriteByRequest,
  type AiTask,
  type MessageDraft,
  type SendDraft,
} from '@/features/marketing/campaign/campaignModel';
import {
  MessageEditor,
  type MessageEditorHandlers,
} from '@/features/marketing/campaign/MessageEditor';
import {
  SendCompleteModal,
  type CmoRow,
} from '@/features/marketing/campaign/SendCompleteModal';
import {
  downloadTargetCsv,
  memberCsvRow,
} from '@/features/marketing/campaign/targetCsv';
import { TargetSelectPanel } from '@/features/marketing/campaign/TargetSelectPanel';
import { TargetSummary } from '@/features/marketing/campaign/TargetSummary';
import { channelLabel } from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';

type DoneAction = 'extract' | 'cmo' | null;

export function SendPage() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<SendDraft>(INITIAL_SEND_DRAFT);
  const [done, setDone] = useState<DoneAction>(null);
  const aiTimersRef = useRef(new Map<string, number>());
  // 확인 후 전달은 문구를 결정한 대상만 센다. 요약 문구가 현재 언어를 따르도록 렌더마다 만든다.
  const summary = buildSendSummary(draft);
  const messageTargets = getMessageTargets(draft);
  const decidedTargets = getDecidedTargets(messageTargets, draft.messages);
  const pendingMessageCount = countPendingMessages(
    messageTargets,
    draft.messages,
  );

  useEffect(() => {
    const timers = aiTimersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // 대상 · 문구를 바꾸면 완료 안내는 닫는다
  function updateDraft(patch: Partial<SendDraft>) {
    setDraft((previous) => ({ ...previous, ...patch }));
    setDone(null);
  }

  function updateMessage(targetKey: string, patch: Partial<MessageDraft>) {
    // 펼치기 · 생성 완료 표시 말고 문구나 일정을 바꾸면 다시 결정해야 한다
    const changesContent = Object.keys(patch).some(
      (key) => !['open', 'aiTask', 'confirmed'].includes(key),
    );
    setDraft((previous) => ({
      ...previous,
      messages: {
        ...previous.messages,
        [targetKey]: {
          ...(previous.messages[targetKey] ?? EMPTY_MESSAGE_DRAFT),
          ...patch,
          ...(changesContent && { confirmed: false }),
        },
      },
    }));
    setDone(null);
  }

  /** 문구를 만들거나 다듬을 때는 잠깐 생성 중 연출을 보여준 뒤 결과를 띄운다 */
  function runAi(targetKey: string, task: AiTask, text: string | null) {
    const timers = aiTimersRef.current;
    window.clearTimeout(timers.get(targetKey));
    updateMessage(targetKey, { text, aiTask: task, generated: true });
    timers.set(
      targetKey,
      window.setTimeout(() => {
        updateMessage(targetKey, { aiTask: null });
        timers.delete(targetKey);
      }, AI_GENERATING_MS),
    );
  }

  const messageHandlers: MessageEditorHandlers = {
    onUpdate: updateMessage,
    onRegenerate: (targetKey) => runAi(targetKey, 'generate', null),
    onRewrite: (targetKey, request, message) => {
      const { task, text } = rewriteByRequest(message, request);
      runAi(targetKey, task, text);
    },
    // 결정하면 카드를 접고, 아직 결정하지 않은 다음 문구 카드를 펼친다
    onConfirm: (targetKey) => {
      updateMessage(targetKey, { confirmed: true, open: false });
      const next = messageTargets.find(
        (target) =>
          target.key !== targetKey &&
          hasTemplate(target) &&
          !draft.messages[target.key]?.confirmed,
      );
      if (next) updateMessage(next.key, { open: true });
    },
  };

  function toggleSegment(segmentId: string) {
    updateDraft({
      segmentIds: draft.segmentIds.includes(segmentId)
        ? draft.segmentIds.filter((id) => id !== segmentId)
        : [...draft.segmentIds, segmentId],
    });
  }

  function handleExtract() {
    if (summary.empty) return;
    downloadTargetCsv(getExtractMembers(draft).map(memberCsvRow));
    setDone('extract');
  }

  // CMO 확인을 누르면 처음 상태로 되돌린다
  function handleCmoConfirm() {
    setDraft(INITIAL_SEND_DRAFT);
    setDone(null);
    // 처음 상태로 돌아갔으니 본문 스크롤(레이아웃의 main)도 맨 위로 올린다
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cmoRows: CmoRow[] = decidedTargets.map((target) => {
    const schedule = hasTemplate(target)
      ? formatSchedule(
          buildMessageView(target, draft.messages[target.key], false),
        )
      : '';
    return {
      key: target.key,
      name: target.name,
      sub:
        target.channel.key === 'tm'
          ? t('marketingSend.complete.tmSub')
          : t('marketingSend.complete.channelSub', {
              channel: channelLabel(target.channel.key),
              schedule,
            }),
      count: t('marketingSend.complete.count', {
        value: formatNumber(target.count),
      }),
    };
  });
  const isMultiSegment = draft.mode === 'ai' && decidedTargets.length > 1;

  return (
    <>
      <PageHeader
        section="marketing"
        titleSize="lg"
        eyebrow={t('marketingSend.page.eyebrow')}
        title={t('marketingSend.page.title')}
        description={t('marketingSend.page.description')}
        actions={false}
      />

      {done === 'extract' && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-3.5"
        >
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
            <Check className="size-4" strokeWidth={2.6} />
          </span>
          <span className="grow text-sm text-green-900">
            <strong>{t('marketingSend.extractDone.title')}</strong> ·{' '}
            {t('marketingSend.extractDone.detail', {
              value: formatNumber(summary.total),
            })}
          </span>
          <Link
            to="/marketing/history"
            className="inline-flex h-[34px] items-center rounded-lg border border-green-300 bg-white px-3 text-xs font-bold text-green-700 hover:bg-green-50"
          >
            {t('marketingSend.extractDone.viewHistory')}
          </Link>
        </div>
      )}

      <TargetSelectPanel
        draft={draft}
        onSelectMode={(mode) => updateDraft({ mode })}
        onToggleSegment={toggleSegment}
        onToggleCondition={(groupKey, option) => {
          const picked = draft.conditions[groupKey];
          updateDraft({
            conditions: {
              ...draft.conditions,
              [groupKey]: picked.includes(option)
                ? picked.filter((item) => item !== option)
                : [...picked, option],
            },
          });
        }}
        onResetConditions={() =>
          updateDraft({ conditions: EMPTY_CONDITION_PICK })
        }
        onSelectPool={(poolKey) => updateDraft({ poolKey })}
        onSelectSize={(size) => updateDraft({ size })}
        onSelectControl={(control) => updateDraft({ control })}
        onSelectChannel={(channel) => {
          // 채널이 바뀌면 그 대상의 문구를 새 채널 문구로 다시 시작한다
          const messages = { ...draft.messages };
          delete messages[draft.mode];
          updateDraft({ channel, messages });
        }}
      />

      {messageTargets.length > 0 && (
        <MessageEditor
          targets={messageTargets}
          messages={draft.messages}
          {...messageHandlers}
        />
      )}

      <TargetSummary
        step={messageTargets.length > 0 ? 3 : 2}
        summary={summary}
        pendingMessageCount={pendingMessageCount}
        onExtract={handleExtract}
        onSendToCmo={() => !summary.empty && setDone('cmo')}
      />

      {done === 'cmo' && (
        <SendCompleteModal
          subtitle={t('marketingSend.complete.subtitle', {
            targets: t('marketingSend.complete.targetCount', {
              count: draft.mode === 'ai' ? decidedTargets.length : 1,
            }),
            total: formatNumber(summary.total),
            dedupe: isMultiSegment ? t('marketingSend.complete.dedupe') : '',
          })}
          rows={cmoRows}
          onConfirm={handleCmoConfirm}
        />
      )}
    </>
  );
}
