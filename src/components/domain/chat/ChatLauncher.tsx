import {
  ArrowUp,
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
  SUGGESTED_QUESTIONS,
  getDemoAnswer,
  type DemoAnswer,
} from '@/components/domain/chat/demoAnswers';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  link?: DemoAnswer['link'];
  suggestions?: DemoAnswer['suggestions'];
  isError?: boolean;
};

const GREETING =
  '안녕하세요! 카드 회원 이탈 예측 데이터에 대해 궁금한 점을 물어보세요.\n\n위험 고객 현황, 고객 특성, 캠페인 성과 등을 바로 확인해드릴게요.';

// 데모용이라 답변은 즉시 만들어지지만, 실제 어시스턴트처럼 보이도록
// 진행 문구를 잠깐 보여준 뒤 답변을 띄운다.
const PROGRESS_STAGES = [
  '질문을 확인하고 있어요',
  '현황 자료를 조회하고 있어요',
  '답변을 작성하고 있어요',
];
const STAGE_DELAY_MS = 700;
const ANSWER_DELAY_MS = 2200;
/** 이만큼(px) 내려 읽으면 맨 위로 버튼을 보여준다 */
const SCROLL_TOP_THRESHOLD = 240;

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
  const [showScrollTop, setShowScrollTop] = useState(false);
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
          isExpanded ? 'h-[780px] w-[720px]' : 'h-[600px] w-[460px]'
        } ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible translate-y-4 scale-[0.15] opacity-0'
        }`}
      >
        {/* 대시보드 상단 헤더와 같은 바탕색·로고 */}
        <header className="flex items-center justify-between rounded-t-2xl bg-sidebar px-4 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <img src="/logo-rising-bar.svg" alt="" className="size-6" />
            <p className="text-sm font-bold">AI 어시스턴트</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-topbar-button-border text-white transition-colors hover:bg-white/10"
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
              className="flex h-7 w-7 items-center justify-center rounded-md border border-topbar-button-border text-white transition-colors hover:bg-white/10"
              aria-label="대화 초기화"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={listRef}
            onScroll={(event) =>
              setShowScrollTop(
                event.currentTarget.scrollTop > SCROLL_TOP_THRESHOLD,
              )
            }
            className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-3.5 pt-3.5"
          >
            {/* 인사말과 추천 질문은 한 덩어리로 붙이고, 아래 대화와는 넉넉히 띄운다 */}
            <div className="space-y-2.5 pb-4">
              <div className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
                {GREETING}
              </div>
              <QuestionChips
                questions={SUGGESTED_QUESTIONS}
                disabled={isAsking}
                onSelect={send}
              />
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
                    className={`px-3 py-2.5 text-sm ${
                      message.role === 'user'
                        ? 'rounded-2xl rounded-br-lg bg-blue-700 text-white'
                        : message.isError
                          ? 'rounded-2xl rounded-bl-lg bg-red-50 text-red-600'
                          : 'rounded-2xl rounded-bl-lg bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isAssistantAnswer ? (
                      <ChatMessageContent text={message.text} />
                    ) : (
                      message.text
                    )}
                    {/* 답변 근거 화면으로 가는 링크는 말풍선 맨 아래에 붙인다 */}
                    {message.link && (
                      <div className="mt-3 flex justify-end border-t border-slate-200 pt-2">
                        <Link
                          to={message.link.to}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-0.5 text-sm font-medium text-blue-700 hover:underline"
                        >
                          {message.link.label}
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                  {message.suggestions && (
                    <QuestionChips
                      questions={message.suggestions}
                      disabled={isAsking}
                      onSelect={send}
                    />
                  )}
                </div>
              );
            })}
            {isAsking && (
              <div className="w-[85%] overflow-hidden rounded-2xl rounded-bl-lg border border-slate-200 bg-white shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-white px-3.5 pb-3.5 pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      답변 준비 중
                    </p>
                    <span className="text-xs font-semibold tabular-nums text-blue-600">
                      {stage + 1}
                      <span className="text-slate-300">
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
                            className={`text-xs transition-colors duration-300 ${
                              isDone
                                ? 'text-slate-400'
                                : isCurrent
                                  ? 'font-semibold text-slate-900'
                                  : 'text-slate-300'
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
          <button
            type="button"
            onClick={() =>
              listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }
            aria-label="맨 위로"
            title="맨 위로"
            tabIndex={showScrollTop ? 0 : -1}
            className={`absolute bottom-2 right-3.5 flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-all duration-200 hover:text-blue-700 ${
              showScrollTop
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-2 opacity-0'
            }`}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="flex h-11 items-center gap-2 rounded-full bg-slate-100 py-1.5 pl-3.5 pr-1.5">
            <input
              onChange={(event) => setQuestion(event.target.value)}
              value={question}
              disabled={isAsking}
              placeholder="궁금한 점을 물어보세요..."
              className="h-full flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400 transition-colors enabled:bg-blue-700 enabled:text-white"
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

type QuestionChipsProps = {
  questions: string[];
  disabled: boolean;
  onSelect: (question: string) => void;
};

function QuestionChips({ questions, disabled, onSelect }: QuestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="w-fit min-w-0 max-w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700 active:bg-blue-50 disabled:pointer-events-none disabled:opacity-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
