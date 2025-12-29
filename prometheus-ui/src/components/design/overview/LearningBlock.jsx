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
 * - Resize handles (future)
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../../constants/theme'

const BLOCK_TYPES = {
  TERM: { label: 'TERM', color: THEME.AMBER, minWidth: 200, minHeight: 80 },
  MODULE: { label: 'MODULE', color: THEME.AMBER_DARK, minWidth: 180, minHeight: 60 },
  WEEK: { label: 'WEEK', color: THEME.AMBER_DARK, minWidth: 150, minHeight: 50 },
  DAY: { label: 'DAY', color: THEME.AMBER_DARK, minWidth: 120, minHeight: 40 },
  LESSON: { label: 'LESSON', color: THEME.GREEN_BRIGHT, minWidth: 100, minHeight: 60 }
}

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
  onSelect,
  isSelected = false
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const blockConfig = BLOCK_TYPES[type] || BLOCK_TYPES.LESSON
  const blockWidth = width || blockConfig.minWidth
  const blockHeight = height || blockConfig.minHeight

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    })
    onDragStart?.(id)
  }, [x, y, id, onDragStart])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    onPositionChange?.(id, newX, newY)
  }, [isDragging, dragOffset, id, onPositionChange])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onDragEnd?.(id)
    }
  }, [isDragging, id, onDragEnd])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onSelect?.(id)
  }, [id, onSelect])

  // Lesson type has special styling
  const isLesson = type === 'LESSON'

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onClick={handleClick}
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
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'border-color 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 12px',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
        userSelect: 'none'
      }}
    >
      {/* Type label */}
      <span
        style={{
          fontSize: '10px',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.1em',
          color: blockConfig.color,
          marginBottom: '4px'
        }}
      >
        {blockConfig.label}
      </span>

      {/* Title/Content */}
      <span
        style={{
          fontSize: isLesson ? '12px' : '14px',
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.WHITE,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {title || `New ${blockConfig.label}`}
      </span>
    </div>
  )
}

export default LearningBlock
export { BLOCK_TYPES }
