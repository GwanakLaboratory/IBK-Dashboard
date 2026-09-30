import { SectionTitle } from '@/components/molecules/SectionTitle';
import {
  buildMessageThemes,
  RECENT_CAMPAIGNS,
  type RecentCampaign,
  type SendChannelKey,
} from '@/data/marketing';

export type StartOptionKey = 'ai' | 'filter' | 'random';

type StartOption = {
  key: StartOptionKey;
  title: string;
  description: string;
  meta: string;
};

const START_OPTIONS: StartOption[] = [
  {
    key: 'ai',
    title: 'AI 추천으로 시작',
    description: '위험군 분석 결과로 대상과 문구 테마를 AI가 한 번에 구성해요',
    meta: '대상 · 문구 자동 구성',
  },
  {
    key: 'filter',
    title: '조건 직접 설정',
    description:
      '위험도 · 성별 · 연령 · 이탈 사유 · 주 이용 업종을 조합해 대상을 좁혀요',
    meta: 'STEP 1부터',
  },
  {
    key: 'random',
    title: '무작위 추출',
    description: '위험 그룹에서 원하는 인원수만큼 무작위로 뽑아요',
    meta: 'STEP 1부터 · 대조군 테스트',
  },
];

const RECENT_CHANNEL_LABEL: Record<SendChannelKey, string> = {
  kakao: '카카오',
  sms: 'SMS',
  tm: 'TM',
};
const THEME_LABEL = Object.fromEntries(
  buildMessageThemes('', '').map((theme) => [theme.key, theme.label]),
);
const RECENT_GRID_CLASS_NAME =
  'grid grid-cols-[minmax(0,1fr)_90px_110px_90px_100px_140px] items-center gap-3 px-5';

type CampaignStartViewProps = {
  onStart: (option: StartOptionKey) => void;
  onReuse: (campaign: RecentCampaign) => void;
};

export function CampaignStartView({
  onStart,
  onReuse,
}: CampaignStartViewProps) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <SectionTitle
          title="새 캠페인 시작"
          description="대상을 어떻게 고를지 선택하면 단계별로 안내해요"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {START_OPTIONS.map((option) => {
            const isAi = option.key === 'ai';
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onStart(option.key)}
                className={`flex min-h-[180px] flex-col items-start justify-between gap-[18px] rounded-2xl p-6 text-left transition-shadow hover:shadow-md ${
                  isAi
                    ? 'border border-violet-300 bg-violet-50 text-gray-900 shadow-[0_6px_18px_rgba(124,58,237,0.08)]'
                    : 'border border-border bg-white text-gray-900'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold">{option.title}</span>
                  <span className="text-[13px] leading-relaxed text-gray-600">
                    {option.description}
                  </span>
                </div>
                <div
                  className={`flex w-full items-center justify-between border-t pt-3.5 text-xs ${
                    isAi
                      ? 'border-violet-200 text-violet-600'
                      : 'border-gray-100 text-gray-500'
                  }`}
                >
                  <span>{option.meta}</span>
                  <span className="font-bold">시작하기 →</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle
          title="최근 캠페인"
          description="같은 조건으로 바로 다시 보낼 수 있어요"
        />
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <div className="min-w-[760px]">
            <div
              className={`${RECENT_GRID_CLASS_NAME} h-10 bg-gray-50 text-xs font-semibold text-gray-500`}
            >
              <span>캠페인</span>
              <span>발송일</span>
              <span className="text-right">대상</span>
              <span>채널</span>
              <span className="text-right">응답률</span>
              <span />
            </div>
            {RECENT_CAMPAIGNS.map((campaign) => (
              <div
                key={campaign.name}
                className={`${RECENT_GRID_CLASS_NAME} h-[60px] border-t border-gray-100 text-[13px]`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-semibold text-gray-900">
                    {campaign.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {THEME_LABEL[campaign.theme]} 테마
                  </span>
                </div>
                <span className="text-gray-600">{campaign.date}</span>
                <span className="text-right font-semibold text-gray-900">
                  {campaign.count.toLocaleString('ko-KR')}명
                </span>
                <span className="text-gray-600">
                  {RECENT_CHANNEL_LABEL[campaign.channel]}
                </span>
                <span className="text-right font-bold text-primary">
                  {campaign.responseRate}%
                </span>
                <button
                  type="button"
                  onClick={() => onReuse(campaign)}
                  className="h-[34px] justify-self-end rounded-lg border border-blue-200 bg-white px-3.5 text-[13px] font-semibold text-primary hover:bg-blue-50"
                >
                  다시 발송 →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
