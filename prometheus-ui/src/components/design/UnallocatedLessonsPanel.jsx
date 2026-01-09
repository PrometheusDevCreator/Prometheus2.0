/**
 * UnallocatedLessonsPanel - Shared Unallocated Lessons Component
 *
 * Item 18: Add to OVERVIEW (same functionality as TIMETABLE)
 * Item 19: Position directly above DELETE, CLEAR, SAVE buttons
 * Item 20: Width matches combined width of action buttons
 *
 * Features:
 * - Collapsible panel
 * - Drag-and-drop support (drop scheduled lessons to unschedule)
 * - Consistent styling across OVERVIEW and TIMETABLE
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'

function UnallocatedLessonsPanel({
  lessons = [],
  lessonTypes = [],
  onUnscheduleLesson,
  onScheduleLesson  // For dragging from unallocated to canvas/grid
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Handle drag start for unallocated lesson
  const handleDragStart = useCallback((e, lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', 'unallocated')
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  // Handle drag over to allow drop
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

  // Handle drop - unschedule the lesson
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const lessonId = e.dataTransfer.getData('lessonId')
    const dragType = e.dataTransfer.getData('dragType')

    // Only accept drops from scheduled lessons (not from unallocated or pending)
    if (lessonId && dragType !== 'unallocated' && dragType !== 'pending') {
      onUnscheduleLesson?.(lessonId)
    }
  }, [onUnscheduleLesson])

  const getLessonTypeColor = (typeId) => {
    const type = lessonTypes.find(t => t.id === typeId)
    return type?.color || '#FF6600'
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragOver ? 'rgba(255, 102, 0, 0.2)' : 'rgba(20, 20, 20, 0.95)',
        border: `2px solid ${isDragOver ? '#00FF00' : THEME.AMBER}`,
        borderRadius: '12px',
        // Item 20: Match width of DELETE + CLEAR + SAVE (approximately 280px)
        width: '280px',
        maxHeight: collapsed ? '36px' : '140px',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6vh 0.8vw',
          borderBottom: collapsed ? 'none' : `1px solid ${THEME.AMBER}40`,
          cursor: 'pointer'
        }}
      >
        <span
          style={{
            fontSize: '1.2vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase',
            letterSpacing: '0.05vw',
            fontWeight: 500
          }}
        >
          Unallocated ({lessons.length})
        </span>
        <span style={{ fontSize: '1.2vh', color: THEME.AMBER }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </div>

      {/* Lessons List */}
      {!collapsed && (
        <div
          style={{
            padding: '0.4vh 0.4vw',
            maxHeight: '100px',
            overflowY: 'auto'
          }}
        >
          {lessons.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1vh',
                color: THEME.TEXT_DIM,
                fontSize: '1.1vh',
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              Drag lessons here to unschedule
            </div>
          ) : (
            lessons.map(lesson => (
              <div
                key={lesson.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lesson)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4vw',
                  padding: '0.5vh 0.5vw',
                  marginBottom: '0.3vh',
                  background: 'rgba(30, 30, 30, 0.8)',
                  border: '1px solid rgba(100, 100, 100, 0.3)',
                  borderRadius: '8px',
                  cursor: 'grab',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = THEME.AMBER}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 100, 100, 0.3)'}
              >
                {/* Type color bar */}
                <div
                  style={{
                    width: '4px',
                    height: '2vh',
                    background: getLessonTypeColor(lesson.type || lesson.lessonType),
                    borderRadius: '2px',
                    flexShrink: 0
                  }}
                />
                {/* Title */}
                <span
                  style={{
                    fontSize: '1.1vh',
                    color: THEME.TEXT_PRIMARY,
                    fontFamily: THEME.FONT_PRIMARY,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {lesson.title || 'Untitled'}
                </span>
                {/* Duration */}
                <span
                  style={{
                    fontSize: '0.9vh',
                    color: THEME.TEXT_DIM,
                    fontFamily: THEME.FONT_MONO
                  }}
                >
                  {lesson.duration}m
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default UnallocatedLessonsPanel
