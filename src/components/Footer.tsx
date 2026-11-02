import { useTranslation } from "react-i18next";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { COMPANY } from "../constants/company";
import { getNavItems, pagePath } from "../constants/navigation";
import type { AppLang } from "../i18n";
import { useAppLanguage } from "../i18n/useAppLanguage";
import Reveal from "./motion/Reveal";
import { useCompanyDetails } from "../module/company";
import { NewsletterSignup } from "../module/newsletter";
import { img, imgSrcSet } from "../lib/image";
import CompanyLogo from "./CompanyLogo";

export default function Footer() {
  const { t } = useTranslation();
  const { lang } = useAppLanguage();
  const appLang: AppLang = lang === "hi" ? "hi" : "en";
  const { pathname } = useLocation();

  // Quick links mirror the header nav (central model) so new routes
  // appear in both places automatically. <Link> = no page refresh.
  const quickLinks = getNavItems(t, appLang, pathname);

  const support = [
    { label: t("footer.privacy"), href: pagePath("/privacy", appLang) },
    { label: t("footer.terms"), href: pagePath("/terms", appLang) },
  ];

  const company = useCompanyDetails(appLang);
  const { phone, phoneLink, email, address, socials } = company;

  return (
    <footer className="relative overflow-hidden bg-navy-pattern text-white">
      {/* Temple Skyline Divider as footer background — behind the text, not a separate section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none"
      >
        <img
          src={img("/images/common/Temple_Skyline_Divider_footer_image.webp")}
          srcSet={imgSrcSet(
            "/images/common/Temple_Skyline_Divider_footer_image-1024.webp 1024w, /images/common/Temple_Skyline_Divider_footer_image.webp 2171w",
          )}
          sizes="100vw"
          width={2171}
          height={724}
          alt="Temple skyline divider"
          title="Temple skyline divider"
          decoding="async"
          className="absolute opacity-5 inset-x-0 -bottom-4 sm:bottom-6 h-auto w-full"
          loading="lazy"
        />
      </div>

      {/* Newsletter Signup — one form on every page */}
      <div className="section-pad relative z-10 pt-14 sm:pt-16">
        <Reveal variant="up">
          <NewsletterSignup variant="band" />
        </Reveal>
      </div>

      <div className="section-pad overflow-hidden relative z-10 grid grid-cols-2 gap-x-6 gap-y-8 pt-16 pb-10 sm:gap-10 sm:pt-24 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* Brand & Socials Column */}
        <Reveal variant="up" className="col-span-2 md:col-span-1">
          <div>
            <div className="flex items-center gap-2.5">
              <CompanyLogo
                className="h-13 w-auto"
                fallbackClassName="h-13 w-13 text-gold-400"
                width={211}
                height={52}
              />
              {/* <div>
                <p className="font-display text-xl font-bold leading-none text-white">
                  {company.name}
                </p>
                <p className="mt-1 text-[10px] font-sans font-semibold uppercase tracking-[0.24em] text-gold-300">
                  {t("meta.tagline")}
                </p>
              </div> */}
            </div>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/70 sm:text-sm">
              {t("footer.about")}
            </p>

            {/* Social Icons — dynamic from getCompany API with canonical fallbacks */}
            <div className="mt-6 flex items-center gap-3">
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-[0_4px_12px_rgba(24,119,242,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(24,119,242,0.55)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
              )}

              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-[0_4px_12px_rgba(221,42,123,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(221,42,123,0.55)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-[0_4px_12px_rgba(255,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(255,0,0,0.55)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}

              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A66C2] text-white shadow-[0_4px_12px_rgba(10,102,194,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(10,102,194,0.55)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 010-2.9 1.45 1.45 0 010 2.9M5.08 18.5h2.76v-8.37H5.08v8.37z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </Reveal>

        {/* Quick Links Column */}
        <Reveal variant="up" delay={0.08}>
          <nav aria-label="Quick links">
            <p className="text-[15px] font-bold text-white">
              {t("footer.quickLinks")}
            </p>
            <ul className="mt-3.5 space-y-2 text-xs text-white/75 sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  {link.href.startsWith("#") ? (
                    <a
                      href={link.href}
                      title={link.label}
                      className="transition hover:text-gold-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      title={link.label}
                      className="transition hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* Support Column */}
        <Reveal variant="up" delay={0.14}>
          <nav aria-label="Support">
            <p className="text-[15px] font-bold text-white">
              {t("footer.support")}
            </p>
            <ul className="mt-3.5 space-y-2 text-xs text-white/75 sm:text-sm">
              {support.map((l) => (
                <li key={l.label}>
                  {l.href === "/sitemap.xml" ? (
                    <a
                      href={l.href}
                      title={l.label}
                      className="transition hover:text-gold-300"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      to={l.href}
                      title={l.label}
                      className="transition hover:text-gold-300"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* Contact Info Column (Directly from COMPANY constants) */}
        <Reveal variant="up" delay={0.2} className="col-span-2 md:col-span-1">
          <div>
            <p className="text-[15px] font-bold text-white">
              {t("footer.contactUs")}
            </p>
            <ul className="mt-3.5 space-y-2.5 text-xs text-white/75 sm:text-sm">
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-gold-400"
                  aria-hidden="true"
                />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="size-4 shrink-0 text-gold-400"
                  aria-hidden="true"
                />
                <a
                  href={phoneLink}
                  title={phone}
                  className="transition hover:text-gold-300"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="size-4 shrink-0 text-gold-400"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${email}`}
                  title={email}
                  className="transition hover:text-gold-300"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="relative z-10 py-6">
        <div className="section-pad flex flex-col items-center justify-between gap-2 py-3 text-xs text-white/60 sm:flex-row">
          <p>
            © {COMPANY.copyrightYear} {company.name}.{" "}
            {t("footer.rights").replace(/© \d+ [^.]+\./, "")}
          </p>
          <p className="font-semibold tracking-wide text-gold-300/90">
            {t("footer.madeWith")}{" "}
            <Heart
              className="inline size-3.5 text-maroon-500"
              aria-hidden="true"
            />{" "}
            {company.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
