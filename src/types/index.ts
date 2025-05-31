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
  interval: number // seconds
  transition: 'fade' | 'slide' | 'none'
  order: 'random' | 'sequential'
}

export interface LayoutSettings {
  portraitLayout: 'single' | 'dual' | 'blurred-bg'
}

export interface DisplaySettings {
  showMetadata: boolean
  showWeather: boolean
}

export interface CacheSettings {
  maxSizeMB: number
}

export interface AppSettings {
  slideshow: SlideshowSettings
  layout: LayoutSettings
  display: DisplaySettings
  cache: CacheSettings
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