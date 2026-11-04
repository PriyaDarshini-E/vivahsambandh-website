/**
 * @file src/module/registration/pages/AdminRegisterPage.tsx
 * Admin Registration page — linked from the site footer only (not the header).
 *
 * SEO head is handled globally by SeoHost + src/seo/config.ts — no
 * per-page Helmet here, same as RegistrationPage and other sections.
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PageParallax from '../../../components/motion/PageParallax'
import AdminRegisterForm from '../components/admin-register/AdminRegisterForm'
import { getLenis } from '../../../lib/scroll'

export default function AdminRegisterPage() {
  const { t } = useTranslation()

  useEffect(() => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-cream-50 overflow-hidden">
      <PageParallax />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-navy-pattern rounded-b-[8rem] pt-20 pb-16 text-white">
        <div className="section-pad relative z-10 text-center">
          <span className="eyebrow !text-gold-400">
            {t('adminRegisterPage.eyebrow', 'Admin Register')}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white">
            {t('adminRegisterPage.title', 'Admin Registration')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-cream-200/90 leading-relaxed">
            {t(
              'adminRegisterPage.body',
              'Register an admin record with basic identification, contact details and a face photograph.',
            )}
          </p>
        </div>
      </section>

      {/* Main Admin Registration Form Section */}
      <div className="relative -mt-8 pb-20 sm:pb-28">
        <div className="section-pad">
          <AdminRegisterForm />
        </div>
      </div>
    </div>
  )
}
