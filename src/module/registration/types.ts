/**
 * @file src/module/registration/types.ts
 * Type definitions for Vivah Sambandh Registration Form and CRM API.
 */

export interface EducationItem {
  id: number
  education_name: string
}

export interface CommunityItem {
  id: number
  community_name: string
}

export interface GotraItem {
  id: number
  gotra_name: string
}

export interface ProfessionItem {
  id: number
  profession_name: string
}

export interface ApiResponse<T> {
  data: T
  code?: number
  message?: string
}

export interface StateItem {
  id?: number | string
  state_name: string
}

export interface AdminRegisterFormData {
  name: string
  gender: 'Male' | 'Female' | ''
  email: string
  user_address: string
  user_current_city: string
  mobile: string
  alternate_mobile_no: string
  admin_state: string
  admin_document_type: string
  admin_document: File | null
  admin_document_preview: string
  face_image: File | null
  face_image_preview: string
  agree_terms: boolean
}

export interface RegistrationFormData {
  // Personal Details
  name: string
  gender: 'Male' | 'Female' | ''
  date_of_birth: string
  time_of_birth: string
  place_of_birth: string
  email: string

  // Education & Profession
  education_id: string
  profession_id: string
  company_name: string
  company_type: string
  annual_income: string

  // Physical Attributes
  height_feet: string
  height_inch: string
  physical_disablity: 'Yes' | 'No' | ''

  // Family Details
  father_name: string
  mother_name: string
  brother_married: string
  brother_un_married: string
  sister_married: string
  sister_un_married: string

  // Address & Contacts
  user_address: string
  house_type: 'Own' | 'Rent' | ''
  user_current_city: string
  contact_name: string
  mobile: string
  alternate_contact_name: string
  alternate_mobile_no: string

  // Community & Gotra
  community_id: string
  gotra_id: string
  marry_in_community: string[]

  // Marital Status & Children
  married_before: 'No' | 'Yes and Divorced' | 'Yes and Spouse died' | ''
  divorce_status?: string
  children_from_prior_marriage?: string
  children_with?: 'All with me' | 'All with ex-spouse' | 'Shared between us' | ''

  // Partner Preferences
  will_marry_same_gotra: 'Yes' | 'No' | ''
  is_manglik: 'Yes' | 'No' | ''
  will_marry_manglik: 'Yes' | 'No' | ''

  // Additional Info / Summary
  user_summary: string

  // Photographs
  full_image: File | null
  face_image: File | null
  full_image_preview?: string
  face_image_preview?: string

  // Agreement
  agree_terms: boolean
}

export interface AdminRegistrationFormData {
  name: string
  gender: 'Male' | 'Female' | ''
  email: string
  user_address: string
  user_current_city: string
  mobile: string
  face_image: File | null
  face_image_preview?: string
}
