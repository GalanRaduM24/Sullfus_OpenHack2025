# Interview Backend Processing System

This document describes the complete interview backend processing system for the AI-Powered Tenant Verification Platform.

## Overview

The interview backend processes tenant video/audio interviews through a multi-stage pipeline:

1. **Interview Initialization** - Create interview session
2. **Question Upload** - Upload video/audio responses
3. **Interview Completion** - Trigger processing
4. **Transcription** - Convert audio to text using Whisper API
5. **AI Analysis** - Analyze transcript with GPT-4
6. **Score Calculation** - Calculate Seriosity Score
7. **Profile Update** - Update tenant profile with results

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React)                           │
│  - InterviewFlow: Main interview UI                         │
│  - InterviewRecorder: Record responses                      │
│  - InterviewProcessing: Show processing status              │
│  - InterviewResults: Display final score                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                      │
│  POST /api/interviews/start                                 │
│  POST /api/interviews/:id/upload                            │
│  POST /api/interviews/:id/complete                          │
│  GET  /api/interviews/:id/status                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Processing Service (Server-side)                │
│  - processInterview(): Main orchestrator                    │
│  - transcribeQuestion(): Whisper API integration            │
│  - analyzeInterviewTranscript(): GPT-4 analysis             │
│  - calculateSeriosityScore(): Score calculation             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage                              │
│  - Firestore: Interview data, tenant profiles               │
│  - Firebase Storage: Video/audio files                      │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### 1. Start Interview

**Endpoint:** `POST /api/interviews/start`

**Request:**
```json
{
  "tenant_id": "user_123"
}
```

**Response:**
```json
{
  "interview_id": "interview_user_123_1234567890",
  "questions": [
    {
      "id": 1,
      "text": "Tell us who you are and why you're looking for a new place.",
      "type": "open",
      "duration": 30
    },
    // ... more questions
  ]
}
```

### 2. Upload Question Response

**Endpoint:** `POST /api/interviews/:id/upload`

**Request:** `multipart/form-data`
- `question_id`: number
- `video`: File (optional)
- `audio`: File (optional)
- `text`: string (optional)

**Response:**
```json
{
  "success": true,
  "uploaded_url": "https://storage.googleapis.com/..."
}
```

### 3. Complete Interview

**Endpoint:** `POST /api/interviews/:id/complete`

**Response:**
```json
{
  "status": "processing"
}
```

This triggers asynchronous processing of the interview.

### 4. Check Interview Status

**Endpoint:** `GET /api/interviews/:id/status`

**Response (Processing):**
```json
{
  "status": "processing"
}
```

**Response (Done):**
```json
{
  "status": "done",
  "score": 78,
  "breakdown": {
    "id_verified": 15,
    "income_proof": 20,
    "interview_clarity": 18,
    "response_consistency": 12,
    "responsiveness": 8,
    "references": 5
  }
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "error_message": "Transcription failed"
}
```

## Processing Pipeline

### Step 1: Transcription

Each question response is transcribed using OpenAI's Whisper API:

```typescript
// lib/services/openai.service.ts
export async function transcribeAudio(
  audioFile: File | Blob,
  language?: string
): Promise<string>
```

- Supports audio and video files
- Automatic language detection (or specify language)
- Returns plain text transcript

### Step 2: AI Analysis

The complete transcript is analyzed using GPT-4:

```typescript
// lib/services/openai.service.ts
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
}>
```

The AI evaluates:
- **Clarity**: How clear and articulate are the responses?
- **Consistency**: Are responses internally consistent and aligned with profile?
- **Evasiveness**: Are there signs of dishonesty or avoiding questions?
- **Entity Extraction**: Extract key information (income, move-in date, pets, etc.)

### Step 3: Score Calculation

The Seriosity Score (0-100) is calculated based on multiple factors:

```typescript
// lib/utils/seriosity-score.ts
export async function calculateSeriosityScore(
  tenantProfile: TenantProfile,
  interview: Interview
): Promise<{
  score: number;
  breakdown: SeriosityBreakdown;
}>
```

**Score Components:**

| Component | Max Points | Description |
|-----------|-----------|-------------|
| ID Verification | 15 | Verified government-issued ID |
| Income Proof | 25 | Uploaded and verified income documents |
| Interview Clarity | 20 | Clear and articulate responses |
| Response Consistency | 15 | Consistent information across profile and interview |
| App Responsiveness | 15 | Speed of completing profile and interview |
| References | 10 | Number of reference documents provided |
| **Total** | **100** | |

### Step 4: Profile Update

After processing, the tenant profile is updated:

```typescript
await updateDoc(tenantRef, {
  interview_completed: true,
  interview_id: interviewId,
  verification_status: 'interview_verified',
  seriosity_score: scoreResult.score,
  seriosity_breakdown: scoreResult.breakdown,
  updated_at: new Date(),
});
```

## Client-Side Integration

### Using the Interview Flow

```tsx
import { InterviewFlow } from '@/components/interview';

function TenantDashboard() {
  const [showInterview, setShowInterview] = useState(false);

  return (
    <div>
      {showInterview ? (
        <InterviewFlow
          tenantId={user.id}
          onComplete={() => {
            setShowInterview(false);
            // Refresh profile data
          }}
        />
      ) : (
        <button onClick={() => setShowInterview(true)}>
          Start Interview
        </button>
      )}
    </div>
  );
}
```

### Monitoring Interview Status

```tsx
import { useInterviewStatus } from '@/lib/hooks/useInterviewStatus';
import { InterviewProcessing } from '@/components/interview';

function InterviewStatusPage({ interviewId }: { interviewId: string }) {
  return (
    <InterviewProcessing
      interviewId={interviewId}
      onComplete={() => {
        // Navigate to dashboard or show success message
      }}
    />
  );
}
```

### Displaying Results

```tsx
import { InterviewResults } from '@/components/interview';

function ResultsPage({ score, breakdown }: { score: number; breakdown: SeriosityBreakdown }) {
  return (
    <InterviewResults
      score={score}
      breakdown={breakdown}
      onClose={() => {
        // Navigate back to dashboard
      }}
    />
  );
}
```

## Data Models

### Interview Document (Firestore)

```typescript
interface Interview {
  id: string;
  tenant_id: string;
  started_at: Timestamp;
  completed_at?: Timestamp;
  status: 'started' | 'processing' | 'done' | 'failed';
  questions: InterviewQuestion[];
  raw_response?: InterviewRawResponse;
  score?: number;
  score_breakdown?: SeriosityBreakdown;
  error_message?: string;
}
```

### Interview Question

```typescript
interface InterviewQuestion {
  question_id: number;
  question_text: string;
  video_url?: string;
  audio_url?: string;
  text_answer?: string;
  transcript?: string;
}
```

### Interview Raw Response

```typescript
interface InterviewRawResponse {
  full_transcript: string;
  extracted_entities: ExtractedEntities;
  clarity_score: number; // 0-1
  consistency_score: number; // 0-1
  evasiveness_detected: boolean;
}
```

### Seriosity Breakdown

```typescript
interface SeriosityBreakdown {
  id_verified: number; // 0-15
  income_proof: number; // 0-25
  interview_clarity: number; // 0-20
  response_consistency: number; // 0-15
  responsiveness: number; // 0-15
  references: number; // 0-10
}
```

## Configuration

### Environment Variables

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-...
OPENAI_GPT_MODEL=gpt-4-turbo-preview
OPENAI_WHISPER_MODEL=whisper-1
```

### Interview Questions

Questions are configured in `lib/firebase/types.ts`:

```typescript
export const INTERVIEW_QUESTIONS: InterviewQuestionConfig[] = [
  {
    id: 1,
    text: "Tell us who you are and why you're looking for a new place.",
    type: 'open',
    duration: 30
  },
  // ... more questions
];
```

## Error Handling

### Common Errors

| Error Code | Description | Solution |
|-----------|-------------|----------|
| `interview/not-found` | Interview ID doesn't exist | Verify interview was created |
| `interview/invalid-state` | Interview not in correct state | Check interview status |
| `ai/transcription-failed` | Whisper API failed | Check audio quality, retry |
| `ai/analysis-failed` | GPT-4 analysis failed | Check API key, retry |
| `validation/missing-field` | Required field missing | Provide all required data |

### Retry Logic

The system automatically retries failed operations:
- Transcription failures: Continue with other questions
- Analysis failures: Throw error and mark interview as failed
- Score calculation: Use default values for missing components

## Performance Considerations

### Processing Time

- **Transcription**: ~5-10 seconds per question
- **AI Analysis**: ~10-20 seconds for full transcript
- **Score Calculation**: <1 second
- **Total**: ~30-60 seconds for complete interview

### Optimization Tips

1. **Parallel Processing**: Transcribe multiple questions simultaneously
2. **Caching**: Cache transcripts to avoid re-processing
3. **Background Jobs**: Use Cloud Functions for heavy processing
4. **File Compression**: Compress audio/video before upload

## Security

### Data Privacy

- Interview videos/audio stored in Firebase Storage with restricted access
- Transcripts stored in Firestore with security rules
- Only tenant and authorized landlords can access interview data
- Automatic deletion of old interview files (configurable retention period)

### API Security

- All endpoints require authentication
- Tenant can only access their own interviews
- Rate limiting on API endpoints
- Input validation and sanitization

## Testing

### Unit Tests

```typescript
// Test score calculation
describe('calculateSeriosityScore', () => {
  it('should calculate correct score for verified tenant', async () => {
    const profile = createMockTenantProfile({ id_verified: true });
    const interview = createMockInterview({ clarity: 0.9, consistency: 0.8 });
    
    const result = await calculateSeriosityScore(profile, interview);
    
    expect(result.score).toBeGreaterThan(70);
    expect(result.breakdown.id_verified).toBe(15);
  });
});
```

### Integration Tests

```typescript
// Test complete interview flow
describe('Interview API', () => {
  it('should process interview end-to-end', async () => {
    // 1. Start interview
    const startRes = await POST('/api/interviews/start', { tenant_id: 'test' });
    const { interview_id } = startRes.json();
    
    // 2. Upload responses
    await POST(`/api/interviews/${interview_id}/upload`, formData);
    
    // 3. Complete interview
    await POST(`/api/interviews/${interview_id}/complete`);
    
    // 4. Wait for processing
    await waitForStatus(interview_id, 'done');
    
    // 5. Check results
    const statusRes = await GET(`/api/interviews/${interview_id}/status`);
    expect(statusRes.json().status).toBe('done');
  });
});
```

## Monitoring

### Metrics to Track

- Interview completion rate
- Average processing time
- Transcription accuracy
- Score distribution
- Error rates by type

### Logging

```typescript
console.log(`Starting interview processing for: ${interviewId}`);
console.log(`Transcription completed: ${transcript.length} characters`);
console.log(`AI analysis completed: clarity=${clarity}, consistency=${consistency}`);
console.log(`Seriosity Score calculated: ${score}/100`);
```

## Future Enhancements

1. **Video Analysis**: Analyze facial expressions and body language
2. **Multi-language Support**: Support interviews in multiple languages
3. **Custom Questions**: Allow landlords to add custom questions
4. **Live Interviews**: Real-time video interviews with AI moderation
5. **Score Trends**: Track score changes over time
6. **Benchmarking**: Compare scores against market averages

## Support

For issues or questions:
- Check error logs in Firebase Console
- Review API response codes
- Contact development team
- See main documentation in `/docs`
