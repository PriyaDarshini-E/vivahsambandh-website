import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import type { AboutStat } from '../types'

function StatIcon({ index }: { index: number }) {
  const cls = 'h-5 w-5'
  switch (index % 4) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 2l7 3v6c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z" strokeLinejoin="round" />
          <path d="M12 9v3M12 15h.01" strokeLinecap="round" strokeWidth="2" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
          <path d="M9.3 12l2 2 3.6-3.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.3" />
          <path d="M3.5 19c0-2.6 2.4-4.2 5.5-4.2 1.5 0 2.9.4 3.9 1.1M15 14.8c2.8.3 4.9 1.7 4.9 3.9" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="10" width="14" height="9" rx="2" />
          <path d="M8 10V7.5a4 4 0 018 0V10" strokeLinecap="round" />
        </svg>
      )
  }
}

/**
 * Stats strip — gold-ruled cream band with 4 proof points,
 * separated by small gold diamonds (design's divider row).
 */
export default function StatsStrip() {
  const { t } = useTranslation()
  const stats = (t('aboutPage.stats', { returnObjects: true }) as AboutStat[]) || []

  return (
    <section aria-label="Highlights" className="relative border-y border-gold-500/30 bg-cream-100/70">
      <div className="section-pad relative py-8 sm:py-10">
        <Reveal variant="fade">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-7 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={`${s.value}-${s.label}`} className="relative flex flex-col items-center text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/12 text-gold-600">
                    <StatIcon index={i} />
                  </span>
                  <span className="font-display mt-2 text-xl sm:text-2xl font-bold text-navy-900">{s.value}</span>
                  <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-ink-500">{s.label}</span>
                  {i < stats.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -right-2 hidden -translate-y-1/2 text-[9px] text-gold-500 lg:block"
                    >
                      ◆
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
