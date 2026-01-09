/**
 * DesignNavBar.jsx - Navigation Bar for DESIGN Section
 *
 * REVISED IMPLEMENTATION - Per DESIGN_Page Mockup
 *
 * Layout: Single row with three zones — Left | Centre | Right
 *
 * Left Zone:
 * - "ACTIVE COURSE: [Course Title]" (20% larger, title in Burnt Orange)
 * - "ACTIVE LESSON: [Lesson Title]" (title in Luminous Green)
 *
 * Centre Zone:
 * - "< TIMETABLE >" / "< SCALAR >" toggle with arrows
 * - "< WEEK N > ∨" week/day/module selector below
 *
 * Right Zone:
 * - "Total: Xhr" display
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
    currentWeek,
    setCurrentWeek,
    selectedLesson,
    scheduledLessons,
    courseData
  } = useDesign()

  // Dropdown state for view mode selector
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)

  // Get active course and lesson titles
  const activeCourseTitle = courseData?.title || 'No Course Loaded'
  const activeLessonTitle = selectedLesson?.title || 'None Selected'

  // Calculate total scheduled hours
  const totalMinutes = scheduledLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  const formatTotalTime = () => {
    if (totalMinutes === 0) return '0hr'
    if (remainingMins === 0) return `${totalHours}hr`
    return `${totalHours}h${remainingMins}m`
  }

  // Tab order: OVERVIEW -> TIMETABLE -> SCALAR
  const tabOrder = ['overview', 'timetable', 'scalar']
  const currentTabIndex = tabOrder.indexOf(activeTab)

  // Toggle between tabs (3 tabs: OVERVIEW, TIMETABLE, SCALAR)
  const handleTabToggle = (direction) => {
    if (direction === 'left' && currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1])
    } else if (direction === 'right' && currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1])
    }
  }

  // Get display label for current tab
  const getTabLabel = () => {
    switch (activeTab) {
      case 'overview': return 'OVERVIEW'
      case 'timetable': return 'TIMETABLE'
      case 'scalar': return 'SCALAR'
      default: return 'OVERVIEW'
    }
  }

  // View mode labels
  const viewModeLabel = viewMode === 'day' ? 'DAY' : viewMode === 'week' ? 'WEEK' : 'MODULE'

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    setViewDropdownOpen(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1vh 2vw',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_DARK,
        minHeight: '6vh'
      }}
    >
      {/* LEFT ZONE: Active Course & Lesson Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3vh', flex: 1 }}>
        {/* Active Course - 20% larger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span
            style={{
              fontSize: '2.04vh',  // 20% increase from 1.7vh
              letterSpacing: '0.1vw',
              color: THEME.TEXT_PRIMARY,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            ACTIVE COURSE:
          </span>
          <span
            style={{
              fontSize: '2.04vh',  // 20% increase from 1.7vh
              letterSpacing: '0.1vw',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 500,
              textTransform: 'uppercase'
            }}
          >
            {activeCourseTitle}
          </span>
        </div>
        {/* Active Lesson */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span
            style={{
              fontSize: '1.4vh',
              letterSpacing: '0.1vw',
              color: THEME.TEXT_PRIMARY,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            ACTIVE LESSON:
          </span>
          <span
            style={{
              fontSize: '1.4vh',
              letterSpacing: '0.1vw',
              color: '#00FF00',
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 500,
              textTransform: 'uppercase'
            }}
          >
            {activeLessonTitle}
          </span>
        </div>
      </div>

      {/* CENTRE ZONE: View Toggle + Week Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3vh' }}>
        {/* OVERVIEW / TIMETABLE / SCALAR Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <NavArrow
            direction="left"
            disabled={currentTabIndex === 0}
            onClick={() => handleTabToggle('left')}
          />
          <span
            style={{
              fontSize: '1.8vh',
              letterSpacing: '0.2vw',
              color: THEME.TEXT_PRIMARY,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase',
              minWidth: '8vw',
              textAlign: 'center'
            }}
          >
            {getTabLabel()}
          </span>
          <NavArrow
            direction="right"
            disabled={currentTabIndex === tabOrder.length - 1}
            onClick={() => handleTabToggle('right')}
          />
        </div>

        {/* Week/Day/Module Selector - only show for timetable */}
        {activeTab === 'timetable' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', position: 'relative' }}>
            <NavArrow
              direction="left"
              disabled={currentWeek <= 1}
              onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
              small
            />
            <span
              style={{
                fontSize: '1.3vh',
                color: THEME.TEXT_PRIMARY,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              {viewModeLabel}{' '}
              <span style={{ color: THEME.AMBER }}>{currentWeek}</span>
            </span>
            <NavArrow
              direction="right"
              onClick={() => setCurrentWeek(w => w + 1)}
              small
            />
            {/* Dropdown toggle */}
            <button
              onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: THEME.TEXT_PRIMARY,
                fontSize: '1.2vh',
                cursor: 'pointer',
                padding: '0 0.3vw',
                transform: viewDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              ∨
            </button>

            {/* View Mode Dropdown */}
            {viewDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '0.5vh',
                  background: THEME.BG_PANEL,
                  border: `1px solid ${THEME.BORDER_LIGHT}`,
                  borderRadius: '0.4vh',
                  zIndex: 100,
                  minWidth: '6vw',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                {['week', 'day', 'module'].map(mode => (
                  <div
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    style={{
                      padding: '0.6vh 1vw',
                      fontSize: '1.2vh',
                      color: viewMode === mode ? THEME.AMBER : THEME.TEXT_PRIMARY,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      background: viewMode === mode ? THEME.AMBER_DARK : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = THEME.BG_DARK}
                    onMouseLeave={(e) => e.currentTarget.style.background = viewMode === mode ? THEME.AMBER_DARK : 'transparent'}
                  >
                    {mode}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT ZONE: Total Hours */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', flex: 1, justifyContent: 'flex-end' }}>
        <span
          style={{
            fontSize: '1.4vh',
            color: THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          Total:
        </span>
        <span
          style={{
            fontSize: '1.4vh',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_MONO
          }}
        >
          {formatTotalTime()}
        </span>
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function NavArrow({ direction, disabled, onClick, small }) {
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
            : THEME.TEXT_PRIMARY,
        fontSize: small ? '1.3vh' : '1.8vh',
        cursor: disabled ? 'default' : 'pointer',
        padding: small ? '0.1vh 0.2vw' : '0.2vh 0.4vw',
        opacity: disabled ? 0.4 : 1,
        transition: 'color 0.2s ease'
      }}
    >
      {direction === 'left' ? '<' : '>'}
    </button>
  )
}

export default DesignNavBar
