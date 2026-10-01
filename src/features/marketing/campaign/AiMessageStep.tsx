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
      <div className="flex flex-col gap-3.5 rounded-2xl border border-[#ECEEF3] bg-[#FAFAFC] px-[22px] py-5 text-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <span className="text-base font-bold">
              {isScript ? '상담 스크립트 만들기' : '추천 문구 만들기'}
            </span>
            <span className="text-xs text-gray-500">
              세그먼트 특성과 과거 반응 데이터를 바탕으로{' '}
              {isScript ? '스크립트를' : '문구를'} 써요
            </span>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RotateCw className="h-3.5 w-3.5" />
            다시 생성
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">참고한 정보</span>
          {aiReferences.map((reference) => (
            <span
              key={reference}
              className="inline-flex h-[26px] items-center rounded-full border border-border bg-white px-2.5 text-xs text-gray-700"
            >
              {reference}
            </span>
          ))}
        </div>
        <div
          role="tablist"
          aria-label="문구 테마"
          className="flex flex-wrap gap-1.5 pt-1.5"
        >
          {view.themes.map((theme) => {
            const isSelected = theme.key === view.theme.key;
            const isRecommended = theme.key === view.recommendedTheme.key;
            return (
              <div key={theme.key} className="relative">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectTheme(theme.key)}
                  className={`inline-flex h-[34px] items-center rounded-full px-3.5 text-xs ${
                    isSelected
                      ? 'border border-violet-600 bg-white font-bold text-violet-600'
                      : 'border border-border bg-white font-medium text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {theme.label}
                </button>
                {isRecommended && (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-[16px] items-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                    추천
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle
          title={isScript ? '생성된 스크립트' : '생성된 문구'}
          description="하나를 고르면 아래에서 바로 다듬을 수 있어요"
        />
        {draft.isAiLoading ? (
          <AiGeneratingState
            // 생성 중에 테마를 또 바꾸면 단계 표시를 처음부터 다시 보여준다
            key={`${view.theme.key}-${view.variantIndex}`}
            durationMs={AI_GENERATING_MS}
            personaLabel={view.personaLabel}
            themeLabel={view.theme.label}
            isScript={isScript}
          />
        ) : (
          <>
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
                        ? 'border border-violet-600 bg-white'
                        : 'border border-border bg-white hover:border-violet-200'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className={`inline-flex h-[22px] items-center rounded-full px-2 text-[12px] font-bold ${
                          isSelected
                            ? 'bg-violet-100 text-violet-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index === 0
                          ? `추천 ${isScript ? '스크립트' : '문구'} A`
                          : `${isScript ? '스크립트' : '문구'} B`}
                      </span>
                      <span className="text-xs text-gray-600">
                        예상 반응률{' '}
                        <strong className="text-gray-900">
                          {(view.channel.baseRate + variant.rateDelta).toFixed(
                            1,
                          )}
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
          </>
        )}
      </section>
    </div>
  );
}
