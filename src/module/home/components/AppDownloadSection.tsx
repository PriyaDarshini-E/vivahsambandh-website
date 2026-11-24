import { useTranslation } from "react-i18next";
import { COMPANY } from "../../../constants/company";
import { useCompanyDetails } from "../../company";
import type { AppFeature } from "../types";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { img, imgSrcSet } from "../../../lib/image";
import SectionBrandMark from "../../../components/SectionBrandMark";

function AppFeatureIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      // Instant Notifications (Bell)
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );
    case 1:
      // Smart Search Filters (Filter)
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      );
    case 2:
      // Profile Management (User profile)
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
    case 3:
      // Secure Communication (Lock/chat)
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      );
    default:
      // User Friendly Interface (Sparkle / Interface)
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
          />
        </svg>
      );
  }
}

export default function AppDownloadSection() {
  const { t } = useTranslation();
  const company = useCompanyDetails();
  const rawFeatures =
    (t("app.features", { returnObjects: true }) as AppFeature[]) || [];

  return (
    <section className="relative overflow-hidden py-12">
      <div className="section-pad">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading, Copy & App Store Buttons */}
          <Reveal variant="left" className="lg:col-span-4">
            <div className="eyebrow">
              <SectionBrandMark />
              <span>{t("app.eyebrow")}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              {t("app.title")}
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-ink-600 sm:text-base">
              {t("app.body")}
            </p>

            {/* Store Download Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <a
                href={company.apps.playStore || "https://play.google.com/store/apps/details?id=com.vs.agsolution"}
                target="_blank"
                rel="noopener noreferrer"
                title="Google Play"
                className="inline-flex items-center gap-3 rounded-xl border border-navy-900 bg-navy-900 px-4 py-2.5 text-white shadow-md transition hover:bg-navy-800"
              >
                <img
                  src={img("/images/common/google-play-store.webp")}
                  width={48}
                  height={48}
                  alt="Get it on Google Play"
                  title="Google Play"
                  aria-hidden="true"
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
                <div className="text-left leading-none">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70">
                    GET IT ON
                  </span>
                  <span className="block text-xs font-bold text-white sm:text-sm">
                    Google Play
                  </span>
                </div>
              </a>

              <a
                href={company.apps.appStore}
                target="_blank"
                rel="noopener noreferrer"
                title="App Store"
                className="inline-flex items-center gap-3 rounded-xl border border-navy-900 bg-navy-900 px-4 py-2.5 text-white shadow-md transition hover:bg-navy-800"
              >
                <img
                  src={img("/images/common/app-store.webp")}
                  width={48}
                  height={48}
                  alt="Download on the App Store"
                  title="App Store"
                  aria-hidden="true"
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
                <div className="text-left leading-none">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70">
                    Download on the
                  </span>
                  <span className="block text-xs font-bold text-white sm:text-sm">
                    App Store
                  </span>
                </div>
              </a>
            </div>
          </Reveal>

          {/* Center Column: Mobile App Showcase Mockup */}
          <Reveal variant="scale" delay={0.1} className="flex justify-center lg:col-span-5">
            <div className="relative mx-auto max-w-[440px] drop-shadow-2xl transition-transform duration-700 hover:scale-105 sm:max-w-[520px]">
              <img
                src={img("/images/home/vivahsambandh-app-image.webp")}
                srcSet={imgSrcSet("/images/home/vivahsambandh-app-image-800.webp 800w, /images/home/vivahsambandh-app-image.webp 1426w")}
                sizes="(max-width: 640px) 90vw, 32rem"
                width={1426}
                height={1103}
                alt={`${COMPANY.name} Mobile App Interface`}
                title={`${COMPANY.name} Mobile App Interface`}
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </Reveal>

          {/* Right Column: 5 Features List with Maroon Circular Badges */}
          <RevealGroup className="space-y-1 lg:col-span-3">
            {rawFeatures.map((f, i) => (
              <div
                key={f.title}
                data-reveal-item
                className="flex items-center gap-3.5 p-3.5 bg-white/60 transition-all duration-300 hover:border-gold-500"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-600 text-white shadow-xs">
                  <AppFeatureIcon index={i} />
                </div>
                <div className="leading-tight">
                  <h3 className="text-xs font-bold text-navy-900 sm:text-sm">
                    {f.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-ink-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
