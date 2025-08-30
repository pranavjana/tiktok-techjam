import { useState, useCallback } from '@lynx-js/react'
import { RecordingMode } from '../../types/index.js'
import type { Transcription } from '../../types/index.js'
import { TranscriptionCard } from '../TranscriptionCard/index.js'
import './RecordingsPage.css'

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

export function RecordingsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>(mockTranscriptions)

  const handleTranscriptionPress = useCallback((id: string) => {
    console.log('Open transcription:', id)
  }, [])

  const handleTranscriptionDelete = useCallback((id: string) => {
    setTranscriptions(transcriptions.filter(t => t.id !== id))
  }, [transcriptions])

  return (
    <view className="RecordingsPage">
      {/* Header */}
      <view className="RecordingsPage__header">
        <text className="RecordingsPage__title">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </text>
      </view>

      <scroll-view 
        style={{ width: "100%", flex: 1 }}
        scroll-orientation="vertical"
      >
        <view>
          {/* Transcriptions List */}
          <view className="RecordingsPage__section">
            {transcriptions.length === 0 ? (
              <view className="RecordingsPage__emptyState">
                <text className="RecordingsPage__emptyText">No recordings yet</text>
                <text className="RecordingsPage__emptyHint">Go to Home to start recording</text>
              </view>
            ) : (
              <view className="RecordingsPage__transcriptionsList">
                {transcriptions.map(transcription => (
                  <TranscriptionCard
                    key={transcription.id}
                    transcription={transcription}
                    onPress={handleTranscriptionPress}
                    onDelete={handleTranscriptionDelete}
                  />
                ))}
              </view>
            )}
          </view>
        </view>
      </scroll-view>
    </view>
  )
}