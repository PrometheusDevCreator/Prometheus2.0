/**
 * PlanningCanvas.jsx - Main Canvas for OVERVIEW Tab Planning
 *
 * Features:
 * - Floating Timeline and NoteBlock elements
 * - Add Timeline / Add Note controls
 * - Infinite pan (drag canvas to pan)
 * - No grid alignment (free-form planning tool)
 * - UNALLOCATED panel integration
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../../../constants/theme'
import Timeline from './Timeline'
import NoteBlock from './NoteBlock'
import UnallocatedLessonsPanel from '../UnallocatedLessonsPanel'

// Default pixels per unit for note sizing
const DEFAULT_PIXELS_PER_UNIT = 100

function PlanningCanvas({
  courseData = {},
  timelines = [],
  notes = [],
  colorLabels = {},
  onAddTimeline,
  onRemoveTimeline,
  onUpdateTimeline,
  onAddNote,
  onRemoveNote,
  onUpdateNote,
  onUpdateColorLabel,
  lessonTypes = [],
  unscheduledLessons = [],
  onUnscheduleLesson
}) {
  const canvasRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Calculate unit type based on course duration
  const totalDays = courseData?.days || 5
  const unitType = totalDays <= 10 ? 'day' : (totalDays <= 42 ? 'week' : 'month')
  const numUnits = unitType === 'day' ? totalDays :
                   unitType === 'week' ? Math.ceil(totalDays / 5) :
                   Math.ceil(totalDays / 20)

  // Handle canvas pan start (middle mouse or shift+left click)
  const handleMouseDown = useCallback((e) => {
    // Only pan with middle mouse button or shift+left click on canvas background
    if (e.target === canvasRef.current && (e.button === 1 || (e.shiftKey && e.button === 0))) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y
      })
    }
  }, [panOffset])

  // Handle pan movement
  useEffect(() => {
    if (!isPanning) return

    const handleMouseMove = (e) => {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    }

    const handleMouseUp = () => {
      setIsPanning(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning, panStart])

  // Handle adding a new timeline
  const handleAddTimeline = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const centerX = canvasRect ? canvasRect.width / 2 : 500
    const centerY = canvasRect ? canvasRect.height / 2 : 200

    onAddTimeline?.({
      id: `timeline-${Date.now()}`,
      x: centerX - panOffset.x,
      y: centerY - panOffset.y,
      startUnit: 0,
      endUnit: numUnits,
      unitType
    })
  }, [onAddTimeline, numUnits, unitType, panOffset])

  // Handle adding a new note
  const handleAddNote = useCallback(() => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    const centerX = canvasRect ? canvasRect.width / 2 : 500
    const centerY = canvasRect ? canvasRect.height / 2 + 50 : 250

    onAddNote?.({
      id: `note-${Date.now()}`,
      x: centerX - panOffset.x,
      y: centerY - panOffset.y,
      widthUnits: 1,
      text: '',
      colorIndex: 0
    })
  }, [onAddNote, panOffset])

  // Calculate pixels per unit from first timeline or use default
  const pixelsPerUnit = timelines.length > 0
    ? 1000 / Math.max(1, timelines[0].endUnit - timelines[0].startUnit)
    : DEFAULT_PIXELS_PER_UNIT

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: THEME.BG_DARK,
        cursor: isPanning ? 'grabbing' : 'default'
      }}
    >
      {/* Control Bar - Add Timeline / Add Note */}
      <div
        style={{
          position: 'absolute',
          top: '1vh',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1vw',
          zIndex: 50,
          background: 'rgba(20, 20, 20, 0.9)',
          padding: '0.8vh 1.5vw',
          borderRadius: '2vh',
          border: `1px solid ${THEME.BORDER}`
        }}
      >
        <button
          onClick={handleAddTimeline}
          style={{
            padding: '0.6vh 1vw',
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.GREEN_BRIGHT,
            background: 'transparent',
            border: `1px solid ${THEME.GREEN_BRIGHT}`,
            borderRadius: '1.5vh',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${THEME.GREEN_BRIGHT}20`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          + TIMELINE
        </button>
        <button
          onClick={handleAddNote}
          style={{
            padding: '0.6vh 1vw',
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.AMBER,
            background: 'transparent',
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '1.5vh',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${THEME.AMBER}20`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          + NOTE
        </button>
      </div>

      {/* Panned Content Layer */}
      <div
        style={{
          position: 'absolute',
          left: `${panOffset.x}px`,
          top: `${panOffset.y}px`,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {/* Timelines */}
        {timelines.map(timeline => (
          <div key={timeline.id} style={{ pointerEvents: 'auto' }}>
            <Timeline
              id={timeline.id}
              x={timeline.x}
              y={timeline.y}
              startUnit={timeline.startUnit}
              endUnit={timeline.endUnit}
              unitType={timeline.unitType || unitType}
              totalDays={totalDays}
              onUpdate={onUpdateTimeline}
              onRemove={onRemoveTimeline}
            />
          </div>
        ))}

        {/* Note Blocks */}
        {notes.map(note => (
          <div key={note.id} style={{ pointerEvents: 'auto' }}>
            <NoteBlock
              id={note.id}
              x={note.x}
              y={note.y}
              widthUnits={note.widthUnits}
              text={note.text}
              colorIndex={note.colorIndex}
              pixelsPerUnit={pixelsPerUnit}
              colorLabels={colorLabels}
              onUpdate={onUpdateNote}
              onRemove={onRemoveNote}
              onUpdateColorLabel={onUpdateColorLabel}
            />
          </div>
        ))}
      </div>

      {/* Empty State - Show when no elements */}
      {timelines.length === 0 && notes.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            fontSize: '1.5vh',
            pointerEvents: 'none'
          }}
        >
          <p style={{ margin: '0 0 1vh 0', color: THEME.GREEN_BRIGHT }}>
            COURSE PLANNING CANVAS
          </p>
          <p style={{ margin: 0 }}>
            Click "+ TIMELINE" to add a course timeline
          </p>
          <p style={{ margin: '0.5vh 0 0 0' }}>
            Click "+ NOTE" to add planning notes
          </p>
          <p style={{ margin: '1vh 0 0 0', fontSize: '1.2vh' }}>
            Shift+drag or middle-mouse to pan
          </p>
        </div>
      )}

      {/* Unallocated Lessons Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '1vh',
          right: '1vw',
          zIndex: 50
        }}
      >
        <UnallocatedLessonsPanel
          lessons={unscheduledLessons}
          lessonTypes={lessonTypes}
          onUnscheduleLesson={onUnscheduleLesson}
        />
      </div>

      {/* Pan indicator when panning */}
      {isPanning && (
        <div
          style={{
            position: 'absolute',
            bottom: '1vh',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.5vh 1vw',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '1vh',
            color: THEME.TEXT_DIM,
            fontSize: '1.1vh',
            fontFamily: THEME.FONT_MONO,
            zIndex: 100
          }}
        >
          Panning: ({Math.round(panOffset.x)}, {Math.round(panOffset.y)})
        </div>
      )}
    </div>
  )
}

export default PlanningCanvas
