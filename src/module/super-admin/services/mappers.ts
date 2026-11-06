/**
 * @file src/module/super-admin/services/mappers.ts
 * Translates raw CRM API payloads into the panel's domain types.
 *
 * The API returns reference tables as nested objects (`community.community_name`)
 * and moderation records as `from_user` / `to_user` pairs. The UI should not
 * know that, so every payload is flattened once, here.
 *
 * Image columns arrive as bare filenames (`1_20261021_141116.jpeg`). The real
 * URL is only knowable from the `image_url` metadata block that every endpoint
 * returns next to `data`, so the mappers resolve filenames to absolute URLs
 * here instead of leaving broken `src` values in the DOM.
 */

import { resolveImageUrl, withImageVersion } from '@/lib/api/apiClient'
import { blogBannerRevision } from './blogImageVersion'
import type { ImageUrlEntry } from '@/lib/api/types'
import type {
  AdminMember,
  AdminMemberStatus,
  BlockProfileRecord,
  BlogRecord,
  BlogStatus,
  EnquiryRecord,
  EnquiryStatus,
  FeedbackRecord,
  ListMeta,
  Member,
  MemberStatus,
  NotificationRecord,
  FaqRecord,
  TestimonialRecord,
  ClientRecord,
  ClientStatus,
  GalleryRecord,
  GalleryStatus,
} from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Raw = Record<string, any>

/** Placeholder served by the CRM whenever a record has no uploaded image. */
const DEFAULT_NO_IMAGE_URL =
  'https://vivahsambandh.com/crmapi/public/assets/images/no_image.jpg'

/** Reads the API's "No Image" URL, falling back to the CRM default. */
function noImageUrl(entries: ImageUrlEntry[]): string {
  const entry = entries.find((item) => item.image_for.toLowerCase() === 'no image')
  return entry?.image_url?.trim() || DEFAULT_NO_IMAGE_URL
}

/** Pulls the `image_url` metadata block out of an API envelope. */
export function extractImageEntries(payload: unknown): ImageUrlEntry[] {
  if (!payload || typeof payload !== 'object') return []
  const entries = (payload as Raw).image_url
  return Array.isArray(entries) ? (entries as ImageUrlEntry[]) : []
}

/**
 * Resolves a stored image filename against the endpoint's `image_url` metadata.
 *
 * Returns `null` when there is no attachment, or when the endpoint did not
 * supply the metadata needed to build a URL — the UI then renders a
 * placeholder instead of a broken image.
 */
function resolveImage(
  filename: string | null | undefined,
  entries: ImageUrlEntry[],
  imageFor: string | string[],
): string | null {
  const clean = filename?.trim()
  if (!clean) return noImageUrl(entries)

  const resolved = resolveImageUrl(clean, entries, imageFor)
  return resolved && resolved.trim() ? resolved.trim() : null
}

/**
 * Labels the CRM accepts for a user photograph.
 *
 * The API files member and administrator pictures under the single label
 * "User", while the panel distinguishes the two roles — so both labels are
 * offered and the first one the endpoint knows wins.
 */
const USER_IMAGE_KEYS = ['User', 'Member', 'Admin']

/** Reads a display name from a nested reference object. */
function referenceName(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Raw
  const name =
    record.community_name ?? record.gotra_name ?? record.education_name ?? record.profession_name
  return typeof name === 'string' && name.trim() ? name.trim() : null
}

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length ? str : null
}

function memberStatus(value: unknown): MemberStatus {
  const raw = text(value)?.toLowerCase()
  switch (raw) {
    case 'approved':
      return 'Approved'
    case 'hold':
      return 'Hold'
    case 'married':
      return 'Married'
    case 'cancel':
    case 'cancelled':
      return 'Cancel'
    default:
      return 'Pending'
  }
}

function adminStatus(value: unknown): AdminMemberStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'approved') return 'Approved'
  if (raw === 'cancel' || raw === 'cancelled') return 'Cancel'
  return 'Pending'
}

/** Normalises the blog publication state. */
function blogStatus(value: unknown): BlogStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'active' || raw === '1' || raw === 'published') return 'Active'
  return 'Inactive'
}

/** Reads a boolean flag the API may send as `1`, `0`, `'yes'` or a boolean. */
function flag(value: unknown): boolean {
  if (value === true) return true
  const raw = text(value)?.toLowerCase()
  return raw === '1' || raw === 'yes' || raw === 'true' || raw === 'active'
}

/** Renders a boolean-ish API value as `Yes` / `No`, preserving free text. */
function yesNo(value: unknown): string | null {
  const raw = text(value)
  if (!raw) return null
  const tokens = raw
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return null
  if (tokens.every((token) => /^\d+$/.test(token))) {
    return tokens.some((token) => token !== '0') ? 'Yes' : 'No'
  }
  if (tokens.every((token) => token === '1' || token === 'yes' || token === 'true')) {
    return 'Yes'
  }
  if (tokens.every((token) => token === '0' || token === 'no' || token === 'false')) {
    return 'No'
  }
  return raw
}

/** Joins a city list (array or comma-separated string) for display. */
function cityList(value: unknown): string | null {
  if (Array.isArray(value)) {
    const cities = value.map((city) => String(city).trim()).filter(Boolean)
    return cities.length > 0 ? cities.join(', ') : null
  }
  return text(value)
}

/** Normalises a `/member` or `/getPendingMember` row. */
export function toMember(raw: Raw, entries: ImageUrlEntry[] = []): Member {
  const faceImageName = text(raw.face_image)

  return {
    id: Number(raw.id ?? 0),
    name: text(raw.name) ?? 'Unknown',
    gender: text(raw.gender) ?? '—',
    status: memberStatus(raw.status),
    mobile: text(raw.mobile) ?? '—',
    date_of_birth: text(raw.date_of_birth),
    height_feet: raw.height_feet ?? null,
    height_inch: raw.height_inch ?? null,
    user_current_city: text(raw.user_current_city),
    married_before: text(raw.married_before),
    contact_name: text(raw.contact_name),
    physical_disablity: text(raw.physical_disablity),
    marry_in_community: yesNo(raw.marry_in_community),
    marry_multi_community: text(raw.marry_multi_community),
    register_date: text(raw.register_date),
    face_image: resolveImage(faceImageName, entries, USER_IMAGE_KEYS),
    face_image_name: faceImageName,
    full_image: resolveImage(text(raw.full_image), entries, USER_IMAGE_KEYS),
    full_image_name: text(raw.full_image),
    user_type: raw.user_type ?? null,
    community_name: referenceName(raw.community),
    gotra_name: referenceName(raw.gotra),
    education_name: referenceName(raw.education),
    profession_name: referenceName(raw.profession),
    time_of_birth: text(raw.time_of_birth),
    place_of_birth: text(raw.place_of_birth),
    email: text(raw.email),
    company_name: text(raw.company_name),
    company_type: text(raw.company_type),
    annual_income: text(raw.annual_income),
    father_name: text(raw.father_name),
    mother_name: text(raw.mother_name),
    brother_married: text(raw.brother_married),
    brother_un_married: text(raw.brother_un_married),
    sister_married: text(raw.sister_married),
    sister_un_married: text(raw.sister_un_married),
    user_address: text(raw.user_address),
    house_type: text(raw.house_type),
    multiple_city: cityList(raw.multiple_city),
    alternate_contact_name: text(raw.alternate_contact_name),
    alternate_mobile_no: text(raw.alternate_mobile_no),
    divorce_status: text(raw.divorce_status),
    children_from_prior_marriage: text(raw.children_from_prior_marriage),
    children_with: text(raw.children_with),
    will_marry_same_gotra: yesNo(raw.will_marry_same_gotra),
    is_manglik: yesNo(raw.is_manglik),
    will_marry_manglik: yesNo(raw.will_marry_manglik),
    user_summary: text(raw.user_summary),
    remarks: text(raw.remarks),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    updated_by: text(raw.updated_by),
    created_by: text(raw.created_by),
  }
}

/** Normalises a `/getAdminMember` or `/getPendingAdminMember` row. */
export function toAdminMember(raw: Raw, entries: ImageUrlEntry[] = []): AdminMember {
  const faceImageName = text(raw.face_image)
  const docName = text(raw.admin_document)

  return {
    id: Number(raw.id ?? 0),
    name: text(raw.name) ?? 'Unknown',
    status: adminStatus(raw.status),
    mobile: text(raw.mobile),
    alternate_mobile_no: text(raw.alternate_mobile_no),
    admin_state: text(raw.admin_state),
    admin_document_type: text(raw.admin_document_type),
    admin_document: docName
      ? resolveImage(docName, entries, ['Document', 'Admin', 'User']) || docName
      : null,
    admin_document_name: docName,
    email: text(raw.email),
    gender: text(raw.gender),
    user_address: text(raw.user_address),
    user_current_city: text(raw.user_current_city),
    multiple_city: raw.multiple_city ?? null,
    register_date: text(raw.register_date),
    face_image: resolveImage(faceImageName, entries, USER_IMAGE_KEYS),
    face_image_name: faceImageName,
    user_type: raw.user_type ?? null,
  }
}

/** Normalises a `/feedback` row. */
export function toFeedback(raw: Raw, entries: ImageUrlEntry[] = []): FeedbackRecord {
  return {
    id: Number(raw.id ?? 0),
    name: text(raw.from_user?.name) ?? 'Anonymous User',
    message: text(raw.feedback_description) ?? text(raw.message) ?? '',
    created_at: text(raw.feedback_date) ?? text(raw.created_at),
    from_id: raw.from_id ?? null,
    /** Absolute URL of the submitter photograph, resolved from the API metadata. */
    face_image: resolveImage(text(raw.from_user?.face_image), entries, USER_IMAGE_KEYS),
  }
}

/** Normalises a `/blockProfile` row. */
export function toBlockProfile(raw: Raw, entries: ImageUrlEntry[] = []): BlockProfileRecord {
  return {
    id: Number(raw.id ?? 0),
    member_name: text(raw.to_user?.name) ?? text(raw.member_name),
    blocked_by_name: text(raw.from_user?.name) ?? text(raw.blocked_by_name),
    reason:
      text(raw.blockprofile_description) ?? text(raw.reason) ?? 'No reason reported.',
    created_at: text(raw.blockprofile_date) ?? text(raw.created_at),
    member_id: raw.to_id ?? raw.member_id ?? null,
    blocked_user_id: raw.to_id ?? null,
    /** Absolute URL of the blocked account photograph. */
    face_image: resolveImage(text(raw.to_user?.face_image), entries, USER_IMAGE_KEYS),
    /** Absolute URL of the reporter's photograph. */
    blocked_by_image: resolveImage(text(raw.from_user?.face_image), entries, USER_IMAGE_KEYS),
  }
}

/** Normalises a `/notification` row. */
export function toNotification(raw: Raw, entries: ImageUrlEntry[] = []): NotificationRecord {
  const imageName = text(raw.notification_image)

  return {
    id: Number(raw.id ?? 0),
    notification_date: text(raw.notification_date) ?? '',
    notification_for: (text(raw.notification_for) === 'Admin' ? 'Admin' : 'User') as
      | 'User'
      | 'Admin',
    notification_heading: text(raw.notification_heading) ?? '',
    notification_message: text(raw.notification_message) ?? '',
    notification_image: resolveImage(imageName, entries, 'Notification'),
    notification_image_name: imageName,
    created_at: text(raw.created_at),
  }
}

const DEFAULT_BLOG_IMAGE_URL =
  'https://vivahsambandh.com/crmapi/public/assets/images/blog_images/'

let cachedBlogImageEntries: ImageUrlEntry[] = [
  {
    image_for: 'Blog',
    image_url: DEFAULT_BLOG_IMAGE_URL,
  },
  {
    image_for: 'No Image',
    image_url: DEFAULT_NO_IMAGE_URL,
  },
]

export function setCachedBlogImageEntries(entries: ImageUrlEntry[]): void {
  if (entries && entries.length > 0) {
    cachedBlogImageEntries = entries
  }
}

export function getCachedBlogImageEntries(): ImageUrlEntry[] {
  return cachedBlogImageEntries
}

export function resolveBlogImageUrl(
  filename: string | null | undefined,
  entries?: ImageUrlEntry[],
): string | null {
  const effectiveEntries = entries && entries.length > 0 ? entries : cachedBlogImageEntries
  if (!filename || !filename.trim()) return noImageUrl(effectiveEntries)
  const clean = filename.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }
  const resolved =
    resolveImage(clean, effectiveEntries, 'Blog') ??
    resolveImage(clean, effectiveEntries, 'blog') ??
    resolveImage(clean, effectiveEntries, 'blogs')
  if (resolved) return resolved

  return `${DEFAULT_BLOG_IMAGE_URL}${clean.replace(/^\/+/, '')}`
}

/**
 * Normalises a `/blog` row.
 *
 * The blog endpoints expose the same field under several names (`blog_title`
 * and `title`, `blog_slug` and `slug`, …), so each value is read from the
 * full alias list before it is flattened.
 */
export function toBlog(raw: Raw, entries: ImageUrlEntry[] = []): BlogRecord {
  if (entries && entries.length > 0) {
    const hasBlog = entries.some(
      (e) => e.image_for.toLowerCase() === 'blog' || e.image_for.toLowerCase() === 'blogs',
    )
    if (hasBlog) {
      setCachedBlogImageEntries(entries)
    }
  }

  const bannerName = text(raw.blog_banner_image) ?? text(raw.banner_image)

  // The banner file is overwritten in place and served with a one-year
  // `max-age`, so the URL needs a version token — otherwise the browser keeps
  // showing the picture the article had before it was replaced.
  const bannerVersion = [
    text(raw.updated_at) ?? text(raw.blog_updated_date) ?? text(raw.blog_created_date),
    blogBannerRevision(raw.id),
  ]
    .filter(Boolean)
    .join('-')

  return {
    id: Number(raw.id ?? 0),
    title: text(raw.blog_title) ?? text(raw.title) ?? '',
    slug: text(raw.blog_slug) ?? text(raw.slug) ?? '',
    short_description:
      text(raw.blog_short_description) ?? text(raw.short_description),
    description: text(raw.blog_description) ?? text(raw.description),
    banner_image: withImageVersion(
      resolveBlogImageUrl(bannerName, entries),
      bannerVersion,
    ),
    banner_image_name: bannerName,
    banner_image_alt:
      text(raw.blog_banner_image_alt) ?? text(raw.banner_image_alt) ?? text(raw.alt_text),
    categories_id:
      text(raw.blog_categories_ids) ?? text(raw.category_id) ?? text(raw.categories_id),
    categories: text(raw.categories),
    meta_keywords: text(raw.blog_meta_keywords) ?? text(raw.meta_keywords),
    status: blogStatus(raw.blog_status ?? raw.status),
    index: raw.blog_index ?? raw.index ?? null,
    is_front: flag(raw.blog_front ?? raw.front ?? raw.is_home),
    is_featured: flag(raw.blog_featured ?? raw.featured ?? raw.is_featured),
    created_date: text(raw.blog_created_date) ?? text(raw.created_at),
    updated_date: text(raw.blog_updated_date) ?? text(raw.updated_at),
    created_by: text(raw.created_by),
  }
}

/**
 * Normalises an FAQ record.
 */
export function toFaq(raw: Raw): FaqRecord {
  const subs = Array.isArray(raw.subs)
    ? raw.subs.map((s: Raw) => ({
        id: s.id ? Number(s.id) : undefined,
        faq_top_id: s.faq_top_id ? Number(s.faq_top_id) : undefined,
        faq_sort: s.faq_sort ?? '1',
        faq_for: text(s.faq_for) ?? text(raw.faq_for) ?? '',
        faq_heading: text(s.faq_heading) ?? '',
        faq_que: text(s.faq_que) ?? '',
        faq_ans: text(s.faq_ans) ?? '',
        faq_status:
          String(s.faq_status).toLowerCase() === 'inactive' ||
          s.faq_status === 0 ||
          s.faq_status === '0'
            ? 'Inactive'
            : 'Active',
      }))
    : []

  return {
    id: Number(raw.id ?? 0),
    faq_for: text(raw.faq_for) ?? '',
    faq_status:
      String(raw.faq_status).toLowerCase() === 'inactive' ||
      raw.faq_status === 0 ||
      raw.faq_status === '0'
        ? 'Inactive'
        : 'Active',
    subs,
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

/**
 * Normalises a Testimonial record.
 */
export function toTestimonial(raw: Raw): TestimonialRecord {
  return {
    id: Number(raw.id ?? 0),
    testimonial_for: text(raw.testimonial_for) ?? '',
    testimonial_client_name: text(raw.testimonial_client_name) ?? '',
    testimonial_description: text(raw.testimonial_description) ?? '',
    testimonial_rating: raw.testimonial_rating ?? '5',
    testimonial_status:
      String(raw.testimonial_status).toLowerCase() === 'inactive' ||
      raw.testimonial_status === 0 ||
      raw.testimonial_status === '0'
        ? 'Inactive'
        : 'Active',
    testimonial_created_date: text(raw.testimonial_created_date) ?? text(raw.created_at),
    testimonial_updated_date: text(raw.testimonial_updated_date) ?? text(raw.updated_at),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

const DEFAULT_CLIENT_IMAGE_URL =
  'https://vivahsambandh.com/crmapi/public/assets/images/client_images/'

let cachedClientImageEntries: ImageUrlEntry[] = [
  {
    image_for: 'Client',
    image_url: DEFAULT_CLIENT_IMAGE_URL,
  },
  {
    image_for: 'No Image',
    image_url: DEFAULT_NO_IMAGE_URL,
  },
]

export function setCachedClientImageEntries(entries: ImageUrlEntry[]): void {
  if (entries && entries.length > 0) {
    cachedClientImageEntries = entries
  }
}

export function getCachedClientImageEntries(): ImageUrlEntry[] {
  return cachedClientImageEntries
}

/**
 * Resolves a client image filename to a full HTTPS URL using list image_url entries
 * or the fallback client images directory.
 */
export function resolveClientImageUrl(
  filename: string | null | undefined,
  entries?: ImageUrlEntry[],
): string | null {
  const effectiveEntries = entries && entries.length > 0 ? entries : cachedClientImageEntries
  if (!filename || !filename.trim()) return noImageUrl(effectiveEntries)
  const clean = filename.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }
  const resolved =
    resolveImage(clean, effectiveEntries, 'Client') ??
    resolveImage(clean, effectiveEntries, 'client') ??
    resolveImage(clean, effectiveEntries, 'clients')
  if (resolved) return resolved

  return `${DEFAULT_CLIENT_IMAGE_URL}${clean.replace(/^\/+/, '')}`
}

/**
 * Normalises a Client record.
 */
export function toClient(raw: Raw, entries: ImageUrlEntry[] = []): ClientRecord {
  if (entries && entries.length > 0) {
    const hasClient = entries.some(
      (e) => e.image_for.toLowerCase() === 'client' || e.image_for.toLowerCase() === 'clients',
    )
    if (hasClient) {
      setCachedClientImageEntries(entries)
    }
  }

  const statusStr = text(raw.clients_status ?? raw.client_status ?? raw.status)?.toLowerCase()
  const clients_status: ClientStatus =
    statusStr === 'inactive' || raw.clients_status === 0 || raw.clients_status === '0'
      ? 'Inactive'
      : 'Active'

  const img = text(raw.clients_image ?? raw.client_image ?? raw.image)

  return {
    id: Number(raw.id ?? 0),
    clients_name:
      text(raw.clients_name) ??
      text(raw.client_name) ??
      text(raw.name) ??
      '',
    clients_image: resolveClientImageUrl(img, entries),
    clients_status,
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

/** Normalises the enquiry lifecycle state. */
function enquiryStatus(value: unknown): EnquiryStatus {
  const raw = text(value)?.toLowerCase()
  if (raw === 'processing' || raw === 'in progress') return 'Processing'
  if (raw === 'completed' || raw === 'complete' || raw === 'closed') return 'Completed'
  if (raw === 'cancel' || raw === 'cancelled') return 'Cancel'
  return 'Pending'
}

/**
 * Normalises a `/enquiry` row.
 *
 * The endpoint returns the form fields under their public names
 * (`enquiryFullName`, `enquiryMobile`, …), so each one is read from the
 * aliases the API has shipped over time.
 */
export function toEnquiry(raw: Raw): EnquiryRecord {
  return {
    id: Number(raw.id ?? 0),
    full_name:
      text(raw.enquiryFullName) ?? text(raw.enquiry_full_name) ?? text(raw.full_name),
    mobile: text(raw.enquiryMobile) ?? text(raw.enquiry_mobile) ?? text(raw.mobile),
    email: text(raw.enquiryEmail) ?? text(raw.enquiry_email) ?? text(raw.email),
    service: text(raw.enquiryService) ?? text(raw.enquiry_service) ?? text(raw.service),
    source: text(raw.enquiryFrom) ?? text(raw.enquiry_from) ?? text(raw.source),
    message:
      text(raw.enquiryMessage) ?? text(raw.enquiry_message) ?? text(raw.message),
    status: enquiryStatus(raw.enquiryStatus ?? raw.enquiry_status ?? raw.status),
    utm_medium: text(raw.utm_medium),
    utm_source: text(raw.utm_source),
    utm_campaign: text(raw.utm_campaign),
    created_at:
      text(raw.created_at) ?? text(raw.enquiry_date) ?? text(raw.enquiry_created_date),
    updated_at: text(raw.updated_at) ?? text(raw.enquiry_updated_date),
  }
}

/**
 * Reads the pagination block out of a list envelope.
 *
 * The paging endpoints answer with
 * `{ data: { current_page, data: [...], per_page, total, last_page } }`;
 * the ones that do not page send a bare array, and the panel derives the
 * block from the rows it has.
 */
export function toListMeta(
  payload: unknown,
  fallback: { page?: number; per_page?: number; rowCount?: number } = {},
): ListMeta {
  const envelope = (payload as { data?: Record<string, unknown> } | null)?.data
  const block =
    envelope && typeof envelope === 'object' && !Array.isArray(envelope)
      ? (envelope as Record<string, unknown>)
      : null

  const perPage = Number(block?.per_page ?? fallback.per_page ?? 10)
  const total = Number(block?.total ?? fallback.rowCount ?? 0)

  return {
    current_page: Number(block?.current_page ?? fallback.page ?? 1),
    last_page: Number(block?.last_page ?? Math.max(1, Math.ceil(total / perPage))),
    per_page: perPage,
    total,
  }
}

/**
 * Unwraps the API envelope. Handles bare arrays, `{ data: [...] }`, and
 * paginated envelopes like `{ data: { data: [...] } }`.
 */
export function toList<T>(
  payload: unknown,
  mapper: (row: Raw, entries: ImageUrlEntry[]) => T,
): T[] {
  const rawData = (payload as Raw)?.data
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : []
  const entries = extractImageEntries(payload)
  return rows.map((row: Raw) => mapper(row, entries))
}

/**
 * Unwraps a single-record envelope (`{ data: {...} }`) and maps it.
 * Returns `null` for empty payloads so callers can surface "not found".
 */
export function toItem<T>(
  payload: unknown,
  mapper: (row: Raw, entries: ImageUrlEntry[]) => T,
): T | null {
  const rawData = (payload as Raw)?.data
  const row = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(rawData)
      ? rawData[0]
      : rawData
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null
  return mapper(row as Raw, extractImageEntries(payload))
}

const DEFAULT_GALLERY_IMAGE_URL =
  'https://vivahsambandh.com/crmapi/public/assets/images/gallerys_images/'

let cachedGalleryBaseUrl: string = DEFAULT_GALLERY_IMAGE_URL

let cachedGalleryImageEntries: ImageUrlEntry[] = [
  {
    image_for: 'Gallery',
    image_url: DEFAULT_GALLERY_IMAGE_URL,
  },
  {
    image_for: 'No Image',
    image_url: DEFAULT_NO_IMAGE_URL,
  },
]

export function setCachedGalleryImageEntries(entries: ImageUrlEntry[]): void {
  if (entries && entries.length > 0) {
    cachedGalleryImageEntries = entries
    const galleryEntry = entries.find(
      (e) => e.image_for.toLowerCase() === 'gallery' || e.image_for.toLowerCase() === 'galleries',
    )
    if (galleryEntry?.image_url) {
      setCachedGalleryBaseUrl(galleryEntry.image_url)
    }
  }
}

export function setCachedGalleryBaseUrl(url: string | null | undefined): void {
  if (url && typeof url === 'string' && url.trim()) {
    const clean = url.trim()
    cachedGalleryBaseUrl = clean.endsWith('/') ? clean : `${clean}/`
  }
}

export function getCachedGalleryBaseUrl(): string {
  return cachedGalleryBaseUrl
}

export function getCachedGalleryImageEntries(): ImageUrlEntry[] {
  return cachedGalleryImageEntries
}

export function resolveGalleryImageUrl(
  filename: string | null | undefined,
  entries?: ImageUrlEntry[],
  baseUrl?: string | null,
): string | null {
  const effectiveEntries = entries && entries.length > 0 ? entries : cachedGalleryImageEntries
  if (!filename || !filename.trim()) return noImageUrl(effectiveEntries)
  const clean = filename.trim()
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }

  // 1. Direct base URL from row (e.g. raw.gallery_url)
  const explicitBase = baseUrl && typeof baseUrl === 'string' && baseUrl.trim() ? baseUrl.trim() : null
  if (explicitBase) {
    const prefix = explicitBase.endsWith('/') ? explicitBase : `${explicitBase}/`
    return `${prefix}${clean.replace(/^\/+/, '')}`
  }

  // 2. Resolve against ImageUrlEntry metadata if available
  const resolved =
    resolveImage(clean, effectiveEntries, 'Gallery') ??
    resolveImage(clean, effectiveEntries, 'gallery') ??
    resolveImage(clean, effectiveEntries, 'galleries')
  if (resolved) return resolved

  // 3. Fallback to cached baseUrl
  const fallbackBase = cachedGalleryBaseUrl || DEFAULT_GALLERY_IMAGE_URL
  const prefix = fallbackBase.endsWith('/') ? fallbackBase : `${fallbackBase}/`
  return `${prefix}${clean.replace(/^\/+/, '')}`
}

/**
 * Normalises a Gallery record.
 */
export function toGallery(raw: Raw, entries: ImageUrlEntry[] = []): GalleryRecord {
  // If row or payload supplies gallery_url, cache it dynamically
  const rowBaseUrl = text(raw.gallery_url ?? raw.image_url ?? raw.url)
  if (rowBaseUrl && (rowBaseUrl.startsWith('http://') || rowBaseUrl.startsWith('https://'))) {
    setCachedGalleryBaseUrl(rowBaseUrl)
  }

  if (entries && entries.length > 0) {
    const hasGallery = entries.some(
      (e) => e.image_for.toLowerCase() === 'gallery' || e.image_for.toLowerCase() === 'galleries',
    )
    if (hasGallery) {
      setCachedGalleryImageEntries(entries)
    }
  }

  const statusStr = text(raw.gallery_status ?? raw.status)?.toLowerCase()
  const gallery_status: GalleryStatus =
    statusStr === 'inactive' || raw.gallery_status === 0 || raw.gallery_status === '0'
      ? 'Inactive'
      : 'Active'

  const img = text(
    raw.gallery_image ??
      raw.image ??
      raw.photo ??
      raw.file ??
      (Array.isArray(raw.gallery_images) && raw.gallery_images.length > 0
        ? raw.gallery_images[0]
        : null),
  )

  return {
    id: Number(raw.id ?? 0),
    gallery_image: resolveGalleryImageUrl(img, entries, rowBaseUrl),
    gallery_status,
    title: text(raw.title ?? raw.gallery_title ?? raw.name),
    created_at: text(raw.created_at),
    updated_at: text(raw.updated_at),
    created_by: text(raw.created_by),
    updated_by: text(raw.updated_by),
  }
}

