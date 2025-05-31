# Immich WebOS Photo Screensaver

A WebOS screensaver application that displays photos from various sources, with initial support for Immich and designed for extensibility to other photo services.

## Features

### Core Functionality
- **Multi-source photo support**: Generic architecture supporting multiple photo providers
- **Immich integration**: Full integration with Immich photo management system
- **Intelligent caching**: Configurable local photo cache (10-1000MB) for offline viewing
- **Slideshow modes**: Random or sequential photo display with configurable intervals
- **Transition effects**: Smooth fade and slide transitions between photos

### Display Options
- **Portrait layout modes**: 
  - Single photo display
  - Dual photo side-by-side (coming soon)
  - Photo with blurred background
- **Metadata overlay**: Optional display of photo information (title, date, location, camera)
- **Weather integration**: Optional current weather display (coming soon)

### User Experience
- **Settings UI**: Comprehensive configuration interface
- **Persistent settings**: All configurations saved between sessions
- **Hot reload development**: Fast development iteration
- **WebOS optimized**: Built specifically for WebOS TV platform

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (fast development and building)
- **State Management**: Zustand with persistence middleware
- **API Layer**: TanStack Query for data fetching and caching
- **Storage**: IndexedDB for photo caching
- **Styling**: Tailwind CSS
- **Target Platform**: WebOS TV

## Project Structure

```
src/
├── components/           # React components
│   ├── SettingsView.tsx     # Main settings interface
│   ├── ScreensaverView.tsx  # Slideshow display
│   ├── PhotoDisplay.tsx     # Photo rendering with layouts
│   ├── MetadataOverlay.tsx  # Photo information display
│   ├── PhotoSourceConfig.tsx # Source configuration
│   └── SlideshowSettings.tsx # Slideshow controls
├── services/            # Business logic
│   ├── PhotoSourceBase.ts      # Generic photo source interface
│   ├── PhotoSourceManager.ts   # Multi-source coordinator
│   ├── ImmichPhotoSource.ts    # Immich-specific implementation
│   └── PhotoCacheManager.ts    # IndexedDB photo caching
├── stores/              # Zustand state management
│   ├── appStore.ts         # App state (current mode, photos)
│   └── settingsStore.ts    # Persistent user settings
├── hooks/               # React hooks
│   ├── usePhotoSources.ts  # Photo source management
│   └── usePhotoCache.ts    # Caching operations
└── types/               # TypeScript definitions
    └── index.ts            # All type definitions
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- WebOS SDK (for deployment to TV)

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3001 in your browser

3. **Build for production**:
   ```bash
   npm run build
   ```

### WebOS Development

1. **Install WebOS SDK**:
   Follow the [official WebOS TV development guide](https://webostv.developer.lge.com/develop/tools/sdk-introduction)

2. **Package for WebOS**:
   ```bash
   npm run webos:build
   ```

3. **Install on WebOS TV**:
   ```bash
   npm run webos:install
   ```

4. **Launch app**:
   ```bash
   npm run webos:launch
   ```

## Configuration

### Setting up Immich

1. Navigate to "Photo Sources" in settings
2. Click "Add Source" → "Immich Server"
3. Configure:
   - **Server URL**: Your Immich instance URL (e.g., `https://immich.yourserver.com`)
   - **API Key**: Generate in Immich Settings → API Keys
   - **Album IDs**: Specific albums to include (optional, leave empty for all albums)
4. Enable the source and start the screensaver

### Slideshow Settings

- **Interval**: 1-60 seconds between photo changes
- **Transition**: Fade, slide, or no transition effects
- **Order**: Random or sequential photo display
- **Portrait Layout**: How to display portrait-oriented photos

### Cache Management

- **Cache Size**: 10-1000MB for local photo storage
- Automatic cleanup of oldest photos when space is needed
- Manual cache clearing available in settings

## Architecture

### Photo Source System

The app uses a generic photo source architecture that makes it easy to add new providers:

```typescript
interface PhotoSourceAPI {
  testConnection(): Promise<boolean>
  getAlbums(): Promise<Album[]>
  getPhotos(albumIds?: string[]): Promise<Photo[]>
  getPhoto(photoId: string): Promise<Photo | null>
  getPhotoBlob(photoUrl: string): Promise<Blob>
}
```

Current implementations:
- **ImmichPhotoSource**: Full Immich API integration
- **GooglePhotosSource**: Planned
- **LocalFileSource**: Planned

### Caching Strategy

- **Smart caching**: Photos cached in IndexedDB with configurable size limits
- **LRU eviction**: Oldest photos removed when cache is full
- **Offline support**: Cached photos available when server is unreachable
- **Background loading**: Photos preloaded for smooth slideshow experience

### State Management

- **Persistent settings**: User configurations saved in localStorage
- **Photo state**: Current slideshow state with photo management
- **Cache state**: IndexedDB cache status and management

## Adding New Photo Sources

1. Create new source class extending `PhotoSourceBase`
2. Implement required methods for your API
3. Add source type to `PhotoSource` interface
4. Register in `PhotoSourceManager`
5. Add UI configuration in `PhotoSourceConfig`

Example:
```typescript
export class GooglePhotosSource extends PhotoSourceBase {
  async testConnection(): Promise<boolean> {
    // Implementation
  }
  
  async getAlbums(): Promise<Album[]> {
    // Implementation
  }
  
  // ... other methods
}
```

## Contributing

This project is built with extensibility in mind. Key areas for contribution:

- Additional photo source providers (Google Photos, Dropbox, etc.)
- Enhanced layout options for different photo orientations
- Weather integration
- Performance optimizations
- UI/UX improvements

## License

MIT License - see LICENSE file for details