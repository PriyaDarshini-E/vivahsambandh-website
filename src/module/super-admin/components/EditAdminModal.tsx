/**
 * @file src/module/super-admin/components/EditAdminModal.tsx
 * Modal dialog for editing an administrator profile (name, mobile, alternate mobile,
 * email, state, city, address, document type, ID document file, and photograph).
 */

import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { Edit2, Upload, FileText, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { FormSelect } from '@/components/ui/form-select'
import { PanelModal } from './PanelModal'
import { getStates } from '@/module/registration/api/registration.api'
import { useUpdateAdminMemberMutation } from '../hook/useAdminMembers'
import { sanitizeDigits, sanitizeEmail } from '@/lib/validation'
import type { AdminMember } from '../types'
import type { StateItem } from '@/module/registration/types'

const DOCUMENT_TYPES = [
  { value: 'Aadhar No', label: 'Aadhar No' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Passport', label: 'Passport' },
]

interface EditAdminModalProps {
  isOpen: boolean
  admin: AdminMember | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditAdminModal({
  isOpen,
  admin,
  onClose,
  onSuccess,
}: EditAdminModalProps) {
  const updateMutation = useUpdateAdminMemberMutation()
  const docInputRef = useRef<HTMLInputElement>(null)
  const faceInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [alternateMobile, setAlternateMobile] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [address, setAddress] = useState('')
  const [docType, setDocType] = useState('')

  const [docFile, setDocFile] = useState<File | null>(null)
  const [docPreview, setDocPreview] = useState<string>('')
  const [faceFile, setFaceFile] = useState<File | null>(null)
  const [facePreview, setFacePreview] = useState<string>('')

  const [states, setStates] = useState<StateItem[]>([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Populate fields when modal opens
  useEffect(() => {
    if (isOpen && admin) {
      setName(admin.name || '')
      setMobile(admin.mobile || '')
      setAlternateMobile(admin.alternate_mobile_no || '')
      setEmail(admin.email || '')
      setGender(admin.gender || 'Male')
      setCity(admin.user_current_city || '')
      setState(admin.admin_state || '')
      setAddress(admin.user_address || '')
      setDocType(admin.admin_document_type || '')
      setDocFile(null)
      setDocPreview(admin.admin_document || '')
      setFaceFile(null)
      setFacePreview(admin.face_image || '')
      setFormError(null)
    }
  }, [isOpen, admin])

  // Load state list once
  useEffect(() => {
    if (isOpen && states.length === 0) {
      setLoadingStates(true)
      getStates()
        .then((data) => setStates(data))
        .catch((err) => console.error('Failed to load states for admin edit modal', err))
        .finally(() => setLoadingStates(false))
    }
  }, [isOpen, states.length])

  // Revoke object URLs on unmount / cleanup
  useEffect(() => {
    return () => {
      if (docPreview && docPreview.startsWith('blob:')) {
        URL.revokeObjectURL(docPreview)
      }
      if (facePreview && facePreview.startsWith('blob:')) {
        URL.revokeObjectURL(facePreview)
      }
    }
  }, [docPreview, facePreview])

  const handleDocFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFormError('ID Document must be smaller than 5 MB.')
      return
    }

    if (docPreview && docPreview.startsWith('blob:')) {
      URL.revokeObjectURL(docPreview)
    }

    setDocFile(file)
    setDocPreview(URL.createObjectURL(file))
    setFormError(null)
  }

  const handleFaceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Photograph must be smaller than 5 MB.')
      return
    }

    if (facePreview && facePreview.startsWith('blob:')) {
      URL.revokeObjectURL(facePreview)
    }

    setFaceFile(file)
    setFacePreview(URL.createObjectURL(file))
    setFormError(null)
  }

  const handleSave = async () => {
    if (!admin) return

    if (!name.trim()) {
      setFormError('Admin name is required.')
      return
    }
    if (!mobile.trim() || mobile.length !== 10) {
      setFormError('A valid 10-digit mobile number is required.')
      return
    }

    setFormError(null)

    // Build FormData payload
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('mobile', mobile.trim())
    formData.append('alternate_mobile_no', alternateMobile.trim())
    formData.append('email', email.trim())
    formData.append('gender', gender)
    formData.append('user_current_city', city.trim())
    formData.append('admin_state', state)
    formData.append('user_address', address.trim())
    formData.append('admin_document_type', docType)

    if (docFile) {
      formData.append('admin_document', docFile)
    }
    if (faceFile) {
      formData.append('face_image', faceFile)
    }

    updateMutation.mutate(
      {
        id: admin.id,
        data: formData,
        successMessage: `Admin details for ${name.trim()} updated successfully.`,
      },
      {
        onSuccess: () => {
          onSuccess?.()
          onClose()
        },
        onError: (err) => {
          setFormError(err.message || 'Failed to update admin member.')
        },
      },
    )
  }

  if (!admin) return null

  return (
    <PanelModal
      isOpen={isOpen}
      title={`Edit Admin: ${admin.name}`}
      description="Update profile details, contact info, state, document type, and verification files."
      icon={<Edit2 className="size-5 text-gold-600" aria-hidden />}
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="cursor-pointer rounded-full bg-gold-600 text-xs font-bold text-white hover:bg-gold-700"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {formError && (
          <div className="flex items-center gap-2 rounded-xl border border-maroon-200 bg-maroon-50 p-3 text-xs font-medium text-maroon-700">
            <AlertCircle className="size-4 shrink-0 text-maroon-600" />
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Name */}
          <Field id="edit-admin-name" label="Full Name" required>
            <Input
              id="edit-admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="rounded-xl border-cream-300"
            />
          </Field>

          {/* Gender */}
          <Field id="edit-admin-gender" label="Gender" required>
            <FormSelect
              id="edit-admin-gender"
              value={gender}
              onValueChange={setGender}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              placeholder="Select Gender"
            />
          </Field>

          {/* Primary Mobile */}
          <Field id="edit-admin-mobile" label="Mobile Number" required>
            <Input
              id="edit-admin-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(sanitizeDigits(e.target.value, 10))}
              placeholder="10-digit mobile number"
              className="rounded-xl border-cream-300"
            />
          </Field>

          {/* Alternate Mobile */}
          <Field id="edit-admin-alt-mobile" label="Alternate Mobile Number">
            <Input
              id="edit-admin-alt-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={alternateMobile}
              onChange={(e) => setAlternateMobile(sanitizeDigits(e.target.value, 10))}
              placeholder="Optional alternate mobile"
              className="rounded-xl border-cream-300"
            />
          </Field>

          {/* Email */}
          <Field id="edit-admin-email" label="Email Address">
            <Input
              id="edit-admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
              placeholder="admin@example.com"
              className="rounded-xl border-cream-300"
            />
          </Field>

          {/* Current City */}
          <Field id="edit-admin-city" label="Current City">
            <Input
              id="edit-admin-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai, Indore"
              className="rounded-xl border-cream-300"
            />
          </Field>

          {/* State */}
          <Field id="edit-admin-state" label="State">
            <FormSelect
              id="edit-admin-state"
              value={state}
              onValueChange={setState}
              options={states.map((s) => ({
                value: s.state_name,
                label: s.state_name,
              }))}
              placeholder="Select State"
              loading={loadingStates}
            />
          </Field>

          {/* ID Document Type */}
          <Field id="edit-admin-doctype" label="ID Document Type">
            <FormSelect
              id="edit-admin-doctype"
              value={docType}
              onValueChange={setDocType}
              options={DOCUMENT_TYPES}
              placeholder="Select document type"
            />
          </Field>

          {/* Residential Address */}
          <div className="sm:col-span-2">
            <Field id="edit-admin-address" label="Residential Address">
              <Textarea
                id="edit-admin-address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address details"
                className="rounded-xl border-cream-300"
              />
            </Field>
          </div>

          {/* ID Document File Upload & Preview */}
          <div className="rounded-xl border border-cream-300 bg-cream-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-900">ID Document</span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => docInputRef.current?.click()}
                className="cursor-pointer gap-1 rounded-full border-cream-300 text-[11px]"
              >
                <Upload className="size-3" />
                <span>{docPreview ? 'Change' : 'Upload'}</span>
              </Button>
            </div>
            <input
              ref={docInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleDocFileChange}
              onClick={(e) => {
                ;(e.target as HTMLInputElement).value = ''
              }}
              className="sr-only"
            />
            {docPreview ? (
              <div className="relative flex items-center gap-3 rounded-lg border border-cream-300 bg-white p-2">
                {docPreview.toLowerCase().includes('.pdf') ? (
                  <div className="flex size-10 items-center justify-center rounded-md bg-maroon-50 text-maroon-700">
                    <FileText className="size-5" />
                  </div>
                ) : (
                  <img
                    src={docPreview}
                    alt="ID Document"
                    className="size-10 rounded-md border border-cream-200 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-navy-900">
                    {docFile?.name || admin.admin_document_name || 'Document on file'}
                  </p>
                  <p className="text-[10px] text-ink-400">
                    {docType || 'ID Document'}
                  </p>
                </div>
                {docFile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (docPreview && docPreview.startsWith('blob:')) {
                        URL.revokeObjectURL(docPreview)
                      }
                      setDocFile(null)
                      setDocPreview(admin.admin_document || '')
                    }}
                    className="p-1 text-ink-400 hover:text-maroon-600"
                    title="Revert document"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-ink-400 italic">No document uploaded yet</p>
            )}
          </div>

          {/* Photograph Upload & Preview */}
          <div className="rounded-xl border border-cream-300 bg-cream-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-900">Face Photograph</span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => faceInputRef.current?.click()}
                className="cursor-pointer gap-1 rounded-full border-cream-300 text-[11px]"
              >
                <Upload className="size-3" />
                <span>{facePreview ? 'Change' : 'Upload'}</span>
              </Button>
            </div>
            <input
              ref={faceInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFaceFileChange}
              onClick={(e) => {
                ;(e.target as HTMLInputElement).value = ''
              }}
              className="sr-only"
            />
            {facePreview ? (
              <div className="relative flex items-center gap-3 rounded-lg border border-cream-300 bg-white p-2">
                <img
                  src={facePreview}
                  alt="Photograph"
                  className="size-10 rounded-full border border-cream-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-navy-900">
                    {faceFile?.name || admin.face_image_name || 'Photo on file'}
                  </p>
                  <p className="text-[10px] text-ink-400">Admin avatar</p>
                </div>
                {faceFile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (facePreview && facePreview.startsWith('blob:')) {
                        URL.revokeObjectURL(facePreview)
                      }
                      setFaceFile(null)
                      setFacePreview(admin.face_image || '')
                    }}
                    className="p-1 text-ink-400 hover:text-maroon-600"
                    title="Revert photo"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-ink-400 italic">No photo uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </PanelModal>
  )
}

