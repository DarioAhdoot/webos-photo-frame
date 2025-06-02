# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WebOS TV application** - a photo slideshow that displays photos from Immich servers on LG WebOS smart TVs. The app automatically launches into slideshow mode and allows users to configure photo sources through TV remote navigation.

## Key Principles

- Always use reusable components
- Remember this is a WebOS app for TV, not a regular browser
- All User Interface/Interactions should be assumed to be on a TV using an LG remote control

## Key Development Commands

### WebOS Development
```bash
# Build for WebOS TV
npm run build

# Package and install on WebOS device
npm run webos:build     # Creates .ipk package
npm run webos:install   # Installs on connected WebOS TV
npm run webos:launch    # Launches app on WebOS TV

# Development server (for browser testing)
npm run dev
```

### Testing and Validation
```bash
# Type checking
npx tsc --noEmit

# Lint checking (if configured)
npm run lint
```

## Architecture Overview

### WebOS-Specific Application Structure

This is a **dual-mode WebOS application** with two primary views:
- **Slideshow Mode**: Full-screen photo display optimized for TV viewing
- **Settings Mode**: Configuration interface navigable with TV remote

**Key WebOS Considerations:**
- Uses `appinfo.json` for WebOS TV app manifest
- Optimized for 1920x1080 TV resolution
- Remote control navigation support with proper scrolling
- Network permissions for Immich API access
- Magic Remote support for pointer and 5-way navigation
- Virtual keyboard integration for text input fields

### State Management Pattern

**Zustand stores with WebOS persistence:**
- `appStore.ts`: Application mode, photo collection, navigation state
- `settingsStore.ts`: Photo source configs, slideshow settings, display preferences

**Auto-launch behavior**: App automatically enters slideshow mode when photo sources are configured, falls back to settings when none exist.

### Photo Source Architecture

**Extensible photo source system:**
- `PhotoSourceBase.ts`: Abstract interface for photo providers
- `ImmichPhotoSource.ts`: Immich server integration with authentication
- `PhotoSourceManager.ts`: Coordinates multiple photo sources
- Ready for expansion to local files, network shares, etc.

### Service Layer

**External API integrations:**
- **Immich API**: Photo and album fetching with proper CORS handling
- **Weather Services**: IP geolocation + weather data (wttr.in API)
- **Caching Layer**: In-memory photo cache with configurable size limits

### WebOS-Optimized UI Components

**TV-friendly navigation:**
- `AlbumSelectionView`: Scrollable grid layout for TV remote navigation
- `FloatingSettingsButton`: Appears on cursor movement, hides after 5 seconds
- `MetadataOverlay`: Weather and photo info with proper z-index for all photo orientations

## Key Technical Patterns

### Image Handling for WebOS
- **Blob-based loading**: Required for Immich authentication headers
- **Preloading system**: Loads 3 images ahead to prevent blank screens
- **Object-cover scaling**: Landscape photos fill screen, portrait photos maintain aspect ratio

### WebOS Performance Optimizations
- **Smart caching**: 24-hour location cache, 30-minute weather cache
- **Memory management**: Automatic cleanup of blob URLs and cached data
- **Transition system**: Fade, slide, and none transitions optimized for TV displays

### Input Handling for WebOS TV
- **Magic Remote Support**: Dual-mode support for pointer and 5-way navigation
- **Virtual Keyboard Integration**: Automatic layout adjustment when keyboard appears
- **Smart Input Types**: Contextual keyboard layouts (text, URL, password, number)
- **Focus Management**: Auto-scrolling to keep focused inputs visible

### Error Handling Strategy
- **Graceful degradation**: App continues working if external services fail
- **Connection testing**: Built-in Immich server connectivity validation
- **Fallback mechanisms**: Default weather data, mock album data

## Configuration Files

### WebOS-Specific
- `appinfo.json`: WebOS app manifest with TV-specific settings
- `vite.config.ts`: Build configuration optimized for WebOS deployment

### Photo Source Configuration
- Immich servers: URL, API key, selected albums
- Album selection: Visual grid interface for TV remote navigation
- Slideshow settings: Intervals, transitions, photo order

## Development Notes

### WebOS TV Testing
- Use browser dev tools to simulate 1920x1080 TV resolution
- Test remote navigation with keyboard (arrow keys, enter, escape)
- Verify scrolling works properly in all views

### Adding New Photo Sources
1. Extend `PhotoSourceBase` abstract class
2. Implement required methods: `getAlbums()`, `getPhotos()`, `testConnection()`
3. Add to `PhotoSourceManager.ts` switch statement
4. Update UI in `PhotoSourceConfig.tsx`

### Weather System Architecture
Uses IP-based geolocation (no WebOS location API dependency):
1. `GeolocationService.ts`: Gets user location via IP
2. `WeatherService.ts`: Fetches weather data using coordinates
3. `useWeather.ts`: React hook with caching and error handling
```