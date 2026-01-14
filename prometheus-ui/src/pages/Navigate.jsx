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

function Navigate({ onNavigate, courseData = {}, setCourseData, user, courseState, setCourseState, onSystemClear, exitPending, onExitClick }) {
  const [isPKEActive, setIsPKEActive] = useState(false)
  const [loadedCourseData, setLoadedCourseData] = useState(null)

  // Mock saved courses - in production this would come from backend/state
  const savedCourses = [
    {
      id: 'test-course',
      name: 'TEST-000: Test Course for Development',
      title: 'Test Course for Development',
      description: 'A comprehensive test course with 4 Learning Objectives for testing Scalar, Timetable, and Performance Criteria features.',
      duration: 5,
      durationUnit: 'Days',
      level: 'Intermediate',
      thematic: 'Development & Testing',
      owner: 'Developer',
      startDate: '24/12/25',
      status: 'IN PROGRESS',
      progress: 0,
      approved: 'N',
      learningObjectives: [
        'IDENTIFY the key components of the Prometheus courseware system',
        'EXPLAIN how Learning Objectives relate to Topics and Subtopics',
        'DEMONSTRATE the use of Performance Criteria for course alignment',
        'ANALYZE lesson scheduling and timetable management workflows'
      ]
    },
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
        description: course.description,
        duration: course.duration,
        durationUnit: course.durationUnit,
        level: course.level,
        thematic: course.thematic,
        learningObjectives: course.learningObjectives || []
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
      <Header
        pageTitle="NAVIGATION HUB"
        courseData={courseData}
        isNavigationHub={true}
        onExitClick={onExitClick}
        exitPending={exitPending}
      />

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
      {/* CLEAR on Navigation Hub clears ALL system data */}
      <Footer
        currentSection="navigate"
        onNavigate={handleWheelNavigate}
        isPKEActive={isPKEActive}
        onPKEToggle={setIsPKEActive}
        onSave={() => {}}
        onClear={() => {
          // System-wide clear: reset all course data and local state
          onSystemClear?.()
          setLoadedCourseData(null)
        }}
        onDelete={() => {}}
        user={loadedCourseData ? { name: loadedCourseData.owner } : (user || { name: '---' })}
        courseState={loadedCourseData ? { startDate: loadedCourseData.startDate, saveCount: loadedCourseData.status === 'COMMENCED' ? 1 : 2 } : (courseState || { startDate: null, saveCount: 0 })}
        progress={loadedCourseData?.progress || 0}
        hidePKE={true}
        exitPending={exitPending}
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
  const [isInOuterRing, setIsInOuterRing] = React.useState(false)
  const [isPulsing, setIsPulsing] = React.useState(false)
  const [tooltipVisible, setTooltipVisible] = React.useState(null)
  const tooltipTimeoutRef = React.useRef(null)
  const wheelRef = React.useRef(null)

  const sections = [
    { id: 'define', label: 'DEFINE', angle: 0 },      // North
    { id: 'design', label: 'DESIGN', angle: 90 },     // East
    { id: 'build', label: 'BUILD', angle: 180 },      // South
    { id: 'format', label: 'FORMAT', angle: 270 },    // West
  ]
  const centerSection = { id: 'generate', label: 'GENERATE' }

  // Tooltip text content for each section
  const tooltipContent = {
    define: 'Start Here. Define and capture Course Title, Learning Objectives, and other Meta Data.',
    design: 'Timetable and Scalar: Import or create the course structure.',
    build: 'Develop course content: Import, create and manage course information.',
    format: 'Import and save Courseware templates, extract data, convert file types.',
    generate: 'Select and Export your required courseware.'
  }

  // Handle tooltip visibility with fade timing
  React.useEffect(() => {
    if (hoveredSection) {
      // Clear any pending hide timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      // Show tooltip after brief delay for smooth transition
      tooltipTimeoutRef.current = setTimeout(() => {
        setTooltipVisible(hoveredSection)
      }, 150)
    } else {
      // Hide tooltip with delay for fade out
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        setTooltipVisible(null)
      }, 100)
    }
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [hoveredSection])

  // +50% size: 350 → 525
  const size = 525
  // Inner dashed circle radius - increased by 40%: 210 → 294
  const innerCircleRadius = 294
  // Green arc radius (just outside outer ring)
  const greenArcRadius = size / 2 + 8
  // Arc extent: 22.5 degrees each side = 45 degrees total
  const arcExtent = 22.5

  // Track mouse position to detect if cursor is in outer ring area
  const handleMouseMove = React.useCallback((e) => {
    if (!wheelRef.current) return
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Check if cursor is within outer ring area (between inner circle and outer edge + buffer)
    const innerBound = innerCircleRadius - 20
    const outerBound = size / 2 + 30
    setIsInOuterRing(distance >= innerBound && distance <= outerBound)
  }, [size, innerCircleRadius])

  // Handle arrow click with pulse animation
  const handleArrowClick = React.useCallback((sectionId) => {
    setIsPulsing(true)
    setTimeout(() => {
      setIsPulsing(false)
      onNavigate?.(sectionId)
    }, 300) // Pulse duration before navigation
  }, [onNavigate])

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

  // Get the angle for the hovered section
  const getHoveredAngle = () => {
    const section = sections.find(s => s.id === hoveredSection)
    return section ? section.angle : null
  }

  const hoveredAngle = getHoveredAngle()

  return (
    <div
      ref={wheelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsInOuterRing(false)}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`
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
            <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
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
              filter: isInOuterRing ? 'url(#greenGlow)' : 'none',
              opacity: isPulsing ? 1 : 0.8,
              transition: 'opacity 0.15s ease',
              animation: isPulsing ? 'greenPulse 0.3s ease-out' : 'none'
            }}
          />
        </svg>
      )}

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
              onClick={() => handleArrowClick(section.id)}
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

        {/* Decorative diagonal icons (NE, SE, SW, NW) - visual continuity with FORMAT Hub */}
        {[
          { angle: 45, type: 'presentation' },   // NE
          { angle: 135, type: 'timetable' },     // SE
          { angle: 225, type: 'lesson_plan' },   // SW
          { angle: 315, type: 'handbook' }       // NW
        ].map((item) => {
          const iconRadius = size / 2 - 35
          const radians = (item.angle - 90) * (Math.PI / 180)
          const x = size / 2 + Math.cos(radians) * iconRadius
          const y = size / 2 + Math.sin(radians) * iconRadius
          const iconSize = 12
          const iconColor = THEME.TEXT_DIM

          let iconPath
          switch (item.type) {
            case 'presentation':
              iconPath = (
                <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                  <rect x="0" y="2" width="24" height="15" rx="1.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <line x1="7" y1="21" x2="17" y2="21" stroke={iconColor} strokeWidth="1.8"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke={iconColor} strokeWidth="1.8"/>
                </g>
              )
              break
            case 'timetable':
              iconPath = (
                <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                  <rect x="1" y="1" width="22" height="22" rx="1.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <line x1="1" y1="8" x2="23" y2="8" stroke={iconColor} strokeWidth="1.5"/>
                  <line x1="8" y1="1" x2="8" y2="23" stroke={iconColor} strokeWidth="1.5"/>
                  <line x1="16" y1="1" x2="16" y2="23" stroke={iconColor} strokeWidth="1.5"/>
                </g>
              )
              break
            case 'lesson_plan':
              iconPath = (
                <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                  <path d="M15 0H4.5a3 3 0 00-3 3v18a3 3 0 003 3h15a3 3 0 003-3V7.5z" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <path d="M15 0v7.5h7.5" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <line x1="6" y1="13.5" x2="18" y2="13.5" stroke={iconColor} strokeWidth="1.5"/>
                  <line x1="6" y1="18" x2="15" y2="18" stroke={iconColor} strokeWidth="1.5"/>
                </g>
              )
              break
            case 'handbook':
              iconPath = (
                <g transform={`translate(${x - iconSize}, ${y - iconSize})`}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" fill="none" stroke={iconColor} strokeWidth="1.8"/>
                  <line x1="8" y1="6" x2="16" y2="6" stroke={iconColor} strokeWidth="1.5"/>
                  <line x1="8" y1="10" x2="14" y2="10" stroke={iconColor} strokeWidth="1.5"/>
                </g>
              )
              break
            default:
              iconPath = null
          }

          return (
            <g key={`decorative-${item.type}`} style={{ pointerEvents: 'none' }}>
              {iconPath}
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

      {/* Tooltip Info Box - appears on hover */}
      {/* DEFINE, DESIGN, BUILD, FORMAT: 50px below DEFINE label, centered */}
      {/* GENERATE: 50px above BUILD label, centered */}
      {tooltipVisible && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            // GENERATE tooltip: moved UP 2px
            // Other tooltips: moved UP another 5px
            ...(tooltipVisible === 'generate'
              ? { top: 'calc(50% + 78px)' }  // Previous 80px - 2px = 78px
              : { top: 'calc(50% - 170px)' }  // Previous -165px - 5px = -170px
            ),
            width: '200px',
            height: '100px',
            background: THEME.BG_DARK,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            zIndex: 100,
            pointerEvents: 'none',
            opacity: tooltipVisible ? 1 : 0,
            transition: 'opacity 1s ease-in-out',  // 1 second fade
            boxShadow: `0 0 15px rgba(212, 115, 12, 0.3)`
          }}
        >
          <span
            style={{
              color: THEME.GREEN_BRIGHT,
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '12px',
              lineHeight: 1.5,
              textAlign: 'left'
            }}
          >
            {tooltipContent[tooltipVisible]}
          </span>
        </div>
      )}

      {/* CSS Keyframes for fade animation */}
      <style>
        {`
          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          @keyframes tooltipFadeOut {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(5px); }
          }
        `}
      </style>
    </div>
  )
}

export default Navigate
