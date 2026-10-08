/* 고객 분석 화면 목데이터 (디자인 시안 Console '고객 분석' 값 기준) */
import { CARD_PRODUCTS } from '@/data/target';

/** 전체 평균 위험비중 % */
export const AVERAGE_RISK_RATIO = 19.8;

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

const TOP_RATIOS = [25.9, 21.9, 18.8, 15.6, 15.0];
const TOP_TOTALS = [218490, 195490, 185140, 145580, 135380];
const SMALL_RATIOS = [31.7, 28.6, 26.4];
const SMALL_TOTALS = [6490, 9430, 13600];

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
              14.3 -
              (index - 5) * 0.17 +
              (((index * 37) % 7) - 3) * 0.22
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
      ['30만 원 미만', 25.1, 330700],
      ['30~50만 원', 21.4, 281300],
      ['50~100만 원', 17.5, 306000],
      ['100~200만 원', 13.8, 233400],
      ['200만 원 이상', 11.2, 156294],
    ],
  },
  {
    key: 'tenure',
    title: '거래 기간별 이탈 위험',
    rows: [
      ['6개월 미만', 27.2, 151500],
      ['6개월~1년', 23.3, 160700],
      ['1~3년', 19.7, 349300],
      ['3~5년', 16.1, 298300],
      ['5년 이상', 12.5, 347894],
    ],
    mark: { label: '6개월 미만', tone: 'red' },
  },
  {
    key: 'age',
    title: '연령대별 이탈 위험',
    rows: [
      ['20대 이하', 23.3, 187000],
      ['30대', 21.0, 329100],
      ['40대', 17.5, 352400],
      ['50대', 15.6, 272000],
      ['60대 이상', 18.8, 167194],
    ],
  },
  {
    key: 'channel',
    title: '발급 채널별 이탈 위험',
    rows: [
      ['영업점', 15.2, 466700],
      ['i-ONE뱅크', 18.8, 284400],
      ['IBK카드앱', 17.0, 261100],
      ['외부 제휴', 25.5, 190100],
      ['기타', 20.6, 105394],
    ],
    mark: { label: '외부 제휴', tone: 'amber' },
  },
  {
    key: 'category',
    title: '주 이용 업종별 이탈 위험',
    rows: [
      ['쇼핑', 22.8, 299800],
      ['외식', 20.6, 275100],
      ['주유', 15.6, 219500],
      ['생활요금', 13.0, 251900],
      ['기타', 19.2, 261394],
    ],
  },
];

/** 위험 증가 최대 고객군의 전월 대비 증가폭 %p */
export const CHANNEL_RISK_INCREASE = 3.5;
