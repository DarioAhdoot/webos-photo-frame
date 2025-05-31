import { useState } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import PhotoSourceConfig from './PhotoSourceConfig'
import SlideshowSettings from './SlideshowSettings'

interface SettingsViewProps {
  onStartScreensaver: () => void
}

export default function SettingsView({ onStartScreensaver }: SettingsViewProps) {
  const { photoSources } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<'sources' | 'slideshow' | 'display'>('sources')

  const hasConfiguredSources = photoSources.some(source => source.enabled)

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Photo Screensaver Settings</h1>
          <button
            onClick={onStartScreensaver}
            disabled={!hasConfiguredSources}
            className={`px-6 py-2 rounded-lg font-medium ${
              hasConfiguredSources
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Screensaver
          </button>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav className="w-64 bg-white shadow-sm border-r">
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('sources')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'sources'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Photo Sources
              </button>
              <button
                onClick={() => setActiveTab('slideshow')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'slideshow'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Slideshow Settings
              </button>
              <button
                onClick={() => setActiveTab('display')}
                className={`w-full text-left px-4 py-2 rounded-lg ${
                  activeTab === 'display'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Display Settings
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'sources' && <PhotoSourceConfig />}
          {activeTab === 'slideshow' && <SlideshowSettings />}
          {activeTab === 'display' && <div>Display settings coming soon...</div>}
        </main>
      </div>
    </div>
  )
}