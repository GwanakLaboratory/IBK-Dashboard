import { ibkCreditCardInfos } from '@/data/ibkCreditCardInfo';
import type { LastContact } from '@/i18n/domain';
import type {
  AgeGroup,
  BenefitCategory,
  CardBrand,
  CardId,
  ChurnReason,
  Gender,
  MemberName,
} from '@/types/churn';

/*
 * 위험 타겟 화면 공통 목데이터 (회원 · 카드 상품). 회원은 시안 값, 카드는 IBK 실제 상품 기준.
 * 문구 대신 코드값을 두고, 화면에서 @/i18n/domain 함수로 현재 언어 문구로 바꾼다.
 */

export type TargetMember = {
  id: string;
  name: MemberName;
  gender: Gender;
  ageGroup: AgeGroup;
  joinedAt: string;
  productId: CardId;
  /** 이탈 예측 점수 0–100 */
  score: number;
  /** 미이용 일수 */
  idleDays: number;
  reason: ChurnReason;
  /** 최근 접촉 (없으면 null) */
  lastContact: LastContact;
};

/** 위험도별 전체 회원 수 (목록 상단 카드). 전체 = 대시보드 이용 고객, 위험 + 중위험 = 대시보드 이탈 위험 고객 */
export const MEMBER_COUNT_BY_LEVEL = {
  all: 1307694,
  high: 131186,
  medium: 127737,
  low: 1048771,
};

/** 시안에 있던 대표 회원 10명 */
const SAMPLE_MEMBERS: TargetMember[] = [
  {
    id: 'C-001024',
    name: { surname: 'kim', given: 'hyun' },
    gender: 'female',
    ageGroup: '30s',
    joinedAt: '2019.04',
    productId: 'happy-mate',
    score: 92,
    idleDays: 58,
    reason: 'otherCardUsage',
    lastContact: null,
  },
  {
    id: 'C-118302',
    name: { surname: 'lee', given: 'jun' },
    gender: 'male',
    ageGroup: '40s',
    joinedAt: '2017.11',
    productId: 'k-pass',
    score: 88,
    idleDays: 52,
    reason: 'benefitDecline',
    lastContact: { date: '09.18', channel: 'push' },
  },
  {
    id: 'C-330915',
    name: { surname: 'park', given: 'young' },
    gender: 'female',
    ageGroup: '20s',
    joinedAt: '2023.02',
    productId: 'point',
    score: 81,
    idleDays: 45,
    reason: 'otherCardUsage',
    lastContact: null,
  },
  {
    id: 'C-097266',
    name: { surname: 'choi', given: 'ho' },
    gender: 'male',
    ageGroup: '50s',
    joinedAt: '2015.06',
    productId: 'happy-mate',
    score: 76,
    idleDays: 38,
    reason: 'bankRelationship',
    lastContact: { date: '09.10', channel: 'kakao' },
  },
  {
    id: 'C-452190',
    name: { surname: 'jung', given: 'eun' },
    gender: 'female',
    ageGroup: '30s',
    joinedAt: '2020.09',
    productId: 'i-pet',
    score: 71,
    idleDays: 33,
    reason: 'benefitDecline',
    lastContact: { date: '09.10', channel: 'kakao' },
  },
  {
    id: 'C-261734',
    name: { surname: 'kang', given: 'min' },
    gender: 'male',
    ageGroup: '40s',
    joinedAt: '2018.03',
    productId: 'point',
    score: 64,
    idleDays: 21,
    reason: 'otherCardUsage',
    lastContact: null,
  },
  {
    id: 'C-389051',
    name: { surname: 'cho', given: 'a' },
    gender: 'female',
    ageGroup: '20s',
    joinedAt: '2025.12',
    productId: 'kapick',
    score: 57,
    idleDays: 17,
    reason: 'jobIncomeChange',
    lastContact: { date: '09.24', channel: 'push' },
  },
  {
    id: 'C-173648',
    name: { surname: 'yoon', given: 'seok' },
    gender: 'male',
    ageGroup: '60s',
    joinedAt: '2012.08',
    productId: 'k-pass',
    score: 48,
    idleDays: 12,
    reason: 'bankRelationship',
    lastContact: { date: '09.02', channel: 'email' },
  },
  {
    id: 'C-506427',
    name: { surname: 'jang', given: 'hee' },
    gender: 'female',
    ageGroup: '30s',
    joinedAt: '2021.05',
    productId: 'happy-mate',
    score: 31,
    idleDays: 5,
    reason: 'recruiterChannel',
    lastContact: null,
  },
  {
    id: 'C-044819',
    name: { surname: 'lim', given: 'woo' },
    gender: 'male',
    ageGroup: '50s',
    joinedAt: '2016.01',
    productId: 'i-pet',
    score: 18,
    idleDays: 2,
    reason: 'benefitDecline',
    lastContact: null,
  },
];

/** 이탈 사유 (회원 수가 많은 순) */
export const CHURN_REASONS: ChurnReason[] = [
  'otherCardUsage',
  'benefitDecline',
  'bankRelationship',
  'jobIncomeChange',
  'recruiterChannel',
];

/**
 * 회원에게 사유를 돌려 가며 붙이는 순서 (CHURN_REASONS 순번).
 * 20명마다 7 · 5 · 4 · 3 · 1명이라 CHURN_REASONS 순서대로 회원이 많다.
 */
const REASON_CYCLE = [
  0, 1, 0, 2, 0, 1, 3, 0, 2, 1, 0, 4, 0, 1, 2, 3, 0, 1, 2, 3,
];

/** 카드 상품. 이름 · 요약은 cardName(id) · cardSummary(id)로 보여준다 */
export type CardProduct = {
  id: CardId;
  tags: BenefitCategory[];
  brands: CardBrand[];
  members: number;
  /** 이탈률 % */
  churnRate: number;
  /** 전월 대비 %p */
  churnRateDelta: number;
  /** 보유 회원 중 위험 / 중위험 비율 % */
  highShare: number;
  mediumShare: number;
};

/** IBK 실제 카드 상품(ibkCreditCardInfos)에 데모 지표를 붙인 목록. 지표는 상품 순서로 정해지는 고정값. */
export const CARD_PRODUCTS: CardProduct[] = ibkCreditCardInfos.map(
  (info, index) => ({
    id: info.id,
    tags: info.benefitCategories,
    brands: info.brands,
    members: 30000 + ((index * 7919) % 23) * 8000 + ((index * 131) % 9) * 1000,
    churnRate: +(1.2 + ((index * 37) % 25) / 10).toFixed(1),
    churnRateDelta: +((((index * 13) % 9) - 3) / 10).toFixed(1),
    highShare: +(4 + ((index * 29) % 9) + ((index * 7) % 10) / 10).toFixed(1),
    mediumShare: +(10 + ((index * 11) % 12) + ((index * 3) % 10) / 10).toFixed(
      1,
    ),
  }),
);

const SURNAMES: MemberName['surname'][] = [
  'kim',
  'lee',
  'park',
  'choi',
  'jung',
  'kang',
  'cho',
  'yoon',
  'jang',
  'lim',
  'han',
  'oh',
  'seo',
  'shin',
  'kwon',
  'hwang',
  'ahn',
  'song',
  'ryu',
  'hong',
];
const NAME_ENDINGS: MemberName['given'][] = [
  'min',
  'seo',
  'jun',
  'yun',
  'hyun',
  'jin',
  'woo',
  'a',
  'hee',
  'ho',
  'young',
  'eun',
  'su',
  'yeon',
];
const AGE_GROUPS: AgeGroup[] = ['20s', '30s', '40s', '50s', '60s'];
const CONTACTS: LastContact[] = [
  null,
  { date: '09.18', channel: 'push' },
  { date: '09.10', channel: 'kakao' },
  null,
  { date: '09.24', channel: 'sms' },
  { date: '09.02', channel: 'email' },
];

/** 모든 카드 상품에 이탈 위험(40점 이상) 회원이 최소 몇 명씩 있게 할지 */
const MIN_RISK_MEMBERS_PER_CARD = 3;

/** 최근 2개월(60일) 안에 이용한 고객만 분석 대상이다 */
const MAX_IDLE_DAYS = 59;

/** 순번으로 정해지는 고정 회원 (새로고침해도 같음) */
function makeFillerMember(
  n: number,
  productId: CardId,
  score: number,
): TargetMember {
  return {
    id: `C-${String(600000 + n * 7919).padStart(6, '0')}`,
    name: {
      surname: SURNAMES[(n * 7) % SURNAMES.length],
      given: NAME_ENDINGS[(n * 5) % NAME_ENDINGS.length],
    },
    gender: n % 2 === 0 ? 'female' : 'male',
    ageGroup: AGE_GROUPS[(n * 3) % AGE_GROUPS.length],
    joinedAt: `20${15 + (n % 11)}.${String(1 + ((n * 5) % 12)).padStart(2, '0')}`,
    productId,
    score,
    // 점수가 낮을수록 미이용 기간도 짧게
    // 분석 대상은 최근 2개월 이용 고객이라 미이용은 60일 미만으로 둔다
    idleDays: Math.min(
      MAX_IDLE_DAYS,
      Math.max(1, Math.round(score * 0.6) + ((n * 13) % 15) - 7),
    ),
    reason: CHURN_REASONS[REASON_CYCLE[n % REASON_CYCLE.length]],
    lastContact: CONTACTS[n % CONTACTS.length],
  };
}

/**
 * 카드 상세의 "이탈 위험 회원 TOP3"가 비지 않도록 대표 회원이 부족한 상품마다
 * 이탈 위험 회원을 채우고, 위험도가 고르게 섞이도록 상품마다 중위험·저위험 회원도 더한다.
 */
function buildFillerMembers(): TargetMember[] {
  const fillers: TargetMember[] = [];
  const add = (productId: CardId, score: number) =>
    fillers.push(makeFillerMember(fillers.length, productId, score));

  CARD_PRODUCTS.forEach((card) => {
    const existing = SAMPLE_MEMBERS.filter(
      (member) => member.productId === card.id && member.score >= 40,
    ).length;
    for (let k = existing; k < MIN_RISK_MEMBERS_PER_CARD; k += 1) {
      // 카드 안에서 1위가 가장 높도록 순번이 뒤일수록 점수를 낮춘다
      add(card.id, 90 - k * 9 - ((fillers.length * 7) % 12));
    }
    add(card.id, 42 + ((fillers.length * 11) % 26)); // 중위험 40–69
    add(card.id, 8 + ((fillers.length * 13) % 30)); // 저위험 0–39
  });
  return fillers;
}

/** 회원 목록 (이탈 예측 점수 높은 순) */
export const TARGET_MEMBERS: TargetMember[] = [
  ...SAMPLE_MEMBERS,
  ...buildFillerMembers(),
].sort((a, b) => b.score - a.score);

/** 마스킹된 전화번호 (회원번호로 만든 데모 값) */
export function getMemberPhone(member: TargetMember) {
  return `010-****-${(parseInt(member.id.slice(2), 10) % 9000) + 1000}`;
}

export function findMember(memberId: string | undefined) {
  return TARGET_MEMBERS.find((member) => member.id === memberId);
}

export function findCardProduct(cardId: string | undefined) {
  return CARD_PRODUCTS.find((card) => card.id === cardId);
}

/** 회원 상세에서 카드 상세로 갈 때 넘기는 state (뒤로가기를 회원 상세로) */
export type CardDetailLinkState = {
  fromMemberId: string;
};
