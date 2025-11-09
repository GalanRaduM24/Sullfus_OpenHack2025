# Video Interview System - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd VideoInterview
npm install
```

Or install manually:

```bash
npm install @google/generative-ai sentiment
```

### 2. Set Up Environment Variables

Add to your `.env.local` file:

```env
# Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Get your API key from: https://makersuite.google.com/app/apikey
```

### 3. Copy Files to Your Project

```bash
# Copy components
cp -r VideoInterview/components/* components/video-interview/

# Copy lib files
cp -r VideoInterview/lib/* lib/video-interview/

# Copy API route
cp -r VideoInterview/api/interview-upload app/api/interview/upload/
```

### 4. Update Imports

Update the import paths in the copied files to match your project structure.

For example, in `components/video-interview/InterviewIntro.tsx`:

```typescript
// Change this:
import { Card } from '@/components/ui/card'

// To match your project structure (if different)
import { Card } from '@/components/ui/card'
```

### 5. Test the System

Create a test page:

```typescript
// app/test-interview/page.tsx
import { VideoInterviewFlow } from '@/components/video-interview/INTEGRATION_EXAMPLE'

export default function TestInterviewPage() {
  return <VideoInterviewFlow />
}
```

Visit `/test-interview` to test the flow.

## Detailed Setup

### Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy the API key
5. Add to `.env.local`:

```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

### Firebase Storage Setup

Ensure Firebase Storage is configured in your project:

```typescript
// lib/firebase/config.ts
import { getStorage } from 'firebase/storage'

export const storage = getStorage(app)
```

Update Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Interview documents
    match /interviews/{interviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      request.auth.uid == resource.data.tenant_id;
    }
  }
}
```

Update Storage security rules:

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Interview videos
    match /interviews/{tenantId}/{interviewId}.webm {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.uid == tenantId;
    }
  }
}
```

### Database Schema

Add these fields to your `tenant_profiles` collection:

```typescript
interface TenantProfile {
  // ... existing fields
  
  // Interview fields
  interview_completed: boolean
  interview_id: string
  interview_video_url: string
  interview_transcript: string
  seriosity_score: number // 1-5
  seriosity_breakdown: {
    lengthScore: number
    keywordScore: number
    languageScore: number
    sentimentScore: number
    completenessScore: number
  }
}
```

Create an `interviews` collection:

```typescript
interface Interview {
  id: string
  tenant_id: string
  status: 'started' | 'done'
  video_url: string
  transcript: string
  score: number
  score_breakdown: {
    lengthScore: number
    keywordScore: number
    languageScore: number
    sentimentScore: number
    completenessScore: number
  }
  score_explanation: string
  details: {
    estimatedDuration: number
    wordCount: number
    keywordsFound: string[]
    sentimentScore: number
  }
  created_at: Date
  completed_at: Date
  updated_at: Date
}
```

## Integration Options

### Option 1: Full Flow (Recommended)

Use the complete interview flow with all steps:

```typescript
import { VideoInterviewFlow } from './VideoInterview/INTEGRATION_EXAMPLE'

<VideoInterviewFlow />
```

### Option 2: Individual Components

Use components separately for custom flows:

```typescript
import { InterviewIntro } from './VideoInterview/components/InterviewIntro'
import { InterviewRecorder } from './VideoInterview/components/InterviewRecorder'
import { InterviewReview } from './VideoInterview/components/InterviewReview'
import { InterviewProcessing } from './VideoInterview/components/InterviewProcessing'

// Build your own flow
```

### Option 3: Backend Only

Use just the evaluation functions in your backend:

```typescript
import { evaluateInterview } from './VideoInterview/lib/evaluateInterview'

const result = await evaluateInterview(videoPath)
```

## Testing

### Test Transcription

```typescript
import { transcribeAudioBuffer } from './VideoInterview/lib/geminiTranscribe'

const buffer = fs.readFileSync('test-audio.webm')
const transcript = await transcribeAudioBuffer(buffer, 'audio/webm')
console.log(transcript)
```

### Test Scoring

```typescript
import { calculateSeriosityScore } from './VideoInterview/lib/scoringRules'

const testTranscript = "I'm looking for a place to stay while I work at my new job..."
const result = calculateSeriosityScore(testTranscript)
console.log('Score:', result.score)
console.log('Breakdown:', result.breakdown)
```

### Test Full Evaluation

```typescript
import { evaluateInterviewBuffer } from './VideoInterview/lib/evaluateInterview'

const videoBuffer = fs.readFileSync('test-video.webm')
const result = await evaluateInterviewBuffer(videoBuffer, 'video/webm')
console.log('Result:', result)
```

## Troubleshooting

### "GEMINI_API_KEY is not set"

Make sure you've added the API key to `.env.local` and restarted your dev server.

### "Transcription failed"

- Check that your Gemini API key is valid
- Ensure the audio/video file is not corrupted
- Try with a shorter test file first
- Check API quota limits

### "Permission denied" errors

- Update Firestore and Storage security rules
- Ensure user is authenticated
- Check that tenant_id matches authenticated user

### Video upload fails

- Check file size limits (Firebase Storage default is 5GB)
- Ensure correct MIME type (video/webm or audio/webm)
- Check network connectivity
- Verify Firebase Storage is enabled in your project

## Performance Optimization

### 1. Compress Videos

Use FFmpeg to compress videos before upload:

```bash
ffmpeg -i input.webm -c:v libvpx -crf 30 -b:v 1M output.webm
```

### 2. Use Audio-Only Mode

For faster processing, use audio-only recording:

```typescript
<InterviewRecorder recordingMode="audio" />
```

### 3. Batch Processing

Process multiple interviews in parallel:

```typescript
const results = await Promise.all(
  videoBuffers.map(buffer => evaluateInterviewBuffer(buffer, 'video/webm'))
)
```

### 4. Cache Results

Cache transcripts and scores in Firestore to avoid re-processing.

## Cost Estimation

### Gemini API Costs

- Free tier: 60 requests per minute
- Paid tier: $0.00025 per 1K characters (input)
- Average interview: ~500 words = ~3K characters = $0.00075

### Firebase Costs

- Storage: $0.026 per GB/month
- Average video: 5MB = $0.00013/month
- Bandwidth: $0.12 per GB downloaded

### Total Cost Per Interview

- Gemini transcription: ~$0.001
- Firebase storage: ~$0.0001/month
- Total: **~$0.001 per interview**

Very cost-effective compared to OpenAI Whisper!

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up Gemini API key
3. ✅ Copy files to your project
4. ✅ Test the system
5. ✅ Integrate into tenant onboarding
6. ✅ Add analytics tracking
7. ✅ Monitor performance and costs

## Support

For issues or questions:
- Check the README.md for feature documentation
- Review INTEGRATION_EXAMPLE.tsx for usage examples
- Test individual components separately
- Check browser console for errors
- Verify API keys and permissions

## Advanced Features

### Custom Scoring Rules

Modify `VideoInterview/lib/scoringRules.ts` to adjust scoring criteria:

```typescript
// Add your own keywords
const CUSTOM_KEYWORDS = ['reliable', 'responsible', 'clean']

// Adjust scoring weights
if (estimatedDuration > 30) { // Require 30 seconds instead of 20
  lengthScore = 1
}
```

### Multi-Language Support

Gemini API supports multiple languages. The system will automatically transcribe in the spoken language.

### Custom Questions

Add custom interview questions by modifying the recorder component to show question prompts.

### Analytics Integration

Track interview completion rates:

```typescript
// Add to your analytics
analytics.track('interview_completed', {
  tenant_id: user.uid,
  score: result.score,
  duration: result.details.estimatedDuration,
})
```
