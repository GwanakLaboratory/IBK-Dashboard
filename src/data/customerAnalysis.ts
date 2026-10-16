/*
 * 고객 분석 화면 목데이터 (디자인 시안 Console '고객 분석' 값 기준).
 * 구간 · 채널은 코드값으로 두고, 화면에서 customerAnalysis.segment.<코드> 로 보여준다.
 */
import { ALL_FILTER } from '@/data/cards';
import { CARD_PRODUCTS } from '@/data/target';
import type ko from '@/i18n/locales/ko.json';
import type { CardId } from '@/types/churn';

/** 특성 구간 코드. 화면 표시는 customerAnalysis.segment.<코드> */
export type SegmentCode = keyof (typeof ko)['customerAnalysis']['segment'];

/** 발급 채널 코드 (구간 코드와 같은 문구를 쓴다) */
export type IssueChannel = Extract<
  SegmentCode,
  'branch' | 'iOneBank' | 'cardApp' | 'partner' | 'other'
>;

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

/** 발급 채널 필터 값 ('all' = 전체) */
export const ISSUE_CHANNELS: (typeof ALL_FILTER | IssueChannel)[] = [
  ALL_FILTER,
  'branch',
  'iOneBank',
  'cardApp',
  'partner',
  'other',
];

export type AnalysisFilter = {
  month: string;
  /** 'all' 또는 카드 상품 id */
  product: typeof ALL_FILTER | CardId;
  channel: typeof ALL_FILTER | IssueChannel;
};

export const DEFAULT_ANALYSIS_FILTER: AnalysisFilter = {
  month: '26.09',
  product: ALL_FILTER,
  channel: ALL_FILTER,
};

/** 필터에 따라 위험비중을 조금씩 움직여 조회가 동작하는 것처럼 보이게 한다 */
export function getFilterOffset(filter: AnalysisFilter) {
  const monthOffset = (9 - Number(filter.month.slice(3))) * -0.5;
  const productOffset =
    filter.product === ALL_FILTER
      ? 0
      : ((CARD_PRODUCTS.findIndex((card) => card.id === filter.product) % 5) -
          2) *
        0.5;
  const channelOffset =
    filter.channel === ALL_FILTER
      ? 0
      : ((ISSUE_CHANNELS.indexOf(filter.channel) % 4) - 1.5) * 0.5;
  return monthOffset + productOffset + channelOffset;
}

export function adjustRatio(ratio: number, offset: number) {
  return Math.max(2, Math.min(39, +(ratio + offset).toFixed(1)));
}

export type ProductRisk = {
  id: CardId;
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
      id: card.id,
      ratio: adjustRatio(baseRatio, offset),
      total,
      small,
    };
  });
}

export type DimensionKey =
  'product' | 'usage' | 'tenure' | 'age' | 'channel' | 'category';

export type MarkTone = 'red' | 'blue' | 'amber';

/** 화면 제목은 customerAnalysis.dimension.title.<key> */
export type Dimension = {
  key: Exclude<DimensionKey, 'product'>;
  /** [구간 코드, 위험비중 %, 예측 대상 고객 수] */
  rows: [SegmentCode, number, number][];
  /** 강조할 구간과 색 */
  mark?: { segment: SegmentCode; tone: MarkTone };
};

/** 상품을 뺀 특성별 위험비중 */
export const STATIC_DIMENSIONS: Dimension[] = [
  {
    key: 'usage',
    rows: [
      ['usageUnder300k', 25.1, 330700],
      ['usage300kTo500k', 21.4, 281300],
      ['usage500kTo1m', 17.5, 306000],
      ['usage1mTo2m', 13.8, 233400],
      ['usage2mOrMore', 11.2, 156294],
    ],
  },
  {
    key: 'tenure',
    rows: [
      ['tenureUnder6m', 27.2, 151500],
      ['tenure6mTo1y', 23.3, 160700],
      ['tenure1To3y', 19.7, 349300],
      ['tenure3To5y', 16.1, 298300],
      ['tenure5yOrMore', 12.5, 347894],
    ],
    mark: { segment: 'tenureUnder6m', tone: 'red' },
  },
  {
    key: 'age',
    rows: [
      ['age20sOrUnder', 23.3, 187000],
      ['age30s', 21.0, 329100],
      ['age40s', 17.5, 352400],
      ['age50s', 15.6, 272000],
      ['age60sOrOver', 18.8, 167194],
    ],
  },
  {
    key: 'channel',
    rows: [
      ['branch', 15.2, 466700],
      ['iOneBank', 18.8, 284400],
      ['cardApp', 17.0, 261100],
      ['partner', 25.5, 190100],
      ['other', 20.6, 105394],
    ],
    mark: { segment: 'partner', tone: 'amber' },
  },
  {
    key: 'category',
    rows: [
      ['shopping', 22.8, 299800],
      ['dining', 20.6, 275100],
      ['fuel', 15.6, 219500],
      ['utilities', 13.0, 251900],
      ['other', 19.2, 261394],
    ],
  },
];

/** 위험 증가 최대 고객군의 전월 대비 증가폭 %p */
export const CHANNEL_RISK_INCREASE = 3.5;
