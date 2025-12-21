/**
 * TimeControls.jsx - Time Range Slider and Info Display
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 2
 *
 * Layout: Flex row, distributed across width
 *
 * Left — Time range slider:
 * - Start time label
 * - Slider with two draggable handles
 * - Fill between handles in accent colour
 * - End time label
 *
 * Centre — Course hours:
 * - "Total Course Hours: [X] hr"
 *
 * Right — Day indicator:
 * - "Day: [X]"
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function TimeControls() {
  const {
    currentDay,
    scheduledLessons,
    viewMode
  } = useDesign()

  // Time range state (in hours, 24h format)
  const [startHour, setStartHour] = useState(8)  // 0800
  const [endHour, setEndHour] = useState(17)     // 1700

  // Calculate total scheduled hours
  const totalMinutes = scheduledLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  const formatTotalTime = () => {
    if (remainingMins === 0) return `${totalHours} hr`
    return `${totalHours}h ${remainingMins}m`
  }

  // Handle start time change
  const handleStartChange = useCallback((e) => {
    const value = parseInt(e.target.value)
    // Ensure at least 2 hours visible
    if (value < endHour - 1) {
      setStartHour(value)
    }
  }, [endHour])

  // Handle end time change
  const handleEndChange = useCallback((e) => {
    const value = parseInt(e.target.value)
    // Ensure at least 2 hours visible
    if (value > startHour + 1) {
      setEndHour(value)
    }
  }, [startHour])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1vh 1.5vw',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_DARK
      }}
    >
      {/* LEFT: Time Range Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
        {/* Start Time Label */}
        <span style={timeLabelStyle}>
          {startHour.toString().padStart(2, '0')}00
        </span>

        {/* Dual Range Slider Container */}
        <div style={{ position: 'relative', width: '12vw', height: '2vh' }}>
          {/* Track background */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: 0,
              right: 0,
              height: '0.4vh',
              background: THEME.BORDER,
              borderRadius: '0.2vh'
            }}
          />

          {/* Active fill between handles */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              left: `${((startHour - 6) / 16) * 100}%`,
              right: `${100 - ((endHour - 6) / 16) * 100}%`,
              height: '0.4vh',
              background: THEME.AMBER,
              borderRadius: '0.2vh'
            }}
          />

          {/* Start slider */}
          <input
            type="range"
            min={6}
            max={22}
            value={startHour}
            onChange={handleStartChange}
            style={{
              ...sliderStyle,
              zIndex: startHour > endHour - 2 ? 5 : 3
            }}
          />

          {/* End slider */}
          <input
            type="range"
            min={6}
            max={22}
            value={endHour}
            onChange={handleEndChange}
            style={{
              ...sliderStyle,
              zIndex: 4
            }}
          />
        </div>

        {/* End Time Label */}
        <span style={timeLabelStyle}>
          {endHour.toString().padStart(2, '0')}00
        </span>
      </div>

      {/* CENTRE: Total Course Hours */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
        <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_PRIMARY }}>
          Total Course Hours:
        </span>
        <span style={{ fontSize: '1.3vh', color: THEME.GREEN_BRIGHT, fontFamily: THEME.FONT_MONO }}>
          {formatTotalTime()}
        </span>
      </div>

      {/* RIGHT: Day Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
        <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_PRIMARY }}>
          {viewMode === 'day' ? 'Day:' : viewMode === 'week' ? 'Week View' : 'Module View'}
        </span>
        {viewMode === 'day' && (
          <span style={{ fontSize: '1.3vh', color: THEME.AMBER, fontFamily: THEME.FONT_MONO }}>
            {currentDay}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// STYLES
// ============================================

const timeLabelStyle = {
  fontSize: '1.2vh',
  color: THEME.TEXT_DIM,
  fontFamily: THEME.FONT_MONO,
  minWidth: '3vw'
}

const sliderStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  WebkitAppearance: 'none',
  appearance: 'none',
  background: 'transparent',
  cursor: 'pointer',
  pointerEvents: 'auto'
}

// Add custom slider thumb styles via CSS (would need to be in a CSS file)
// For now using inline which has limitations

export default TimeControls

// Export time range for use by TimetableGrid
export { TimeControls }
