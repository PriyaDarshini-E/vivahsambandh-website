/**
 * Single source of truth for company / contact details.
 * Import from here everywhere instead of hardcoding phone, email,
 * address or brand name in components / modules. Social links are
 * API-only (getCompany) and intentionally not defined here.
 *
 * Translated labels (e.g. "Call Us" / "कॉल करें") come from
 * `src/i18n/locales/*.json` — the canonical company values live here.
 */
export const COMPANY = {
  name: 'Vivah Sambandh',
  legalName: 'Vivah Sambandh Matrimony Pvt. Ltd.',
  brandTagline: {
    en: 'Community Matrimony',
    hi: 'समुदाय मैट्रिमोनी',
  },

  supportPhoneDisplay: '+91 83107 82820',
  supportPhoneLink: 'tel:+918310782820',
  landlineDisplay: '080-48531999',
  landlineLink: 'tel:08048531999',
  supportHours: {
    en: '(Mon – Sat, 10 AM – 6 PM)',
    hi: '(सोम – शनि, 10 AM – 6 PM)',
  },

  supportEmail: 'info@vivahsambandh.com',

  address: {
    en: '#8, 1st Floor, 24th Main, 5th Phase, JP Nagar, Bangalore 560078',
    hi: '#8, 1st Floor, 24th Main, 5th Phase, JP Nagar, Bangalore 560078',
  },

  community: {
    membersCount: '50K+',
    verifiedBadge: '100% Privacy',
    establishedYear: 2024,
  },

  apps: {
    playStore: 'https://play.google.com/store/apps/details?id=com.vivahsambandh.app',
    appStore: 'https://apps.apple.com/app/vivahsambandh/id0000000000',
  },

  copyrightYear: 2026,
} as const

export type CompanyAddressLang = keyof typeof COMPANY.address

export function getCompanyAddress(lang: string): string {
  return lang === 'hi' ? COMPANY.address.hi : COMPANY.address.en
}

export function getCompanyHours(lang: string): string {
  return lang === 'hi' ? COMPANY.supportHours.hi : COMPANY.supportHours.en
}

export function getCompanyTagline(lang: string): string {
  return lang === 'hi' ? COMPANY.brandTagline.hi : COMPANY.brandTagline.en
}
