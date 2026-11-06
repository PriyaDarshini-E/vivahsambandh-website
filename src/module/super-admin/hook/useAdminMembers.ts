/**
 * @file src/module/super-admin/hook/useAdminMembers.ts
 * React Query hooks for the regional administrator directory and the pending
 * admin approval queue.
 *
 * Status changes move a record between the approved and pending lists, so
 * every list that can contain the record is invalidated after a mutation.
 */

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchAdminMembers,
  fetchPendingAdminMembers,
  removeDeviceId,
  updateAdminMember,
  updateMemberCity,
  updateMemberStatus,
} from '../services/adminApi'
import { PANEL_STALE_TIME, superAdminKeys } from './queryKeys'
import { unwrapAction, unwrapList } from './errors'
import {
  DEFAULT_PER_PAGE,
  applyLocalList,
  matchesStatus,
  matchesTerm,
  type ListMeta,
} from './useServerList'
import type {
  AdminMember,
  AdminMemberStatus,
  MemberStatus,
  PanelListParams,
} from '../types'

export interface AdminMemberListParams extends PanelListParams {
  status?: string
}

/** Matches the administrator search across the columns an admin looks for. */
function adminMatches(admin: AdminMember, term: string): boolean {
  return matchesTerm(
    term,
    admin.name,
    admin.mobile,
    admin.email,
    admin.user_current_city,
    admin.user_address,
  )
}

export function useAdminMembersQuery(params: AdminMemberListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.adminMembers, params],
    queryFn: async () => unwrapList(await fetchAdminMembers(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, status, page, per_page } = params

  const local: { records: AdminMember[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: adminMatches,
        keep: (admin) => matchesStatus(status, admin.status),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, status, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
}

export function usePendingAdminMembersQuery(params: AdminMemberListParams = {}) {
  const query = useQuery({
    queryKey: [...superAdminKeys.pendingAdminMembers, params],
    queryFn: async () => unwrapList(await fetchPendingAdminMembers(params)),
    staleTime: PANEL_STALE_TIME,
  })

  const { search, status, page, per_page } = params

  const local: { records: AdminMember[]; meta: ListMeta } = useMemo(
    () =>
      applyLocalList(query.data ?? [], {
        searchTerm: search,
        matches: adminMatches,
        keep: (admin) => matchesStatus(status, admin.status),
        page,
        perPage: per_page ?? DEFAULT_PER_PAGE,
      }),
    [query.data, search, status, page, per_page],
  )

  return { ...query, records: local.records, meta: local.meta }
}

interface UpdateStatusVariables {
  id: number | string
  status: AdminMemberStatus | MemberStatus
  /** Optional admin-facing copy that replaces the server message in the toast. */
  successMessage?: string
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusVariables) =>
      unwrapAction(await updateMemberStatus(id, status)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.members }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateCityVariables {
  id: number | string
  cities: string[] | string
  successMessage?: string
}

export function useUpdateMemberCityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cities }: UpdateCityVariables) =>
      unwrapAction(await updateMemberCity(id, cities)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface RemoveDeviceIdVariables {
  id: number | string
  successMessage?: string
}

export function useRemoveDeviceIdMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: RemoveDeviceIdVariables) =>
      unwrapAction(await removeDeviceId(id)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.members }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface UpdateAdminMemberVariables {
  id: number | string
  data: Record<string, unknown> | FormData
  successMessage?: string
}

export function useUpdateAdminMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateAdminMemberVariables) =>
      unwrapAction(await updateAdminMember(id, data)),
    onSuccess: async (message, variables) => {
      toast.success(variables.successMessage ?? message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.adminMembers }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.pendingAdminMembers }),
      ])
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}


