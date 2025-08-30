import { useCallback, useState } from '@lynx-js/react'
import { RecordingState } from '../../types/index.js'
import './RecordButton.css'

interface RecordButtonProps {
  state: RecordingState
  onPress: () => void
  duration?: number
}

export function RecordButton({ state, onPress, duration = 0 }: RecordButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = useCallback(() => {
    setIsPressed(true)
    // Simulate haptic feedback
    console.log('Haptic feedback triggered')
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)
    onPress()
  }, [onPress])

  const getButtonClass = () => {
    const classes = ['RecordButton']
    
    if (state === RecordingState.RECORDING) {
      classes.push('RecordButton--recording')
    } else if (state === RecordingState.PROCESSING) {
      classes.push('RecordButton--processing')
    } else if (state === RecordingState.PREPARING) {
      classes.push('RecordButton--preparing')
    }
    
    if (isPressed) {
      classes.push('RecordButton--pressed')
    }
    
    return classes.join(' ')
  }

  const getButtonContent = () => {
    switch (state) {
      case RecordingState.RECORDING:
        return (
          <>
            <view className="RecordButton__stopIcon" />
            <view className="RecordButton__pulseRing RecordButton__pulseRing--1" />
            <view className="RecordButton__pulseRing RecordButton__pulseRing--2" />
            <view className="RecordButton__pulseRing RecordButton__pulseRing--3" />
          </>
        )
      case RecordingState.PROCESSING:
        return (
          <>
            <view className="RecordButton__spinner" />
            <text className="RecordButton__processingText">Processing...</text>
          </>
        )
      case RecordingState.PREPARING:
        return (
          <>
            <view className="RecordButton__preparingDot RecordButton__preparingDot--1" />
            <view className="RecordButton__preparingDot RecordButton__preparingDot--2" />
            <view className="RecordButton__preparingDot RecordButton__preparingDot--3" />
          </>
        )
      default:
        return (
          <>
            <view className="RecordButton__micIcon" />
            <text className="RecordButton__label">Tap to Record</text>
          </>
        )
    }
  }

  return (
    <view 
      className={getButtonClass()}
      bindtouchstart={handleTouchStart}
      bindtouchend={handleTouchEnd}
    >
      <view className="RecordButton__inner">
        {getButtonContent()}
      </view>
      
    </view>
  )
}