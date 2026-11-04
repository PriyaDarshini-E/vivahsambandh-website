/**
 * @file src/module/blog/pages/BlogsPage.tsx
 * Blogs listing page — fetches the full directory via `getBlogs`
 * and renders every article as a card grid, with a category filter rail.
 *
 * The filter is built from the articles themselves: `/getBlogs` already
 * resolves the category name of every row, and the category endpoints sit
 * behind the panel's authentication, so the public page does not need them.
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import PageParallax from '../../../components/motion/PageParallax'
import { useBlogsQuery } from '../hook/useBlogs'
import BlogCard from '../components/BlogCard'
import { cn } from 'cn'

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-[#EADDC3] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.06)]"
        >
          <div className="aspect-[16/9] w-full animate-pulse bg-slate-100" />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="min-h-[3.25rem] space-y-2 sm:min-h-[3.5rem]">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mt-2 min-h-[3.9rem] space-y-2.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3.5 w-3/5 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-auto pt-4">
              <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BlogsPage() {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useBlogsQuery()
  const [activeCategory, setActiveCategory] = useState('')

  const items = (data?.data ?? []).filter((b) => b.blog_title?.trim())
  const imageBase = data?.image_url

  // Every article carries the name of the category it belongs to, so the
  // filter rail is built from the articles the page already has.
  const categories = useMemo(() => {
    const names = new Set<string>()

    for (const item of items) {
      const name = (item.categories ?? '').trim()
      if (name) names.add(name)
    }

    return [...names].sort((a, b) => a.localeCompare(b))
  }, [items])

  const visibleItems = useMemo(() => {
    if (!activeCategory) return items

    return items.filter(
      (item) => (item.categories ?? '').trim() === activeCategory,
    )
  }, [activeCategory, items])

  return (
    <div className="relative overflow-hidden bg-[#FFFBF2]">
      <PageParallax />

      {/* Hero */}
      <section className="section-pad relative z-10 pt-10 pb-4 text-center sm:pt-14">
        <Reveal variant="up" className="mx-auto max-w-2xl">
          <div className="eyebrow mx-auto justify-center">
            <span className="text-gold-500">✦</span>
            <span>{t('blogsPage.eyebrow', 'Our blog')}</span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
            <span>{t('blogsPage.titleA', 'All')} </span>
            <span className="text-gold-500">{t('blogsPage.titleB', 'Stories & Articles.')}</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
            {t('blogsPage.subtitle', 'Browse every article, guide and community update from Vivah Sambandh.')}
          </p>
        </Reveal>
      </section>

      {/* Category filter */}
      {categories.length > 0 ? (
        <div className="section-pad relative z-10 pt-8">
          <div
            role="group"
            aria-label={t('blogsPage.categoryFilter', 'Filter articles by category')}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              aria-pressed={activeCategory === ''}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition-colors duration-200',
                activeCategory === ''
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-cream-300 bg-white text-navy-900 hover:border-gold-500/60 hover:bg-gold-50',
              )}
            >
              {t('blogsPage.allCategories', 'All')}
            </button>

            {categories.map((category) => {
              const isActive = activeCategory === category

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(isActive ? '' : category)}
                  aria-pressed={isActive}
                  className={cn(
                    'cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition-colors duration-200',
                    isActive
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-cream-300 bg-white text-navy-900 hover:border-gold-500/60 hover:bg-gold-50',
                  )}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Listing */}
      <section className="section-pad relative z-10 py-10 sm:py-14">
        <h2 className="sr-only">{t('blogsPage.listingTitle', 'Articles')}</h2>
        {isPending ? (
          <ListingSkeleton />
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900">
              {t('blogsPage.loadErrorTitle', 'Could not load blogs')}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {t('blogsPage.loadErrorDesc', 'Something went wrong while fetching articles. Please try again.')}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="btn-primary mt-5 inline-flex !px-6 !py-2.5 cursor-pointer"
            >
              {t('blogsPage.retry', 'Try again')}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900">
              {t('blogsPage.emptyTitle', 'No articles yet')}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {t('blogsPage.emptyDesc', 'New stories are on the way — please check back soon.')}
            </p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900">
              {t('blogsPage.noCategoryArticles', 'No articles in this category yet')}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {t('blogsPage.noCategoryArticlesDesc', 'Pick another category to keep reading.')}
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className="btn-primary mt-5 inline-flex !px-6 !py-2.5 cursor-pointer"
            >
              {t('blogsPage.allCategories', 'All')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {visibleItems.map((item) => (
              <BlogCard key={item.blog_slug || item.id} item={item} imageBase={imageBase} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
