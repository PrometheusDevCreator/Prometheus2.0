/**
 * CourseLine - Stretchable Horizontal Line Component for OVERVIEW Canvas
 *
 * Types: TERM, MODULE, WEEK, DAY (LESSON uses cards, not lines)
 *
 * Features:
 * - Horizontal stretchable line (drag ends to adjust duration)
 * - Click-drag center to move entire line
 * - Double-click to edit title (underline style input)
 * - Color states: New (green), Committed (white), Hover (orange)
 *
 * Item 7 Implementation
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'

// Line height constant
const LINE_HEIGHT = 4
const HANDLE_SIZE = 12
const LABEL_HEIGHT = 24

// Duration constraints per type
const LINE_TYPES = {
  TERM: {
    label: 'TERM',
    unit: 'week',
    startDuration: 8,
    minDuration: 6,
    maxDuration: 20,
    increment: 1,
    pixelsPerUnit: 60
  },
  MODULE: {
    label: 'MODULE',
    unit: 'day',
    startDuration: 5,
    minDuration: 1,
    maxDuration: null,  // Can grow to weeks
    increment: 1,
    pixelsPerUnit: 30
  },
  WEEK: {
    label: 'WEEK',
    unit: 'week',
    startDuration: 1,
    minDuration: 1,
    maxDuration: 20,
    increment: 1,
    pixelsPerUnit: 60
  },
  DAY: {
    label: 'DAY',
    unit: 'day',
    startDuration: 1,
    minDuration: 1,
    maxDuration: 15,
    increment: 1,
    pixelsPerUnit: 30
  }
}

// Nesting rules for stacking
const LINE_NESTING = {
  TERM: { canContain: ['WEEK', 'MODULE'], canBeContainedBy: [] },
  WEEK: { canContain: ['DAY', 'MODULE'], canBeContainedBy: ['TERM'] },
  MODULE: { canContain: ['DAY'], canBeContainedBy: ['TERM', 'WEEK'] },
  DAY: { canContain: [], canBeContainedBy: ['WEEK', 'MODULE'] }
}

function CourseLine({
  id,
  type = 'WEEK',
  title = '',
  x = 0,
  y = 0,
  width,
  duration,
  isCommitted = false,  // False = new (green), True = committed (white)
  parentId = null,
  nestingDepth = 0,
  onDragStart,
  onDragEnd,
  onPositionChange,
  onWidthChange,
  onDurationChange,
  onTitleChange,
  onCommit,
  onSelect,
  isSelected = false,
  // Stacking props (Item 7.VI)
  isPotentialParent = false,  // True when another line is being dragged over this one
  isPotentialChild = false,   // True when this line is being dragged over a valid parent
  isNested = false            // True when this line is nested inside a parent
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0, lineX: 0 })
  const inputRef = useRef(null)

  const lineConfig = LINE_TYPES[type] || LINE_TYPES.WEEK

  // Calculate width from duration
  const lineWidth = width || (duration
    ? duration * lineConfig.pixelsPerUnit
    : lineConfig.startDuration * lineConfig.pixelsPerUnit)

  // Calculate current duration from width
  const currentDuration = duration || (lineWidth / lineConfig.pixelsPerUnit)

  // Determine line color based on state (Item 7.I, 7.VI)
  const getLineColor = () => {
    if (isPotentialParent || isPotentialChild) return '#FFFFFF'  // White glow during stacking
    if (isSelected || isHovered) return THEME.AMBER  // Burnt orange on hover/click
    if (isCommitted) return '#FFFFFF'  // White when committed
    return THEME.GREEN_BRIGHT  // Luminous green when new
  }

  // Get box shadow for stacking visual feedback
  const getBoxShadow = () => {
    if (isPotentialParent || isPotentialChild) {
      return '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)'
    }
    return 'none'
  }

  // Format duration for display
  const formatDuration = () => {
    const dur = currentDuration
    const unit = lineConfig.unit

    if (unit === 'week') {
      return `${Math.round(dur)}w`
    } else if (unit === 'day') {
      if (dur >= 7) {
        const weeks = Math.floor(dur / 7)
        const days = Math.round(dur % 7)
        return days > 0 ? `${weeks}w ${days}d` : `${weeks}w`
      }
      return `${Math.round(dur)}d`
    }
    return `${Math.round(dur)}`
  }

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Update local title when prop changes
  useEffect(() => {
    setEditTitle(title)
  }, [title])

  // Snap width to increment
  const snapWidth = useCallback((rawWidth) => {
    const pixelsPerIncrement = lineConfig.pixelsPerUnit * lineConfig.increment
    const snappedWidth = Math.round(rawWidth / pixelsPerIncrement) * pixelsPerIncrement
    const dur = snappedWidth / lineConfig.pixelsPerUnit

    // Apply constraints
    const constrainedDur = Math.max(
      lineConfig.minDuration,
      lineConfig.maxDuration ? Math.min(dur, lineConfig.maxDuration) : dur
    )

    return constrainedDur * lineConfig.pixelsPerUnit
  }, [lineConfig])

  // Handle center drag (move entire line)
  const handleCenterMouseDown = useCallback((e) => {
    if (isEditing) return
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    })
    onDragStart?.(id)
  }, [x, y, id, onDragStart, isEditing])

  // Handle left resize (Item 7.II)
  const handleLeftMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsResizingLeft(true)
    setResizeStart({
      x: e.clientX,
      width: lineWidth,
      lineX: x
    })
  }, [lineWidth, x])

  // Handle right resize (Item 7.II)
  const handleRightMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsResizingRight(true)
    setResizeStart({
      x: e.clientX,
      width: lineWidth,
      lineX: x
    })
  }, [lineWidth, x])

  // Handle click to select
  const handleClick = useCallback((e) => {
    if (isEditing) return
    e.stopPropagation()
    onSelect?.(id)
  }, [id, onSelect, isEditing])

  // Handle double-click to edit (Item 7.III)
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  // Handle title edit completion (Item 7.IV)
  const handleTitleBlur = useCallback(() => {
    setIsEditing(false)
    if (editTitle !== title) {
      onTitleChange?.(id, editTitle)
    }
    // Commit the line when title is saved
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

  // Global mouse handlers for left resize
  useEffect(() => {
    if (isResizingLeft) {
      const handleMove = (e) => {
        const deltaX = e.clientX - resizeStart.x
        const rawWidth = resizeStart.width - deltaX
        const newWidth = snapWidth(rawWidth)
        const widthChange = newWidth - resizeStart.width
        const newX = resizeStart.lineX - widthChange
        const newDuration = newWidth / lineConfig.pixelsPerUnit

        onWidthChange?.(id, newWidth)
        onDurationChange?.(id, newDuration)
        onPositionChange?.(id, newX, y)
      }
      const handleUp = () => {
        setIsResizingLeft(false)
      }
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [isResizingLeft, resizeStart, snapWidth, lineConfig, id, y, onWidthChange, onDurationChange, onPositionChange])

  // Global mouse handlers for right resize
  useEffect(() => {
    if (isResizingRight) {
      const handleMove = (e) => {
        const deltaX = e.clientX - resizeStart.x
        const rawWidth = resizeStart.width + deltaX
        const newWidth = snapWidth(rawWidth)
        const newDuration = newWidth / lineConfig.pixelsPerUnit

        onWidthChange?.(id, newWidth)
        onDurationChange?.(id, newDuration)
      }
      const handleUp = () => {
        setIsResizingRight(false)
      }
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [isResizingRight, resizeStart, snapWidth, lineConfig, id, onWidthChange, onDurationChange])

  const lineColor = getLineColor()
  const boxShadow = getBoxShadow()
  const isResizing = isResizingLeft || isResizingRight

  // Calculate indent for nested lines
  const nestIndent = isNested ? (nestingDepth * 20) : 0

  return (
    <div
      style={{
        position: 'absolute',
        left: x + nestIndent,
        top: y,
        width: lineWidth - nestIndent,
        height: LABEL_HEIGHT + LINE_HEIGHT + 8,
        zIndex: isDragging || isResizing ? 1000 : isSelected ? 100 : 10,
        userSelect: 'none',
        filter: (isPotentialParent || isPotentialChild) ? 'brightness(1.2)' : 'none',
        transition: isDragging || isResizing ? 'none' : 'filter 0.2s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && !isResizing && setIsHovered(false)}
    >
      {/* Label row: Type + Title + Duration */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px',
          height: LABEL_HEIGHT
        }}
      >
        {/* Fixed type label (Item 7.III) - White font */}
        <span
          style={{
            fontSize: '1.4vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.15em',
            color: THEME.WHITE,
            fontWeight: 600
          }}
        >
          {lineConfig.label}
        </span>

        {/* Editable title (Item 7.III, 7.IV, 7.V) */}
        <div style={{ flex: 1, position: 'relative' }}>
          {isEditing ? (
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                style={{
                  width: '100%',
                  fontSize: '1.4vh',
                  fontFamily: THEME.FONT_PRIMARY,
                  color: THEME.GREEN_BRIGHT,  // Item 7.V: Active = green
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${THEME.AMBER}`,  // Item 7.IV: Orange underline
                  outline: 'none',
                  padding: '2px 0'
                }}
                placeholder="Enter name..."
              />
            </div>
          ) : (
            <span
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              style={{
                fontSize: '1.4vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: isCommitted ? THEME.AMBER : THEME.GREEN_BRIGHT,  // Item 7.V
                cursor: 'text',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title || (isHovered ? 'Double-click to name' : '')}
            </span>
          )}
        </div>

        {/* Duration label (light grey, small font) */}
        <span
          style={{
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_MONO,
            color: isResizing ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
            transition: 'color 0.2s ease'
          }}
        >
          {formatDuration()}
        </span>
      </div>

      {/* The actual line with drag handles */}
      <div
        style={{
          position: 'relative',
          height: LINE_HEIGHT,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Left handle (Item 7.II) */}
        <div
          onMouseDown={handleLeftMouseDown}
          style={{
            position: 'absolute',
            left: -HANDLE_SIZE / 2,
            top: '50%',
            transform: 'translateY(-50%)',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: lineColor,
            borderRadius: '50%',
            cursor: 'ew-resize',
            opacity: isSelected || isHovered ? 1 : 0.5,
            transition: 'opacity 0.2s ease',
            zIndex: 10
          }}
        />

        {/* Main line (draggable center) */}
        <div
          onMouseDown={handleCenterMouseDown}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={{
            flex: 1,
            height: LINE_HEIGHT,
            background: lineColor,
            cursor: isDragging ? 'grabbing' : 'grab',
            borderRadius: LINE_HEIGHT / 2,
            boxShadow: boxShadow,
            transition: isDragging || isResizing ? 'none' : 'background 0.2s ease, box-shadow 0.2s ease'
          }}
        />

        {/* Right handle (Item 7.II) */}
        <div
          onMouseDown={handleRightMouseDown}
          style={{
            position: 'absolute',
            right: -HANDLE_SIZE / 2,
            top: '50%',
            transform: 'translateY(-50%)',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: lineColor,
            borderRadius: '50%',
            cursor: 'ew-resize',
            opacity: isSelected || isHovered ? 1 : 0.5,
            transition: 'opacity 0.2s ease',
            zIndex: 10
          }}
        />
      </div>
    </div>
  )
}

export default CourseLine
export { LINE_TYPES, LINE_NESTING }
