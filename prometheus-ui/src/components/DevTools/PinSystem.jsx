/**
 * PinSystem - Pin placement and distance measurement
 *
 * Features:
 * - Single-click pin placement
 * - Double-click for Pin & String mode
 * - Visual pin markers with color coding
 * - Connecting line between pins
 * - Distance labels along the line
 * - Right-click context menu
 * - Arrow key pin movement (handled in controller)
 */

import { useCallback, useEffect, useState } from 'react'
import { useGrid, gridToScreen, formatCoord } from './GridContext'

// Pin visual constants
const PIN_SIZE = 16
const PIN_BORDER = 2
const LINE_COLOR = 'rgba(255, 255, 255, 0.6)'

// Pin colors
const PIN_COLORS = {
  pin1: '#FF6B6B', // Coral red
  pin2: '#4ECDC4'  // Teal
}

/**
 * Pin marker component
 */
function PinMarker({ pin, index, isActive, onContextMenu }) {
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 })

  // Update screen position when pin or viewport changes
  useEffect(() => {
    const updatePosition = () => {
      const pos = gridToScreen(pin.x, pin.y, window.innerWidth, window.innerHeight)
      setScreenPos(pos)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [pin.x, pin.y])

  const color = index === 0 ? PIN_COLORS.pin1 : PIN_COLORS.pin2

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu(e.clientX, e.clientY, index)
      }}
      style={{
        position: 'fixed',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10002,
        pointerEvents: 'auto',
        cursor: 'crosshair'
      }}
    >
      {/* Crosshair marker */}
      <svg
        width={PIN_SIZE + 8}
        height={PIN_SIZE + 8}
        viewBox={`0 0 ${PIN_SIZE + 8} ${PIN_SIZE + 8}`}
        style={{ overflow: 'visible' }}
      >
        {/* Outer glow for active pin */}
        {isActive && (
          <circle
            cx={(PIN_SIZE + 8) / 2}
            cy={(PIN_SIZE + 8) / 2}
            r={PIN_SIZE / 2 + 4}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.3"
          />
        )}

        {/* Vertical line */}
        <line
          x1={(PIN_SIZE + 8) / 2}
          y1="0"
          x2={(PIN_SIZE + 8) / 2}
          y2={PIN_SIZE + 8}
          stroke={color}
          strokeWidth={PIN_BORDER}
        />

        {/* Horizontal line */}
        <line
          x1="0"
          y1={(PIN_SIZE + 8) / 2}
          x2={PIN_SIZE + 8}
          y2={(PIN_SIZE + 8) / 2}
          stroke={color}
          strokeWidth={PIN_BORDER}
        />

        {/* Center dot */}
        <circle
          cx={(PIN_SIZE + 8) / 2}
          cy={(PIN_SIZE + 8) / 2}
          r="3"
          fill={color}
        />
      </svg>

      {/* Pin label */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: color,
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          border: `1px solid ${color}`,
          opacity: 0.9
        }}
      >
        P{index + 1}: {formatCoord(pin.x)}, {formatCoord(pin.y)}
      </div>
    </div>
  )
}

/**
 * Connecting line between two pins with distance labels
 */
function ConnectingLine({ pin1, pin2, distance }) {
  const [screenPos1, setScreenPos1] = useState({ x: 0, y: 0 })
  const [screenPos2, setScreenPos2] = useState({ x: 0, y: 0 })

  // Update screen positions
  useEffect(() => {
    const updatePositions = () => {
      setScreenPos1(gridToScreen(pin1.x, pin1.y, window.innerWidth, window.innerHeight))
      setScreenPos2(gridToScreen(pin2.x, pin2.y, window.innerWidth, window.innerHeight))
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [pin1.x, pin1.y, pin2.x, pin2.y])

  // Calculate midpoint for distance label
  const midX = (screenPos1.x + screenPos2.x) / 2
  const midY = (screenPos1.y + screenPos2.y) / 2

  // Calculate line angle for label rotation
  const angle = Math.atan2(screenPos2.y - screenPos1.y, screenPos2.x - screenPos1.x) * (180 / Math.PI)

  return (
    <>
      {/* Main connecting line */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 10001
        }}
      >
        {/* Dashed line */}
        <line
          x1={screenPos1.x}
          y1={screenPos1.y}
          x2={screenPos2.x}
          y2={screenPos2.y}
          stroke={LINE_COLOR}
          strokeWidth="1.5"
          strokeDasharray="6,4"
        />

        {/* X distance indicator (horizontal) */}
        <line
          x1={screenPos1.x}
          y1={screenPos1.y}
          x2={screenPos2.x}
          y2={screenPos1.y}
          stroke="rgba(255, 107, 107, 0.4)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* Y distance indicator (vertical) */}
        <line
          x1={screenPos2.x}
          y1={screenPos1.y}
          x2={screenPos2.x}
          y2={screenPos2.y}
          stroke="rgba(78, 205, 196, 0.4)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>

      {/* Distance label at midpoint */}
      <div
        style={{
          position: 'fixed',
          left: `${midX}px`,
          top: `${midY}px`,
          transform: `translate(-50%, -50%)`,
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#FFE66D',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          border: '1px solid rgba(255, 230, 109, 0.4)',
          zIndex: 10003,
          pointerEvents: 'none'
        }}
      >
        D: {distance.euclidean}px | X: {distance.x} | Y: {distance.y}
      </div>
    </>
  )
}

/**
 * Context menu for pin actions
 */
function PinContextMenu({ x, y, pinIndex, onCopy, onDelete, onClose }) {
  // Close on click outside
  useEffect(() => {
    const handleClick = () => onClose()
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    // Delay to avoid immediate close from the right-click
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClick)
      window.addEventListener('keydown', handleEscape)
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItemStyle = {
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontSize: '11px',
    fontFamily: "'Fira Code', monospace"
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        background: 'rgba(13, 13, 13, 0.95)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        zIndex: 10010,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
        minWidth: '140px'
      }}
    >
      <div
        style={menuItemStyle}
        onClick={() => {
          onCopy(pinIndex)
          onClose()
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <span style={{ color: '#00FFFF' }}>Copy Coordinates</span>
      </div>
      <div
        style={{
          ...menuItemStyle,
          borderTop: '1px solid rgba(0, 255, 255, 0.1)'
        }}
        onClick={() => {
          onDelete(pinIndex)
          onClose()
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 107, 0.1)'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <span style={{ color: '#FF6B6B' }}>Delete Pin</span>
      </div>
    </div>
  )
}

/**
 * Main PinSystem component
 */
function PinSystem() {
  const {
    pins,
    activePin,
    distance,
    contextMenu,
    showContextMenu,
    hideContextMenu,
    copyPinCoordinates,
    removePin
  } = useGrid()

  const handleContextMenu = useCallback((x, y, pinIndex) => {
    showContextMenu(x, y, pinIndex)
  }, [showContextMenu])

  const handleCopy = useCallback(async (pinIndex) => {
    const success = await copyPinCoordinates(pinIndex)
    if (success) {
      // Could show a toast notification here
      console.log('Coordinates copied to clipboard')
    }
  }, [copyPinCoordinates])

  const handleDelete = useCallback((pinIndex) => {
    removePin(pinIndex)
  }, [removePin])

  return (
    <>
      {/* Connecting line (only when 2 pins exist) */}
      {pins[0] && pins[1] && distance && (
        <ConnectingLine
          pin1={pins[0]}
          pin2={pins[1]}
          distance={distance}
        />
      )}

      {/* Pin markers */}
      {pins[0] && (
        <PinMarker
          pin={pins[0]}
          index={0}
          isActive={activePin === 0}
          onContextMenu={handleContextMenu}
        />
      )}
      {pins[1] && (
        <PinMarker
          pin={pins[1]}
          index={1}
          isActive={activePin === 1}
          onContextMenu={handleContextMenu}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <PinContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          pinIndex={contextMenu.pinIndex}
          onCopy={handleCopy}
          onDelete={handleDelete}
          onClose={hideContextMenu}
        />
      )}
    </>
  )
}

export default PinSystem
