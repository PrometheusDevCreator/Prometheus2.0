/**
 * LessonCard.jsx - Draggable Lesson Card for Library
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 4
 *
 * Displays a lesson in the library panel with:
 * - Type color indicator stripe
 * - Lesson title
 * - Duration display
 * - Drag handle for dropping onto timetable
 *
 * States:
 * - Idle: Standard appearance
 * - Hover: Slight elevation/glow
 * - Selected: Accent border
 * - Dragging: Reduced opacity
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function LessonCard({ lesson, onContextMenu }) {
  const { select, selection, LESSON_TYPES } = useDesign()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Get lesson type info
  const lessonType = LESSON_TYPES.find(t => t.id === lesson.type) || LESSON_TYPES[0]

  // Check if this card is selected
  const isSelected = selection.type === 'lesson' && selection.id === lesson.id

  // Handle click to select
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    select('lesson', lesson.id)
  }, [select, lesson.id])

  // Handle right-click for context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    select('lesson', lesson.id)
    onContextMenu?.(e, lesson)
  }, [select, lesson.id, onContextMenu])

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', 'schedule') // From library = schedule
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }, [lesson.id])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        minWidth: '12vw',
        padding: '0.8vh 1vw',
        background: isSelected
          ? `linear-gradient(135deg, ${THEME.BG_PANEL} 0%, ${THEME.BG_DARK} 100%)`
          : THEME.BG_DARK,
        border: isSelected
          ? `2px solid ${THEME.AMBER}`
          : `1px dashed ${isHovered ? THEME.BORDER_LIGHT : THEME.BORDER}`,
        borderRadius: '0.5vh',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3vh',
        opacity: isDragging ? 0.5 : 1,
        transform: isHovered && !isDragging ? 'translateY(-2px)' : 'none',
        boxShadow: isSelected
          ? `0 0 12px rgba(212, 115, 12, 0.3)`
          : isHovered
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease'
      }}
    >
      {/* Type indicator */}
      <div
        style={{
          width: '100%',
          height: '3px',
          background: lessonType.color,
          borderRadius: '1px',
          marginBottom: '0.2vh'
        }}
      />

      {/* Title */}
      <span
        style={{
          fontSize: '1.1vh',
          color: isSelected ? THEME.WHITE : THEME.TEXT_PRIMARY,
          fontFamily: THEME.FONT_PRIMARY,
          fontWeight: isSelected ? 500 : 400,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {lesson.title}
      </span>

      {/* Duration and Type */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.9vh',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO
          }}
        >
          {lesson.duration} min
        </span>
        <span
          style={{
            fontSize: '0.8vh',
            color: lessonType.color,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase',
            letterSpacing: '0.05vw'
          }}
        >
          {lessonType.label.split(' ')[0]}
        </span>
      </div>

      {/* Saved indicator */}
      {lesson.saved && (
        <div
          style={{
            position: 'absolute',
            top: '0.3vh',
            right: '0.3vw',
            width: '0.6vh',
            height: '0.6vh',
            borderRadius: '50%',
            background: THEME.GREEN
          }}
          title="Saved to library"
        />
      )}
    </div>
  )
}

export default LessonCard
