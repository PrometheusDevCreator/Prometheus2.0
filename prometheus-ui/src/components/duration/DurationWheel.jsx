/**
 * DurationWheel - Single Adjustable Wheel Component
 *
 * A dial/wheel for selecting numeric values.
 * Supports rotational drag to adjust values up/down.
 *
 * Features:
 * - Click & drag rotation to change value
 * - Scroll to change value
 * - Burnt orange border by default (or grey for structure wheels)
 * - Luminous green on hover/active
 * - Selected numeral displays in center
 *
 * Props:
 * - value: Current selected value
 * - min: Minimum value
 * - max: Maximum value
 * - label: Label text (e.g., "HOURS")
 * - onChange: Callback (newValue) => void
 * - disabled: Whether wheel is interactive
 * - showMonthLabel: For WEEKS > 4, show "Month X" label
 * - size: Wheel diameter in pixels
 * - isStructure: Whether this is a structure wheel (grey default)
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

function DurationWheel({
  value = 0,
  min = 0,
  max = 12,
  label = '',
  onChange,
  disabled = false,
  showMonthLabel = false,
  size = 110,
  isStructure = false
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startValue = useRef(value)
  const accumulatedRotation = useRef(0)

  const isActive = isDragging || (isHovered && !disabled)

  // Determine colors based on state and wheel type
  const defaultBorderColor = isStructure && !isActive ? '#555555' : THEME.AMBER
  const borderColor = isActive ? THEME.GREEN_BRIGHT : defaultBorderColor
  const glowColor = isActive ? 'rgba(0, 255, 0, 0.4)' : (isStructure && !isActive ? 'none' : 'rgba(212, 115, 12, 0.3)')
  const numeralColor = value > 0 ? THEME.GREEN_BRIGHT : THEME.WHITE

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

    const delta = e.deltaY > 0 ? -1 : 1
    const newValue = Math.max(min, Math.min(max, value + delta))
    if (newValue !== value) {
      onChange?.(newValue)
      // Animate rotation
      setRotation(prev => prev + (delta * 15))
    }
  }, [value, min, max, onChange, disabled])

  // Handle rotational drag
  const handleMouseDown = useCallback((e) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    startAngle.current = getAngleFromCenter(e.clientX, e.clientY)
    startValue.current = value
    accumulatedRotation.current = 0
  }, [value, disabled, getAngleFromCenter])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
    let deltaAngle = currentAngle - startAngle.current

    // Handle angle wrapping
    if (deltaAngle > 180) deltaAngle -= 360
    if (deltaAngle < -180) deltaAngle += 360

    // Update visual rotation
    setRotation(prev => {
      const newRot = prev + deltaAngle
      startAngle.current = currentAngle
      return newRot
    })

    // Accumulate rotation for value changes
    accumulatedRotation.current += deltaAngle
    const degreesPerUnit = 30 // 30 degrees = 1 unit change
    const deltaValue = Math.floor(accumulatedRotation.current / degreesPerUnit)

    if (deltaValue !== 0) {
      const newValue = Math.max(min, Math.min(max, startValue.current + deltaValue))
      if (newValue !== value) {
        onChange?.(newValue)
      }
      // Update start value to prevent jumping
      startValue.current = newValue
      accumulatedRotation.current = accumulatedRotation.current % degreesPerUnit
    }
  }, [isDragging, min, max, value, onChange, getAngleFromCenter])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Global mouse handlers for drag outside component
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e) => handleMouseMove(e)
      const handleGlobalUp = () => setIsDragging(false)
      window.addEventListener('mousemove', handleGlobalMove)
      window.addEventListener('mouseup', handleGlobalUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMove)
        window.removeEventListener('mouseup', handleGlobalUp)
      }
    }
  }, [isDragging, handleMouseMove])

  // Month label for weeks > 4
  const getMonthLabel = () => {
    if (!showMonthLabel || value <= 4) return null
    const monthNum = Math.ceil(value / 4)
    return `Month ${monthNum}`
  }

  const monthLabel = getMonthLabel()

  // Size constants
  const innerSize = size * 0.75
  const tickColor = isStructure && !isActive ? '#444444' : THEME.AMBER_DARK
  const innerBorderColor = isStructure && !isActive ? '#444444' : THEME.AMBER_DARK

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
        {/* Outer ring SVG with rotation */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <defs>
            <linearGradient id={`durationWheelGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isStructure && !isActive ? '#333333' : THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={isStructure && !isActive ? '#444444' : THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={isStructure && !isActive ? '#333333' : THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer decorative ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={isActive ? borderColor : `url(#durationWheelGrad-${label})`}
            strokeWidth={2}
            style={{
              transition: isDragging ? 'none' : 'all 0.2s ease',
              filter: glowColor !== 'none' ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
            }}
          />

          {/* Tick marks around the ring - rotate with wheel */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) * (Math.PI / 180)
            const innerR = size / 2 - 8
            const outerR = size / 2 - 3
            const isMainTick = i % 3 === 0
            return (
              <line
                key={i}
                x1={size / 2 + innerR * Math.sin(angle)}
                y1={size / 2 - innerR * Math.cos(angle)}
                x2={size / 2 + outerR * Math.sin(angle)}
                y2={size / 2 - outerR * Math.cos(angle)}
                stroke={isMainTick ? tickColor : (isStructure && !isActive ? '#333333' : 'rgba(138, 69, 19, 0.5)')}
                strokeWidth={isMainTick ? 2 : 1}
              />
            )
          })}

          {/* Indicator mark at top */}
          <circle
            cx={size / 2}
            cy={6}
            r={3}
            fill={isActive ? THEME.GREEN_BRIGHT : tickColor}
          />
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
            border: `2px solid ${isActive ? borderColor : innerBorderColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isActive && glowColor !== 'none'
              ? `0 0 12px ${glowColor}, inset 0 0 8px ${glowColor}`
              : 'none',
            pointerEvents: 'none'
          }}
        >
          {/* Value display */}
          <span
            style={{
              fontSize: size > 90 ? '2.2vh' : '1.8vh',
              fontFamily: THEME.FONT_MONO,
              fontWeight: '600',
              color: numeralColor,
              textShadow: value > 0 ? `0 0 8px ${THEME.GREEN_BRIGHT}` : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {value}
          </span>

          {/* Month label (for weeks) */}
          {monthLabel && (
            <span
              style={{
                fontSize: '0.8vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: THEME.TEXT_DIM,
                marginTop: '-2px'
              }}
            >
              {monthLabel}
            </span>
          )}
        </div>

        {/* Drag hint */}
        {isHovered && !isDragging && (
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: isActive ? THEME.GREEN_BRIGHT : tickColor,
              fontSize: '0.7vh',
              opacity: 0.7,
              whiteSpace: 'nowrap'
            }}
          >
            ↻ drag
          </div>
        )}
      </div>

      {/* Label below wheel */}
      <span
        style={{
          fontSize: size > 90 ? '1.1vh' : '0.95vh',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.12vh',
          color: isActive ? THEME.AMBER : (isStructure ? THEME.TEXT_DIM : THEME.TEXT_SECONDARY),
          transition: 'color 0.2s ease'
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default DurationWheel
