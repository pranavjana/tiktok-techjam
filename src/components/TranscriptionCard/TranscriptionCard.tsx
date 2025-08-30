import { useCallback, useState } from '@lynx-js/react'
import { RecordingMode } from '../../types/index.js'
import type { Transcription } from '../../types/index.js'
import './TranscriptionCard.css'

interface TranscriptionCardProps {
  transcription: Transcription
  onPress: (id: string) => void
  onDelete: (id: string) => void
}

export function TranscriptionCard({ transcription, onPress, onDelete }: TranscriptionCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [startX, setStartX] = useState(0)

  const handleTouchStart = useCallback((e: any) => {
    setStartX(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: any) => {
    const currentX = e.touches[0].clientX
    const diff = startX - currentX
    
    // Only allow left swipe (positive diff)
    if (diff > 0 && diff < 100) {
      setSwipeOffset(diff)
    }
  }, [startX])

  const handleTouchEnd = useCallback(() => {
    if (swipeOffset > 50) {
      // Show delete action
      setSwipeOffset(80)
    } else {
      // Reset position
      setSwipeOffset(0)
    }
  }, [swipeOffset])

  const handleCardPress = useCallback(() => {
    if (swipeOffset === 0) {
      onPress(transcription.id)
    } else {
      setSwipeOffset(0)
    }
  }, [transcription.id, onPress, swipeOffset])

  const handleDeletePress = useCallback(() => {
    onDelete(transcription.id)
  }, [transcription.id, onDelete])

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} min ago`
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(hours / 24)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getModeColor = (mode: RecordingMode) => {
    switch (mode) {
      case RecordingMode.MEETING:
        return '#4A90E2'
      case RecordingMode.INTERVIEW:
        return '#7ED321'
      case RecordingMode.LECTURE:
        return '#BD10E0'
      default:
        return '#9013FE'
    }
  }

  return (
    <view className="TranscriptionCard__container">
      <view 
        className="TranscriptionCard"
        style={{ transform: `translateX(-${swipeOffset}rpx)` }}
        bindtouchstart={handleTouchStart}
        bindtouchmove={handleTouchMove}
        bindtouchend={handleTouchEnd}
        bindtap={handleCardPress}
      >
        {/* Processing Indicator */}
        {transcription.isProcessing && (
          <view className="TranscriptionCard__processingBar" />
        )}

        {/* Card Header */}
        <view className="TranscriptionCard__header">
          <view className="TranscriptionCard__titleRow">
            <text className="TranscriptionCard__title">{transcription.title}</text>
          </view>
          <view className="TranscriptionCard__meta">
            <text className="TranscriptionCard__timestamp">
              {formatTimestamp(transcription.timestamp)}
            </text>
            <text className="TranscriptionCard__dot">•</text>
            <text className="TranscriptionCard__duration">
              {formatDuration(transcription.duration)}
            </text>
            <text className="TranscriptionCard__dot">•</text>
            <text className="TranscriptionCard__wordCount">
              {transcription.wordCount} words
            </text>
          </view>
        </view>

        {/* Summary */}
        <view className="TranscriptionCard__summary">
          <text className="TranscriptionCard__summaryText">
            {transcription.isProcessing ? 'Processing transcription...' : transcription.summary}
          </text>
        </view>

        {/* Tags */}
        <view className="TranscriptionCard__tags">
          <view 
            className="TranscriptionCard__modeTag"
            style={{ backgroundColor: getModeColor(transcription.mode) }}
          >
            <text className="TranscriptionCard__modeTagText">{transcription.mode}</text>
          </view>
          {transcription.tags.slice(0, 2).map((tag, index) => (
            <view key={index} className="TranscriptionCard__tag">
              <text className="TranscriptionCard__tagText">#{tag}</text>
            </view>
          ))}
          {transcription.tags.length > 2 && (
            <text className="TranscriptionCard__moreTags">+{transcription.tags.length - 2}</text>
          )}
        </view>
      </view>

      {/* Delete Action */}
      <view 
        className="TranscriptionCard__deleteAction"
        style={{ opacity: swipeOffset > 50 ? 1 : 0 }}
        bindtap={handleDeletePress}
      >
        <text className="TranscriptionCard__deleteText">Delete</text>
      </view>
    </view>
  )
}