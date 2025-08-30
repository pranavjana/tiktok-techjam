export enum RecordingState {
  IDLE = 'idle',
  PREPARING = 'preparing',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  ERROR = 'error'
}

export enum RecordingMode {
  LECTURE = 'lecture',
  MEETING = 'meeting',
  INTERVIEW = 'interview',
  CUSTOM = 'custom'
}

export enum TabType {
  HOME = 'home',
  RECORDINGS = 'recordings',
  TRANSCRIPTS = 'transcripts',
  SETTINGS = 'settings'
}

export interface Transcription {
  id: string
  title: string
  timestamp: Date
  duration: number // in seconds
  wordCount: number
  summary: string
  tags: string[]
  mode: RecordingMode
  audioUrl?: string
  transcriptText: string
  isProcessing: boolean
  isFavorite: boolean
}

export interface RecordingSettings {
  mode: RecordingMode
  language: string
  quality: 'standard' | 'high'
  aiFeatures: {
    summarization: boolean
    speakerDetection: boolean
    keywordExtraction: boolean
  }
}

export interface QuickAction {
  id: string
  title: string
  icon: string
  action: () => void
  badge?: number
}

export interface UserStats {
  todayRecordings: number
  totalMinutes: number
  totalTranscriptions: number
  favoriteCount: number
}

export interface AppState {
  recordingState: RecordingState
  currentRecording: {
    startTime?: Date
    duration: number
    audioLevel: number
  }
  recentTranscriptions: Transcription[]
  userStats: UserStats
  settings: RecordingSettings
  activeTab: TabType
}