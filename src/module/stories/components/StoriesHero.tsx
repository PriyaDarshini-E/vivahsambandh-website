import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'
import { img, imgSrcSet } from '../../../lib/image'

export default function StoriesHero() {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'

  return (
    <div className="relative isolate bg-cream-50">
      {/* Side cascading garlands */}
      <img
        src={img('/images/home/flower1_image.webp')}
        srcSet={imgSrcSet('/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w, /images/home/flower1_image.webp 1024w')}
        sizes="(max-width: 640px) 22vw, (max-width: 768px) 10rem, (max-width: 1024px) 12rem, (max-width: 1280px) 14rem, 16rem"
        width={1024}
        height={1536}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        data-hero="flower-l"
        fetchPriority="low"
        className="pointer-events-none absolute left-0 bottom-0 z-20 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 max-w-[22vw] h-auto object-contain object-left-bottom select-none"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <img
        src={img('/images/home/flower2_image.webp')}
        srcSet={imgSrcSet('/images/home/flower2_image-192.webp 192w, /images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w, /images/home/flower2_image.webp 1024w')}
        sizes="(max-width: 640px) 26vw, (max-width: 768px) 11rem, (max-width: 1024px) 13rem, (max-width: 1280px) 15rem, 18rem"
        width={1024}
        height={1536}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        data-hero="flower-r"
        fetchPriority="low"
        className="pointer-events-none absolute right-0 bottom-0 z-20 w-32 sm:w-44 md:w-52 lg:w-60 xl:w-72 max-w-[26vw] h-auto object-contain object-right-top select-none"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />

      <section data-hero="banner-wrap" className="relative isolate z-10 w-full lg:h-[520px] xl:h-[560px]">
        {/* Top hanging garlands */}
        <img
          src={img('/images/home/flower1_image-192.webp')}
          srcSet={imgSrcSet('/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w')}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={192}
          height={288}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute left-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-left-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />
        <img
          src={img('/images/home/flower2_image-192.webp')}
          srcSet={imgSrcSet('/images/home/flower2_image-192.webp 192w, /images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w')}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={192}
          height={288}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute right-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-right-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />

        {/* Hero Background banner */}
        <div className="pointer-events-none relative h-64 sm:h-80 overflow-hidden lg:absolute lg:inset-0 lg:h-auto" aria-hidden="true">
          <picture className="block h-full w-full">
            {/* Tablets/phones: dedicated couple-centred crop — no dead space,
                higher pixel density than stretching the wide banner. */}
            <source
              media="(max-width: 1023px)"
              srcSet={imgSrcSet('/images/home/home_banner_image-mobile-640.webp 640w, /images/home/home_banner_image-mobile-860.webp 860w, /images/home/home_banner_image-mobile-1140.webp 1140w, /images/home/home_banner_image-mobile.webp 1412w')}
              sizes="(max-width: 640px) 500px, 630px"
            />
            <img
              src={img('/images/home/home_banner_image-1280.webp')}
              srcSet={imgSrcSet('/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image-1440.webp 1440w, /images/home/home_banner_image.webp 2172w')}
              sizes="100vw"
              width={2172}
              height={724}
              alt="Vivah Sambandh Wedding Celebration Stories"
              title="Vivah Sambandh Wedding Celebration Stories"
              data-hero="banner"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center sm:object-[50%_22%] lg:object-[80%_center] will-change-transform opacity-90"
              loading="eager"
            />
          </picture>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream-50 lg:hidden" aria-hidden="true" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-b from-transparent to-cream-50 sm:h-24 lg:h-28" aria-hidden="true" />

        {/* Hero Text Content */}
        <div className="section-pad relative z-10 -mt-10 pt-4 pb-8 sm:-mt-12 lg:mt-0 lg:flex lg:h-full lg:items-center lg:py-0">
          <div className="grid w-full items-center lg:grid-cols-12">
            <div className="lg:col-span-8 xl:col-span-7 py-4">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="mb-3">
                <ol className="flex items-center gap-1.5 text-xs font-semibold text-navy-900/70">
                  <li>
                    <Link to={pagePath('/', lang)} className="transition hover:text-maroon-600">
                      {t('storiesPage.breadcrumbHome')}
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-gold-500">/</li>
                  <li className="text-gold-700 font-bold" aria-current="page">
                    {t('storiesPage.breadcrumbCurrent')}
                  </li>
                </ol>
              </nav>

              <div data-hero="eyebrow" className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-gold-700">
                <span className="text-gold-600 text-xs sm:text-sm font-black">✱</span>
                <span>{t('storiesPage.heroEyebrow')}</span>
                <span className="h-px w-12 sm:w-16 bg-gold-500/50" />
              </div>

              <h1 data-hero="title" className="font-display mt-3 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.14]">
                <span data-hero-mask="true" className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <span data-hero-line="true" className="block text-navy-900 will-change-transform">
                    {t('storiesPage.heroTitleA')}
                  </span>
                </span>
                <span data-hero-mask="true" className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <span data-hero-line="true" className="block text-gold-600 mt-0.5 will-change-transform">
                    {t('storiesPage.heroTitleB')}
                  </span>
                </span>
              </h1>

              <p data-hero="subtitle" className="mt-3.5 max-w-xl text-xs sm:text-sm leading-relaxed text-ink-600 font-medium">
                {t('storiesPage.heroSubtitle')}
              </p>

              {/* Badges strip */}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-navy-900">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-gold-600">✓</span>
                  <span>{t('storiesPage.badges.verified')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-gold-600">✓</span>
                  <span>{t('storiesPage.badges.gotras')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-gold-600">✓</span>
                  <span>{t('storiesPage.badges.kundali')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
