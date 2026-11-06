/**
 * @file src/module/super-admin/pages/PendingAdminMembersPage.tsx
 * Dedicated queue for reviewing, assigning cities, and approving pending admin members.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCheck,
  RefreshCw,
  Eye,
  Edit2,
  FileText,
  MapPin,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { PanelCard } from '../components/PanelCard'
import { PanelPageHeader } from '../components/PanelPageHeader'
import { panelDescription } from '../navigation'
import { PanelPagination } from '../components/PanelPagination'
import { PanelSearch } from '../components/PanelSearch'
import { PanelToolbar } from '../components/PanelToolbar'
import { PanelEmpty, PanelError } from '../components/PanelState'
import { PanelTableSkeleton } from '../components/PanelSkeleton'
import {
  PanelTable,
  PanelTableFooter,
  PanelTableHeadCell,
} from '../components/PanelTable'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { RowStatusSelect } from '../components/RowStatusSelect'
import { CityAssignmentModal } from '../components/CityAssignmentModal'
import { EditAdminModal } from '../components/EditAdminModal'
import {
  usePendingAdminMembersQuery,
  useUpdateMemberCityMutation,
  useUpdateMemberStatusMutation,
} from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import type { AdminMember, AdminMemberStatus } from '../types'

const DECISION_STATUSES: readonly AdminMemberStatus[] = [
  'Pending',
  'Approved',
  'Cancel',
]

export default function PendingAdminMembersPage() {
  const navigate = useNavigate()
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [page, setPage] = useState(1)

  const {
    data: allPendingAdmins = [],
    records: pendingAdmins,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePendingAdminMembersQuery({
    search: searchTerm || undefined,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const cityMutation = useUpdateMemberCityMutation()
  const statusMutation = useUpdateMemberStatusMutation()


  // City Assignment State
  const [editingCityAdminId, setEditingCityAdminId] = useState<number | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  // Status Action State
  const [actionTarget, setActionTarget] = useState<{
    adminId: number
    adminName: string
    nextStatus: AdminMemberStatus
  } | null>(null)

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminMember | null>(null)

  const editingCityAdmin = useMemo(
    () => allPendingAdmins.find((a) => a.id === editingCityAdminId) ?? null,
    [allPendingAdmins, editingCityAdminId],
  )

  const handleOpenCityModal = (adminId: number) => {
    const admin = allPendingAdmins.find((a) => a.id === adminId)
    if (!admin) return

    setEditingCityAdminId(adminId)
    let initial: string[] = []
    if (Array.isArray(admin.multiple_city)) {
      initial = [...admin.multiple_city]
    } else if (typeof admin.multiple_city === 'string' && admin.multiple_city.trim()) {
      initial = admin.multiple_city.split(',').map((c) => c.trim()).filter(Boolean)
    } else if (admin.user_current_city) {
      initial = [admin.user_current_city]
    }
    setSelectedCities(initial)
  }

  const handleToggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName],
    )
  }

  const handleAddCustomCity = (city: string) => {
    if (city && !selectedCities.includes(city)) {
      setSelectedCities((prev) => [...prev, city])
    }
  }

  const handleSaveCity = () => {
    if (!editingCityAdmin) return
    const adminId = editingCityAdmin.id
    const adminName = editingCityAdmin.name

    cityMutation.mutate(
      {
        id: adminId,
        cities: selectedCities,
        successMessage: `Cities updated for ${adminName}.`,
      },
      {
        onSuccess: () => setEditingCityAdminId(null),
      },
    )
  }

  const handleConfirmStatus = () => {
    if (!actionTarget) return
    const { adminId, adminName, nextStatus } = actionTarget

    statusMutation.mutate(
      {
        id: adminId,
        status: nextStatus,
        successMessage: `Admin ${adminName} has been ${nextStatus}.`,
      },
      {
        onSuccess: () => setActionTarget(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Pending Admin Member Approvals"
        description={panelDescription('/crm/pending-admin-members')}
        chip={
          <span className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-xs font-bold text-gold-800">
            {pendingAdmins.length} Awaiting Review
          </span>
        }
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            <RefreshCw className={isFetching ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
            <span>Refresh Queue</span>
          </Button>
        }
      />

      {/* Table */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search applications by name, mobile, city…"
            />
          }
        />

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={6} />
        ) : error ? (
          <PanelError
            title="Could not load the approval queue"
            message={errorMessage(error, 'Failed to load pending admin members.')}
            onRetry={() => void refetch()}
          />
        ) : pendingAdmins.length === 0 ? (
          <PanelEmpty
            icon={<UserCheck className="size-6" />}
            title="No Pending Admin Members"
            description={
              searchInput
                ? 'No pending applications match your search query.'
                : 'All admin registration applications have been processed and reviewed.'
            }
          />
        ) : (
          <PanelTable
            caption="Admin applications awaiting approval with verification info, city allocation and decision actions"
            head={
              <>
                <PanelTableHeadCell>Applicant</PanelTableHeadCell>
                <PanelTableHeadCell>Alternate Mobile</PanelTableHeadCell>
                <PanelTableHeadCell>State</PanelTableHeadCell>
                <PanelTableHeadCell>ID Document Type</PanelTableHeadCell>
                <PanelTableHeadCell>City Allocation</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Decision Actions</PanelTableHeadCell>
              </>
            }
          >
            {pendingAdmins.map((admin) => {
              const assignedCities = Array.isArray(admin.multiple_city)
                ? admin.multiple_city
                : typeof admin.multiple_city === 'string' && admin.multiple_city.trim()
                  ? admin.multiple_city.split(',').map((c) => c.trim())
                  : []

              return (
                <tr key={admin.id} className="transition-colors hover:bg-cream-50/70">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        src={admin.face_image}
                        name={admin.name}
                        size="md"
                        tone="gold"
                      />
                      <div>
                        <p className="font-bold text-navy-900">{admin.name}</p>
                        <p className="flex items-center gap-1 text-[0.68rem] text-ink-400">
                          <Phone className="size-2.5 text-ink-400" aria-hidden />
                          {admin.mobile || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-medium text-navy-900">
                      {admin.alternate_mobile_no || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-medium text-ink-700">
                      {admin.admin_state || admin.user_current_city || '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    {admin.admin_document_type ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-navy-200 bg-navy-50/70 px-2 py-0.5 text-[0.68rem] font-semibold text-navy-800">
                        <FileText className="size-3 text-navy-600" aria-hidden />
                        {admin.admin_document_type}
                      </span>
                    ) : (
                      <span className="text-[0.7rem] text-ink-400 italic">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex max-w-xs flex-wrap items-center gap-1">
                      {assignedCities.length > 0 ? (
                        assignedCities.map((city) => (
                          <span
                            key={city}
                            className="inline-flex items-center rounded-md border border-gold-200 bg-gold-50 px-2 py-0.5 text-[0.68rem] font-semibold text-gold-800"
                          >
                            {city}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-sm border border-gold-200 bg-gold-50 px-2 py-0.5 text-[0.7rem] font-medium text-gold-800">
                          No cities set
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenCityModal(admin.id)}
                        title="Set cities"
                        aria-label="Set cities"
                        className="ml-1 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-gold-200 bg-gold-50 text-gold-700 transition-colors hover:bg-gold-100 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                      >
                        <MapPin className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <RowStatusSelect
                      value="Pending"
                      options={DECISION_STATUSES}
                      label={`Review ${admin.name}`}
                      onSelect={(next) =>
                        setActionTarget({
                          adminId: admin.id,
                          adminName: admin.name,
                          nextStatus: next,
                        })
                      }
                    />
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => setEditingAdmin(admin)}
                        title="Edit applicant"
                        aria-label="Edit applicant profile"
                        className="cursor-pointer rounded-full border-gold-300 bg-gold-50/70 text-gold-800 hover:bg-gold-100"
                      >
                        <Edit2 className="size-3.5 text-gold-700" aria-hidden />
                      </Button>

                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() =>
                          navigate(`/crm/pending-admin-members/${admin.id}`)
                        }
                        title="View full details"
                        aria-label="View full admin details"
                        className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                      >
                        <Eye className="size-3.5 text-navy-700" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </PanelTable>
        )}

        <PanelTableFooter>
          <PanelPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={isFetching}
            summary={
              <span>
                Total pending: <strong>{meta.total}</strong> applications
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* City Assignment Modal */}
      <CityAssignmentModal
        isOpen={Boolean(editingCityAdmin)}
        adminName={editingCityAdmin?.name ?? ''}
        selectedCities={selectedCities}
        isSaving={cityMutation.isPending}
        onToggleCity={handleToggleCity}
        onAddCustomCity={handleAddCustomCity}
        onSave={handleSaveCity}
        onClose={() => setEditingCityAdminId(null)}
      />

      {/* Confirmation Dialog */}
      {actionTarget && (
        <ConfirmDialog
          isOpen={true}
          title={
            actionTarget.nextStatus === 'Approved'
              ? `Approve Admin: ${actionTarget.adminName}`
              : `Reject Admin Application: ${actionTarget.adminName}`
          }
          description={
            actionTarget.nextStatus === 'Approved'
              ? `This will activate administrator privileges for ${actionTarget.adminName}. They will be able to log in and manage member registrations in assigned cities.`
              : 'Are you sure you want to reject this admin application? The status will be set to Cancel.'
          }
          confirmText={actionTarget.nextStatus === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
          variant={actionTarget.nextStatus === 'Approved' ? 'success' : 'danger'}
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmStatus}
          onClose={() => setActionTarget(null)}
        />
      )}

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={Boolean(editingAdmin)}
        admin={editingAdmin}
        onClose={() => setEditingAdmin(null)}
        onSuccess={() => void refetch()}
      />
    </div>
  )
}
