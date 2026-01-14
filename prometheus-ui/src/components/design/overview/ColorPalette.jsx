/**
 * ColorPalette.jsx - Color Selection Dropdown for NoteBlocks
 *
 * Features:
 * - 8 contrasting colors
 * - User can label each color (first use)
 * - Selected color shown with checkmark
 * - Click to select, optional label editing
 */

import { useState, useRef, useCallback } from 'react'
import { THEME } from '../../../constants/theme'

function ColorPalette({
  colors = [],
  selectedIndex = 0,
  colorLabels = {},
  onSelect
}) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const clickTimerRef = useRef(null)
  const clickCountRef = useRef(0)

  // Use click delay pattern to distinguish single-click from double-click
  const handleColorClick = useCallback((index) => {
    if (editingIndex === index) return // Don't select while editing

    clickCountRef.current += 1

    if (clickCountRef.current === 1) {
      // Wait to see if this is a double-click
      clickTimerRef.current = setTimeout(() => {
        // Single click confirmed - select the color
        if (clickCountRef.current === 1) {
          onSelect?.(index, colorLabels[index])
        }
        clickCountRef.current = 0
      }, 250) // 250ms delay to detect double-click
    } else if (clickCountRef.current === 2) {
      // Double-click detected - don't select, let double-click handler take over
      clearTimeout(clickTimerRef.current)
      clickCountRef.current = 0
    }
  }, [editingIndex, onSelect, colorLabels])

  const handleLabelDoubleClick = useCallback((e, index) => {
    e.stopPropagation()
    // Clear any pending single-click
    clearTimeout(clickTimerRef.current)
    clickCountRef.current = 0
    setEditingIndex(index)
    setEditLabel(colorLabels[index] || '')
  }, [colorLabels])

  const handleLabelBlur = (index) => {
    setEditingIndex(null)
    if (editLabel.trim() !== (colorLabels[index] || '')) {
      onSelect?.(index, editLabel.trim())
    }
  }

  const handleLabelKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditLabel(colorLabels[index] || '')
    }
  }

  return (
    <div
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: `1px solid ${THEME.BORDER}`,
        borderRadius: '8px',
        padding: '8px',
        minWidth: '160px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}
    >
      {colors.map((color, index) => (
        <div
          key={index}
          onClick={() => handleColorClick(index)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px',
            marginBottom: index < colors.length - 1 ? '4px' : 0,
            borderRadius: '4px',
            cursor: 'pointer',
            background: selectedIndex === index ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedIndex !== index) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = selectedIndex === index
              ? 'rgba(255, 255, 255, 0.1)'
              : 'transparent'
          }}
        >
          {/* Color Swatch */}
          <div
            style={{
              width: '20px',
              height: '20px',
              background: color,
              borderRadius: '4px',
              border: selectedIndex === index ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }}
          />

          {/* Label */}
          {editingIndex === index ? (
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={() => handleLabelBlur(index)}
              onKeyDown={(e) => handleLabelKeyDown(e, index)}
              autoFocus
              placeholder="Add label..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: THEME.TEXT_PRIMARY,
                fontFamily: THEME.FONT_PRIMARY,
                fontSize: '1.1vh',
                padding: '2px 4px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onDoubleClick={(e) => handleLabelDoubleClick(e, index)}
              style={{
                flex: 1,
                fontFamily: THEME.FONT_PRIMARY,
                fontSize: '1.1vh',
                color: colorLabels[index] ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title="Double-click to edit label"
            >
              {colorLabels[index] || 'Double-click to label'}
            </span>
          )}

          {/* Selected Checkmark */}
          {selectedIndex === index && (
            <span
              style={{
                color: THEME.GREEN_BRIGHT,
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              ✓
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default ColorPalette
