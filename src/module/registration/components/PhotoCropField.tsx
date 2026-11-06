/**
 * @file src/module/registration/components/PhotoCropField.tsx
 * Shared photo field with the interactive cropper.
 *
 * Extracted from the user registration photos step so the admin registration
 * form reuses the same control: the preview frame matches the cropper's
 * output aspect exactly, the file input feeds the shared `ImageCropModal`,
 * and the cropped file + preview URL are handed back to the caller.
 */

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImageUp, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import ImageCropModal from './ImageCropModal'

export interface PhotoCropFieldProps {
  /** DOM id of the group wrapper — the error message anchors to it. */
  id: string
  label: string
  subtitle?: string
  /** Preview URL of the already-cropped image. */
  previewUrl?: string
  /** True once a cropped file exists (switches the button to "Change & Crop"). */
  hasPhoto?: boolean
  /** Called with the cropped file and its preview URL. */
  onCropComplete: (file: File, previewUrl: string) => void
  /** Called when the selected file is not an image. */
  onInvalidFile?: () => void
  error?: string
  /** Output aspect ratio (width / height) of the cropper. 1 = square. */
  aspect?: number
  /** Longest edge of the produced image, in pixels. */
  outputSize?: number
  /** `circle` renders the round frame used for face photos. */
  shape?: 'square' | 'circle'
  /** Cropper modal title. */
  cropTitle?: string
  /** Frame size classes — defaults suit the face-photo frame. */
  frameClassName?: string
  /** Optional root container classes */
  className?: string
}

export default function PhotoCropField({
  id,
  label,
  subtitle,
  previewUrl,
  hasPhoto = false,
  onCropComplete,
  onInvalidFile,
  error,
  aspect = 1,
  outputSize = 600,
  shape = 'square',
  cropTitle,
  frameClassName,
  className,
}: PhotoCropFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [isCropOpen, setIsCropOpen] = useState(false)
  const [cropRawSrc, setCropRawSrc] = useState<string | null>(null)
  // The blob URL of the photo being cropped — revoked when it is replaced.
  const cropUrlRef = useRef<string | null>(null)
  // The original (uncropped) file, so "Crop Again" can reopen the cropper.
  const sourceFileRef = useRef<File | null>(null)

  useEffect(() => {
    return () => {
      if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    }
  }, [])

  const openCropper = (file: File) => {
    sourceFileRef.current = file
    // A blob URL keeps a 12 MP phone photo out of a base64 string in memory.
    const url = URL.createObjectURL(file)
    if (cropUrlRef.current) URL.revokeObjectURL(cropUrlRef.current)
    cropUrlRef.current = url

    setCropRawSrc(url)
    setIsCropOpen(true)
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onInvalidFile?.()
      e.target.value = ''
      return
    }

    openCropper(file)
    e.target.value = ''
  }

  const handleCropAgain = () => {
    const file = sourceFileRef.current
    if (!file) return
    openCropper(file)
  }

  const closeCropper = () => {
    setIsCropOpen(false)
    setCropRawSrc(null)
    if (cropUrlRef.current) {
      URL.revokeObjectURL(cropUrlRef.current)
      cropUrlRef.current = null
    }
  }

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    onCropComplete(croppedFile, previewUrl)
  }

  const frame =
    frameClassName ??
    (shape === 'circle'
      ? 'flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white'
      : 'flex h-56 w-42 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gold-500/50 bg-white')

  return (
    <div
      id={id}
      className={cn(
        'flex flex-col rounded-2xl border p-5 transition',
        error ? 'border-maroon-500 bg-maroon-50/20' : 'border-cream-300 bg-cream-50/70',
        className,
      )}
    >
      <span className="text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
        {label} <span className="text-maroon-600" aria-hidden="true">*</span>
      </span>
      {subtitle && (
        <p className="mt-1 text-xs leading-relaxed text-ink-500">{subtitle}</p>
      )}

      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-4">
        {/* The frame matches the cropper's output aspect exactly, so the
            preview shows the uploaded file without cropping it again. */}
        <div className={frame}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="px-4 text-center">
              <ImageUp className="mx-auto size-9 text-gold-500/70" aria-hidden />
              <span className="mt-2 block text-xs text-ink-500">
                {t('registrationPage.form.noPhotoSelected', 'No photo selected')}
              </span>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => inputRef.current?.click()}
          className="h-11 w-full max-w-[16rem] rounded-full border-gold-500/60 bg-white font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50"
        >
          {hasPhoto ? (
            <>
              <RefreshCw aria-hidden />
              {t('registrationPage.form.changeAndCrop', 'Change & Crop')}
            </>
          ) : (
            <>
              <ImageUp aria-hidden />
              {t('registrationPage.form.uploadAndCrop', 'Upload & Crop Photo')}
            </>
          )}
        </Button>

        {/* Re-open the cropper on the original file without re-uploading. */}
        {hasPhoto && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCropAgain}
            className="text-xs font-semibold text-ink-600 hover:text-navy-900"
          >
            {t('registrationPage.form.cropAgain', 'Crop Again')}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-maroon-600">
          {error}
        </p>
      )}

      {/* Image Cropper Modal — portalled directly to document.body */}
      <ImageCropModal
        key={isCropOpen ? 'crop-open' : 'crop-closed'}
        isOpen={isCropOpen}
        aspect={aspect}
        outputSize={outputSize}
        title={cropTitle ?? label}
        imageSrc={cropRawSrc}
        onClose={closeCropper}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
