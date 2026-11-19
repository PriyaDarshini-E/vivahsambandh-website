/**
 * @file src/module/blog/components/BlogSection.tsx
 * Reusable homepage blog rail. Same card UI for both variants —
 * only the data source differs (`featured` vs `front`).
 * Single horizontal scroll row (never a multi-row grid).
 * Hides completely when neither API nor fallbackItems yield items.
 */

import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, A11y } from 'swiper/modules'
import Reveal from '../../../components/motion/Reveal'
import { Bar } from '../../../components/skeletons/skeletonShapes'
import { useFeaturedBlogsQuery, useFrontBlogsQuery } from '../hook/useBlogs'
import type { BlogItem } from '../types'
import BlogCard from './BlogCard'
import SectionBrandMark from '../../../components/SectionBrandMark'

import 'swiper/css'
import 'swiper/css/navigation'

export interface BlogSectionProps {
  variant: 'featured' | 'front'
  id?: string
  titleA?: string
  titleB?: string
  subtitle?: string
  eyebrow?: string
  tone?: 'cream' | 'paper' | 'navy'
  fallbackItems?: BlogItem[]
  maxItems?: number
}

/**
 * Placeholder for the blog rail while the API call is in flight.
 *
 * The rail used to render nothing while pending, so the section collapsed to
 * zero height and the page jumped when the articles arrived.
 */
function BlogRailSkeleton({ tone }: { tone: 'cream' | 'paper' | 'navy' }) {
  const dark = tone === 'navy'
  const bgCls =
    tone === 'navy'
      ? 'bg-[#0B1526]'
      : tone === 'cream'
        ? 'bg-[#FFFBF2]'
        : 'bg-cream-50'
  const blockTone = dark ? ('dark' as const) : ('light' as const)

  return (
    <section
      aria-busy="true"
      role="status"
      aria-label="Loading articles"
      className={`relative overflow-hidden py-12 ${bgCls}`}
    >
      <div className="section-pad relative z-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Bar tone={blockTone} className="mx-auto h-3 w-28 rounded-full bg-gold-200/80" />
          <Bar tone={blockTone} className="mx-auto h-9 w-3/4 rounded-lg sm:h-11" />
          <Bar tone={blockTone} className="mx-auto h-3.5 w-3/4 rounded" />
        </div>

        <div className="mt-8 flex gap-5 px-10 sm:mt-10 sm:px-0 lg:gap-6 xl:px-12">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex w-[86%] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#EADDC3] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.06)] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <Bar className="aspect-[16/9] w-full rounded-none" />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="min-h-[3.25rem] space-y-2 sm:min-h-[3.5rem]">
                  <Bar tone={blockTone} className="h-4 w-full" />
                  <Bar tone={blockTone} className="h-4 w-2/3" />
                </div>
                <div className="mt-2 min-h-[3.9rem] space-y-2.5">
                  <Bar tone={blockTone} className="h-3.5 w-full" />
                  <Bar tone={blockTone} className="h-3.5 w-full" />
                  <Bar tone={blockTone} className="h-3.5 w-3/5" />
                </div>
                <div className="mt-auto pt-4">
                  <Bar tone={blockTone} className="h-5 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function BlogSection({
  variant,
  id = variant === 'featured' ? 'blogs-featured' : 'blogs-front',
  titleA,
  titleB,
  subtitle,
  eyebrow,
  tone = variant === 'featured' ? 'cream' : 'paper',
  fallbackItems,
  maxItems = 6,
}: BlogSectionProps) {
  const { t } = useTranslation()
  const featuredQuery = useFeaturedBlogsQuery({ enabled: variant === 'featured' })
  const frontQuery = useFrontBlogsQuery({ enabled: variant === 'front' })

  const query = variant === 'featured' ? featuredQuery : frontQuery
  const apiItems = (query.data?.data ?? []).filter((b) => b.blog_title?.trim())
  const imageBase = query.data?.image_url
  const items = apiItems.length > 0 ? apiItems : (fallbackItems ?? [])
  const visible = items.slice(0, maxItems)

  if (!visible || visible.length === 0) {
    // Still loading: hold the rail's place with a placeholder instead of
    // collapsing it — the page must not jump when the articles arrive.
    return query.isPending ? <BlogRailSkeleton tone={tone} /> : null
  }

  const defaults =
    variant === 'featured'
      ? {
          eyebrow: 'Featured insights',
          titleA: 'Featured',
          titleB: 'Stories & Guidance.',
          subtitle: 'Handpicked reads on relationships, weddings and family values.',
        }
      : {
          eyebrow: 'From our blog',
          titleA: 'Latest',
          titleB: 'Updates & Stories.',
          subtitle: 'Fresh articles, tips and community updates from Vivah Sambandh.',
        }

  const bgCls =
    tone === 'navy'
      ? 'bg-[#0B1526] text-white'
      : tone === 'cream'
        ? 'bg-[#FFFBF2] text-navy-900'
        : 'bg-cream-50 text-navy-900'

  return (
    <section id={id} className={`relative overflow-hidden py-12 ${bgCls}`}>
      <div className="section-pad relative z-10">
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <div className="eyebrow mx-auto justify-center">
            <SectionBrandMark />
            <span>{eyebrow || t(`blogs.${variant}.eyebrow`, defaults.eyebrow)}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl lg:whitespace-nowrap lg:text-5xl">
            <span className={tone === 'navy' ? 'text-white' : 'text-navy-900'}>
              {titleA || t(`blogs.${variant}.titleA`, defaults.titleA)}{' '}
            </span>
            <span className="text-gold-500">
              {titleB || t(`blogs.${variant}.titleB`, defaults.titleB)}
            </span>
          </h2>
          <p className={`mt-3 text-sm leading-relaxed sm:text-base ${tone === 'navy' ? 'text-white/75' : 'text-ink-600'}`}>
            {subtitle || t(`blogs.${variant}.subtitle`, defaults.subtitle)}
          </p>
        </Reveal>

        {/* Swiper single-row rail (same pattern as CityMatchesSection).
            NOTE: slides intentionally NOT wrapped in GSAP Reveal — Swiper
            runs its own transform loop and a GSAP ancestor causes glitches. */}
        <div className="group/blogs relative mt-8 px-10 sm:mt-10 sm:px-0 xl:px-12">
          <button
            type="button"
            aria-label={`Previous ${variant} blogs`}
            className={`blog-prev-${variant} absolute left-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/blogs:visible group-hover/blogs:opacity-100 focus-visible:visible focus-visible:opacity-100`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={`Next ${variant} blogs`}
            className={`blog-next-${variant} absolute right-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/blogs:visible group-hover/blogs:opacity-100 focus-visible:visible focus-visible:opacity-100`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <Swiper
            modules={[Navigation, A11y]}
            navigation={{
              prevEl: `.blog-prev-${variant}`,
              nextEl: `.blog-next-${variant}`,
            }}
            observer={true}
            observeParents={true}
            observeSlideChildren={true}
            loop={visible.length > 3}
            speed={600}
            watchOverflow={true}
            grabCursor={true}
            spaceBetween={20}
            slidesPerView={1.15}
            slidesPerGroup={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 24,
              },
            }}
            className="!py-2"
          >
            {visible.map((item) => (
              <SwiperSlide key={item.blog_slug || item.id} className="!h-auto">
                <BlogCard item={item} imageBase={imageBase} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
