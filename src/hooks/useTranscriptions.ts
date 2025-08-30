import { useState, useCallback, useEffect } from '@lynx-js/react'
import { RecordingMode } from '../types/index.js'
import type { Transcription } from '../types/index.js'

// Mock data generator
const generateMockTranscription = (index: number): Transcription => {
  const modes = [RecordingMode.MEETING, RecordingMode.INTERVIEW, RecordingMode.LECTURE, RecordingMode.CUSTOM]
  const titles = [
    'Team Standup Meeting',
    'Product Design Review',
    'Customer Interview',
    'Sprint Planning',
    'Quarterly Review',
    'User Research Session'
  ]
  
  const tags = [
    ['meeting', 'standup', 'engineering'],
    ['design', 'product', 'review'],
    ['interview', 'customer', 'feedback'],
    ['planning', 'sprint', 'agile'],
    ['review', 'quarterly', 'business'],
    ['research', 'user', 'insights']
  ]

  const summaries = [
    'Discussed project timeline, sprint goals, and blockers. Action items assigned for API integration.',
    'Reviewed new UI mockups for homepage redesign. Feedback on color scheme and navigation flow.',
    'User feedback on current features. Requested better export options and keyboard shortcuts.',
    'Planned next sprint tasks and resource allocation. Updated velocity metrics.',
    'Quarterly performance review and goal setting for next quarter.',
    'User research findings on app usability and feature requests.'
  ]

  const idx = index % titles.length
  const timestamp = new Date(Date.now() - (index * 3600000))
  
  return {
    id: `transcription-${index}`,
    title: titles[idx],
    timestamp,
    duration: Math.floor(Math.random() * 3600) + 300,
    wordCount: Math.floor(Math.random() * 5000) + 500,
    summary: summaries[idx],
    tags: tags[idx],
    mode: modes[Math.floor(Math.random() * modes.length)],
    transcriptText: '',
    isProcessing: index === 0,
    isFavorite: Math.random() > 0.7
  }
}

export function useTranscriptions() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<RecordingMode | null>(null)

  // Load initial transcriptions
  useEffect(() => {
    loadTranscriptions()
  }, [])

  const loadTranscriptions = useCallback(async () => {
    setIsLoading(true)
    
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockData = Array.from({ length: 10 }, (_, i) => generateMockTranscription(i))
        setTranscriptions(mockData)
        setIsLoading(false)
        resolve()
      }, 1000)
    })
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    
    setIsLoading(true)
    
    // Simulate loading more data
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const currentLength = transcriptions.length
        const newData = Array.from({ length: 5 }, (_, i) => 
          generateMockTranscription(currentLength + i)
        )
        setTranscriptions([...transcriptions, ...newData])
        setIsLoading(false)
        
        // Simulate end of data
        if (transcriptions.length + newData.length > 25) {
          setHasMore(false)
        }
        resolve()
      }, 1000)
    })
  }, [transcriptions, hasMore, isLoading])

  const deleteTranscription = useCallback((id: string) => {
    setTranscriptions(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setTranscriptions(prev => prev.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ))
  }, [])

  const searchTranscriptions = useCallback((query: string) => {
    setSearchQuery(query)
    // In real app, this would filter or search from API
  }, [])

  const filterByMode = useCallback((mode: RecordingMode | null) => {
    setFilterMode(mode)
    // In real app, this would filter the list
  }, [])

  const getFilteredTranscriptions = useCallback(() => {
    let filtered = transcriptions

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filterMode) {
      filtered = filtered.filter(t => t.mode === filterMode)
    }

    return filtered
  }, [transcriptions, searchQuery, filterMode])

  const getFavorites = useCallback(() => {
    return transcriptions.filter(t => t.isFavorite)
  }, [transcriptions])

  const getStats = useCallback(() => {
    const totalDuration = transcriptions.reduce((sum, t) => sum + t.duration, 0)
    const totalWords = transcriptions.reduce((sum, t) => sum + t.wordCount, 0)
    const favoriteCount = transcriptions.filter(t => t.isFavorite).length
    
    return {
      totalTranscriptions: transcriptions.length,
      totalMinutes: Math.floor(totalDuration / 60),
      totalWords,
      favoriteCount,
      averageDuration: transcriptions.length > 0 ? Math.floor(totalDuration / transcriptions.length) : 0
    }
  }, [transcriptions])

  return {
    transcriptions: getFilteredTranscriptions(),
    allTranscriptions: transcriptions,
    isLoading,
    hasMore,
    searchQuery,
    filterMode,
    loadTranscriptions,
    loadMore,
    deleteTranscription,
    toggleFavorite,
    searchTranscriptions,
    filterByMode,
    getFavorites,
    getStats
  }
}