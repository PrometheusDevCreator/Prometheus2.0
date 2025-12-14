/**
 * OutlinePlanner Page - DESIGN Page (Slide 4 of Mockup 2.1)
 *
 * Layout:
 * - Top: Module/Week navigation (centered), Time sliders
 * - Middle: Timetable grid with draggable lesson/break bubbles
 * - Bottom Left: Lesson Planner (title, LO circles, time, topics, subtopics)
 * - Bottom Right: Learning Objectives tote
 *
 * Features:
 * - Draggable/resizable lesson bubbles with 5-min snapping
 * - Break bubbles (no title edit)
 * - LO linking via clickable circles
 * - Topics/Subtopics hierarchical management with commit behavior
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'
import pkeButton from '../assets/PKE_Button.png'
import breakSymbol from '../assets/Break_Symbol.png'

// Constants
const SNAP_MINUTES = 5 // Snap to 5-minute increments
const HOUR_WIDTH = 100 // Width of each hour column in pixels
const DAY_HEIGHT = 50 // Height of each day row
const DAY_LABEL_WIDTH = 60 // Width of day label column
const TIMETABLE_TOTAL_WIDTH = 1140 // Fixed width: X:-570 to X:+570
const NUM_DAYS_ALWAYS = 5 // Always show 5 day rows

function OutlinePlanner({ onNavigate, courseData, courseLoaded, user, courseState }) {
  const [isPKEActive, setIsPKEActive] = useState(false)

  // Module/Week navigation
  const [currentModule, setCurrentModule] = useState(1)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [totalModules] = useState(1)
  const [totalWeeks] = useState(1)

  // Time range (in hours, 24h format)
  const [dayStartTime, setDayStartTime] = useState(8) // 0800
  const [dayEndTime, setDayEndTime] = useState(16) // 1600

  // Number of days - always show 5 rows
  const numDays = NUM_DAYS_ALWAYS

  // Learning Objectives from DEFINE page
  const learningObjectives = courseData?.learningObjectives?.filter(lo => lo && lo.trim()) || [
    'EXPLAIN the course details',
    'ANALYSE the subject',
    'OPERATE the system',
    'SUPERVISE the personnel'
  ]

  // Lessons state
  const [lessons, setLessons] = useState([
    {
      id: 'lesson-1',
      title: 'INTRODUCTION',
      day: 1,
      startMinutes: 0,
      durationMinutes: 60,
      linkedLOs: [],
      topics: [],
      subtopics: []
    }
  ])

  // Breaks state
  const [breaks, setBreaks] = useState([])

  // Selected item
  const [selectedId, setSelectedId] = useState('lesson-1')
  const [selectedType, setSelectedType] = useState('lesson')

  // Editing state
  const [editingTitle, setEditingTitle] = useState(null)

  // Topic/Subtopic entry state
  const [topicEntryActive, setTopicEntryActive] = useState(false)
  const [subtopicEntryActive, setSubtopicEntryActive] = useState(false)
  const [topicEntryValue, setTopicEntryValue] = useState('')
  const [subtopicEntryValue, setSubtopicEntryValue] = useState('')
  const [editingTopicId, setEditingTopicId] = useState(null)
  const [editingSubtopicId, setEditingSubtopicId] = useState(null)

  // Hover states for labels
  const [hoveredLabel, setHoveredLabel] = useState(null)

  // Drag state
  const [dragState, setDragState] = useState(null)

  // Refs
  const timetableRef = useRef(null)
  const topicInputRef = useRef(null)
  const subtopicInputRef = useRef(null)

  // Get selected lesson
  const selectedLesson = lessons.find(l => l.id === selectedId)

  // Calculate time from minutes
  const minutesToTime = (minutes) => {
    const totalMinutes = dayStartTime * 60 + minutes
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}${mins.toString().padStart(2, '0')}`
  }

  // Calculate display time range
  const getTimeDisplay = (lesson) => {
    if (!lesson) return '----'
    const start = minutesToTime(lesson.startMinutes)
    const end = minutesToTime(lesson.startMinutes + lesson.durationMinutes)
    return `${start}-${end}`
  }

  // Generate hour columns
  const hours = []
  for (let h = dayStartTime; h <= dayEndTime; h++) {
    hours.push(h)
  }

  // Snap to 5-minute increments
  const snapToGrid = (minutes) => {
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES
  }

  // Convert pixel position to minutes
  const pixelToMinutes = (px) => {
    return (px / HOUR_WIDTH) * 60
  }

  // Convert minutes to pixel position
  const minutesToPixel = (minutes) => {
    return (minutes / 60) * HOUR_WIDTH
  }

  // Check for collision with other bubbles
  const checkCollision = (day, startMinutes, durationMinutes, excludeId) => {
    const endMinutes = startMinutes + durationMinutes
    const allItems = [...lessons, ...breaks]

    for (const item of allItems) {
      if (item.id === excludeId || item.day !== day) continue
      const itemEnd = item.startMinutes + item.durationMinutes

      if (startMinutes < itemEnd && endMinutes > item.startMinutes) {
        return item
      }
    }
    return null
  }

  // Find next available slot
  const findNextAvailableSlot = (day, startMinutes, durationMinutes, excludeId) => {
    let testStart = startMinutes
    const maxMinutes = (dayEndTime - dayStartTime) * 60

    while (testStart + durationMinutes <= maxMinutes) {
      if (!checkCollision(day, testStart, durationMinutes, excludeId)) {
        return testStart
      }
      testStart += SNAP_MINUTES
    }
    return startMinutes
  }

  // Handle bubble mouse down (start drag)
  const handleBubbleMouseDown = (e, id, type, action) => {
    if (editingTitle) return

    e.preventDefault()
    e.stopPropagation()

    const item = type === 'lesson'
      ? lessons.find(l => l.id === id)
      : breaks.find(b => b.id === id)

    if (!item) return

    setSelectedId(id)
    setSelectedType(type)

    setDragState({
      type: action,
      id,
      itemType: type,
      startX: e.clientX,
      startY: e.clientY,
      originalData: { ...item }
    })
  }

  // Handle mouse move during drag
  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragState.startX
      const deltaY = e.clientY - dragState.startY
      const deltaMinutes = pixelToMinutes(deltaX)

      const updateItem = dragState.itemType === 'lesson' ? setLessons : setBreaks

      updateItem(prev => prev.map(item => {
        if (item.id !== dragState.id) return item

        const original = dragState.originalData
        let newData = { ...item }

        if (dragState.type === 'move') {
          const dayDelta = Math.round(deltaY / DAY_HEIGHT)
          let newDay = Math.max(1, Math.min(numDays, original.day + dayDelta))
          let newStart = snapToGrid(original.startMinutes + deltaMinutes)
          newStart = Math.max(0, newStart)

          const collision = checkCollision(newDay, newStart, original.durationMinutes, item.id)
          if (collision) {
            newStart = findNextAvailableSlot(newDay, newStart, original.durationMinutes, item.id)
          }

          const maxStart = (dayEndTime - dayStartTime) * 60 - original.durationMinutes
          newStart = Math.min(newStart, maxStart)

          newData.day = newDay
          newData.startMinutes = newStart
        } else if (dragState.type === 'resize-left') {
          let newStart = snapToGrid(original.startMinutes + deltaMinutes)
          newStart = Math.max(0, newStart)
          const newDuration = original.durationMinutes + (original.startMinutes - newStart)

          if (newDuration >= SNAP_MINUTES) {
            newData.startMinutes = newStart
            newData.durationMinutes = newDuration
          }
        } else if (dragState.type === 'resize-right') {
          let newDuration = snapToGrid(original.durationMinutes + deltaMinutes)
          newDuration = Math.max(SNAP_MINUTES, newDuration)
          const maxDuration = (dayEndTime - dayStartTime) * 60 - original.startMinutes
          newDuration = Math.min(newDuration, maxDuration)
          newData.durationMinutes = newDuration
        }

        return newData
      }))
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, numDays, dayStartTime, dayEndTime])

  // Add new lesson after selected
  const addLesson = useCallback(() => {
    const selected = lessons.find(l => l.id === selectedId)
    const afterMinutes = selected
      ? selected.startMinutes + selected.durationMinutes
      : 0
    const day = selected?.day || 1

    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'NEW LESSON',
      day,
      startMinutes: findNextAvailableSlot(day, afterMinutes, 60, null),
      durationMinutes: 60,
      linkedLOs: [],
      topics: [],
      subtopics: []
    }

    setLessons(prev => [...prev, newLesson])
    setSelectedId(newLesson.id)
    setSelectedType('lesson')
  }, [selectedId, lessons])

  // Add break after last lesson on selected day
  const addBreak = useCallback(() => {
    const selected = lessons.find(l => l.id === selectedId)
    const day = selected?.day || 1
    const allItems = [...lessons, ...breaks].filter(i => i.day === day)
    const lastItem = allItems.sort((a, b) =>
      (b.startMinutes + b.durationMinutes) - (a.startMinutes + a.durationMinutes)
    )[0]

    const afterMinutes = lastItem
      ? lastItem.startMinutes + lastItem.durationMinutes
      : 0

    const newBreak = {
      id: `break-${Date.now()}`,
      title: 'BREAK',
      day,
      startMinutes: findNextAvailableSlot(day, afterMinutes, 15, null),
      durationMinutes: 15,
      linkedLOs: [],
      topics: [],
      subtopics: []
    }

    setBreaks(prev => [...prev, newBreak])
    setSelectedId(newBreak.id)
    setSelectedType('break')
  }, [lessons, breaks, selectedId])

  // Delete selected item
  const handleDelete = useCallback((e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (editingTitle || topicEntryActive || subtopicEntryActive) return
      if (document.activeElement.tagName === 'INPUT') return

      if (selectedType === 'break') {
        setBreaks(prev => prev.filter(b => b.id !== selectedId))
        setSelectedId(lessons[0]?.id || null)
        setSelectedType('lesson')
      }
    }
  }, [selectedId, selectedType, editingTitle, topicEntryActive, subtopicEntryActive, lessons])

  useEffect(() => {
    window.addEventListener('keydown', handleDelete)
    return () => window.removeEventListener('keydown', handleDelete)
  }, [handleDelete])

  // Toggle LO link for selected lesson
  const toggleLOLink = useCallback((loIndex) => {
    if (!selectedId || selectedType !== 'lesson') return

    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== selectedId) return lesson

      const linked = lesson.linkedLOs.includes(loIndex)
      return {
        ...lesson,
        linkedLOs: linked
          ? lesson.linkedLOs.filter(i => i !== loIndex)
          : [...lesson.linkedLOs, loIndex].sort((a, b) => a - b)
      }
    }))
  }, [selectedId, selectedType])

  // Update lesson title
  const updateLessonTitle = useCallback((id, newTitle) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === id ? { ...lesson, title: newTitle.toUpperCase() } : lesson
    ))
  }, [])

  // Commit topic entry
  const commitTopic = useCallback(() => {
    if (!selectedId || selectedType !== 'lesson' || !topicEntryValue.trim()) {
      setTopicEntryActive(false)
      setTopicEntryValue('')
      return
    }

    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== selectedId) return lesson

      const loPrefix = lesson.linkedLOs.length > 0 ? lesson.linkedLOs[0] + 1 : 1
      const topicNum = lesson.topics.length + 1

      return {
        ...lesson,
        topics: [...lesson.topics, {
          id: `topic-${Date.now()}`,
          number: `${loPrefix}.${topicNum}`,
          title: topicEntryValue.trim()
        }]
      }
    }))

    setTopicEntryActive(false)
    setTopicEntryValue('')
  }, [selectedId, selectedType, topicEntryValue])

  // Commit subtopic entry
  const commitSubtopic = useCallback(() => {
    if (!selectedId || selectedType !== 'lesson' || !subtopicEntryValue.trim()) {
      setSubtopicEntryActive(false)
      setSubtopicEntryValue('')
      return
    }

    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== selectedId) return lesson

      const lastTopic = lesson.topics[lesson.topics.length - 1]
      const topicNumber = lastTopic?.number || '1.1'
      const subtopicNum = lesson.subtopics.filter(st =>
        st.number.startsWith(topicNumber)
      ).length + 1

      return {
        ...lesson,
        subtopics: [...lesson.subtopics, {
          id: `subtopic-${Date.now()}`,
          number: `${topicNumber}.${subtopicNum}`,
          title: subtopicEntryValue.trim()
        }]
      }
    }))

    setSubtopicEntryActive(false)
    setSubtopicEntryValue('')
  }, [selectedId, selectedType, subtopicEntryValue])

  // Update topic title
  const updateTopicTitle = useCallback((topicId, newTitle) => {
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      topics: lesson.topics.map(topic =>
        topic.id === topicId ? { ...topic, title: newTitle } : topic
      )
    })))
    setEditingTopicId(null)
  }, [])

  // Update subtopic title
  const updateSubtopicTitle = useCallback((subtopicId, newTitle) => {
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      subtopics: lesson.subtopics.map(st =>
        st.id === subtopicId ? { ...st, title: newTitle } : st
      )
    })))
    setEditingSubtopicId(null)
  }, [])

  // Handle navigation
  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  // Calculate cumulative time
  const getCumulativeTime = () => {
    const totalMinutes = lessons.reduce((sum, l) => sum + l.durationMinutes, 0)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    if (mins === 0) return `${hours} hr`
    return `${hours}h ${mins}m`
  }

  // Get lesson number based on position
  const getLessonNumber = (lessonId) => {
    const sortedLessons = [...lessons].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      return a.startMinutes - b.startMinutes
    })
    return sortedLessons.findIndex(l => l.id === lessonId) + 1
  }

  // Find last linked LO index for underline positioning
  const getLastLinkedLO = () => {
    if (!selectedLesson) return -1
    return Math.max(...selectedLesson.linkedLOs, -1)
  }

  // Calculate timetable centering offset
  const getTimetableOffset = () => {
    const midTime = (dayStartTime + dayEndTime) / 2
    const midHourIndex = midTime - dayStartTime
    const midPixel = midHourIndex * HOUR_WIDTH
    return midPixel
  }

  // Render a bubble (lesson or break)
  const renderBubble = (item, type) => {
    const isSelected = selectedId === item.id && selectedType === type
    const left = minutesToPixel(item.startMinutes)
    const width = minutesToPixel(item.durationMinutes)
    const isBreak = type === 'break'

    return (
      <div
        key={item.id}
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${Math.max(width - 4, 40)}px`,
          height: '32px',
          background: isBreak
            ? (isSelected ? THEME.BG_MEDIUM : THEME.BG_INPUT)
            : (isSelected
                ? `linear-gradient(135deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST || '#5a2d00'} 100%)`
                : THEME.BG_MEDIUM),
          border: `1px solid ${isSelected ? THEME.AMBER : THEME.BORDER_GREY}`,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '0 8px',
          cursor: dragState ? 'grabbing' : 'grab',
          boxShadow: isSelected ? `0 0 12px rgba(212, 115, 12, 0.4)` : 'none',
          zIndex: isSelected ? 10 : 1,
          userSelect: 'none'
        }}
        onMouseDown={(e) => handleBubbleMouseDown(e, item.id, type, 'move')}
        onDoubleClick={() => {
          if (!isBreak) {
            setEditingTitle(item.id)
          }
        }}
      >
        {/* Left resize handle */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'ew-resize',
            borderRadius: '16px 0 0 16px'
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            handleBubbleMouseDown(e, item.id, type, 'resize-left')
          }}
        />

        {/* Break icon or Title */}
        {isBreak ? (
          <img
            src={breakSymbol}
            alt="Break"
            style={{
              width: '16px',
              height: '16px',
              opacity: 0.8
            }}
          />
        ) : editingTitle === item.id ? (
          <input
            autoFocus
            type="text"
            defaultValue={item.title}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: THEME.WHITE,
              fontSize: '14px',
              fontFamily: THEME.FONT_PRIMARY,
              textAlign: 'center',
              width: '100%'
            }}
            onBlur={(e) => {
              updateLessonTitle(item.id, e.target.value)
              setEditingTitle(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateLessonTitle(item.id, e.target.value)
                setEditingTitle(null)
              } else if (e.key === 'Escape') {
                setEditingTitle(null)
              }
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '14px',
              fontFamily: THEME.FONT_PRIMARY,
              color: isSelected ? THEME.WHITE : THEME.TEXT_SECONDARY,
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.title}
          </span>
        )}

        {/* Add button (only for lessons when selected) */}
        {isSelected && !isBreak && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              addLesson()
            }}
            style={{
              position: 'absolute',
              right: '-12px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: THEME.AMBER,
              border: 'none',
              color: THEME.WHITE,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
        )}

        {/* Right resize handle */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            cursor: 'ew-resize',
            borderRadius: '0 16px 16px 0'
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            handleBubbleMouseDown(e, item.id, type, 'resize-right')
          }}
        />
      </div>
    )
  }

  // Calculate timetable dimensions
  const timetableWidth = hours.length * HOUR_WIDTH

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_DARK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'auto',
        overflowY: 'hidden'
      }}
    >
      {/* PKE Button */}
      <div
        style={{
          position: 'absolute',
          top: '730px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        <img
          src={pkeButton}
          alt="PKE"
          onClick={() => setIsPKEActive(!isPKEActive)}
          style={{
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            opacity: isPKEActive ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 20px', overflow: 'visible', minWidth: '1200px' }}>

        {/* Module/Week Navigation - Centered and stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentModule(m => Math.max(1, m - 1))}
              disabled={currentModule <= 1}
              style={navButtonStyle}
            >
              -
            </button>
            <span style={{ color: THEME.AMBER, fontSize: '15px', letterSpacing: '3px', fontFamily: THEME.FONT_PRIMARY }}>
              Module: {currentModule}
            </span>
            <button
              onClick={() => setCurrentModule(m => Math.min(totalModules, m + 1))}
              disabled={currentModule >= totalModules}
              style={navButtonStyle}
            >
              +
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentWeek(w => Math.max(1, w - 1))}
              disabled={currentWeek <= 1}
              style={navButtonStyle}
            >
              &lt;
            </button>
            <span style={{ color: THEME.TEXT_SECONDARY, fontSize: '15px', letterSpacing: '3px', fontFamily: THEME.FONT_PRIMARY }}>
              WEEK {currentWeek}
            </span>
            <button
              onClick={() => setCurrentWeek(w => Math.min(totalWeeks, w + 1))}
              disabled={currentWeek >= totalWeeks}
              style={navButtonStyle}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Time Slider Row - aligned with timetable edges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '8px',
          position: 'relative'
        }}>
          <div style={{
            width: `${TIMETABLE_TOTAL_WIDTH}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Left side: Start time slider + Break button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO, minWidth: '40px' }}>
                {dayStartTime.toString().padStart(2, '0')}00
              </span>
              <div style={{ position: 'relative', width: '80px' }}>
                <input
                  type="range"
                  min={6}
                  max={12}
                  value={dayStartTime}
                  onChange={(e) => setDayStartTime(Math.min(parseInt(e.target.value), dayEndTime - 2))}
                  style={{ width: '100%', accentColor: THEME.AMBER }}
                />
              </div>
              {/* Break button - immediately right of start time slider */}
              <button
                onClick={addBreak}
                title="Add Break"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={breakSymbol}
                  alt="Add Break"
                  style={{
                    width: '24px',
                    height: '24px',
                    opacity: 0.8,
                    display: 'block'
                  }}
                />
              </button>
            </div>

            {/* Right side: End time slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '80px' }}>
                <input
                  type="range"
                  min={14}
                  max={22}
                  value={dayEndTime}
                  onChange={(e) => setDayEndTime(Math.max(parseInt(e.target.value), dayStartTime + 2))}
                  style={{ width: '100%', accentColor: THEME.AMBER }}
                />
              </div>
              <span style={{ fontSize: '14px', color: THEME.TEXT_DIM, fontFamily: THEME.FONT_MONO, minWidth: '40px' }}>
                {dayEndTime.toString().padStart(2, '0')}00
              </span>
            </div>
          </div>

          {/* Total Course Hours - centered on vertical centerline */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              fontSize: '14px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO
            }}>
              Total Course Hours:
            </span>
            <span style={{
              fontSize: '14px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO
            }}>
              {getCumulativeTime()}
            </span>
          </div>
        </div>

        {/* Timetable Grid - Centered, fixed width 950px */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <div
            ref={timetableRef}
            style={{
              width: `${TIMETABLE_TOTAL_WIDTH}px`,
              minWidth: `${TIMETABLE_TOTAL_WIDTH}px`,
              background: 'transparent',
              borderTop: `1px solid ${THEME.BORDER_GREY}`,
              position: 'relative'
            }}
          >
            {/* Hour Headers */}
            {(() => {
              const gridWidth = TIMETABLE_TOTAL_WIDTH - DAY_LABEL_WIDTH
              const columnWidth = gridWidth / hours.length
              return (
                <div style={{ display: 'flex', borderBottom: `1px solid ${THEME.BORDER_GREY}` }}>
                  <div style={{ width: `${DAY_LABEL_WIDTH}px`, flexShrink: 0 }} />
                  {hours.map(hour => (
                    <div
                      key={hour}
                      style={{
                        width: `${columnWidth}px`,
                        flexShrink: 0,
                        padding: '8px 0',
                        fontSize: '14px',
                        color: THEME.TEXT_DIM,
                        fontFamily: THEME.FONT_MONO,
                        textAlign: 'center',
                        borderLeft: `1px solid ${THEME.BORDER_GREY}`
                      }}
                    >
                      {hour.toString().padStart(2, '0')}00
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Day Rows */}
            {(() => {
              const gridWidth = TIMETABLE_TOTAL_WIDTH - DAY_LABEL_WIDTH
              const columnWidth = gridWidth / hours.length
              const pixelScale = gridWidth / ((dayEndTime - dayStartTime) * 60) // pixels per minute

              return Array.from({ length: numDays }, (_, i) => i + 1).map(day => (
                <div
                  key={day}
                  style={{
                    display: 'flex',
                    height: `${DAY_HEIGHT}px`,
                    borderBottom: `1px solid ${THEME.BORDER_GREY}`,
                    position: 'relative'
                  }}
                >
                  {/* Day Label */}
                  <div
                    style={{
                      width: `${DAY_LABEL_WIDTH}px`,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      fontSize: '14px',
                      color: THEME.TEXT_SECONDARY,
                      fontFamily: THEME.FONT_PRIMARY,
                      borderRight: `1px solid ${THEME.BORDER_GREY}`
                    }}
                  >
                    Day {day}
                  </div>

                  {/* Grid area for bubbles */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    {/* Grid columns (visual guides) */}
                    {hours.map((hour, idx) => (
                      <div
                        key={hour}
                        style={{
                          position: 'absolute',
                          left: `${idx * columnWidth}px`,
                          top: 0,
                          bottom: 0,
                          width: `${columnWidth}px`,
                          borderLeft: idx > 0 ? `1px solid ${THEME.BORDER_GREY}` : 'none',
                          opacity: 0.3
                        }}
                      />
                    ))}

                    {/* Lesson bubbles for this day */}
                    {lessons.filter(l => l.day === day).map(lesson => (
                      <div
                        key={lesson.id}
                        style={{
                          position: 'absolute',
                          left: `${lesson.startMinutes * pixelScale}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: `${Math.max(lesson.durationMinutes * pixelScale - 4, 40)}px`,
                          height: '32px',
                          background: selectedId === lesson.id
                            ? `linear-gradient(135deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST || '#5a2d00'} 100%)`
                            : THEME.BG_MEDIUM,
                          border: `1px solid ${selectedId === lesson.id ? THEME.AMBER : THEME.BORDER_GREY}`,
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 8px',
                          cursor: dragState ? 'grabbing' : 'grab',
                          boxShadow: selectedId === lesson.id ? `0 0 12px rgba(212, 115, 12, 0.4)` : 'none',
                          zIndex: selectedId === lesson.id ? 10 : 1,
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => handleBubbleMouseDown(e, lesson.id, 'lesson', 'move')}
                        onDoubleClick={() => setEditingTitle(lesson.id)}
                      >
                        {editingTitle === lesson.id ? (
                          <input
                            autoFocus
                            type="text"
                            defaultValue={lesson.title}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: THEME.WHITE,
                              fontSize: '14px',
                              fontFamily: THEME.FONT_PRIMARY,
                              textAlign: 'center',
                              width: '100%'
                            }}
                            onBlur={(e) => {
                              updateLessonTitle(lesson.id, e.target.value)
                              setEditingTitle(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateLessonTitle(lesson.id, e.target.value)
                                setEditingTitle(null)
                              } else if (e.key === 'Escape') {
                                setEditingTitle(null)
                              }
                            }}
                          />
                        ) : (
                          <span style={{
                            fontSize: '14px',
                            fontFamily: THEME.FONT_PRIMARY,
                            color: selectedId === lesson.id ? THEME.WHITE : THEME.TEXT_SECONDARY,
                            letterSpacing: '1px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {lesson.title}
                          </span>
                        )}
                        {selectedId === lesson.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); addLesson() }}
                            style={{
                              position: 'absolute',
                              right: '-12px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: THEME.AMBER,
                              border: 'none',
                              color: THEME.WHITE,
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Break bubbles for this day */}
                    {breaks.filter(b => b.day === day).map(brk => (
                      <div
                        key={brk.id}
                        style={{
                          position: 'absolute',
                          left: `${brk.startMinutes * pixelScale}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: `${Math.max(brk.durationMinutes * pixelScale - 4, 30)}px`,
                          height: '32px',
                          background: selectedId === brk.id ? THEME.BG_MEDIUM : THEME.BG_INPUT,
                          border: `1px solid ${selectedId === brk.id ? THEME.AMBER : THEME.BORDER_GREY}`,
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: dragState ? 'grabbing' : 'grab',
                          boxShadow: selectedId === brk.id ? `0 0 12px rgba(212, 115, 12, 0.4)` : 'none',
                          zIndex: selectedId === brk.id ? 10 : 1,
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => handleBubbleMouseDown(e, brk.id, 'break', 'move')}
                      >
                        <img src={breakSymbol} alt="Break" style={{ width: '16px', height: '16px', opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Bottom Section - Header Row with Labels - moved down 50px */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', marginTop: '50px' }}>

          {/* Header Row: LESSON | Lesson Info | LEARNING OBJECTIVES - using absolute positioning */}
          <div style={{
            position: 'relative',
            height: '30px',
            marginBottom: '0px'
          }}>
            {/* Lesson Navigator - moved down 100px, centered '+' over LESSON label at X:-655 */}
            <div style={{
              position: 'absolute',
              left: 'calc(50% - 697px)',
              top: 'calc(50% + 100px)',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}>
              <button style={navigatorButtonStyle}>↑</button>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button style={navigatorButtonStyle}>←</button>
                <button
                  style={{
                    ...navigatorButtonStyle,
                    background: 'transparent',
                    color: THEME.AMBER,
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  onClick={addLesson}
                >
                  +
                </button>
                <button style={navigatorButtonStyle}>→</button>
              </div>
              <button style={navigatorButtonStyle}>↓</button>
            </div>

            {/* LESSON label - left edge at X:-705 (moved left 40px) */}
            <span style={{
              ...secondaryHeadingStyle,
              position: 'absolute',
              left: 'calc(50% - 705px)',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              LESSON
            </span>

            {/* Lesson number and title - moved left 30px to X:-570 */}
            {selectedLesson && (
              <span style={{
                position: 'absolute',
                left: 'calc(50% - 570px)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '15px',
                color: THEME.AMBER,
                fontFamily: THEME.FONT_PRIMARY,
                letterSpacing: '2px'
              }}>
                {getLessonNumber(selectedLesson.id)}. {selectedLesson.title}
              </span>
            )}

            {/* Start-Stop time - swapped to X:-95 */}
            {selectedLesson && (
              <span style={{
                position: 'absolute',
                left: 'calc(50% - 95px)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: THEME.AMBER,
                fontFamily: THEME.FONT_MONO
              }}>
                {getTimeDisplay(selectedLesson)}
              </span>
            )}

            {/* Duration - after time, color changed to grey */}
            {selectedLesson && (
              <span style={{
                position: 'absolute',
                left: 'calc(50% + 15px)',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_MONO
              }}>
                ({selectedLesson.durationMinutes} Mins)
              </span>
            )}

            {/* LO Circles - swapped to X:+95 */}
            {selectedLesson && (
              <div style={{
                position: 'absolute',
                left: 'calc(50% + 150px)',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', color: THEME.TEXT_DIM }}>LO</span>
                {learningObjectives.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleLOLink(idx)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: selectedLesson.linkedLOs.includes(idx) ? THEME.AMBER : 'transparent',
                      border: `1px solid ${selectedLesson.linkedLOs.includes(idx) ? THEME.AMBER : THEME.BORDER_GREY}`,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            )}

            {/* LEARNING OBJECTIVES label - right edge at X:+695 (moved right 30px) */}
            <span style={{
              ...secondaryHeadingStyle,
              position: 'absolute',
              right: 'calc(50% - 695px)',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              LEARNING OBJECTIVES
            </span>
          </div>

          {/* Horizontal Orange Line - spanning X:-715 to X:+715 (1430px) */}
          <div style={{
            width: '1430px',
            height: '1px',
            background: THEME.AMBER,
            alignSelf: 'center',
            marginBottom: '12px'
          }} />

          {/* Content Row: Topics/Subtopics | LO List - using absolute positioning */}
          <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>

            {/* TOPICS + label and entry - left edge at X:-570 */}
            <div style={{
              position: 'absolute',
              left: 'calc(50% - 570px)',
              top: '0',
              width: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* TOPICS + header with line directly below */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    letterSpacing: '3px',
                    color: hoveredLabel === 'topics' || topicEntryActive ? THEME.AMBER : THEME.TEXT_DIM,
                    fontFamily: THEME.FONT_PRIMARY,
                    transition: 'color 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={() => setHoveredLabel('topics')}
                  onMouseLeave={() => setHoveredLabel(null)}
                >
                  TOPICS
                </span>
                <button
                  onClick={() => {
                    setTopicEntryActive(true)
                    setTimeout(() => topicInputRef.current?.focus(), 0)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.AMBER,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                >
                  +
                </button>
              </div>

              {/* Line directly below header */}
              <div style={{
                height: '1px',
                background: topicEntryActive ? '#00ff00' : THEME.BORDER_GREY,
                transition: 'background 0.2s ease',
                marginTop: '2px',
                marginBottom: '4px'
              }} />

              {/* Entry input */}
              <input
                ref={topicInputRef}
                type="text"
                value={topicEntryValue}
                onChange={(e) => setTopicEntryValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTopic()
                  if (e.key === 'Escape') {
                    setTopicEntryActive(false)
                    setTopicEntryValue('')
                  }
                }}
                onBlur={() => {
                  if (!topicEntryValue.trim()) {
                    setTopicEntryActive(false)
                  }
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: THEME.WHITE,
                  fontSize: '14px',
                  fontFamily: THEME.FONT_PRIMARY,
                  padding: '4px 0'
                }}
              />

              {/* Committed topics list */}
              <div style={{ marginTop: '8px', overflow: 'auto', maxHeight: '150px' }}>
                {selectedLesson?.topics.map(topic => (
                  <div
                    key={topic.id}
                    style={{
                      fontSize: '14px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '8px'
                    }}
                    onDoubleClick={() => setEditingTopicId(topic.id)}
                  >
                    <span style={{ color: '#00ff00' }}>{topic.number}</span>
                    {editingTopicId === topic.id ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={topic.title}
                        style={inlineEditStyle}
                        onBlur={(e) => updateTopicTitle(topic.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateTopicTitle(topic.id, e.target.value)
                        }}
                      />
                    ) : (
                      <span style={{ color: THEME.OFF_WHITE }}>{topic.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SUBTOPICS + label and entry - left edge at X:-95 */}
            <div style={{
              position: 'absolute',
              left: 'calc(50% - 95px)',
              top: '0',
              width: '400px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* SUBTOPICS + header with line directly below */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '15px',
                    letterSpacing: '3px',
                    color: hoveredLabel === 'subtopics' || subtopicEntryActive ? THEME.AMBER : THEME.TEXT_DIM,
                    fontFamily: THEME.FONT_PRIMARY,
                    transition: 'color 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={() => setHoveredLabel('subtopics')}
                  onMouseLeave={() => setHoveredLabel(null)}
                >
                  SUBTOPICS
                </span>
                <button
                  onClick={() => {
                    setSubtopicEntryActive(true)
                    setTimeout(() => subtopicInputRef.current?.focus(), 0)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.AMBER,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                >
                  +
                </button>
              </div>

              {/* Line directly below header */}
              <div style={{
                height: '1px',
                background: subtopicEntryActive ? '#00ff00' : THEME.BORDER_GREY,
                transition: 'background 0.2s ease',
                marginTop: '2px',
                marginBottom: '4px'
              }} />

              {/* Entry input */}
              <input
                ref={subtopicInputRef}
                type="text"
                value={subtopicEntryValue}
                onChange={(e) => setSubtopicEntryValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitSubtopic()
                  if (e.key === 'Escape') {
                    setSubtopicEntryActive(false)
                    setSubtopicEntryValue('')
                  }
                }}
                onBlur={() => {
                  if (!subtopicEntryValue.trim()) {
                    setSubtopicEntryActive(false)
                  }
                }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: THEME.WHITE,
                  fontSize: '14px',
                  fontFamily: THEME.FONT_PRIMARY,
                  padding: '4px 0'
                }}
              />

              {/* Committed subtopics list */}
              <div style={{ marginTop: '8px', overflow: 'auto', maxHeight: '150px' }}>
                {selectedLesson?.subtopics.map(subtopic => (
                  <div
                    key={subtopic.id}
                    style={{
                      fontSize: '14px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '8px'
                    }}
                    onDoubleClick={() => setEditingSubtopicId(subtopic.id)}
                  >
                    <span style={{ color: '#00ff00' }}>{subtopic.number}</span>
                    {editingSubtopicId === subtopic.id ? (
                      <input
                        autoFocus
                        type="text"
                        defaultValue={subtopic.title}
                        style={inlineEditStyle}
                        onBlur={(e) => updateSubtopicTitle(subtopic.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateSubtopicTitle(subtopic.id, e.target.value)
                        }}
                      />
                    ) : (
                      <span style={{ color: THEME.OFF_WHITE }}>{subtopic.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Objectives List - left edge aligned with LEARNING OBJECTIVES label left edge */}
            {/* LEARNING OBJECTIVES label right edge is at X:+695, label width ~280px, so left edge ~X:+415 */}
            <div style={{
              position: 'absolute',
              right: 'calc(50% - 695px)',
              top: '0',
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{ overflow: 'auto', maxHeight: '200px' }}>
                {learningObjectives.map((lo, idx) => {
                  const isLinked = selectedLesson?.linkedLOs.includes(idx)
                  const isLastLinked = idx === getLastLinkedLO()

                  return (
                    <div
                      key={idx}
                      style={{
                        fontSize: '14px',
                        color: isLinked ? THEME.WHITE : THEME.TEXT_DIM,
                        marginBottom: '8px',
                        paddingBottom: isLastLinked ? '4px' : 0,
                        borderBottom: isLastLinked ? `2px solid #00ff00` : 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onDoubleClick={() => {
                        const newTitle = prompt('Edit Learning Objective:', lo)
                        if (newTitle !== null && newTitle.trim()) {
                          console.log('Update LO:', idx, newTitle)
                        }
                      }}
                    >
                      {idx + 1}. {lo}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        currentSection="design"
        onNavigate={handleNavigate}
        isPKEActive={isPKEActive}
        onPKEToggle={setIsPKEActive}
        onSave={() => {}}
        onClear={() => {
          setLessons([{
            id: 'lesson-1',
            title: 'INTRODUCTION',
            day: 1,
            startMinutes: 0,
            durationMinutes: 60,
            linkedLOs: [],
            topics: [],
            subtopics: []
          }])
          setBreaks([])
          setSelectedId('lesson-1')
        }}
        onDelete={() => {
          if (selectedType === 'lesson' && lessons.length > 1) {
            setLessons(prev => prev.filter(l => l.id !== selectedId))
            setSelectedId(lessons[0]?.id || null)
          } else if (selectedType === 'break') {
            setBreaks(prev => prev.filter(b => b.id !== selectedId))
            setSelectedId(lessons[0]?.id || null)
            setSelectedType('lesson')
          }
        }}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={15}
      />
    </div>
  )
}

// Styles matching DEFINE page standards

// Secondary Heading style (DETAILS, DESCRIPTION, LEARNING OBJECTIVES)
const secondaryHeadingStyle = {
  fontSize: '18px',
  letterSpacing: '4.5px',
  color: THEME.WHITE,
  fontFamily: THEME.FONT_PRIMARY
}

// Navigation button style (no border)
const navButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.TEXT_DIM,
  fontSize: '15px',
  cursor: 'pointer',
  padding: '2px 8px',
  opacity: 0.7
}

// Navigator button style (no border)
const navigatorButtonStyle = {
  background: 'transparent',
  border: 'none',
  width: '28px',
  height: '28px',
  color: THEME.TEXT_DIM,
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

// Inline edit style for topics/subtopics
const inlineEditStyle = {
  background: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${THEME.AMBER}`,
  outline: 'none',
  color: THEME.OFF_WHITE,
  fontSize: '14px',
  fontFamily: THEME.FONT_PRIMARY,
  width: '150px'
}

export default OutlinePlanner
