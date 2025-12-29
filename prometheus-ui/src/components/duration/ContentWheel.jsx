/**
 * ContentWheel - Theory/Practical Balance Wheel
 *
 * A specialized wheel for selecting the balance between Theory and Practical content.
 *
 * Scale:
 * - North (0°) = 50/50 balanced
 * - Clockwise to +180° = increases Theory (100% Theory at +180°)
 * - Counter-clockwise to -180° = increases Practical (100% Practical at -180°)
 *
 * Value mapping:
 * - contentType 0 = 100% Theory, 0% Practical (rotation +180°)
 * - contentType 50 = 50/50 balanced (rotation 0°)
 * - contentType 100 = 0% Theory, 100% Practical (rotation -180°)
 *
 * Features:
 * - Click & drag rotation to change value
 * - Scroll to change value
 * - Burnt orange border by default
 * - Luminous green on hover/active
 * - Shows T% / P% in center
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

// Convert contentType (0-100) to rotation (-180 to +180)
// contentType 0 = +180° (100% Theory)
// contentType 50 = 0° (balanced)
// contentType 100 = -180° (100% Practical)
function valueToRotation(contentType) {
  return (50 - contentType) * 3.6  // Maps 0-100 to +180 to -180
}

// Convert rotation to contentType
function rotationToValue(rotation) {
  // Clamp rotation to -180 to +180
  const clampedRot = Math.max(-180, Math.min(180, rotation))
  // Convert to contentType (0-100)
  const value = 50 - (clampedRot / 3.6)
  return Math.round(Math.max(0, Math.min(100, value)))
}

function ContentWheel({
  value = 50,  // contentType: 0=100% Theory, 100=100% Practical
  onChange,
  disabled = false,
  size = 101
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(() => valueToRotation(value))
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startRotation = useRef(0)

  const isActive = isDragging || (isHovered && !disabled)

  // Sync rotation when value prop changes
  useEffect(() => {
    if (!isDragging) {
      setRotation(valueToRotation(value))
    }
  }, [value, isDragging])

  // Calculate percentages
  const theoryPercent = 100 - value
  const practicalPercent = value

  // Calculate angle from center of wheel
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    // Angle from center, with 0° at top (north)
    const angle = Math.atan2(clientX - centerX, centerY - clientY)
    return angle * (180 / Math.PI)
  }, [])

  // Handle scroll to change value
  const handleWheel = useCallback((e) => {
    if (disabled) return
    e.preventDefault()

    // Scroll up = clockwise = more theory
    // Scroll down = counter-clockwise = more practical
    const delta = e.deltaY > 0 ? 5 : -5  // 5% per scroll step
    const newValue = Math.max(0, Math.min(100, value + delta))

    if (newValue !== value) {
      onChange?.(newValue)
      setRotation(valueToRotation(newValue))
    }
  }, [value, onChange, disabled])

  // Handle rotational drag
  const handleMouseDown = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    startAngle.current = getAngleFromCenter(e.clientX, e.clientY)
    startRotation.current = rotation
  }, [rotation, disabled, getAngleFromCenter])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
    let deltaAngle = currentAngle - startAngle.current

    // Handle angle wrapping
    if (deltaAngle > 180) deltaAngle -= 360
    if (deltaAngle < -180) deltaAngle += 360

    // Update rotation (clamped to -180 to +180)
    let newRotation = startRotation.current + deltaAngle
    newRotation = Math.max(-180, Math.min(180, newRotation))

    setRotation(newRotation)

    // Convert to value and notify
    const newValue = rotationToValue(newRotation)
    if (newValue !== value) {
      onChange?.(newValue)
    }
  }, [isDragging, value, onChange, getAngleFromCenter])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Snap to nearest 5%
      const snappedValue = Math.round(value / 5) * 5
      if (snappedValue !== value) {
        onChange?.(snappedValue)
      }
      setRotation(valueToRotation(snappedValue !== value ? snappedValue : value))
    }
  }, [isDragging, value, onChange])

  // Global mouse handlers for drag outside component
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleMouseMove(e)
      const handleGlobalUp = () => handleMouseUp()
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove)
        window.removeEventListener('mouseup', handleGlobalUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Colors
  const borderColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER
  const glowColor = isActive ? 'rgba(0, 255, 0, 0.4)' : 'rgba(212, 115, 12, 0.3)'

  // Text colors based on balance
  const theoryColor = theoryPercent > 50 ? THEME.GREEN_BRIGHT : THEME.WHITE
  const practicalColor = practicalPercent > 50 ? THEME.GREEN_BRIGHT : THEME.WHITE

  // Size calculations
  const innerSize = size * 0.7
  const tickColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK

  return (
    <div
      ref={wheelRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseLeave={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4vh',
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {/* Wheel container */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size
        }}
      >
        {/* Outer ring SVG */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <defs>
            <linearGradient id="contentWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={isActive ? borderColor : 'url(#contentWheelGrad)'}
            strokeWidth={2}
            style={{
              transition: isDragging ? 'none' : 'all 0.2s ease',
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />

          {/* Theory/Practical zone indicators */}
          {/* Right half = Theory zone */}
          <path
            d={`M ${size/2} ${size/2} L ${size/2} 4 A ${size/2 - 4} ${size/2 - 4} 0 0 1 ${size/2} ${size - 4} Z`}
            fill="none"
            stroke={THEME.AMBER_DARK}
            strokeWidth={1}
            opacity={0.3}
          />

          {/* Tick marks at key positions */}
          {/* North = 50/50 */}
          <line
            x1={size / 2}
            y1={4}
            x2={size / 2}
            y2={14}
            stroke={tickColor}
            strokeWidth={2}
          />
          {/* East = 75% Theory */}
          <line
            x1={size - 4}
            y1={size / 2}
            x2={size - 14}
            y2={size / 2}
            stroke={tickColor}
            strokeWidth={1}
          />
          {/* West = 75% Practical */}
          <line
            x1={4}
            y1={size / 2}
            x2={14}
            y2={size / 2}
            stroke={tickColor}
            strokeWidth={1}
          />
          {/* South = 100% (either direction limit) */}
          <line
            x1={size / 2}
            y1={size - 4}
            x2={size / 2}
            y2={size - 14}
            stroke={tickColor}
            strokeWidth={2}
          />

          {/* T and P labels on wheel */}
          <text
            x={size - 18}
            y={size / 2 + 4}
            fill={THEME.TEXT_DIM}
            fontSize="10"
            fontFamily={THEME.FONT_PRIMARY}
          >
            T
          </text>
          <text
            x={10}
            y={size / 2 + 4}
            fill={THEME.TEXT_DIM}
            fontSize="10"
            fontFamily={THEME.FONT_PRIMARY}
          >
            P
          </text>

          {/* Current position indicator */}
          <g transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}>
            <polygon
              points={`${size / 2},6 ${size / 2 - 5},16 ${size / 2 + 5},16`}
              fill={isActive ? THEME.GREEN_BRIGHT : THEME.AMBER}
            />
          </g>
        </svg>

        {/* Inner circle with value (doesn't rotate) */}
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
            border: `2px solid ${isActive ? borderColor : THEME.AMBER_DARK}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isActive
              ? `0 0 12px ${glowColor}, inset 0 0 8px ${glowColor}`
              : 'none',
            pointerEvents: 'none',
            padding: '4px'
          }}
        >
          {/* Theory percentage */}
          <span
            style={{
              fontSize: '0.9vh',
              fontFamily: THEME.FONT_MONO,
              color: theoryColor,
              lineHeight: 1,
              textShadow: theoryPercent > 50 ? `0 0 6px ${THEME.GREEN_BRIGHT}` : 'none'
            }}
          >
            T:{theoryPercent}%
          </span>

          {/* Divider */}
          <div
            style={{
              width: '60%',
              height: '1px',
              background: THEME.BORDER_LIGHT,
              margin: '3px 0'
            }}
          />

          {/* Practical percentage */}
          <span
            style={{
              fontSize: '0.9vh',
              fontFamily: THEME.FONT_MONO,
              color: practicalColor,
              lineHeight: 1,
              textShadow: practicalPercent > 50 ? `0 0 6px ${THEME.GREEN_BRIGHT}` : 'none'
            }}
          >
            P:{practicalPercent}%
          </span>
        </div>
      </div>

      {/* Label below wheel */}
      <span
        style={{
          fontSize: size > 90 ? '1vh' : '0.85vh',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.1vh',
          color: isActive ? THEME.AMBER : THEME.TEXT_SECONDARY,
          transition: 'color 0.2s ease'
        }}
      >
        CONTENT
      </span>
    </div>
  )
}

export default ContentWheel
