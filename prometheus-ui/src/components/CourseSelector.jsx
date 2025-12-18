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
import buttonImage from '../assets/buttonhires.png'

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

  // Drag state for circular rotation
  const [isDragging, setIsDragging] = useState(false)
  const dragStartAngle = useRef(0)
  const rotationStartPos = useRef(0)
  const wheelCenter = useRef({ x: 0, y: 0 })

  // Refs
  const wheelRef = useRef(null)

  // Button size for collapsed state
  const BUTTON_SIZE = 50

  // Constants
  const VISIBLE_COURSES = 5
  const COURSE_ITEM_HEIGHT = 34  // Reduced from 40 to fit smaller list
  const LIST_HEIGHT = 170  // Reduced by 30px (was 200px)
  const EXPANDED_WHEEL_SIZE = Math.round(size * 0.85)  // 15% smaller wheel in expanded state
  const maxScroll = Math.max(0, (courses.length * COURSE_ITEM_HEIGHT) - LIST_HEIGHT)

  // Handle wheel click (expand/collapse)
  const handleWheelClick = useCallback(() => {
    if (state === 'collapsed') {
      setState('expanded')
    }
  }, [state])

  // Calculate angle from center of wheel to mouse position
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    const dx = clientX - wheelCenter.current.x
    const dy = clientY - wheelCenter.current.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [])

  // Handle drag start - circular rotation
  const handleDragStart = useCallback((e) => {
    if (state !== 'expanded' && state !== 'selected') return
    if (!wheelRef.current) return

    // Get wheel center position
    const rect = wheelRef.current.getBoundingClientRect()
    wheelCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0

    setIsDragging(true)
    dragStartAngle.current = getAngleFromCenter(clientX, clientY)
    rotationStartPos.current = scrollPosition

    e.preventDefault()
  }, [state, scrollPosition, getAngleFromCenter])

  // Handle drag move - circular rotation
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0

    const currentAngle = getAngleFromCenter(clientX, clientY)
    let angleDelta = currentAngle - dragStartAngle.current

    // Handle wrap-around at 180/-180
    if (angleDelta > 180) angleDelta -= 360
    if (angleDelta < -180) angleDelta += 360

    // Convert angle delta to scroll position (clockwise = scroll down)
    const scrollDelta = (angleDelta / 360) * maxScroll * 2
    const newScroll = Math.max(0, Math.min(maxScroll, rotationStartPos.current + scrollDelta))

    setScrollPosition(newScroll)
  }, [isDragging, maxScroll, getAngleFromCenter])

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

  // Render collapsed state - button image with SELECT COURSE text below
  if (state === 'collapsed') {
    return (
      <div
        onClick={handleWheelClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: `all ${ANIMATION.DURATION_NORMAL} ${ANIMATION.EASE_SMOOTH}`
        }}
      >
        {/* Button image - 50px diameter */}
        <div
          style={{
            width: `${BUTTON_SIZE}px`,
            height: `${BUTTON_SIZE}px`,
            borderRadius: '50%',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, filter 0.2s ease',
            filter: 'drop-shadow(0 0 10px rgba(212, 115, 12, 0.3))'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(212, 115, 12, 0.6))'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(212, 115, 12, 0.3))'
          }}
        >
          <img
            src={buttonImage}
            alt="Select Course"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        {/* SELECT COURSE text label */}
        <span
          style={{
            fontSize: '12px',
            letterSpacing: '2px',
            color: THEME.TEXT_SECONDARY,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center'
          }}
        >
          SELECT COURSE
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
          marginTop: '50px',  // Moved down 50px
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {/* Loading: Course name above progress bar */}
        {state === 'loading' && (
          <>
            <span
              style={{
                fontSize: '24px',  // 50% larger (16px * 1.5)
                letterSpacing: '3px',
                color: THEME.GREEN_BRIGHT,  // Luminous green for course name
                fontFamily: THEME.FONT_PRIMARY,
                textTransform: 'uppercase',  // Capitalize course name
                whiteSpace: 'nowrap'  // Prevent text wrap
              }}
            >
              {selectedCourse?.title || selectedCourse?.name || 'Loading...'}
            </span>
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
          </>
        )}

        {/* Loaded: "Course Loaded" above course name (swapped positions & colors) */}
        {state === 'loaded' && (
          <>
            <span
              style={{
                fontSize: '14px',
                letterSpacing: '4px',
                color: THEME.AMBER,  // Burnt orange for "Course Loaded"
                fontFamily: THEME.FONT_PRIMARY,
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              Course Loaded
            </span>
            <span
              style={{
                fontSize: '24px',  // 50% larger (16px * 1.5)
                letterSpacing: '3px',
                color: THEME.GREEN_BRIGHT,  // Luminous green for course name
                fontFamily: THEME.FONT_PRIMARY,
                textTransform: 'uppercase',  // Capitalize course name
                whiteSpace: 'nowrap',  // Prevent text wrap
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              {selectedCourse?.title || selectedCourse?.name}
            </span>
          </>
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
        zIndex: 200,
        marginTop: '-50px'  // Move expanded state up 50px from inactive position
      }}
    >
      {/* Wheel (slides left in expanded state) - 15% smaller */}
      <div
        ref={wheelRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          width: `${EXPANDED_WHEEL_SIZE}px`,
          height: `${EXPANDED_WHEEL_SIZE}px`,
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `3px solid ${THEME.AMBER}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
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
          width={EXPANDED_WHEEL_SIZE}
          height={EXPANDED_WHEEL_SIZE}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `rotate(${wheelRotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Tick marks around the wheel - 12 o'clock tab is luminous green */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const radians = (angle - 90) * (Math.PI / 180)
            const innerR = EXPANDED_WHEEL_SIZE / 2 - 12
            const outerR = EXPANDED_WHEEL_SIZE / 2 - 4
            const x1 = EXPANDED_WHEEL_SIZE / 2 + Math.cos(radians) * innerR
            const y1 = EXPANDED_WHEEL_SIZE / 2 + Math.sin(radians) * innerR
            const x2 = EXPANDED_WHEEL_SIZE / 2 + Math.cos(radians) * outerR
            const y2 = EXPANDED_WHEEL_SIZE / 2 + Math.sin(radians) * outerR

            return (
              <line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={angle === 0 ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK}
                strokeWidth={angle === 0 ? 3 : 2}
              />
            )
          })}
        </svg>

        {/* Center content: Up arrow, SELECT, Down arrow */}
        <span
          style={{
            fontSize: '14px',
            color: THEME.AMBER_DARK,
            zIndex: 1,
            lineHeight: 1
          }}
        >
          →
        </span>
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            zIndex: 1
          }}
        >
          SELECT
        </span>
        <span
          style={{
            fontSize: '14px',
            color: THEME.AMBER_DARK,
            zIndex: 1,
            lineHeight: 1
          }}
        >
          ←
        </span>
      </div>

      {/* Course list with brightness fade (brightest center, fading edges) */}
      <div
        style={{
          width: '300px',
          height: `${LIST_HEIGHT}px`,
          overflow: 'hidden',
          position: 'relative',
          // Brightness fade: mask from transparent edges to opaque center
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
        }}
      >
        <div
          style={{
            transform: `translateY(-${scrollPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            paddingTop: '15px',  // Account for fade area
            paddingBottom: '15px'
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
                  // Only text color changes - no background box
                  color: isSelected ? THEME.AMBER : THEME.TEXT_SECONDARY,
                  fontFamily: THEME.FONT_PRIMARY,
                  fontSize: '14px',
                  letterSpacing: '1px',
                  background: 'transparent',
                  borderLeft: '3px solid transparent',
                  transition: 'color 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.color = THEME.AMBER
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.color = THEME.TEXT_SECONDARY
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
