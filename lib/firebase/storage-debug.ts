/**
 * Debug version of Firebase Storage upload with detailed logging
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './config';

export async function debugUploadIDCard(
  userId: string,
  userType: 'tenant' | 'landlord',
  imageFile: File
): Promise<{ success: boolean; imageUrl?: string; error?: string; debug?: any }> {
  try {
    console.log('🔥 [Storage Debug] Starting upload...');
    console.log('👤 Current user:', auth.currentUser?.uid);
    console.log('📁 Storage bucket:', storage.app.options.storageBucket);
    console.log('📄 File info:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // Check authentication
    if (!auth.currentUser) {
      return { 
        success: false, 
        error: 'User not authenticated',
        debug: { userId, userType, authUser: null }
      };
    }

    if (auth.currentUser.uid !== userId) {
      return { 
        success: false, 
        error: 'User ID mismatch',
        debug: { 
          userId, 
          authUserId: auth.currentUser.uid,
          userType 
        }
      };
    }

    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }
    
    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      return { success: false, error: 'Image must be less than 5MB' };
    }
    
    // Create storage reference
    const storagePath = `id-cards/${userType}/${userId}/${Date.now()}_${imageFile.name}`;
    console.log('📂 Storage path:', storagePath);
    
    const storageRef = ref(storage, storagePath);
    console.log('🔗 Storage ref created:', storageRef);
    
    // Upload file
    console.log('⬆️ Starting upload...');
    const snapshot = await uploadBytes(storageRef, imageFile);
    console.log('✅ Upload successful:', snapshot);
    
    const imageUrl = await getDownloadURL(snapshot.ref);
    console.log('🌐 Download URL:', imageUrl);
    
    return { 
      success: true, 
      imageUrl,
      debug: {
        userId,
        userType,
        storagePath,
        authUser: auth.currentUser.uid,
        fileSize: imageFile.size,
        fileName: imageFile.name
      }
    };
  } catch (error) {
    console.error('❌ [Storage Debug] Upload failed:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return { 
      success: false, 
      error: `Upload failed: ${error}`,
      debug: {
        userId,
        userType,
        authUser: auth.currentUser?.uid,
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    };
  }
}