import { useState, useRef, useCallback } from '@lynx-js/react'
import './styles.css'

interface SimpleAudioRecorderProps {
  isActive: boolean
  onTranscript?: (transcript: string) => void
}

export function SimpleAudioRecorder({ isActive, onTranscript }: SimpleAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)

  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY

  const startRecording = useCallback(async () => {
    if (!apiKey) {
      setError('Deepgram API key not found')
      return
    }

    try {
      setStatus('requesting-microphone')
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream
      setStatus('connecting')

      // Create WebSocket connection to Deepgram
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true`
      const websocket = new WebSocket(wsUrl, ['token', apiKey])
      websocketRef.current = websocket

      websocket.onopen = () => {
        setStatus('connected')
        setIsRecording(true)
        
        // Set up MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
            websocket.send(event.data)
          }
        }

        mediaRecorder.start(250) // Send data every 250ms
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.channel?.alternatives?.[0]?.transcript) {
          const newTranscript = data.channel.alternatives[0].transcript
          if (data.is_final) {
            setTranscript(prev => prev + ' ' + newTranscript)
            onTranscript?.(newTranscript)
          }
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection to Deepgram failed')
        setStatus('error')
      }

      websocket.onclose = () => {
        setStatus('disconnected')
        setIsRecording(false)
      }

    } catch (err: any) {
      console.error('Error starting recording:', err)
      setError(`Failed to access microphone: ${err.message}`)
      setStatus('error')
    }
  }, [apiKey, onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    if (websocketRef.current) {
      websocketRef.current.close()
    }

    setIsRecording(false)
    setStatus('stopped')
  }, [])

  // Auto start/stop based on isActive prop
  useCallback(() => {
    if (isActive && !isRecording && status !== 'connecting') {
      startRecording()
    } else if (!isActive && isRecording) {
      stopRecording()
    }
  }, [isActive, isRecording, status, startRecording, stopRecording])

  if (!isActive) {
    return null
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'requesting-microphone': return '🎤 Requesting microphone...'
      case 'connecting': return '🌐 Connecting to Deepgram...'
      case 'connected': return '✅ Recording and transcribing...'
      case 'error': return '❌ Connection error'
      case 'stopped': return '⏹️ Stopped'
      default: return '🔄 Initializing...'
    }
  }

  return (
    <view className="simple-audio-recorder">
      <view className="recorder-header">
        <text className="recorder-title">🎙️ Simple Audio Transcription</text>
        <view className={`status-badge ${isRecording ? 'recording' : 'idle'}`}>
          <text>{getStatusMessage()}</text>
        </view>
      </view>

      {error && (
        <view className="error-message">
          <text>{error}</text>
        </view>
      )}

      <view className="transcript-display">
        <text className="transcript-label">Live Transcript:</text>
        <text className="transcript-text">
          {transcript || (isRecording ? 'Listening... start speaking!' : 'Not recording')}
        </text>
      </view>

      <view className="recorder-controls">
        <view 
          className={`control-button ${isRecording ? 'stop' : 'start'}`}
          bindtap={isRecording ? stopRecording : startRecording}
        >
          <text>{isRecording ? 'Stop Recording' : 'Start Recording'}</text>
        </view>
      </view>
    </view>
  )
}