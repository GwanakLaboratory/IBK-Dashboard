// 카드 상품 이미지 (프런트엔드 전용).
//
// ibkCreditCardInfo.ts 는 api/ 서버리스 함수에서도 공유하는 순수 데이터라서,
// 번들러 전용 asset import(.png)는 여기 별도 파일에 두고 카드 id로 조회한다.

import type { CardId } from '@/types/churn';
import happyMateImage from '@/assets/cards/happy-mate.png';
import iClimateCommuteImage from '@/assets/cards/i-climate-commute.png';
import ibkPoint38TossImage from '@/assets/cards/ibk-point-3-8-toss.png';
import ibkPointImage from '@/assets/cards/ibk-point.png';
import ibkPoint38Image from '@/assets/cards/ibk-point-3-8.png';
import kapaTheValueImage from '@/assets/cards/kapa-the-value.png';
import kapaTheHighnessImage from '@/assets/cards/kapa-the-highness.png';
import ibkKapickImage from '@/assets/cards/ibk-kapick.png';
import iAnywhereGreenImage from '@/assets/cards/i-anywhere-green.png';
import iPetImage from '@/assets/cards/i-pet.png';
import kPassImage from '@/assets/cards/k-pass.png';
import iNanumGeneralImage from '@/assets/cards/i-nanum-general.png';
import iNanumChildDisabilityImage from '@/assets/cards/i-nanum-child-disability.png';
import iNanumAnimalEnvironmentImage from '@/assets/cards/i-nanum-animal-environment.png';
import iAllImage from '@/assets/cards/i-all.png';
import ibkWellixImage from '@/assets/cards/ibk-wellix.png';
import mobileYearlyExcitementImage from '@/assets/cards/mobile-yearly-excitement.png';
import dailyWithImage from '@/assets/cards/dailywith.png';
import oneAirUnimileImage from '@/assets/cards/oneair-unimile.png';
import cowayIbkImage from '@/assets/cards/coway-ibk.png';
import shoppingNJoyImage from '@/assets/cards/shopping-n-joy.png';
import jejuAirRefreshPointImage from '@/assets/cards/jejuair-refresh-point.png';
import ibkHybridImage from '@/assets/cards/ibk-hybrid.png';
import chamGoodDaisoImage from '@/assets/cards/cham-good-daiso.png';
import dailyJoyImage from '@/assets/cards/daily-joy.png';
import yearlyExcitementImage from '@/assets/cards/yearly-excitement.png';
import greenCardV2Image from '@/assets/cards/green-card-v2.png';
import ktTelecopAnshimPlusImage from '@/assets/cards/kt-telecop-anshim-plus.png';
import yonginCitizenImage from '@/assets/cards/yongin-citizen.png';
import ibkSyrupImage from '@/assets/cards/ibk-syrup.png';
import nationalHappinessImage from '@/assets/cards/national-happiness.png';
import chamGoodKtWizImage from '@/assets/cards/cham-good-kt-wiz.png';
import ollehSuperDcImage from '@/assets/cards/olleh-super-dc.png';
import naturalDreamIbkImage from '@/assets/cards/natural-dream-ibk.png';
import ibkHiImage from '@/assets/cards/ibk-hi.png';
import ibkHipassImage from '@/assets/cards/ibk-hipass.png';
import asianaClubImage from '@/assets/cards/asiana-club.png';
import koreanAirSkypassImage from '@/assets/cards/korean-air-skypass.png';

// ibkCreditCardInfos 의 id 와 반드시 일치해야 한다.
export const CARD_IMAGE_URLS: Record<CardId, string> = {
  'happy-mate': happyMateImage,
  'i-climate-commute': iClimateCommuteImage,
  'point-3-8-toss': ibkPoint38TossImage,
  point: ibkPointImage,
  'point-3-8': ibkPoint38Image,
  'kapa-the-value': kapaTheValueImage,
  'kapa-the-highness': kapaTheHighnessImage,
  kapick: ibkKapickImage,
  'i-anywhere-green': iAnywhereGreenImage,
  'i-pet': iPetImage,
  'k-pass': kPassImage,
  'i-nanum-general': iNanumGeneralImage,
  'i-nanum-child-disability': iNanumChildDisabilityImage,
  'i-nanum-animal-environment': iNanumAnimalEnvironmentImage,
  'i-all': iAllImage,
  wellix: ibkWellixImage,
  'mobile-yearly-excitement': mobileYearlyExcitementImage,
  dailywith: dailyWithImage,
  'oneair-unimile': oneAirUnimileImage,
  coway: cowayIbkImage,
  'shopping-n-joy': shoppingNJoyImage,
  'jejuair-refresh-point': jejuAirRefreshPointImage,
  hybrid: ibkHybridImage,
  'cham-good-daiso': chamGoodDaisoImage,
  'daily-joy': dailyJoyImage,
  'yearly-excitement': yearlyExcitementImage,
  'green-card-v2': greenCardV2Image,
  'kt-telecop-anshim-plus': ktTelecopAnshimPlusImage,
  'yongin-citizen': yonginCitizenImage,
  syrup: ibkSyrupImage,
  'national-happiness': nationalHappinessImage,
  'cham-good-kt-wiz': chamGoodKtWizImage,
  'olleh-super-dc': ollehSuperDcImage,
  'natural-dream': naturalDreamIbkImage,
  hi: ibkHiImage,
  hipass: ibkHipassImage,
  'asiana-club': asianaClubImage,
  'korean-air-skypass': koreanAirSkypassImage,
};
