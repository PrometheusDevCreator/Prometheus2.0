/**
 * GridContext - State management for the debug grid system
 *
 * Provides shared state and utilities for:
 * - Grid visibility and mode (off/standard/fine)
 * - Grid opacity control
 * - Mouse position tracking (grid coordinates)
 * - Pin placement and management
 * - Measurement mode
 * - Coordinate panel state
 *
 * Coordinate System:
 * - Origin (0,0) at viewport centre
 * - X: negative left, positive right
 * - Y: positive up, negative down (Cartesian)
 * - 1 Grid Unit = 1 Pixel (at 100% zoom)
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

// ============================================
// COORDINATE CONVERSION UTILITIES
// ============================================

/**
 * Convert screen coordinates to grid coordinates (pixels)
 * @param {number} screenX - X position from left edge of viewport
 * @param {number} screenY - Y position from top edge of viewport
 * @param {number} viewportWidth - Current viewport width
 * @param {number} viewportHeight - Current viewport height
 * @returns {{ x: number, y: number }} Grid coordinates
 */
export const screenToGrid = (screenX, screenY, viewportWidth, viewportHeight) => {
  const originX = viewportWidth / 2
  const originY = viewportHeight / 2
  return {
    x: Math.round(screenX - originX),
    y: Math.round(originY - screenY) // Invert Y for Cartesian
  }
}

/**
 * Convert grid coordinates to screen coordinates (pixels)
 * @param {number} gridX - X position from centre origin
 * @param {number} gridY - Y position from centre origin (positive up)
 * @param {number} viewportWidth - Current viewport width
 * @param {number} viewportHeight - Current viewport height
 * @returns {{ x: number, y: number }} Screen coordinates
 */
export const gridToScreen = (gridX, gridY, viewportWidth, viewportHeight) => {
  const originX = viewportWidth / 2
  const originY = viewportHeight / 2
  return {
    x: originX + gridX,
    y: originY - gridY // Invert Y for screen
  }
}

/**
 * Convert pixel value to viewport width units
 * @param {number} px - Pixel value
 * @returns {string} vw value with 4 decimal places
 */
export const pxToVw = (px) => {
  return (px / 19.2).toFixed(4)
}

/**
 * Convert pixel value to viewport height units
 * @param {number} px - Pixel value
 * @returns {string} vh value with 4 decimal places
 */
export const pxToVh = (px) => {
  return (px / 10.8).toFixed(4)
}

/**
 * Convert viewport width units to pixels
 * @param {number} vw - Viewport width value
 * @returns {number} Pixel value
 */
export const vwToPx = (vw) => {
  return Math.round(vw * 19.2)
}

/**
 * Convert viewport height units to pixels
 * @param {number} vh - Viewport height value
 * @returns {number} Pixel value
 */
export const vhToPx = (vh) => {
  return Math.round(vh * 10.8)
}

/**
 * Calculate Euclidean distance between two points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Distance
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)))
}

/**
 * Format coordinate for display with sign
 * @param {number} value - Coordinate value
 * @returns {string} Formatted string with + or - prefix
 */
export const formatCoord = (value) => {
  return value >= 0 ? `+${value}` : `${value}`
}

// ============================================
// CONTEXT DEFINITION
// ============================================

const GridContext = createContext(null)

// Grid modes
export const GRID_MODES = {
  OFF: 'off',
  STANDARD: 'standard', // 100px gridlines
  FINE: 'fine'          // 50px gridlines
}

// Opacity levels (5 steps)
export const OPACITY_LEVELS = [0.2, 0.4, 0.6, 0.8, 1.0]

// Default panel position
const DEFAULT_PANEL_POSITION = { x: 20, y: 60 }

/**
 * GridProvider - Wraps components that need access to grid state
 */
export function GridProvider({ children }) {
  // Grid visibility and mode
  const [gridMode, setGridMode] = useState(GRID_MODES.OFF)

  // Grid opacity (0-1)
  const [gridOpacity, setGridOpacity] = useState(0.6)

  // Mouse position in grid coordinates
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Pin state (max 2 pins)
  const [pins, setPins] = useState([null, null])

  // Which pin is active for keyboard movement (0 or 1, null if none)
  const [activePin, setActivePin] = useState(null)

  // Measurement mode toggle
  const [measurementMode, setMeasurementMode] = useState(false)

  // Coordinate panel state
  const [panelPosition, setPanelPosition] = useState(DEFAULT_PANEL_POSITION)
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null) // { x, y, pinIndex }

  // ============================================
  // DERIVED STATE
  // ============================================

  const isGridVisible = useMemo(() => gridMode !== GRID_MODES.OFF, [gridMode])

  const hasPins = useMemo(() => pins[0] !== null || pins[1] !== null, [pins])

  const pinCount = useMemo(() => pins.filter(p => p !== null).length, [pins])

  const distance = useMemo(() => {
    if (pins[0] && pins[1]) {
      return {
        x: Math.abs(pins[1].x - pins[0].x),
        y: Math.abs(pins[1].y - pins[0].y),
        euclidean: calculateDistance(pins[0].x, pins[0].y, pins[1].x, pins[1].y)
      }
    }
    return null
  }, [pins])

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Cycle through grid modes: off → standard → fine → off
   */
  const cycleGridMode = useCallback(() => {
    setGridMode(current => {
      switch (current) {
        case GRID_MODES.OFF: return GRID_MODES.STANDARD
        case GRID_MODES.STANDARD: return GRID_MODES.FINE
        case GRID_MODES.FINE: return GRID_MODES.OFF
        default: return GRID_MODES.OFF
      }
    })
  }, [])

  /**
   * Set specific grid mode
   */
  const setMode = useCallback((mode) => {
    if (Object.values(GRID_MODES).includes(mode)) {
      setGridMode(mode)
    }
  }, [])

  /**
   * Cycle opacity through levels
   */
  const cycleOpacity = useCallback((direction = 1) => {
    setGridOpacity(current => {
      const currentIndex = OPACITY_LEVELS.findIndex(o => Math.abs(o - current) < 0.01)
      const newIndex = (currentIndex + direction + OPACITY_LEVELS.length) % OPACITY_LEVELS.length
      return OPACITY_LEVELS[newIndex]
    })
  }, [])

  /**
   * Place a pin at coordinates (single click)
   */
  const placePin = useCallback((x, y) => {
    setPins(current => {
      // If no pins, place first pin
      if (current[0] === null) {
        return [{ x, y, id: Date.now() }, null]
      }
      // If one pin, place second pin
      if (current[1] === null) {
        return [current[0], { x, y, id: Date.now() }]
      }
      // If two pins, replace first pin and clear second
      return [{ x, y, id: Date.now() }, null]
    })
    setActivePin(0)
  }, [])

  /**
   * Move active pin by delta
   */
  const moveActivePin = useCallback((dx, dy) => {
    if (activePin === null) return

    setPins(current => {
      const pin = current[activePin]
      if (!pin) return current

      const newPins = [...current]
      newPins[activePin] = {
        ...pin,
        x: pin.x + dx,
        y: pin.y + dy
      }
      return newPins
    })
  }, [activePin])

  /**
   * Remove a specific pin
   */
  const removePin = useCallback((index) => {
    setPins(current => {
      const newPins = [...current]
      newPins[index] = null

      // If we removed pin 0 and pin 1 exists, shift pin 1 to position 0
      if (index === 0 && newPins[1] !== null) {
        newPins[0] = newPins[1]
        newPins[1] = null
      }

      return newPins
    })

    // Clear active pin if it was removed
    setActivePin(current => {
      if (current === index) return null
      if (current === 1 && index === 0) return 0 // Shifted
      return current
    })
  }, [])

  /**
   * Remove the most recently placed pin (for Escape key)
   */
  const removeLastPin = useCallback(() => {
    setPins(current => {
      if (current[1] !== null) {
        return [current[0], null]
      }
      if (current[0] !== null) {
        return [null, null]
      }
      return current
    })
    setActivePin(current => {
      if (current === 1) return 0
      if (current === 0) return null
      return current
    })
  }, [])

  /**
   * Clear all pins
   */
  const clearPins = useCallback(() => {
    setPins([null, null])
    setActivePin(null)
  }, [])

  /**
   * Toggle measurement mode
   */
  const toggleMeasurementMode = useCallback(() => {
    setMeasurementMode(current => !current)
  }, [])

  /**
   * Toggle panel collapsed state
   */
  const togglePanelCollapsed = useCallback(() => {
    setPanelCollapsed(current => !current)
  }, [])

  /**
   * Show context menu for a pin
   */
  const showContextMenu = useCallback((x, y, pinIndex) => {
    setContextMenu({ x, y, pinIndex })
  }, [])

  /**
   * Hide context menu
   */
  const hideContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  /**
   * Copy pin coordinates to clipboard
   */
  const copyPinCoordinates = useCallback(async (pinIndex) => {
    const pin = pins[pinIndex]
    if (!pin) return false

    const text = `X: ${formatCoord(pin.x)}, Y: ${formatCoord(pin.y)}`
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Failed to copy coordinates:', err)
      return false
    }
  }, [pins])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = useMemo(() => ({
    // State
    gridMode,
    gridOpacity,
    mousePosition,
    pins,
    activePin,
    measurementMode,
    panelPosition,
    panelCollapsed,
    contextMenu,

    // Derived state
    isGridVisible,
    hasPins,
    pinCount,
    distance,

    // Setters
    setMousePosition,
    setPanelPosition,
    setActivePin,

    // Actions
    cycleGridMode,
    setMode,
    setGridOpacity,
    cycleOpacity,
    placePin,
    moveActivePin,
    removePin,
    removeLastPin,
    clearPins,
    toggleMeasurementMode,
    togglePanelCollapsed,
    showContextMenu,
    hideContextMenu,
    copyPinCoordinates,

    // Utilities (also exported separately)
    screenToGrid,
    gridToScreen,
    pxToVw,
    pxToVh,
    formatCoord,
    calculateDistance
  }), [
    gridMode, gridOpacity, mousePosition, pins, activePin,
    measurementMode, panelPosition, panelCollapsed, contextMenu,
    isGridVisible, hasPins, pinCount, distance,
    cycleGridMode, setMode, cycleOpacity, placePin, moveActivePin,
    removePin, removeLastPin, clearPins, toggleMeasurementMode,
    togglePanelCollapsed, showContextMenu, hideContextMenu, copyPinCoordinates
  ])

  return (
    <GridContext.Provider value={value}>
      {children}
    </GridContext.Provider>
  )
}

/**
 * Hook to access grid context
 * @throws {Error} If used outside of GridProvider
 */
export function useGrid() {
  const context = useContext(GridContext)
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider')
  }
  return context
}

export default GridContext
