import { useEffect, useRef, useState } from 'react';

const NOTICE_MS = 2500;

/**
 * 데모 버전에서 지원하지 않는 기능을 눌렀을 때 화면 아래에 안내 문구를 잠깐 띄운다.
 * `show(message)`로 띄우고, 반환한 `notice`를 화면 아무 곳에나 렌더링한다.
 */
export function useDemoNotice() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const show = (next: string) => {
    setMessage(next);
    setVisible(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(false), NOTICE_MS);
  };

  const notice = (
    <div
      role="status"
      aria-hidden={!visible}
      className={`pointer-events-none fixed bottom-10 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      {message}
    </div>
  );

  return { show, notice };
}
