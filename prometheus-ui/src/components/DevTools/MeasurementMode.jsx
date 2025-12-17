/**
 * MeasurementMode - Element bounding box overlay
 *
 * When active, hovering over UI elements shows:
 * - Bounding box outline
 * - Element dimensions (Width × Height)
 * - Top-left corner coordinates (in grid coordinates)
 * - Center point (optional)
 *
 * Toggle with 'M' key
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useGrid, screenToGrid, formatCoord } from './GridContext'

// Measurement overlay colors
const OVERLAY_COLORS = {
  box: 'rgba(255, 165, 0, 0.3)',       // Orange fill
  border: 'rgba(255, 165, 0, 0.8)',    // Orange border
  text: '#FFA500',                      // Orange text
  background: 'rgba(0, 0, 0, 0.85)'    // Label background
}

function MeasurementMode() {
  const { measurementMode, isGridVisible } = useGrid()

  // Currently measured element info
  const [measuredElement, setMeasuredElement] = useState(null)
  const lastElementRef = useRef(null)
  const rafRef = useRef(null)

  // Track mouse position and find element under cursor
  const handleMouseMove = useCallback((e) => {
    if (!measurementMode || !isGridVisible) return

    // Use requestAnimationFrame for performance
    if (rafRef.current) return

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null

      // Temporarily hide overlay to get element underneath
      const overlayElements = document.querySelectorAll('[data-measurement-overlay]')
      overlayElements.forEach(el => el.style.pointerEvents = 'none')

      // Get element at cursor position
      const element = document.elementFromPoint(e.clientX, e.clientY)

      // Restore overlay pointer events
      overlayElements.forEach(el => el.style.pointerEvents = 'auto')

      // Skip if same element or if it's part of DevTools
      if (
        element === lastElementRef.current ||
        !element ||
        element.closest('[data-devtools]') ||
        element.closest('[data-measurement-overlay]')
      ) {
        if (!element) {
          setMeasuredElement(null)
          lastElementRef.current = null
        }
        return
      }

      lastElementRef.current = element

      // Get bounding rect
      const rect = element.getBoundingClientRect()

      // Convert to grid coordinates (top-left corner)
      const gridTopLeft = screenToGrid(rect.left, rect.top, window.innerWidth, window.innerHeight)
      const gridBottomRight = screenToGrid(rect.right, rect.bottom, window.innerWidth, window.innerHeight)
      const gridCenter = screenToGrid(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        window.innerWidth,
        window.innerHeight
      )

      setMeasuredElement({
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        },
        gridTopLeft,
        gridBottomRight,
        gridCenter,
        tagName: element.tagName.toLowerCase(),
        className: element.className ? (typeof element.className === 'string' ? element.className.split(' ')[0] : '') : '',
        id: element.id || null
      })
    })
  }, [measurementMode, isGridVisible])

  // Set up mouse tracking
  useEffect(() => {
    if (!measurementMode || !isGridVisible) {
      setMeasuredElement(null)
      lastElementRef.current = null
      return
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [measurementMode, isGridVisible, handleMouseMove])

  // Don't render if not in measurement mode or no grid
  if (!measurementMode || !isGridVisible || !measuredElement) {
    return null
  }

  const { rect, gridTopLeft, gridCenter, tagName, className, id } = measuredElement

  // Build element identifier string
  let elementId = tagName
  if (id) elementId += `#${id}`
  if (className) elementId += `.${className}`

  return (
    <div data-measurement-overlay="true" style={{ pointerEvents: 'none' }}>
      {/* Bounding box overlay */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          background: OVERLAY_COLORS.box,
          border: `2px solid ${OVERLAY_COLORS.border}`,
          boxSizing: 'border-box',
          zIndex: 10005,
          pointerEvents: 'none'
        }}
      />

      {/* Center marker */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
          width: '8px',
          height: '8px',
          background: OVERLAY_COLORS.border,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10006,
          pointerEvents: 'none'
        }}
      />

      {/* Dimension label (top) */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top - 8}px`,
          transform: 'translate(-50%, -100%)',
          background: OVERLAY_COLORS.background,
          color: OVERLAY_COLORS.text,
          padding: '3px 8px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          zIndex: 10007,
          border: `1px solid ${OVERLAY_COLORS.border}`,
          pointerEvents: 'none'
        }}
      >
        {Math.round(rect.width)} × {Math.round(rect.height)}px
      </div>

      {/* Element identifier (bottom) */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.bottom + 8}px`,
          transform: 'translateX(-50%)',
          background: OVERLAY_COLORS.background,
          color: 'rgba(255, 165, 0, 0.7)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          zIndex: 10007,
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none'
        }}
      >
        {elementId}
      </div>

      {/* Top-left coordinate */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          transform: 'translate(-100%, -100%) translate(-4px, -4px)',
          background: OVERLAY_COLORS.background,
          color: OVERLAY_COLORS.text,
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          zIndex: 10007,
          border: `1px solid ${OVERLAY_COLORS.border}`,
          pointerEvents: 'none'
        }}
      >
        TL: {formatCoord(gridTopLeft.x)}, {formatCoord(gridTopLeft.y)}
      </div>

      {/* Center coordinate */}
      <div
        style={{
          position: 'fixed',
          left: `${rect.left + rect.width / 2}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translate(10px, -50%)',
          background: OVERLAY_COLORS.background,
          color: OVERLAY_COLORS.text,
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '9px',
          fontFamily: "'Fira Code', monospace",
          whiteSpace: 'nowrap',
          zIndex: 10007,
          pointerEvents: 'none'
        }}
      >
        C: {formatCoord(gridCenter.x)}, {formatCoord(gridCenter.y)}
      </div>

      {/* Width dimension line */}
      <svg
        style={{
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top - 20}px`,
          width: `${rect.width}px`,
          height: '16px',
          zIndex: 10006,
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <line
          x1="0"
          y1="8"
          x2={rect.width}
          y2="8"
          stroke={OVERLAY_COLORS.border}
          strokeWidth="1"
        />
        <line x1="0" y1="4" x2="0" y2="12" stroke={OVERLAY_COLORS.border} strokeWidth="1" />
        <line x1={rect.width} y1="4" x2={rect.width} y2="12" stroke={OVERLAY_COLORS.border} strokeWidth="1" />
      </svg>

      {/* Height dimension line */}
      <svg
        style={{
          position: 'fixed',
          left: `${rect.right + 4}px`,
          top: `${rect.top}px`,
          width: '16px',
          height: `${rect.height}px`,
          zIndex: 10006,
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <line
          x1="8"
          y1="0"
          x2="8"
          y2={rect.height}
          stroke={OVERLAY_COLORS.border}
          strokeWidth="1"
        />
        <line x1="4" y1="0" x2="12" y2="0" stroke={OVERLAY_COLORS.border} strokeWidth="1" />
        <line x1="4" y1={rect.height} x2="12" y2={rect.height} stroke={OVERLAY_COLORS.border} strokeWidth="1" />
      </svg>
    </div>
  )
}

export default MeasurementMode
