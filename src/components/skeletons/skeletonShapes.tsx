/**
 * @file src/components/skeletons/skeletonShapes.tsx
 * Section-shaped placeholder blocks for the public site.
 *
 * One renderer drives every page skeleton from a declarative `SectionSpec`
 * list (see `routeSkeleton.tsx`). Keeping the shapes in a single generic
 * renderer instead of one hand-written component per page matters: this
 * module is statically imported by the app entry, so every byte here sits on
 * the critical path.
 *
 * Every block is `aria-hidden` — the surrounding shell announces the busy
 * state once, so screen readers are not flooded by a hundred empty divs.
 */

import { cn } from "cn"

/** Surface a block sits on — decides the block colour. */
export type SkeletonTone = 'light' | 'dark'

export interface SectionSpec {
  kind:
    | 'banner'
    | 'downloadHero'
    | 'registration'
    | 'darkBanner'
    | 'centered'
    | 'grid'
    | 'split'
    | 'contactSplit'
    | 'stats'
    | 'marquee'
    | 'table'
    | 'lines'
    | 'form'
    | 'stepper'
    | 'dial'
    | 'cta'
    | 'article'
  bg?: string
  copy?: 'wide' | 'narrow'
  cols?: number
  count?: number
  rows?: number
  aspect?: string
  framed?: boolean
  pricing?: boolean
  header?: 'center' | 'split'
  filters?: boolean
  ratio?: '7-5' | '6-6'
  flip?: boolean
  unboxed?: boolean
  fields?: number
  steps?: number
  admin?: boolean
  tone?: SkeletonTone
}

/** A single shimmering block. */
export function Bar({
  className,
  tone = 'light',
}: {
  className?: string
  tone?: SkeletonTone
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded',
        tone === 'dark' ? 'bg-white/12' : 'bg-cream-200/70',
        className,
      )}
    />
  )
}

/** A stack of text lines; the last one is shorter, like a real paragraph. */
export function Text({ lines = 3, tone }: { lines?: number; tone?: SkeletonTone }) {
  return (
    <div aria-hidden="true" className="space-y-2.5">
      {Array.from({ length: lines }, (_, index) => (
        <Bar
          key={index}
          tone={tone}
          className={cn('h-3.5', index === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

/** Band wrapper — lets every band pick up a route-specific background. */
function Band({
  spec,
  className,
  children,
}: {
  spec: SectionSpec
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn(className, spec.bg)}>
      {children}
    </div>
  )
}

/** Renders one declarative band. */
export function SkeletonSection({ spec }: { spec: SectionSpec }) {
  switch (spec.kind) {
    case 'banner':
      return (
        <Band spec={spec} className="relative isolate w-full bg-cream-50">
          {/* Mobile banner photo block so mobile doesn't collapse */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-cream-100 lg:hidden" aria-hidden="true">
            <Bar className="h-full w-full rounded-none bg-cream-200/50" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-cream-50" />
          </div>

          {/* Hero container */}
          <div className="relative z-10 w-full lg:h-[540px] xl:h-[580px] lg:flex lg:items-center">
            <div className="section-pad w-full -mt-10 pt-4 pb-8 sm:-mt-12 lg:mt-0 lg:py-0">
              <div className="grid w-full items-center lg:grid-cols-12">
                <div
                  className={cn(
                    'space-y-4 py-4',
                    spec.copy === 'narrow'
                      ? 'lg:col-span-7 xl:col-span-6'
                      : 'lg:col-span-8 xl:col-span-7',
                  )}
                >
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-2">
                    <Bar className="h-3 w-16" />
                    <Bar className="h-3 w-3" />
                    <Bar className="h-3 w-20" />
                  </div>

                  {/* Eyebrow */}
                  <Bar className="h-3.5 w-36 rounded-full bg-gold-200/80" />

                  {/* Headline */}
                  <div className="space-y-2">
                    <Bar className="h-9 sm:h-12 w-4/5 rounded-lg" />
                    <Bar className="h-9 sm:h-12 w-3/5 rounded-lg bg-gold-200/50" />
                  </div>

                  {/* Subtitle */}
                  <Bar className="h-3.5 w-11/12 rounded" />
                  <Bar className="h-3.5 w-3/4 rounded" />

                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Bar className="h-4 w-28 rounded-full" />
                    <Bar className="h-4 w-32 rounded-full" />
                    <Bar className="h-4 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Band>
      )

    case 'downloadHero':
      return (
        <Band
          spec={spec}
          className="relative overflow-hidden bg-cream-50 pt-12 pb-16 lg:pt-20 lg:pb-24"
        >
          <div className="section-pad relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-5 lg:col-span-7">
                <Bar className="h-6 w-36 rounded-full border border-gold-500/40 bg-gold-500/10" />
                <div className="space-y-2">
                  <Bar className="h-10 sm:h-14 w-4/5 rounded-xl bg-cream-200/80" />
                  <Bar className="h-10 sm:h-14 w-3/5 rounded-xl bg-gold-200/60" />
                </div>
                <div className="space-y-2 max-w-xl">
                  <Bar className="h-4 w-full" />
                  <Bar className="h-4 w-4/5" />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Bar className="h-12 w-40 rounded-full border border-navy-900/15 bg-navy-900/10" />
                  <Bar className="h-12 w-40 rounded-full border border-navy-900/15 bg-navy-900/10" />
                </div>
                <div className="flex items-center gap-6 pt-5 border-t border-gold-500/20">
                  <Bar className="h-4 w-36" />
                  <Bar className="h-4 w-28" />
                </div>
              </div>
              {/* Right Column: Phone Mockup Frame */}
              <div className="flex justify-center lg:col-span-5">
                <div className="relative w-full max-w-[340px] aspect-[9/16] max-h-[480px] rounded-[36px] border border-gold-500/25 bg-white p-4 flex flex-col justify-between shadow-xl">
                  <Bar className="mx-auto h-4 w-24 rounded-full bg-cream-200/80" />
                  <div className="space-y-3">
                    <Bar className="h-32 w-full rounded-2xl bg-cream-200/70" />
                    <Bar className="h-4 w-3/4 rounded" />
                    <Bar className="h-3 w-1/2 rounded" />
                  </div>
                  <Bar className="h-10 w-full rounded-full bg-gold-200/60" />
                </div>
              </div>
            </div>
          </div>
        </Band>
      )

    case 'registration':
      return (
        <Band spec={spec} className="relative min-h-[70vh] bg-cream-50 overflow-x-clip">
          {/* Navy curved Hero banner */}
          <div className="relative overflow-hidden bg-navy-950 rounded-b-[4rem] sm:rounded-b-[8rem] pt-20 pb-16 text-center text-white">
            <div className="section-pad mx-auto max-w-2xl space-y-4">
              <Bar tone="dark" className="mx-auto h-3.5 w-36 rounded-full bg-gold-400/40" />
              <Bar tone="dark" className="mx-auto h-10 sm:h-12 w-4/5 rounded-lg bg-white/15" />
              <Bar tone="dark" className="mx-auto h-3.5 w-11/12 rounded" />
              <Bar tone="dark" className="mx-auto h-3 w-48 rounded bg-white/10" />
            </div>
          </div>

          {/* Form Section overlapping with -mt-8 */}
          <div className="relative -mt-8 pb-20 sm:pb-28">
            <div className="section-pad">
              <div className={cn('mx-auto', spec.admin ? 'max-w-3xl' : 'max-w-5xl')}>
                {/* Stepper only for user registration */}
                {!spec.admin && (
                  <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-cream-300 bg-cream-100 px-5 py-5 sm:px-8">
                    <div className="flex items-center justify-between gap-3">
                      {Array.from({ length: spec.steps ?? 5 }, (_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Bar className="size-9 shrink-0 rounded-full bg-cream-300" />
                          <Bar className="hidden h-3 w-14 rounded sm:block bg-cream-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form card */}
                <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card space-y-6">
                  {spec.admin ? (
                    <div className="text-center pb-4 border-b border-cream-200">
                      <div className="mx-auto size-24 rounded-full border-2 border-dashed border-gold-400/50 bg-gold-50/50 flex items-center justify-center mb-3">
                        <Bar className="size-10 rounded-full" />
                      </div>
                      <Bar className="mx-auto h-3.5 w-36" />
                    </div>
                  ) : (
                    <div className="space-y-1.5 border-b border-cream-200 pb-4">
                      <Bar className="h-6 w-48 rounded-lg" />
                      <Bar className="h-3.5 w-72 rounded" />
                    </div>
                  )}

                  {/* Form inputs grid */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {Array.from({ length: spec.fields ?? 8 }, (_, index) => (
                      <div key={index} className="space-y-2">
                        <Bar className="h-3.5 w-28 rounded" />
                        <Bar className="h-11 w-full rounded-xl border border-cream-200 bg-cream-50/70" />
                      </div>
                    ))}
                  </div>

                  {/* Bottom nav buttons */}
                  <div className="flex justify-between items-center border-t border-cream-100 pt-6">
                    {!spec.admin ? (
                      <>
                        <Bar className="h-11 w-28 rounded-full border border-cream-300" />
                        <Bar className="h-11 w-36 rounded-full bg-navy-900/10" />
                      </>
                    ) : (
                      <Bar className="mx-auto h-11 w-48 rounded-full bg-navy-900/10" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Band>
      )

    case 'centered':
      return (
        <Band spec={spec} className="section-pad pt-10 pb-4 text-center sm:pt-14">
          <div className="mx-auto max-w-2xl space-y-3">
            <Bar className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
            <Bar className="mx-auto h-9 w-4/5 rounded-lg sm:h-11" />
            <Bar className="mx-auto h-3.5 w-3/4 rounded" />
          </div>
        </Band>
      )

    case 'darkBanner':
      return (
        <Band
          spec={spec}
          className="relative overflow-hidden rounded-b-[4rem] sm:rounded-b-[8rem] bg-navy-900 pt-16 pb-16 sm:pt-20"
        >
          <div className="section-pad mx-auto max-w-2xl space-y-4 text-center">
            <Bar tone="dark" className="mx-auto h-3.5 w-36 rounded-full bg-gold-400/40" />
            <Bar tone="dark" className="mx-auto h-10 w-4/5 rounded-lg bg-white/15 sm:h-12" />
            <Bar tone="dark" className="mx-auto h-3.5 w-11/12 rounded" />
          </div>
        </Band>
      )

    case 'grid':
      return (
        <Band spec={spec} className="section-pad py-12 sm:py-16">
          {/* Section Header */}
          {spec.header === 'center' ? (
            <div className="mx-auto max-w-2xl space-y-3 text-center mb-10 sm:mb-12">
              <Bar tone={spec.tone} className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
              <Bar tone={spec.tone} className="mx-auto h-8 sm:h-11 w-3/4 rounded-lg" />
              <Bar tone={spec.tone} className="mx-auto h-3.5 w-2/3 rounded" />
            </div>
          ) : spec.header === 'split' ? (
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row mb-10">
              <div className="space-y-2">
                <Bar tone={spec.tone} className="h-3.5 w-28 rounded-full bg-gold-200/80" />
                <Bar tone={spec.tone} className="h-8 sm:h-10 w-56 rounded-lg" />
              </div>
              {spec.filters && (
                <div className="flex flex-wrap items-center gap-2">
                  <Bar className="h-8 w-16 rounded-full" />
                  <Bar className="h-8 w-20 rounded-full" />
                  <Bar className="h-8 w-20 rounded-full" />
                  <Bar className="h-8 w-20 rounded-full" />
                </div>
              )}
            </div>
          ) : null}

          {/* Standalone Filter Pills (e.g. on BlogsPage) */}
          {spec.filters && !spec.header && (
            <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
              <Bar className="h-8 w-16 rounded-full" />
              <Bar className="h-8 w-24 rounded-full" />
              <Bar className="h-8 w-24 rounded-full" />
              <Bar className="h-8 w-24 rounded-full" />
            </div>
          )}

          {/* Cards Grid */}
          <div className={cn('grid gap-6', COLS[spec.cols ?? 3])}>
            {Array.from({ length: spec.count ?? spec.rows ?? 3 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  'overflow-hidden rounded-2xl border shadow-sm transition-all',
                  spec.tone === 'dark'
                    ? 'border-gold-500/30 bg-white/[0.06]'
                    : 'border-cream-200 bg-white',
                  spec.framed && 'p-6 sm:p-7',
                  spec.pricing && 'p-6 sm:p-8 flex flex-col justify-between space-y-6',
                )}
              >
                {spec.pricing ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Bar className="h-6 w-32 rounded" />
                        <Bar className="h-5 w-16 rounded-full bg-gold-50" />
                      </div>
                      <Bar className="h-3 w-40 rounded" />
                      <div className="pt-4 border-b border-gold-500/20 pb-4">
                        <Bar className="h-10 w-36 rounded-lg" />
                      </div>
                      <div className="space-y-3 pt-2">
                        {Array.from({ length: 5 }, (_, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2">
                            <Bar className="size-4 rounded-full bg-gold-300" />
                            <Bar className="h-3 flex-1 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Bar className="h-11 w-full rounded-full bg-navy-900/10" />
                  </>
                ) : spec.aspect ? (
                  <>
                    <Bar tone={spec.tone} className={cn('w-full rounded-none', spec.aspect)} />
                    <div className="space-y-3 p-5">
                      <div className="flex justify-between items-center">
                        <Bar tone={spec.tone} className="h-3.5 w-1/3 rounded" />
                        <Bar tone={spec.tone} className="h-3 w-1/4 rounded" />
                      </div>
                      <Bar tone={spec.tone} className="h-5 w-4/5 rounded" />
                      <Bar tone={spec.tone} className="h-3.5 w-full rounded" />
                      <Bar tone={spec.tone} className="h-3.5 w-3/4 rounded" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Bar tone={spec.tone} className="h-10 w-10 rounded-full" />
                    <Bar tone={spec.tone} className="h-5 w-2/3 rounded" />
                    <Bar tone={spec.tone} className="h-3.5 w-full rounded" />
                    <Bar tone={spec.tone} className="h-3.5 w-4/5 rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Band>
      )

    case 'split': {
      const image = (
        <div
          className={cn(
            'h-64 sm:h-80 lg:h-auto',
            spec.ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-7',
          )}
        >
          <Bar
            tone={spec.tone}
            className={cn(
              'h-full w-full rounded-none',
              spec.tone === 'dark' ? 'bg-white/10' : 'bg-cream-200/60',
            )}
          />
        </div>
      )
      const copy = (
        <div
          className={cn(
            'flex flex-col justify-center space-y-4 p-6 sm:p-8 lg:p-10',
            spec.ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-5',
          )}
        >
          <Bar tone={spec.tone} className="h-3.5 w-28 rounded-full bg-gold-200/80" />
          <Bar tone={spec.tone} className="h-7 w-3/4 rounded-lg" />
          <Text lines={4} tone={spec.tone} />
          <Bar tone={spec.tone} className="mt-2 h-10 w-36 rounded-full" />
        </div>
      )

      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          {spec.header === 'center' && (
            <div className="mx-auto max-w-2xl space-y-3 text-center mb-10 sm:mb-12">
              <Bar className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
              <Bar className="mx-auto h-8 sm:h-10 w-3/4 rounded-lg" />
            </div>
          )}

          {spec.unboxed ? (
            /* Open 2-column section (WhyBuilt) */
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6 space-y-4">
                <Bar className="h-3.5 w-28 rounded-full bg-gold-200/80" />
                <Bar className="h-8 sm:h-10 w-3/4 rounded-lg" />
                <Bar className="h-3.5 w-full rounded" />
                <Bar className="h-48 sm:h-64 w-full rounded-2xl mt-4" />
              </div>
              <div className="lg:col-span-6 grid gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Bar className="size-11 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Bar className="h-4 w-1/2 rounded" />
                      <Bar className="h-3.5 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Enclosed card (FeaturedStory) */
            <div
              className={cn(
                'grid overflow-hidden rounded-3xl border shadow-card lg:grid-cols-12',
                spec.tone === 'dark'
                  ? 'border-gold-500/30 bg-white/[0.06]'
                  : 'border-gold-500/35 bg-white',
              )}
            >
              {spec.flip ? (
                <>
                  {copy}
                  {image}
                </>
              ) : (
                <>
                  {image}
                  {copy}
                </>
              )}
            </div>
          )}
        </Band>
      )
    }

    case 'contactSplit':
      return (
        <Band spec={spec} className="section-pad pb-10 sm:pb-12">
          <div className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-12">
            {/* Left: MessageForm card */}
            <div className="lg:col-span-7 rounded-2xl border border-gold-500/30 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="space-y-1.5 border-b border-cream-200 pb-4">
                <Bar className="h-6 w-48 rounded-lg" />
                <Bar className="h-3.5 w-72 rounded" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Bar className="h-3 w-20" /><Bar className="h-10 rounded-xl bg-cream-50" /></div>
                <div className="space-y-1.5"><Bar className="h-3 w-20" /><Bar className="h-10 rounded-xl bg-cream-50" /></div>
              </div>
              <div className="space-y-1.5"><Bar className="h-3 w-20" /><Bar className="h-10 rounded-xl bg-cream-50" /></div>
              <div className="space-y-1.5"><Bar className="h-3 w-20" /><Bar className="h-24 rounded-xl bg-cream-50" /></div>
              <Bar className="h-11 w-36 rounded-full bg-navy-900/10" />
            </div>

            {/* Right: OfficeVisit card */}
            <div className="lg:col-span-5 rounded-2xl border border-gold-500/30 bg-white p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <Bar className="h-6 w-36 rounded-lg" />
                <Bar className="h-3.5 w-52 rounded" />
                <div className="space-y-3 pt-3">
                  <div className="flex gap-3"><Bar className="size-8 rounded-full shrink-0" /><Bar className="h-8 flex-1 rounded" /></div>
                  <div className="flex gap-3"><Bar className="size-8 rounded-full shrink-0" /><Bar className="h-8 flex-1 rounded" /></div>
                </div>
              </div>
              <Bar className="h-44 w-full rounded-xl bg-cream-100" />
            </div>
          </div>
        </Band>
      )

    case 'stats':
      return (
        <Band
          spec={spec}
          className={cn(
            'section-pad py-10 sm:py-12',
            spec.tone === 'dark'
              ? 'bg-navy-950 text-white'
              : 'border-y border-gold-500/30 bg-cream-100/70',
          )}
        >
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {Array.from({ length: spec.cols ?? 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Bar tone={spec.tone} className="mx-auto h-9 w-20 rounded-lg" />
                <Bar tone={spec.tone} className="mx-auto h-3 w-28 rounded" />
                <Bar tone={spec.tone} className="mx-auto h-2.5 w-20 rounded" />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'marquee':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16 md:py-20">
          {spec.header === 'center' ? (
            <div className="mx-auto max-w-2xl space-y-3 text-center mb-10 sm:mb-12">
              <Bar className="mx-auto h-3 w-28 rounded-full bg-gold-200/80" />
              <Bar className="mx-auto h-9 w-3/4 rounded-lg sm:h-11" />
              <Bar className="mx-auto h-3.5 w-3/4 rounded" />
            </div>
          ) : spec.header === 'split' ? (
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end mb-8 sm:mb-10">
              <div className="space-y-2">
                <Bar className="h-3 w-24 rounded-full bg-gold-200/80" />
                <Bar className="h-8 sm:h-10 w-64 rounded-lg" />
                <Bar className="h-3.5 w-48 rounded" />
              </div>
              <Bar className="h-4 w-28 rounded" />
            </div>
          ) : null}

          <div className="flex gap-4 sm:gap-6 overflow-hidden py-3">
            {Array.from({ length: spec.count ?? 3 }, (_, index) =>
              spec.aspect ? (
                /* City card */
                <div
                  key={index}
                  className="w-44 sm:w-52 md:w-60 shrink-0 overflow-hidden rounded-2xl border border-gold-500/30 bg-white p-2 shadow-sm space-y-2"
                >
                  <Bar className={cn('w-full rounded-xl', spec.aspect)} />
                  <div className="p-1 space-y-1.5 text-center">
                    <Bar className="mx-auto h-3.5 w-24" />
                    <Bar className="mx-auto h-2.5 w-16" />
                  </div>
                </div>
              ) : (
                /* Testimonial card */
                <div
                  key={index}
                  className="w-[320px] sm:w-[360px] md:w-[390px] shrink-0 rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Bar className="h-4 w-24" />
                      <Bar className="h-6 w-6 rounded" />
                    </div>
                    <Text lines={3} />
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <Bar className="size-11 rounded-full bg-navy-950/20 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Bar className="h-3.5 w-28" />
                      <Bar className="h-2.5 w-20" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </Band>
      )

    case 'table':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          {spec.header === 'center' && (
            <div className="mx-auto max-w-2xl space-y-3 text-center mb-10">
              <Bar className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
              <Bar className="mx-auto h-9 w-3/4 rounded-lg sm:h-11" />
              <Bar className="mx-auto h-3.5 w-3/4 rounded" />
            </div>
          )}
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-lg">
            {/* Dark table header */}
            <div className="grid grid-cols-12 items-center bg-navy-900 px-4 sm:px-6 py-4 border-b border-gold-500/30">
              <Bar tone="dark" className="col-span-5 h-4 w-32" />
              <Bar tone="dark" className="col-span-2 mx-auto h-4 w-16" />
              <Bar tone="dark" className="col-span-2 mx-auto h-4 w-16" />
              <Bar tone="dark" className="col-span-3 mx-auto h-4 w-20" />
            </div>
            {/* Table rows */}
            {Array.from({ length: spec.rows ?? 6 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  'grid grid-cols-12 items-center px-4 sm:px-6 py-3.5 border-t border-gold-500/15',
                  index % 2 === 1 ? 'bg-cream-50/60' : 'bg-white',
                )}
              >
                <Bar className="col-span-5 h-3.5 w-4/5" />
                <Bar className="col-span-2 mx-auto h-3.5 w-10" />
                <Bar className="col-span-2 mx-auto h-3.5 w-10" />
                <Bar className="col-span-3 mx-auto h-3.5 w-12" />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'lines':
      return (
        <Band spec={spec} className="section-pad py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-[#EADDC3] bg-white p-6 shadow-sm sm:p-10">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3">
                <Bar className="h-6 w-1/3 rounded-lg" />
                <Text lines={3} />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'form':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-6 rounded-[1.5rem] border border-gold-500/30 bg-white p-6 shadow-card sm:p-8">
            <div className="space-y-2 border-b border-cream-200 pb-4">
              <Bar className="h-6 w-48 rounded-lg" />
              <Bar className="h-3.5 w-72 rounded" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: spec.fields ?? 6 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Bar className="h-3.5 w-28 rounded" />
                  <Bar className="h-11 w-full rounded-full border border-cream-200 bg-cream-50" />
                </div>
              ))}
            </div>
            <div className="flex justify-center border-t border-cream-100 pt-6">
              <Bar className="h-11 w-44 rounded-full bg-navy-900/10" />
            </div>
          </div>
        </Band>
      )

    case 'stepper':
      return (
        <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-cream-300 bg-cream-100 px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            {Array.from({ length: spec.steps ?? 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Bar className="size-9 shrink-0 rounded-full" />
                <Bar className="hidden h-3 w-14 rounded sm:block" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'dial':
      return (
        <Band spec={spec} className="pt-10 sm:pt-14 pb-12 sm:pb-16 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
              {/* Left Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-start space-y-3">
                <Bar className="h-6 w-24 rounded-full bg-maroon-50 border border-maroon-200" />
                <div className="space-y-2">
                  <Bar className="h-8 sm:h-9 w-44 rounded-lg" />
                  <Bar className="h-8 sm:h-9 w-56 rounded-lg bg-maroon-100/60" />
                </div>
                <div className="flex items-center gap-2">
                  <Bar className="h-[1px] w-6 bg-gold-400" />
                  <Bar className="size-2 rounded-full bg-gold-400" />
                  <Bar className="h-[1px] w-6 bg-gold-400" />
                </div>
                <Bar className="h-3.5 w-64 rounded" />
                <Bar className="h-3.5 w-48 rounded" />
              </div>

              {/* Right Column: Circular spotlight card (8 cols) */}
              <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[390px] lg:min-h-[415px]">
                <div className="relative size-[290px] sm:size-[320px] rounded-full bg-white shadow-[0_12px_40px_rgb(158_27_50/0.14)] ring-6 ring-maroon-50 border border-maroon-100 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Bar className="size-8 rounded-full bg-maroon-100" />
                  <Bar className="h-4 w-40 rounded" />
                  <div className="flex items-center gap-1">
                    <Bar className="h-[1px] w-4 bg-gold-400" />
                    <Bar className="size-1.5 rounded-full bg-gold-400" />
                    <Bar className="h-[1px] w-4 bg-gold-400" />
                  </div>
                  <Bar className="h-3 w-48 rounded" />
                  <Bar className="h-3 w-40 rounded" />
                  <Bar className="h-8 w-28 rounded-full bg-maroon-100/80 mt-1" />
                </div>
              </div>
            </div>
          </div>
        </Band>
      )

    case 'cta':
      return (
        <Band spec={spec} className="section-pad py-14 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <Bar tone={spec.tone} className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
            <Bar tone={spec.tone} className="mx-auto h-9 w-4/5 rounded-lg sm:h-11" />
            <Bar tone={spec.tone} className="mx-auto h-3.5 w-3/4 rounded" />
            <div className="flex justify-center gap-3 pt-3">
              <Bar
                tone={spec.tone}
                className={cn(
                  'h-11 w-36 rounded-full',
                  spec.tone === 'dark' ? 'bg-white/15' : 'bg-navy-900/10',
                )}
              />
              <Bar
                tone={spec.tone}
                className={cn(
                  'h-11 w-36 rounded-full border',
                  spec.tone === 'dark' ? 'border-white/25' : 'border-cream-300',
                )}
              />
            </div>
          </div>
        </Band>
      )

    case 'article':
      return (
        <Band spec={spec} className="section-pad py-10 sm:py-14">
          <div className="mx-auto max-w-6xl space-y-6">
            <Bar className="h-4 w-28 rounded text-maroon-700" />

            <div className="flex items-center gap-3">
              <Bar className="h-4 w-24 rounded-full bg-gold-200/80" />
              <Bar className="h-3 w-28 rounded" />
              <Bar className="h-3 w-24 rounded" />
            </div>

            <div className="space-y-2">
              <Bar className="h-9 sm:h-12 w-11/12 rounded-lg" />
              <Bar className="h-9 sm:h-12 w-3/5 rounded-lg" />
            </div>

            <Bar className="h-4 w-4/5 rounded" />

            <Bar className="aspect-[16/8] w-full rounded-2xl border border-[#EADDC3]" />

            <div className="rounded-2xl border border-[#EADDC3] bg-white p-6 sm:p-10 space-y-5 shadow-[0_2px_10px_rgba(16,24,40,0.06)]">
              <Bar className="h-6 w-1/3 rounded-lg" />
              <Text lines={4} />
              <Bar className="h-6 w-1/4 rounded-lg pt-2" />
              <Text lines={5} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-4">
              <div className="rounded-2xl border border-[#EADDC3] bg-white p-4 flex items-center gap-4">
                <Bar className="size-16 sm:size-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-4 w-full" />
                </div>
              </div>
              <div className="rounded-2xl border border-[#EADDC3] bg-white p-4 flex items-center gap-4">
                <Bar className="size-16 sm:size-20 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-3 w-16" />
                  <Bar className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </Band>
      )

    default:
      return null
  }
}

/** Renders a whole page from its band list. */
export function SkeletonPage({
  sections,
  className,
}: {
  sections: SectionSpec[]
  className?: string
}) {
  return (
    <div
      aria-busy="true"
      role="status"
      aria-label="Loading content"
      className={cn('relative min-h-[70vh] overflow-hidden bg-cream-50', className)}
    >
      {sections.map((spec, index) => (
        <SkeletonSection key={`${spec.kind}-${index}`} spec={spec} />
      ))}
    </div>
  )
}
