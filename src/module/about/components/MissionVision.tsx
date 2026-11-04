import { useTranslation } from 'react-i18next'
import { RevealGroup } from '../../../components/motion/Reveal'

/**
 * Mission / Vision — two cream cards with gold ring + circular icon,
 * exactly like the design under the hero.
 */
export default function MissionVision() {
  const { t } = useTranslation()

  const cards = [
    {
      key: 'mission',
      title: t('aboutPage.missionTitle'),
      body: t('aboutPage.missionBody'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      key: 'vision',
      title: t('aboutPage.visionTitle'),
      body: t('aboutPage.visionBody'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative isolate overflow-hidden bg-cream-50 pb-12 sm:pb-16 lg:pb-20 pt-2">
      <div className="section-pad relative z-10">
        <RevealGroup className="grid gap-5 sm:gap-6 lg:grid-cols-2 lg:gap-8" stagger={0.12}>
          {cards.map((card) => (
            <article
              key={card.key}
              data-reveal-item
              className="card-ring relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 text-center"
            >
              {/* faint jaali texture */}
              <div aria-hidden="true" className="bg-jaali pointer-events-none absolute inset-0 opacity-70" />
              <div className="relative">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-gold-50 text-gold-600 shadow-xs">
                  {card.icon}
                </span>
                <h2 className="font-display mt-4 text-xl sm:text-2xl font-bold text-navy-900">
                  {card.title}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </div>
  )
}
