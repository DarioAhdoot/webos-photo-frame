# Digital Photo Frame for WebOS

Transform your LG WebOS TV into a beautiful digital photo frame. This dedicated photo frame application displays photos from your Immich server with customizable slideshows, weather information, and seamless transitions - perfect for continuous display in your home or office.

## Features

### Digital Photo Frame Features
- **Continuous display**: Designed to run indefinitely as a dedicated photo frame
- **Auto-launch slideshow**: Automatically starts displaying photos when configured
- **Immich integration**: Connect directly to your Immich photo management system
- **Intelligent caching**: 10-1000MB local cache for smooth offline operation
- **Multiple display modes**: Random or sequential photo display with customizable timing
- **Smooth transitions**: Elegant fade and slide effects between photos

### Display & Presentation
- **TV-optimized layouts**: Perfect fit for any TV size and orientation
- **Portrait photo handling**: Multiple layout options for vertical photos
- **Weather overlay**: Current weather information display
- **Photo metadata**: Optional display of photo details (title, date, location, camera)
- **Gallery mode**: WebOS Type 3 screensaver prevents TV standby during operation

### Photo Frame Experience
- **Remote control navigation**: Full TV remote support for easy setup
- **Persistent operation**: Continues running until manually stopped
- **Power-friendly**: Optimized for extended continuous display
- **Zero maintenance**: Set it up once and let it run indefinitely

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
│   ├── SlideshowView.tsx    # Slideshow display
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
4. Enable the source and start your digital photo frame

### Photo Frame Settings

- **Display interval**: 1-60 seconds between photo changes
- **Transition effects**: Fade, slide, or instant transitions
- **Photo order**: Random or sequential display mode
- **Portrait layout**: Optimized display options for vertical photos
- **Continuous operation**: Runs indefinitely until manually stopped

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
export class LocalFileSource extends PhotoSourceBase {
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

- Additional photo source providers (Dropbox, network shares, etc.)
- Enhanced layout options for different photo orientations
- Weather integration
- Performance optimizations
- UI/UX improvements

## License

MIT License - see LICENSE file for details