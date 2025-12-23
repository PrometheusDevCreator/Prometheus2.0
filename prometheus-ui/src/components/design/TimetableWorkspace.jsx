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
import TimeControls from './TimeControls'
import TimetableGrid from './TimetableGrid'

function TimetableWorkspace() {
  const {
    LESSON_TYPES,
    addLesson,
    scheduledLessons,
    select
  } = useDesign()

  // Time range state (shared with TimeControls and TimetableGrid)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(14)

  // New lesson preview state
  const [newLessonType, setNewLessonType] = useState('instructor-led')

  // Get next available time slot
  const getNextAvailableSlot = useCallback(() => {
    // Simple implementation: find the latest end time on day 1, or default to startHour
    const day1Lessons = scheduledLessons.filter(l => l.day === 1 && l.week === 1)
    if (day1Lessons.length === 0) {
      return { hour: startHour, minute: 0 }
    }

    // Find latest end time
    let latestEnd = startHour * 60
    day1Lessons.forEach(lesson => {
      if (lesson.startTime) {
        const start = parseInt(lesson.startTime.slice(0, 2)) * 60 + parseInt(lesson.startTime.slice(2, 4) || 0)
        const end = start + lesson.duration
        if (end > latestEnd) latestEnd = end
      }
    })

    return {
      hour: Math.floor(latestEnd / 60),
      minute: latestEnd % 60
    }
  }, [scheduledLessons, startHour])

  // Handle creating new lesson from palette
  const handleCreateLesson = useCallback((typeId) => {
    setNewLessonType(typeId)
    const slot = getNextAvailableSlot()
    const startTime = `${slot.hour.toString().padStart(2, '0')}${slot.minute.toString().padStart(2, '0')}`

    addLesson({
      title: 'New Lesson',
      type: typeId,
      duration: 60,
      startTime,
      day: 1,
      week: 1,
      scheduled: true
    })
  }, [addLesson, getNextAvailableSlot])

  // Handle adding new lesson from preview card
  const handleAddNewLesson = useCallback(() => {
    handleCreateLesson(newLessonType)
  }, [handleCreateLesson, newLessonType])

  // Get lesson type info
  const currentType = LESSON_TYPES.find(t => t.id === newLessonType) || LESSON_TYPES[0]

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: THEME.BG_DARK
      }}
    >
      {/* Time Controls Row */}
      <TimeControls
        startHour={startHour}
        endHour={endHour}
        onStartChange={setStartHour}
        onEndChange={setEndHour}
      />

      {/* Timetable Grid */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimetableGrid
          startHour={Math.floor(startHour)}
          endHour={Math.floor(endHour)}
        />
      </div>

      {/* Control Zone */}
      <ControlZone
        lessonTypes={LESSON_TYPES}
        currentType={currentType}
        onTypeSelect={handleCreateLesson}
        onAddLesson={handleAddNewLesson}
      />
    </div>
  )
}

// ============================================
// CONTROL ZONE COMPONENT
// ============================================

function ControlZone({ lessonTypes, currentType, onTypeSelect, onAddLesson }) {
  // Split types into two rows (5 each)
  const row1Types = lessonTypes.slice(0, 5)
  const row2Types = lessonTypes.slice(5, 10)

  return (
    <div
      style={{
        padding: '1vh 1.5vw',
        borderTop: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_DARK,
        display: 'flex',
        alignItems: 'center',
        gap: '2vw'
      }}
    >
      {/* Lesson Type Palette - 2x5 Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: '0.4vw' }}>
          {row1Types.map(type => (
            <LessonTypeButton
              key={type.id}
              type={type}
              onClick={() => onTypeSelect(type.id)}
            />
          ))}
        </div>
        {/* Row 2 */}
        <div style={{ display: 'flex', gap: '0.4vw' }}>
          {row2Types.map(type => (
            <LessonTypeButton
              key={type.id}
              type={type}
              onClick={() => onTypeSelect(type.id)}
            />
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* New Lesson Card Preview */}
      <NewLessonCard
        type={currentType}
        onClick={onAddLesson}
      />

      {/* Lesson Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8vw',
          fontSize: '1.4vh',
          color: THEME.TEXT_DIM
        }}
      >
        <span style={{ cursor: 'pointer' }}>{'<'}</span>
        <span
          style={{ color: THEME.AMBER, cursor: 'pointer' }}
          onClick={onAddLesson}
        >
          +
        </span>
        <span style={{ cursor: 'pointer' }}>{'>'}</span>
      </div>
    </div>
  )
}

// ============================================
// LESSON TYPE BUTTON
// ============================================

function LessonTypeButton({ type, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '5vw',
        minWidth: '70px',
        height: '4vh',
        minHeight: '35px',
        background: THEME.BG_PANEL,
        border: `1px solid ${hovered ? type.color : 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: '0.4vh',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0.3vh',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease'
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: type.color
        }}
      />
      {/* Label */}
      <span
        style={{
          fontSize: '0.9vh',
          color: THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center',
          lineHeight: 1.2
        }}
      >
        {type.name}
      </span>
    </button>
  )
}

// ============================================
// NEW LESSON CARD PREVIEW
// ============================================

function NewLessonCard({ type, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '10vw',
        minWidth: '140px',
        height: '6vh',
        minHeight: '55px',
        background: THEME.BG_PANEL,
        border: `1px solid ${THEME.AMBER}`,
        borderRadius: '0.6vh',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0.5vh 0.8vw',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered
          ? `0 0 12px rgba(255, 102, 0, 0.5)`
          : `0 0 8px rgba(255, 102, 0, 0.3)`,
        transition: 'box-shadow 0.2s ease'
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: type.color
        }}
      />
      {/* Content */}
      <span
        style={{
          fontSize: '1.2vh',
          color: THEME.AMBER,
          fontFamily: THEME.FONT_PRIMARY,
          marginBottom: '0.3vh'
        }}
      >
        New Lesson
      </span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '1vh',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO
          }}
        >
          09:00-10:00
        </span>
        <span
          style={{
            fontSize: '1vh',
            color: THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_MONO
          }}
        >
          60mins
        </span>
      </div>
    </div>
  )
}

export default TimetableWorkspace
