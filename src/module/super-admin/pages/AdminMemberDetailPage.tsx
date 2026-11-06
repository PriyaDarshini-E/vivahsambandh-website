/**
 * @file src/module/super-admin/pages/AdminMemberDetailPage.tsx
 * Full-page profile view for an administrator or a pending application.
 *
 * Resolves the record from the same list endpoint the directory uses, then
 * shows the photograph, contact details and the cities the admin covers —
 * the fields the list can only summarise in a row.
 */

import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Edit2, ExternalLink, FileText, UserRoundX } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { Skeleton } from '../components/PanelSkeleton'
import { RemoteImage } from '../components/RemoteImage'
import { StatusBadge } from '../components/StatusBadge'
import { EditAdminModal } from '../components/EditAdminModal'
import { errorMessage, unwrapList } from '../hook/errors'
import { PANEL_STALE_TIME, superAdminKeys } from '../hook/queryKeys'
import { fetchAdminMembers, fetchPendingAdminMembers } from '../services/adminApi'
import { formatDate, initials } from '../utils/format'
import type { AdminMember } from '../types'

interface AdminMemberDetailPageProps {
  /** Resolves the record from the pending queue instead of the directory. */
  pending?: boolean
}

function assignedCities(value: AdminMember['multiple_city']): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((city) => city.trim())
      .filter(Boolean)
  }
  return []
}

function DetailGrid({
  fields,
}: {
  fields: Array<{ label: string; value: ReactNode }>
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 sm:grid-cols-3">
      {fields.map((field) => (
        <div key={field.label}>
          <span className="block text-[0.68rem] text-ink-400">{field.label}</span>
          <span className="font-semibold break-words text-navy-900">
            {field.value || '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminMemberDetailPage({
  pending = false,
}: AdminMemberDetailPageProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const adminId = Number(id)
  const listPath = pending
    ? '/crm/pending-admin-members'
    : '/crm/admin-members'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: admin, isLoading, error, refetch } = useQuery({
    queryKey: [
      ...(pending
        ? superAdminKeys.pendingAdminMembers
        : superAdminKeys.adminMembers),
      'detail',
      adminId,
    ],
    queryFn: async () => {
      const records = unwrapList(
        await (pending ? fetchPendingAdminMembers() : fetchAdminMembers()),
      )
      return records.find((record) => record.id === adminId) ?? null
    },
    staleTime: PANEL_STALE_TIME,
  })

  const backButton = (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => navigate(listPath)}
      className="w-fit cursor-pointer gap-1.5 rounded-full border-cream-300 text-xs font-semibold text-ink-700 hover:bg-cream-100"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      Back to list
    </Button>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <div className="flex flex-col gap-6 sm:flex-row">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl sm:w-56" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </PanelCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <PanelError
            title="Could not load this administrator"
            message={errorMessage(error, 'The admin record could not be loaded.')}
            onRetry={() => refetch()}
          />
        </PanelCard>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="space-y-6">
        {backButton}
        <PanelCard>
          <PanelEmpty
            icon={<UserRoundX className="size-6" aria-hidden />}
            title="Administrator not found"
            description="This account may have been removed or moved out of the current queue."
            action={backButton}
          />
        </PanelCard>
      </div>
    )
  }

  const cities = assignedCities(admin.multiple_city)
  const summary = [
    `Admin #${admin.id}`,
    admin.gender || 'Gender not set',
    admin.register_date ? `Registered ${formatDate(admin.register_date)}` : null,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <div className="space-y-6">
      {backButton}

      <PanelPageHeader
        title={admin.name}
        description={summary}
        chip={<StatusBadge status={admin.status} />}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="cursor-pointer gap-1.5 rounded-full bg-gold-600 text-xs font-bold text-white hover:bg-gold-700"
          >
            <Edit2 className="size-3.5" aria-hidden />
            <span>Edit Admin</span>
          </Button>
        }
      />

      <PanelCard>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,15rem)_1fr]">
          <figure className="space-y-2">
            <RemoteImage
              src={admin.face_image}
              alt={`${admin.name} photograph`}
              className="aspect-[3/4] w-full rounded-2xl border border-cream-300 bg-cream-100 object-cover"
              fallback={
                <span className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-cream-300 bg-cream-100 font-display text-5xl font-bold text-gold-700">
                  {initials(admin.name)}
                </span>
              }
            />
            <figcaption className="truncate text-center text-[0.68rem] text-ink-400">
              {admin.face_image_name || 'No photograph on file'}
            </figcaption>
          </figure>

          <div className="min-w-0 space-y-5">
            <section>
              <h4 className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
                Administrator Details
              </h4>
              <DetailGrid
                fields={[
                  { label: 'Admin ID', value: `#${admin.id}` },
                  { label: 'Gender', value: admin.gender },
                  { label: 'Registered On', value: formatDate(admin.register_date) },
                  { label: 'Status', value: admin.status },
                ]}
              />
            </section>

            <section>
              <h4 className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
                Contact & Location Details
              </h4>
              <DetailGrid
                fields={[
                  { label: 'Primary Mobile', value: admin.mobile },
                  { label: 'Alternate Mobile', value: admin.alternate_mobile_no },
                  { label: 'Email', value: admin.email },
                  { label: 'Current City', value: admin.user_current_city },
                  { label: 'State', value: admin.admin_state },
                  { label: 'Full Address', value: admin.user_address },
                ]}
              />
            </section>

            <section>
              <h4 className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
                Identity Verification
              </h4>
              <div className="rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="block text-[0.68rem] text-ink-400">Document Type</span>
                    <span className="font-semibold text-navy-900">
                      {admin.admin_document_type || '—'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[0.68rem] text-ink-400">Document File</span>
                    {admin.admin_document ? (
                      <div className="mt-1 flex items-center gap-3">
                        <a
                          href={admin.admin_document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gold-300 bg-white px-3 py-1.5 text-xs font-semibold text-gold-800 shadow-xs hover:bg-gold-50"
                        >
                          <FileText className="size-4 text-gold-600" />
                          <span>View Document</span>
                          <ExternalLink className="size-3 text-ink-400" />
                        </a>
                        <span className="truncate text-[11px] text-ink-400">
                          {admin.admin_document_name || 'Attached file'}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium text-ink-400 italic">No document on file</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
                City Allocation
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4">
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center rounded-md border border-gold-200 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-semibold text-gold-800"
                    >
                      {city}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-400">
                    No cities assigned to this administrator.
                  </span>
                )}
              </div>
            </section>
          </div>
        </div>
      </PanelCard>

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={isEditModalOpen}
        admin={admin}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
