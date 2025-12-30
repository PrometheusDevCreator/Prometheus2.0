/**
 * ProfileSelector.jsx - Template Profile Dropdown + Action Buttons
 *
 * FORMAT Page Component
 *
 * Provides:
 * - Dropdown to select active template profile
 * - NEW / RENAME / DUPLICATE / DELETE buttons
 * - APPLY button to set active profile
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'

function ProfileSelector({ onShowModal }) {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    applyProfile,
    createProfile,
    deleteProfile,
    duplicateProfile
  } = useTemplate()

  const [selectedId, setSelectedId] = useState(activeProfileId)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Handle dropdown change
  const handleSelectChange = useCallback((e) => {
    setSelectedId(e.target.value)
    setDeleteConfirm(false)
  }, [])

  // Handle Apply button
  const handleApply = useCallback(() => {
    if (selectedId) {
      applyProfile(selectedId)
    }
  }, [selectedId, applyProfile])

  // Handle New button
  const handleNew = useCallback(async () => {
    const newId = await createProfile('New Template Profile')
    if (newId) {
      setSelectedId(newId)
    }
  }, [createProfile])

  // Handle Duplicate button
  const handleDuplicate = useCallback(async () => {
    if (selectedId) {
      const newId = await duplicateProfile(selectedId)
      if (newId) {
        setSelectedId(newId)
      }
    }
  }, [selectedId, duplicateProfile])

  // Handle Delete button (two-click confirmation)
  const handleDelete = useCallback(async () => {
    if (!selectedId) return

    if (deleteConfirm) {
      await deleteProfile(selectedId)
      setDeleteConfirm(false)
      // Select another profile if available
      const remaining = profiles.filter(p => p.id !== selectedId)
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id)
      } else {
        setSelectedId(null)
      }
    } else {
      setDeleteConfirm(true)
      // Reset confirm after 3 seconds
      setTimeout(() => setDeleteConfirm(false), 3000)
    }
  }, [selectedId, deleteConfirm, deleteProfile, profiles])

  // Handle Rename button
  const handleRename = useCallback(() => {
    if (selectedId && onShowModal) {
      onShowModal('rename', selectedId)
    }
  }, [selectedId, onShowModal])

  const buttonStyle = {
    background: 'transparent',
    border: `1px solid ${THEME.BORDER}`,
    color: THEME.TEXT_SECONDARY,
    padding: '6px 12px',
    fontSize: '10px',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: THEME.FONT_PRIMARY
  }

  const buttonHoverStyle = {
    borderColor: THEME.AMBER,
    color: THEME.AMBER
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%'
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
        SELECT TEMPLATE PROFILE
      </div>

      {/* Dropdown */}
      <select
        value={selectedId || ''}
        onChange={handleSelectChange}
        style={{
          width: '100%',
          height: '40px',
          background: THEME.BG_INPUT || '#1a1a1a',
          border: `1px solid ${THEME.BORDER_INPUT || '#333'}`,
          borderRadius: '4px',
          color: THEME.TEXT_PRIMARY,
          fontSize: '13px',
          fontFamily: THEME.FONT_PRIMARY,
          padding: '0 12px',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {profiles.length === 0 ? (
          <option value="">No profiles available</option>
        ) : (
          profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))
        )}
      </select>

      {/* Action Buttons - Row 1 */}
      <div
        style={{
          display: 'flex',
          gap: '8px'
        }}
      >
        <ActionButton
          label="NEW"
          onClick={handleNew}
          style={buttonStyle}
          hoverStyle={buttonHoverStyle}
        />
        <ActionButton
          label="RENAME"
          onClick={handleRename}
          disabled={!selectedId}
          style={buttonStyle}
          hoverStyle={buttonHoverStyle}
        />
        <ActionButton
          label="DUPLICATE"
          onClick={handleDuplicate}
          disabled={!selectedId}
          style={buttonStyle}
          hoverStyle={buttonHoverStyle}
        />
      </div>

      {/* Delete Button */}
      <ActionButton
        label={deleteConfirm ? 'CONFIRM DELETE' : 'DELETE'}
        onClick={handleDelete}
        disabled={!selectedId}
        style={{
          ...buttonStyle,
          width: '100%',
          borderColor: deleteConfirm ? '#FF4444' : THEME.BORDER,
          color: deleteConfirm ? '#FF4444' : THEME.TEXT_SECONDARY
        }}
        hoverStyle={{
          borderColor: '#FF4444',
          color: '#FF4444'
        }}
      />

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={!selectedId || selectedId === activeProfileId}
        style={{
          width: '100%',
          height: '40px',
          background: selectedId && selectedId !== activeProfileId
            ? `linear-gradient(180deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST} 100%)`
            : 'transparent',
          border: `1px solid ${THEME.AMBER_DARK}`,
          borderRadius: '4px',
          color: selectedId && selectedId !== activeProfileId ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
          fontSize: '14px',
          letterSpacing: '3px',
          fontFamily: THEME.FONT_PRIMARY,
          cursor: selectedId && selectedId !== activeProfileId ? 'pointer' : 'default',
          opacity: selectedId && selectedId !== activeProfileId ? 1 : 0.5,
          transition: 'all 0.2s ease'
        }}
      >
        APPLY
      </button>

      {/* Current Profile Indicator */}
      {activeProfile && (
        <div
          style={{
            fontSize: '9px',
            color: THEME.GREEN_BRIGHT,
            textAlign: 'center',
            fontFamily: THEME.FONT_MONO
          }}
        >
          Active: {activeProfile.name}
        </div>
      )}
    </div>
  )
}

/**
 * ActionButton - Reusable button with hover state
 */
function ActionButton({ label, onClick, disabled, style, hoverStyle }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...style,
        flex: 1,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...(isHovered && !disabled ? hoverStyle : {})
      }}
    >
      {label}
    </button>
  )
}

export default ProfileSelector
