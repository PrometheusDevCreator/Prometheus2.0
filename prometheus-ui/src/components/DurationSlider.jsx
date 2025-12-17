/**
 * DurationSlider - Segmented Duration Slider Component
 *
 * Non-linear slider with three zones:
 * - Zone 1 (0-25%):   Hours 1-8
 * - Zone 2 (25-75%):  Days 2-15
 * - Zone 3 (75-100%): Weeks 4-8
 *
 * The readout shows "X Hours", "X Days", or "X Weeks" depending on position.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../constants/theme'

// Zone definitions
const ZONES = {
  HOURS: { start: 0, end: 25, min: 1, max: 8, unit: 'Hours', singular: 'Hour' },
  DAYS: { start: 25, end: 75, min: 2, max: 15, unit: 'Days', singular: 'Day' },
  WEEKS: { start: 75, end: 100, min: 4, max: 8, unit: 'Weeks', singular: 'Week' }
}

/**
 * Convert slider percentage (0-100) to value + unit
 */
function percentageToValue(percentage) {
  if (percentage <= ZONES.HOURS.end) {
    // Zone 1: Hours (0-25% → 1-8)
    const zonePercent = percentage / ZONES.HOURS.end
    const value = Math.round(ZONES.HOURS.min + zonePercent * (ZONES.HOURS.max - ZONES.HOURS.min))
    return { value: Math.max(ZONES.HOURS.min, Math.min(ZONES.HOURS.max, value)), unit: 'Hours' }
  } else if (percentage <= ZONES.DAYS.end) {
    // Zone 2: Days (25-75% → 2-15)
    const zonePercent = (percentage - ZONES.DAYS.start) / (ZONES.DAYS.end - ZONES.DAYS.start)
    const value = Math.round(ZONES.DAYS.min + zonePercent * (ZONES.DAYS.max - ZONES.DAYS.min))
    return { value: Math.max(ZONES.DAYS.min, Math.min(ZONES.DAYS.max, value)), unit: 'Days' }
  } else {
    // Zone 3: Weeks (75-100% → 4-8)
    const zonePercent = (percentage - ZONES.WEEKS.start) / (ZONES.WEEKS.end - ZONES.WEEKS.start)
    const value = Math.round(ZONES.WEEKS.min + zonePercent * (ZONES.WEEKS.max - ZONES.WEEKS.min))
    return { value: Math.max(ZONES.WEEKS.min, Math.min(ZONES.WEEKS.max, value)), unit: 'Weeks' }
  }
}

/**
 * Convert value + unit back to slider percentage
 */
function valueToPercentage(value, unit) {
  switch (unit) {
    case 'Hours':
    case 'Hour': {
      const zonePercent = (value - ZONES.HOURS.min) / (ZONES.HOURS.max - ZONES.HOURS.min)
      return zonePercent * ZONES.HOURS.end
    }
    case 'Days':
    case 'Day': {
      const zonePercent = (value - ZONES.DAYS.min) / (ZONES.DAYS.max - ZONES.DAYS.min)
      return ZONES.DAYS.start + zonePercent * (ZONES.DAYS.end - ZONES.DAYS.start)
    }
    case 'Weeks':
    case 'Week': {
      const zonePercent = (value - ZONES.WEEKS.min) / (ZONES.WEEKS.max - ZONES.WEEKS.min)
      return ZONES.WEEKS.start + zonePercent * (ZONES.WEEKS.end - ZONES.WEEKS.start)
    }
    default:
      return 0
  }
}

function DurationSlider({
  value = 1,           // Numeric value
  unit = 'Hours',      // 'Hours' | 'Days' | 'Weeks'
  onChange,            // Callback: (value, unit) => void
  width = 320,         // Slider width in pixels
  label = 'Duration',  // Label text
  showValue = true     // Show value readout below slider
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const sliderRef = useRef(null)

  // Calculate current percentage from value + unit
  const percentage = valueToPercentage(value, unit)

  // Handle slider interaction
  const handleInteraction = useCallback((clientX) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const newPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    const { value: newValue, unit: newUnit } = percentageToValue(newPercentage)
    onChange?.(newValue, newUnit)
  }, [onChange])

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleInteraction(e.clientX)
  }

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleInteraction(e.clientX)
    }
  }, [isDragging, handleInteraction])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Touch event handlers
  const handleTouchStart = (e) => {
    setIsDragging(true)
    handleInteraction(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (isDragging) {
      handleInteraction(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const isActive = isDragging || isHovered

  // Format display value (singular/plural)
  const displayUnit = value === 1
    ? (unit === 'Hours' ? 'Hour' : unit === 'Days' ? 'Day' : 'Week')
    : unit

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        width: typeof width === 'number' ? `${width}px` : width
      }}
    >
      {/* Slider track */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Track background with zone indicators */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            background: THEME.BORDER_GREY,
            borderRadius: '2px'
          }}
        />

        {/* Zone divider markers */}
        <div
          style={{
            position: 'absolute',
            left: '25%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '1px'
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '75%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '1px'
          }}
        />

        {/* Track fill */}
        <div
          style={{
            position: 'absolute',
            width: `${percentage}%`,
            height: '4px',
            background: `linear-gradient(to right, ${THEME.AMBER_DARK}, ${THEME.AMBER})`,
            borderRadius: '2px',
            transition: isDragging ? 'none' : 'width 0.2s ease'
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: THEME.AMBER,
            border: `2px solid ${THEME.BG_DARK}`,
            boxShadow: isActive
              ? `0 0 12px rgba(212, 115, 12, 0.6)`
              : `0 0 6px rgba(212, 115, 12, 0.3)`,
            transition: isDragging ? 'none' : 'all 0.2s ease',
            zIndex: 2
          }}
        />
      </div>

      {/* Value display - burnt orange readout */}
      {showValue && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '-1px'
          }}
        >
          <span style={{
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            fontSize: '15px'
          }}>
            {value} {displayUnit}
          </span>
        </div>
      )}

    </div>
  )
}

export default DurationSlider
