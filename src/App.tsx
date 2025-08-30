import { useState, useCallback } from '@lynx-js/react'
import { HomePage } from './components/HomePage/index.js'
import { RecordingsPage } from './components/RecordingsPage/index.js'
import { TranscriptsPage } from './components/TranscriptsPage/index.js'
import { TabBar } from './components/TabBar/index.js'
import { TabType } from './types/index.js'
import './App.css'

export function App(props: {
  onRender?: () => void
}) {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME)
  const [tabBadges, setTabBadges] = useState({
    [TabType.HOME]: 0,
    [TabType.RECORDINGS]: 3,
    [TabType.TRANSCRIPTS]: 0,
    [TabType.SETTINGS]: 1
  })

  props.onRender?.()

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    // Clear badge when tab is selected
    if (tabBadges[tab] > 0) {
      setTabBadges(prev => ({ ...prev, [tab]: 0 }))
    }
  }, [tabBadges])

  const renderContent = () => {
    switch (activeTab) {
      case TabType.HOME:
        return <HomePage />
      case TabType.RECORDINGS:
        return <RecordingsPage />
      case TabType.TRANSCRIPTS:
        return <TranscriptsPage />
      case TabType.SETTINGS:
        return (
          <view className="App__placeholder">
            <text className="App__placeholderText">Settings Page</text>
            <text className="App__placeholderHint">Coming soon...</text>
          </view>
        )
      default:
        return <HomePage />
    }
  }

  return (
    <view className="App">
      <view className="App__content">
        {renderContent()}
      </view>
      <TabBar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
    </view>
  )
}
