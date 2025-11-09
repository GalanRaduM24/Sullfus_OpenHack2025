// Firebase Storage helper functions for file uploads
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'
import type { MessageAttachment } from './types'

/**
 * Upload a chat attachment to Firebase Storage
 */
export async function uploadChatAttachment(
  applicationId: string,
  file: File
): Promise<MessageAttachment> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `chats/${applicationId}/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  // Determine file type
  let type: 'image' | 'pdf' | 'document' = 'document'
  if (file.type.startsWith('image/')) {
    type = 'image'
  } else if (file.type === 'application/pdf') {
    type = 'pdf'
  }
  
  return {
    type,
    url,
    name: file.name,
    size: file.size,
  }
}

/**
 * Upload a document (income proof, reference, etc.)
 */
export async function uploadDocument(
  userId: string,
  documentType: string,
  file: File
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `documents/${userId}/${documentType}/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  return url
}

/**
 * Upload an ID document
 */
export async function uploadIDDocument(userId: string, file: File): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `id-documents/${userId}/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  return url
}

/**
 * Upload a property photo
 */
export async function uploadPropertyPhoto(
  propertyId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `properties/${propertyId}/photos/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  return url
}

/**
 * Upload a profile photo
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `profiles/${userId}/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  return url
}

/**
 * Upload an interview video/audio
 */
export async function uploadInterviewMedia(
  interviewId: string,
  questionId: number,
  file: File,
  type: 'video' | 'audio'
): Promise<string> {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const fileName = `q${questionId}_${timestamp}.${extension}`
  const filePath = `interviews/${interviewId}/${type}/${fileName}`
  
  const storageRef = ref(storage, filePath)
  
  // Upload file
  await uploadBytes(storageRef, file)
  
  // Get download URL
  const url = await getDownloadURL(storageRef)
  
  return url
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number
): { valid: boolean; error?: string } {
  // Check file type
  const isValidType = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', '/'))
    }
    return file.type === type
  })

  if (!isValidType) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}
