import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-gemini-api-key';

export const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

/**
 * Chatbot assistant to help tenants find the right property
 */
export async function askGeminiAssistant(question: string, context?: any): Promise<string> {
  try {
    const prompt = `You are a helpful rental assistant for Rently app. Help users find the right property by answering their questions.
    
    Context: ${context ? JSON.stringify(context) : 'No specific context'}
    
    Question: ${question}
    
    Provide a helpful and concise answer:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

/**
 * Analyze tenant intro video and summarize it
 */
export async function analyzeIntroVideo(videoUrl: string, transcript?: string): Promise<string> {
  try {
    // Note: Gemini Vision API can analyze video frames
    // For full video analysis, you might need to extract frames or use video API
    const prompt = `Analyze this tenant introduction and provide a summary of:
    1. Key personality traits
    2. Living preferences
    3. Communication style
    4. Reliability indicators
    
    Transcript: ${transcript || 'No transcript available'}
    
    Provide a concise summary:`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini video analysis error:', error);
    return 'Unable to analyze video at this time.';
  }
}

