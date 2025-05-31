export interface LocationData {
  latitude: number
  longitude: number
  city: string
  region: string
  country: string
  timezone: string
}

export class GeolocationService {
  private static cachedLocation: LocationData | null = null
  private static cacheExpiry: number = 0
  private static readonly CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 hours

  /**
   * Get user's approximate location using IP geolocation
   */
  static async getLocation(): Promise<LocationData> {
    // Return cached location if still valid
    if (this.cachedLocation && Date.now() < this.cacheExpiry) {
      return this.cachedLocation
    }

    try {
      // Using ipapi.co as it's free and doesn't require API key
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Check if API returned an error
      if (data.error) {
        throw new Error(`Geolocation API error: ${data.reason || 'Unknown error'}`)
      }

      const location: LocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || 'Unknown',
        region: data.region || data.region_code || '',
        country: data.country_name || data.country || 'Unknown',
        timezone: data.timezone || 'UTC'
      }

      // Cache the result
      this.cachedLocation = location
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      console.log('Geolocation obtained:', location)
      return location

    } catch (error) {
      console.error('Failed to get geolocation:', error)
      
      // Fallback to a default location (can be configurable)
      const fallbackLocation: LocationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        region: 'NY',
        country: 'United States',
        timezone: 'America/New_York'
      }

      console.log('Using fallback location:', fallbackLocation)
      return fallbackLocation
    }
  }

  /**
   * Clear cached location (useful for testing or manual refresh)
   */
  static clearCache(): void {
    this.cachedLocation = null
    this.cacheExpiry = 0
  }

  /**
   * Get cached location without making network request
   */
  static getCachedLocation(): LocationData | null {
    if (this.cachedLocation && Date.now() < this.cacheExpiry) {
      return this.cachedLocation
    }
    return null
  }
}