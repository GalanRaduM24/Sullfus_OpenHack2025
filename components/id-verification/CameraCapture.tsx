'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, RotateCcw, Check } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob, imageDataUrl: string) => void
  onCancel: () => void
  facingMode?: 'user' | 'environment' // 'user' for front camera, 'environment' for back camera
}

export function CameraCapture({ onCapture, onCancel, facingMode = 'user' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [currentFacingMode])

  const startCamera = async () => {
    try {
      setError(null)
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true)
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      setError(err.message || 'Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsStreaming(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob and data URL
    canvas.toBlob((blob) => {
      if (blob) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        onCapture(blob, dataUrl)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const switchCamera = () => {
    stopCamera()
    setCurrentFacingMode(currentFacingMode === 'user' ? 'environment' : 'user')
  }

  const handleCancel = () => {
    stopCamera()
    onCancel()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Camera className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Camera Access Error</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={startCamera} variant="outline">
            Try Again
          </Button>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto max-h-96 object-cover"
        style={{ transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />
      
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading Overlay */}
      {!isStreaming && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
            <p>Starting camera...</p>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {isStreaming && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={capturePhoto}
            size="lg"
            className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 p-0"
          >
            <Camera className="w-6 h-6" />
          </Button>
          
          <Button
            onClick={switchCamera}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Flip
          </Button>
        </div>
      )}

      {/* Capture Guide Overlay */}
      {isStreaming && currentFacingMode === 'user' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-white/50 rounded-full"></div>
          <div className="absolute top-8 left-0 right-0 text-center">
            <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full inline-block">
              Position your face in the circle
            </p>
          </div>
        </div>
      )}
    </div>
  )
}