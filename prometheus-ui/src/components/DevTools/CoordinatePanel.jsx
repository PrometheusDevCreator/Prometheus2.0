/**
 * CoordinatePanel - Floating coordinate display and grid controls
 *
 * Features:
 * - Draggable positioning
 * - Real-time mouse coordinates
 * - Pin coordinates (when placed)
 * - Distance calculations (when 2 pins)
 * - Grid mode selector
 * - Opacity control
 * - Collapse/minimize toggle
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useGrid, GRID_MODES, OPACITY_LEVELS, formatCoord } from './GridContext'

// Panel styling constants
const PANEL_STYLES = {
  background: 'rgba(13, 13, 13, 0.95)',
  border: '1px solid rgba(0, 255, 255, 0.3)',
  borderRadius: '6px',
  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
  fontSize: '11px',
  color: '#00FFFF',
  minWidth: '260px'
}

const HEADER_STYLES = {
  background: 'rgba(0, 255, 255, 0.1)',
  borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
  padding: '6px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'grab',
  userSelect: 'none',
  borderRadius: '5px 5px 0 0'
}

const CONTENT_STYLES = {
  padding: '10px'
}

const ROW_STYLES = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '6px'
}

const LABEL_STYLES = {
  color: 'rgba(0, 255, 255, 0.7)',
  marginRight: '12px'
}

const VALUE_STYLES = {
  color: '#00FFFF',
  fontWeight: '500'
}

const DIVIDER_STYLES = {
  height: '1px',
  background: 'rgba(0, 255, 255, 0.2)',
  margin: '8px 0'
}

function CoordinatePanel() {
  const {
    gridMode,
    gridOpacity,
    mousePosition,
    pins,
    distance,
    panelPosition,
    panelCollapsed,
    setPanelPosition,
    setMode,
    setGridOpacity,
    togglePanelCollapsed
  } = useGrid()

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef(null)

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.panel-control')) return // Don't drag when clicking controls

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    })
    e.preventDefault()
  }, [panelPosition])

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 280, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
      setPanelPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, setPanelPosition])

  // Opacity level index for display
  const opacityIndex = OPACITY_LEVELS.findIndex(o => Math.abs(o - gridOpacity) < 0.01)

  // Render opacity dots
  const renderOpacityDots = () => {
    return OPACITY_LEVELS.map((level, index) => (
      <button
        key={level}
        className="panel-control"
        onClick={() => setGridOpacity(level)}
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          border: 'none',
          background: index <= opacityIndex ? '#00FFFF' : 'rgba(0, 255, 255, 0.3)',
          cursor: 'pointer',
          padding: 0,
          margin: '0 2px',
          transition: 'background 0.2s'
        }}
        title={`${Math.round(level * 100)}% opacity`}
      />
    ))
  }

  return (
    <div
      ref={panelRef}
      style={{
        ...PANEL_STYLES,
        position: 'fixed',
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        zIndex: 10001,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto'
      }}
    >
      {/* Header - Drag Handle */}
      <div
        style={{
          ...HEADER_STYLES,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        <span style={{ fontWeight: '600', letterSpacing: '1px' }}>
          GRID COORDINATES
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Drag indicator */}
          <span style={{ color: 'rgba(0, 255, 255, 0.5)', fontSize: '14px' }}>
            ≡
          </span>
          {/* Collapse button */}
          <button
            className="panel-control"
            onClick={togglePanelCollapsed}
            style={{
              background: 'none',
              border: 'none',
              color: '#00FFFF',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px',
              lineHeight: 1
            }}
            title={panelCollapsed ? 'Expand' : 'Collapse'}
          >
            {panelCollapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Content - Collapsible */}
      {!panelCollapsed && (
        <div style={CONTENT_STYLES}>
          {/* Mouse Coordinates */}
          <div style={ROW_STYLES}>
            <span style={LABEL_STYLES}>Mouse:</span>
            <span style={VALUE_STYLES}>
              X: {formatCoord(mousePosition.x)}  Y: {formatCoord(mousePosition.y)}
            </span>
          </div>

          {/* Pin 1 Coordinates */}
          {pins[0] && (
            <div style={ROW_STYLES}>
              <span style={{ ...LABEL_STYLES, color: '#FF6B6B' }}>Pin 1:</span>
              <span style={{ ...VALUE_STYLES, color: '#FF6B6B' }}>
                X: {formatCoord(pins[0].x)}  Y: {formatCoord(pins[0].y)}
              </span>
            </div>
          )}

          {/* Pin 2 Coordinates */}
          {pins[1] && (
            <div style={ROW_STYLES}>
              <span style={{ ...LABEL_STYLES, color: '#4ECDC4' }}>Pin 2:</span>
              <span style={{ ...VALUE_STYLES, color: '#4ECDC4' }}>
                X: {formatCoord(pins[1].x)}  Y: {formatCoord(pins[1].y)}
              </span>
            </div>
          )}

          {/* Distance (when 2 pins) */}
          {distance && (
            <>
              <div style={DIVIDER_STYLES} />
              <div style={ROW_STYLES}>
                <span style={LABEL_STYLES}>Distance:</span>
                <span style={VALUE_STYLES}>
                  X: {distance.x}  Y: {distance.y}
                </span>
              </div>
              <div style={ROW_STYLES}>
                <span style={LABEL_STYLES}>Euclidean:</span>
                <span style={{ ...VALUE_STYLES, color: '#FFE66D' }}>
                  D: {distance.euclidean}
                </span>
              </div>
            </>
          )}

          {/* Controls Divider */}
          <div style={DIVIDER_STYLES} />

          {/* Grid Mode Selector */}
          <div style={ROW_STYLES}>
            <span style={LABEL_STYLES}>Grid:</span>
            <select
              className="panel-control"
              value={gridMode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: '3px',
                color: '#00FFFF',
                fontFamily: 'inherit',
                fontSize: '10px',
                padding: '3px 6px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={GRID_MODES.OFF}>OFF</option>
              <option value={GRID_MODES.STANDARD}>Standard (100px)</option>
              <option value={GRID_MODES.FINE}>Fine (50px)</option>
            </select>
          </div>

          {/* Opacity Control */}
          <div style={ROW_STYLES}>
            <span style={LABEL_STYLES}>Opacity:</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {renderOpacityDots()}
            </div>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div style={DIVIDER_STYLES} />
          <div style={{
            fontSize: '9px',
            color: 'rgba(0, 255, 255, 0.5)',
            lineHeight: '1.4'
          }}>
            <div>G: Toggle grid | M: Measure mode</div>
            <div>Click: Place pin | Arrows: Move pin</div>
            <div>Esc/Del: Remove pin | Right-click: Copy</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoordinatePanel
