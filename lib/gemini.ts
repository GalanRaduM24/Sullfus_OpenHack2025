// Gemini API configuration
// TODO: Replace with your Gemini API key
// Get from: https://makersuite.google.com/app/apikey

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'your-gemini-api-key';

export const genAI = new GoogleGenerativeAI(apiKey);

// Chatbot assistant function
export async function getChatbotResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

// Video analysis function (for future use)
export async function analyzeVideo(videoData: any): Promise<string> {
  try {
    // This will be implemented when we add video analysis
    // For now, return a placeholder
    return 'Video analysis feature coming soon!';
  } catch (error) {
    console.error('Error analyzing video:', error);
    return 'Error analyzing video.';
  }
}

