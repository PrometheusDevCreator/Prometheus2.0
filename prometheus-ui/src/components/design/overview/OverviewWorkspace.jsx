/**
 * OverviewWorkspace - Main Container for OVERVIEW Tab
 *
 * Layout:
 * - OverviewHeader: Course info display
 * - OverviewCanvas: Sketching area with Learning Blocks
 *
 * This is the first tab shown on the Design page for high-level
 * course planning before detailed timetable work.
 */

import { THEME } from '../../../constants/theme'
import { useDesign } from '../../../contexts/DesignContext'
import OverviewHeader from './OverviewHeader'
import OverviewCanvas from './OverviewCanvas'

function OverviewWorkspace({ courseData }) {
  const {
    overviewBlocks,
    setOverviewBlocks
  } = useDesign()

  // Handle adding a new block
  const handleBlockAdd = (newBlock) => {
    setOverviewBlocks(prev => [...prev, newBlock])
  }

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
      {/* Course Info Header */}
      <OverviewHeader
        courseData={courseData}
        onUpdateDescription={handleUpdateDescription}
      />

      {/* Sketching Canvas */}
      <OverviewCanvas
        blocks={overviewBlocks}
        onBlockAdd={handleBlockAdd}
        onBlockRemove={handleBlockRemove}
        onBlockUpdate={handleBlockUpdate}
      />
    </div>
  )
}

export default OverviewWorkspace
