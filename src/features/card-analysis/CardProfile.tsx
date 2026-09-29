import { CreditCard } from 'lucide-react';
import type { IbkCreditCardInfo, ProductUsageStat } from '@/types/churn';

type CardProfileProps = {
  stat: ProductUsageStat;
  cardInfo: IbkCreditCardInfo;
  imageUrl?: string;
};

function formatRatio(count: number, total: number) {
  return total === 0 ? 0 : (count / total) * 100;
}

export function CardProfile({ stat, cardInfo, imageUrl }: CardProfileProps) {
  const useRate = formatRatio(stat.activeCount, stat.issuedCount);
  const closeRate = formatRatio(stat.canceledCount, stat.issuedCount);

  const memberStats = [
    {
      label: '발급 회원 수',
      value: stat.issuedCount,
      sub: '누적 발급 기준',
      dotClassName: 'bg-gray-400',
      subClassName: 'text-gray-500',
    },
    {
      label: '이용 회원 수',
      value: stat.activeCount,
      sub: `이용률 ${useRate.toFixed(1)}%`,
      dotClassName: 'bg-primary',
      subClassName: 'text-primary',
    },
    {
      label: '해지 회원 수',
      value: stat.canceledCount,
      sub: `해지율 ${closeRate.toFixed(1)}%`,
      dotClassName: 'bg-red-500',
      subClassName: 'text-red-700',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:gap-10">
      <div className="flex h-[96px] w-[147px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 shadow-[0_10px_24px_rgba(12,20,38,0.18),0_2px_6px_rgba(12,20,38,0.10)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${stat.productName} 카드 이미지`}
            className="h-full w-full object-cover"
          />
        ) : (
          <CreditCard className="h-10 w-10 text-gray-300" aria-hidden />
        )}
      </div>

      <div className="flex w-full min-w-0 flex-1 flex-col gap-[18px]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[22px] font-bold tracking-tight text-gray-900">
              {stat.productName}
            </span>
            {cardInfo.brands.map((brand) => (
              <span
                key={brand}
                className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-bold text-gray-700"
              >
                {brand}
              </span>
            ))}
            <span className="mx-0.5 h-3.5 w-px bg-border" />
            {cardInfo.benefitCategories.map((category) => (
              <span
                key={category}
                className="inline-flex h-[26px] items-center rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="flex items-center gap-2.5 text-sm leading-normal text-gray-700">
            <span className="inline-flex h-[22px] shrink-0 items-center rounded bg-gray-100 px-2 text-[11px] font-bold text-gray-600">
              주요 혜택
            </span>
            {cardInfo.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {memberStats.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 rounded-xl bg-[#F7F8FB] px-[18px] py-3.5"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.dotClassName}`} />
                <span className="text-xs font-semibold text-gray-600">
                  {item.label}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold tracking-tight text-gray-900">
                  {item.value.toLocaleString('ko-KR')}
                </span>
                <span className="text-[13px] font-semibold text-gray-600">
                  명
                </span>
              </div>
              <span className={`text-xs font-semibold ${item.subClassName}`}>
                {item.sub}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex h-2 gap-0.5 overflow-hidden rounded">
            <span
              className="h-full bg-primary"
              style={{ width: `${useRate}%` }}
            />
            <span className="h-full flex-1 bg-red-400" />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>발급 대비 이용 {useRate.toFixed(1)}%</span>
            <span>해지 {closeRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
