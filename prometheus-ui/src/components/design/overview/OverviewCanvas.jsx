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
import LearningBlock, { BLOCK_TYPES, NESTING_RULES } from './LearningBlock'

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

function OverviewCanvas({
  blocks = [],
  onBlocksChange,
  onBlockAdd,
  onBlockRemove,
  onBlockUpdate
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [draggingBlockId, setDraggingBlockId] = useState(null)
  const canvasRef = useRef(null)

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
  }, [blocks, onBlockUpdate])

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

  // Add new block
  const handleAddBlock = useCallback((type) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const blockConfig = BLOCK_TYPES[type]
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      title: '',
      x: canvasRect ? canvasRect.width / 2 - 75 : 200,
      y: canvasRect ? canvasRect.height / 2 - 30 : 200,
      width: blockConfig.startDuration * blockConfig.pixelsPerUnit,
      height: blockConfig.minHeight,
      duration: blockConfig.startDuration,
      parentId: null,
      nestingDepth: 0
    }
    onBlockAdd?.(newBlock)
    setSelectedBlockId(newBlock.id)
  }, [onBlockAdd])

  // Delete selected block
  const handleDeleteSelected = useCallback(() => {
    if (selectedBlockId) {
      onBlockRemove?.(selectedBlockId)
      setSelectedBlockId(null)
    }
  }, [selectedBlockId, onBlockRemove])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1vw',
          padding: '1vh 2vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_DARK
        }}
      >
        <span
          style={{
            fontSize: '1.375vh',  // Increased from 1.1vh (+25%)
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.1em',
            color: THEME.TEXT_DIM,
            marginRight: '1vw'
          }}
        >
          ADD BLOCK:
        </span>
        {Object.keys(BLOCK_TYPES).map((type) => (
          <button
            key={type}
            onClick={() => handleAddBlock(type)}
            style={{
              padding: '0.6vh 1vw',
              fontSize: '1.25vh',  // Increased from 1vh (+25%)
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.05em',
              color: BLOCK_TYPES[type].color,
              background: 'transparent',
              border: `1px solid ${BLOCK_TYPES[type].color}`,
              borderRadius: '1.5vh',  // Match action button style
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${BLOCK_TYPES[type].color}20`
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
            }}
          >
            + {type}
          </button>
        ))}

        {/* Delete button - only when block selected */}
        {selectedBlockId && (
          <button
            onClick={handleDeleteSelected}
            style={{
              marginLeft: 'auto',
              padding: '0.6vh 1vw',
              fontSize: '1.25vh',  // Increased from 1vh (+25%)
              fontFamily: THEME.FONT_PRIMARY,
              color: '#ff4444',
              background: 'transparent',
              border: '1px solid #ff4444',
              borderRadius: '1.5vh',  // Match action button style
              cursor: 'pointer'
            }}
          >
            DELETE BLOCK
          </button>
        )}
      </div>

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
        {/* Empty state */}
        {blocks.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: THEME.TEXT_DIM
            }}
          >
            <p style={{ fontSize: '1.75vh', fontFamily: THEME.FONT_PRIMARY, margin: 0 }}>
              No blocks yet
            </p>
            <p style={{ fontSize: '1.375vh', fontFamily: THEME.FONT_PRIMARY, marginTop: '0.5vh' }}>
              Use the toolbar above to add TERM, MODULE, WEEK, DAY, or LESSON blocks
            </p>
          </div>
        )}

        {/* Render blocks */}
        {blocks.map((block) => (
          <LearningBlock
            key={block.id}
            {...block}
            isSelected={selectedBlockId === block.id}
            isInActiveParentChain={activeParentChain.includes(block.id)}
            onSelect={handleBlockSelect}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPositionChange={handlePositionChange}
            onSizeChange={handleSizeChange}
            onDurationChange={handleDurationChange}
            onTitleChange={handleTitleChange}
          />
        ))}
      </div>
    </div>
  )
}

export default OverviewCanvas
