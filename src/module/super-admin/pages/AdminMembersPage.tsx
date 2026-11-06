/**
 * @file src/module/super-admin/pages/AdminMembersPage.tsx
 * Admin Members management: view administrators, update city assignments (multiple_city), and update status.
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  RefreshCw,
  Edit2,
  Eye,
  Phone,
  Smartphone,
  FileText,
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
import { PanelFilterSelect } from '../components/PanelFilterSelect'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { RowStatusSelect } from '../components/RowStatusSelect'
import { CityAssignmentModal } from '../components/CityAssignmentModal'
import { EditAdminModal } from '../components/EditAdminModal'
import {
  useAdminMembersQuery,
  useRemoveDeviceIdMutation,
  useUpdateMemberCityMutation,
  useUpdateMemberStatusMutation,
} from '../hook/useAdminMembers'
import { errorMessage } from '../hook/errors'
import { DEFAULT_PER_PAGE, useServerSearch } from '../hook/useServerList'
import type { AdminMember, AdminMemberStatus } from '../types'

const STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Cancel'] as const

const STATUS_OPTIONS = STATUS_FILTERS.filter(
  (status): status is AdminMemberStatus => status !== 'All',
)

export default function AdminMembersPage() {
  const navigate = useNavigate()
  const { searchInput, setSearchInput, searchTerm } = useServerSearch()
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [page, setPage] = useState(1)

  const {
    data: allAdmins = [],
    records: admins,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminMembersQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
    page,
    per_page: DEFAULT_PER_PAGE,
  })
  const cityMutation = useUpdateMemberCityMutation()
  const statusMutation = useUpdateMemberStatusMutation()
  const removeDeviceMutation = useRemoveDeviceIdMutation()

  // Edit City Modal State
  const [editingCityAdminId, setEditingCityAdminId] = useState<number | null>(null)
  const [selectedCities, setSelectedCities] = useState<string[]>([])

  // Status Change Confirmation Modal State
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    adminId: number
    adminName: string
    nextStatus: AdminMemberStatus
  } | null>(null)

  // Remove Device Confirmation Modal State
  const [removeDeviceTarget, setRemoveDeviceTarget] = useState<{
    id: number | string
    name: string
  } | null>(null)

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminMember | null>(null)

  const editingCityAdmin = useMemo(
    () => allAdmins.find((a) => a.id === editingCityAdminId) ?? null,
    [allAdmins, editingCityAdminId],
  )

  // Open Edit City modal
  const handleOpenCityModal = (adminId: number) => {
    const admin = allAdmins.find((a) => a.id === adminId)
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

  // Toggle city in selection
  const handleToggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [...prev, cityName],
    )
  }

  // Add custom city
  const handleAddCustomCity = (city: string) => {
    if (city && !selectedCities.includes(city)) {
      setSelectedCities((prev) => [...prev, city])
    }
  }

  // Save City Assignments
  const handleSaveCity = () => {
    if (!editingCityAdmin) return
    const adminId = editingCityAdmin.id
    const adminName = editingCityAdmin.name

    cityMutation.mutate(
      {
        id: adminId,
        cities: selectedCities,
        successMessage: `Cities updated successfully for ${adminName}.`,
      },
      {
        onSuccess: () => setEditingCityAdminId(null),
      },
    )
  }

  // Execute Status Change
  const handleConfirmStatusChange = () => {
    if (!statusChangeTarget) return
    const { adminId, adminName, nextStatus } = statusChangeTarget

    statusMutation.mutate(
      {
        id: adminId,
        status: nextStatus,
        successMessage: `Status of ${adminName} updated to ${nextStatus}.`,
      },
      {
        onSuccess: () => setStatusChangeTarget(null),
      },
    )
  }

  // Execute Remove Device ID
  const handleConfirmRemoveDevice = () => {
    if (!removeDeviceTarget) return
    const { id, name } = removeDeviceTarget

    removeDeviceMutation.mutate(
      {
        id,
        successMessage: `Device ID removed successfully for ${name}.`,
      },
      {
        onSuccess: () => setRemoveDeviceTarget(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Admin Members Management"
        description={panelDescription('/crm/admin-members')}
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
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Data Table Card */}
      <PanelCard flush>
        <PanelToolbar
          search={
            <PanelSearch
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by name, mobile, email, or city…"
            />
          }
        >
          <PanelFilterSelect
            id="filter-admin-status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
            showStatusDots
          />
        </PanelToolbar>

        {isLoading ? (
          <PanelTableSkeleton rows={6} columns={6} />
        ) : error ? (
          <PanelError
            title="Could not load admin members"
            message={errorMessage(error, 'Failed to load the admin directory.')}
            onRetry={() => void refetch()}
          />
        ) : admins.length === 0 ? (
          <PanelEmpty
            icon={<ShieldCheck className="size-6" />}
            title="No Admin Members Found"
            description={
              searchInput || statusFilter !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : 'No admin members are currently registered in the database.'
            }
            action={
              searchInput || statusFilter !== 'All' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setSearchInput('')
                    setStatusFilter('All')
                  }}
                  className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable
            caption="Regional administrators with contact details, verification info, assigned cities and status"
            head={
              <>
                <PanelTableHeadCell>Admin Name</PanelTableHeadCell>
                <PanelTableHeadCell>Alternate Mobile</PanelTableHeadCell>
                <PanelTableHeadCell>State</PanelTableHeadCell>
                <PanelTableHeadCell>ID Document Type</PanelTableHeadCell>
                <PanelTableHeadCell>Assigned Cities</PanelTableHeadCell>
                <PanelTableHeadCell>Status</PanelTableHeadCell>
                <PanelTableHeadCell align="right">Actions</PanelTableHeadCell>
              </>
            }
          >
            {admins.map((admin) => {
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
                        tone="navy"
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
                        <span className="text-[0.7rem] text-ink-400 italic">
                          None assigned
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenCityModal(admin.id)}
                        title="Edit City Assignments"
                        aria-label="Edit city assignments"
                        className="ml-1 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-gold-200 bg-gold-50 text-gold-700 transition-colors hover:bg-gold-100 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                      >
                        <Edit2 className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <RowStatusSelect
                      value={admin.status}
                      options={STATUS_OPTIONS}
                      label={`Change status for ${admin.name}`}
                      onSelect={(next) =>
                        setStatusChangeTarget({
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
                        title="Edit admin profile"
                        aria-label="Edit admin profile"
                        className="cursor-pointer rounded-full border-gold-300 bg-gold-50/70 text-gold-800 hover:bg-gold-100"
                      >
                        <Edit2 className="size-3.5 text-gold-700" aria-hidden />
                      </Button>

                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() => navigate(`/crm/admin-members/${admin.id}`)}
                        title="View full details"
                        aria-label="View full admin details"
                        className="cursor-pointer rounded-full border-navy-200 text-navy-700 hover:bg-navy-50"
                      >
                        <Eye className="size-3.5 text-navy-700" aria-hidden />
                      </Button>

                      <Button
                        type="button"
                        size="icon-xs"
                        variant="outline"
                        onClick={() =>
                          setRemoveDeviceTarget({
                            id: admin.id,
                            name: admin.name,
                          })
                        }
                        title="Remove Registered Device ID"
                        aria-label="Remove registered device ID"
                        className="cursor-pointer rounded-full border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100"
                      >
                        <Smartphone className="size-3.5 text-amber-700" aria-hidden />
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
                Showing <strong>{admins.length}</strong> of{' '}
                <strong>{meta.total}</strong> admin accounts
              </span>
            }
          />
        </PanelTableFooter>
      </PanelCard>

      {/* Edit Multiple City Assignment Modal */}
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

      {/* Status Change Confirmation Dialog */}
      {statusChangeTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Update Status to "${statusChangeTarget.nextStatus}"`}
          description={`Are you sure you want to change the status of ${statusChangeTarget.adminName} to ${statusChangeTarget.nextStatus}?`}
          confirmText={`Yes, Set to ${statusChangeTarget.nextStatus}`}
          variant={
            statusChangeTarget.nextStatus === 'Cancel'
              ? 'danger'
              : statusChangeTarget.nextStatus === 'Approved'
                ? 'success'
                : 'primary'
          }
          isLoading={statusMutation.isPending}
          onConfirm={handleConfirmStatusChange}
          onClose={() => setStatusChangeTarget(null)}
        />
      )}

      {/* Remove Device ID Confirmation Dialog */}
      {removeDeviceTarget && (
        <ConfirmDialog
          isOpen={true}
          title="Remove Device ID"
          description={`Are you sure you want to remove the registered device ID for "${removeDeviceTarget.name}"? This unlinks their current device and allows login from a new device.`}
          confirmText="Yes, Remove Device"
          cancelText="Cancel"
          variant="danger"
          isLoading={removeDeviceMutation.isPending}
          onConfirm={handleConfirmRemoveDevice}
          onClose={() => setRemoveDeviceTarget(null)}
        />
      )}
      {/* Edit Admin Profile Modal */}
      <EditAdminModal
        isOpen={Boolean(editingAdmin)}
        admin={editingAdmin}
        onClose={() => setEditingAdmin(null)}
        onSuccess={() => void refetch()}
      />
    </div>
  )
}
