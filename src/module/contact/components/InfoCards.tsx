import { useTranslation } from 'react-i18next'
import { RevealGroup } from '../../../components/motion/Reveal'
import { useCompanyDetails } from '../../company'

function CardIcon({ index }: { index: number }) {
  const cls = 'h-5 w-5'
  switch (index % 4) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" strokeLinejoin="round" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

/**
 * Three contact-channel cards (Call / Email / Address) —
 * cream cards, gold icon medallions, per design.
 */
export default function InfoCards() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const { phone, phoneLink, email, address } = useCompanyDetails(lang)

  const cards = [
    {
      title: t('contactPage.callTitle'),
      value: phone,
      href: phoneLink,
      note: '',
    },
    {
      title: t('contactPage.emailTitle'),
      value: email,
      href: `mailto:${email}`,
      note: t('contactPage.emailNote'),
    },
    {
      title: t('contactPage.addressTitle'),
      value: address,
      note: t('contactPage.addressNote'),
    },
  ]

  return (
    <section aria-label="Contact channels" className="relative bg-cream-50 pb-8 sm:pb-10">
      <div className="section-pad">
        <RevealGroup className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5" stagger={0.08}>
          {cards.map((card, i) => (
            <article
              key={card.title}
              data-reveal-item
              className="card-ring flex items-start gap-3.5 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white shadow-gold">
                <CardIcon index={i} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display block text-[15px] sm:text-base font-bold text-navy-900">
                  {card.title}
                </h2>
                {card.href ? (
                  <a
                    href={card.href}
                    title={card.value}
                    className="mt-0.5 block truncate text-xs sm:text-[13px] font-bold text-ink-600 transition hover:text-maroon-600"
                  >
                    {card.value}
                  </a>
                ) : (
                  <span className="mt-0.5 block text-xs sm:text-[13px] font-bold text-ink-600">
                    {card.value}
                  </span>
                )}
                {card.note && (
                  <span className="mt-0.5 block text-[11px] sm:text-xs text-ink-500">{card.note}</span>
                )}
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
