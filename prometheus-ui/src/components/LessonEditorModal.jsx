/**
 * LessonEditorModal - Redesigned Lesson Editor
 *
 * Full-screen modal for creating and editing lessons.
 * Matches the new mockup design with:
 * - Two-column layout
 * - Left: Form fields (Title, LO, Topics, Subtopics, Type, Timings, PC)
 * - Right: Notes tabs (Slide Notes / Instructor Notes) + Image upload
 * - Bottom: View tabs (UNALLOCATED/TIMETABLE/SCALAR) + CANCEL/SAVE buttons
 *
 * Close Methods:
 * 1. Click outside modal (backdrop)
 * 2. X button (top-right)
 * 3. CANCEL button
 * 4. SAVE LESSON button
 * 5. Escape key
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { THEME } from '../constants/theme'
import { useDesign } from '../contexts/DesignContext'

// Lesson type options
const LESSON_TYPES = [
  { id: 'instructor-led', name: 'Instructor Led' },
  { id: 'practical', name: 'Practical' },
  { id: 'discussion', name: 'Discussion' },
  { id: 'assessment', name: 'Assessment' },
  { id: 'self-study', name: 'Self Study' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'simulation', name: 'Simulation' },
  { id: 'presentation', name: 'Presentation' },
  { id: 'break', name: 'Break' },
  { id: 'other', name: 'Other' }
]

function LessonEditorModal({
  isOpen = false,
  onClose,
  onCreateLesson,
  onUpdateLesson,
  courseData = {},
  timetableData = { lessons: [] },
  selectedLesson = null,
  initialTab = 'timetable' // Which bottom tab to show
  // Phase 2: onAddTopic, onAddSubtopic, onAddPC props removed
  // Now using useDesign() context for canonical actions
}) {
  const modalRef = useRef(null)

  // Phase 2: Get canonical actions from DesignContext
  const { addTopic, addSubtopic, addPerformanceCriteria, canonicalData } = useDesign()
  const isEditingExisting = selectedLesson !== null

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    learningObjectives: [],
    topics: [],
    subtopics: [],
    lessonType: 'practical',
    performanceCriteria: [],
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
    day: 1,
    week: 1,
    module: 1
  })

  // Notes state
  const [activeNotesTab, setActiveNotesTab] = useState('slide') // 'slide' | 'instructor'
  const [slideNotes, setSlideNotes] = useState([''])
  const [instructorNotes, setInstructorNotes] = useState([''])
  const [currentNotePage, setCurrentNotePage] = useState(0)

  // Images state
  const [images, setImages] = useState([])

  // Bottom tab state
  const [activeBottomTab, setActiveBottomTab] = useState(initialTab)

  // Dropdown visibility states
  const [showLODropdown, setShowLODropdown] = useState(false)
  const [showTopicDropdown, setShowTopicDropdown] = useState(false)
  const [showSubtopicDropdown, setShowSubtopicDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showPCDropdown, setShowPCDropdown] = useState(false)

  // Helper to format time
  const formatTimeForInput = (timeStr) => {
    if (!timeStr) return '08:00'
    if (timeStr.includes(':')) return timeStr
    if (timeStr.length === 4) {
      return timeStr.slice(0, 2) + ':' + timeStr.slice(2, 4)
    }
    return timeStr
  }

  // Calculate end time from start + duration
  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return '09:00'
    const [hours, mins] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + (duration || 60)
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMin = totalMinutes % 60
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }

  // Reset/populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedLesson) {
        const startTime = formatTimeForInput(selectedLesson.startTime)
        setFormData({
          title: selectedLesson.title || '',
          learningObjectives: selectedLesson.learningObjectives || [],
          topics: selectedLesson.topics || [],
          subtopics: [],
          lessonType: selectedLesson.type || 'practical',
          performanceCriteria: selectedLesson.performanceCriteria || [],
          startTime: startTime,
          endTime: calculateEndTime(startTime, selectedLesson.duration),
          duration: selectedLesson.duration || 60,
          day: selectedLesson.day || 1,
          week: selectedLesson.week || 1,
          module: selectedLesson.module || 1
        })
        setSlideNotes(selectedLesson.slideNotes || [''])
        setInstructorNotes(selectedLesson.instructorNotes || [''])
        setImages(selectedLesson.images || [])
      } else {
        setFormData({
          title: '',
          learningObjectives: [],
          topics: [],
          subtopics: [],
          lessonType: 'practical',
          performanceCriteria: [],
          startTime: '08:00',
          endTime: '09:00',
          duration: 60,
          day: 1,
          week: 1,
          module: 1
        })
        setSlideNotes([''])
        setInstructorNotes([''])
        setImages([])
      }
      setCurrentNotePage(0)
      setActiveNotesTab('slide')
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Auto-calculate end time when start or duration changes
      if (field === 'startTime' || field === 'duration') {
        updated.endTime = calculateEndTime(
          field === 'startTime' ? value : prev.startTime,
          field === 'duration' ? value : prev.duration
        )
      }
      return updated
    })
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    const lessonData = {
      title: formData.title,
      type: formData.lessonType,
      duration: formData.duration,
      startTime: formData.startTime.replace(':', ''),
      day: formData.day,
      week: formData.week,
      module: formData.module,
      topics: formData.topics,
      learningObjectives: formData.learningObjectives,
      performanceCriteria: formData.performanceCriteria,
      slideNotes: slideNotes,
      instructorNotes: instructorNotes,
      images: images,
      scheduled: activeBottomTab === 'timetable'
    }

    if (isEditingExisting) {
      onUpdateLesson?.(selectedLesson.id, lessonData)
    } else {
      onCreateLesson?.(lessonData)
    }
    onClose?.()
  }, [formData, slideNotes, instructorNotes, images, activeBottomTab, isEditingExisting, selectedLesson, onCreateLesson, onUpdateLesson, onClose])

  // Get current notes array based on active tab
  const currentNotes = activeNotesTab === 'slide' ? slideNotes : instructorNotes
  const setCurrentNotes = activeNotesTab === 'slide' ? setSlideNotes : setInstructorNotes

  // Handle note text change
  const handleNoteChange = (text) => {
    const newNotes = [...currentNotes]
    newNotes[currentNotePage] = text
    setCurrentNotes(newNotes)
  }

  // Navigate notes pages
  const goToPrevNote = () => {
    if (currentNotePage > 0) {
      setCurrentNotePage(currentNotePage - 1)
    }
  }

  const goToNextNote = () => {
    if (currentNotePage < currentNotes.length - 1) {
      setCurrentNotePage(currentNotePage + 1)
    } else {
      // Add new page
      setCurrentNotes([...currentNotes, ''])
      setCurrentNotePage(currentNotes.length)
    }
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, { name: file.name, data: event.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages(prev => [...prev, { name: file.name, data: event.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  // Get display values for dropdowns
  const selectedLO = courseData.learningObjectives?.find(lo =>
    formData.learningObjectives.includes(lo.id || lo)
  )

  // Phase 2: Read topics/subtopics from canonicalData instead of courseData
  const canonicalTopics = Object.values(canonicalData?.topics || {})
  const canonicalSubtopics = Object.values(canonicalData?.subtopics || {})

  // Find selected topic from canonical data
  const selectedTopic = canonicalTopics.find(t =>
    formData.topics.some(ft => ft?.id === t.id || ft === t.id)
  ) || formData.topics[0]

  // Get subtopics filtered by selected topic
  const availableSubtopics = selectedTopic?.id
    ? canonicalSubtopics.filter(s => s.topicId === selectedTopic.id)
    : []

  const selectedSubtopic = canonicalSubtopics.find(s =>
    formData.subtopics.some(fs => fs?.id === s.id || fs === s.id)
  ) || formData.subtopics[0]

  const selectedType = LESSON_TYPES.find(t => t.id === formData.lessonType) || LESSON_TYPES[1]
  const selectedPC = formData.performanceCriteria[0]

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
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        style={{
          width: '900px',
          maxWidth: '95vw',
          background: '#1a1a1a',
          border: `2px solid ${THEME.AMBER}`,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 0 40px rgba(0, 0, 0, 0.6), 0 0 20px ${THEME.AMBER}30`
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `2px solid ${THEME.AMBER}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              letterSpacing: '4px',
              color: THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            LESSON EDITOR
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: `1px solid ${THEME.TEXT_DIM}`,
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: THEME.TEXT_DIM,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = THEME.WHITE
              e.target.style.color = THEME.WHITE
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = THEME.TEXT_DIM
              e.target.style.color = THEME.TEXT_DIM
            }}
          >
            X
          </button>
        </div>

        {/* Title Row */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: `1px solid ${THEME.BORDER}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="LESSON TITLE"
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.AMBER,
              fontSize: '16px',
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              outline: 'none',
              flex: 1
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: THEME.TEXT_DIM, fontSize: '12px', textTransform: 'uppercase' }}>
              DURATION
            </span>
            <span style={{ color: THEME.GREEN_BRIGHT, fontSize: '14px', fontFamily: THEME.FONT_MONO }}>
              {formData.duration} MINS
            </span>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div style={{ display: 'flex', flex: 1, minHeight: '400px' }}>
          {/* Left Column - Form Fields */}
          <div
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRight: `1px solid ${THEME.BORDER}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto'
            }}
          >
            {/* Learning Objectives */}
            <DropdownField
              label="LEARNING OBJECTIVES"
              hint="Enter to Assign"
              value={selectedLO
                ? `${selectedLO.order || 1}. ${selectedLO.verb} ${selectedLO.description}`
                : 'Select Learning Objective'
              }
              valueColor={selectedLO ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM}
              highlightFirst={true}
              isOpen={showLODropdown}
              onToggle={() => setShowLODropdown(!showLODropdown)}
              options={courseData.learningObjectives || []}
              onSelect={(lo) => {
                updateField('learningObjectives', [lo.id || lo])
                setShowLODropdown(false)
              }}
              renderOption={(lo) => `${lo.order || 1}. ${lo.verb} ${lo.description}`}
            />

            {/* Topics */}
            <DropdownField
              label="TOPICS"
              value={selectedTopic
                ? `${selectedTopic.serial || selectedTopic.number || ''} ${selectedTopic.title}`
                : 'Select Topic'
              }
              valueColor={selectedTopic ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM}
              isOpen={showTopicDropdown}
              onToggle={() => setShowTopicDropdown(!showTopicDropdown)}
              options={canonicalTopics}
              onSelect={(topic) => {
                updateField('topics', [topic])
                updateField('subtopics', []) // Clear subtopics when topic changes
                setShowTopicDropdown(false)
              }}
              renderOption={(t) => `${t.serial || t.number || ''} ${t.title}`}
              onAdd={addTopic}
            />

            {/* Sub Topics */}
            <DropdownField
              label="SUB TOPICS"
              value={selectedSubtopic
                ? `${selectedSubtopic.serial || selectedSubtopic.number || ''} ${selectedSubtopic.title}`
                : 'Select Subtopic'
              }
              valueColor={selectedSubtopic ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM}
              isOpen={showSubtopicDropdown}
              onToggle={() => setShowSubtopicDropdown(!showSubtopicDropdown)}
              options={availableSubtopics}
              onSelect={(subtopic) => {
                updateField('subtopics', [subtopic])
                setShowSubtopicDropdown(false)
              }}
              renderOption={(s) => `${s.serial || s.number || ''} ${s.title}`}
              onAdd={selectedTopic ? addSubtopic : undefined}
            />

            {/* Lesson Type + Times Row */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: THEME.TEXT_DIM,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  LESSON TYPE
                </label>
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: `1px solid ${THEME.BORDER}`,
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: THEME.WHITE,
                    fontSize: '13px',
                    fontFamily: THEME.FONT_PRIMARY,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{selectedType.name}</span>
                  <span style={{ color: THEME.AMBER }}>V</span>
                </button>
                {showTypeDropdown && (
                  <DropdownList
                    options={LESSON_TYPES}
                    onSelect={(type) => {
                      updateField('lessonType', type.id)
                      setShowTypeDropdown(false)
                    }}
                    renderOption={(t) => t.name}
                    onClose={() => setShowTypeDropdown(false)}
                  />
                )}
              </div>
              <TimeInput
                label="START"
                value={formData.startTime}
                onChange={(v) => updateField('startTime', v)}
              />
              <TimeInput
                label="END"
                value={formData.endTime}
                onChange={(v) => updateField('endTime', v)}
              />
            </div>

            {/* Performance Criteria */}
            <DropdownField
              label="PERFORMANCE CRITERIA"
              value={selectedPC ? `PC: ${formData.performanceCriteria.length}` : 'PC: 1'}
              valueColor={THEME.GREEN_BRIGHT}
              isOpen={showPCDropdown}
              onToggle={() => setShowPCDropdown(!showPCDropdown)}
              options={courseData.performanceCriteria || []}
              onSelect={(pc) => {
                updateField('performanceCriteria', [...formData.performanceCriteria, pc])
                setShowPCDropdown(false)
              }}
              renderOption={(pc) => pc.name || pc.description || pc}
              onAdd={addPerformanceCriteria}
            />
          </div>

          {/* Right Column - Notes + Images */}
          <div
            style={{
              flex: 1,
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Notes Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Notes Tabs */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <button
                    onClick={() => { setActiveNotesTab('slide'); setCurrentNotePage(0) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeNotesTab === 'slide' ? THEME.WHITE : THEME.TEXT_DIM,
                      fontSize: '13px',
                      fontFamily: THEME.FONT_PRIMARY,
                      cursor: 'pointer',
                      paddingBottom: '4px',
                      borderBottom: activeNotesTab === 'slide' ? `2px solid ${THEME.WHITE}` : '2px solid transparent'
                    }}
                  >
                    Slide Notes
                  </button>
                  <button
                    onClick={() => { setActiveNotesTab('instructor'); setCurrentNotePage(0) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: activeNotesTab === 'instructor' ? THEME.WHITE : THEME.TEXT_DIM,
                      fontSize: '13px',
                      fontFamily: THEME.FONT_PRIMARY,
                      cursor: 'pointer',
                      paddingBottom: '4px',
                      borderBottom: activeNotesTab === 'instructor' ? `2px solid ${THEME.WHITE}` : '2px solid transparent'
                    }}
                  >
                    Instructor Notes
                  </button>
                </div>
                <span style={{ color: THEME.TEXT_DIM, fontSize: '12px' }}>
                  {currentNotePage + 1}/{currentNotes.length}
                </span>
              </div>

              {/* Notes Text Area */}
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  value={currentNotes[currentNotePage] || ''}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Enter Text Here"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '150px',
                    background: '#0d0d0d',
                    border: `1px solid ${THEME.BORDER}`,
                    borderRadius: '8px',
                    padding: '12px',
                    paddingRight: '40px',
                    color: THEME.TEXT_PRIMARY,
                    fontSize: '13px',
                    fontFamily: THEME.FONT_PRIMARY,
                    resize: 'none',
                    outline: 'none'
                  }}
                />
                {/* Navigation Arrows */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <button
                    onClick={goToPrevNote}
                    disabled={currentNotePage === 0}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: currentNotePage === 0 ? THEME.TEXT_DIM : THEME.WHITE,
                      fontSize: '14px',
                      cursor: currentNotePage === 0 ? 'default' : 'pointer',
                      padding: '2px'
                    }}
                  >
                    &lt;
                  </button>
                  <button
                    onClick={goToNextNote}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: THEME.WHITE,
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: THEME.TEXT_DIM,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Images
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: `2px dashed ${THEME.BORDER}`,
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ marginBottom: '8px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
                    <path
                      d="M12 16V8M12 8L9 11M12 8L15 11"
                      stroke={THEME.TEXT_DIM}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15"
                      stroke={THEME.TEXT_DIM}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={{ color: THEME.TEXT_DIM, fontSize: '12px' }}>
                  Drag images here
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: THEME.TEXT_DIM }}>or </span>
                  <span style={{ color: THEME.AMBER, cursor: 'pointer' }}>browse</span>
                </div>
              </div>
              {/* Image Thumbnails */}
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={img.data}
                        alt={img.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setImages(images.filter((_, i) => i !== idx))
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.7)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          color: THEME.WHITE,
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: `1px solid ${THEME.BORDER}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* View Tabs */}
          <div style={{ display: 'flex', gap: '32px' }}>
            {['UNALLOCATED', 'TIMETABLE', 'SCALAR'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveBottomTab(tab.toLowerCase())}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeBottomTab === tab.toLowerCase() ? THEME.WHITE : THEME.TEXT_DIM,
                  fontSize: '12px',
                  fontFamily: THEME.FONT_PRIMARY,
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderBottom: activeBottomTab === tab.toLowerCase()
                    ? `2px solid ${THEME.AMBER}`
                    : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: `1px solid ${THEME.TEXT_DIM}`,
                borderRadius: '4px',
                padding: '8px 24px',
                color: THEME.TEXT_DIM,
                fontSize: '12px',
                fontFamily: THEME.FONT_PRIMARY,
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = THEME.WHITE
                e.target.style.color = THEME.WHITE
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = THEME.TEXT_DIM
                e.target.style.color = THEME.TEXT_DIM
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              style={{
                background: THEME.AMBER,
                border: 'none',
                borderRadius: '4px',
                padding: '8px 24px',
                color: THEME.BG_DARK,
                fontSize: '12px',
                fontFamily: THEME.FONT_PRIMARY,
                fontWeight: 'bold',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ff7700'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = THEME.AMBER
              }}
            >
              SAVE LESSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * DropdownField - Reusable dropdown field component
 */
function DropdownField({
  label,
  hint,
  value,
  valueColor = THEME.WHITE,
  highlightFirst = false,
  isOpen,
  onToggle,
  options = [],
  onSelect,
  renderOption,
  onAdd  // Optional handler for '+' button
}) {
  // Parse value to highlight first word if needed
  const renderValue = () => {
    if (highlightFirst && value) {
      const parts = value.split(' ')
      const firstWord = parts[0]
      const rest = parts.slice(1).join(' ')
      return (
        <>
          <span style={{ color: THEME.GREEN_BRIGHT }}>{firstWord}</span>
          {rest && <span style={{ color: valueColor }}> {rest}</span>}
        </>
      )
    }
    return <span style={{ color: valueColor }}>{value}</span>
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{
            fontSize: '11px',
            color: THEME.TEXT_DIM,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {label}
          </label>
          {/* + Button for Adding - Burnt Orange */}
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: THEME.AMBER,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                padding: '0 4px',
                transition: 'color 0.2s ease',
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = THEME.WHITE}
              onMouseLeave={(e) => e.currentTarget.style.color = THEME.AMBER}
              title={`Add ${label}`}
            >
              +
            </button>
          )}
        </div>
        {hint && (
          <span style={{ fontSize: '10px', color: THEME.TEXT_DIM, fontStyle: 'italic' }}>
            {hint}
          </span>
        )}
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'transparent',
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '4px',
          padding: '10px 12px',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontFamily: THEME.FONT_PRIMARY
        }}
      >
        {renderValue()}
        <span style={{ color: THEME.AMBER, marginLeft: '8px' }}>V</span>
      </button>
      {isOpen && options.length > 0 && (
        <DropdownList
          options={options}
          onSelect={onSelect}
          renderOption={renderOption}
          onClose={onToggle}
        />
      )}
    </div>
  )
}

/**
 * DropdownList - Dropdown options list
 */
function DropdownList({ options, onSelect, renderOption, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#1a1a1a',
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        {options.map((option, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(option)}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              color: THEME.TEXT_PRIMARY,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            {renderOption ? renderOption(option) : option}
          </div>
        ))}
      </div>
    </>
  )
}

/**
 * TimeInput - Time input field
 */
function TimeInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '11px',
        color: THEME.TEXT_DIM,
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '4px',
          padding: '8px 12px',
          color: THEME.WHITE,
          fontSize: '13px',
          fontFamily: THEME.FONT_MONO,
          outline: 'none',
          width: '90px'
        }}
      />
    </div>
  )
}

export default LessonEditorModal
