/**
 * DefinePageDurationWheel - Large Duration Selection Wheel for DEFINE page
 *
 * Features:
 * - Click labels below to select category (burnt orange + underline)
 * - Rotate wheel to change value (0 at north position)
 * - Value displayed in center (green)
 * - Orange border with gradient, green tick marks
 * - Draggable orange handle
 *
 * Categories (2 columns below wheel):
 * - Left: Hours (0-12), Days (0-10), Weeks (0-12)
 * - Right: Modules (0-12), Terms (0-9), Semesters (0-6)
 *
 * Hierarchy: Semester > Term > Module resets lower duration values
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

// Category definitions with value ranges
const DURATION_CATEGORIES = {
  hours: { label: 'Hours:', min: 0, max: 12, column: 'left' },
  days: { label: 'Days:', min: 0, max: 10, column: 'left' },
  weeks: { label: 'Weeks:', min: 0, max: 12, column: 'left' },
  modules: { label: 'Modules', min: 0, max: 12, column: 'right' },
  terms: { label: 'Terms:', min: 0, max: 9, column: 'right' },
  semesters: { label: 'Semesters:', min: 0, max: 6, column: 'right' }
}

// Convert value to rotation angle (0 at north, clockwise)
function valueToRotation(value, min, max) {
  if (max === min) return 0
  const range = max - min
  const progress = (value - min) / range
  // 0 at top (north), rotate clockwise
  return progress * 330 // Leave gap at bottom for visual clarity
}

// Convert rotation to value
function rotationToValue(rotation, min, max) {
  const range = max - min
  // Normalize rotation to 0-330 range
  const normRot = Math.max(0, Math.min(330, rotation))
  const progress = normRot / 330
  return Math.round(min + progress * range)
}

function DefinePageDurationWheel({
  values = {
    hours: 0,
    days: 0,
    weeks: 0,
    modules: 0,
    terms: 0,
    semesters: 0
  },
  onChange,
  size = 280
}) {
  const [selectedCategory, setSelectedCategory] = useState('days') // Default to days
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(0) // Local rotation state for smooth dragging
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startRotation = useRef(0)

  // Get current category config and value
  const categoryConfig = DURATION_CATEGORIES[selectedCategory]
  const currentValue = values[selectedCategory] || 0

  const isActive = isDragging || isHovered

  // Get rotation for current value
  const getRotation = () => {
    return valueToRotation(currentValue, categoryConfig.min, categoryConfig.max)
  }

  // Update rotation when category or value changes (sync with external value)
  useEffect(() => {
    if (!isDragging) {
      setRotation(getRotation())
    }
  }, [selectedCategory, values, isDragging])

  // Calculate angle from center of wheel
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    // Angle from center, with 0 at top (north)
    const angle = Math.atan2(clientX - centerX, centerY - clientY)
    return angle * (180 / Math.PI)
  }, [])

  // Handle rotational drag - cumulative approach (same as CONTENT wheel)
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    startAngle.current = getAngleFromCenter(e.clientX, e.clientY)
    startRotation.current = rotation
  }, [rotation, getAngleFromCenter])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
    let deltaAngle = currentAngle - startAngle.current

    // Normalize delta to -180 to 180 range (handles wrap-around at 6 o'clock)
    if (deltaAngle > 180) deltaAngle -= 360
    if (deltaAngle < -180) deltaAngle += 360

    // Apply delta from original start position (cumulative)
    let newRotation = startRotation.current + deltaAngle

    // Clamp to valid range (0 to 330 degrees)
    newRotation = Math.max(0, Math.min(330, newRotation))

    // Update local rotation state for smooth visual feedback
    setRotation(newRotation)

    // Convert to value and notify
    const newValue = rotationToValue(newRotation, categoryConfig.min, categoryConfig.max)
    if (newValue !== currentValue) {
      onChange?.(selectedCategory, newValue)
    }
  }, [isDragging, currentValue, selectedCategory, categoryConfig, onChange, getAngleFromCenter])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Global mouse handlers
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle scroll
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const newValue = Math.max(categoryConfig.min, Math.min(categoryConfig.max, currentValue + delta))
    if (newValue !== currentValue) {
      onChange?.(selectedCategory, newValue)
    }
  }, [currentValue, selectedCategory, categoryConfig, onChange])

  // Handle category selection
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  // Size calculations
  const innerSize = size * 0.65
  const handleRadius = size / 2 - 15
  const tickRadius = size / 2 - 8

  // Generate tick marks based on current category range
  const numTicks = categoryConfig.max - categoryConfig.min + 1
  const tickAngles = []
  for (let i = 0; i < numTicks; i++) {
    const progress = i / (numTicks - 1 || 1)
    tickAngles.push(progress * 330 - 90) // -90 to start from top
  }

  // Handle position (on the wheel edge)
  const handleAngle = (rotation - 90) * (Math.PI / 180)
  const handleX = size / 2 + handleRadius * Math.cos(handleAngle)
  const handleY = size / 2 + handleRadius * Math.sin(handleAngle)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      {/* Title */}
      <span
        style={{
          fontSize: '14px',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '3px',
          color: THEME.WHITE,
          fontWeight: 500
        }}
      >
        DURATION
      </span>

      {/* Wheel container */}
      <div
        ref={wheelRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: size,
          height: size,
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        {/* Outer ring SVG */}
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="durationWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke="url(#durationWheelGrad)"
            strokeWidth={4}
            style={{
              filter: isActive ? `drop-shadow(0 0 15px ${THEME.AMBER}80)` : 'none',
              transition: 'filter 0.2s ease'
            }}
          />

          {/* Inner ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 20}
            fill="none"
            stroke={THEME.AMBER_DARK}
            strokeWidth={2}
            opacity={0.5}
          />

          {/* Green tick marks */}
          {tickAngles.map((angle, i) => {
            const rad = angle * (Math.PI / 180)
            const innerR = tickRadius - 12
            const outerR = tickRadius
            return (
              <line
                key={i}
                x1={size / 2 + innerR * Math.cos(rad)}
                y1={size / 2 + innerR * Math.sin(rad)}
                x2={size / 2 + outerR * Math.cos(rad)}
                y2={size / 2 + outerR * Math.sin(rad)}
                stroke={THEME.GREEN_BRIGHT}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          })}

        </svg>

        {/* Draggable handle (orange circle) */}
        <div
          style={{
            position: 'absolute',
            left: handleX - 12,
            top: handleY - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: THEME.AMBER,
            boxShadow: isActive
              ? `0 0 20px ${THEME.AMBER}, 0 0 40px ${THEME.AMBER}60`
              : `0 0 10px ${THEME.AMBER}80`,
            cursor: 'grab',
            transition: isDragging ? 'none' : 'box-shadow 0.2s ease'
          }}
        />

        {/* Inner circle with value */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: innerSize,
            height: innerSize,
            borderRadius: '50%',
            background: THEME.BG_DARK,
            border: `3px solid ${THEME.AMBER_DARK}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontFamily: THEME.FONT_MONO,
              fontWeight: '300',
              color: THEME.GREEN_BRIGHT,
              lineHeight: 1
            }}
          >
            {currentValue}
          </span>
        </div>
      </div>

      {/* Category labels - 2 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 40px',
          marginTop: '8px'
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(DURATION_CATEGORIES)
            .filter(([, config]) => config.column === 'left')
            .map(([key, config]) => (
              <CategoryLabel
                key={key}
                label={config.label}
                value={values[key] || 0}
                isSelected={selectedCategory === key}
                onClick={() => handleCategoryClick(key)}
              />
            ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(DURATION_CATEGORIES)
            .filter(([, config]) => config.column === 'right')
            .map(([key, config]) => (
              <CategoryLabel
                key={key}
                label={config.label}
                value={values[key] || 0}
                isSelected={selectedCategory === key}
                onClick={() => handleCategoryClick(key)}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

// Category label component
function CategoryLabel({ label, value, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        padding: '2px 0'
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '1px',
          color: isSelected ? THEME.AMBER : isHovered ? THEME.AMBER : THEME.TEXT_DIM,
          textDecoration: isSelected ? 'underline' : 'none',
          textUnderlineOffset: '3px',
          transition: 'all 0.2s ease'
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontFamily: THEME.FONT_MONO,
          color: isSelected ? THEME.GREEN_BRIGHT : value > 0 ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
          minWidth: '24px',
          textAlign: 'right'
        }}
      >
        {value > 0 ? value : '--'}
      </span>
    </div>
  )
}

export default DefinePageDurationWheel
