import { RotateCw, Sparkles } from 'lucide-react';
import { SectionTitle } from '@/components/molecules/SectionTitle';
import { AiGeneratingState } from '@/features/marketing/campaign/AiGeneratingState';
import type { MessageThemeKey } from '@/data/marketing';
import {
  AI_GENERATING_MS,
  type CampaignDraft,
  type CampaignView,
} from '@/features/marketing/campaign/campaignModel';

type AiMessageStepProps = {
  draft: CampaignDraft;
  view: CampaignView;
  onRegenerate: () => void;
  onSelectTheme: (theme: MessageThemeKey) => void;
  onSelectVariant: (variantIndex: number) => void;
  onMessageChange: (message: string) => void;
};

export function AiMessageStep({
  draft,
  view,
  onRegenerate,
  onSelectTheme,
  onSelectVariant,
  onMessageChange,
}: AiMessageStepProps) {
  const aiReferences = [
    `${view.personaLabel} 세그먼트`,
    view.pickedCategoryLabel
      ? `주 이용 업종 ${view.pickedCategoryLabel}`
      : `이탈 사유 ${view.topReasonLabel}`,
    '가을 시즌',
    `${view.recommendedChannel.label} 반응 이력`,
  ];
  const isScript = view.channel.key === 'tm';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3.5 rounded-2xl border border-violet-200 bg-violet-50 px-[22px] py-5 text-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <span className="text-base font-bold">AI 문구 생성</span>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-violet-300 bg-white px-3.5 text-[13px] font-semibold text-violet-600 hover:bg-violet-50"
          >
            <RotateCw className="h-3.5 w-3.5" />
            다시 생성
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-violet-600/70">AI가 참고한 정보</span>
          {aiReferences.map((reference) => (
            <span
              key={reference}
              className="inline-flex h-[26px] items-center rounded-full bg-violet-100 px-2.5 text-xs text-violet-800"
            >
              {reference}
            </span>
          ))}
        </div>
        <div
          role="tablist"
          aria-label="문구 테마"
          className="flex flex-wrap gap-1.5"
        >
          {view.themes.map((theme) => {
            const isSelected = theme.key === view.theme.key;
            return (
              <button
                key={theme.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectTheme(theme.key)}
                className={`inline-flex h-[34px] items-center gap-1.5 rounded-full px-3.5 text-[13px] ${
                  isSelected
                    ? 'border border-violet-600 bg-violet-600 font-bold text-white'
                    : 'border border-violet-300 bg-white font-medium text-violet-700 hover:bg-violet-50'
                }`}
              >
                {theme.label}
                {theme.key === view.recommendedTheme.key && (
                  <span className="inline-flex h-[18px] items-center rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600">
                    추천
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {draft.isAiLoading ? (
        <AiGeneratingState
          // 생성 중에 테마를 또 바꾸면 단계 표시를 처음부터 다시 보여준다
          key={`${view.theme.key}-${view.variantIndex}`}
          durationMs={AI_GENERATING_MS}
          personaLabel={view.personaLabel}
          themeLabel={view.theme.label}
        />
      ) : (
        <section className="flex flex-col gap-3">
          <SectionTitle
            title="생성된 문구"
            description="하나를 고르면 아래에서 바로 다듬을 수 있어요"
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {view.theme.variants.map((variant, index) => {
              const isSelected = index === view.variantIndex;
              return (
                <button
                  key={variant.text}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectVariant(index)}
                  className={`flex min-h-[130px] flex-col items-start gap-3 rounded-xl px-[18px] py-4 text-left ${
                    isSelected
                      ? 'border border-violet-600 bg-violet-50'
                      : 'border border-border bg-white hover:border-violet-200'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-violet-100 text-violet-600'
                      }`}
                    >
                      {index === 0 ? 'AI 생성 A · 추천' : 'AI 생성 B'}
                    </span>
                    <span className="text-xs text-gray-600">
                      예상 반응률{' '}
                      <strong className="text-violet-600">
                        {(view.channel.baseRate + variant.rateDelta).toFixed(1)}
                        %
                      </strong>
                    </span>
                  </div>
                  <span className="text-sm leading-relaxed text-gray-900">
                    {variant.text}
                  </span>
                </button>
              );
            })}
          </div>
          <textarea
            aria-label={isScript ? '상담 스크립트' : '발송 문구'}
            value={view.message}
            onChange={(event) => onMessageChange(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-[10px] border border-gray-300 bg-white px-3.5 py-3 text-sm leading-relaxed text-gray-900 focus:border-gray-400 focus:outline-none"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {'{이름}'}은 회원별로 치환 · [ ] 안은 확정 후 채워 주세요
            </span>
            <span>{view.message.length}자</span>
          </div>
        </section>
      )}
    </div>
  );
}
