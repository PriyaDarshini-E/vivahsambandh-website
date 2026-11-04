/**
 * @file src/module/registration/pages/RegistrationPage.tsx
 * Registration page for prospective brides and grooms on Vivah Sambandh.
 *
 * SEO head (title, description, canonical, hreflang, OG, JSON-LD) is owned
 * globally by SeoHost + src/seo/config.ts ('registration' page key) —
 * no per-page Helmet here, same as ContactPage and other sections.
 */

import { useTranslation } from 'react-i18next'
import PageParallax from '../../../components/motion/PageParallax'
import RegistrationForm from '../components/RegistrationForm'

export default function RegistrationPage() {
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen bg-cream-50 overflow-x-clip">
      <PageParallax />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-navy-pattern rounded-b-[8rem] pt-20 pb-16 text-white">
        <div className="section-pad relative z-10 text-center">
          <span className="eyebrow !text-gold-400">
            {t('registrationPage.eyebrow')}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white">
            {t('registrationPage.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-cream-200/90 leading-relaxed">
            {t('registrationPage.body')}
          </p>
          <p className="mt-4 text-xs text-cream-200/70">
            <span className="font-bold text-gold-400">*</span>{' '}
            {t('registrationPage.form.requiredHint', 'Required fields are marked with an asterisk')}
          </p>
        </div>
      </section>

      {/* Main Registration Form Section */}
      <div className="relative -mt-8 pb-20 sm:pb-28">
        <div className="section-pad">
          <RegistrationForm />
        </div>
      </div>
    </div>
  )
}
