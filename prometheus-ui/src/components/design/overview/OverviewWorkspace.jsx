/**
 * OverviewWorkspace - Main Container for OVERVIEW Tab
 *
 * Phase 2-6 Redesign: Timeline Planning Tool
 *
 * Layout:
 * - OverviewHeader: DESCRIPTION window only (simplified)
 * - PlanningCanvas: Timeline and NoteBlock planning area
 *
 * Features:
 * - Add/Remove floating Timelines
 * - Add/Remove floating NoteBlocks with 8-color palette
 * - UNALLOCATED lessons panel
 * - No grid - free-form planning visualization tool
 */

import { useCallback } from 'react'
import { THEME } from '../../../constants/theme'
import { useDesign } from '../../../contexts/DesignContext'
import OverviewHeader from './OverviewHeader'
import PlanningCanvas from './PlanningCanvas'

function OverviewWorkspace({ courseData, onLessonDeleteRequest }) {
  const {
    LESSON_TYPES,
    unscheduledLessons,
    unscheduleLesson,
    // Overview Planning State
    overviewPlanningState,
    addPlanningTimeline,
    removePlanningTimeline,
    updatePlanningTimeline,
    addPlanningNote,
    removePlanningNote,
    updatePlanningNote,
    updatePlanningColorLabel
  } = useDesign()

  // Handle description update
  const handleUpdateDescription = useCallback((newDesc) => {
    // This would update courseData.description via parent
    console.log('Update description:', newDesc)
  }, [])

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
      {/* DESCRIPTION Header - simplified */}
      <OverviewHeader
        courseData={courseData}
        onUpdateDescription={handleUpdateDescription}
      />

      {/* Planning Canvas with Timelines and Notes */}
      <PlanningCanvas
        courseData={courseData}
        timelines={overviewPlanningState?.timelines || []}
        notes={overviewPlanningState?.notes || []}
        colorLabels={overviewPlanningState?.colorLabels || {}}
        onAddTimeline={addPlanningTimeline}
        onRemoveTimeline={removePlanningTimeline}
        onUpdateTimeline={updatePlanningTimeline}
        onAddNote={addPlanningNote}
        onRemoveNote={removePlanningNote}
        onUpdateNote={updatePlanningNote}
        onUpdateColorLabel={updatePlanningColorLabel}
        lessonTypes={LESSON_TYPES}
        unscheduledLessons={unscheduledLessons}
        onUnscheduleLesson={unscheduleLesson}
      />
    </div>
  )
}

export default OverviewWorkspace
