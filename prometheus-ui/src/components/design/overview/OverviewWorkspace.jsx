/**
 * OverviewWorkspace - Main Container for OVERVIEW Tab
 *
 * Layout:
 * - OverviewHeader: Course info display (3 columns: Description | Add Course Element | Learning Objectives)
 * - OverviewCanvas: Sketching area with Learning Blocks
 * - Lesson Type Palette: Positioned at bottom of canvas (~10px above PKE)
 *
 * This is the first tab shown on the Design page for high-level
 * course planning before detailed timetable work.
 */

import { useCallback, useRef } from 'react'
import { THEME } from '../../../constants/theme'
import { useDesign } from '../../../contexts/DesignContext'
import OverviewHeader from './OverviewHeader'
import OverviewCanvas from './OverviewCanvas'
import { LINE_TYPES } from './CourseLine'

function OverviewWorkspace({ courseData, onLessonDeleteRequest }) {
  const {
    overviewBlocks,
    setOverviewBlocks,
    LESSON_TYPES,
    unscheduledLessons,
    unscheduleLesson
  } = useDesign()

  // Ref to canvas for positioning
  const canvasContainerRef = useRef(null)

  // Handle adding a new block
  const handleBlockAdd = (newBlock) => {
    setOverviewBlocks(prev => [...prev, newBlock])
  }

  // Handle adding course element from header (TERM, MODULE, WEEK, DAY)
  const handleAddCourseElement = useCallback((type) => {
    const lineConfig = LINE_TYPES[type]
    if (!lineConfig) return

    // Estimate canvas dimensions (or use defaults)
    const canvasWidth = canvasContainerRef.current?.offsetWidth || 800
    const canvasHeight = canvasContainerRef.current?.offsetHeight || 400

    const newLine = {
      id: `line-${Date.now()}`,
      type,
      title: '',
      x: canvasWidth / 2 - (lineConfig.startDuration * lineConfig.pixelsPerUnit) / 2,
      y: canvasHeight / 2 - 20,
      width: lineConfig.startDuration * lineConfig.pixelsPerUnit,
      duration: lineConfig.startDuration,
      isCommitted: false,
      parentId: null,
      nestingDepth: 0,
      isLine: true
    }
    setOverviewBlocks(prev => [...prev, newLine])
  }, [setOverviewBlocks])

  // Handle removing a block
  const handleBlockRemove = (blockId) => {
    setOverviewBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  // Handle updating a block
  const handleBlockUpdate = (blockId, updates) => {
    setOverviewBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, ...updates } : b
    ))
  }

  // Handle description update
  const handleUpdateDescription = (newDesc) => {
    // This would update courseData.description via parent
    console.log('Update description:', newDesc)
  }

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
      {/* Course Info Header - 3 columns: Description | Add Course Element | Learning Objectives */}
      <OverviewHeader
        courseData={courseData}
        onUpdateDescription={handleUpdateDescription}
        onAddBlock={handleAddCourseElement}
      />

      {/* Sketching Canvas (with ref for positioning) */}
      <div ref={canvasContainerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OverviewCanvas
        blocks={overviewBlocks}
        onBlockAdd={handleBlockAdd}
        onBlockRemove={handleBlockRemove}
        onBlockUpdate={handleBlockUpdate}
        onLessonDeleteRequest={onLessonDeleteRequest}
        lessonTypes={LESSON_TYPES}
        unscheduledLessons={unscheduledLessons}
        onUnscheduleLesson={unscheduleLesson}
      />
      </div>
    </div>
  )
}

export default OverviewWorkspace
