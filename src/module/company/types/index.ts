import type { ImageUrlEntry } from '@/lib/api/types'

export interface CompanyData {
  company_name: string | null
  company_description?: string | null
  company_email: string | null
  company_gst: string | null
  company_pan_no: string | null
  company_mobile_no: string | null
  company_landline_no: string | null
  company_address: string | null
  company_place: string | null
  company_facebook?: string | null
  company_instagram?: string | null
  company_linkedin?: string | null
  company_youtube?: string | null
  company_app_store?: string | null
  company_play_store?: string | null
  company_logo: string | null
  isPayment?: string | null
  isDiscount?: string | null
  payment_url?: string | null
  payment_amount?: string | null
  discount_amount?: string | null
  payment_for?: number | string | null
}

export interface CompanyResponse {
  data: CompanyData
  image_url?: ImageUrlEntry[]
}
