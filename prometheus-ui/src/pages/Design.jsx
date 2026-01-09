/**
 * Design.jsx - Main DESIGN Section Container
 *
 * Structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ NAVIGATION BAR (DesignNavBar)                               │
 * ├─────────────────────────────────────────────────────────────┤
 * │ WORKSPACE                                                   │
 * │ - OverviewWorkspace                                         │
 * │ - TimetableWorkspace                                        │
 * │ - ScalarWorkspace                                           │
 * ├─────────────────────────────────────────────────────────────┤
 * │ FOOTER (with global Lesson Editor modal access)             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Note: Lesson Editor is now a global modal accessible from Footer
 * on all pages, not a page-specific component.
 */

import { useCallback, useEffect } from 'react'
import { THEME } from '../constants/theme'
import { DesignProvider, useDesign } from '../contexts/DesignContext'
import DesignNavBar from '../components/design/DesignNavBar'
import OverviewWorkspace from '../components/design/overview/OverviewWorkspace'
import TimetableWorkspace from '../components/design/TimetableWorkspace'
import ScalarWorkspace from '../components/design/ScalarWorkspace'
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
  const { activeTab, courseData: contextCourseData, selection } = useDesign()

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
      {/* Navigation Bar */}
      <DesignNavBar />

      {/* Main Working Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Workspace Area (fills remaining space) */}
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
            <TimetableWorkspace />
          )}
          {activeTab === 'scalar' && (
            <ScalarWorkspace />
          )}
        </div>
      </div>

      {/* Footer with PKE Interface */}
      <Footer
        currentSection="design"
        onNavigate={handleNavigate}
        isPKEActive={false}
        onPKEToggle={() => {}}
        onSave={() => console.log('Save clicked')}
        onClear={() => console.log('Clear clicked')}
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
