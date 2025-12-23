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

import { useMemo, useCallback, useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import LessonBlock from './LessonBlock'

// Constants - Updated per DESIGN_Page mockup
const DAY_LABEL_WIDTH = 50      // Width of DAY column
const HOUR_WIDTH = 100          // Width of each hour column
const DAY_HEIGHT = 60           // Height of each day row
const HEADER_HEIGHT = 30        // Height of time header
const NUM_DAYS = 5              // Number of day rows to show
const ROW_GAP = 8               // Gap between day rows
const PIXELS_PER_MINUTE = HOUR_WIDTH / 60  // For time calculations

function TimetableGrid({ startHour = 8, endHour = 17 }) {
  const {
    scheduledLessons,
    currentDay,
    currentWeek,
    viewMode,
    clearSelection,
    moveLesson,
    scheduleLesson,
    selection,
    selectedLesson
  } = useDesign()

  // Track which day has a hovered lesson
  const [hoveredLessonDay, setHoveredLessonDay] = useState(null)

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
      // Single day view
      return [currentDay]
    } else if (viewMode === 'week') {
      // Show 5 days (one week)
      return Array.from({ length: NUM_DAYS }, (_, i) => i + 1)
    } else {
      // Module view - show all weeks in module
      // For now, show 5 days per week (could expand based on course data)
      return Array.from({ length: NUM_DAYS }, (_, i) => i + 1)
    }
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
            flexShrink: 0,
            alignItems: 'center'
          }}
        >
          {/* DAY column header */}
          <div
            style={{
              width: `${DAY_LABEL_WIDTH}px`,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1vh',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase',
              letterSpacing: '0.1vw'
            }}
          >
            DAY
          </div>

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
                fontFamily: THEME.FONT_MONO
              }}
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${ROW_GAP}px` }}>
          {daysToShow.map(day => {
            // Check if this day has the selected lesson
            const hasSelectedLesson = selectedLesson && selectedLesson.day === day && selectedLesson.week === currentWeek
            // Check if this day has a hovered lesson
            const hasHoveredLesson = hoveredLessonDay === day

            return (
              <DayRow
                key={day}
                day={day}
                hours={hours}
                lessons={getLessonsForDay(day)}
                pixelsPerMinute={pixelsPerMinute}
                startHour={startHour}
                endHour={endHour}
                isCurrentDay={day === currentDay && viewMode === 'week'}
                isHighlighted={hasSelectedLesson || hasHoveredLesson}
                onDrop={(lessonId, newStartTime) => moveLesson(lessonId, day, newStartTime)}
                onSchedule={(lessonId, newStartTime) => scheduleLesson(lessonId, day, newStartTime)}
                onLessonHover={(isHovered) => setHoveredLessonDay(isHovered ? day : null)}
              />
            )
          })}
        </div>

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
  endHour,
  isCurrentDay,
  isHighlighted,
  onDrop,
  onSchedule,
  onLessonHover
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  // Get block left position
  const getBlockLeft = (lesson) => {
    if (!lesson.startTime) return 0
    const hour = parseInt(lesson.startTime.slice(0, 2))
    const min = parseInt(lesson.startTime.slice(2, 4)) || 0
    const minutesFromStart = (hour - startHour) * 60 + min
    return minutesFromStart * pixelsPerMinute
  }

  // Calculate time from drop position (with optional grab offset)
  const getTimeFromPosition = (clientX, containerRect, grabOffsetX = 0) => {
    // Adjust clientX by the grab offset to get the left edge position
    const adjustedClientX = clientX - grabOffsetX
    const relativeX = adjustedClientX - containerRect.left
    const minutesFromStart = relativeX / pixelsPerMinute
    // Snap to 5-minute increments
    const snappedMinutes = Math.round(minutesFromStart / 5) * 5
    const totalMinutes = startHour * 60 + snappedMinutes
    // Clamp to grid bounds
    const maxMinutes = endHour * 60
    const clampedMinutes = Math.max(startHour * 60, Math.min(maxMinutes, totalMinutes))
    const hour = Math.floor(clampedMinutes / 60)
    const min = clampedMinutes % 60
    return `${hour.toString().padStart(2, '0')}${min.toString().padStart(2, '0')}`
  }

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    // Only set false if we're leaving the container, not entering a child
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const lessonId = e.dataTransfer.getData('lessonId')
    if (!lessonId) return

    const contentArea = e.currentTarget
    const rect = contentArea.getBoundingClientRect()

    // Get grab offset for accurate positioning (move operations store this)
    const grabOffsetX = parseFloat(e.dataTransfer.getData('grabOffsetX')) || 0

    // Check if this is from library (schedule) or from grid (move)
    const dragType = e.dataTransfer.getData('dragType')

    // Only use grab offset for move operations (not schedule from library)
    const effectiveOffset = dragType === 'move' ? grabOffsetX : 0
    const newStartTime = getTimeFromPosition(e.clientX, rect, effectiveOffset)

    if (dragType === 'move') {
      onDrop(lessonId, newStartTime)
    } else {
      // From library - schedule it
      onSchedule(lessonId, newStartTime)
    }
  }, [onDrop, onSchedule, pixelsPerMinute, startHour, endHour])

  return (
    <div
      style={{
        display: 'flex',
        height: `${DAY_HEIGHT}px`,
        borderRadius: '4px',
        overflow: 'hidden',
        border: `1px solid ${THEME.BORDER}`,
        background: isDragOver
          ? 'rgba(212, 115, 12, 0.15)'
          : isCurrentDay
            ? 'rgba(212, 115, 12, 0.05)'
            : THEME.BG_PANEL
      }}
    >
      {/* Day Label - Just the number */}
      <div
        style={{
          width: `${DAY_LABEL_WIDTH}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5vh',
          color: isHighlighted ? THEME.AMBER : THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_MONO,
          borderRight: `1px solid ${THEME.BORDER}`,
          background: 'transparent',
          transition: 'color 0.2s ease'
        }}
      >
        {day}
      </div>

      {/* Content Area (with hour grid lines) - DROP ZONE */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          minWidth: `${hours.length * HOUR_WIDTH}px`
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
            onMouseEnter={() => onLessonHover?.(true)}
            onMouseLeave={() => onLessonHover?.(false)}
          >
            <LessonBlock
              lesson={lesson}
              pixelsPerMinute={pixelsPerMinute}
              dayHeight={DAY_HEIGHT}
              startHour={startHour}
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
              fontSize: '1.2vh',
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
