'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Mic, Square, Play, RotateCcw, Check, AlertCircle, Camera, MicOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InterviewRecorderProps {
  questionId: number
  questionText: string
  duration: number
  recordingMode: 'video' | 'audio'
  onRecordingComplete: (blob: Blob, url: string) => void
  onRetake?: () => void
  onNext?: () => void
}

type RecordingState = 'idle' | 'requesting-permission' | 'ready' | 'recording' | 'stopped' | 'preview'

export function InterviewRecorder({
  questionId,
  questionText,
  duration,
  recordingMode,
  onRecordingComplete,
  onRetake,
  onNext
}: InterviewRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Request camera/microphone permission
  const requestPermission = async () => {
    setRecordingState('requesting-permission')
    setError(null)
    setPermissionDenied(false)

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordingMode === 'video' ? { width: 1280, height: 720 } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current && recordingMode === 'video') {
        videoRef.current.srcObject = stream
      }

      setRecordingState('ready')
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setPermissionDenied(true)
      setError(
        recordingMode === 'video'
          ? 'Camera and microphone access denied. Please enable permissions in your browser settings.'
          : 'Microphone access denied. Please enable permissions in your browser settings.'
      )
      setRecordingState('idle')
    }
  }

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) return

    try {
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: recordingMode === 'video' 
          ? 'video/webm;codecs=vp8,opus' 
          : 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm'
        })
        const url = URL.createObjectURL(blob)
        
        setRecordedBlob(blob)
        setRecordedUrl(url)
        setRecordingState('preview')

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setRecordingState('recording')
      setTimeRemaining(duration)

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to start recording. Please try again.')
      setRecordingState('ready')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRecordingState('stopped')
  }

  // Retake recording
  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setTimeRemaining(duration)
    setRecordingState('idle')
    
    if (onRetake) {
      onRetake()
    }
  }

  // Confirm and proceed
  const handleConfirm = () => {
    if (recordedBlob && recordedUrl) {
      onRecordingComplete(recordedBlob, recordedUrl)
      if (onNext) {
        onNext()
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
    }
  }, [recordedUrl])

  // Auto-request permission on mount
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
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Recording View */}
            {recordingState !== 'preview' && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {recordingMode === 'video' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-white">
                    <Mic className="h-16 w-16" />
                    <p className="text-lg font-medium">Audio Recording</p>
                  </div>
                )}

                {/* Recording indicator */}
                {recordingState === 'recording' && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">Recording</span>
                  </div>
                )}

                {/* Timer */}
                {recordingState === 'recording' && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold tabular-nums">
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preview View */}
            {recordingState === 'preview' && recordedUrl && (
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {recordingMode === 'video' ? (
                  <video
                    ref={previewVideoRef}
                    src={recordedUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-white h-full">
                    <audio src={recordedUrl} controls className="w-full max-w-md" />
                  </div>
                )}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {recordingState === 'idle' && !permissionDenied && (
                <Button onClick={requestPermission} size="lg">
                  <Camera className="mr-2 h-5 w-5" />
                  Enable {recordingMode === 'video' ? 'Camera' : 'Microphone'}
                </Button>
              )}

              {recordingState === 'requesting-permission' && (
                <Button disabled size="lg">
                  Requesting permission...
                </Button>
              )}

              {recordingState === 'ready' && (
                <Button onClick={startRecording} size="lg" className="bg-red-600 hover:bg-red-700">
                  {recordingMode === 'video' ? (
                    <Video className="mr-2 h-5 w-5" />
                  ) : (
                    <Mic className="mr-2 h-5 w-5" />
                  )}
                  Start Recording
                </Button>
              )}

              {recordingState === 'recording' && (
                <Button onClick={stopRecording} size="lg" variant="destructive">
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}

              {recordingState === 'preview' && (
                <>
                  <Button onClick={handleRetake} size="lg" variant="outline">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Retake
                  </Button>
                  <Button onClick={handleConfirm} size="lg">
                    <Check className="mr-2 h-5 w-5" />
                    Looks Good
                  </Button>
                </>
              )}
            </div>

            {/* Permission denied help */}
            {permissionDenied && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  To record your interview, you need to grant {recordingMode === 'video' ? 'camera and microphone' : 'microphone'} permissions.
                </p>
                <Button onClick={requestPermission} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
