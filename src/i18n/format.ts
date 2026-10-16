import i18n from '@/i18n';

/*
 * 언어에 맞춘 숫자·월 표시. 컴포넌트에서 쓸 때는 그 컴포넌트가 useTranslation()을
 * 호출하고 있어야 언어를 바꿨을 때 다시 그려진다.
 */

const LOCALE_BY_LANGUAGE: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

export const currentLocale = () =>
  LOCALE_BY_LANGUAGE[i18n.resolvedLanguage ?? 'ko'] ?? 'ko-KR';

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
) => value.toLocaleString(currentLocale(), options);

/** 'YY.MM' (예: '26.09') → Date */
const toDate = (month: string) =>
  new Date(2000 + Number(month.slice(0, 2)), Number(month.slice(3)) - 1, 1);

/** '26.09' → '9월' / 'Sep' */
export const formatMonth = (month: string) =>
  new Intl.DateTimeFormat(currentLocale(), {
    month: i18n.resolvedLanguage === 'en' ? 'short' : 'long',
  }).format(toDate(month));

/** '26.09' → '2026년 9월' / 'Sep 2026' */
export const formatFullMonth = (month: string) =>
  new Intl.DateTimeFormat(currentLocale(), {
    year: 'numeric',
    month: i18n.resolvedLanguage === 'en' ? 'short' : 'long',
  }).format(toDate(month));

/** 차트 눈금용 짧은 월. '26.09' → '09월' / 'Sep' */
export const formatMonthTick = (month: string) =>
  i18n.resolvedLanguage === 'en' ? formatMonth(month) : `${month.slice(3)}월`;
