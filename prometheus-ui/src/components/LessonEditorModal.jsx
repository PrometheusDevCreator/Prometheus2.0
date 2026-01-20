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
  // Phase D: Added lesson-centric functions for proper loId + lessonId linking
  // Phase C: Added update functions for inline editing
  // Phase F: Added transactional model functions
  const {
    addTopic,
    addSubtopic,
    addPerformanceCriteria,
    canonicalData,
    addTopicToLesson,
    addSubtopicToLessonTopic,
    updateLessonTopic,
    updateLessonSubtopic,
    getLessonEditorModel,
    saveLessonEditorModel
  } = useDesign()
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

  // Phase F: Original model for cancel functionality (transactional)
  const [originalModel, setOriginalModel] = useState(null)

  // Bottom tab state
  const [activeBottomTab, setActiveBottomTab] = useState(initialTab)

  // Dropdown visibility states
  const [showLODropdown, setShowLODropdown] = useState(false)
  const [showTopicDropdown, setShowTopicDropdown] = useState(false)
  const [showSubtopicDropdown, setShowSubtopicDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showPCDropdown, setShowPCDropdown] = useState(false)

  // Phase C: Inline editing state for topics/subtopics
  const [editingTopicId, setEditingTopicId] = useState(null)
  const [editingSubtopicId, setEditingSubtopicId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const editInputRef = useRef(null)

  // Phase C: Auto-focus when editing state changes
  useEffect(() => {
    if ((editingTopicId || editingSubtopicId) && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingTopicId, editingSubtopicId])

  // Phase C: Commit topic title edit
  const commitTopicEdit = useCallback(() => {
    if (editingTopicId && editingTitle.trim() && selectedLesson?.id) {
      // Phase C: Find lesson topic - try both id and scalarTopicId match
      // (editingTopicId could be lesson topic ID from create-then-edit, or canonical ID from double-click)
      const lessonTopic = selectedLesson?.topics?.find(t =>
        t.id === editingTopicId || t.scalarTopicId === editingTopicId
      )
      if (lessonTopic) {
        // Use lesson topic ID for update
        updateLessonTopic(selectedLesson.id, lessonTopic.id, { title: editingTitle.trim() })
        // Phase C: Also select the edited topic in the form
        const scalarTopicId = lessonTopic.scalarTopicId
        const topicObj = scalarTopicId ? canonicalData?.topics?.[scalarTopicId] : null
        if (topicObj) {
          setFormData(prev => ({ ...prev, topics: [topicObj] }))
        }
      }
    }
    setEditingTopicId(null)
    setEditingTitle('')
  }, [editingTopicId, editingTitle, selectedLesson, updateLessonTopic, canonicalData])

  // Phase C: Commit subtopic title edit
  const commitSubtopicEdit = useCallback(() => {
    if (editingSubtopicId && editingTitle.trim() && selectedLesson?.id) {
      // Phase C: Find parent topic and subtopic - try both id and scalarSubtopicId match
      let parentTopic = null
      let lessonSubtopic = null
      for (const t of (selectedLesson?.topics || [])) {
        const s = (t.subtopics || []).find(sub =>
          sub.id === editingSubtopicId || sub.scalarSubtopicId === editingSubtopicId
        )
        if (s) {
          parentTopic = t
          lessonSubtopic = s
          break
        }
      }
      if (parentTopic && lessonSubtopic) {
        // Use lesson subtopic ID for update
        updateLessonSubtopic(selectedLesson.id, parentTopic.id, lessonSubtopic.id, { title: editingTitle.trim() })
        // Phase C: Also select the edited subtopic in the form
        const scalarSubtopicId = lessonSubtopic.scalarSubtopicId
        const subtopicObj = scalarSubtopicId ? canonicalData?.subtopics?.[scalarSubtopicId] : null
        if (subtopicObj) {
          setFormData(prev => ({ ...prev, subtopics: [subtopicObj] }))
        }
      }
    }
    setEditingSubtopicId(null)
    setEditingTitle('')
  }, [editingSubtopicId, editingTitle, selectedLesson, updateLessonSubtopic, canonicalData])

  // Phase C: Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingTopicId(null)
    setEditingSubtopicId(null)
    setEditingTitle('')
  }, [])

  // Phase C: Handle key events during editing
  const handleEditKeyDown = useCallback((e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (type === 'topic') {
        commitTopicEdit()
      } else {
        commitSubtopicEdit()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }, [commitTopicEdit, commitSubtopicEdit, cancelEdit])

  // Phase C: Start editing a topic (create-then-edit or double-click)
  const startEditingTopic = useCallback((topicId, currentTitle) => {
    setEditingTopicId(topicId)
    setEditingSubtopicId(null)
    setEditingTitle(currentTitle || 'New Topic')
  }, [])

  // Phase C: Start editing a subtopic
  const startEditingSubtopic = useCallback((subtopicId, currentTitle) => {
    setEditingSubtopicId(subtopicId)
    setEditingTopicId(null)
    setEditingTitle(currentTitle || 'New Subtopic')
  }, [])

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

  // Phase F: Reset/populate form when modal opens using transactional model
  // GUARDRAIL [M5.7]: Hydration MUST use getLessonEditorModel for canonical reads.
  // Do NOT read directly from selectedLesson props for existing lessons.
  // The transactional model ensures we get a consistent snapshot of canonical state.
  useEffect(() => {
    if (isOpen) {
      if (selectedLesson?.id) {
        // Phase F1: Hydrate from canonical using getLessonEditorModel
        const model = getLessonEditorModel(selectedLesson.id)

        if (model) {
          // Store original for cancel functionality (F2)
          setOriginalModel(model)

          const startTime = formatTimeForInput(model.startTime)
          setFormData({
            title: model.title || '',
            learningObjectives: model.links.loIds || [],
            topics: model.rawTopics || [],
            subtopics: [], // Will be populated from topic selection
            lessonType: model.type || 'practical',
            performanceCriteria: model.links.pcIds || [],
            startTime: startTime,
            endTime: calculateEndTime(startTime, model.duration),
            duration: model.duration || 60,
            day: model.day || 1,
            week: model.week || 1,
            module: model.module || 1
          })
          setSlideNotes(model.slideNotes || [''])
          setInstructorNotes(model.instructorNotes || [''])
          setImages(model.images || [])

          console.log('[PHASE_F] Hydrated lesson editor from canonical:', {
            lessonId: model.id,
            title: model.title,
            loCount: model.links.loIds.length,
            topicCount: model.rawTopics.length
          })
        } else {
          // Fallback to selectedLesson props if model not found
          const startTime = formatTimeForInput(selectedLesson.startTime)
          setOriginalModel(null)
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
        }
      } else {
        // New lesson - initialize empty model
        setOriginalModel(null)
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
  }, [isOpen, selectedLesson, getLessonEditorModel])

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

  // Phase F3: Handle save with complete transactional writeback
  // GUARDRAIL [M5.7]: Save MUST use saveLessonEditorModel for canonical writes.
  // This ensures all consumers (Scalar, Timetable, Linking Mode) react immediately.
  // Do NOT bypass with direct state mutations.
  const handleSave = useCallback(() => {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    // Build complete model for writeback
    const model = {
      title: formData.title,
      type: formData.lessonType,
      duration: formData.duration,
      startTime: formData.startTime.replace(':', ''),
      day: formData.day,
      week: formData.week,
      module: formData.module,
      scheduled: activeBottomTab === 'timetable',
      // Notes and images
      slideNotes: slideNotes,
      instructorNotes: instructorNotes,
      images: images,
      // Links
      links: {
        loIds: formData.learningObjectives,
        topicIds: (formData.topics || []).map(t => t.scalarTopicId || t.id).filter(Boolean),
        subtopicIds: (formData.topics || []).flatMap(t =>
          (t.subtopics || []).map(s => s.scalarSubtopicId || s.id)
        ).filter(Boolean),
        pcIds: formData.performanceCriteria
      },
      // Raw topics (preserves structure including subtopics)
      rawTopics: formData.topics
    }

    if (isEditingExisting && selectedLesson?.id) {
      // Phase F3: Use saveLessonEditorModel for complete writeback
      // Timetable updates are commit-on-save by design (Founder decision)
      const success = saveLessonEditorModel(selectedLesson.id, model)

      if (success) {
        console.log('[PHASE_F] Saved lesson via transactional model:', {
          lessonId: selectedLesson.id,
          title: model.title,
          topicCount: model.rawTopics?.length || 0,
          subtopicCount: model.links.subtopicIds.length
        })
      }

      // Also call legacy callback for backward compatibility
      onUpdateLesson?.(selectedLesson.id, {
        title: model.title,
        type: model.type,
        duration: model.duration,
        startTime: model.startTime,
        day: model.day,
        week: model.week,
        module: model.module,
        topics: model.rawTopics,
        learningObjectives: model.links.loIds,
        performanceCriteria: model.links.pcIds,
        slideNotes: model.slideNotes,
        instructorNotes: model.instructorNotes,
        images: model.images,
        scheduled: model.scheduled
      })
    } else {
      // New lesson - use create callback
      onCreateLesson?.({
        title: model.title,
        type: model.type,
        duration: model.duration,
        startTime: model.startTime,
        day: model.day,
        week: model.week,
        module: model.module,
        topics: model.rawTopics,
        learningObjectives: model.links.loIds,
        performanceCriteria: model.links.pcIds,
        slideNotes: model.slideNotes,
        instructorNotes: model.instructorNotes,
        images: model.images,
        scheduled: model.scheduled
      })
    }
    onClose?.()
  }, [formData, slideNotes, instructorNotes, images, activeBottomTab, isEditingExisting, selectedLesson, onCreateLesson, onUpdateLesson, onClose, saveLessonEditorModel])

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
  // Phase B: Read LOs from canonicalData instead of courseData (strings)
  const canonicalLOs = Object.values(canonicalData?.los || {})
  const selectedLO = canonicalLOs.find(lo =>
    formData.learningObjectives.includes(lo.id)
  )

  // Phase 2: Read topics/subtopics from canonicalData instead of courseData
  const canonicalTopics = Object.values(canonicalData?.topics || {})
  const canonicalSubtopics = Object.values(canonicalData?.subtopics || {})

  // M5.2: Removed single-select selectedTopic/selectedSubtopic variables
  // Now using multi-select chip lists - all linked items shown in formData.topics

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
              options={canonicalLOs}
              onSelect={(lo) => {
                updateField('learningObjectives', [lo.id || lo])
                setShowLODropdown(false)
              }}
              renderOption={(lo) => `${lo.order || 1}. ${lo.verb} ${lo.description}`}
            />

            {/* M5.2: Topics - Multi-select with additive linking */}
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
                    TOPICS
                  </label>
                  {/* + Button for Adding Topics */}
                  {selectedLesson?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newTopicId = addTopicToLesson(selectedLesson.id, 'New Topic', selectedLO?.id)
                        if (newTopicId) {
                          startEditingTopic(newTopicId, 'New Topic')
                        }
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
                      title="Add new topic"
                    >
                      +
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: THEME.TEXT_DIM }}>
                  {formData.topics.length} linked
                </span>
              </div>

              {/* Dropdown to add existing topics */}
              <button
                onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: THEME.TEXT_DIM,
                  fontSize: '13px',
                  fontFamily: THEME.FONT_PRIMARY,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Add existing topic...</span>
                <span style={{ color: THEME.AMBER }}>V</span>
              </button>

              {/* Dropdown options */}
              {showTopicDropdown && canonicalTopics.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: THEME.BG_PANEL,
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {canonicalTopics.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      onClick={() => {
                        // M5.2: Append topic (with dedup) instead of replacing
                        const topicId = t.scalarTopicId || t.id
                        const alreadyLinked = formData.topics.some(
                          ft => (ft.scalarTopicId || ft.id) === topicId
                        )
                        if (!alreadyLinked) {
                          // Create a topic entry that matches lesson topic structure
                          const newTopic = {
                            id: `topic-linked-${Date.now()}`,
                            scalarTopicId: t.id,
                            title: t.title,
                            number: t.serial || `x.${formData.topics.length + 1}`,
                            loId: t.loId,
                            subtopics: []
                          }
                          updateField('topics', [...formData.topics, newTopic])
                        }
                        setShowTopicDropdown(false)
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: THEME.TEXT_PRIMARY,
                        borderBottom: idx < canonicalTopics.length - 1 ? `1px solid ${THEME.BORDER}` : 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = THEME.BG_DARK}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {t.serial || ''} {t.title}
                    </div>
                  ))}
                </div>
              )}

              {/* M5.2: Linked Topics Chip List */}
              {formData.topics.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  {formData.topics.map((topic, idx) => {
                    // Resolve display info from canonical if available
                    const canonicalTopic = canonicalTopics.find(ct =>
                      ct.id === topic.scalarTopicId || ct.id === topic.id
                    )
                    const displaySerial = canonicalTopic?.serial || topic.number || `${idx + 1}`
                    const displayTitle = canonicalTopic?.title || topic.title || 'Untitled'

                    return (
                      <div
                        key={topic.id || idx}
                        onDoubleClick={() => startEditingTopic(topic.id, topic.title)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: THEME.BG_DARK,
                          border: `1px solid ${THEME.BORDER}`,
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ color: THEME.GREEN_BRIGHT }}>{displaySerial}</span>
                        <span style={{ color: THEME.TEXT_PRIMARY }}>{displayTitle}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // M5.2: Remove this topic from the list
                            updateField('topics', formData.topics.filter((_, i) => i !== idx))
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: THEME.TEXT_DIM,
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0 2px',
                            lineHeight: 1
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = THEME.AMBER}
                          onMouseLeave={(e) => e.currentTarget.style.color = THEME.TEXT_DIM}
                          title="Remove topic"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* M5.2: Sub Topics - Multi-select with additive linking */}
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
                    SUB TOPICS
                  </label>
                  {/* + Button for Adding Subtopics (requires a topic to be linked) */}
                  {selectedLesson?.id && formData.topics.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Use first topic as parent for new subtopic
                        const parentTopic = formData.topics[0]
                        if (parentTopic?.id) {
                          const newSubtopicId = addSubtopicToLessonTopic(selectedLesson.id, parentTopic.id, 'New Subtopic')
                          if (newSubtopicId) {
                            startEditingSubtopic(newSubtopicId, 'New Subtopic')
                          }
                        }
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
                      title="Add new subtopic"
                    >
                      +
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: THEME.TEXT_DIM }}>
                  {formData.topics.reduce((sum, t) => sum + (t.subtopics?.length || 0), 0)} linked
                </span>
              </div>

              {/* Dropdown to add existing subtopics */}
              <button
                onClick={() => setShowSubtopicDropdown(!showSubtopicDropdown)}
                disabled={formData.topics.length === 0}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: formData.topics.length === 0 ? THEME.TEXT_MUTED : THEME.TEXT_DIM,
                  fontSize: '13px',
                  fontFamily: THEME.FONT_PRIMARY,
                  textAlign: 'left',
                  cursor: formData.topics.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: formData.topics.length === 0 ? 0.5 : 1
                }}
              >
                <span>{formData.topics.length === 0 ? 'Link a topic first' : 'Add existing subtopic...'}</span>
                <span style={{ color: THEME.AMBER }}>V</span>
              </button>

              {/* Dropdown options - show subtopics for all linked topics */}
              {showSubtopicDropdown && formData.topics.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: THEME.BG_PANEL,
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '4px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {/* Get all subtopics for linked topics */}
                  {(() => {
                    const linkedTopicIds = formData.topics.map(t => t.scalarTopicId || t.id)
                    const relevantSubtopics = canonicalSubtopics.filter(s =>
                      linkedTopicIds.includes(s.topicId)
                    )
                    if (relevantSubtopics.length === 0) {
                      return (
                        <div style={{ padding: '8px 12px', color: THEME.TEXT_DIM, fontSize: '13px' }}>
                          No subtopics available
                        </div>
                      )
                    }
                    return relevantSubtopics.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        onClick={() => {
                          // M5.2: Add subtopic to its parent topic (with dedup)
                          const parentTopicIdx = formData.topics.findIndex(t =>
                            (t.scalarTopicId || t.id) === s.topicId
                          )
                          if (parentTopicIdx >= 0) {
                            const parentTopic = formData.topics[parentTopicIdx]
                            const alreadyLinked = (parentTopic.subtopics || []).some(
                              st => (st.scalarSubtopicId || st.id) === s.id
                            )
                            if (!alreadyLinked) {
                              const newSubtopic = {
                                id: `subtopic-linked-${Date.now()}`,
                                scalarSubtopicId: s.id,
                                title: s.title,
                                number: s.serial || `${parentTopic.number}.${(parentTopic.subtopics?.length || 0) + 1}`
                              }
                              const updatedTopics = [...formData.topics]
                              updatedTopics[parentTopicIdx] = {
                                ...parentTopic,
                                subtopics: [...(parentTopic.subtopics || []), newSubtopic]
                              }
                              updateField('topics', updatedTopics)
                            }
                          }
                          setShowSubtopicDropdown(false)
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: THEME.TEXT_PRIMARY,
                          borderBottom: idx < relevantSubtopics.length - 1 ? `1px solid ${THEME.BORDER}` : 'none'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = THEME.BG_DARK}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {s.serial || ''} {s.title}
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* M5.2: Linked Subtopics Chip List (grouped by parent topic) */}
              {formData.topics.some(t => t.subtopics?.length > 0) && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  {formData.topics.flatMap((topic, topicIdx) =>
                    (topic.subtopics || []).map((subtopic, subIdx) => {
                      // Resolve display info from canonical if available
                      const canonicalSubtopic = canonicalSubtopics.find(cs =>
                        cs.id === subtopic.scalarSubtopicId || cs.id === subtopic.id
                      )
                      const displaySerial = canonicalSubtopic?.serial || subtopic.number || `${topic.number}.${subIdx + 1}`
                      const displayTitle = canonicalSubtopic?.title || subtopic.title || 'Untitled'

                      return (
                        <div
                          key={subtopic.id || `${topicIdx}-${subIdx}`}
                          onDoubleClick={() => startEditingSubtopic(subtopic.id, subtopic.title)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: THEME.BG_DARK,
                            border: `1px solid ${THEME.BORDER}`,
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ color: THEME.GREEN_BRIGHT }}>{displaySerial}</span>
                          <span style={{ color: THEME.TEXT_PRIMARY }}>{displayTitle}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // M5.2: Remove this subtopic from its parent topic
                              const updatedTopics = [...formData.topics]
                              updatedTopics[topicIdx] = {
                                ...topic,
                                subtopics: (topic.subtopics || []).filter((_, i) => i !== subIdx)
                              }
                              updateField('topics', updatedTopics)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: THEME.TEXT_DIM,
                              cursor: 'pointer',
                              fontSize: '14px',
                              padding: '0 2px',
                              lineHeight: 1
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = THEME.AMBER}
                            onMouseLeave={(e) => e.currentTarget.style.color = THEME.TEXT_DIM}
                            title="Remove subtopic"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

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
  onAdd,  // Optional handler for '+' button
  // Phase C: Inline editing props
  isEditing = false,
  editValue = '',
  onEditChange,
  onEditKeyDown,
  onEditBlur,
  editInputRef,
  onDoubleClick  // Phase C: Double-click to edit existing item
}) {
  // Phase C: Click timer ref for distinguishing single vs double click
  const clickTimerRef = useRef(null)

  // Phase C: Handle click with delay to allow double-click to cancel
  const handleClick = useCallback(() => {
    if (onDoubleClick) {
      // If double-click handler exists, delay the toggle to detect double-click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
      clickTimerRef.current = setTimeout(() => {
        onToggle()
        clickTimerRef.current = null
      }, 200)  // 200ms delay to detect double-click
    } else {
      // No double-click handler, toggle immediately
      onToggle()
    }
  }, [onToggle, onDoubleClick])

  // Phase C: Handle double-click - cancel the pending single-click and enter edit mode
  const handleDoubleClick = useCallback((e) => {
    if (onDoubleClick) {
      // Cancel pending single-click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
      e.stopPropagation()
      onDoubleClick()
    }
  }, [onDoubleClick])

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
      {/* Phase C: Show input when editing, otherwise show dropdown button */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editValue}
          onChange={onEditChange}
          onKeyDown={onEditKeyDown}
          onBlur={onEditBlur}
          style={{
            width: '100%',
            background: '#2a2a2a',
            border: `1px solid ${THEME.GREEN_BRIGHT}`,
            borderRadius: '4px',
            padding: '10px 12px',
            fontSize: '13px',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.WHITE,
            outline: 'none'
          }}
        />
      ) : (
        <button
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
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
      )}
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
