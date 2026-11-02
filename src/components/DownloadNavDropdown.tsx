import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCompanyDetails } from '../module/company'
import { img } from '../lib/image'

interface DownloadNavDropdownProps {
  label: string
  active?: boolean
  href?: string
}

export default function DownloadNavDropdown({
  label,
  active = false,
  href = '#app',
}: DownloadNavDropdownProps) {
  const { t } = useTranslation()
  const company = useCompanyDetails()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 200)
  }

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {/* Trigger Button Matching Desktop Nav Links */}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer outline-none hover:text-maroon-600 ${
          active
            ? 'font-bold text-maroon-600 underline decoration-gold-500 decoration-2 underline-offset-8'
            : 'text-navy-900/80 font-medium'
        }`}
      >
        <span>{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`h-3.5 w-3.5 text-gold-600 transition-transform duration-250 ${
            open ? 'rotate-180 text-maroon-600' : 'group-hover:translate-y-0.5'
          }`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Popover Dropdown Panel */}
      {open && (
        <div
          role="menu"
          aria-label="Download App"
          className="absolute right-0 top-full pt-3 z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="w-[330px] overflow-hidden rounded-3xl border border-gold-500/35 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FAF6EE] p-5 shadow-[0_20px_50px_rgba(11,26,48,0.22),0_4px_16px_rgba(212,175,55,0.14)] backdrop-blur-md">
            {/* Header: Star, Eyebrow, Title */}
            <div className="border-b border-gold-500/20 pb-3 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 px-2.5 py-0.5">
                <span className="text-gold-700 text-xs font-bold leading-none" aria-hidden="true">
                  ✦
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-800">
                  {t('app.eyebrow')}
                </span>
              </div>
              <p className="font-display mt-2 text-base font-bold text-navy-950 leading-tight">
                {t('app.title')}
              </p>
              <p className="mt-1 text-[11px] text-ink-600 font-medium">
                {t('app.subtitle')}
              </p>
            </div>

            {/* Store Download Buttons with Official Images */}
            <div className="mt-3.5 space-y-2.5">
              {/* Google Play Store Button */}
              <a
                href={company.apps.playStore}
                target="_blank"
                rel="noopener noreferrer"
                title="Google Play"
                aria-label={t('app.googlePlay')}
                className="group/btn flex items-center justify-between rounded-2xl border border-gold-500/30 bg-[#0A1629] p-3 text-white shadow-md transition-all duration-300 hover:border-gold-500 hover:bg-[#0E203C] hover:shadow-lg hover:-translate-y-0.5 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 border border-white/10 group-hover/btn:bg-white/15 transition-colors">
                    <img
                      src={img('/images/common/google-play-store.webp')}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                      alt={t('app.googlePlay')}
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[9.5px] uppercase tracking-wider text-gold-300/90 font-semibold">
                      {t('app.getItOn')}
                    </span>
                    <span className="block text-sm font-bold text-white tracking-wide mt-0.5">
                      Google Play
                    </span>
                  </div>
                </div>
                <span
                  className="mr-1 text-gold-400 font-bold transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>

              {/* Apple App Store Button */}
              <a
                href={company.apps.appStore}
                target="_blank"
                rel="noopener noreferrer"
                title="App Store"
                aria-label={t('app.appStore')}
                className="group/btn flex items-center justify-between rounded-2xl border border-gold-500/30 bg-[#0A1629] p-3 text-white shadow-md transition-all duration-300 hover:border-gold-500 hover:bg-[#0E203C] hover:shadow-lg hover:-translate-y-0.5 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 p-2 border border-white/10 group-hover/btn:bg-white/15 transition-colors">
                    <img
                      src={img('/images/common/app-store.webp')}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                      alt={t('app.appStore')}
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[9.5px] uppercase tracking-wider text-gold-300/90 font-semibold">
                      {t('app.downloadOn')}
                    </span>
                    <span className="block text-sm font-bold text-white tracking-wide mt-0.5">
                      App Store
                    </span>
                  </div>
                </div>
                <span
                  className="mr-1 text-gold-400 font-bold transition-transform duration-300 group-hover/btn:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </div>

            {/* Trust Points */}
            <div className="mt-3.5 flex items-center justify-between rounded-xl bg-gold-500/10 px-3 py-1.5 text-[10.5px] font-semibold text-navy-900 border border-gold-500/20">
              <span className="flex items-center gap-1">
                <span className="text-gold-700">✓</span>
                {t('app.verified')}
              </span>
              <span className="text-gold-400">•</span>
              <span className="flex items-center gap-1">
                <span className="text-gold-700">✓</span>
                {t('app.instantAlerts')}
              </span>
              <span className="text-gold-400">•</span>
              <span className="flex items-center gap-1">
                <span className="text-gold-700">✓</span>
                {t('app.privacySafe')}
              </span>
            </div>

            {/* Bottom Section Link */}
            <div className="mt-3 pt-2 text-center border-t border-cream-200">
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="group/link inline-flex items-center gap-1 text-[11px] font-bold text-maroon-700 hover:text-maroon-800 transition"
              >
                <span>{t('app.exploreFeatures')}</span>
                <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
