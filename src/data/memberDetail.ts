/*
 * 회원 상세 화면 목데이터. 디자인 시안 Console 값을 회원 점수로 보정해 만든다.
 * 문구 대신 숫자 · 코드값을 돌려주고, 화면에서 memberDetail.* 키로 현재 언어 문구를 만든다.
 */
import {
  CHURN_REASONS,
  getMemberPhone,
  type TargetMember,
} from '@/data/target';
import type ko from '@/i18n/locales/ko.json';

type KoMemberDetail = (typeof ko)['memberDetail'];
/** 업종 코드. 화면 표시는 memberDetail.category.<코드> */
export type SpendingCategory = keyof KoMemberDetail['category'];
/** 가맹점 코드. 화면 표시는 memberDetail.payments.store.<코드> */
export type StoreId = keyof KoMemberDetail['payments']['store'];
/** 결제 방식 코드. 화면 표시는 memberDetail.payments.method.<코드> */
export type PaymentMethod = keyof KoMemberDetail['payments']['method'];

export const MEMBER_MONTHS = [
  '25.10',
  '25.11',
  '25.12',
  '26.01',
  '26.02',
  '26.03',
  '26.04',
  '26.05',
  '26.06',
  '26.07',
  '26.08',
  '26.09',
];

const CHURN_BASE = [41, 43, 45, 48, 52, 57, 63, 70, 77, 83, 88, 92];
// 점수가 높을수록 이 곡선을 따라 서서히 줄어든다 (만 원)
const USAGE_BASE = [62, 60, 63, 61, 59, 56, 52, 47, 41, 35, 28, 20];
const CREDIT_BASE = [
  742, 740, 738, 735, 731, 726, 720, 712, 704, 695, 684, 671,
];

/** 결제 가게와 한 건 금액 범위 (원) */
const STORES: {
  store: StoreId;
  category: SpendingCategory;
  min: number;
  max: number;
  method: PaymentMethod;
}[] = [
  {
    store: 'starbucksGangnam',
    category: 'cafe',
    min: 4500,
    max: 7800,
    method: 'lumpSum',
  },
  {
    store: 'baemin',
    category: 'delivery',
    min: 18000,
    max: 32000,
    method: 'lumpSum',
  },
  {
    store: 'gs25Yeoksam',
    category: 'convenienceStore',
    min: 3000,
    max: 9000,
    method: 'lumpSum',
  },
  {
    store: 'skEnergySeocho',
    category: 'fuel',
    min: 50000,
    max: 80000,
    method: 'lumpSum',
  },
  {
    store: 'coupang',
    category: 'onlineShopping',
    min: 25000,
    max: 90000,
    method: 'installment3m',
  },
  {
    store: 'emartSeongsu',
    category: 'mart',
    min: 40000,
    max: 120000,
    method: 'lumpSum',
  },
];

export const MEMBER_CATEGORIES: {
  category: SpendingCategory;
  share: number;
}[] = [
  { category: 'cafe', share: 38 },
  { category: 'delivery', share: 24 },
  { category: 'convenienceStore', share: 15 },
  { category: 'fuel', share: 13 },
  { category: 'onlineShopping', share: 10 },
];

/** 기준 월 ('YY.MM'). 사용액 타일의 '9월 사용액' 등에 쓴다 */
export const MEMBER_BASE_MONTH = MEMBER_MONTHS[MEMBER_MONTHS.length - 1];

/** 회원 정보 타일에 보여줄 값 (문구는 화면에서 만든다) */
export type MemberProfile = {
  phone: string;
  gender: TargetMember['gender'];
  ageGroup: TargetMember['ageGroup'];
  /** 'YYYY-MM-DD' */
  joinedDate: string;
  /** 거래 n년차 */
  tenureYears: number;
  /** 'YYYY-MM-DD' */
  lastUseDate: string;
  idleDays: number;
  creditScore: number;
  /** 3개월 전 대비 신용점수 증감 */
  creditDiff: number;
  /** 기준 월 사용액 (만 원) */
  monthUsage: number;
  /** 월평균 대비 % (사용액이 0이면 쓰지 않는다) */
  monthUsageVsAverage: number;
  /** 기준 월 사용액이 월평균보다 적은지 */
  monthUsageBelowAverage: boolean;
};

/** AI 추천 대응 문구 종류. 화면 표시는 memberDetail.aiAction.<type> */
export type AiAction = { type: 'usageDrop'; drop: number } | { type: 'stable' };

const pad = (value: number) => String(value).padStart(2, '0');

/** 기준일(2026-09-30)에서 days 일 전 */
function daysAgo(days: number) {
  const date = new Date(2026, 8, 30);
  date.setDate(date.getDate() - days);
  return date;
}

/** 사용액 배열(2025년 10월 = 0 ~ 2026년 9월 = 11)에서 이 날짜의 달 위치 */
function usageMonthIndex(date: Date) {
  return 11 - ((2026 - date.getFullYear()) * 12 + (8 - date.getMonth()));
}

type Payment = {
  date: Date;
  store: StoreId;
  category: SpendingCategory;
  amount: number;
  method: PaymentMethod;
};

/**
 * 한 달 결제를 lastDay 부터 거꾸로 만든다. 건마다 가게 금액 범위 안에서 정하고,
 * 모두 더하면 그 달 사용액(total)이 되도록 마지막 건은 남은 금액에 맞는 가게로 채운다.
 */
function buildMonthPayments(
  total: number,
  year: number,
  month: number,
  lastDay: number,
  seed: number,
) {
  const payments: Payment[] = [];
  let remaining = total;
  let day = lastDay;
  for (let i = seed; remaining > 0 && payments.length < 40; i += 1) {
    const store = STORES[(i * 5) % STORES.length];
    const typical =
      Math.round(
        (store.min + (((i * 37) % 100) / 100) * (store.max - store.min)) / 100,
      ) * 100;
    // 남은 금액이 이 가게 금액보다 작으면 남은 금액에 맞는 가게로 마무리한다
    const fit =
      typical >= remaining
        ? (STORES.find(
            (item) => item.min <= remaining && remaining <= item.max,
          ) ?? STORES[2])
        : store;
    const amount = typical >= remaining ? remaining : typical;
    payments.push({
      date: new Date(year, month, day),
      store: fit.store,
      category: fit.category,
      amount,
      method: fit.method,
    });
    remaining -= amount;
    // 하루에 한두 건씩
    if (i % 2 === 1) day = Math.max(1, day - 1);
  }
  return payments;
}

/** 최근 결제 5건. 결제는 마지막 이용일부터 거꾸로, 달마다 그 달 사용액만큼 만든다. */
function buildPayments(lastUse: Date, usage: number[], seed: number) {
  const payments: Payment[] = [];
  let date = lastUse;
  let lastDay = lastUse.getDate();
  while (payments.length < 5 && usageMonthIndex(date) >= 0) {
    const total = (usage[usageMonthIndex(date)] ?? 0) * 10000;
    payments.push(
      ...buildMonthPayments(
        total,
        date.getFullYear(),
        date.getMonth(),
        lastDay,
        seed + payments.length,
      ),
    );
    // 이전 달 말일부터 이어서
    date = new Date(date.getFullYear(), date.getMonth(), 0);
    lastDay = date.getDate();
  }
  return payments.slice(0, 5).map((payment) => ({
    date: `${pad(payment.date.getMonth() + 1)}.${pad(payment.date.getDate())}`,
    store: payment.store,
    category: payment.category,
    /** 원 */
    amount: payment.amount,
    method: payment.method,
  }));
}

export function getMemberDetail(member: TargetMember) {
  const ratio = member.score / 92;
  const churn = CHURN_BASE.map((v) => Math.max(5, Math.round(v * ratio)));
  const lastUse = daysAgo(member.idleDays);
  // 사용액은 2025년 10월 ~ 2026년 9월. 마지막 이용일 이후 달은 결제가 없으니 0원,
  // 마지막 이용 달은 그 달에 쓴 날만큼만 (최소 절반)
  const lastUseMonthIndex = usageMonthIndex(lastUse);
  const usedRatio =
    lastUse.getDate() /
    new Date(lastUse.getFullYear(), lastUse.getMonth() + 1, 0).getDate();
  const usage = USAGE_BASE.map((v, index) => {
    if (index > lastUseMonthIndex) return 0;
    const full = v * ratio + (1 - ratio) * 78;
    return index === lastUseMonthIndex
      ? // 그 달 초에 멈춘 회원도 그래프가 한 번에 꺾이지 않도록 최소 절반은 반영한다
        Math.max(1, Math.round(full * Math.max(usedRatio, 0.5)))
      : Math.round(full);
  });
  const credit = CREDIT_BASE.map((v) => v + (92 - member.score));
  const drop = Math.round(
    (1 -
      (usage[9] + usage[10] + usage[11]) / (usage[0] + usage[1] + usage[2])) *
      100,
  );
  const joinDay = pad((parseInt(member.id.slice(-2), 10) % 28) + 1);
  const usageAvg = usage.reduce((a, b) => a + b, 0) / usage.length;
  const creditDiff = credit[11] - credit[8];
  const profile: MemberProfile = {
    phone: getMemberPhone(member),
    gender: member.gender,
    ageGroup: member.ageGroup,
    joinedDate: `${member.joinedAt.replace('.', '-')}-${joinDay}`,
    tenureYears: 2026 - parseInt(member.joinedAt, 10),
    lastUseDate: `${lastUse.getFullYear()}-${pad(lastUse.getMonth() + 1)}-${pad(lastUse.getDate())}`,
    idleDays: member.idleDays,
    creditScore: credit[11],
    creditDiff,
    monthUsage: usage[11],
    monthUsageVsAverage: Math.round((usage[11] / usageAvg - 1) * 100),
    monthUsageBelowAverage: usage[11] < usageAvg,
  };
  const aiAction: AiAction =
    drop > 30 ? { type: 'usageDrop', drop } : { type: 'stable' };

  return {
    churn,
    usage,
    credit,
    profile,
    // 화면에 "3개월 전 ○점"과 함께 보여주므로 증감도 3개월 전 대비로 계산한다
    scoreDelta: churn[11] - churn[8],
    prev3: churn[8],
    aiAction,
    // 회원 본인의 주요 사유를 1위로, 나머지는 전체 회원 수가 많은 순서로 둔다
    reasons: [
      member.reason,
      ...CHURN_REASONS.filter((r) => r !== member.reason),
    ]
      .slice(0, 5)
      .map((reason, index) => ({
        reason,
        score: Math.max(4, Math.round(member.score * (1 - index * 0.2))),
      })),
    payments: buildPayments(
      lastUse,
      usage,
      parseInt(member.id.slice(2), 10) % 7,
    ),
  };
}
