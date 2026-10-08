/* 고객 분석 화면 목데이터 (디자인 시안 Console '고객 분석' 값 기준) */
import { CARD_PRODUCTS } from '@/data/target';

/** 전체 평균 위험비중 % */
export const AVERAGE_RISK_RATIO = 22.9;

/** 위험비중 막대의 최대 눈금 % */
export const RISK_RATIO_SCALE = 40;

export const ANALYSIS_MONTHS = [
  '26.09',
  '26.08',
  '26.07',
  '26.06',
  '26.05',
  '26.04',
];

export const ISSUE_CHANNELS = [
  '전체',
  '영업점',
  'i-ONE뱅크',
  'IBK카드앱',
  '외부 제휴',
  '기타',
];

export type AnalysisFilter = {
  month: string;
  product: string;
  channel: string;
};

export const DEFAULT_ANALYSIS_FILTER: AnalysisFilter = {
  month: '26.09',
  product: '전체',
  channel: '전체',
};

/** 필터에 따라 위험비중을 조금씩 움직여 조회가 동작하는 것처럼 보이게 한다 */
export function getFilterOffset(filter: AnalysisFilter) {
  const monthOffset = (9 - Number(filter.month.slice(3))) * -0.5;
  const productOffset =
    filter.product === '전체'
      ? 0
      : ((CARD_PRODUCTS.findIndex((card) => card.name === filter.product) % 5) -
          2) *
        0.5;
  const channelOffset =
    filter.channel === '전체'
      ? 0
      : ((ISSUE_CHANNELS.indexOf(filter.channel) % 4) - 1.5) * 0.5;
  return monthOffset + productOffset + channelOffset;
}

export function adjustRatio(ratio: number, offset: number) {
  return Math.max(2, Math.min(39, +(ratio + offset).toFixed(1)));
}

export type ProductRisk = {
  name: string;
  ratio: number;
  /** 예측 대상 고객 수 */
  total: number;
  /** 예측 대상 1,000명 미만이라 순위에서 제외 */
  small: boolean;
};

const TOP_RATIOS = [30.0, 25.3, 21.7, 18.1, 17.3];
const TOP_TOTALS = [217200, 194340, 184050, 144720, 134580];
const SMALL_RATIOS = [36.7, 33.1, 30.5];
const SMALL_TOTALS = [6450, 9370, 13520];

/** 카드 상품별 위험비중. 마지막 3개 상품은 예측 대상이 적어 순위에서 뺀다. */
export function getProductRisks(offset: number): ProductRisk[] {
  const smallStart = CARD_PRODUCTS.length - SMALL_RATIOS.length;
  return CARD_PRODUCTS.map((card, index) => {
    const small = index >= smallStart;
    const baseRatio =
      index < TOP_RATIOS.length
        ? TOP_RATIOS[index]
        : small
          ? SMALL_RATIOS[index - smallStart]
          : +(
              16.5 -
              (index - 5) * 0.2 +
              (((index * 37) % 7) - 3) * 0.25
            ).toFixed(1);
    const total =
      index < TOP_TOTALS.length
        ? TOP_TOTALS[index]
        : small
          ? SMALL_TOTALS[index - smallStart]
          : 30000 + ((index * 7919) % 7000) * 15;
    return {
      name: card.name,
      ratio: adjustRatio(baseRatio, offset),
      total,
      small,
    };
  });
}

export type DimensionKey =
  'product' | 'usage' | 'tenure' | 'age' | 'channel' | 'category';

export type MarkTone = 'red' | 'blue' | 'amber';

export type Dimension = {
  key: DimensionKey;
  title: string;
  /** [구간, 위험비중 %, 예측 대상 고객 수] */
  rows: [string, number, number][];
  /** 강조할 구간과 색 */
  mark?: { label: string; tone: MarkTone };
};

/** 상품을 뺀 특성별 위험비중 */
export const STATIC_DIMENSIONS: Dimension[] = [
  {
    key: 'usage',
    title: '월 이용금액별 이탈 위험',
    rows: [
      ['30만 원 미만', 29.0, 328800],
      ['30~50만 원', 24.8, 279600],
      ['50~100만 원', 20.2, 304200],
      ['100~200만 원', 16.0, 232000],
      ['200만 원 이상', 12.9, 155400],
    ],
  },
  {
    key: 'tenure',
    title: '거래 기간별 이탈 위험',
    rows: [
      ['6개월 미만', 31.5, 150600],
      ['6개월~1년', 26.9, 159800],
      ['1~3년', 22.8, 347200],
      ['3~5년', 18.6, 296500],
      ['5년 이상', 14.5, 345900],
    ],
    mark: { label: '6개월 미만', tone: 'red' },
  },
  {
    key: 'age',
    title: '연령대별 이탈 위험',
    rows: [
      ['20대 이하', 26.9, 185900],
      ['30대', 24.3, 327200],
      ['40대', 20.2, 350300],
      ['50대', 18.1, 270400],
      ['60대 이상', 21.7, 166200],
    ],
  },
  {
    key: 'channel',
    title: '발급 채널별 이탈 위험',
    rows: [
      ['영업점', 17.6, 464000],
      ['i-ONE뱅크', 21.7, 282700],
      ['IBK카드앱', 19.7, 259600],
      ['외부 제휴', 29.5, 189000],
      ['기타', 23.8, 104700],
    ],
    mark: { label: '외부 제휴', tone: 'amber' },
  },
  {
    key: 'category',
    title: '주 이용 업종별 이탈 위험',
    rows: [
      ['쇼핑', 26.4, 298000],
      ['외식', 23.8, 273500],
      ['주유', 18.1, 218200],
      ['생활요금', 15.0, 250400],
      ['기타', 22.2, 259900],
    ],
  },
];

/** 위험 증가 최대 고객군의 전월 대비 증가폭 %p */
export const CHANNEL_RISK_INCREASE = 4.1;
