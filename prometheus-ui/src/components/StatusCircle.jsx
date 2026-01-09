/**
 * StatusCircle - Duration/Slides Status Indicator
 *
 * Displays accumulated course duration and total slides count.
 * Position: Right of ANALYTICS circle (third circle in footer)
 *
 * Display: "X / Y" where:
 * - X = Accumulated lesson duration (auto-detect unit from DEFINE settings)
 * - Y = Total slides added
 *
 * Color Logic:
 * - Green: Duration under intended
 * - White: Duration matches intended
 * - Red: Duration exceeds intended
 */

import { useState, useMemo } from 'react'
import { THEME } from '../constants/theme'

function StatusCircle({
  courseData = {},
  timetableData = { lessons: [] }
}) {
  const [isHovered, setIsHovered] = useState(false)
  const size = 56 // Match HOME and ANALYTICS size

  // Get intended course duration from courseData (DEFINE page settings)
  const intendedDuration = useMemo(() => {
    // Check which duration field is set (priority: weeks > days > hours)
    if (courseData.weeks && courseData.weeks > 0) {
      return { value: courseData.weeks, unit: 'wks' }
    }
    if (courseData.days && courseData.days > 0) {
      return { value: courseData.days, unit: 'days' }
    }
    if (courseData.hours && courseData.hours > 0) {
      return { value: courseData.hours, unit: 'hrs' }
    }
    // Check legacy duration field
    if (courseData.duration && courseData.duration > 0) {
      return { value: courseData.duration, unit: courseData.durationUnit || 'hrs' }
    }
    return { value: 0, unit: '' }
  }, [courseData])

  // Calculate accumulated duration from lessons (for color comparison)
  const accumulatedDuration = useMemo(() => {
    const lessons = timetableData?.lessons || []
    const totalMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0)

    // Convert to same unit as intended
    if (intendedDuration.unit === 'wks') {
      return Math.round(totalMinutes / 2400) // 5-day week, 8-hour day
    }
    if (intendedDuration.unit === 'days') {
      return Math.round(totalMinutes / 480) // 8-hour day
    }
    return Math.round(totalMinutes / 60) // hours
  }, [timetableData?.lessons, intendedDuration.unit])

  // Calculate total slides
  const totalSlides = useMemo(() => {
    const lessons = timetableData?.lessons || []
    return lessons.reduce((sum, lesson) => {
      const slideCount = lesson.slides?.length || 0
      return sum + slideCount
    }, 0)
  }, [timetableData?.lessons])

  // Determine color based on accumulated vs intended comparison
  const getDurationColor = () => {
    if (intendedDuration.value === 0) {
      return THEME.GREEN_BRIGHT // No intended set, show green
    }
    if (accumulatedDuration < intendedDuration.value) {
      return THEME.GREEN_BRIGHT // Under - green
    }
    if (accumulatedDuration === intendedDuration.value) {
      return THEME.WHITE // Match - white
    }
    return '#ff4444' // Over - red
  }

  // Format display value - show intended duration from DEFINE page
  const durationDisplay = intendedDuration.value > 0 ? intendedDuration.value : '--'
  const slidesDisplay = totalSlides > 0 ? totalSlides : '--'
  const displayColor = getDurationColor()

  return (
    <div
      style={{
        position: 'absolute',
        left: '14.28vw', // HOME=3.70, ANALYTICS=8.99, gap=5.29
        bottom: '10vh',           /* Raised 5px to align with HOME/ANALYTICS */
        transform: 'translate(-50%, 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5vh',
        zIndex: 100
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: size,
          height: size,
          cursor: 'default'
        }}
      >
        <svg
          width={size}
          height={size}
          style={{
            transition: 'all 0.2s ease',
            filter: isHovered ? 'drop-shadow(0 0 8px rgba(212, 115, 12, 0.4))' : 'none'
          }}
        >
          {/* Outer ring - same style as ANALYTICS */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={isHovered ? THEME.AMBER : '#444'}
            strokeWidth={2}
            style={{ transition: 'stroke 0.2s ease' }}
          />

          {/* Center text: duration / slides */}
          <text
            x={size / 2}
            y={size / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={displayColor}
            fontSize="10"
            fontFamily={THEME.FONT_PRIMARY}
            style={{ transition: 'fill 0.3s ease' }}
          >
            {durationDisplay} / {slidesDisplay}
          </text>
        </svg>
      </div>

      {/* STATUS text below */}
      <span
        style={{
          fontSize: '0.93vh',
          letterSpacing: '0.09vh',
          color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        STATUS
      </span>

      {/* (Time / Slides) sublabel - 15% smaller, burnt orange */}
      <span
        style={{
          fontSize: '0.79vh',           /* 15% smaller than 0.93vh */
          letterSpacing: '0.07vh',
          color: THEME.AMBER,           /* Burnt orange */
          fontFamily: THEME.FONT_PRIMARY,
          marginTop: '-0.3vh'           /* Tight spacing */
        }}
      >
        (Time / Slides)
      </span>
    </div>
  )
}

export default StatusCircle
