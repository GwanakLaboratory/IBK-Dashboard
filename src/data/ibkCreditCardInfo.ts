// IBK 신용카드 혜택 카테고리 · 브랜드 정보
// 출처: IBK 기업은행 '맞춤카드찾기' 필터 결과 (https://www.ibk.co.kr/cardbiz/listBizNew.ibk?pageId=CA01020000)
// benefitCategories: 사이트의 '카드혜택' 필터 아이콘 13종 중 이 카드가 해당하는 항목
// brands: 사이트의 '브랜드' 필터에서 이 카드가 발급 가능한 브랜드
//
// 이 파일은 api/ (서버리스 함수)에서도 공유해서 쓰기 때문에, 카드 이미지처럼
// 번들러 전용 asset import는 여기 두지 말고 src/data/cardImages.ts(프런트엔드
// 전용)에서 id로 조회해서 쓴다.
//
// 카드 이름 · 요약은 다국어로 보여주려고 번역 파일(src/i18n/locales/*/domain.json 의
// card.<id>)에 두고, 여기에는 id와 필터용 코드값만 둔다.

import type { IbkCreditCardInfo } from '@/types/churn';

export const ibkCreditCardInfos: IbkCreditCardInfo[] = [
  {
    id: 'happy-mate',
    benefitCategories: ['reward'],
    brands: ['BC', 'VISA'],
  },
  {
    id: 'i-climate-commute',
    benefitCategories: ['specialService'],
    brands: ['BC'],
  },
  {
    id: 'point-3-8-toss',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    id: 'point',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    id: 'point-3-8',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    id: 'kapa-the-value',
    benefitCategories: [
      'reward',
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cafeDining',
    ],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'kapa-the-highness',
    benefitCategories: [
      'reward',
      'transportTelecomFuelCar',
      'cafeDining',
      'travelStay',
      'leisureSports',
    ],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'kapick',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'i-anywhere-green',
    benefitCategories: ['reward', 'transportTelecomFuelCar', 'cafeDining'],
    brands: ['BC'],
  },
  {
    id: 'i-pet',
    benefitCategories: ['living'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'k-pass',
    benefitCategories: ['transportTelecomFuelCar', 'specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'i-nanum-general',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'i-nanum-child-disability',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'i-nanum-animal-environment',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'i-all',
    benefitCategories: ['specialService'],
    brands: ['BC', 'MASTER'],
  },
  {
    id: 'wellix',
    benefitCategories: ['specialService'],
    brands: ['BC', 'UNIONPAY'],
  },
  {
    id: 'mobile-yearly-excitement',
    benefitCategories: ['reward', 'finance'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'dailywith',
    benefitCategories: ['reward'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    id: 'oneair-unimile',
    benefitCategories: ['reward', 'cafeDining', 'travelStay', 'specialService'],
    brands: ['UNIONPAY'],
  },
  {
    id: 'coway',
    benefitCategories: ['living'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    id: 'shopping-n-joy',
    benefitCategories: [
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cafeDining',
      'finance',
    ],
    brands: ['BC_GLOBAL'],
  },
  {
    id: 'jejuair-refresh-point',
    benefitCategories: ['reward', 'travelStay', 'specialService'],
    brands: ['BC_GLOBAL', 'MASTER', 'UNIONPAY'],
  },
  {
    id: 'hybrid',
    benefitCategories: ['reward', 'finance'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    id: 'cham-good-daiso',
    benefitCategories: [
      'reward',
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'cafeDining',
      'leisureSports',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'daily-joy',
    benefitCategories: [
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'cafeDining',
      'finance',
      'leisureSports',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'yearly-excitement',
    benefitCategories: ['reward', 'finance', 'leisureSports'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'green-card-v2',
    benefitCategories: [
      'reward',
      'cultureShows',
      'cafeDining',
      'leisureSports',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'kt-telecop-anshim-plus',
    benefitCategories: [
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'living',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'yongin-citizen',
    benefitCategories: [
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'cafeDining',
      'leisureSports',
      'specialService',
    ],
    brands: ['BC', 'VISA'],
  },
  {
    id: 'syrup',
    benefitCategories: ['reward'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    id: 'national-happiness',
    benefitCategories: ['nationalVoucher', 'specialService'],
    brands: ['BC'],
  },
  {
    id: 'cham-good-kt-wiz',
    benefitCategories: [
      'reward',
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'cafeDining',
      'leisureSports',
      'specialService',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    id: 'olleh-super-dc',
    benefitCategories: [
      'transportTelecomFuelCar',
      'cultureShows',
      'cafeDining',
      'leisureSports',
      'specialService',
    ],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    id: 'natural-dream',
    benefitCategories: [
      'reward',
      'transportTelecomFuelCar',
      'shoppingFashionBeauty',
      'cultureShows',
      'cafeDining',
      'finance',
      'leisureSports',
      'specialService',
    ],
    brands: ['BC_GLOBAL', 'VISA'],
  },
  {
    id: 'hi',
    benefitCategories: [
      'transportTelecomFuelCar',
      'cultureShows',
      'cafeDining',
      'finance',
      'leisureSports',
    ],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    id: 'hipass',
    benefitCategories: ['specialService'],
    brands: ['BC'],
  },
  {
    id: 'asiana-club',
    benefitCategories: ['reward'],
    brands: ['BC', 'MASTER', 'VISA', 'JCB'],
  },
  {
    id: 'korean-air-skypass',
    benefitCategories: ['reward'],
    brands: ['MASTER', 'VISA', 'JCB'],
  },
];
