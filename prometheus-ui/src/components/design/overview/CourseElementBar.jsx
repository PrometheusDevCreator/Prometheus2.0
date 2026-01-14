/**
 * CourseElementBar - Expandable Bar Component for OVERVIEW Canvas (Phase 5)
 *
 * Types: TERM, MODULE, WEEK, DAY
 *
 * Features:
 * - Expandable horizontal bar (drag ends to adjust duration)
 * - (i) info button opens modal dialog for editing
 * - Title displayed in center
 * - Duration displayed on far right
 * - Border: Light grey default, burnt orange on hover/focus
 * - Height: 50% of Day bar height in Timetable
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'

// Bar configuration per type
const BAR_TYPES = {
  TERM: {
    label: 'Term',
    unit: 'week',
    startDuration: 8,
    minDuration: 4,
    maxDuration: 24,
    increment: 1,
    pixelsPerUnit: 50,
    color: '#e8a33a'
  },
  MODULE: {
    label: 'Module',
    unit: 'day',
    startDuration: 5,
    minDuration: 1,
    maxDuration: 30,
    increment: 1,
    pixelsPerUnit: 25,
    color: '#d4730c'
  },
  WEEK: {
    label: 'Week',
    unit: 'week',
    startDuration: 1,
    minDuration: 1,
    maxDuration: 8,
    increment: 1,
    pixelsPerUnit: 50,
    color: '#8B4513'
  },
  DAY: {
    label: 'Day',
    unit: 'day',
    startDuration: 1,
    minDuration: 1,
    maxDuration: 5,
    increment: 1,
    pixelsPerUnit: 25,
    color: '#5a3000'
  }
}

// Bar height: 50% of Timetable day bar (which is ~5vh, so ~2.5vh)
const BAR_HEIGHT = '2.5vh'
const BAR_MIN_HEIGHT = 24
const HANDLE_WIDTH = 8

function CourseElementBar({
  id,
  type = 'WEEK',
  title = '',
  duration,
  width,
  isSelected = false,
  onSelect,
  onWidthChange,
  onDurationChange,
  onTitleChange,
  onOpenModal  // Callback to open modal for editing
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 })
  const barRef = useRef(null)

  const barConfig = BAR_TYPES[type] || BAR_TYPES.WEEK

  // Calculate width from duration
  const barWidth = width || (duration
    ? duration * barConfig.pixelsPerUnit
    : barConfig.startDuration * barConfig.pixelsPerUnit)

  // Calculate current duration from width
  const currentDuration = duration || (barWidth / barConfig.pixelsPerUnit)

  // Format duration for display
  const formatDuration = () => {
    const dur = currentDuration
    const unit = barConfig.unit

    if (unit === 'week') {
      return dur === 1 ? '1 week' : `${Math.round(dur)} weeks`
    } else if (unit === 'day') {
      if (dur >= 7) {
        const weeks = Math.floor(dur / 7)
        const days = Math.round(dur % 7)
        if (days > 0) return `${weeks}w ${days}d`
        return weeks === 1 ? '1 week' : `${weeks} weeks`
      }
      return dur === 1 ? '1 day' : `${Math.round(dur)} days`
    }
    return `${Math.round(dur)}`
  }

  // Snap width to increment
  const snapWidth = useCallback((rawWidth) => {
    const pixelsPerIncrement = barConfig.pixelsPerUnit * barConfig.increment
    const snappedWidth = Math.round(rawWidth / pixelsPerIncrement) * pixelsPerIncrement
    const dur = snappedWidth / barConfig.pixelsPerUnit

    // Apply constraints
    const constrainedDur = Math.max(
      barConfig.minDuration,
      Math.min(dur, barConfig.maxDuration)
    )

    return constrainedDur * barConfig.pixelsPerUnit
  }, [barConfig])

  // Handle left resize
  const handleLeftMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsResizingLeft(true)
    setResizeStart({ x: e.clientX, width: barWidth })
  }, [barWidth])

  // Handle right resize
  const handleRightMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsResizingRight(true)
    setResizeStart({ x: e.clientX, width: barWidth })
  }, [barWidth])

  // Handle click to select
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onSelect?.(id)
  }, [id, onSelect])

  // Handle info button click
  const handleInfoClick = useCallback((e) => {
    e.stopPropagation()
    onOpenModal?.(id, type, { title, duration: currentDuration })
  }, [id, type, title, currentDuration, onOpenModal])

  // Global mouse handlers for left resize
  useEffect(() => {
    if (isResizingLeft) {
      const handleMove = (e) => {
        const deltaX = e.clientX - resizeStart.x
        const rawWidth = resizeStart.width - deltaX
        const newWidth = snapWidth(rawWidth)
        const newDuration = newWidth / barConfig.pixelsPerUnit

        onWidthChange?.(id, newWidth)
        onDurationChange?.(id, newDuration)
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
  }, [isResizingLeft, resizeStart, snapWidth, barConfig, id, onWidthChange, onDurationChange])

  // Global mouse handlers for right resize
  useEffect(() => {
    if (isResizingRight) {
      const handleMove = (e) => {
        const deltaX = e.clientX - resizeStart.x
        const rawWidth = resizeStart.width + deltaX
        const newWidth = snapWidth(rawWidth)
        const newDuration = newWidth / barConfig.pixelsPerUnit

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
  }, [isResizingRight, resizeStart, snapWidth, barConfig, id, onWidthChange, onDurationChange])

  const isInteracting = isSelected || isHovered
  const isResizing = isResizingLeft || isResizingRight
  const borderColor = isInteracting ? THEME.AMBER : THEME.BORDER

  return (
    <div
      ref={barRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isResizing && setIsHovered(false)}
      style={{
        width: barWidth,
        height: BAR_HEIGHT,
        minHeight: BAR_MIN_HEIGHT,
        background: THEME.BG_PANEL,
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: isResizing ? 'none' : 'border-color 0.2s ease, width 0.1s ease',
        userSelect: 'none'
      }}
    >
      {/* Left resize handle */}
      <div
        onMouseDown={handleLeftMouseDown}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: HANDLE_WIDTH,
          height: '100%',
          cursor: 'ew-resize',
          background: isResizingLeft ? THEME.AMBER : 'transparent',
          borderRadius: '4px 0 0 4px',
          transition: 'background 0.2s ease'
        }}
      />

      {/* Info button (i) - far left */}
      <button
        onClick={handleInfoClick}
        style={{
          marginLeft: HANDLE_WIDTH + 8,
          width: '2vh',
          height: '2vh',
          minWidth: 18,
          minHeight: 18,
          background: 'transparent',
          border: `1px solid ${isHovered ? THEME.AMBER : THEME.TEXT_DIM}`,
          borderRadius: '50%',
          color: isHovered ? THEME.AMBER : THEME.TEXT_DIM,
          fontSize: '1.2vh',
          fontFamily: THEME.FONT_PRIMARY,
          fontStyle: 'italic',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
      >
        i
      </button>

      {/* Title - center */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 1vw' }}>
        <span
          style={{
            fontSize: '1.3vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: title ? THEME.WHITE : THEME.TEXT_DIM,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {title || `${barConfig.label} 1`}
        </span>
      </div>

      {/* Duration - far right */}
      <span
        style={{
          marginRight: HANDLE_WIDTH + 8,
          fontSize: '1.2vh',
          fontFamily: THEME.FONT_MONO,
          color: isResizing ? THEME.AMBER : THEME.TEXT_DIM,
          flexShrink: 0,
          transition: 'color 0.2s ease'
        }}
      >
        {formatDuration()}
      </span>

      {/* Right resize handle */}
      <div
        onMouseDown={handleRightMouseDown}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: HANDLE_WIDTH,
          height: '100%',
          cursor: 'ew-resize',
          background: isResizingRight ? THEME.AMBER : 'transparent',
          borderRadius: '0 4px 4px 0',
          transition: 'background 0.2s ease'
        }}
      />
    </div>
  )
}

// ============================================
// INFO MODAL DIALOG (Phase 5)
// ============================================

function CourseElementModal({
  isOpen,
  elementId,
  elementType,
  elementData,
  onClose,
  onSave
}) {
  const [title, setTitle] = useState(elementData?.title || '')
  const [duration, setDuration] = useState(elementData?.duration || 1)
  const inputRef = useRef(null)

  const barConfig = BAR_TYPES[elementType] || BAR_TYPES.WEEK

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  // Update local state when elementData changes
  useEffect(() => {
    setTitle(elementData?.title || '')
    setDuration(elementData?.duration || barConfig.startDuration)
  }, [elementData, barConfig])

  const handleSave = () => {
    onSave?.(elementId, { title, duration })
    onClose?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '1.5vh',
          padding: '2vh 2vw',
          minWidth: '25vw',
          maxWidth: '40vw'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2vh' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.6vh',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.1em',
              color: THEME.AMBER
            }}
          >
            EDIT {elementType}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.TEXT_DIM,
              fontSize: '2vh',
              cursor: 'pointer',
              padding: '0.5vh'
            }}
          >
            ×
          </button>
        </div>

        {/* Title field */}
        <div style={{ marginBottom: '1.5vh' }}>
          <label
            style={{
              display: 'block',
              fontSize: '1.2vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.TEXT_SECONDARY,
              marginBottom: '0.5vh'
            }}
          >
            Title
          </label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${barConfig.label} 1`}
            style={{
              width: '100%',
              padding: '0.8vh 1vw',
              fontSize: '1.4vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '0.8vh',
              outline: 'none'
            }}
          />
        </div>

        {/* Duration field */}
        <div style={{ marginBottom: '2vh' }}>
          <label
            style={{
              display: 'block',
              fontSize: '1.2vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.TEXT_SECONDARY,
              marginBottom: '0.5vh'
            }}
          >
            Duration ({barConfig.unit}s)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Math.max(barConfig.minDuration, Math.min(barConfig.maxDuration, parseInt(e.target.value) || 1)))}
              min={barConfig.minDuration}
              max={barConfig.maxDuration}
              style={{
                width: '30%',
                padding: '0.8vh 1vw',
                fontSize: '1.4vh',
                fontFamily: THEME.FONT_MONO,
                color: THEME.WHITE,
                background: THEME.BG_INPUT,
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '0.8vh',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM }}>
              {barConfig.unit}(s)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1vw' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.8vh 1.5vw',
              fontSize: '1.3vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.TEXT_SECONDARY,
              background: 'transparent',
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '0.8vh',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.8vh 1.5vw',
              fontSize: '1.3vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              background: THEME.AMBER,
              border: 'none',
              borderRadius: '0.8vh',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseElementBar
export { CourseElementModal, BAR_TYPES }
