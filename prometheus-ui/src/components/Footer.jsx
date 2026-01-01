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
import PKEInterface from './PKEInterface'
import silverButtonImage from '../assets/Silver_Button.png'
import ConfirmableButton from './shared/ConfirmableButton'

// Navigation order for < > arrows
const NAV_ORDER = ['navigate', 'define', 'design', 'build', 'format', 'generate']

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
  onDeleteCancel = null,
  // PKE visibility (hidden on Navigation Hub)
  hidePKE = false,
  // Navigation arrow props (grey until SAVE pressed, revert on changes)
  hasUnsavedChanges = true,
  // Exit workflow - when true, SAVE button pulses green
  exitPending = false
}) {
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
    onNavigate?.(section)
  }, [onNavigate])

  // Navigation arrow handlers (prev/next page) - permanently active
  const [prevHovered, setPrevHovered] = useState(false)
  const [nextHovered, setNextHovered] = useState(false)

  const handlePrevPage = useCallback(() => {
    const currentIndex = NAV_ORDER.indexOf(currentSection)
    if (currentIndex > 0) {
      onNavigate?.(NAV_ORDER[currentIndex - 1])
    }
  }, [currentSection, onNavigate])

  const handleNextPage = useCallback(() => {
    const currentIndex = NAV_ORDER.indexOf(currentSection)
    if (currentIndex < NAV_ORDER.length - 1) {
      onNavigate?.(NAV_ORDER[currentIndex + 1])
    }
  }, [currentSection, onNavigate])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        flexShrink: 0,
        zIndex: 50
      }}
    >
      {/* Home Button (Silver) - 100px left of ANALYTICS, same size */}
      <HomeButton onNavigate={handleNavigate} />

      {/* Analytics Ring Button - now with ECG and text below */}
      <div style={{
        position: 'absolute',
        left: '8.99vw',
        bottom: '9.47vh',
        transform: 'translate(-50%, 50%)',
        zIndex: 100
      }}>
        <AnalyticsRing />
      </div>

      {/* Controls Row - positioned so PKE bottom is at Y=710 (just above line at Y=715) */}
      <div
        style={{
          position: 'relative',
          height: 'var(--frame-footer-h)',  /* 120px @ 1080 */
          marginBottom: '0.46vh'            /* 5px @ 1080 */
        }}
      >

        {/* Center Section: < + > and PKE Interface - hidden on Navigation Hub */}
        {!hidePKE && (
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
            {/* Navigation arrows - permanently active, burnt orange on hover */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.48vh', marginBottom: '0.46vh', marginLeft: '1.04vw' }}>
              <button
                onClick={handlePrevPage}
                onMouseEnter={() => setPrevHovered(true)}
                onMouseLeave={() => setPrevHovered(false)}
                style={{
                  ...navArrowStyle,
                  color: prevHovered ? THEME.AMBER : THEME.WHITE,
                  cursor: 'pointer',
                  opacity: 1
                }}
              >
                &lt;
              </button>
              <span style={{ color: THEME.TEXT_DIM, fontSize: '1.67vh' }}>+</span>
              <button
                onClick={handleNextPage}
                onMouseEnter={() => setNextHovered(true)}
                onMouseLeave={() => setNextHovered(false)}
                style={{
                  ...navArrowStyle,
                  color: nextHovered ? THEME.AMBER : THEME.WHITE,
                  cursor: 'pointer',
                  opacity: 1
                }}
              >
                &gt;
              </button>
            </div>

            {/* PKE Interface - click inside to activate, click outside to deactivate */}
            <PKEInterface
              isActive={isPKEActive}
              onToggle={onPKEToggle}
              onClose={() => onPKEToggle?.(false)}
              deleteLoNumber={deleteLoNumber}
              deleteStep={deleteStep}
              onKeep={onDeleteKeep}
              onDelete={onDeleteConfirm}
              onCancel={onDeleteCancel}
            />
          </div>
        )}

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
          <ConfirmableButton
            onConfirm={onDelete}
            defaultText="DELETE"
            confirmText="WARNING - Click to delete"
            warningColor="#ff3333"
          />
          <ConfirmableButton
            onConfirm={onClear}
            defaultText="CLEAR"
            confirmText="Unsaved work will be lost"
            warningColor="#FFD700"
          />
          <SaveButton onSave={onSave} exitPending={exitPending} />
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
            color: THEME.AMBER,          /* Burnt Orange #d4730c */
            fontFamily: "'Rajdhani', 'Candara', sans-serif",
            fontSize: '1.70vh',          /* 18.4px @ 1080 (+15% from 16px) */
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
 * HomeWheel - Mini NavWheel style button for Navigation Hub
 *
 * Positioned 100px left of ANALYTICS, same size (~65px diameter)
 * SVG-based wheel with burnt orange styling
 * Hover: burnt orange glow effect
 * "HOME" text in burnt orange below
 */
function HomeButton({ onNavigate }) {
  const [isHovered, setIsHovered] = useState(false)
  const size = 56 // ~6vh at 940px viewport

  return (
    <div
      style={{
        position: 'absolute',
        left: '3.70vw',
        bottom: '9.47vh',
        transform: 'translate(-50%, 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5vh',
        zIndex: 100
      }}
    >
      <div
        onClick={() => onNavigate?.('navigate')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <svg
          width={size}
          height={size}
          style={{
            transition: 'all 0.2s ease',
            filter: isHovered ? 'drop-shadow(0 0 12px rgba(212, 115, 12, 0.6))' : 'none'
          }}
        >
          <defs>
            <linearGradient id="homeWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
              <stop offset="50%" stopColor={THEME.AMBER_DARK} />
              <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
            </linearGradient>
          </defs>

          {/* Outer ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={isHovered ? THEME.AMBER : 'url(#homeWheelGrad)'}
            strokeWidth={2}
            style={{ transition: 'stroke 0.2s ease' }}
          />

          {/* Inner circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill={THEME.BG_DARK}
            stroke={isHovered ? THEME.AMBER : THEME.AMBER_DARK}
            strokeWidth={2}
            style={{ transition: 'stroke 0.2s ease' }}
          />

          {/* 4 cardinal tick marks */}
          {[0, 90, 180, 270].map((angle) => {
            const rad = (angle - 90) * (Math.PI / 180)
            const innerR = size / 2 - 8
            const outerR = size / 2 - 3
            return (
              <line
                key={angle}
                x1={size / 2 + innerR * Math.cos(rad)}
                y1={size / 2 + innerR * Math.sin(rad)}
                x2={size / 2 + outerR * Math.cos(rad)}
                y2={size / 2 + outerR * Math.sin(rad)}
                stroke={THEME.AMBER_DARK}
                strokeWidth={2}
              />
            )
          })}

          {/* Center compass icon */}
          <text
            x={size / 2}
            y={size / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY}
            fontSize="14"
            style={{ transition: 'fill 0.2s ease' }}
          >
            ⌂
          </text>
        </svg>
      </div>

      {/* HOME text below */}
      <span
        style={{
          fontSize: '0.93vh',
          letterSpacing: '0.09vh',
          color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        HOME
      </span>
    </div>
  )
}

/**
 * AnalyticsRing - Ring-style button for Analytics with ECG waveform
 *
 * Same diameter as HomeWheel (~56px), 2px stroke, not filled
 * ECG waveform inside in grey
 * Hover: stroke and ECG change to orange
 * "ANALYTICS" text below (aligned with HOME text)
 */
function AnalyticsRing() {
  const [isHovered, setIsHovered] = useState(false)
  const size = 56 // Match HomeWheel size

  // ECG waveform path - stylized heartbeat pattern
  const ecgPath = `M 8,${size/2}
    L 14,${size/2}
    L 17,${size/2 - 8}
    L 20,${size/2 + 12}
    L 23,${size/2 - 4}
    L 26,${size/2}
    L 32,${size/2}
    L 35,${size/2 - 3}
    L 38,${size/2 + 3}
    L 41,${size/2}
    L 48,${size/2}`

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5vh'
      }}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: size,
          height: size,
          cursor: 'pointer'
        }}
      >
        <svg
          width={size}
          height={size}
          style={{
            transition: 'all 0.2s ease',
            filter: isHovered ? 'drop-shadow(0 0 8px rgba(212, 115, 12, 0.4))' : 'none'
          }}
        >
          {/* Outer ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke={isHovered ? THEME.AMBER : '#444'}
            strokeWidth={2}
            style={{ transition: 'stroke 0.2s ease' }}
          />

          {/* ECG waveform */}
          <path
            d={ecgPath}
            fill="none"
            stroke={isHovered ? THEME.AMBER : '#444'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke 0.2s ease' }}
          />
        </svg>
      </div>

      {/* ANALYTICS text below */}
      <span
        style={{
          fontSize: '0.93vh',
          letterSpacing: '0.09vh',
          color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        ANALYTICS
      </span>
    </div>
  )
}

/**
 * SaveButton - Save button with progress bar
 *
 * Features:
 * - Green border on hover
 * - Progress bar showing "SAVING X%" when saving
 * - Pulsing animation when exitPending is true (prompting user to save before exit)
 */
function SaveButton({ onSave, exitPending = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)

  const handleSave = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    setSaveProgress(0)

    // Simulate save progress
    const progressInterval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Execute actual save
    await onSave?.()

    // Complete the progress
    setTimeout(() => {
      setSaveProgress(100)
      setTimeout(() => {
        setIsSaving(false)
        setSaveProgress(0)
      }, 300)
    }, 500)
  }, [onSave, isSaving])

  const isActive = isHovered || isSaving || exitPending

  return (
    <>
      {/* Pulsing animation for exit pending */}
      {exitPending && (
        <style>
          {`
            @keyframes savePulse {
              0%, 100% {
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
              }
              50% {
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
              }
            }
          `}
        </style>
      )}
      <button
        onClick={handleSave}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isSaving}
        style={{
          ...actionButtonStyle,
          ...primaryButtonStyle,
          position: 'relative',
          overflow: 'hidden',
          borderColor: isActive ? THEME.GREEN_BRIGHT : THEME.AMBER,
          boxShadow: exitPending
            ? `0 0 12px rgba(0, 255, 0, 0.6)`
            : isHovered
              ? `0 0 8px rgba(0, 255, 0, 0.4)`
              : 'none',
          animation: exitPending ? 'savePulse 1.5s ease-in-out infinite' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Progress bar background */}
        {isSaving && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${saveProgress}%`,
              background: 'rgba(0, 255, 0, 0.3)',
              transition: 'width 0.1s ease',
              borderRadius: '1.85vh'
            }}
          />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>
          {isSaving ? `SAVING ${saveProgress}%` : 'SAVE'}
        </span>
      </button>
    </>
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
