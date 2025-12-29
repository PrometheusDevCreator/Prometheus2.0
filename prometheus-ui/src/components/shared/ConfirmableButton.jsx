/**
 * ConfirmableButton - Two-Click Confirmation Button
 *
 * A button that requires two clicks to execute its action.
 * First click shows a warning state, second click executes.
 *
 * Props:
 * - onConfirm: Callback executed on second click
 * - defaultText: Normal button text
 * - confirmText: Warning text shown after first click
 * - warningColor: Color for warning state (#ff3333 for delete, #FFD700 for clear)
 * - glowColor: Glow color for warning state
 * - timeout: ms before reverting to default state (default 3000)
 * - style: Additional style overrides
 */

import { useState, useEffect, useCallback } from 'react'
import { THEME } from '../../constants/theme'

function ConfirmableButton({
  onConfirm,
  defaultText = 'CONFIRM',
  confirmText = 'Click again to confirm',
  warningColor = '#ff3333',
  glowColor = null,
  timeout = 3000,
  style = {},
  disabled = false
}) {
  const [isConfirmMode, setIsConfirmMode] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Reset to default state after timeout
  useEffect(() => {
    if (isConfirmMode) {
      const timer = setTimeout(() => {
        setIsConfirmMode(false)
      }, timeout)
      return () => clearTimeout(timer)
    }
  }, [isConfirmMode, timeout])

  const handleClick = useCallback(() => {
    if (disabled) return

    if (isConfirmMode) {
      // Second click - execute confirmation
      setIsConfirmMode(false)
      onConfirm?.()
    } else {
      // First click - enter confirm mode
      setIsConfirmMode(true)
    }
  }, [isConfirmMode, onConfirm, disabled])

  const effectiveGlowColor = glowColor || warningColor

  // Base button style matching Footer.jsx actionButtonStyle
  const baseStyle = {
    padding: '1.3vh 1.88vw',
    fontSize: '1.39vh',
    letterSpacing: '0.16vw',
    fontFamily: THEME.FONT_PRIMARY,
    background: 'transparent',
    border: `0.09vh solid ${THEME.BORDER}`,
    borderRadius: '1.85vh',
    color: THEME.TEXT_SECONDARY,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    minWidth: 'fit-content'
  }

  // Hover state (before confirm mode)
  const hoverStyle = isHovered && !isConfirmMode ? {
    borderColor: warningColor,
    color: warningColor
  } : {}

  // Confirm mode style
  const confirmStyle = isConfirmMode ? {
    border: `2px solid ${warningColor}`,
    boxShadow: `0 0 12px ${effectiveGlowColor}`,
    color: warningColor,
    animation: 'confirmPulse 1s ease-in-out infinite'
  } : {}

  return (
    <>
      {/* Inject keyframes animation if in confirm mode */}
      {isConfirmMode && (
        <style>
          {`
            @keyframes confirmPulse {
              0%, 100% {
                box-shadow: 0 0 8px ${effectiveGlowColor};
              }
              50% {
                box-shadow: 0 0 16px ${effectiveGlowColor};
              }
            }
          `}
        </style>
      )}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        style={{
          ...baseStyle,
          ...hoverStyle,
          ...confirmStyle,
          ...style
        }}
      >
        {isConfirmMode ? confirmText : defaultText}
      </button>
    </>
  )
}

export default ConfirmableButton
