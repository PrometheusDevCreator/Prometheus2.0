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
    createLesson,
    scheduledLessons,
    select,
    scheduleLesson
  } = useDesign()

  // Time range state (shared with TimeControls and TimetableGrid)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(14)

  // Pending lesson state - appears above PKE when type is clicked
  const [pendingLesson, setPendingLesson] = useState(null)

  // Handle clicking a lesson type - creates pending lesson above PKE
  const handleTypeClick = useCallback((typeId) => {
    const type = LESSON_TYPES.find(t => t.id === typeId) || LESSON_TYPES[0]
    setPendingLesson({
      id: `pending-${Date.now()}`,
      title: 'New Lesson',
      type: typeId,
      duration: 60,
      color: type.color
    })
  }, [LESSON_TYPES])

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
          onSchedulePending={handleSchedulePending}
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

      {/* Control Zone */}
      <ControlZone
        lessonTypes={LESSON_TYPES}
        currentType={currentType}
        onTypeSelect={handleTypeClick}
        hasPendingLesson={!!pendingLesson}
      />
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
            fontSize: '1.3vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '0.2vh'
          }}
        >
          {lesson.title}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO }}>
            Drag to schedule
          </span>
          <span style={{ fontSize: '1vh', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO }}>
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
          fontSize: '1.2vh',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        ×
      </button>
    </div>
  )
}

// ============================================
// CONTROL ZONE COMPONENT
// ============================================

function ControlZone({ lessonTypes, currentType, onTypeSelect, hasPendingLesson }) {
  // Split types into two rows (5 each)
  const row1Types = lessonTypes.slice(0, 5)
  const row2Types = lessonTypes.slice(5, 10)

  return (
    <div
      style={{
        padding: '1vh 0',
        background: THEME.BG_DARK,
        display: 'flex',
        justifyContent: 'center',
        marginTop: '-175px',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Container aligned with day bars (75% width) */}
      <div
        style={{
          width: '75%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Lesson Type Palette - 2x5 Grid - aligned left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh', marginLeft: '5px' }}>
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

        {/* Navigation Controls - aligned right */}
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
          <span style={{ color: THEME.AMBER, cursor: 'pointer' }}>+</span>
          <span style={{ cursor: 'pointer' }}>{'>'}</span>
        </div>
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
        width: '4.7vw',
        minWidth: '64px',
        height: '3vh',
        minHeight: '28px',
        background: THEME.BG_PANEL,
        border: `1px solid ${hovered ? type.color : 'rgba(255, 255, 255, 0.3)'}`,
        borderRadius: '14px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 0.5vw',
        gap: '0.4vw',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, background 0.2s ease'
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: '4px',
          height: '60%',
          background: type.color,
          borderRadius: '2px',
          flexShrink: 0
        }}
      />
      {/* Label */}
      <span
        style={{
          fontSize: '0.85vh',
          color: THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'left',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {type.name}
      </span>
    </button>
  )
}

export default TimetableWorkspace
