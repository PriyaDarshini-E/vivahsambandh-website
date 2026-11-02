import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import DropdownScrollGuard from './components/common/DropdownScrollGuard'
import Footer from './components/Footer'
import Header from './components/Header'
import SmoothScroll from './components/motion/SmoothScroll'
import { RouteSkeleton } from './components/skeletons/routeSkeleton'
import type { AppLang } from './i18n'
import { QueryProvider } from './lib/api/queryClient'
import { DEFERRED_SECTION_IDS, whenSectionReady } from './lib/deferredSections'
import { refreshScrollTriggers } from './lib/gsap-setup'
import { getLenis, resolveHashId, scrollToAnchor } from './lib/scroll'
import HomePage from './module/home/pages/HomePage'
import {
  SuperAdminAuthProvider,
  SuperAdminGuard,
} from './module/super-admin/context/SuperAdminAuthContext'

// Code-split non-home routes so the initial homepage bundle is feather-light
const AboutPage = lazy(() => import('./module/about/pages/AboutPage'))
const StoriesPage = lazy(() => import('./module/stories/pages/StoriesPage'))
// const MembershipPage = lazy(() => import('./module/membership/pages/MembershipPage'))
const BlogsPage = lazy(() => import('./module/blog/pages/BlogsPage'))
const BlogDetailPage = lazy(() => import('./module/blog/pages/BlogDetailPage'))
const ContactPage = lazy(() => import('./module/contact/pages/ContactPage'))
const PrivacyPage = lazy(() => import('./module/legal/pages/PrivacyPage'))
const TermsPage = lazy(() => import('./module/legal/pages/TermsPage'))
const GuidelinesPage = lazy(() => import('./module/legal/pages/GuidelinesPage'))
const HelpCenterPage = lazy(() => import('./module/legal/pages/HelpCenterPage'))
const RegistrationPage = lazy(() => import('./module/registration/pages/RegistrationPage'))
const AdminRegisterPage = lazy(() => import('./module/registration/pages/AdminRegisterPage'))
const DownloadPage = lazy(() => import('./module/download/pages/DownloadPage'))
const AppRedirectPage = lazy(() => import('./module/download/pages/AppRedirectPage'))

// Code-split Super Admin Panel module routes
const PanelLoginPage = lazy(() => import('./module/super-admin/pages/PanelLoginPage'))
const PanelNotFoundPage = lazy(
  () => import('./module/super-admin/pages/PanelNotFoundPage'),
)
const NotFoundPage = lazy(() => import('./module/not-found/pages/NotFoundPage'))
const SuperAdminLayout = lazy(() =>
  import('./module/super-admin/components/SuperAdminLayout').then((m) => ({
    default: m.SuperAdminLayout,
  })),
)
const DashboardOverviewPage = lazy(
  () => import('./module/super-admin/pages/DashboardOverviewPage'),
)
const AdminMembersPage = lazy(
  () => import('./module/super-admin/pages/AdminMembersPage'),
)
const PendingAdminMembersPage = lazy(
  () => import('./module/super-admin/pages/PendingAdminMembersPage'),
)
const MembersPage = lazy(() => import('./module/super-admin/pages/MembersPage'))
const PendingMembersPage = lazy(
  () => import('./module/super-admin/pages/PendingMembersPage'),
)
const MemberDetailPage = lazy(
  () => import('./module/super-admin/pages/MemberDetailPage'),
)
const AdminMemberDetailPage = lazy(
  () => import('./module/super-admin/pages/AdminMemberDetailPage'),
)
const FeedbackPage = lazy(() => import('./module/super-admin/pages/FeedbackPage'))
const BlockProfilesPage = lazy(
  () => import('./module/super-admin/pages/BlockProfilesPage'),
)
const NotificationsPage = lazy(
  () => import('./module/super-admin/pages/NotificationsPage'),
)
const PanelBlogsPage = lazy(() => import('./module/super-admin/pages/BlogsPage'))
const PanelBlogGalleryPage = lazy(
  () => import('./module/super-admin/pages/BlogGalleryPage'),
)
const PanelEnquiriesPage = lazy(
  () => import('./module/super-admin/pages/EnquiriesPage'),
)
const PanelFaqsPage = lazy(() => import('./module/super-admin/pages/FaqsPage'))
const PanelTestimonialsPage = lazy(
  () => import('./module/super-admin/pages/TestimonialsPage'),
)
const PanelClientsPage = lazy(
  () => import('./module/super-admin/pages/ClientsPage'),
)
const PanelCategoriesPage = lazy(
  () => import('./module/super-admin/pages/CategoriesPage'),
)
const PanelBlogEditorPage = lazy(
  () => import('./module/super-admin/pages/BlogEditorPage'),
)
const PanelFaqEditorPage = lazy(
  () => import('./module/super-admin/pages/FaqEditorPage'),
)
const PanelNewsletterPage = lazy(
  () => import('./module/super-admin/newsletter/pages/NewsletterPage'),
)

/**
 * URL is the source of truth for language: `/hi*` → Hindi, else English.
 * Covers direct loads, Back/Forward, and language-switch navigations —
 * i18next follows the route instead of fighting it.
 */
function LanguageSync() {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const routeLang: AppLang = pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : 'en'

  useEffect(() => {
    if (i18n.language !== routeLang) {
      void i18n.changeLanguage(routeLang)
    }
  }, [i18n, routeLang])

  return null
}

/**
 * Router scroll behavior (React Router ships none by default):
 * - Page change → instant top (no animated sweep across pages).
 * - Hash change → Lenis smooth-scroll to the anchor; deferred home
 *   sections mount on demand first (same flow as the click interceptor).
 * - First paint is skipped — prerendered HTML + HomePage's own deep-link
 *   effect already own the initial position.
 */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (hash) {
      if (!scrollToAnchor(hash)) {
        const id = resolveHashId(hash)
        if (DEFERRED_SECTION_IDS.has(id)) {
          void whenSectionReady(id).then(() => scrollToAnchor(hash))
        }
      }
    } else {
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
    }
    refreshScrollTriggers()
  }, [pathname, hash])

  return null
}

export default function App() {
  const { i18n } = useTranslation()
  const { pathname } = useLocation()
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const isPanelRoute =
    normalizedPath === '/crm' || normalizedPath.startsWith('/crm/')

  /**
   * Panel screens all sit inside the same guard + layout shell. The editor
   * screens are long forms, so they get a screen of their own instead of a
   * dialog — this wraps whichever one they render.
   */
  const panelScreen = (screen: ReactNode) => (
    <SuperAdminGuard>
      <Suspense fallback={null}>
        <SuperAdminLayout>{screen}</SuperAdminLayout>
      </Suspense>
    </SuperAdminGuard>
  )

  // Translated copy changes layout heights → re-measure ScrollTriggers.
  useEffect(() => {
    const onLangChange = () => refreshScrollTriggers()
    i18n.on('languageChanged', onLangChange)
    return () => {
      i18n.off('languageChanged', onLangChange)
    }
  }, [i18n])

  // Idle route preloading: warm the 1-2 most-likely next chunks after 3.5s.
  // Skipped on Save-Data or 2g/slow-2g to protect constrained connections.
  // Per perf.md Phase 4.1: staggered (never 5 at once), gated on network quality.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || navigator.webdriver) return

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return

    const LIKELY_NEXT = [
      () => import('./module/about/pages/AboutPage'),
      // RegistrationPage removed: 92% unused JS counted against Lighthouse
      // unused-javascript audit. Preloaded on-demand when user visits /about.
    ]

    // requestIdleCallback with 3500ms timeout — falls back to setTimeout on Safari
    const schedule = typeof requestIdleCallback !== 'undefined'
      ? (fn: () => void) => requestIdleCallback(fn, { timeout: 3500 })
      : (fn: () => void) => setTimeout(fn, 3500)

    let cancelled = false
    const id = schedule(() => {
      if (cancelled) return
      // Stagger each preload 400ms apart so they don't race for bandwidth
      LIKELY_NEXT.forEach((load, i) => {
        setTimeout(() => { if (!cancelled) void load().catch(() => {}) }, i * 400)
      })
    })

    return () => {
      cancelled = true
      if (typeof cancelIdleCallback !== 'undefined' && typeof id === 'number') cancelIdleCallback(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <QueryProvider>
      <SuperAdminAuthProvider>
        <Toaster />
        <DropdownScrollGuard />
        {isPanelRoute ? (
          <div className="min-h-screen bg-cream-50">
            <Routes>
              {/* Super Admin Login */}
              <Route path="/crm" element={<PanelLoginPage />} />

              {/* Protected Super Admin Panel Routes */}
              <Route
                path="/crm/dashboard"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <DashboardOverviewPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/admin-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <AdminMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/admin-members/:id"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <AdminMemberDetailPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/pending-admin-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PendingAdminMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/pending-admin-members/:id"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <AdminMemberDetailPage pending />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <MembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/members/:id"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <MemberDetailPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/pending-members"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PendingMembersPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/pending-members/:id"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <MemberDetailPage pending />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/feedback"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <FeedbackPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/block-profiles"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <BlockProfilesPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/notifications"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <NotificationsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/crm/blog-gallery"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelBlogGalleryPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />
              <Route
                path="/crm/gallery"
                element={<Navigate to="/crm/blog-gallery" replace />}
              />
              <Route
                path="/crm/blogs"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelBlogsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              {/* The article form is too long for a dialog — it gets its own screen. */}
              <Route
                path="/crm/blogs/new"
                element={panelScreen(<PanelBlogEditorPage />)}
              />
              <Route
                path="/crm/blogs/:id/edit"
                element={panelScreen(<PanelBlogEditorPage />)}
              />

              <Route
                path="/crm/enquiries"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelEnquiriesPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/crm/faqs"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelFaqsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              {/* A FAQ group holds a stack of questions — it needs a full page. */}
              <Route
                path="/crm/faqs/new"
                element={panelScreen(<PanelFaqEditorPage />)}
              />
              <Route
                path="/crm/faqs/:id/edit"
                element={panelScreen(<PanelFaqEditorPage />)}
              />

              <Route
                path="/crm/testimonials"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelTestimonialsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/crm/clients"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelClientsPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/crm/categories"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelCategoriesPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              <Route
                path="/crm/newsletter"
                element={
                  <SuperAdminGuard>
                    <Suspense fallback={null}>
                      <SuperAdminLayout>
                        <PanelNewsletterPage />
                      </SuperAdminLayout>
                    </Suspense>
                  </SuperAdminGuard>
                }
              />

              {/* Fallback for unmapped panel URLs */}
              <Route path="/crm/*" element={panelScreen(<PanelNotFoundPage />)} />
            </Routes>
          </div>
        ) : (
          <SmoothScroll>
            <div className="min-h-screen bg-cream-50">
              <LanguageSync />
              <ScrollManager />
              <Header />
              {/* Offset for the fixed header (h-16 + 1px border) so page
                  content starts exactly where it did with the sticky header. */}
              <div className="h-[65px]" aria-hidden="true" />
              <main>
                {/*
                  One boundary for the whole public route tree: every page
                  below is a lazy chunk, and the fallback is a placeholder
                  shaped like the page that is loading. A per-route boundary
                  with a null fallback left the content area empty while the
                  chunk downloaded - the visitor saw the header and footer
                  with a hole in between.
                */}
                <Suspense fallback={<RouteSkeleton />}>
                  <Routes>
                    {/* Critical Homepage routes stay static & instant */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/hi" element={<HomePage />} />

                    {/* Other routes split into isolated on-demand chunks */}
                    <Route
                      path="/about"
                      element={<AboutPage />}
                    />
                    <Route
                      path="/hi/about"
                      element={<AboutPage />}
                    />
                    <Route
                      path="/stories"
                      element={<StoriesPage />}
                    />
                    <Route
                      path="/hi/stories"
                      element={<StoriesPage />}
                    />
                    <Route
                      path="/success-stories"
                      element={<StoriesPage />}
                    />
                    <Route
                      path="/hi/success-stories"
                      element={<StoriesPage />}
                    />
                    {/* <Route
                      path="/membership"
                      element={<MembershipPage />}
                    />
                    <Route
                      path="/hi/membership"
                      element={<MembershipPage />}
                    /> */}
                    <Route
                      path="/contact"
                      element={<ContactPage />}
                    />
                    <Route
                      path="/hi/contact"
                      element={<ContactPage />}
                    />
                    <Route
                      path="/download"
                      element={<DownloadPage />}
                    />
                    <Route
                      path="/hi/download"
                      element={<DownloadPage />}
                    />
                    <Route
                      path="/app"
                      element={<AppRedirectPage />}
                    />
                    <Route
                      path="/hi/app"
                      element={<AppRedirectPage />}
                    />
                    <Route
                      path="/registration"
                      element={<RegistrationPage />}
                    />
                    <Route
                      path="/hi/registration"
                      element={<RegistrationPage />}
                    />
                    <Route
                      path="/register"
                      element={<RegistrationPage />}
                    />
                    <Route
                      path="/hi/register"
                      element={<RegistrationPage />}
                    />
                    <Route
                      path="/admin-register"
                      element={<AdminRegisterPage />}
                    />
                    <Route
                      path="/hi/admin-register"
                      element={<AdminRegisterPage />}
                    />
                    <Route
                      path="/blogs"
                      element={<BlogsPage />}
                    />
                    <Route
                      path="/hi/blogs"
                      element={<BlogsPage />}
                    />
                    <Route
                      path="/blogs/:slug"
                      element={<BlogDetailPage />}
                    />
                    <Route
                      path="/hi/blogs/:slug"
                      element={<BlogDetailPage />}
                    />
                    <Route
                      path="/privacy"
                      element={<PrivacyPage />}
                    />
                    <Route
                      path="/hi/privacy"
                      element={<PrivacyPage />}
                    />
                    <Route
                      path="/terms"
                      element={<TermsPage />}
                    />
                    <Route
                      path="/hi/terms"
                      element={<TermsPage />}
                    />
                    <Route
                      path="/guidelines"
                      element={<GuidelinesPage />}
                    />
                    <Route
                      path="/hi/guidelines"
                      element={<GuidelinesPage />}
                    />
                    <Route
                      path="/help-center"
                      element={<HelpCenterPage />}
                    />
                    <Route
                      path="/hi/help-center"
                      element={<HelpCenterPage />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </SmoothScroll>
        )}
      </SuperAdminAuthProvider>
    </QueryProvider>
  )
}

