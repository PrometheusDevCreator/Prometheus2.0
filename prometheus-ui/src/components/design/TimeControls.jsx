/**
 * TimeControls.jsx - Pill-shaped Time Adjusters and Day Indicator
 *
 * REVISED IMPLEMENTATION - Per DESIGN_Page Mockup
 *
 * Layout: Left | Center | Right
 *
 * Left — Start time adjuster:
 * - "- 08:00 +" pill-shaped button
 * - Range: 06:00-12:00
 * - Increments: 30 minutes
 *
 * Centre — Day indicator:
 * - "Day: 1" (number in orange)
 *
 * Right — End time adjuster:
 * - "- 14:00 +" pill-shaped button
 * - Range: 12:00-20:00
 * - Increments: 30 minutes
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function TimeControls({
  startHour: propStartHour,
  endHour: propEndHour,
  onStartChange,
  onEndChange
}) {
  const { currentDay } = useDesign()

  // Use props if provided, otherwise use local state
  const [localStartHour, setLocalStartHour] = useState(8)
  const [localEndHour, setLocalEndHour] = useState(14)

  const startHour = propStartHour ?? localStartHour
  const endHour = propEndHour ?? localEndHour

  // Format time for display (hour to "HH:00")
  const formatTime = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  // Handle start time decrement (30-min intervals, min 6)
  const decrementStart = useCallback(() => {
    const newHour = startHour - 0.5
    if (newHour >= 6) {
      if (onStartChange) onStartChange(newHour)
      else setLocalStartHour(newHour)
    }
  }, [startHour, onStartChange])

  // Handle start time increment (30-min intervals, max 12, must be < endHour)
  const incrementStart = useCallback(() => {
    const newHour = startHour + 0.5
    if (newHour <= 12 && newHour < endHour - 1) {
      if (onStartChange) onStartChange(newHour)
      else setLocalStartHour(newHour)
    }
  }, [startHour, endHour, onStartChange])

  // Handle end time decrement (30-min intervals, min 12, must be > startHour)
  const decrementEnd = useCallback(() => {
    const newHour = endHour - 0.5
    if (newHour >= 12 && newHour > startHour + 1) {
      if (onEndChange) onEndChange(newHour)
      else setLocalEndHour(newHour)
    }
  }, [endHour, startHour, onEndChange])

  // Handle end time increment (30-min intervals, max 20)
  const incrementEnd = useCallback(() => {
    const newHour = endHour + 0.5
    if (newHour <= 20) {
      if (onEndChange) onEndChange(newHour)
      else setLocalEndHour(newHour)
    }
  }, [endHour, onEndChange])

  // Format hour to display (handles half hours)
  const formatHourDisplay = (hour) => {
    const h = Math.floor(hour)
    const m = (hour % 1) * 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0.8vh 0',
        marginTop: '15px',
        background: 'transparent'
      }}
    >
      {/* Container aligned with day bars (reduced width) */}
      <div
        style={{
          width: 'calc(75% - 150px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* LEFT: Start Time Adjuster - aligned with left edge of timetable content */}
        <div style={{ marginLeft: '-5px' }}>
          <TimeAdjusterPill
            time={formatHourDisplay(startHour)}
            onDecrement={decrementStart}
            onIncrement={incrementStart}
            canDecrement={startHour > 6}
            canIncrement={startHour < 12 && startHour < endHour - 1}
          />
        </div>

        {/* CENTER: Day Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4vw' }}>
          <span
            style={{
              fontSize: '1.5vh',
              color: THEME.TEXT_PRIMARY,
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            Day:
          </span>
          <span
            style={{
              fontSize: '1.5vh',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO,
              fontWeight: 500
            }}
          >
            {currentDay}
          </span>
        </div>

        {/* RIGHT: End Time Adjuster - aligned with right edge of timetable */}
        <TimeAdjusterPill
          time={formatHourDisplay(endHour)}
          onDecrement={decrementEnd}
          onIncrement={incrementEnd}
          canDecrement={endHour > 12 && endHour > startHour + 1}
          canIncrement={endHour < 20}
        />
      </div>
    </div>
  )
}

// ============================================
// TIME ADJUSTER PILL COMPONENT
// ============================================

function TimeAdjusterPill({ time, onDecrement, onIncrement, canDecrement, canIncrement }) {
  const [decrementHovered, setDecrementHovered] = useState(false)
  const [incrementHovered, setIncrementHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.3vw',
        padding: '0.5vh 0.5vw',
        border: `1px solid rgba(255, 255, 255, 0.3)`,
        borderRadius: '2vh',
        background: 'transparent',
        minWidth: '80px'
      }}
    >
      {/* Decrement Button */}
      <button
        onClick={onDecrement}
        disabled={!canDecrement}
        onMouseEnter={() => setDecrementHovered(true)}
        onMouseLeave={() => setDecrementHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: !canDecrement
            ? THEME.TEXT_DIM
            : decrementHovered
              ? THEME.WHITE
              : THEME.AMBER,
          fontSize: '1.4vh',
          cursor: canDecrement ? 'pointer' : 'default',
          padding: '0 0.2vw',
          opacity: canDecrement ? 1 : 0.4,
          transition: 'color 0.15s ease'
        }}
      >
        -
      </button>

      {/* Time Display */}
      <span
        style={{
          fontSize: '1.3vh',
          color: THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_MONO,
          minWidth: '2.5vw',
          textAlign: 'center'
        }}
      >
        {time}
      </span>

      {/* Increment Button */}
      <button
        onClick={onIncrement}
        disabled={!canIncrement}
        onMouseEnter={() => setIncrementHovered(true)}
        onMouseLeave={() => setIncrementHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: !canIncrement
            ? THEME.TEXT_DIM
            : incrementHovered
              ? THEME.WHITE
              : THEME.AMBER,
          fontSize: '1.4vh',
          cursor: canIncrement ? 'pointer' : 'default',
          padding: '0 0.2vw',
          opacity: canIncrement ? 1 : 0.4,
          transition: 'color 0.15s ease'
        }}
      >
        +
      </button>
    </div>
  )
}

export default TimeControls
