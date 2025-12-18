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
import OutlinePlanner from './pages/OutlinePlanner'
import Scalar from './pages/Scalar'
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
  const [designSubpage, setDesignSubpage] = useState('planner') // 'planner' | 'scalar'

  // Debug grid state (Ctrl+G toggle)
  const [showDebugGrid, setShowDebugGrid] = useState(false)

  // Course data state
  const [courseData, setCourseData] = useState({
    title: '',
    thematic: '',
    module: 1,
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

  // Course state for Footer (save tracking)
  const [courseState, setCourseState] = useState({
    startDate: null,
    saveCount: 0
  })

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

  // Handle login
  const handleLogin = useCallback((userData) => {
    setCurrentUser(userData)
    setIsAuthenticated(true)
    setCurrentPage('navigate')
  }, [])

  // Handle navigation from NavWheel or other sources
  const handleNavigate = useCallback((section) => {
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
  }, [])

  // Handle design sub-navigation (planner vs scalar)
  const handleDesignSubnav = useCallback((subpage) => {
    setDesignSubpage(subpage)
  }, [])

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
          />
        )
      case 'design':
        // Design has sub-pages: OutlinePlanner and Scalar
        if (designSubpage === 'planner') {
          return (
            <OutlinePlanner
              onNavigate={handleNavigate}
              courseData={courseData}
              setCourseData={setCourseData}
              courseLoaded={courseLoaded}
              user={userData}
              courseState={courseState}
            />
          )
        } else {
          return (
            <Scalar
              onNavigate={handleNavigate}
              courseData={courseData}
              courseLoaded={courseLoaded}
              user={userData}
              courseState={courseState}
            />
          )
        }
      case 'build':
        return (
          <Build
            onNavigate={handleNavigate}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
          />
        )
      case 'format':
        return (
          <Format
            onNavigate={handleNavigate}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
          />
        )
      case 'generate':
        return (
          <Generate
            onNavigate={handleNavigate}
            courseLoaded={courseLoaded}
            user={userData}
            courseState={courseState}
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
            currentPage === 'design' ? 'OUTLINE PLANNER' :
            currentPage === 'build' ? 'BUILD' :
            currentPage === 'format' ? 'FORMAT' :
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
        />

        {/* Page Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderPage()}
        </div>

        {/* Design Sub-navigation (only on design page) - OVERVIEW and SCALAR tabs */}
        {currentPage === 'design' && (
          <div
            style={{
              position: 'absolute',
              top: '100px',
              right: '40px',
              display: 'flex',
              gap: '12px',
              zIndex: 100
            }}
          >
            <button
              onClick={() => handleDesignSubnav('planner')}
              style={{
                padding: '14px 36px',
                fontSize: '15px',
                letterSpacing: '3px',
                fontFamily: THEME.FONT_PRIMARY,
                background: designSubpage === 'planner' ? THEME.GRADIENT_BUTTON : 'transparent',
                border: `1px solid ${designSubpage === 'planner' ? THEME.AMBER : THEME.BORDER}`,
                borderRadius: '20px',
                color: designSubpage === 'planner' ? THEME.WHITE : THEME.TEXT_SECONDARY,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (designSubpage !== 'planner') e.target.style.color = THEME.AMBER }}
              onMouseLeave={(e) => { if (designSubpage !== 'planner') e.target.style.color = THEME.TEXT_SECONDARY }}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => handleDesignSubnav('scalar')}
              style={{
                padding: '14px 36px',
                fontSize: '15px',
                letterSpacing: '3px',
                fontFamily: THEME.FONT_PRIMARY,
                background: designSubpage === 'scalar' ? THEME.GRADIENT_BUTTON : 'transparent',
                border: `1px solid ${designSubpage === 'scalar' ? THEME.AMBER : THEME.BORDER}`,
                borderRadius: '20px',
                color: designSubpage === 'scalar' ? THEME.WHITE : THEME.TEXT_SECONDARY,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (designSubpage !== 'scalar') e.target.style.color = THEME.AMBER }}
              onMouseLeave={(e) => { if (designSubpage !== 'scalar') e.target.style.color = THEME.TEXT_SECONDARY }}
            >
              SCALAR
            </button>
          </div>
        )}
      </div>
      <DebugGridController isVisible={showDebugGrid} onEscapeWhenNoPins={handleEscapeNavigation} />
    </div>
  )
}

export default App
