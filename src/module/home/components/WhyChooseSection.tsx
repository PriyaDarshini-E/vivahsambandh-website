import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { WhyFeature } from "../types";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { pagePath } from "../../../constants/navigation";
import type { AppLang } from "../../../i18n";
import { img, imgSrcSet } from "../../../lib/image";
import SectionBrandMark from "../../../components/SectionBrandMark";

// Bespoke golden Mughal/Indian arched icons matching the design screenshot
function renderFeatureIcon(index: number) {
  switch (index % 6) {
    case 0:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
          <path d="M6 19.5c0-2.8 2.7-4.5 6-4.5" />
          <circle
            cx="17.5"
            cy="17.5"
            r="3.5"
            fill="#f4d894"
            strokeWidth="1.2"
          />
          <path
            d="M16 17.5l1 1 2-2"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 1:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M9 11a3 3 0 100-6 3 3 0 000 6zM16 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path d="M4.5 19c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
          <path d="M13.5 15c.5-.4 1.3-.7 2.5-.7 2.2 0 4 1.3 4 3.7" />
        </svg>
      );
    case 2:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="5" />
          <path d="M15 15l4.5 4.5" strokeLinecap="round" />
          <path d="M8 8h6M9 11h4M10 14h2" strokeLinecap="round" />
        </svg>
      );
    case 3:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M10 12a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M5 19c0-2.5 2.2-4 5-4" />
          <path
            d="M16 12.5c-.8-1-2.2-.8-2.6.3-.4-1.1-1.8-1.3-2.6-.3-1 1.2 0 2.5 2.6 4.5 2.6-2 3.6-3.3 2.6-4.5z"
            fill="#f4d894"
            strokeWidth="1.3"
          />
        </svg>
      );
    case 4:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            d="M12 4v16M8 8l4-4 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 14c0-2 1.5-3 3-3h6c1.5 0 3 1 3 3v4H6v-4z" />
          <circle cx="9" cy="8" r="1.5" />
          <circle cx="15" cy="8" r="1.5" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-gold-700 fill-none stroke-current"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 3s6 2 6 7c0 5-3.5 8.5-6 9.5C9.5 18.5 6 15 6 10c0-5 6-7 6-7z" />
          <path d="M10 11.5v-1a2 2 0 114 0v1" strokeLinecap="round" />
          <rect x="9" y="11.5" width="6" height="4" rx="1" fill="#f4d894" />
        </svg>
      );
  }
}

// Bespoke golden Mughal/Indian arched icons matching the design screenshot
function FeatureArchedIcon({ index }: { index: number }) {
  return (
    <div className="relative -mb-4 sm:-mb-4.5 lg:-mb-5 flex w-[52px] sm:w-[56px] lg:w-[58px] shrink-0 items-center justify-center self-stretch rounded-t-[20px] sm:rounded-t-[24px] rounded-b-none border border-b-0 border-gold-500/40 bg-gradient-to-b from-[#FFF7E8] to-[#FCEECC] text-gold-700 shadow-2xs transition-all duration-300 group-hover:border-gold-600 group-hover:from-[#FFF2D6] group-hover:to-[#FBE2A4] group-hover:shadow-xs">
      <div className="transition-transform duration-300 group-hover:scale-105">
        {renderFeatureIcon(index)}
      </div>
    </div>
  );
}

export default function WhyChooseSection() {
  const { t, i18n } = useTranslation();
  const lang: AppLang =
    i18n.resolvedLanguage === "hi" || i18n.language === "hi" ? "hi" : "en";
  const rawFeatures =
    (t("why.features", { returnObjects: true }) as WhyFeature[]) || [];

  return (
    <section
      id="explore-features"
      className="relative overflow-hidden bg-[#071833] py-14 sm:py-16 lg:py-20"
    >
      {/* Ornate Corner Filigree — desktop only. On phones the full-height
          sides overwhelm the copy, so mobile gets a soft gold glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 z-0 h-64 w-72 -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl select-none lg:hidden"
      />
      <img
        src={img("/images/home/Ornate_Corner_Filigree_image.webp")}
        srcSet={imgSrcSet(
          "/images/home/Ornate_Corner_Filigree_image-480.webp 480w, /images/home/Ornate_Corner_Filigree_image.webp 948w",
        )}
        sizes="13rem"
        width={948}
        height={1659}
        alt="Ornate golden filigree decoration"
        title="Ornate golden filigree decoration"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 -left-4 scale-105 opacity-65 z-0 h-full w-auto max-w-none select-none hidden lg:block"
      />

      <img
        src={img("/images/home/Ornate_Corner_Filigree_image.webp")}
        srcSet={imgSrcSet(
          "/images/home/Ornate_Corner_Filigree_image-480.webp 480w, /images/home/Ornate_Corner_Filigree_image.webp 948w",
        )}
        sizes="13rem"
        width={948}
        height={1659}
        alt="Ornate golden filigree decoration"
        title="Ornate golden filigree decoration"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 -right-4 scale-105 opacity-65 z-0 h-full w-auto max-w-none rotate-180 select-none hidden lg:block"
      />

      <div className="section-pad relative z-10 !max-w-[1440px] !pl-5 !pr-5 md:px-0 lg:!pl-[72px] lg:!pr-[72px] xl:!pl-[88px] xl:!pr-[88px]">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* ========================================================== */}
          {/* Left Column: Eyebrow, Heading, Subtitle, and Gold CTA Button*/}
          {/* ========================================================== */}
          <Reveal
            variant="left"
            className="lg:col-span-4 xl:col-span-4 min-w-0 z-10"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2">
              <SectionBrandMark />
              <span
                data-eyebrow
                className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-400"
              >
                {t("why.eyebrow")}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-display mt-3 text-2xl sm:text-3xl lg:text-[32px] xl:text-[38px] font-bold leading-[1.2] text-white break-words [overflow-wrap:anywhere]">
              {t("why.title")}
            </h2>

            {/* Subtitle */}
            <p className="mt-3.5 max-w-md text-xs sm:text-sm lg:text-base leading-relaxed text-white/80 font-medium">
              {t("why.subtitle")}
            </p>

            {/* CTA Button in rich golden gradient */}
            <div className="mt-7">
              <Link
                to={pagePath("/register", lang)}
                title={t("why.cta")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r text-white from-gold-400 via-gold-500 to-gold-400 px-7 py-3 text-xs sm:text-sm font-bold text-navy-950 shadow-md transition-all duration-300 hover:brightness-105 active:scale-95"
              >
                <span>{t("why.cta")}</span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          {/* ========================================================== */}
          {/* Right Column: 3-column x 2-row Grid of Feature Cards       */}
          {/* ========================================================== */}
          <div className="lg:col-span-8 xl:col-span-8 min-w-0 z-10">
            <RevealGroup className="mx-auto grid w-full max-w-[560px] grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4">
              {rawFeatures.map((f, i) => {
                const words = f.title.split(" ");
                const allExceptLast = words.slice(0, -1).join(" ");
                const lastWord = words[words.length - 1];

                return (
                  <div
                    key={f.title}
                    data-reveal-item
                    className="group relative overflow-hidden flex items-center gap-3 sm:gap-3.5 rounded-xl sm:rounded-2xl border border-gold-500/30 bg-white p-3.5 sm:p-4 min-h-[86px] sm:min-h-[82px] lg:min-h-[76px] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-xl hover:shadow-gold-500/10 cursor-pointer"
                  >
                    {/* Bespoke Arched Icon */}
                    <FeatureArchedIcon index={i} />

                    {/* Title with protected arrow to prevent orphan wraps */}
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-sans text-[11px] sm:text-xs lg:text-[12px] font-bold text-navy-950 leading-snug transition-colors group-hover:text-maroon-700">
                        {allExceptLast}{" "}
                        <span className="inline-block whitespace-nowrap">
                          {lastWord}
                          <span
                            className="ml-1.5 inline-block text-gold-600 font-bold transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </span>
                      </h3>
                    </div>
                  </div>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
