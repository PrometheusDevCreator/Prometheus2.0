/**
 * Header.jsx - Shared Header Component
 *
 * EXACT SPECIFICATION (URGENT_HEADER_FIX.md):
 * - Logo: 60px at (20px, 10px) - NO text beside it
 * - Main Title: 24px, centered horizontally, Y-center aligned with logo (~Y=40)
 * - Info Cluster: Right-aligned at (right:20px, top:15px), grey labels, values "---" when empty
 * - Horizontal Line: Y=85, full width gradient
 * - Page Title: Centered, Y=92 (7px below line), 18px font
 * - Lesson Editor: Below page title with < > navigation arrows
 *
 * EXIT FUNCTION:
 * - Logo is clickable to initiate exit workflow
 * - First click: triggers exitPending (SAVE button pulses)
 * - Second click: exits to login page
 *
 * This component is used by ALL pages for consistent header layout.
 */

import { useState, useCallback } from 'react'
import logo from '../assets/burntorangelogo.png'
import { THEME } from '../constants/theme'

// Navigation order for < > arrows
const NAV_ORDER = ['navigate', 'define', 'design', 'build', 'format', 'generate']

function Header({
  pageTitle,
  sectionName,
  courseData = {},
  isNavigationHub = false,
  onExitClick,
  exitPending = false,
  // Lesson Editor props
  lessonEditorOpen = false,
  onLessonEditorToggle,
  selectedLessonId = null,  // Currently selected lesson ID for Lesson Editor
  // Navigation props
  currentSection,
  onNavigate
}) {
  // Navigation arrow handlers
  const [prevHovered, setPrevHovered] = useState(false)
  const [nextHovered, setNextHovered] = useState(false)

  const handlePrevPage = useCallback(() => {
    const currentIndex = NAV_ORDER.indexOf(currentSection)
    if (currentIndex > 0) {
      onNavigate?.(NAV_ORDER[currentIndex - 1])
    }
  }, [currentSection, onNavigate])

  const handleNextPage = useCallback(() => {
    const currentIndex = NAV_ORDER.indexOf(currentSection)
    if (currentIndex < NAV_ORDER.length - 1) {
      onNavigate?.(NAV_ORDER[currentIndex + 1])
    }
  }, [currentSection, onNavigate])

  // Default values that should display as '---' until user changes them
  const defaultValues = ['Foundational', 'Junior', 0, 1, '', 'Hours']

  // Determine if values should show (only when explicitly populated, not default)
  const hasValue = (val) => val && val !== '' && val !== '---' && !defaultValues.includes(val)

  // Get duration display from new wheel fields (weeks > days > hours priority)
  const getDurationDisplay = () => {
    if (courseData.weeks && courseData.weeks > 0) {
      return `${courseData.weeks} Weeks`
    }
    if (courseData.days && courseData.days > 0) {
      return `${courseData.days} Days`
    }
    if (courseData.hours && courseData.hours > 0) {
      return `${courseData.hours} Hours`
    }
    // Fallback to legacy duration field
    if (courseData.duration && courseData.duration > 0) {
      return `${courseData.duration} ${courseData.durationUnit || 'Hours'}`.trim()
    }
    return '---'
  }

  return (
    <header
      style={{
        position: 'relative',
        width: '100%',
        height: 'var(--frame-header-h)',  /* 120px @ 1080 */
        background: 'transparent',
        flexShrink: 0,
        overflow: 'visible',
        zIndex: 10
      }}
    >
      {/* Logo - clickable for EXIT workflow */}
      {/* First click: triggers exitPending, Second click: exits to login */}
      <div
        onClick={onExitClick}
        style={{
          position: 'absolute',
          left: '2.6vw',       /* 50px @ 1920 */
          top: '0.93vh',      /* 10px @ 1080 */
          width: '6.11vh',    /* 66px @ 1080 */
          height: '6.11vh',   /* 66px @ 1080 */
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          filter: exitPending ? 'drop-shadow(0 0 12px rgba(0, 255, 0, 0.6))' : 'none',
          animation: exitPending ? 'exitLogoPulse 1.5s ease-in-out infinite' : 'none'
        }}
      >
        <img
          src={logo}
          alt="Prometheus"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Exit pending animation */}
      {exitPending && (
        <style>
          {`
            @keyframes exitLogoPulse {
              0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 255, 0, 0.4)); }
              50% { filter: drop-shadow(0 0 16px rgba(0, 255, 0, 0.8)); }
            }
          `}
        </style>
      )}

      {/* Main Title - centered horizontally, nudged up 10px */}
      <h1
        style={{
          position: 'absolute',
          left: '50%',
          top: '2.78vh',        /* 30px @ 1080 */
          transform: 'translate(-50%, -50%)',
          fontFamily: THEME.FONT_PRIMARY,
          fontSize: '2.22vh',   /* 24px @ 1080 */
          fontWeight: 500,
          color: '#f0f0f0',
          letterSpacing: '0.15em',
          whiteSpace: 'nowrap',
          margin: 0
        }}
      >
        PROMETHEUS COURSE GENERATION SYSTEM 2.0
      </h1>

      {/* Section Name - Only for Navigation Hub (other pages show title in nav row) */}
      {isNavigationHub && (
        <h2
          style={{
            position: 'absolute',
            left: '50%',
            top: '5.56vh',        /* 60px @ 1080 */
            transform: 'translateX(-50%)',
            fontFamily: THEME.FONT_PRIMARY,
            fontSize: '1.67vh',   /* 18px @ 1080 */
            fontWeight: 500,
            color: THEME.AMBER,
            letterSpacing: '0.42vh',  /* 4.5px @ 1080 */
            margin: 0
          }}
        >
          {pageTitle}
        </h2>
      )}

      {/* Info Cluster - far right */}
      <div
        style={{
          position: 'absolute',
          right: '1.04vw',      /* 20px @ 1920 */
          top: '1.39vh',        /* 15px @ 1080 */
          textAlign: 'right',
          fontFamily: THEME.FONT_MONO,
          fontSize: '1.11vh'    /* 12px @ 1080 */
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.74vh', lineHeight: 1.4 }}>
          <span style={{ color: '#888' }}>Course:</span>
          <span style={{ color: '#00ff00', minWidth: '4.17vw' }}>
            {hasValue(courseData.title) ? courseData.title : '---'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.74vh', lineHeight: 1.4 }}>
          <span style={{ color: '#888' }}>Duration:</span>
          <span style={{ color: '#00ff00', minWidth: '4.17vw' }}>
            {getDurationDisplay()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.74vh', lineHeight: 1.4 }}>
          <span style={{ color: '#888' }}>Level:</span>
          <span style={{ color: '#00ff00', minWidth: '4.17vw' }}>
            {hasValue(courseData.level) ? courseData.level : '---'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.74vh', lineHeight: 1.4 }}>
          <span style={{ color: '#888' }}>Thematic:</span>
          <span style={{ color: '#00ff00', minWidth: '4.17vw' }}>
            {hasValue(courseData.thematic) ? courseData.thematic : '---'}
          </span>
        </div>
      </div>

      {/* Page Navigation Row - ABOVE horizontal line, format: Back < TITLE > Next */}
      {/* Navigation Hub title is shown above the line separately, so hide nav here */}
      {!isNavigationHub && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(5.56vh - 12px)',  /* Moved up 12px total from original 60px @ 1080 */
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1vw',
            zIndex: 20
          }}
        >
          {/* Back label */}
          <span
            style={{
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.4vh',
              color: prevHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={handlePrevPage}
            onMouseEnter={() => setPrevHovered(true)}
            onMouseLeave={() => setPrevHovered(false)}
          >
            Back
          </span>

          {/* < arrow - grey default, burnt orange on hover */}
          <button
            onClick={handlePrevPage}
            onMouseEnter={() => setPrevHovered(true)}
            onMouseLeave={() => setPrevHovered(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: prevHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              fontSize: '2.5vh',   /* 25% larger than 2vh */
              cursor: 'pointer',
              padding: '0.2vh 0.3vw',
              transition: 'color 0.2s ease'
            }}
          >
            &lt;
          </button>

          {/* Page Title - centered between arrows, burnt orange */}
          <h2
            style={{
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '2vh',   /* 20% larger than 1.67vh (was 18px @ 1080) */
              fontWeight: 500,
              color: THEME.AMBER,   /* Burnt orange - matching original page title color */
              letterSpacing: '0.42vh',  /* 4.5px @ 1080 - matching original */
              margin: '0 1vw',
              whiteSpace: 'nowrap'
            }}
          >
            {pageTitle}
          </h2>

          {/* > arrow - grey default, burnt orange on hover */}
          <button
            onClick={handleNextPage}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: nextHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              fontSize: '2.5vh',   /* 25% larger than 2vh */
              cursor: 'pointer',
              padding: '0.2vh 0.3vw',
              transition: 'color 0.2s ease'
            }}
          >
            &gt;
          </button>

          {/* Next label */}
          <span
            style={{
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.4vh',
              color: nextHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={handleNextPage}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
          >
            Next
          </span>
        </div>
      )}

      {/* Horizontal Line at Y=85 */}
      <div
        style={{
          position: 'absolute',
          top: '7.87vh',       /* 85px @ 1080 */
          left: 0,
          right: 0,
          height: '0.09vh',   /* 1px @ 1080 */
          background: 'linear-gradient(to right, transparent 0%, #444 10%, #444 90%, transparent 100%)'
        }}
      />
    </header>
  )
}

export default Header
