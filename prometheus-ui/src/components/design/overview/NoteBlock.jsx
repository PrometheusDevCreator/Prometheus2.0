/**
 * NoteBlock.jsx - Floating Note Block for OVERVIEW Planning
 *
 * Features:
 * - Initial position: 25px below timeline center
 * - Width: 1 unit (adjustable by dragging edges)
 * - Floating: Drag to move anywhere
 * - Double-click to edit text
 * - Color palette dropdown (8 colors with user labels)
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { THEME } from '../../../constants/theme'
import ColorPalette from './ColorPalette'

// Color palette (8 contrasting colors)
const PALETTE = [
  '#FF6600', // Burnt Orange
  '#00FF00', // Luminous Green
  '#00BFFF', // Cyan
  '#9C27B0', // Purple
  '#FFD700', // Gold
  '#FF4444', // Red
  '#00CED1', // Dark Cyan
  '#FF69B4'  // Pink
]

function NoteBlock({
  id,
  x = 0,
  y = 0,
  widthUnits = 1,
  text = '',
  colorIndex = 0,
  pixelsPerUnit = 100,
  colorLabels = {},
  onUpdate,
  onRemove,
  onUpdateColorLabel
}) {
  const [position, setPosition] = useState({ x, y })
  const [width, setWidth] = useState(widthUnits)
  const [noteText, setNoteText] = useState(text)
  const [selectedColor, setSelectedColor] = useState(colorIndex)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(null) // 'left' | 'right' | null
  const [isEditing, setIsEditing] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }) // Store initial position
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }) // Store initial mouse position
  const [widthStart, setWidthStart] = useState(widthUnits) // Store initial width for resize
  const blockRef = useRef(null)
  const textRef = useRef(null)

  const blockWidth = width * pixelsPerUnit
  const borderColor = PALETTE[selectedColor] || PALETTE[0]

  // Sync from props
  useEffect(() => {
    setPosition({ x, y })
  }, [x, y])

  useEffect(() => {
    setWidth(widthUnits)
  }, [widthUnits])

  useEffect(() => {
    setNoteText(text)
  }, [text])

  useEffect(() => {
    setSelectedColor(colorIndex)
  }, [colorIndex])

  // Handle block drag - use delta-based movement
  const handleDragStart = useCallback((e) => {
    if (isResizing || isEditing) return
    e.preventDefault()
    setIsDragging(true)
    // Store starting position and mouse position for delta calculation
    setDragStart({ x: position.x, y: position.y })
    setMouseStart({ x: e.clientX, y: e.clientY })
  }, [isResizing, isEditing, position])

  // Handle resize start
  const handleResizeStart = useCallback((e, side) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(side)
    setMouseStart({ x: e.clientX, y: 0 })
    setWidthStart(width)
    setDragStart({ x: position.x, y: position.y })
  }, [width, position])

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setIsEditing(true)
    setTimeout(() => textRef.current?.focus(), 0)
  }, [])

  // Handle text blur
  const handleTextBlur = useCallback(() => {
    setIsEditing(false)
    onUpdate?.(id, { text: noteText })
  }, [id, noteText, onUpdate])

  // Handle color selection
  const handleColorSelect = useCallback((index, label) => {
    setSelectedColor(index)
    setShowPalette(false)
    onUpdate?.(id, { colorIndex: index })
    if (label !== undefined) {
      onUpdateColorLabel?.(index, label)
    }
  }, [id, onUpdate, onUpdateColorLabel])

  // Handle mouse move - use delta-based calculation
  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e) => {
      if (isDragging) {
        // Calculate delta from starting mouse position
        const deltaX = e.clientX - mouseStart.x
        const deltaY = e.clientY - mouseStart.y
        // Apply delta to starting position
        setPosition({
          x: dragStart.x + deltaX,
          y: dragStart.y + deltaY
        })
      } else if (isResizing) {
        const deltaPixels = e.clientX - mouseStart.x
        const deltaUnits = deltaPixels / pixelsPerUnit

        if (isResizing === 'left') {
          const newWidth = Math.max(0.5, widthStart - deltaUnits)
          const widthDiff = widthStart - newWidth
          setWidth(newWidth)
          setPosition({ x: dragStart.x + widthDiff * pixelsPerUnit, y: dragStart.y })
        } else {
          const newWidth = Math.max(0.5, widthStart + deltaUnits)
          setWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        onUpdate?.(id, {
          x: position.x,
          y: position.y,
          widthUnits: width
        })
      }
      setIsDragging(false)
      setIsResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, mouseStart, dragStart, position, width, widthStart, pixelsPerUnit, id, onUpdate])

  return (
    <div
      ref={blockRef}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${blockWidth}px`,
        minHeight: '60px',
        background: 'rgba(30, 30, 30, 0.9)',
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        cursor: isDragging ? 'grabbing' : (isEditing ? 'text' : 'grab'),
        userSelect: isEditing ? 'text' : 'none',
        zIndex: isDragging ? 100 : 20,
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px ${borderColor}30`
      }}
    >
      {/* Color Palette Dropdown Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowPalette(!showPalette)
        }}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '16px',
          height: '16px',
          background: 'transparent',
          border: 'none',
          color: THEME.TEXT_DIM,
          fontSize: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {showPalette ? '▲' : '▼'}
      </button>

      {/* Color Palette Dropdown */}
      {showPalette && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '4px',
            zIndex: 200
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ColorPalette
            colors={PALETTE}
            selectedIndex={selectedColor}
            colorLabels={colorLabels}
            onSelect={handleColorSelect}
          />
        </div>
      )}

      {/* Text Content */}
      <div
        style={{
          padding: '8px 24px 8px 8px',
          minHeight: '44px'
        }}
      >
        {isEditing ? (
          <textarea
            ref={textRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setNoteText(text)
                setIsEditing(false)
              }
            }}
            style={{
              width: '100%',
              minHeight: '40px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.2vh',
              color: THEME.TEXT_PRIMARY,
              lineHeight: 1.4
            }}
          />
        ) : (
          <p
            style={{
              margin: 0,
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.2vh',
              color: noteText ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
              lineHeight: 1.4,
              minHeight: '2em'
            }}
          >
            {noteText || 'Double-click to add note...'}
          </p>
        )}
      </div>

      {/* Left Resize Handle */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'left')}
        style={{
          position: 'absolute',
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '30px',
          background: borderColor,
          borderRadius: '4px',
          cursor: 'ew-resize',
          opacity: 0.6,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      />

      {/* Right Resize Handle */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'right')}
        style={{
          position: 'absolute',
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '30px',
          background: borderColor,
          borderRadius: '4px',
          cursor: 'ew-resize',
          opacity: 0.6,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      />

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove?.(id)
        }}
        style={{
          position: 'absolute',
          left: '4px',
          top: '4px',
          width: '14px',
          height: '14px',
          background: 'rgba(255, 68, 68, 0.8)',
          border: 'none',
          borderRadius: '50%',
          color: '#fff',
          fontSize: '9px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
      >
        ×
      </button>
    </div>
  )
}

export default NoteBlock
