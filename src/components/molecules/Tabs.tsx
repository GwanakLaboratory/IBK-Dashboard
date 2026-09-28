import { type ReactNode } from 'react';

type TabsProps<TabKey extends string> = {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (key: TabKey) => void;
  variant?: 'underline' | 'segmented';
  children?: ReactNode;
};

/**
 * children 을 넘기면 탭 바와 탭 내용을 한 덩어리로 묶는다. Screen 의 섹션 간격
 * 대신 탭 바 ↔ 내용 간격(gap-6)을 여기서 관리하고, 내용끼리는 Screen 과 같은
 * 간격(gap-10)을 유지한다. children 없이 쓰면 탭 바만 렌더링한다.
 */
export function Tabs<TabKey extends string>({
  tabs,
  value,
  onChange,
  variant = 'underline',
  children,
}: TabsProps<TabKey>) {
  const tabList =
    variant === 'segmented' ? (
      <div role="tablist" className="flex rounded-lg bg-[#E9EDF3] p-[3px]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={tab.key === value}
            onClick={() => onChange(tab.key)}
            className={`h-[30px] rounded-md px-3.5 text-xs transition-colors ${
              tab.key === value
                ? 'bg-white font-bold text-primary shadow-sm'
                : 'font-medium text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    ) : (
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[15px] transition-colors ${
              tab.key === value
                ? 'border-primary font-bold text-primary'
                : 'border-transparent font-medium text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );

  if (!children) {
    return tabList;
  }

  return (
    <div className="flex flex-col gap-8">
      {tabList}
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );
}
