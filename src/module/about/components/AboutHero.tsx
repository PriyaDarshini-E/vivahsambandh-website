import { useTranslation } from "react-i18next";
import { img, imgSrcSet } from "../../../lib/image";

/**
 * About hero — same banner + same `data-hero` motion contract as the home
 * hero (intro line-mask reveal, scrub banner parallax, drifting garlands).
 */
export default function AboutHero() {
  const { t } = useTranslation();

  return (
    <div className="relative isolate bg-cream-50">
      {/* Side cascading garlands (same as home hero) */}

      <section
        data-hero="banner-wrap"
        className="relative isolate z-10 w-full lg:h-[540px] xl:h-[580px]"
      >
        {/* Top hanging garlands */}
        <img
          src={img("/images/home/flower1_image-320.webp")}
          srcSet={imgSrcSet(
            "/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w",
          )}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={320}
          height={480}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute left-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-left-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />
        <img
          src={img("/images/home/flower2_image-320.webp")}
          srcSet={imgSrcSet(
            "/images/home/flower2_image-192.webp 192w, /images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w",
          )}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={320}
          height={480}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute right-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-right-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />

        {/* Banner image: photo block on top for small screens, full-bleed
            backdrop from lg up — same image as the home hero. */}
        <div
          className="pointer-events-none relative h-72 sm:h-96 overflow-hidden lg:absolute lg:inset-0 lg:h-auto"
          aria-hidden="true"
        >
          <picture className="block h-full w-full">
            {/* Tablets/phones: dedicated couple-centred crop — no dead space,
                higher pixel density than stretching the wide banner. */}
            <source
              media="(max-width: 1023px)"
              srcSet={imgSrcSet(
                "/images/home/home_banner_image-mobile-640.webp 640w, /images/home/home_banner_image-mobile-860.webp 860w, /images/home/home_banner_image-mobile-1140.webp 1140w, /images/home/home_banner_image-mobile.webp 1412w",
              )}
              sizes="(max-width: 640px) 560px, 750px"
            />
            <img
              src={img("/images/home/home_banner_image-1280.webp")}
              srcSet={imgSrcSet(
                "/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-800.webp 800w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image-1440.webp 1440w, /images/home/home_banner_image.webp 2172w",
              )}
              sizes="100vw"
              width={2172}
              height={724}
              alt="Vivah Sambandh Indian wedding celebration banner"
              title="Vivah Sambandh Indian wedding celebration banner"
              data-hero="banner"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center sm:object-[50%_22%] lg:object-[82%_center] xl:object-right will-change-transform"
              loading="eager"
            />
          </picture>
          {/* Mobile fade: photo melts into the cream copy below */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream-50 lg:hidden"
            aria-hidden="true"
          />
        </div>
        {/* Blend overlay: bottom fade into the next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-b from-transparent to-cream-50 sm:h-24 lg:h-28"
          aria-hidden="true"
        />

        {/* Copy */}
        <div className="section-pad relative z-10 -mt-10 pt-4 pb-8 sm:-mt-12 lg:mt-0 lg:flex lg:h-full lg:items-center lg:py-0">
          <div className="grid w-full items-center lg:grid-cols-12">
            <div className="lg:col-span-7 xl:col-span-6 py-4">
              {/* Eyebrow */}
              <div
                data-hero="eyebrow"
                className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-gold-700"
              >
                <span className="text-gold-600 text-xs sm:text-sm font-black">
                  ✱
                </span>
                <span>{t("aboutPage.storyEyebrow")}</span>
                <span className="h-px w-12 sm:w-16 bg-gold-500/50" />
              </div>

              {/* Headline (line masks for the mask-reveal intro) */}
              <h1
                data-hero="title"
                className="font-display mt-3 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.12]"
              >
                <span
                  data-hero-mask
                  className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
                >
                  <span
                    data-hero-line
                    className="block text-navy-900 will-change-transform"
                  >
                    {t("aboutPage.titleA")}
                  </span>
                </span>
                <span
                  data-hero-mask
                  className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
                >
                  <span
                    data-hero-line
                    className="block text-gold-600 mt-0.5 will-change-transform"
                  >
                    {t("aboutPage.titleB")}
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p
                data-hero="subtitle"
                className="mt-3.5 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium"
              >
                {t("aboutPage.body")}
              </p>
            </div>
            {/* Right side kept clear — the celebration lives in the banner photo */}
            <div
              className="hidden lg:col-span-5 xl:col-span-6 lg:block h-full"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
