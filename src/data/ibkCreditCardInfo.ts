// IBK 신용카드 혜택 카테고리 · 브랜드 정보
// 출처: IBK 기업은행 '맞춤카드찾기' 필터 결과 (https://www.ibk.co.kr/cardbiz/listBizNew.ibk?pageId=CA01020000)
// benefitCategories: 사이트의 '카드혜택' 필터 아이콘 13종 중 이 카드가 해당하는 항목
// brands: 사이트의 '브랜드' 필터에서 이 카드가 발급 가능한 브랜드
//
// 이 파일은 api/ (서버리스 함수)에서도 공유해서 쓰기 때문에, 카드 이미지처럼
// 번들러 전용 asset import는 여기 두지 말고 src/data/cardImages.ts(프런트엔드
// 전용)에서 이름으로 조회해서 쓴다.

import type { IbkCreditCardInfo } from '@/types/churn';

export const ibkCreditCardInfos: IbkCreditCardInfo[] = [
  {
    name: '해피메이트 IBK카드',
    summary: '이용금액의 1%~10%까지 해피포인트 적립',
    benefitCategories: ['리워드'],
    brands: ['BC', 'VISA'],
  },
  {
    name: 'I-기후동행카드(신용)',
    summary: '전 가맹점 0.5% 할인 + 후불 기후동행 서비스',
    benefitCategories: ['특화서비스'],
    brands: ['BC'],
  },
  {
    name: 'IBK포인트3.8 토스 제휴카드',
    summary: '전 가맹점 1.5% 적립 및 해외가맹점 최대 6.5% 적립',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: 'IBK포인트(신용)',
    summary: '건당 이용금액 구간별 0.6% ~ 3.3% 포인트 적립',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: 'IBK포인트3.8(신용)',
    summary: '전 가맹점 1.5% 적립 및 해외가맹점 최대 6.5% 적립',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER', 'VISA'],
  },
  {
    name: '한국감정평가사협회 The Value',
    summary:
      '이동·만남·여가에 특화된 전문직군 종사자의 업무와 일상생활을 담은 카드',
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
    summary:
      '이동·만남·여가에 특화된 전문직군 종사자의 업무와 일상생활을 담은 카드',
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
    summary: '카카오페이 PICK, 귀여운 춘식이카드의 등장!',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-어디로든 그린카드',
    summary: '친환경 교통수단 이용하고 에코머니포인트 적립하세요!',
    benefitCategories: ['리워드', '교통/통신/주유/자동차', '카페/외식'],
    brands: ['BC'],
  },
  {
    name: 'I-PET',
    summary: '반려동물을 사랑하는 사람들을 위한 최고의 선택!',
    benefitCategories: ['생활'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'K-패스(신용)',
    summary: '대중교통 이용 시 마일리지를 지급하는 대중교통 특화 카드',
    benefitCategories: ['교통/통신/주유/자동차', '특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(일반)',
    summary: '쓰면 쓸수록 나눔이 되는 카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(아동,장애)',
    summary: '쓰면 쓸수록 나눔이 되는 카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-나눔(동물,환경)',
    summary: '쓰면 쓸수록 나눔이 되는 카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'I-ALL',
    summary: '나의 모든 일상에, 나를 위한 카드',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'MASTER'],
  },
  {
    name: 'IBK 웰릭스 카드',
    summary: '웰릭스렌탈료 자동납부 결제하고 할인받자!',
    benefitCategories: ['특화서비스'],
    brands: ['BC', 'UNIONPAY'],
  },
  {
    name: '모바일전용 일년의 설렘카드',
    summary: '연간 5~70만원 캐시백',
    benefitCategories: ['리워드', '금융'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: 'DailyWith 데일리위드 카드',
    summary: '사용패턴이 바뀌어도, 사용금액이 달라져도, 매월 자동 추가캐시백',
    benefitCategories: ['리워드'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    name: '원에어(UniMile) 카드',
    summary: '국내 全 저비용항공사 어느 곳에서나 사용 가능한 유니마일 적립',
    benefitCategories: ['리워드', '카페/외식', '여행/숙박', '특화서비스'],
    brands: ['UNIONPAY'],
  },
  {
    name: '코웨이 IBK 카드',
    summary: '더 건강한 혜택',
    benefitCategories: ['생활'],
    brands: ['BC', 'MASTER', 'UNIONPAY'],
  },
  {
    name: '쇼핑앤조이 카드',
    summary: '온라인쇼핑 건당 5,000원 할인',
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
    summary: '알뜰여행의 필수아이템!',
    benefitCategories: ['리워드', '여행/숙박', '특화서비스'],
    brands: ['BC글로벌', 'MASTER', 'UNIONPAY'],
  },
  {
    name: 'IBK-Hybrid(하이브리드)카드',
    summary: '한장의 카드, 두가지 결제방식',
    benefitCategories: ['리워드', '금융'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    name: '참! 좋은 다이소카드(신용)',
    summary: '다이소 할인 제휴카드',
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
    summary: '쿠팡, 티몬, 위메프 할인',
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
    summary: '연간 5~70만원 캐시백',
    benefitCategories: ['리워드', '금융', '레져/스포츠'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: '그린카드 v2',
    summary: '스마트한 소비, 가치있는 선택',
    benefitCategories: ['리워드', '공연/문화', '카페/외식', '레져/스포츠'],
    brands: ['VISA', 'UNIONPAY'],
  },
  {
    name: 'kt텔레캅 안심 Plus 카드',
    summary:
      'kt텔레캅 자동이체 월 최대 10,000원 할인 및 교통, 영화, 마트 할인서비스 제공',
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
    summary: '용인시 관내시설 할인 제휴카드',
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
    summary: '스마트한 금융에 달콤한 혜택을 더하다!',
    benefitCategories: ['리워드'],
    brands: ['MASTER', 'UNIONPAY'],
  },
  {
    name: '국민행복카드[신용]',
    summary: 'One Card - Multi Voucher & Service',
    benefitCategories: ['국가바우처', '특화서비스'],
    brands: ['BC'],
  },
  {
    name: '참! 좋은 kt wiz 카드[신용]',
    summary:
      'kt wiz 프로야구단 제휴카드. 수원 케이티 위즈파크 입장권 3천원 할인 및 구단 야구용품 10% 할인',
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
    summary: '카드사용과 자동이체만으로 kt 통신요금 월 최대 15,000원 절감',
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
    summary: '자연드림 이용금액 7% 청구할인',
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
    summary: '교통할인 서비스 카드',
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
    summary:
      '차량용 단말기에 삽입하여 사용하는 "하이패스 전용카드"로서 고속도로 통행료 결제로만 이용 가능',
    benefitCategories: ['특화서비스'],
    brands: ['BC'],
  },
  {
    name: '아시아나클럽카드',
    summary: '아시아나 마일리지 적립',
    benefitCategories: ['리워드'],
    brands: ['BC', 'MASTER', 'VISA', 'JCB'],
  },
  {
    name: '대한항공 SKYPASS 카드',
    summary: '대한항공 마일리지 적립',
    benefitCategories: ['리워드'],
    brands: ['MASTER', 'VISA', 'JCB'],
  },
];
