/**
 * ID Card Verification Utilities
 * Supports Romanian ID cards and general ID validation
 */

export interface IDCardData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: string;
  cnp?: string; // Romanian Personal Numeric Code
  idNumber?: string;
  expiryDate?: string;
  nationality?: string;
  address?: string;
  isValid?: boolean;
  validationErrors?: string[];
}

export interface IDVerificationResult {
  isValid: boolean;
  data?: IDCardData;
  errors: string[];
  confidence?: number;
}

/**
 * Validate Romanian CNP (Personal Numeric Code)
 * CNP format: 13 digits
 * Structure: S YY MM DD JJ NNN C
 * - S: Sex and century (1-2: 1900-1999, 3-4: 1800-1899, 5-6: 2000-2099)
 * - YY: Year (last 2 digits)
 * - MM: Month (01-12)
 * - DD: Day (01-31)
 * - JJ: County code (01-52)
 * - NNN: Sequential number (001-999)
 * - C: Check digit
 */
export function validateRomanianCNP(cnp: string): boolean {
  if (!cnp || cnp.length !== 13) {
    return false;
  }

  // Check if all characters are digits
  if (!/^\d+$/.test(cnp)) {
    return false;
  }

  // Extract components
  const sex = parseInt(cnp[0]);
  const year = parseInt(cnp.substring(1, 3));
  const month = parseInt(cnp.substring(3, 5));
  const day = parseInt(cnp.substring(5, 7));
  const county = parseInt(cnp.substring(7, 9));
  const sequential = parseInt(cnp.substring(9, 12));
  const checkDigit = parseInt(cnp[12]);

  // Validate sex (1-6)
  if (sex < 1 || sex > 6) {
    return false;
  }

  // Validate month
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate day (simplified - doesn't check for valid dates like Feb 30)
  if (day < 1 || day > 31) {
    return false;
  }

  // Validate county code (01-52, plus Bucharest as 40-46)
  if (county < 1 || county > 52) {
    return false;
  }

  // Validate sequential number
  if (sequential < 1 || sequential > 999) {
    return false;
  }

  // Validate check digit
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * weights[i];
  }
  const remainder = sum % 11;
  const calculatedCheckDigit = remainder < 10 ? remainder : 1;

  return calculatedCheckDigit === checkDigit;
}

/**
 * Extract CNP from text (OCR result)
 */
export function extractCNP(text: string): string | null {
  // CNP is 13 digits
  const cnpRegex = /\b\d{13}\b/g;
  const matches = text.match(cnpRegex);
  
  if (matches && matches.length > 0) {
    // Validate each match
    for (const match of matches) {
      if (validateRomanianCNP(match)) {
        return match;
      }
    }
  }
  
  return null;
}

/**
 * Parse date from Romanian ID card format
 * Common formats: DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // Try different date formats
  const formats = [
    /(\d{2})[.\/-](\d{2})[.\/-](\d{4})/, // DD.MM.YYYY
    /(\d{4})[.\/-](\d{2})[.\/-](\d{2})/, // YYYY.MM.DD
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0]) {
        // DD.MM.YYYY
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Month is 0-indexed
        const year = parseInt(match[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } else {
        // YYYY.MM.DD
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }
  
  return null;
}

/**
 * Validate ID card data
 */
export function validateIDCardData(data: IDCardData): IDVerificationResult {
  const errors: string[] = [];
  
  // Validate Romanian CNP if present
  if (data.cnp) {
    if (!validateRomanianCNP(data.cnp)) {
      errors.push('Invalid Romanian CNP format or checksum');
    }
  }
  
  // Validate name
  if (!data.firstName && !data.lastName && !data.fullName) {
    errors.push('Name is required');
  }
  
  // Validate date of birth
  if (data.dateOfBirth) {
    const dob = parseDate(data.dateOfBirth);
    if (!dob) {
      errors.push('Invalid date of birth format');
    } else {
      // Check if person is at least 18 years old
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        errors.push('User must be at least 18 years old');
      }
    }
  }
  
  // Validate expiry date if present
  if (data.expiryDate) {
    const expiry = parseDate(data.expiryDate);
    if (!expiry) {
      errors.push('Invalid expiry date format');
    } else {
      const today = new Date();
      if (expiry < today) {
        errors.push('ID card has expired');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    data,
    errors,
  };
}

/**
 * Extract ID card data from OCR text (basic implementation)
 * This will be enhanced with actual OCR API integration
 */
export function extractIDCardData(ocrText: string, nationality: string = 'RO'): IDCardData {
  const data: IDCardData = {
    nationality,
  };
  
  // Extract CNP for Romanian IDs
  if (nationality === 'RO') {
    const cnp = extractCNP(ocrText);
    if (cnp) {
      data.cnp = cnp;
    }
  }
  
  // Extract name (basic pattern matching)
  const namePatterns = [
    /(?:NUME|NAME|SURNAME)[\s:]+([A-Z\s]+)/i,
    /([A-Z]{2,}\s+[A-Z]{2,})/,
  ];
  
  for (const pattern of namePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      const nameParts = match[1].trim().split(/\s+/);
      if (nameParts.length >= 2) {
        data.lastName = nameParts[0];
        data.firstName = nameParts.slice(1).join(' ');
        data.fullName = match[1].trim();
      }
      break;
    }
  }
  
  // Extract date of birth
  const dobPatterns = [
    /(?:DATA\s+NAȘTERII|DATE\s+OF\s+BIRTH|DOB)[\s:]+(\d{2}[.\/-]\d{2}[.\/-]\d{4})/i,
    /(\d{2}[.\/-]\d{2}[.\/-]\d{4})/,
  ];
  
  for (const pattern of dobPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      data.dateOfBirth = match[1];
      break;
    }
  }
  
  // Extract ID number
  const idNumberPattern = /(?:SERIA|SERIES|ID)[\s:]+([A-Z0-9\s]+)/i;
  const idMatch = ocrText.match(idNumberPattern);
  if (idMatch) {
    data.idNumber = idMatch[1].trim();
  }
  
  return data;
}

