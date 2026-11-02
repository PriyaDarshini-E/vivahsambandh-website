import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ensureMotion, prefersReducedMotion } from "../../../lib/gsap-setup";
import { img, imgSrcSet } from "../../../lib/image";

const TRUST_BADGES = [
  {
    key: "hero.verified",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M13.78 4.22a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0L3.72 8.78a.75.75 0 011.06-1.06l2.19 2.19 5.72-5.72a.75.75 0 011.09.03z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "hero.privacy",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 1a3.5 3.5 0 00-3.5 3.5V6H4a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-.5V4.5A3.5 3.5 0 008 1zm2 5V4.5a2 2 0 10-4 0V6h4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "hero.secure",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.467.133a1.75 1.75 0 011.066 0l5.25 1.68A1.75 1.75 0 0115 3.48V7c0 1.566-.32 3.182-1.303 4.682-.983 1.498-2.585 2.813-5.032 3.855a1.7 1.7 0 01-1.33 0c-2.447-1.042-4.049-2.357-5.032-3.855C1.32 10.182 1 8.566 1 7V3.48a1.75 1.75 0 011.217-1.667l5.25-1.68z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
] as const;

const MATCH_CARDS = [
  {
    id: "bride",
    href: "/registration",
    photo: "/images/home/radiant-indian-bride-in-floral-glow-128.webp",
    photoSrcSet: imgSrcSet(
      "/images/home/radiant-indian-bride-in-floral-glow-128.webp 128w, /images/home/radiant-indian-bride-in-floral-glow-200.webp 200w, /images/home/radiant-indian-bride-in-floral-glow-320.webp 320w",
    ),
    photoWidth: 1145,
    photoHeight: 1374,
    illustration: "/images/home/woman_image-160.webp",
    illustrationSrcSet: imgSrcSet(
      "/images/home/woman_image-120.webp 120w, /images/home/woman_image-160.webp 160w, /images/home/woman_image-320.webp 320w",
    ),
    illustrationWidth: 1355,
    illustrationHeight: 1161,
    illustrationAlt: "Bride Illustration",
    labelKey: "matchCards.bride",
    accentKey: "matchCards.brideAccent",
    accentColor: "text-gold-600",
  },
  {
    id: "groom",
    href: "/registration",
    photo: "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp",
    photoSrcSet: imgSrcSet(
      "/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp 128w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-200.webp 200w, /images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp 320w",
    ),
    photoWidth: 1254,
    photoHeight: 1254,
    illustration: "/images/home/man_image-160.webp",
    illustrationSrcSet: imgSrcSet(
      "/images/home/man_image-120.webp 120w, /images/home/man_image-160.webp 160w, /images/home/man_image-320.webp 320w",
    ),
    illustrationWidth: 1324,
    illustrationHeight: 1188,
    illustrationAlt: "Groom Illustration",
    labelKey: "matchCards.groom",
    accentKey: "matchCards.groomAccent",
    accentColor: "text-navy-900",
  },
] as const;

export default function HeroSection() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Motion loads lazily (see lib/gsap-setup): desktop enhances with
  // choreography; mobile hero paints instantly from static markup with 0 JS delay.
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }
    let mm: {
      revert: () => void;
      add: (conditions: string, callback: () => void) => void;
    } | null = null;
    let cancelled = false;
    void ensureMotion()
      .then(({ gsap }) => {
        const root = rootRef.current;
        if (cancelled || !root || prefersReducedMotion()) return;

        // ——— Desktop: Entrance animations & Parallax (mobile stays instant & lightweight) ———
        mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.fromTo(
            '[data-hero="eyebrow"]',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45, clearProps: "all" },
            0.05,
          )
            .fromTo(
              "[data-hero-line]",
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.75,
                ease: "power4.out",
                stagger: 0.09,
                clearProps: "all",
              },
              0.1,
            )
            .fromTo(
              '[data-hero="subtitle"]',
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.5, clearProps: "all" },
              0.28,
            )
            .fromTo(
              '[data-hero="cta"] > *',
              { opacity: 0, y: 16, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.55,
                stagger: 0.09,
                ease: "back.out(1.4)",
                clearProps: "all",
              },
              0.38,
            )
            .fromTo(
              '[data-hero="badges"] li',
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                stagger: 0.05,
                clearProps: "all",
              },
              0.5,
            );

          gsap.to('[data-hero="banner"]', {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: '[data-hero="banner-wrap"]',
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
        });

        // ——— Match cards entrance (just below fold → scroll-triggered, once) ———
        gsap.fromTo(
          '[data-hero="cards"] > *',
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            overwrite: "auto",
            scrollTrigger: {
              trigger: '[data-hero="cards"]',
              start: "top 88%",
              once: true,
            },
          },
        );
      })
      .catch(() => {
        /* motion failed to load — content stays visible (final state) */
      });
    return () => {
      cancelled = true;
      mm?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="relative isolate bg-cream-50">
      {/* ============================================================== */}
      {/* 1. HERO BANNER: Full-width, proportionally sized to 2172x724   */}
      {/* ============================================================== */}
      <section
        data-hero="banner-wrap"
        className="relative isolate z-10 w-full lg:h-[440px] xl:h-[470px]"
      >
        {/* Top garlands: hang from top on sm and up; hidden on small phones to keep mobile clean & fast */}
        <img
          src={img("/images/home/flower1_image-192.webp")}
          srcSet={imgSrcSet(
            "/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w",
          )}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={192}
          height={288}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute left-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-left-top select-none -scale-y-100 hidden sm:block"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          aria-hidden="true"
        />
        <img
          src={img("/images/home/flower2_image-192.webp")}
          srcSet={imgSrcSet(
            "/images/home/flower2_image-192.webp 192w, /images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w",
          )}
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={192}
          height={288}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute right-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-right-top select-none -scale-y-100 hidden sm:block"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          aria-hidden="true"
        />
        {/* Banner image: photo block on top for small screens, full-bleed
            backdrop from lg up (desktop untouched). */}
        <div
          className="pointer-events-none relative h-72 sm:h-96 overflow-hidden lg:absolute lg:inset-0 lg:h-auto"
          aria-hidden="true"
        >
          <img
            src={img("/images/home/home_banner_image-640.webp")}
            srcSet={imgSrcSet(
              "/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image-1280.webp 1280w, /images/home/home_banner_image.webp 2172w",
            )}
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 640px, 100vw"
            width={2172}
            height={724}
            alt="Vivah Sambandh Indian wedding celebration banner"
            title="Vivah Sambandh Indian wedding celebration banner"
            data-hero="banner"
            fetchPriority="high"
            decoding="sync"
            className="h-full w-full object-cover object-[68%_25%] sm:object-[70%_30%] lg:object-[82%_center] xl:object-right"
            loading="eager"
          />
          {/* Mobile fade: photo melts into the cream copy below */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream-50 lg:hidden"
            aria-hidden="true"
          />
        </div>
        {/* Blend overlay: bottom fade into cards */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-b from-transparent to-cream-50 sm:h-24 lg:h-28"
          aria-hidden="true"
        />

        {/* Content Container (Aligned exactly with design) */}
        <div className="section-pad relative z-10 -mt-10 pt-4 pb-5 sm:-mt-12 lg:mt-0 lg:flex lg:h-full lg:items-center lg:py-0">
          <div className="grid w-full items-center lg:grid-cols-12">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-6 py-2">
              {/* Eyebrow */}
              <div
                data-hero="eyebrow"
                className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-gold-700"
              >
                <span className="text-gold-600 text-xs sm:text-sm font-black">
                  ✱
                </span>
                <span>{t("hero.eyebrow")}</span>
                <span className="h-px w-12 sm:w-16 bg-gold-500/50" />
              </div>

              {/* Headline (line masks for the mask-reveal intro) */}
              <h1
                data-hero="title"
                className="font-display mt-2 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.12]"
              >
                <span
                  data-hero-mask
                  className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
                >
                  <span
                    data-hero-line
                    className="block text-navy-900 will-change-transform"
                  >
                    {t("hero.titleA")}
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
                    {t("hero.titleB")}
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p
                data-hero="subtitle"
                className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium"
              >
                {t("hero.subtitle")}
              </p>

              {/* Buttons: stacked full-width on phones, side-by-side from sm up */}
              <div
                data-hero="cta"
                className="mt-4 sm:mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 relative z-20"
              >
                <a
                  href="/registration"
                  title={t("hero.createProfile")}
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 sm:gap-2.5 overflow-hidden rounded-full bg-navy-900 px-6 py-3 sm:px-7 sm:py-3 text-[13px] sm:text-sm font-semibold text-white shadow-md shadow-navy-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-lg hover:shadow-navy-950/30 active:scale-[0.97]"
                >
                  {/* Subtle shine sweep on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative z-10">
                    {t("hero.createProfile")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative z-10 text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="/contact"
                  title={t("hero.findMatch")}
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 sm:gap-2.5 overflow-hidden rounded-full border border-gold-500/80 bg-white/95 px-6 py-3 sm:px-7 sm:py-3 text-[13px] sm:text-sm font-semibold text-navy-900 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-600 hover:bg-gold-50/80 hover:shadow-md hover:shadow-gold-500/15 active:scale-[0.97]"
                >
                  {/* Subtle gold sheen sweep on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-400/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative z-10">{t("hero.findMatch")}</span>
                  <span
                    aria-hidden="true"
                    className="relative z-10 text-gold-600 text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </a>
              </div>

              {/* Trust Badges: Clean single horizontal row with distinct icons */}
             <div data-hero="badges" className="mt-10 w-50px px-4 sm:px-8">
  <ul className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-4 text-sm sm:text-base font-semibold text-navy-900">
    {TRUST_BADGES.map((b) => (
      <li
        key={b.key}
        className="inline-flex items-center gap-2"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-500/60 bg-gold-50/90 text-gold-700 shadow-2xs">
          {b.icon}
        </span>
        <span>{t(b.key)}</span>
      </li>
    ))}
  </ul>
</div>
            </div>

            {/* Right side placeholder to preserve space for couple in background banner */}
            <div
              className="hidden lg:col-span-5 xl:col-span-6 lg:block h-full relative"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. QUICK MATCH CARDS: Positioned cleanly below the hero banner */}
      {/* ============================================================== */}
      <section className="section-pad pt-4 pb-3 sm:pt-5 sm:pb-4 lg:pt-6 lg:pb-6 relative z-10">
        <div
          data-hero="cards"
          className="grid gap-6 sm:grid-cols-2 lg:gap-8 w-full max-w-7xl mx-auto"
        >
          {MATCH_CARDS.map((card) => (
            <a
              key={card.id}
              href={card.href}
              title={t(card.labelKey)}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gold-500/35 bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500"
            >
              {/* Left: Rectangular photo with rounded corners */}
              <div className="relative h-28 w-28 sm:h-36 sm:w-40 md:h-40 md:w-48 lg:h-44 lg:w-56 xl:h-48 xl:w-64 shrink-0 overflow-hidden rounded-xl border-gold-500/30">
                <img
                  src={card.photo}
                  srcSet={card.photoSrcSet}
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 160px, 256px"
                  width={card.photoWidth}
                  height={card.photoHeight}
                  alt={t(card.labelKey)}
                  title={t(card.labelKey)}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Center: Gold Illustrated Avatar + Text */}
              <div className="flex flex-1 flex-col items-center justify-center text-center px-3 sm:px-4 md:px-6">
                <img
                  src={card.illustration}
                  srcSet={card.illustrationSrcSet}
                  sizes="(max-width: 640px) 72px, (max-width: 1024px) 96px, 120px"
                  width={card.illustrationWidth}
                  height={card.illustrationHeight}
                  alt={card.illustrationAlt}
                  title={card.illustrationAlt}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-14 w-auto sm:h-18 md:h-20 lg:h-22 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <p className="mt-1 text-xs sm:text-sm font-bold text-navy-950">
                  {t(card.labelKey)}
                </p>
                <h2
                  className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${card.accentColor}`}
                >
                  {t(card.accentKey)}
                </h2>
              </div>

              {/* Right: Circular Navy Arrow Button */}
              <div className="mr-1 sm:mr-3 md:mr-4 flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white transition-all duration-300 group-hover:bg-navy-800 group-hover:translate-x-1 z-10">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Decorative floral spray on bottom-right corner (enlarged & visible) */}
              <div className="pointer-events-none absolute -right-16 -bottom-3 sm:-bottom-4 h-32 w-28 sm:h-44 sm:w-36 md:h-52 md:w-44 lg:h-60 lg:w-52 opacity-95 select-none hidden sm:block">
                <img
                  src={img("/images/home/flower1_image-320.webp")}
                  srcSet={imgSrcSet(
                    "/images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w",
                  )}
                  sizes="(max-width: 768px) 9rem, 13rem"
                  width={320}
                  height={480}
                  alt="Decorative flower garland"
                  title="Decorative flower garland"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-contain object-right-bottom -scale-x-100 rotate-6"
                />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
