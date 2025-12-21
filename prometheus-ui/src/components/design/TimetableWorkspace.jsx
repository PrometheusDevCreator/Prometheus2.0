/**
 * TimetableWorkspace.jsx - Complete Timetable Tab Content
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 2 & 4
 *
 * Combines:
 * - TimeControls: Time range slider, course hours, day indicator
 * - TimetableGrid: Day rows with lesson blocks
 * - LessonLibrary: Unscheduled/Saved tabs with context menu
 *
 * Bidirectional Sync:
 * - Clicking block selects it and updates Editor
 * - Editing in Editor updates block in real-time
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import TimeControls from './TimeControls'
import TimetableGrid from './TimetableGrid'
import LessonLibrary from './LessonLibrary'

function TimetableWorkspace() {
  const { viewMode } = useDesign()

  // Time range state (shared with TimeControls and TimetableGrid)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(17)

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: THEME.BG_DARK
      }}
    >
      {/* Time Controls Row */}
      <TimeControls
        startHour={startHour}
        endHour={endHour}
        onStartChange={setStartHour}
        onEndChange={setEndHour}
      />

      {/* Timetable Grid */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimetableGrid
          startHour={startHour}
          endHour={endHour}
        />
      </div>

      {/* Lesson Library */}
      <LessonLibrary />
    </div>
  )
}

export default TimetableWorkspace
