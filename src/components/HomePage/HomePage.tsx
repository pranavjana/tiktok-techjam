import { useState, useEffect, useCallback } from '@lynx-js/react'
import { RecordingState, RecordingMode } from '../../types/index.js'
import type { Transcription, UserStats } from '../../types/index.js'
import { RecordButton } from '../RecordButton/index.js'
import { TranscriptionCard } from '../TranscriptionCard/index.js'
import { LiveTranscription } from '../LiveTranscription/index.js'
import { MicrophoneTest } from '../MicrophoneTest/index.js'
import './HomePage.css'

// Mock data for development
const mockTranscriptions: Transcription[] = [
  {
    id: '1',
    title: 'Team Standup Meeting',
    timestamp: new Date(Date.now() - 3600000),
    duration: 900,
    wordCount: 1250,
    summary: 'Discussed project timeline, sprint goals, and blockers. Action items assigned for API integration.',
    tags: ['meeting', 'standup', 'engineering'],
    mode: RecordingMode.MEETING,
    transcriptText: '',
    isProcessing: false,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Product Design Review',
    timestamp: new Date(Date.now() - 7200000),
    duration: 1800,
    wordCount: 2340,
    summary: 'Reviewed new UI mockups for homepage redesign. Feedback on color scheme and navigation flow.',
    tags: ['design', 'product', 'review'],
    mode: RecordingMode.MEETING,
    transcriptText: '',
    isProcessing: false,
    isFavorite: false
  },
  {
    id: '3',
    title: 'Customer Interview - John Doe',
    timestamp: new Date(Date.now() - 86400000),
    duration: 2400,
    wordCount: 3100,
    summary: 'User feedback on current features. Requested better export options and keyboard shortcuts.',
    tags: ['interview', 'customer', 'feedback'],
    mode: RecordingMode.INTERVIEW,
    transcriptText: '',
    isProcessing: true,
    isFavorite: false
  }
]

const mockStats: UserStats = {
  todayRecordings: 3,
  totalMinutes: 127,
  totalTranscriptions: 42,
  favoriteCount: 8
}

export function HomePage() {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE)
  const [transcriptions, setTranscriptions] = useState<Transcription[]>(mockTranscriptions)
  const [userStats, setUserStats] = useState<UserStats>(mockStats)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDuration, setCurrentDuration] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [micTestStatus, setMicTestStatus] = useState<string>('Not tested')

  useEffect(() => {
    // Simulate duration counter when recording
    let interval: any
    if (recordingState === RecordingState.RECORDING) {
      interval = setInterval(() => {
        setCurrentDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCurrentDuration(0)
    }
    return () => clearInterval(interval)
  }, [recordingState])

  const handleRecordPress = useCallback(() => {
    if (recordingState === RecordingState.IDLE) {
      setRecordingState(RecordingState.PREPARING)
      setCurrentTranscript('') // Clear previous transcript
      // Simulate preparation delay
      setTimeout(() => {
        setRecordingState(RecordingState.RECORDING)
      }, 500)
    } else if (recordingState === RecordingState.RECORDING) {
      setRecordingState(RecordingState.PROCESSING)
      // Simulate processing
      setTimeout(() => {
        setRecordingState(RecordingState.IDLE)
        // Add new transcription with real transcript data
        if (currentTranscript) {
          const newTranscription: Transcription = {
            id: Date.now().toString(),
            title: `Recording ${new Date().toLocaleDateString()}`,
            timestamp: new Date(),
            duration: currentDuration,
            wordCount: currentTranscript.split(' ').length,
            summary: currentTranscript.substring(0, 100) + (currentTranscript.length > 100 ? '...' : ''),
            tags: ['live-recording'],
            mode: RecordingMode.CUSTOM,
            transcriptText: currentTranscript,
            isProcessing: false,
            isFavorite: false
          }
          setTranscriptions([newTranscription, ...transcriptions])
        }
        setUserStats({
          ...userStats,
          todayRecordings: userStats.todayRecordings + 1,
          totalMinutes: userStats.totalMinutes + Math.floor(currentDuration / 60)
        })
      }, 2000)
    }
  }, [recordingState, currentDuration, currentTranscript, transcriptions, userStats])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }, [])

  const handleTranscriptionPress = useCallback((id: string) => {
    console.log('Open transcription:', id)
  }, [])

  const handleTranscriptionDelete = useCallback((id: string) => {
    setTranscriptions(transcriptions.filter(t => t.id !== id))
  }, [transcriptions])

  const handleLiveTranscript = useCallback((transcript: string) => {
    setCurrentTranscript(transcript)
  }, [])

  const handleMicTestStatusChange = useCallback((status: string) => {
    setMicTestStatus(status)
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <view className="HomePage">
      {/* Greeting */}
      <view className="HomePage__greetingSection">
        <text className="HomePage__greetingText">Hello, Pranav</text>
      </view>

      {/* Microphone Test - Debug Component */}
      <MicrophoneTest onStatusChange={handleMicTestStatusChange} />

      {/* Recording Section */}
      <view className="HomePage__recordSection">
        <RecordButton
          state={recordingState}
          onPress={handleRecordPress}
          duration={currentDuration}
        />
        {recordingState === RecordingState.RECORDING && (
          <view className="HomePage__recordingInfo">
            <text className="HomePage__recordingDuration">{formatDuration(currentDuration)}</text>
            <text className="HomePage__recordingHint">Tap to stop recording</text>
          </view>
        )}
      </view>

      {/* Live Transcription */}
      <LiveTranscription 
        isActive={recordingState === RecordingState.RECORDING}
        onTranscript={handleLiveTranscript}
      />
    </view>
  )
}