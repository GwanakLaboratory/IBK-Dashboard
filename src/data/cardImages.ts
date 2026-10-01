// 카드 상품 이미지 (프런트엔드 전용).
//
// ibkCreditCardInfo.ts 는 api/ 서버리스 함수에서도 공유하는 순수 데이터라서,
// 번들러 전용 asset import(.png)는 여기 별도 파일에 두고 카드명으로 조회한다.

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

// ibkCreditCardInfos 의 name 과 반드시 일치해야 한다.
export const CARD_IMAGE_URLS: Record<string, string> = {
  '해피메이트 IBK카드': happyMateImage,
  'I-기후동행카드(신용)': iClimateCommuteImage,
  'IBK포인트3.8 토스 제휴카드': ibkPoint38TossImage,
  'IBK포인트(신용)': ibkPointImage,
  'IBK포인트3.8(신용)': ibkPoint38Image,
  '한국감정평가사협회 The Value': kapaTheValueImage,
  '한국감정평가사협회 The Highness': kapaTheHighnessImage,
  'IBK KaPick': ibkKapickImage,
  'I-어디로든 그린카드': iAnywhereGreenImage,
  'I-PET': iPetImage,
  'K-패스(신용)': kPassImage,
  'I-나눔(일반)': iNanumGeneralImage,
  'I-나눔(아동,장애)': iNanumChildDisabilityImage,
  'I-나눔(동물,환경)': iNanumAnimalEnvironmentImage,
  'I-ALL': iAllImage,
  'IBK 웰릭스 카드': ibkWellixImage,
  '모바일전용 일년의 설렘카드': mobileYearlyExcitementImage,
  'DailyWith 데일리위드 카드': dailyWithImage,
  '원에어(UniMile) 카드': oneAirUnimileImage,
  '코웨이 IBK 카드': cowayIbkImage,
  '쇼핑앤조이 카드': shoppingNJoyImage,
  '제주항공 Refresh Point 카드': jejuAirRefreshPointImage,
  'IBK-Hybrid(하이브리드)카드': ibkHybridImage,
  '참! 좋은 다이소카드(신용)': chamGoodDaisoImage,
  '일상의 기쁨카드(신용)': dailyJoyImage,
  '일년의 설렘카드': yearlyExcitementImage,
  '그린카드 v2': greenCardV2Image,
  'kt텔레캅 안심 Plus 카드': ktTelecopAnshimPlusImage,
  '용인시민카드(신용)': yonginCitizenImage,
  'IBK-Syrup카드[신용]': ibkSyrupImage,
  '국민행복카드[신용]': nationalHappinessImage,
  '참! 좋은 kt wiz 카드[신용]': chamGoodKtWizImage,
  'olleh Super DC IBK카드': ollehSuperDcImage,
  자연드림IBK카드: naturalDreamIbkImage,
  'IBK hi 카드': ibkHiImage,
  'IBK 후불 하이패스 카드(개인)': ibkHipassImage,
  아시아나클럽카드: asianaClubImage,
  '대한항공 SKYPASS 카드': koreanAirSkypassImage,
};
