/**
 * UnallocatedLessonsPanel - Shared Unallocated Lessons Component
 *
 * Item 18: Add to OVERVIEW (same functionality as TIMETABLE)
 * Item 19: Position directly above DELETE, CLEAR, SAVE buttons
 * Item 20: Width matches combined width of action buttons
 *
 * Features:
 * - Collapsible panel
 * - FLOATABLE: Drag header to move window anywhere
 * - Drag-and-drop support (drop scheduled lessons to unschedule)
 * - Consistent styling across OVERVIEW and TIMETABLE
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

function UnallocatedLessonsPanel({
  lessons = [],
  lessonTypes = [],
  onUnscheduleLesson,
  onScheduleLesson  // For dragging from unallocated to canvas/grid
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Floating window position state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDraggingWindow, setIsDraggingWindow] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef(null)

  // Handle window drag start - use FIXED positioning relative to viewport
  const handleWindowDragStart = useCallback((e) => {
    // Prevent if clicking on collapse toggle area
    if (e.target.closest('[data-collapse-toggle]')) return

    e.preventDefault()

    const rect = panelRef.current?.getBoundingClientRect()
    if (rect) {
      // Store drag offset within the panel
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })

      // Initialize position from current viewport position (first drag)
      if (position.x === 0 && position.y === 0) {
        setPosition({
          x: rect.left,
          y: rect.top
        })
      }

      setIsDraggingWindow(true)
    }
  }, [position.x, position.y])

  // Handle window drag move - use viewport coordinates directly
  useEffect(() => {
    if (!isDraggingWindow) return

    const handleMouseMove = (e) => {
      // Calculate new position in viewport coordinates
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Clamp to viewport bounds (with some padding)
      const maxX = window.innerWidth - 290 // Panel width + padding
      const maxY = window.innerHeight - 150 // Panel max height + padding

      setPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(10, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDraggingWindow(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingWindow, dragOffset])

  // Handle drag start for unallocated lesson
  const handleDragStart = useCallback((e, lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id)
    e.dataTransfer.setData('dragType', 'unallocated')
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  // Handle drag over to allow drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  // Handle drop - unschedule the lesson
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)

    const lessonId = e.dataTransfer.getData('lessonId')
    const dragType = e.dataTransfer.getData('dragType')

    // Only accept drops from scheduled lessons (not from unallocated or pending)
    if (lessonId && dragType !== 'unallocated' && dragType !== 'pending') {
      onUnscheduleLesson?.(lessonId)
    }
  }, [onUnscheduleLesson])

  const getLessonTypeColor = (typeId) => {
    const type = lessonTypes.find(t => t.id === typeId)
    return type?.color || '#FF6600'
  }

  // Determine if we're using custom position (user has dragged the window)
  const hasCustomPosition = position.x !== 0 || position.y !== 0

  return (
    <div
      ref={panelRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isDragOver ? 'rgba(255, 102, 0, 0.2)' : 'rgba(20, 20, 20, 0.95)',
        border: `2px solid ${isDragOver ? '#00FF00' : isDraggingWindow ? THEME.GREEN_BRIGHT : THEME.AMBER}`,
        borderRadius: '12px',
        // Item 20: Match width of DELETE + CLEAR + SAVE (approximately 280px)
        width: '280px',
        maxHeight: collapsed ? '36px' : '140px',
        overflow: 'hidden',
        transition: isDraggingWindow ? 'none' : 'all 0.2s ease',
        // Floating position (if dragged) - use FIXED for viewport-relative positioning
        ...(hasCustomPosition && {
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000 // Ensure it floats above other elements
        }),
        boxShadow: isDraggingWindow ? '0 8px 24px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header - Draggable for window movement */}
      <div
        onMouseDown={handleWindowDragStart}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6vh 0.8vw',
          borderBottom: collapsed ? 'none' : `1px solid ${THEME.AMBER}40`,
          cursor: isDraggingWindow ? 'grabbing' : 'grab'
        }}
      >
        <span
          style={{
            fontSize: '1.2vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase',
            letterSpacing: '0.05vw',
            fontWeight: 500
          }}
        >
          Unallocated ({lessons.length})
        </span>
        <span
          data-collapse-toggle="true"
          onClick={(e) => {
            e.stopPropagation()
            setCollapsed(!collapsed)
          }}
          style={{
            fontSize: '1.2vh',
            color: THEME.AMBER,
            cursor: 'pointer',
            padding: '0.2vh 0.4vw'
          }}
        >
          {collapsed ? '▶' : '▼'}
        </span>
      </div>

      {/* Lessons List */}
      {!collapsed && (
        <div
          style={{
            padding: '0.4vh 0.4vw',
            maxHeight: '100px',
            overflowY: 'auto'
          }}
        >
          {lessons.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1vh',
                color: THEME.TEXT_DIM,
                fontSize: '1.1vh',
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              Drag lessons here to unschedule
            </div>
          ) : (
            lessons.map(lesson => (
              <div
                key={lesson.id}
                draggable
                onDragStart={(e) => handleDragStart(e, lesson)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4vw',
                  padding: '0.5vh 0.5vw',
                  marginBottom: '0.3vh',
                  background: 'rgba(30, 30, 30, 0.8)',
                  border: '1px solid rgba(100, 100, 100, 0.3)',
                  borderRadius: '8px',
                  cursor: 'grab',
                  transition: 'border-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = THEME.AMBER}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100, 100, 100, 0.3)'}
              >
                {/* Type color bar */}
                <div
                  style={{
                    width: '4px',
                    height: '2vh',
                    background: getLessonTypeColor(lesson.type || lesson.lessonType),
                    borderRadius: '2px',
                    flexShrink: 0
                  }}
                />
                {/* Title */}
                <span
                  style={{
                    fontSize: '1.1vh',
                    color: THEME.TEXT_PRIMARY,
                    fontFamily: THEME.FONT_PRIMARY,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {lesson.title || 'Untitled'}
                </span>
                {/* Duration */}
                <span
                  style={{
                    fontSize: '0.9vh',
                    color: THEME.TEXT_DIM,
                    fontFamily: THEME.FONT_MONO
                  }}
                >
                  {lesson.duration}m
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default UnallocatedLessonsPanel
