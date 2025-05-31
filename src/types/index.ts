export interface PhotoSource {
  id: string
  name: string
  type: 'immich' | 'google-photos' | 'local'
  config: Record<string, any>
  enabled: boolean
}

export interface ImmichConfig {
  serverUrl: string
  apiKey?: string
  username?: string
  password?: string
  albumIds: string[]
}

export interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  metadata?: PhotoMetadata
  source: string
  albumId?: string
  type?: 'IMAGE' | 'VIDEO'
  duration?: string
}

export interface PhotoMetadata {
  title?: string
  description?: string
  dateTaken?: string
  location?: string
  camera?: string
  dimensions?: {
    width: number
    height: number
  }
}

export interface CachedPhoto extends Photo {
  cachedAt: number
  size: number
  blob: Blob
}

export interface SlideshowSettings {
  interval: number // seconds for photos
  transition: 'fade' | 'slide' | 'none' | 'ken-burns'
  order: 'random' | 'sequential'
  videoEnabled: boolean // Whether to show videos in slideshow
  videoPlayback: 'full' | 'duration' // Play full video or limit to duration
  videoDuration: number // seconds - max duration when videoPlayback is 'duration'
  videoMuted: boolean // Whether videos should be muted
}

export interface LayoutSettings {
  portraitLayout: 'single' | 'dual' | 'blurred-bg'
}

export interface DisplaySettings {
  showMetadata: boolean
  showWeather: boolean
  imageResolution: 'original' | 'optimized'
}

export interface NetworkSettings {
  maxSizeMB: number
  refreshIntervalHours: number
}

export interface AppSettings {
  slideshow: SlideshowSettings
  layout: LayoutSettings
  display: DisplaySettings
  network: NetworkSettings
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  location: string
  icon: string
  timestamp: number
}

export interface AppState {
  currentMode: 'settings' | 'screensaver'
  currentPhotoIndex: number
  photos: Photo[]
  isLoading: boolean
}