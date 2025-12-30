/**
 * ProfileManagerModal.jsx - Profile Management Modal
 *
 * FORMAT Page Component
 *
 * Provides:
 * - Rename profile modal
 * - Create new profile modal
 * - Simple overlay modal pattern
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'

function ProfileManagerModal({ mode, profileId, onClose }) {
  const { profiles, renameProfile, createProfile } = useTemplate()
  const inputRef = useRef(null)

  // Get current profile for rename mode
  const currentProfile = profiles.find(p => p.id === profileId)
  const initialValue = mode === 'rename' && currentProfile ? currentProfile.name : ''

  const [inputValue, setInputValue] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  // Handle submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const trimmedValue = inputValue.trim()
    if (!trimmedValue) {
      setError('Profile name cannot be empty')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'rename' && profileId) {
        await renameProfile(profileId, trimmedValue)
      } else if (mode === 'new') {
        await createProfile(trimmedValue)
      }
      onClose()
    } catch (err) {
      setError('Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }, [mode, profileId, inputValue, renameProfile, createProfile, onClose])

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const title = mode === 'rename' ? 'RENAME PROFILE' : 'NEW PROFILE'
  const buttonLabel = mode === 'rename' ? 'SAVE' : 'CREATE'

  return (
    <div
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: THEME.BG_PANEL || '#1a1a1a',
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '8px',
          padding: '24px',
          minWidth: '320px',
          maxWidth: '400px'
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '12px',
            letterSpacing: '3px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          {title}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter profile name"
            style={{
              width: '100%',
              height: '40px',
              background: THEME.BG_INPUT || '#0d0d0d',
              border: `1px solid ${error ? '#FF4444' : THEME.BORDER_INPUT || '#333'}`,
              borderRadius: '4px',
              color: THEME.TEXT_PRIMARY,
              fontSize: '14px',
              fontFamily: THEME.FONT_PRIMARY,
              padding: '0 12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Error Message */}
          {error && (
            <div
              style={{
                fontSize: '10px',
                color: '#FF4444',
                marginTop: '8px',
                fontFamily: THEME.FONT_MONO
              }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '36px',
                background: 'transparent',
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '4px',
                color: THEME.TEXT_SECONDARY,
                fontSize: '11px',
                letterSpacing: '2px',
                fontFamily: THEME.FONT_PRIMARY,
                cursor: 'pointer'
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !inputValue.trim()}
              style={{
                flex: 1,
                height: '36px',
                background: inputValue.trim()
                  ? `linear-gradient(180deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST} 100%)`
                  : 'transparent',
                border: `1px solid ${THEME.AMBER_DARK}`,
                borderRadius: '4px',
                color: inputValue.trim() ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
                fontSize: '11px',
                letterSpacing: '2px',
                fontFamily: THEME.FONT_PRIMARY,
                cursor: inputValue.trim() ? 'pointer' : 'default',
                opacity: inputValue.trim() ? 1 : 0.5
              }}
            >
              {isSubmitting ? '...' : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileManagerModal
