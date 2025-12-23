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

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function LessonEditor() {
  const {
    editorCollapsed,
    setEditorCollapsed,
    selectedLesson,
    updateLesson,
    addTopicToLesson,
    toggleLessonLO,
    scalarData,
    currentModule,
    LESSON_TYPES
  } = useDesign()

  // LO dropdown state
  const [showLODropdown, setShowLODropdown] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)

  // Get module LOs for dropdown
  const module = scalarData?.modules?.find(m => m.order === currentModule) || scalarData?.modules?.[0]
  const moduleLOs = module?.learningObjectives || []

  // Get primary assigned LO
  const primaryLOId = selectedLesson?.learningObjectives?.[0]
  const primaryLO = primaryLOId ? moduleLOs.find(lo => lo.id === primaryLOId) : null

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
  // EXPANDED STATE - Full Panel
  // ============================================
  return (
    <div
      style={{
        width: '220px',
        margin: '8px',
        marginRight: '12px',
        background: 'rgba(20, 20, 20, 0.9)',
        border: '1px solid rgba(100, 100, 100, 0.5)',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
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
            fontSize: '1.3vh',
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
            fontSize: '1.6vh',
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
                  fontSize: '1.3vh',
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
                  fontSize: '1.3vh',
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
              <div style={{ fontSize: '1.2vh' }}>
                <span style={{ color: THEME.TEXT_PRIMARY }}>{primaryLO.order}. </span>
                <span style={{ color: THEME.GREEN_BRIGHT }}>{primaryLO.verb}</span>
                <span style={{ color: THEME.TEXT_PRIMARY }}> {primaryLO.description}</span>
              </div>
            ) : (
              <div style={{ fontSize: '1.2vh' }}>
                <span style={{ color: THEME.TEXT_PRIMARY }}>1. </span>
                <span style={{ color: THEME.GREEN_BRIGHT }}>EXAMPLE</span>
                <span style={{ color: THEME.TEXT_PRIMARY }}> Learning Objective Text</span>
              </div>
            )}
            <button
              onClick={() => setShowLODropdown(!showLODropdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: THEME.TEXT_DIM,
                fontSize: '1.1vh',
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
                onClick={() => addTopicToLesson(selectedLesson.id, 'Topic Text')}
                style={plusButtonStyle}
              >
                +
              </button>
            }
          >
            {selectedLesson.topics?.length > 0 ? (
              selectedLesson.topics.map(topic => (
                <div key={topic.id} style={{ fontSize: '1.2vh', marginBottom: '0.3vh' }}>
                  <span style={{ color: THEME.TEXT_PRIMARY }}>{topic.number || '1.1'} </span>
                  <span style={{ color: THEME.GREEN_BRIGHT }}>Add</span>
                  <span style={{ color: THEME.TEXT_PRIMARY }}> {topic.title}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '1.2vh' }}>
                <span style={{ color: THEME.TEXT_PRIMARY }}>1.1 </span>
                <span style={{ color: THEME.GREEN_BRIGHT }}>Add</span>
                <span style={{ color: THEME.TEXT_PRIMARY }}> Topic Text</span>
              </div>
            )}
          </FieldSection>

          {/* Subtopic Field */}
          <FieldSection
            label="Subtopic:"
            action={<button style={plusButtonStyle}>+</button>}
          >
            <div style={{ fontSize: '1.2vh' }}>
              <span style={{ color: THEME.TEXT_PRIMARY }}>1.1.1 </span>
              <span style={{ color: THEME.GREEN_BRIGHT }}>Add</span>
              <span style={{ color: THEME.TEXT_PRIMARY }}> Subtopic Text</span>
            </div>
          </FieldSection>

          {/* Lesson Type Field */}
          <FieldSection label="Lesson Type:">
            <span
              style={{
                color: THEME.AMBER,
                fontSize: '1.3vh',
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              {lessonType.name}
            </span>
          </FieldSection>

          {/* Timings Field */}
          <FieldSection label="Timings:" noBorder>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
              <span style={{ color: THEME.AMBER, fontSize: '1.3vh', fontFamily: THEME.FONT_MONO }}>
                {formatTime(selectedLesson.startTime)} - {calculateEndTime()}
              </span>
              <span style={{ color: THEME.GREEN_BRIGHT, fontSize: '1.3vh', fontFamily: THEME.FONT_MONO }}>
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
            fontSize: '1.2vh',
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
            fontSize: '1.1vh',
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
  return (
    <div
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
                background: isSelected ? THEME.AMBER_DARK : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4vw',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? THEME.AMBER_DARK : THEME.BG_DARK}
              onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? THEME.AMBER_DARK : 'transparent'}
            >
              <span style={{ fontFamily: THEME.FONT_MONO, minWidth: '1.5vw' }}>
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
// STYLES
// ============================================

const plusButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.AMBER,
  fontSize: '1.4vh',
  fontWeight: 'bold',
  cursor: 'pointer',
  padding: '0 0.3vw'
}

export default LessonEditor
