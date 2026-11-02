import { useTranslation } from 'react-i18next'
import { useCompanyDetails } from '../module/company'
import { img } from '../lib/image'

export type StoreKind = 'play' | 'apple'

const STORES = {
  play: {
    captionKey: 'app.getItOn',
    name: 'Google Play',
    labelKey: 'app.googlePlay',
    image: img('/images/common/google-play-store.webp'),
    alt: 'Get it on Google Play',
  },
  apple: {
    captionKey: 'app.downloadOn',
    name: 'App Store',
    labelKey: 'app.appStore',
    image: img('/images/common/app-store.webp'),
    alt: 'Download on the App Store',
  },
} as const

interface StoreBadgeProps {
  store: StoreKind
  className?: string
}

/**
 * App store download badge — uses the official images from /images/common/
 * exactly as styled in AppDownloadSection. Shared by header dropdown and mobile drawer.
 */
export default function StoreBadge({ store, className = '' }: StoreBadgeProps) {
  const { t } = useTranslation()
  const company = useCompanyDetails()
  const { captionKey, name, labelKey, image, alt } = STORES[store]
  const href = store === 'play' ? company.apps.playStore : company.apps.appStore

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      aria-label={t(labelKey)}
      className={`group/btn inline-flex items-center gap-3 rounded-xl border border-navy-900 bg-navy-900 px-4 py-2.5 text-white shadow-md transition-all duration-200 hover:border-gold-500/40 hover:bg-[#0E203C] hover:shadow-lg hover:-translate-y-0.5 active:scale-98 ${className}`}
    >
      <img
        src={image}
        width={48}
        height={48}
        alt={t(labelKey, { defaultValue: alt })}
        title={name}
        aria-hidden="true"
        className="h-6 w-6 object-contain shrink-0"
        loading="lazy"
      />
      <span className="text-left leading-none">
        <span className="block text-[9px] uppercase tracking-wider text-gold-300/90 font-semibold">
          {t(captionKey)}
        </span>
        <span className="block text-xs font-bold text-white sm:text-sm mt-0.5 tracking-wide">{name}</span>
      </span>
    </a>
  )
}
