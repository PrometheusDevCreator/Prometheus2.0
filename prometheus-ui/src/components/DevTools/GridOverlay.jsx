/**
 * GridOverlay - Visual grid with coordinate system
 *
 * Features:
 * - Centre origin (0,0) with Cartesian Y-axis
 * - Standard mode: 100px gridlines with labels
 * - Fine mode: 50px gridlines with tick marks
 * - Adjustable opacity
 * - Origin marker (red X)
 * - Axis labels every 100 units
 *
 * Coordinate System:
 * - Origin at viewport centre
 * - X: negative left, positive right (±960 at 1920 width)
 * - Y: positive up, negative down (Cartesian)
 */

import { useMemo } from 'react'
import { useGrid, GRID_MODES } from './GridContext'

// Grid visual constants
const GRID_COLORS = {
  primaryLine: 'rgba(0, 255, 255, 0.25)',    // 100px lines
  secondaryLine: 'rgba(0, 255, 255, 0.12)',  // 50px lines
  centerLine: 'rgba(0, 255, 255, 0.5)',      // X=0 and Y=0 axes
  label: 'rgba(0, 255, 255, 0.8)',           // Axis labels
  labelMuted: 'rgba(0, 255, 255, 0.5)',      // Secondary labels
  originMarker: '#FF4444'                     // Red X at origin
}

const LABEL_FONT = "'Fira Code', 'Cascadia Code', Consolas, monospace"

/**
 * Generate gridlines for the overlay
 */
function generateGridLines(gridMode, viewportWidth, viewportHeight, opacity) {
  const lines = []
  const spacing = gridMode === GRID_MODES.FINE ? 50 : 100
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // Calculate how many lines we need in each direction
  const maxLinesX = Math.ceil(centerX / spacing) + 1
  const maxLinesY = Math.ceil(centerY / spacing) + 1

  // Vertical lines (X axis)
  for (let i = -maxLinesX; i <= maxLinesX; i++) {
    const x = centerX + (i * spacing)
    const isPrimary = i % (gridMode === GRID_MODES.FINE ? 2 : 1) === 0
    const isCenter = i === 0

    lines.push({
      key: `v-${i}`,
      type: 'vertical',
      position: x,
      isPrimary,
      isCenter,
      gridValue: i * spacing
    })
  }

  // Horizontal lines (Y axis)
  for (let i = -maxLinesY; i <= maxLinesY; i++) {
    const y = centerY + (i * spacing)
    const isPrimary = i % (gridMode === GRID_MODES.FINE ? 2 : 1) === 0
    const isCenter = i === 0

    lines.push({
      key: `h-${i}`,
      type: 'horizontal',
      position: y,
      isPrimary,
      isCenter,
      gridValue: -i * spacing // Negative because screen Y is inverted
    })
  }

  return lines
}

function GridOverlay() {
  const { gridMode, gridOpacity, isGridVisible } = useGrid()

  // Memoize grid lines calculation
  const gridLines = useMemo(() => {
    if (!isGridVisible) return []

    // Use window dimensions (will update on resize via parent)
    const vw = window.innerWidth
    const vh = window.innerHeight

    return generateGridLines(gridMode, vw, vh, gridOpacity)
  }, [gridMode, gridOpacity, isGridVisible])

  if (!isGridVisible) return null

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // Determine if we show labels (only on primary lines = every 100px)
  const showLabels = (line) => {
    if (gridMode === GRID_MODES.FINE) {
      // In fine mode, only show labels every 100px (every other line)
      return line.isPrimary && line.gridValue % 100 === 0
    }
    return true // In standard mode, show all labels
  }

  return (
    <div
      data-devtools="grid-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: gridOpacity
      }}
    >
      {/* Grid lines */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        {gridLines.map((line) => {
          const lineColor = line.isCenter
            ? GRID_COLORS.centerLine
            : line.isPrimary
              ? GRID_COLORS.primaryLine
              : GRID_COLORS.secondaryLine

          const strokeWidth = line.isCenter ? 2 : line.isPrimary ? 1 : 0.5

          if (line.type === 'vertical') {
            return (
              <line
                key={line.key}
                x1={line.position}
                y1={0}
                x2={line.position}
                y2={viewportHeight}
                stroke={lineColor}
                strokeWidth={strokeWidth}
              />
            )
          } else {
            return (
              <line
                key={line.key}
                x1={0}
                y1={line.position}
                x2={viewportWidth}
                y2={line.position}
                stroke={lineColor}
                strokeWidth={strokeWidth}
              />
            )
          }
        })}
      </svg>

      {/* Axis labels */}
      {gridLines
        .filter(line => !line.isCenter && showLabels(line) && line.gridValue !== 0)
        .map((line) => {
          const labelValue = line.gridValue
          const displayValue = labelValue >= 0 ? `+${labelValue}` : `${labelValue}`

          if (line.type === 'vertical') {
            // X-axis labels (along the horizontal center line)
            return (
              <div
                key={`label-${line.key}`}
                style={{
                  position: 'absolute',
                  left: `${line.position}px`,
                  top: `${centerY + 4}px`,
                  transform: 'translateX(-50%)',
                  color: GRID_COLORS.label,
                  fontSize: '10px',
                  fontFamily: LABEL_FONT,
                  whiteSpace: 'nowrap'
                }}
              >
                {displayValue}
              </div>
            )
          } else {
            // Y-axis labels (along the vertical center line)
            return (
              <div
                key={`label-${line.key}`}
                style={{
                  position: 'absolute',
                  left: `${centerX + 4}px`,
                  top: `${line.position}px`,
                  transform: 'translateY(-50%)',
                  color: GRID_COLORS.label,
                  fontSize: '10px',
                  fontFamily: LABEL_FONT,
                  whiteSpace: 'nowrap'
                }}
              >
                {displayValue}
              </div>
            )
          }
        })}

      {/* Origin marker (red X) */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY}px`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          {/* X marker */}
          <line
            x1="4"
            y1="4"
            x2="20"
            y2="20"
            stroke={GRID_COLORS.originMarker}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="4"
            x2="4"
            y2="20"
            stroke={GRID_COLORS.originMarker}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Origin label */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: `${centerY + 16}px`,
          transform: 'translateX(-50%)',
          color: GRID_COLORS.originMarker,
          fontSize: '10px',
          fontFamily: LABEL_FONT,
          fontWeight: '600',
          textShadow: '0 0 4px rgba(0,0,0,0.8)'
        }}
      >
        ORIGIN (0, 0)
      </div>

      {/* Axis indicators at edges */}
      {/* X-axis indicator (right edge) */}
      <div
        style={{
          position: 'absolute',
          right: '10px',
          top: `${centerY}px`,
          transform: 'translateY(-50%)',
          color: GRID_COLORS.centerLine,
          fontSize: '12px',
          fontFamily: LABEL_FONT,
          fontWeight: '600'
        }}
      >
        X+
      </div>

      {/* X-axis indicator (left edge) */}
      <div
        style={{
          position: 'absolute',
          left: '10px',
          top: `${centerY}px`,
          transform: 'translateY(-50%)',
          color: GRID_COLORS.centerLine,
          fontSize: '12px',
          fontFamily: LABEL_FONT,
          fontWeight: '600'
        }}
      >
        X-
      </div>

      {/* Y-axis indicator (top edge) */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          top: '10px',
          transform: 'translateX(-50%)',
          color: GRID_COLORS.centerLine,
          fontSize: '12px',
          fontFamily: LABEL_FONT,
          fontWeight: '600'
        }}
      >
        Y+
      </div>

      {/* Y-axis indicator (bottom edge) */}
      <div
        style={{
          position: 'absolute',
          left: `${centerX}px`,
          bottom: '10px',
          transform: 'translateX(-50%)',
          color: GRID_COLORS.centerLine,
          fontSize: '12px',
          fontFamily: LABEL_FONT,
          fontWeight: '600'
        }}
      >
        Y-
      </div>
    </div>
  )
}

export default GridOverlay
