/**
 * LessonMarker - Vertical Marker Component for Lessons on Lines
 *
 * Item 10: When lesson is dragged to parent line, it becomes a vertical marker
 * Item 11: Hover/click marker reveals lesson card
 * Item 12: Markers are draggable
 *
 * Appearance:
 * - Burnt orange gradient vertical line/bar
 * - No text label on the marker itself
 * - Hovering reveals the full lesson card popup
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'

const MARKER_WIDTH = 8
const MARKER_HEIGHT = 30

function LessonMarker({
  id,
  lessonData,  // Full lesson data for the popup card
  x = 0,
  y = 0,
  parentLineId,
  onDragStart,
  onDragEnd,
  onPositionChange,
  onSelect,
  onDetach,  // Called when marker is dragged away from parent line
  isSelected = false
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const markerRef = useRef(null)
  const hoverTimeoutRef = useRef(null)

  // Handle marker drag
  const handleMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y
    })
    setShowCard(false)  // Hide card while dragging
    onDragStart?.(id)
  }, [x, y, id, onDragStart])

  // Handle click to select/toggle card
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    setShowCard(prev => !prev)
    onSelect?.(id)
  }, [id, onSelect])

  // Handle hover enter - show card after short delay
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!isDragging) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowCard(true)
      }, 300)  // 300ms delay before showing card
    }
  }, [isDragging])

  // Handle hover leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    // Don't hide card on leave - let click toggle it
  }, [])

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

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Get marker color based on state
  const getMarkerColor = () => {
    if (isSelected || isHovered) {
      return THEME.AMBER
    }
    return `linear-gradient(180deg, ${THEME.AMBER} 0%, ${THEME.AMBER_DARK || '#8B4513'} 100%)`
  }

  return (
    <>
      {/* The vertical marker */}
      <div
        ref={markerRef}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: MARKER_WIDTH,
          height: MARKER_HEIGHT,
          background: getMarkerColor(),
          borderRadius: MARKER_WIDTH / 2,
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isSelected || isHovered
            ? `0 0 10px ${THEME.AMBER}80`
            : 'none',
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          zIndex: isDragging ? 1000 : isSelected ? 100 : 50
        }}
      />

      {/* Popup lesson card (Item 11) */}
      {showCard && lessonData && !isDragging && (
        <LessonCardPopup
          lesson={lessonData}
          x={x + MARKER_WIDTH + 10}
          y={y - 20}
          onClose={() => setShowCard(false)}
        />
      )}
    </>
  )
}

// Popup card that appears on hover/click of marker
function LessonCardPopup({ lesson, x, y, onClose }) {
  const popupRef = useRef(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Format duration
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        minWidth: 180,
        background: 'rgba(25, 25, 25, 0.98)',
        border: `1px solid ${THEME.AMBER}`,
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: `0 0 20px rgba(0, 0, 0, 0.6), 0 0 10px ${THEME.AMBER}40`,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      {/* Lesson type indicator */}
      <div
        style={{
          fontSize: '1.1vh',
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.GREEN_BRIGHT,
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}
      >
        {lesson.type || 'LESSON'}
      </div>

      {/* Lesson title */}
      <div
        style={{
          fontSize: '1.4vh',
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.WHITE,
          fontWeight: 500
        }}
      >
        {lesson.title || 'Untitled Lesson'}
      </div>

      {/* Duration */}
      <div
        style={{
          fontSize: '1.1vh',
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_DIM
        }}
      >
        {formatDuration(lesson.duration || 30)}
      </div>

      {/* Time if scheduled */}
      {lesson.startTime && (
        <div
          style={{
            fontSize: '1vh',
            fontFamily: THEME.FONT_MONO,
            color: THEME.AMBER
          }}
        >
          {lesson.startTime.slice(0, 2)}:{lesson.startTime.slice(2, 4) || '00'}
        </div>
      )}
    </div>
  )
}

export default LessonMarker
export { MARKER_WIDTH, MARKER_HEIGHT }
