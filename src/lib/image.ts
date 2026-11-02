import React from 'react'

/**
 * Base URL for remote web images on Vivah Sambandh CRM/CDN server.
 */
export const REMOTE_IMAGE_BASE =
  'https://vivahsambandh.com/crmapi/public/assets/images/web_images'

/**
 * Urgent/Critical images that remain stored locally in `public/images/`
 * for zero-latency above-the-fold render and maximum Lighthouse LCP score.
 * Kept in same folder with same name.
 */
export const URGENT_LOCAL_IMAGES = new Set([
  // Hero LCP Banner (Must stay local for instant LCP)
  '/images/home/home_banner_image-640.webp',
  '/images/home/home_banner_image-800.webp',
  '/images/home/home_banner_image-1024.webp',
  '/images/home/home_banner_image-1280.webp',
  // 1440w variant for desktop (1350px viewport) - Phase 7 gap fix
  '/images/home/home_banner_image-1440.webp',
  '/images/home/home_banner_image.webp',

  // Hero Top/Bottom Garland accents (above-the-fold)
  '/images/home/flower1_image-192.webp',
  '/images/home/flower1_image-320.webp',
  '/images/home/flower2_image-192.webp',
  '/images/home/flower2_image-320.webp',

  // Hero Match Pill Avatars (above-the-fold)
  '/images/home/woman_image-120.webp',
  '/images/home/woman_image-160.webp',
  '/images/home/woman_image-320.webp',
  '/images/home/man_image-120.webp',
  '/images/home/man_image-160.webp',
  '/images/home/man_image-320.webp',
  '/images/home/radiant-indian-bride-in-floral-glow-128.webp',
  '/images/home/radiant-indian-bride-in-floral-glow-200.webp',
  '/images/home/radiant-indian-bride-in-floral-glow-320.webp',
  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp',
  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-200.webp',
  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp',
])

/**
 * Resolves an image path to either local (if urgent) or remote CDN.
 *
 * Examples:
 *   img('/images/home/home_banner_image-640.webp') -> '/images/home/home_banner_image-640.webp' (Local)
 *   img('/images/home/cities/delhi.webp')          -> 'https://vivahsambandh.com/crmapi/public/assets/images/web_images/home/cities/delhi.webp' (Remote)
 */
export function img(path: string | undefined): string {
  if (!path) return ''

  // Already an absolute URL or data URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`

  // Urgent images stay local
  if (URGENT_LOCAL_IMAGES.has(normalized)) {
    return normalized
  }

  // Strip leading '/images/' and point to remote base
  const cleanPath = normalized.replace(/^\/images\//, '').replace(/^\//, '')
  return `${REMOTE_IMAGE_BASE}/${cleanPath}`
}

/**
 * Resolves a responsive `srcSet` string candidates to local or remote URLs.
 *
 * Example:
 *   imgSrcSet('/images/home/Mandap_image-800.webp 800w, /images/home/Mandap_image.webp 1723w')
 */
export function imgSrcSet(srcSet: string | undefined): string {
  if (!srcSet) return ''

  return srcSet
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim()
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 2) {
        const url = parts[0]
        const descriptor = parts.slice(1).join(' ')
        return `${img(url)} ${descriptor}`
      }
      return img(trimmed)
    })
    .join(', ')
}

/**
 * Easy drop-in Image component that resolves local urgent vs remote CDN automatically.
 */
export const Img: React.FC<React.ComponentPropsWithoutRef<'img'>> = ({
  src,
  srcSet,
  ...props
}) => {
  return React.createElement('img', {
    ...props,
    src: src ? img(src) : undefined,
    srcSet: srcSet ? imgSrcSet(srcSet) : undefined,
  })
}

/**
 * Checks if a given file is a WebP image.
 */
export function isWebpFile(file: File): boolean {
  return (
    file.type === 'image/webp' ||
    file.name.toLowerCase().endsWith('.webp')
  )
}

/**
 * Converts any image file (PNG, JPEG, GIF, BMP, etc.) to a true WebP File
 * in the browser using HTML5 Canvas. If the file is already WebP, returns it as-is.
 */
export async function convertToWebpFile(
  file: File,
  quality = 0.92,
): Promise<File> {
  if (isWebpFile(file)) {
    return file
  }

  // Non-image files cannot be converted
  if (!file.type.startsWith('image/')) {
    return file
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const imgObj = new Image()

      imgObj.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = imgObj.naturalWidth || imgObj.width
          canvas.height = imgObj.naturalHeight || imgObj.height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(file)
            return
          }

          ctx.drawImage(imgObj, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }
              const originalBase = file.name.replace(/\.[^/.]+$/, '')
              const webpFileName = `${originalBase || 'client_logo'}.webp`
              const webpFile = new File([blob], webpFileName, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(webpFile)
            },
            'image/webp',
            quality,
          )
        } catch {
          resolve(file)
        }
      }

      imgObj.onerror = () => resolve(file)
      imgObj.src = e.target?.result as string
    }

    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
