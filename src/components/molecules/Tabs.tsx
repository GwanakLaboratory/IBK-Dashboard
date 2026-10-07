type TabsProps<Key extends string | number> = {
  /** 스크린리더용 이름 (예: "추이 기간") */
  label: string;
  tabs: { key: Key; label: string }[];
  value: Key;
  onChange: (key: Key) => void;
};

/** 회색 바탕 위 흰 칸으로 선택을 표시하는 세그먼트 탭 */
export function Tabs<Key extends string | number>({
  label,
  tabs,
  value,
  onChange,
}: TabsProps<Key>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex w-fit shrink-0 rounded-lg bg-slate-100 p-1"
    >
      {tabs.map((tab) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`h-7 whitespace-nowrap rounded-md px-3 text-xs transition-colors ${
              selected
                ? 'bg-white font-bold text-blue-700 shadow-sm'
                : 'font-medium text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
