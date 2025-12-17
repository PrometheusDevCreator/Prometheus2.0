/**
 * Navigate Page - Slide 2 of Mockup 2.1
 *
 * Layout:
 * - Shared Header component at top
 * - NavWheel dominates center of screen
 * - Status bar at bottom
 *
 * The NavWheel here is always in expanded state.
 * Clicking a section navigates to that page.
 */

import React, { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import Header from '../components/Header'
import Footer from '../components/Footer'

function Navigate({ onNavigate, courseData = {}, user, courseState }) {
  const [isPKEActive, setIsPKEActive] = useState(false)

  // Handle navigation from wheel
  const handleWheelNavigate = useCallback((sectionId) => {
    onNavigate?.(sectionId)
  }, [onNavigate])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_BASE,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Shared Header Component */}
      <Header pageTitle="NAVIGATION" courseData={courseData} />

      {/* Spacer to maintain layout */}
      <div style={{ flex: 1 }} />

      {/* NavWheel - Centre at Y=410, X=0 (screen center) */}
      <div
        style={{
          position: 'absolute',
          top: '37.96vh', // Y: 410 @ 1080
          left: '50%',    // X: 0 (centered)
          transform: 'translate(-50%, -50%)', // Center the wheel on this point
          width: '600px',
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        <NavigateWheel onNavigate={handleWheelNavigate} />
      </div>

      {/* Shared Footer Component */}
      <Footer
        currentSection="navigate"
        onNavigate={handleWheelNavigate}
        isPKEActive={isPKEActive}
        onPKEToggle={setIsPKEActive}
        onSave={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={15}
      />
    </div>
  )
}

/**
 * NavigateWheel - Large centered wheel for Navigate page
 * This is a specialized version of NavWheel for the full-page display
 */
function NavigateWheel({ onNavigate }) {
  const [hoveredSection, setHoveredSection] = React.useState(null)

  const sections = [
    { id: 'define', label: 'DEFINE', angle: 0 },      // North
    { id: 'design', label: 'DESIGN', angle: 90 },     // East
    { id: 'build', label: 'BUILD', angle: 180 },      // South
    { id: 'format', label: 'FORMAT', angle: 270 },    // West
  ]
  const centerSection = { id: 'generate', label: 'GENERATE' }

  // +50% size: 350 → 525
  const size = 525
  // Inner dashed circle radius - increased by 40%: 210 → 294
  const innerCircleRadius = 294

  // Fixed label positions (adjusted per spec)
  const getLabelPosition = (sectionId) => {
    switch(sectionId) {
      case 'define': return { x: 0, y: -190 }    // UP 10px
      case 'build': return { x: 0, y: 190 }      // DOWN 10px
      case 'design': return { x: 210, y: 0 }     // RIGHT 10px
      case 'format': return { x: -210, y: 0 }    // LEFT 10px
      default: return { x: 0, y: 0 }
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      {/* Outer ring */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <linearGradient id="navRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
          stroke="url(#navRingGrad)"
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

        {/* Tick marks */}
        {sections.map((section) => {
          const angle = section.angle * (Math.PI / 180)
          const innerR = size / 2 - 15
          const outerR = size / 2 - 4
          return (
            <line
              key={section.id}
              x1={size / 2 + innerR * Math.sin(angle)}
              y1={size / 2 - innerR * Math.cos(angle)}
              x2={size / 2 + outerR * Math.sin(angle)}
              y2={size / 2 - outerR * Math.cos(angle)}
              stroke={THEME.AMBER_DARK}
              strokeWidth="3"
            />
          )
        })}

        {/* Direction arrows - CLICKABLE */}
        {sections.map((section) => {
          const angle = section.angle
          const arrowRadius = size / 2 - 35
          const radians = (angle - 90) * (Math.PI / 180)
          const x = size / 2 + Math.cos(radians) * arrowRadius
          const y = size / 2 + Math.sin(radians) * arrowRadius
          const isHovered = hoveredSection === section.id

          return (
            <g
              key={`arrow-${section.id}`}
              onClick={() => onNavigate?.(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={isHovered ? THEME.AMBER_DARK : 'transparent'}
                stroke={isHovered ? THEME.AMBER : THEME.AMBER_DARK}
                strokeWidth="1.5"
                style={{ transition: 'all 0.3s ease' }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isHovered ? THEME.WHITE : THEME.AMBER}
                fontSize="21"
                style={{ pointerEvents: 'none' }}
              >
                {angle === 0 ? '↑' : angle === 90 ? '→' : angle === 180 ? '↓' : '←'}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Section labels - PASSIVE (colour change only, no glow, no click) */}
      {sections.map((section) => {
        const pos = getLabelPosition(section.id)
        const isHovered = hoveredSection === section.id

        const transformStyle = section.id === 'format'
          ? 'translate(0, -50%)'
          : section.id === 'design'
            ? 'translate(-100%, -50%)'
            : 'translate(-50%, -50%)'

        return (
          <div
            key={section.id}
            style={{
              position: 'absolute',
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              transform: transformStyle,
              fontSize: '18px',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '5px',
              fontWeight: isHovered ? '600' : '400',
              color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              padding: '12px 20px',
              borderRadius: '4px',
              background: isHovered ? 'rgba(212, 115, 12, 0.1)' : 'transparent',
              transition: 'all 0.3s ease',
              pointerEvents: 'none'  /* Labels don't capture clicks */
            }}
          >
            {section.label}
          </div>
        )
      })}

      {/* Center hub */}
      <div
        onClick={() => onNavigate?.(centerSection.id)}
        onMouseEnter={() => setHoveredSection(centerSection.id)}
        onMouseLeave={() => setHoveredSection(null)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `3px solid ${hoveredSection === centerSection.id ? THEME.AMBER : THEME.AMBER_DARK}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: hoveredSection === centerSection.id
            ? `0 0 40px rgba(212, 115, 12, 0.5)`
            : `0 0 20px rgba(212, 115, 12, 0.2)`
        }}
      >
        <span
          style={{
            fontSize: '17px',
            letterSpacing: '3px',
            color: hoveredSection === centerSection.id ? THEME.AMBER : THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            transition: 'color 0.3s ease'
          }}
        >
          {centerSection.label}
        </span>
      </div>
    </div>
  )
}

export default Navigate
