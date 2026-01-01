/**
 * Scalar Page - Slides 5 & 6 of Mockup 2.1
 *
 * Tabbed interface:
 * - MANAGER: Three-column hierarchical editor (Slide 5)
 * - VIEWER: Five-column read-only table (Slide 6)
 *
 * Features:
 * - Tab toggle between Manager and Viewer
 * - Module selector dropdown
 * - PKE import button
 */

import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import ScalarManager from '../components/ScalarManager'
import ScalarViewer from '../components/ScalarViewer'
import Footer from '../components/Footer'

function Scalar({ onNavigate, courseData, courseLoaded, user, courseState }) {
  const [activeTab, setActiveTab] = useState('manager') // 'manager' | 'viewer'
  const [selectedModule, setSelectedModule] = useState(1)
  const [isPKEActive, setIsPKEActive] = useState(false)

  // Handle navigation
  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_DARK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        {/* Left: Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '20px',
              letterSpacing: '6px',
              color: THEME.OFF_WHITE,
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            SCALAR
          </h1>
        </div>

        {/* Center: Import Scalar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '2px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            Import Scalar
          </span>
        </div>

        {/* Right: Module selector and Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Module Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '2px',
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              Module:
            </span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(parseInt(e.target.value))}
              style={{
                background: 'transparent',
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '3px',
                padding: '6px 24px 6px 12px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '11px',
                fontFamily: THEME.FONT_MONO,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          {/* Tab Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '2px'
            }}
          >
            <button
              onClick={() => setActiveTab('manager')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'manager' ? THEME.AMBER : THEME.TEXT_DIM,
                cursor: 'pointer',
                padding: '8px 12px',
                borderBottom: activeTab === 'manager' ? `2px solid ${THEME.AMBER}` : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              MANAGER
            </button>
            <span style={{ color: THEME.TEXT_MUTED }}>|</span>
            <button
              onClick={() => setActiveTab('viewer')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'viewer' ? THEME.AMBER : THEME.TEXT_DIM,
                cursor: 'pointer',
                padding: '8px 12px',
                borderBottom: activeTab === 'viewer' ? `2px solid ${THEME.AMBER}` : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              VIEWER
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '24px 40px',
          paddingBottom: '120px', // Space for bottom controls
          overflow: 'auto'
        }}
      >
        {activeTab === 'manager' ? (
          <ScalarManager />
        ) : (
          <ScalarViewer selectedModule={selectedModule} />
        )}
      </div>

      {/* Shared Footer Component */}
      <Footer
        currentSection="design"
        onNavigate={handleNavigate}
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

export default Scalar
