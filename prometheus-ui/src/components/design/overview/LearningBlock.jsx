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

const BLOCK_TYPES = {
  TERM: { label: 'TERM', color: THEME.AMBER, minWidth: 200, minHeight: 80 },
  MODULE: { label: 'MODULE', color: THEME.AMBER_DARK, minWidth: 180, minHeight: 60 },
  WEEK: { label: 'WEEK', color: THEME.AMBER_DARK, minWidth: 150, minHeight: 50 },
  DAY: { label: 'DAY', color: THEME.AMBER_DARK, minWidth: 120, minHeight: 40 },
  LESSON: { label: 'LESSON', color: THEME.GREEN_BRIGHT, minWidth: 100, minHeight: 60 }
}

// Duration calculation based on block width (roughly 1 hour per 50px)
const PIXELS_PER_HOUR = 50

function LearningBlock({
  id,
  type = 'LESSON',
  title = '',
  x = 0,
  y = 0,
  width,
  height,
  onDragStart,
  onDragEnd,
  onPositionChange,
  onSizeChange,
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
  const blockWidth = width || blockConfig.minWidth
  const blockHeight = height || blockConfig.minHeight

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

  // Calculate duration from width
  const getDuration = () => {
    const hours = blockWidth / PIXELS_PER_HOUR
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      const remainingHours = Math.round(hours % 24)
      if (remainingHours > 0) {
        return `${days}d ${remainingHours}h`
      }
      return `${days}d`
    }
    if (hours >= 1) {
      return `${hours.toFixed(1)}h`
    }
    return `${Math.round(hours * 60)}m`
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

      // Handle horizontal resize
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(blockConfig.minWidth, resizeStart.width + deltaX)
      } else if (resizeHandle.includes('w')) {
        const widthDelta = Math.min(deltaX, resizeStart.width - blockConfig.minWidth)
        newWidth = resizeStart.width - widthDelta
        newX = resizeStart.x + widthDelta
      }

      // Handle vertical resize
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(blockConfig.minHeight, resizeStart.height + deltaY)
      } else if (resizeHandle.includes('n')) {
        const heightDelta = Math.min(deltaY, resizeStart.height - blockConfig.minHeight)
        newHeight = resizeStart.height - heightDelta
        newY = resizeStart.y + heightDelta
      }

      onSizeChange?.(id, newWidth, newHeight)
      if (newX !== x || newY !== y) {
        onPositionChange?.(id, newX, newY)
      }
    }
  }, [isDragging, isResizing, resizeHandle, dragOffset, resizeStart, id, x, y, blockConfig, onPositionChange, onSizeChange])

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
        borderRadius: isLesson ? '8px' : '12px',
        background: isLesson
          ? `linear-gradient(135deg, ${THEME.BG_PANEL} 0%, ${THEME.BG_DARK} 100%)`
          : THEME.BG_PANEL,
        border: `2px solid ${isSelected ? THEME.GREEN_BRIGHT : isHovered ? THEME.AMBER : blockConfig.color}`,
        boxShadow: isSelected
          ? `0 0 12px ${THEME.GREEN_BRIGHT}40`
          : isHovered
            ? `0 0 8px ${THEME.AMBER}40`
            : 'none',
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
            fontSize: '10px',
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
            fontSize: '9px',
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
            fontSize: isLesson ? '12px' : '14px',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.WHITE,
            background: 'transparent',
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '4px',
            padding: '2px 4px',
            outline: 'none',
            width: '100%'
          }}
        />
      ) : (
        <span
          style={{
            fontSize: isLesson ? '12px' : '14px',
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
export { BLOCK_TYPES }
