/**
 * Design.jsx - Main DESIGN Section Container
 *
 * Phase 4: Calm Wheel Integration
 *
 * Structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ NAVIGATION BAR (DesignNavBar)                               │
 * ├────────────┬────────────────────────────────────────────────┤
 * │            │  WORKSPACE                                     │
 * │  WHEELNAV  │  - OverviewWorkspace                           │
 * │   (LEFT)   │  - TimetableWorkspace / WorkDock               │
 * │  20-25%    │  - ScalarDock (replaces ScalarWorkspace)       │
 * │ collapsible│                                                │
 * ├────────────┴────────────────────────────────────────────────┤
 * │ FOOTER (with global Lesson Editor modal access)             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Note: Lesson Editor is now a global modal accessible from Footer
 * on all pages, not a page-specific component.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { THEME } from '../constants/theme'
import { DesignProvider, useDesign } from '../contexts/DesignContext'
import { CANONICAL_FLAGS } from '../utils/canonicalAdapter'
import DesignNavBar from '../components/design/DesignNavBar'
import OverviewWorkspace from '../components/design/overview/OverviewWorkspace'
import TimetableWorkspace from '../components/design/TimetableWorkspace'
import ScalarWorkspace from '../components/design/ScalarWorkspace'
import ScalarDock from '../components/design/ScalarDock'
import WorkDock from '../components/design/WorkDock'
import WheelNav, { HIERARCHY_LEVELS } from '../components/WheelNav'
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
    courseData: contextCourseData,
    selection,
    // Hierarchy navigation (Phase 4)
    hierarchyNav,
    navigateDown,
    navigateUp,
    navigateToLevel,
    wheelNavCollapsed,
    toggleWheelNav,
    select,
    // Canonical data for WheelNav items
    canonicalData,
    scalarData,
    currentModule,
    lessons,
    getCanonicalTopicSerial,
    getCanonicalSubtopicSerial
  } = useDesign()

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

  // Build WheelNav items based on current hierarchy level
  const wheelNavItems = useMemo(() => {
    const { currentLevel, filterId } = hierarchyNav
    const { los, topics, subtopics } = canonicalData

    switch (currentLevel) {
      case 0: // Module level
        return [{ id: 'module-1', label: 'Module 1', serial: '1', hasChildren: true }]

      case 1: // LO level
        return Object.values(los)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(lo => ({
            id: lo.id,
            label: lo.description || lo.text || `LO ${lo.order}`,
            serial: String(lo.order),
            hasChildren: Object.values(topics).some(t => t.loId === lo.id)
          }))

      case 2: // Topic level
        return Object.values(topics)
          .filter(t => !filterId || t.loId === filterId || !t.loId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(topic => ({
            id: topic.id,
            label: topic.title || 'Untitled Topic',
            serial: getCanonicalTopicSerial(topic.id),
            hasChildren: Object.values(subtopics).some(s => s.topicId === topic.id)
          }))

      case 3: // Subtopic level
        return Object.values(subtopics)
          .filter(s => !filterId || s.topicId === filterId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(subtopic => ({
            id: subtopic.id,
            label: subtopic.title || 'Untitled Subtopic',
            serial: getCanonicalSubtopicSerial(subtopic.id),
            hasChildren: false // Lessons don't nest further
          }))

      case 4: // Lesson level
        return lessons
          .filter(l => !filterId || l.topics?.some(t => t.subtopics?.some(s => s.id === filterId)))
          .map(lesson => ({
            id: lesson.id,
            label: lesson.title || 'Untitled Lesson',
            serial: null,
            hasChildren: false
          }))

      default:
        return []
    }
  }, [hierarchyNav, canonicalData, lessons, getCanonicalTopicSerial, getCanonicalSubtopicSerial])

  // Selected item in WheelNav
  const wheelNavSelectedId = useMemo(() => {
    // Map selection type to hierarchy level and check if it matches
    const levelMap = { module: 0, lo: 1, topic: 2, subtopic: 3, lesson: 4 }
    const selectionLevel = levelMap[selection.type]

    if (selectionLevel === hierarchyNav.currentLevel) {
      return selection.id
    }
    return null
  }, [selection, hierarchyNav.currentLevel])

  // WheelNav handlers
  const handleWheelSelect = useCallback((id) => {
    const levelTypes = ['module', 'lo', 'topic', 'subtopic', 'lesson']
    const type = levelTypes[hierarchyNav.currentLevel]
    select(type, id)
  }, [hierarchyNav.currentLevel, select])

  const handleWheelNavigateDown = useCallback((id) => {
    navigateDown(id)
  }, [navigateDown])

  const handleWheelNavigateUp = useCallback(() => {
    navigateUp()
  }, [navigateUp])

  const handleBreadcrumbClick = useCallback((index) => {
    navigateToLevel(index)
  }, [navigateToLevel])

  // Width calculations
  const wheelNavWidth = wheelNavCollapsed ? 40 : '22%'

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
        {/* WheelNav - Left Panel (Phase 4) */}
        {CANONICAL_FLAGS.WHEEL_NAV_ENABLED && (
          <div
            style={{
              width: wheelNavWidth,
              minWidth: wheelNavCollapsed ? 40 : 200,
              maxWidth: wheelNavCollapsed ? 40 : 400,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: THEME.BG_PANEL,
              borderRight: `1px solid ${THEME.BORDER}`,
              transition: 'width 0.2s ease',
              overflow: 'hidden'
            }}
          >
            {/* Collapse Toggle */}
            <button
              onClick={toggleWheelNav}
              style={{
                position: 'absolute',
                top: '50%',
                right: wheelNavCollapsed ? -12 : -12,
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 24,
                height: 48,
                background: THEME.BG_PANEL,
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: THEME.TEXT_DIM
              }}
              title={wheelNavCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {wheelNavCollapsed ? '▶' : '◀'}
            </button>

            {!wheelNavCollapsed && (
              <WheelNav
                currentLevel={hierarchyNav.currentLevel}
                currentPath={hierarchyNav.path}
                items={wheelNavItems}
                selectedItemId={wheelNavSelectedId}
                onSelectItem={handleWheelSelect}
                onNavigateUp={handleWheelNavigateUp}
                onNavigateDown={handleWheelNavigateDown}
                onNavigateToLevel={navigateToLevel}
                onBreadcrumbClick={handleBreadcrumbClick}
                showBreadcrumbs={true}
                showLevelIndicator={true}
                showItemCount={true}
                compact={false}
              />
            )}
          </div>
        )}

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
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <TimetableWorkspace />
              {/* WorkDock - Progressive replacement (Phase 4) */}
              {CANONICAL_FLAGS.WORK_DOCK_ENABLED && CANONICAL_FLAGS.WORK_DOCK_PROGRESSIVE && (
                <WorkDock width="30%" />
              )}
            </div>
          )}

          {activeTab === 'scalar' && (
            // ScalarDock replaces ScalarWorkspace when enabled (Phase 4)
            CANONICAL_FLAGS.SCALAR_DOCK_ENABLED
              ? <ScalarDock />
              : <ScalarWorkspace />
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
