import { useQuery } from '@tanstack/react-query';
import { ChevronRight, RotateCcw, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { askQuestion, fetchAskStatus } from '@/components/domain/chat/chatApi';
import { ChatMessageContent } from '@/components/domain/chat/ChatMessageContent';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
};

const GREETING =
  '안녕하세요! 카드 회원 이탈 예측 데이터에 대해 궁금한 점을 물어보세요.\n\n이용 현황, 위험도 분포, 이탈 이유 등을 바로 확인해드릴게요.';

const QUICK_REPLIES = [
  '이번 달 이탈률 얼마야?',
  '위험 회원 비율 얼마야?',
  '이탈 이유 TOP 3',
  '전체 현황 요약해줘',
];

// 요청이 오래 걸릴 때 사용자가 멈춘 줄 알지 않도록, 경과 시간에 맞춰
// 안내 문구만 바꿔 보여준다. 실제 진행 단계를 서버가 알려주는 건 아니다.
const PROGRESS_STAGES = [
  '질문을 확인하고 있어요',
  '현황 자료를 조회하고 있어요',
  '답변을 작성하고 있어요',
];

// 답변이 위험도 관련 내용을 다루면, 대시보드에서 직접 확인할 수 있도록
// 바로가기 링크를 붙인다.
function mentionsRiskBreakdown(text: string): boolean {
  return /위험도|중위험|저위험/.test(text);
}

export function ChatLauncher() {
  // 설정이 없으면 화면은 그대로 두고 버튼만 숨긴다 — 에러를 노출하지 않는다.
  const { data: enabled } = useQuery({
    queryKey: ['ask-status'],
    queryFn: fetchAskStatus,
    refetchInterval: 60_000,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [stage, setStage] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, isAsking]);

  useEffect(() => {
    if (!isAsking) {
      setStage(0);
      return;
    }
    const timers = [
      setTimeout(() => setStage(1), 2000),
      setTimeout(() => setStage(2), 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isAsking]);

  // `npm run dev`(Vite)는 api/ask-status를 서빙하지 않아 항상 false로
  // 떨어진다. dev 빌드에서는 UI 확인을 위해 버튼을 계속 보여준다 —
  // 프로덕션 빌드에서는 이 분기가 죽은 코드로 제거되고 enabled만 따른다.
  if (!enabled && !import.meta.env.DEV) return null;

  async function send(q: string) {
    if (!q || isAsking) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text: q },
    ]);
    setQuestion('');
    setIsAsking(true);

    const result = await askQuestion(q);
    setMessages((prev) => [
      ...prev,
      result.ok
        ? { id: nextId.current++, role: 'assistant', text: result.answer }
        : {
            id: nextId.current++,
            role: 'assistant',
            text: result.reason,
            isError: true,
          },
    ]);
    setIsAsking(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(question.trim());
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-7 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]">
          <header className="flex items-center justify-between rounded-t-2xl bg-[#fafbff] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-700 to-indigo-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-900">
                  AI 어시스턴트
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      enabled ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-[11px] text-gray-400">
                    {enabled ? '온라인' : '오프라인'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMessages([])}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-gray-400 hover:bg-gray-50"
              aria-label="대화 초기화"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </header>

          <div
            ref={listRef}
            className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-3.5 pt-3.5"
          >
            <div className="max-w-[80%] whitespace-pre-line rounded-bl-md rounded-br-2xl rounded-tl-2xl rounded-tr-2xl bg-gray-100 px-3 py-2.5 text-[13px] leading-5 text-gray-700">
              {GREETING}
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => void send(reply)}
                  disabled={isAsking}
                  className="w-fit min-w-0 max-w-full justify-self-start rounded-full border border-gray-300 bg-white px-2.5 py-1 text-center text-[11px] font-medium text-gray-700 hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>

            {messages.map((message) => {
              const isAssistantAnswer =
                message.role === 'assistant' && !message.isError;

              return (
                <div
                  key={message.id}
                  className={`max-w-[85%] space-y-1.5 ${
                    message.role === 'user' ? 'ml-auto w-fit' : ''
                  }`}
                >
                  <div
                    className={`px-3 py-2.5 text-[13px] ${
                      message.role === 'user'
                        ? 'rounded-bl-[14px] rounded-br-[4px] rounded-tl-[14px] rounded-tr-[14px] bg-blue-700 text-white'
                        : message.isError
                          ? 'rounded-bl-[4px] rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-red-50 text-red-600'
                          : 'rounded-bl-[4px] rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isAssistantAnswer ? (
                      <ChatMessageContent text={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                  {isAssistantAnswer && mentionsRiskBreakdown(message.text) && (
                    <Link
                      to="/dashboard/trend"
                      state={{ tab: 'churn' }}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-full bg-gray-100 px-3 py-2 text-[12px] font-medium text-gray-700 hover:bg-gray-200"
                    >
                      위험도 현황 보기
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
            {isAsking && (
              <div className="max-w-[85%] rounded-bl-[4px] rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-gray-100 px-3 py-2.5 text-[13px] text-gray-500">
                {PROGRESS_STAGES[stage]}...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3">
            <div className="flex h-11 items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-3.5 pr-1.5">
              <input
                onChange={(event) => setQuestion(event.target.value)}
                value={question}
                disabled={isAsking}
                placeholder="궁금한 점을 물어보세요..."
                className="h-full flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400 transition-colors enabled:bg-blue-700 enabled:text-white"
                aria-label="전송"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        title="AI 어시스턴트"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-7 right-7 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-700 text-white shadow-[0_4px_20px_rgba(29,78,216,0.45)] transition-transform hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </>
  );
}
