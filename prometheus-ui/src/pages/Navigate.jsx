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
import CourseSelector from '../components/CourseSelector'

function Navigate({ onNavigate, courseData = {}, setCourseData, user, courseState, setCourseState }) {
  const [isPKEActive, setIsPKEActive] = useState(false)
  const [loadedCourseData, setLoadedCourseData] = useState(null)

  // Mock saved courses - in production this would come from backend/state
  const savedCourses = [
    {
      id: 'course-1',
      name: 'INT-001: Introduction to Intelligence Analysis',
      title: 'Introduction to Intelligence Analysis',
      duration: 8,
      durationUnit: 'Hours',
      level: 'Foundational',
      thematic: 'Intelligence',
      owner: 'J. Smith',
      startDate: '10/12/25',
      status: 'IN PROGRESS',
      progress: 45,
      approved: 'N'
    },
    {
      id: 'course-2',
      name: 'DEF-002: Defence Operations Overview',
      title: 'Defence Operations Overview',
      duration: 3,
      durationUnit: 'Days',
      level: 'Intermediate',
      thematic: 'Defence & Security',
      owner: 'M. Jones',
      startDate: '05/12/25',
      status: 'IN PROGRESS',
      progress: 72,
      approved: 'N'
    },
    {
      id: 'course-3',
      name: 'POL-003: Policing Fundamentals',
      title: 'Policing Fundamentals',
      duration: 2,
      durationUnit: 'Weeks',
      level: 'Awareness',
      thematic: 'Policing',
      owner: 'S. Wilson',
      startDate: '01/12/25',
      status: 'COMMENCED',
      progress: 15,
      approved: 'N'
    },
    {
      id: 'course-4',
      name: 'LED-004: Executive Leadership',
      title: 'Executive Leadership',
      duration: 5,
      durationUnit: 'Days',
      level: 'Advanced',
      thematic: 'Leadership & Management',
      owner: 'R. Brown',
      startDate: '28/11/25',
      status: 'IN PROGRESS',
      progress: 88,
      approved: 'Y'
    },
    {
      id: 'course-5',
      name: 'CRI-005: Crisis Response Planning',
      title: 'Crisis Response Planning',
      duration: 4,
      durationUnit: 'Hours',
      level: 'Intermediate',
      thematic: 'Crisis Response',
      owner: 'K. Davis',
      startDate: '15/11/25',
      status: 'IN PROGRESS',
      progress: 60,
      approved: 'N'
    },
    {
      id: 'course-6',
      name: 'RES-006: Organizational Resilience',
      title: 'Organizational Resilience',
      duration: 1,
      durationUnit: 'Weeks',
      level: 'Expert',
      thematic: 'Resilience',
      owner: 'A. Taylor',
      startDate: '20/11/25',
      status: 'COMMENCED',
      progress: 25,
      approved: 'N'
    }
  ]

  // Handle course load from CourseSelector
  const handleCourseLoad = useCallback((course) => {
    setLoadedCourseData(course)

    // Update parent state if callbacks provided
    if (setCourseData) {
      setCourseData(prev => ({
        ...prev,
        title: course.title,
        duration: course.duration,
        durationUnit: course.durationUnit,
        level: course.level,
        thematic: course.thematic
      }))
    }

    if (setCourseState) {
      setCourseState({
        startDate: course.startDate,
        saveCount: course.status === 'COMMENCED' ? 1 : 2
      })
    }
  }, [setCourseData, setCourseState])

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
      <Header pageTitle="NAVIGATION HUB" courseData={courseData} isNavigationHub={true} />

      {/* Spacer to maintain layout */}
      <div style={{ flex: 1 }} />

      {/* NavWheel - Centre at X:0, Y:+50 (slightly above screen center) */}
      <div
        style={{
          position: 'absolute',
          top: '42vh', // Adjusted up slightly to make room for Select Course
          left: '50%',
          transform: 'translate(-50%, -50%)',
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

      {/* Course Selector - Below NavWheel, centered at Y:-300 */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(76vh + 40px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150
        }}
      >
        <CourseSelector
          courses={savedCourses}
          onCourseLoad={handleCourseLoad}
          size={135}
        />
      </div>

      {/* Shared Footer Component - PKE hidden on Navigation Hub */}
      <Footer
        currentSection="navigate"
        onNavigate={handleWheelNavigate}
        isPKEActive={isPKEActive}
        onPKEToggle={setIsPKEActive}
        onSave={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
        user={loadedCourseData ? { name: loadedCourseData.owner } : (user || { name: '---' })}
        courseState={loadedCourseData ? { startDate: loadedCourseData.startDate, saveCount: loadedCourseData.status === 'COMMENCED' ? 1 : 2 } : (courseState || { startDate: null, saveCount: 0 })}
        progress={loadedCourseData?.progress || 0}
        hidePKE={true}
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

        {/* Direction arrows - CLICKABLE with glow on hover */}
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
              style={{
                cursor: 'pointer',
                filter: isHovered ? 'drop-shadow(0 0 8px rgba(212, 115, 12, 0.8))' : 'none',
                transition: 'filter 0.3s ease'
              }}
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

      {/* Section labels - PASSIVE (colour change only, no glow, no bold, no click) */}
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
              fontWeight: '400',  // No bold on hover
              color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              padding: '12px 20px',
              borderRadius: '4px',
              background: 'transparent',  // No orange glow on hover
              transition: 'color 0.3s ease',
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
