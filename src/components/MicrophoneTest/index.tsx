import { useState, useRef, useCallback } from '@lynx-js/react'
import './styles.css'

interface MicrophoneTestProps {
  onStatusChange?: (status: string) => void
}

export function MicrophoneTest({ onStatusChange }: MicrophoneTestProps) {
  const [status, setStatus] = useState<string>('Not tested')
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    setLogs(prev => [logEntry, ...prev.slice(0, 9)]) // Keep last 10 logs
  }, [])

  const updateStatus = useCallback((newStatus: string) => {
    setStatus(newStatus)
    onStatusChange?.(newStatus)
    addLog(`Status: ${newStatus}`)
  }, [onStatusChange, addLog])

  const startListening = useCallback(async () => {
    try {
      updateStatus('Requesting microphone permission...')
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateStatus('❌ getUserMedia not supported')
        addLog('navigator.mediaDevices.getUserMedia is not available')
        return
      }

      addLog('Requesting audio stream...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      streamRef.current = stream
      updateStatus('✅ Microphone access granted')
      addLog(`Audio stream acquired: ${stream.getTracks().length} tracks`)

      // Set up audio analysis for visual feedback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      analyserRef.current = analyser
      microphone.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.round(average))
        animationRef.current = requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()
      setIsListening(true)
      updateStatus('🎤 Listening - speak to test')
      
    } catch (error: any) {
      updateStatus(`❌ Error: ${error.name}`)
      addLog(`Error details: ${error.message}`)
      
      if (error.name === 'NotAllowedError') {
        addLog('User denied microphone permission')
      } else if (error.name === 'NotFoundError') {
        addLog('No microphone found')
      } else if (error.name === 'NotSupportedError') {
        addLog('Microphone not supported')
      } else {
        addLog(`Unknown error: ${error.toString()}`)
      }
    }
  }, [updateStatus, addLog])

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        addLog(`Stopped track: ${track.kind} - ${track.label}`)
      })
      streamRef.current = null
    }

    setIsListening(false)
    setAudioLevel(0)
    updateStatus('Stopped')
  }, [updateStatus, addLog])

  const testEnvironment = useCallback(() => {
    addLog('=== Environment Test ===')
    addLog(`User Agent: ${navigator.userAgent}`)
    addLog(`HTTPS: ${window.location.protocol === 'https:'}`)
    addLog(`MediaDevices available: ${!!navigator.mediaDevices}`)
    addLog(`getUserMedia available: ${!!navigator.mediaDevices?.getUserMedia}`)
    
    // Check for Deepgram API key
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY
    addLog(`API Key configured: ${!!apiKey}`)
    if (apiKey) {
      addLog(`API Key length: ${apiKey.length}`)
      addLog(`API Key prefix: ${apiKey.substring(0, 8)}...`)
    }
  }, [addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return (
    <view className="microphone-test">
      <view className="test-header">
        <text className="test-title">🎤 Microphone Test</text>
        <text className="test-status">{status}</text>
      </view>

      <view className="test-controls">
        <view 
          className={`test-button ${isListening ? 'listening' : 'idle'}`}
          bindtap={isListening ? stopListening : startListening}
        >
          <text>{isListening ? 'Stop Test' : 'Test Microphone'}</text>
        </view>

        <view className="test-button secondary" bindtap={testEnvironment}>
          <text>Check Environment</text>
        </view>

        <view className="test-button secondary" bindtap={clearLogs}>
          <text>Clear Logs</text>
        </view>
      </view>

      {isListening && (
        <view className="audio-level">
          <text className="level-label">Audio Level: {audioLevel}</text>
          <view className="level-bar">
            <view 
              className="level-fill" 
              style={`width: ${Math.min(audioLevel * 2, 100)}%`}
            />
          </view>
        </view>
      )}

      <view className="logs-section">
        <text className="logs-title">Debug Logs:</text>
        <scroll-view className="logs-container">
          {logs.length === 0 ? (
            <text className="no-logs">No logs yet - click "Test Microphone" to start</text>
          ) : (
            logs.map((log, index) => (
              <text key={index} className="log-entry">{log}</text>
            ))
          )}
        </scroll-view>
      </view>
    </view>
  )
}