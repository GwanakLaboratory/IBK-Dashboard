type TabsProps<TabKey extends string> = {
  tabs: { key: TabKey; label: string }[];
  value: TabKey;
  onChange: (key: TabKey) => void;
};

export function Tabs<TabKey extends string>({
  tabs,
  value,
  onChange,
}: TabsProps<TabKey>) {
  return (
    <div className="mb-6 flex border-b border-gray-200">
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
}
