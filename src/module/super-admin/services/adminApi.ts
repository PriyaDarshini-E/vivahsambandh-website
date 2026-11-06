/**
 * @file src/module/super-admin/services/adminApi.ts
 * Dedicated API service layer for Super Admin Panel operations.
 * Wraps existing API client configuration, handles Bearer auth headers,
 * supports multipart form data, and provides resilient state handling.
 */

import { API_BASE_URL } from '@/lib/api/apiClient'
import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  PanelListParams,
  CreateNotificationPayload,
  FeedbackRecord,
  Member,
  MemberStatus,
  NotificationRecord,
  PanelLoginResponse,
  SuperAdminSession,
} from '../types'
import {
  extractImageEntries,
  toAdminMember,
  toBlockProfile,
  toFeedback,
  toItem,
  toList,
  toMember,
  toNotification,
} from './mappers'
import { buildQueryString, getAuthHeaders, request, saveSession } from './http'

export { clearSession, getStoredSession, saveSession } from './http'

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

export async function superAdminLogin(
  username: string,
  password: string,
): Promise<{ success: boolean; session?: SuperAdminSession; message: string; isInactiveProfile?: boolean }> {
  const url = `${API_BASE_URL}/panel-login`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        mobile: username.trim(),
        mobile_no: username.trim(),
        password,
      }),
    })

    const data = (await res.json().catch(() => null)) as PanelLoginResponse | null

    // Check if credentials are valid but user account is inactive in DB
    if (data?.message?.toLowerCase().includes('inactive')) {
      return {
        success: false,
        message: data.message || 'Your profile is inactive. Contact admin.',
        isInactiveProfile: true,
      }
    }

    if (!res.ok || (data?.code && data.code >= 400)) {
      return {
        success: false,
        message: data?.message || 'Login failed. Please check credentials.',
      }
    }

    const token = data?.UserInfo?.token || data?.token
    if (token) {
      const session: SuperAdminSession = {
        token,
        user: data?.UserInfo?.user || {
          id: 1,
          name: 'Super Admin',
          username,
          user_type: 'Super Admin',
        },
        expiresAt: data?.UserInfo?.token_expires_at,
      }
      saveSession(session)
      return { success: true, session, message: 'Logged in successfully' }
    }

    return {
      success: false,
      message: data?.message || 'No authentication token received from server.',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error during login.',
    }
  }
}

/**
 * Request password recovery via POST /panel-send-password.
 */
export async function sendPanelPassword(
  payload: string | { mobile: string; email?: string },
): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/panel-send-password`
  const mobile = typeof payload === 'string' ? payload.trim() : (payload.mobile || '').trim()
  const email = typeof payload === 'string' ? payload.trim() : (payload.email || '').trim()

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        mobile,
        mobile_no: mobile,
        username: mobile,
      }),
    })

    const data = (await res.json().catch(() => null)) as {
      code?: number
      message?: string
      status?: boolean | number
    } | null

    if (res.ok && (!data?.code || data.code < 400)) {
      return {
        success: true,
        message: data?.message || 'Password has been sent to your registered contact.',
      }
    }

    return {
      success: false,
      message: data?.message || 'Failed to send password. Please check your credentials.',
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error during request.',
    }
  }
}

// -------------------------------------------------------------
// Admin Members Endpoints
// -------------------------------------------------------------

export async function fetchAdminMembers(
  params: PanelListParams = {},
): Promise<{
  data: AdminMember[]
  error?: string
}> {
  const res = await request<unknown>(`/getAdminMember${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toAdminMember) }
  }
  return { data: [], error: res.message }
}

export async function fetchPendingAdminMembers(
  params: PanelListParams = {},
): Promise<{
  data: AdminMember[]
  error?: string
}> {
  const res = await request<unknown>(`/getPendingAdminMember${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toAdminMember) }
  }
  return { data: [], error: res.message }
}

export async function updateAdminMember(
  id: number | string,
  payload: Record<string, unknown> | FormData,
): Promise<{ success: boolean; message: string }> {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData

  let options: RequestInit
  if (isFormData) {
    // If multipart form data is used, some PHP/Laravel environments don't parse PUT multipart bodies.
    // In that case, we can use POST with _method = PUT if direct PUT fails or append _method.
    if (!payload.has('_method')) {
      payload.append('_method', 'PUT')
    }
    options = {
      method: 'POST',
      body: payload,
    }
  } else {
    options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  }

  let res = await request<{ message?: string }>(`/admin-member/${id}`, options)

  // If POST method not allowed for formData or PUT needed directly
  if (!res.ok && res.status === 405 && isFormData) {
    res = await request<{ message?: string }>(`/admin-member/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'Admin member updated successfully.',
    }
  }
  return { success: false, message: res.message || 'Failed to update admin member.' }
}

export async function updateMemberCity(
  id: number | string,
  cities: string[] | string,
): Promise<{ success: boolean; message: string }> {
  const payload = {
    multiple_city: Array.isArray(cities) ? cities : cities.split(',').map((c) => c.trim()),
  }

  const res = await request<{ message?: string }>(`/members/${id}/city`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'City assignments updated successfully.' }
  }
  return { success: false, message: res.message || 'Failed to update city assignments.' }
}

export async function updateMemberStatus(
  id: number | string,
  status: AdminMemberStatus | MemberStatus,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/members/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || `Status updated to ${status}.` }
  }
  return { success: false, message: res.message || 'Failed to update status.' }
}

/**
 * Unlink/Remove registered device ID for a member or admin member.
 * PUT /removeDeviceId/{id}
 */
export async function removeDeviceId(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  let res = await request<{ message?: string }>(`/removeDeviceId/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  })

  // Fallback with _method=PUT if the server environment rejects direct PUT
  if (!res.ok && res.status === 405) {
    res = await request<{ message?: string }>(`/removeDeviceId/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _method: 'PUT' }),
    })
  }

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'Device ID removed successfully.',
    }
  }

  return { success: false, message: res.message || 'Failed to remove device ID.' }
}

// -------------------------------------------------------------
// Members Endpoints
// -------------------------------------------------------------

export async function fetchMembers(
  params: PanelListParams = {},
): Promise<{
  data: Member[]
  error?: string
}> {
  const res = await request<unknown>(`/member${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toMember) }
  }
  return { data: [], error: res.message }
}

export async function fetchPendingMembers(
  params: PanelListParams = {},
): Promise<{
  data: Member[]
  error?: string
}> {
  const res = await request<unknown>(`/getPendingMember${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toMember) }
  }
  return { data: [], error: res.message }
}

/**
 * Fetches one member profile in full.
 *
 * The list endpoints return a trimmed row (no email, family, address or
 * acquaintance details), so the detail page must call `GET /member/{id}`.
 * The same endpoint serves pending records — `/getPendingMember/{id}` does
 * not exist on the CRM.
 */
export async function fetchMemberById(
  id: number | string,
): Promise<{ data: Member | null; error?: string }> {
  const res = await request<unknown>(`/member/${id}`)
  if (res.ok && res.data) {
    const member = toItem(res.data, toMember)
    return member ? { data: member } : { data: null }
  }
  return { data: null, error: res.message }
}

// -------------------------------------------------------------
// Feedback Endpoints
// -------------------------------------------------------------

export async function fetchFeedbacks(
  params: PanelListParams = {},
): Promise<{
  data: FeedbackRecord[]
  error?: string
}> {
  const res = await request<unknown>(`/feedback${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toFeedback) }
  }
  return { data: [], error: res.message }
}

export async function deleteFeedbackRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/feedback/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Feedback deleted successfully.' }
  }
  return { success: false, message: res.message || 'Failed to delete feedback.' }
}

// -------------------------------------------------------------
// Block Profile Endpoints
// -------------------------------------------------------------

export async function fetchBlockProfiles(
  params: PanelListParams = {},
): Promise<{
  data: BlockProfileRecord[]
  error?: string
}> {
  const res = await request<unknown>(`/blockProfile${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toBlockProfile) }
  }
  return { data: [], error: res.message }
}

export async function deleteBlockProfileRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/blockProfile/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Blocked profile record deleted.' }
  }
  return { success: false, message: res.message || 'Failed to delete blocked profile record.' }
}

// -------------------------------------------------------------
// Notification Endpoints
// -------------------------------------------------------------

export async function fetchNotifications(
  params: PanelListParams = {},
): Promise<{
  data: NotificationRecord[]
  error?: string
}> {
  const res = await request<unknown>(`/notification${buildQueryString(params)}`)
  if (res.ok && res.data) {
    return { data: toList(res.data, toNotification) }
  }
  return { data: [], error: res.message }
}

export async function fetchNotificationById(
  id: number | string,
): Promise<{ data: NotificationRecord | null; error?: string }> {
  const res = await request<unknown>(`/notification/${id}`)
  if (res.ok && res.data) {
    const payload = res.data as Record<string, unknown>
    const raw = (Array.isArray(payload.data) ? payload.data[0] : payload.data) ?? payload
    // The `image_url` block sits next to `data` in the envelope — without it
    // the stored file name cannot be turned into a loadable URL.
    const entries = extractImageEntries(res.data)
    return { data: toNotification(raw as Record<string, unknown>, entries) }
  }
  return { data: null, error: res.message }
}

export async function createNotification(
  payload: CreateNotificationPayload,
): Promise<{ success: boolean; message: string; data?: NotificationRecord }> {
  const formData = new FormData()
  formData.append('notification_date', payload.notification_date)
  formData.append('notification_for', payload.notification_for)
  formData.append('notification_heading', payload.notification_heading)
  formData.append('notification_message', payload.notification_message)
  if (payload.notification_image) {
    formData.append('notification_image', payload.notification_image)
  }

  const url = `${API_BASE_URL}/notification`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    const json = await res.json().catch(() => null)
    if (!res.ok) {
      const errObj = json as { message?: string; errors?: Record<string, string[]> } | null
      const firstErr = errObj?.errors ? Object.values(errObj.errors)[0]?.[0] : undefined
      return {
        success: false,
        message: firstErr || errObj?.message || `Server responded with ${res.status}`,
      }
    }

    const created = (json?.data ?? json) as Record<string, unknown> | null

    return {
      success: true,
      message: json?.message || 'Notification broadcast created successfully.',
      // Map the created record so its banner image is already an absolute URL.
      data:
        created && typeof created === 'object'
          ? toNotification(created, extractImageEntries(json))
          : undefined,
    }
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to create notification.',
    }
  }
}

export async function deleteNotificationRecord(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/notification/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return { success: true, message: res.data?.message || 'Notification removed successfully.' }
  }
  return { success: false, message: res.message || 'Failed to remove notification.' }
}

