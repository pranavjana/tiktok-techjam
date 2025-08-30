import { useCallback } from '@lynx-js/react'
import { TabType } from '../../types/index.js'
import homeIcon from '../../assets/icons/home.svg'
import micIcon from '../../assets/icons/mic.svg'
import descriptionIcon from '../../assets/icons/description.svg'
import settingsIcon from '../../assets/icons/settings.svg'
import homeActiveIcon from '../../assets/icons/home-active.svg'
import micActiveIcon from '../../assets/icons/mic-active.svg'
import descriptionActiveIcon from '../../assets/icons/description-active.svg'
import settingsActiveIcon from '../../assets/icons/settings-active.svg'
import './TabBar.css'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  badges?: {
    [key in TabType]?: number
  }
}

interface TabItem {
  id: TabType
  title: string
  icon: string
  activeIcon: string
}

const tabs: TabItem[] = [
  {
    id: TabType.HOME,
    title: 'Home',
    icon: homeIcon,
    activeIcon: homeActiveIcon
  },
  {
    id: TabType.RECORDINGS,
    title: 'Recordings',
    icon: micIcon,
    activeIcon: micActiveIcon
  },
  {
    id: TabType.TRANSCRIPTS,
    title: 'Transcripts',
    icon: descriptionIcon,
    activeIcon: descriptionActiveIcon
  },
  {
    id: TabType.SETTINGS,
    title: 'Settings',
    icon: settingsIcon,
    activeIcon: settingsActiveIcon
  }
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const handleTabPress = useCallback((tab: TabType) => {
    if (tab !== activeTab) {
      onTabChange(tab)
      // Haptic feedback
      console.log('Tab changed to:', tab)
    }
  }, [activeTab, onTabChange])


  return (
    <view className="TabBar">
      {tabs.map((tab) => (
        <view
          key={tab.id}
          className={`TabBar__item ${activeTab === tab.id ? 'TabBar__item--active' : ''}`}
          bindtap={() => handleTabPress(tab.id)}
        >
          <text className={`TabBar__label ${activeTab === tab.id ? 'TabBar__label--active' : ''}`}>
            {tab.title}
          </text>
          {activeTab === tab.id && <view className="TabBar__indicator" />}
        </view>
      ))}
    </view>
  )
}