import { useState, useCallback } from '@lynx-js/react'
import { TranscriptionComponent } from '../TranscriptionComponent/index.js'
import type { Transcription } from '../../types/index.js'
import './styles.css'

export function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcription[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')

  const handleTranscript = useCallback((transcript: string) => {
    setCurrentTranscript(prev => prev + ' ' + transcript)
  }, [])

  const saveTranscript = useCallback(() => {
    if (!currentTranscript.trim()) return

    const newTranscript: Transcription = {
      id: Date.now().toString(),
      title: `Transcript ${new Date().toLocaleDateString()}`,
      timestamp: new Date(),
      duration: 0, // Will be calculated based on recording time
      wordCount: currentTranscript.split(' ').length,
      summary: currentTranscript.substring(0, 100) + '...',
      tags: ['live-transcript'],
      mode: 'custom' as any,
      transcriptText: currentTranscript,
      isProcessing: false,
      isFavorite: false
    }

    setTranscripts(prev => [newTranscript, ...prev])
    setCurrentTranscript('')
  }, [currentTranscript])

  const deleteTranscript = useCallback((id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <view className="transcripts-page">
      <view className="transcripts-header">
        <text className="transcripts-title">Live Transcription</text>
        <text className="transcripts-subtitle">Powered by Deepgram AI</text>
      </view>

      <TranscriptionComponent onTranscript={handleTranscript} />

      {currentTranscript && (
        <view className="current-transcript-actions">
          <view 
            className="save-button"
            bindtap={saveTranscript}
          >
            <text>Save Transcript</text>
          </view>
        </view>
      )}

      <view className="saved-transcripts">
        <text className="section-title">Saved Transcripts ({transcripts.length})</text>
        
        {transcripts.length === 0 ? (
          <view className="empty-state">
            <text className="empty-message">No transcripts saved yet</text>
            <text className="empty-hint">Start recording to create your first transcript</text>
          </view>
        ) : (
          <scroll-view className="transcripts-list">
            {transcripts.map((transcript) => (
              <view key={transcript.id} className="transcript-item">
                <view className="transcript-header">
                  <text className="transcript-title">{transcript.title}</text>
                  <view 
                    className="delete-button"
                    bindtap={() => deleteTranscript(transcript.id)}
                  >
                    <text>✕</text>
                  </view>
                </view>
                
                <text className="transcript-meta">
                  {transcript.timestamp.toLocaleDateString()} • {transcript.wordCount} words
                </text>
                
                <text className="transcript-preview">
                  {transcript.transcriptText.substring(0, 150)}
                  {transcript.transcriptText.length > 150 ? '...' : ''}
                </text>
              </view>
            ))}
          </scroll-view>
        )}
      </view>
    </view>
  )
}