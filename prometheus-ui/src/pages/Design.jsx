/**
 * Design.jsx - Main DESIGN Section Container
 *
 * Phase 2-6: Calm Wheel Design/Build Integration
 *
 * Structure (Redesigned):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ NAVIGATION BAR (DesignNavBar) with integrated Tab Selector  │
 * │  Row 1: ACTIVE COURSE (left) | Total + Overtime (right)     │
 * │  Row 2: ACTIVE LESSON (left) | [OVERVIEW][TIMETABLE][SCALAR]│
 * ├─────────────────────────────────────────────────────────────┤
 * │  WORKSPACE (full width)                                     │
 * │  - OverviewWorkspace                                        │
 * │  - TimetableWorkspace                                       │
 * │  - ScalarDock                                               │
 * ├─────────────────────────────────────────────────────────────┤
 * │ FOOTER (with global Lesson Editor modal access)             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Note: WheelNav and WorkDock removed per design revamp.
 * Tab buttons at same Y position as ACTIVE LESSON (no grey lines).
 * Lesson Editor is a global modal accessible from Footer.
 */

import { useCallback, useEffect } from 'react'
import { THEME } from '../constants/theme'
import { DesignProvider, useDesign } from '../contexts/DesignContext'
import DesignNavBar from '../components/design/DesignNavBar'
import OverviewWorkspace from '../components/design/overview/OverviewWorkspace'
import TimetableWorkspace from '../components/design/TimetableWorkspace'
import ScalarDock from '../components/design/ScalarDock'
import Footer from '../components/Footer'

// ============================================
// MAIN DESIGN PAGE COMPONENT
// ============================================

function Design({
  onNavigate,
  courseData,
  setCourseData,
  timetableData,
  setTimetableData,
  courseLoaded,
  user,
  courseState,
  exitPending,
  lessonEditorOpen,
  onLessonEditorToggle,
  onSelectedLessonChange  // Callback to report selected lesson to App
}) {
  return (
    <DesignProvider
      courseData={courseData}
      setCourseData={setCourseData}
      timetableData={timetableData}
      setTimetableData={setTimetableData}
    >
      <DesignPageContent
        onNavigate={onNavigate}
        courseLoaded={courseLoaded}
        user={user}
        courseState={courseState}
        courseData={courseData}
        timetableData={timetableData}
        lessonEditorOpen={lessonEditorOpen}
        onLessonEditorToggle={onLessonEditorToggle}
        onSelectedLessonChange={onSelectedLessonChange}
      />
    </DesignProvider>
  )
}

// ============================================
// PAGE CONTENT (inside provider)
// ============================================

function DesignPageContent({ onNavigate, courseLoaded, user, courseState, courseData, timetableData, lessonEditorOpen, onLessonEditorToggle, onSelectedLessonChange }) {
  const {
    activeTab,
    selection,
    select,
    clearDesignState
  } = useDesign()

  // Handle opening Lesson Editor for a specific lesson
  const handleOpenLessonEditor = useCallback((lessonId) => {
    select('lesson', lessonId)
    onLessonEditorToggle?.()
  }, [select, onLessonEditorToggle])

  // Report selected lesson changes to parent (App.jsx)
  useEffect(() => {
    if (selection.type === 'lesson' && selection.id) {
      onSelectedLessonChange?.(selection.id)
    } else {
      onSelectedLessonChange?.(null)
    }
  }, [selection.type, selection.id, onSelectedLessonChange])

  // Handle navigation to other pages
  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_DARK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Navigation Bar with integrated Tab Selector */}
      <DesignNavBar />

      {/* Main Working Area - Full Width (WheelNav and WorkDock removed) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Workspace Content - switches based on active tab */}
        {activeTab === 'overview' && (
          <OverviewWorkspace courseData={courseData} />
        )}

        {activeTab === 'timetable' && (
          <TimetableWorkspace onOpenLessonEditor={handleOpenLessonEditor} />
        )}

        {activeTab === 'scalar' && (
          <ScalarDock />
        )}
      </div>

      {/* Footer with PKE Interface */}
      <Footer
        currentSection="design"
        onNavigate={handleNavigate}
        isPKEActive={false}
        onPKEToggle={() => {}}
        onSave={() => console.log('Save clicked')}
        onClear={clearDesignState}
        onDelete={() => console.log('Delete clicked')}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={0}
        courseData={courseData}
        timetableData={timetableData}
        lessonEditorOpen={lessonEditorOpen}
        onLessonEditorToggle={onLessonEditorToggle}
      />
    </div>
  )
}

export default Design
