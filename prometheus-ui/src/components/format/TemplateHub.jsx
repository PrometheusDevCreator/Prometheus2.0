/**
 * TemplateHub.jsx - Central Radial Hub for FORMAT Page
 *
 * MUST BE IDENTICAL TO NavWheel (expanded state) except:
 * - Diagonal positions (45°, 135°, 225°, 315°) instead of cardinal (0°, 90°, 180°, 270°)
 * - Icons instead of arrows
 * - Output type labels instead of section labels
 *
 * All sizing, positioning, colors, fonts, glow copied EXACTLY from NavWheel.jsx
 */

import { useState, useCallback } from 'react'
import { THEME, ANIMATION } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import logo from '../../assets/burntorangelogo.png'

// EXACT same constants as NavWheel
const SIZE = ANIMATION.WHEEL_EXPANDED_SIZE || 280
const LABEL_RADIUS = 100  // Same as NavWheel labelRadius
const ARROW_RADIUS = SIZE / 2 - 25  // 115px - where NavWheel places arrows

// Output positions at diagonal positions (45° offset from NavWheel cardinal positions)
const OUTPUT_POSITIONS = [
  { type: 'presentation', angle: 45, label: 'PRESENTATION' },   // NE
  { type: 'timetable', angle: 135, label: 'TIMETABLE' },        // SE
  { type: 'lesson_plan', angle: 225, label: 'LESSON PLAN' },    // SW
  { type: 'qa_form', angle: 315, label: 'QA FORM' }             // NW
]

function TemplateHub({ onNavigate }) {
  const { selectedOutput, setSelectedOutput, getOutputStatus } = useTemplate()
  const [hoveredOutput, setHoveredOutput] = useState(null)
  const [centerHovered, setCenterHovered] = useState(false)

  // Calculate position from angle - EXACT same as NavWheel getSectionPosition
  const getPosition = useCallback((angle, radius) => {
    const radians = (angle - 90) * (Math.PI / 180) // -90 to start from top
    const x = Math.cos(radians) * radius
    const y = Math.sin(radians) * radius
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

  // Get section styling - EXACT same pattern as NavWheel getSectionStyle
  const getOutputStyle = (type) => {
    const isSelected = selectedOutput === type
    const isHovered = hoveredOutput === type

    return {
      color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_DIM,
      textShadow: isSelected ? `0 0 0.93vh ${THEME.AMBER}` : 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }

  const centerX = SIZE / 2
  const centerY = SIZE / 2

  return (
    <>
      {/* Main wheel container - EXACT same as NavWheel expanded */}
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
        {/* Outer ring SVG - EXACT same as NavWheel (no viewBox, no style width/height) */}
        <svg
          width={SIZE}
          height={SIZE}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <defs>
            <linearGradient id="formatRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer decorative ring - EXACT same as NavWheel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={SIZE / 2 - 2}
            fill="none"
            stroke="url(#formatRingGrad)"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Inner track circle - EXACT same as NavWheel */}
          <circle
            cx={centerX}
            cy={centerY}
            r={LABEL_RADIUS}
            fill="none"
            stroke={THEME.BORDER}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Tick marks at diagonal positions - same style as NavWheel cardinal ticks */}
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

          {/* Icons at diagonal positions - replacing NavWheel arrow polygons */}
          {/* Positioned at ARROW_RADIUS (115px) same as NavWheel arrows */}
          {OUTPUT_POSITIONS.map(({ type, angle }) => {
            const radians = (angle - 90) * (Math.PI / 180)
            const x = centerX + Math.cos(radians) * ARROW_RADIUS
            const y = centerY + Math.sin(radians) * ARROW_RADIUS
            const isSelected = selectedOutput === type
            const isHovered = hoveredOutput === type
            const status = getOutputStatus(type)

            // Icon color based on state
            const iconColor = isSelected || isHovered ? THEME.AMBER :
                             status === 'mapped' ? THEME.GREEN_BRIGHT :
                             status === 'loaded' ? THEME.AMBER :
                             THEME.AMBER_DARK

            // Icon paths for each type (sized to match arrow visual weight ~16px)
            const iconSize = 8
            let iconPath
            switch (type) {
              case 'presentation':
                iconPath = (
                  <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                    <rect x="0" y="1" width="16" height="10" rx="1" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                    <line x1="5" y1="14" x2="11" y2="14" stroke={iconColor} strokeWidth="1.2"/>
                    <line x1="8" y1="11" x2="8" y2="14" stroke={iconColor} strokeWidth="1.2"/>
                  </g>
                )
                break
              case 'timetable':
                iconPath = (
                  <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                    <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                    <line x1="1" y1="5" x2="15" y2="5" stroke={iconColor} strokeWidth="1"/>
                    <line x1="5" y1="1" x2="5" y2="15" stroke={iconColor} strokeWidth="1"/>
                    <line x1="11" y1="1" x2="11" y2="15" stroke={iconColor} strokeWidth="1"/>
                  </g>
                )
                break
              case 'lesson_plan':
                iconPath = (
                  <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                    <path d="M10 0H3a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5z" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                    <path d="M10 0v5h5" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                    <line x1="4" y1="9" x2="12" y2="9" stroke={iconColor} strokeWidth="1"/>
                    <line x1="4" y1="12" x2="10" y2="12" stroke={iconColor} strokeWidth="1"/>
                  </g>
                )
                break
              case 'qa_form':
                iconPath = (
                  <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                    <path d="M5 8l3 3L15 2" fill="none" stroke={iconColor} strokeWidth="1.5"/>
                    <path d="M14 8v6a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h8" fill="none" stroke={iconColor} strokeWidth="1.2"/>
                  </g>
                )
                break
            }

            return (
              <g
                key={`icon-${type}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleOutputClick(type)}
                onMouseEnter={() => setHoveredOutput(type)}
                onMouseLeave={() => setHoveredOutput(null)}
                opacity={isSelected || isHovered ? 1 : 0.8}
              >
                {iconPath}
              </g>
            )
          })}
        </svg>

        {/* Output labels - EXACT same pattern as NavWheel section labels */}
        {OUTPUT_POSITIONS.map(({ type, angle, label }) => {
          const pos = getPosition(angle, LABEL_RADIUS)
          const isSelected = selectedOutput === type
          const isHovered = hoveredOutput === type

          // Position adjustments - same pattern as NavWheel but for diagonal positions
          // NavWheel: DEFINE(up), DESIGN(right), BUILD(down), FORMAT(left)
          // FormatHub: NE(right+up), SE(right+down), SW(left+down), NW(left+up)
          let offsetX = '0'
          let offsetY = '0'
          if (angle === 45) {   // NE - PRESENTATION
            offsetX = '3.65vw'   // RIGHT (same as DESIGN)
            offsetY = '-4.63vh'  // UP (same as DEFINE)
          }
          if (angle === 135) {  // SE - TIMETABLE
            offsetX = '3.65vw'   // RIGHT (same as DESIGN)
            offsetY = '4.63vh'   // DOWN (same as BUILD)
          }
          if (angle === 225) {  // SW - LESSON PLAN
            offsetX = '-3.65vw'  // LEFT (same as FORMAT)
            offsetY = '4.63vh'   // DOWN (same as BUILD)
          }
          if (angle === 315) {  // NW - QA FORM
            offsetX = '-3.65vw'  // LEFT (same as FORMAT)
            offsetY = '-4.63vh'  // UP (same as DEFINE)
          }

          return (
            <div
              key={type}
              onClick={() => handleOutputClick(type)}
              onMouseEnter={() => setHoveredOutput(type)}
              onMouseLeave={() => setHoveredOutput(null)}
              style={{
                position: 'absolute',
                left: `calc(50% + ${pos.x}px + ${offsetX})`,
                top: `calc(50% + ${pos.y}px + ${offsetY})`,
                transform: 'translate(-50%, -50%)',
                ...getOutputStyle(type),
                fontSize: '1.11vh',           /* 12px @ 1080 - EXACT same as NavWheel */
                fontFamily: THEME.FONT_PRIMARY,
                letterSpacing: '0.28vh',      /* 3px @ 1080 - EXACT same as NavWheel */
                fontWeight: isSelected ? '600' : '400',
                whiteSpace: 'nowrap',
                padding: '0.74vh 1.11vh',     /* 8px 12px @ 1080 - EXACT same as NavWheel */
                borderRadius: '0.37vh',       /* 4px @ 1080 */
                background: isHovered ? 'rgba(212, 115, 12, 0.1)' : 'transparent'
              }}
            >
              {label}
            </div>
          )
        })}

        {/* Center hub with logo - EXACT same as NavWheel */}
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
            boxShadow: `0 0 1.85vh rgba(212, 115, 12, 0.3)`
          }}
        >
          <img
            src={logo}
            alt="Prometheus"
            style={{
              width: '4.63vh',
              height: '4.63vh',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 0.93vh rgba(212, 115, 12, 0.5))',
              transition: 'all 0.4s ease'
            }}
          />
        </div>

        {/* Center label (GENERATE) - EXACT same as NavWheel */}
        <div
          onClick={handleCenterClick}
          onMouseEnter={() => setCenterHovered(true)}
          onMouseLeave={() => setCenterHovered(false)}
          style={{
            position: 'absolute',
            top: `calc(50% + var(--navwheel-center-lg) / 2 + 1.39vh)`,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.93vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.19vh',
            whiteSpace: 'nowrap',
            color: centerHovered ? THEME.AMBER : THEME.TEXT_DIM,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: centerHovered ? 1 : 0.7
          }}
        >
          GENERATE
        </div>

        {/* Current output indicator - EXACT same as NavWheel section indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '-13.43vh',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '1.11vh',
              letterSpacing: '0.28vh',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO,
              marginBottom: '0.37vh'
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
              fontSize: '0.83vh',
              letterSpacing: '0.19vh',
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
