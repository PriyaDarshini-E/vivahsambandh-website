import { useTranslation } from 'react-i18next'

interface StepItem {
  step: string
  title: string
  desc: string
}

export default function DownloadSteps() {
  const { t } = useTranslation()
  const steps = (t('downloadPage.steps', { returnObjects: true }) as StepItem[]) || []

  return (
    <section className="relative bg-gradient-to-b from-[#FFFDF9] via-cream-50 to-[#FAF6EE] py-16 sm:py-24 border-t border-gold-500/20">
      <div className="section-pad">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-800">
            <span>✦</span>
            <span>{t('downloadPage.stepsEyebrow')}</span>
          </div>
          <h2 className="font-display mt-3 text-xl font-bold text-navy-900 sm:text-3xl lg:text-4xl">
            {t('downloadPage.stepsTitle')}
          </h2>
          <p className="mt-3 text-sm text-ink-600 sm:text-base">
            {t('downloadPage.stepsSubtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className="relative rounded-3xl border border-gold-500/30 bg-white p-7 shadow-[0_4px_20px_rgba(212,175,55,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-black bg-gradient-to-r from-gold-500 to-amber-600 bg-clip-text text-transparent">
                  {s.step}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/10 text-gold-700 text-xs font-bold border border-gold-500/30">
                  {idx + 1}
                </span>
              </div>
              <h3 className="font-display mt-4 text-base font-bold text-navy-900 sm:text-lg">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
