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
    // Upload image first
    const uploadResult = await uploadIDCardImage(userId, userType, imageFile);
    
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
    const idCardDoc: IDCardDocument = {
      userId,
      userType,
      imageUrl: uploadResult.imageUrl,
      verificationStatus: verificationResult.success ? 'verified' : 'pending',
      data: verificationResult.data,
      errors: verificationResult.errors,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (verificationResult.success) {
      idCardDoc.verifiedAt = new Date();
    }
    
    // Save to Firestore
    const docRef = doc(db, 'idVerifications', verificationId);
    await setDoc(docRef, {
      ...idCardDoc,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Update user profile with verification status
    const userRef = doc(db, `${userType}Profiles`, userId);
    await updateDoc(userRef, {
      idVerificationStatus: verificationResult.success ? 'verified' : 'pending',
      idVerificationId: verificationId,
      updatedAt: serverTimestamp(),
    });
    
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
 */
export async function getIDVerificationStatus(
  userId: string
): Promise<IDCardDocument | null> {
  try {
    // Get user profile to find verification ID
    const tenantRef = doc(db, 'tenantProfiles', userId);
    const landlordRef = doc(db, 'landlordProfiles', userId);
    
    const [tenantSnap, landlordSnap] = await Promise.all([
      getDoc(tenantRef),
      getDoc(landlordRef),
    ]);
    
    const userProfile = tenantSnap.exists() ? tenantSnap.data() : landlordSnap.exists() ? landlordSnap.data() : null;
    
    if (!userProfile?.idVerificationId) {
      return null;
    }
    
    // Get verification document
    const verificationRef = doc(db, 'idVerifications', userProfile.idVerificationId);
    const verificationSnap = await getDoc(verificationRef);
    
    if (!verificationSnap.exists()) {
      return null;
    }
    
    const data = verificationSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      verifiedAt: data.verifiedAt?.toDate(),
    } as IDCardDocument;
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

