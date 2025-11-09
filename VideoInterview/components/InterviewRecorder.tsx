'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Mic, Square, Camera, AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InterviewRecorderProps {
  onRecordingComplete: (blob: Blob, url: string) => void
  maxDuration?: number // in seconds
  recordingMode?: 'video' | 'audio'
}

type RecordingState = 'idle' | 'requesting' | 'ready' | 'recording' | 'stopped'

/**
 * Interview Recorder Component
 * 
 * Handles video/audio recording using MediaRecorder API.
 * Features:
 * - Webcam + microphone recording
 * - Audio-only option
 * - Countdown timer
 * - Auto-stop at max duration
 */
export function InterviewRecorder({
  onRecordingComplete,
  maxDuration = 120, // 2 minutes default
  recordingMode = 'video',
}: InterviewRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Request camera/microphone permission and start preview
   */
  const requestPermission = async () => {
    setState('requesting')
    setError(null)

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordingMode === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Show video preview
      if (videoRef.current && recordingMode === 'video') {
        videoRef.current.srcObject = stream
      }

      setState('ready')
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setError(
        recordingMode === 'video'
          ? 'Camera and microphone access denied. Please enable permissions in your browser.'
          : 'Microphone access denied. Please enable permissions in your browser.'
      )
      setState('idle')
    }
  }

  /**
   * Start recording
   */
  const startRecording = () => {
    if (!streamRef.current) return

    try {
      chunksRef.current = []

      // Determine MIME type
      const mimeType = recordingMode === 'video'
        ? 'video/webm;codecs=vp8,opus'
        : 'audio/webm;codecs=opus'

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm',
        })
        const url = URL.createObjectURL(blob)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Call completion handler
        onRecordingComplete(blob, url)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setState('recording')
      setTimeElapsed(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1
          
          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          
          return newTime
        })
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to start recording. Please try again.')
      setState('ready')
    }
  }

  /**
   * Stop recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setState('stopped')
  }

  /**
   * Format time as MM:SS
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  /**
   * Auto-request permission on mount
   */
  useEffect(() => {
    requestPermission()
  }, [])

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video/Audio Preview */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {/* Video Preview */}
            {recordingMode === 'video' && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {/* Audio Mode Indicator */}
            {recordingMode === 'audio' && (
              <div className="flex flex-col items-center justify-center gap-4 text-white">
                <Mic className="h-16 w-16" />
                <p className="text-lg font-medium">Audio Recording</p>
              </div>
            )}

            {/* Recording Indicator */}
            {state === 'recording' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span className="text-sm font-semibold">REC</span>
              </div>
            )}

            {/* Timer */}
            {state === 'recording' && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full">
                <span className="text-xl font-bold tabular-nums">
                  {formatTime(timeElapsed)}
                </span>
                <span className="text-sm text-gray-300 ml-2">
                  / {formatTime(maxDuration)}
                </span>
              </div>
            )}

            {/* Idle State */}
            {state === 'idle' && (
              <div className="text-white text-center p-8">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Requesting camera access...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {state === 'idle' && (
          <Button onClick={requestPermission} size="lg" disabled>
            Requesting permission...
          </Button>
        )}

        {state === 'requesting' && (
          <Button size="lg" disabled>
            Requesting permission...
          </Button>
        )}

        {state === 'ready' && (
          <Button
            onClick={startRecording}
            size="lg"
            className="bg-red-600 hover:bg-red-700"
          >
            {recordingMode === 'video' ? (
              <Video className="mr-2 h-5 w-5" />
            ) : (
              <Mic className="mr-2 h-5 w-5" />
            )}
            Start Recording
          </Button>
        )}

        {state === 'recording' && (
          <Button
            onClick={stopRecording}
            size="lg"
            variant="destructive"
          >
            <Square className="mr-2 h-5 w-5" />
            Stop Recording
          </Button>
        )}

        {state === 'stopped' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Recording complete! Processing...
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {state === 'ready' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Click "Start Recording" when you're ready. You'll have up to {Math.floor(maxDuration / 60)} minutes to answer.
          </AlertDescription>
        </Alert>
      )}

      {/* Permission Denied Help */}
      {error && state === 'idle' && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            To record your interview, please enable {recordingMode === 'video' ? 'camera and microphone' : 'microphone'} permissions.
          </p>
          <Button onClick={requestPermission} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
