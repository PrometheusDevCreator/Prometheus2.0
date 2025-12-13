/**
 * Format Page - Placeholder
 *
 * Coming Soon page with full frame structure
 */

import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'

function Format({ onNavigate, courseLoaded, user, courseState }) {
  const [isPKEActive, setIsPKEActive] = useState(false)

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
      {/* Page Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            letterSpacing: '6px',
            color: THEME.OFF_WHITE,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          FORMAT
        </h1>
      </div>

      {/* Main Content - Coming Soon */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="fade-in-scale"
          style={{
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '48px',
              color: THEME.AMBER_DARK,
              marginBottom: '20px',
              opacity: 0.5
            }}
          >
            📄
          </div>
          <h2
            style={{
              fontSize: '14px',
              letterSpacing: '6px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              marginBottom: '12px'
            }}
          >
            COMING SOON
          </h2>
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '2px',
              color: THEME.TEXT_MUTED,
              fontFamily: THEME.FONT_MONO
            }}
          >
            Format functionality is under development
          </p>
        </div>
      </div>

      {/* Shared Footer Component */}
      <Footer
        currentSection="format"
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

export default Format
