import { ibkCreditCardInfos } from '@/data/ibkCreditCardInfo';

/* 위험 타겟 화면 공통 목데이터 (회원 · 카드 상품). 회원은 시안 값, 카드는 IBK 실제 상품 기준. */

export type TargetMember = {
  id: string;
  name: string;
  gender: '남' | '여';
  ageGroup: string;
  joinedAt: string;
  product: string;
  /** 이탈 예측 점수 0–100 */
  score: number;
  /** 미이용 일수 */
  idleDays: number;
  reason: string;
  /** 최근 접촉 (없으면 빈 문자열) */
  lastContact: string;
};

/** 위험도별 전체 회원 수 (목록 상단 카드) */
export const MEMBER_COUNT_BY_LEVEL = {
  all: 84620,
  high: 18950,
  medium: 18452,
  low: 47218,
};

/** 시안에 있던 대표 회원 10명 */
const SAMPLE_MEMBERS: TargetMember[] = [
  {
    id: 'C-204817',
    name: '김*현',
    gender: '여',
    ageGroup: '30대',
    joinedAt: '2019.04',
    product: '해피메이트 IBK카드',
    score: 92,
    idleDays: 74,
    reason: '최근 3개월 이용금액 급감',
    lastContact: '',
  },
  {
    id: 'C-118302',
    name: '이*준',
    gender: '남',
    ageGroup: '40대',
    joinedAt: '2017.11',
    product: 'K-패스(신용)',
    score: 88,
    idleDays: 61,
    reason: '타사 카드 결제 전환 추정',
    lastContact: '09.18 앱 푸시',
  },
  {
    id: 'C-330915',
    name: '박*영',
    gender: '여',
    ageGroup: '20대',
    joinedAt: '2023.02',
    product: 'IBK포인트(신용)',
    score: 81,
    idleDays: 45,
    reason: '이용 가맹점 수 감소',
    lastContact: '',
  },
  {
    id: 'C-097266',
    name: '최*호',
    gender: '남',
    ageGroup: '50대',
    joinedAt: '2015.06',
    product: '해피메이트 IBK카드',
    score: 76,
    idleDays: 38,
    reason: '혜택 이용률 저하',
    lastContact: '09.10 알림톡',
  },
  {
    id: 'C-452190',
    name: '정*은',
    gender: '여',
    ageGroup: '30대',
    joinedAt: '2020.09',
    product: 'I-PET',
    score: 71,
    idleDays: 33,
    reason: '연회비 청구 임박',
    lastContact: '09.10 알림톡',
  },
  {
    id: 'C-261734',
    name: '강*민',
    gender: '남',
    ageGroup: '40대',
    joinedAt: '2018.03',
    product: 'IBK포인트(신용)',
    score: 64,
    idleDays: 21,
    reason: '한도 사용률 하락',
    lastContact: '',
  },
  {
    id: 'C-389051',
    name: '조*아',
    gender: '여',
    ageGroup: '20대',
    joinedAt: '2025.12',
    product: 'IBK KaPick',
    score: 57,
    idleDays: 17,
    reason: '앱 접속 빈도 감소',
    lastContact: '09.24 앱 푸시',
  },
  {
    id: 'C-173648',
    name: '윤*석',
    gender: '남',
    ageGroup: '60대',
    joinedAt: '2012.08',
    product: 'K-패스(신용)',
    score: 48,
    idleDays: 12,
    reason: '해외 이용 중단',
    lastContact: '09.02 이메일',
  },
  {
    id: 'C-506427',
    name: '장*희',
    gender: '여',
    ageGroup: '30대',
    joinedAt: '2021.05',
    product: '해피메이트 IBK카드',
    score: 31,
    idleDays: 5,
    reason: '리볼빙 해지',
    lastContact: '',
  },
  {
    id: 'C-044819',
    name: '임*우',
    gender: '남',
    ageGroup: '50대',
    joinedAt: '2016.01',
    product: 'I-PET',
    score: 18,
    idleDays: 2,
    reason: '자동이체 해지',
    lastContact: '',
  },
];

export const CHURN_REASONS = [
  '최근 3개월 이용금액 급감',
  '타사 카드 결제 전환 추정',
  '이용 가맹점 수 감소',
  '혜택 이용률 저하',
  '연회비 청구 임박',
  '한도 사용률 하락',
];

export type CardProduct = {
  name: string;
  summary: string;
  tags: string[];
  brands: string[];
  /** 화면 표시용 브랜드 (예: 'BC · VISA') */
  brand: string;
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
    name: info.name,
    summary: info.summary,
    tags: info.benefitCategories,
    brands: info.brands,
    brand: info.brands.join(' · '),
    members: 30000 + ((index * 7919) % 23) * 8000 + ((index * 131) % 9) * 1000,
    churnRate: +(1.2 + ((index * 37) % 25) / 10).toFixed(1),
    churnRateDelta: +((((index * 13) % 9) - 3) / 10).toFixed(1),
    highShare: +(4 + ((index * 29) % 9) + ((index * 7) % 10) / 10).toFixed(1),
    mediumShare: +(10 + ((index * 11) % 12) + ((index * 3) % 10) / 10).toFixed(
      1,
    ),
  }),
);

const SURNAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '오',
  '서',
  '신',
  '권',
  '황',
  '안',
  '송',
  '류',
  '홍',
];
const NAME_ENDINGS = [
  '민',
  '서',
  '준',
  '윤',
  '현',
  '진',
  '우',
  '아',
  '희',
  '호',
  '영',
  '은',
  '수',
  '연',
];
const AGE_GROUPS = ['20대', '30대', '40대', '50대', '60대'];
const CONTACTS = [
  '',
  '09.18 앱 푸시',
  '09.10 알림톡',
  '',
  '09.24 문자',
  '09.02 이메일',
];

/** 모든 카드 상품에 이탈 위험(40점 이상) 회원이 최소 몇 명씩 있게 할지 */
const MIN_RISK_MEMBERS_PER_CARD = 3;

/**
 * 카드 상세의 "이탈 위험 회원 TOP3"가 비지 않도록, 대표 회원이 부족한 상품마다
 * 이탈 위험 회원을 채운다. 값은 순번으로 정해지는 고정값(새로고침해도 같음).
 */
function buildFillerMembers(): TargetMember[] {
  const fillers: TargetMember[] = [];
  CARD_PRODUCTS.forEach((card) => {
    const existing = SAMPLE_MEMBERS.filter(
      (member) => member.product === card.name && member.score >= 40,
    ).length;
    for (let k = existing; k < MIN_RISK_MEMBERS_PER_CARD; k += 1) {
      const n = fillers.length;
      fillers.push({
        id: `C-${String(600000 + n * 7919).padStart(6, '0')}`,
        name: `${SURNAMES[(n * 7) % SURNAMES.length]}*${NAME_ENDINGS[(n * 5) % NAME_ENDINGS.length]}`,
        gender: n % 2 === 0 ? '여' : '남',
        ageGroup: AGE_GROUPS[(n * 3) % AGE_GROUPS.length],
        joinedAt: `20${15 + (n % 11)}.${String(1 + ((n * 5) % 12)).padStart(2, '0')}`,
        product: card.name,
        // 카드 안에서 1위가 가장 높도록 순번이 뒤일수록 점수를 낮춘다
        score: 90 - k * 9 - ((n * 7) % 12),
        idleDays: 12 + ((n * 13) % 63),
        reason: CHURN_REASONS[n % CHURN_REASONS.length],
        lastContact: CONTACTS[n % CONTACTS.length],
      });
    }
  });
  return fillers;
}

/** 이탈 위험 회원 목록 (이탈 예측 점수 높은 순) */
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

export function findCardProduct(cardName: string | undefined) {
  return CARD_PRODUCTS.find((card) => card.name === cardName);
}

/** 타겟 발송 화면으로 회원을 넘길 때 쓰는 navigate state */
export type SendNavigationState = {
  pickedMemberIds: string[];
  /** 대상 이름 (생략하면 고른 회원 이름으로 만든다) */
  sourceLabel?: string;
  /** 추천 문구 테마 (예: 'cashback') */
  theme?: string;
  /** 업종 캐시백 문구에 넣을 업종 */
  category?: string;
};

/** 회원 상세에서 카드 상세로 갈 때 넘기는 state (뒤로가기를 회원 상세로) */
export type CardDetailLinkState = {
  fromMemberId: string;
};
