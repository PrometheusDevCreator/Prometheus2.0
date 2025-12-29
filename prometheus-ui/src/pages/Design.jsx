/**
 * Design.jsx - Main DESIGN Section Container
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 1
 *
 * This is the new unified DESIGN page that replaces the previous
 * OutlinePlanner.jsx and Scalar.jsx split implementation.
 *
 * Structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ NAVIGATION BAR (DesignNavBar)                               │
 * ├──────────────────┬──────────────────────────────────────────┤
 * │ LESSON EDITOR    │ WORKSPACE                                │
 * │ (LessonEditor)   │ - TimetableWorkspace (Phase 2)           │
 * │                  │ - ScalarWorkspace (Phase 5)              │
 * ├──────────────────┴──────────────────────────────────────────┤
 * │ PKE INTERFACE (Footer component)                            │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Phase 1 Deliverable:
 * - Basic layout renders
 * - Tabs switch between TIMETABLE and SCALAR views
 * - Editor panel visible and collapsible
 * - Context provider established
 */

import { useCallback } from 'react'
import { THEME } from '../constants/theme'
import { DesignProvider, useDesign } from '../contexts/DesignContext'
import DesignNavBar from '../components/design/DesignNavBar'
import LessonEditor from '../components/design/LessonEditor'
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
  courseLoaded,
  user,
  courseState
}) {
  return (
    <DesignProvider courseData={courseData} setCourseData={setCourseData}>
      <DesignPageContent
        onNavigate={onNavigate}
        courseLoaded={courseLoaded}
        user={user}
        courseState={courseState}
      />
    </DesignProvider>
  )
}

// ============================================
// PAGE CONTENT (inside provider)
// ============================================

function DesignPageContent({ onNavigate, courseLoaded, user, courseState }) {
  const { activeTab, editorCollapsed, courseData } = useDesign()

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
        {/* Lesson Editor Panel (Left) - renders collapsed tab or expanded panel */}
        <LessonEditor />

        {/* Workspace Area (fills remaining space) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            marginLeft: editorCollapsed ? '24px' : '0' // Account for collapsed tab width
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
      />
    </div>
  )
}

export default Design
