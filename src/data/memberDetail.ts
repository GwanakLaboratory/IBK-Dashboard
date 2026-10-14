/* 회원 상세 화면 목데이터. 디자인 시안 Console 값을 회원 점수로 보정해 만든다. */
import {
  CHURN_REASONS,
  getMemberPhone,
  type TargetMember,
} from '@/data/target';

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
  store: string;
  category: string;
  min: number;
  max: number;
  method: string;
}[] = [
  {
    store: '스타벅스 강남R점',
    category: '카페',
    min: 4500,
    max: 7800,
    method: '일시불',
  },
  {
    store: '배달의민족',
    category: '배달',
    min: 18000,
    max: 32000,
    method: '일시불',
  },
  {
    store: 'GS25 역삼점',
    category: '편의점',
    min: 3000,
    max: 9000,
    method: '일시불',
  },
  {
    store: 'SK에너지 서초',
    category: '주유',
    min: 50000,
    max: 80000,
    method: '일시불',
  },
  {
    store: '쿠팡',
    category: '온라인쇼핑',
    min: 25000,
    max: 90000,
    method: '3개월 할부',
  },
  {
    store: '이마트 성수점',
    category: '마트',
    min: 40000,
    max: 120000,
    method: '일시불',
  },
];

export const MEMBER_CATEGORIES = [
  { label: '카페', share: 38 },
  { label: '배달', share: 24 },
  { label: '편의점', share: 15 },
  { label: '주유', share: 13 },
  { label: '온라인쇼핑', share: 10 },
];

export type MemberTile = {
  label: string;
  value: string;
  sub?: string;
  /** 보조 문구를 경고색으로 */
  warn?: boolean;
};

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
  store: string;
  category: string;
  amount: number;
  method: string;
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
    amount: `${payment.amount.toLocaleString('ko-KR')}원`,
    method: payment.method,
  }));
}

export function monthLabel(month: string) {
  return `${Number(month.slice(3))}월`;
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
  const tiles: MemberTile[] = [
    { label: '전화번호', value: getMemberPhone(member) },
    { label: '성별 · 나이', value: `${member.gender} · ${member.ageGroup}` },
    {
      label: '가입일',
      value: `${member.joinedAt.replace('.', '-')}-${joinDay}`,
      sub: `거래 ${2026 - parseInt(member.joinedAt, 10)}년차`,
    },
    {
      label: '최근 이용일',
      value: `${lastUse.getFullYear()}-${pad(lastUse.getMonth() + 1)}-${pad(lastUse.getDate())}`,
      // 한 달 넘게 안 쓴 경우만 "미이용"으로 경고한다
      sub:
        member.idleDays >= 30
          ? `${member.idleDays}일째 미이용`
          : `${member.idleDays}일 전 이용`,
      warn: member.idleDays >= 30,
    },
    {
      label: '신용점수',
      value: `${credit[11]}점`,
      sub: `3개월 전 대비 ${creditDiff > 0 ? '+' : ''}${creditDiff}점`,
      warn: creditDiff < 0,
    },
    // 기준 월(9월) 결제가 없으면 금액 대신 미이용임을 알려 준다
    usage[11] === 0
      ? {
          label: '9월 사용액',
          value: '0원',
          sub: '9월 결제 없음',
          warn: true,
        }
      : {
          label: '9월 사용액',
          value: `${usage[11]}만 원`,
          sub: `월평균 대비 ${Math.round((usage[11] / usageAvg - 1) * 100)}%`,
          warn: usage[11] < usageAvg,
        },
  ];

  return {
    churn,
    usage,
    credit,
    tiles,
    // 화면에 "3개월 전 ○점"과 함께 보여주므로 증감도 3개월 전 대비로 계산한다
    scoreDelta: churn[11] - churn[8],
    prev3: churn[8],
    aiText:
      drop > 30
        ? `최근 3개월 이용금액이 ${drop}% 줄었어요. 자주 쓰던 카페·배달 업종 10% 청구할인을 앱 푸시로 안내하면 반응 가능성이 가장 높아요.`
        : '이용 패턴이 안정적이에요. 다음 달 연회비 청구 전에 혜택 사용 내역을 알림톡으로 안내하는 정도면 충분해요.',
    // 회원 본인의 주요 사유를 1위로, 나머지는 전체 회원 수가 많은 순서로 둔다
    reasons: [
      member.reason,
      ...CHURN_REASONS.filter((r) => r !== member.reason),
    ]
      .slice(0, 5)
      .map((label, index) => ({
        label,
        score: Math.max(4, Math.round(member.score * (1 - index * 0.2))),
      })),
    payments: buildPayments(
      lastUse,
      usage,
      parseInt(member.id.slice(2), 10) % 7,
    ),
  };
}
