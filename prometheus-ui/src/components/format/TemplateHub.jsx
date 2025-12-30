/**
 * TemplateHub.jsx - Central Radial Hub for FORMAT Page
 *
 * CCO-FORMAT-HUB-001: Must be IDENTICAL to NavWheel (expanded state)
 *
 * Requirements:
 * - Identical size (var(--navwheel-expanded) = 280px @ 1080)
 * - Identical colour, font sizes, glow function
 * - Identical placement (fixed, centered on screen)
 * - Output nodes at diagonal positions (45°, 135°, 225°, 315°) with icons
 * - Centre is GENERATE (navigates to GENERATE page)
 */

import { useState, useCallback } from 'react'
import { THEME, ANIMATION } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import logo from '../../assets/burntorangelogo.png'

// SVG size must match NavWheel for pixel calculations
const SIZE = ANIMATION.WHEEL_EXPANDED_SIZE || 280
const CENTER_SIZE = 70  // Same as NavWheel expanded
const LABEL_RADIUS = 100  // Same as NavWheel expanded
const NODE_SIZE = 50  // Size of output node circles

// Output positions at diagonal positions (replacing cardinal arrows)
const OUTPUT_POSITIONS = [
  { type: 'presentation', angle: 45, label: 'PRESENTATION' },   // NE
  { type: 'timetable', angle: 135, label: 'TIMETABLE' },        // SE
  { type: 'lesson_plan', angle: 225, label: 'LESSON PLAN' },    // SW
  { type: 'qa_form', angle: 315, label: 'QA FORM' }             // NW
]

// Icons for each output type (simple SVG paths)
const OUTPUT_ICONS = {
  presentation: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  timetable: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="4" x2="9" y2="22" />
      <line x1="15" y1="4" x2="15" y2="22" />
      <line x1="3" y1="16" x2="21" y2="16" />
    </svg>
  ),
  lesson_plan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  ),
  qa_form: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}

function TemplateHub({ onNavigate }) {
  const { selectedOutput, setSelectedOutput, getOutputStatus } = useTemplate()
  const [hoveredOutput, setHoveredOutput] = useState(null)
  const [centerHovered, setCenterHovered] = useState(false)

  // Calculate node position from angle (same as NavWheel)
  const getNodePosition = useCallback((angle) => {
    const radians = (angle - 90) * (Math.PI / 180) // -90 to start from top
    const x = Math.cos(radians) * LABEL_RADIUS
    const y = Math.sin(radians) * LABEL_RADIUS
    return { x, y }
  }, [])

  // Handle output selection
  const handleOutputClick = useCallback((outputType) => {
    setSelectedOutput(outputType === selectedOutput ? null : outputType)
  }, [selectedOutput, setSelectedOutput])

  // Handle centre click - navigate to GENERATE
  const handleCenterClick = useCallback(() => {
    if (onNavigate) {
      onNavigate('generate')
    }
  }, [onNavigate])

  // Get status color (CORRECTION #6: from TemplateSpec only)
  const getStatusColor = (status) => {
    switch (status) {
      case 'mapped': return THEME.GREEN_BRIGHT
      case 'loaded': return THEME.AMBER
      default: return '#666666'
    }
  }

  const centerX = SIZE / 2
  const centerY = SIZE / 2

  return (
    <>
      {/* Main wheel container - IDENTICAL to NavWheel expanded positioning */}
      <div
        style={{
          position: 'fixed',
          bottom: '50%',
          left: '50%',
          transform: 'translate(-50%, 50%)',
          width: 'var(--navwheel-expanded)',
          height: 'var(--navwheel-expanded)',
          zIndex: 100
        }}
      >
        {/* Outer ring SVG - IDENTICAL to NavWheel */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="formatRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer decorative ring - matches NavWheel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={SIZE / 2 - 2}
            fill="none"
            stroke="url(#formatRingGrad)"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Inner track circle - matches NavWheel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={LABEL_RADIUS}
            fill="none"
            stroke={THEME.BORDER}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Tick marks at output positions - matches NavWheel cardinal ticks */}
          {OUTPUT_POSITIONS.map(({ type, angle }) => {
            const radians = angle * (Math.PI / 180)
            const innerR = SIZE / 2 - 12
            const outerR = SIZE / 2 - 4
            return (
              <line
                key={`tick-${type}`}
                x1={centerX + innerR * Math.sin(radians)}
                y1={centerY - innerR * Math.cos(radians)}
                x2={centerX + outerR * Math.sin(radians)}
                y2={centerY - outerR * Math.cos(radians)}
                stroke={THEME.AMBER_DARKEST}
                strokeWidth="2"
              />
            )
          })}

          {/* Connecting lines from center to outputs */}
          {OUTPUT_POSITIONS.map(({ type, angle }) => {
            const pos = getNodePosition(angle)
            const status = getOutputStatus(type)
            const isSelected = selectedOutput === type
            const lineColor = status === 'mapped' ? THEME.GREEN_BRIGHT :
                             status === 'loaded' ? THEME.AMBER :
                             isSelected ? THEME.AMBER :
                             THEME.AMBER_DARKEST

            return (
              <line
                key={`line-${type}`}
                x1={centerX}
                y1={centerY}
                x2={centerX + pos.x}
                y2={centerY + pos.y}
                stroke={lineColor}
                strokeWidth="1"
                opacity={isSelected ? "0.6" : "0.3"}
              />
            )
          })}
        </svg>

        {/* Output nodes at diagonal positions - replace NavWheel arrows */}
        {OUTPUT_POSITIONS.map(({ type, angle, label }) => {
          const pos = getNodePosition(angle)
          const status = getOutputStatus(type)
          const isSelected = selectedOutput === type
          const isHovered = hoveredOutput === type
          const statusColor = getStatusColor(status)

          // Label position offset based on angle (like NavWheel section labels)
          let labelOffsetX = '0'
          let labelOffsetY = '0'
          if (angle === 45) { labelOffsetX = '2.6vw'; labelOffsetY = '-3.2vh' }  // NE: right and up
          if (angle === 135) { labelOffsetX = '2.6vw'; labelOffsetY = '3.2vh' }  // SE: right and down
          if (angle === 225) { labelOffsetX = '-2.6vw'; labelOffsetY = '3.2vh' } // SW: left and down
          if (angle === 315) { labelOffsetX = '-2.6vw'; labelOffsetY = '-3.2vh' } // NW: left and up

          return (
            <div key={type}>
              {/* Output Node Circle with Icon */}
              <div
                onClick={() => handleOutputClick(type)}
                onMouseEnter={() => setHoveredOutput(type)}
                onMouseLeave={() => setHoveredOutput(null)}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${pos.x}px - ${NODE_SIZE / 2}px)`,
                  top: `calc(50% + ${pos.y}px - ${NODE_SIZE / 2}px)`,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  borderRadius: '50%',
                  background: THEME.BG_DARK,
                  border: `0.19vh solid ${isSelected || isHovered ? THEME.AMBER : THEME.AMBER_DARK}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected || isHovered
                    ? `0 0 1.85vh rgba(212, 115, 12, 0.4)`
                    : 'none',
                  color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_DIM
                }}
              >
                {OUTPUT_ICONS[type]}

                {/* Status dot */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusColor,
                    boxShadow: status !== 'none' ? `0 0 6px ${statusColor}` : 'none'
                  }}
                />
              </div>

              {/* Label - positioned outside node */}
              <div
                onClick={() => handleOutputClick(type)}
                onMouseEnter={() => setHoveredOutput(type)}
                onMouseLeave={() => setHoveredOutput(null)}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${pos.x}px + ${labelOffsetX})`,
                  top: `calc(50% + ${pos.y}px + ${labelOffsetY})`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.11vh',           /* 12px @ 1080 - matches NavWheel */
                  fontFamily: THEME.FONT_PRIMARY,
                  letterSpacing: '0.28vh',      /* 3px @ 1080 - matches NavWheel */
                  fontWeight: isSelected ? '600' : '400',
                  whiteSpace: 'nowrap',
                  padding: '0.74vh 1.11vh',     /* 8px 12px @ 1080 - matches NavWheel */
                  borderRadius: '0.37vh',       /* 4px @ 1080 */
                  background: isHovered ? 'rgba(212, 115, 12, 0.1)' : 'transparent',
                  color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_DIM,
                  textShadow: isSelected ? `0 0 0.93vh ${THEME.AMBER}` : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {label}
              </div>
            </div>
          )
        })}

        {/* Center Hub with Logo - IDENTICAL to NavWheel */}
        <div
          onClick={handleCenterClick}
          onMouseEnter={() => setCenterHovered(true)}
          onMouseLeave={() => setCenterHovered(false)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'var(--navwheel-center-lg)',
            height: 'var(--navwheel-center-lg)',
            borderRadius: '50%',
            background: THEME.BG_DARK,
            border: `0.19vh solid ${centerHovered ? THEME.AMBER : THEME.AMBER_DARK}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            zIndex: 10,
            boxShadow: centerHovered
              ? `0 0 1.85vh rgba(212, 115, 12, 0.4)`
              : `0 0 1.85vh rgba(212, 115, 12, 0.3)`
          }}
        >
          <img
            src={logo}
            alt="Prometheus"
            style={{
              width: '4.63vh',   /* 50px @ 1080 - matches NavWheel */
              height: '4.63vh',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 0.93vh rgba(212, 115, 12, 0.5))',
              transition: 'all 0.4s ease'
            }}
          />
        </div>

        {/* Center label (GENERATE) - below center - IDENTICAL to NavWheel */}
        <div
          onClick={handleCenterClick}
          onMouseEnter={() => setCenterHovered(true)}
          onMouseLeave={() => setCenterHovered(false)}
          style={{
            position: 'absolute',
            top: `calc(50% + var(--navwheel-center-lg) / 2 + 1.39vh)`,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.93vh',           /* 10px @ 1080 - matches NavWheel */
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.19vh',      /* 2px @ 1080 - matches NavWheel */
            whiteSpace: 'nowrap',
            color: centerHovered ? THEME.AMBER : THEME.TEXT_DIM,
            opacity: centerHovered ? 1 : 0.7,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          GENERATE
        </div>

        {/* Current output indicator (below wheel) - matches NavWheel section indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '-13.43vh',           /* -145px @ 1080 - matches NavWheel */
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '1.11vh',         /* 12px @ 1080 */
              letterSpacing: '0.28vh',    /* 3px @ 1080 */
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO,
              marginBottom: '0.37vh'      /* 4px @ 1080 */
            }}
          >
            {hoveredOutput
              ? OUTPUT_POSITIONS.find(o => o.type === hoveredOutput)?.label
              : selectedOutput
                ? OUTPUT_POSITIONS.find(o => o.type === selectedOutput)?.label
                : 'FORMAT'
            }
          </div>
          <div
            style={{
              fontSize: '0.83vh',         /* 9px @ 1080 */
              letterSpacing: '0.19vh',    /* 2px @ 1080 */
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO
            }}
          >
            {hoveredOutput ? 'CLICK TO SELECT' : selectedOutput ? 'SELECTED OUTPUT' : 'TEMPLATE MAPPING'}
          </div>
        </div>
      </div>
    </>
  )
}

export default TemplateHub
