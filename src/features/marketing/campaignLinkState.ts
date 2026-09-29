export const CAMPAIGN_SEND_PATH = '/marketing/extraction';

/** 다른 화면에서 타겟 발송으로 넘어올 때 router state 로 전달하는 값 */
export type CampaignLinkState = {
  customerIds: string[];
  sourceLabel: string;
  /** 추천 캠페인 테마 (예: 'cashback') */
  theme?: string;
  /** 캠페인 대상 업종 */
  category?: string;
};
