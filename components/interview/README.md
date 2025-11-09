# AI Interview Components

This directory contains the UI components for the AI-powered tenant interview system.

## Components

### InterviewIntro
Introduction card that explains the interview process and provides a start button.

**Props:**
- `onStart: () => void` - Callback when user clicks start
- `isLoading?: boolean` - Shows loading state on button

**Usage:**
```tsx
<InterviewIntro
  onStart={handleStartInterview}
  isLoading={startingInterview}
/>
```

### InterviewProgress
Visual progress indicator showing current question and completion status.

**Props:**
- `currentQuestion: number` - Current question number (1-based)
- `totalQuestions: number` - Total number of questions
- `completedQuestions?: number[]` - Array of completed question IDs

**Usage:**
```tsx
<InterviewProgress
  currentQuestion={3}
  totalQuestions={5}
  completedQuestions={[1, 2]}
/>
```

### InterviewQuestionCard
Displays the current interview question with type indicator and timer.

**Props:**
- `question: InterviewQuestionConfig` - Question configuration object
- `timeRemaining?: number` - Seconds remaining (optional)
- `showTimer?: boolean` - Whether to show the timer

**Usage:**
```tsx
<InterviewQuestionCard
  question={INTERVIEW_QUESTIONS[0]}
  timeRemaining={25}
  showTimer={true}
/>
```

### InterviewRecorder
Handles video/audio recording with MediaRecorder API, including permission handling and preview.

**Props:**
- `questionId: number` - ID of the question being answered
- `questionText: string` - Text of the question
- `duration: number` - Maximum recording duration in seconds
- `recordingMode: 'video' | 'audio'` - Recording mode
- `onRecordingComplete: (blob: Blob, url: string) => void` - Callback with recorded data
- `onRetake?: () => void` - Optional callback for retake action
- `onNext?: () => void` - Optional callback for next action

**Usage:**
```tsx
<InterviewRecorder
  questionId={1}
  questionText="Tell us about yourself"
  duration={30}
  recordingMode="video"
  onRecordingComplete={(blob, url) => {
    // Handle recording
  }}
/>
```

### InterviewFlow
Main orchestrator component that manages the entire interview flow, including navigation and submission.

**Props:**
- `interviewId: string` - Unique interview session ID
- `onComplete: () => void` - Callback when interview is submitted
- `onCancel?: () => void` - Optional callback for cancellation

**Usage:**
```tsx
<InterviewFlow
  interviewId="interview-123"
  onComplete={handleInterviewComplete}
  onCancel={handleCancelInterview}
/>
```

## Features

### Recording Modes
- **Video**: Records both video and audio using the camera and microphone
- **Audio**: Records audio only using the microphone

### Permission Handling
- Automatically requests camera/microphone permissions
- Shows helpful error messages if permissions are denied
- Provides retry mechanism for permission requests

### Recording Controls
- Start/stop recording with visual feedback
- Countdown timer during recording
- Preview recorded answer before proceeding
- One retake allowed per question

### Navigation
- Progress indicator showing completion status
- Previous/Next navigation between questions
- Submit button appears on last question
- Prevents submission until all questions are answered

### Question Types
The system supports 5 question types:
1. **Open-ended**: Longer, detailed responses
2. **Factual**: Specific information (dates, numbers)
3. **Yes/No with brief explanation**: Binary answer with context
4. **Tags/Keywords**: List-based responses
5. **Yes/No**: Simple binary responses

## Integration

To integrate the interview system into a page:

```tsx
import { InterviewIntro, InterviewFlow } from '@/components/interview'

function TenantDashboard() {
  const [showInterview, setShowInterview] = useState(false)

  return (
    <>
      {!showInterview && (
        <InterviewIntro
          onStart={() => setShowInterview(true)}
        />
      )}
      
      {showInterview && (
        <InterviewFlow
          interviewId="interview-id"
          onComplete={() => {
            setShowInterview(false)
            // Handle completion
          }}
          onCancel={() => setShowInterview(false)}
        />
      )}
    </>
  )
}
```

## TODO

The following features are planned but not yet implemented:

- [ ] API integration for starting interviews (`POST /api/interviews/start`)
- [ ] API integration for uploading recordings (`POST /api/interviews/:id/upload`)
- [ ] API integration for completing interviews (`POST /api/interviews/:id/complete`)
- [ ] Real-time processing status updates
- [ ] Results display after AI processing
- [ ] Retry mechanism for failed uploads
- [ ] Offline support with local storage
- [ ] Mobile-optimized recording interface
- [ ] Accessibility improvements (keyboard navigation, screen reader support)

## Browser Compatibility

The interview components use the MediaRecorder API, which is supported in:
- Chrome/Edge 47+
- Firefox 25+
- Safari 14.1+
- Opera 36+

Note: iOS Safari requires iOS 14.3+ for MediaRecorder support.
