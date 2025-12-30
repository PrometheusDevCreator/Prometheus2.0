/**
 * Build Page - Lesson-Level Content Authoring Workspace
 *
 * Features:
 * - Module/Lesson/Topic selection cascade
 * - Slide type selection (6 types per Correction #2)
 * - 5 content columns (3 primary + 2 optional)
 * - Slide navigation with explicit creation (Correction #1)
 * - Instructor Notes field (Correction #7)
 * - Progress indicator (Correction #6)
 * - Bidirectional sync with DESIGN page
 *
 * Per approved plan: Uses DesignContext for shared state
 */

import { useCallback, useMemo } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'
import { DesignProvider, useDesign } from '../contexts/DesignContext'

// Build components
import BuildSelectorBar from '../components/build/BuildSelectorBar'
import BuildSlideTypeBar from '../components/build/BuildSlideTypeBar'
import BuildSlideNav from '../components/build/BuildSlideNav'
import BuildContentColumns from '../components/build/BuildContentColumns'
import BuildProgressBar from '../components/build/BuildProgressBar'

/**
 * Build page inner content (must be inside DesignProvider)
 */
function BuildContent({ onNavigate, user, courseState, exitPending }) {
  const { lessons, buildSelection, calculateLessonProgress } = useDesign()

  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  // Get current lesson for progress
  const currentLesson = useMemo(() => {
    return lessons.find(l => l.id === buildSelection.lessonId)
  }, [lessons, buildSelection.lessonId])

  // Calculate progress for Footer
  const progress = useMemo(() => {
    return currentLesson ? calculateLessonProgress(currentLesson) : 0
  }, [currentLesson, calculateLessonProgress])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_DARK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Selector Bar - Module/Lesson/Topic dropdowns + LO summary */}
      <BuildSelectorBar />

      {/* Slide Type Bar */}
      <BuildSlideTypeBar />

      {/* Slide Navigation */}
      <BuildSlideNav />

      {/* Main Content Area - 5 Columns */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        <BuildContentColumns />
      </div>

      {/* Progress Bar */}
      <BuildProgressBar />

      {/* Footer */}
      <Footer
        currentSection="build"
        onNavigate={handleNavigate}
        isPKEActive={false}
        onPKEToggle={() => {}}
        onSave={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={progress}
        exitPending={exitPending}
      />
    </div>
  )
}

/**
 * Build Page - Wrapped with DesignProvider for shared state
 */
function Build({ onNavigate, courseData, setCourseData, courseLoaded, user, courseState, exitPending }) {
  return (
    <DesignProvider courseData={courseData} setCourseData={setCourseData}>
      <BuildContent
        onNavigate={onNavigate}
        user={user}
        courseState={courseState}
        exitPending={exitPending}
      />
    </DesignProvider>
  )
}

export default Build
