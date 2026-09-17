// IBK 신용카드 혜택 카테고리 · 브랜드 정보
// 출처: IBK 기업은행 '맞춤카드찾기' 필터 결과 (https://www.ibk.co.kr/cardbiz/listBizNew.ibk?pageId=CA01020000)
// benefitCategories: 사이트의 '카드혜택' 필터 아이콘 13종 중 이 카드가 해당하는 항목
// brands: 사이트의 '브랜드' 필터에서 이 카드가 발급 가능한 브랜드

import type { IbkCreditCardInfo } from '@/types/churn';

export const ibkCreditCardInfos: IbkCreditCardInfo[] = [
  {
    name: '해피메이트 IBK카드',
    benefitCategories: ['리워드'],
    brands: ['BC', 'VISA'],
  },
  {
    name: 'I-기후동행카드(신용)',
    benefitCategories: ['특화서비스'],
    brands: ['BC'],
  },
  {
    name: 'IBK포인트3.8 토스 제휴카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: 'IBK포인트(신용)',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: 'IBK포인트3.8(신용)',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: '한국감정평가사협회 The Value',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '카페/외식',
    ],
    brands: ['BC', 'MASTER'],
  },
  {
    name: '한국감정평가사협회 The Highness',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '카페/외식',
      '여행/숙박',
      '레져/스포츠',
    ],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'IBK KaPick',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-어디로든 그린카드',
    benefitCategories: ['리워드', '교통/통신/주유/자동차', '카페/외식'],
    brands: ['BC'],
  },
  {
    name: 'I-PET',
    benefitCategories: ['생활'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'K-패스(신용)',
    benefitCategories: ['교통/통신/주유/자동차', '특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(일반)',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(아동,장애)',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(동물,환경)',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-ALL',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'IBK 웰릭스 카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'UNIONPAY'],
  },
  {
    name: '모바일전용 일년의 설렘카드',
    benefitCategories: ['리워드', '금융'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: 'DailyWith 데일리위드 카드',
    benefitCategories: ['리워드'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    name: '원에어(UniMile) 카드',
    benefitCategories: ['리워드', '카페/외식', '여행/숙박', '특화서비스'],
    brands: ['UNIONPAY'],
  },
  {
    name: '코웨이 IBK 카드',
    benefitCategories: ['생활'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    name: '쇼핑앤조이 카드',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '카페/외식',
      '금융',
    ],
    brands: ['BC글로벌'],
  },
  {
    name: '제주항공 Refresh Point 카드',
    benefitCategories: ['리워드', '여행/숙박', '특화서비스'],
    brands: ['BC글로벌', 'MASTER', 'UNIONPAY'],
  },
  {
    name: '참! 좋은 친구 청년동행카드(신용)',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '금융',
      '레져/스포츠',
    ],
    brands: ['BC글로벌', 'MASTER', 'VISA', 'UNIONPAY'],
  },
  {
    name: 'IBK-Hybrid(하이브리드)카드',
    benefitCategories: ['리워드', '금융'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    name: '참! 좋은 다이소카드(신용)',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '레져/스포츠',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: '일상의 기쁨카드(신용)',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '금융',
      '레져/스포츠',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: '일년의 설렘카드',
    benefitCategories: ['리워드', '금융', '레져/스포츠'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: '그린카드 v2',
    benefitCategories: ['리워드', '공연/문화', '카페/외식', '레져/스포츠'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: 'kt텔레캅 안심 Plus 카드',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '생활',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: '용인시민카드(신용)',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '레져/스포츠',
      '특화서비스',
    ],
    brands: ['BC', 'VISA'],
  },
  {
    name: 'IBK-Syrup카드[신용]',
    benefitCategories: ['리워드'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    name: '국민행복카드[신용]',
    benefitCategories: ['국가바우처', '특화서비스'],
    brands: ['BC'],
  },
  {
    name: '참! 좋은 kt wiz 카드[신용]',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '레져/스포츠',
      '특화서비스',
    ],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: 'olleh Super DC IBK카드',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '공연/문화',
      '카페/외식',
      '레져/스포츠',
      '특화서비스',
    ],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    name: '자연드림IBK카드',
    benefitCategories: [
      '리워드',
      '교통/통신/주유/자동차',
      '쇼핑/패션/뷰티/미용',
      '공연/문화',
      '카페/외식',
      '금융',
      '레져/스포츠',
      '특화서비스',
    ],
    brands: ['BC글로벌', 'VISA'],
  },
  {
    name: 'IBK hi 카드',
    benefitCategories: [
      '교통/통신/주유/자동차',
      '공연/문화',
      '카페/외식',
      '금융',
      '레져/스포츠',
    ],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: 'IBK 후불 하이패스 카드(개인)',
    benefitCategories: ['특화서비스'],
    brands: ['BC'],
  },
  {
    name: '아시아나클럽카드',
    benefitCategories: ['리워드'],
    brands: ['BC', 'MASTER', 'VISA', 'JCB'],
  },
  {
    name: '대한항공 SKYPASS 카드',
    benefitCategories: ['리워드'],
    brands: ['MASTER', 'VISA', 'JCB'],
  },
];
