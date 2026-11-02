/**
 * @file src/module/registration/components/registration-form/context.tsx
 * Central state provider for the registration form.
 *
 * Owns: form data, field errors, dropdown data, dynamic conditions, input
 * handlers, validation, submission flow and OTP verification state.
 * Section components consume everything through useRegistrationForm().
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useId,
  useCallback,
  useRef,
  type PropsWithChildren,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  getEducation,
  getCommunity,
  getGotra,
  getProfession,
  createUserRegister,
} from '../../api/registration.api'
import type {
  EducationItem,
  CommunityItem,
  GotraItem,
  ProfessionItem,
  RegistrationFormData,
} from '../../types'
import {
  initialFormState,
} from './constants'
import {
  validateRegistrationForm,
  isRegistrationFormComplete,
  type RegistrationConditions,
  type ErrorSummaryItem,
} from './validation'
import { REGISTRATION_STEPS } from './steps'
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeCity,
  sanitizeCompany,
  sanitizeAddress,
  sanitizeSafeText,
  sanitizeDigits,
  handleSanitizedPaste,
} from '@/lib/validation'

export type FieldErrors = Record<string, string>

export interface SelectOption {
  value: string
  label: string
}

export interface RegistrationFormContextValue {
  // Identity & errors
  baseId: string
  form: RegistrationFormData
  fieldErrors: FieldErrors

  // Generic field mutators
  setForm: React.Dispatch<React.SetStateAction<RegistrationFormData>>
  clearFieldError: (key: string) => void

  // Input handlers
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void
  handleNumericInput: (e: ChangeEvent<HTMLInputElement>, maxVal?: number) => void
  handleSelectChange: (name: string) => (value: string) => void
  handleTimeChange: (timeStr: string) => void
  handlePillChange: (name: string) => (value: string) => void
  handlePasteCapture: (
    fieldName: string,
  ) => (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  toggleCommunityPreference: (commId: string) => void
  selectAllCommunities: () => void

  // Photo helpers (cropper state lives inside PhotosSection)
  setPhotoFields: (
    target: 'full' | 'face',
    file: File,
    previewUrl: string,
  ) => void

  // Dropdown data
  educationOptions: SelectOption[]
  professionOptions: SelectOption[]
  communityOptions: SelectOption[]
  gotraOptions: SelectOption[]
  loadingGotras: boolean
  /** True while the education / profession / community lists are still loading. */
  loadingOptions: boolean

  // Dynamic conditions
  conditions: RegistrationConditions
  childrenCount: number

  // Mobile / OTP state
  isMobileVerifiedNow: boolean
  isMobileComplete: boolean
  openOtpModal: () => void

  // Navigation & submit flow
  focusAndScrollToField: (elementId: string) => void
  handleValidateClick: () => void
  handleSubmit: (e: FormEvent) => void
  handleOtpVerified: () => void
  isFormFullyFilled: boolean
  isSubmitting: boolean
  submitResult: { type: 'success' | 'error'; message: string } | null
  resetRegistration: () => void
  registeredUserId: string | number | null
  setRegisteredUserId: React.Dispatch<React.SetStateAction<string | number | null>>

  // OTP modal control
  isOtpModalOpen: boolean
  setIsOtpModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  otpTriggerSource: 'inline' | 'submit'

  // Terms modal control
  termsOpen: boolean
  setTermsOpen: React.Dispatch<React.SetStateAction<boolean>>

  // ——— Step-by-step wizard ———
  /** Index of the step currently on screen (0-based). */
  currentStep: number
  /** Jump to a step without validation (used by the stepper / Back button). */
  goToStep: (step: number) => void
  /**
   * Validate one step in isolation. Sets that step's field errors and
   * scrolls to the first offending control. Returns true when the step is
   * complete.
   */
  validateStep: (step: number) => boolean
  /**
   * Validate every step BEFORE `step`, in order. On the first gap it switches
   * to that step and reveals its errors. Returns true when the visitor may
   * enter `step`.
   */
  validateStepsBefore: (step: number) => boolean
  /**
   * Validate every step in order. On the first incomplete step it switches
   * to it, reveals its errors and focuses the first invalid control.
   * Returns true only when the whole form is complete.
   */
  validateAllSteps: () => boolean
}

const RegistrationFormContext = createContext<RegistrationFormContextValue | null>(null)

export function useRegistrationForm(): RegistrationFormContextValue {
  const ctx = useContext(RegistrationFormContext)
  if (!ctx) {
    throw new Error(
      'useRegistrationForm must be used within a RegistrationFormProvider',
    )
  }
  return ctx
}

export function RegistrationFormProvider({ children }: PropsWithChildren) {
  const baseId = useId()
  const [form, setForm] = useState<RegistrationFormData>(initialFormState)

  // Remote dropdown items
  const [educations, setEducations] = useState<EducationItem[]>([])
  const [communities, setCommunities] = useState<CommunityItem[]>([])
  const [professions, setProfessions] = useState<ProfessionItem[]>([])
  const [gotras, setGotras] = useState<GotraItem[]>([])
  const [loadingGotras, setLoadingGotras] = useState(false)
  // The three API-backed dropdowns resolve after mount — without a flag the
  // selects render "No options available" until the lists arrive.
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Modals state
  const [termsOpen, setTermsOpen] = useState(false)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [otpTriggerSource, setOtpTriggerSource] = useState<'inline' | 'submit'>('inline')
  const otpTriggerSourceRef = useRef<'inline' | 'submit'>('inline')

  // Wizard state — which numbered part of the form is on screen
  const [currentStep, setCurrentStep] = useState(0)

  // Mobile OTP Verification State
  const [isMobileVerified, setIsMobileVerified] = useState(false)
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState('')

  // Status and Validation
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [registeredUserId, setRegisteredUserId] = useState<string | number | null>(null)

  // Load initial dropdowns
  useEffect(() => {
    let active = true
    Promise.all([getEducation(), getCommunity(), getProfession()])
      .then(([eduList, commList, profList]) => {
        if (!active) return
        setEducations(eduList)
        setCommunities(commList)
        setProfessions(profList)
      })
      .catch((err) => {
        console.error('Failed to load form options:', err)
      })
      .finally(() => {
        if (!active) return
        setLoadingOptions(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Helper: Find selected profession details
  const selectedProfession = professions.find(
    (p) => String(p.id) === form.profession_id,
  )
  const profName = selectedProfession?.profession_name ?? ''

  // Condition 2: Profession conditions
  const isEmployed =
    profName.includes('Employed in Private') || profName.includes('Employed in Govt')
  const isBusiness =
    profName.includes('Family Business') || profName.includes('Own Business')
  const isSelfEmployed = profName.includes('Self Employed')
  const isOtherProfession = profName.includes('Others')
  const showIncome = isEmployed || isBusiness || isSelfEmployed || isOtherProfession

  // Condition 3: Marital status condition
  const isDivorced = form.married_before === 'Yes and Divorced'
  const isWidowed = form.married_before === 'Yes and Spouse died'
  const hasPriorMarriage = isDivorced || isWidowed
  const childrenCount = parseInt(form.children_from_prior_marriage || '0', 10)
  const showChildrenWith = hasPriorMarriage && childrenCount >= 1

  // Condition 4: Gender condition
  const isMale = form.gender === 'Male'

  const conditions: RegistrationConditions = useMemo(
    () => ({
      isEmployed,
      isBusiness,
      isOtherProfession,
      showIncome,
      isDivorced,
      hasPriorMarriage,
      showChildrenWith,
      isMale,
    }),
    [
      isEmployed,
      isBusiness,
      isOtherProfession,
      showIncome,
      isDivorced,
      hasPriorMarriage,
      showChildrenWith,
      isMale,
    ],
  )

  // Clear single field error
  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  // Shared gotra cascade for community selection
  const handleCommunityChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, community_id: value, gotra_id: '' }))
    setFieldErrors((prev) => {
      if (!prev.community_id && !prev.gotra_id) return prev
      const next = { ...prev }
      delete next.community_id
      delete next.gotra_id
      return next
    })
    if (!value) {
      setGotras([])
      setLoadingGotras(false)
      return
    }
    setLoadingGotras(true)
    getGotra(value)
      .then((data) => {
        setGotras(data)
        setLoadingGotras(false)
      })
      .catch((err) => {
        console.error('Failed to fetch gotras:', err)
        setLoadingGotras(false)
      })
  }, [])

  // Input handlers with field-specific character restrictions
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      clearFieldError(name)

      if (name === 'community_id') {
        handleCommunityChange(value)
        return
      }

      let sanitized = value
      if (
        ['name', 'father_name', 'mother_name', 'contact_name', 'alternate_contact_name'].includes(name)
      ) {
        sanitized = sanitizeName(value)
      } else if (name === 'email') {
        sanitized = sanitizeEmail(value)
      } else if (['place_of_birth', 'user_current_city'].includes(name)) {
        sanitized = sanitizeCity(value)
      } else if (['company_name', 'company_type'].includes(name)) {
        sanitized = sanitizeCompany(value)
      } else if (name === 'user_address') {
        sanitized = sanitizeAddress(value)
      } else if (name === 'user_summary') {
        sanitized = sanitizeSafeText(value)
      }

      setForm((prev) => ({ ...prev, [name]: sanitized }))
    },
    [clearFieldError, handleCommunityChange],
  )

  const handleNumericInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>, maxVal?: number) => {
      const { name, value } = e.target
      let sanitized = sanitizeDigits(value)
      if (name === 'mobile' || name === 'alternate_mobile_no') {
        sanitized = sanitized.slice(0, 10)
      } else if (maxVal !== undefined && sanitized !== '') {
        const num = parseInt(sanitized, 10)
        if (num > maxVal) sanitized = String(maxVal)
      }
      clearFieldError(name)
      if (name === 'mobile' && isMobileVerified && sanitized !== verifiedMobileNumber) {
        setIsMobileVerified(false)
        setVerifiedMobileNumber('')
      }
      setForm((prev) => ({ ...prev, [name]: sanitized }))
    },
    [clearFieldError, isMobileVerified, verifiedMobileNumber],
  )

  const handlePasteCapture = useCallback(
    (fieldName: string) =>
      (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let sanitizer = (val: string) => val
        if (
          ['name', 'father_name', 'mother_name', 'contact_name', 'alternate_contact_name'].includes(fieldName)
        ) {
          sanitizer = sanitizeName
        } else if (fieldName === 'email') {
          sanitizer = sanitizeEmail
        } else if (['place_of_birth', 'user_current_city'].includes(fieldName)) {
          sanitizer = sanitizeCity
        } else if (['company_name', 'company_type'].includes(fieldName)) {
          sanitizer = sanitizeCompany
        } else if (fieldName === 'user_address') {
          sanitizer = sanitizeAddress
        } else if (fieldName === 'user_summary') {
          sanitizer = sanitizeSafeText
        } else if (
          ['mobile', 'alternate_mobile_no', 'annual_income', 'children_from_prior_marriage'].includes(fieldName)
        ) {
          sanitizer = (val: string) => sanitizeDigits(val, fieldName.includes('mobile') ? 10 : undefined)
        }

        handleSanitizedPaste(e, sanitizer, (cleaned) => {
          clearFieldError(fieldName)
          if (fieldName === 'mobile' && isMobileVerified && cleaned !== verifiedMobileNumber) {
            setIsMobileVerified(false)
            setVerifiedMobileNumber('')
          }
          setForm((prev) => ({ ...prev, [fieldName]: cleaned }))
        })
      },
    [clearFieldError, isMobileVerified, verifiedMobileNumber],
  )

  const handleSelectChange = useCallback(
    (name: string) => (value: string) => {
      clearFieldError(name)
      if (name === 'community_id') {
        handleCommunityChange(value)
        return
      }
      setForm((prev) => ({ ...prev, [name]: value }))
    },
    [clearFieldError, handleCommunityChange],
  )

  const handleTimeChange = useCallback(
    (timeStr: string) => {
      clearFieldError('time_of_birth')
      setForm((prev) => ({ ...prev, time_of_birth: timeStr }))
    },
    [clearFieldError],
  )

  const handlePillChange = useCallback(
    (name: string) => (value: string) => {
      clearFieldError(name)
      setForm((prev) => ({ ...prev, [name]: value }))
    },
    [clearFieldError],
  )

  const toggleCommunityPreference = useCallback((commId: string) => {
    setFieldErrors((prev) => {
      if (!prev.marry_in_community) return prev
      const next = { ...prev }
      delete next.marry_in_community
      return next
    })
    setForm((prev) => {
      const current = prev.marry_in_community
      if (current.includes(commId)) {
        return {
          ...prev,
          marry_in_community: current.filter((c) => c !== commId),
        }
      }
      return {
        ...prev,
        marry_in_community: [...current, commId],
      }
    })
  }, [])

  const selectAllCommunities = useCallback(() => {
    setFieldErrors((prev) => {
      if (!prev.marry_in_community) return prev
      const next = { ...prev }
      delete next.marry_in_community
      return next
    })
    setForm((prev) => {
      const allIds = communities.map((c) => String(c.id))
      const isAllSelected = allIds.length > 0 && allIds.every((id) => prev.marry_in_community.includes(id))
      return {
        ...prev,
        marry_in_community: isAllSelected ? [] : allIds,
      }
    })
  }, [communities])

  // Photo fields written by PhotosSection after a crop completes
  const photoPreviews = useRef<{ full?: string; face?: string }>({})

  const setPhotoFields = useCallback(
    (target: 'full' | 'face', file: File, previewUrl: string) => {
      // The previous preview is a blob URL — release it, or every re-crop
      // leaks the whole image.
      const key = target === 'full' ? 'full' : 'face'
      const previous = photoPreviews.current[key]
      if (previous && previous !== previewUrl) URL.revokeObjectURL(previous)
      photoPreviews.current[key] = previewUrl

      setForm((prev) =>
        target === 'full'
          ? { ...prev, full_image: file, full_image_preview: previewUrl }
          : { ...prev, face_image: file, face_image_preview: previewUrl },
      )

      setFieldErrors((prev) => {
        const field = target === 'full' ? 'full_image' : 'face_image'
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    [],
  )

  // Focus and smooth-scroll directly to target field
  const focusAndScrollToField = useCallback((elementId: string) => {
    const el = document.getElementById(elementId)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Allow smooth scroll to settle then focus target control
    setTimeout(() => {
      if (
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(el.tagName) &&
        typeof el.focus === 'function'
      ) {
        ;(el as HTMLElement).focus({ preventScroll: true })
      } else {
        const focusable = el.querySelector<HTMLElement>(
          'input, select, textarea, button',
        )
        if (focusable && typeof focusable.focus === 'function') {
          focusable.focus({ preventScroll: true })
        }
      }
    }, 150)
  }, [])

  const isFormFullyFilled = useMemo(
    () => isRegistrationFormComplete(form, conditions),
    [form, conditions],
  )

  // ——— Step-by-step wizard helpers ———

  /** Jump to a step without running validation (stepper clicks, Back button). */
  const goToStep = useCallback((step: number) => {
    const next = Math.min(Math.max(step, 0), REGISTRATION_STEPS.length - 1)
    setCurrentStep(next)
    setFieldErrors({})
  }, [])

  /**
   * Validate a single step in isolation. Only that step's errors are kept,
   * so the user is never shown problems belonging to a step they cannot see.
   */
  const validateStep = useCallback(
    (step: number): boolean => {
      const definition = REGISTRATION_STEPS[step]
      if (!definition) return true

      const { errorList } = validateRegistrationForm(form, conditions, baseId)
      const stepErrors: FieldErrors = {}
      let firstField: ErrorSummaryItem | null = null

      for (const item of errorList) {
        if (!definition.fields.includes(item.key)) continue
        stepErrors[item.key] = item.error
        if (!firstField) firstField = item
      }

      setFieldErrors(stepErrors)

      if (!firstField) return true
      focusAndScrollToField(firstField.id)
      return false
    },
    [form, conditions, baseId, focusAndScrollToField],
  )

  /**
   * Validate every step before `step`, in order. The first gap wins: the
   * wizard switches to it, reveals its errors and focuses the first invalid
   * control. Returns true when entering `step` is allowed.
   */
  const validateStepsBefore = useCallback(
    (step: number): boolean => {
      const { errorList } = validateRegistrationForm(form, conditions, baseId)

      for (let index = 0; index < step; index += 1) {
        const definition = REGISTRATION_STEPS[index]
        const items = errorList.filter((item) => definition.fields.includes(item.key))
        if (items.length === 0) continue

        const stepErrors: FieldErrors = {}
        for (const item of items) stepErrors[item.key] = item.error

        setFieldErrors(stepErrors)
        setCurrentStep(index)
        // The step has to render before its controls exist in the DOM.
        setTimeout(() => focusAndScrollToField(items[0].id), 160)
        return false
      }

      return true
    },
    [form, conditions, baseId, focusAndScrollToField],
  )

  /**
   * Validate every step in order. The first incomplete step wins: the wizard
   * switches to it, reveals its errors and focuses the first invalid control.
   */
  const validateAllSteps = useCallback((): boolean => {
    const { errorList } = validateRegistrationForm(form, conditions, baseId)
    if (errorList.length === 0) {
      setFieldErrors({})
      return true
    }

    for (let index = 0; index < REGISTRATION_STEPS.length; index += 1) {
      const definition = REGISTRATION_STEPS[index]
      const items = errorList.filter((item) => definition.fields.includes(item.key))
      if (items.length === 0) continue

      const stepErrors: FieldErrors = {}
      for (const item of items) stepErrors[item.key] = item.error

      setFieldErrors(stepErrors)
      setCurrentStep(index)
      // The step has to render before its controls exist in the DOM.
      setTimeout(() => focusAndScrollToField(items[0].id), 160)
      return false
    }

    return false
  }, [form, conditions, baseId, focusAndScrollToField])

  // "Check Any Unfilled Details" Button Action
  const handleValidateClick = useCallback(() => {
    const { errors, firstField } = validateRegistrationForm(form, conditions, baseId)
    setFieldErrors(errors)

    if (firstField) {
      focusAndScrollToField(firstField.id)
    } else {
      setSubmitResult({
        type: 'success',
        message:
          'All required details are filled! You can now review and submit your registration.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [form, conditions, baseId, focusAndScrollToField])

/**
 * Converts 12-hour AM/PM time (e.g. "03:02 PM", "10:30 AM") to 24-hour "HH:mm" (e.g. "15:02", "10:30")
 * as required by MySQL TIME columns.
 */
function convertTo24HourTime(timeStr: string): string {
  if (!timeStr) return ''
  const trimmed = timeStr.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)?$/i)
  if (!match) return trimmed
  let hours = parseInt(match[1], 10)
  const minutes = match[2].padStart(2, '0')
  const period = match[3] ? match[3].toUpperCase() : null

  if (period === 'PM' && hours < 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

  // Core Form Submission to CRM Backend API
  const executeFormSubmission = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitResult(null)

    // Assemble FormData matching the create-user-register API spec exactly
    // (fields not in the spec must not be sent), empty strings allowed for
    // optional keys as per the reference request.
    const formData = new FormData()
    formData.append('register_type', 'Website')
    formData.append('name', form.name.trim())
    formData.append('gender', form.gender)
    formData.append('date_of_birth', form.date_of_birth)
    formData.append('time_of_birth', convertTo24HourTime(form.time_of_birth))
    formData.append('place_of_birth', form.place_of_birth.trim())
    formData.append('email', form.email.trim())
    formData.append('education_id', form.education_id)
    formData.append('profession_id', form.profession_id)
    formData.append('company_name', form.company_name.trim())
    formData.append('company_type', form.company_type.trim())
    formData.append('annual_income', form.annual_income)
    formData.append('height_feet', form.height_feet)
    formData.append('height_inch', form.height_inch)
    formData.append('father_name', form.father_name.trim())
    formData.append('mother_name', form.mother_name.trim())
    formData.append('brother_married', form.brother_married || '0')
    formData.append('brother_un_married', form.brother_un_married || '0')
    formData.append('sister_married', form.sister_married || '0')
    formData.append('sister_un_married', form.sister_un_married || '0')
    formData.append('user_address', form.user_address.trim())
    formData.append('house_type', form.house_type)
    formData.append('user_current_city', form.user_current_city.trim())
    formData.append('contact_name', form.contact_name.trim())
    formData.append('mobile', form.mobile)
    formData.append('alternate_contact_name', form.alternate_contact_name.trim())
    formData.append('alternate_mobile_no', form.alternate_mobile_no)
    formData.append('community_id', form.community_id)
    formData.append('gotra_id', form.gotra_id)
    formData.append('marry_in_community', form.marry_in_community.join(','))
    formData.append('physical_disablity', form.physical_disablity)
    formData.append('married_before', form.married_before)
    formData.append('divorce_status', form.divorce_status ?? '')
    formData.append('children_from_prior_marriage', form.children_from_prior_marriage ?? '')
    formData.append('children_with', form.children_with ?? '')
    formData.append('will_marry_same_gotra', form.will_marry_same_gotra)
    formData.append('is_manglik', form.is_manglik)
    formData.append('will_marry_manglik', form.will_marry_manglik)
    formData.append('user_summary', form.user_summary.trim())

    // Append cropped image files
    if (form.full_image) {
      formData.append('full_image', form.full_image)
    }
    if (form.face_image) {
      formData.append('face_image', form.face_image)
    }

    try {
      const res = await createUserRegister(formData)
      if (res.success) {
        // Extract user_id from various common CRM response patterns
        const payloadData = res.data as Record<string, unknown> | null | undefined
        const nestedData = payloadData?.data as Record<string, unknown> | null | undefined
        const extractedUserId = (nestedData?.id ?? nestedData?.user_id ?? payloadData?.id ?? payloadData?.user_id ?? '') as string | number

        if (extractedUserId) {
          setRegisteredUserId(extractedUserId)
        }

        setSubmitResult({
          type: 'success',
          message:
            'Your bio-data registration has been submitted successfully! Our committee will review your profile within 24 to 48 hours.',
        })
        setForm(initialFormState)
        setGotras([])
        setLoadingGotras(false)
        setFieldErrors({})
        setIsMobileVerified(false)
        setVerifiedMobileNumber('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitResult({
          type: 'error',
          message: res.message || 'Submission could not be completed.',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'An error occurred during submission.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }, [form])

  // Form Submission Trigger: Validates form, then requires mobile OTP verification before submitting
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setSubmitResult(null)

      // Step 1: Validate all form fields first
      const { errors, firstField } = validateRegistrationForm(form, conditions, baseId)
      setFieldErrors(errors)

      if (firstField) {
        focusAndScrollToField(firstField.id)
        return
      }

      // Step 2: Ensure Main Contact Mobile is verified via Firebase OTP
      const isCurrentMobileVerified =
        isMobileVerified && form.mobile === verifiedMobileNumber
      if (!isCurrentMobileVerified) {
        otpTriggerSourceRef.current = 'submit'
        setOtpTriggerSource('submit')
        setIsOtpModalOpen(true)
        return
      }

      // Step 3: Execute submission
      await executeFormSubmission()
    },
    [form, conditions, baseId, isMobileVerified, verifiedMobileNumber, executeFormSubmission, focusAndScrollToField],
  )

  // Callback when OTP verification succeeds inside the modal
  const handleOtpVerified = useCallback(() => {
    setIsMobileVerified(true)
    setVerifiedMobileNumber(form.mobile)
    setIsOtpModalOpen(false)
    clearFieldError('mobile')
    setSubmitResult(null)

    if (otpTriggerSourceRef.current === 'submit') {
      // Automatically submit now that mobile is verified as part of the submission flow
      executeFormSubmission()
    } else {
      // User verified inline while filling Part 1: focus next field (Alternate Contact Person)
      setTimeout(() => {
        focusAndScrollToField(`${baseId}-alt-name`)
      }, 150)
    }
  }, [form.mobile, executeFormSubmission, focusAndScrollToField, baseId, clearFieldError])

  // Select option lists (memoized from API data)
  const educationOptions = useMemo(
    () => educations.map((item) => ({ value: String(item.id), label: item.education_name })),
    [educations],
  )
  const professionOptions = useMemo(
    () => professions.map((item) => ({ value: String(item.id), label: item.profession_name })),
    [professions],
  )
  const communityOptions = useMemo(
    () => communities.map((c) => ({ value: String(c.id), label: c.community_name })),
    [communities],
  )
  const gotraOptions = useMemo(
    () => gotras.map((g) => ({ value: String(g.id), label: g.gotra_name })),
    [gotras],
  )

  // Mobile / derived OTP helpers
  const isMobileVerifiedNow = isMobileVerified && form.mobile === verifiedMobileNumber
  const isMobileComplete = form.mobile.length === 10

  const openOtpModal = useCallback(() => {
    otpTriggerSourceRef.current = 'inline'
    setOtpTriggerSource('inline')
    setIsOtpModalOpen(true)
  }, [])

  // Reset all form state so the user can submit another response
  const resetRegistration = useCallback(() => {
    setForm(initialFormState)
    setGotras([])
    setLoadingGotras(false)
    setFieldErrors({})
    setIsMobileVerified(false)
    setVerifiedMobileNumber('')
    setSubmitResult(null)
    setRegisteredUserId(null)
    setCurrentStep(0)
    otpTriggerSourceRef.current = 'inline'
    setOtpTriggerSource('inline')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const value: RegistrationFormContextValue = {
    baseId,
    form,
    fieldErrors,
    setForm,
    clearFieldError,
    handleInputChange,
    handleNumericInput,
    handleSelectChange,
    handleTimeChange,
    handlePillChange,
    handlePasteCapture,
    toggleCommunityPreference,
    selectAllCommunities,
    setPhotoFields,
    educationOptions,
    professionOptions,
    communityOptions,
    gotraOptions,
    loadingGotras,
    loadingOptions,
    conditions,
    childrenCount,
    isMobileVerifiedNow,
    isMobileComplete,
    openOtpModal,
    focusAndScrollToField,
    handleValidateClick,
    handleSubmit,
    handleOtpVerified,
    isFormFullyFilled,
    isSubmitting,
    submitResult,
    resetRegistration,
    registeredUserId,
    setRegisteredUserId,
    isOtpModalOpen,
    setIsOtpModalOpen,
    otpTriggerSource,
    termsOpen,
    setTermsOpen,
    currentStep,
    goToStep,
    validateStep,
    validateStepsBefore,
    validateAllSteps,
  }

  return (
    <RegistrationFormContext.Provider value={value}>
      {children}
    </RegistrationFormContext.Provider>
  )
}
