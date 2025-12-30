/**
 * CategoricalWheel - Wheel for selecting from categorical options
 *
 * Used for Level and Seniority selection with text-based values.
 * Same interaction as DurationWheel: drag to rotate, scroll to change.
 *
 * Features:
 * - Click & drag rotation to change value
 * - Scroll to change value
 * - Burnt orange border by default
 * - Luminous green on hover/active
 * - Selected option displays in center
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../constants/theme'

function CategoricalWheel({
  value = '',
  options = [],
  label = '',
  onChange,
  disabled = false,
  size = 100,
  required = false
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef(null)
  const startAngle = useRef(0)
  const startValue = useRef(value)
  const accumulatedRotation = useRef(0)

  const isActive = isDragging || (isHovered && !disabled)
  const currentIndex = options.indexOf(value)
  const hasValue = value && value !== '' && currentIndex >= 0

  // Determine colors based on state
  const borderColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER
  const glowColor = isActive ? 'rgba(0, 255, 0, 0.4)' : 'rgba(212, 115, 12, 0.3)'
  const textColor = hasValue ? THEME.GREEN_BRIGHT : THEME.WHITE

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
    if (disabled || options.length === 0) return
    e.preventDefault()

    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(options.length - 1, currentIndex + delta))

    if (newIndex !== currentIndex) {
      onChange?.(options[newIndex])
      setRotation(prev => prev + (delta * 20))
    }
  }, [currentIndex, options, onChange, disabled])

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
    if (!isDragging || options.length === 0) return

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
    const degreesPerUnit = 360 / options.length
    const deltaValue = Math.floor(accumulatedRotation.current / degreesPerUnit)

    if (deltaValue !== 0) {
      const startIdx = options.indexOf(startValue.current)
      const newIndex = Math.max(0, Math.min(options.length - 1, startIdx + deltaValue))
      const newValue = options[newIndex]

      if (newValue !== value) {
        onChange?.(newValue)
      }
      startValue.current = newValue
      accumulatedRotation.current = accumulatedRotation.current % degreesPerUnit
    }
  }, [isDragging, options, value, onChange, getAngleFromCenter])

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

  // Size constants
  const innerSize = size * 0.72
  const tickColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK

  // Get display text - abbreviated for small wheels
  const getDisplayText = () => {
    if (!hasValue) return '---'
    // Abbreviate long text for smaller sizes
    if (size < 90 && value.length > 8) {
      return value.substring(0, 6) + '...'
    }
    return value
  }

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
            <linearGradient id={`catWheelGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke={isActive ? borderColor : `url(#catWheelGrad-${label})`}
            strokeWidth={2}
            style={{
              transition: isDragging ? 'none' : 'all 0.2s ease',
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />

          {/* Tick marks - one per option */}
          {options.map((_, i) => {
            const angle = (i * (360 / options.length)) * (Math.PI / 180)
            const innerR = size / 2 - 10
            const outerR = size / 2 - 4
            const isCurrentTick = i === currentIndex
            return (
              <line
                key={i}
                x1={size / 2 + innerR * Math.sin(angle)}
                y1={size / 2 - innerR * Math.cos(angle)}
                x2={size / 2 + outerR * Math.sin(angle)}
                y2={size / 2 - outerR * Math.cos(angle)}
                stroke={isCurrentTick ? THEME.GREEN_BRIGHT : tickColor}
                strokeWidth={isCurrentTick ? 3 : 2}
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
          {/* Value display - increased 10% */}
          <span
            style={{
              fontSize: size > 80 ? '1.2vh' : '1.0vh',
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: '500',
              color: textColor,
              textShadow: 'none',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '90%',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {getDisplayText()}
          </span>
        </div>
      </div>

      {/* Label below wheel */}
      <span
        style={{
          fontSize: size > 90 ? '1.15vh' : '1vh',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.1vh',
          color: isActive ? THEME.AMBER : THEME.TEXT_SECONDARY,
          transition: 'color 0.2s ease'
        }}
      >
        {label}
        {required && !hasValue && (
          <span style={{ color: '#ff6666', marginLeft: '2px' }}>*</span>
        )}
      </span>
    </div>
  )
}

export default CategoricalWheel
