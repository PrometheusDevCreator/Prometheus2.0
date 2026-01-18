/**
 * WorkDock.jsx - Right Dock Content Display
 *
 * Phase 4: Calm Wheel Integration
 *
 * Progressively replaces TimetableWorkspace (feature-flagged).
 * Displays lesson cards using LessonCardPrimitive.
 *
 * Features:
 * - Lesson card display using LessonCardPrimitive (REQUIRED)
 * - Filters lessons by WheelNav hierarchy selection
 * - Drag/drop for scheduling
 * - Context menu actions
 * - Respects feature flags
 */

import { useState, useCallback, useMemo } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import { CANONICAL_FLAGS } from '../../utils/canonicalAdapter'
import LessonCardPrimitive from '../LessonCardPrimitive'

// ============================================
// CONSTANTS
// ============================================

const FONT = {
  HEADER: '1.8vh',
  LABEL: '1.5vh',
  BUTTON: '1.2vh',
  COUNT: '1.3vh'
}

// ============================================
// LESSON LIST SECTION
// ============================================

function LessonSection({ title, lessons, variant, onSelect, onDragStart, onDragEnd, selectedLessonId }) {
  if (lessons.length === 0) return null

  return (
    <div style={{ marginBottom: '1.5vh' }}>
      <div
        style={{
          fontSize: FONT.LABEL,
          color: THEME.TEXT_DIM,
          marginBottom: '0.5vh',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5vw'
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: FONT.COUNT,
            color: THEME.ACCENT,
            background: `${THEME.ACCENT}20`,
            padding: '0.1vh 0.4vw',
            borderRadius: '2px'
          }}
        >
          {lessons.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh' }}>
        {lessons.map(lesson => (
          <LessonCardPrimitive
            key={lesson.id}
            lesson={lesson}
            variant={variant}
            isSelected={lesson.id === selectedLessonId}
            onSelect={() => onSelect?.(lesson.id)}
            onDragStart={(e) => onDragStart?.(e, lesson)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ message }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.TEXT_DIM,
        fontSize: FONT.LABEL,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '2vh'
      }}
    >
      {message}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

function WorkDock({ width = '100%', height = '100%' }) {
  const {
    // Lessons
    lessons,
    scheduledLessons,
    unscheduledLessons,
    // Selection
    selection,
    select,
    // Hierarchy navigation
    hierarchyNav,
    // Canonical data for filtering
    canonicalData,
    // Operations
    scheduleLesson,
    unscheduleLesson,
    deleteLesson,
    updateLesson
  } = useDesign()

  // Drag state
  const [draggedLesson, setDraggedLesson] = useState(null)

  // Filter lessons by hierarchy selection
  const filteredLessons = useMemo(() => {
    if (!hierarchyNav.filterId || hierarchyNav.currentLevel === 0) {
      // No filter: return all lessons
      return { scheduled: scheduledLessons, unscheduled: unscheduledLessons }
    }

    const { currentLevel, filterId } = hierarchyNav
    const { los, topics, subtopics } = canonicalData

    // Filter function based on hierarchy level
    const matchesFilter = (lesson) => {
      switch (currentLevel) {
        case 1: // LO level - match lessons with this LO
          return lesson.learningObjectives?.includes(filterId)

        case 2: // Topic level - match lessons with this topic
          return lesson.topics?.some(t => t.id === filterId || t.scalarTopicId === filterId)

        case 3: // Subtopic level - match lessons with this subtopic
          return lesson.topics?.some(t =>
            t.subtopics?.some(s => s.id === filterId || s.scalarSubtopicId === filterId)
          )

        case 4: // Lesson level - match exact lesson
          return lesson.id === filterId

        default:
          return true
      }
    }

    return {
      scheduled: scheduledLessons.filter(matchesFilter),
      unscheduled: unscheduledLessons.filter(matchesFilter)
    }
  }, [hierarchyNav, scheduledLessons, unscheduledLessons, canonicalData])

  // Selection handlers
  const handleSelect = useCallback((lessonId) => {
    select('lesson', lessonId)
  }, [select])

  // Drag handlers
  const handleDragStart = useCallback((e, lesson) => {
    setDraggedLesson(lesson)
    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', lesson.scheduled ? 'move' : 'schedule')
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedLesson(null)
  }, [])

  // Drop handler for unscheduling
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const lessonId = e.dataTransfer.getData('lessonId')
    const dragType = e.dataTransfer.getData('dragType')

    if (dragType === 'move' && lessonId) {
      // Unschedule the lesson (drop into unscheduled area)
      unscheduleLesson(lessonId)
    }
  }, [unscheduleLesson])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // Currently selected lesson ID
  const selectedLessonId = selection.type === 'lesson' ? selection.id : null

  // Total count
  const totalLessons = filteredLessons.scheduled.length + filteredLessons.unscheduled.length

  // Don't render if feature flag is disabled
  if (!CANONICAL_FLAGS.WORK_DOCK_ENABLED) {
    return null
  }

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_PANEL,
        borderLeft: `1px solid ${THEME.BORDER}`,
        overflow: 'hidden'
      }}
      data-testid="work-dock"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 0.8vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500,
            letterSpacing: '0.05vw'
          }}
        >
          LESSONS
        </span>
        <span
          style={{
            fontSize: FONT.COUNT,
            color: THEME.TEXT_DIM
          }}
        >
          {totalLessons} total
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1vh 0.8vw'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {totalLessons === 0 ? (
          <EmptyState
            message={
              hierarchyNav.filterId
                ? 'No lessons match the current filter.'
                : 'No lessons created yet.'
            }
          />
        ) : (
          <>
            {/* Scheduled Lessons */}
            <LessonSection
              title="SCHEDULED"
              lessons={filteredLessons.scheduled}
              variant="library"
              selectedLessonId={selectedLessonId}
              onSelect={handleSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />

            {/* Unscheduled Lessons */}
            <LessonSection
              title="UNSCHEDULED"
              lessons={filteredLessons.unscheduled}
              variant="library"
              selectedLessonId={selectedLessonId}
              onSelect={handleSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </>
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '0.4vh 0.8vw',
          borderTop: `1px solid ${THEME.BORDER}`,
          fontSize: FONT.BUTTON,
          color: THEME.TEXT_DIM,
          display: 'flex',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span>
          {filteredLessons.scheduled.length} scheduled, {filteredLessons.unscheduled.length} unscheduled
        </span>
        {hierarchyNav.filterId && (
          <span style={{ color: THEME.AMBER }}>Filtered</span>
        )}
      </div>
    </div>
  )
}

export default WorkDock
