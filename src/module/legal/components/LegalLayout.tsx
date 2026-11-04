/**
 * @file src/module/legal/components/LegalLayout.tsx
 * Shared layout for simple content pages (Privacy, Terms,
 * Guidelines, Help Center): centered hero + white content card.
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import PageParallax from '../../../components/motion/PageParallax'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'

export interface LegalSection {
  h: string
  body: string
}

export interface LegalLayoutProps {
  eyebrow: string
  title: string
  updated?: string
  intro?: string
  sections: LegalSection[]
}

export default function LegalLayout({ eyebrow, title, updated, intro, sections }: LegalLayoutProps) {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'

  return (
    <div className="relative overflow-hidden bg-[#FFFBF2]">
      <PageParallax />

      {/* Hero */}
      <section className="section-pad relative z-10 pt-10 pb-4 text-center sm:pt-14">
        <Reveal variant="up" className="mx-auto max-w-2xl">
          <div className="eyebrow mx-auto justify-center">
            <span className="text-gold-500">✦</span>
            <span>{eyebrow}</span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {updated && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              {updated}
            </p>
          )}
          {intro && (
            <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">{intro}</p>
          )}
        </Reveal>
      </section>

      {/* Content card */}
      <div className="section-pad relative z-10 py-10 sm:py-14">
        <Reveal variant="up" className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#EADDC3] bg-white p-6 shadow-[0_2px_10px_rgba(16,24,40,0.06)] sm:p-10">
            {sections.map((s, i) => (
              <section key={s.h} className={i > 0 ? 'mt-8' : ''}>
                <h2 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                  {s.h}
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600 sm:text-[15px]">
                  {s.body}
                </p>
              </section>
            ))}

            <div className="mt-10 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-ink-600">
                {t('legal.needHelp', 'Need help?')}{' '}
                <Link
                  to={pagePath('/contact', lang)}
                  title={t('legal.contactUs', 'Contact us')}
                  className="font-bold text-maroon-700"
                >
                  {t('legal.contactUs', 'Contact us')} →
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
