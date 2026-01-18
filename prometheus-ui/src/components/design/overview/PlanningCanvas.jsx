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

// Flag to track if initial elements have been created
let initialElementsCreated = false

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
  onUnscheduleLesson,
  onUpdateDescription
}) {
  const canvasRef = useRef(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Description editing state
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editedDesc, setEditedDesc] = useState(courseData.description || '')

  // Handle description blur
  const handleDescBlur = useCallback(() => {
    setIsEditingDesc(false)
    if (editedDesc !== courseData.description) {
      onUpdateDescription?.(editedDesc)
    }
  }, [editedDesc, courseData.description, onUpdateDescription])

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

  // Auto-create initial 5-day timeline and note block when canvas first opens
  // Positioned LEFT-ALIGNED: Timeline 100px below buttons, NoteBlock below Timeline
  useEffect(() => {
    if (!initialElementsCreated && timelines.length === 0 && notes.length === 0) {
      initialElementsCreated = true

      // Add default 5-day timeline on LEFT side, 100px below buttons
      // Timeline uses transform: translate(-50%, 0), so x=450 puts left edge at ~75px
      // (with PIXELS_PER_UNIT=150 and 5 days, width=750px, so left edge = 450-375=75px)
      onAddTimeline?.({
        id: `timeline-${Date.now()}`,
        x: 450,  // Left-aligned (center point, with -50% transform)
        y: 120,  // 100px below buttons (buttons at ~2vh ≈ 20px)
        startUnit: 0,
        endUnit: 5,  // 5 days
        unitType: 'day'
      })

      // Add default note block below timeline, left-aligned
      // NoteBlock has NO centering transform, so x is left edge position
      setTimeout(() => {
        onAddNote?.({
          id: `note-${Date.now()}`,
          x: 75,   // Left edge aligned with timeline left edge
          y: 180,  // Below timeline
          widthUnits: 2,
          text: '',
          colorIndex: 0
        })
      }, 50)
    }
  }, [timelines.length, notes.length, onAddTimeline, onAddNote])

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
      {/* 12-Column Day Grid Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`col-${i}`}
            style={{
              flex: 1,
              borderRight: i < 11 ? `1px solid ${THEME.BORDER}20` : 'none',
              height: '100%'
            }}
          />
        ))}
      </div>

      {/* Control Bar - Add Timeline / Add Note - positioned left */}
      <div
        style={{
          position: 'absolute',
          top: '2vh',
          left: '2vw',
          display: 'flex',
          gap: '1vw',
          zIndex: 50
        }}
      >
        <button
          onClick={handleAddTimeline}
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
          + TIMELINE
        </button>
        <button
          onClick={handleAddNote}
          style={{
            padding: '0.6vh 1vw',
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.TEXT_DIM,
            background: 'transparent',
            border: `1px solid ${THEME.TEXT_DIM}`,
            borderRadius: '1.5vh',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${THEME.TEXT_DIM}20`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          + NOTE
        </button>
      </div>

      {/* DESCRIPTION Window - positioned right side, moved up from OverviewHeader */}
      <div
        style={{
          position: 'absolute',
          right: '2vw',
          top: '2vh',
          width: '20vw',
          zIndex: 50
        }}
      >
        <label
          style={{
            fontSize: '1.375vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.15em',
            color: THEME.AMBER,
            display: 'block',
            marginBottom: '0.5vh',
            paddingLeft: '0'  // Label aligned with text content
          }}
        >
          DESCRIPTION
        </label>
        {isEditingDesc ? (
          <textarea
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            onBlur={handleDescBlur}
            autoFocus
            style={{
              width: '100%',
              minHeight: '6vh',
              padding: '0.8vh 0',  // No horizontal padding - text aligns with label
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.5vh',
              color: THEME.WHITE,
              background: 'transparent',
              border: 'none',  // No border per spec
              borderBottom: `1px solid ${THEME.AMBER}`,  // Subtle underline when editing
              resize: 'vertical',
              outline: 'none'
            }}
          />
        ) : (
          <p
            onClick={() => {
              setEditedDesc(courseData.description || '')
              setIsEditingDesc(true)
            }}
            style={{
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.5vh',
              color: THEME.TEXT_SECONDARY,
              margin: 0,
              padding: '0.8vh 0',  // No horizontal padding - text aligns with label
              background: 'transparent',
              minHeight: '6vh',
              maxHeight: '8vh',
              overflow: 'hidden',
              cursor: 'text',
              border: 'none',  // No border per spec
              transition: 'color 0.2s ease'
            }}
          >
            {courseData.description || 'Click to add description...'}
          </p>
        )}
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

      {/* Empty state notices removed per design spec */}

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
