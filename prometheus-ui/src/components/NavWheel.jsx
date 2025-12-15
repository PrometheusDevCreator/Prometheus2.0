/**
 * NavWheel - Compass-style Navigation Component
 *
 * Two modes:
 * - Full (expanded): 280px diameter, centered on screen with backdrop overlay
 * - Mini (collapsed): 70px diameter, bottom-left corner
 *
 * Navigation sections:
 * - North: DEFINE
 * - East: DESIGN
 * - South: BUILD
 * - West: FORMAT
 * - Center: GENERATE
 */

import { useState, useCallback } from 'react'
import { THEME, NAV_SECTIONS, ANIMATION } from '../constants/theme'
import logo from '../assets/burntorangelogo.png'

function NavWheel({
  currentSection = 'define',
  onNavigate,
  isExpanded = false,
  onToggle,
  showLabels = true
}) {
  const [hoveredSection, setHoveredSection] = useState(null)

  // Sizes based on expanded state (using ANIMATION constants for SVG calculations)
  const size = isExpanded ? ANIMATION.WHEEL_EXPANDED_SIZE : ANIMATION.WHEEL_COLLAPSED_SIZE
  const centerSize = isExpanded ? 70 : 54  // Used for SVG calculations
  const labelRadius = isExpanded ? 100 : 0 // Used for SVG position calculations

  // Get cardinal sections (excluding center/generate)
  const cardinalSections = NAV_SECTIONS.filter(s => s.angle !== null)
  const centerSection = NAV_SECTIONS.find(s => s.angle === null)

  // Calculate position for a section label
  const getSectionPosition = (angle) => {
    const radians = (angle - 90) * (Math.PI / 180) // -90 to start from top
    const x = Math.cos(radians) * labelRadius
    const y = Math.sin(radians) * labelRadius
    return { x, y }
  }

  // Handle section click
  const handleSectionClick = useCallback((sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId)
    }
  }, [onNavigate])

  // Handle center click (toggle or navigate to generate)
  const handleCenterClick = useCallback(() => {
    if (isExpanded && centerSection) {
      // When expanded, clicking center navigates to GENERATE
      handleSectionClick(centerSection.id)
    } else if (onToggle) {
      // When collapsed, clicking expands the wheel
      onToggle()
    }
  }, [isExpanded, onToggle, handleSectionClick, centerSection])

  // Get section styling
  const getSectionStyle = (section) => {
    const isActive = currentSection === section.id
    const isHovered = hoveredSection === section.id

    return {
      color: isActive || isHovered ? THEME.AMBER : THEME.TEXT_DIM,
      textShadow: isActive ? `0 0 0.93vh ${THEME.AMBER}` : 'none',  /* 10px @ 1080 */
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  }

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div
          className="navwheel-backdrop"
          onClick={onToggle}
        />
      )}

      {/* Main wheel container */}
      <div
        className="navwheel-container"
        style={{
          position: isExpanded ? 'fixed' : 'absolute',
          bottom: isExpanded ? '50%' : '2.78vh',        /* 30px @ 1080 */
          left: isExpanded ? '50%' : '1.56vw',          /* 30px @ 1920 */
          transform: isExpanded ? 'translate(-50%, 50%)' : 'none',
          width: isExpanded ? 'var(--navwheel-expanded)' : 'var(--navwheel-collapsed)',
          height: isExpanded ? 'var(--navwheel-expanded)' : 'var(--navwheel-collapsed)',
          zIndex: 1000
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
            <linearGradient id="compassRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
            stroke="url(#compassRingGrad)"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Inner elements only when expanded */}
          {isExpanded && (
            <>
              {/* Inner track circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={labelRadius}
                fill="none"
                stroke={THEME.BORDER}
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Tick marks at cardinal positions */}
              {cardinalSections.map((section, i) => {
                const angle = section.angle * (Math.PI / 180)
                const innerR = size / 2 - 12
                const outerR = size / 2 - 4
                return (
                  <line
                    key={section.id}
                    x1={size / 2 + innerR * Math.sin(angle)}
                    y1={size / 2 - innerR * Math.cos(angle)}
                    x2={size / 2 + outerR * Math.sin(angle)}
                    y2={size / 2 - outerR * Math.cos(angle)}
                    stroke={THEME.AMBER_DARKEST}
                    strokeWidth="2"
                  />
                )
              })}

              {/* Direction arrows */}
              {cardinalSections.map((section) => {
                const angle = section.angle
                const arrowRadius = size / 2 - 25
                const radians = (angle - 90) * (Math.PI / 180)
                const x = size / 2 + Math.cos(radians) * arrowRadius
                const y = size / 2 + Math.sin(radians) * arrowRadius

                // Arrow pointing outward
                const arrowSize = 8
                const arrowAngle = angle * (Math.PI / 180)

                return (
                  <polygon
                    key={`arrow-${section.id}`}
                    points={`
                      ${x + Math.sin(arrowAngle) * arrowSize},${y - Math.cos(arrowAngle) * arrowSize}
                      ${x - Math.cos(arrowAngle) * arrowSize / 2 - Math.sin(arrowAngle) * arrowSize / 2},${y - Math.sin(arrowAngle) * arrowSize / 2 + Math.cos(arrowAngle) * arrowSize / 2}
                      ${x + Math.cos(arrowAngle) * arrowSize / 2 - Math.sin(arrowAngle) * arrowSize / 2},${y + Math.sin(arrowAngle) * arrowSize / 2 + Math.cos(arrowAngle) * arrowSize / 2}
                    `}
                    fill={currentSection === section.id ? THEME.AMBER : THEME.AMBER_DARK}
                    opacity="0.8"
                  />
                )
              })}
            </>
          )}
        </svg>

        {/* Section labels (only when expanded) */}
        {isExpanded && showLabels && cardinalSections.map((section) => {
          const pos = getSectionPosition(section.angle)
          const isActive = currentSection === section.id
          const isHovered = hoveredSection === section.id

          // Position adjustments per user request (viewport units)
          let offsetX = '0'
          let offsetY = '0'
          if (section.id === 'define') offsetY = '-4.63vh'  // UP 50px @ 1080
          if (section.id === 'design') offsetX = '3.65vw'   // RIGHT 70px @ 1920
          if (section.id === 'build') offsetY = '4.63vh'    // DOWN 50px @ 1080
          if (section.id === 'format') offsetX = '-3.65vw'  // LEFT 70px @ 1920

          return (
            <div
              key={section.id}
              onClick={() => handleSectionClick(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              style={{
                position: 'absolute',
                left: `calc(50% + ${pos.x}px + ${offsetX})`,
                top: `calc(50% + ${pos.y}px + ${offsetY})`,
                transform: 'translate(-50%, -50%)',
                ...getSectionStyle(section),
                fontSize: '1.11vh',           /* 12px @ 1080 */
                fontFamily: THEME.FONT_PRIMARY,
                letterSpacing: '0.28vh',      /* 3px @ 1080 */
                fontWeight: isActive ? '600' : '400',
                whiteSpace: 'nowrap',
                padding: '0.74vh 1.11vh',     /* 8px 12px @ 1080 */
                borderRadius: '0.37vh',       /* 4px @ 1080 */
                background: isHovered ? 'rgba(212, 115, 12, 0.1)' : 'transparent'
              }}
            >
              {section.label}
            </div>
          )
        })}

        {/* Center hub with logo */}
        <div
          onClick={handleCenterClick}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isExpanded ? 'var(--navwheel-center-lg)' : 'var(--navwheel-center-sm)',
            height: isExpanded ? 'var(--navwheel-center-lg)' : 'var(--navwheel-center-sm)',
            borderRadius: '50%',
            background: THEME.BG_DARK,
            border: `0.19vh solid ${isExpanded ? THEME.AMBER : THEME.AMBER_DARK}`,  /* 2px @ 1080 */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.4s ease',
            zIndex: 10,
            boxShadow: isExpanded ? `0 0 1.85vh rgba(212, 115, 12, 0.3)` : 'none'  /* 20px @ 1080 */
          }}
        >
          <img
            src={logo}
            alt="Prometheus"
            style={{
              width: isExpanded ? '4.63vh' : '3.52vh',   /* 50px/38px @ 1080 */
              height: isExpanded ? '4.63vh' : '3.52vh',  /* 50px/38px @ 1080 */
              objectFit: 'contain',
              filter: isExpanded ? 'drop-shadow(0 0 0.93vh rgba(212, 115, 12, 0.5))' : 'none',  /* 10px @ 1080 */
              transition: 'all 0.4s ease'
            }}
          />
        </div>

        {/* Center label (GENERATE) - only when expanded and hovered */}
        {isExpanded && centerSection && (
          <div
            onClick={() => handleSectionClick(centerSection.id)}
            onMouseEnter={() => setHoveredSection(centerSection.id)}
            onMouseLeave={() => setHoveredSection(null)}
            style={{
              position: 'absolute',
              top: `calc(50% + var(--navwheel-center-lg) / 2 + 1.39vh)`,  /* centerSize/2 + 15px @ 1080 */
              left: '50%',
              transform: 'translateX(-50%)',
              ...getSectionStyle(centerSection),
              fontSize: '0.93vh',           /* 10px @ 1080 */
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.19vh',      /* 2px @ 1080 */
              whiteSpace: 'nowrap',
              opacity: hoveredSection === centerSection.id ? 1 : 0.7
            }}
          >
            {centerSection.label}
          </div>
        )}

        {/* Current section indicator (when expanded) - moved DOWN 100px, enlarged 30% */}
        {isExpanded && (
          <div
            style={{
              position: 'absolute',
              bottom: '-13.43vh',           /* -145px @ 1080 */
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
              {hoveredSection
                ? NAV_SECTIONS.find(s => s.id === hoveredSection)?.label
                : NAV_SECTIONS.find(s => s.id === currentSection)?.label
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
              {hoveredSection ? 'CLICK TO SELECT' : 'CURRENT SECTION'}
            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default NavWheel
