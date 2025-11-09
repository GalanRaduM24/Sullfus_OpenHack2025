/**
 * Firebase Admin Service
 * Server-side Firebase operations (Firestore, Storage, Auth, FCM)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import * as fs from 'fs';
import * as path from 'path';

let adminApp: App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  try {
    let credential;

    // Option 1: Use service account JSON file path
    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = path.resolve(
        process.cwd(),
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH
      );
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8')
        );
        credential = cert(serviceAccount);
      } else {
        throw new Error(
          `Service account file not found at: ${serviceAccountPath}`
        );
      }
    }
    // Option 2: Use service account JSON string (for Vercel/production)
    else if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
      );
      credential = cert(serviceAccount);
    }
    // Option 3: Use default credentials (for Cloud Functions)
    else {
      console.warn(
        'No Firebase Admin credentials found. Using default credentials.'
      );
      adminApp = initializeApp();
      return adminApp;
    }

    adminApp = initializeApp({
      credential,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    console.log('Firebase Admin initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
}

/**
 * Get Firestore instance
 */
export function getAdminFirestore(): Firestore {
  const app = initializeFirebaseAdmin();
  return getFirestore(app);
}

/**
 * Get Storage instance
 */
export function getAdminStorage(): Storage {
  const app = initializeFirebaseAdmin();
  return getStorage(app);
}

/**
 * Get Auth instance
 */
export function getAdminAuth(): Auth {
  const app = initializeFirebaseAdmin();
  return getAuth(app);
}

/**
 * Get Messaging instance (for FCM)
 */
export function getAdminMessaging(): Messaging {
  const app = initializeFirebaseAdmin();
  return getMessaging(app);
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(
  fcmToken: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<string> {
  try {
    const messaging = getAdminMessaging();
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data,
      webpush: {
        fcmOptions: {
          link: data?.actionUrl || '/',
        },
      },
    };

    const response = await messaging.send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error('Failed to send push notification');
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendMulticastNotification(
  fcmTokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  try {
    const messaging = getAdminMessaging();
    
    const message = {
      tokens: fcmTokens,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data,
      webpush: {
        fcmOptions: {
          link: data?.actionUrl || '/',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(
      `Successfully sent ${response.successCount} notifications, ${response.failureCount} failed`
    );
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw new Error('Failed to send multicast notification');
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(idToken: string): Promise<any> {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
}

/**
 * Create custom token for user
 */
export async function createCustomToken(
  uid: string,
  claims?: object
): Promise<string> {
  try {
    const auth = getAdminAuth();
    const customToken = await auth.createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw new Error('Failed to create custom token');
  }
}

/**
 * Delete user account
 */
export async function deleteUser(uid: string): Promise<void> {
  try {
    const auth = getAdminAuth();
    await auth.deleteUser(uid);
    console.log(`Successfully deleted user: ${uid}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Upload file to Firebase Storage
 */
export async function uploadFile(
  filePath: string,
  destination: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    
    await bucket.upload(filePath, {
      destination,
      metadata: {
        metadata: metadata,
      },
    });

    // Get public URL
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future date
    });

    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    await bucket.file(filePath).delete();
    console.log(`Successfully deleted file: ${filePath}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Check if Firebase Admin is configured
 */
export function isFirebaseAdminConfigured(): boolean {
  return !!(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  );
}

/**
 * Get Firebase Admin configuration status
 */
export function getFirebaseAdminConfig() {
  return {
    configured: isFirebaseAdminConfigured(),
    hasServiceAccountPath: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH,
    hasServiceAccountJson: !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
}
