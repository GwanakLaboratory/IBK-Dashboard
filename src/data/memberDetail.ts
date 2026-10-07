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
const USAGE_BASE = [82, 79, 85, 80, 76, 71, 64, 52, 41, 30, 18, 9];
const CREDIT_BASE = [
  742, 740, 738, 735, 731, 726, 720, 712, 704, 695, 684, 671,
];

const PAYMENTS: [string, string, number, string][] = [
  ['스타벅스 강남R점', '카페', 6800, '일시불'],
  ['배달의민족', '배달', 23500, '일시불'],
  ['GS25 역삼점', '편의점', 4200, '일시불'],
  ['SK에너지 서초', '주유', 62000, '일시불'],
  ['쿠팡', '온라인쇼핑', 48900, '3개월 할부'],
];
const PAYMENT_GAP_DAYS = [0, 4, 9, 15, 22];

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

export function monthLabel(month: string) {
  return `${Number(month.slice(3))}월`;
}

export function getMemberDetail(member: TargetMember) {
  const ratio = member.score / 92;
  const churn = CHURN_BASE.map((v) => Math.max(5, Math.round(v * ratio)));
  const usage = USAGE_BASE.map((v) => Math.round(v * ratio + (1 - ratio) * 78));
  const credit = CREDIT_BASE.map((v) => v + (92 - member.score));
  const drop = Math.round(
    (1 -
      (usage[9] + usage[10] + usage[11]) / (usage[0] + usage[1] + usage[2])) *
      100,
  );
  const lastUse = daysAgo(member.idleDays);
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
      sub: `${member.idleDays}일째 미이용`,
      warn: member.idleDays >= 30,
    },
    {
      label: '신용점수',
      value: `${credit[11]}점`,
      sub: `3개월 전 대비 ${creditDiff > 0 ? '+' : ''}${creditDiff}점`,
      warn: creditDiff < 0,
    },
    {
      label: '이번 달 사용액',
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
    scoreDelta: churn[11] - churn[10],
    prev3: churn[8],
    aiText:
      drop > 30
        ? `최근 3개월 이용금액이 ${drop}% 줄었어요. 자주 쓰던 카페·배달 업종 10% 청구할인을 앱 푸시로 안내하면 반응 가능성이 가장 높아요.`
        : '이용 패턴이 안정적이에요. 다음 달 연회비 청구 전에 혜택 사용 내역을 알림톡으로 안내하는 정도면 충분해요.',
    reasons: [
      member.reason,
      ...CHURN_REASONS.filter((r) => r !== member.reason),
    ]
      .slice(0, 5)
      .map((label, index) => ({
        label,
        score: Math.max(4, Math.round(member.score * (1 - index * 0.2))),
      })),
    payments: PAYMENTS.map(([store, category, amount, method], index) => {
      const date = daysAgo(member.idleDays + PAYMENT_GAP_DAYS[index]);
      return {
        date: `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`,
        store,
        category,
        amount: `${amount.toLocaleString('ko-KR')}원`,
        method,
      };
    }),
  };
}
