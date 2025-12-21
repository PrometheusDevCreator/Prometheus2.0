/**
 * LessonBlock.jsx - Draggable/Resizable Lesson Block
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 2
 *
 * Visual structure:
 * ┌────────────────────────┐
 * │ [type accent stripe]   │
 * │ Time range             │
 * │ Lesson Title           │
 * │ Topic references       │
 * └────────────────────────┘
 *
 * States (mutually exclusive):
 * - Idle: Default, standard border
 * - Hover: Mouse over, border brightens
 * - Selected: Single click, accent border + subtle glow
 * - Editing: Double-click, accent border + stronger glow + "EDITING" label
 *
 * Interactions (Phase 3):
 * - Single click: Select
 * - Double-click: Edit mode
 * - Drag block: Move to different time/day
 * - Drag block edge: Resize duration (30-min snap)
 * - Right-click: Context menu
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function LessonBlock({
  lesson,
  pixelsPerMinute = 2,  // How many pixels per minute of duration
  dayHeight = 50,       // Height of each day row
  startHour = 8         // Grid start hour for time calculations
}) {
  const {
    selection,
    select,
    startEditing,
    updateLesson,
    resizeLesson,
    LESSON_TYPES
  } = useDesign()

  // Refs for drag operations
  const blockRef = useRef(null)
  const dragStartRef = useRef(null)

  // Local hover state
  const [isHovered, setIsHovered] = useState(false)

  // Determine block state
  const isSelected = selection.type === 'lesson' && selection.id === lesson.id
  const isEditing = isSelected && selection.mode === 'editing'

  // Get lesson type info
  const lessonType = useMemo(() =>
    LESSON_TYPES.find(t => t.id === lesson.type) || LESSON_TYPES[0],
    [lesson.type, LESSON_TYPES]
  )

  // Calculate block dimensions
  const blockWidth = Math.max(lesson.duration * pixelsPerMinute, 60) // Minimum 60px
  const blockHeight = dayHeight - 10 // Leave some padding

  // Calculate time display
  const formatTime = (timeStr) => {
    if (!timeStr) return '----'
    return timeStr.slice(0, 2) + ':' + (timeStr.slice(2, 4) || '00')
  }

  const calculateEndTime = () => {
    if (!lesson.startTime) return '----'
    const startHour = parseInt(lesson.startTime.slice(0, 2))
    const startMin = parseInt(lesson.startTime.slice(2, 4)) || 0
    const totalMinutes = startHour * 60 + startMin + lesson.duration
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMin = totalMinutes % 60
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }

  // Handle click - select
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (!isSelected) {
      select('lesson', lesson.id)
    }
  }, [isSelected, select, lesson.id])

  // Handle double-click - edit mode
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    startEditing('lesson', lesson.id)
  }, [startEditing, lesson.id])

  // Handle drag start for moving block
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', 'move')
    e.dataTransfer.effectAllowed = 'move'
    // Store original position for offset calculation
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTime: lesson.startTime,
      day: lesson.day
    }
  }, [lesson.id, lesson.startTime, lesson.day])

  // Handle resize from right edge
  const handleResizeRight = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startDuration = lesson.duration

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaMinutes = deltaX / pixelsPerMinute
      const newDuration = Math.max(30, startDuration + deltaMinutes)
      // Snap to 30-minute increments
      const snappedDuration = Math.round(newDuration / 30) * 30
      resizeLesson(lesson.id, snappedDuration)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [lesson.id, lesson.duration, pixelsPerMinute, resizeLesson])

  // Handle resize from left edge (adjusts both start time and duration)
  const handleResizeLeft = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startDuration = lesson.duration
    const originalStartMinutes = parseInt(lesson.startTime.slice(0, 2)) * 60 +
      (parseInt(lesson.startTime.slice(2, 4)) || 0)

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaMinutes = deltaX / pixelsPerMinute
      // Moving left edge right = shorter duration, moving left = longer duration
      const newDuration = Math.max(30, startDuration - deltaMinutes)
      const snappedDuration = Math.round(newDuration / 30) * 30
      const durationChange = startDuration - snappedDuration
      const newStartMinutes = originalStartMinutes + durationChange

      // Ensure we don't go before the grid start
      if (newStartMinutes >= startHour * 60) {
        const newHour = Math.floor(newStartMinutes / 60)
        const newMin = newStartMinutes % 60
        const newStartTime = `${newHour.toString().padStart(2, '0')}${newMin.toString().padStart(2, '0')}`
        updateLesson(lesson.id, { startTime: newStartTime, duration: snappedDuration })
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [lesson.id, lesson.duration, lesson.startTime, pixelsPerMinute, startHour, updateLesson])

  // Determine border and glow based on state
  const getBorderStyle = () => {
    if (isEditing) {
      return `2px solid ${THEME.AMBER}`
    }
    if (isSelected) {
      return `2px solid ${THEME.AMBER}`
    }
    if (isHovered) {
      return `1px solid ${THEME.BORDER_LIGHT}`
    }
    return `1px solid ${THEME.BORDER}`
  }

  const getBoxShadow = () => {
    if (isEditing) {
      return `0 0 16px rgba(212, 115, 12, 0.5), 0 0 32px rgba(212, 115, 12, 0.2)`
    }
    if (isSelected) {
      return `0 0 12px rgba(212, 115, 12, 0.3)`
    }
    return 'none'
  }

  const getBackground = () => {
    if (isSelected || isEditing) {
      return `linear-gradient(135deg, ${THEME.BG_PANEL} 0%, ${THEME.BG_DARK} 100%)`
    }
    return THEME.BG_PANEL
  }

  return (
    <div
      ref={blockRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={handleDragStart}
      style={{
        position: 'relative',
        width: `${blockWidth}px`,
        height: `${blockHeight}px`,
        background: getBackground(),
        border: getBorderStyle(),
        borderRadius: '0.6vh',
        cursor: 'grab',
        overflow: 'hidden',
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        boxShadow: getBoxShadow(),
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
      }}
    >
      {/* Type Accent Stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: lessonType.color
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4px 8px',
          paddingTop: '6px', // Account for stripe
          gap: '2px',
          overflow: 'hidden'
        }}
      >
        {/* Time Range */}
        <div
          style={{
            fontSize: '0.9vh',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO,
            whiteSpace: 'nowrap'
          }}
        >
          {formatTime(lesson.startTime)}-{calculateEndTime()}
        </div>

        {/* Lesson Title */}
        <div
          style={{
            fontSize: '1.1vh',
            color: isSelected ? THEME.WHITE : THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: isSelected ? 500 : 400,
            letterSpacing: '0.05vw',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {lesson.title}
        </div>

        {/* Topic References (if any) */}
        {lesson.topics.length > 0 && (
          <div
            style={{
              fontSize: '0.85vh',
              color: THEME.TEXT_DIM,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {lesson.topics.length} topic{lesson.topics.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* EDITING Label */}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '4px',
            fontSize: '0.7vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_MONO,
            letterSpacing: '0.05vw',
            textTransform: 'uppercase'
          }}
        >
          EDITING
        </div>
      )}

      {/* Resize Handles */}
      {isSelected && (
        <>
          {/* Left resize handle */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: '6px',
              cursor: 'ew-resize',
              background: isHovered ? THEME.AMBER : 'rgba(212, 115, 12, 0.3)',
              borderRadius: '2px 0 0 2px'
            }}
            onMouseDown={handleResizeLeft}
            draggable={false}
          />

          {/* Right resize handle */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '20%',
              bottom: '20%',
              width: '6px',
              cursor: 'ew-resize',
              background: isHovered ? THEME.AMBER : 'rgba(212, 115, 12, 0.3)',
              borderRadius: '0 2px 2px 0'
            }}
            onMouseDown={handleResizeRight}
            draggable={false}
          />
        </>
      )}
    </div>
  )
}

export default LessonBlock
