/**
 * @file src/module/registration/components/registration-form/FormStepper.tsx
 * Classic progress indicator for the registration form steps.
 *
 * Presentational only: it shows where the visitor is and asks the wizard to
 * move. All validation lives in the form context. Deliberately NOT sticky —
 * the stepper travels with the form so the page never has a floating bar.
 *
 * House style:
 * - flat surfaces, one tone step between the band and the sheet below it
 * - the only colour is the gold on the active node
 * - numbers are node numbers in a real <ol>, not decoration
 */

import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'
import { REGISTRATION_STEPS } from './steps'

interface FormStepperProps {
  /** Index of the active step (0-based). */
  current: number
  /** Called with the step index the visitor picked. */
  onSelect: (step: number) => void
}

export default function FormStepper({ current, onSelect }: FormStepperProps) {
  const { t } = useTranslation()

  const count = REGISTRATION_STEPS.length
  // The rail spans from the centre of the first node to the centre of the
  // last one — half a column inset on each side, whatever the step count.
  const railInset = 100 / (count * 2)
  const railSpan = 100 - railInset * 2
  const fillPercent = count > 1 ? (current / (count - 1)) * railSpan : 0

  return (
    <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-cream-300 bg-cream-100">
      {/* ——— Compact mobile progress ——— */}
      <div className="px-5 py-4 sm:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-medium text-ink-600">
            {t('registrationPage.form.stepCounter', 'Step {{current}} of {{total}}', {
              current: current + 1,
              total: count,
            })}
          </p>
          <p className="text-[12px] font-medium text-ink-500 tabular-nums">
            {Math.round(((current + 1) / count) * 100)}%
          </p>
        </div>
        <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
          {REGISTRATION_STEPS.map((step, index) => (
            <span
              key={step.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-500',
                index < current
                  ? 'bg-navy-900'
                  : index === current
                  ? 'bg-gold-500'
                  : 'bg-cream-300',
              )}
            />
          ))}
        </div>
      </div>

      {/* ——— Classic desktop stepper ——— */}
      <div className="hidden px-6 py-7 sm:block lg:px-12">
        <div className="relative">
          {/* rail */}
          <span
            aria-hidden="true"
            className="absolute top-[21px] h-[2px] rounded-full bg-cream-300"
            style={{ left: `${railInset}%`, right: `${railInset}%` }}
          />
          <span
            aria-hidden="true"
            className="absolute top-[21px] h-[2px] rounded-full bg-gold-400 transition-[width] duration-500 ease-out"
            style={{ left: `${railInset}%`, width: `${fillPercent}%` }}
          />

          <ol
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
          >
            {REGISTRATION_STEPS.map((step, index) => {
              const state = index < current ? 'done' : index === current ? 'current' : 'todo'
              return (
                <li key={step.id} className="relative flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={cn(
                      'step-node group relative z-10 grid size-11 place-items-center rounded-full border-2 text-sm font-bold transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100',
                      state === 'done' &&
                        'border-navy-900 bg-navy-900 text-white hover:bg-navy-800 hover:border-navy-800',
                      state === 'current' &&
                        'scale-105 border-gold-600 bg-gold-500 text-white',
                      state === 'todo' &&
                        'border-cream-400 bg-white text-ink-500 hover:border-gold-400 hover:text-gold-700',
                    )}
                  >
                    {state === 'current' && <span aria-hidden="true" className="step-halo" />}
                    {state === 'done' ? (
                      <Check className="size-5" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <span aria-hidden="true">{step.number}</span>
                    )}
                  </button>

                  <span
                    className={cn(
                      'mt-3 text-center text-[13px] transition-colors duration-300',
                      state === 'done' && 'font-semibold text-navy-800',
                      state === 'current' && 'font-bold text-navy-900',
                      state === 'todo' && 'font-medium text-ink-500',
                    )}
                  >
                    {t(step.shortLabelKey, step.shortLabelFallback)}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
