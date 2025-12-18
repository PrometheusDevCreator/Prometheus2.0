/**
 * Header.jsx - Shared Header Component
 *
 * EXACT SPECIFICATION (URGENT_HEADER_FIX.md):
 * - Logo: 60px at (20px, 10px) - NO text beside it
 * - Main Title: 24px, centered horizontally, Y-center aligned with logo (~Y=40)
 * - Info Cluster: Right-aligned at (right:20px, top:15px), grey labels, values "---" when empty
 * - Horizontal Line: Y=85, full width gradient
 * - Page Title: Centered, Y=92 (7px below line), 18px font
 *
 * This component is used by ALL pages for consistent header layout.
 */

import logo from '../assets/burntorangelogo.png'
import { THEME } from '../constants/theme'

function Header({ pageTitle, sectionName, courseData = {}, isNavigationHub = false }) {
  // Default values that should display as '---' until user changes them
  const defaultValues = ['Foundational', 'Junior', 0, 1, '', 'Hours']

  // Determine if values should show (only when explicitly populated, not default)
  const hasValue = (val) => val && val !== '' && val !== '---' && !defaultValues.includes(val)

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
      {/* Logo - moved right 20px, enlarged 10% (60px → 66px) */}
      <div
        style={{
          position: 'absolute',
          left: '2.6vw',       /* 50px @ 1920 */
          top: '0.93vh',      /* 10px @ 1080 */
          width: '6.11vh',    /* 66px @ 1080 */
          height: '6.11vh'    /* 66px @ 1080 */
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

      {/* Section Name (Nav Wheel keyword) - centered, below title, above line */}
      {/* For Navigation Hub, the page title displays here instead */}
      {(sectionName || isNavigationHub) && (
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
          {isNavigationHub ? pageTitle : sectionName}
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
            {hasValue(courseData.duration) ? `${courseData.duration} ${courseData.durationUnit || ''}`.trim() : '---'}
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

      {/* Page Title - centered, Y=102 (moved down 10px), font 21px (15% larger) */}
      {/* Navigation Hub title is shown above the line, so hide it here */}
      {!isNavigationHub && (
        <h2
          style={{
            position: 'absolute',
            top: '9.44vh',        /* 102px @ 1080 */
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: THEME.FONT_PRIMARY,
            fontSize: '1.94vh',   /* 21px @ 1080 */
            fontWeight: 500,
            color: '#f0f0f0',
            letterSpacing: '0.1em',
            margin: 0
          }}
        >
          {pageTitle}
        </h2>
      )}
    </header>
  )
}

export default Header
