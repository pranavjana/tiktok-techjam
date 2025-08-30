import { useState, useRef, useCallback, useEffect } from '@lynx-js/react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

interface TranscriptionComponentProps {
  onTranscript?: (transcript: string) => void
}

export function TranscriptionComponent({ onTranscript }: TranscriptionComponentProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY

  useEffect(() => {
    if (!apiKey) {
      setError('Deepgram API key not found. Please add VITE_DEEPGRAM_API_KEY to your .env.local file.')
    }
  }, [apiKey])

  const startRecording = useCallback(async () => {
    if (!apiKey) {
      setError('Deepgram API key not found')
      return
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create Deepgram client and connection
      const deepgram = createClient(apiKey)
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true
      })

      connectionRef.current = connection

      // Set up event listeners
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened')
        setIsConnected(true)
        setError(null)
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript
        if (transcript && data.is_final) {
          console.log('Final transcript:', transcript)
          setTranscript(prev => prev + ' ' + transcript)
          onTranscript?.(transcript)
        }
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed')
        setIsConnected(false)
      })

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error)
        setError(`Deepgram error: ${error.message}`)
      })

      // Set up MediaRecorder to send audio data
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && connectionRef.current) {
          connectionRef.current.send(event.data)
        }
      }

      mediaRecorder.start(250) // Send data every 250ms
      setIsRecording(true)

    } catch (err: any) {
      console.error('Error starting recording:', err)
      setError(`Error: ${err.message}`)
    }
  }, [apiKey, onTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }

    if (connectionRef.current) {
      connectionRef.current.finish()
      connectionRef.current = null
    }

    setIsRecording(false)
    setIsConnected(false)
  }, [isRecording])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return (
    <view className="transcription-component">
      <view className="transcription-controls">
        <view 
          className={`record-button ${isRecording ? 'recording' : ''} ${!apiKey ? 'disabled' : ''}`}
          bindtap={!apiKey ? undefined : (isRecording ? stopRecording : startRecording)}
        >
          <text>{isRecording ? 'Stop Recording' : 'Start Recording'}</text>
        </view>
        
        <view 
          className={`clear-button ${!transcript ? 'disabled' : ''}`}
          bindtap={!transcript ? undefined : clearTranscript}
        >
          <text>Clear</text>
        </view>
      </view>

      <view className="status-indicators">
        <view className={`status-indicator ${isConnected ? 'connected' : ''}`}>
          <text>Connection: {isConnected ? 'Connected' : 'Disconnected'}</text>
        </view>
        
        <view className={`status-indicator ${isRecording ? 'recording' : ''}`}>
          <text>Recording: {isRecording ? 'Active' : 'Inactive'}</text>
        </view>
      </view>

      {error && (
        <view className="error-message">
          <text>{error}</text>
        </view>
      )}

      <view className="transcript-container">
        <text className="transcript-label">Transcript:</text>
        <text className="transcript-text">{transcript || 'No transcript yet...'}</text>
      </view>
    </view>
  )
}