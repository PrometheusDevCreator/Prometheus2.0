/**
 * DesignNavBar.jsx - Navigation Bar for DESIGN Section
 *
 * Phase 2-6: Calm Wheel Design/Build Integration
 *
 * Layout: Two rows
 *
 * Row 1: ACTIVE COURSE (left) | Total + Overtime (right)
 * Row 2: ACTIVE LESSON (left) | Tab Buttons centered | (empty right)
 *
 * Tab buttons at same Y position as ACTIVE LESSON label.
 * No grey lines between rows.
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

// Tab configuration
const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'timetable', label: 'TIMETABLE' },
  { id: 'scalar', label: 'SCALAR' }
]

// Tab Button Component
function TabButton({ id, label, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const isHighlighted = isActive || isHovered

  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '1.3vh 1.88vw',
        fontSize: '1.39vh',
        fontFamily: THEME.FONT_PRIMARY,
        fontWeight: 500,
        letterSpacing: '0.1em',
        color: isHighlighted ? THEME.GREEN_BRIGHT : THEME.TEXT_SECONDARY,
        background: THEME.BG_PANEL,
        border: `1px solid ${isHighlighted ? THEME.GREEN_BRIGHT : 'transparent'}`,
        borderRadius: '1.85vh',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        minWidth: '8vw'
      }}
    >
      {label}
    </button>
  )
}

function DesignNavBar() {
  const {
    selectedLesson,
    scheduledLessons,
    courseData,
    activeTab,
    setActiveTab
  } = useDesign()

  // Get active course and lesson titles
  const activeCourseTitle = courseData?.title || 'No Course Loaded'
  const activeLessonTitle = selectedLesson?.title || 'None Selected'

  // Calculate total scheduled hours and expected hours for overtime
  const totalMinutes = scheduledLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMins = totalMinutes % 60

  // Expected hours from course data (weeks * days * hours calculation)
  const expectedMinutes = (() => {
    const weeks = courseData?.weeks || 0
    const days = courseData?.days || 0
    const hours = courseData?.hours || courseData?.duration || 0
    // Assume 8hr day, 5 days/week if weeks specified
    if (weeks > 0) return weeks * 5 * 8 * 60
    if (days > 0) return days * 8 * 60
    return hours * 60
  })()

  const overtimeMinutes = totalMinutes > expectedMinutes ? totalMinutes - expectedMinutes : 0
  const overtimeHours = Math.floor(overtimeMinutes / 60)
  const overtimeMins = overtimeMinutes % 60

  const formatTotalTime = () => {
    if (totalMinutes === 0) return '0hr'
    if (remainingMins === 0) return `${totalHours}hr`
    return `${totalHours}h${remainingMins}m`
  }

  const formatOvertimeTime = () => {
    if (overtimeMinutes === 0) return null
    if (overtimeMins === 0) return `+${overtimeHours}hr`
    return `+${overtimeHours}h${overtimeMins}m`
  }

  const overtime = formatOvertimeTime()

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1vh 2vw',
        background: THEME.BG_DARK
        // No borderBottom - grey line removed
      }}
    >
      {/* ROW 1: ACTIVE COURSE (left) | Total + Overtime (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Active Course */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
          <span
            style={{
              fontSize: '2.04vh',
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
              fontSize: '2.04vh',
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

        {/* Total Hours + Overtime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
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
          {/* Overtime display (RED) */}
          {overtime && (
            <span
              style={{
                fontSize: '1.4vh',
                color: '#FF4444',
                fontFamily: THEME.FONT_MONO,
                fontWeight: 600
              }}
            >
              {overtime}
            </span>
          )}
        </div>
      </div>

      {/* ROW 2: ACTIVE LESSON (left) | Tab Buttons (center) */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5vh' }}>
        {/* Active Lesson - left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', flex: 1 }}>
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
              color: THEME.GREEN_BRIGHT,
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 500,
              textTransform: 'uppercase'
            }}
          >
            {activeLessonTitle}
          </span>
        </div>

        {/* Tab Buttons - centered */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5vw' }}>
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={handleTabClick}
            />
          ))}
        </div>

        {/* Empty right side to balance layout */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  )
}

export default DesignNavBar
