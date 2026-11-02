import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getCompany } from '../api/company.api'
import type { CompanyResponse } from '../types'
import { COMPANY, getCompanyAddress } from '../../../constants/company'
import { resolveImageUrl } from '../../../lib/api/apiClient'

export const COMPANY_QUERY_KEY = ['company'] as const

export function useCompanyQuery(
  options?: Omit<UseQueryOptions<CompanyResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: getCompany,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    ...options,
  })
}

/**
 * Convenient hook returning live company fields from the API with canonical fallbacks.
 * If API fails or data is not yet returned, falls back seamlessly to canonical COMPANY constants.
 */
export function useCompanyDetails(lang?: string) {
  const { data, isPending, isError } = useCompanyQuery()
  const live = data?.data

  const phone = live?.company_mobile_no ? `+91 ${live.company_mobile_no}` : COMPANY.supportPhoneDisplay
  const phoneLink = live?.company_mobile_no ? `tel:+91${live.company_mobile_no.replace(/\D/g, '')}` : COMPANY.supportPhoneLink
  const landline = live?.company_landline_no || COMPANY.landlineDisplay
  const landlineLink = live?.company_landline_no ? `tel:${live.company_landline_no.replace(/\D/g, '')}` : COMPANY.landlineLink
  const email = live?.company_email?.trim() || COMPANY.supportEmail
  const fallbackAddress = lang ? getCompanyAddress(lang) : COMPANY.address.en
  const address = live?.company_address?.trim() || fallbackAddress
  const name = live?.company_name?.trim() || COMPANY.name

  const logoUrl = live?.company_logo?.trim()
    ? (resolveImageUrl(live.company_logo, data?.image_url, 'Company') ?? undefined)
    : undefined

  const socials = {
    facebook: live?.company_facebook?.trim() || COMPANY.socials.facebook,
    instagram: live?.company_instagram?.trim() || COMPANY.socials.instagram,
    linkedin: live?.company_linkedin?.trim() || COMPANY.socials.linkedin,
    youtube: live?.company_youtube?.trim() || COMPANY.socials.youtube,
  }

  const apps = {
    playStore: live?.company_play_store?.trim() || COMPANY.apps.playStore,
    appStore: live?.company_app_store?.trim() || COMPANY.apps.appStore,
  }

  return {
    phone,
    phoneLink,
    landline,
    landlineLink,
    email,
    address,
    name,
    logoUrl,
    socials,
    apps,
    raw: live,
    isPending,
    isError,
  }
}

