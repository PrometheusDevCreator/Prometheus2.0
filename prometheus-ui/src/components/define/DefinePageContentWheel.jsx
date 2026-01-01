/**
 * DefinePageContentWheel - Large Content Selection Wheel for DEFINE page
 *
 * Features:
 * - Click labels below to select category (burnt orange + underline)
 * - Rotate wheel to select value
 * - Value displayed in center (green)
 * - Orange border with gradient, green tick marks
 * - Draggable orange handle
 *
 * Categories:
 * - Level: Awareness, Foundational, Intermediate, Advanced, Expert, Specialist
 * - Seniority: ALL, Junior, Mid Management, Director, Executive, VIP
 * - Theory/Practical: 50/50 at north, clockwise=more theory, counter-clockwise=more practical
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

// Level options
const LEVEL_OPTIONS = ['Awareness', 'Foundational', 'Intermediate', 'Advanced', 'Expert', 'Specialist']

// Seniority options
const SENIORITY_OPTIONS = ['All', 'Junior', 'Mid Management', 'Director', 'Executive', 'VIP']

// Category definitions
const CONTENT_CATEGORIES = {
  level: { label: 'Level:', options: LEVEL_OPTIONS, type: 'discrete' },
  seniority: { label: 'Seniority:', options: SENIORITY_OPTIONS, type: 'discrete' },
  theoryPractical: { label: 'Theory / Practical:', type: 'continuous' }
}

// Convert discrete value to rotation
function discreteValueToRotation(value, options) {
  const index = options.indexOf(value)
  if (index === -1) return 0
  const progress = index / (options.length - 1)
  return progress * 300 // Use 300 degrees range
}

// Convert rotation to discrete value
function rotationToDiscreteValue(rotation, options) {
  const normRot = Math.max(0, Math.min(300, rotation))
  const progress = normRot / 300
  const index = Math.round(progress * (options.length - 1))
  return options[index]
}

// Convert theory/practical (0-100) to rotation
// 50 = north (0), 0 = 100% theory (180 clockwise), 100 = 100% practical (180 counter-clockwise)
function theoryPracticalToRotation(value) {
  // 50 -> 0, 0 -> 150, 100 -> -150
  return (50 - value) * 3
}

// Convert rotation to theory/practical value
function rotationToTheoryPractical(rotation) {
  // Clamp to -150 to 150
  const clampedRot = Math.max(-150, Math.min(150, rotation))
  return Math.round(50 - clampedRot / 3)
}

function DefinePageContentWheel({
  values = {
    level: '',
    seniority: 'All',
    contentType: 50 // 0=100% Theory, 50=balanced, 100=100% Practical
  },
  onChange,
  size = 280
}) {
  const [selectedCategory, setSelectedCategory] = useState('seniority')
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startRotation = useRef(0)

  const categoryConfig = CONTENT_CATEGORIES[selectedCategory]
  const isActive = isDragging || isHovered

  // Get current value and rotation based on selected category
  const getCurrentValue = () => {
    if (selectedCategory === 'theoryPractical') {
      return values.contentType
    }
    return values[selectedCategory] || ''
  }

  const currentValue = getCurrentValue()

  // Get rotation for current value
  const getRotation = () => {
    if (selectedCategory === 'theoryPractical') {
      return theoryPracticalToRotation(values.contentType)
    }
    return discreteValueToRotation(currentValue, categoryConfig.options)
  }

  // Update rotation when category or value changes
  useEffect(() => {
    if (!isDragging) {
      setRotation(getRotation())
    }
  }, [selectedCategory, values, isDragging])

  // Get display value for center
  const getDisplayValue = () => {
    if (selectedCategory === 'theoryPractical') {
      const tp = values.contentType
      if (tp === 50) return 'Balanced'
      if (tp < 50) return `${100 - tp}% T`
      return `${tp}% P`
    }
    return currentValue || '--'
  }

  // Calculate angle from center of wheel
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angle = Math.atan2(clientX - centerX, centerY - clientY)
    return angle * (180 / Math.PI)
  }, [])

  // Handle rotational drag
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

    if (deltaAngle > 180) deltaAngle -= 360
    if (deltaAngle < -180) deltaAngle += 360

    let newRotation = startRotation.current + deltaAngle

    if (selectedCategory === 'theoryPractical') {
      newRotation = Math.max(-150, Math.min(150, newRotation))
      setRotation(newRotation)
      const newValue = rotationToTheoryPractical(newRotation)
      if (newValue !== values.contentType) {
        onChange?.('contentType', newValue)
      }
    } else {
      newRotation = Math.max(0, Math.min(300, newRotation))
      setRotation(newRotation)
      const newValue = rotationToDiscreteValue(newRotation, categoryConfig.options)
      if (newValue !== currentValue) {
        onChange?.(selectedCategory, newValue)
      }
    }
  }, [isDragging, selectedCategory, categoryConfig, currentValue, values, onChange, getAngleFromCenter])

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

    if (selectedCategory === 'theoryPractical') {
      const newValue = Math.max(0, Math.min(100, values.contentType + delta * 5))
      onChange?.('contentType', newValue)
    } else {
      const options = categoryConfig.options
      const currentIndex = options.indexOf(currentValue)
      const newIndex = Math.max(0, Math.min(options.length - 1, currentIndex + delta))
      if (options[newIndex] !== currentValue) {
        onChange?.(selectedCategory, options[newIndex])
      }
    }
  }, [selectedCategory, categoryConfig, currentValue, values, onChange])

  // Handle category selection
  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category)
  }, [])

  // Size calculations
  const innerSize = size * 0.65
  const handleRadius = size / 2 - 15
  const tickRadius = size / 2 - 8

  // Generate tick marks
  const numTicks = selectedCategory === 'theoryPractical' ? 11 : (categoryConfig.options?.length || 6)
  const tickAngles = []

  if (selectedCategory === 'theoryPractical') {
    // Ticks from -150 to +150 degrees
    for (let i = 0; i <= 10; i++) {
      tickAngles.push(-150 + i * 30 - 90)
    }
  } else {
    for (let i = 0; i < numTicks; i++) {
      const progress = i / (numTicks - 1 || 1)
      tickAngles.push(progress * 300 - 90)
    }
  }

  // Handle position
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
        CONTENT
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
            <linearGradient id="contentWheelGradLarge" x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke="url(#contentWheelGradLarge)"
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
              fontSize: selectedCategory === 'theoryPractical' ? '14px' : '17px',
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: '300',
              color: THEME.GREEN_BRIGHT,
              lineHeight: 1,
              textAlign: 'center',
              padding: '0 10px'
            }}
          >
            {getDisplayValue()}
          </span>
        </div>
      </div>

      {/* Category labels - single column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'flex-start',
          marginTop: '8px'
        }}
      >
        {Object.entries(CONTENT_CATEGORIES).map(([key, config]) => (
          <ContentCategoryLabel
            key={key}
            label={config.label}
            value={key === 'theoryPractical' ? getTheoryPracticalDisplay(values.contentType) : (values[key] || '--')}
            isSelected={selectedCategory === key}
            onClick={() => handleCategoryClick(key)}
          />
        ))}
      </div>
    </div>
  )
}

// Get display value for theory/practical in labels
function getTheoryPracticalDisplay(contentType) {
  if (contentType === 50) return 'Balanced'
  if (contentType < 50) return `${100 - contentType}T / ${contentType}P`
  return `${100 - contentType}T / ${contentType}P`
}

// Category label component
function ContentCategoryLabel({ label, value, isSelected, onClick }) {
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
        gap: '20px',
        cursor: 'pointer',
        padding: '2px 0',
        minWidth: '200px'
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
          color: isSelected ? THEME.GREEN_BRIGHT : value !== '--' ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
          textAlign: 'right'
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default DefinePageContentWheel
