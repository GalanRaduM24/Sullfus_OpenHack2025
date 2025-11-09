/**
 * Firebase Cloud Messaging Service
 * Handles push notifications for web and mobile
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '@/lib/firebase/config';

// FCM configuration
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if permission denied
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Get FCM token
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 * @param callback - Function to call when message received
 */
export function onForegroundMessage(
  callback: (payload: any) => void
): (() => void) | null {
  try {
    if (typeof window === 'undefined') return null;

    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return null;
  }
}

/**
 * Show browser notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

/**
 * Notification types for the platform
 */
export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  TENANT_LIKED_PROPERTY = 'tenant_liked_property',
  LANDLORD_APPROVED = 'landlord_approved',
  LANDLORD_REJECTED = 'landlord_rejected',
  INTERVIEW_COMPLETE = 'interview_complete',
  SCHEDULE_PROPOSED = 'schedule_proposed',
  SCHEDULE_ACCEPTED = 'schedule_accepted',
  SCHEDULE_REMINDER = 'schedule_reminder',
  DOCUMENT_UPLOADED = 'document_uploaded',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
}

/**
 * Format notification payload for display
 */
export function formatNotificationPayload(
  type: NotificationType,
  data: any
): { title: string; body: string; icon?: string; actionUrl?: string } {
  const notifications = {
    [NotificationType.NEW_MESSAGE]: {
      title: 'New Message',
      body: `You have a new message from ${data.senderName}`,
      icon: '/icons/message.png',
      actionUrl: `/chat/${data.applicationId}`,
    },
    [NotificationType.TENANT_LIKED_PROPERTY]: {
      title: 'New Applicant',
      body: `${data.tenantName} liked your property "${data.propertyTitle}"`,
      icon: '/icons/like.png',
      actionUrl: `/landlord/properties/${data.propertyId}/applicants`,
    },
    [NotificationType.LANDLORD_APPROVED]: {
      title: 'Application Approved!',
      body: `Your application for "${data.propertyTitle}" was approved. Chat is now open!`,
      icon: '/icons/approved.png',
      actionUrl: `/tenant/applications/${data.applicationId}`,
    },
    [NotificationType.LANDLORD_REJECTED]: {
      title: 'Application Update',
      body: `Your application for "${data.propertyTitle}" was not selected`,
      icon: '/icons/info.png',
      actionUrl: '/tenant/applications',
    },
    [NotificationType.INTERVIEW_COMPLETE]: {
      title: 'Interview Processed',
      body: `Your interview has been analyzed. Seriosity Score: ${data.score}/100`,
      icon: '/icons/success.png',
      actionUrl: '/tenant/profile',
    },
    [NotificationType.SCHEDULE_PROPOSED]: {
      title: 'Viewing Proposed',
      body: `${data.proposerName} proposed a viewing for ${data.date} at ${data.time}`,
      icon: '/icons/calendar.png',
      actionUrl: `/schedules/${data.scheduleId}`,
    },
    [NotificationType.SCHEDULE_ACCEPTED]: {
      title: 'Viewing Confirmed',
      body: `Viewing confirmed for ${data.date} at ${data.time}`,
      icon: '/icons/calendar-check.png',
      actionUrl: `/schedules/${data.scheduleId}`,
    },
    [NotificationType.SCHEDULE_REMINDER]: {
      title: 'Viewing Reminder',
      body: `You have a viewing in ${data.timeUntil} at ${data.address}`,
      icon: '/icons/reminder.png',
      actionUrl: `/schedules/${data.scheduleId}`,
    },
    [NotificationType.DOCUMENT_UPLOADED]: {
      title: 'Document Uploaded',
      body: `${data.tenantName} uploaded a new document`,
      icon: '/icons/document.png',
      actionUrl: `/landlord/applicants/${data.tenantId}`,
    },
    [NotificationType.SUBSCRIPTION_EXPIRING]: {
      title: 'Subscription Expiring',
      body: `Your ${data.tier} subscription expires in ${data.daysLeft} days`,
      icon: '/icons/warning.png',
      actionUrl: '/landlord/billing',
    },
  };

  return notifications[type] || {
    title: 'Notification',
    body: 'You have a new notification',
  };
}

/**
 * Check if FCM is configured
 */
export function isFCMConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  );
}
