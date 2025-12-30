/**
 * ReformatToolPanel.jsx - Reformat Tool UI Wrapper
 *
 * FORMAT Page Component
 *
 * CORRECTION #4: Reformat Tool must be ALWAYS launchable.
 * - It is a utility, not part of the pipeline
 * - Accessible regardless of template mapping state
 * - Operates independently of TemplateSpec completeness
 *
 * This is a UI wrapper only - actual reformat logic is external
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'

function ReformatToolPanel() {
  const [isLaunching, setIsLaunching] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  // Handle launch (CORRECTION #4: Always enabled, not gated)
  const handleLaunch = useCallback(async () => {
    setIsLaunching(true)

    // Simulate launch delay
    await new Promise(resolve => setTimeout(resolve, 500))

    setIsLaunching(false)
    setShowMessage(true)

    // Hide message after 3 seconds
    setTimeout(() => setShowMessage(false), 3000)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Section Label */}
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '2px',
          color: THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center'
        }}
      >
        REFORMAT TOOL
      </div>

      {/* Launch Button - ALWAYS enabled per CORRECTION #4 */}
      <button
        onClick={handleLaunch}
        disabled={isLaunching}
        style={{
          width: '100%',
          height: '44px',
          background: `linear-gradient(180deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST} 100%)`,
          border: `1px solid ${THEME.AMBER}`,
          borderRadius: '4px',
          color: THEME.TEXT_PRIMARY,
          fontSize: '11px',
          letterSpacing: '3px',
          fontFamily: THEME.FONT_PRIMARY,
          cursor: isLaunching ? 'wait' : 'pointer',
          opacity: isLaunching ? 0.7 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isLaunching ? 'LAUNCHING...' : 'LAUNCH REFORMAT TOOL'}
      </button>

      {/* Info Text */}
      <div
        style={{
          fontSize: '9px',
          color: THEME.TEXT_MUTED,
          textAlign: 'center',
          fontFamily: THEME.FONT_MONO,
          lineHeight: 1.5
        }}
      >
        Utility for presentation cleanup<br />
        Independent of template mapping
      </div>

      {/* Launch Message */}
      {showMessage && (
        <div
          style={{
            padding: '10px',
            background: THEME.BG_DARK,
            borderRadius: '4px',
            border: `1px solid ${THEME.GREEN_BRIGHT}40`,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: THEME.GREEN_BRIGHT,
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            REFORMAT TOOL READY
          </div>
          <div
            style={{
              fontSize: '9px',
              color: THEME.TEXT_DIM,
              marginTop: '4px',
              fontFamily: THEME.FONT_MONO
            }}
          >
            External tool interface placeholder
          </div>
        </div>
      )}
    </div>
  )
}

export default ReformatToolPanel
