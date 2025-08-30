import { useState, useRef, useCallback, useEffect } from '@lynx-js/react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'
import './styles.css'

interface LiveTranscriptionProps {
  isActive: boolean
  onTranscript?: (transcript: string) => void
}

export function LiveTranscription({ isActive, onTranscript }: LiveTranscriptionProps) {
  const [transcript, setTranscript] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState('idle')
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [microphoneStatus, setMicrophoneStatus] = useState('not-requested')

  const connectionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    console.log('LiveTranscription:', logEntry)
    setDebugLogs(prev => [logEntry, ...prev.slice(0, 4)]) // Keep last 5 logs
  }, [])

  const startTranscription = useCallback(async () => {
    if (!apiKey) {
      const errorMsg = 'Deepgram API key not configured'
      setError(errorMsg)
      addDebugLog(errorMsg)
      return
    }

    addDebugLog('Starting transcription...')
    setConnectionStatus('starting')
    setError(null)

    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser/environment')
      }

      addDebugLog('Requesting microphone access...')
      setMicrophoneStatus('requesting')
      setConnectionStatus('requesting-microphone')

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream
      
      addDebugLog(`Microphone access granted: ${stream.getTracks().length} audio tracks`)
      setMicrophoneStatus('granted')
      setConnectionStatus('connecting-deepgram')
      
      // Create Deepgram client and connection
      addDebugLog('Creating Deepgram client...')
      const deepgram = createClient(apiKey)
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: false // Only final results for cleaner display
      })

      connectionRef.current = connection
      addDebugLog('Deepgram connection created, setting up event listeners...')

      // Set up event listeners
      connection.on(LiveTranscriptionEvents.Open, () => {
        addDebugLog('Deepgram connection opened successfully!')
        setIsConnected(true)
        setConnectionStatus('connected')
        setError(null)
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcriptText = data.channel?.alternatives?.[0]?.transcript
        if (transcriptText && data.is_final) {
          addDebugLog(`Transcript received: "${transcriptText}"`)
          setTranscript(prev => {
            const newText = prev ? prev + ' ' + transcriptText : transcriptText
            onTranscript?.(newText)
            return newText
          })
        }
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        addDebugLog('Deepgram connection closed')
        setIsConnected(false)
        setConnectionStatus('disconnected')
      })

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        const errorMsg = `Deepgram error: ${error.message}`
        addDebugLog(errorMsg)
        console.error('Deepgram error:', error)
        setError(errorMsg)
        setIsConnected(false)
        setConnectionStatus('error')
      })

      // Set up MediaRecorder to send audio data
      addDebugLog('Setting up MediaRecorder...')
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && connectionRef.current) {
          connectionRef.current.send(event.data)
          addDebugLog(`Sent audio data: ${event.data.size} bytes`)
        }
      }

      mediaRecorder.onerror = (event: any) => {
        const errorMsg = `MediaRecorder error: ${event.error?.message || 'Unknown error'}`
        addDebugLog(errorMsg)
        setError(errorMsg)
      }

      addDebugLog('Starting MediaRecorder...')
      mediaRecorder.start(250) // Send data every 250ms
      setConnectionStatus('recording')

    } catch (err: any) {
      const errorMsg = `Microphone access error: ${err.message}`
      addDebugLog(errorMsg)
      console.error('Error starting transcription:', err)
      setError(errorMsg)
      setMicrophoneStatus('denied')
      setConnectionStatus('error')
      
      // Provide more specific error messages
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else if (err.name === 'NotSupportedError') {
        setError('Microphone not supported in this browser/environment.')
      }
    }
  }, [apiKey, onTranscript, addDebugLog])

  const stopTranscription = useCallback(() => {
    addDebugLog('Stopping transcription...')

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      addDebugLog('MediaRecorder stopped')
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        addDebugLog(`Stopped track: ${track.kind}`)
      })
    }

    if (connectionRef.current) {
      connectionRef.current.finish()
      connectionRef.current = null
      addDebugLog('Deepgram connection finished')
    }

    setIsConnected(false)
    setConnectionStatus('stopped')
    setMicrophoneStatus('released')
  }, [addDebugLog])

  // Handle isActive prop changes
  useEffect(() => {
    if (isActive && !isConnected) {
      startTranscription()
    } else if (!isActive && isConnected) {
      stopTranscription()
    }
  }, [isActive, isConnected, startTranscription, stopTranscription])

  // Clear transcript when starting new session
  useEffect(() => {
    if (isActive) {
      setTranscript('')
      setError(null)
      setDebugLogs([])
      setConnectionStatus('starting')
      setMicrophoneStatus('not-requested')
      addDebugLog('Starting new transcription session')
    }
  }, [isActive, addDebugLog])

  if (!isActive) {
    return null
  }

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'starting': return '⚡ Starting transcription...'
      case 'requesting-microphone': return '🎤 Requesting microphone access...'
      case 'connecting-deepgram': return '🌐 Connecting to Deepgram...'
      case 'connected': return '✅ Connected and ready'
      case 'recording': return '🎙️ Recording and transcribing...'
      case 'error': return '❌ Connection error'
      case 'stopped': return '⏹️ Stopped'
      default: return '🔄 Initializing...'
    }
  }

  return (
    <view className="live-transcription">
      <view className="transcription-header">
        <text className="transcription-title">Live Transcription Debug</text>
        <view className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <text>{getStatusMessage()}</text>
        </view>
      </view>

      {/* Status Details */}
      <view className="status-details">
        <text className="status-item">🎤 Microphone: {microphoneStatus}</text>
        <text className="status-item">🌐 Connection: {connectionStatus}</text>
        <text className="status-item">🔑 API Key: {apiKey ? '✅ Configured' : '❌ Missing'}</text>
      </view>

      {error && (
        <view className="transcription-error">
          <text>{error}</text>
        </view>
      )}

      <view className="transcription-content">
        <text className="transcript-text">
          {transcript || (isConnected ? 'Listening... Start speaking!' : 'Waiting for connection...')}
        </text>
      </view>

      {/* Debug Logs */}
      <view className="debug-logs">
        <text className="logs-title">Debug Logs:</text>
        <view className="logs-container">
          {debugLogs.length === 0 ? (
            <text className="no-logs">No debug logs yet...</text>
          ) : (
            debugLogs.map((log, index) => (
              <text key={index} className="log-entry">{log}</text>
            ))
          )}
        </view>
      </view>
    </view>
  )
}