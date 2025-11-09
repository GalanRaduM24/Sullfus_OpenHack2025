/**
 * Firebase functions for ID card verification and storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './config';
import { IDVerificationResponse, verifyIDCardMultiple } from '@/lib/services/id-verification.service';
import { IDCardData } from '@/lib/utils/id-verification';

export interface IDCardDocument {
  userId: string;
  userType: 'tenant' | 'landlord';
  imageUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedAt?: Date;
  verifiedBy?: string;
  data?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    cnp?: string;
    idNumber?: string;
    expiryDate?: string;
    nationality?: string;
  };
  errors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Upload ID card image to Firebase Storage
 */
export async function uploadIDCardImage(
  userId: string,
  userType: 'tenant' | 'landlord',
  imageFile: File
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }
    
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      return { success: false, error: 'Image must be less than 5MB' };
    }
    
    // Create storage reference
    const storageRef = ref(storage, `id-cards/${userType}/${userId}/${Date.now()}_${imageFile.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading ID card:', error);
    return { success: false, error: 'Failed to upload ID card image' };
  }
}

/**
 * Verify and store ID card data
 */
export async function verifyAndStoreIDCard(
  userId: string,
  userType: 'tenant' | 'landlord',
  imageFile: File
): Promise<IDVerificationResponse> {
  try {
    // Debug: Import debug function
    const { debugUploadIDCard } = await import('./storage-debug');
    
    // Upload image first with debug logging
    const uploadResult = await debugUploadIDCard(userId, userType, imageFile);
    
    // Log debug info
    console.log('🔍 [Debug] Upload result:', uploadResult);
    
    if (!uploadResult.success || !uploadResult.imageUrl) {
      return { 
        success: false, 
        errors: [uploadResult.error || 'Upload failed'],
        data: undefined,
      };
    }
    
    // Verify ID card
    const verificationResult = await verifyIDCardMultiple(imageFile);
    
    // Create document in Firestore
    const verificationId = `id_${userId}_${Date.now()}`;
    
    // Build the document data, excluding undefined fields
    const idCardDocData: any = {
      userId,
      userType,
      imageUrl: uploadResult.imageUrl,
      verificationStatus: verificationResult.success ? 'verified' : 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Only add data field if it exists
    if (verificationResult.data) {
      idCardDocData.data = verificationResult.data;
    }
    
    // Only add errors if they exist
    if (verificationResult.errors && verificationResult.errors.length > 0) {
      idCardDocData.errors = verificationResult.errors;
    }
    
    // Add verified timestamp if successful
    if (verificationResult.success) {
      idCardDocData.verifiedAt = serverTimestamp();
    }
    
    // Save to Firestore (use id_verifications collection)
    const docRef = doc(db, 'id_verifications', verificationId);
    await setDoc(docRef, idCardDocData);
    
    // Update user profile with verification status
    const userRef = doc(db, `${userType}Profiles`, userId);
    await setDoc(userRef, {
      idVerificationStatus: verificationResult.success ? 'verified' : 'pending',
      idVerificationId: verificationId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    // Also update users collection
    const mainUserRef = doc(db, 'users', userId);
    await setDoc(mainUserRef, {
      idVerificationStatus: verificationResult.success ? 'verified' : 'pending',
      idVerificationId: verificationId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return {
      success: verificationResult.success,
      data: verificationResult.data,
      errors: verificationResult.errors || [],
      verificationId,
    };
  } catch (error) {
    console.error('Error verifying ID card:', error);
    return {
      success: false,
      errors: ['Failed to verify ID card. Please try again.'],
      data: undefined,
    };
  }
}

/**
 * Get ID card verification status
 * Fixed: Search in id_verifications collection and check users collection
 */
export async function getIDVerificationStatus(
  userId: string
): Promise<IDCardDocument | null> {
  try {
    // First, check the users collection for idVerificationId
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      
      // If user has a verification ID, get that specific document
      if (userData.idVerificationId) {
        const verificationRef = doc(db, 'id_verifications', userData.idVerificationId);
        const verificationSnap = await getDoc(verificationRef);
        
        if (verificationSnap.exists()) {
          const data = verificationSnap.data();
          return {
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            verifiedAt: data.verifiedAt?.toDate(),
          } as IDCardDocument;
        }
      }
    }
    
    // Fallback: Search for any verification document by userId
    // This handles cases where idVerificationId wasn't set on user document
    const { collection: firestoreCollection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const verificationsRef = firestoreCollection(db, 'id_verifications');
    const q = query(
      verificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        verifiedAt: data.verifiedAt?.toDate(),
      } as IDCardDocument;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting verification status:', error);
    return null;
  }
}

/**
 * Delete ID card image (for privacy/GDPR compliance)
 */
export async function deleteIDCardImage(imageUrl: string): Promise<boolean> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error('Error deleting ID card image:', error);
    return false;
  }
}

