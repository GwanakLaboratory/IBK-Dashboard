import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { EMPTY_CONDITION_PICK } from '@/data/marketing';
import {
  AI_GENERATING_MS,
  buildMessageView,
  buildTargetSummary,
  EMPTY_MESSAGE_DRAFT,
  formatCount,
  formatSchedule,
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

type DoneAction = 'extract' | 'cmo' | null;

export function SendPage() {
  const [draft, setDraft] = useState<SendDraft>(INITIAL_SEND_DRAFT);
  const [done, setDone] = useState<DoneAction>(null);
  const aiTimersRef = useRef(new Map<string, number>());
  const summary = useMemo(() => buildTargetSummary(draft), [draft]);
  const messageTargets = useMemo(() => getMessageTargets(draft), [draft]);

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
    setDraft((previous) => ({
      ...previous,
      messages: {
        ...previous.messages,
        [targetKey]: {
          ...(previous.messages[targetKey] ?? EMPTY_MESSAGE_DRAFT),
          ...patch,
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

  const cmoRows: CmoRow[] = messageTargets.map((target) => {
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
          ? '텔레마케팅 · 상담원 순차 연결 · 스크립트는 CMO에서 설정'
          : `${target.channel.label} · ${schedule}`,
      count: `${formatCount(target.count)}명`,
    };
  });
  const isMultiSegment = draft.mode === 'ai' && messageTargets.length > 1;

  return (
    <>
      <PageHeader
        section="marketing"
        titleSize="lg"
        eyebrow="TARGET MARKETING"
        title="타겟 발송"
        description="선택한 고객을 추출하거나 CMO로 바로 전달할 수 있어요"
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
            <strong>대상 목록을 내려받았어요</strong> ·{' '}
            {formatCount(summary.total)}명 · 엑셀 파일 (회원번호 · 이름 · 이탈
            예측 점수 포함)
          </span>
          <Link
            to="/marketing/history"
            className="inline-flex h-[34px] items-center rounded-lg border border-green-300 bg-white px-3 text-xs font-bold text-green-700 hover:bg-green-50"
          >
            접촉 이력 보기 →
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
        onExtract={handleExtract}
        onSendToCmo={() => !summary.empty && setDone('cmo')}
      />

      {done === 'cmo' && (
        <SendCompleteModal
          subtitle={`${draft.mode === 'ai' ? `${messageTargets.length}개 대상` : '1개 대상'} · 총 ${formatCount(summary.total)}명${isMultiSegment ? ' (중복 제외)' : ''}`}
          rows={cmoRows}
          onConfirm={handleCmoConfirm}
        />
      )}
    </>
  );
}
