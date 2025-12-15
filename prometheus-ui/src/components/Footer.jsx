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
import { THEME } from '../constants/theme'
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
  progress = 0,
  // Delete workflow props (for LO deletion via PKE)
  deleteLoNumber = null,
  deleteStep = null,
  onDeleteKeep = null,
  onDeleteConfirm = null,
  onDeleteCancel = null
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
          height: 'var(--frame-footer-h)',  /* 120px @ 1080 */
          marginBottom: '0.46vh'            /* 5px @ 1080 */
        }}
      >
        {/* Left Section: NavWheel + ANALYTICS */}
        <div
          style={{
            position: 'absolute',
            left: '1.04vw',         /* 20px @ 1920 */
            bottom: '0px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3.7vh'            /* 40px @ 1080 */
          }}
        >
          {/* Mini NavWheel - dropped down 25px, scaled 10% larger when collapsed, faint white glow */}
          {/* Note: transform only applied when collapsed to allow fixed positioning when expanded */}
          <div style={{
            position: 'relative',
            marginBottom: '-2.78vh',  /* -30px @ 1080 */
            transform: wheelExpanded ? 'none' : 'scale(1.1)',
            transformOrigin: 'center bottom',
            filter: wheelExpanded ? 'none' : 'drop-shadow(0 0 0.74vh rgba(255, 255, 255, 0.15))'  /* 8px @ 1080 */
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
              left: '7.29vw',               /* 140px @ 1920 */
              bottom: '0.46vh',             /* 5px @ 1080 */
              width: 'var(--navwheel-collapsed)',   /* 70px @ 1080 */
              height: 'var(--navwheel-collapsed)'   /* 70px @ 1080 */
            }}
          >
            <AnalyticsRing />
          </div>
        </div>

        {/* Center Section: < + > and PKE Interface - moved up 10px */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(50% - 0.52vw)',  /* nudged 10px left @ 1920 */
            transform: 'translateX(-50%)',
            bottom: '1.39vh',            /* 15px @ 1080 */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Navigation arrows - 5px above PKE, nudged 20px right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.48vh', marginBottom: '0.46vh', marginLeft: '1.04vw' }}>
            <button style={navArrowStyle}>&lt;</button>
            <span style={{ color: THEME.TEXT_DIM, fontSize: '1.67vh' }}>+</span>
            <button style={navArrowStyle}>&gt;</button>
          </div>

          {/* PKE Interface */}
          <PKEInterface
            isActive={isPKEActive}
            onClose={() => onPKEToggle?.(false)}
            deleteLoNumber={deleteLoNumber}
            deleteStep={deleteStep}
            onKeep={onDeleteKeep}
            onDelete={onDeleteConfirm}
            onCancel={onDeleteCancel}
          />
        </div>

        {/* Right Section: Action Buttons */}
        <div
          style={{
            position: 'absolute',
            right: '1.04vw',      /* 20px @ 1920 */
            bottom: '0.93vh',    /* 10px @ 1080 */
            display: 'flex',
            gap: '0.63vw'        /* 12px @ 1920 */
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
          height: '0.09vh',  /* 1px @ 1080 */
          background: 'linear-gradient(to right, transparent 0%, #444 10%, #444 90%, transparent 100%)'
        }}
      />

      {/* Info Row - centered on Y=740 (~25px below line) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.11vh 1.04vw',    /* 12px 20px @ 1080/1920 */
          fontFamily: "'Rajdhani', 'Candara', sans-serif",
          fontSize: '1.48vh',          /* 16px @ 1080 */
          position: 'relative'
        }}
      >
        {/* Left Info Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25vw' }}>   {/* 24px @ 1920 */}
          {/* OWNER */}
          <div style={{ display: 'flex', gap: '0.31vw' }}>   {/* 6px @ 1920 */}
            <span style={{ color: '#f0f0f0' }}>OWNER:</span>
            <span style={{ color: '#00ff00' }}>{user.name}</span>
          </div>

          {/* START DATE */}
          <div style={{ display: 'flex', gap: '0.31vw' }}>   {/* 6px @ 1920 */}
            <span style={{ color: '#f0f0f0' }}>START DATE:</span>
            <span style={{ color: '#00ff00' }}>{getStartDate()}</span>
          </div>

          {/* STATUS */}
          <div style={{ display: 'flex', gap: '0.31vw' }}>   {/* 6px @ 1920 */}
            <span style={{ color: '#f0f0f0' }}>STATUS:</span>
            <span style={{ color: '#00ff00' }}>{getStatus()}</span>
          </div>

          {/* PROGRESS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.31vw' }}>   {/* 6px @ 1920 */}
            <span style={{ color: '#f0f0f0' }}>PROGRESS:</span>
            <span style={{ color: '#00ff00' }}>{progress}%</span>
            {/* Progress Bar */}
            <div
              style={{
                width: '5.21vw',         /* 100px @ 1920 */
                height: '0.74vh',        /* 8px @ 1080 */
                background: '#333',
                borderRadius: '0.37vh',  /* 4px @ 1080 */
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: '#00ff00',
                  borderRadius: '0.37vh',  /* 4px @ 1080 */
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
            fontSize: '1.48vh',          /* 16px @ 1080 */
            letterSpacing: '0.09vh'      /* 1px @ 1080 */
          }}
        >
          {formatDate(currentTime)} {formatTime(currentTime)}
        </div>

        {/* Right Info Section */}
        <div style={{ display: 'flex', gap: '0.31vw' }}>   {/* 6px @ 1920 */}
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
function AnalyticsRing() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `0.19vh solid ${isHovered ? '#d4730c' : '#444'}`,  /* 2px @ 1080 */
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
          fontSize: '0.93vh',           /* 10px @ 1080 */
          letterSpacing: '0.09vh',      /* 1px @ 1080 */
          color: isHovered ? '#d4730c' : THEME.TEXT_SECONDARY,
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
  fontSize: '2.5vh',           /* 27px @ 1080 */
  cursor: 'pointer',
  padding: '0.56vh 0.63vw',    /* 6px 12px @ 1080/1920 */
  transition: 'color 0.2s ease'
}

const actionButtonStyle = {
  padding: '1.3vh 1.88vw',     /* 14px 36px @ 1080/1920 */
  fontSize: '1.39vh',          /* 15px @ 1080 */
  letterSpacing: '0.16vw',     /* 3px @ 1920 */
  fontFamily: THEME.FONT_PRIMARY,
  background: 'transparent',
  border: `0.09vh solid ${THEME.BORDER}`,  /* 1px @ 1080 */
  borderRadius: '1.85vh',      /* 20px @ 1080 */
  color: THEME.TEXT_SECONDARY,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
}

const primaryButtonStyle = {
  background: THEME.GRADIENT_BUTTON,
  border: `0.09vh solid ${THEME.AMBER}`,  /* 1px @ 1080 */
  color: THEME.WHITE
}

export default Footer
