import { useState, useEffect } from 'react'

export interface CurrentTime {
  time: string
  date: string
  timezone: string
}

export function useCurrentTime(enabled: boolean = true): CurrentTime {
  const [currentTime, setCurrentTime] = useState<CurrentTime>(() => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      date: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      timezone: 'Loading...',
    }
  })

  const [timezone, setTimezone] = useState<string>('Loading...')

  // Fetch timezone once on mount
  useEffect(() => {
    if (!enabled) return

    const fetchTimezone = async () => {
      const tz = await getTimezone()
      setTimezone(tz)
    }

    fetchTimezone()
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const updateTime = () => {
      const now = new Date()
      setCurrentTime({
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        date: now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        timezone: timezone,
      })
    }

    // Update immediately
    updateTime()

    // Update every second
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [enabled, timezone])

  return currentTime
}

async function getTimezone(): Promise<string> {
  try {
    // Try WebOS API first
    if (typeof window !== 'undefined' && (window as any).webOS) {
      const webOS = (window as any).webOS
      
      // Check if webOS service API is available
      if (webOS.service) {
        try {
          // Try primary WebOS settings service
          const webOSTimezone = await new Promise<string | null>((resolve) => {
            const timeoutId = setTimeout(() => resolve(null), 2000) // 2 second timeout
            
            webOS.service.request('luna://com.webos.settingsservice', {
              method: 'getSystemSettings',
              parameters: {
                category: 'time',
                keys: ['timeZone']
              },
              onSuccess: (response: any) => {
                clearTimeout(timeoutId)
                if (response.settings && response.settings.timeZone) {
                  console.log('WebOS timezone from settings:', response.settings.timeZone)
                  resolve(response.settings.timeZone)
                } else {
                  resolve(null)
                }
              },
              onFailure: (error: any) => {
                clearTimeout(timeoutId)
                console.warn('WebOS timezone service failed:', error)
                resolve(null)
              }
            })
          })
          
          if (webOSTimezone) {
            return webOSTimezone
          }
          
          // Try alternative WebOS system property service
          const webOSSystemProp = await new Promise<string | null>((resolve) => {
            const timeoutId = setTimeout(() => resolve(null), 2000) // 2 second timeout
            
            webOS.service.request('luna://com.webos.service.tv.systemproperty', {
              method: 'getSystemProperty',
              parameters: {
                key: 'system.timezone'
              },
              onSuccess: (response: any) => {
                clearTimeout(timeoutId)
                if (response.value) {
                  console.log('WebOS system timezone:', response.value)
                  resolve(response.value)
                } else {
                  resolve(null)
                }
              },
              onFailure: (error: any) => {
                clearTimeout(timeoutId)
                console.warn('WebOS system property service failed:', error)
                resolve(null)
              }
            })
          })
          
          if (webOSSystemProp) {
            return webOSSystemProp
          }
          
          // Try third alternative - application manager
          const webOSAppManager = await new Promise<string | null>((resolve) => {
            const timeoutId = setTimeout(() => resolve(null), 2000) // 2 second timeout
            
            webOS.service.request('luna://com.webos.applicationManager', {
              method: 'getSystemInfo',
              parameters: {},
              onSuccess: (response: any) => {
                clearTimeout(timeoutId)
                if (response.timezone) {
                  console.log('WebOS app manager timezone:', response.timezone)
                  resolve(response.timezone)
                } else {
                  resolve(null)
                }
              },
              onFailure: (error: any) => {
                clearTimeout(timeoutId)
                console.warn('WebOS app manager service failed:', error)
                resolve(null)
              }
            })
          })
          
          if (webOSAppManager) {
            return webOSAppManager
          }
          
        } catch (webOSError) {
          console.warn('WebOS API error:', webOSError)
        }
      }
      
      // Try webOS platform info if available (synchronous fallback)
      if (webOS.platformInfo && webOS.platformInfo.timezone) {
        console.log('WebOS platform timezone:', webOS.platformInfo.timezone)
        return webOS.platformInfo.timezone
      }
    }

    // Use browser's timezone detection as fallback
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    console.log('Browser timezone fallback:', browserTimezone)
    return browserTimezone
  } catch (error) {
    console.warn('Failed to get timezone:', error)
    return 'Local Time'
  }
}