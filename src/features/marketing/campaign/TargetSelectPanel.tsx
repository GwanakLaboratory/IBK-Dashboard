import {
  Check,
  RotateCw,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CONDITION_GROUPS,
  conditionGroupLabel,
  conditionOptionLabel,
  RANDOM_POOLS,
  RANDOM_SIZES,
  randomPoolLabel,
  RISK_OPTION_LEVEL,
  SEND_CHANNELS,
  SEND_SEGMENTS,
  sendSegmentText,
  type ConditionGroupKey,
  type RandomPool,
  type SendChannelKey,
} from '@/data/marketing';
import { AiInsightBox } from '@/features/marketing/campaign/AiInsightBox';
import {
  buildAiInsight,
  getPickedConditionGroups,
  getRandomPool,
  getSelectedSegments,
  type SendDraft,
  type TargetMode,
} from '@/features/marketing/campaign/campaignModel';
import { channelShortLabel } from '@/i18n/domain';
import { formatNumber } from '@/i18n/format';
import { RISK_LEVEL_META } from '@/utils/risk';

/** 탭 순서. 이름은 marketingSend.mode.<key> */
const MODES: TargetMode[] = ['ai', 'cond', 'rand'];

const CHIP_CLASS_NAME =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs';
const chipClassName = (selected: boolean) =>
  `${CHIP_CLASS_NAME} ${
    selected
      ? 'border-blue-700 bg-blue-50 font-bold text-blue-700'
      : 'border-slate-200 bg-slate-50 font-medium text-slate-600 hover:bg-slate-100'
  }`;

type TargetSelectPanelProps = {
  draft: SendDraft;
  onSelectMode: (mode: TargetMode) => void;
  onToggleSegment: (segmentId: string) => void;
  onToggleCondition: (groupKey: ConditionGroupKey, option: string) => void;
  onResetConditions: () => void;
  onSelectPool: (poolKey: RandomPool['key']) => void;
  onSelectSize: (size: number) => void;
  onSelectControl: (control: boolean) => void;
  onSelectChannel: (channel: SendChannelKey) => void;
};

/** 1. 대상 선택 (AI 추천 세그먼트 · 조건 직접 선택 · 무작위 추출) */
export function TargetSelectPanel({
  draft,
  onSelectMode,
  onToggleSegment,
  onToggleCondition,
  onResetConditions,
  onSelectPool,
  onSelectSize,
  onSelectControl,
  onSelectChannel,
}: TargetSelectPanelProps) {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-3">
      <StepHeading step={1} title={t('marketingSend.step.target')} />
      <div
        role="tablist"
        aria-label={t('marketingSend.mode.label')}
        className="flex gap-1 rounded-xl bg-slate-200/70 p-1"
      >
        {MODES.map((mode) => {
          const selected = mode === draft.mode;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelectMode(mode)}
              className={`flex h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors ${
                selected
                  ? 'bg-white font-bold text-blue-700 shadow-sm ring-1 ring-slate-900/5'
                  : 'font-semibold text-slate-500 hover:text-slate-700'
              }`}
            >
              {t(`marketingSend.mode.${mode}`)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-6 pb-5 pt-5">
        {draft.mode === 'ai' && (
          <AiSegmentBody draft={draft} onToggleSegment={onToggleSegment} />
        )}
        {draft.mode === 'cond' && (
          <ConditionBody
            draft={draft}
            onToggleCondition={onToggleCondition}
            onResetConditions={onResetConditions}
          />
        )}
        {draft.mode === 'rand' && (
          <RandomBody
            draft={draft}
            onSelectPool={onSelectPool}
            onSelectSize={onSelectSize}
            onSelectControl={onSelectControl}
          />
        )}
        {draft.mode !== 'ai' && (
          <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-slate-900">
              {t('marketingSend.channel.label')}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SEND_CHANNELS.map((channel) => {
                const selected = channel.key === draft.channel;
                return (
                  <button
                    key={channel.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectChannel(channel.key)}
                    className={
                      selected
                        ? `${CHIP_CLASS_NAME} font-bold ${channel.selectedClassName}`
                        : chipClassName(false)
                    }
                  >
                    <span
                      className={`size-[7px] shrink-0 rounded-full ${channel.dotClassName}`}
                    />
                    {channelShortLabel(channel.key)}
                  </button>
                );
              })}
              {draft.channel === 'tm' && (
                <span className="ml-2 text-xs text-slate-500">
                  {t('marketingSend.channel.tmNoMessage')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function StepHeading({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
        {step}
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );
}

function BodyHeading({
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-2.5">
      <Icon className={`size-[18px] shrink-0 ${iconClassName}`} />
      <span className="text-base font-bold text-slate-900">{title}</span>
      <span className="text-xs text-slate-500">{description}</span>
      {children}
    </div>
  );
}

function AiSegmentBody({
  draft,
  onToggleSegment,
}: Pick<TargetSelectPanelProps, 'draft' | 'onToggleSegment'>) {
  const { t } = useTranslation();
  const selectedSegments = getSelectedSegments(draft);
  const insight = buildAiInsight(selectedSegments);
  return (
    <>
      <BodyHeading
        icon={Sparkles}
        iconClassName="text-violet-700"
        title={t('marketingSend.ai.title')}
        description={t('marketingSend.ai.description')}
      />
      <div className="grid grid-cols-2 gap-3">
        {SEND_SEGMENTS.map((segment) => {
          const selected = draft.segmentIds.includes(segment.id);
          const channel = SEND_CHANNELS.find(
            (item) => item.key === segment.channel,
          );
          return (
            <button
              key={segment.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleSegment(segment.id)}
              className={`grid grid-cols-[minmax(0,1fr)_128px] gap-[18px] rounded-2xl border px-5 py-[18px] text-left ${
                selected
                  ? 'border-blue-700 bg-blue-50/40 ring-1 ring-inset ring-blue-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="flex min-w-0 flex-col gap-2">
                <span className="flex min-w-0 items-center gap-2.5">
                  <CheckBox checked={selected} />
                  <span className="truncate text-base font-bold text-slate-900">
                    {sendSegmentText(segment.id, 'name')}
                  </span>
                </span>
                <span
                  className={`inline-flex h-6 items-center self-start whitespace-nowrap rounded-full px-2.5 text-xs font-bold ${channel?.chipClassName}`}
                >
                  {sendSegmentText(segment.id, 'benefit')} ·{' '}
                  {channelShortLabel(segment.channel)}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {sendSegmentText(segment.id, 'condition')}
                </span>
                <span className="text-xs leading-relaxed text-slate-500">
                  {sendSegmentText(segment.id, 'description')}
                </span>
              </span>
              <span className="flex flex-col justify-center gap-2.5 border-l border-slate-100 pl-[18px]">
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">
                    {t('marketingSend.ai.count')}
                  </span>
                  <span className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-slate-900">
                      {formatNumber(segment.count)}
                    </span>
                    <span className="text-xs font-bold">
                      {t('marketingSend.unit.people')}
                    </span>
                  </span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500">
                    {t('marketingSend.ai.averageScore')}
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    {segment.averageScore}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {/* 세그먼트를 고르기 전에는 AI 분석 대신 안내만 보여준다 */}
      {selectedSegments.length > 0 ? (
        <AiInsightBox highlight={insight.highlight}>
          {insight.text}
        </AiInsightBox>
      ) : (
        <AiInsightBox>{t('marketingSend.ai.emptyInsight')}</AiInsightBox>
      )}
    </>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex size-5 shrink-0 items-center justify-center rounded-md ${
        checked
          ? 'bg-blue-700 text-white'
          : 'border-[1.5px] border-slate-300 bg-white text-transparent'
      }`}
    >
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

/** 왼쪽 라벨 + 오른쪽 칩 목록 한 줄 */
function OptionRow({
  label,
  status,
  statusActive,
  children,
}: {
  label: string;
  status?: string;
  statusActive?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[112px_minmax(0,1fr)] items-start gap-3 py-3">
      <div className="flex flex-col gap-[3px] pt-1.5">
        <span className="text-sm font-bold text-slate-900">{label}</span>
        {status && (
          <span
            className={`text-xs font-semibold ${statusActive ? 'text-blue-700' : 'text-slate-400'}`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ConditionBody({
  draft,
  onToggleCondition,
  onResetConditions,
}: Pick<
  TargetSelectPanelProps,
  'draft' | 'onToggleCondition' | 'onResetConditions'
>) {
  const { t } = useTranslation();
  const pickedCount = getPickedConditionGroups(draft.conditions).length;
  return (
    <>
      <BodyHeading
        icon={SlidersHorizontal}
        iconClassName="text-blue-700"
        title={t('marketingSend.condition.title')}
        description={t('marketingSend.condition.description')}
      >
        <span className="grow" />
        {pickedCount > 0 && (
          <span className="text-xs font-bold text-blue-700">
            {t('marketingSend.condition.pickedGroups', { count: pickedCount })}
          </span>
        )}
        <button
          type="button"
          onClick={onResetConditions}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCw className="size-[13px]" strokeWidth={2.4} />
          {t('marketingSend.condition.reset')}
        </button>
      </BodyHeading>
      <div className="grid grid-cols-2 gap-x-10 border-t border-slate-100 pt-1.5">
        {CONDITION_GROUPS.map((group) => {
          const picked = draft.conditions[group.key];
          return (
            <OptionRow
              key={group.key}
              label={conditionGroupLabel(group.key)}
              status={
                picked.length
                  ? t('marketingSend.condition.status.picked', {
                      count: picked.length,
                    })
                  : t('marketingSend.condition.status.none')
              }
              statusActive={picked.length > 0}
            >
              {group.options.map((option) => {
                const selected = picked.includes(option);
                const riskLevel = RISK_OPTION_LEVEL[option];
                const isRisk = group.key === 'risk';
                const riskMeta = isRisk ? RISK_LEVEL_META[riskLevel] : null;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleCondition(group.key, option)}
                    className={
                      riskMeta && selected
                        ? `${CHIP_CLASS_NAME} font-bold ${riskMeta.badgeClassName} ${RISK_CHIP_BORDER[riskLevel]}`
                        : chipClassName(selected)
                    }
                  >
                    {riskMeta && (
                      <span
                        className={`size-[7px] rounded-full ${riskMeta.dotColorClassName}`}
                      />
                    )}
                    {selected && !isRisk && (
                      <Check className="size-3" strokeWidth={3} />
                    )}
                    {conditionOptionLabel(group.key, option)}
                  </button>
                );
              })}
            </OptionRow>
          );
        })}
      </div>
    </>
  );
}

const RISK_CHIP_BORDER = {
  high: 'border-red-500',
  medium: 'border-amber-500',
  low: 'border-green-500',
};

function RandomBody({
  draft,
  onSelectPool,
  onSelectSize,
  onSelectControl,
}: Pick<
  TargetSelectPanelProps,
  'draft' | 'onSelectPool' | 'onSelectSize' | 'onSelectControl'
>) {
  const { t } = useTranslation();
  const pool = getRandomPool(draft);
  return (
    <>
      <BodyHeading
        icon={Shuffle}
        iconClassName="text-teal-700"
        title={t('marketingSend.random.title')}
        description={t('marketingSend.random.description')}
      />
      <div className="grid grid-cols-2 gap-x-10 border-t border-slate-100 pt-1.5">
        <OptionRow label={t('marketingSend.random.pool.label')}>
          {RANDOM_POOLS.map((item) => {
            const selected = item.key === pool?.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectPool(item.key)}
                className={chipClassName(selected)}
              >
                {item.levels.map((level) => (
                  <span
                    key={level}
                    className={`size-[7px] shrink-0 rounded-full ${RISK_LEVEL_META[level].dotColorClassName}`}
                  />
                ))}
                {randomPoolLabel(item)}
              </button>
            );
          })}
        </OptionRow>
        <OptionRow label={t('marketingSend.random.size.label')}>
          {RANDOM_SIZES.map((size) => {
            const selected = size === draft.size;
            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectSize(size)}
                className={chipClassName(selected)}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
                {t('marketingSend.random.size.value', {
                  value: formatNumber(size),
                })}
              </button>
            );
          })}
        </OptionRow>
        <OptionRow label={t('marketingSend.random.control.label')}>
          {[true, false].map((control) => {
            const selected = control === draft.control;
            return (
              <button
                key={String(control)}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectControl(control)}
                className={chipClassName(selected)}
              >
                {selected && <Check className="size-3" strokeWidth={3} />}
                {control
                  ? t('marketingSend.random.control.yes')
                  : t('marketingSend.random.control.no')}
              </button>
            );
          })}
        </OptionRow>
      </div>
    </>
  );
}
