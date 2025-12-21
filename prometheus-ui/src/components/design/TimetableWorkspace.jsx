/**
 * TimetableWorkspace.jsx - Complete Timetable Tab Content
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 2
 *
 * Combines:
 * - TimeControls: Time range slider, course hours, day indicator
 * - TimetableGrid: Day rows with lesson blocks
 * - LessonLibrary: Unscheduled/Saved tabs (Phase 4)
 *
 * Bidirectional Sync:
 * - Clicking block selects it and updates Editor
 * - Editing in Editor updates block in real-time
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import TimeControls from './TimeControls'
import TimetableGrid from './TimetableGrid'

function TimetableWorkspace() {
  const { createLesson, viewMode } = useDesign()

  // Time range state (shared with TimeControls and TimetableGrid)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(17)

  // Handle add lesson button
  const handleAddLesson = () => {
    createLesson({
      scheduled: false  // Start in library
    })
  }

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
          startHour={startHour}
          endHour={endHour}
        />
      </div>

      {/* Lesson Library (Phase 4 - placeholder for now) */}
      <LessonLibraryPlaceholder onAddLesson={handleAddLesson} />
    </div>
  )
}

// ============================================
// LESSON LIBRARY PLACEHOLDER (Phase 4)
// ============================================

function LessonLibraryPlaceholder({ onAddLesson }) {
  const { unscheduledLessons, savedLessons } = useDesign()
  const [activeTab, setActiveTab] = useState('unscheduled')

  const currentLessons = activeTab === 'unscheduled' ? unscheduledLessons : savedLessons

  return (
    <div
      style={{
        borderTop: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_PANEL,
        flexShrink: 0
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 1vw',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <span
            style={{
              fontSize: '1.2vh',
              letterSpacing: '0.1vw',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            Lesson Library
          </span>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            <LibraryTab
              label="UNSCHEDULED"
              active={activeTab === 'unscheduled'}
              count={unscheduledLessons.length}
              onClick={() => setActiveTab('unscheduled')}
            />
            <LibraryTab
              label="SAVED"
              active={activeTab === 'saved'}
              count={savedLessons.length}
              onClick={() => setActiveTab('saved')}
            />
          </div>
        </div>

        {/* Add Lesson Button */}
        <button
          onClick={onAddLesson}
          style={{
            background: 'transparent',
            border: `1px dashed ${THEME.AMBER}`,
            borderRadius: '0.5vh',
            color: THEME.AMBER,
            fontSize: '1.1vh',
            padding: '0.5vh 1vw',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3vw'
          }}
        >
          <span style={{ fontSize: '1.3vh' }}>+</span>
          New Lesson
        </button>
      </div>

      {/* Library Content */}
      <div
        style={{
          display: 'flex',
          gap: '0.8vw',
          padding: '1vh 1vw',
          overflowX: 'auto',
          minHeight: '8vh'
        }}
      >
        {currentLessons.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: THEME.TEXT_DIM,
              fontSize: '1.1vh',
              fontStyle: 'italic'
            }}
          >
            {activeTab === 'unscheduled'
              ? 'No unscheduled lessons. Create a new lesson or drag one off the timetable.'
              : 'No saved lessons. Right-click a lesson and select "Save to Library".'}
          </div>
        ) : (
          currentLessons.map(lesson => (
            <LibraryCard key={lesson.id} lesson={lesson} />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LibraryTab({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? THEME.BG_DARK : 'transparent',
        border: `1px solid ${active ? THEME.BORDER_LIGHT : THEME.BORDER}`,
        borderRadius: '0.4vh',
        color: active ? THEME.WHITE : THEME.TEXT_DIM,
        fontSize: '1vh',
        padding: '0.4vh 0.8vw',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3vw'
      }}
    >
      {label}
      {count > 0 && (
        <span
          style={{
            background: active ? THEME.AMBER : THEME.TEXT_DIM,
            color: THEME.BG_DARK,
            borderRadius: '0.3vh',
            padding: '0 0.3vw',
            fontSize: '0.9vh'
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function LibraryCard({ lesson }) {
  const { select, LESSON_TYPES } = useDesign()
  const lessonType = LESSON_TYPES.find(t => t.id === lesson.type) || LESSON_TYPES[0]

  return (
    <div
      onClick={() => select('lesson', lesson.id)}
      style={{
        minWidth: '12vw',
        padding: '0.8vh 1vw',
        background: THEME.BG_DARK,
        border: `1px dashed ${THEME.BORDER}`,
        borderRadius: '0.5vh',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3vh'
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('lessonId', lesson.id)
      }}
    >
      {/* Type indicator */}
      <div
        style={{
          width: '100%',
          height: '2px',
          background: lessonType.color,
          borderRadius: '1px',
          marginBottom: '0.2vh'
        }}
      />

      {/* Title */}
      <span
        style={{
          fontSize: '1.1vh',
          color: THEME.WHITE,
          fontFamily: THEME.FONT_PRIMARY,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {lesson.title}
      </span>

      {/* Duration */}
      <span
        style={{
          fontSize: '0.9vh',
          color: THEME.TEXT_DIM,
          fontFamily: THEME.FONT_MONO
        }}
      >
        {lesson.duration} min
      </span>
    </div>
  )
}

export default TimetableWorkspace
