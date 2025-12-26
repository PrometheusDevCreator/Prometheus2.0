/**
 * ScalarColumns.jsx - Multi-Column Scalar View
 *
 * Displays 4 columns:
 * - Learning Objectives (LO)
 * - Lesson Titles
 * - Topics (with nested Subtopics)
 * - Performance Criteria (PC)
 *
 * Features:
 * - Cross-column highlighting on click
 * - Colored PC dots on linked items
 * - Inline editing with non-editable serial numbers
 * - SHIFT+click for linking/unlinking
 * - Unallocated topics with red serial numbers
 */

import { useState, useCallback, useEffect } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

// Font sizes - 75% larger than original, then reduced by 10%
const FONT = {
  HEADER: '2.2vh',       // was 2.45vh
  NUMBER: '1.6vh',       // was 1.75vh
  LABEL: '1.7vh',        // was 1.9vh
  BADGE: '1.25vh',       // was 1.4vh
  BUTTON: '1.45vh'       // was 1.6vh
}

function ScalarColumns({ module }) {
  const {
    scalarData,
    scheduledLessons,
    addLearningObjective,
    addTopic,
    addSubtopic,
    createLessonFromScalar,
    addPerformanceCriteria,
    updatePerformanceCriteria,
    updateHighlightedItems,
    clearHighlights,
    isItemHighlighted,
    getLinkedPCs,
    getLinkedPCsWithColor,
    select,
    selection,
    updateScalarNode,
    deleteScalarNode,
    linkItemToPC,
    unlinkItemFromPC,
    deletePerformanceCriteria,
    updateLesson,
    deleteLesson,
    toggleMultiSelect,
    isMultiSelected,
    clearMultiSelection,
    isUnallocatedNumber,
    // Universal linking
    linkingSource,
    handleShiftClickLink,
    clearLinkingSource,
    linkToSource,
    isSessionLinked
  } = useDesign()

  // Flatten LOs, Topics, Subtopics for column display
  const learningObjectives = module?.learningObjectives || []

  const allTopics = learningObjectives.flatMap(lo =>
    (lo.topics || []).map(topic => ({ ...topic, loId: lo.id, loOrder: lo.order }))
  )

  const allSubtopics = allTopics.flatMap(topic =>
    (topic.subtopics || []).map(sub => ({
      ...sub,
      topicId: topic.id,
      topicOrder: topic.order,
      loOrder: topic.loOrder
    }))
  )

  const performanceCriteria = scalarData.performanceCriteria || []

  // Track selected PC for shift-click linking
  const [selectedPCId, setSelectedPCId] = useState(null)

  // Track expanded topics (for collapsing subtopics)
  const [expandedTopics, setExpandedTopics] = useState(new Set())

  // Auto-expand topics that have the expanded flag set (e.g., after adding subtopic)
  useEffect(() => {
    const topicsToExpand = allTopics.filter(t => t.expanded && !expandedTopics.has(t.id))
    if (topicsToExpand.length > 0) {
      setExpandedTopics(prev => {
        const next = new Set(prev)
        topicsToExpand.forEach(t => next.add(t.id))
        return next
      })
    }
  }, [allTopics])

  // Toggle topic expansion
  const toggleTopicExpand = useCallback((topicId) => {
    setExpandedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topicId)) {
        next.delete(topicId)
      } else {
        next.add(topicId)
      }
      return next
    })
  }, [])

  // Filter subtopics to only show those with expanded parent topics
  const visibleSubtopics = allSubtopics.filter(sub => expandedTopics.has(sub.topicId))

  // Handle item click for highlighting, or shift-click for universal linking
  const handleItemClick = useCallback((type, id, event) => {
    // If shift is held, use universal linking system
    if (event?.shiftKey) {
      // Get item name for display
      let itemName = `${type} ${id}`
      if (type === 'lo') {
        for (const lo of learningObjectives) {
          if (lo.id === id) {
            itemName = `LO ${lo.order}: ${lo.verb}`
            break
          }
        }
      } else if (type === 'topic') {
        for (const topic of allTopics) {
          if (topic.id === id) {
            itemName = `Topic ${topic.loOrder || 'x'}.${topic.order}: ${topic.title}`
            break
          }
        }
      } else if (type === 'subtopic') {
        for (const sub of allSubtopics) {
          if (sub.id === id) {
            itemName = `Subtopic ${sub.loOrder || 'x'}.${sub.topicOrder}.${sub.order}`
            break
          }
        }
      } else if (type === 'lesson') {
        const lesson = scheduledLessons.find(l => l.id === id)
        if (lesson) itemName = `Lesson: ${lesson.title}`
      } else if (type === 'pc') {
        const pc = performanceCriteria.find(p => p.id === id)
        if (pc) itemName = pc.name
      }

      handleShiftClickLink(type, id, itemName)
      return
    }

    // If in linking mode (source is set), regular click links to source
    if (linkingSource) {
      // Get item name for display
      let itemName = `${type} ${id}`
      if (type === 'lo') {
        const lo = learningObjectives.find(l => l.id === id)
        if (lo) itemName = `LO ${lo.order}: ${lo.verb}`
      } else if (type === 'topic') {
        const topic = allTopics.find(t => t.id === id)
        if (topic) itemName = `Topic ${topic.loOrder || 'x'}.${topic.order}: ${topic.title}`
      } else if (type === 'subtopic') {
        const sub = allSubtopics.find(s => s.id === id)
        if (sub) itemName = `Subtopic ${sub.loOrder || 'x'}.${sub.topicOrder}.${sub.order}`
      } else if (type === 'lesson') {
        const lesson = scheduledLessons.find(l => l.id === id)
        if (lesson) itemName = `Lesson: ${lesson.title}`
      } else if (type === 'pc') {
        const pc = performanceCriteria.find(p => p.id === id)
        if (pc) itemName = pc.name
      }

      linkToSource(type, id, itemName)
      return
    }

    // Normal click - select and highlight
    select(type, id)
    updateHighlightedItems(type, id)
  }, [select, updateHighlightedItems, handleShiftClickLink, linkToSource, linkingSource, learningObjectives, allTopics, allSubtopics, scheduledLessons, performanceCriteria])

  // Handle PC click - select for linking mode
  const handlePCClick = useCallback((pcId) => {
    setSelectedPCId(prev => prev === pcId ? null : pcId)
  }, [])

  // Handle background click to clear
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      clearHighlights()
      setSelectedPCId(null)
      clearLinkingSource()
    }
  }, [clearHighlights, clearLinkingSource])

  // Check if an item is part of the current linking session (source or linked)
  // Used for green highlighting of all elements in the linking session
  const isInLinkingSession = useCallback((type, id) => {
    return isSessionLinked(type, id)
  }, [isSessionLinked])

  // Separate allocated vs unallocated topics
  const allocatedTopics = allTopics.filter(t => t.loOrder != null)
  const unallocatedTopics = allTopics.filter(t => t.loOrder == null)

  // Check if + Subtopic should show (only when a topic is selected)
  const selectedTopicId = selection.type === 'topic' ? selection.id : null
  const showAddSubtopic = selectedTopicId && allTopics.find(t => t.id === selectedTopicId)

  // Handle ESC key to exit linking mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && linkingSource) {
        clearLinkingSource()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [linkingSource, clearLinkingSource])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
      }}
      onClick={handleBackgroundClick}
    >
      {/* Linking Mode Indicator */}
      {linkingSource && (
        <div
          style={{
            background: 'rgba(0, 255, 0, 0.15)',
            borderBottom: '2px solid #00FF00',
            padding: '0.5vh 1vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <span
            style={{
              fontSize: FONT.LABEL,
              color: '#00FF00',
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            LINKING MODE: <strong>{linkingSource.name}</strong> → Click elements to link (ESC to exit)
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearLinkingSource()
            }}
            style={{
              background: 'transparent',
              border: '1px solid #00FF00',
              borderRadius: '4px',
              color: '#00FF00',
              fontSize: FONT.BADGE,
              padding: '0.3vh 0.6vw',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Columns Container */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '1px',
          background: THEME.BORDER,
          overflow: 'hidden'
        }}
      >
      {/* Column 1: Learning Objectives */}
      <ScalarColumn
        title="Learning Objectives"
        items={learningObjectives}
        renderItem={(lo) => (
          <ScalarColumnItem
            key={lo.id}
            id={lo.id}
            type="lo"
            number={`LO ${lo.order}`}
            label={`${lo.verb} ${lo.description}`}
            isHighlighted={isItemHighlighted('lo', lo.id)}
            isSelected={selection.type === 'lo' && selection.id === lo.id}
            isMultiSelected={isMultiSelected('lo', lo.id)}
            isInLinkingSession={isInLinkingSession('lo', lo.id)}
            pcBadgesWithColor={getLinkedPCsWithColor('lo', lo.id)}
            onClick={(e) => handleItemClick('lo', lo.id, e)}
            onUpdate={(updates) => updateScalarNode('lo', lo.id, updates)}
            onDelete={() => deleteScalarNode('lo', lo.id)}
            performanceCriteria={performanceCriteria}
            onLinkToPC={(pcId) => linkItemToPC(pcId, 'lo', lo.id)}
            onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'lo', lo.id)}
          />
        )}
        onAdd={() => addLearningObjective(module?.id)}
        addLabel="+ LO"
        accentColor={THEME.AMBER}
      />

      {/* Column 2: Lesson Titles (moved before Topics) */}
      <ScalarColumn
        title="Lesson Titles"
        items={scheduledLessons}
        renderItem={(lesson) => (
          <ScalarColumnItem
            key={lesson.id}
            id={lesson.id}
            type="lesson"
            number=""
            label={lesson.title}
            isHighlighted={isItemHighlighted('lesson', lesson.id)}
            isSelected={selection.type === 'lesson' && selection.id === lesson.id}
            isMultiSelected={isMultiSelected('lesson', lesson.id)}
            isInLinkingSession={isInLinkingSession('lesson', lesson.id)}
            pcBadgesWithColor={getLinkedPCsWithColor('lesson', lesson.id)}
            onClick={(e) => handleItemClick('lesson', lesson.id, e)}
            onUpdate={(updates) => updateLesson(lesson.id, updates)}
            onDelete={() => deleteLesson(lesson.id)}
            typeColor={getLessonTypeColor(lesson.type)}
            performanceCriteria={performanceCriteria}
            onLinkToPC={(pcId) => linkItemToPC(pcId, 'lesson', lesson.id)}
            onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'lesson', lesson.id)}
          />
        )}
        onAdd={() => createLessonFromScalar('NEW LESSON')}
        addLabel="+ Lesson"
        accentColor={THEME.AMBER}
      />

      {/* Column 3: Topics (with nested Subtopics) */}
      <TopicsColumn
        allocatedTopics={allocatedTopics}
        unallocatedTopics={unallocatedTopics}
        expandedTopics={expandedTopics}
        toggleTopicExpand={toggleTopicExpand}
        isItemHighlighted={isItemHighlighted}
        selection={selection}
        isMultiSelected={isMultiSelected}
        isInLinkingSessionFn={isInLinkingSession}
        getLinkedPCsWithColor={getLinkedPCsWithColor}
        handleItemClick={handleItemClick}
        updateScalarNode={updateScalarNode}
        deleteScalarNode={deleteScalarNode}
        performanceCriteria={performanceCriteria}
        linkItemToPC={linkItemToPC}
        unlinkItemFromPC={unlinkItemFromPC}
        onAddTopic={() => {
          // Add to highlighted LO if available, otherwise first LO
          const selectedLoId = selection.type === 'lo' ? selection.id : null
          if (selectedLoId) {
            addTopic(selectedLoId)
          } else if (learningObjectives.length > 0) {
            addTopic(learningObjectives[0].id)
          }
        }}
        onAddSubtopic={showAddSubtopic ? () => addSubtopic(selectedTopicId) : null}
        showAddSubtopic={showAddSubtopic}
      />

      {/* Column 4: Performance Criteria */}
      <PCColumn
        performanceCriteria={performanceCriteria}
        scalarData={scalarData}
        scheduledLessons={scheduledLessons}
        onAdd={() => addPerformanceCriteria()}
        onUpdate={updatePerformanceCriteria}
        onDelete={deletePerformanceCriteria}
        onUnlink={unlinkItemFromPC}
        onItemClick={handleItemClick}
        selectedPCId={selectedPCId}
        onPCClick={handlePCClick}
        isInLinkingMode={!!linkingSource}
      />
      </div>
    </div>
  )
}

// Get lesson type color
function getLessonTypeColor(typeId) {
  const types = {
    'instructor-led': '#FF6600',
    'group-discussion': '#00FF00',
    'practical': '#00BFFF',
    'assessment': '#FF4444',
    'break': '#FFD700',
    'student-led': '#FFFFFF',
    'research': '#00FF00',
    'external-lecturer': '#FF6600',
    'admin': '#FFD700',
    'user-defined': '#FF00FF'
  }
  return types[typeId] || '#FF6600'
}

// ============================================
// SCALAR COLUMN COMPONENT
// ============================================

function ScalarColumn({ title, items, renderItem, onAdd, addLabel, accentColor }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_DARK,
        minWidth: 0
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1vh 0.8vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL,
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500
          }}
        >
          {title}
        </span>
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              background: 'transparent',
              border: `1px dashed ${accentColor}`,
              borderRadius: '14px',
              color: accentColor,
              fontSize: FONT.BUTTON,
              padding: '0.4vh 0.8vw',
              cursor: 'pointer'
            }}
          >
            {addLabel}
          </button>
        )}
      </div>

      {/* Column Body - Scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5vh 0.5vw'
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '2vh 1vw',
              textAlign: 'center',
              color: THEME.TEXT_DIM,
              fontSize: FONT.LABEL,
              fontStyle: 'italic'
            }}
          >
            No items
          </div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  )
}

// ============================================
// TOPICS COLUMN COMPONENT (with nested subtopics)
// ============================================

function TopicsColumn({
  allocatedTopics,
  unallocatedTopics,
  expandedTopics,
  toggleTopicExpand,
  isItemHighlighted,
  selection,
  isMultiSelected,
  isInLinkingSessionFn,
  getLinkedPCsWithColor,
  handleItemClick,
  updateScalarNode,
  deleteScalarNode,
  performanceCriteria,
  linkItemToPC,
  unlinkItemFromPC,
  onAddTopic,
  onAddSubtopic,
  showAddSubtopic
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_DARK,
        minWidth: 0
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1vh 0.8vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL,
          flexShrink: 0,
          gap: '0.5vw'
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500
          }}
        >
          Topics
        </span>
        <div style={{ display: 'flex', gap: '0.3vw' }}>
          {/* + Subtopic button - only shows when topic is selected */}
          {showAddSubtopic && onAddSubtopic && (
            <button
              onClick={onAddSubtopic}
              style={{
                background: 'transparent',
                border: '1px dashed #9b59b6',
                borderRadius: '14px',
                color: '#9b59b6',
                fontSize: FONT.BUTTON,
                padding: '0.4vh 0.6vw',
                cursor: 'pointer'
              }}
            >
              + Subtopic
            </button>
          )}
          <button
            onClick={onAddTopic}
            style={{
              background: 'transparent',
              border: '1px dashed #4a9eff',
              borderRadius: '14px',
              color: '#4a9eff',
              fontSize: FONT.BUTTON,
              padding: '0.4vh 0.6vw',
              cursor: 'pointer'
            }}
          >
            + Topic
          </button>
        </div>
      </div>

      {/* Column Body - Scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5vh 0.5vw'
        }}
      >
        {/* Allocated Topics (with LO assignment) */}
        {allocatedTopics.length === 0 && unallocatedTopics.length === 0 ? (
          <div
            style={{
              padding: '2vh 1vw',
              textAlign: 'center',
              color: THEME.TEXT_DIM,
              fontSize: FONT.LABEL,
              fontStyle: 'italic'
            }}
          >
            No topics
          </div>
        ) : (
          <>
            {/* Render allocated topics with nested subtopics */}
            {allocatedTopics.map(topic => (
              <TopicWithSubtopics
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopics.has(topic.id)}
                onToggleExpand={() => toggleTopicExpand(topic.id)}
                isHighlighted={isItemHighlighted('topic', topic.id)}
                isSelected={selection.type === 'topic' && selection.id === topic.id}
                isMultiSelected={isMultiSelected('topic', topic.id)}
                isInLinkingSession={isInLinkingSessionFn?.('topic', topic.id)}
                pcBadgesWithColor={getLinkedPCsWithColor('topic', topic.id)}
                onClick={(e) => handleItemClick('topic', topic.id, e)}
                onUpdate={(updates) => updateScalarNode('topic', topic.id, updates)}
                onDelete={() => deleteScalarNode('topic', topic.id)}
                performanceCriteria={performanceCriteria}
                onLinkToPC={(pcId) => linkItemToPC(pcId, 'topic', topic.id)}
                onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'topic', topic.id)}
                isItemHighlighted={isItemHighlighted}
                selection={selection}
                isMultiSelectedFn={isMultiSelected}
                isInLinkingSessionFn={isInLinkingSessionFn}
                getLinkedPCsWithColor={getLinkedPCsWithColor}
                handleItemClick={handleItemClick}
                updateScalarNode={updateScalarNode}
                deleteScalarNode={deleteScalarNode}
                linkItemToPC={linkItemToPC}
                unlinkItemFromPC={unlinkItemFromPC}
                isUnallocated={false}
              />
            ))}

            {/* Divider for unallocated topics */}
            {allocatedTopics.length > 0 && unallocatedTopics.length > 0 && (
              <div
                style={{
                  borderTop: `1px dashed ${THEME.BORDER}`,
                  margin: '1vh 0',
                  paddingTop: '0.5vh',
                  color: '#ff4444',
                  fontSize: FONT.BADGE,
                  fontFamily: THEME.FONT_PRIMARY
                }}
              >
                Unallocated
              </div>
            )}

            {/* Render unallocated topics (with red serial numbers) */}
            {unallocatedTopics.map(topic => (
              <TopicWithSubtopics
                key={topic.id}
                topic={topic}
                isExpanded={expandedTopics.has(topic.id)}
                onToggleExpand={() => toggleTopicExpand(topic.id)}
                isHighlighted={isItemHighlighted('topic', topic.id)}
                isSelected={selection.type === 'topic' && selection.id === topic.id}
                isMultiSelected={isMultiSelected('topic', topic.id)}
                isInLinkingSession={isInLinkingSessionFn?.('topic', topic.id)}
                pcBadgesWithColor={getLinkedPCsWithColor('topic', topic.id)}
                onClick={(e) => handleItemClick('topic', topic.id, e)}
                onUpdate={(updates) => updateScalarNode('topic', topic.id, updates)}
                onDelete={() => deleteScalarNode('topic', topic.id)}
                performanceCriteria={performanceCriteria}
                onLinkToPC={(pcId) => linkItemToPC(pcId, 'topic', topic.id)}
                onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'topic', topic.id)}
                isItemHighlighted={isItemHighlighted}
                selection={selection}
                isMultiSelectedFn={isMultiSelected}
                isInLinkingSessionFn={isInLinkingSessionFn}
                getLinkedPCsWithColor={getLinkedPCsWithColor}
                handleItemClick={handleItemClick}
                updateScalarNode={updateScalarNode}
                deleteScalarNode={deleteScalarNode}
                linkItemToPC={linkItemToPC}
                unlinkItemFromPC={unlinkItemFromPC}
                isUnallocated={true}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// TOPIC WITH SUBTOPICS COMPONENT
// ============================================

function TopicWithSubtopics({
  topic,
  isExpanded,
  onToggleExpand,
  isHighlighted,
  isSelected,
  isMultiSelected,
  isInLinkingSession = false,
  pcBadgesWithColor,
  onClick,
  onUpdate,
  onDelete,
  performanceCriteria,
  onLinkToPC,
  onUnlinkFromPC,
  isItemHighlighted,
  selection,
  isMultiSelectedFn,
  isInLinkingSessionFn,
  getLinkedPCsWithColor,
  handleItemClick,
  updateScalarNode,
  deleteScalarNode,
  linkItemToPC,
  unlinkItemFromPC,
  isUnallocated
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(topic.title)
  const [hovered, setHovered] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(null)

  const subtopics = topic.subtopics || []
  const hasSubtopics = subtopics.length > 0

  // Topic number format
  const topicNumber = topic.loOrder != null
    ? `${topic.loOrder}.${topic.order}`
    : `x.${topic.order || 1}`

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setEditValue(topic.title)
    setIsEditing(true)
  }, [topic.title])

  // Handle save
  const handleSave = useCallback(() => {
    if (editValue.trim() !== topic.title) {
      onUpdate?.({ title: editValue.trim() })
    }
    setIsEditing(false)
  }, [editValue, topic.title, onUpdate])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditValue(topic.title)
    setIsEditing(false)
  }, [topic.title])

  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setShowContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Highlight styling - linking source takes priority with green glow
  const highlightBg = isInLinkingSession
    ? 'rgba(0, 255, 0, 0.25)'
    : isHighlighted
      ? 'rgba(212, 115, 12, 0.15)'
      : isSelected
        ? 'rgba(212, 115, 12, 0.08)'
        : isMultiSelected
          ? 'rgba(0, 255, 0, 0.1)'
          : hovered
            ? 'rgba(255, 255, 255, 0.03)'
            : 'transparent'

  const highlightBorder = isInLinkingSession
    ? '2px solid #00FF00'
    : isHighlighted || isSelected
      ? `1px solid ${THEME.AMBER}`
      : isMultiSelected
        ? '1px solid #00FF00'
        : '1px solid transparent'

  return (
    <div style={{ marginBottom: '0.3vh' }}>
      {/* Topic Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5vw',
          padding: '0.6vh 0.6vw',
          background: highlightBg,
          border: highlightBorder,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onClick={(e) => {
          onClick(e)
          if (hasSubtopics && !e.shiftKey) {
            onToggleExpand()
          }
        }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Expand/Collapse Arrow */}
        {hasSubtopics && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            style={{
              fontSize: FONT.NUMBER,
              color: THEME.TEXT_DIM,
              fontWeight: 400,
              flexShrink: 0,
              width: '1.2vh',
              transition: 'transform 0.15s ease',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              cursor: 'pointer'
            }}
          >
            ▶
          </span>
        )}

        {/* Topic Number - RED if unallocated, GREEN if editing */}
        <span
          style={{
            fontSize: FONT.NUMBER,
            fontFamily: THEME.FONT_MONO,
            color: isEditing ? '#00FF00' : (isUnallocated ? '#ff4444' : THEME.AMBER),
            fontWeight: 500,
            flexShrink: 0,
            minWidth: hasSubtopics ? '2.5vw' : '3vw'
          }}
        >
          {topicNumber}
        </span>

        {/* Topic Title / Edit Input */}
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              flex: 1,
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '0.3vh',
              padding: '0.2vh 0.4vw',
              outline: 'none'
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              color: isHighlighted ? THEME.WHITE : THEME.TEXT_PRIMARY,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {topic.title}
          </span>
        )}

        {/* PC Colored Dots */}
        {pcBadgesWithColor && pcBadgesWithColor.length > 0 && (
          <PCColoredDots pcs={pcBadgesWithColor} />
        )}

        {/* Delete button on hover */}
        {hovered && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.TEXT_DIM,
              fontSize: FONT.LABEL,
              cursor: 'pointer',
              padding: '0 0.2vw'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Nested Subtopics (indented) */}
      {isExpanded && subtopics.map(sub => {
        const subNumber = topic.loOrder != null
          ? `${topic.loOrder}.${topic.order}.${sub.order}`
          : `x.${topic.order || 1}.${sub.order}`

        return (
          <SubtopicRow
            key={sub.id}
            subtopic={sub}
            number={subNumber}
            isHighlighted={isItemHighlighted('subtopic', sub.id)}
            isSelected={selection.type === 'subtopic' && selection.id === sub.id}
            isMultiSelected={isMultiSelectedFn('subtopic', sub.id)}
            isInLinkingSession={isInLinkingSessionFn?.('subtopic', sub.id)}
            pcBadgesWithColor={getLinkedPCsWithColor('subtopic', sub.id)}
            onClick={(e) => handleItemClick('subtopic', sub.id, e)}
            onUpdate={(updates) => updateScalarNode('subtopic', sub.id, updates)}
            onDelete={() => deleteScalarNode('subtopic', sub.id)}
            performanceCriteria={performanceCriteria}
            onLinkToPC={(pcId) => linkItemToPC(pcId, 'subtopic', sub.id)}
            onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'subtopic', sub.id)}
            isUnallocated={isUnallocated}
          />
        )
      })}

      {/* Context Menu */}
      {showContextMenu && (
        <ContextMenu
          x={showContextMenu.x}
          y={showContextMenu.y}
          onClose={() => setShowContextMenu(null)}
          onDelete={onDelete}
          performanceCriteria={performanceCriteria}
          linkedPCs={(pcBadgesWithColor || []).map(p => p.name)}
          onLinkToPC={onLinkToPC}
          onUnlinkFromPC={onUnlinkFromPC}
        />
      )}
    </div>
  )
}

// ============================================
// SUBTOPIC ROW COMPONENT (nested under topic)
// ============================================

function SubtopicRow({
  subtopic,
  number,
  isHighlighted,
  isSelected,
  isMultiSelected,
  isInLinkingSession = false,
  pcBadgesWithColor,
  onClick,
  onUpdate,
  onDelete,
  performanceCriteria,
  onLinkToPC,
  onUnlinkFromPC,
  isUnallocated
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(subtopic.title)
  const [hovered, setHovered] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(null)

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setEditValue(subtopic.title)
    setIsEditing(true)
  }, [subtopic.title])

  const handleSave = useCallback(() => {
    if (editValue.trim() !== subtopic.title) {
      onUpdate?.({ title: editValue.trim() })
    }
    setIsEditing(false)
  }, [editValue, subtopic.title, onUpdate])

  const handleCancel = useCallback(() => {
    setEditValue(subtopic.title)
    setIsEditing(false)
  }, [subtopic.title])

  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setShowContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Highlight styling - linking source takes priority with green glow
  const highlightBg = isInLinkingSession
    ? 'rgba(0, 255, 0, 0.25)'
    : isHighlighted
      ? 'rgba(212, 115, 12, 0.15)'
      : isSelected
        ? 'rgba(212, 115, 12, 0.08)'
        : isMultiSelected
          ? 'rgba(0, 255, 0, 0.1)'
          : hovered
            ? 'rgba(255, 255, 255, 0.03)'
            : 'transparent'

  const highlightBorder = isInLinkingSession
    ? '2px solid #00FF00'
    : isHighlighted || isSelected
      ? `1px solid ${THEME.AMBER}`
      : isMultiSelected
        ? '1px solid #00FF00'
        : '1px solid transparent'

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5vw',
          padding: '0.4vh 0.6vw',
          marginLeft: '1.5vw',
          marginTop: '0.2vh',
          background: highlightBg,
          border: highlightBorder,
          borderRadius: '8px',
          borderLeft: `2px solid ${isUnallocated ? '#ff4444' : THEME.BORDER}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Subtopic Number - RED if unallocated, GREEN if editing */}
        <span
          style={{
            fontSize: FONT.BADGE,
            fontFamily: THEME.FONT_MONO,
            color: isEditing ? '#00FF00' : (isUnallocated ? '#ff4444' : THEME.TEXT_DIM),
            fontWeight: 400,
            flexShrink: 0,
            minWidth: '3vw'
          }}
        >
          {number}
        </span>

        {/* Subtopic Title / Edit */}
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              flex: 1,
              fontSize: FONT.BADGE,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '0.3vh',
              padding: '0.1vh 0.3vw',
              outline: 'none'
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: FONT.BADGE,
              fontFamily: THEME.FONT_PRIMARY,
              color: isHighlighted ? THEME.WHITE : THEME.TEXT_DIM,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {subtopic.title}
          </span>
        )}

        {/* PC Colored Dots */}
        {pcBadgesWithColor && pcBadgesWithColor.length > 0 && (
          <PCColoredDots pcs={pcBadgesWithColor} small />
        )}

        {/* Delete on hover */}
        {hovered && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.TEXT_DIM,
              fontSize: FONT.BADGE,
              cursor: 'pointer',
              padding: '0 0.1vw'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <ContextMenu
          x={showContextMenu.x}
          y={showContextMenu.y}
          onClose={() => setShowContextMenu(null)}
          onDelete={onDelete}
          performanceCriteria={performanceCriteria}
          linkedPCs={(pcBadgesWithColor || []).map(p => p.name)}
          onLinkToPC={onLinkToPC}
          onUnlinkFromPC={onUnlinkFromPC}
        />
      )}
    </>
  )
}

// ============================================
// PC COLORED DOTS COMPONENT
// ============================================

function PCColoredDots({ pcs, small = false }) {
  if (!pcs || pcs.length === 0) return null

  const dotSize = small ? '6px' : '8px'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        flexShrink: 0
      }}
    >
      {pcs.map((pc, idx) => (
        <div
          key={pc.id || idx}
          title={pc.name}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: pc.color || '#00FF00',
            boxShadow: `0 0 4px ${pc.color || '#00FF00'}80`
          }}
        />
      ))}
    </div>
  )
}

// ============================================
// SCALAR COLUMN ITEM COMPONENT
// ============================================

function ScalarColumnItem({
  id,
  type,
  number,
  label,
  isHighlighted,
  isSelected,
  isMultiSelected = false,
  isInLinkingSession = false,
  pcBadgesWithColor = [],
  onClick,
  onUpdate,
  onDelete,
  typeColor,
  performanceCriteria = [],
  onLinkToPC,
  onUnlinkFromPC,
  hasChildren = false,
  isExpanded = false
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [showContextMenu, setShowContextMenu] = useState(null)
  const [hovered, setHovered] = useState(false)

  // For LOs, split verb and description for editing
  const isLO = type === 'lo'
  const [verb, description] = isLO
    ? [label.split(' ')[0], label.split(' ').slice(1).join(' ')]
    : ['', label]

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    if (onUpdate) {
      // For LOs, only edit the description (verb is non-editable)
      setEditValue(isLO ? description : label)
      setIsEditing(true)
    }
  }, [label, description, isLO, onUpdate])

  // Handle save edit
  const handleSave = useCallback(() => {
    if (type === 'lo') {
      // Verb is preserved, only description changes
      onUpdate?.({ verb, description: editValue.trim() })
    } else {
      onUpdate?.({ title: editValue.trim() })
    }
    setIsEditing(false)
  }, [editValue, type, verb, onUpdate])

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    setEditValue(label)
    setIsEditing(false)
  }, [label])

  // Handle right-click context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    setShowContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setShowContextMenu(null)
  }, [])

  // Highlight styling - linking source takes priority with green glow
  const highlightBg = isInLinkingSession
    ? 'rgba(0, 255, 0, 0.25)'
    : isHighlighted
      ? 'rgba(212, 115, 12, 0.15)'
      : isSelected
        ? 'rgba(212, 115, 12, 0.08)'
        : isMultiSelected
          ? 'rgba(0, 255, 0, 0.1)'
          : hovered
            ? 'rgba(255, 255, 255, 0.03)'
            : 'transparent'

  const highlightBorder = isInLinkingSession
    ? '2px solid #00FF00'
    : isHighlighted || isSelected
      ? `1px solid ${THEME.AMBER}`
      : isMultiSelected
        ? '1px solid #00FF00'
        : '1px solid transparent'

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5vw',
          padding: '0.6vh 0.6vw',
          marginBottom: '0.3vh',
          background: highlightBg,
          border: highlightBorder,
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          position: 'relative'
        }}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Type color indicator (for lessons) */}
        {typeColor && (
          <div
            style={{
              width: '4px',
              height: '100%',
              minHeight: '2vh',
              background: typeColor,
              borderRadius: '2px',
              flexShrink: 0
            }}
          />
        )}

        {/* Expand/Collapse indicator for items with children */}
        {hasChildren && (
          <span
            style={{
              fontSize: FONT.NUMBER,
              color: THEME.TEXT_DIM,
              fontWeight: 400,
              flexShrink: 0,
              width: '1.2vh',
              transition: 'transform 0.15s ease',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
            }}
          >
            ▶
          </span>
        )}

        {/* Number - GREEN when editing, otherwise AMBER */}
        {number && (
          <span
            style={{
              fontSize: FONT.NUMBER,
              fontFamily: THEME.FONT_MONO,
              color: isEditing ? '#00FF00' : THEME.AMBER,
              fontWeight: 500,
              flexShrink: 0,
              minWidth: hasChildren ? '2.5vw' : '3vw',
              transition: 'color 0.15s ease'
            }}
          >
            {number}
          </span>
        )}

        {/* Label or Edit Input */}
        {isEditing ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.4vw' }}>
            {/* For LOs, show verb as non-editable green text */}
            {isLO && verb && (
              <span
                style={{
                  fontSize: FONT.LABEL,
                  fontFamily: THEME.FONT_PRIMARY,
                  color: '#00FF00',
                  fontWeight: 500,
                  flexShrink: 0
                }}
              >
                {verb}
              </span>
            )}
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              autoFocus
              style={{
                flex: 1,
                fontSize: FONT.LABEL,
                fontFamily: THEME.FONT_PRIMARY,
                color: THEME.WHITE,
                background: THEME.BG_INPUT,
                border: `1px solid ${THEME.AMBER}`,
                borderRadius: '0.3vh',
                padding: '0.2vh 0.4vw',
                outline: 'none'
              }}
            />
          </div>
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              color: isHighlighted ? THEME.WHITE : THEME.TEXT_PRIMARY,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {label}
          </span>
        )}

        {/* PC Colored Dots */}
        {pcBadgesWithColor && pcBadgesWithColor.length > 0 && (
          <PCColoredDots pcs={pcBadgesWithColor} />
        )}

        {/* Delete button on hover */}
        {hovered && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: THEME.TEXT_DIM,
              fontSize: FONT.LABEL,
              cursor: 'pointer',
              padding: '0 0.2vw'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <ContextMenu
          x={showContextMenu.x}
          y={showContextMenu.y}
          onClose={closeContextMenu}
          onDelete={onDelete}
          performanceCriteria={performanceCriteria}
          linkedPCs={(pcBadgesWithColor || []).map(p => p.name)}
          onLinkToPC={onLinkToPC}
          onUnlinkFromPC={onUnlinkFromPC}
        />
      )}
    </>
  )
}

// ============================================
// CONTEXT MENU COMPONENT
// ============================================

function ContextMenu({
  x, y, onClose, onDelete,
  performanceCriteria = [], linkedPCs = [],
  onLinkToPC, onUnlinkFromPC
}) {
  // Find unlinked PCs
  const unlinkedPCs = performanceCriteria.filter(pc => !linkedPCs.includes(pc.name))

  return (
    <>
      {/* Overlay to catch clicks */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          left: x,
          top: y,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '0.5vh',
          padding: '0.5vh 0',
          zIndex: 1000,
          minWidth: '120px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {/* Link to PC submenu */}
        {unlinkedPCs.length > 0 && (
          <>
            <div
              style={{
                padding: '0.4vh 1vw',
                fontSize: FONT.BADGE,
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              Link to PC:
            </div>
            {unlinkedPCs.map(pc => (
              <button
                key={pc.id}
                onClick={() => {
                  onLinkToPC?.(pc.id)
                  onClose()
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5vh 1vw',
                  background: 'transparent',
                  border: 'none',
                  color: THEME.AMBER,
                  fontSize: FONT.LABEL,
                  fontFamily: THEME.FONT_PRIMARY,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {pc.name}
              </button>
            ))}
            <div style={{ height: '1px', background: THEME.BORDER, margin: '0.5vh 0' }} />
          </>
        )}

        {/* Unlink from PC */}
        {linkedPCs.length > 0 && (
          <>
            <div
              style={{
                padding: '0.4vh 1vw',
                fontSize: FONT.BADGE,
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_PRIMARY
              }}
            >
              Unlink from:
            </div>
            {linkedPCs.map(pcName => {
              const pc = performanceCriteria.find(p => p.name === pcName)
              return (
                <button
                  key={pcName}
                  onClick={() => {
                    if (pc) onUnlinkFromPC?.(pc.id)
                    onClose()
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5vh 1vw',
                    background: 'transparent',
                    border: 'none',
                    color: THEME.TEXT_DIM,
                    fontSize: FONT.LABEL,
                    fontFamily: THEME.FONT_PRIMARY,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {pcName}
                </button>
              )
            })}
            <div style={{ height: '1px', background: THEME.BORDER, margin: '0.5vh 0' }} />
          </>
        )}

        {/* Delete option */}
        {onDelete && (
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.5vh 1vw',
              background: 'transparent',
              border: 'none',
              color: '#ff4444',
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </>
  )
}

// ============================================
// PC COLUMN COMPONENT (Special Column)
// ============================================

function PCColumn({
  performanceCriteria,
  scalarData,
  scheduledLessons,
  onAdd,
  onUpdate,
  onDelete,
  onUnlink,
  onItemClick,
  selectedPCId,
  onPCClick,
  isInLinkingMode
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_DARK,
        minWidth: 0
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1vh 0.8vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL,
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500
          }}
        >
          Performance Criteria
        </span>
        <button
          onClick={onAdd}
          style={{
            background: 'transparent',
            border: `1px dashed ${THEME.AMBER}`,
            borderRadius: '14px',
            color: THEME.AMBER,
            fontSize: FONT.BUTTON,
            padding: '0.4vh 0.8vw',
            cursor: 'pointer'
          }}
        >
          + PC
        </button>
      </div>

      {/* Column Body - Scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5vh 0.5vw'
        }}
      >
        {performanceCriteria.length === 0 ? (
          <div
            style={{
              padding: '2vh 1vw',
              textAlign: 'center',
              color: THEME.TEXT_DIM,
              fontSize: FONT.LABEL,
              fontStyle: 'italic'
            }}
          >
            No PCs
          </div>
        ) : (
          performanceCriteria.map(pc => (
            <PCItem
              key={pc.id}
              pc={pc}
              scalarData={scalarData}
              scheduledLessons={scheduledLessons}
              onUpdate={(updates) => onUpdate(pc.id, updates)}
              onDelete={() => onDelete(pc.id)}
              onUnlink={(itemType, itemId) => onUnlink(pc.id, itemType, itemId)}
              onItemClick={onItemClick}
              isSelectedForLinking={selectedPCId === pc.id}
              onPCClick={() => onPCClick(pc.id)}
              isInLinkingMode={isInLinkingMode}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// PC ITEM COMPONENT
// ============================================

function PCItem({ pc, scalarData, scheduledLessons, onUpdate, onDelete, onUnlink, onItemClick, isSelectedForLinking, onPCClick, isInLinkingMode }) {
  const [expanded, setExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(pc.name)

  // Handle double-click to edit
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setEditValue(pc.name)
    setIsEditing(true)
  }, [pc.name])

  // Handle save edit
  const handleSave = useCallback(() => {
    if (editValue.trim() && editValue.trim() !== pc.name) {
      onUpdate?.({ name: editValue.trim() })
    }
    setIsEditing(false)
  }, [editValue, pc.name, onUpdate])

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    setEditValue(pc.name)
    setIsEditing(false)
  }, [pc.name])

  // Get linked item details
  const getLinkedItems = () => {
    const items = []

    // LOs
    pc.linkedItems.los?.forEach(loId => {
      for (const module of scalarData.modules) {
        const lo = module.learningObjectives.find(l => l.id === loId)
        if (lo) {
          items.push({ type: 'lo', id: loId, label: `LO ${lo.order}: ${lo.verb}` })
        }
      }
    })

    // Topics
    pc.linkedItems.topics?.forEach(topicId => {
      for (const module of scalarData.modules) {
        for (const lo of module.learningObjectives) {
          const topic = lo.topics?.find(t => t.id === topicId)
          if (topic) {
            items.push({ type: 'topic', id: topicId, label: `${lo.order}.${topic.order}: ${topic.title}` })
          }
        }
      }
    })

    // Subtopics
    pc.linkedItems.subtopics?.forEach(subId => {
      for (const module of scalarData.modules) {
        for (const lo of module.learningObjectives) {
          for (const topic of lo.topics || []) {
            const sub = topic.subtopics?.find(s => s.id === subId)
            if (sub) {
              items.push({ type: 'subtopic', id: subId, label: `${lo.order}.${topic.order}.${sub.order}: ${sub.title}` })
            }
          }
        }
      }
    })

    // Lessons
    pc.linkedItems.lessons?.forEach(lessonId => {
      const lesson = scheduledLessons.find(l => l.id === lessonId)
      if (lesson) {
        items.push({ type: 'lesson', id: lessonId, label: lesson.title })
      }
    })

    return items
  }

  const linkedItems = getLinkedItems()
  const hasItems = linkedItems.length > 0

  return (
    <div
      style={{
        marginBottom: '0.8vh',
        background: isSelectedForLinking ? 'rgba(212, 115, 12, 0.25)' : 'rgba(212, 115, 12, 0.08)',
        borderRadius: '0.5vh',
        border: `1px solid ${isSelectedForLinking ? THEME.AMBER : THEME.BORDER}`,
        transition: 'all 0.15s ease'
      }}
    >
      {/* PC Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5vw',
          padding: '0.6vh 0.6vw',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          // SHIFT+click for universal linking (sets source)
          if (e.shiftKey) {
            onItemClick?.('pc', pc.id, e)
            return
          }
          // If in linking mode, regular click links to source
          if (isInLinkingMode) {
            onItemClick?.('pc', pc.id, e)
            return
          }
          // Single click selects/deselects for linking
          onPCClick?.()
        }}
      >
        {/* Expand toggle */}
        <span
          style={{
            fontSize: FONT.NUMBER,
            color: THEME.TEXT_DIM,
            width: '1.5vh',
            cursor: hasItems ? 'pointer' : 'default'
          }}
          onClick={(e) => {
            if (hasItems) {
              e.stopPropagation()
              setExpanded(!expanded)
            }
          }}
        >
          {hasItems ? (expanded ? '−' : '+') : '○'}
        </span>

        {/* PC Name - editable on double-click */}
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{
              flex: 1,
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '0.3vh',
              padding: '0.2vh 0.4vw',
              outline: 'none'
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: FONT.LABEL,
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 500,
              cursor: 'text'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {/* PC serial number in luminous green, user text in amber */}
            {(() => {
              // Extract serial number (PC1, PC2, etc.) from the name
              const serialMatch = pc.name.match(/^(PC\d+)(.*)$/i)
              if (serialMatch) {
                const serial = serialMatch[1]
                const userText = serialMatch[2]
                return (
                  <>
                    <span style={{ color: '#00FF00' }}>{serial}</span>
                    {userText && <span style={{ color: THEME.AMBER }}>{userText}</span>}
                  </>
                )
              }
              // Fallback - show entire name in amber if no serial pattern found
              return <span style={{ color: THEME.AMBER }}>{pc.name}</span>
            })()}
          </span>
        )}

        {/* Item count */}
        <span
          style={{
            fontSize: FONT.BADGE,
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO
          }}
        >
          ({linkedItems.length})
        </span>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: THEME.TEXT_DIM,
            fontSize: FONT.LABEL,
            cursor: 'pointer',
            padding: '0 0.2vw'
          }}
        >
          ×
        </button>
      </div>

      {/* Linked Items */}
      {expanded && hasItems && (
        <div
          style={{
            padding: '0 0.6vw 0.6vh 2vw',
            borderTop: `1px solid ${THEME.BORDER}`
          }}
        >
          {linkedItems.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5vw',
                padding: '0.3vh 0',
                fontSize: FONT.BADGE,
                color: THEME.TEXT_DIM,
                cursor: 'pointer'
              }}
              onClick={() => onItemClick(item.type, item.id)}
            >
              <span style={{ color: THEME.TEXT_DIM }}>└</span>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUnlink(item.type, item.id)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: THEME.TEXT_DIM,
                  fontSize: FONT.BADGE,
                  cursor: 'pointer',
                  padding: '0 0.2vw'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScalarColumns
