import {
  Check,
  ChevronRight,
  Loader2,
  Maximize2,
  MessageCircleMore,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ChatMessageContent } from '@/components/domain/chat/ChatMessageContent';
import {
  getDemoAnswer,
  type DemoAnswer,
} from '@/components/domain/chat/demoAnswers';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  link?: DemoAnswer['link'];
  isError?: boolean;
};

const GREETING =
  '안녕하세요! 카드 회원 이탈 예측 데이터에 대해 궁금한 점을 물어보세요.\n\n이용 현황, 위험도 분포, 이탈 이유 등을 바로 확인해드릴게요.';

const QUICK_REPLIES = [
  '이번 달 이탈률 얼마야?',
  '위험 회원 비율 얼마야?',
  '이탈 이유 TOP 3',
  '전체 현황 요약해줘',
  '이탈률 높은 카드는?',
  '연령대별 이탈률 알려줘',
];

// 데모용이라 답변은 즉시 만들어지지만, 실제 어시스턴트처럼 보이도록
// 진행 문구를 잠깐 보여준 뒤 답변을 띄운다.
const PROGRESS_STAGES = [
  '질문을 확인하고 있어요',
  '현황 자료를 조회하고 있어요',
  '답변을 작성하고 있어요',
];
const STAGE_DELAY_MS = 700;
const ANSWER_DELAY_MS = 2200;

export function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
      setTimeout(() => setStage(1), STAGE_DELAY_MS),
      setTimeout(() => setStage(2), STAGE_DELAY_MS * 2),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isAsking]);

  function send(q: string) {
    if (!q || isAsking) return;

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text: q },
    ]);
    setQuestion('');
    setIsAsking(true);

    const answer = getDemoAnswer(q);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: 'assistant', ...answer },
      ]);
      setIsAsking(false);
    }, ANSWER_DELAY_MS);
  }

  // 열려 있을 때 패널·런처 바깥을 누르면 닫는다
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        launcherRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send(question.trim());
  }

  return (
    <>
      {/* 닫혀 있어도 마운트해 두고, 런처 버튼 쪽(오른쪽 아래)을 기준으로
          커지고 작아지는 트랜지션으로 열고 닫는다. */}
      <div
        ref={panelRef}
        aria-hidden={!isOpen}
        className={`fixed bottom-28 right-7 z-50 flex max-h-[calc(100vh-8rem)] max-w-[calc(100vw-3rem)] origin-bottom-right flex-col rounded-2xl border border-slate-200 bg-white shadow-panel transition-all duration-300 ease-out ${
          isExpanded ? 'h-[720px] w-[640px]' : 'h-[520px] w-[360px]'
        } ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible translate-y-4 scale-[0.15] opacity-0'
        }`}
      >
        <header className="flex items-center justify-between rounded-t-2xl bg-slate-50 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            {/* 헤더와 같은 대시보드 로고 (흰 막대라 네이비 바탕 위에 둔다) */}
            <div className="flex size-7 items-center justify-center rounded-md bg-sidebar">
              <img src="/logo-rising-bar.svg" alt="" className="size-4" />
            </div>
            <p className="text-[13px] font-bold text-slate-900">
              AI 어시스턴트
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-gray-400 hover:bg-gray-50"
              aria-label={isExpanded ? '작게 보기' : '크게 보기'}
              title={isExpanded ? '작게 보기' : '크게 보기'}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMessages([])}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-gray-400 hover:bg-gray-50"
              aria-label="대화 초기화"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div
          ref={listRef}
          className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-3.5 pt-3.5"
        >
          <div className="max-w-[80%] whitespace-pre-line rounded-bl-md rounded-br-2xl rounded-tl-2xl rounded-tr-2xl bg-gray-100 px-3 py-2.5 text-[13px] leading-5 text-gray-700">
            {GREETING}
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => send(reply)}
                disabled={isAsking}
                className="w-fit min-w-0 max-w-full justify-self-start rounded-full border border-gray-300 bg-white px-2.5 py-1 text-center text-[11px] font-medium text-gray-700 hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {reply}
              </button>
            ))}
          </div>

          {messages.map((message) => {
            const isAssistantAnswer = message.role === 'assistant';

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
                {message.link && (
                  <Link
                    to={message.link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {message.link.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
          {isAsking && (
            <div className="w-[85%] rounded-bl-[4px] rounded-br-[16px] rounded-tl-[16px] rounded-tr-[16px] border border-slate-200 bg-white shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="rounded-bl-[3px] rounded-br-[15px] rounded-tl-[15px] rounded-tr-[15px] bg-white px-3.5 pb-3.5 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    답변 준비 중
                  </p>
                  <span className="text-[11px] font-semibold tabular-nums text-blue-600">
                    {stage + 1}
                    <span className="text-gray-300">
                      {' '}
                      / {PROGRESS_STAGES.length}
                    </span>
                  </span>
                </div>
                <div className="mb-3.5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width] duration-700 ease-out"
                    style={{
                      width: `${((stage + 1) / PROGRESS_STAGES.length) * 100}%`,
                    }}
                  />
                </div>
                <ol>
                  {PROGRESS_STAGES.map((label, index) => {
                    const isDone = index < stage;
                    const isCurrent = index === stage;
                    const isLast = index === PROGRESS_STAGES.length - 1;
                    return (
                      <li
                        key={label}
                        className="relative flex items-center gap-2.5 pb-3 last:pb-0"
                      >
                        {!isLast && (
                          <span className="absolute left-[9px] top-5 h-[calc(100%-20px)] w-0.5 overflow-hidden rounded-full bg-slate-100">
                            <span
                              className={`block w-full bg-gradient-to-b from-blue-600 to-indigo-400 transition-[height] duration-500 ease-out ${
                                isDone ? 'h-full' : 'h-0'
                              }`}
                            />
                          </span>
                        )}
                        <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                          {isDone ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white duration-300 animate-in zoom-in-50">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : isCurrent ? (
                            <>
                              <Loader2 className="relative h-4 w-4 animate-spin text-blue-600" />
                            </>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-200" />
                          )}
                        </span>
                        <span
                          className={`text-[12px] transition-colors duration-300 ${
                            isDone
                              ? 'text-gray-400'
                              : isCurrent
                                ? 'font-semibold text-slate-900'
                                : 'text-gray-300'
                          }`}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
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

      <button
        ref={launcherRef}
        type="button"
        aria-label={isOpen ? 'AI 어시스턴트 닫기' : 'AI 어시스턴트 열기'}
        title={isOpen ? '닫기' : 'AI 어시스턴트'}
        onClick={() => setIsOpen((prev) => !prev)}
        className="group fixed bottom-7 right-7 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-launcher transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      >
        {/* 처음 화면에 나타날 때 한 번만 퍼지는 빛 */}
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-blue-500/40 [animation-iteration-count:1]"
        />
        <MessageCircleMore
          className={`absolute size-6 transition-all duration-300 group-hover:scale-110 ${
            isOpen
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          }`}
          strokeWidth={2}
        />
        <X
          className={`absolute size-5 transition-all duration-300 ${
            isOpen
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </button>
    </>
  );
}
