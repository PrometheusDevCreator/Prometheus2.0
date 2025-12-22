/**
 * LessonEditor.jsx - Collapsible Left Panel for DESIGN Section
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 1 (Shell)
 *
 * Width: ~20% of working area (collapsible to zero)
 * Height: Fills from navigation bar to PKE interface area
 *
 * Sections:
 * - Panel Header: Title + Context indicator + Collapse button
 * - Selected Lesson Display: Metadata for current selection
 * - Editable Fields: Title, Type, Duration
 * - Topics Section: Hierarchical with drag-to-reorder (Phase 3+)
 * - Learning Objectives Section: With checkboxes (Phase 3+)
 * - Legend: 2x3 grid of lesson types
 * - Duration Display: Total lesson duration
 *
 * Note: Full interactivity comes in Phase 2-3. This is the shell.
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function LessonEditor() {
  const {
    editorCollapsed,
    setEditorCollapsed,
    selectedLesson,
    selection,
    updateLesson,
    currentModule,
    currentWeek,
    activeTab,
    LESSON_TYPES,
    addTopicToLesson,
    removeTopicFromLesson,
    updateLessonTopic,
    toggleLessonLO,
    scalarData
  } = useDesign()

  // If collapsed, render nothing (expansion tab is now in TimeControls)
  if (editorCollapsed) {
    return null
  }

  // Determine what to show based on active tab and selection
  const showLessonEditor = activeTab === 'timetable' ||
    (activeTab === 'scalar' && selection.type === 'lesson')
  const showScalarEditor = activeTab === 'scalar' &&
    (selection.type === 'lo' || selection.type === 'topic' || selection.type === 'subtopic')

  return (
    <div
      style={{
        width: '22%',
        minWidth: '300px',
        maxWidth: '400px',
        height: '100%',
        background: THEME.BG_PANEL,
        borderRight: `1px solid ${THEME.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1vh 1vw',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <span
            style={{
              fontSize: '1.5vh',
              letterSpacing: '0.15vw',
              color: THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            {showScalarEditor ? 'Item Editor' : 'Lesson Editor'}
          </span>
          <span
            style={{
              fontSize: '1.3vh',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_MONO
            }}
          >
            M{currentModule} W{currentWeek}
          </span>
        </div>
        <button
          onClick={() => setEditorCollapsed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: THEME.TEXT_DIM,
            fontSize: '1.6vh',
            cursor: 'pointer',
            padding: '0.3vh 0.5vw'
          }}
          title="Collapse Editor"
        >
          ‹
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1vh 1vw' }}>
        {showLessonEditor && selectedLesson ? (
          <LessonEditorContent
            lesson={selectedLesson}
            updateLesson={updateLesson}
            addTopicToLesson={addTopicToLesson}
            removeTopicFromLesson={removeTopicFromLesson}
            updateLessonTopic={updateLessonTopic}
            toggleLessonLO={toggleLessonLO}
            scalarData={scalarData}
            currentModule={currentModule}
          />
        ) : showScalarEditor ? (
          <ScalarEditorContent />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Legend - Expanded to fill space */}
      <LessonLegend />
    </div>
  )
}

// ============================================
// LESSON EDITOR CONTENT (Phase 1 Shell)
// ============================================

function LessonEditorContent({
  lesson,
  updateLesson,
  addTopicToLesson,
  removeTopicFromLesson,
  updateLessonTopic,
  toggleLessonLO,
  scalarData,
  currentModule
}) {
  const { LESSON_TYPES } = useDesign()
  const [editingTitle, setEditingTitle] = useState(false)
  const [showLODropdown, setShowLODropdown] = useState(false)
  const [editingTopicId, setEditingTopicId] = useState(null)

  const lessonType = LESSON_TYPES.find(t => t.id === lesson.type) || LESSON_TYPES[0]

  // Get module LOs for dropdown
  const module = scalarData?.modules?.find(m => m.order === currentModule) || scalarData?.modules?.[0]
  const moduleLOs = module?.learningObjectives || []

  // Get primary assigned LO details for display under title
  const primaryLOId = lesson.learningObjectives?.[0]
  const primaryLO = primaryLOId ? moduleLOs.find(lo => lo.id === primaryLOId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
      {/* Selected Lesson Display */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', marginBottom: '0.5vh' }}>
          <span style={{ fontSize: '1.3vh', color: THEME.TEXT_DIM }}>LESSON:</span>
        </div>
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            defaultValue={lesson.title}
            onBlur={(e) => {
              updateLesson(lesson.id, { title: e.target.value })
              setEditingTitle(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateLesson(lesson.id, { title: e.target.value })
                setEditingTitle(false)
              }
              if (e.key === 'Escape') setEditingTitle(false)
            }}
            style={{
              width: '100%',
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '0.4vh',
              color: THEME.WHITE,
              fontSize: '1.5vh',
              fontFamily: THEME.FONT_PRIMARY,
              padding: '0.6vh 0.8vw',
              outline: 'none'
            }}
          />
        ) : (
          <div
            onClick={() => setEditingTitle(true)}
            style={{
              color: THEME.AMBER,
              fontSize: '1.5vh',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.1vw',
              cursor: 'pointer',
              padding: '0.3vh 0'
            }}
            title="Click to edit"
          >
            {lesson.title}
          </div>
        )}

        {/* Show assigned LO under title (requirement 8d) */}
        {primaryLO && (
          <div
            style={{
              fontSize: '1.1vh',
              color: THEME.TEXT_DIM,
              marginTop: '0.3vh',
              padding: '0.3vh 0',
              borderLeft: `2px solid ${THEME.AMBER}`,
              paddingLeft: '0.5vw'
            }}
          >
            <span style={{ color: THEME.AMBER, fontFamily: THEME.FONT_MONO }}>
              LO{primaryLO.order}:
            </span>{' '}
            {primaryLO.verb} {primaryLO.description}
          </div>
        )}
      </div>

      {/* LO Indicator (interactive circles) */}
      <LOIndicator lesson={lesson} />

      {/* Metadata Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.3vh', color: THEME.AMBER, fontFamily: THEME.FONT_MONO }}>
          {lesson.startTime || '----'}-{calculateEndTime(lesson.startTime, lesson.duration)}
        </span>
        <span style={{ fontSize: '1.3vh', color: THEME.TEXT_DIM }}>
          {lesson.duration} min
        </span>
        <span style={{ fontSize: '1.3vh', color: lessonType.color }}>
          {lessonType.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: THEME.BORDER, margin: '0.5vh 0' }} />

      {/* Editable Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
        {/* Title Field */}
        <FieldInput
          label="Title"
          value={lesson.title}
          onChange={(value) => updateLesson(lesson.id, { title: value })}
        />

        {/* Type and Duration Row - side by side */}
        <div style={{ display: 'flex', gap: '0.8vw', alignItems: 'flex-end' }}>
          {/* Type Dropdown - 50% width */}
          <div style={{ flex: 1 }}>
            <FieldDropdown
              label="Type"
              value={lesson.type}
              options={LESSON_TYPES.map(t => ({ value: t.id, label: t.label }))}
              onChange={(value) => updateLesson(lesson.id, { type: value })}
              compact
            />
          </div>

          {/* Duration Input - 25% width (75% reduced) */}
          <div style={{ width: '4vw', flexShrink: 0 }}>
            <FieldInput
              label="Duration"
              value={lesson.duration.toString()}
              type="number"
              suffix="min"
              min={5}
              max={480}
              step={5}
              onChange={(value) => {
                const duration = Math.max(5, Math.min(480, parseInt(value) || 5))
                updateLesson(lesson.id, { duration })
              }}
              compact
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: THEME.BORDER, margin: '0.5vh 0' }} />

      {/* Learning Objectives Section - NOW ABOVE TOPICS */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5vh' }}>
          <span style={{ fontSize: '1.3vh', color: THEME.TEXT_DIM, letterSpacing: '0.1vw' }}>LEARNING OBJECTIVES</span>
          <button
            style={addButtonStyle}
            onClick={() => setShowLODropdown(!showLODropdown)}
          >
            ASSIGN LO
          </button>
        </div>

        {/* LO Dropdown */}
        {showLODropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              background: THEME.BG_PANEL,
              border: `1px solid ${THEME.BORDER_LIGHT}`,
              borderRadius: '0.4vh',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              minWidth: '12vw',
              maxHeight: '20vh',
              overflow: 'auto'
            }}
          >
            {moduleLOs.length === 0 ? (
              <div style={{ padding: '0.8vh 1vw', color: THEME.TEXT_DIM, fontSize: '1.1vh', fontStyle: 'italic' }}>
                No LOs available. Add in SCALAR tab.
              </div>
            ) : (
              moduleLOs.map(lo => {
                const isAssigned = lesson.learningObjectives?.includes(lo.id)
                return (
                  <div
                    key={lo.id}
                    onClick={() => {
                      toggleLessonLO(lesson.id, lo.id)
                    }}
                    style={{
                      padding: '0.6vh 0.8vw',
                      fontSize: '1.1vh',
                      color: isAssigned ? THEME.AMBER : THEME.TEXT_PRIMARY,
                      background: isAssigned ? THEME.AMBER_DARK : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4vw',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = isAssigned ? THEME.AMBER_DARK : THEME.BG_DARK}
                    onMouseLeave={(e) => e.currentTarget.style.background = isAssigned ? THEME.AMBER_DARK : 'transparent'}
                  >
                    <span style={{ fontFamily: THEME.FONT_MONO, minWidth: '2vw' }}>
                      {isAssigned ? '✓' : ''} LO{lo.order}
                    </span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lo.verb} {lo.description}
                    </span>
                  </div>
                )
              })
            )}
            <div
              onClick={() => setShowLODropdown(false)}
              style={{
                padding: '0.5vh 0.8vw',
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
        )}

        {/* Assigned LOs List */}
        {lesson.learningObjectives?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3vh' }}>
            {lesson.learningObjectives.map(loId => {
              const lo = moduleLOs.find(l => l.id === loId)
              if (!lo) return null
              return (
                <div
                  key={loId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4vw',
                    padding: '0.3vh 0.5vw',
                    background: THEME.BG_DARK,
                    borderRadius: '0.3vh',
                    fontSize: '1.1vh'
                  }}
                >
                  <span style={{ color: THEME.AMBER, fontFamily: THEME.FONT_MONO }}>LO{lo.order}</span>
                  <span style={{ color: THEME.TEXT_PRIMARY, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lo.verb} {lo.description}
                  </span>
                  <button
                    onClick={() => toggleLessonLO(lesson.id, loId)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: THEME.TEXT_DIM,
                      fontSize: '1vh',
                      cursor: 'pointer',
                      padding: '0.2vh'
                    }}
                    title="Remove LO"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: THEME.TEXT_DIM, fontSize: '1.2vh', fontStyle: 'italic' }}>
            No LOs assigned
          </div>
        )}
      </div>

      {/* Topics Section - NOW BELOW LEARNING OBJECTIVES */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5vh' }}>
          <span style={{ fontSize: '1.3vh', color: THEME.TEXT_DIM, letterSpacing: '0.1vw' }}>TOPICS</span>
          <button
            style={addButtonStyle}
            onClick={() => addTopicToLesson(lesson.id, 'New Topic')}
          >
            ADD TOPIC
          </button>
        </div>

        {/* Topics List with LO-based numbering */}
        {lesson.topics?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4vh' }}>
            {lesson.topics.map(topic => (
              <div
                key={topic.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4vw',
                  padding: '0.4vh 0.5vw',
                  background: THEME.BG_DARK,
                  borderRadius: '0.3vh',
                  fontSize: '1.1vh'
                }}
              >
                <span style={{ color: THEME.AMBER, fontFamily: THEME.FONT_MONO, minWidth: '2vw' }}>
                  {topic.number || '?.?'}
                </span>
                {editingTopicId === topic.id ? (
                  <input
                    autoFocus
                    type="text"
                    defaultValue={topic.title}
                    onBlur={(e) => {
                      updateLessonTopic(lesson.id, topic.id, { title: e.target.value })
                      setEditingTopicId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateLessonTopic(lesson.id, topic.id, { title: e.target.value })
                        setEditingTopicId(null)
                      }
                      if (e.key === 'Escape') setEditingTopicId(null)
                    }}
                    style={{
                      flex: 1,
                      background: THEME.BG_INPUT,
                      border: `1px solid ${THEME.AMBER}`,
                      borderRadius: '0.3vh',
                      color: THEME.WHITE,
                      fontSize: '1.1vh',
                      padding: '0.2vh 0.4vw',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <span
                    onClick={() => setEditingTopicId(topic.id)}
                    style={{
                      color: THEME.TEXT_PRIMARY,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                    title="Click to edit"
                  >
                    {topic.title}
                  </span>
                )}
                <button
                  onClick={() => setEditingTopicId(topic.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.TEXT_DIM,
                    fontSize: '1vh',
                    cursor: 'pointer',
                    padding: '0.2vh'
                  }}
                  title="Edit topic"
                >
                  ✎
                </button>
                <button
                  onClick={() => removeTopicFromLesson(lesson.id, topic.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: THEME.TEXT_DIM,
                    fontSize: '1vh',
                    cursor: 'pointer',
                    padding: '0.2vh'
                  }}
                  title="Remove topic"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: THEME.TEXT_DIM, fontSize: '1.2vh', fontStyle: 'italic' }}>
            No topics added
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SCALAR EDITOR CONTENT (Phase 5)
// ============================================

function ScalarEditorContent() {
  const { selection, selectedScalarItem, updateScalarNode, deleteScalarNode } = useDesign()

  if (!selectedScalarItem) {
    return (
      <div style={{ color: THEME.TEXT_DIM, fontSize: '1.3vh', fontStyle: 'italic' }}>
        No item selected
      </div>
    )
  }

  const { type, data } = selectedScalarItem

  // Determine colors based on type
  const typeColors = {
    lo: THEME.AMBER,
    topic: '#4a9eff',
    subtopic: '#9b59b6'
  }
  const color = typeColors[type] || THEME.AMBER

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
      {/* Type indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5vw' }}>
        <div
          style={{
            width: '0.8vh',
            height: '1.6vh',
            borderRadius: '0.2vh',
            background: color
          }}
        />
        <span
          style={{
            fontSize: '1.2vh',
            color: color,
            fontFamily: THEME.FONT_PRIMARY,
            textTransform: 'uppercase',
            letterSpacing: '0.1vw'
          }}
        >
          {type === 'lo' ? 'Learning Objective' : type === 'topic' ? 'Topic' : 'Subtopic'}
        </span>
      </div>

      {/* LO Editor */}
      {type === 'lo' && (
        <>
          <FieldDropdown
            label="Verb"
            value={data.verb}
            options={[
              { value: 'EXPLAIN', label: 'EXPLAIN' },
              { value: 'IDENTIFY', label: 'IDENTIFY' },
              { value: 'DESCRIBE', label: 'DESCRIBE' },
              { value: 'DEMONSTRATE', label: 'DEMONSTRATE' },
              { value: 'APPLY', label: 'APPLY' },
              { value: 'ANALYZE', label: 'ANALYZE' },
              { value: 'EVALUATE', label: 'EVALUATE' },
              { value: 'CREATE', label: 'CREATE' }
            ]}
            onChange={(value) => updateScalarNode(type, data.id, { verb: value })}
          />
          <FieldInput
            label="Description"
            value={data.description}
            onChange={(value) => updateScalarNode(type, data.id, { description: value })}
          />
          <div style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM }}>
            Topics: {data.topics?.length || 0}
          </div>
        </>
      )}

      {/* Topic Editor */}
      {type === 'topic' && (
        <>
          <FieldInput
            label="Title"
            value={data.title}
            onChange={(value) => updateScalarNode(type, data.id, { title: value })}
          />
          <div style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM }}>
            Subtopics: {data.subtopics?.length || 0}
          </div>
        </>
      )}

      {/* Subtopic Editor */}
      {type === 'subtopic' && (
        <FieldInput
          label="Title"
          value={data.title}
          onChange={(value) => updateScalarNode(type, data.id, { title: value })}
        />
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: THEME.BORDER, margin: '0.5vh 0' }} />

      {/* Delete button */}
      <DeleteButton
        label={`Delete ${type.toUpperCase()}`}
        onClick={() => deleteScalarNode(type, data.id)}
      />
    </div>
  )
}

// ============================================
// LO INDICATOR (Interactive circles linked to Scalar data)
// ============================================

function LOIndicator({ lesson }) {
  const { scalarData, currentModule, toggleLessonLO, setActiveTab } = useDesign()
  const [hoveredLO, setHoveredLO] = useState(null)

  // Get LOs for current module
  const module = scalarData.modules.find(m => m.order === currentModule) || scalarData.modules[0]
  const moduleLOs = module?.learningObjectives || []

  // Handle empty state
  if (moduleLOs.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4vw' }}>
        <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM }}>LO:</span>
        <span
          onClick={() => setActiveTab('scalar')}
          style={{
            fontSize: '1.1vh',
            color: THEME.AMBER,
            cursor: 'pointer',
            fontStyle: 'italic'
          }}
        >
          Add LOs in SCALAR tab
        </span>
      </div>
    )
  }

  // Limit to first 5 LOs for display, show count if more
  const displayLOs = moduleLOs.slice(0, 5)
  const hasMore = moduleLOs.length > 5

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4vw', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '1.2vh', color: THEME.TEXT_DIM, marginRight: '0.3vw' }}>LO:</span>
      {displayLOs.map((lo, index) => {
        const isAssigned = lesson.learningObjectives.includes(lo.id)
        const isHovered = hoveredLO === lo.id

        return (
          <div
            key={lo.id}
            onClick={() => toggleLessonLO(lesson.id, lo.id)}
            onMouseEnter={() => setHoveredLO(lo.id)}
            onMouseLeave={() => setHoveredLO(null)}
            style={{
              width: '1.4vh',
              height: '1.4vh',
              borderRadius: '50%',
              border: `1px solid ${isAssigned ? THEME.AMBER : THEME.BORDER_GREY}`,
              background: isAssigned ? THEME.AMBER : isHovered ? THEME.AMBER_DARK : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7vh',
              color: isAssigned ? THEME.BG_DARK : THEME.TEXT_DIM,
              fontWeight: 500
            }}
            title={`LO ${lo.order}: ${lo.verb} ${lo.description}\nClick to ${isAssigned ? 'remove' : 'assign'}`}
          >
            {lo.order}
          </div>
        )
      })}
      {hasMore && (
        <span style={{ fontSize: '1.1vh', color: THEME.TEXT_DIM }}>
          +{moduleLOs.length - 5}
        </span>
      )}
    </div>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: THEME.TEXT_DIM,
        fontSize: '1.3vh',
        textAlign: 'center',
        padding: '2vh'
      }}
    >
      <p>No item selected</p>
      <p style={{ marginTop: '0.5vh', fontSize: '1.2vh' }}>
        Click a lesson or item to edit
      </p>
    </div>
  )
}

// ============================================
// LEGEND
// ============================================

function LessonLegend() {
  const { LESSON_TYPES } = useDesign()

  // 2x3 grid: Instructor Led, Admin, Discussion, Assessment, Project, Break
  const legendItems = [
    LESSON_TYPES.find(t => t.id === 'instructor-led'),
    LESSON_TYPES.find(t => t.id === 'admin'),
    LESSON_TYPES.find(t => t.id === 'discussion'),
    LESSON_TYPES.find(t => t.id === 'assessment'),
    LESSON_TYPES.find(t => t.id === 'project'),
    LESSON_TYPES.find(t => t.id === 'break')
  ].filter(Boolean)

  return (
    <div
      style={{
        padding: '1.5vh 1.2vw',
        borderTop: `1px solid ${THEME.BORDER}`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1vh 1.2vw'
      }}
    >
      {legendItems.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
          <div
            style={{
              width: '1.4vh',
              height: '1.4vh',
              background: item.color,
              borderRadius: '0.3vh',
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: '1.1vh', color: THEME.TEXT_SECONDARY }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// FIELD COMPONENTS
// ============================================

function FieldInput({ label, value, onChange, type = 'text', suffix = '', min, max, step, compact = false }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3vh' }}>
      <label style={{ fontSize: compact ? '1vh' : '1.2vh', color: THEME.TEXT_DIM }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3vw' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          max={max}
          step={step}
          style={{
            flex: 1,
            width: compact ? '100%' : undefined,
            background: THEME.BG_INPUT,
            border: `1px solid ${focused ? THEME.AMBER : THEME.BORDER}`,
            borderRadius: '0.4vh',
            color: THEME.WHITE,
            fontSize: compact ? '1.1vh' : '1.3vh',
            fontFamily: THEME.FONT_PRIMARY,
            padding: compact ? '0.4vh 0.4vw' : '0.5vh 0.6vw',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: focused ? `0 0 0 1px ${THEME.AMBER}33` : 'none'
          }}
        />
        {suffix && <span style={{ fontSize: compact ? '1vh' : '1.2vh', color: THEME.TEXT_DIM }}>{suffix}</span>}
      </div>
    </div>
  )
}

function FieldDropdown({ label, value, options, onChange, compact = false }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3vh' }}>
      <label style={{ fontSize: compact ? '1vh' : '1.2vh', color: THEME.TEXT_DIM }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: THEME.BG_INPUT,
          border: `1px solid ${focused ? THEME.AMBER : THEME.BORDER}`,
          borderRadius: '0.4vh',
          color: THEME.WHITE,
          fontSize: compact ? '1.1vh' : '1.3vh',
          fontFamily: THEME.FONT_PRIMARY,
          padding: compact ? '0.4vh 0.4vw' : '0.5vh 0.6vw',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: focused ? `0 0 0 1px ${THEME.AMBER}33` : 'none',
          width: '100%'
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function DeleteButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(204, 68, 68, 0.15)' : 'transparent',
        border: `1px solid ${hovered ? '#ff6666' : '#cc4444'}`,
        borderRadius: '0.4vh',
        color: hovered ? '#ff6666' : '#cc4444',
        fontSize: '1.2vh',
        padding: '0.6vh 1vw',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.1vw',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  )
}

// ============================================
// HELPERS
// ============================================

function calculateEndTime(startTime, durationMinutes) {
  if (!startTime) return '----'
  const startHour = parseInt(startTime.slice(0, 2))
  const startMin = parseInt(startTime.slice(2, 4)) || 0
  const totalMinutes = startHour * 60 + startMin + durationMinutes
  const endHour = Math.floor(totalMinutes / 60) % 24
  const endMin = totalMinutes % 60
  return `${endHour.toString().padStart(2, '0')}${endMin.toString().padStart(2, '0')}`
}

// ============================================
// STYLES
// ============================================

const addButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.AMBER,
  fontSize: '1.2vh',
  cursor: 'pointer',
  padding: '0.2vh 0.4vw'
}

export default LessonEditor
