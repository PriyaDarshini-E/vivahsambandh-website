import { useTranslation } from "react-i18next";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import type { AboutPoint } from "../types";
import { img, imgSrcSet } from "../../../lib/image";

function PointIcon({ index }: { index: number }) {
  const cls = "h-5 w-5";
  switch (index % 4) {
    case 0:
      return (
        <svg
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="3" />
          <path
            d="M3.5 19c0-2.6 2.4-4.2 5.5-4.2s5.5 1.6 5.5 4.2"
            strokeLinecap="round"
          />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M15.5 14.6c2.9.2 5 1.7 5 4" strokeLinecap="round" />
        </svg>
      );
    case 1:
      return (
        <svg
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M12 20s-7-4.3-9-9c-1.2-2.8.5-6 3.5-6 2 0 3.6 1.2 4.5 2.6h1C12.9 6.2 14.5 5 16.5 5c3 0 4.7 3.2 3.5 6-2 4.7-8 9-8 9z"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 2:
      return (
        <svg
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M12 3v18M5 8l7-5 7 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 13c0-1.8 1.4-3 3.2-3h7.6C17.6 10 19 11.2 19 13v5H5v-5z"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className={cls}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h2a8 8 0 018 8z"
            strokeLinejoin="round"
          />
          <path
            d="M9 11h.01M12.5 11h.01M16 11h.01"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
        </svg>
      );
  }
}

/**
 * "Built for Our Families, by People Who Understand" —
 * mandap visual left, 4 icon points right (design's middle cream block).
 */
export default function WhyBuilt() {
  const { t } = useTranslation();
  const points =
    (t("aboutPage.whyPoints", { returnObjects: true }) as AboutPoint[]) || [];

  return (
    <section className="relative isolate overflow-hidden bg-cream-50 py-14 sm:py-16 lg:py-20">
      <div
        aria-hidden="true"
        className="bg-jaali pointer-events-none absolute inset-0 opacity-60"
      />
      {/* Edge florals */}
     
      <img
        src={img("/images/home/flower4_image.webp")}
        width={942}
        height={1670}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute right-0 bottom-0 z-0 w-20 sm:w-28 lg:w-36 h-auto max-w-[15vw] select-none opacity-95"
      />

      <div className="section-pad relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: heading + mandap */}
          <div className="lg:col-span-6">
            <Reveal variant="up">
              <p data-eyebrow className="eyebrow">
                <span aria-hidden="true">❖</span>
                {t("aboutPage.whyEyebrow")}
                <span aria-hidden="true" className="h-px w-10 bg-gold-500/60" />
              </p>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[40px] font-bold leading-[1.16]">
                <span className="block text-navy-900">
                  {t("aboutPage.whyTitleA")}
                </span>
                <span className="mt-1 block text-gold-600">
                  {t("aboutPage.whyTitleB")}
                </span>
              </h2>
              <p className="mt-4 max-w-lg text-xs sm:text-sm lg:text-[15px] font-medium leading-relaxed text-ink-600">
                {t("aboutPage.whyBody")}
              </p>
            </Reveal>
            <Reveal variant="scale" delay={0.1} className="mt-7">
              <img
                src={img("/images/home/Mandap_image.webp")}
                srcSet={imgSrcSet(
                  "/images/home/Mandap_image-800.webp 800w, /images/home/Mandap_image.webp 1723w",
                )}
                sizes="(max-width: 1024px) 92vw, 42vw"
                width={1723}
                height={913}
                alt={t("aboutPage.whyTitleA")}
                title={t("aboutPage.whyTitleA")}
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-xl object-contain drop-shadow-sm transition-transform duration-500 hover:scale-[1.01] will-change-transform"
              />
            </Reveal>
          </div>

          {/* Right: 4 points */}
          <RevealGroup
            className="grid gap-6 sm:gap-7 lg:col-span-6"
            stagger={0.09}
          >
            {points.map((p, i) => (
              <div
                key={p.title}
                data-reveal-item
                className="flex items-start gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gold-50 text-gold-600 shadow-xs">
                  <PointIcon index={i} />
                </span>
                <span>
                  <span className="font-display block text-base sm:text-lg font-bold leading-snug text-navy-900">
                    {p.title}
                  </span>
                  <span className="mt-1 block sm:max-w-md md:max-w-full text-xs sm:text-sm leading-relaxed text-ink-600">
                    {p.desc}
                  </span>
                </span>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
