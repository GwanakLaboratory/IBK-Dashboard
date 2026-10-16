import i18n from '@/i18n';
import type {
  AgeGroup,
  BenefitCategory,
  CardBrand,
  CardId,
  ChurnReason,
  ContactChannel,
  Gender,
  MemberName,
  RiskLevel,
} from '@/types/churn';

/*
 * 데이터에는 코드값만 두고, 화면에 보여줄 때 이 함수들로 현재 언어 문구로 바꾼다.
 * 컴포넌트에서 쓸 때는 그 컴포넌트가 useTranslation()을 호출하고 있어야
 * 언어를 바꿨을 때 다시 그려진다.
 */
const t = i18n.getFixedT(null, null, 'domain');

export const riskLevelLabel = (level: RiskLevel) => t(`riskLevel.${level}`);

export const churnReasonLabel = (reason: ChurnReason) =>
  t(`churnReason.${reason}`);

export const genderLabel = (gender: Gender) => t(`gender.${gender}`);

export const ageGroupLabel = (ageGroup: AgeGroup) => t(`ageGroup.${ageGroup}`);

export const channelLabel = (channel: ContactChannel) =>
  t(`channel.${channel}.label`);

export const channelShortLabel = (channel: ContactChannel) =>
  t(`channel.${channel}.short`);

export const benefitCategoryLabel = (category: BenefitCategory) =>
  t(`benefitCategory.${category}`);

export const brandLabel = (brand: CardBrand) => t(`brand.${brand}`);

export const cardName = (id: CardId) => t(`card.${id}.name`);

export const cardSummary = (id: CardId) => t(`card.${id}.summary`);

/** 마스킹된 회원 이름 (예: 김*현 / Kim *hyun) */
export const memberNameLabel = ({ surname, given }: MemberName) =>
  t('memberName.format', {
    surname: t(`memberName.surname.${surname}`),
    given: t(`memberName.given.${given}`),
  });

/** 최근 접촉 (예: 09.18 앱 푸시). 접촉 이력이 없으면 null */
export type LastContact = { date: string; channel: ContactChannel } | null;

export const lastContactLabel = (contact: LastContact) =>
  contact
    ? t('contact.withChannel', {
        date: contact.date,
        channel: channelLabel(contact.channel),
      })
    : '';
