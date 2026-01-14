/**
 * TimetableWorkspace.jsx - Complete Timetable Tab Content
 *
 * REVISED IMPLEMENTATION - Per DESIGN_Page Mockup
 *
 * Structure:
 * - TimeControls: Pill-shaped time adjusters + Day indicator
 * - TimetableGrid: Day rows with lesson blocks (with time ribbon)
 * - ControlZone: Lesson Type Palette + New Lesson Card + Navigation
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import TimeControls, { WeekNavigator } from './TimeControls'
import TimetableGrid from './TimetableGrid'
import UnallocatedLessonsPanel from './UnallocatedLessonsPanel'

function TimetableWorkspace() {
  const {
    LESSON_TYPES,
    createLesson,
    scheduledLessons,
    unscheduledLessons,
    select,
    scheduleLesson,
    unscheduleLesson,
    currentWeek,
    setCurrentWeek,
    courseData
  } = useDesign()

  // Time range state (shared with TimeControls and TimetableGrid)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(14)

  // Pending lesson state - appears above PKE when type is clicked
  const [pendingLesson, setPendingLesson] = useState(null)

  // Helper: Convert minutes from midnight to "HHMM" string format
  const minutesToTimeString = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`
  }

  // Helper: Parse "HHMM" string to minutes from midnight
  const timeStringToMinutes = (timeStr) => {
    if (!timeStr) return 0
    const hour = parseInt(timeStr.slice(0, 2)) || 0
    const min = parseInt(timeStr.slice(2, 4)) || 0
    return hour * 60 + min
  }

  // Handle clicking a lesson type - AUTO-SNAP to grid (Phase 2-6)
  const handleTypeClick = useCallback((typeId) => {
    const type = LESSON_TYPES.find(t => t.id === typeId) || LESSON_TYPES[0]
    const isBreak = typeId === 'break'
    const defaultDuration = isBreak ? 30 : 60

    // Find where to place the new lesson (auto-snap logic)
    let targetDay = 1
    let targetStartMinutes = startHour * 60 // Convert to minutes from midnight

    // Get lessons for each day and find first available slot
    for (let day = 1; day <= 5; day++) {
      const dayLessons = scheduledLessons
        .filter(l => l.day === day && l.week === 1)
        .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime))

      // Find end time of last lesson on this day
      let dayEndMinutes = startHour * 60 // Start of day in minutes
      dayLessons.forEach(lesson => {
        const lessonStartMins = timeStringToMinutes(lesson.startTime)
        const lessonEnd = lessonStartMins + lesson.duration
        if (lessonEnd > dayEndMinutes) {
          dayEndMinutes = lessonEnd
        }
      })

      // Calculate remaining time on this day
      const endOfDayMinutes = endHour * 60
      const remainingTime = endOfDayMinutes - dayEndMinutes

      if (remainingTime >= defaultDuration) {
        // Enough room for full lesson
        targetDay = day
        targetStartMinutes = dayEndMinutes
        break
      } else if (remainingTime > 0 && remainingTime < defaultDuration) {
        // Partial room - adjust duration to fill remaining day
        targetDay = day
        targetStartMinutes = dayEndMinutes
        break
      }
      // Day is full, try next day
    }

    // Calculate actual duration (may be reduced to fit day)
    const endOfDayMinutes = endHour * 60
    const availableTime = endOfDayMinutes - targetStartMinutes
    const actualDuration = Math.min(defaultDuration, availableTime)

    if (actualDuration > 0) {
      // Create and schedule the lesson directly with "HHMM" format
      createLesson({
        title: isBreak ? 'BREAK' : 'New Lesson',
        type: typeId,
        duration: actualDuration,
        startTime: minutesToTimeString(targetStartMinutes),
        day: targetDay,
        week: 1,
        scheduled: true
      })
    } else {
      // No room - create as pending (fallback to drag behavior)
      setPendingLesson({
        id: `pending-${Date.now()}`,
        title: isBreak ? 'BREAK' : 'New Lesson',
        type: typeId,
        duration: defaultDuration,
        color: type.color
      })
    }
  }, [LESSON_TYPES, scheduledLessons, startHour, endHour, createLesson])

  // Handle scheduling the pending lesson (drag to grid or confirm)
  const handleSchedulePending = useCallback((day, startTime) => {
    if (!pendingLesson) return

    createLesson({
      title: pendingLesson.title,
      type: pendingLesson.type,
      duration: pendingLesson.duration,
      startTime,
      day,
      week: 1,
      scheduled: true
    })
    setPendingLesson(null)
  }, [pendingLesson, createLesson])

  // Handle cancelling pending lesson
  const handleCancelPending = useCallback(() => {
    setPendingLesson(null)
  }, [])

  // Handle drag start for pending lesson
  const handlePendingDragStart = useCallback((e) => {
    if (!pendingLesson) return
    e.dataTransfer.setData('lessonId', pendingLesson.id)
    e.dataTransfer.setData('dragType', 'pending')
    e.dataTransfer.setData('pendingType', pendingLesson.type)
    e.dataTransfer.setData('pendingDuration', pendingLesson.duration.toString())
    e.dataTransfer.effectAllowed = 'move'
  }, [pendingLesson])

  // Get lesson type info for preview
  const currentType = pendingLesson
    ? LESSON_TYPES.find(t => t.id === pendingLesson.type) || LESSON_TYPES[0]
    : LESSON_TYPES[0]

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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: THEME.BG_DARK,
        position: 'relative'
      }}
    >
      {/* Time Controls Row - includes lesson type circles and week navigation */}
      <TimeControls
        startHour={startHour}
        endHour={endHour}
        onStartChange={setStartHour}
        onEndChange={setEndHour}
        lessonTypes={LESSON_TYPES}
        onTypeSelect={handleTypeClick}
      />

      {/* Timetable Grid */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimetableGrid
          startHour={Math.floor(startHour)}
          endHour={Math.floor(endHour)}
          onSchedulePending={handleSchedulePending}
        />
      </div>

      {/* Week Navigator - positioned below Day 5 bar, same spacing as between day bars */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1vh 0',
          marginTop: '-0.5vh' // Adjust to match day bar spacing
        }}
      >
        <WeekNavigator
          week={currentWeek}
          maxWeeks={maxWeeks}
          onPrev={handlePrevWeek}
          onNext={handleNextWeek}
        />
      </div>

      {/* Pending Lesson Card - appears centered above PKE */}
      {pendingLesson && (
        <div
          style={{
            position: 'absolute',
            bottom: '14vh',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}
        >
          <PendingLessonCard
            lesson={pendingLesson}
            type={currentType}
            onDragStart={handlePendingDragStart}
            onCancel={handleCancelPending}
          />
        </div>
      )}

      {/* Note: Lesson Type circles moved to TimeControls row */}

      {/* Unallocated Lessons Panel - positioned at bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '1vw',
          zIndex: 50
        }}
      >
        <UnallocatedLessonsPanel
          lessons={unscheduledLessons}
          lessonTypes={LESSON_TYPES}
          onUnscheduleLesson={unscheduleLesson}
        />
      </div>
    </div>
  )
}

// ============================================
// PENDING LESSON CARD (appears above PKE)
// ============================================

function PendingLessonCard({ lesson, type, onDragStart, onCancel }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        width: '12vw',
        minWidth: '160px',
        height: '5vh',
        minHeight: '50px',
        background: 'rgba(25, 25, 25, 0.95)',
        border: `2px solid ${THEME.AMBER}`,
        borderRadius: '20px',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        overflow: 'hidden',
        boxShadow: `0 0 20px rgba(255, 102, 0, 0.4)`,
        position: 'relative'
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: '6px',
          background: type.color,
          borderRadius: '20px 0 0 20px'
        }}
      />
      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0.5vh 1vw'
        }}
      >
        <span
          style={{
            fontSize: '1.4vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '0.2vh'
          }}
        >
          {lesson.title}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO }}>
            Drag to schedule
          </span>
          <span style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO }}>
            {lesson.duration}mins
          </span>
        </div>
      </div>
      {/* Cancel button */}
      <button
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: '2px',
          right: '6px',
          background: 'transparent',
          border: 'none',
          color: THEME.TEXT_DIM,
          fontSize: '1.3vh',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        ×
      </button>
    </div>
  )
}

// Note: ControlZone and LessonTypeButton moved to TimeControls.jsx (Phase 2-6)

export default TimetableWorkspace
