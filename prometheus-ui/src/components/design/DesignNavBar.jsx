/**
 * DesignNavBar.jsx - Navigation Bar for DESIGN Section
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 1
 *
 * Layout: Single row with three zones — Left | Centre | Right
 *
 * Left Zone:
 * - Section subtitle: "COURSE PLANNER"
 * - Course title in accent orange
 *
 * Centre Zone:
 * - Module control: Label + arrows + editable name
 * - Week control: Label + arrows
 *
 * Right Zone:
 * - Primary Tabs: TIMETABLE | SCALAR
 * - View Toggle: DAY | WEEK | MODULE (when TIMETABLE active)
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function DesignNavBar() {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    currentModule,
    setCurrentModule,
    currentWeek,
    setCurrentWeek,
    currentDay,
    setCurrentDay,
    courseData
  } = useDesign()

  // Module name editing state
  const [editingModuleName, setEditingModuleName] = useState(false)
  const [moduleNameValue, setModuleNameValue] = useState('')

  // Get module name from course data or default
  const moduleName = courseData?.moduleTitles?.[currentModule - 1] || `Module ${currentModule}`
  const courseTitle = courseData?.title || '---'

  // Calculate total modules/weeks from course data
  const totalModules = courseData?.module || 1
  const totalWeeks = (() => {
    const duration = courseData?.duration || 1
    const unit = courseData?.durationUnit || 'Days'
    if (unit === 'Days' || unit === 'DAYS') return Math.ceil(duration / 5)
    if (unit === 'Weeks' || unit === 'WKS') return duration
    return 1
  })()

  // Handle module name edit
  const handleModuleNameEdit = () => {
    setModuleNameValue(moduleName)
    setEditingModuleName(true)
  }

  const handleModuleNameCommit = () => {
    // TODO: Update module name in course data
    setEditingModuleName(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.8vh 1.5vw',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_DARK,
        minHeight: '5vh'
      }}
    >
      {/* LEFT ZONE: Section Label + Course Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', flex: 1 }}>
        <span
          style={{
            fontSize: '1.5vh',
            letterSpacing: '0.15vw',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase'
          }}
        >
          ACTIVE COURSE:
        </span>
        <span
          style={{
            fontSize: '1.7vh',
            letterSpacing: '0.15vw',
            color: THEME.GREEN_BRIGHT,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500
          }}
        >
          {courseTitle}
        </span>
      </div>

      {/* CENTRE ZONE: Module + Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
        {/* Module Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span style={labelStyle}>Module:</span>
          <NavArrow
            direction="left"
            disabled={currentModule <= 1}
            onClick={() => setCurrentModule(m => Math.max(1, m - 1))}
          />
          {editingModuleName ? (
            <input
              autoFocus
              type="text"
              value={moduleNameValue}
              onChange={(e) => setModuleNameValue(e.target.value)}
              onBlur={handleModuleNameCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleModuleNameCommit()
                if (e.key === 'Escape') setEditingModuleName(false)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${THEME.AMBER}`,
                color: THEME.WHITE,
                fontSize: '1.4vh',
                fontFamily: THEME.FONT_PRIMARY,
                width: '10vw',
                outline: 'none',
                textAlign: 'center'
              }}
            />
          ) : (
            <span
              onClick={handleModuleNameEdit}
              style={{
                color: THEME.WHITE,
                fontSize: '1.4vh',
                fontFamily: THEME.FONT_PRIMARY,
                cursor: 'pointer',
                minWidth: '8vw',
                textAlign: 'center'
              }}
              title="Click to edit module name"
            >
              {moduleName}
            </span>
          )}
          <NavArrow
            direction="right"
            disabled={currentModule >= totalModules}
            onClick={() => setCurrentModule(m => Math.min(totalModules, m + 1))}
          />
        </div>

        {/* Week Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span style={labelStyle}>Week:</span>
          <NavArrow
            direction="left"
            disabled={currentWeek <= 1}
            onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
          />
          <span style={{ color: THEME.WHITE, fontSize: '1.4vh', fontFamily: THEME.FONT_PRIMARY }}>
            {currentWeek}
          </span>
          <NavArrow
            direction="right"
            disabled={currentWeek >= totalWeeks}
            onClick={() => setCurrentWeek(w => Math.min(totalWeeks, w + 1))}
          />
        </div>

        {/* Day Control (only in DAY view mode) */}
        {viewMode === 'day' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
            <span style={labelStyle}>Day:</span>
            <NavArrow
              direction="left"
              disabled={currentDay <= 1}
              onClick={() => setCurrentDay(d => Math.max(1, d - 1))}
            />
            <span style={{ color: THEME.AMBER, fontSize: '1.4vh', fontFamily: THEME.FONT_PRIMARY, fontWeight: 500 }}>
              {currentDay}
            </span>
            <NavArrow
              direction="right"
              disabled={currentDay >= 5}
              onClick={() => setCurrentDay(d => Math.min(5, d + 1))}
            />
          </div>
        )}
      </div>

      {/* RIGHT ZONE: Tabs + View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', flex: 1, justifyContent: 'flex-end' }}>
        {/* View Toggle (only when TIMETABLE active) */}
        {activeTab === 'timetable' && (
          <div style={{ display: 'flex', gap: '0.3vw', marginRight: '1vw' }}>
            <ViewToggleButton
              label="DAY"
              active={viewMode === 'day'}
              onClick={() => setViewMode('day')}
            />
            <ViewToggleButton
              label="WEEK"
              active={viewMode === 'week'}
              onClick={() => setViewMode('week')}
            />
            <ViewToggleButton
              label="MODULE"
              active={viewMode === 'module'}
              onClick={() => setViewMode('module')}
            />
          </div>
        )}

        {/* Primary Tabs */}
        <div style={{ display: 'flex', gap: '0.6vw' }}>
          <TabButton
            label="TIMETABLE"
            active={activeTab === 'timetable'}
            onClick={() => setActiveTab('timetable')}
          />
          <TabButton
            label="SCALAR"
            active={activeTab === 'scalar'}
            onClick={() => setActiveTab('scalar')}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function NavArrow({ direction, disabled, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: 'none',
        color: disabled
          ? THEME.TEXT_DIM
          : hovered
            ? THEME.AMBER
            : THEME.WHITE,
        fontSize: '1.6vh',
        cursor: disabled ? 'default' : 'pointer',
        padding: '0.2vh 0.4vw',
        opacity: disabled ? 0.4 : 1,
        transition: 'color 0.2s ease'
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  )
}

function TabButton({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '1vh 1.8vw',
        fontSize: '1.3vh',
        letterSpacing: '0.15vw',
        fontFamily: THEME.FONT_PRIMARY,
        background: active ? THEME.GRADIENT_BUTTON : 'transparent',
        border: `1px solid ${active ? THEME.AMBER : THEME.BORDER}`,
        borderRadius: '1.8vh',
        color: active ? THEME.WHITE : hovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  )
}

function ViewToggleButton({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.6vh 0.8vw',
        fontSize: '1.1vh',
        letterSpacing: '0.1vw',
        fontFamily: THEME.FONT_PRIMARY,
        background: active ? THEME.AMBER_DARK : 'transparent',
        border: `1px solid ${active ? THEME.AMBER : THEME.BORDER}`,
        borderRadius: '0.8vh',
        color: active ? THEME.WHITE : hovered ? THEME.AMBER : THEME.TEXT_DIM,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  )
}

// ============================================
// STYLES
// ============================================

const labelStyle = {
  fontSize: '1.2vh',
  letterSpacing: '0.1vw',
  color: THEME.TEXT_DIM,
  fontFamily: THEME.FONT_PRIMARY,
  textTransform: 'uppercase'
}

export default DesignNavBar
