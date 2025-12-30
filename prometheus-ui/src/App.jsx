/**
 * App.jsx - Main Application Component
 *
 * Prometheus 2.0 - Mockup 2.1 Implementation
 *
 * Navigation Flow:
 * 1. Login → Navigate (after authentication)
 * 2. Navigate → Any section via NavWheel
 * 3. Any section → Navigate via mini NavWheel
 *
 * Pages:
 * - Login: Authentication screen
 * - Navigate: Full NavWheel for section selection
 * - Define: Course information (Slide 3)
 * - Design: OutlinePlanner or Scalar (Slides 4-6)
 * - Build: Placeholder
 * - Format: Placeholder
 * - Generate: Placeholder
 *
 * SCALING:
 * - Base design: 1920×1080 (fixed inner stage)
 * - Viewport scaling via single transform on stage container
 * - Scale = Math.min(viewportW/1920, viewportH/1080)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { THEME } from './constants/theme'

// ============================================
// SCALE-TO-FIT CONSTANTS
// ============================================
const BASE_W = 1920
const BASE_H = 1080

// Pages
import Login from './pages/Login'
import Navigate from './pages/Navigate'
import Define from './pages/Define'
import Design from './pages/Design'  // New unified DESIGN page (Phase 1)
// Legacy pages retained for reference during migration:
// import OutlinePlanner from './pages/OutlinePlanner'
// import Scalar from './pages/Scalar'
import Build from './pages/Build'
import Format from './pages/Format'
import Generate from './pages/Generate'

// Components
import Header from './components/Header'
import DebugGridController from './components/DevTools'

// REFACTOR Phase 1: useScaleToFit hook removed
// Original hook calculated scale = Math.min(vw/1920, vh/1080)
// See docs/refactor-baseline/useScaleToFit_original.txt for backup

function App() {
  // REFACTOR Phase 1: Scale fixed at 1 (transform scaling removed)
  const scale = 1

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Navigation state
  const [currentPage, setCurrentPage] = useState('navigate')
  // Note: designSubpage removed - now handled internally by Design.jsx

  // Debug grid state (Ctrl+G toggle)
  const [showDebugGrid, setShowDebugGrid] = useState(false)

  // Course data state
  const [courseData, setCourseData] = useState({
    title: '',
    thematic: '',
    module: 1,
    moduleTitles: [],  // Array of module titles
    code: '',
    duration: 1,
    durationUnit: 'Hours',
    level: 'Foundational',
    seniority: 'Junior',
    description: '',
    deliveryModes: [],
    qualification: false,
    accredited: false,
    certified: false,
    learningObjectives: ['']
  })
  const [courseLoaded, setCourseLoaded] = useState(false)

  // Timetable data state (persists across page navigation)
  // This is lifted from DesignContext to ensure data persists when navigating away from Design page
  const [timetableData, setTimetableData] = useState({
    lessons: [
      {
        id: 'lesson-1',
        title: 'INTRODUCTION',
        type: 'instructor-led',
        duration: 60,
        startTime: '0900',
        day: 1,
        week: 1,
        module: 1,
        topics: [],
        learningObjectives: [],
        scheduled: true,
        saved: false
      }
    ],
    overviewBlocks: []
  })

  // Course state for Footer (save tracking)
  const [courseState, setCourseState] = useState({
    startDate: null,
    saveCount: 0
  })

  // Exit workflow state
  // First click on logo: exitPending = true (SAVE button pulses green)
  // Second click: returns to login page, resets all state
  const [exitPending, setExitPending] = useState(false)

  // Wheel rotation state for visual continuity between hub pages
  // Model 1: Nav Hub = 0°, Format Hub = 12°
  const [wheelRotation, setWheelRotation] = useState(0)
  const HUB_ROTATIONS = {
    navigate: 0,
    format: 12
  }

  // Handle save count increment (updates status in Footer)
  const handleSaveCountIncrement = useCallback(() => {
    setCourseState(prev => {
      const newState = { ...prev, saveCount: prev.saveCount + 1 }
      // Set start date on first save
      if (prev.saveCount === 0) {
        const now = new Date()
        const d = now.getDate().toString().padStart(2, '0')
        const m = (now.getMonth() + 1).toString().padStart(2, '0')
        const y = now.getFullYear().toString().slice(-2)
        newState.startDate = `${d}/${m}/${y}`
      }
      return newState
    })
  }, [])

  // System-wide clear (Navigation Hub CLEAR button resets ALL data)
  const handleSystemClear = useCallback(() => {
    setCourseData({
      title: '',
      thematic: '',
      module: 1,
      moduleTitles: [],  // Reset module titles
      code: '',
      duration: 1,
      durationUnit: 'Hours',
      level: 'Foundational',
      seniority: 'Junior',
      description: '',
      deliveryModes: [],
      qualification: false,
      accredited: false,
      certified: false,
      learningObjectives: ['']
    })
    setCourseState({
      startDate: null,
      saveCount: 0
    })
    setTimetableData({
      lessons: [
        {
          id: 'lesson-1',
          title: 'INTRODUCTION',
          type: 'instructor-led',
          duration: 60,
          startTime: '0900',
          day: 1,
          week: 1,
          module: 1,
          topics: [],
          learningObjectives: [],
          scheduled: true,
          saved: false
        }
      ],
      overviewBlocks: []
    })
    setCourseLoaded(false)
  }, [])

  // Handle exit click on Prometheus logo
  const handleExitClick = useCallback(() => {
    if (exitPending) {
      // Second click - exit to login, reset everything
      setExitPending(false)
      setIsAuthenticated(false)
      setCurrentUser(null)
      setCurrentPage('navigate')
      handleSystemClear()
    } else {
      // First click - enter exit pending mode
      setExitPending(true)
    }
  }, [exitPending, handleSystemClear])

  // Handle login
  const handleLogin = useCallback((userData) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
    setCurrentPage('navigate')
  }, [])

  // Handle navigation from NavWheel or other sources
  const handleNavigate = useCallback((section) => {
    // Update wheel rotation for hub pages (visual continuity cue)
    if (section === 'navigate' || section === 'format') {
      setWheelRotation(HUB_ROTATIONS[section] || 0)
    }

    // Map section IDs to pages
    switch (section) {
      case 'define':
        setCurrentPage('define')
        break
      case 'design':
        setCurrentPage('design')
        break
      case 'build':
        setCurrentPage('build')
        break
      case 'format':
        setCurrentPage('format')
        break
      case 'generate':
        setCurrentPage('generate')
        break
      case 'navigate':
        setCurrentPage('navigate')
        break
      default:
        setCurrentPage('navigate')
    }
  }, [HUB_ROTATIONS])

  // Note: handleDesignSubnav removed - now handled internally by Design.jsx

  // Navigation via Escape (when grid has no pins)
  // Grid toggle is now handled by DebugGridController (G key)
  const handleEscapeNavigation = useCallback(() => {
    if (isAuthenticated && currentPage !== 'navigate') {
      setCurrentPage('navigate')
    }
  }, [isAuthenticated, currentPage])

  // Keyboard shortcuts (non-grid)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Space: Toggle to Navigate page
      if (e.ctrlKey && e.code === 'Space' && isAuthenticated) {
        e.preventDefault()
        setCurrentPage('navigate')
      }
      // Note: Escape is now handled contextually by DebugGridController
      // It calls handleEscapeNavigation when grid has no pins
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAuthenticated])

  // Render Login page (before authentication)
  if (!isAuthenticated) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: THEME.BG_BASE
        }}
      >
        {/* Stage Container - REFACTOR Phase 1: viewport units */}
        <div
          style={{
            width: '100vw',
            height: '100vh',
            flexShrink: 0,
            background: THEME.BG_BASE,
            position: 'relative',
            // Only apply transform when scale !== 1 to avoid breaking position:fixed descendants
            ...(scale !== 1 && {
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            })
          }}
        >
          <Login onLogin={handleLogin} />
        </div>
        <DebugGridController isVisible={showDebugGrid} onEscapeWhenNoPins={handleEscapeNavigation} />
      </div>
    )
  }

  // Render Navigate page (full NavWheel)
  if (currentPage === 'navigate') {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: THEME.BG_BASE
        }}
      >
        {/* Stage Container - REFACTOR Phase 1: viewport units */}
        <div
          style={{
            width: '100vw',
            height: '100vh',
            flexShrink: 0,
            background: THEME.BG_BASE,
            position: 'relative',
            // Only apply transform when scale !== 1 to avoid breaking position:fixed descendants
            ...(scale !== 1 && {
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            })
          }}
        >
          <Navigate
            onNavigate={handleNavigate}
            courseData={courseData}
            setCourseData={setCourseData}
            user={currentUser ? { name: currentUser.name || currentUser.username || 'User' } : { name: '---' }}
            courseState={courseState}
            setCourseState={setCourseState}
            onSystemClear={handleSystemClear}
            exitPending={exitPending}
            onExitClick={handleExitClick}
            wheelRotation={wheelRotation}
          />
        </div>
        <DebugGridController isVisible={showDebugGrid} onEscapeWhenNoPins={handleEscapeNavigation} />
      </div>
    )
  }

  // User data for Footer
  const userData = currentUser ? { name: currentUser.name || currentUser.username || 'User' } : { name: '---' }

  // Render main application pages with header
  const renderPage = () => {
    switch (currentPage) {
      case 'define':
        return (
          <Define
            onNavigate={handleNavigate}
            courseData={courseData}
            setCourseData={setCourseData}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
            onSaveCountIncrement={handleSaveCountIncrement}
            exitPending={exitPending}
          />
        )
      case 'design':
        // New unified Design page with internal tab switching
        return (
          <Design
            onNavigate={handleNavigate}
            courseData={courseData}
            setCourseData={setCourseData}
            timetableData={timetableData}
            setTimetableData={setTimetableData}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
            exitPending={exitPending}
          />
        )
      case 'build':
        return (
          <Build
            onNavigate={handleNavigate}
            courseData={courseData}
            setCourseData={setCourseData}
            timetableData={timetableData}
            setTimetableData={setTimetableData}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
            exitPending={exitPending}
          />
        )
      case 'format':
        return (
          <Format
            onNavigate={handleNavigate}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
            exitPending={exitPending}
            wheelRotation={wheelRotation}
          />
        )
      case 'generate':
        return (
          <Generate
            onNavigate={handleNavigate}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
            exitPending={exitPending}
          />
        )
      default:
        return (
          <Navigate
            onNavigate={handleNavigate}
            courseData={courseData}
            setCourseData={setCourseData}
            user={userData}
            courseState={courseState}
            setCourseState={setCourseState}
          />
        )
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: THEME.BG_BASE
      }}
    >
      {/* Stage Container - REFACTOR Phase 1: viewport units */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          flexShrink: 0,
          background: THEME.BG_DARK,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          // Only apply transform when scale !== 1 to avoid breaking position:fixed descendants
          ...(scale !== 1 && {
            transform: `scale(${scale})`,
            transformOrigin: 'center center'
          })
        }}
      >
        {/* Header - includes horizontal line and page title */}
        <Header
          pageTitle={
            currentPage === 'define' ? '' :  /* COURSE INFORMATION removed per founder request */
            currentPage === 'design' ? 'COURSE PLANNER' :
            currentPage === 'build' ? '' :  /* Removed - burnt orange label only */
            currentPage === 'format' ? '' :  /* Removed - burnt orange label only */
            currentPage === 'generate' ? 'GENERATE' :
            currentPage === 'navigate' ? 'NAVIGATION' :
            currentPage.toUpperCase()
          }
          sectionName={
            currentPage === 'define' ? 'DEFINE' :
            currentPage === 'design' ? 'DESIGN' :
            currentPage === 'build' ? 'BUILD' :
            currentPage === 'format' ? 'FORMAT' :
            currentPage === 'generate' ? 'GENERATE' :
            null
          }
          courseData={courseData}
          onExitClick={handleExitClick}
          exitPending={exitPending}
        />

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderPage()}
        </div>

        {/* Design Sub-navigation moved to internal DesignNavBar component */}
      </div>
      <DebugGridController isVisible={showDebugGrid} onEscapeWhenNoPins={handleEscapeNavigation} />
    </div>
  )
}

export default App
