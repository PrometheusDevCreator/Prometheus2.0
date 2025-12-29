/**
 * OverviewCanvas - Sketching Canvas for OVERVIEW Tab
 *
 * Features:
 * - Full canvas for drag-and-drop Learning Blocks
 * - Grid background for alignment
 * - Block creation toolbar
 * - Click to deselect, click block to select
 */

import { useState, useCallback, useRef } from 'react'
import { THEME } from '../../../constants/theme'
import LearningBlock, { BLOCK_TYPES } from './LearningBlock'

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

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedBlockId(null)
  }, [])

  // Handle block selection
  const handleBlockSelect = useCallback((id) => {
    setSelectedBlockId(id)
  }, [])

  // Handle block position change during drag
  const handlePositionChange = useCallback((id, x, y) => {
    onBlockUpdate?.(id, { x, y })
  }, [onBlockUpdate])

  // Handle drag start
  const handleDragStart = useCallback((id) => {
    setDraggingBlockId(id)
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((id) => {
    setDraggingBlockId(null)
  }, [])

  // Handle block resize
  const handleSizeChange = useCallback((id, width, height) => {
    onBlockUpdate?.(id, { width, height })
  }, [onBlockUpdate])

  // Handle block title change
  const handleTitleChange = useCallback((id, title) => {
    onBlockUpdate?.(id, { title })
  }, [onBlockUpdate])

  // Add new block
  const handleAddBlock = useCallback((type) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      title: '',
      x: canvasRect ? canvasRect.width / 2 - 75 : 200,
      y: canvasRect ? canvasRect.height / 2 - 30 : 200,
      width: BLOCK_TYPES[type]?.minWidth,
      height: BLOCK_TYPES[type]?.minHeight
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
            fontSize: '1.1vh',
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
              fontSize: '1vh',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.05em',
              color: BLOCK_TYPES[type].color,
              background: 'transparent',
              border: `1px solid ${BLOCK_TYPES[type].color}`,
              borderRadius: '4px',
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
              fontSize: '1vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: '#ff4444',
              background: 'transparent',
              border: '1px solid #ff4444',
              borderRadius: '4px',
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
            <p style={{ fontSize: '1.4vh', fontFamily: THEME.FONT_PRIMARY, margin: 0 }}>
              No blocks yet
            </p>
            <p style={{ fontSize: '1.1vh', fontFamily: THEME.FONT_PRIMARY, marginTop: '0.5vh' }}>
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
            onSelect={handleBlockSelect}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPositionChange={handlePositionChange}
            onSizeChange={handleSizeChange}
            onTitleChange={handleTitleChange}
          />
        ))}
      </div>
    </div>
  )
}

export default OverviewCanvas
