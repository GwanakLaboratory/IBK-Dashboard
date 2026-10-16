import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import ko from '@/i18n/locales/ko.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * 언어별 번역 파일은 하나(ko.json · en.json)이고, 최상위 키로 화면을 나눈다.
 * 예: t('overview.kpi.riskMembers.label'), t('domain.riskLevel.high')
 */
export const resources = {
  ko: { translation: ko },
  en: { translation: en },
} as const;

/** 고른 언어를 저장하는 localStorage 키 */
const LANGUAGE_STORAGE_KEY = 'ibk-dashboard.language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // 처음 방문하면 한국어로 보여주고, 언어를 바꾸면 localStorage 에 기억한다
    fallbackLng: 'ko',
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    initAsync: false,
  });

const syncDocumentLanguage = (language: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.title = i18n.t('layout.documentTitle');
  }
};
syncDocumentLanguage(i18n.resolvedLanguage ?? 'ko');
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
