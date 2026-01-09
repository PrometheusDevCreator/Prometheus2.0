/**
 * OverviewLessonCard - Lesson Card Component for OVERVIEW Canvas
 *
 * Item 8: LESSON button creates lesson CARD (not line)
 * Item 9: Lesson card behavior identical to TIMETABLE
 *
 * Visual Structure (matches TimetableGrid LessonBlock):
 * ┌────────────────────────┐
 * │ [type accent stripe]   │
 * │ Lesson Title           │
 * │ Duration               │
 * └────────────────────────┘
 *
 * Features:
 * - Draggable within canvas
 * - Can be dropped onto CourseLine to become a marker
 * - Double-click to edit title
 * - Same border color states as TIMETABLE
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'

// Lesson type colors (matching LessonBlock from TimetableGrid)
const LESSON_TYPE_COLORS = {
  lecture: THEME.AMBER,
  tutorial: '#4CAF50',
  lab: '#2196F3',
  workshop: '#9C27B0',
  seminar: '#FF9800',
  assessment: '#F44336',
  break: '#607D8B',
  self_study: '#00BCD4',
  fieldwork: '#8BC34A',
  other: '#757575'
}

const DEFAULT_CARD_WIDTH = 180
const DEFAULT_CARD_HEIGHT = 70

function OverviewLessonCard({
  id,
  title = '',
  type = 'lecture',
  duration = 30,
  x = 0,
  y = 0,
  width,
  height,
  isSelected = false,
  isCommitted = false,
  parentLineId = null,  // If attached to a line as marker
  onDragStart,
  onDragEnd,
  onPositionChange,
  onSelect,
  onTitleChange,
  onDurationChange,
  onCommit,
  onConvertToMarker,  // Called when dropped on a line
  onRequestDelete  // Item 13: Called to trigger PKE delete warning
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const inputRef = useRef(null)
  const cardRef = useRef(null)

  const cardWidth = width || DEFAULT_CARD_WIDTH
  const cardHeight = height || DEFAULT_CARD_HEIGHT
  const typeColor = LESSON_TYPE_COLORS[type] || LESSON_TYPE_COLORS.other

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Sync edit title with prop
  useEffect(() => {
    setEditTitle(title)
  }, [title])

  // Handle keyboard events
  useEffect(() => {
    if (!isSelected) return

    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isEditing) {
          e.preventDefault()
          onRequestDelete?.(id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelected, isEditing, id, onRequestDelete])

  // Format duration display
  const formatDuration = (mins) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60)
      const remaining = mins % 60
      return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
    }
    return `${mins}m`
  }

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    if (isEditing) return
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    })
    onDragStart?.(id)
  }, [x, y, id, onDragStart, isEditing])

  // Handle click to select
  const handleClick = useCallback((e) => {
    if (isEditing) return
    e.stopPropagation()
    onSelect?.(id)
  }, [id, onSelect, isEditing])

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  // Handle title edit completion
  const handleTitleBlur = useCallback(() => {
    setIsEditing(false)
    if (editTitle !== title) {
      onTitleChange?.(id, editTitle)
    }
    // Commit the card when title is saved
    if (!isCommitted && editTitle.trim()) {
      onCommit?.(id)
    }
  }, [editTitle, title, id, onTitleChange, isCommitted, onCommit])

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleTitleBlur()
    } else if (e.key === 'Escape') {
      setEditTitle(title)
      setIsEditing(false)
    }
  }, [handleTitleBlur, title])

  // Global mouse handlers for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        onPositionChange?.(id, newX, newY)
      }
      const handleUp = () => {
        setIsDragging(false)
        onDragEnd?.(id)
      }
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [isDragging, dragOffset, id, onPositionChange, onDragEnd])

  // Get border color based on state
  const getBorderColor = () => {
    if (isEditing) return THEME.AMBER
    if (isSelected) return THEME.AMBER
    if (isHovered) return THEME.BORDER_LIGHT
    if (isCommitted) return THEME.BORDER
    return THEME.GREEN_BRIGHT  // New uncommitted card
  }

  // Get box shadow based on state
  const getBoxShadow = () => {
    if (isEditing) {
      return `0 0 16px rgba(212, 115, 12, 0.5), 0 0 32px rgba(212, 115, 12, 0.2)`
    }
    if (isSelected) {
      return `0 0 12px rgba(212, 115, 12, 0.3)`
    }
    if (!isCommitted) {
      return `0 0 8px rgba(0, 255, 0, 0.3)`
    }
    return 'none'
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: cardWidth,
        height: cardHeight,
        background: 'rgba(25, 25, 25, 0.95)',
        border: `${isSelected || isEditing ? 2 : 1}px solid ${getBorderColor()}`,
        borderRadius: 16,
        cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'grab',
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'border 0.15s ease, box-shadow 0.15s ease',
        boxShadow: getBoxShadow(),
        display: 'flex',
        flexDirection: 'row',
        userSelect: 'none',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 10
      }}
    >
      {/* Left Accent Bar (matches TIMETABLE LessonBlock) */}
      <div
        style={{
          width: 5,
          flexShrink: 0,
          background: typeColor,
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
          padding: '8px 12px',
          overflow: 'hidden'
        }}
      >
        {/* Lesson Title (editable) */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${THEME.AMBER}`,
              fontSize: '1.4vh',
              color: THEME.GREEN_BRIGHT,
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 400,
              outline: 'none',
              width: '100%',
              padding: '0 0 2px 0'
            }}
            placeholder="Enter lesson name..."
          />
        ) : (
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
            {title || (isHovered ? 'Double-click to name' : 'New Lesson')}
          </div>
        )}

        {/* Bottom row: Type + Duration */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {/* Type label */}
          <span
            style={{
              fontSize: '1.1vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: typeColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {type}
          </span>

          {/* Duration */}
          <span
            style={{
              fontSize: '1.1vh',
              color: isSelected ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO,
              transition: 'color 0.15s ease'
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* EDITING Label */}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 6,
            fontSize: '0.85vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_MONO,
            letterSpacing: '0.03em',
            textTransform: 'uppercase'
          }}
        >
          EDITING
        </div>
      )}
    </div>
  )
}

export default OverviewLessonCard
export { LESSON_TYPE_COLORS, DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT }
