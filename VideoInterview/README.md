# Video Interview System - Enhanced Version

This is an improved video interview system with Gemini API integration for transcription and advanced Seriosity Score evaluation.

## Features

- **5x Response Rate Boost**: Tenants with completed interviews get 5x more responses from landlords
- **Gemini API Integration**: Uses Google's Gemini API for audio transcription
- **Advanced Scoring**: Rule-based scoring system (1-5 scale)
- **Simple UI Flow**: Intro → Record → Review → Upload → Processing
- **Flexible Recording**: Support for video or audio-only recording

## Scoring Criteria

The Seriosity Score is calculated based on:

1. **Answer Length** (+1): Response > 20 seconds
2. **Relevant Keywords** (+1): Contains job/work/study/stay/looking for
3. **No Offensive Language** (+1): Clean, professional language
4. **Positive Sentiment** (+1): Neutral or positive tone
5. **Complete Sentences** (+1): Not one-word answers

**Final Score**: 1-5 (integer)

## Environment Variables Required

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## File Structure

```
VideoInterview/
├── README.md                           # This file
├── components/
│   ├── InterviewIntro.tsx             # Introduction screen
│   ├── InterviewRecorder.tsx          # Recording interface
│   ├── InterviewReview.tsx            # Review & retake
│   └── InterviewProcessing.tsx        # Processing screen
├── lib/
│   ├── evaluateInterview.ts           # Main evaluation function
│   ├── geminiTranscribe.ts            # Gemini transcription
│   ├── scoringRules.ts                # Scoring logic
│   └── sentimentAnalysis.ts           # Sentiment analyzer
└── api/
    └── interview-upload/
        └── route.ts                    # Upload endpoint
```

## Usage

### 1. Backend - Evaluate Interview

```typescript
import { evaluateInterview } from './VideoInterview/lib/evaluateInterview'

const result = await evaluateInterview('path/to/video.webm')
console.log(result)
// {
//   transcript: "I'm looking for a place to stay...",
//   score: 4,
//   flags: { offensive: false, incomplete: false }
// }
```

### 2. Frontend - Interview Flow

```typescript
import { InterviewIntro } from './VideoInterview/components/InterviewIntro'
import { InterviewRecorder } from './VideoInterview/components/InterviewRecorder'

// In your component
<InterviewIntro onStart={() => setStep('record')} />
<InterviewRecorder onComplete={(blob) => uploadVideo(blob)} />
```

## API Endpoint

**POST** `/api/interview/upload`

**Request:**
- `Content-Type: multipart/form-data`
- `video`: File (video/webm or audio/webm)
- `tenant_id`: string
- `interview_id`: string

**Response:**
```json
{
  "success": true,
  "transcript": "...",
  "score": 4,
  "interview_id": "abc123"
}
```

## Integration with Existing System

This enhanced system can work alongside the existing interview system or replace it. Key improvements:

1. **Gemini API** instead of OpenAI Whisper (more cost-effective)
2. **Simpler scoring** - rule-based, no ML training needed
3. **Cleaner UI** - minimal, focused flow
4. **Better UX** - clear value proposition (5x more responses)

## Next Steps

1. Add Gemini API key to environment variables
2. Install required packages: `npm install @google/generative-ai sentiment`
3. Test the evaluation pipeline
4. Integrate with tenant dashboard
5. Add analytics tracking
