import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useCompanyDetails } from "../module/company";
import LanguageSwitcher from "./LanguageSwitcher";
import { ensureMotion, prefersReducedMotion } from "../lib/gsap-setup";
import { Link, useLocation } from "react-router-dom";
import { getNavItems, homePath } from "../constants/navigation";
import type { AppLang } from "../i18n";
import { lockPageScroll, unlockPageScroll } from "../lib/scroll";
import CompanyLogo from "./CompanyLogo";

const MobileDrawer = lazy(() => import("./MobileDrawer"));

export default function Header() {
  const { t, i18n } = useTranslation();
  const company = useCompanyDetails();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Navigation derives from the central model (constants/navigation):
  // labels via i18n, hrefs lang-prefixed, active state from the route.
  // <Link> client-navigates (no page refresh); same-page hashes are still
  // owned by the SmoothScroll interceptor + ScrollManager.
  const lang: AppLang =
    i18n.resolvedLanguage === "hi" || i18n.language === "hi" ? "hi" : "en";
  const { pathname } = useLocation();
  const navItems = getNavItems(t, lang, pathname);
  const brandHref = homePath(lang);

  // Entrance only — the header itself stays pinned to the top at all times.
  // Motion loads lazily: desktop enhances on mount; mobile waits for first
  // scroll/touch or idle so header motion never steals LCP bandwidth.
  useEffect(() => {
    let cancelled = false;

    const wireMotion = () => {
      if (cancelled) return;
      void ensureMotion()
        .then(({ gsap }) => {
          const header = headerRef.current;
          if (cancelled || !header || prefersReducedMotion()) return;

          // Entrance: slide down only on desktop first view of the tab session
          if (window.innerWidth >= 768) {
            let firstView = true;
            try {
              firstView = sessionStorage.getItem("vivah-header-seen") === null;
              sessionStorage.setItem("vivah-header-seen", "1");
            } catch {
              firstView = true;
            }
            if (firstView) {
              gsap.from(header, {
                y: -72,
                autoAlpha: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.1,
                overwrite: "auto",
              });
            }
          }
        })
        .catch(() => {
          /* motion failed to load — header stays visible and static */
        });
    };

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const timer = setTimeout(wireMotion, 6000);
      const onMove = () => {
        clearTimeout(timer);
        wireMotion();
      };
      window.addEventListener("scroll", onMove, { once: true, passive: true });
      window.addEventListener("touchstart", onMove, {
        once: true,
        passive: true,
      });
      return () => {
        cancelled = true;
        clearTimeout(timer);
        window.removeEventListener("scroll", onMove);
        window.removeEventListener("touchstart", onMove);
      };
    }

    wireMotion();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bottom-sheet drawer state. onOpenChange is the single sync point —
  // covers trigger taps, backdrop taps, swipe-to-dismiss and Escape.
  // NOTE: side-effects stay outside the setState updater (StrictMode
  // double-invokes updaters — locking inside would lock/unlock twice).
  const syncDrawer = (next: boolean) => {
    setOpen(next);
    if (next) lockPageScroll();
    else unlockPageScroll();
  };
  const toggleDrawer = () => syncDrawer(!open);
  const closeDrawer = () => syncDrawer(false);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-gold-500/25 bg-cream-50/90 backdrop-blur will-change-transform"
    >
      <div className="section-pad flex h-16 items-center justify-between gap-4 sm:gap-3">
        {/* Brand Logo */}
        <Link
          to={brandHref}
          title={company.name}
          className="flex min-w-0 items-center gap-4 transition hover:opacity-95"
        >
          <span className="flex shrink-0 items-center rounded-lg px-2 py-1.5">
              <CompanyLogo className="h-8 w-auto sm:h-9" width={154} height={38} />
            </span>
          {/* <span className="min-w-0 leading-none">
            <span className="font-display block truncate text-base font-bold text-navy-900 sm:text-xl">
              {company.name}
            </span>
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-700 sm:text-[10px]">
              {t("meta.tagline")}
            </span>
          </span> */}
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-3 text-sm font-medium text-navy-900/80 lg:flex xl:gap-5"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              title={item.label}
              className={`transition hover:text-maroon-600 ${
                item.active
                  ? "font-bold text-maroon-600 underline decoration-gold-500 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls: Language Switcher, Create Profile */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageSwitcher />
          <Link
            to={lang === "hi" ? "/hi/registration" : "/registration"}
            title={t("header.createProfile")}
            className="btn-primary !px-5 !py-2 text-[13px]"
          >
            {t("header.createProfile")}
          </Link>
        </div>

        {/* Mobile Menu Button & Language Switcher */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={toggleDrawer}
            aria-expanded={open}
            aria-label="Menu"
            className="rounded-full border border-gold-500/40 p-2 text-navy-900 hover:bg-gold-100"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile bottom-sheet menu (lazy-loaded so @base-ui never contends with hero LCP) */}
      {open && (
        <Suspense fallback={null}>
          <MobileDrawer
            open={open}
            onOpenChange={syncDrawer}
            navItems={navItems}
            closeDrawer={closeDrawer}
            t={t}
          />
        </Suspense>
      )}
    </header>
  );
}
