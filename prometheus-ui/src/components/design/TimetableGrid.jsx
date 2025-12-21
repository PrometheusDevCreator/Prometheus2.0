/**
 * TimetableGrid.jsx - Timetable Grid with Day Rows
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 2
 *
 * Structure:
 * - Time header row (shows hour labels: 0800, 0900, 1000, etc.)
 * - Day rows stacked below
 *
 * Time header:
 * - Day label spacer (aligns with day labels below)
 * - Time columns of equal width
 *
 * Day rows:
 * - Equal height distribution
 * - Day label cell (left): "Day 1", "Day 2", etc.
 * - Content area (right): Contains lesson blocks
 */

import { useMemo, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import LessonBlock from './LessonBlock'

// Constants
const DAY_LABEL_WIDTH = 60      // Width of day label column
const HOUR_WIDTH = 80           // Width of each hour column
const DAY_HEIGHT = 60           // Height of each day row
const HEADER_HEIGHT = 30        // Height of time header
const NUM_DAYS = 5              // Number of day rows to show

function TimetableGrid({ startHour = 8, endHour = 17 }) {
  const {
    scheduledLessons,
    currentDay,
    currentWeek,
    viewMode,
    clearSelection
  } = useDesign()

  // Generate hour columns
  const hours = useMemo(() => {
    const result = []
    for (let h = startHour; h <= endHour; h++) {
      result.push(h)
    }
    return result
  }, [startHour, endHour])

  // Calculate grid dimensions
  const gridWidth = hours.length * HOUR_WIDTH
  const totalWidth = DAY_LABEL_WIDTH + gridWidth

  // Calculate pixels per minute
  const pixelsPerMinute = HOUR_WIDTH / 60

  // Get lessons for a specific day (filtered by current week)
  const getLessonsForDay = useCallback((day) => {
    return scheduledLessons.filter(
      lesson => lesson.day === day && lesson.week === currentWeek
    )
  }, [scheduledLessons, currentWeek])

  // Convert lesson start time to pixel offset
  const getBlockLeft = (lesson) => {
    if (!lesson.startTime) return 0
    const hour = parseInt(lesson.startTime.slice(0, 2))
    const min = parseInt(lesson.startTime.slice(2, 4)) || 0
    const minutesFromStart = (hour - startHour) * 60 + min
    return minutesFromStart * pixelsPerMinute
  }

  // Handle click on empty area - clear selection
  const handleGridClick = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  // Determine which days to show based on view mode
  const daysToShow = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDay]
    }
    return Array.from({ length: NUM_DAYS }, (_, i) => i + 1)
  }, [viewMode, currentDay])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: THEME.BG_DARK
      }}
    >
      <div
        style={{
          minWidth: `${totalWidth}px`,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={handleGridClick}
      >
        {/* Time Header Row */}
        <div
          style={{
            display: 'flex',
            height: `${HEADER_HEIGHT}px`,
            borderBottom: `1px solid ${THEME.BORDER}`,
            flexShrink: 0
          }}
        >
          {/* Day label spacer */}
          <div
            style={{
              width: `${DAY_LABEL_WIDTH}px`,
              flexShrink: 0,
              borderRight: `1px solid ${THEME.BORDER}`
            }}
          />

          {/* Hour columns */}
          {hours.map((hour, idx) => (
            <div
              key={hour}
              style={{
                width: `${HOUR_WIDTH}px`,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1vh',
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_MONO,
                borderRight: idx < hours.length - 1 ? `1px solid ${THEME.BORDER}` : 'none',
                background: hour === Math.floor(new Date().getHours())
                  ? 'rgba(212, 115, 12, 0.1)'
                  : 'transparent'
              }}
            >
              {hour.toString().padStart(2, '0')}00
            </div>
          ))}
        </div>

        {/* Day Rows */}
        {daysToShow.map(day => (
          <DayRow
            key={day}
            day={day}
            hours={hours}
            lessons={getLessonsForDay(day)}
            pixelsPerMinute={pixelsPerMinute}
            startHour={startHour}
            isCurrentDay={day === currentDay && viewMode === 'week'}
          />
        ))}

        {/* Empty state if no days */}
        {daysToShow.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: `${DAY_HEIGHT * 3}px`,
              color: THEME.TEXT_DIM,
              fontSize: '1.2vh'
            }}
          >
            No days to display
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DAY ROW COMPONENT
// ============================================

function DayRow({
  day,
  hours,
  lessons,
  pixelsPerMinute,
  startHour,
  isCurrentDay
}) {
  // Get block left position
  const getBlockLeft = (lesson) => {
    if (!lesson.startTime) return 0
    const hour = parseInt(lesson.startTime.slice(0, 2))
    const min = parseInt(lesson.startTime.slice(2, 4)) || 0
    const minutesFromStart = (hour - startHour) * 60 + min
    return minutesFromStart * pixelsPerMinute
  }

  return (
    <div
      style={{
        display: 'flex',
        height: `${DAY_HEIGHT}px`,
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: isCurrentDay ? 'rgba(212, 115, 12, 0.05)' : 'transparent'
      }}
    >
      {/* Day Label */}
      <div
        style={{
          width: `${DAY_LABEL_WIDTH}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '0.8vw',
          fontSize: '1.1vh',
          color: THEME.WHITE,
          fontFamily: THEME.FONT_PRIMARY,
          borderRight: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL
        }}
      >
        Day {day}
      </div>

      {/* Content Area (with hour grid lines) */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          minWidth: `${hours.length * HOUR_WIDTH}px`
        }}
      >
        {/* Hour grid lines */}
        {hours.map((hour, idx) => (
          <div
            key={hour}
            style={{
              position: 'absolute',
              left: `${idx * HOUR_WIDTH}px`,
              top: 0,
              bottom: 0,
              width: `${HOUR_WIDTH}px`,
              borderRight: idx < hours.length - 1 ? `1px solid ${THEME.BORDER}` : 'none',
              opacity: 0.5
            }}
          />
        ))}

        {/* Lesson Blocks */}
        {lessons.map(lesson => (
          <div
            key={lesson.id}
            style={{
              position: 'absolute',
              left: `${getBlockLeft(lesson)}px`,
              top: '5px',
              zIndex: 2
            }}
          >
            <LessonBlock
              lesson={lesson}
              pixelsPerMinute={pixelsPerMinute}
              dayHeight={DAY_HEIGHT}
            />
          </div>
        ))}

        {/* Empty day indicator */}
        {lessons.length === 0 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '1vh',
              color: THEME.TEXT_DIM,
              opacity: 0.5,
              fontStyle: 'italic'
            }}
          >
            Drop lessons here
          </div>
        )}
      </div>
    </div>
  )
}

export default TimetableGrid
