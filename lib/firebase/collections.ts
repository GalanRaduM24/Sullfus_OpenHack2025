// Firestore collection references and helper functions
// Provides type-safe access to all collections

import { 
  collection, 
  CollectionReference, 
  DocumentData 
} from 'firebase/firestore'
import { db } from './config'
import type {
  User,
  TenantProfile,
  LandlordProfile,
  Property,
  PropertyLike,
  Application,
  Message,
  Schedule,
  Interview,
  Subscription,
  Notification,
  Report,
  AdminAction,
  PropertyAnalytics
} from './types'

// Collection name constants
export const COLLECTIONS = {
  USERS: 'users',
  TENANT_PROFILES: 'tenant_profiles',
  LANDLORD_PROFILES: 'landlord_profiles',
  PROPERTIES: 'properties',
  PROPERTY_LIKES: 'property_likes',
  APPLICATIONS: 'applications',
  MESSAGES: 'messages',
  SCHEDULES: 'schedules',
  INTERVIEWS: 'interviews',
  SUBSCRIPTIONS: 'subscriptions',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  ADMIN_ACTIONS: 'admin_actions',
  PROPERTY_ANALYTICS: 'property_analytics',
} as const

// Type-safe collection references
export const usersCollection = collection(db, COLLECTIONS.USERS) as CollectionReference<User>
export const tenantProfilesCollection = collection(db, COLLECTIONS.TENANT_PROFILES) as CollectionReference<TenantProfile>
export const landlordProfilesCollection = collection(db, COLLECTIONS.LANDLORD_PROFILES) as CollectionReference<LandlordProfile>
export const propertiesCollection = collection(db, COLLECTIONS.PROPERTIES) as CollectionReference<Property>
export const propertyLikesCollection = collection(db, COLLECTIONS.PROPERTY_LIKES) as CollectionReference<PropertyLike>
export const applicationsCollection = collection(db, COLLECTIONS.APPLICATIONS) as CollectionReference<Application>
export const messagesCollection = collection(db, COLLECTIONS.MESSAGES) as CollectionReference<Message>
export const schedulesCollection = collection(db, COLLECTIONS.SCHEDULES) as CollectionReference<Schedule>
export const interviewsCollection = collection(db, COLLECTIONS.INTERVIEWS) as CollectionReference<Interview>
export const subscriptionsCollection = collection(db, COLLECTIONS.SUBSCRIPTIONS) as CollectionReference<Subscription>
export const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS) as CollectionReference<Notification>
export const reportsCollection = collection(db, COLLECTIONS.REPORTS) as CollectionReference<Report>
export const adminActionsCollection = collection(db, COLLECTIONS.ADMIN_ACTIONS) as CollectionReference<AdminAction>
export const propertyAnalyticsCollection = collection(db, COLLECTIONS.PROPERTY_ANALYTICS) as CollectionReference<PropertyAnalytics>

// Helper function to get a typed collection reference
export function getCollection<T = DocumentData>(collectionName: string): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>
}
