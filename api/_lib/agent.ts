// 대시보드 안 질의응답 — 읽기 전용.
//
// 설계 원칙:
// 1. 숫자는 LLM이 만들지 않는다 — buildContext()가 원장을 표로 미리 계산해
//    프롬프트에 넣고, 모델은 그 표를 읽어 문장만 쓴다. RAG·tool-calling은
//    쓰지 않는다(검색 실패 모드를 새로 만들지 않기 위해).
// 2. 쓰기 경로가 없다 — 이 모듈은 조회만 한다.
// 3. 설정이 없으면 조용히 숨는다 — GLAB_LLM_URL 등이 비어 있으면
//    configured()가 false를 주고, 화면은 버튼 자체를 숨긴다(에러 노출 안 함).
//
// 모델은 OpenAI 호환 엔드포인트면 무엇이든 붙는다(vLLM·Ollama 등).
//
//   GLAB_LLM_URL      예: https://<gpu-host>/v1        (필수)
//   GLAB_LLM_MODEL    예: glab-fin-qwen3.5-27b         (필수)
//   GLAB_LLM_KEY      엔드포인트가 요구하면            (선택)
//   GLAB_LLM_TIMEOUT  초 단위, 기본 120                (선택)
//   GLAB_LLM_THINK    '1'이면 Qwen3 등의 thinking을 켠 채로 둠 (선택)
//
// 감사 로그(RoboAdvisor의 ra.agent_log에 해당)는 지금은 DB가 없어 남기지
// 않는다. console.log만 남기며, 실 DB가 붙으면 여기에 기록을 추가한다.
import { buildContext } from './buildContext';

const MAX_QUESTION_LENGTH = 500;
const MAX_TOKENS = 700;
const THINK_BLOCK = /<think>[\s\S]*?<\/think>\s*/gi;

const SYSTEM_PROMPT = `당신은 IBK 카드 이용 현황 대시보드의 안내자다.
아래 「현황 자료」만 근거로 한국어로 답한다.

지켜야 할 것
- 숫자는 반드시 현황 자료에 있는 값을 그대로 인용한다. 직접 계산하거나
  어림하지 않는다. 자료에 없는 값을 물으면 "그 값은 대시보드에 없습니다"라고
  말하고, 대신 무엇을 볼 수 있는지 알려 준다.
- 추측하지 않는다. 특히 "왜"를 물으면 자료가 보여 주는 사실까지만 말하고,
  원인을 지어내지 않는다. 자료로 설명되지 않으면 그렇다고 한다.
- 특정 회원 개인을 특정해 답하지 않는다. 이 화면은 세그먼트·상품 단위
  집계만 다룬다.
- 짧게 답한다. 인사말·사족은 붙이지 않는다.
- 이 자료는 프로토타입용 더미 데이터라는 점을 수치를 언급할 때 한 번은
  밝힌다.

형식
- 핵심 수치(인원수·비율 등)는 **굵게** 표시한다.
- 위험도별 인원 분포처럼 여러 항목을 비교하는 답변은 마크다운 표로 만든다.
  첫 번째 열에는 항목명, 이후 열에는 값을 넣는다. 예:
  | 구분 | 인원수 | 비율 |
  | --- | --- | --- |
  | 위험 | 36,077명 | 43% |
  | 중위험 | 17,619명 | 21% |
  | 저위험 | 30,204명 | 36% |`;

function timeoutMs(): number {
  const raw = Number(process.env.GLAB_LLM_TIMEOUT);
  return Number.isFinite(raw) && raw > 0 ? raw * 1000 : 120_000;
}

export function configured(): boolean {
  return Boolean(process.env.GLAB_LLM_URL && process.env.GLAB_LLM_MODEL);
}

/** GLAB_LLM_URL을 채팅 엔드포인트로 맞춘다. host / host/v1 / host/v1/chat/completions
 *  가 다 들어올 수 있어 전부 받는다. */
export function endpoint(): string {
  const url = (process.env.GLAB_LLM_URL ?? '').trim().replace(/\/+$/, '');
  if (!url) return '';
  if (url.endsWith('/chat/completions')) return url;
  if (url.endsWith('/v1')) return `${url}/chat/completions`;
  return `${url}/v1/chat/completions`;
}

/** Qwen3 계열은 사고 과정을 <think> 블록으로 뱉는다. 화면에 내보내지 않는다.
 *  닫는 태그 없이 잘린 경우(max_tokens 초과)는 여는 태그부터 끝까지가 통째로
 *  사고 과정이므로 답이 없는 것으로 본다. */
export function stripThink(text: string): string {
  let t = text.replace(THINK_BLOCK, '');
  if (t.includes('<think>')) t = t.split('<think>')[0];
  return t.trim();
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function explainError(e: unknown, url: string): string {
  if (e instanceof DOMException && e.name === 'AbortError') {
    return `${timeoutMs() / 1000}초 안에 답이 오지 않았습니다. 모델이 느리면 GLAB_LLM_TIMEOUT을 늘리세요.`;
  }
  if (e instanceof HttpError) {
    if (e.status === 401 || e.status === 403) {
      return '인증 거부 — GLAB_LLM_KEY를 확인하세요.';
    }
    if (e.status === 404) {
      return `엔드포인트를 찾지 못했습니다 (${url}). GLAB_LLM_URL이 /v1까지인지, 모델명이 맞는지 확인하세요.`;
    }
    return `모델 서버 오류 (HTTP ${e.status})`;
  }
  if (e instanceof TypeError) {
    return `모델 서버에 닿지 못했습니다 (${url}). 주소·방화벽을 확인하세요.`;
  }
  const message = e instanceof Error ? e.message : String(e);
  return message.slice(0, 300);
}

export type AskResult =
  | { ok: true; answer: string; ms: number }
  | { ok: false; reason: string; ms: number };

export async function ask(question: string): Promise<AskResult> {
  const q = (question ?? '').trim().slice(0, MAX_QUESTION_LENGTH);
  if (!q) {
    return { ok: false, reason: '질문이 비어 있습니다', ms: 0 };
  }
  if (!configured()) {
    return {
      ok: false,
      reason:
        'LLM 엔드포인트가 설정되지 않았습니다 (GLAB_LLM_URL · GLAB_LLM_MODEL)',
      ms: 0,
    };
  }

  const startedAt = Date.now();
  const context = buildContext();
  const url = endpoint();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (process.env.GLAB_LLM_KEY) {
    headers.Authorization = `Bearer ${process.env.GLAB_LLM_KEY}`;
  }

  const body: Record<string, unknown> = {
    model: process.env.GLAB_LLM_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `현황 자료\n${'='.repeat(60)}\n${context}\n${'='.repeat(60)}\n\n질문: ${q}`,
      },
    ],
    temperature: 0.2,
    max_tokens: MAX_TOKENS,
  };
  // Qwen3는 thinking이 기본이다. 표 하나 읽고 한 문장 쓰는 데 필요한 건
  // 추론이 아니라 옮겨 적기라 끈다. 모르는 템플릿이면 그냥 무시된다.
  if (process.env.GLAB_LLM_THINK !== '1') {
    body.chat_template_kwargs = { enable_thinking: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new HttpError(res.status, await res.text());
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer = stripThink(data.choices?.[0]?.message?.content ?? '');
    const ms = Date.now() - startedAt;
    if (!answer) {
      console.warn(
        '[chat] 빈 응답 — 사고 과정만 내고 답을 못 냈다(max_tokens 부족?)',
      );
      return {
        ok: false,
        reason: '빈 응답 — 사고 과정만 내고 답을 못 냈습니다(max_tokens 부족?)',
        ms,
      };
    }
    console.log(`[chat] ok ms=${ms} q="${q.slice(0, 60)}"`);
    return { ok: true, answer, ms };
  } catch (e) {
    const ms = Date.now() - startedAt;
    const reason = explainError(e, url);
    console.warn(`[chat] 실패 ms=${ms} reason="${reason}"`);
    return { ok: false, reason, ms };
  } finally {
    clearTimeout(timer);
  }
}
