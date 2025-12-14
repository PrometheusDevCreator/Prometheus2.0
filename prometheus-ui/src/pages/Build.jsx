/**
 * Build Page - Placeholder
 *
 * Coming Soon page with full frame structure
 */

import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'
import pkeButton from '../assets/PKE_Button.png'

function Build({ onNavigate, courseLoaded, user, courseState }) {
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
      {/* PKE Button - centered horizontally at Y:630 (matching Define page) */}
      <div
        style={{
          position: 'absolute',
          top: '730px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        <img
          src={pkeButton}
          alt="PKE"
          onClick={() => setIsPKEActive(!isPKEActive)}
          style={{
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            opacity: isPKEActive ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        />
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
            ⚙
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
            Build functionality is under development
          </p>
        </div>
      </div>

      {/* Shared Footer Component */}
      <Footer
        currentSection="build"
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

export default Build
