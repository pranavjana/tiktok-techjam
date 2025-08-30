import { useCallback } from '@lynx-js/react'
import './QuickActions.css'

interface ActionItem {
  id: string
  title: string
  icon: string
  color: string
}

const actions: ActionItem[] = [
  {
    id: 'new',
    title: 'New Recording',
    icon: '🎙️',
    color: '#ff6448'
  },
  {
    id: 'import',
    title: 'Import Audio',
    icon: '📁',
    color: '#4A90E2'
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: '📝',
    color: '#7ED321'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    icon: '📅',
    color: '#BD10E0'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: '📊',
    color: '#F5A623'
  },
  {
    id: 'insights',
    title: 'AI Insights',
    icon: '🤖',
    color: '#9013FE'
  }
]

export function QuickActions() {
  const handleActionPress = useCallback((actionId: string) => {
    console.log('Quick action pressed:', actionId)
    // Handle navigation to respective features
    switch (actionId) {
      case 'new':
        console.log('Navigate to new recording')
        break
      case 'import':
        console.log('Open file picker')
        break
      case 'templates':
        console.log('Show templates')
        break
      case 'schedule':
        console.log('Open scheduler')
        break
      case 'analytics':
        console.log('Show analytics')
        break
      case 'insights':
        console.log('Show AI insights')
        break
    }
  }, [])

  return (
    <view className="QuickActions">
      <view className="QuickActions__header">
        <text className="QuickActions__title">Quick Actions</text>
      </view>
      
      <view className="QuickActions__grid">
        {actions.map((action) => (
          <view
            key={action.id}
            className="QuickActions__item"
            bindtap={() => handleActionPress(action.id)}
          >
            <view 
              className="QuickActions__iconContainer"
              style={{ backgroundColor: `${action.color}20`, borderColor: `${action.color}40` }}
            >
              <text className="QuickActions__icon">{action.icon}</text>
            </view>
            <text className="QuickActions__label">{action.title}</text>
          </view>
        ))}
      </view>
    </view>
  )
}