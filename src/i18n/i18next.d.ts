import 'i18next';
import type { resources } from '@/i18n';

// 한국어 번역 파일(ko.json)을 기준으로 t('...') 키를 타입 검사·자동완성한다
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['ko'];
  }
}
