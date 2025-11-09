// Firestore Type Definitions for AI-Powered Tenant Verification Platform

import { Timestamp } from 'firebase/firestore'

// ============= USERS & PROFILES =============

export interface User {
  id: string
  email: string
  role: 'tenant' | 'landlord' | 'admin'
  created_at: Timestamp
  last_login: Timestamp
  fcm_tokens?: string[]
}

export interface SeriosityBreakdown {
  id_verified: number
  income_proof: number
  interview_clarity: number
  response_consistency: number
  responsiveness: number
  references: number
}

export interface Document {
  url: string
  uploaded_at: Timestamp
  verified?: boolean
}

export interface SearchPreferences {
  budget_min?: number
  budget_max?: number
  locations?: string[]
  amenities?: string[]
  pets_allowed?: boolean
  move_in_date?: Date
  property_type?: string[]
}

export interface TenantProfile {
  id: string
  user_id: string
  name: string
  age: number
  profession: string
  bio: string
  profile_photo_url?: string
  verification_status: 'unverified' | 'id_verified' | 'interview_verified'
  seriosity_score: number
  seriosity_breakdown?: SeriosityBreakdown
  id_document_url?: string
  id_verification_status: 'not_verified' | 'pending' | 'verified' | 'rejected'
  interview_completed: boolean
  interview_id?: string
  documents?: {
    income_proof?: Document[]
    references?: Document[]
  }
  search_preferences?: SearchPreferences
  created_at: Timestamp
  updated_at: Timestamp
}

export interface LandlordProfile {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  phone: string
  email: string
  business_verified: boolean
  profile_photo_url?: string
  description?: string
  created_at: Timestamp
  updated_at: Timestamp
}

// ============= PROPERTIES =============

export interface PropertyAddress {
  city: string
  area: string
  lat: number
  lng: number
  full_address: string
}

export interface PropertyMedia {
  photos: string[]
  video_url?: string
  virtual_tour_url?: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description: string
  price: number
  currency: string
  currency_interval: string
  address: PropertyAddress
  amenities: string[]
  pets_allowed: boolean
  property_type: 'studio' | '1br' | '2br' | '3br+' | 'house'
  bedrooms: number
  bathrooms: number
  square_meters: number
  media: PropertyMedia
  rules?: string
  status: 'active' | 'draft' | 'closed'
  views_count: number
  likes_count: number
  created_at: Timestamp
  updated_at: Timestamp
}

// ============= INTERACTIONS =============

export interface PropertyLike {
  id: string
  tenant_id: string
  property_id: string
  created_at: Timestamp
}

export interface Application {
  id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  status: 'pending' | 'approved' | 'rejected' | 'chat_open' | 'closed'
  tenant_liked_at: Timestamp
  landlord_approved_at?: Timestamp
  created_at: Timestamp
  updated_at: Timestamp
}

// ============= CHAT & MESSAGING =============

export interface MessageAttachment {
  type: 'image' | 'pdf' | 'document'
  url: string
  name: string
  size: number
}

export interface Message {
  id: string
  application_id: string
  sender_user_id: string
  text?: string
  attachments?: MessageAttachment[]
  created_at: Timestamp
  read_at?: Timestamp
}

// ============= SCHEDULING =============

export interface Schedule {
  id: string
  application_id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  proposed_by: string
  date: Date
  time: string
  notes?: string
  status: 'proposed' | 'accepted' | 'cancelled' | 'completed'
  created_at: Timestamp
  accepted_at?: Timestamp
  cancelled_at?: Timestamp
}

// ============= AI INTERVIEW =============

export interface InterviewQuestion {
  question_id: number
  question_text: string
  video_url?: string
  audio_url?: string
  text_answer?: string
  transcript?: string
}

export interface ExtractedEntities {
  income?: number
  move_in_date?: Date
  has_pets?: boolean
  pet_type?: string
  has_references?: boolean
  deposit_disputes?: boolean
}

export interface InterviewRawResponse {
  full_transcript: string
  extracted_entities: ExtractedEntities
  clarity_score: number
  consistency_score: number
  evasiveness_detected: boolean
}

export interface Interview {
  id: string
  tenant_id: string
  started_at: Timestamp
  completed_at?: Timestamp
  status: 'started' | 'processing' | 'done' | 'failed'
  questions: InterviewQuestion[]
  raw_response?: InterviewRawResponse
  score?: number
  score_breakdown?: SeriosityBreakdown
  error_message?: string
}

// ============= SUBSCRIPTIONS =============

export interface Subscription {
  id: string
  landlord_id: string
  tier: 'free' | 'pro' | 'business'
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: Timestamp
  current_period_end: Timestamp
  created_at: Timestamp
  cancelled_at?: Timestamp
}

// ============= NOTIFICATIONS =============

export type NotificationType =
  | 'new_message'
  | 'tenant_liked_property'
  | 'landlord_approved'
  | 'landlord_rejected'
  | 'interview_complete'
  | 'schedule_proposed'
  | 'schedule_accepted'
  | 'schedule_reminder'
  | 'document_uploaded'
  | 'subscription_expiring'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: Timestamp
  action_url?: string
}

// ============= ADMIN & MODERATION =============

export interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  reported_message_id?: string
  reported_property_id?: string
  type: 'user' | 'message' | 'property'
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: Timestamp
  resolved_at?: Timestamp
  resolved_by?: string
  resolution_notes?: string
}

export interface AdminAction {
  id: string
  admin_id: string
  action_type: 'ban' | 'unban' | 'delete_content' | 'resolve_report'
  target_user_id?: string
  target_content_id?: string
  reason: string
  created_at: Timestamp
}

// ============= ANALYTICS =============

export interface PropertyAnalytics {
  id: string
  property_id: string
  landlord_id: string
  date: Date
  views: number
  likes: number
  applications: number
  messages_sent: number
  schedules_proposed: number
}

// ============= API REQUEST/RESPONSE TYPES =============

// Authentication
export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'tenant' | 'landlord'
}

export interface RegisterResponse {
  user: User
  token: string
}

export interface OAuthRequest {
  provider: 'google' | 'facebook' | 'apple'
  token: string
}

export interface OAuthResponse {
  user: User
  token: string
}

// Tenant Profile
export interface UpdateTenantProfileRequest {
  name?: string
  age?: number
  profession?: string
  bio?: string
  profile_photo_url?: string
  search_preferences?: SearchPreferences
}

export interface UpdateTenantProfileResponse {
  profile: TenantProfile
}

// Document Upload
export interface UploadDocumentRequest {
  tenant_id: string
  document_type: 'income_proof' | 'reference'
  file: File
}

export interface UploadDocumentResponse {
  document: Document
  seriosity_score?: number
}

// Interview
export interface StartInterviewRequest {
  tenant_id: string
}

export interface StartInterviewResponse {
  interview_id: string
  questions: Array<{
    id: number
    text: string
    type: string
    duration: number
  }>
}

export interface UploadInterviewQuestionRequest {
  interview_id: string
  question_id: number
  video_blob?: Blob
  audio_blob?: Blob
  text?: string
}

export interface UploadInterviewQuestionResponse {
  success: boolean
  uploaded_url: string
}

export interface CompleteInterviewRequest {
  interview_id: string
}

export interface CompleteInterviewResponse {
  status: 'processing'
}

export interface InterviewStatusResponse {
  status: 'started' | 'processing' | 'done' | 'failed'
  score?: number
  breakdown?: SeriosityBreakdown
  error_message?: string
}

// Chat Assistant
export interface ChatAssistantMessageRequest {
  tenant_id: string
  message: string
  conversation_history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface ChatAssistantMessageResponse {
  response: string
  extracted_filters?: Partial<SearchPreferences>
  action: 'continue' | 'apply_filters'
}

export interface ApplyChatFiltersRequest {
  tenant_id: string
  filters: SearchPreferences
}

export interface ApplyChatFiltersResponse {
  success: boolean
  filter_id: string
}

// Property Search
export interface PropertySearchRequest {
  budget_min?: number
  budget_max?: number
  locations?: string[]
  commute_to?: {
    lat: number
    lng: number
    max_time: number
  }
  amenities?: string[]
  pets_allowed?: boolean
  move_in_date?: Date
  property_type?: string[]
  page?: number
  limit?: number
}

export interface PropertySearchResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
}

export interface PropertyDetailResponse {
  property: Property
  landlord_public_info: {
    company_name: string
    contact_name: string
    business_verified: boolean
    profile_photo_url?: string
  }
}

// Property Likes
export interface LikePropertyRequest {
  tenant_id: string
  property_id: string
}

export interface LikePropertyResponse {
  success: boolean
  like_id: string
}

export interface UnlikePropertyRequest {
  tenant_id: string
  property_id: string
}

export interface UnlikePropertyResponse {
  success: boolean
}

export interface GetLikedPropertiesResponse {
  properties: Property[]
}

// Applicants
export interface GetApplicantsRequest {
  property_id: string
  landlord_id: string
}

export interface ApplicantInfo extends TenantProfile {
  liked_at: Timestamp
  application_status?: Application['status']
}

export interface GetApplicantsResponse {
  applicants: ApplicantInfo[]
}

// Approvals
export interface ApproveApplicantRequest {
  property_id: string
  tenant_id: string
  landlord_id: string
}

export interface ApproveApplicantResponse {
  success: boolean
  chat_unlocked: boolean
  application_id: string
}

export interface RejectApplicantRequest {
  property_id: string
  tenant_id: string
  landlord_id: string
}

export interface RejectApplicantResponse {
  success: boolean
}

export interface GetApplicationsRequest {
  tenant_id?: string
  landlord_id?: string
  status?: Application['status']
}

export interface GetApplicationsResponse {
  applications: Array<Application & {
    property?: Property
    tenant?: TenantProfile
    landlord?: LandlordProfile
  }>
}

// Chat
export interface GetChatMessagesRequest {
  application_id: string
  limit?: number
  before?: Timestamp
}

export interface GetChatMessagesResponse {
  messages: Message[]
  participants: {
    tenant: TenantProfile
    landlord: LandlordProfile
  }
}

export interface SendMessageRequest {
  application_id: string
  sender_id: string
  text?: string
  attachments?: File[]
}

export interface SendMessageResponse {
  message: Message
}

export interface MarkMessageReadRequest {
  application_id: string
  message_id: string
  user_id: string
}

export interface MarkMessageReadResponse {
  success: boolean
}

// Scheduling
export interface ProposeScheduleRequest {
  application_id: string
  proposed_by: string
  date: Date
  time: string
  notes?: string
}

export interface ProposeScheduleResponse {
  schedule: Schedule
}

export interface AcceptScheduleRequest {
  schedule_id: string
  user_id: string
}

export interface AcceptScheduleResponse {
  success: boolean
  ics_url: string
}

export interface CancelScheduleRequest {
  schedule_id: string
  user_id: string
}

export interface CancelScheduleResponse {
  success: boolean
}

export interface GetSchedulesRequest {
  user_id: string
  status?: Schedule['status']
}

export interface GetSchedulesResponse {
  schedules: Array<Schedule & {
    property?: Property
    tenant?: TenantProfile
    landlord?: LandlordProfile
  }>
}

// Subscriptions
export interface GetPricingResponse {
  tiers: Array<{
    id: 'free' | 'pro' | 'business'
    name: string
    price: number
    currency: string
    interval: 'month' | 'year'
    features: SubscriptionFeatures
  }>
}

export interface CreateSubscriptionRequest {
  landlord_id: string
  tier: 'pro' | 'business'
  payment_method_id: string
}

export interface CreateSubscriptionResponse {
  subscription: Subscription
  client_secret: string
}

export interface GetSubscriptionResponse {
  subscription: Subscription
}

export interface CancelSubscriptionRequest {
  subscription_id: string
  landlord_id: string
}

export interface CancelSubscriptionResponse {
  success: boolean
}

// Analytics
export interface GetAnalyticsRequest {
  landlord_id: string
  date_from: Date
  date_to: Date
}

export interface GetAnalyticsResponse {
  total_views: number
  total_likes: number
  total_applications: number
  avg_tenant_score: number
  properties: Array<{
    property_id: string
    property_title: string
    views: number
    likes: number
    applications: number
    avg_tenant_score: number
    time_to_fill_days?: number
    conversion_rate: number
  }>
}

export interface ExportAnalyticsRequest {
  landlord_id: string
  format: 'csv' | 'json'
  date_from?: Date
  date_to?: Date
}

// Notifications
export interface GetNotificationsRequest {
  user_id: string
  unread_only?: boolean
  limit?: number
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

export interface MarkNotificationReadRequest {
  notification_id: string
  user_id: string
}

export interface MarkNotificationReadResponse {
  success: boolean
}

export interface MarkAllNotificationsReadRequest {
  user_id: string
}

export interface MarkAllNotificationsReadResponse {
  success: boolean
  count: number
}

export interface UpdateNotificationSettingsRequest {
  user_id: string
  preferences: {
    email_notifications: boolean
    push_notifications: boolean
    notification_types: Partial<Record<NotificationType, boolean>>
  }
}

export interface UpdateNotificationSettingsResponse {
  success: boolean
}

// Admin
export interface GetUsersRequest {
  search?: string
  role?: User['role']
  status?: 'active' | 'banned'
  page?: number
  limit?: number
}

export interface GetUsersResponse {
  users: Array<User & {
    tenant_profile?: TenantProfile
    landlord_profile?: LandlordProfile
  }>
  total: number
}

export interface BanUserRequest {
  user_id: string
  admin_id: string
  reason: string
  duration?: number
}

export interface BanUserResponse {
  success: boolean
}

export interface UnbanUserRequest {
  user_id: string
  admin_id: string
}

export interface UnbanUserResponse {
  success: boolean
}

export interface GetReportsRequest {
  status?: Report['status']
  type?: Report['type']
  page?: number
  limit?: number
}

export interface GetReportsResponse {
  reports: Report[]
  total: number
}

export interface ResolveReportRequest {
  report_id: string
  admin_id: string
  action: 'ban' | 'warn' | 'dismiss'
  notes: string
}

export interface ResolveReportResponse {
  success: boolean
}

// Privacy & GDPR
export interface ExportUserDataRequest {
  user_id: string
}

export interface ExportUserDataResponse {
  data: {
    user: User
    profile: TenantProfile | LandlordProfile
    properties?: Property[]
    applications?: Application[]
    messages?: Message[]
    schedules?: Schedule[]
    notifications?: Notification[]
  }
  export_date: Date
}

export interface DeleteUserDataRequest {
  user_id: string
  confirmation: string
}

export interface DeleteUserDataResponse {
  success: boolean
  deleted_records: {
    user: boolean
    profile: boolean
    properties: number
    applications: number
    messages: number
    files: number
  }
}

// ============= ERROR CODES =============

export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'auth/required',
  AUTH_INVALID: 'auth/invalid-token',
  AUTH_EXPIRED: 'auth/token-expired',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  
  // Authorization
  PERMISSION_DENIED: 'permission/denied',
  SUBSCRIPTION_REQUIRED: 'subscription/upgrade-required',
  FEATURE_NOT_AVAILABLE: 'subscription/feature-not-available',
  
  // Resources
  RESOURCE_NOT_FOUND: 'resource/not-found',
  RESOURCE_ALREADY_EXISTS: 'resource/already-exists',
  RESOURCE_DELETED: 'resource/deleted',
  
  // Validation
  VALIDATION_ERROR: 'validation/failed',
  INVALID_INPUT: 'validation/invalid-input',
  MISSING_REQUIRED_FIELD: 'validation/missing-field',
  INVALID_FILE_TYPE: 'validation/invalid-file-type',
  FILE_TOO_LARGE: 'validation/file-too-large',
  
  // Rate Limiting
  RATE_LIMIT: 'rate-limit/exceeded',
  TOO_MANY_REQUESTS: 'rate-limit/too-many-requests',
  
  // AI Processing
  AI_PROCESSING_FAILED: 'ai/processing-failed',
  AI_SERVICE_UNAVAILABLE: 'ai/service-unavailable',
  TRANSCRIPTION_FAILED: 'ai/transcription-failed',
  ANALYSIS_FAILED: 'ai/analysis-failed',
  
  // Payment
  PAYMENT_FAILED: 'payment/failed',
  PAYMENT_DECLINED: 'payment/declined',
  SUBSCRIPTION_INACTIVE: 'payment/subscription-inactive',
  WEBHOOK_VERIFICATION_FAILED: 'payment/webhook-verification-failed',
  
  // Chat
  CHAT_NOT_UNLOCKED: 'chat/not-unlocked',
  MESSAGE_TOO_LONG: 'chat/message-too-long',
  ATTACHMENT_FAILED: 'chat/attachment-failed',
  
  // Interview
  INTERVIEW_ALREADY_COMPLETED: 'interview/already-completed',
  INTERVIEW_NOT_FOUND: 'interview/not-found',
  INTERVIEW_EXPIRED: 'interview/expired',
  
  // General
  INTERNAL_ERROR: 'internal/error',
  SERVICE_UNAVAILABLE: 'service/unavailable',
  NETWORK_ERROR: 'network/error',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

export interface APIError {
  error: string
  message: string
  code: ErrorCode
  details?: Record<string, any>
  timestamp?: Date
}

// ============= SUBSCRIPTION FEATURES =============

export interface SubscriptionFeatures {
  max_listings: number
  view_unverified_tenants: boolean
  view_seriosity_score: boolean
  view_score_breakdown: boolean
  view_documents: boolean
  filter_by_score: boolean
  analytics: boolean
  csv_export: boolean
  priority_support: boolean
}

export const SUBSCRIPTION_TIERS: Record<'free' | 'pro' | 'business', {
  name: string
  price: number
  features: SubscriptionFeatures
}> = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      max_listings: 1,
      view_unverified_tenants: true,
      view_seriosity_score: false,
      view_score_breakdown: false,
      view_documents: false,
      filter_by_score: false,
      analytics: false,
      csv_export: false,
      priority_support: false,
    }
  },
  pro: {
    name: 'Pro',
    price: 14.99,
    features: {
      max_listings: 5,
      view_unverified_tenants: true,
      view_seriosity_score: true,
      view_score_breakdown: true,
      view_documents: true,
      filter_by_score: true,
      analytics: false,
      csv_export: false,
      priority_support: false,
    }
  },
  business: {
    name: 'Business',
    price: 99.99,
    features: {
      max_listings: -1, // unlimited
      view_unverified_tenants: true,
      view_seriosity_score: true,
      view_score_breakdown: true,
      view_documents: true,
      filter_by_score: true,
      analytics: true,
      csv_export: true,
      priority_support: true,
    }
  }
}

// ============= UTILITY TYPE GUARDS =============

export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    ['tenant', 'landlord', 'admin'].includes(obj.role)
  )
}

export function isTenantProfile(obj: any): obj is TenantProfile {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.age === 'number' &&
    ['unverified', 'id_verified', 'interview_verified'].includes(obj.verification_status)
  )
}

export function isLandlordProfile(obj: any): obj is LandlordProfile {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.company_name === 'string' &&
    typeof obj.contact_name === 'string'
  )
}

export function isProperty(obj: any): obj is Property {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.landlord_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    ['studio', '1br', '2br', '3br+', 'house'].includes(obj.property_type) &&
    ['active', 'draft', 'closed'].includes(obj.status)
  )
}

export function isApplication(obj: any): obj is Application {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.property_id === 'string' &&
    typeof obj.tenant_id === 'string' &&
    typeof obj.landlord_id === 'string' &&
    ['pending', 'approved', 'rejected', 'chat_open', 'closed'].includes(obj.status)
  )
}

export function isMessage(obj: any): obj is Message {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.application_id === 'string' &&
    typeof obj.sender_user_id === 'string' &&
    (typeof obj.text === 'string' || Array.isArray(obj.attachments))
  )
}

export function isSchedule(obj: any): obj is Schedule {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.application_id === 'string' &&
    typeof obj.property_id === 'string' &&
    ['proposed', 'accepted', 'cancelled', 'completed'].includes(obj.status)
  )
}

export function isInterview(obj: any): obj is Interview {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.tenant_id === 'string' &&
    ['started', 'processing', 'done', 'failed'].includes(obj.status) &&
    Array.isArray(obj.questions)
  )
}

export function isSubscription(obj: any): obj is Subscription {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.landlord_id === 'string' &&
    ['free', 'pro', 'business'].includes(obj.tier) &&
    ['active', 'cancelled', 'past_due', 'trialing'].includes(obj.status)
  )
}

export function isNotification(obj: any): obj is Notification {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.read === 'boolean'
  )
}

export function isReport(obj: any): obj is Report {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.reporter_id === 'string' &&
    ['user', 'message', 'property'].includes(obj.type) &&
    ['pending', 'resolved', 'dismissed'].includes(obj.status)
  )
}

export function isAPIError(obj: any): obj is APIError {
  return (
    obj &&
    typeof obj.error === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.code === 'string'
  )
}

// ============= HELPER TYPES =============

export type UserRole = User['role']
export type VerificationStatus = TenantProfile['verification_status']
export type IDVerificationStatus = TenantProfile['id_verification_status']
export type PropertyType = Property['property_type']
export type PropertyStatus = Property['status']
export type ApplicationStatus = Application['status']
export type ScheduleStatus = Schedule['status']
export type InterviewStatus = Interview['status']
export type SubscriptionTier = Subscription['tier']
export type SubscriptionStatus = Subscription['status']
export type ReportType = Report['type']
export type ReportStatus = Report['status']

// Partial update types
export type PartialTenantProfile = Partial<Omit<TenantProfile, 'id' | 'user_id' | 'created_at'>>
export type PartialLandlordProfile = Partial<Omit<LandlordProfile, 'id' | 'user_id' | 'created_at'>>
export type PartialProperty = Partial<Omit<Property, 'id' | 'landlord_id' | 'created_at'>>

// Create types (without id and timestamps)
export type CreateTenantProfile = Omit<TenantProfile, 'id' | 'created_at' | 'updated_at'>
export type CreateLandlordProfile = Omit<LandlordProfile, 'id' | 'created_at' | 'updated_at'>
export type CreateProperty = Omit<Property, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count'>
export type CreateMessage = Omit<Message, 'id' | 'created_at' | 'read_at'>
export type CreateSchedule = Omit<Schedule, 'id' | 'created_at' | 'accepted_at' | 'cancelled_at'>

// ============= INTERVIEW QUESTIONS CONFIG =============

export interface InterviewQuestionConfig {
  id: number
  text: string
  type: 'open' | 'factual' | 'yes_no_brief' | 'tags' | 'yes_no'
  duration: number // seconds
}

export const INTERVIEW_QUESTIONS: InterviewQuestionConfig[] = [
  {
    id: 1,
    text: "Tell us who you are and why you're looking for a new place.",
    type: 'open',
    duration: 30
  },
  {
    id: 2,
    text: "When can you move in and what's your monthly budget?",
    type: 'factual',
    duration: 20
  },
  {
    id: 3,
    text: "Do you have steady income or references we can check?",
    type: 'yes_no_brief',
    duration: 20
  },
  {
    id: 4,
    text: "Any pets or special requests?",
    type: 'tags',
    duration: 15
  },
  {
    id: 5,
    text: "Have you ever had deposit disputes?",
    type: 'yes_no',
    duration: 15
  }
]
