/**
 * FormatWheel.jsx - Large centered wheel for FORMAT page
 *
 * BASED ON NavigateWheel (525px) per Controller directive.
 *
 * Differences from NavigateWheel:
 * - Diagonal positions (45°, 135°, 225°, 315°) instead of cardinal (0°, 90°, 180°, 270°)
 * - Icons instead of arrows
 * - Output type labels instead of section labels
 * - Center hub contains GENERATE text, navigates to GENERATE page
 */

import React from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'

function FormatWheel({ onNavigate }) {
  const { selectedOutput, setSelectedOutput, getOutputStatus } = useTemplate()
  const [hoveredOutput, setHoveredOutput] = React.useState(null)
  const [isInOuterRing, setIsInOuterRing] = React.useState(false)
  const [isPulsing, setIsPulsing] = React.useState(false)
  const [centerHovered, setCenterHovered] = React.useState(false)
  const wheelRef = React.useRef(null)

  // Output positions at diagonal angles (45° offset from NavigateWheel cardinal positions)
  const outputs = [
    { type: 'presentation', label: 'PRESENTATION', angle: 45 },   // NE
    { type: 'timetable', label: 'TIMETABLE', angle: 135 },        // SE
    { type: 'lesson_plan', label: 'LESSON PLAN', angle: 225 },    // SW
    { type: 'handbook', label: 'HANDBOOK', angle: 315 }           // NW
  ]

  // SAME SIZE AS NavigateWheel
  const size = 525
  const innerCircleRadius = 294
  const greenArcRadius = size / 2 + 8
  const arcExtent = 22.5

  // Track mouse position for outer ring detection
  const handleMouseMove = React.useCallback((e) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const innerBound = innerCircleRadius - 20
    const outerBound = size / 2 + 30
    setIsInOuterRing(distance >= innerBound && distance <= outerBound)
  }, [size, innerCircleRadius])

  // Handle output click
  const handleOutputClick = React.useCallback((outputType) => {
    setIsPulsing(true)
    setTimeout(() => {
      setIsPulsing(false)
      setSelectedOutput(outputType === selectedOutput ? null : outputType)
    }, 300)
  }, [selectedOutput, setSelectedOutput])

  // Handle center click - navigate to GENERATE
  const handleCenterClick = React.useCallback(() => {
    if (onNavigate) {
      onNavigate('generate')
    }
  }, [onNavigate])

  // Label positions for diagonal placement (scaled from NavigateWheel's 190/210)
  const getLabelPosition = (angle) => {
    const labelRadius = 200  // Distance from center for labels
    const radians = (angle - 90) * (Math.PI / 180)
    return {
      x: Math.cos(radians) * labelRadius,
      y: Math.sin(radians) * labelRadius
    }
  }

  // Calculate arc path for green indicator
  const getArcPath = (centerAngle) => {
    const startAngle = (centerAngle - arcExtent - 90) * (Math.PI / 180)
    const endAngle = (centerAngle + arcExtent - 90) * (Math.PI / 180)
    const cx = size / 2
    const cy = size / 2
    const r = greenArcRadius

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  // Get angle for hovered output
  const getHoveredAngle = () => {
    const output = outputs.find(o => o.type === hoveredOutput)
    return output ? output.angle : null
  }

  const hoveredAngle = getHoveredAngle()

  // Get icon for output type
  const getOutputIcon = (type, x, y, isHovered, isSelected) => {
    const status = getOutputStatus(type)
    const iconColor = isSelected || isHovered ? THEME.AMBER :
                      status === 'mapped' ? THEME.GREEN_BRIGHT :
                      status === 'loaded' ? THEME.AMBER :
                      THEME.AMBER_DARK

    const iconSize = 12  // Scaled up from 8 for 525px wheel

    switch (type) {
      case 'presentation':
        return (
          <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
            <rect x="0" y="2" width="24" height="15" rx="1.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <line x1="7" y1="21" x2="17" y2="21" stroke={iconColor} strokeWidth="1.8"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke={iconColor} strokeWidth="1.8"/>
          </g>
        )
      case 'timetable':
        return (
          <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
            <rect x="1" y="1" width="22" height="22" rx="1.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <line x1="1" y1="8" x2="23" y2="8" stroke={iconColor} strokeWidth="1.5"/>
            <line x1="8" y1="1" x2="8" y2="23" stroke={iconColor} strokeWidth="1.5"/>
            <line x1="16" y1="1" x2="16" y2="23" stroke={iconColor} strokeWidth="1.5"/>
          </g>
        )
      case 'lesson_plan':
        return (
          <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
            <path d="M15 0H4.5a3 3 0 00-3 3v18a3 3 0 003 3h15a3 3 0 003-3V7.5z" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <path d="M15 0v7.5h7.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <line x1="6" y1="13.5" x2="18" y2="13.5" stroke={iconColor} strokeWidth="1.5"/>
            <line x1="6" y1="18" x2="15" y2="18" stroke={iconColor} strokeWidth="1.5"/>
          </g>
        )
      case 'handbook':
        return (
          <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" fill="none" stroke={iconColor} strokeWidth="1.8"/>
            <line x1="8" y1="6" x2="16" y2="6" stroke={iconColor} strokeWidth="1.5"/>
            <line x1="8" y1="10" x2="14" y2="10" stroke={iconColor} strokeWidth="1.5"/>
          </g>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={wheelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsInOuterRing(false)}
      style={{
        position: 'fixed',
        top: 'calc(50% - 70px)',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 100
      }}
    >
      {/* Green arc indicator - outside outer ring */}
      {hoveredAngle !== null && (
        <svg
          width={size + 40}
          height={size + 40}
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            pointerEvents: 'none'
          }}
        >
          <defs>
            <filter id="formatGreenGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={getArcPath(hoveredAngle)}
            fill="none"
            stroke="#00FF00"
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeLinecap="round"
            transform={`translate(20, 20)`}
            style={{
              filter: isInOuterRing ? 'url(#formatGreenGlow)' : 'none',
              opacity: isPulsing ? 1 : 0.8,
              transition: 'opacity 0.15s ease',
              animation: isPulsing ? 'greenPulse 0.3s ease-out' : 'none'
            }}
          />
        </svg>
      )}

      {/* Outer ring SVG */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="formatRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
            <stop offset="50%" stopColor={THEME.AMBER_DARK} />
            <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
          </linearGradient>
        </defs>

        {/* Outer circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="url(#formatRingGrad)"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Inner dashed circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={innerCircleRadius}
          fill="none"
          stroke={THEME.BORDER}
          strokeWidth="1"
          strokeDasharray="6 6"
        />

        {/* Tick marks at diagonal positions */}
        {outputs.map((output) => {
          const angle = output.angle * (Math.PI / 180)
          const innerR = size / 2 - 15
          const outerR = size / 2 - 4
          return (
            <line
              key={`tick-${output.type}`}
              x1={size / 2 + innerR * Math.sin(angle)}
              y1={size / 2 - innerR * Math.cos(angle)}
              x2={size / 2 + outerR * Math.sin(angle)}
              y2={size / 2 - outerR * Math.cos(angle)}
              stroke={THEME.AMBER_DARK}
              strokeWidth="3"
            />
          )
        })}

        {/* Icons at diagonal positions (replacing arrows) */}
        {outputs.map((output) => {
          const angle = output.angle
          const iconRadius = size / 2 - 35  // Same as NavigateWheel arrowRadius
          const radians = (angle - 90) * (Math.PI / 180)
          const x = size / 2 + Math.cos(radians) * iconRadius
          const y = size / 2 + Math.sin(radians) * iconRadius
          const isHovered = hoveredOutput === output.type
          const isSelected = selectedOutput === output.type

          return (
            <g
              key={`icon-${output.type}`}
              onClick={() => handleOutputClick(output.type)}
              onMouseEnter={() => setHoveredOutput(output.type)}
              onMouseLeave={() => setHoveredOutput(null)}
              style={{
                cursor: 'pointer',
                filter: isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(212, 115, 12, 0.8))' : 'none',
                transition: 'filter 0.3s ease'
              }}
            >
              {/* Background circle for click area */}
              <circle
                cx={x}
                cy={y}
                r="18"
                fill={isHovered || isSelected ? 'rgba(212, 115, 12, 0.15)' : 'transparent'}
                stroke="none"
              />
              {getOutputIcon(output.type, x, y, isHovered, isSelected)}
            </g>
          )
        })}
      </svg>

      {/* Output labels - positioned at diagonals */}
      {outputs.map((output) => {
        const pos = getLabelPosition(output.angle)
        const isHovered = hoveredOutput === output.type
        const isSelected = selectedOutput === output.type

        // Transform adjustments for diagonal label positioning
        let transformStyle = 'translate(-50%, -50%)'
        if (output.angle === 45) transformStyle = 'translate(-100%, 0)'      // NE - right of point
        if (output.angle === 135) transformStyle = 'translate(-100%, -100%)' // SE - right of point
        if (output.angle === 225) transformStyle = 'translate(0, -100%)'     // SW - left of point
        if (output.angle === 315) transformStyle = 'translate(0, 0)'         // NW - left of point

        // Horizontal offset: right labels +85px, left labels -85px
        let horizontalOffset = 0
        if (output.angle === 45 || output.angle === 135) horizontalOffset = 85    // Right side (100 - 15)
        if (output.angle === 225 || output.angle === 315) horizontalOffset = -85  // Left side (-100 + 15)

        // Vertical offset: top labels -10px, bottom labels +10px
        let verticalOffset = 0
        if (output.angle === 45 || output.angle === 315) verticalOffset = -10     // Top (PRESENTATION, HANDBOOK)
        if (output.angle === 135 || output.angle === 225) verticalOffset = 10     // Bottom (TIMETABLE, LESSON PLAN)

        return (
          <div
            key={output.type}
            onClick={() => handleOutputClick(output.type)}
            onMouseEnter={() => setHoveredOutput(output.type)}
            onMouseLeave={() => setHoveredOutput(null)}
            style={{
              position: 'absolute',
              left: `calc(50% + ${pos.x + horizontalOffset}px)`,
              top: `calc(50% + ${pos.y + verticalOffset}px)`,
              transform: transformStyle,
              fontSize: '18px',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '5px',
              fontWeight: isSelected ? '600' : '400',
              color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              padding: '12px 20px',
              borderRadius: '4px',
              background: 'transparent',
              transition: 'color 0.3s ease',
              cursor: 'pointer',
              textShadow: isSelected ? `0 0 10px ${THEME.AMBER}` : 'none'
            }}
          >
            {output.label}
          </div>
        )
      })}

      {/* Center hub */}
      <div
        onClick={handleCenterClick}
        onMouseEnter={() => setCenterHovered(true)}
        onMouseLeave={() => setCenterHovered(false)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `3px solid ${centerHovered ? THEME.AMBER : THEME.AMBER_DARK}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: centerHovered
            ? `0 0 40px rgba(212, 115, 12, 0.5)`
            : `0 0 20px rgba(212, 115, 12, 0.2)`
        }}
      />

      {/* Center label (GENERATE) - centered in hub */}
      <div
        onClick={handleCenterClick}
        onMouseEnter={() => setCenterHovered(true)}
        onMouseLeave={() => setCenterHovered(false)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '17px',
          letterSpacing: '3px',
          color: centerHovered ? THEME.AMBER : THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY,
          cursor: 'pointer',
          transition: 'color 0.3s ease',
          opacity: centerHovered ? 1 : 0.7
        }}
      >
        GENERATE
      </div>

    </div>
  )
}

export default FormatWheel
