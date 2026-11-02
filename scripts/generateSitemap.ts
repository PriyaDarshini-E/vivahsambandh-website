/**
 * ============================================================================
 * @file scripts/generateSitemap.ts
 * Dynamic Sitemap Generator (Aligned with Enterprise AIA Architecture)
 * ============================================================================
 *
 * WHY:
 * Search engines rely on an accurate, automatically generated XML sitemap to
 * discover and index published pages. Static sitemaps go stale as soon as an
 * editor publishes a new blog or story. The backend `getSitemap` API is the source
 * of truth for all published pages, so the sitemap is built from it dynamically.
 *
 * WHAT:
 * 1. Fetches `https://vivahsambandh.com/crmapi/public/api/getSitemap` at build time.
 * 2. Maps the `data` (static pages) and `blog` posts into canonical URLs with
 *    multi-language alternates (en, hi, x-default).
 * 3. Incorporates all pre-rendered routes discovered in `dist/`.
 * 4. Generates both `dist/sitemap.xml` and `public/sitemap.xml`.
 * 5. Generates `robots.txt` referencing the canonical sitemap URL.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  generateAndSaveSitemap,
  SITE_ORIGIN,
} from '../src/seo/sitemap/generator.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const publicDir = path.resolve(rootDir, 'public')

async function run() {
  console.log('📡 [Sitemap Generator] Fetching live data from getSitemap API...')
  
  const { count, blogCount } = await generateAndSaveSitemap({ rootDir })

  // Generate / synchronize robots.txt with sitemap reference
  const robotsTxt = `User-agent: *
Allow: /

# Private & Admin Endpoints
Disallow: /admin
Disallow: /admin/
Disallow: /super-admin
Disallow: /super-admin/
Disallow: /api/
Disallow: /crmapi/

# Sitemap Reference
Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt.trim() + '\n', 'utf8')
  }

  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt.trim() + '\n', 'utf8')
  }

  console.log(`✅ [Sitemap Generator] Generated dynamic sitemap.xml with ${count} URLs (${blogCount} active blogs) -> dist/ & public/`)
  console.log(`✅ [Sitemap Generator] Generated robots.txt referencing ${SITE_ORIGIN}/sitemap.xml`)
}

run().catch((err) => {
  console.error('❌ [Sitemap Generator] Fatal error:', err)
  process.exit(1)
})
