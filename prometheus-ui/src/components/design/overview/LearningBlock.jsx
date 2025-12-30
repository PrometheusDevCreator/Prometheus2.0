/**
 * LearningBlock - Draggable Block Component for OVERVIEW Canvas
 *
 * Types: TERM, MODULE, WEEK, DAY, LESSON
 * - TERM, MODULE, WEEK, DAY: Burnt orange rounded rectangles
 * - LESSON: Styled as Lesson Cards (matching TimetableGrid)
 *
 * Features:
 * - Drag and drop positioning
 * - Click to select/edit
 * - Resize handles with duration readout
 * - Double-click to edit title
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'

// Duration unit conversion constants
const HOURS_PER_UNIT = {
  minute: 1/60,
  hour: 1,
  day: 24,
  week: 168  // 24 * 7
}

const BLOCK_TYPES = {
  TERM: {
    label: 'TERM',
    color: THEME.AMBER,
    minWidth: 200,
    minHeight: 80,
    // Duration config
    unit: 'week',
    startDuration: 8,      // 8 weeks
    minDuration: 8,
    maxDuration: 12,
    increment: 1,          // 1 week steps
    acceptsChildren: ['WEEK'],
    pixelsPerUnit: 100     // 100px per week for visual sizing
  },
  MODULE: {
    label: 'MODULE',
    color: THEME.AMBER_DARK,
    minWidth: 180,
    minHeight: 60,
    unit: 'day',
    startDuration: 1,      // 1 day
    minDuration: 1,
    maxDuration: null,
    increment: 1,          // 1 day steps
    acceptsChildren: ['LESSON', 'DAY'],
    pixelsPerUnit: 50      // 50px per day
  },
  WEEK: {
    label: 'WEEK',
    color: THEME.AMBER_DARK,
    minWidth: 150,
    minHeight: 50,
    unit: 'day',
    startDuration: 7,      // 1 week = 7 days
    minDuration: 1,
    maxDuration: null,
    increment: 1,          // 1 day steps
    acceptsChildren: ['DAY', 'MODULE'],
    pixelsPerUnit: 50      // 50px per day
  },
  DAY: {
    label: 'DAY',
    color: THEME.AMBER_DARK,
    minWidth: 120,
    minHeight: 40,
    unit: 'hour',
    startDuration: 24,     // 1 day = 24 hours
    minDuration: 1,
    maxDuration: null,
    increment: 1,          // 1 hour steps
    acceptsChildren: ['LESSON'],
    pixelsPerUnit: 20      // 20px per hour
  },
  LESSON: {
    label: 'LESSON',
    color: THEME.GREEN_BRIGHT,
    minWidth: 50,          // 15 min minimum
    minHeight: 60,
    unit: 'minute',
    startDuration: 30,     // 30 minutes
    minDuration: 15,
    maxDuration: null,
    increment: 15,         // 15 min steps
    acceptsChildren: [],   // Lessons cannot contain other blocks
    pixelsPerUnit: 3.33    // ~3.33px per minute (200px = 1 hour)
  }
}

// Nesting rules for hierarchy validation
const NESTING_RULES = {
  TERM: { canContain: ['WEEK'], canBeContainedBy: [] },
  WEEK: { canContain: ['DAY', 'MODULE'], canBeContainedBy: ['TERM'] },
  MODULE: { canContain: ['LESSON', 'DAY'], canBeContainedBy: ['WEEK'] },
  DAY: { canContain: ['LESSON'], canBeContainedBy: ['WEEK', 'MODULE'] },
  LESSON: { canContain: [], canBeContainedBy: ['DAY', 'MODULE'] }
}

// Border colors based on nesting depth (when block is in parent chain of active block)
const NESTING_BORDER_COLORS = [
  THEME.AMBER,         // Depth 0: Burnt orange (default)
  '#FFFFFF',           // Depth 1: White
  '#C0C0C0',           // Depth 2: Light grey
  '#808080',           // Depth 3: Mid grey
  '#404040',           // Depth 4: Dark grey
]

// Helper: Convert duration to hours (common base for scaling)
const convertToHours = (duration, unit) => duration * HOURS_PER_UNIT[unit]

// Helper: Convert hours to target unit
const convertFromHours = (hours, unit) => hours / HOURS_PER_UNIT[unit]

// Helper: Snap width to increment and apply constraints
const snapToIncrement = (newWidth, blockConfig) => {
  const pixelsPerIncrement = blockConfig.pixelsPerUnit * blockConfig.increment
  const snappedWidth = Math.round(newWidth / pixelsPerIncrement) * pixelsPerIncrement

  // Calculate duration from snapped width
  const duration = snappedWidth / blockConfig.pixelsPerUnit

  // Apply min/max constraints
  const constrainedDuration = Math.max(
    blockConfig.minDuration,
    blockConfig.maxDuration ? Math.min(duration, blockConfig.maxDuration) : duration
  )

  return constrainedDuration * blockConfig.pixelsPerUnit
}

// Helper: Get block border color based on state
const getBlockBorderColor = (isSelected, isHovered, isInActiveParentChain, nestingDepth, blockColor) => {
  if (isSelected) return THEME.GREEN_BRIGHT
  if (isInActiveParentChain) return NESTING_BORDER_COLORS[nestingDepth] || NESTING_BORDER_COLORS[4]
  if (isHovered) return THEME.AMBER
  return blockColor
}

function LearningBlock({
  id,
  type = 'LESSON',
  title = '',
  x = 0,
  y = 0,
  width,
  height,
  duration,              // Duration in block's unit (e.g., 30 for LESSON = 30 min)
  parentId = null,       // Reference to parent block (null if top-level)
  nestingDepth = 0,      // 0 = top-level, 1 = child, 2 = grandchild, etc.
  isInActiveParentChain = false,  // True if this block is a parent of the active block
  onDragStart,
  onDragEnd,
  onPositionChange,
  onSizeChange,
  onDurationChange,      // New: callback for duration changes
  onTitleChange,
  onSelect,
  isSelected = false
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const inputRef = useRef(null)

  const blockConfig = BLOCK_TYPES[type] || BLOCK_TYPES.LESSON

  // Calculate width from duration if provided, otherwise use default
  const blockWidth = width || (duration
    ? duration * blockConfig.pixelsPerUnit
    : blockConfig.startDuration * blockConfig.pixelsPerUnit)
  const blockHeight = height || blockConfig.minHeight

  // Calculate current duration from width
  const currentDuration = duration || (blockWidth / blockConfig.pixelsPerUnit)

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

  // Format duration for display based on block's unit
  const getDuration = () => {
    const unit = blockConfig.unit
    const dur = currentDuration

    switch (unit) {
      case 'week':
        return `${Math.round(dur)}w`
      case 'day':
        if (dur >= 7) {
          const weeks = Math.floor(dur / 7)
          const days = Math.round(dur % 7)
          return days > 0 ? `${weeks}w ${days}d` : `${weeks}w`
        }
        return `${Math.round(dur)}d`
      case 'hour':
        if (dur >= 24) {
          const days = Math.floor(dur / 24)
          const hours = Math.round(dur % 24)
          return hours > 0 ? `${days}d ${hours}h` : `${days}d`
        }
        return `${Math.round(dur)}h`
      case 'minute':
        if (dur >= 60) {
          const hours = Math.floor(dur / 60)
          const mins = Math.round(dur % 60)
          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${Math.round(dur)}m`
      default:
        return `${Math.round(dur)}`
    }
  }

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

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      onPositionChange?.(id, newX, newY)
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = x
      let newY = y

      // Handle horizontal resize with snapping
      if (resizeHandle.includes('e')) {
        const rawWidth = resizeStart.width + deltaX
        newWidth = snapToIncrement(rawWidth, blockConfig)
      } else if (resizeHandle.includes('w')) {
        const rawWidth = resizeStart.width - deltaX
        const snappedWidth = snapToIncrement(rawWidth, blockConfig)
        const widthChange = snappedWidth - resizeStart.width
        newWidth = snappedWidth
        newX = resizeStart.x - widthChange
      }

      // Handle vertical resize (no snapping for height)
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(blockConfig.minHeight, resizeStart.height + deltaY)
      } else if (resizeHandle.includes('n')) {
        const heightDelta = Math.min(deltaY, resizeStart.height - blockConfig.minHeight)
        newHeight = resizeStart.height - heightDelta
        newY = resizeStart.y + heightDelta
      }

      // Calculate new duration from snapped width
      const newDuration = newWidth / blockConfig.pixelsPerUnit

      onSizeChange?.(id, newWidth, newHeight)
      onDurationChange?.(id, newDuration)
      if (newX !== x || newY !== y) {
        onPositionChange?.(id, newX, newY)
      }
    }
  }, [isDragging, isResizing, resizeHandle, dragOffset, resizeStart, id, x, y, blockConfig, onPositionChange, onSizeChange, onDurationChange])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onDragEnd?.(id)
    }
    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
    }
  }, [isDragging, isResizing, id, onDragEnd])

  const handleClick = useCallback((e) => {
    if (isEditing) return
    e.stopPropagation()
    onSelect?.(id)
  }, [id, onSelect, isEditing])

  // Double-click to edit title
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
  }, [editTitle, title, id, onTitleChange])

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleTitleBlur()
    } else if (e.key === 'Escape') {
      setEditTitle(title)
      setIsEditing(false)
    }
  }, [handleTitleBlur, title])

  // Start resize from handle
  const handleResizeStart = useCallback((handle) => (e) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: blockWidth,
      height: blockHeight
    })
  }, [blockWidth, blockHeight])

  // Lesson type has special styling
  const isLesson = type === 'LESSON'

  // Calculate border color based on state and nesting
  const borderColor = getBlockBorderColor(isSelected, isHovered, isInActiveParentChain, nestingDepth, blockConfig.color)

  // Calculate box shadow (green glow for active or top-level parent in active chain)
  const isTopLevelActiveParent = isInActiveParentChain && nestingDepth === 0
  const boxShadow = isSelected
    ? `0 0 12px ${THEME.GREEN_BRIGHT}40`
    : isTopLevelActiveParent
      ? `0 0 8px ${THEME.GREEN_BRIGHT}30`
      : isHovered
        ? `0 0 8px ${THEME.AMBER}40`
        : 'none'

  // Resize handle style
  const handleStyle = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    background: THEME.AMBER,
    border: `1px solid ${THEME.BG_DARK}`,
    borderRadius: '2px',
    opacity: isSelected || isHovered ? 1 : 0,
    transition: 'opacity 0.2s ease'
  }

  // Global mouse handlers for drag outside component
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y
        onPositionChange?.(id, newX, newY)
      }
      const handleGlobalUp = () => {
        setIsDragging(false)
        onDragEnd?.(id)
      }
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove)
        window.removeEventListener('mouseup', handleGlobalUp)
      }
    }
  }, [isDragging, dragOffset, id, onPositionChange, onDragEnd])

  // Global mouse handlers for resize outside component
  useEffect(() => {
    if (isResizing) {
      const handleGlobalMove = (e) => handleMouseMove(e)
      const handleGlobalUp = () => {
        setIsResizing(false)
        setResizeHandle(null)
      }
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove)
        window.removeEventListener('mouseup', handleGlobalUp)
      }
    }
  }, [isResizing, handleMouseMove])

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => !isDragging && !isResizing && setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: blockWidth,
        height: blockHeight,
        borderRadius: isLesson ? '1.5vh' : '1.85vh',  // Match action button style
        background: isLesson
          ? `linear-gradient(135deg, ${THEME.BG_PANEL} 0%, ${THEME.BG_DARK} 100%)`
          : THEME.BG_PANEL,
        border: `2px solid ${borderColor}`,
        boxShadow: boxShadow,
        cursor: isDragging ? 'grabbing' : isResizing ? 'nwse-resize' : 'grab',
        transition: isDragging || isResizing ? 'none' : 'border-color 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 12px',
        zIndex: isDragging || isResizing ? 1000 : isSelected ? 100 : 10,
        userSelect: 'none'
      }}
    >
      {/* Type label with duration */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}
      >
        <span
          style={{
            fontSize: '1.3vh',  // Increased from 10px (+25%)
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.1em',
            color: blockConfig.color
          }}
        >
          {blockConfig.label}
        </span>
        {/* Duration readout */}
        <span
          style={{
            fontSize: '1.17vh',  // Increased from 9px (+25%)
            fontFamily: THEME.FONT_MONO,
            color: isResizing ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
            transition: 'color 0.2s ease'
          }}
        >
          {getDuration()}
        </span>
      </div>

      {/* Title/Content - editable on double-click */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          style={{
            fontSize: isLesson ? '1.6vh' : '1.85vh',  // Increased from 12px/14px (+25%)
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.WHITE,
            background: 'transparent',
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '1vh',  // Match button style
            padding: '2px 4px',
            outline: 'none',
            width: '100%'
          }}
        />
      ) : (
        <span
          style={{
            fontSize: isLesson ? '1.6vh' : '1.85vh',  // Increased from 12px/14px (+25%)
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.WHITE,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {title || `New ${blockConfig.label}`}
        </span>
      )}

      {/* Resize handles - corners */}
      {/* Top-left */}
      <div
        style={{
          ...handleStyle,
          top: -4,
          left: -4,
          cursor: 'nwse-resize'
        }}
        onMouseDown={handleResizeStart('nw')}
      />
      {/* Top-right */}
      <div
        style={{
          ...handleStyle,
          top: -4,
          right: -4,
          cursor: 'nesw-resize'
        }}
        onMouseDown={handleResizeStart('ne')}
      />
      {/* Bottom-left */}
      <div
        style={{
          ...handleStyle,
          bottom: -4,
          left: -4,
          cursor: 'nesw-resize'
        }}
        onMouseDown={handleResizeStart('sw')}
      />
      {/* Bottom-right */}
      <div
        style={{
          ...handleStyle,
          bottom: -4,
          right: -4,
          cursor: 'nwse-resize'
        }}
        onMouseDown={handleResizeStart('se')}
      />

      {/* Resize handles - edges */}
      {/* Top */}
      <div
        style={{
          ...handleStyle,
          top: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize'
        }}
        onMouseDown={handleResizeStart('n')}
      />
      {/* Bottom */}
      <div
        style={{
          ...handleStyle,
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'ns-resize'
        }}
        onMouseDown={handleResizeStart('s')}
      />
      {/* Left */}
      <div
        style={{
          ...handleStyle,
          left: -4,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'ew-resize'
        }}
        onMouseDown={handleResizeStart('w')}
      />
      {/* Right */}
      <div
        style={{
          ...handleStyle,
          right: -4,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'ew-resize'
        }}
        onMouseDown={handleResizeStart('e')}
      />
    </div>
  )
}

export default LearningBlock
export { BLOCK_TYPES, NESTING_RULES, HOURS_PER_UNIT, convertToHours, convertFromHours }
