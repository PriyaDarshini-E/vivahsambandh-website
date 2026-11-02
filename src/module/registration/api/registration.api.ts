/**
 * @file src/module/registration/api/registration.api.ts
 * API services for Vivah Sambandh Registration and CRM integrations.
 */

import { apiFetch, API_BASE_URL, API_SECRET_KEY } from '@/lib/api/apiClient'
import type {
  ApiResponse,
  EducationItem,
  CommunityItem,
  GotraItem,
  ProfessionItem,
} from '../types'

/**
 * Fetches available education qualifications from CRM.
 */
export async function getEducation(): Promise<EducationItem[]> {
  const res = await apiFetch<ApiResponse<EducationItem[]>>('/getEducation')
  return res.data ?? []
}

/**
 * Fetches available communities from CRM.
 */
export async function getCommunity(): Promise<CommunityItem[]> {
  const res = await apiFetch<ApiResponse<CommunityItem[]>>('/getCommunity')
  return res.data ?? []
}

/**
 * Fetches gotras for a specific community ID from CRM.
 */
export async function getGotra(communityId: number | string): Promise<GotraItem[]> {
  if (!communityId) return []
  const res = await apiFetch<ApiResponse<GotraItem[]>>(`/getGotra/${communityId}`)
  return res.data ?? []
}

/**
 * Fetches profession categories from CRM.
 */
export async function getProfession(): Promise<ProfessionItem[]> {
  const res = await apiFetch<ApiResponse<ProfessionItem[]>>('/getProfession')
  return res.data ?? []
}

/**
 * Shared multipart POST for registration submissions with Laravel-style
 * validation error parsing — used by both user and admin register endpoints.
 */
async function postRegistrationForm(
  endpoint: string,
  formData: FormData,
  fallbackMessage: string,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(API_SECRET_KEY ? { Authorization: API_SECRET_KEY } : {}),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await res.json().catch(() => null)

    const payloadCode = data && typeof data === 'object' && 'code' in data ? Number(data.code) : undefined
    const isErrorCode = payloadCode != null && payloadCode >= 400

    if (!res.ok || isErrorCode) {
      // Laravel-style validation error payloads surface field-level messages:
      // { message, errors: { field: ["Fix this", ...], ... } }
      const validationErrors = (
        data as { errors?: Record<string, string[]> } | null
      )?.errors
      const firstValidationError = validationErrors
        ? Object.values(validationErrors)[0]?.[0]
        : undefined

      throw new Error(
        firstValidationError ||
          data?.message ||
          `Server responded with status ${res.status}`,
      )
    }

    return {
      success: true,
      message: data?.message || fallbackMessage,
      data,
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : fallbackMessage
    return {
      success: false,
      message: errorMsg,
    }
  }
}

/**
 * Submits the completed registration form with cropped photo files to CRM.
 */
export async function createUserRegister(
  formData: FormData,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  return postRegistrationForm(
    '/create-user-register',
    formData,
    'Registration submitted successfully!',
  )
}

export interface CreateUserPaymentParams {
  user_id: string | number
  payment_method: string
  payment_details: string
  payment_status: string
}

/**
 * Submits payment details for a registered user to CRM create-user-payment endpoint.
 */
export async function createUserPayment(
  payload: CreateUserPaymentParams,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const formData = new FormData()
  formData.append('user_id', String(payload.user_id))
  formData.append('payment_method', payload.payment_method)
  formData.append('payment_details', payload.payment_details)
  formData.append('payment_status', payload.payment_status)

  return postRegistrationForm(
    '/create-user-payment',
    formData,
    'Payment submitted successfully!',
  )
}

/**
 * Submits the admin registration form (name, gender, email, address, city,
 * mobile, face image) to the CRM create-admin-register endpoint.
 */
export async function createAdminRegister(
  formData: FormData,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  return postRegistrationForm(
    '/create-admin-register',
    formData,
    'Admin registration submitted successfully!',
  )
}
