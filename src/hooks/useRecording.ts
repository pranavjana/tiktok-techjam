import { useState, useCallback, useEffect } from '@lynx-js/react'
import { RecordingState, RecordingMode } from '../types/index.js'
import type { RecordingSettings } from '../types/index.js'

export function useRecording() {
  const [state, setState] = useState<RecordingState>(RecordingState.IDLE)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [settings, setSettings] = useState<RecordingSettings>({
    mode: RecordingMode.CUSTOM,
    language: 'en-US',
    quality: 'high',
    aiFeatures: {
      summarization: true,
      speakerDetection: true,
      keywordExtraction: true
    }
  })

  // Check audio permissions
  useEffect(() => {
    checkAudioPermission()
  }, [])

  // Duration counter
  useEffect(() => {
    let interval: any
    if (state === RecordingState.RECORDING) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } else {
      setDuration(0)
    }
    return () => clearInterval(interval)
  }, [state])

  // Simulate audio level monitoring
  useEffect(() => {
    let interval: any
    if (state === RecordingState.RECORDING) {
      interval = setInterval(() => {
        // Simulate random audio levels
        setAudioLevel(Math.random() * 100)
      }, 100)
    } else {
      setAudioLevel(0)
    }
    return () => clearInterval(interval)
  }, [state])

  const checkAudioPermission = useCallback(async () => {
    // Simulate permission check
    // In real app, this would check actual device permissions
    setIsPermissionGranted(true)
  }, [])

  const requestAudioPermission = useCallback(async () => {
    // Simulate permission request
    // In real app, this would request actual device permissions
    console.log('Requesting audio permission...')
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPermissionGranted(true)
        resolve(true)
      }, 1000)
    })
  }, [])

  const startRecording = useCallback(async () => {
    if (!isPermissionGranted) {
      const granted = await requestAudioPermission()
      if (!granted) {
        setState(RecordingState.ERROR)
        return false
      }
    }

    setState(RecordingState.PREPARING)
    
    // Simulate preparation time
    return new Promise((resolve) => {
      setTimeout(() => {
        setState(RecordingState.RECORDING)
        console.log('Recording started with settings:', settings)
        resolve(true)
      }, 500)
    })
  }, [isPermissionGranted, settings])

  const stopRecording = useCallback(async () => {
    if (state !== RecordingState.RECORDING) {
      return false
    }

    setState(RecordingState.PROCESSING)
    
    // Simulate processing time
    return new Promise((resolve) => {
      setTimeout(() => {
        setState(RecordingState.IDLE)
        console.log('Recording stopped. Duration:', duration)
        resolve(true)
      }, 2000)
    })
  }, [state, duration])

  const cancelRecording = useCallback(() => {
    setState(RecordingState.IDLE)
    setDuration(0)
    setAudioLevel(0)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<RecordingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  return {
    state,
    duration,
    audioLevel,
    isPermissionGranted,
    settings,
    startRecording,
    stopRecording,
    cancelRecording,
    updateSettings,
    requestAudioPermission
  }
}