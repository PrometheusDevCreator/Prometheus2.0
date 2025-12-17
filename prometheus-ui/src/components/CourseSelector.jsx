/**
 * CourseSelector - Wheel-based Course Selection Component
 *
 * States:
 * - collapsed: Small wheel centered, shows "SELECT" text
 * - expanded: Wheel slides left, course list reveals on right
 * - selected: Course highlighted in green, LOAD button appears
 * - loading: Progress bar with course name
 * - loaded: "Course Loaded" message
 *
 * Interaction:
 * - Click wheel to expand
 * - Click-and-drag on wheel to scroll through courses
 * - Click course to select
 * - Click LOAD to load course
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { THEME, ANIMATION } from '../constants/theme'

function CourseSelector({
  courses = [],
  onCourseLoad,
  size = 135
}) {
  // Component state
  const [state, setState] = useState('collapsed') // 'collapsed' | 'expanded' | 'selected' | 'loading' | 'loaded'
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [loadProgress, setLoadProgress] = useState(0)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const scrollStartPos = useRef(0)

  // Refs
  const wheelRef = useRef(null)

  // Constants
  const VISIBLE_COURSES = 5
  const COURSE_ITEM_HEIGHT = 40
  const maxScroll = Math.max(0, (courses.length - VISIBLE_COURSES) * COURSE_ITEM_HEIGHT)

  // Handle wheel click (expand/collapse)
  const handleWheelClick = useCallback(() => {
    if (state === 'collapsed') {
      setState('expanded')
    }
  }, [state])

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    if (state !== 'expanded' && state !== 'selected') return

    setIsDragging(true)
    dragStartY.current = e.clientY || e.touches?.[0]?.clientY || 0
    scrollStartPos.current = scrollPosition

    e.preventDefault()
  }, [state, scrollPosition])

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return

    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    const deltaY = dragStartY.current - clientY
    const newScroll = Math.max(0, Math.min(maxScroll, scrollStartPos.current + deltaY))

    setScrollPosition(newScroll)
  }, [isDragging, maxScroll])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add/remove global mouse listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Handle course selection
  const handleCourseClick = useCallback((course) => {
    setSelectedCourse(course)
    setState('selected')
  }, [])

  // Handle load button click
  const handleLoad = useCallback(() => {
    if (!selectedCourse) return

    setState('loading')
    setLoadProgress(0)

    // Simulate loading with progress
    const duration = 2000 // 2 seconds
    const interval = 50 // Update every 50ms
    const steps = duration / interval
    let step = 0

    const loadTimer = setInterval(() => {
      step++
      setLoadProgress(Math.min(100, (step / steps) * 100))

      if (step >= steps) {
        clearInterval(loadTimer)
        setState('loaded')

        // Notify parent with course data after a brief delay
        setTimeout(() => {
          onCourseLoad?.(selectedCourse)
        }, 500)
      }
    }, interval)
  }, [selectedCourse, onCourseLoad])

  // Handle collapse (click outside or escape)
  const handleCollapse = useCallback(() => {
    if (state === 'expanded' || state === 'selected') {
      setState('collapsed')
      setSelectedCourse(null)
    }
  }, [state])

  // Calculate wheel rotation based on scroll position
  const wheelRotation = (scrollPosition / maxScroll) * 360 || 0

  // Render collapsed wheel
  if (state === 'collapsed') {
    return (
      <div
        onClick={handleWheelClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `3px solid ${THEME.AMBER_DARK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: `all ${ANIMATION.DURATION_NORMAL} ${ANIMATION.EASE_SMOOTH}`,
          boxShadow: '0 0 20px rgba(212, 115, 12, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = THEME.AMBER
          e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 115, 12, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = THEME.AMBER_DARK
          e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 115, 12, 0.2)'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            letterSpacing: '2px',
            color: THEME.TEXT_SECONDARY,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center'
          }}
        >
          SELECT<br/>COURSE
        </span>
      </div>
    )
  }

  // Render loading state
  if (state === 'loading' || state === 'loaded') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Course name */}
        <span
          style={{
            fontSize: '16px',
            letterSpacing: '3px',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          {selectedCourse?.title || selectedCourse?.name || 'Loading...'}
        </span>

        {/* Progress bar or loaded message */}
        {state === 'loading' ? (
          <div
            style={{
              width: '400px',
              height: '12px',
              background: THEME.BG_INPUT,
              borderRadius: '6px',
              overflow: 'hidden',
              border: `1px solid ${THEME.BORDER}`
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                background: `linear-gradient(to right, ${THEME.AMBER_DARK}, ${THEME.AMBER})`,
                borderRadius: '6px',
                transition: 'width 0.05s linear',
                boxShadow: '0 0 20px rgba(212, 115, 12, 0.5)'
              }}
            />
          </div>
        ) : (
          <span
            style={{
              fontSize: '14px',
              letterSpacing: '4px',
              color: THEME.GREEN_BRIGHT,
              fontFamily: THEME.FONT_PRIMARY,
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            COURSE LOADED
          </span>
        )}
      </div>
    )
  }

  // Render expanded state (with course list)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        animation: 'fadeIn 0.3s ease-out',
        position: 'relative',
        zIndex: 200
      }}
    >
      {/* Wheel (slides left in expanded state) */}
      <div
        ref={wheelRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `3px solid ${THEME.AMBER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : `all ${ANIMATION.DURATION_NORMAL} ${ANIMATION.EASE_SMOOTH}`,
          boxShadow: '0 0 30px rgba(212, 115, 12, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* Rotation indicator lines */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `rotate(${wheelRotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Tick marks around the wheel */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const radians = (angle - 90) * (Math.PI / 180)
            const innerR = size / 2 - 15
            const outerR = size / 2 - 5
            const x1 = size / 2 + Math.cos(radians) * innerR
            const y1 = size / 2 + Math.sin(radians) * innerR
            const x2 = size / 2 + Math.cos(radians) * outerR
            const y2 = size / 2 + Math.sin(radians) * outerR

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={angle === 0 ? THEME.AMBER : THEME.AMBER_DARK}
                strokeWidth={angle === 0 ? 3 : 2}
              />
            )
          })}
        </svg>

        {/* Center text */}
        <span
          style={{
            fontSize: '11px',
            letterSpacing: '1px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center',
            zIndex: 1
          }}
        >
          DRAG TO<br/>SCROLL
        </span>
      </div>

      {/* Course list */}
      <div
        style={{
          width: '300px',
          height: `${VISIBLE_COURSES * COURSE_ITEM_HEIGHT}px`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(-${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {courses.map((course, index) => {
            const isSelected = selectedCourse?.id === course.id

            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                style={{
                  height: `${COURSE_ITEM_HEIGHT}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  cursor: 'pointer',
                  color: isSelected ? THEME.GREEN_BRIGHT : THEME.TEXT_SECONDARY,
                  fontFamily: THEME.FONT_PRIMARY,
                  fontSize: '14px',
                  letterSpacing: '1px',
                  background: isSelected ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${THEME.GREEN_BRIGHT}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.color = THEME.AMBER
                    e.currentTarget.style.background = 'rgba(212, 115, 12, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.color = THEME.TEXT_SECONDARY
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {course.name || course.title}
              </div>
            )
          })}
        </div>
      </div>

      {/* LOAD button (appears when course is selected) */}
      {state === 'selected' && selectedCourse && (
        <button
          onClick={handleLoad}
          style={{
            padding: '14px 32px',
            fontSize: '14px',
            letterSpacing: '3px',
            fontFamily: THEME.FONT_PRIMARY,
            background: THEME.GRADIENT_BUTTON,
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '20px',
            color: THEME.WHITE,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 115, 12, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          LOAD
        </button>
      )}
    </div>
  )
}

export default CourseSelector
