/**
 * DebugGridController - Main controller for the debug grid system
 *
 * This component:
 * - Wraps everything in GridProvider
 * - Handles keyboard shortcuts (G, M, Escape, Delete, Arrow keys)
 * - Tracks mouse position and updates context
 * - Handles click events for pin placement
 * - Composes all DevTools sub-components
 *
 * Keyboard Shortcuts:
 * - G: Cycle grid mode (off → standard → fine → off)
 * - M: Toggle measurement mode
 * - Escape: Remove last pin (when grid active)
 * - Delete: Remove last pin
 * - Arrow keys: Move active pin (1px)
 * - Shift + Arrow keys: Move active pin (10px)
 *
 * Only renders in development mode.
 */

import { useEffect, useCallback, useRef } from 'react'
import { GridProvider, useGrid, screenToGrid, GRID_MODES } from './GridContext'
import GridOverlay from './GridOverlay'
import CoordinatePanel from './CoordinatePanel'
import PinSystem from './PinSystem'
import MeasurementMode from './MeasurementMode'

/**
 * Check if an element is an input that should suppress keyboard shortcuts
 */
function isInputElement(element) {
  if (!element) return false
  const tagName = element.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  )
}

/**
 * Inner controller component (uses grid context)
 */
function GridController({ onEscapeWhenNoPins }) {
  const {
    isGridVisible,
    gridMode,
    hasPins,
    activePin,
    cycleGridMode,
    setMousePosition,
    placePin,
    moveActivePin,
    removeLastPin,
    toggleMeasurementMode
  } = useGrid()

  // Track last click time for double-click detection
  const lastClickRef = useRef({ time: 0, x: 0, y: 0 })
  const DOUBLE_CLICK_THRESHOLD = 300 // ms

  // Mouse position tracking
  useEffect(() => {
    if (!isGridVisible) return

    let rafId = null

    const handleMouseMove = (e) => {
      // Throttle with requestAnimationFrame
      if (rafId) return

      rafId = requestAnimationFrame(() => {
        rafId = null
        const gridPos = screenToGrid(
          e.clientX,
          e.clientY,
          window.innerWidth,
          window.innerHeight
        )
        setMousePosition(gridPos)
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isGridVisible, setMousePosition])

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if focused on input element
      if (isInputElement(document.activeElement)) return

      // G: Cycle grid mode
      if (e.code === 'KeyG' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        cycleGridMode()
        return
      }

      // Only handle remaining shortcuts if grid is visible
      if (!isGridVisible) return

      // M: Toggle measurement mode
      if (e.code === 'KeyM' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        toggleMeasurementMode()
        return
      }

      // Escape: Remove pin or propagate to app for navigation
      if (e.code === 'Escape') {
        if (hasPins) {
          e.preventDefault()
          e.stopPropagation()
          removeLastPin()
        } else {
          // Let App.jsx handle navigation
          onEscapeWhenNoPins?.()
        }
        return
      }

      // Delete: Remove last pin
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (hasPins) {
          e.preventDefault()
          removeLastPin()
        }
        return
      }

      // Arrow keys: Move active pin
      if (activePin !== null && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault()
        const delta = e.shiftKey ? 10 : 1

        switch (e.code) {
          case 'ArrowUp':
            moveActivePin(0, delta) // Y+ is up in grid coords
            break
          case 'ArrowDown':
            moveActivePin(0, -delta) // Y- is down in grid coords
            break
          case 'ArrowLeft':
            moveActivePin(-delta, 0)
            break
          case 'ArrowRight':
            moveActivePin(delta, 0)
            break
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isGridVisible,
    hasPins,
    activePin,
    cycleGridMode,
    toggleMeasurementMode,
    removeLastPin,
    moveActivePin,
    onEscapeWhenNoPins
  ])

  // Click handling for pin placement
  useEffect(() => {
    if (!isGridVisible) return

    const handleClick = (e) => {
      // Skip if clicking on DevTools UI elements
      if (e.target.closest('[data-devtools]')) return
      if (e.target.closest('.panel-control')) return

      // Skip if clicking on interactive elements
      if (isInputElement(e.target)) return
      if (e.target.closest('button')) return
      if (e.target.closest('a')) return
      if (e.target.closest('select')) return

      // Calculate grid coordinates
      const gridPos = screenToGrid(
        e.clientX,
        e.clientY,
        window.innerWidth,
        window.innerHeight
      )

      // Check for double-click
      const now = Date.now()
      const timeDiff = now - lastClickRef.current.time
      const distX = Math.abs(e.clientX - lastClickRef.current.x)
      const distY = Math.abs(e.clientY - lastClickRef.current.y)

      if (timeDiff < DOUBLE_CLICK_THRESHOLD && distX < 10 && distY < 10) {
        // Double-click - same behavior, just faster second pin
        placePin(gridPos.x, gridPos.y)
      } else {
        // Single click
        placePin(gridPos.x, gridPos.y)
      }

      lastClickRef.current = { time: now, x: e.clientX, y: e.clientY }
    }

    // Use capture phase to get clicks before other handlers
    window.addEventListener('click', handleClick, { capture: true })

    return () => {
      window.removeEventListener('click', handleClick, { capture: true })
    }
  }, [isGridVisible, placePin])

  // Don't render anything if grid is off
  if (!isGridVisible) return null

  return (
    <div data-devtools="root" style={{ pointerEvents: 'none' }}>
      <GridOverlay />
      <PinSystem />
      <MeasurementMode />
      <CoordinatePanel />
    </div>
  )
}

/**
 * Main DebugGridController component
 * Wraps everything in GridProvider
 */
function DebugGridController({ isVisible, onEscapeWhenNoPins }) {
  // Development mode check
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <GridProvider>
      <GridControllerInner
        isVisible={isVisible}
        onEscapeWhenNoPins={onEscapeWhenNoPins}
      />
    </GridProvider>
  )
}

/**
 * Inner component that can respond to isVisible prop changes
 */
function GridControllerInner({ isVisible, onEscapeWhenNoPins }) {
  const { gridMode, setMode, cycleGridMode } = useGrid()

  // Sync isVisible prop with grid mode (for backwards compatibility)
  useEffect(() => {
    // If externally set to visible and grid is off, turn it on
    if (isVisible && gridMode === GRID_MODES.OFF) {
      setMode(GRID_MODES.STANDARD)
    }
    // Note: We don't turn off when isVisible=false because
    // the grid can now be toggled with G key independently
  }, [isVisible, gridMode, setMode])

  // Handle Ctrl+G from App.jsx (backwards compatibility)
  useEffect(() => {
    const handleLegacyToggle = (e) => {
      if (e.ctrlKey && e.code === 'KeyG') {
        // Let the G key handler in GridController handle this instead
        // But if user prefers Ctrl+G, we'll support it too
        if (!isInputElement(document.activeElement)) {
          e.preventDefault()
          cycleGridMode()
        }
      }
    }

    window.addEventListener('keydown', handleLegacyToggle)
    return () => window.removeEventListener('keydown', handleLegacyToggle)
  }, [cycleGridMode])

  return <GridController onEscapeWhenNoPins={onEscapeWhenNoPins} />
}

export default DebugGridController
