/**
 * OpenAI Service
 * Handles GPT-4 and Whisper API interactions
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const GPT_MODEL = process.env.OPENAI_GPT_MODEL || 'gpt-4-turbo-preview';
const WHISPER_MODEL = process.env.OPENAI_WHISPER_MODEL || 'whisper-1';

/**
 * Transcribe audio using Whisper API
 * @param audioFile - Audio file (File object or Blob)
 * @param language - Optional language code (e.g., 'en', 'ro')
 * @returns Transcribed text
 */
export async function transcribeAudio(
  audioFile: File | Blob,
  language?: string
): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile as any,
      model: WHISPER_MODEL,
      language: language,
      response_format: 'text',
    });

    return transcription as unknown as string;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Analyze interview transcript using GPT-4
 * @param transcript - Interview transcript text
 * @param profileData - Tenant profile data for cross-checking
 * @returns Analysis results with scores and extracted entities
 */
export async function analyzeInterviewTranscript(
  transcript: string,
  profileData: {
    name: string;
    age: number;
    profession: string;
  }
): Promise<{
  extractedEntities: {
    income?: number;
    moveInDate?: string;
    hasPets?: boolean;
    petType?: string;
    hasReferences?: boolean;
    depositDisputes?: boolean;
  };
  clarityScore: number; // 0-1
  consistencyScore: number; // 0-1
  evasivenessDetected: boolean;
  analysis: string;
}> {
  try {
    const prompt = `You are analyzing a tenant interview transcript to assess credibility and extract key information.

Profile Information:
- Name: ${profileData.name}
- Age: ${profileData.age}
- Profession: ${profileData.profession}

Interview Transcript:
${transcript}

Please analyze this transcript and provide:

1. EXTRACT KEY ENTITIES:
   - Income: Monthly income in RON (extract number if mentioned)
   - Move-in Date: Desired move-in date (YYYY-MM-DD format)
   - Pets: Does the tenant have pets? (boolean)
   - Pet Type: Type of pet if mentioned (e.g., "cat", "dog")
   - References: Does the tenant mention having references? (boolean)
   - Deposit Disputes: Has the tenant had deposit disputes in the past? (boolean)

2. ASSESS CLARITY (0.0-1.0):
   - How clear, articulate, and well-structured are the responses?
   - Are answers direct and easy to understand?
   - Is the language appropriate and professional?
   - Score: 1.0 = Very clear, 0.5 = Somewhat clear, 0.0 = Unclear/confusing

3. ASSESS CONSISTENCY (0.0-1.0):
   - Are responses internally consistent (no contradictions)?
   - Do responses align with the profile data (age, profession)?
   - Are facts mentioned multiple times consistent?
   - Score: 1.0 = Fully consistent, 0.5 = Some inconsistencies, 0.0 = Major contradictions

4. DETECT EVASIVENESS:
   - Are there signs of avoiding direct questions?
   - Does the tenant seem dishonest or hiding information?
   - Are answers vague when specific information is requested?
   - Return true if evasiveness is detected

5. PROVIDE ANALYSIS:
   - Brief 2-3 sentence summary of the overall assessment
   - Highlight any red flags or positive indicators

Respond in JSON format:
{
  "extractedEntities": {
    "income": number or null,
    "moveInDate": "YYYY-MM-DD" or null,
    "hasPets": boolean or null,
    "petType": string or null,
    "hasReferences": boolean or null,
    "depositDisputes": boolean or null
  },
  "clarityScore": 0.0-1.0,
  "consistencyScore": 0.0-1.0,
  "evasivenessDetected": boolean,
  "analysis": "brief summary"
}`;

    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing interview transcripts for tenant verification. Provide objective, data-driven assessments. Be thorough but fair in your evaluation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Validate and normalize the response
    return {
      extractedEntities: result.extractedEntities || {},
      clarityScore: Math.max(0, Math.min(1, result.clarityScore || 0)),
      consistencyScore: Math.max(0, Math.min(1, result.consistencyScore || 0)),
      evasivenessDetected: result.evasivenessDetected || false,
      analysis: result.analysis || 'Analysis completed',
    };
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw new Error('Failed to analyze interview transcript');
  }
}

/**
 * Chat assistant for extracting search filters from conversation
 * @param message - User message
 * @param conversationHistory - Previous messages
 * @returns Assistant response and extracted filters
 */
export async function processChatAssistantMessage(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{
  response: string;
  extractedFilters?: {
    budgetMin?: number;
    budgetMax?: number;
    locations?: string[];
    amenities?: string[];
    petsAllowed?: boolean;
    moveInDate?: string;
    propertyType?: string[];
  };
  action: 'continue' | 'apply_filters';
}> {
  try {
    const systemPrompt = `You are a friendly chat assistant helping tenants find rental properties. 
Your goal is to extract search preferences through natural conversation.

Extract these parameters:
- Budget range (min/max in RON)
- Locations/areas (city, neighborhoods)
- Amenities (parking, furnished, balcony, gym, etc.)
- Pets allowed (yes/no)
- Move-in date
- Property type (studio, 1br, 2br, 3br+, house)

Be conversational and friendly. Ask follow-up questions if needed.
When you have enough information, suggest applying the filters.

Respond in JSON format:
{
  "response": "your message to the user",
  "extractedFilters": { ... } or null,
  "action": "continue" or "apply_filters"
}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error processing chat message:', error);
    throw new Error('Failed to process chat message');
  }
}

/**
 * Check if OpenAI API is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get OpenAI configuration status
 */
export function getOpenAIConfig() {
  return {
    configured: isOpenAIConfigured(),
    gptModel: GPT_MODEL,
    whisperModel: WHISPER_MODEL,
  };
}
