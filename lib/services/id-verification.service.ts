/**
 * ID Card Verification Service
 * Integrates with OCR APIs and validation services
 */

import { IDCardData, IDVerificationResult, validateIDCardData, extractIDCardData } from '../utils/id-verification';
import { analyzeIDCardImage as analyzeWithGemini } from '../gemini/vision';

export interface IDCardUpload {
  file: File;
  userId: string;
  userType: 'tenant' | 'landlord';
}

export interface IDVerificationResponse {
  success: boolean;
  data?: IDCardData;
  errors: string[];
  verificationId?: string;
}

/**
 * Verify ID card using Gemini Vision API
 * This analyzes the ID card image and extracts data
 */
export async function verifyIDCardWithGemini(imageFile: File): Promise<IDVerificationResponse> {
  try {
    // Use Gemini Vision API to analyze the ID card
    const idData = await analyzeWithGemini(imageFile);
    
    // Validate extracted data
    const validation = validateIDCardData(idData);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        data: idData,
      };
    }
    
    return {
      success: true,
      data: idData,
      errors: [],
    };
  } catch (error) {
    console.error('Error verifying ID card with Gemini:', error);
    return {
      success: false,
      errors: ['Failed to verify ID card. Please ensure the image is clear and try again.'],
    };
  }
}

/**
 * Verify ID card using third-party OCR service
 * Options: PicToText, Google Cloud Vision, AWS Textract
 */
export async function verifyIDCardWithOCR(imageFile: File, service: 'pictotext' | 'google' | 'aws' = 'google'): Promise<IDVerificationResponse> {
  try {
    const base64Image = await fileToBase64(imageFile);
    
    let ocrText = '';
    
    switch (service) {
      case 'pictotext':
        // PicToText API for Romanian ID cards
        ocrText = await callPicToTextAPI(base64Image);
        break;
      case 'google':
        // Google Cloud Vision API
        ocrText = await callGoogleVisionAPI(base64Image);
        break;
      case 'aws':
        // AWS Textract
        ocrText = await callAWSTextractAPI(base64Image);
        break;
    }
    
    // Extract and validate data
    const idData = extractIDCardData(ocrText, 'RO'); // Default to Romanian
    const validation = validateIDCardData(idData);
    
    return {
      success: validation.isValid,
      data: validation.data,
      errors: validation.errors,
    };
  } catch (error) {
    console.error('Error with OCR service:', error);
    return {
      success: false,
      errors: ['OCR service error. Please try again.'],
    };
  }
}

/**
 * Convert file to base64 (used by OCR services)
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Call PicToText API for Romanian ID cards
 */
async function callPicToTextAPI(base64Image: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_PICTOTEXT_API_KEY;
  
  if (!apiKey) {
    throw new Error('PicToText API key not configured');
  }
  
  // TODO: Implement PicToText API call
  // API endpoint: https://pictotext.io/api/v1/ocr/romania/id-card
  const response = await fetch('https://pictotext.io/api/v1/ocr/romania/id-card', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
    }),
  });
  
  if (!response.ok) {
    throw new Error('PicToText API error');
  }
  
  const data = await response.json();
  return data.text || '';
}

/**
 * Call Google Cloud Vision API
 */
async function callGoogleVisionAPI(base64Image: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }
  
  // TODO: Implement Google Cloud Vision API call
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
            },
          ],
        },
      ],
    }),
  });
  
  if (!response.ok) {
    throw new Error('Google Vision API error');
  }
  
  const data = await response.json();
  const textAnnotations = data.responses[0]?.textAnnotations;
  return textAnnotations?.[0]?.description || '';
}

/**
 * Call AWS Textract API
 */
async function callAWSTextractAPI(base64Image: string): Promise<string> {
  // TODO: Implement AWS Textract API call
  // This would require AWS SDK and server-side implementation
  throw new Error('AWS Textract not yet implemented');
}

/**
 * Verify ID card with multiple services (fallback)
 */
export async function verifyIDCardMultiple(imageFile: File): Promise<IDVerificationResponse> {
  // Try Gemini first, then fallback to OCR services
  try {
    const geminiResult = await verifyIDCardWithGemini(imageFile);
    if (geminiResult.success) {
      return geminiResult;
    }
  } catch (error) {
    console.error('Gemini verification failed:', error);
  }
  
  // Try Google Vision
  try {
    const googleResult = await verifyIDCardWithOCR(imageFile, 'google');
    if (googleResult.success) {
      return googleResult;
    }
  } catch (error) {
    console.error('Google Vision verification failed:', error);
  }
  
  // Try PicToText for Romanian IDs
  try {
    const pictotextResult = await verifyIDCardWithOCR(imageFile, 'pictotext');
    if (pictotextResult.success) {
      return pictotextResult;
    }
  } catch (error) {
    console.error('PicToText verification failed:', error);
  }
  
  return {
    success: false,
    errors: ['All verification services failed. Please try again or contact support.'],
  };
}

