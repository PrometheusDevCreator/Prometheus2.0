/**
 * LessonEditor.jsx - Collapsible Left Panel for Lesson Editing
 *
 * REVISED IMPLEMENTATION - Per DESIGN_Page Mockup
 *
 * Collapsed State:
 * - Vertical rotated tab on far left edge
 * - "L E S S O N  E D I T O R" reading bottom-to-top
 *
 * Expanded State:
 * - Panel slides out from left (~280px wide)
 * - Fields: Title, Learning Objective, Topic, Subtopic, Lesson Type, Timings
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function LessonEditor() {
  const {
    editorCollapsed,
    setEditorCollapsed,
    selectedLesson,
    updateLesson,
    addTopicToLesson,
    removeTopicFromLesson,
    updateLessonTopic,
    addSubtopicToLessonTopic,
    removeSubtopicFromLessonTopic,
    updateLessonSubtopic,
    toggleLessonLO,
    scalarData,
    currentModule,
    LESSON_TYPES
  } = useDesign()

  // LO dropdown state
  const [showLODropdown, setShowLODropdown] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)

  // Topic modal state
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState(null)

  // Get module LOs for dropdown
  const module = scalarData?.modules?.find(m => m.order === currentModule) || scalarData?.modules?.[0]
  const moduleLOs = module?.learningObjectives || []

  // Get primary assigned LO
  const primaryLOId = selectedLesson?.learningObjectives?.[0]
  const primaryLO = primaryLOId ? moduleLOs.find(lo => lo.id === primaryLOId) : null

  // Get existing topics from scalar for dropdown selection
  const existingScalarTopics = useMemo(() => {
    const topics = []
    moduleLOs.forEach(lo => {
      (lo.topics || []).forEach(topic => {
        topics.push({
          id: topic.id,
          title: topic.title,
          loId: lo.id,
          loOrder: lo.order,
          number: `${lo.order}.${topic.order}`
        })
      })
    })
    return topics
  }, [moduleLOs])

  // Check if lesson has an assigned LO (for numbering display)
  const hasAssignedLO = selectedLesson?.learningObjectives?.length > 0

  // Handle adding a new topic
  const handleAddTopic = useCallback((title, selectFromScalar = null) => {
    if (!selectedLesson) return
    if (selectFromScalar) {
      // Link existing scalar topic to lesson
      addTopicToLesson(selectedLesson.id, selectFromScalar.title)
    } else {
      // Create new topic
      addTopicToLesson(selectedLesson.id, title)
    }
    setShowTopicModal(false)
  }, [selectedLesson, addTopicToLesson])

  // Handle editing a topic
  const handleEditTopic = useCallback((topicId, newTitle) => {
    if (!selectedLesson) return
    updateLessonTopic(selectedLesson.id, topicId, { title: newTitle })
    setEditingTopicId(null)
  }, [selectedLesson, updateLessonTopic])

  // Handle removing a topic (unlink only)
  const handleRemoveTopic = useCallback((topicId) => {
    if (!selectedLesson) return
    removeTopicFromLesson(selectedLesson.id, topicId)
  }, [selectedLesson, removeTopicFromLesson])

  // Subtopic modal state
  const [showSubtopicModal, setShowSubtopicModal] = useState(false)
  const [subtopicParentTopicId, setSubtopicParentTopicId] = useState(null)
  const [editingSubtopicId, setEditingSubtopicId] = useState(null)
  const [editingSubtopicParentId, setEditingSubtopicParentId] = useState(null)

  // Handle adding a subtopic
  const handleAddSubtopic = useCallback((topicId, title) => {
    if (!selectedLesson) return
    addSubtopicToLessonTopic(selectedLesson.id, topicId, title)
    setShowSubtopicModal(false)
    setSubtopicParentTopicId(null)
  }, [selectedLesson, addSubtopicToLessonTopic])

  // Handle editing a subtopic
  const handleEditSubtopic = useCallback((topicId, subtopicId, newTitle) => {
    if (!selectedLesson) return
    updateLessonSubtopic(selectedLesson.id, topicId, subtopicId, { title: newTitle })
    setEditingSubtopicId(null)
    setEditingSubtopicParentId(null)
  }, [selectedLesson, updateLessonSubtopic])

  // Handle removing a subtopic
  const handleRemoveSubtopic = useCallback((topicId, subtopicId) => {
    if (!selectedLesson) return
    removeSubtopicFromLessonTopic(selectedLesson.id, topicId, subtopicId)
  }, [selectedLesson, removeSubtopicFromLessonTopic])

  // Open subtopic modal for a specific topic
  const openSubtopicModal = useCallback((topicId) => {
    setSubtopicParentTopicId(topicId)
    setShowSubtopicModal(true)
  }, [])

  // Get lesson type info
  const lessonType = selectedLesson
    ? LESSON_TYPES.find(t => t.id === selectedLesson.type) || LESSON_TYPES[0]
    : LESSON_TYPES[0]

  // Format time display
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--'
    return timeStr.slice(0, 2) + ':' + (timeStr.slice(2, 4) || '00')
  }

  const calculateEndTime = () => {
    if (!selectedLesson?.startTime) return '--:--'
    const startHour = parseInt(selectedLesson.startTime.slice(0, 2))
    const startMin = parseInt(selectedLesson.startTime.slice(2, 4)) || 0
    const totalMinutes = startHour * 60 + startMin + selectedLesson.duration
    const endHour = Math.floor(totalMinutes / 60) % 24
    const endMin = totalMinutes % 60
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
  }

  // ============================================
  // COLLAPSED STATE - Vertical Tab
  // ============================================
  if (editorCollapsed) {
    return (
      <div
        onClick={() => setEditorCollapsed(false)}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '280px',
          background: 'rgba(26, 26, 26, 0.95)',
          borderRight: `1px solid ${THEME.BORDER}`,
          borderTop: `1px solid ${THEME.BORDER}`,
          borderBottom: `1px solid ${THEME.BORDER}`,
          borderRadius: '0 4px 4px 0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(26, 26, 26, 1)'
          e.currentTarget.style.borderColor = THEME.AMBER
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(26, 26, 26, 0.95)'
          e.currentTarget.style.borderColor = THEME.BORDER
        }}
      >
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '1.1vh',
            letterSpacing: '0.25vh',
            color: THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          L E S S O N{'   '}E D I T O R
        </div>
      </div>
    )
  }

  // ============================================
  // EXPANDED STATE - Full Panel (position: absolute to not shift timetable)
  // ============================================
  return (
    <div
      style={{
        width: '270px',
        maxHeight: 'calc(100% - 140px)',
        position: 'absolute',
        left: '8px',
        top: '23px',
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid rgba(100, 100, 100, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        overflow: 'hidden'
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.2vh 1vw',
          borderBottom: `1px solid rgba(255, 255, 255, 0.2)`
        }}
      >
        <span
          style={{
            fontSize: '1.6vh',
            letterSpacing: '0.12vw',
            color: THEME.TEXT_PRIMARY,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase'
          }}
        >
          LESSON EDITOR
        </span>
        <button
          onClick={() => setEditorCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: THEME.TEXT_DIM,
            fontSize: '1.9vh',
            cursor: 'pointer',
            padding: '0.2vh 0.4vw',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = THEME.AMBER}
          onMouseLeave={(e) => e.currentTarget.style.color = THEME.TEXT_DIM}
        >
          ×
        </button>
      </div>

      {/* Panel Content */}
      {selectedLesson ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '0.8vh 1vw' }}>
          {/* Title Field */}
          <FieldSection label="Title:">
            {editingTitle ? (
              <input
                autoFocus
                type="text"
                defaultValue={selectedLesson.title}
                onBlur={(e) => {
                  updateLesson(selectedLesson.id, { title: e.target.value })
                  setEditingTitle(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateLesson(selectedLesson.id, { title: e.target.value })
                    setEditingTitle(false)
                  }
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                style={{
                  width: '100%',
                  background: THEME.BG_INPUT,
                  border: `1px solid ${THEME.AMBER}`,
                  borderRadius: '0.3vh',
                  color: THEME.AMBER,
                  fontSize: '1.6vh',
                  fontFamily: THEME.FONT_PRIMARY,
                  padding: '0.4vh 0.6vw',
                  outline: 'none'
                }}
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                style={{
                  color: THEME.AMBER,
                  fontSize: '1.6vh',
                  fontFamily: THEME.FONT_PRIMARY,
                  cursor: 'pointer'
                }}
              >
                {selectedLesson.title}
              </span>
            )}
          </FieldSection>

          {/* Learning Objective Field */}
          <FieldSection label="Learning Objective:" style={{ position: 'relative' }}>
            {primaryLO ? (
              <div style={{ fontSize: '1.4vh' }}>
                <span style={{ color: THEME.TEXT_PRIMARY }}>{primaryLO.order}. </span>
                <span style={{ color: THEME.GREEN_BRIGHT }}>{primaryLO.verb}</span>
                <span style={{ color: THEME.TEXT_PRIMARY }}> {primaryLO.description}</span>
              </div>
            ) : (
              <div style={{ fontSize: '1.4vh', color: THEME.TEXT_DIM, fontStyle: 'italic' }}>
                Select LO
              </div>
            )}
            <button
              onClick={() => setShowLODropdown(!showLODropdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: THEME.TEXT_DIM,
                fontSize: '1.3vh',
                cursor: 'pointer',
                marginTop: '0.4vh',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Select LO
            </button>

            {/* LO Dropdown */}
            {showLODropdown && (
              <LODropdown
                moduleLOs={moduleLOs}
                selectedLOs={selectedLesson.learningObjectives || []}
                onToggle={(loId) => toggleLessonLO(selectedLesson.id, loId)}
                onClose={() => setShowLODropdown(false)}
              />
            )}
          </FieldSection>

          {/* Topic Field */}
          <FieldSection
            label="Topic:"
            action={
              <button
                onClick={() => setShowTopicModal(true)}
                style={plusButtonStyle}
              >
                +
              </button>
            }
            style={{ position: 'relative' }}
          >
            {selectedLesson.topics?.length > 0 ? (
              selectedLesson.topics.map(topic => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  hasAssignedLO={hasAssignedLO}
                  isEditing={editingTopicId === topic.id}
                  onEdit={() => setEditingTopicId(topic.id)}
                  onSave={(newTitle) => handleEditTopic(topic.id, newTitle)}
                  onCancel={() => setEditingTopicId(null)}
                  onRemove={() => handleRemoveTopic(topic.id)}
                />
              ))
            ) : (
              <div style={{ fontSize: '1.4vh', color: THEME.TEXT_DIM, fontStyle: 'italic' }}>
                Click + to add a topic
              </div>
            )}

            {/* Topic Entry Modal */}
            {showTopicModal && (
              <TopicEntryModal
                existingTopics={existingScalarTopics}
                hasAssignedLO={hasAssignedLO}
                primaryLO={primaryLO}
                onAdd={handleAddTopic}
                onClose={() => setShowTopicModal(false)}
              />
            )}
          </FieldSection>

          {/* Subtopic Field - shows subtopics grouped by topic */}
          <FieldSection
            label="Subtopic:"
            style={{ position: 'relative' }}
          >
            {selectedLesson.topics?.length > 0 ? (
              selectedLesson.topics.map(topic => {
                const subtopics = topic.subtopics || []
                return (
                  <div key={topic.id} style={{ marginBottom: '0.5vh' }}>
                    {/* Topic header with + button for adding subtopics */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '1.2vh',
                      color: THEME.TEXT_DIM,
                      marginBottom: '0.2vh'
                    }}>
                      <span>{topic.number} {topic.title}</span>
                      <button
                        onClick={() => openSubtopicModal(topic.id)}
                        style={plusButtonStyle}
                      >
                        +
                      </button>
                    </div>
                    {/* Subtopics for this topic */}
                    {subtopics.length > 0 ? (
                      subtopics.map(subtopic => (
                        <SubtopicItem
                          key={subtopic.id}
                          subtopic={subtopic}
                          hasAssignedLO={hasAssignedLO}
                          isEditing={editingSubtopicId === subtopic.id && editingSubtopicParentId === topic.id}
                          onEdit={() => {
                            setEditingSubtopicId(subtopic.id)
                            setEditingSubtopicParentId(topic.id)
                          }}
                          onSave={(newTitle) => handleEditSubtopic(topic.id, subtopic.id, newTitle)}
                          onCancel={() => {
                            setEditingSubtopicId(null)
                            setEditingSubtopicParentId(null)
                          }}
                          onRemove={() => handleRemoveSubtopic(topic.id, subtopic.id)}
                        />
                      ))
                    ) : (
                      <div style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM, fontStyle: 'italic', marginLeft: '1vw' }}>
                        No subtopics
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div style={{ fontSize: '1.4vh', color: THEME.TEXT_DIM, fontStyle: 'italic' }}>
                Add topics first to create subtopics
              </div>
            )}

            {/* Subtopic Entry Modal */}
            {showSubtopicModal && subtopicParentTopicId && (
              <SubtopicEntryModal
                parentTopic={selectedLesson.topics?.find(t => t.id === subtopicParentTopicId)}
                hasAssignedLO={hasAssignedLO}
                onAdd={(title) => handleAddSubtopic(subtopicParentTopicId, title)}
                onClose={() => {
                  setShowSubtopicModal(false)
                  setSubtopicParentTopicId(null)
                }}
              />
            )}
          </FieldSection>

          {/* Lesson Type Field */}
          <FieldSection label="Lesson Type:">
            <span
              style={{
                color: THEME.AMBER,
                fontSize: '1.6vh',
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              {lessonType.name}
            </span>
          </FieldSection>

          {/* Timings Field */}
          <FieldSection label="Timings:" noBorder>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
              <span style={{ color: THEME.AMBER, fontSize: '1.6vh', fontFamily: THEME.FONT_MONO }}>
                {formatTime(selectedLesson.startTime)} - {calculateEndTime()}
              </span>
              <span style={{ color: THEME.GREEN_BRIGHT, fontSize: '1.6vh', fontFamily: THEME.FONT_MONO }}>
                {selectedLesson.duration} mins
              </span>
            </div>
          </FieldSection>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: THEME.TEXT_DIM,
            fontSize: '1.4vh',
            fontStyle: 'italic',
            padding: '2vh'
          }}
        >
          Select a lesson to edit
        </div>
      )}
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FieldSection({ label, children, action, style = {}, noBorder = false }) {
  return (
    <div
      style={{
        padding: '0.8vh 0',
        borderBottom: noBorder ? 'none' : `1px solid rgba(255, 255, 255, 0.1)`,
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3vh' }}>
        <span
          style={{
            fontSize: '1.3vh',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

function LODropdown({ moduleLOs, selectedLOs, onToggle, onClose }) {
  // Handle click outside to close
  const handleClickOutside = useCallback((e) => {
    // Check if click is outside the dropdown
    if (!e.target.closest('.lo-dropdown')) {
      onClose()
    }
  }, [onClose])

  // Handle keydown for ENTER to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClickOutside, handleKeyDown])

  return (
    <div
      className="lo-dropdown"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 100,
        background: THEME.BG_PANEL,
        border: `1px solid ${THEME.BORDER_LIGHT}`,
        borderRadius: '0.4vh',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        maxHeight: '18vh',
        overflow: 'auto'
      }}
      onKeyDown={handleKeyDown}
    >
      {moduleLOs.length === 0 ? (
        <div style={{ padding: '0.8vh 1vw', color: THEME.TEXT_DIM, fontSize: '1.1vh', fontStyle: 'italic' }}>
          No LOs available
        </div>
      ) : (
        moduleLOs.map(lo => {
          const isSelected = selectedLOs.includes(lo.id)
          return (
            <div
              key={lo.id}
              onClick={() => onToggle(lo.id)}
              style={{
                padding: '0.5vh 0.8vw',
                fontSize: '1.1vh',
                color: isSelected ? THEME.AMBER : THEME.TEXT_PRIMARY,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4vw',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = THEME.BG_DARK
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontFamily: THEME.FONT_MONO, minWidth: '1.5vw', color: isSelected ? THEME.AMBER : THEME.TEXT_DIM }}>
                {isSelected ? '✓' : ''} {lo.order}.
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lo.verb} {lo.description}
              </span>
            </div>
          )
        })
      )}
      <div
        onClick={onClose}
        style={{
          padding: '0.4vh 0.8vw',
          fontSize: '1vh',
          color: THEME.TEXT_DIM,
          borderTop: `1px solid ${THEME.BORDER}`,
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        Close
      </div>
    </div>
  )
}

// ============================================
// TOPIC ITEM COMPONENT
// ============================================

function TopicItem({ topic, hasAssignedLO, isEditing, onEdit, onSave, onCancel, onRemove }) {
  const [editValue, setEditValue] = useState(topic.title)
  const [hovered, setHovered] = useState(false)

  // Display number: actual number if LO assigned, "x.x" in red if not
  const displayNumber = hasAssignedLO ? (topic.number || 'x.x') : 'x.x'
  const numberColor = hasAssignedLO ? THEME.TEXT_PRIMARY : '#ff4444'

  if (isEditing) {
    return (
      <div style={{ fontSize: '1.4vh', marginBottom: '0.3vh', display: 'flex', alignItems: 'center', gap: '0.3vw' }}>
        <span style={{ color: numberColor }}>{displayNumber}</span>
        <input
          autoFocus
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(editValue)
            if (e.key === 'Escape') onCancel()
          }}
          style={{
            flex: 1,
            background: THEME.BG_INPUT,
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '0.3vh',
            color: THEME.TEXT_PRIMARY,
            fontSize: '1.3vh',
            fontFamily: THEME.FONT_PRIMARY,
            padding: '0.2vh 0.4vw',
            outline: 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        fontSize: '1.4vh',
        marginBottom: '0.3vh',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3vw',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ color: numberColor }}>{displayNumber}</span>
      <span
        onClick={onEdit}
        style={{
          color: THEME.TEXT_PRIMARY,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {topic.title}
      </span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ff4444',
            fontSize: '1.2vh',
            cursor: 'pointer',
            padding: '0 0.2vw',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ============================================
// TOPIC ENTRY MODAL COMPONENT
// ============================================

function TopicEntryModal({ existingTopics, hasAssignedLO, primaryLO, onAdd, onClose }) {
  const [mode, setMode] = useState('new') // 'new' or 'existing'
  const [newTitle, setNewTitle] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  // Filter existing topics by search
  const filteredTopics = existingTopics.filter(t =>
    t.title.toLowerCase().includes(searchFilter.toLowerCase())
  )

  // Preview number for new topic
  const previewNumber = hasAssignedLO && primaryLO ? `${primaryLO.order}.?` : 'x.x'
  const previewNumberColor = hasAssignedLO ? THEME.TEXT_PRIMARY : '#ff4444'

  const handleSubmit = () => {
    if (newTitle.trim()) {
      onAdd(newTitle.trim())
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 199
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 200,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER_LIGHT}`,
          borderRadius: '0.4vh',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          padding: '1vh 0.8vw'
        }}
      >
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '1vw', marginBottom: '0.8vh' }}>
          <button
            onClick={() => setMode('new')}
            style={{
              background: 'transparent',
              border: 'none',
              color: mode === 'new' ? THEME.AMBER : THEME.TEXT_DIM,
              fontSize: '1.2vh',
              cursor: 'pointer',
              padding: 0,
              borderBottom: mode === 'new' ? `1px solid ${THEME.AMBER}` : 'none'
            }}
          >
            Create New
          </button>
          <button
            onClick={() => setMode('existing')}
            style={{
              background: 'transparent',
              border: 'none',
              color: mode === 'existing' ? THEME.AMBER : THEME.TEXT_DIM,
              fontSize: '1.2vh',
              cursor: 'pointer',
              padding: 0,
              borderBottom: mode === 'existing' ? `1px solid ${THEME.AMBER}` : 'none'
            }}
          >
            Select Existing
          </button>
        </div>

        {mode === 'new' ? (
          <>
            {/* Number Preview */}
            <div style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM, marginBottom: '0.4vh' }}>
              Number: <span style={{ color: previewNumberColor }}>{previewNumber}</span>
              {!hasAssignedLO && (
                <span style={{ color: '#ff4444', marginLeft: '0.5vw' }}>(Assign LO for numbering)</span>
              )}
            </div>
            {/* Title Input */}
            <div style={{ display: 'flex', gap: '0.4vw' }}>
              <input
                autoFocus
                type="text"
                placeholder="Enter topic title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                  if (e.key === 'Escape') onClose()
                }}
                style={{
                  flex: 1,
                  background: THEME.BG_INPUT,
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '0.3vh',
                  color: THEME.TEXT_PRIMARY,
                  fontSize: '1.3vh',
                  fontFamily: THEME.FONT_PRIMARY,
                  padding: '0.4vh 0.6vw',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!newTitle.trim()}
                style={{
                  background: newTitle.trim() ? THEME.AMBER : THEME.BG_DARK,
                  border: 'none',
                  borderRadius: '0.3vh',
                  color: newTitle.trim() ? THEME.BG_DARK : THEME.TEXT_DIM,
                  fontSize: '1.2vh',
                  cursor: newTitle.trim() ? 'pointer' : 'default',
                  padding: '0.4vh 0.8vw'
                }}
              >
                Add
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Search Input */}
            <input
              autoFocus
              type="text"
              placeholder="Search existing topics..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                background: THEME.BG_INPUT,
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '0.3vh',
                color: THEME.TEXT_PRIMARY,
                fontSize: '1.2vh',
                fontFamily: THEME.FONT_PRIMARY,
                padding: '0.4vh 0.6vw',
                marginBottom: '0.6vh',
                outline: 'none'
              }}
            />
            {/* Existing Topics List */}
            <div style={{ maxHeight: '15vh', overflow: 'auto' }}>
              {filteredTopics.length === 0 ? (
                <div style={{ color: THEME.TEXT_DIM, fontSize: '1.1vh', fontStyle: 'italic', padding: '0.4vh 0' }}>
                  {existingTopics.length === 0 ? 'No topics in Scalar yet' : 'No matching topics'}
                </div>
              ) : (
                filteredTopics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => onAdd(topic.title, topic)}
                    style={{
                      padding: '0.4vh 0.4vw',
                      fontSize: '1.2vh',
                      color: THEME.TEXT_PRIMARY,
                      cursor: 'pointer',
                      borderRadius: '0.2vh',
                      display: 'flex',
                      gap: '0.4vw'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = THEME.BG_DARK}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: THEME.TEXT_DIM, minWidth: '2vw' }}>{topic.number}</span>
                    <span>{topic.title}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Close Button */}
        <div
          onClick={onClose}
          style={{
            marginTop: '0.6vh',
            padding: '0.3vh 0',
            fontSize: '1vh',
            color: THEME.TEXT_DIM,
            borderTop: `1px solid ${THEME.BORDER}`,
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          Cancel
        </div>
      </div>
    </>
  )
}

// ============================================
// SUBTOPIC ITEM COMPONENT
// ============================================

function SubtopicItem({ subtopic, hasAssignedLO, isEditing, onEdit, onSave, onCancel, onRemove }) {
  const [editValue, setEditValue] = useState(subtopic.title)
  const [hovered, setHovered] = useState(false)

  // Display number: actual number if parent topic has valid number, "x.x.x" in red if not
  const displayNumber = (hasAssignedLO && subtopic.number && subtopic.number !== 'x.x.x')
    ? subtopic.number
    : 'x.x.x'
  const numberColor = (hasAssignedLO && subtopic.number && subtopic.number !== 'x.x.x')
    ? THEME.TEXT_PRIMARY
    : '#ff4444'

  if (isEditing) {
    return (
      <div style={{ fontSize: '1.3vh', marginBottom: '0.2vh', marginLeft: '1vw', display: 'flex', alignItems: 'center', gap: '0.3vw' }}>
        <span style={{ color: numberColor }}>{displayNumber}</span>
        <input
          autoFocus
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave(editValue)
            if (e.key === 'Escape') onCancel()
          }}
          style={{
            flex: 1,
            background: THEME.BG_INPUT,
            border: `1px solid ${THEME.AMBER}`,
            borderRadius: '0.3vh',
            color: THEME.TEXT_PRIMARY,
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            padding: '0.2vh 0.4vw',
            outline: 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        fontSize: '1.3vh',
        marginBottom: '0.2vh',
        marginLeft: '1vw',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3vw',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ color: numberColor }}>{displayNumber}</span>
      <span
        onClick={onEdit}
        style={{
          color: THEME.TEXT_PRIMARY,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {subtopic.title}
      </span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ff4444',
            fontSize: '1.1vh',
            cursor: 'pointer',
            padding: '0 0.2vw',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ============================================
// SUBTOPIC ENTRY MODAL COMPONENT
// ============================================

function SubtopicEntryModal({ parentTopic, hasAssignedLO, onAdd, onClose }) {
  const [newTitle, setNewTitle] = useState('')

  // Preview number for new subtopic
  const topicNumber = parentTopic?.number || 'x.x'
  const hasValidTopicNumber = topicNumber !== 'x.x' && hasAssignedLO
  const previewNumber = hasValidTopicNumber ? `${topicNumber}.?` : 'x.x.x'
  const previewNumberColor = hasValidTopicNumber ? THEME.TEXT_PRIMARY : '#ff4444'

  const handleSubmit = () => {
    if (newTitle.trim()) {
      onAdd(newTitle.trim())
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 199
        }}
      />
      {/* Modal */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 200,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER_LIGHT}`,
          borderRadius: '0.4vh',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          padding: '1vh 0.8vw'
        }}
      >
        {/* Parent Topic Info */}
        <div style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM, marginBottom: '0.6vh' }}>
          Adding subtopic to: <span style={{ color: THEME.TEXT_PRIMARY }}>{parentTopic?.title || 'Topic'}</span>
        </div>

        {/* Number Preview */}
        <div style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM, marginBottom: '0.4vh' }}>
          Number: <span style={{ color: previewNumberColor }}>{previewNumber}</span>
          {!hasValidTopicNumber && (
            <span style={{ color: '#ff4444', marginLeft: '0.5vw' }}>(Assign LO for numbering)</span>
          )}
        </div>

        {/* Title Input */}
        <div style={{ display: 'flex', gap: '0.4vw' }}>
          <input
            autoFocus
            type="text"
            placeholder="Enter subtopic title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
              if (e.key === 'Escape') onClose()
            }}
            style={{
              flex: 1,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '0.3vh',
              color: THEME.TEXT_PRIMARY,
              fontSize: '1.3vh',
              fontFamily: THEME.FONT_PRIMARY,
              padding: '0.4vh 0.6vw',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newTitle.trim()}
            style={{
              background: newTitle.trim() ? THEME.AMBER : THEME.BG_DARK,
              border: 'none',
              borderRadius: '0.3vh',
              color: newTitle.trim() ? THEME.BG_DARK : THEME.TEXT_DIM,
              fontSize: '1.2vh',
              cursor: newTitle.trim() ? 'pointer' : 'default',
              padding: '0.4vh 0.8vw'
            }}
          >
            Add
          </button>
        </div>

        {/* Close Button */}
        <div
          onClick={onClose}
          style={{
            marginTop: '0.6vh',
            padding: '0.3vh 0',
            fontSize: '1vh',
            color: THEME.TEXT_DIM,
            borderTop: `1px solid ${THEME.BORDER}`,
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          Cancel
        </div>
      </div>
    </>
  )
}

// ============================================
// STYLES
// ============================================

const plusButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.AMBER,
  fontSize: '1.7vh',
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '0 0.3vw'
}

export default LessonEditor
