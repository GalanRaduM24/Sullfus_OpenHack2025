/**
 * Gemini Vision API for ID card analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { IDCardData } from '../utils/id-verification';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!apiKey && typeof window !== 'undefined') {
  console.warn('Gemini API key not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Analyze ID card image using Gemini Vision
 */
export async function analyzeIDCardImage(imageFile: File): Promise<IDCardData> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Use Gemini Vision model (gemini-1.5-flash or gemini-1.5-pro support vision)
    // Note: gemini-pro-vision is deprecated, using gemini-1.5-flash instead
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze this ID card image and extract the following information in JSON format:
    {
      "firstName": "first name",
      "lastName": "last name",
      "fullName": "full name",
      "dateOfBirth": "DD.MM.YYYY format",
      "cnp": "13-digit CNP if Romanian ID",
      "idNumber": "ID card number or serial",
      "expiryDate": "DD.MM.YYYY format if present",
      "nationality": "country code (RO for Romania)",
      "address": "address if visible"
    }
    
    Important:
    - If this is a Romanian ID card, extract and validate the CNP (13 digits)
    - Extract all visible text accurately
    - Return only valid JSON, no additional text
    - If a field is not visible, use null`;
    
    // For gemini-1.5 models, use different format
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      },
      prompt,
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    try {
      // Extract JSON from response (might have markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data as IDCardData;
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
    }
    
    // Fallback: try to extract data from text response
    return extractDataFromText(text);
  } catch (error) {
    console.error('Error analyzing ID card with Gemini:', error);
    throw error;
  }
}

/**
 * Convert file to base64
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
 * Extract data from text response (fallback)
 */
function extractDataFromText(text: string): IDCardData {
  const data: IDCardData = {};
  
  // Extract CNP
  const cnpMatch = text.match(/"cnp"\s*:\s*"(\d{13})"/);
  if (cnpMatch) {
    data.cnp = cnpMatch[1];
  }
  
  // Extract name
  const nameMatch = text.match(/"fullName"\s*:\s*"([^"]+)"/);
  if (nameMatch) {
    data.fullName = nameMatch[1];
  }
  
  // Extract date of birth
  const dobMatch = text.match(/"dateOfBirth"\s*:\s*"([^"]+)"/);
  if (dobMatch) {
    data.dateOfBirth = dobMatch[1];
  }
  
  // Extract ID number
  const idMatch = text.match(/"idNumber"\s*:\s*"([^"]+)"/);
  if (idMatch) {
    data.idNumber = idMatch[1];
  }
  
  // Extract nationality
  const nationalityMatch = text.match(/"nationality"\s*:\s*"([^"]+)"/);
  if (nationalityMatch) {
    data.nationality = nationalityMatch[1];
  }
  
  return data;
}

/**
 * Verify if image contains an ID card
 */
export async function verifyIDCardImage(imageFile: File): Promise<boolean> {
  if (!genAI) {
    return false;
  }

  try {
    const base64Image = await fileToBase64(imageFile);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Is this image an ID card or identity document? Answer with only "yes" or "no".`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      },
      prompt,
    ]);
    
    const response = await result.response;
    const text = response.text().toLowerCase().trim();
    
    return text.includes('yes');
  } catch (error) {
    console.error('Error verifying ID card image:', error);
    return false;
  }
}

