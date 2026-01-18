/**
 * OverviewCanvas - Sketching Canvas for OVERVIEW Tab
 *
 * Features:
 * - Full canvas for drag-and-drop Learning Blocks
 * - Grid background for alignment
 * - Block creation toolbar
 * - Click to deselect, click block to select
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import { THEME } from '../../../constants/theme'
import { LESSON_TYPES } from '../../../contexts/DesignContext'
import LearningBlock, { BLOCK_TYPES, NESTING_RULES } from './LearningBlock'
import CourseLine, { LINE_TYPES, LINE_NESTING } from './CourseLine'
import CourseElementBar, { CourseElementModal, BAR_TYPES } from './CourseElementBar'
import OverviewLessonCard from './OverviewLessonCard'
import LessonMarker, { MARKER_WIDTH, MARKER_HEIGHT } from './LessonMarker'
import UnallocatedLessonsPanel from '../UnallocatedLessonsPanel'

// Helper: Get parent chain for a block (returns array of parent IDs)
const getParentChain = (blockId, blocks) => {
  const chain = []
  let current = blocks.find(b => b.id === blockId)
  while (current?.parentId) {
    const parent = blocks.find(b => b.id === current.parentId)
    if (parent) {
      chain.push(parent.id)
      current = parent
    } else break
  }
  return chain
}

// Helper: Get all descendants of a block (children, grandchildren, etc.)
const getDescendants = (blockId, blocks) => {
  const descendants = []
  const children = blocks.filter(b => b.parentId === blockId)
  children.forEach(child => {
    descendants.push(child)
    descendants.push(...getDescendants(child.id, blocks))
  })
  return descendants
}

// Helper: Calculate scaled width for a block based on its parent's scale
const calculateScaledWidth = (block, parentBlock) => {
  const blockConfig = BLOCK_TYPES[block.type]
  const parentConfig = BLOCK_TYPES[parentBlock.type]

  // Convert block's duration to hours
  const durationInHours = (block.duration || blockConfig.startDuration) *
    (blockConfig.unit === 'minute' ? 1/60 :
     blockConfig.unit === 'hour' ? 1 :
     blockConfig.unit === 'day' ? 24 : 168)

  // Parent's hours per pixel
  const parentHoursPerPixel = (parentConfig.unit === 'minute' ? 1/60 :
     parentConfig.unit === 'hour' ? 1 :
     parentConfig.unit === 'day' ? 24 : 168) / parentConfig.pixelsPerUnit

  return Math.max(blockConfig.minWidth, durationInHours / parentHoursPerPixel)
}

// Helper: Check if a block is inside another block's bounds
const isBlockInsideParent = (childBlock, parentBlock) => {
  return (
    childBlock.x >= parentBlock.x &&
    childBlock.y >= parentBlock.y &&
    childBlock.x + (childBlock.width || 100) <= parentBlock.x + (parentBlock.width || 200) &&
    childBlock.y + (childBlock.height || 60) <= parentBlock.y + (parentBlock.height || 80)
  )
}

// Helper: Find valid parent for a block being dropped
const findValidParent = (droppedBlock, allBlocks, draggedBlockId) => {
  const rules = NESTING_RULES[droppedBlock.type]
  if (!rules || rules.canBeContainedBy.length === 0) return null

  // Find all potential parents (blocks that can contain this type and overlap position)
  const potentialParents = allBlocks.filter(parent => {
    if (parent.id === draggedBlockId) return false
    const parentRules = NESTING_RULES[parent.type]
    return parentRules?.canContain.includes(droppedBlock.type) &&
           isBlockInsideParent(droppedBlock, parent)
  })

  // Return the smallest (most nested) valid parent
  if (potentialParents.length === 0) return null
  return potentialParents.reduce((smallest, current) => {
    const smallestArea = (smallest.width || 200) * (smallest.height || 80)
    const currentArea = (current.width || 200) * (current.height || 80)
    return currentArea < smallestArea ? current : smallest
  })
}

// Helper: Check if a line is within vertical proximity of another (for stacking)
const isLineNearParent = (childLine, parentLine) => {
  if (!childLine || !parentLine) return false
  // Check if child's Y position is within 60px below parent
  const parentBottom = parentLine.y + 40  // Parent line height area
  const childTop = childLine.y
  return childTop >= parentBottom && childTop <= parentBottom + 60
}

// Helper: Check if child line's X is within parent's X range
const isLineWithinParentX = (childLine, parentLine) => {
  if (!childLine || !parentLine) return false
  const childLeft = childLine.x
  const childRight = childLine.x + (childLine.width || 200)
  const parentLeft = parentLine.x
  const parentRight = parentLine.x + (parentLine.width || 400)
  // Child must be mostly within parent's X bounds
  return childLeft >= parentLeft - 20 && childRight <= parentRight + 20
}

// Helper: Find valid parent for a line being dragged
const findValidLineParent = (draggedLine, allLines) => {
  if (!draggedLine || !draggedLine.isLine) return null

  const nestingRules = LINE_NESTING[draggedLine.type]
  if (!nestingRules || nestingRules.canBeContainedBy.length === 0) return null

  // Find potential parents that can contain this type
  const potentialParents = allLines.filter(line => {
    if (!line.isLine || line.id === draggedLine.id) return false
    const parentRules = LINE_NESTING[line.type]
    if (!parentRules?.canContain.includes(draggedLine.type)) return false
    // Check proximity
    return isLineNearParent(draggedLine, line) && isLineWithinParentX(draggedLine, line)
  })

  // Return the closest parent (by Y position)
  if (potentialParents.length === 0) return null
  return potentialParents.reduce((closest, current) => {
    const closestDist = Math.abs((closest.y + 40) - draggedLine.y)
    const currentDist = Math.abs((current.y + 40) - draggedLine.y)
    return currentDist < closestDist ? current : closest
  })
}

// Helper: Check if a lesson card is near a line (for marker conversion)
const isLessonNearLine = (lesson, line) => {
  if (!lesson || !line || !line.isLine) return false
  // Check if lesson's Y is within line's Y range (+/- 40px)
  const lineTop = line.y
  const lineBottom = line.y + 40
  const lessonCenterY = lesson.y + 35  // Approximate center of lesson card
  return lessonCenterY >= lineTop - 20 && lessonCenterY <= lineBottom + 20
}

// Helper: Check if lesson's X is within line's X range
const isLessonWithinLineX = (lesson, line) => {
  if (!lesson || !line) return false
  const lessonCenterX = lesson.x + 90  // Approximate center of lesson card
  return lessonCenterX >= line.x && lessonCenterX <= line.x + (line.width || 400)
}

// Helper: Find valid parent line for a lesson being dragged
const findValidLineForLesson = (lesson, allItems) => {
  if (!lesson || lesson.isLine) return null

  // Find lines that can contain lessons
  const validLines = allItems.filter(item => {
    if (!item.isLine || item.id === lesson.id) return false
    // DAY and MODULE can contain lessons
    const parentRules = LINE_NESTING[item.type]
    // Check if this line type can contain items (DAY, MODULE conceptually can hold lessons)
    if (item.type !== 'DAY' && item.type !== 'MODULE') return false
    // Check proximity
    return isLessonNearLine(lesson, item) && isLessonWithinLineX(lesson, item)
  })

  if (validLines.length === 0) return null
  // Return the closest line by Y distance
  return validLines.reduce((closest, current) => {
    const closestDist = Math.abs(closest.y - lesson.y)
    const currentDist = Math.abs(current.y - lesson.y)
    return currentDist < closestDist ? current : closest
  })
}

function OverviewCanvas({
  blocks = [],
  onBlocksChange,
  onBlockAdd,
  onBlockRemove,
  onBlockUpdate,
  onLessonDeleteRequest,  // Item 13: Callback to trigger PKE delete warning
  lessonTypes = [],       // Item 18: For UnallocatedLessonsPanel
  unscheduledLessons = [],// Item 18: For UnallocatedLessonsPanel
  onUnscheduleLesson      // Item 18: For UnallocatedLessonsPanel
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [draggingBlockId, setDraggingBlockId] = useState(null)
  const [potentialParentId, setPotentialParentId] = useState(null)  // For stacking feedback
  const [potentialLessonLineId, setPotentialLessonLineId] = useState(null)  // For lesson->marker conversion
  const canvasRef = useRef(null)

  // Phase 5: Modal state for CourseElementBar info editing
  const [modalOpen, setModalOpen] = useState(false)
  const [modalElementId, setModalElementId] = useState(null)
  const [modalElementType, setModalElementType] = useState(null)
  const [modalElementData, setModalElementData] = useState(null)

  // Calculate parent chain for selected block
  const activeParentChain = useMemo(() => {
    if (!selectedBlockId) return []
    return getParentChain(selectedBlockId, blocks)
  }, [selectedBlockId, blocks])

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedBlockId(null)
  }, [])

  // Handle block selection
  const handleBlockSelect = useCallback((id) => {
    setSelectedBlockId(id)
  }, [])

  // Handle block position change during drag - also move all descendants
  const handlePositionChange = useCallback((id, x, y) => {
    const draggedBlock = blocks.find(b => b.id === id)
    if (!draggedBlock) {
      onBlockUpdate?.(id, { x, y })
      return
    }

    // Calculate the delta movement
    const deltaX = x - draggedBlock.x
    const deltaY = y - draggedBlock.y

    // Update the dragged block
    onBlockUpdate?.(id, { x, y })

    // Also move all descendants by the same delta
    const descendants = getDescendants(id, blocks)
    descendants.forEach(descendant => {
      onBlockUpdate?.(descendant.id, {
        x: descendant.x + deltaX,
        y: descendant.y + deltaY
      })
    })

    // Check for potential parent during line drag (stacking feedback)
    if (draggedBlock.isLine) {
      const updatedLine = { ...draggedBlock, x, y }
      const potentialParent = findValidLineParent(updatedLine, blocks)
      setPotentialParentId(potentialParent?.id || null)
    }

    // Check for potential parent line during lesson drag (Item 10: marker conversion)
    if (draggedBlock.type === 'LESSON' && !draggedBlock.isLine && !draggedBlock.isMarker) {
      const updatedLesson = { ...draggedBlock, x, y }
      const potentialLine = findValidLineForLesson(updatedLesson, blocks)
      setPotentialLessonLineId(potentialLine?.id || null)
    }
  }, [blocks, onBlockUpdate])

  // Handle drag start
  const handleDragStart = useCallback((id) => {
    setDraggingBlockId(id)
  }, [])

  // Handle drag end - check for nesting/unnesting (cascades to all descendants)
  const handleDragEnd = useCallback((id) => {
    setDraggingBlockId(null)

    // Find the block that was dragged
    const draggedBlock = blocks.find(b => b.id === id)
    if (!draggedBlock) return

    // Handle line stacking (Item 7.VI)
    if (draggedBlock.isLine && potentialParentId) {
      const parentLine = blocks.find(b => b.id === potentialParentId)
      if (parentLine) {
        // Attach line to parent
        const newNestingDepth = (parentLine.nestingDepth || 0) + 1
        onBlockUpdate?.(id, {
          parentId: potentialParentId,
          nestingDepth: newNestingDepth,
          isNested: true,
          isCommitted: true  // Auto-commit when stacked
        })
      }
      setPotentialParentId(null)
      return
    }

    // Clear potential parent state
    setPotentialParentId(null)
    setPotentialLessonLineId(null)

    // Handle lesson -> marker conversion when dropped on a line (Item 10)
    if (draggedBlock.type === 'LESSON' && !draggedBlock.isLine && !draggedBlock.isMarker && potentialLessonLineId) {
      const parentLine = blocks.find(b => b.id === potentialLessonLineId)
      if (parentLine) {
        // Convert lesson card to marker
        // Calculate marker X position relative to line
        const markerX = Math.max(parentLine.x, Math.min(
          draggedBlock.x,
          parentLine.x + (parentLine.width || 400) - MARKER_WIDTH
        ))
        const markerY = parentLine.y + 5  // Position marker on the line

        onBlockUpdate?.(id, {
          isMarker: true,
          parentLineId: potentialLessonLineId,
          x: markerX,
          y: markerY,
          isCommitted: true
        })
        return
      }
    }

    // Get all descendants that will also need updating
    const descendants = getDescendants(id, blocks)

    // Find valid parent at current position (exclude self and descendants)
    const excludeIds = [id, ...descendants.map(d => d.id)]
    const newParent = findValidParent(draggedBlock, blocks.filter(b => !excludeIds.includes(b.id)), id)

    // Check if block was previously nested
    const wasNested = !!draggedBlock.parentId

    // If dropped inside a valid parent
    if (newParent && newParent.id !== draggedBlock.parentId) {
      // Calculate new nesting depth for the dragged block
      const newNestingDepth = (newParent.nestingDepth || 0) + 1

      // Scale block width to parent's scale
      const scaledWidth = calculateScaledWidth(draggedBlock, newParent)

      // Update the dragged block
      onBlockUpdate?.(id, {
        parentId: newParent.id,
        nestingDepth: newNestingDepth,
        width: scaledWidth
      })

      // Recursively update all descendants
      // Each descendant's nesting depth increases by the delta
      const depthDelta = newNestingDepth - (draggedBlock.nestingDepth || 0)

      descendants.forEach(descendant => {
        const newDescendantDepth = (descendant.nestingDepth || 0) + depthDelta

        // Find the descendant's direct parent to calculate proper scale
        const descendantParent = blocks.find(b => b.id === descendant.parentId)
        if (descendantParent) {
          // Rescale based on the updated parent (which is in the new hierarchy)
          const descendantScaledWidth = calculateScaledWidth(descendant, descendantParent)
          onBlockUpdate?.(descendant.id, {
            nestingDepth: newDescendantDepth,
            width: descendantScaledWidth
          })
        } else {
          onBlockUpdate?.(descendant.id, {
            nestingDepth: newDescendantDepth
          })
        }
      })
    }
    // If dragged out of parent (was nested, now not inside any valid parent)
    else if (wasNested && !newParent) {
      // Revert dragged block to default scale
      const blockConfig = BLOCK_TYPES[draggedBlock.type]
      const defaultWidth = (draggedBlock.duration || blockConfig.startDuration) * blockConfig.pixelsPerUnit

      onBlockUpdate?.(id, {
        parentId: null,
        nestingDepth: 0,
        width: defaultWidth
      })

      // Calculate depth delta for descendants
      const depthDelta = -(draggedBlock.nestingDepth || 0)

      // Revert all descendants' nesting depth and rescale
      descendants.forEach(descendant => {
        const newDescendantDepth = Math.max(0, (descendant.nestingDepth || 0) + depthDelta)

        // Find the descendant's direct parent to calculate proper scale
        const descendantParent = blocks.find(b => b.id === descendant.parentId)
        if (descendantParent) {
          const descendantScaledWidth = calculateScaledWidth(descendant, descendantParent)
          onBlockUpdate?.(descendant.id, {
            nestingDepth: newDescendantDepth,
            width: descendantScaledWidth
          })
        } else {
          // If no parent, revert to default scale
          const descConfig = BLOCK_TYPES[descendant.type]
          const descDefaultWidth = (descendant.duration || descConfig.startDuration) * descConfig.pixelsPerUnit
          onBlockUpdate?.(descendant.id, {
            nestingDepth: newDescendantDepth,
            width: descDefaultWidth
          })
        }
      })
    }
  }, [blocks, onBlockUpdate, potentialParentId, potentialLessonLineId])

  // Handle block resize
  const handleSizeChange = useCallback((id, width, height) => {
    onBlockUpdate?.(id, { width, height })
  }, [onBlockUpdate])

  // Handle block title change
  const handleTitleChange = useCallback((id, title) => {
    onBlockUpdate?.(id, { title })
  }, [onBlockUpdate])

  // Handle block duration change
  const handleDurationChange = useCallback((id, duration) => {
    onBlockUpdate?.(id, { duration })
  }, [onBlockUpdate])

  // Handle line width change
  const handleWidthChange = useCallback((id, width) => {
    onBlockUpdate?.(id, { width })
  }, [onBlockUpdate])

  // Handle line commit (when title is saved)
  const handleCommit = useCallback((id) => {
    onBlockUpdate?.(id, { isCommitted: true })
  }, [onBlockUpdate])

  // Handle lesson delete request (Item 13)
  const handleLessonDeleteRequest = useCallback((id) => {
    const lesson = blocks.find(b => b.id === id)
    if (lesson) {
      onLessonDeleteRequest?.(id, lesson.title || 'Untitled Lesson')
    }
  }, [blocks, onLessonDeleteRequest])

  // Handle marker detach (drag marker off line to convert back to card)
  const handleMarkerDetach = useCallback((id) => {
    onBlockUpdate?.(id, {
      isMarker: false,
      parentLineId: null
    })
  }, [onBlockUpdate])

  // Add new block (bar for TERM/MODULE/WEEK/DAY, lesson card for LESSON)
  // Phase 5: Bars stack vertically, no nesting
  const handleAddBlock = useCallback((type) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const isBar = type !== 'LESSON'

    if (isBar) {
      // Phase 5: Create a CourseElementBar for TERM, MODULE, WEEK, DAY
      const barConfig = BAR_TYPES[type] || BAR_TYPES.WEEK

      // Calculate vertical position - stack below existing bars of same type
      const existingBarsOfType = blocks.filter(b => b.isBar && b.type === type)
      const barHeight = 30 // Approximate bar height in pixels
      const verticalGap = 8
      const yOffset = existingBarsOfType.length * (barHeight + verticalGap)

      // Position bars by type hierarchy: TERM at top, then MODULE, WEEK, DAY
      const typeOrder = { TERM: 0, MODULE: 1, WEEK: 2, DAY: 3 }
      const baseY = 60 + (typeOrder[type] || 0) * 100 + yOffset

      const newBar = {
        id: `bar-${Date.now()}`,
        type,
        title: '',
        width: barConfig.startDuration * barConfig.pixelsPerUnit,
        duration: barConfig.startDuration,
        isBar: true,  // Phase 5: Flag for bar rendering
        isLine: false,
        y: baseY  // Store Y position for vertical stacking
      }
      onBlockAdd?.(newBar)
      setSelectedBlockId(newBar.id)
    } else {
      // Create an OverviewLessonCard for LESSON (Item 8)
      const newLesson = {
        id: `lesson-${Date.now()}`,
        type: 'LESSON',
        lessonType: 'lecture',  // Default lesson type
        title: '',
        x: canvasRect ? canvasRect.width / 2 - 90 : 200,
        y: canvasRect ? canvasRect.height / 2 - 35 : 200,
        width: 180,
        height: 70,
        duration: 30,  // 30 minutes default
        isCommitted: false,
        parentLineId: null,
        isLine: false,
        isBar: false,
        isMarker: false
      }
      onBlockAdd?.(newLesson)
      setSelectedBlockId(newLesson.id)
    }
  }, [onBlockAdd, blocks])

  // Delete selected block
  const handleDeleteSelected = useCallback(() => {
    if (selectedBlockId) {
      onBlockRemove?.(selectedBlockId)
      setSelectedBlockId(null)
    }
  }, [selectedBlockId, onBlockRemove])

  // Phase 5: Modal handlers for CourseElementBar
  const handleOpenModal = useCallback((id, type, data) => {
    setModalElementId(id)
    setModalElementType(type)
    setModalElementData(data)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setModalElementId(null)
    setModalElementType(null)
    setModalElementData(null)
  }, [])

  const handleModalSave = useCallback((id, updates) => {
    onBlockUpdate?.(id, updates)
  }, [onBlockUpdate])

  // Item 17: Add lesson by type - generates card centrally above "Select Lesson Type" label
  const handleAddLessonByType = useCallback((lessonTypeId) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const lessonType = LESSON_TYPES.find(t => t.id === lessonTypeId) || LESSON_TYPES[0]
    const isBreak = lessonTypeId === 'break'

    const newLesson = {
      id: `lesson-${Date.now()}`,
      type: 'LESSON',
      lessonType: lessonTypeId,
      title: isBreak ? 'BREAK' : '',
      x: canvasRect ? canvasRect.width / 2 - 90 : 200,
      y: 50,  // Position near top, below toolbar
      width: 180,
      height: 70,
      duration: isBreak ? 30 : 60,
      isCommitted: isBreak,  // BREAK auto-commits with title
      parentLineId: null,
      isLine: false,
      isMarker: false,
      lessonColor: lessonType.color
    }
    onBlockAdd?.(newLesson)
    setSelectedBlockId(newLesson.id)
  }, [onBlockAdd])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Delete button bar - only visible when block selected */}
      {selectedBlockId && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '0.5vh 2vw',
            borderBottom: `1px solid ${THEME.BORDER}`,
            background: THEME.BG_DARK
          }}
        >
          <button
            onClick={handleDeleteSelected}
            style={{
              padding: '0.6vh 1vw',
              fontSize: '1.25vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: '#ff4444',
              background: 'transparent',
              border: '1px solid #ff4444',
              borderRadius: '1.5vh',
              cursor: 'pointer'
            }}
          >
            DELETE BLOCK
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          background: `
            linear-gradient(${THEME.BORDER}20 1px, transparent 1px),
            linear-gradient(90deg, ${THEME.BORDER}20 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          backgroundColor: THEME.BG_DARK
        }}
      >

        {/* Item 18-20: Unallocated Lessons Panel - positioned at bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '1vh',
            right: '1vw',
            zIndex: 50
          }}
        >
          <UnallocatedLessonsPanel
            lessons={unscheduledLessons}
            lessonTypes={lessonTypes}
            onUnscheduleLesson={onUnscheduleLesson}
          />
        </div>

        {/* Phase 5: Render bars stacked vertically by type */}
        {/* Bars are positioned absolutely within a flex container for each type */}
        <div style={{ padding: '2vh 2vw' }}>
          {/* Group bars by type and render in hierarchy: TERM, MODULE, WEEK, DAY */}
          {['TERM', 'MODULE', 'WEEK', 'DAY'].map((barType) => {
            const barsOfType = blocks.filter(item => item.isBar && item.type === barType)
            if (barsOfType.length === 0) return null

            return (
              <div key={barType} style={{ marginBottom: '1.5vh' }}>
                {/* Type label */}
                <div
                  style={{
                    fontSize: '1.2vh',
                    fontFamily: THEME.FONT_PRIMARY,
                    letterSpacing: '0.1em',
                    color: THEME.TEXT_DIM,
                    marginBottom: '0.5vh'
                  }}
                >
                  {barType}S
                </div>
                {/* Bars of this type stacked vertically */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5vh', alignItems: 'flex-start' }}>
                  {barsOfType.map((bar) => (
                    <CourseElementBar
                      key={bar.id}
                      id={bar.id}
                      type={bar.type}
                      title={bar.title}
                      duration={bar.duration}
                      width={bar.width}
                      isSelected={selectedBlockId === bar.id}
                      onSelect={handleBlockSelect}
                      onWidthChange={handleWidthChange}
                      onDurationChange={handleDurationChange}
                      onTitleChange={handleTitleChange}
                      onOpenModal={handleOpenModal}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Render other blocks (lesson cards, markers, legacy lines) absolutely positioned */}
        {blocks.map((item) => {
          // Skip bars - they're rendered above
          if (item.isBar) return null

          // Render CourseLine for legacy lines
          if (item.isLine) {
            return (
              <CourseLine
                key={item.id}
                {...item}
                isSelected={selectedBlockId === item.id}
                isPotentialParent={potentialParentId === item.id || potentialLessonLineId === item.id}
                isPotentialChild={draggingBlockId === item.id && potentialParentId !== null}
                onSelect={handleBlockSelect}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPositionChange={handlePositionChange}
                onWidthChange={handleWidthChange}
                onDurationChange={handleDurationChange}
                onTitleChange={handleTitleChange}
                onCommit={handleCommit}
              />
            )
          }

          // Render LessonMarker for markers (Item 10-12)
          if (item.isMarker && item.type === 'LESSON') {
            return (
              <LessonMarker
                key={item.id}
                id={item.id}
                lessonData={item}
                x={item.x}
                y={item.y}
                parentLineId={item.parentLineId}
                isSelected={selectedBlockId === item.id}
                onSelect={handleBlockSelect}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPositionChange={handlePositionChange}
                onDetach={handleMarkerDetach}
              />
            )
          }

          // Render OverviewLessonCard for lesson cards (Item 8-9)
          if (item.type === 'LESSON' && !item.isLine) {
            return (
              <OverviewLessonCard
                key={item.id}
                id={item.id}
                title={item.title}
                type={item.lessonType || 'lecture'}
                duration={item.duration || 30}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                isSelected={selectedBlockId === item.id}
                isCommitted={item.isCommitted}
                onSelect={handleBlockSelect}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onPositionChange={handlePositionChange}
                onTitleChange={handleTitleChange}
                onDurationChange={handleDurationChange}
                onCommit={handleCommit}
                onRequestDelete={handleLessonDeleteRequest}
              />
            )
          }

          // Render LearningBlock for other block types (legacy)
          return (
            <LearningBlock
              key={item.id}
              {...item}
              isSelected={selectedBlockId === item.id}
              isInActiveParentChain={activeParentChain.includes(item.id)}
              onSelect={handleBlockSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onPositionChange={handlePositionChange}
              onSizeChange={handleSizeChange}
              onDurationChange={handleDurationChange}
              onTitleChange={handleTitleChange}
            />
          )
        })}
      </div>

      {/* Lesson Type Palette - positioned at bottom, ~10px above PKE */}
      {/* Circular buttons with colored ring, no container */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1vw',
          zIndex: 50
        }}
      >
        {LESSON_TYPES.map((lessonType) => (
          <LessonTypeCircleButton
            key={lessonType.id}
            type={lessonType}
            onClick={() => handleAddLessonByType(lessonType.id)}
          />
        ))}
      </div>

      {/* Phase 5: Modal for editing course element bar properties */}
      <CourseElementModal
        isOpen={modalOpen}
        elementId={modalElementId}
        elementType={modalElementType}
        elementData={modalElementData}
        onClose={handleCloseModal}
        onSave={handleModalSave}
      />
    </div>
  )
}

// ============================================
// LESSON TYPE CIRCLE BUTTON COMPONENT
// Phase 2-6: Simple filled circles with label on hover
// ============================================

function LessonTypeCircleButton({ type, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={type.name}
        style={{
          width: '3vh',
          height: '3vh',
          minWidth: '28px',
          minHeight: '28px',
          background: type.color,
          border: `2px solid ${hovered ? THEME.WHITE : 'transparent'}`,
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: hovered ? `0 0 12px ${type.color}` : 'none',
          transform: hovered ? 'scale(1.1)' : 'scale(1)'
        }}
      />
      {/* Label - appears on hover */}
      {hovered && (
        <span
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: '0.5vh',
            fontSize: '1.1vh',
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            whiteSpace: 'nowrap',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '0.3vh 0.6vw',
            borderRadius: '0.5vh',
            zIndex: 100
          }}
        >
          {type.name}
        </span>
      )}
    </div>
  )
}

export default OverviewCanvas
