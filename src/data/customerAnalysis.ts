/* 고객 분석 화면 목데이터 (디자인 시안 Console '고객 분석' 값 기준) */
import { CARD_PRODUCTS } from '@/data/target';

/** 전체 평균 위험비중 % */
export const AVERAGE_RISK_RATIO = 44.2;

/** 위험비중 막대의 최대 눈금 % */
export const RISK_RATIO_SCALE = 80;

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
  const monthOffset = (9 - Number(filter.month.slice(3))) * -0.9;
  const productOffset =
    filter.product === '전체'
      ? 0
      : (CARD_PRODUCTS.findIndex((card) => card.name === filter.product) % 5) -
        2;
  const channelOffset =
    filter.channel === '전체'
      ? 0
      : (ISSUE_CHANNELS.indexOf(filter.channel) % 4) - 1.5;
  return monthOffset + productOffset + channelOffset;
}

export function adjustRatio(ratio: number, offset: number) {
  return Math.max(5, Math.min(78, +(ratio + offset).toFixed(1)));
}

export type ProductRisk = {
  name: string;
  ratio: number;
  /** 예측 대상 고객 수 */
  total: number;
  /** 예측 대상 1,000명 미만이라 순위에서 제외 */
  small: boolean;
};

const TOP_RATIOS = [58.0, 49.0, 42.0, 35.0, 33.5];
const TOP_TOTALS = [14138, 12650, 11980, 9420, 8760];
const SMALL_RATIOS = [71.0, 64.0, 59.0];
const SMALL_TOTALS = [420, 610, 880];

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
          : +(32 - (index - 5) * 0.4 + (((index * 37) % 7) - 3) * 0.5).toFixed(
              1,
            );
    const total =
      index < TOP_TOTALS.length
        ? TOP_TOTALS[index]
        : small
          ? SMALL_TOTALS[index - smallStart]
          : 2000 + ((index * 7919) % 7000);
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
      ['30만 원 미만', 56, 21400],
      ['30~50만 원', 48, 18200],
      ['50~100만 원', 39, 19800],
      ['100~200만 원', 31, 15100],
      ['200만 원 이상', 25, 10120],
    ],
  },
  {
    key: 'tenure',
    title: '거래 기간별 이탈 위험',
    rows: [
      ['6개월 미만', 61, 9800],
      ['6개월~1년', 52, 10400],
      ['1~3년', 44, 22600],
      ['3~5년', 36, 19300],
      ['5년 이상', 28, 22520],
    ],
    mark: { label: '6개월 미만', tone: 'red' },
  },
  {
    key: 'age',
    title: '연령대별 이탈 위험',
    rows: [
      ['20대 이하', 52, 12100],
      ['30대', 47, 21300],
      ['40대', 39, 22800],
      ['50대', 35, 17600],
      ['60대 이상', 42, 10820],
    ],
  },
  {
    key: 'channel',
    title: '발급 채널별 이탈 위험',
    rows: [
      ['영업점', 34, 30200],
      ['i-ONE뱅크', 42, 18400],
      ['IBK카드앱', 38, 16900],
      ['외부 제휴', 57, 12300],
      ['기타', 46, 6820],
    ],
    mark: { label: '외부 제휴', tone: 'amber' },
  },
  {
    key: 'category',
    title: '주 이용 업종별 이탈 위험',
    rows: [
      ['쇼핑', 51, 19400],
      ['외식', 46, 17800],
      ['주유', 35, 14200],
      ['생활요금', 29, 16300],
      ['기타', 43, 16920],
    ],
  },
];

/** 위험 증가 최대 고객군의 전월 대비 증가폭 %p */
export const CHANNEL_RISK_INCREASE = 8.0;
