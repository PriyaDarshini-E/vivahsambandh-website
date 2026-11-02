import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { SeoHost } from './seo/seo.tsx'
import { initDeferredGTM } from './lib/gtm'

/**
 * Shared client/server root tree.
 *
 * Rendered to static HTML at build time (see `src/seo/prerender.tsx`) and
 * hydrated in the browser (see `src/main.tsx`). Both paths MUST render the
 * exact same tree or hydration mismatches will force a client re-render.
 */
export default function Root() {
  // The static boot placeholder (index.html) covers routes the build did not
  // prerender. The app shell is on screen by now, so the placeholder can go.
  useEffect(() => {
    document.getElementById('app-boot')?.remove()
  }, [])

  // Initialize GTM with non-blocking deferred loading
  useEffect(() => {
    return initDeferredGTM()
  }, [])

  return (
    <HelmetProvider>
      <App />
      <SeoHost />
    </HelmetProvider>
  )
}
