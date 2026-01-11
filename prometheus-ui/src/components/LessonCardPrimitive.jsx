/**
 * LessonCardPrimitive.jsx - Unified Lesson Card Component
 *
 * PHASE 2 - SHARED PRIMITIVES
 *
 * This is the canonical shared primitive for displaying lesson cards
 * across all Design/Build views. It replaces the previous 4 separate
 * implementations:
 * - LessonCard.jsx (Library)
 * - LessonBlock.jsx (Timetable)
 * - OverviewLessonCard.jsx (Overview)
 * - LessonMarker.jsx (Marker - remains separate due to different form factor)
 *
 * Visual Structure:
 * ┌────────────────────────────┐
 * │ [type accent stripe]       │
 * │ Lesson Title               │
 * │ Duration / Time Range      │
 * └────────────────────────────┘
 *
 * Variants:
 * - library: Drag-to-schedule, saved indicator
 * - timetable: Drag-to-move, resize, inline edit, context menu
 * - overview: Absolute position, mouse drag, commit indicator
 * - compact: Minimal display for lists/dropdowns
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { THEME } from '../constants/theme'

// ============================================
// DEFAULT LESSON TYPES (fallback if not provided)
// ============================================
const DEFAULT_LESSON_TYPES = [
  { id: 'lecture', label: 'Lecture', color: THEME.AMBER },
  { id: 'tutorial', label: 'Tutorial', color: '#4CAF50' },
  { id: 'lab', label: 'Lab', color: '#2196F3' },
  { id: 'workshop', label: 'Workshop', color: '#9C27B0' },
  { id: 'seminar', label: 'Seminar', color: '#FF9800' },
  { id: 'assessment', label: 'Assessment', color: '#F44336' },
  { id: 'break', label: 'Break', color: '#607D8B' },
  { id: 'self_study', label: 'Self Study', color: '#00BCD4' },
  { id: 'fieldwork', label: 'Fieldwork', color: '#8BC34A' },
  { id: 'other', label: 'Other', color: '#757575' }
]

// ============================================
// VARIANT CONFIGURATIONS
// ============================================
const VARIANT_DEFAULTS = {
  library: {
    dragMode: 'html5',
    dragType: 'schedule',
    showTime: false,
    showTypeLabel: true,
    showDuration: true,
    showSavedIndicator: true,
    editable: false,
    resizable: false,
    contextMenuEnabled: false
  },
  timetable: {
    dragMode: 'html5',
    dragType: 'move',
    showTime: true,
    showTypeLabel: false,
    showDuration: true,
    showSavedIndicator: false,
    editable: true,
    resizable: true,
    contextMenuEnabled: true
  },
  overview: {
    dragMode: 'mouse',
    dragType: 'canvas',
    showTime: false,
    showTypeLabel: true,
    showDuration: true,
    showSavedIndicator: false,
    editable: true,
    resizable: false,
    contextMenuEnabled: false
  },
  compact: {
    dragMode: 'none',
    dragType: null,
    showTime: false,
    showTypeLabel: false,
    showDuration: true,
    showSavedIndicator: false,
    editable: false,
    resizable: false,
    contextMenuEnabled: false
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
function LessonCardPrimitive({
  // Lesson data (required)
  lesson,

  // Variant determines default behavior (required)
  variant = 'library',

  // Lesson types configuration (optional, uses default if not provided)
  lessonTypes = DEFAULT_LESSON_TYPES,

  // Selection state (controlled from parent)
  isSelected = false,
  isEditing = false,

  // Status indicators
  isSaved = false,
  isCommitted = true,
  hasLO = true,

  // Selection handlers
  onSelect,
  onStartEditing,
  onUpdate,

  // Drag handlers
  onDragStart,
  onDragEnd,
  onPositionChange,

  // Position (for overview variant)
  position = null,  // { x, y }

  // Resize handlers (timetable variant)
  onResize,

  // Context menu handlers (timetable variant)
  onContextMenu,

  // Delete handler
  onDelete,

  // Dimension props
  width,
  height,

  // Grid params (timetable variant)
  pixelsPerMinute = 2,
  startHour = 8,
  useFullWidth = false,

  // Feature overrides (optional - override variant defaults)
  showTime,
  showTypeLabel,
  showDuration,
  showSavedIndicator,
  editable,
  resizable,
  contextMenuEnabled,
  dragMode: dragModeOverride,
  dragType: dragTypeOverride
}) {
  // Get variant config with overrides
  const variantConfig = useMemo(() => ({
    ...VARIANT_DEFAULTS[variant] || VARIANT_DEFAULTS.library,
    ...(showTime !== undefined && { showTime }),
    ...(showTypeLabel !== undefined && { showTypeLabel }),
    ...(showDuration !== undefined && { showDuration }),
    ...(showSavedIndicator !== undefined && { showSavedIndicator }),
    ...(editable !== undefined && { editable }),
    ...(resizable !== undefined && { resizable }),
    ...(contextMenuEnabled !== undefined && { contextMenuEnabled }),
    ...(dragModeOverride !== undefined && { dragMode: dragModeOverride }),
    ...(dragTypeOverride !== undefined && { dragType: dragTypeOverride })
  }), [variant, showTime, showTypeLabel, showDuration, showSavedIndicator, editable, resizable, contextMenuEnabled, dragModeOverride, dragTypeOverride])

  // Refs
  const cardRef = useRef(null)
  const titleInputRef = useRef(null)
  const dragStartRef = useRef(null)

  // Local state
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Inline editing state
  const [editTitle, setEditTitle] = useState(lesson?.title || '')
  const [editStartTime, setEditStartTime] = useState(lesson?.startTime || '')
  const [editDuration, setEditDuration] = useState((lesson?.duration || 30).toString())

  // Sync edit state when lesson changes
  useEffect(() => {
    if (lesson) {
      setEditTitle(lesson.title || '')
      setEditStartTime(lesson.startTime || '')
      setEditDuration((lesson.duration || 30).toString())
    }
  }, [lesson?.title, lesson?.startTime, lesson?.duration])

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditing])

  // Get lesson type info
  const lessonType = useMemo(() =>
    lessonTypes.find(t => t.id === lesson?.type) || lessonTypes[0] || DEFAULT_LESSON_TYPES[0],
    [lesson?.type, lessonTypes]
  )

  // Check if lesson needs LO warning (BREAK lessons exempt)
  const isBreakLesson = lesson?.type === 'break'
  const showNoLOWarning = !isBreakLesson && !hasLO && (lesson?.learningObjectives?.length === 0 && !lesson?.loId)

  // ============================================
  // TIME FORMATTING
  // ============================================
  const formatTime = useCallback((timeStr) => {
    if (!timeStr) return '----'
    return timeStr.slice(0, 2) + ':' + (timeStr.slice(2, 4) || '00')
  }, [])

  const calculateEndTime = useCallback(() => {
    if (!lesson?.startTime) return '----'
    const startHr = parseInt(lesson.startTime.slice(0, 2))
    const startMin = parseInt(lesson.startTime.slice(2, 4)) || 0
    const totalMinutes = startHr * 60 + startMin + (lesson.duration || 0)
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMin = totalMinutes % 60
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }, [lesson?.startTime, lesson?.duration])

  const formatDuration = useCallback((mins) => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60)
      const remaining = mins % 60
      return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
    }
    return `${mins}m`
  }, [])

  // ============================================
  // INLINE EDITING
  // ============================================
  const saveEdits = useCallback(() => {
    const updates = {}

    if (editTitle.trim() && editTitle !== lesson?.title) {
      updates.title = editTitle.trim()
    }

    if (editStartTime && variantConfig.showTime) {
      const cleanTime = editStartTime.replace(':', '')
      if (/^\d{4}$/.test(cleanTime) && cleanTime !== lesson?.startTime) {
        updates.startTime = cleanTime
      }
    }

    const newDuration = parseInt(editDuration)
    if (!isNaN(newDuration) && newDuration > 0 && newDuration !== lesson?.duration) {
      updates.duration = Math.max(5, Math.min(480, newDuration))
    }

    if (Object.keys(updates).length > 0) {
      onUpdate?.(lesson.id, updates)
    }
  }, [editTitle, editStartTime, editDuration, lesson, onUpdate, variantConfig.showTime])

  const cancelEdits = useCallback(() => {
    setEditTitle(lesson?.title || '')
    setEditStartTime(lesson?.startTime || '')
    setEditDuration((lesson?.duration || 30).toString())
  }, [lesson])

  const handleEditKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdits()
      onSelect?.(null) // Clear selection
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdits()
      onSelect?.(null)
    }
    e.stopPropagation()
  }, [saveEdits, cancelEdits, onSelect])

  // ============================================
  // CLICK HANDLERS
  // ============================================
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (!isEditing) {
      onSelect?.(lesson?.id)
    }
  }, [isEditing, onSelect, lesson?.id])

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    if (variantConfig.editable) {
      onStartEditing?.(lesson?.id)
    }
  }, [variantConfig.editable, onStartEditing, lesson?.id])

  const handleContextMenuClick = useCallback((e) => {
    if (!variantConfig.contextMenuEnabled) return
    e.preventDefault()
    e.stopPropagation()
    onSelect?.(lesson?.id)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [variantConfig.contextMenuEnabled, onSelect, lesson?.id])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // ============================================
  // DRAG HANDLERS (HTML5)
  // ============================================
  const handleHtml5DragStart = useCallback((e) => {
    if (variantConfig.dragMode !== 'html5') return

    const blockRect = cardRef.current?.getBoundingClientRect()
    const grabOffsetX = blockRect ? e.clientX - blockRect.left : 0

    e.dataTransfer.setData('lessonId', lesson?.id || '')
    e.dataTransfer.setData('dragType', variantConfig.dragType || 'move')
    e.dataTransfer.setData('grabOffsetX', grabOffsetX.toString())
    e.dataTransfer.effectAllowed = 'move'

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTime: lesson?.startTime,
      day: lesson?.day,
      grabOffsetX
    }

    setIsDragging(true)
    onDragStart?.(lesson?.id, e)
  }, [variantConfig.dragMode, variantConfig.dragType, lesson, onDragStart])

  const handleHtml5DragEnd = useCallback(() => {
    setIsDragging(false)
    onDragEnd?.(lesson?.id)
  }, [onDragEnd, lesson?.id])

  // ============================================
  // DRAG HANDLERS (Mouse-based for overview)
  // ============================================
  const handleMouseDragStart = useCallback((e) => {
    if (variantConfig.dragMode !== 'mouse' || isEditing) return
    e.stopPropagation()

    const currentX = position?.x ?? 0
    const currentY = position?.y ?? 0

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    })
    onDragStart?.(lesson?.id)
  }, [variantConfig.dragMode, isEditing, position, onDragStart, lesson?.id])

  // Global mouse handlers for mouse-based dragging
  useEffect(() => {
    if (variantConfig.dragMode !== 'mouse' || !isDragging) return

    const handleMove = (e) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      onPositionChange?.(lesson?.id, newX, newY)
    }
    const handleUp = () => {
      setIsDragging(false)
      onDragEnd?.(lesson?.id)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [variantConfig.dragMode, isDragging, dragOffset, lesson?.id, onPositionChange, onDragEnd])

  // ============================================
  // RESIZE HANDLERS (Timetable only)
  // ============================================
  const handleResizeRight = useCallback((e) => {
    if (!variantConfig.resizable) return
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startDuration = lesson?.duration || 30

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaMinutes = deltaX / pixelsPerMinute
      const newDuration = Math.max(5, startDuration + deltaMinutes)
      const snappedDuration = Math.round(newDuration / 5) * 5
      onResize?.(lesson?.id, snappedDuration)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [variantConfig.resizable, lesson, pixelsPerMinute, onResize])

  const handleResizeLeft = useCallback((e) => {
    if (!variantConfig.resizable || !lesson?.startTime) return
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startDuration = lesson?.duration || 30
    const originalStartMinutes = parseInt(lesson.startTime.slice(0, 2)) * 60 +
      (parseInt(lesson.startTime.slice(2, 4)) || 0)

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaMinutes = deltaX / pixelsPerMinute
      const newDuration = Math.max(5, startDuration - deltaMinutes)
      const snappedDuration = Math.round(newDuration / 5) * 5
      const durationChange = startDuration - snappedDuration
      const newStartMinutes = originalStartMinutes + durationChange

      if (newStartMinutes >= startHour * 60) {
        const newHour = Math.floor(newStartMinutes / 60)
        const newMin = newStartMinutes % 60
        const newStartTime = `${newHour.toString().padStart(2, '0')}${newMin.toString().padStart(2, '0')}`
        onUpdate?.(lesson.id, { startTime: newStartTime, duration: snappedDuration })
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [variantConfig.resizable, lesson, pixelsPerMinute, startHour, onUpdate])

  // ============================================
  // KEYBOARD HANDLER (Delete)
  // ============================================
  useEffect(() => {
    if (!isSelected || isEditing || variant === 'compact') return

    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete?.(lesson?.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelected, isEditing, variant, lesson?.id, onDelete])

  // ============================================
  // STYLING
  // ============================================
  const getBorderStyle = () => {
    if (isEditing) return `2px solid ${THEME.AMBER}`
    if (isSelected) return `2px solid ${THEME.AMBER}`
    if (showNoLOWarning) return '2px solid #ff4444'
    if (!isCommitted && variant === 'overview') return `2px solid ${THEME.GREEN_BRIGHT}`
    if (isHovered) return `1px solid ${THEME.BORDER_LIGHT}`
    return `1px solid ${THEME.BORDER}`
  }

  const getBoxShadow = () => {
    if (isEditing) return `0 0 16px rgba(212, 115, 12, 0.5), 0 0 32px rgba(212, 115, 12, 0.2)`
    if (isSelected) return `0 0 12px rgba(212, 115, 12, 0.3)`
    if (showNoLOWarning) return `0 0 8px rgba(255, 68, 68, 0.3)`
    if (!isCommitted && variant === 'overview') return `0 0 8px rgba(0, 255, 0, 0.3)`
    if (isHovered && variant === 'library') return '0 4px 12px rgba(0,0,0,0.3)'
    return 'none'
  }

  const getBackground = () => {
    if (isSelected || isEditing) {
      return `linear-gradient(135deg, ${THEME.BG_PANEL} 0%, ${THEME.BG_DARK} 100%)`
    }
    return variant === 'library' ? THEME.BG_DARK : 'rgba(25, 25, 25, 0.95)'
  }

  // Calculate dimensions
  const cardWidth = width
    ? width
    : useFullWidth
      ? '100%'
      : variant === 'timetable'
        ? Math.max((lesson?.duration || 30) * pixelsPerMinute, 60)
        : variant === 'overview'
          ? 180
          : '12vw'

  const cardHeight = height || (variant === 'overview' ? 70 : '100%')

  // ============================================
  // RENDER
  // ============================================
  if (!lesson) return null

  // Position styles for overview variant
  const positionStyle = position ? {
    position: 'absolute',
    left: position.x,
    top: position.y
  } : {}

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenuClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => !isDragging && setIsHovered(false)}
        onMouseDown={variantConfig.dragMode === 'mouse' ? handleMouseDragStart : undefined}
        draggable={variantConfig.dragMode === 'html5'}
        onDragStart={variantConfig.dragMode === 'html5' ? handleHtml5DragStart : undefined}
        onDragEnd={variantConfig.dragMode === 'html5' ? handleHtml5DragEnd : undefined}
        style={{
          ...positionStyle,
          width: typeof cardWidth === 'number' ? `${cardWidth}px` : cardWidth,
          height: typeof cardHeight === 'number' ? `${cardHeight}px` : cardHeight,
          minWidth: variant === 'library' ? '12vw' : undefined,
          padding: variant === 'library' ? '0.8vh 1vw' : undefined,
          background: getBackground(),
          border: getBorderStyle(),
          borderRadius: variant === 'library' ? '0.5vh' : '16px',
          cursor: isDragging ? 'grabbing' : isEditing ? 'text' : variantConfig.dragMode !== 'none' ? 'grab' : 'pointer',
          display: 'flex',
          flexDirection: variant === 'library' ? 'column' : 'row',
          gap: variant === 'library' ? '0.3vh' : undefined,
          opacity: isDragging && variantConfig.dragMode === 'html5' ? 0.5 : 1,
          transform: isHovered && !isDragging && variant === 'library' ? 'translateY(-2px)' : 'none',
          boxShadow: getBoxShadow(),
          transition: isDragging ? 'none' : 'transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease',
          overflow: 'hidden',
          userSelect: 'none',
          zIndex: isDragging ? 1000 : isSelected ? 100 : variant === 'overview' ? 10 : undefined
        }}
      >
        {/* Type Indicator Stripe */}
        {variant === 'library' ? (
          <div
            style={{
              width: '100%',
              height: '3px',
              background: lessonType.color,
              borderRadius: '1px',
              marginBottom: '0.2vh'
            }}
          />
        ) : (
          <div
            style={{
              width: '5px',
              flexShrink: 0,
              background: lessonType.color,
              borderRadius: '16px 0 0 16px'
            }}
          />
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: variant === 'library' ? 'flex-start' : 'space-between',
            padding: variant === 'library' ? undefined : '6px 10px',
            overflow: 'hidden'
          }}
        >
          {/* Title */}
          {isEditing && variantConfig.editable ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={saveEdits}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${THEME.AMBER}`,
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
                fontSize: variant === 'library' ? '1.3vh' : '1.4vh',
                color: isSelected ? THEME.WHITE : THEME.TEXT_PRIMARY,
                fontFamily: THEME.FONT_PRIMARY,
                fontWeight: isSelected ? 500 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {lesson.title || (variant === 'overview' && isHovered ? 'Double-click to name' : 'New Lesson')}
            </div>
          )}

          {/* Bottom Row: Time/Duration/Type */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '4px',
              marginTop: variant === 'library' ? '0' : undefined
            }}
          >
            {/* Time Range (timetable variant with editing) */}
            {isEditing && variantConfig.showTime ? (
              <>
                <input
                  type="text"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="0900"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${THEME.AMBER}`,
                    fontSize: '1.1vh',
                    color: THEME.GREEN_BRIGHT,
                    fontFamily: THEME.FONT_MONO,
                    outline: 'none',
                    width: '35px',
                    padding: '0',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM }}>-</span>
                <input
                  type="text"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="60"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${THEME.AMBER}`,
                    fontSize: '1.1vh',
                    color: THEME.GREEN_BRIGHT,
                    fontFamily: THEME.FONT_MONO,
                    outline: 'none',
                    width: '30px',
                    padding: '0',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM }}>m</span>
              </>
            ) : (
              <>
                {/* Time Range Display */}
                {variantConfig.showTime && lesson.startTime && (
                  <span
                    style={{
                      fontSize: '1.1vh',
                      color: isSelected ? THEME.GREEN_BRIGHT : 'rgba(180, 180, 180, 0.8)',
                      fontFamily: THEME.FONT_MONO,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    {formatTime(lesson.startTime)}-{calculateEndTime()}
                  </span>
                )}

                {/* Duration */}
                {variantConfig.showDuration && (
                  <span
                    style={{
                      fontSize: '1.1vh',
                      color: isSelected
                        ? (variant === 'timetable' ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM)
                        : THEME.TEXT_DIM,
                      fontFamily: THEME.FONT_MONO,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    {variant === 'timetable'
                      ? `${lesson.duration}mins`
                      : variant === 'overview'
                        ? formatDuration(lesson.duration)
                        : `${lesson.duration} min`}
                  </span>
                )}

                {/* Type Label */}
                {variantConfig.showTypeLabel && (
                  <span
                    style={{
                      fontSize: variant === 'library' ? '1.0vh' : '1.1vh',
                      color: lessonType.color,
                      fontFamily: THEME.FONT_PRIMARY,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {variant === 'library'
                      ? lessonType.label.split(' ')[0]
                      : lesson.type || 'lecture'}
                  </span>
                )}
              </>
            )}
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

        {/* Saved Indicator (Library variant) */}
        {variantConfig.showSavedIndicator && isSaved && (
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

        {/* Resize Handles (Timetable variant) */}
        {variantConfig.resizable && isSelected && (
          <>
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

      {/* Context Menu (Timetable variant) */}
      {contextMenu && variantConfig.contextMenuEnabled && (
        <LessonContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lesson={lesson}
          isSaved={isSaved}
          onContextAction={onContextMenu}
          onClose={closeContextMenu}
        />
      )}
    </>
  )
}

// ============================================
// CONTEXT MENU COMPONENT
// ============================================
function LessonContextMenu({ x, y, lesson, isSaved, onContextAction, onClose }) {
  const adjustedX = Math.min(x, window.innerWidth - 180)
  const adjustedY = Math.min(y, window.innerHeight - 180)

  const handleAction = useCallback((action) => {
    onContextAction?.(action, lesson)
    onClose()
  }, [onContextAction, lesson, onClose])

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
        <ContextMenuItem label="Unschedule" onClick={() => handleAction('unschedule')} />
        {!isSaved && (
          <ContextMenuItem label="Save to Library" onClick={() => handleAction('saveToLibrary')} />
        )}
        <ContextMenuItem label="Duplicate" onClick={() => handleAction('duplicate')} />
        <div style={{ height: '1px', background: THEME.BORDER, margin: '0.3vh 0' }} />
        <ContextMenuItem label="Delete" onClick={() => handleAction('delete')} danger />
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

// ============================================
// EXPORTS
// ============================================
export default LessonCardPrimitive
export { DEFAULT_LESSON_TYPES, VARIANT_DEFAULTS }
