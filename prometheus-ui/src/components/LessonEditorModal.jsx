/**
 * LessonEditorModal - Global Lesson Editor Modal
 *
 * Full-screen modal for creating and editing lessons.
 * Accessible from all pages via the Footer "Lesson Editor" button.
 *
 * Features:
 * - Backdrop with blur effect
 * - All lesson fields (Title, LOs, Topics, etc.)
 * - Interactive section states (grey → amber → green → white)
 * - Dropdown menus for predefined items
 * - Large + (add to library) and O (add to timetable) buttons
 *
 * Close Methods:
 * 1. Click outside modal (backdrop)
 * 2. X button (top-right)
 * 3. Large + button (adds to library)
 * 4. Large O button (adds to timetable)
 * 5. Escape key
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { THEME } from '../constants/theme'

// Lesson type options
const LESSON_TYPES = [
  'instructor-led',
  'discussion',
  'practical',
  'assessment',
  'self-study',
  'workshop',
  'simulation',
  'presentation',
  'break',
  'other'
]

function LessonEditorModal({
  isOpen = false,
  onClose,
  onCreateLesson,
  onUpdateLesson,
  courseData = {},
  timetableData = { lessons: [] },
  selectedLesson = null  // Pre-populate with this lesson's data
}) {
  const modalRef = useRef(null)

  // Track if we're editing an existing lesson
  const isEditingExisting = selectedLesson !== null

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    learningObjectives: [],
    topics: [],
    subtopics: [],
    lessonType: '',
    performanceCriteria: [],
    startTime: '',
    stopTime: '',
    duration: '',
    durationUnit: 'mins',
    day: '',
    week: '',
    term: '',
    module: '',
    slides: 0
  })

  // Active section state (which field is focused)
  const [activeSection, setActiveSection] = useState(null)

  // Helper to format time from "0900" to "09:00"
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return ''
    const clean = timeStr.replace(':', '')
    if (clean.length === 4) {
      return clean.slice(0, 2) + ':' + clean.slice(2, 4)
    }
    return timeStr
  }

  // Calculate end time from start + duration
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return ''
    const clean = startTime.replace(':', '')
    if (clean.length !== 4) return ''
    const startHour = parseInt(clean.slice(0, 2))
    const startMin = parseInt(clean.slice(2, 4))
    const totalMinutes = startHour * 60 + startMin + parseInt(duration)
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMin = totalMinutes % 60
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }

  // Reset/populate form when modal opens or selectedLesson changes
  useEffect(() => {
    if (isOpen) {
      if (selectedLesson) {
        // Pre-populate with selected lesson data
        setFormData({
          title: selectedLesson.title || '',
          learningObjectives: selectedLesson.learningObjectives || [],
          topics: selectedLesson.topics || [],
          subtopics: [],
          lessonType: selectedLesson.type || '',
          performanceCriteria: [],
          startTime: formatTimeDisplay(selectedLesson.startTime),
          stopTime: calculateEndTime(selectedLesson.startTime, selectedLesson.duration),
          duration: selectedLesson.duration?.toString() || '',
          durationUnit: 'mins',
          day: selectedLesson.day?.toString() || '',
          week: selectedLesson.week?.toString() || '',
          term: '',
          module: selectedLesson.module?.toString() || '',
          slides: selectedLesson.slides?.length || 0
        })
      } else {
        // Reset to empty form for new lesson
        setFormData({
          title: '',
          learningObjectives: [],
          topics: [],
          subtopics: [],
          lessonType: '',
          performanceCriteria: [],
          startTime: '',
          stopTime: '',
          duration: '',
          durationUnit: 'mins',
          day: '',
          week: '',
          term: '',
          module: '',
          slides: 0
        })
      }
      setActiveSection(null)
    }
  }, [isOpen, selectedLesson])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }, [onClose])

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Parse start time to HHMM format
  const parseStartTime = (timeStr) => {
    if (!timeStr) return null
    const clean = timeStr.replace(':', '')
    return /^\d{4}$/.test(clean) ? clean : null
  }

  // Build properly structured topics with IDs, LO association, and nested subtopics
  const buildStructuredTopics = useCallback(() => {
    const primaryLoId = formData.learningObjectives?.[0] || null
    const timestamp = Date.now()

    // Convert simple topic objects to properly structured ones
    return formData.topics.map((topic, idx) => {
      const topicId = topic.id || `topic-modal-${timestamp}-${idx}`

      // Distribute subtopics evenly across topics (or attach all to first topic if only one)
      const subtopicsForTopic = formData.topics.length === 1
        ? formData.subtopics // All subtopics go to the only topic
        : formData.subtopics.filter((_, subIdx) =>
            Math.floor(subIdx / Math.ceil(formData.subtopics.length / formData.topics.length)) === idx
          )

      return {
        id: topicId,
        title: topic.title || topic,
        loId: primaryLoId,
        order: idx + 1, // Topic order within its group
        subtopics: subtopicsForTopic.map((sub, subIdx) => ({
          id: sub.id || `subtopic-modal-${timestamp}-${idx}-${subIdx}`,
          title: sub.title || sub,
          order: subIdx + 1 // Subtopic order within topic
        }))
      }
    })
  }, [formData.topics, formData.subtopics, formData.learningObjectives])

  // Handle Add to Library / Update Unscheduled (+ button)
  const handleAddToLibrary = useCallback(() => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    const structuredTopics = buildStructuredTopics()

    const lessonData = {
      title: formData.title,
      type: formData.lessonType || 'instructor-led',
      duration: parseInt(formData.duration) || 60,
      startTime: parseStartTime(formData.startTime),
      day: formData.day ? parseInt(formData.day) : null,
      week: formData.week ? parseInt(formData.week) : 1,
      module: formData.module ? parseInt(formData.module) : 1,
      topics: structuredTopics,
      learningObjectives: formData.learningObjectives,
      scheduled: false // Add to library (unallocated)
    }

    if (isEditingExisting) {
      // Update existing lesson
      onUpdateLesson?.(selectedLesson.id, { ...lessonData, scheduled: false })
    } else {
      // Create new lesson
      onCreateLesson?.(lessonData)
    }
    onClose?.()
  }, [formData, isEditingExisting, selectedLesson, onCreateLesson, onUpdateLesson, onClose, buildStructuredTopics])

  // Handle Add to Timetable / Update Scheduled (O button)
  const handleAddToTimetable = useCallback(() => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    // Validate scheduling fields for timetable
    if (!formData.day || !formData.startTime) {
      alert('Day and Start Time are required to add to timetable')
      return
    }

    const structuredTopics = buildStructuredTopics()

    const lessonData = {
      title: formData.title,
      type: formData.lessonType || 'instructor-led',
      duration: parseInt(formData.duration) || 60,
      startTime: parseStartTime(formData.startTime),
      day: parseInt(formData.day),
      week: formData.week ? parseInt(formData.week) : 1,
      module: formData.module ? parseInt(formData.module) : 1,
      topics: structuredTopics,
      learningObjectives: formData.learningObjectives,
      scheduled: true // Add to timetable
    }

    if (isEditingExisting) {
      // Update existing lesson
      onUpdateLesson?.(selectedLesson.id, lessonData)
    } else {
      // Create new lesson
      onCreateLesson?.(lessonData)
    }
    onClose?.()
  }, [formData, isEditingExisting, selectedLesson, onCreateLesson, onUpdateLesson, onClose, buildStructuredTopics])

  if (!isOpen) return null

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      {/* Modal Container - 1.5x wider than tall, increased corner radius */}
      <div
        ref={modalRef}
        style={{
          width: '750px',
          maxHeight: '500px',
          background: THEME.BG_PANEL,
          border: `2px solid ${THEME.AMBER}`, // Burnt orange border per mockup
          borderRadius: '32px', // Increased corner radius
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px ${THEME.AMBER}20`
        }}
      >
        {/* Header - Centered text */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${THEME.BORDER}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '16px',
                letterSpacing: '3px',
                color: THEME.WHITE,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              {isEditingExisting ? 'EDITING LESSON' : 'LESSON EDITOR'}
            </h2>
            <span
              style={{
                fontSize: '12px',           /* 20% larger */
                fontStyle: 'italic',        /* Italicized */
                color: isEditingExisting ? THEME.AMBER : THEME.TEXT_DIM,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              {isEditingExisting ? selectedLesson.title : 'Fields are Optional'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: THEME.TEXT_DIM,
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = THEME.WHITE}
            onMouseLeave={(e) => e.target.style.color = THEME.TEXT_DIM}
          >
            X
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 24px'
          }}
        >
          {/* Title Field - MANDATORY */}
          <FieldSection
            label="Title"
            value={formData.title}
            onChange={(v) => updateField('title', v)}
            placeholder="Enter Lesson Title"
            isActive={activeSection === 'title'}
            onFocus={() => setActiveSection('title')}
            onBlur={() => setActiveSection(null)}
            isMandatory={true}
          />

          {/* Learning Objectives */}
          <FieldSection
            label="Learning Objectives"
            value={formData.learningObjectives.join(', ')}
            onChange={(v) => updateField('learningObjectives', v ? v.split(', ') : [])}
            placeholder="Select / Enter Text"
            isActive={activeSection === 'los'}
            onFocus={() => setActiveSection('los')}
            onBlur={() => setActiveSection(null)}
            dropdownOptions={courseData.learningObjectives || []}
          />

          {/* Topics */}
          <FieldSection
            label="Add Topic(s)"
            value={formData.topics.map(t => t.title || t).join(', ')}
            onChange={(v) => updateField('topics', v ? v.split(', ').map(t => ({ title: t })) : [])}
            placeholder="Enter Text"
            isActive={activeSection === 'topics'}
            onFocus={() => setActiveSection('topics')}
            onBlur={() => setActiveSection(null)}
          />

          {/* Subtopics */}
          <FieldSection
            label="Add Subtopic(s)"
            value={formData.subtopics.map(s => s.title || s).join(', ')}
            onChange={(v) => updateField('subtopics', v ? v.split(', ').map(s => ({ title: s })) : [])}
            placeholder="Enter Text"
            isActive={activeSection === 'subtopics'}
            onFocus={() => setActiveSection('subtopics')}
            onBlur={() => setActiveSection(null)}
          />

          {/* Lesson Type */}
          <FieldSection
            label="Lesson Type"
            value={formData.lessonType}
            onChange={(v) => updateField('lessonType', v)}
            placeholder="Select / Enter Text"
            isActive={activeSection === 'type'}
            onFocus={() => setActiveSection('type')}
            onBlur={() => setActiveSection(null)}
            dropdownOptions={LESSON_TYPES}
          />

          {/* Performance Criteria */}
          <FieldSection
            label="Performance Criteria"
            value={formData.performanceCriteria.join(', ')}
            onChange={(v) => updateField('performanceCriteria', v ? v.split(', ') : [])}
            placeholder="Select / Enter Text"
            isActive={activeSection === 'criteria'}
            onFocus={() => setActiveSection('criteria')}
            onBlur={() => setActiveSection(null)}
          />

          {/* Time Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <TimeField
              label="Start Time"
              value={formData.startTime}
              onChange={(v) => updateField('startTime', v)}
              isActive={activeSection === 'startTime'}
              onFocus={() => setActiveSection('startTime')}
              onBlur={() => setActiveSection(null)}
            />
            <TimeField
              label="Stop Time"
              value={formData.stopTime}
              onChange={(v) => updateField('stopTime', v)}
              isActive={activeSection === 'stopTime'}
              onFocus={() => setActiveSection('stopTime')}
              onBlur={() => setActiveSection(null)}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <TimeField
                label="Duration"
                value={formData.duration}
                onChange={(v) => updateField('duration', v)}
                isActive={activeSection === 'duration'}
                onFocus={() => setActiveSection('duration')}
                onBlur={() => setActiveSection(null)}
                width="60px"
              />
              <select
                value={formData.durationUnit}
                onChange={(e) => updateField('durationUnit', e.target.value)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  padding: '6px 8px',
                  color: THEME.GREEN_BRIGHT,
                  fontSize: '12px',
                  fontFamily: THEME.FONT_PRIMARY,
                  marginBottom: '4px'
                }}
              >
                <option value="mins">mins</option>
                <option value="hrs">hrs</option>
              </select>
            </div>
          </div>

          {/* Schedule Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <TimeField
              label="Day"
              value={formData.day}
              onChange={(v) => updateField('day', v)}
              isActive={activeSection === 'day'}
              onFocus={() => setActiveSection('day')}
              onBlur={() => setActiveSection(null)}
              width="50px"
            />
            <TimeField
              label="Week"
              value={formData.week}
              onChange={(v) => updateField('week', v)}
              isActive={activeSection === 'week'}
              onFocus={() => setActiveSection('week')}
              onBlur={() => setActiveSection(null)}
              width="50px"
            />
            <TimeField
              label="Term"
              value={formData.term}
              onChange={(v) => updateField('term', v)}
              isActive={activeSection === 'term'}
              onFocus={() => setActiveSection('term')}
              onBlur={() => setActiveSection(null)}
              width="50px"
            />
            <TimeField
              label="Module"
              value={formData.module}
              onChange={(v) => updateField('module', v)}
              isActive={activeSection === 'module'}
              onFocus={() => setActiveSection('module')}
              onBlur={() => setActiveSection(null)}
              width="50px"
            />
            <TimeField
              label="Slides"
              value={formData.slides || ''}
              onChange={() => {}}
              isActive={false}
              onFocus={() => {}}
              onBlur={() => {}}
              width="50px"
              readOnly
            />
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${THEME.BORDER}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Large Action Buttons - no circles, grey default, orange on hover */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <ActionButton
              onClick={handleAddToLibrary}
              symbol="+"
              title="Add to Library (Unallocated)"
            />
            <ActionButton
              onClick={handleAddToTimetable}
              symbol="O"
              title="Add to Timetable"
            />
          </div>

          {/* Help Text - with orange + and O per mockup */}
          <span
            style={{
              fontSize: '12px',           /* 20% larger */
              fontStyle: 'italic',        /* Italicized */
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              textAlign: 'center'
            }}
          >
            {isEditingExisting ? (
              <>Press '<span style={{ color: THEME.AMBER }}>+</span>' to move to Unallocated. Press '<span style={{ color: THEME.AMBER }}>O</span>' to update on Timetable.</>
            ) : (
              <>Press '<span style={{ color: THEME.AMBER }}>+</span>' to add lesson to library. Press '<span style={{ color: THEME.AMBER }}>O</span>' to add lesson to Timetable.</>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * FieldSection - Individual field with label and interactive states
 * Layout matches mockup: Label + placeholder on same line, separator below, + V on right
 * Supports multi-line items via '+' button
 */
function FieldSection({
  label,
  value,
  onChange,
  placeholder,
  isActive,
  onFocus,
  onBlur,
  isMandatory = false,
  dropdownOptions = [],
  multiLine = false
}) {
  const [isTyping, setIsTyping] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [items, setItems] = useState([]) // For multi-line support
  const [currentInput, setCurrentInput] = useState('')
  const inputRef = useRef(null)

  // Determine placeholder text color - GREEN when highlighted
  const getPlaceholderColor = () => {
    if (isActive) return THEME.GREEN_BRIGHT // Highlighted = luminous green
    return THEME.TEXT_DIM // Default grey
  }

  // Determine text color based on state
  const getTextColor = () => {
    if (isActive) return THEME.GREEN_BRIGHT // Active = luminous green for typing
    if (value) return THEME.WHITE // Has value (confirmed)
    return THEME.TEXT_DIM // Empty
  }

  // Determine label color - Title uses orange per mockup
  const getLabelColor = () => {
    if (isMandatory) return THEME.AMBER // Title label always orange
    if (isActive) return THEME.AMBER // Focused = burnt orange
    return THEME.WHITE // Default white per mockup
  }

  const handleInputChange = (e) => {
    setIsTyping(true)
    setCurrentInput(e.target.value)
    onChange(e.target.value)
  }

  const handleBlur = () => {
    setIsTyping(false)
    setShowDropdown(false)
    onBlur?.()
  }

  const handleDropdownSelect = (option) => {
    if (items.length > 0) {
      // Add to multi-line items
      setItems([...items, option])
      onChange([...items, option].join(', '))
    } else {
      onChange(option)
    }
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  // Handle '+' button - adds current text as a new line item
  const handleAddItem = () => {
    const textToAdd = currentInput.trim() || value
    if (textToAdd) {
      const newItems = [...items, textToAdd]
      setItems(newItems)
      onChange(newItems.join(', '))
      setCurrentInput('')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Main Row: Label + Input + Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: `1px solid ${THEME.BORDER}`,
          gap: '8px'
        }}
      >
        {/* Label */}
        <span
          style={{
            fontSize: '16px',             /* 20% larger (was 13px) */
            color: getLabelColor(),
            fontFamily: THEME.FONT_PRIMARY,
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {label}:
        </span>

        {/* Input - uses lesson-editor-input class for placeholder styling */}
        <input
          ref={inputRef}
          type="text"
          className="lesson-editor-input"
          value={items.length > 0 ? currentInput : value}
          onChange={handleInputChange}
          onFocus={onFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: '0',
            color: getTextColor(),
            fontSize: '16px',             /* 20% larger (was 13px) */
            fontFamily: THEME.FONT_PRIMARY,
            outline: 'none',
            transition: 'color 0.2s ease'
          }}
        />

        {/* Action Buttons - Right side */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={handleAddItem}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.AMBER,
              fontSize: '16px',
              cursor: 'pointer',
              padding: '2px 6px',
              fontWeight: 'bold'
            }}
            title="Add new line item"
          >
            +
          </button>
          {dropdownOptions.length > 0 && (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: THEME.AMBER,
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              V
            </button>
          )}
        </div>
      </div>

      {/* Multi-line items display */}
      {items.length > 0 && (
        <div
          style={{
            padding: '8px 0',
            borderBottom: `1px solid ${THEME.BORDER}`
          }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 0',
                fontSize: '12px',
                color: THEME.WHITE,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              <span>• {item}</span>
              <button
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== idx)
                  setItems(newItems)
                  onChange(newItems.join(', '))
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: THEME.TEXT_DIM,
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && dropdownOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: THEME.BG_DARK,
            border: `1px solid ${THEME.BORDER}`,
            borderRadius: '4px',
            maxHeight: '150px',
            overflow: 'auto',
            zIndex: 10
          }}
        >
          {dropdownOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleDropdownSelect(option)}
              style={{
                padding: '8px 12px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = THEME.BG_PANEL}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * ActionButton - Large + and O buttons with hover state
 * No background/border (removed orange circles), grey default, burnt orange on hover
 * Size increased by 25%
 */
function ActionButton({ onClick, symbol, title }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      style={{
        width: '60px',              /* 25% larger (was 48px) */
        height: '60px',             /* 25% larger (was 48px) */
        background: 'transparent',  /* No background */
        border: 'none',             /* No border/circle */
        color: isHovered ? THEME.AMBER : THEME.TEXT_DIM,  /* Grey default, orange on hover */
        fontSize: symbol === '+' ? '36px' : '30px',       /* 25% larger */
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s ease'
      }}
    >
      {symbol}
    </button>
  )
}

/**
 * TimeField - Small input field for time/number values
 * No '--' placeholder - shows empty when no value
 */
function TimeField({
  label,
  value,
  onChange,
  isActive,
  onFocus,
  onBlur,
  width = '70px',
  readOnly = false
}) {
  const [isTyping, setIsTyping] = useState(false)

  const getTextColor = () => {
    if (readOnly) return THEME.TEXT_DIM
    if (isActive) return THEME.GREEN_BRIGHT // Active = luminous green
    if (value) return THEME.WHITE // Has value
    return THEME.TEXT_DIM
  }

  const getLabelColor = () => {
    if (isActive) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span
        style={{
          fontSize: '12px',               /* 20% larger (was 10px) */
          color: getLabelColor(),
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        {label}:
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setIsTyping(true)
          onChange(e.target.value)
        }}
        onFocus={onFocus}
        onBlur={() => {
          setIsTyping(false)
          onBlur?.()
        }}
        readOnly={readOnly}
        style={{
          width,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${isActive ? THEME.AMBER : THEME.BORDER}`,
          padding: '4px 0',
          color: getTextColor(),
          fontSize: '14px',               /* 20% larger (was 12px) */
          fontFamily: THEME.FONT_PRIMARY,
          outline: 'none',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}
      />
    </div>
  )
}

export default LessonEditorModal
