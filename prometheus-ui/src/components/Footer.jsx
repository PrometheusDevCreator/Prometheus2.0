/**
 * Footer.jsx - Shared Footer Component
 *
 * LOCKED SPECIFICATION - Do not modify without formal change request
 *
 * Layout (from bottom up):
 * - Info row: centered on Y=740 (relative to 768px viewport)
 * - Horizontal line: Y=715
 * - Controls row: bottom edge at Y=705
 *
 * Elements:
 * - Controls: NavWheel | ANALYTICS | < + > PKE Interface | DELETE CLEAR SAVE
 * - Info: OWNER | START DATE | STATUS | PROGRESS | DATE TIME (centered) | APPROVED
 */

import { useState, useEffect, useCallback } from 'react'
import { THEME, ANIMATION } from '../constants/theme'
import NavWheel from './NavWheel'
import PKEInterface from './PKEInterface'

function Footer({
  currentSection = 'define',
  onNavigate,
  isPKEActive = false,
  onPKEToggle,
  onSave,
  onClear,
  onDelete,
  // State data
  user = { name: '---' },
  courseState = {
    startDate: null,
    saveCount: 0
  },
  progress = 0
}) {
  // NavWheel expansion state
  const [wheelExpanded, setWheelExpanded] = useState(false)

  // Realtime clock state
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format date as DD/MM/YY
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0')
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const y = date.getFullYear().toString().slice(-2)
    return `${d}/${m}/${y}`
  }

  // Format time as HH:MM:SS
  const formatTime = (date) => {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    const s = date.getSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // Determine status based on save count
  const getStatus = () => {
    if (courseState.saveCount === 0) return '---'
    if (courseState.saveCount === 1) return 'COMMENCED'
    return 'IN PROGRESS'
  }

  // Format start date
  const getStartDate = () => {
    if (!courseState.startDate) return '---'
    return courseState.startDate
  }

  // Handle navigation
  const handleNavigate = useCallback((section) => {
    setWheelExpanded(false)
    onNavigate?.(section)
  }, [onNavigate])

  // Handle wheel toggle
  const handleWheelToggle = useCallback(() => {
    setWheelExpanded(prev => !prev)
  }, [])

  // Analytics ring size (default 70px - same as NavWheel collapsed size)
  const analyticsSize = ANIMATION.WHEEL_COLLAPSED_SIZE // 70px

  // PKE Interface dimensions
  const pkeHeight = 76 // From LAYOUT.PKE_HEIGHT

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}
    >
      {/* Controls Row - positioned so PKE bottom is at Y=710 (just above line at Y=715) */}
      <div
        style={{
          position: 'relative',
          height: '120px', // Height for controls area
          marginBottom: '5px' // 5px gap between PKE bottom and horizontal line
        }}
      >
        {/* Left Section: NavWheel + ANALYTICS */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '0px', // NavWheel at bottom of controls area
            display: 'flex',
            alignItems: 'flex-end',
            gap: '40px' // Gap between NavWheel and ANALYTICS
          }}
        >
          {/* Mini NavWheel - dropped down 25px, scaled 10% larger, faint white glow */}
          <div style={{
            position: 'relative',
            marginBottom: '-30px',
            transform: 'scale(1.1)',
            transformOrigin: 'center bottom',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.15))'
          }}>
            <NavWheel
              currentSection={currentSection}
              onNavigate={handleNavigate}
              isExpanded={wheelExpanded}
              onToggle={handleWheelToggle}
            />
          </div>

          {/* ANALYTICS Ring Button - right edge at X-470, dropped down 10px */}
          <div
            style={{
              position: 'absolute',
              left: '140px', // Positions right edge at approximately X-470 from center
              bottom: '5px', // Dropped down 10px from previous 15px
              width: `${analyticsSize}px`,
              height: `${analyticsSize}px`
            }}
          >
            <AnalyticsRing size={analyticsSize} />
          </div>
        </div>

        {/* Center Section: < + > and PKE Interface - moved up 10px */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 10px)', // Nudged 10px left from center
            transform: 'translateX(-50%)',
            bottom: '15px', // Moved up 15px total
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Navigation arrows - 5px above PKE, nudged 20px right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '5px', marginLeft: '20px' }}>
            <button style={navArrowStyle}>&lt;</button>
            <span style={{ color: THEME.TEXT_DIM, fontSize: '18px' }}>+</span>
            <button style={navArrowStyle}>&gt;</button>
          </div>

          {/* PKE Interface */}
          <PKEInterface
            isActive={isPKEActive}
            onClose={() => onPKEToggle?.(false)}
          />
        </div>

        {/* Right Section: Action Buttons */}
        <div
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '10px',
            display: 'flex',
            gap: '12px'
          }}
        >
          <button
            style={actionButtonStyle}
            onClick={onDelete}
          >
            DELETE
          </button>
          <button
            style={actionButtonStyle}
            onClick={onClear}
          >
            CLEAR
          </button>
          <button
            style={{ ...actionButtonStyle, ...primaryButtonStyle }}
            onClick={onSave}
          >
            SAVE
          </button>
        </div>
      </div>

      {/* Horizontal Line at Y=715 */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, #444 10%, #444 90%, transparent 100%)'
        }}
      />

      {/* Info Row - centered on Y=740 (~25px below line) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          fontFamily: "'Rajdhani', 'Candara', sans-serif",
          fontSize: '16px',
          position: 'relative'
        }}
      >
        {/* Left Info Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* OWNER */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#f0f0f0' }}>OWNER:</span>
            <span style={{ color: '#00ff00' }}>{user.name}</span>
          </div>

          {/* START DATE */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#f0f0f0' }}>START DATE:</span>
            <span style={{ color: '#00ff00' }}>{getStartDate()}</span>
          </div>

          {/* STATUS */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#f0f0f0' }}>STATUS:</span>
            <span style={{ color: '#00ff00' }}>{getStatus()}</span>
          </div>

          {/* PROGRESS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#f0f0f0' }}>PROGRESS:</span>
            <span style={{ color: '#00ff00' }}>{progress}%</span>
            {/* Progress Bar */}
            <div
              style={{
                width: '100px',
                height: '8px',
                background: '#333',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#00ff00',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: Date Time - exactly on horizontal centerline (50vw) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#00ff00',
            fontFamily: "'Rajdhani', 'Candara', sans-serif",
            fontSize: '16px',
            letterSpacing: '1px'
          }}
        >
          {formatDate(currentTime)} {formatTime(currentTime)}
        </div>

        {/* Right Info Section */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ color: '#f0f0f0' }}>APPROVED Y/N:</span>
          <span style={{ color: '#00ff00' }}>--</span>
        </div>
      </div>
    </div>
  )
}

/**
 * AnalyticsRing - Ring-style button for Analytics
 *
 * Same diameter as NavWheel (70px), 2px stroke, not filled
 * Hover: stroke and text change to orange
 */
function AnalyticsRing({ size = 70 }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: `2px solid ${isHovered ? '#d4730c' : '#444'}`,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease'
      }}
    >
      <span
        style={{
          fontSize: '10px', // 10% larger (was 9px)
          letterSpacing: '1px',
          color: isHovered ? '#d4730c' : THEME.TEXT_SECONDARY, // Same as DELETE/CLEAR buttons
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        ANALYTICS
      </span>
    </div>
  )
}

// Style constants
const navArrowStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.TEXT_DIM,
  fontSize: '27px',
  cursor: 'pointer',
  padding: '6px 12px',
  transition: 'color 0.2s ease'
}

const actionButtonStyle = {
  padding: '14px 36px',
  fontSize: '15px',
  letterSpacing: '3px',
  fontFamily: THEME.FONT_PRIMARY,
  background: 'transparent',
  border: `1px solid ${THEME.BORDER}`,
  borderRadius: '20px',
  color: THEME.TEXT_SECONDARY,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}

const primaryButtonStyle = {
  background: THEME.GRADIENT_BUTTON,
  border: `1px solid ${THEME.AMBER}`,
  color: THEME.WHITE
}

export default Footer
