// 대시보드 원장을 사람이 읽을 수 있는 표로 미리 계산한다. LLM은 이 표를
// 근거로 문장만 쓰고, 숫자는 직접 계산하지 않는다.
//
// 지금은 실 DB가 없어 프런트와 동일한 더미 데이터(src/data/dummy.ts)를
// 그대로 읽는다. 실 DB가 붙으면 이 함수만 그쪽을 읽도록 바꾸면 된다.
//
// customers(개인별 이름·전화번호·거래내역)는 의도적으로 포함하지 않는다 —
// 지금은 가짜값이지만 나중에 실 회원 데이터로 바뀌었을 때도 PII가 프롬프트에
// 실리지 않도록, 처음부터 세그먼트 단위 집계만 넘긴다.
import {
  ageGroupChurnStats,
  genderChurnStats,
  ibkCreditCards,
  memberCohortChurnStats,
  monthlyMemberActivity,
  monthlyRiskDistribution,
  monthlyTotalUsage,
  monthlyTransactionCount,
  productUsageStats,
} from '../../src/data/dummy';

function n(value: number): string {
  return value.toLocaleString('ko-KR');
}

function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function buildContext(): string {
  const lines: string[] = [];
  const latestMonth = monthlyTotalUsage[monthlyTotalUsage.length - 1]?.month;

  lines.push(
    `기준월 ${latestMonth} · 최근 ${monthlyTotalUsage.length}개월 집계`,
  );
  lines.push(
    '(이 자료는 프로토타입용 더미 데이터이며 실제 회원 정보가 아닙니다)',
  );

  lines.push('');
  lines.push('[월별 총 이용액(만원) / 거래건수]');
  monthlyTotalUsage.forEach((point, i) => {
    const count = monthlyTransactionCount[i]?.count;
    lines.push(
      `  ${point.month}  이용액 ${n(point.usage)}  거래건수 ${
        count != null ? n(count) : '—'
      }`,
    );
  });

  lines.push('');
  lines.push('[위험도 분포 추이] 활동 회원 중 비율(%) — 고위험/중위험/저위험');
  monthlyRiskDistribution.forEach((point) => {
    lines.push(
      `  ${point.month}  고${point.high}% 중${point.mid}% 저${point.low}%`,
    );
  });

  const latestActiveMembers =
    monthlyMemberActivity[monthlyMemberActivity.length - 1]?.activeMembers ?? 0;
  const latestDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
  if (latestDistribution) {
    const highCount = Math.round(
      (latestActiveMembers * latestDistribution.high) / 100,
    );
    const midCount = Math.round(
      (latestActiveMembers * latestDistribution.mid) / 100,
    );
    const lowCount = latestActiveMembers - highCount - midCount;

    lines.push('');
    lines.push(
      `[현재 위험도별 인원 현황] ${latestDistribution.month} 기준, 활동 회원 ${n(
        latestActiveMembers,
      )}명 중`,
    );
    lines.push(
      `  위험 ${n(highCount)}명(${pct(latestDistribution.high, 0)})  ` +
        `중위험 ${n(midCount)}명(${pct(latestDistribution.mid, 0)})  ` +
        `저위험 ${n(lowCount)}명(${pct(latestDistribution.low, 0)})`,
    );
  }

  lines.push('');
  lines.push('[회원 활동 추이] 활동회원 / 신규가입 / 해지 (명)');
  monthlyMemberActivity.forEach((point) => {
    lines.push(
      `  ${point.month}  활동 ${n(point.activeMembers)}  신규가입 ${n(
        point.newSignups,
      )}  해지 ${n(point.canceledMembers)}${point.predicted ? ' (예측치)' : ''}`,
    );
  });

  lines.push('');
  lines.push('[회원 세그먼트별 이탈률] 가입/해지 회원 수 · 이탈률');
  [
    ...memberCohortChurnStats,
    ...ageGroupChurnStats,
    ...genderChurnStats,
  ].forEach((stat) => {
    lines.push(
      `  ${stat.label}: 가입 ${n(stat.issuedCount)}명 · 해지 ${n(
        stat.canceledCount,
      )}명 · 이탈률 ${pct(stat.churnRate)}`,
    );
  });

  lines.push('');
  lines.push(
    `[카드 상품별 이용 현황] 전체 ${ibkCreditCards.length}종 · 이탈률 높은 순`,
  );
  [...productUsageStats]
    .sort((a, b) => b.churnRate - a.churnRate)
    .forEach((stat) => {
      lines.push(
        `  ${stat.productName}: 발급 ${n(stat.issuedCount)} · 이용 ${n(
          stat.activeCount,
        )} · 해지 ${n(stat.canceledCount)} · 이탈률 ${pct(stat.churnRate)} · ` +
          `고위험 ${n(stat.highRiskCount)}명`,
      );
    });

  return lines.join('\n');
}
