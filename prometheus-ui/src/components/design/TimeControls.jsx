/**
 * TimeControls.jsx - Unified Control Row for TIMETABLE
 *
 * Phase 2-6 Redesign: Streamlined layout
 *
 * Layout: -08:00+ O O O O O O -14:00+
 *
 * - Start time adjuster: "- 08:00 +" pill-shaped button
 * - Lesson type rings (6 types, 1px stroke, no fill)
 * - End time adjuster: "- 14:00 +" pill-shaped button
 *
 * Week navigation moved to TimetableWorkspace (below Day 5 bar)
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function TimeControls({
  startHour: propStartHour,
  endHour: propEndHour,
  onStartChange,
  onEndChange,
  lessonTypes = [],
  onTypeSelect
}) {
  const { currentDay, currentWeek, setCurrentWeek, courseData } = useDesign()

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

  // Calculate max weeks based on course duration
  const maxWeeks = (() => {
    if (courseData?.weeks && courseData.weeks > 0) {
      return courseData.weeks
    }
    if (courseData?.days && courseData.days > 0) {
      return Math.ceil(courseData.days / 5)
    }
    return 1
  })()

  // Week navigation handlers
  const handlePrevWeek = useCallback(() => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1)
    }
  }, [currentWeek, setCurrentWeek])

  const handleNextWeek = useCallback(() => {
    if (currentWeek < maxWeeks) {
      setCurrentWeek(currentWeek + 1)
    }
  }, [currentWeek, maxWeeks, setCurrentWeek])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0.5vh 0',
        paddingTop: 'calc(0.5vh + 30px)', // Moved down 30px
        background: 'transparent'
      }}
    >
      {/* Container matches day bar width for proper alignment */}
      <div
        style={{
          width: 'calc(90% - 75px)', // Match TimetableGrid day bar width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* LEFT: Start Time Adjuster (aligned with left edge of day bars) */}
        <TimeAdjusterPill
          time={formatHourDisplay(startHour)}
          onDecrement={decrementStart}
          onIncrement={incrementStart}
          canDecrement={startHour > 6}
          canIncrement={startHour < 12 && startHour < endHour - 1}
        />

        {/* CENTER: Lesson Type Rings (centered above Day 1 bar) */}
        {lessonTypes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.275vw' }}>
            {lessonTypes.map(type => (
              <LessonTypeRing
                key={type.id}
                type={type}
                onClick={() => onTypeSelect?.(type.id)}
              />
            ))}
          </div>
        )}

        {/* RIGHT: End Time Adjuster (aligned with right edge of day bars) */}
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
// LESSON TYPE RING (1px stroke, no fill)
// ============================================

function LessonTypeRing({ type, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={type.name}
        style={{
          width: '3vh',
          height: '3vh',
          minWidth: '28px',
          minHeight: '28px',
          background: 'transparent',
          border: `1px solid ${type.color}`,
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: hovered ? `0 0 12px ${type.color}` : 'none',
          transform: hovered ? 'scale(1.1)' : 'scale(1)'
        }}
      />
      {/* Label tooltip on hover */}
      {hovered && (
        <span
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '0.5vh',
            fontSize: '1.1vh',
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            whiteSpace: 'nowrap',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '0.3vh 0.6vw',
            borderRadius: '0.5vh',
            zIndex: 100
          }}
        >
          {type.name}
        </span>
      )}
    </div>
  )
}

// ============================================
// WEEK NAVIGATOR - < Week X >
// ============================================

function WeekNavigator({ week, maxWeeks, onPrev, onNext }) {
  const [prevHovered, setPrevHovered] = useState(false)
  const [nextHovered, setNextHovered] = useState(false)

  const canPrev = week > 1
  const canNext = week < maxWeeks

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5vw',
        padding: '0.5vh 1vw',
        background: THEME.AMBER,
        borderRadius: '2vh',
        minWidth: '100px'
      }}
    >
      {/* Previous Arrow */}
      <button
        onClick={onPrev}
        disabled={!canPrev}
        onMouseEnter={() => setPrevHovered(true)}
        onMouseLeave={() => setPrevHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: canPrev ? (prevHovered ? THEME.BG_DARK : THEME.WHITE) : 'rgba(255,255,255,0.4)',
          fontSize: '1.4vh',
          cursor: canPrev ? 'pointer' : 'default',
          padding: '0 0.2vw',
          fontWeight: 'bold',
          transition: 'color 0.15s ease'
        }}
      >
        &lt;
      </button>

      {/* Week Label */}
      <span
        style={{
          fontSize: '1.3vh',
          color: THEME.WHITE,
          fontFamily: THEME.FONT_PRIMARY,
          fontWeight: 500,
          textAlign: 'center',
          flex: 1
        }}
      >
        Week {week}
      </span>

      {/* Next Arrow */}
      <button
        onClick={onNext}
        disabled={!canNext}
        onMouseEnter={() => setNextHovered(true)}
        onMouseLeave={() => setNextHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: canNext ? (nextHovered ? THEME.BG_DARK : THEME.WHITE) : 'rgba(255,255,255,0.4)',
          fontSize: '1.4vh',
          cursor: canNext ? 'pointer' : 'default',
          padding: '0 0.2vw',
          fontWeight: 'bold',
          transition: 'color 0.15s ease'
        }}
      >
        &gt;
      </button>
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
export { WeekNavigator }
