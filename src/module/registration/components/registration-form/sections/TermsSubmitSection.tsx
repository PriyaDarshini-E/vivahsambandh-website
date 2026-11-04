/**
 * @file src/module/registration/components/registration-form/sections/TermsSubmitSection.tsx
 * Declaration panel rendered at the end of step 2. The submit action lives in
 * the wizard footer (FormWizardNav) so it stays visible below the declaration.
 */

import { Checkbox } from '@/components/ui/checkbox'
import { ClipboardCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

export default function TermsSubmitSection() {
  const { t } = useTranslation()
  const {
    baseId,
    form,
    fieldErrors,
    setForm,
    clearFieldError,
    validateAllSteps,
    setTermsOpen,
  } = useRegistrationForm()

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.terms}
      title={t('registrationPage.form.part5Title', 'Declaration & Submit')}
      subtitle={t(
        'registrationPage.form.part5Subtitle',
        'Accept the community guidelines, then send your bio-data to the volunteer committee for verification.',
      )}
      className={fieldErrors.agree_terms ? 'border-maroon-500' : undefined}
    >
      <div
        className={`rounded-2xl border p-4 transition sm:p-5 ${
          fieldErrors.agree_terms
            ? 'border-maroon-500 bg-maroon-50/20'
            : 'border-cream-300 bg-cream-50/70 focus-within:border-gold-500/50'
        }`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id={`${baseId}-agree-terms`}
            checked={form.agree_terms}
            onCheckedChange={(checked) => {
              setForm((prev) => ({ ...prev, agree_terms: checked === true }))
              clearFieldError('agree_terms')
            }}
            error={Boolean(fieldErrors.agree_terms)}
            className="mt-0.5 size-5"
            aria-label={t('registrationPage.form.termsAndConditions', 'Agree to Terms and Conditions')}
          />
          <div className="text-[13px] leading-relaxed text-navy-900 sm:text-sm">
            <label htmlFor={`${baseId}-agree-terms`} className="cursor-pointer">
              {t('registrationPage.form.agreeTermsPrefix', 'I have read, understood and agree to the')}
            </label>{' '}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="font-bold text-gold-700 underline underline-offset-2 transition hover:text-gold-800"
            >
              {t('registrationPage.form.termsAndConditions', 'Terms & Conditions')}
            </button>{' '}
            <label htmlFor={`${baseId}-agree-terms`} className="cursor-pointer">
              {t('registrationPage.form.agreeTermsSuffix', 'governing community bio-data verification and honorary matchmaking support.')}
            </label>
          </div>
        </div>
        {fieldErrors.agree_terms && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-maroon-600">
            {fieldErrors.agree_terms}
          </p>
        )}
      </div>

      {/* Secondary review helper — jumps straight to the first unfinished step */}
      <button
        type="button"
        onClick={() => {
          validateAllSteps()
        }}
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2 text-xs font-semibold text-navy-800 transition hover:border-gold-500 hover:bg-gold-50"
      >
        <ClipboardCheck className="size-3.5 shrink-0" aria-hidden />
        {t('registrationPage.form.checkUnfilled', 'Check Any Unfilled Details')}
      </button>
    </FormSection>
  )
}
