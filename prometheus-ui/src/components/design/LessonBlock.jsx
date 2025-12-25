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
  startHour = 8,        // Grid start hour for time calculations
  useFullWidth = false  // When true, fills container width (for percentage-based layout)
}) {
  const {
    selection,
    select,
    startEditing,
    updateLesson,
    resizeLesson,
    unscheduleLesson,
    saveToLibrary,
    duplicateLesson,
    deleteLesson,
    LESSON_TYPES
  } = useDesign()

  // Refs for drag operations
  const blockRef = useRef(null)
  const dragStartRef = useRef(null)

  // Local state
  const [isHovered, setIsHovered] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)

  // Determine block state
  const isSelected = selection.type === 'lesson' && selection.id === lesson.id
  const isEditing = isSelected && selection.mode === 'editing'

  // Get lesson type info
  const lessonType = useMemo(() =>
    LESSON_TYPES.find(t => t.id === lesson.type) || LESSON_TYPES[0],
    [lesson.type, LESSON_TYPES]
  )

  // Calculate block dimensions
  // When useFullWidth=true, width is controlled by parent container
  const blockWidth = useFullWidth ? '100%' : Math.max(lesson.duration * pixelsPerMinute, 60)
  const blockHeight = '100%' // Fill the container height

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

  // Handle right-click - context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    select('lesson', lesson.id)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [select, lesson.id])

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // Context menu actions
  const handleUnschedule = useCallback(() => {
    unscheduleLesson(lesson.id)
    closeContextMenu()
  }, [lesson.id, unscheduleLesson, closeContextMenu])

  const handleSaveToLibrary = useCallback(() => {
    saveToLibrary(lesson.id)
    closeContextMenu()
  }, [lesson.id, saveToLibrary, closeContextMenu])

  const handleDuplicate = useCallback(() => {
    duplicateLesson(lesson.id)
    closeContextMenu()
  }, [lesson.id, duplicateLesson, closeContextMenu])

  const handleDelete = useCallback(() => {
    deleteLesson(lesson.id)
    closeContextMenu()
  }, [lesson.id, deleteLesson, closeContextMenu])

  // Handle drag start for moving block
  const handleDragStart = useCallback((e) => {
    // Calculate the offset from the left edge of the block where user grabbed
    const blockRect = blockRef.current?.getBoundingClientRect()
    const grabOffsetX = blockRect ? e.clientX - blockRect.left : 0

    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', 'move')
    e.dataTransfer.setData('grabOffsetX', grabOffsetX.toString())
    e.dataTransfer.effectAllowed = 'move'
    // Store original position for offset calculation
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTime: lesson.startTime,
      day: lesson.day,
      grabOffsetX
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
      const newDuration = Math.max(5, startDuration + deltaMinutes)
      // Snap to 5-minute increments
      const snappedDuration = Math.round(newDuration / 5) * 5
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
      const newDuration = Math.max(5, startDuration - deltaMinutes)
      const snappedDuration = Math.round(newDuration / 5) * 5
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
    <>
    <div
      ref={blockRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={handleDragStart}
      style={{
        position: 'relative',
        width: useFullWidth ? blockWidth : `${blockWidth}px`,
        height: blockHeight,
        background: 'rgba(25, 25, 25, 0.95)',
        border: isSelected || isEditing
          ? `1px solid ${THEME.AMBER}`
          : `1px solid rgba(100, 100, 100, 0.5)`,
        borderRadius: '16px',
        cursor: 'grab',
        overflow: 'hidden',
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        boxShadow: getBoxShadow(),
        display: 'flex',
        flexDirection: 'row',
        userSelect: 'none'
      }}
    >
      {/* Left Accent Bar */}
      <div
        style={{
          width: '5px',
          flexShrink: 0,
          background: lessonType.color,
          borderRadius: '16px 0 0 16px'
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '6px 10px',
          overflow: 'hidden'
        }}
      >
        {/* Lesson Title - Top */}
        <div
          style={{
            fontSize: '1.4vh',
            color: isSelected ? THEME.WHITE : THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {lesson.title}
        </div>

        {/* Bottom row: Time Range + Duration */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Time Range */}
          <span
            style={{
              fontSize: '1.1vh',
              color: isSelected ? '#00FF00' : 'rgba(180, 180, 180, 0.8)',
              fontFamily: THEME.FONT_MONO,
              transition: 'color 0.15s ease'
            }}
          >
            {formatTime(lesson.startTime)}-{calculateEndTime()}
          </span>

          {/* Duration */}
          <span
            style={{
              fontSize: '1.1vh',
              color: isSelected ? '#00FF00' : 'rgba(180, 180, 180, 0.8)',
              fontFamily: THEME.FONT_MONO,
              transition: 'color 0.15s ease'
            }}
          >
            {lesson.duration}mins
          </span>
        </div>
      </div>

      {/* EDITING Label */}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            fontSize: '0.85vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_MONO,
            letterSpacing: '0.03vw',
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
              left: '4px',
              top: '20%',
              bottom: '20%',
              width: '4px',
              cursor: 'ew-resize',
              background: 'transparent'
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
              background: isHovered ? 'rgba(212, 115, 12, 0.5)' : 'transparent',
              borderRadius: '0 4px 4px 0'
            }}
            onMouseDown={handleResizeRight}
            draggable={false}
          />
        </>
      )}
    </div>

    {/* Context Menu */}
    {contextMenu && (
      <BlockContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        lesson={lesson}
        onUnschedule={handleUnschedule}
        onSaveToLibrary={handleSaveToLibrary}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onClose={closeContextMenu}
      />
    )}
    </>
  )
}

// ============================================
// CONTEXT MENU COMPONENT
// ============================================

function BlockContextMenu({ x, y, lesson, onUnschedule, onSaveToLibrary, onDuplicate, onDelete, onClose }) {
  // Prevent menu from going off-screen
  const adjustedX = Math.min(x, window.innerWidth - 180)
  const adjustedY = Math.min(y, window.innerHeight - 180)

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          top: adjustedY,
          left: adjustedX,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER_LIGHT}`,
          borderRadius: '0.5vh',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 1000,
          minWidth: '10vw',
          overflow: 'hidden'
        }}
      >
        <ContextMenuItem label="Edit" hint="Double-click" disabled />
        <ContextMenuItem label="Unschedule" onClick={onUnschedule} />
        {!lesson.saved && (
          <ContextMenuItem label="Save to Library" onClick={onSaveToLibrary} />
        )}
        <ContextMenuItem label="Duplicate" onClick={onDuplicate} />
        <div style={{ height: '1px', background: THEME.BORDER, margin: '0.3vh 0' }} />
        <ContextMenuItem label="Delete" onClick={onDelete} danger />
      </div>
    </>
  )
}

function ContextMenuItem({ label, hint, onClick, disabled, danger }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.8vh 1vw',
        fontSize: '1.4vh',
        fontFamily: THEME.FONT_PRIMARY,
        color: disabled
          ? THEME.TEXT_DIM
          : danger
            ? hovered ? '#ff6666' : '#cc4444'
            : hovered ? THEME.WHITE : THEME.TEXT_PRIMARY,
        background: hovered && !disabled ? THEME.BG_DARK : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.15s ease'
      }}
    >
      <span>{label}</span>
      {hint && (
        <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM, marginLeft: '1vw' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

export default LessonBlock
