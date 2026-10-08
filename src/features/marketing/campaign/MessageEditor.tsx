import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  PencilLine,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { Dropdown } from '@/components/molecules/Dropdown';
import { MIN_SEND_DATE, SEND_TIME_OPTIONS } from '@/data/marketing';
import { AiGeneratingState } from '@/features/marketing/campaign/AiGeneratingState';
import {
  AI_GENERATING_MS,
  buildMessageView,
  formatSchedule,
  formatTimeLabel,
  hasTemplate,
  REWRITE_OPTIONS,
  type MessageDraft,
  type MessageTarget,
  type MessageView,
} from '@/features/marketing/campaign/campaignModel';
import { StepHeading } from '@/features/marketing/campaign/TargetSelectPanel';

export type MessageEditorHandlers = {
  onUpdate: (targetKey: string, patch: Partial<MessageDraft>) => void;
  onRegenerate: (targetKey: string) => void;
  /** request: 사용자가 입력한 다듬기 요청 (예: 더 짧고 친근하게) */
  onRewrite: (targetKey: string, request: string, message: string) => void;
};

type MessageEditorProps = MessageEditorHandlers & {
  targets: MessageTarget[];
  messages: Record<string, MessageDraft>;
};

/** 2. 발송 문구 (대상별 접이식 카드) */
export function MessageEditor({
  targets,
  messages,
  ...handlers
}: MessageEditorProps) {
  const firstKey = targets.find(hasTemplate)?.key;
  return (
    <section className="flex flex-col gap-3">
      <StepHeading step={2} title="발송 문구" />
      {targets.map((target) => (
        <div
          key={target.key}
          className="rounded-2xl border border-slate-200 bg-white"
        >
          {hasTemplate(target) ? (
            <MessageCard
              target={target}
              view={buildMessageView(
                target,
                messages[target.key],
                target.key === firstKey,
              )}
              {...handlers}
            />
          ) : (
            <div className="flex w-full items-center gap-2.5 px-6 py-4">
              <TargetName target={target} />
              <span className="ml-auto text-xs text-slate-500">
                상담원이 직접 연락해서 문구가 필요 없어요
              </span>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

function TargetName({ target }: { target: MessageTarget }) {
  return (
    <>
      <span className="text-sm font-bold text-slate-900">{target.name}</span>
      <span
        className={`inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${target.channel.chipClassName}`}
      >
        {target.channel.shortLabel}
      </span>
    </>
  );
}

function MessageCard({
  target,
  view,
  onUpdate,
  onRegenerate,
  onRewrite,
}: MessageEditorHandlers & {
  target: MessageTarget & { template: NonNullable<MessageTarget['template']> };
  view: MessageView;
}) {
  const { template } = target;
  const update = (patch: Partial<MessageDraft>) => onUpdate(target.key, patch);

  // 카드를 처음 펼치면 바로 AI 생성 연출을 보여준 뒤 문구를 띄운다
  useEffect(() => {
    if (view.open && !view.generated) {
      onRegenerate(target.key);
    }
  }, [view.open, view.generated, onRegenerate, target.key]);
  const rewriteLabel =
    view.aiTask === 'custom'
      ? '요청대로'
      : REWRITE_OPTIONS.find((option) => option.key === view.aiTask)?.label;
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [request, setRequest] = useState('');
  const submitRewrite = () => {
    if (!request.trim()) return;
    onRewrite(target.key, request.trim(), view.text);
    setRequest('');
    setRewriteOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={view.open}
        onClick={() => update({ open: !view.open })}
        className="flex w-full items-center gap-2.5 px-6 py-4 text-left"
      >
        <TargetName target={target} />
        <span
          className={
            view.open
              ? 'grow'
              : 'ml-1.5 min-w-0 grow truncate text-xs text-slate-600'
          }
        >
          {view.open ? '' : view.text}
        </span>
        <span className="inline-flex h-[26px] shrink-0 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-700">
          {formatSchedule(view)}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-slate-400 transition-transform ${view.open ? 'rotate-180' : ''}`}
          strokeWidth={2.4}
        />
      </button>

      {view.open && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 pb-5 pt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="w-16 text-xs font-bold text-slate-900">
              발송 일정
            </span>
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
              <CalendarDays className="size-[15px] text-slate-500" />
              <input
                type="date"
                aria-label="발송 날짜"
                value={view.date}
                min={MIN_SEND_DATE}
                onChange={(event) =>
                  event.target.value && update({ date: event.target.value })
                }
                className="bg-transparent text-xs font-semibold text-slate-900 outline-none"
              />
            </label>
            <Dropdown
              label="발송 시간"
              size="sm"
              className="min-w-[120px]"
              options={SEND_TIME_OPTIONS.map((time) => ({
                value: time,
                label: formatTimeLabel(time),
                badge:
                  time === template.recommendedTime ? 'AI 추천' : undefined,
              }))}
              value={view.time}
              onChange={(time) => update({ time })}
            />
            <span className="text-xs font-semibold text-violet-700">
              AI 추천 · {template.recommendedTimeLabel}
            </span>
          </div>

          {view.aiTask ? (
            <AiGeneratingState
              // 작업이 바뀌면 단계 표시를 처음부터 다시 보여준다
              key={view.aiTask}
              durationMs={AI_GENERATING_MS}
              personaLabel={target.name}
              themeLabel={target.channel.shortLabel}
              headline={
                rewriteLabel
                  ? `AI가 문구를 ${rewriteLabel} 다듬고 있어요`
                  : undefined
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {template.variants.map((variant, index) => {
                  const selected = index === view.variantIndex;
                  return (
                    <button
                      key={variant.text}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        update({ variantIndex: index, text: null })
                      }
                      className={`flex flex-col gap-2 rounded-xl border px-4 py-3.5 text-left ${
                        selected
                          ? 'border-blue-700 bg-blue-50/40 ring-1 ring-inset ring-blue-700'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-[22px] items-center rounded-md px-2 text-2xs font-bold ${
                            index === 0
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {index === 0
                            ? '문구 A · 추천'
                            : `문구 ${String.fromCharCode(65 + index)}`}
                        </span>
                        <span className="text-xs text-slate-500">
                          예상 반응률{' '}
                          <strong className="text-slate-900">
                            {variant.responseRate}%
                          </strong>
                        </span>
                        <span
                          className={`ml-auto inline-flex size-5 items-center justify-center rounded-full ${
                            selected
                              ? 'bg-blue-700 text-white'
                              : 'border-[1.5px] border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="size-[11px]" strokeWidth={3.4} />
                        </span>
                      </span>
                      <span className="text-sm leading-relaxed text-gray-800">
                        {/* 고른 문구는 다듬거나 고친 결과를 보여준다 */}
                        {selected ? view.text : variant.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2.5 rounded-xl border border-violet-100 bg-violet-50/40 px-3.5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-expanded={rewriteOpen}
                    onClick={() => setRewriteOpen(!rewriteOpen)}
                    className={`inline-flex h-[30px] items-center gap-1 rounded-lg border px-3 text-xs font-bold text-violet-700 ${
                      rewriteOpen
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-violet-200 bg-white hover:bg-violet-50'
                    }`}
                  >
                    <Sparkles className="size-3.5" />
                    AI로 다듬기
                  </button>
                  <button
                    type="button"
                    aria-expanded={editOpen}
                    onClick={() => setEditOpen(!editOpen)}
                    className={`inline-flex h-[30px] items-center gap-1 rounded-lg border px-3 text-xs font-bold text-slate-700 ${
                      editOpen
                        ? 'border-slate-400 bg-slate-100'
                        : 'border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <PencilLine className="size-3.5" strokeWidth={2.2} />
                    직접 수정
                  </button>
                  <span className="grow" />
                  <span className="text-xs text-slate-500">
                    {view.text.length}자 · {'{이름}'}은 받는 분 이름으로 바뀌고,
                    [ ] 부분은 발송 전에 꼭 확인해 주세요
                  </span>
                  <button
                    type="button"
                    onClick={() => onRegenerate(target.key)}
                    className="inline-flex h-[30px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-50"
                  >
                    <RotateCw className="size-[13px]" strokeWidth={2.4} />
                    다시 만들기
                  </button>
                </div>
                {rewriteOpen && (
                  <div className="flex flex-col gap-2 rounded-lg border border-violet-200 bg-white p-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        aria-label="AI 다듬기 요청"
                        placeholder="예: 더 짧고 친근하게 바꿔줘"
                        value={request}
                        onChange={(event) => setRequest(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') submitRewrite();
                          if (event.key === 'Escape') setRewriteOpen(false);
                        }}
                        className="h-9 min-w-0 grow rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-violet-500"
                      />
                      <button
                        type="button"
                        disabled={!request.trim()}
                        onClick={submitRewrite}
                        className="inline-flex h-9 items-center gap-1 rounded-md bg-violet-700 px-3.5 text-xs font-bold text-white hover:bg-violet-800 disabled:opacity-40"
                      >
                        <Sparkles className="size-3.5" />
                        다듬기
                      </button>
                    </div>
                    {/* 자주 쓰는 요청은 눌러서 바로 채운다 */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-2xs font-semibold text-slate-500">
                        예시
                      </span>
                      {REWRITE_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setRequest(option.label)}
                          className="h-6 rounded-full border border-violet-200 bg-white px-2.5 text-xs font-semibold text-violet-800 hover:bg-violet-50"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {editOpen && (
                  <textarea
                    aria-label={`${target.name} 발송 문구`}
                    value={view.text}
                    onChange={(event) => update({ text: event.target.value })}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-700"
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
