/**
 * ScalarNode.jsx - Individual Tree Node Component
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 5
 *
 * Represents a single node in the scalar hierarchy:
 * - LO, Topic, or Subtopic
 *
 * Features:
 * - Expand/collapse toggle
 * - Selection highlighting
 * - Add child button
 * - Visual connectors showing hierarchy
 * - Depth-based indentation
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

const INDENT_SIZE = 24 // pixels per depth level
const NODE_HEIGHT = 36 // pixels

function ScalarNode({
  type,
  data,
  number,
  label,
  expanded,
  hasChildren,
  onToggle,
  onAdd,
  addLabel,
  color,
  depth = 0
}) {
  const { selection, select, startEditing, deleteScalarNode } = useDesign()
  const [isHovered, setIsHovered] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(null)

  // Check if this node is selected
  const isSelected = selection.type === type && selection.id === data.id
  const isEditing = isSelected && selection.mode === 'editing'

  // Handle click to select
  const handleClick = useCallback((e) => {
    e.stopPropagation()
    select(type, data.id)
  }, [select, type, data.id])

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    startEditing(type, data.id)
  }, [startEditing, type, data.id])

  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    select(type, data.id)
    setShowContextMenu({ x: e.clientX, y: e.clientY })
  }, [select, type, data.id])

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(null)
  }, [])

  // Handle delete
  const handleDelete = useCallback(() => {
    deleteScalarNode(type, data.id)
    closeContextMenu()
  }, [deleteScalarNode, type, data.id, closeContextMenu])

  return (
    <>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5vw',
          padding: '0.6vh 0.8vw',
          marginLeft: `${depth * INDENT_SIZE}px`,
          background: isSelected
            ? `linear-gradient(90deg, ${color}22 0%, transparent 100%)`
            : isHovered
              ? THEME.BG_PANEL
              : 'transparent',
          border: isSelected ? `1px solid ${color}` : '1px solid transparent',
          borderRadius: '0.4vh',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          position: 'relative'
        }}
      >
        {/* Connector line */}
        {depth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `-${INDENT_SIZE / 2}px`,
              top: '50%',
              width: `${INDENT_SIZE / 2}px`,
              height: '1px',
              background: THEME.BORDER
            }}
          />
        )}

        {/* Expand/Collapse Toggle */}
        {hasChildren || onToggle ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle?.()
            }}
            style={{
              width: '1.6vh',
              height: '1.6vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '0.3vh',
              color: hasChildren ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
              fontSize: '1vh',
              cursor: hasChildren ? 'pointer' : 'default',
              opacity: hasChildren ? 1 : 0.5
            }}
          >
            {hasChildren ? (expanded ? '−' : '+') : '○'}
          </button>
        ) : (
          <div style={{ width: '1.6vh' }} />
        )}

        {/* Color indicator */}
        <div
          style={{
            width: '0.6vh',
            height: '1.6vh',
            borderRadius: '0.2vh',
            background: color,
            flexShrink: 0
          }}
        />

        {/* Number badge */}
        <span
          style={{
            fontSize: '1vh',
            fontFamily: THEME.FONT_MONO,
            color: color,
            fontWeight: 500,
            minWidth: '3vw'
          }}
        >
          {number}
        </span>

        {/* Label */}
        <span
          style={{
            flex: 1,
            fontSize: '1.1vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: isSelected ? THEME.WHITE : THEME.TEXT_PRIMARY,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {label}
        </span>

        {/* Add button (on hover) */}
        {onAdd && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            style={{
              background: 'transparent',
              border: `1px dashed ${color}`,
              borderRadius: '0.3vh',
              color: color,
              fontSize: '0.9vh',
              padding: '0.2vh 0.5vw',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            {addLabel}
          </button>
        )}

        {/* Editing indicator */}
        {isEditing && (
          <span
            style={{
              fontSize: '0.8vh',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO,
              textTransform: 'uppercase'
            }}
          >
            EDITING
          </span>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <NodeContextMenu
          x={showContextMenu.x}
          y={showContextMenu.y}
          onDelete={handleDelete}
          onClose={closeContextMenu}
          type={type}
        />
      )}
    </>
  )
}

// ============================================
// CONTEXT MENU
// ============================================

function NodeContextMenu({ x, y, onDelete, onClose, type }) {
  const adjustedX = Math.min(x, window.innerWidth - 150)
  const adjustedY = Math.min(y, window.innerHeight - 120)

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: adjustedY,
          left: adjustedX,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER_LIGHT}`,
          borderRadius: '0.5vh',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 1000,
          minWidth: '8vw',
          overflow: 'hidden'
        }}
      >
        <MenuItem label="Edit" hint="Double-click" disabled />
        <div style={{ height: '1px', background: THEME.BORDER, margin: '0.3vh 0' }} />
        <MenuItem
          label={`Delete ${type.toUpperCase()}`}
          onClick={onDelete}
          danger
        />
      </div>
    </>
  )
}

function MenuItem({ label, hint, onClick, disabled, danger }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.8vh 1vw',
        fontSize: '1.1vh',
        fontFamily: THEME.FONT_PRIMARY,
        color: disabled
          ? THEME.TEXT_DIM
          : danger
            ? hovered ? '#ff6666' : '#cc4444'
            : hovered ? THEME.WHITE : THEME.TEXT_PRIMARY,
        background: hovered && !disabled ? THEME.BG_DARK : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <span>{label}</span>
      {hint && (
        <span style={{ fontSize: '0.9vh', color: THEME.TEXT_DIM, marginLeft: '1vw' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

export default ScalarNode
