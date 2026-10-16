import { Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDemoNotice } from '@/components/molecules/DemoNotice';
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';

const SUPPORT_CONTACT_NUMBER = '1588-2588, 1566-2566';

export function Header() {
  const { t } = useTranslation();
  // 데모 버전에는 로그인 화면이 없어 로그아웃 대신 안내 문구를 잠깐 띄운다
  const { show, notice } = useDemoNotice();
  const handleLogoutClick = () => show(t('common.demoNotice.logout'));

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-sidebar px-6 text-white">
      <div className="flex items-center gap-2.5">
        <img src="/logo-rising-bar.svg" alt="" className="h-6 w-6" />
        <span className="text-base font-bold tracking-wide">
          {t('layout.header.title')}
        </span>
      </div>

      <div className="flex items-center gap-5 text-xs text-topbar-muted">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          <span>
            {t('layout.header.support', { phone: SUPPORT_CONTACT_NUMBER })}
          </span>
        </div>
        <span className="h-3.5 w-px bg-topbar-border" />
        <span>{t('layout.header.department')}</span>
        <span className="h-3.5 w-px bg-topbar-border" />
        <span className="font-semibold text-white">
          {t('layout.header.userName')}
        </span>
        <LanguageToggle />
        <button
          type="button"
          onClick={handleLogoutClick}
          className="h-8 w-20 rounded-md border border-topbar-button-border text-xs text-white transition-colors hover:bg-white/10"
        >
          {t('layout.header.logout')}
        </button>
      </div>

      {notice}
    </header>
  );
}

/** KO / EN 언어 전환. 흰 알약이 고른 언어 쪽으로 미끄러진다. 고른 언어는 localStorage 에 기억한다 */
function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const currentIndex = Math.max(
    0,
    SUPPORTED_LANGUAGES.indexOf(i18n.resolvedLanguage as Language),
  );

  return (
    <div
      role="group"
      aria-label={t('layout.header.language.label')}
      className="flex h-8 items-center rounded-full bg-white/10 p-0.5 ring-1 ring-inset ring-white/10"
    >
      <div className="relative grid h-7 grid-cols-2">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${currentIndex * 100}%)` }}
        />
        {SUPPORTED_LANGUAGES.map((language, index) => {
          const selected = index === currentIndex;
          return (
            <button
              key={language}
              type="button"
              lang={language}
              aria-pressed={selected}
              title={t(`layout.header.language.${language}Name`)}
              onClick={() => i18n.changeLanguage(language)}
              className={`relative z-10 w-9 rounded-full text-2xs font-bold tracking-wide transition-colors ${
                selected ? 'text-sidebar' : 'text-topbar-muted hover:text-white'
              }`}
            >
              {t(`layout.header.language.${language}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
