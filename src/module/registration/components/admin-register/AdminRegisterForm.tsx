/**
 * @file src/module/registration/components/admin-register/AdminRegisterForm.tsx
 * Admin Registration Form — submits name, gender, email, address, city,
 * mobile and face image to the CRM create-admin-register endpoint.
 *
 * Self-contained local state (small form) reusing the shared sanitizers,
 * validators and shadcn-style UI primitives from the main registration form.
 */

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { OptionPills } from '@/components/ui/option-pills'
import { FormSelect } from '@/components/ui/form-select'
import { cn } from 'cn'
import { createAdminRegister, getStates } from '../../api/registration.api'
import MobileNumberField from '../MobileNumberField'
import PhotoCropField from '../PhotoCropField'
import TermsModal from '../TermsModal'
import OtpVerificationModal from '../OtpVerificationModal'
import type { AdminRegisterFormData, StateItem } from '../../types'
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeCity,
  sanitizeAddress,
  sanitizeDigits,
  handleSanitizedPaste,
  validateName,
  validateEmail,
  validateIndianMobile,
  validateCity,
  validateAddress,
} from '@/lib/validation'

const initialAdminFormState: AdminRegisterFormData = {
  name: '',
  gender: '',
  email: '',
  user_address: '',
  user_current_city: '',
  mobile: '',
  alternate_mobile_no: '',
  admin_state: '',
  admin_document_type: '',
  admin_document: null,
  admin_document_preview: '',
  face_image: null,
  face_image_preview: '',
  agree_terms: false,
}

type FieldErrors = Partial<Record<keyof AdminRegisterFormData, string>>

interface SubmitResult {
  type: 'success' | 'error'
  message: string
}

export default function AdminRegisterForm() {
  const inputId = useId()
  const documentInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<AdminRegisterFormData>(initialAdminFormState)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null)
  const [termsOpen, setTermsOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otpMode, setOtpMode] = useState<'inline' | 'submit'>('submit')
  const [isMobileVerified, setIsMobileVerified] = useState(false)
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState('')
  const [states, setStates] = useState<StateItem[]>([])
  const [statesLoading, setStatesLoading] = useState(false)

  const isMobileVerifiedNow =
    isMobileVerified && form.mobile === verifiedMobileNumber

  // Load states dropdown
  useEffect(() => {
    let active = true
    setStatesLoading(true)
    getStates()
      .then((list) => {
        if (!active) return
        setStates(list)
      })
      .catch((err) => {
        console.error('Failed to load states:', err)
      })
      .finally(() => {
        if (!active) return
        setStatesLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const clearFieldError = (key: keyof AdminRegisterFormData) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // Input handlers with field-specific character restrictions
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    clearFieldError(name as keyof AdminRegisterFormData)

    let sanitized = value
    if (name === 'name') sanitized = sanitizeName(value)
    else if (name === 'email') sanitized = sanitizeEmail(value)
    else if (name === 'user_current_city') sanitized = sanitizeCity(value)
    else if (name === 'user_address') sanitized = sanitizeAddress(value)

    setForm((prev) => ({ ...prev, [name]: sanitized }))
  }

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeDigits(e.target.value, 10)
    clearFieldError('mobile')
    if (isMobileVerified && sanitized !== verifiedMobileNumber) {
      setIsMobileVerified(false)
      setVerifiedMobileNumber('')
    }
    setForm((prev) => ({ ...prev, mobile: sanitized }))
  }

  const handlePasteCapture = (
    fieldName: keyof AdminRegisterFormData,
    sanitizer: (val: string) => string,
  ) =>
    (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleSanitizedPaste(e, sanitizer, (cleaned) => {
        clearFieldError(fieldName)
        if (
          fieldName === 'mobile' &&
          isMobileVerified &&
          cleaned !== verifiedMobileNumber
        ) {
          setIsMobileVerified(false)
          setVerifiedMobileNumber('')
        }
        setForm((prev) => ({ ...prev, [fieldName]: cleaned }))
      })
    }

  const handleGenderChange = (value: string) => {
    clearFieldError('gender')
    setForm((prev) => ({ ...prev, gender: value as AdminRegisterFormData['gender'] }))
  }

  const handleStateChange = (value: string) => {
    clearFieldError('admin_state')
    setForm((prev) => ({ ...prev, admin_state: value }))
  }

  const handleDocumentTypeChange = (value: string) => {
    clearFieldError('admin_document_type')
    setForm((prev) => ({ ...prev, admin_document_type: value }))
  }

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    clearFieldError('admin_document')
    if (!file) return

    // Revoke previous blob URL if exists before processing the new file
    if (form.admin_document) URL.revokeObjectURL(form.admin_document_preview)

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]
    if (!allowedTypes.includes(file.type)) {
      setForm((prev) => ({ ...prev, admin_document: null, admin_document_preview: '' }))
      e.target.value = ''
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setForm((prev) => ({
      ...prev,
      admin_document: file,
      admin_document_preview: previewUrl,
    }))
  }

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    setForm((prev) => ({
      ...prev,
      face_image: croppedFile,
      face_image_preview: previewUrl,
    }))
    clearFieldError('face_image')
  }

  const resetAdminForm = () => {
    setForm(initialAdminFormState)
    setFieldErrors({})
    setTermsOpen(false)
    setIsOtpModalOpen(false)
    setOtpMode('submit')
    setIsMobileVerified(false)
    setVerifiedMobileNumber('')
    if (form.admin_document) URL.revokeObjectURL(form.admin_document_preview)
  }

  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {}

    const nameResult = validateName(form.name, 'Full Name')
    if (!nameResult.valid) errors.name = nameResult.error

    if (!form.gender) errors.gender = 'Gender is required'

    const emailResult = validateEmail(form.email)
    if (!emailResult.valid) errors.email = emailResult.error

    const addressResult = validateAddress(form.user_address)
    if (!addressResult.valid) errors.user_address = addressResult.error

    const cityResult = validateCity(form.user_current_city)
    if (!cityResult.valid) errors.user_current_city = cityResult.error

    const mobileResult = validateIndianMobile(form.mobile)
    if (!mobileResult.valid) errors.mobile = mobileResult.error

    if (form.alternate_mobile_no) {
      const altMobileResult = validateIndianMobile(form.alternate_mobile_no)
      if (!altMobileResult.valid) errors.alternate_mobile_no = altMobileResult.error
    }

    if (!form.admin_state) errors.admin_state = 'Please select a state'

    if (!form.admin_document_type) errors.admin_document_type = 'Please select a document type'

    if (!form.admin_document) errors.admin_document = 'Please upload an ID document'

    if (!form.face_image) errors.face_image = 'Please upload a face photograph'

    if (!form.agree_terms) {
      errors.agree_terms =
        'You must agree to the Terms & Conditions before submitting'
    }

    return errors
  }

  const submitRegistration = async () => {
    setIsSubmitting(true)

    // FormData matching the create-admin-register API spec:
    // name, gender, email, user_address, user_current_city, mobile,
    // alternate_mobile_no, admin_state, admin_document_type, admin_document,
    // face_image
    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('gender', form.gender)
    formData.append('email', form.email.trim())
    formData.append('user_address', form.user_address.trim())
    formData.append('user_current_city', form.user_current_city.trim())
    formData.append('mobile', form.mobile)
    if (form.alternate_mobile_no) {
      formData.append('alternate_mobile_no', form.alternate_mobile_no)
    }
    formData.append('admin_state', form.admin_state)
    formData.append('admin_document_type', form.admin_document_type)
    if (form.admin_document) {
      formData.append('admin_document', form.admin_document)
    }
    if (form.face_image) {
      formData.append('face_image', form.face_image)
    }

    try {
      const res = await createAdminRegister(formData)
      setSubmitResult({
        type: res.success ? 'success' : 'error',
        message: res.message || 'Submission could not be completed.',
      })
      if (res.success) {
        resetAdminForm()
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'An error occurred during submission.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpVerified = () => {
    setIsMobileVerified(true)
    setVerifiedMobileNumber(form.mobile)
    setIsOtpModalOpen(false)
    clearFieldError('mobile')
    if (otpMode === 'submit') {
      void submitRegistration()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitResult(null)

    const errors = validateForm()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0]
      const el = document.getElementById(`${inputId}-${firstKey}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (!isMobileVerifiedNow) {
      setOtpMode('submit')
      setIsOtpModalOpen(true)
      return
    }

    void submitRegistration()
  }

  const inputCls = (key: keyof AdminRegisterFormData) =>
    cn(
      'h-11 w-full rounded-full border px-4 py-2.5 text-sm text-navy-900 transition outline-none focus-visible:ring-2',
      fieldErrors[key]
        ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
        : 'border-cream-300 bg-cream-50/70 hover:bg-white focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
    )

  if (submitResult?.type === 'success') {
    return (
      <div className="mx-auto max-w-3xl min-h-[50vh] flex flex-col items-center justify-center py-16 text-center">
        <div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-50/90 p-8 shadow-lift text-emerald-950">
          <svg
            className="mx-auto h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h4 className="mt-3 font-bold text-lg">Admin Registration Completed</h4>
          <p className="mt-1 text-sm">{submitResult.message}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setSubmitResult(null)
            resetAdminForm()
          }}
          className="mt-8 px-8 py-3 text-sm font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md"
        >
          Submit another registration
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {submitResult?.type === 'error' && (
        <div
          className="mb-8 rounded-2xl border border-maroon-500/30 bg-maroon-50/90 p-6 shadow-lift text-maroon-950"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 text-maroon-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="font-bold text-base">Submission Note</h4>
              <p className="mt-1 text-sm">{submitResult.message}</p>
            </div>
          </div>
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card space-y-5"
      >
        {/* Header */}
        <div className="border-b border-cream-200 pb-4">
          <span className="eyebrow">Admin Register</span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
            Admin Registration Details
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Basic identification, contact details and a face photograph for the admin record.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Full Name */}
          <Field
            id={`${inputId}-name`}
            label="Full Name"
            required
            error={fieldErrors.name}
          >
            <Input
              id={`${inputId}-name`}
              type="text"
              name="name"
              maxLength={45}
              value={form.name}
              onChange={handleInputChange}
              onPaste={handlePasteCapture('name', sanitizeName)}
              placeholder="Admin Full Name"
              className={inputCls('name')}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? `${inputId}-name-error` : undefined}
            />
          </Field>

          {/* Gender (radio pill selection) */}
          <div id={`${inputId}-gender`}>
            <span className="mb-2 block text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
              Gender <span className="text-maroon-600">*</span>
            </span>
            <OptionPills
              id={`${inputId}-gender-pills`}
              name="gender"
              value={form.gender}
              onChange={handleGenderChange}
              options={[
                { value: 'Male', label: 'Mr' },
                { value: 'Female', label: 'Miss' },
              ]}
              error={Boolean(fieldErrors.gender)}
              ariaLabel="Gender"
            />
            {fieldErrors.gender && (
              <p
                role="alert"
                className="mt-1.5 text-[11px] font-semibold text-maroon-600"
              >
                {fieldErrors.gender}
              </p>
            )}
          </div>

          {/* Mobile — same control as the user registration (OTP + verified badge) */}
          <MobileNumberField
            id={`${inputId}-mobile`}
            label="Mobile Number"
            value={form.mobile}
            onChange={handleMobileChange}
            onPaste={handlePasteCapture(
              'mobile',
              (val) => sanitizeDigits(val, 10),
            )}
            isVerified={isMobileVerifiedNow}
            onVerify={() => {
              setOtpMode('inline')
              setIsOtpModalOpen(true)
            }}
            error={fieldErrors.mobile}
            inputClassName={inputCls('mobile')}
          />

          {/* Alternate Mobile Number */}
          <Field
            id={`${inputId}-alternate_mobile_no`}
            label="Alternate Mobile Number"
            error={fieldErrors.alternate_mobile_no}
          >
            <Input
              id={`${inputId}-alternate_mobile_no`}
              type="tel"
              name="alternate_mobile_no"
              inputMode="numeric"
              maxLength={10}
              value={form.alternate_mobile_no}
              onChange={(e) => {
                const sanitized = sanitizeDigits(e.target.value, 10)
                clearFieldError('alternate_mobile_no')
                setForm((prev) => ({ ...prev, alternate_mobile_no: sanitized }))
              }}
              onPaste={handlePasteCapture(
                'alternate_mobile_no',
                (val) => sanitizeDigits(val, 10),
              )}
              placeholder="Alternate 10-digit mobile"
              className={inputCls('alternate_mobile_no')}
              aria-invalid={Boolean(fieldErrors.alternate_mobile_no)}
              aria-describedby={
                fieldErrors.alternate_mobile_no
                  ? `${inputId}-alternate_mobile_no-error`
                  : undefined
              }
            />
          </Field>

          {/* Email */}
          <Field
            id={`${inputId}-email`}
            label="Email Address"
            required
            error={fieldErrors.email}
          >
            <Input
              id={`${inputId}-email`}
              type="text"
              name="email"
              maxLength={100}
              value={form.email}
              onChange={handleInputChange}
              onPaste={handlePasteCapture('email', sanitizeEmail)}
              placeholder="name@example.com"
              className={inputCls('email')}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? `${inputId}-email-error` : undefined}
            />
          </Field>

          {/* Current City */}
          <Field
            id={`${inputId}-city`}
            label="Current City"
            required
            error={fieldErrors.user_current_city}
          >
            <Input
              id={`${inputId}-city`}
              type="text"
              name="user_current_city"
              maxLength={50}
              value={form.user_current_city}
              onChange={handleInputChange}
              onPaste={handlePasteCapture('user_current_city', sanitizeCity)}
              placeholder="City / District"
              className={inputCls('user_current_city')}
              aria-invalid={Boolean(fieldErrors.user_current_city)}
              aria-describedby={
                fieldErrors.user_current_city ? `${inputId}-city-error` : undefined
              }
            />
          </Field>

          {/* Admin State */}
          <Field
            id={`${inputId}-admin_state`}
            label="State"
            required
            error={fieldErrors.admin_state}
          >
            <FormSelect
              id={`${inputId}-admin_state`}
              value={form.admin_state}
              onValueChange={handleStateChange}
              options={states.map((s) => ({
                value: s.state_name,
                label: s.state_name,
              }))}
              placeholder="Select State"
              loading={statesLoading}
              error={Boolean(fieldErrors.admin_state)}
              aria-invalid={Boolean(fieldErrors.admin_state)}
              aria-describedby={
                fieldErrors.admin_state ? `${inputId}-admin_state-error` : undefined
              }
            />
          </Field>

          {/* Address */}
          <div className="sm:col-span-2">
            <Field
              id={`${inputId}-address`}
              label="Residential Address"
              required
              error={fieldErrors.user_address}
            >
              <Textarea
                id={`${inputId}-address`}
                name="user_address"
                maxLength={250}
                rows={3}
                value={form.user_address}
                onChange={handleInputChange}
                onPaste={handlePasteCapture('user_address', sanitizeAddress)}
                placeholder="House / Street / Area"
                className={cn(inputCls('user_address'), 'h-auto rounded-2xl')}
                aria-invalid={Boolean(fieldErrors.user_address)}
                aria-describedby={
                  fieldErrors.user_address ? `${inputId}-address-error` : undefined
                }
              />
            </Field>
          </div>

          {/* ID Document Type + ID Document | Face Photograph — one row */}
          <div className="sm:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1 flex flex-col h-full gap-5">
              {/* Admin Document Type */}
              <Field
              id={`${inputId}-admin_document_type`}
              label="ID Document Type"
              required
              error={fieldErrors.admin_document_type}
            >
              <FormSelect
                id={`${inputId}-admin_document_type`}
                value={form.admin_document_type}
                onValueChange={handleDocumentTypeChange}
                options={[
                  { value: 'Aadhar No', label: 'Aadhar No' },
                  { value: 'Driving License', label: 'Driving License' },
                  { value: 'Passport', label: 'Passport' },
                ]}
                placeholder="Select document type"
                error={Boolean(fieldErrors.admin_document_type)}
                aria-invalid={Boolean(fieldErrors.admin_document_type)}
                aria-describedby={
                  fieldErrors.admin_document_type
                    ? `${inputId}-admin_document_type-error`
                    : undefined
                }
              />
            </Field>

            {/* Admin Document Upload */}
            <div className="flex flex-col rounded-2xl border p-5 transition min-h-[14rem] flex-1">
              <span className="text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
                ID Document <span className="text-maroon-600" aria-hidden="true">*</span>
              </span>
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                Upload Aadhar / Driving License / Passport (image or PDF)
              </p>
              <div className="mt-4 flex-1 flex flex-col gap-4">
                <input
                  ref={documentInputRef}
                  id={`${inputId}-admin_document`}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleDocumentChange}
                  onClick={(e) => {
                    // Reset value so choosing the same file triggers onChange
                    ;(e.target as HTMLInputElement).value = ''
                  }}
                  className="sr-only"
                  aria-label="ID Document"
                />
                {form.admin_document_preview ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex items-center justify-center rounded-2xl border border-gold-500/50 bg-gold-50/30 p-2 flex-1 w-full max-w-xs">
                      {form.admin_document?.type?.startsWith('image/') ? (
                        <img
                          src={form.admin_document_preview}
                          alt="Document preview"
                          className="max-w-[16rem] max-h-32 object-contain rounded-lg shadow-sm border border-cream-200"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-28 w-32 rounded-lg border-2 border-dashed border-gold-500/50 bg-white/50 p-2">
                          <svg
                            className="h-8 w-8 text-gold-500 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-[10px] font-semibold text-navy-900 truncate max-w-[12rem]">
                            PDF Document
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (form.admin_document) URL.revokeObjectURL(form.admin_document_preview)
                          setForm((prev) => ({
                            ...prev,
                            admin_document: null,
                            admin_document_preview: '',
                          }))
                          clearFieldError('admin_document')
                        }}
                        className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-maroon-600 shadow-xs hover:bg-white hover:text-maroon-800"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="text-xs text-ink-500 truncate max-w-[16rem]">
                      {form.admin_document?.name ?? 'Document selected'}
                    </span>
                    <button
                      type="button"
                      onClick={() => documentInputRef.current?.click()}
                      className="text-xs font-semibold text-gold-700 hover:text-navy-900 underline"
                    >
                      Change document
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <label
                      htmlFor={`${inputId}-admin_document`}
                      className="flex items-center justify-center gap-2 rounded-full border border-dashed border-gold-500/60 bg-white px-6 py-3 font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50 transition cursor-pointer"
                    >
                      <svg
                        className="h-4 w-4 text-gold-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="text-sm">Upload Document</span>
                    </label>
                  </div>
                )}
                {fieldErrors.admin_document && (
                  <p
                    role="alert"
                    className="ml-1 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
                  >
                    {fieldErrors.admin_document}
                  </p>
                )}
              </div>
            </div>
          </div>

            {/* Right column: Face Photograph */}
            <div className="sm:col-span-1 h-full">
              <PhotoCropField
                id={`${inputId}-face_image`}
                label="Face Photograph"
                subtitle="Recent clear face photograph for the admin profile."
                previewUrl={form.face_image_preview}
                hasPhoto={Boolean(form.face_image)}
                onCropComplete={handleCropComplete}
                error={fieldErrors.face_image}
                aspect={1}
                outputSize={600}
                shape="circle"
                cropTitle="Crop Face Photograph"
                frameClassName="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white shadow-inner"
                className="h-full"
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div id={`${inputId}-agree_terms`} className="sm:col-span-2">
            <div
              className={cn(
                'rounded-2xl border p-4 transition sm:p-5',
                fieldErrors.agree_terms
                  ? 'border-maroon-500 bg-maroon-50/20'
                  : 'border-cream-300 bg-cream-50/70 focus-within:border-gold-500/50',
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`${inputId}-agree-terms`}
                  checked={form.agree_terms}
                  onCheckedChange={(checked) => {
                    setForm((prev) => ({ ...prev, agree_terms: checked === true }))
                    clearFieldError('agree_terms')
                  }}
                  error={Boolean(fieldErrors.agree_terms)}
                  className="mt-0.5 size-5"
                  aria-label="Agree to Terms and Conditions"
                />
                <div className="text-[13px] leading-relaxed text-navy-900 sm:text-sm">
                  <label htmlFor={`${inputId}-agree-terms`} className="cursor-pointer">
                    I have read, understood and agree to the
                  </label>{' '}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="font-bold text-gold-700 underline underline-offset-2 transition hover:text-gold-800"
                  >
                    Terms &amp; Conditions
                  </button>{' '}
                  <label htmlFor={`${inputId}-agree-terms`} className="cursor-pointer">
                    governing community bio-data verification and honorary matchmaking support.
                  </label>
                </div>
              </div>
              {fieldErrors.agree_terms && (
                <p
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
                >
                  {fieldErrors.agree_terms}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Terms & Conditions Modal */}
        <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />

        {/* Firebase Phone OTP Verification Modal */}
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          mobile={form.mobile}
          mode={otpMode}
          onVerified={handleOtpVerified}
          onClose={() => setIsOtpModalOpen(false)}
          onChangeNumber={() => {
            setIsOtpModalOpen(false)
            document.getElementById(`${inputId}-mobile`)?.focus()
          }}
        />

        {/* Submit */}
        <div className="flex justify-center border-t border-cream-200 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-3 text-sm font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-md sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting Registration...
              </span>
            ) : (
              'Submit Admin Registration'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
