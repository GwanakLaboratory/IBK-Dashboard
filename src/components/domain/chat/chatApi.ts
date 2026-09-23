import {
  monthlyMemberActivity,
  monthlyRiskDistribution,
} from '@/data/customers';

export type AskResult =
  | { ok: true; answer: string; ms: number }
  | { ok: false; reason: string; ms: number };

// `npm run dev`는 실제 LLM에 붙지 않아서, 위험도 표 렌더링을 로컬에서도
// 확인할 수 있도록 실제 대시보드 수치로 예시 답변을 만든다.
function buildDevRiskAnswer(): string {
  const latestActivity =
    monthlyMemberActivity[monthlyMemberActivity.length - 1];
  const latestDistribution =
    monthlyRiskDistribution[monthlyRiskDistribution.length - 1];
  const highCount = Math.round(
    (latestActivity.activeMembers * latestDistribution.high) / 100,
  );
  const midCount = Math.round(
    (latestActivity.activeMembers * latestDistribution.mid) / 100,
  );
  const lowCount = latestActivity.activeMembers - highCount - midCount;

  return [
    `현재 **위험** 등급 회원은 **${highCount.toLocaleString('ko-KR')}명**, 중위험은 **${midCount.toLocaleString(
      'ko-KR',
    )}명**으로, 전체 ${latestActivity.activeMembers.toLocaleString('ko-KR')}명 중 **${
      latestDistribution.high + latestDistribution.mid
    }%**가 이탈 위험 상태입니다.`,
    '',
    '| 구분 | 인원수 | 비율 |',
    '| --- | --- | --- |',
    `| 위험 | ${highCount.toLocaleString('ko-KR')}명 | ${latestDistribution.high}% |`,
    `| 중위험 | ${midCount.toLocaleString('ko-KR')}명 | ${latestDistribution.mid}% |`,
    `| 저위험 | ${lowCount.toLocaleString('ko-KR')}명 | ${latestDistribution.low}% |`,
  ].join('\n');
}

export async function fetchAskStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/ask-status');
    if (!res.ok) return false;
    const data = (await res.json()) as { enabled?: boolean };
    return Boolean(data.enabled);
  } catch {
    return false;
  }
}

export async function askQuestion(question: string): Promise<AskResult> {
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return (await res.json()) as AskResult;
  } catch {
    // `npm run dev`(Vite)는 api/ 서버리스 함수를 서빙하지 않아 항상 여기로
    // 떨어진다. dev 빌드에서만 UI 확인용 가짜 답변을 보여준다 — 프로덕션
    // 빌드에서는 이 분기가 죽은 코드로 제거된다.
    if (import.meta.env.DEV) {
      const answer = /위험/.test(question)
        ? buildDevRiskAnswer()
        : `(로컬 미리보기 — 실제 LLM 미연결)\n\n"${question}"에 대한 예시 답변입니다.`;
      return { ok: true, answer, ms: 0 };
    }
    return { ok: false, reason: '서버에 연결할 수 없습니다', ms: 0 };
  }
}
