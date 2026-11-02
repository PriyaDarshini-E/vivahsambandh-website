import { useEffect, useRef, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SmoothScroll from "./components/motion/SmoothScroll";
import { getLenis, resolveHashId, scrollToAnchor } from "./lib/scroll";
import { DEFERRED_SECTION_IDS, whenSectionReady } from "./lib/deferredSections";
import { refreshScrollTriggers } from "./lib/gsap-setup";
import HomePage from "./module/home/pages/HomePage";
import AboutPage from "./module/about/pages/AboutPage";
import StoriesPage from "./module/stories/pages/StoriesPage";
// import MembershipPage from './module/membership/pages/MembershipPage'
import BlogsPage from "./module/blog/pages/BlogsPage";
import {
  PrivacyPage,
  TermsPage,
  GuidelinesPage,
  HelpCenterPage,
} from "./module/legal";
import ContactPage from "./module/contact/pages/ContactPage";
import RegistrationPage from "./module/registration/pages/RegistrationPage";
import AdminRegisterPage from "./module/registration/pages/AdminRegisterPage";
import DownloadPage from "./module/download/pages/DownloadPage";
import AppRedirectPage from "./module/download/pages/AppRedirectPage";
import NotFoundPage from "./module/not-found/pages/NotFoundPage";
import { QueryProvider } from "./lib/api/queryClient";
import type { AppLang } from "./i18n";

// Dynamic route loaded lazily
const BlogDetailPage = lazy(() => import("./module/blog/pages/BlogDetailPage"));

function LanguageSync() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const routeLang: AppLang =
    pathname === "/hi" || pathname.startsWith("/hi/") ? "hi" : "en";

  useEffect(() => {
    if (i18n.language !== routeLang) {
      void i18n.changeLanguage(routeLang);
    }
  }, [i18n, routeLang]);

  return null;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) {
      if (!scrollToAnchor(hash)) {
        const id = resolveHashId(hash);
        if (DEFERRED_SECTION_IDS.has(id)) {
          void whenSectionReady(id).then(() => scrollToAnchor(hash));
        }
      }
    } else {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }
    refreshScrollTriggers();
  }, [pathname, hash]);

  return null;
}

export default function AppServer() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const onLangChange = () => refreshScrollTriggers();
    i18n.on("languageChanged", onLangChange);
    return () => {
      i18n.off("languageChanged", onLangChange);
    };
  }, [i18n]);

  return (
    <QueryProvider>
      {/*
        The toast container has to exist in the prerendered markup as well.
        It renders a plain <div>, so leaving it out of the server tree made
        the client's first child differ from the server's — React threw
        hydration error #418 and threw the whole prerendered page away,
        re-rendering it from scratch on every load.
      */}
      <Toaster />
      <SmoothScroll>
        <div className="min-h-screen bg-cream-50">
          <LanguageSync />
          <ScrollManager />
          <Header />
          {/* Mirror of the client tree's fixed-header offset — keeps the
              prerendered markup and the first client render identical. */}
          <div className="h-[65px]" aria-hidden="true" />
          <main>
            {/*
              Mirrors the client tree's boundary in App.tsx. The server never
              suspends here (every page below is imported eagerly), but the
              boundary has to exist on both sides so the hydrated markup is
              identical - a Suspense boundary adds no DOM, so the two trees
              stay in lockstep and the home route hydrates without a mismatch.
            */}
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hi" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/hi/about" element={<AboutPage />} />
                <Route path="/stories" element={<StoriesPage />} />
                <Route path="/hi/stories" element={<StoriesPage />} />
                <Route path="/success-stories" element={<StoriesPage />} />
                <Route path="/hi/success-stories" element={<StoriesPage />} />
                {/* <Route path="/membership" element={<MembershipPage />} />
                <Route path="/hi/membership" element={<MembershipPage />} /> */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/hi/contact" element={<ContactPage />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/hi/download" element={<DownloadPage />} />
                <Route path="/app" element={<AppRedirectPage />} />
                <Route path="/hi/app" element={<AppRedirectPage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/hi/registration" element={<RegistrationPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/hi/register" element={<RegistrationPage />} />
                <Route path="/admin-register" element={<AdminRegisterPage />} />
                <Route
                  path="/hi/admin-register"
                  element={<AdminRegisterPage />}
                />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/hi/blogs" element={<BlogsPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/hi/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/hi/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/hi/terms" element={<TermsPage />} />
                <Route path="/guidelines" element={<GuidelinesPage />} />
                <Route path="/hi/guidelines" element={<GuidelinesPage />} />
                <Route path="/help-center" element={<HelpCenterPage />} />
                <Route path="/hi/help-center" element={<HelpCenterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </QueryProvider>
  );
}
