import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppLang } from '../i18n'
import { useAppLanguage } from '../i18n/useAppLanguage'

/**
 * Industry-standard language toggle built on `react-i18next`.
 * - Persists to localStorage (`vivah-lang`)
 * - Syncs <html lang> + document.title via src/i18n/index.ts
 * - All copy comes from src/i18n/locales/{en,hi}.json
 * - Shared reactive state (useAppLanguage): desktop + mobile pills always
 *   agree, rapid clicks collapse so the latest wins, in-flight pill pulses.
 */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { lang: current, pending, switchTo } = useAppLanguage()
  const busy = pending !== null

  // ——— Sliding active pill ———
  const containerRef = useRef<HTMLDivElement | null>(null)
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })
  const activeIndex = current === 'hi' ? 1 : 0

  // Glide the pill to the active button. Re-runs when the language (hence
  // labels/widths) changes; ResizeObserver + fonts.ready cover late shifts.
  useLayoutEffect(() => {
    const btn = btnRefs.current[activeIndex]
    const container = containerRef.current
    if (!btn || !container) return
    const c = container.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    setIndicator({ left: b.left - c.left, width: b.width, ready: true })
  }, [activeIndex, compact])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const measure = () => {
      const btn = btnRefs.current[activeIndex]
      if (!btn) return
      const c = container.getBoundingClientRect()
      const b = btn.getBoundingClientRect()
      setIndicator({ left: b.left - c.left, width: b.width, ready: true })
    }
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    let cancelled = false
    try {
      document.fonts?.ready
        .then(() => {
          if (!cancelled) measure()
        })
        .catch(() => {})
    } catch {
      /* fonts API unavailable */
    }
    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-full border border-gold-500/40 bg-white/80 p-1 text-xs font-semibold shadow-card backdrop-blur"
      role="group"
      aria-label={t('header.language')}
      aria-busy={busy}
    >
      {/* Sliding active pill — glides between English / हिन्दी */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-0 rounded-full bg-navy-900 shadow transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          opacity: indicator.ready ? 1 : 0,
        }}
      />
      {(['en', 'hi'] as const).map((lng: AppLang, idx: number) => {
        const active = current === lng
        const isPending = pending === lng
        return (
          <button
            key={lng}
            ref={(el) => {
              btnRefs.current[idx] = el
            }}
            type="button"
            onClick={() => switchTo(lng)}
            aria-pressed={active}
            aria-busy={isPending}
            disabled={isPending}
            className={`relative z-10 rounded-full py-1.5 transition-colors disabled:cursor-wait ${
              compact ? 'px-2 sm:px-2.5' : 'px-3'
            } ${
              active
                ? 'text-white'
                : 'text-navy-900/70 hover:bg-gold-100 hover:text-navy-900'
            }${isPending ? ' animate-pulse' : ''}`}
          >
            {lng === 'en' ? (
              t('lang.en')
            ) : (
              <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t('lang.hi')}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
