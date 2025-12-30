/**
 * LogarithmicDurationWheel - Single Wheel with Non-Linear Duration Scale
 *
 * Scale Distribution (360 degrees total):
 * - 1st fifth (0-72°): Hours 0-12 (13 values)
 * - 2nd fifth (72-144°): Days 1-5 (5 values)
 * - 3rd fifth (144-216°): Days 6-10 (5 values)
 * - 4th & 5th fifth (216-360°): Weeks 3-30 (28 values)
 *
 * Features:
 * - Click & drag rotation to change value
 * - Scroll to change value
 * - Burnt orange border by default
 * - Luminous green on hover/active
 * - Central numeral with dynamic unit label below
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

// Scale definition: maps rotation ranges to values
const SCALE_SEGMENTS = [
  { startDeg: 0, endDeg: 72, unit: 'HOURS', minVal: 0, maxVal: 12 },
  { startDeg: 72, endDeg: 144, unit: 'DAYS', minVal: 1, maxVal: 5 },
  { startDeg: 144, endDeg: 216, unit: 'DAYS', minVal: 6, maxVal: 10 },
  { startDeg: 216, endDeg: 360, unit: 'WEEKS', minVal: 3, maxVal: 30 }
]

// Convert rotation (0-360) to {value, unit}
function rotationToValue(rotation) {
  // Normalize rotation to 0-360
  const normRot = ((rotation % 360) + 360) % 360

  for (const seg of SCALE_SEGMENTS) {
    if (normRot >= seg.startDeg && normRot < seg.endDeg) {
      const segProgress = (normRot - seg.startDeg) / (seg.endDeg - seg.startDeg)
      const valueRange = seg.maxVal - seg.minVal
      const value = Math.round(seg.minVal + segProgress * valueRange)
      return { value, unit: seg.unit }
    }
  }
  // Edge case: exactly 360 degrees
  return { value: 30, unit: 'WEEKS' }
}

// Convert {value, unit} to rotation (0-360)
function valueToRotation(value, unit) {
  for (const seg of SCALE_SEGMENTS) {
    if (seg.unit === unit && value >= seg.minVal && value <= seg.maxVal) {
      const valueRange = seg.maxVal - seg.minVal
      const segProgress = valueRange > 0 ? (value - seg.minVal) / valueRange : 0
      return seg.startDeg + segProgress * (seg.endDeg - seg.startDeg)
    }
  }
  return 0
}

// Get all discrete values in order
function getAllValues() {
  const values = []
  for (const seg of SCALE_SEGMENTS) {
    for (let v = seg.minVal; v <= seg.maxVal; v++) {
      values.push({ value: v, unit: seg.unit })
    }
  }
  return values
}

const ALL_VALUES = getAllValues()

function LogarithmicDurationWheel({
  value = 0,
  unit = 'HOURS',
  onChange,
  disabled = false,
  size = 135
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(() => valueToRotation(value, unit))
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startRotation = useRef(0)

  const isActive = isDragging || (isHovered && !disabled)

  // Sync rotation when value/unit props change
  useEffect(() => {
    if (!isDragging) {
      setRotation(valueToRotation(value, unit))
    }
  }, [value, unit, isDragging])

  // Calculate angle from center of wheel
  const getAngleFromCenter = useCallback((clientX, clientY) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const angle = Math.atan2(clientY - centerY, clientX - centerX)
    return angle * (180 / Math.PI)
  }, [])

  // Handle scroll to change value
  const handleWheel = useCallback((e) => {
    if (disabled) return
    e.preventDefault()

    // Find current index in ALL_VALUES
    const currentIdx = ALL_VALUES.findIndex(
      v => v.value === value && v.unit === unit
    )

    const delta = e.deltaY > 0 ? 1 : -1
    const newIdx = Math.max(0, Math.min(ALL_VALUES.length - 1, currentIdx + delta))

    if (newIdx !== currentIdx) {
      const newVal = ALL_VALUES[newIdx]
      onChange?.(newVal.value, newVal.unit)
      setRotation(valueToRotation(newVal.value, newVal.unit))
    }
  }, [value, unit, onChange, disabled])

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

    // Update rotation (clamped to 0-360)
    let newRotation = startRotation.current + deltaAngle
    newRotation = Math.max(0, Math.min(359, newRotation))

    setRotation(newRotation)

    // Convert to value and notify
    const { value: newVal, unit: newUnit } = rotationToValue(newRotation)
    if (newVal !== value || newUnit !== unit) {
      onChange?.(newVal, newUnit)
    }
  }, [isDragging, value, unit, onChange, getAngleFromCenter])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Snap to nearest discrete value
      const { value: snapVal, unit: snapUnit } = rotationToValue(rotation)
      setRotation(valueToRotation(snapVal, snapUnit))
    }
  }, [isDragging, rotation])

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
  const numeralColor = value > 0 ? THEME.GREEN_BRIGHT : THEME.WHITE

  // Size calculations
  const innerSize = size * 0.7
  const tickColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK

  // Generate scale markers for the wheel
  const scaleMarkers = []
  SCALE_SEGMENTS.forEach((seg, segIdx) => {
    const numTicks = seg.maxVal - seg.minVal + 1
    for (let i = 0; i <= numTicks; i++) {
      const progress = i / numTicks
      const angle = seg.startDeg + progress * (seg.endDeg - seg.startDeg)
      const isSegmentStart = i === 0 && segIdx > 0
      scaleMarkers.push({ angle, isSegmentStart })
    }
  })

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
        gap: '0.5vh',
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
        {/* Outer ring SVG with rotation indicator */}
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
            <linearGradient id="logWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 3}
            fill="none"
            stroke={isActive ? borderColor : 'url(#logWheelGrad)'}
            strokeWidth={3}
            style={{
              transition: isDragging ? 'none' : 'all 0.2s ease',
              filter: `drop-shadow(0 0 12px ${glowColor})`
            }}
          />

          {/* Scale segment dividers */}
          {SCALE_SEGMENTS.slice(1).map((seg, idx) => {
            const angle = (seg.startDeg - 90) * (Math.PI / 180)
            const innerR = size / 2 - 20
            const outerR = size / 2 - 3
            return (
              <line
                key={idx}
                x1={size / 2 + innerR * Math.cos(angle)}
                y1={size / 2 + innerR * Math.sin(angle)}
                x2={size / 2 + outerR * Math.cos(angle)}
                y2={size / 2 + outerR * Math.sin(angle)}
                stroke={THEME.AMBER}
                strokeWidth={2}
              />
            )
          })}

          {/* Minor tick marks */}
          {[...Array(36)].map((_, i) => {
            const angle = (i * 10 - 90) * (Math.PI / 180)
            const innerR = size / 2 - 12
            const outerR = size / 2 - 6
            return (
              <line
                key={i}
                x1={size / 2 + innerR * Math.cos(angle)}
                y1={size / 2 + innerR * Math.sin(angle)}
                x2={size / 2 + outerR * Math.cos(angle)}
                y2={size / 2 + outerR * Math.sin(angle)}
                stroke={`${tickColor}60`}
                strokeWidth={1}
              />
            )
          })}

          {/* Current position indicator - North (top) = 0 */}
          <g transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}>
            <polygon
              points={`${size / 2},8 ${size / 2 - 6},20 ${size / 2 + 6},20`}
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
              ? `0 0 15px ${glowColor}, inset 0 0 10px ${glowColor}`
              : 'none',
            pointerEvents: 'none'
          }}
        >
          {/* Value display */}
          <span
            style={{
              fontSize: size > 100 ? '2.8vh' : '2.2vh',
              fontFamily: THEME.FONT_MONO,
              fontWeight: '600',
              color: numeralColor,
              textShadow: 'none',
              transition: 'all 0.2s ease',
              lineHeight: 1
            }}
          >
            {value}
          </span>

          {/* Unit label - white text */}
          <span
            style={{
              fontSize: size > 100 ? '1.1vh' : '0.9vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              letterSpacing: '0.1em',
              marginTop: '4px'
            }}
          >
            {unit}
          </span>
        </div>

        {/* Drag hint */}
        {isHovered && !isDragging && (
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK,
              fontSize: '0.8vh',
              opacity: 0.7,
              whiteSpace: 'nowrap'
            }}
          >
            drag to adjust
          </div>
        )}
      </div>

      {/* Label below wheel */}
      <span
        style={{
          fontSize: '1.4vh',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.15vh',
          color: isActive ? THEME.AMBER : THEME.TEXT_SECONDARY,
          transition: 'color 0.2s ease'
        }}
      >
        DURATION
      </span>
    </div>
  )
}

export default LogarithmicDurationWheel
