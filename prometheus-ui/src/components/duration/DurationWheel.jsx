/**
 * DurationWheel - Single Adjustable Wheel Component
 *
 * A dial/wheel for selecting numeric values.
 * Size: 100-120px diameter
 *
 * Features:
 * - Scroll or click to select value
 * - Burnt orange border by default
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
 */

import { useState, useCallback, useRef } from 'react'
import { THEME } from '../../constants/theme'

function DurationWheel({
  value = 0,
  min = 0,
  max = 12,
  label = '',
  onChange,
  disabled = false,
  showMonthLabel = false
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const wheelRef = useRef(null)
  const startY = useRef(0)
  const startValue = useRef(value)

  const isActive = isDragging || (isHovered && !disabled)

  // Determine colors based on state
  const borderColor = isActive ? THEME.GREEN_BRIGHT : THEME.AMBER
  const glowColor = isActive ? 'rgba(0, 255, 0, 0.4)' : 'rgba(212, 115, 12, 0.3)'
  const numeralColor = value > 0 ? THEME.GREEN_BRIGHT : THEME.WHITE

  // Handle scroll to change value
  const handleWheel = useCallback((e) => {
    if (disabled) return
    e.preventDefault()

    const delta = e.deltaY > 0 ? -1 : 1
    const newValue = Math.max(min, Math.min(max, value + delta))
    if (newValue !== value) {
      onChange?.(newValue)
    }
  }, [value, min, max, onChange, disabled])

  // Handle drag to change value
  const handleMouseDown = useCallback((e) => {
    if (disabled) return
    setIsDragging(true)
    startY.current = e.clientY
    startValue.current = value
  }, [value, disabled])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const deltaY = startY.current - e.clientY
    const sensitivity = 5 // pixels per unit change
    const deltaValue = Math.round(deltaY / sensitivity)
    const newValue = Math.max(min, Math.min(max, startValue.current + deltaValue))

    if (newValue !== value) {
      onChange?.(newValue)
    }
  }, [isDragging, min, max, value, onChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Click to increment (simple interaction)
  const handleClick = useCallback(() => {
    if (disabled || isDragging) return
    const newValue = value >= max ? min : value + 1
    onChange?.(newValue)
  }, [value, min, max, onChange, disabled, isDragging])

  // Month label for weeks > 4
  const getMonthLabel = () => {
    if (!showMonthLabel || value <= 4) return null
    const monthNum = Math.ceil(value / 4)
    return `Month ${monthNum}`
  }

  const monthLabel = getMonthLabel()

  // Size constants
  const size = 110
  const innerSize = size * 0.75

  return (
    <div
      ref={wheelRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsDragging(false)
      }}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5vh',
        cursor: disabled ? 'not-allowed' : 'pointer',
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
            <linearGradient id={`durationWheelGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke={isActive ? borderColor : `url(#durationWheelGrad-${label})`}
            strokeWidth={2}
            style={{
              transition: 'all 0.2s ease',
              filter: isActive ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
            }}
          />

          {/* Tick marks around the ring */}
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
                stroke={isMainTick ? THEME.AMBER_DARK : 'rgba(138, 69, 19, 0.5)'}
                strokeWidth={isMainTick ? 2 : 1}
              />
            )
          })}
        </svg>

        {/* Inner circle with value */}
        <div
          onClick={handleClick}
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
              : 'none'
          }}
        >
          {/* Value display */}
          <span
            style={{
              fontSize: '2.2vh',
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
                fontSize: '0.9vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: THEME.TEXT_DIM,
                marginTop: '-2px'
              }}
            >
              {monthLabel}
            </span>
          )}
        </div>

        {/* Up/Down indicators */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK,
            fontSize: '0.8vh',
            opacity: isActive ? 1 : 0.5,
            transition: 'all 0.2s ease'
          }}
        >
          ▲
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: isActive ? THEME.GREEN_BRIGHT : THEME.AMBER_DARK,
            fontSize: '0.8vh',
            opacity: isActive ? 1 : 0.5,
            transition: 'all 0.2s ease'
          }}
        >
          ▼
        </div>
      </div>

      {/* Label below wheel */}
      <span
        style={{
          fontSize: '1.1vh',
          fontFamily: THEME.FONT_PRIMARY,
          letterSpacing: '0.15vh',
          color: isActive ? THEME.AMBER : THEME.TEXT_SECONDARY,
          transition: 'color 0.2s ease'
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default DurationWheel
