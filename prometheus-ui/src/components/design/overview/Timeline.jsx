/**
 * Timeline.jsx - Floating Course Timeline for OVERVIEW Planning
 *
 * Features:
 * - Centered at Y=0, X=0 on initial open
 * - Width: 1000px (-500 to +500)
 * - Color: Luminous Green (#00FF00)
 * - Floating: Drag to move anywhere
 * - Resizable: Drag either end to extend/shorten
 * - Division labels above (Day 1, Day 2, etc.)
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { THEME } from '../../../constants/theme'

// Calculate unit type based on course duration
function getUnitType(totalDays) {
  if (totalDays <= 10) return 'day'
  if (totalDays <= 42) return 'week' // 6 weeks
  return 'month'
}

// Calculate number of divisions based on course duration
function getDivisions(totalDays, unitType) {
  if (unitType === 'day') return totalDays
  if (unitType === 'week') return Math.ceil(totalDays / 5) // 5 working days per week
  return Math.ceil(totalDays / 20) // ~20 working days per month
}

// Format division label
function formatDivisionLabel(index, unitType) {
  const labels = {
    day: `Day ${index + 1}`,
    week: `Week ${index + 1}`,
    month: `Month ${index + 1}`
  }
  return labels[unitType]
}

function Timeline({
  id,
  x = 0,
  y = 0,
  startUnit = 0,
  endUnit = 5,
  unitType = 'day',
  totalDays = 5,
  onUpdate,
  onRemove,
  canvasRef,
  panOffset = { x: 0, y: 0 }
}) {
  const [position, setPosition] = useState({ x, y })
  const [units, setUnits] = useState({ start: startUnit, end: endUnit })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(null) // 'left' | 'right' | null
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }) // Store initial position
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 }) // Store initial mouse position
  const [unitsStart, setUnitsStart] = useState({ start: 0, end: 5 }) // Store initial units for resize
  const timelineRef = useRef(null)

  // Calculate dimensions
  const numDivisions = units.end - units.start
  const pixelsPerUnit = 1000 / Math.max(1, numDivisions) // Base width 1000px
  const timelineWidth = numDivisions * pixelsPerUnit

  // Sync position from props
  useEffect(() => {
    setPosition({ x, y })
  }, [x, y])

  useEffect(() => {
    setUnits({ start: startUnit, end: endUnit })
  }, [startUnit, endUnit])

  // Handle timeline drag - use delta-based movement
  const handleDragStart = useCallback((e) => {
    if (isResizing) return
    e.preventDefault()
    setIsDragging(true)
    // Store starting position and mouse position for delta calculation
    setDragStart({ x: position.x, y: position.y })
    setMouseStart({ x: e.clientX, y: e.clientY })
  }, [isResizing, position])

  // Handle resize start - store initial units for delta calculation
  const handleResizeStart = useCallback((e, side) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(side)
    setMouseStart({ x: e.clientX, y: 0 })
    setUnitsStart({ start: units.start, end: units.end })
  }, [units])

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
        // Resize timeline using cumulative delta from initial position
        const deltaPixels = e.clientX - mouseStart.x
        // Use initial pixelsPerUnit to calculate deltaUnits consistently
        const initialNumDivisions = unitsStart.end - unitsStart.start
        const initialPixelsPerUnit = 1000 / Math.max(1, initialNumDivisions)
        const deltaUnits = Math.round(deltaPixels / initialPixelsPerUnit)

        if (isResizing === 'left') {
          const newStart = Math.max(0, unitsStart.start + deltaUnits)
          if (newStart < unitsStart.end) {
            setUnits({ start: newStart, end: unitsStart.end })
          }
        } else {
          const newEnd = Math.max(unitsStart.start + 1, unitsStart.end + deltaUnits)
          setUnits({ start: unitsStart.start, end: newEnd })
        }
      }
    }

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        onUpdate?.(id, {
          x: position.x,
          y: position.y,
          startUnit: units.start,
          endUnit: units.end
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
  }, [isDragging, isResizing, mouseStart, dragStart, position, units, unitsStart, pixelsPerUnit, id, onUpdate])

  // Generate division labels
  const divisions = []
  for (let i = units.start; i <= units.end; i++) {
    divisions.push({
      index: i,
      label: formatDivisionLabel(i, unitType),
      position: ((i - units.start) / numDivisions) * 100
    })
  }

  return (
    <div
      ref={timelineRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)', // Center horizontally
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging ? 100 : 10
      }}
    >
      {/* Division Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: `${timelineWidth}px`,
          marginBottom: '4px',
          pointerEvents: 'none'
        }}
      >
        {divisions.map((div, idx) => (
          <span
            key={div.index}
            style={{
              fontSize: '1.2vh',
              fontFamily: THEME.FONT_MONO,
              color: THEME.TEXT_DIM,
              whiteSpace: 'nowrap',
              transform: idx === divisions.length - 1 ? 'translateX(-100%)' : 'none'
            }}
          >
            {div.label}
          </span>
        ))}
      </div>

      {/* Timeline Line */}
      <div
        onMouseDown={handleDragStart}
        style={{
          width: `${timelineWidth}px`,
          height: '4px',
          background: THEME.AMBER,
          borderRadius: '2px',
          position: 'relative',
          /* No glow effect per design spec */
        }}
      >
        {/* Division markers */}
        {divisions.map((div, idx) => (
          idx > 0 && idx < divisions.length - 1 && (
            <div
              key={`marker-${div.index}`}
              style={{
                position: 'absolute',
                left: `${div.position}%`,
                top: '-3px',
                width: '2px',
                height: '10px',
                background: THEME.AMBER,
                borderRadius: '1px'
              }}
            />
          )
        ))}

        {/* Left Resize Handle */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'left')}
          style={{
            position: 'absolute',
            left: '-8px',
            top: '-6px',
            width: '16px',
            height: '16px',
            background: THEME.BG_DARK,
            border: `2px solid ${THEME.AMBER}`,
            borderRadius: '50%',
            cursor: 'ew-resize',
            zIndex: 5
          }}
        />

        {/* Right Resize Handle */}
        <div
          onMouseDown={(e) => handleResizeStart(e, 'right')}
          style={{
            position: 'absolute',
            right: '-8px',
            top: '-6px',
            width: '16px',
            height: '16px',
            background: THEME.BG_DARK,
            border: `2px solid ${THEME.AMBER}`,
            borderRadius: '50%',
            cursor: 'ew-resize',
            zIndex: 5
          }}
        />
      </div>

      {/* Remove Button (visible on hover) */}
      <button
        onClick={() => onRemove?.(id)}
        style={{
          position: 'absolute',
          right: '-24px',
          top: '-4px',
          width: '16px',
          height: '16px',
          background: 'rgba(255, 68, 68, 0.8)',
          border: 'none',
          borderRadius: '50%',
          color: '#fff',
          fontSize: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.6,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
      >
        ×
      </button>
    </div>
  )
}

export default Timeline
