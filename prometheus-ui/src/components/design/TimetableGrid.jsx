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

import React, { useMemo, useCallback, useState, useRef } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import LessonBlock from './LessonBlock'

// Constants - Updated per DESIGN_Page mockup
const DAY_LABEL_WIDTH = 35      // Width of day number column
const DAY_HEIGHT = 60           // Height of each day row (+20% from 50)
const HEADER_HEIGHT = 25        // Height of time header
const NUM_DAYS = 5              // Number of day rows to show
const ROW_GAP = 8               // Gap between day rows
const ROW_BORDER_RADIUS = 30    // Pill-shaped rounded corners
const DAY_BAR_WIDTH = 'calc(75% - 150px)' // Day bar width (reduced by 75px from each side)

function TimetableGrid({ startHour = 8, endHour = 17, onSchedulePending }) {
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

  // Number of hours determines spacing
  const numHours = hours.length

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

  // Always show 5 day rows per mockup spec
  const daysToShow = useMemo(() => {
    // Always show 5 days in week view format per mockup
    return Array.from({ length: NUM_DAYS }, (_, i) => i + 1)
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: THEME.BG_DARK,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '1vh'
      }}
    >
      <div
        style={{
          width: DAY_BAR_WIDTH,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={handleGridClick}
      >
        {/* Time Header Row - hours equally spaced */}
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

          {/* Hour labels - positioned to align with lesson blocks */}
          <div style={{ flex: 1, position: 'relative' }}>
            {hours.map((hour, idx) => {
              // Position each label at the same percentage as lessons use
              const totalHours = endHour - startHour
              const leftPercent = ((hour - startHour) / totalHours) * 100
              const isLastLabel = idx === hours.length - 1

              return (
                <div
                  key={hour}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    transform: isLastLabel ? 'translateX(-100%)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.1vh',
                    color: THEME.TEXT_DIM,
                    fontFamily: THEME.FONT_MONO
                  }}
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              )
            })}
          </div>
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
                numHours={numHours}
                lessons={getLessonsForDay(day)}
                startHour={startHour}
                endHour={endHour}
                isCurrentDay={day === currentDay && viewMode === 'week'}
                isHighlighted={hasSelectedLesson || hasHoveredLesson}
                onDrop={(lessonId, newStartTime) => moveLesson(lessonId, day, newStartTime)}
                onSchedule={(lessonId, newStartTime) => scheduleLesson(lessonId, day, newStartTime)}
                onSchedulePending={(newStartTime) => onSchedulePending?.(day, newStartTime)}
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
  numHours,
  lessons,
  startHour,
  endHour,
  isCurrentDay,
  isHighlighted,
  onDrop,
  onSchedule,
  onSchedulePending,
  onLessonHover
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const contentRef = useRef(null)

  // Calculate lesson position as percentage of content area
  const getLessonLeftPercent = (lesson) => {
    if (!lesson.startTime) return 0
    const hour = parseInt(lesson.startTime.slice(0, 2))
    const min = parseInt(lesson.startTime.slice(2, 4)) || 0
    const minutesFromStart = (hour - startHour) * 60 + min
    const totalMinutes = (endHour - startHour) * 60
    return (minutesFromStart / totalMinutes) * 100
  }

  // Calculate lesson width as percentage
  const getLessonWidthPercent = (lesson) => {
    const totalMinutes = (endHour - startHour) * 60
    return (lesson.duration / totalMinutes) * 100
  }

  // Calculate time from drop position
  const getTimeFromPosition = (clientX, containerRect, grabOffsetX = 0) => {
    const adjustedClientX = clientX - grabOffsetX
    const relativeX = adjustedClientX - containerRect.left
    const containerWidth = containerRect.width
    const percentX = relativeX / containerWidth
    const totalMinutes = (endHour - startHour) * 60
    const minutesFromStart = percentX * totalMinutes
    // Snap to 5-minute increments
    const snappedMinutes = Math.round(minutesFromStart / 5) * 5
    const totalTime = startHour * 60 + snappedMinutes
    // Clamp to grid bounds
    const clampedMinutes = Math.max(startHour * 60, Math.min(endHour * 60, totalTime))
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
    const grabOffsetX = parseFloat(e.dataTransfer.getData('grabOffsetX')) || 0
    const dragType = e.dataTransfer.getData('dragType')
    const effectiveOffset = dragType === 'move' ? grabOffsetX : 0
    const newStartTime = getTimeFromPosition(e.clientX, rect, effectiveOffset)

    if (dragType === 'move') {
      onDrop(lessonId, newStartTime)
    } else if (dragType === 'pending') {
      // Handle pending lesson drop - create new lesson
      onSchedulePending?.(newStartTime)
    } else {
      onSchedule(lessonId, newStartTime)
    }
  }, [onDrop, onSchedule, onSchedulePending, startHour, endHour])

  // Vertical padding for lesson cards inside day bar
  const lessonPadding = 6

  return (
    <div
      style={{
        display: 'flex',
        height: `${DAY_HEIGHT}px`,
        borderRadius: `${ROW_BORDER_RADIUS}px`,
        overflow: 'hidden',
        border: `1px solid rgba(120, 120, 120, 0.4)`,
        background: isDragOver
          ? 'rgba(212, 115, 12, 0.15)'
          : isCurrentDay
            ? 'rgba(212, 115, 12, 0.08)'
            : 'rgba(30, 30, 30, 0.6)'
      }}
    >
      {/* Day Label */}
      <div
        style={{
          width: `${DAY_LABEL_WIDTH}px`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4vh',
          color: isHighlighted ? THEME.AMBER : THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_MONO,
          background: 'transparent',
          transition: 'color 0.2s ease'
        }}
      >
        {day}
      </div>

      {/* Content Area - DROP ZONE */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          position: 'relative'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Lesson Blocks - positioned by percentage */}
        {lessons.map(lesson => (
          <div
            key={lesson.id}
            style={{
              position: 'absolute',
              left: `${getLessonLeftPercent(lesson)}%`,
              width: `${getLessonWidthPercent(lesson)}%`,
              top: `${lessonPadding}px`,
              bottom: `${lessonPadding}px`,
              zIndex: 2
            }}
            onMouseEnter={() => onLessonHover?.(true)}
            onMouseLeave={() => onLessonHover?.(false)}
          >
            <LessonBlock
              lesson={lesson}
              dayHeight={DAY_HEIGHT}
              startHour={startHour}
              useFullWidth={true}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimetableGrid
