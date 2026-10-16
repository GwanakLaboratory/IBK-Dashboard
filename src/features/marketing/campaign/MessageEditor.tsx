import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  PencilLine,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@/components/molecules/Dropdown';
import {
  MIN_SEND_DATE,
  SEND_TIME_OPTIONS,
  templateTimeLabel,
  templateVariantText,
} from '@/data/marketing';
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
import { channelShortLabel } from '@/i18n/domain';

export type MessageEditorHandlers = {
  onUpdate: (targetKey: string, patch: Partial<MessageDraft>) => void;
  onRegenerate: (targetKey: string) => void;
  /** request: 사용자가 입력한 다듬기 요청 (예: 더 짧고 친근하게) */
  onRewrite: (targetKey: string, request: string, message: string) => void;
  /** '이 문구로 결정': 카드를 접고 다음 문구 카드를 펼친다 */
  onConfirm: (targetKey: string) => void;
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
  const { t } = useTranslation();
  const firstKey = targets.find(hasTemplate)?.key;
  return (
    <section className="flex flex-col gap-3">
      <StepHeading step={2} title={t('marketingSend.step.message')} />
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
                {t('marketingSend.channel.tmNoMessage')}
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
        {channelShortLabel(target.channel.key)}
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
  onConfirm,
}: MessageEditorHandlers & {
  target: MessageTarget & { template: NonNullable<MessageTarget['template']> };
  view: MessageView;
}) {
  const { t } = useTranslation();
  const { template } = target;
  const update = (patch: Partial<MessageDraft>) => onUpdate(target.key, patch);

  // 카드를 처음 펼치면 바로 AI 생성 연출을 보여준 뒤 문구를 띄운다
  useEffect(() => {
    if (view.open && !view.generated) {
      onRegenerate(target.key);
    }
  }, [view.open, view.generated, onRegenerate, target.key]);
  // 다듬기 중이면 어떤 방향으로 다듬는지 제목에 보여준다 (처음 생성은 기본 제목)
  const rewriteHeadline =
    view.aiTask && view.aiTask !== 'generate'
      ? t(`marketingSend.generating.rewriteHeadline.${view.aiTask}`)
      : undefined;
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [request, setRequest] = useState('');
  const submitRewrite = () => {
    if (!request.trim()) return;
    onRewrite(target.key, request.trim(), view.text);
    setRequest('');
    setRewriteOpen(false);
  };

  // 접힌 카드 요약: AI가 문구를 만들기 전에는 예시 문구 대신 미정 상태를 보여준다
  const hasMessage = view.generated && !view.aiTask;
  const collapsedText = !view.generated
    ? t('marketingSend.message.collapsed.notGenerated')
    : view.aiTask
      ? t('marketingSend.message.collapsed.generating')
      : view.text;

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
              : `ml-1.5 min-w-0 grow truncate text-xs ${hasMessage ? 'text-slate-600' : 'text-slate-400'}`
          }
        >
          {view.open ? '' : collapsedText}
        </span>
        {view.confirmed ? (
          <span className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 text-xs font-bold text-green-700">
            <Check className="size-3" strokeWidth={3} />
            {t('marketingSend.message.status.decided')}
          </span>
        ) : (
          // 결정하지 않은 카드는 생성 전 · 생성 중에도 '결정 전'으로 표시한다
          <span className="inline-flex h-[26px] shrink-0 items-center rounded-full bg-amber-50 px-2.5 text-xs font-bold text-amber-700">
            {t('marketingSend.message.status.pending')}
          </span>
        )}
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
              {t('marketingSend.message.schedule.label')}
            </span>
            <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
              <CalendarDays className="size-[15px] text-slate-500" />
              <input
                type="date"
                aria-label={t('marketingSend.message.schedule.date')}
                value={view.date}
                min={MIN_SEND_DATE}
                onChange={(event) =>
                  event.target.value && update({ date: event.target.value })
                }
                className="bg-transparent text-xs font-semibold text-slate-900 outline-none"
              />
            </label>
            <Dropdown
              label={t('marketingSend.message.schedule.time')}
              size="sm"
              className="min-w-[120px]"
              options={SEND_TIME_OPTIONS.map((time) => ({
                value: time,
                label: formatTimeLabel(time),
                badge:
                  time === template.recommendedTime
                    ? t('marketingSend.message.schedule.aiBadge')
                    : undefined,
              }))}
              value={view.time}
              onChange={(time) => update({ time })}
            />
            <span className="text-xs font-semibold text-violet-700">
              {t('marketingSend.message.schedule.recommended', {
                time: templateTimeLabel(template),
              })}
            </span>
          </div>

          {view.aiTask ? (
            <AiGeneratingState
              // 작업이 바뀌면 단계 표시를 처음부터 다시 보여준다
              key={view.aiTask}
              durationMs={AI_GENERATING_MS}
              personaLabel={target.name}
              themeLabel={channelShortLabel(target.channel.key)}
              headline={rewriteHeadline}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {template.variants.map((variant, index) => {
                  const selected = index === view.variantIndex;
                  const letter = String.fromCharCode(65 + index);
                  return (
                    <button
                      key={variant.key}
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
                            ? t('marketingSend.message.variant.recommended', {
                                letter,
                              })
                            : t('marketingSend.message.variant.label', {
                                letter,
                              })}
                        </span>
                        <span className="text-xs text-slate-500">
                          {t('marketingSend.message.variant.expectedResponse')}{' '}
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
                        {selected
                          ? view.text
                          : templateVariantText(template, index)}
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
                    {t('marketingSend.message.rewrite.button')}
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
                    {t('marketingSend.message.edit.button')}
                  </button>
                  <span className="grow" />
                  <span className="text-xs text-slate-500">
                    {t('marketingSend.message.hint', {
                      count: view.text.length,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRegenerate(target.key)}
                    className="inline-flex h-[30px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-50"
                  >
                    <RotateCw className="size-[13px]" strokeWidth={2.4} />
                    {t('marketingSend.message.regenerate')}
                  </button>
                </div>
                {rewriteOpen && (
                  <div className="flex flex-col gap-2 rounded-lg border border-violet-200 bg-white p-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        aria-label={t(
                          'marketingSend.message.rewrite.requestLabel',
                        )}
                        placeholder={t(
                          'marketingSend.message.rewrite.placeholder',
                        )}
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
                        {t('marketingSend.message.rewrite.submit')}
                      </button>
                    </div>
                    {/* 자주 쓰는 요청은 눌러서 바로 채운다 */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-2xs font-semibold text-slate-500">
                        {t('marketingSend.message.rewrite.examples')}
                      </span>
                      {REWRITE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setRequest(
                              t(
                                `marketingSend.message.rewrite.option.${option}`,
                              ),
                            )
                          }
                          className="h-6 rounded-full border border-violet-200 bg-white px-2.5 text-xs font-semibold text-violet-800 hover:bg-violet-50"
                        >
                          {t(`marketingSend.message.rewrite.option.${option}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {editOpen && (
                  <textarea
                    aria-label={t('marketingSend.message.edit.textareaLabel', {
                      name: target.name,
                    })}
                    value={view.text}
                    onChange={(event) => update({ text: event.target.value })}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-700"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                {view.confirmed && (
                  <span className="text-xs text-slate-500">
                    {t('marketingSend.message.confirmedNote')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onConfirm(target.key)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
                >
                  <Check className="size-4" strokeWidth={2.6} />
                  {view.confirmed
                    ? t('marketingSend.message.collapse')
                    : t('marketingSend.message.confirm')}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
