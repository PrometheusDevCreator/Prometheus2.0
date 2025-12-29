/**
 * WheelBase - Shared Wheel SVG Component
 *
 * Reusable wheel/dial component with configurable styling.
 * Used by: NavWheel, HomeWheel, DurationWheel
 *
 * Features:
 * - Configurable size, colors, glow effects
 * - Outer ring with gradient
 * - Inner circle with optional content
 * - Hover and active states
 */

import { THEME } from '../../constants/theme'

function WheelBase({
  size = 70,
  isActive = false,
  isHovered = false,
  activeColor = THEME.AMBER,
  glowColor = 'rgba(212, 115, 12, 0.6)',
  borderWidth = 2,
  showOuterRing = true,
  showTickMarks = false,
  tickCount = 4,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style = {}
}) {
  const centerSize = size * 0.7 // Inner circle is 70% of outer
  const ringRadius = size / 2 - borderWidth

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {/* SVG for outer ring and decorative elements */}
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
          <linearGradient id={`wheelRingGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
            <stop offset="50%" stopColor={THEME.AMBER_DARK} />
            <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
          </linearGradient>

          {/* Glow filter for active/hover states */}
          <filter id={`wheelGlow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer decorative ring */}
        {showOuterRing && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke={isActive || isHovered ? activeColor : `url(#wheelRingGrad-${size})`}
            strokeWidth={borderWidth}
            opacity={isActive || isHovered ? 1 : 0.6}
            style={{
              transition: 'all 0.2s ease',
              filter: isHovered ? `drop-shadow(0 0 8px ${glowColor})` : 'none'
            }}
          />
        )}

        {/* Tick marks at cardinal positions */}
        {showTickMarks && [...Array(tickCount)].map((_, i) => {
          const angle = (i * 360 / tickCount) * (Math.PI / 180)
          const innerR = size / 2 - 10
          const outerR = size / 2 - 4
          return (
            <line
              key={i}
              x1={size / 2 + innerR * Math.sin(angle)}
              y1={size / 2 - innerR * Math.cos(angle)}
              x2={size / 2 + outerR * Math.sin(angle)}
              y2={size / 2 - outerR * Math.cos(angle)}
              stroke={THEME.AMBER_DARKEST}
              strokeWidth={2}
            />
          )
        })}
      </svg>

      {/* Center circle / content area */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: centerSize,
          height: centerSize,
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `${borderWidth}px solid ${isActive || isHovered ? activeColor : THEME.AMBER_DARK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: isHovered
            ? `0 0 12px ${glowColor}`
            : isActive
              ? `0 0 8px ${glowColor}`
              : 'none'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default WheelBase
