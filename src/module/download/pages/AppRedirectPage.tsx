/**
 * @file src/module/download/pages/AppRedirectPage.tsx
 * Smart App Redirect page (/app and /hi/app).
 * Detects visitor's Operating System / Device:
 * - iOS / macOS (iPhone, iPad, iPod, Mac) -> App Store link
 * - Android / Windows / Others           -> Google Play Store link
 *
 * Dynamically retrieves store links from getCompany API with canonical fallbacks.
 */

import { useEffect } from 'react'
import { useCompanyDetails } from '@/module/company'
import { Loader2 } from 'lucide-react'

function detectIsAppleDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || ''

  // 1. Explicit iOS checks
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream) {
    return true
  }

  // 2. Modern iPadOS reports as Macintosh with maxTouchPoints
  if (/Macintosh/.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
    return true
  }

  // 3. macOS
  if (/Mac OS X|Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    return true
  }

  return false
}

export default function AppRedirectPage() {
  const { apps, isPending } = useCompanyDetails()

  useEffect(() => {
    // Only redirect once company details have resolved (or fallback loaded)
    if (isPending) return

    const isApple = detectIsAppleDevice()
    const targetUrl = isApple ? apps.appStore : apps.playStore

    if (targetUrl) {
      // Direct replace so Back button doesn't trap the user in the redirect loop
      window.location.replace(targetUrl)
    }
  }, [apps, isPending])

  const isApple = typeof window !== 'undefined' ? detectIsAppleDevice() : false
  const targetUrl = isApple ? apps.appStore : apps.playStore
  const storeName = isApple ? 'App Store' : 'Google Play Store'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-lg max-w-md w-full">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm mb-4">
          <Loader2 className="size-7 animate-spin" />
        </span>

        <h1 className="font-display text-xl font-bold text-navy-950 sm:text-2xl">
          Redirecting to {storeName}...
        </h1>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">
          Please wait while we transfer you to our official mobile application on {storeName}.
        </p>

        {targetUrl && (
          <div className="mt-6 pt-5 border-t border-stone-100">
            <a
              href={targetUrl}
              className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 shadow-md"
            >
              Click here if not redirected automatically
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

