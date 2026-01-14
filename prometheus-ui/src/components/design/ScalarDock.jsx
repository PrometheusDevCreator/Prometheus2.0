/**
 * ScalarDock.jsx - Column-Based SCALAR View (Enhanced)
 *
 * 7-Column Layout:
 * - 5 LO columns (always visible, with placeholder if empty)
 * - Lesson Titles column (always visible)
 * - Performance Criteria column (always visible)
 *
 * Features:
 * - Two-level menu expansion (LO→Topics, Topic→Subtopics)
 * - Linking mode via double-click
 * - Drag-and-drop reordering
 * - Orphan handling with reassignment
 * - Enhanced color states per requirements
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

// ============================================
// CONSTANTS
// ============================================

const FONT = {
  HEADER: '1.4vh',
  ITEM: '1.3vh',
  SERIAL: '1.1vh',
  BUTTON: '1.2vh',
  VERB: '1.2vh'
}

// Evenly distributed columns (7 columns total)
const COLUMN_WIDTH = 'calc((100% - 2vw) / 7)'
const COLUMN_MIN_WIDTH = 195

// Get Performance Verb - prefer explicit verb field, fallback to extracting first word
const getPerformanceVerb = (lo) => {
  if (lo.verb) return lo.verb.toUpperCase()
  const text = lo.title || lo.description || ''
  if (!text || text.trim().length === 0) return ''
  return text.trim().split(/\s+/)[0].toUpperCase()
}

// ============================================
// SCALAR ITEM COMPONENT (Topics/Subtopics)
// ============================================

function ScalarItem({
  item,
  type,
  serial,
  depth = 0,
  isSelected,
  isEditing,
  isLinked,
  isLinkSource,
  linkingModeActive,
  isOrphaned = false,
  isChildOfActiveLO = false,
  hasExpandArrow = false,
  isExpanded = false,
  onToggleExpand,
  onSelect,
  onEdit,
  onToggleLink,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const getDisplayText = () => {
    return item.title || item.description || item.text || 'Untitled'
  }

  const [editValue, setEditValue] = useState(getDisplayText())
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setEditValue(getDisplayText())
  }, [item.title, item.description])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onSelect?.(type, item.id)
  }, [onSelect, type, item.id])

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    // Double-click enters linking mode
    onToggleLink?.(type, item.id)
  }, [onToggleLink, type, item.id])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onUpdate?.(type, item.id, editValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(getDisplayText())
      onSelect?.(type, item.id)
    }
  }, [onUpdate, onSelect, type, item.id, editValue])

  const handleBlur = useCallback(() => {
    onUpdate?.(type, item.id, editValue)
  }, [onUpdate, type, item.id, editValue])

  // Determine colors based on state
  const getTextColor = () => {
    // Orphaned items are red
    if (isOrphaned) return THEME.RED
    // Linking mode colors
    if (linkingModeActive) {
      if (isLinkSource || isLinked) return THEME.GREEN_BRIGHT
      if (isHovered) return THEME.AMBER
      return THEME.TEXT_DIM
    }
    // Selected item is burnt orange
    if (isSelected) return THEME.AMBER
    // Hover is burnt orange
    if (isHovered) return THEME.AMBER
    // Child of active LO is white
    if (isChildOfActiveLO) return THEME.WHITE
    // Default is light grey
    return THEME.TEXT_DIM
  }

  const getSerialColor = () => {
    if (isOrphaned) return THEME.RED
    if (isSelected) return THEME.AMBER
    if (isHovered) return THEME.AMBER
    if (isChildOfActiveLO) return THEME.WHITE
    return THEME.TEXT_DIM
  }

  const getBorderColor = () => {
    if (isLinkSource) return THEME.GREEN_BRIGHT
    if (isSelected) return THEME.AMBER
    if (isHovered) return THEME.AMBER
    return 'transparent'
  }

  return (
    <div
      draggable
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={(e) => onDragStart?.(e, type, item.id, item.loId || item.topicId)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, type, item.id)}
      title={getDisplayText()}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.4vh 0.5vw',
        marginLeft: `${depth * 12}px`,
        marginBottom: '0.3vh',
        background: isSelected ? `${THEME.AMBER}15` : 'transparent',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '3px',
        cursor: linkingModeActive ? 'crosshair' : 'grab',
        transition: 'all 0.15s ease',
        opacity: 1
      }}
    >
      {/* Serial Number */}
      {serial && (
        <span
          style={{
            fontSize: FONT.SERIAL,
            color: getSerialColor(),
            fontFamily: THEME.FONT_MONO,
            marginRight: '0.4vw',
            minWidth: '2.5vw',
            flexShrink: 0,
            transition: 'color 0.15s ease'
          }}
        >
          {serial}
        </span>
      )}

      {/* Title/Content */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          style={{
            flex: 1,
            background: THEME.BG_DARK,
            border: `1px solid ${THEME.AMBER}`,
            color: THEME.WHITE,
            fontSize: FONT.ITEM,
            fontFamily: THEME.FONT_PRIMARY,
            padding: '0.2vh 0.3vw',
            outline: 'none',
            borderRadius: '2px'
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            fontSize: FONT.ITEM,
            color: getTextColor(),
            fontFamily: THEME.FONT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.15s ease'
          }}
        >
          {getDisplayText()}
        </span>
      )}

      {/* Expand arrow for topics (to reveal subtopics) */}
      {hasExpandArrow && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.(item.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: isHovered || isSelected ? THEME.AMBER : THEME.TEXT_DIM,
            cursor: 'pointer',
            padding: '0 0.3vw',
            fontSize: FONT.BUTTON,
            transition: 'color 0.15s ease'
          }}
          title={isExpanded ? 'Collapse Subtopics' : 'Expand Subtopics'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      )}

      {/* Delete button (visible on hover when not in linking mode) */}
      {isHovered && !linkingModeActive && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(type, item.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.RED,
            cursor: 'pointer',
            padding: '0 0.2vw',
            fontSize: FONT.BUTTON,
            marginLeft: '0.3vw'
          }}
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  )
}

// ============================================
// LESSON ITEM COMPONENT
// ============================================

function LessonItem({
  lesson,
  index,
  isSelected,
  isLinkSource,
  isLinked,
  linkingModeActive,
  onSelect,
  onDoubleClick
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getTextColor = () => {
    if (isLinkSource || isLinked) return THEME.GREEN_BRIGHT
    if (isSelected) return THEME.AMBER
    if (linkingModeActive && isHovered) return THEME.AMBER
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  return (
    <div
      onClick={() => onSelect?.('lesson', lesson.id)}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={lesson.title || 'Untitled'}
      style={{
        padding: '0.4vh 0.5vw',
        marginBottom: '0.3vh',
        fontSize: FONT.ITEM,
        color: getTextColor(),
        fontFamily: THEME.FONT_PRIMARY,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: isLinkSource ? `1px solid ${THEME.GREEN_BRIGHT}` : isSelected ? `1px solid ${THEME.AMBER}` : '1px solid transparent',
        borderRadius: '3px',
        background: isLinkSource ? `${THEME.GREEN_BRIGHT}10` : isSelected ? `${THEME.AMBER}15` : 'transparent',
        transition: 'all 0.15s ease'
      }}
    >
      {index + 1}. {lesson.title || 'Untitled'}
    </div>
  )
}

// ============================================
// PC ITEM COMPONENT
// ============================================

function PCItem({
  pc,
  index,
  isSelected,
  isLinkSource,
  isLinked,
  linkingModeActive,
  onSelect,
  onDoubleClick
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getTextColor = () => {
    if (isLinkSource || isLinked) return THEME.GREEN_BRIGHT
    if (isSelected) return THEME.AMBER
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  return (
    <div
      onClick={() => onSelect?.('pc', pc.id)}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={pc.title || pc.description || 'Untitled'}
      style={{
        padding: '0.4vh 0.5vw',
        marginBottom: '0.3vh',
        fontSize: FONT.ITEM,
        color: getTextColor(),
        fontFamily: THEME.FONT_PRIMARY,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: isSelected ? `1px solid ${THEME.AMBER}` : '1px solid transparent',
        borderRadius: '3px',
        background: isSelected ? `${THEME.AMBER}15` : 'transparent',
        transition: 'all 0.15s ease'
      }}
    >
      PC{index + 1}: {pc.title || pc.description || 'Untitled'}
    </div>
  )
}

// ============================================
// LO COLUMN COMPONENT
// ============================================

function LOColumn({
  lo,
  loIndex,
  topics,
  subtopics,
  orphanedTopics = [],
  selection,
  activeLOId,
  linkingMode,
  expandedLOs,
  expandedTopics,
  onToggleLOExpand,
  onToggleTopicExpand,
  onSelect,
  onEdit,
  onToggleLink,
  onUpdate,
  onDelete,
  onAddTopic,
  onAddSubtopic,
  onDragStart,
  onDragOver,
  onDrop,
  onDropOnHeader
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Get topics for this LO
  const loTopics = useMemo(() => {
    return topics
      .filter(t => t.loId === lo.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [topics, lo.id])

  const performanceVerb = getPerformanceVerb(lo)
  const loDescription = lo.description || lo.title || ''
  const isExpanded = expandedLOs.has(lo.id)
  const isActive = activeLOId === lo.id
  const isSelected = selection.type === 'lo' && selection.id === lo.id

  // Colors based on state
  const getSerialColor = () => {
    if (isActive) return THEME.WHITE
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  const getVerbColor = () => {
    if (isActive) return THEME.GREEN_BRIGHT
    return THEME.TEXT_DIM
  }

  const getDescColor = () => {
    if (isActive) return THEME.WHITE
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  const getArrowColor = () => {
    if (isActive) return THEME.GREEN_BRIGHT
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  const getPlusColor = () => {
    if (isActive) return THEME.GREEN_BRIGHT
    if (isHovered) return THEME.AMBER
    return THEME.TEXT_DIM
  }

  return (
    <div
      style={{
        width: COLUMN_WIDTH,
        minWidth: COLUMN_MIN_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => onDropOnHeader?.(e, lo.id)}
    >
      {/* LO Row: "1: VERB description" */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.('lo', lo.id)}
        onDoubleClick={() => onToggleLink?.('lo', lo.id)}
        title={`${performanceVerb} ${loDescription}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5vh 0.5vw',
          marginBottom: '0.5vh',
          cursor: 'pointer',
          background: isSelected ? `${THEME.AMBER}15` : 'transparent',
          borderRadius: '3px',
          transition: 'all 0.15s ease'
        }}
      >
        {/* LO Number (just numeral, no "LO" prefix) */}
        <span
          style={{
            fontSize: FONT.HEADER,
            fontFamily: THEME.FONT_PRIMARY,
            color: getSerialColor(),
            marginRight: '0.3vw',
            transition: 'color 0.15s ease'
          }}
        >
          {loIndex + 1}:
        </span>

        {/* Performance Verb + Description */}
        <span
          style={{
            flex: 1,
            fontSize: FONT.ITEM,
            fontFamily: THEME.FONT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: getVerbColor(), fontWeight: 500, transition: 'color 0.15s ease' }}>
            {performanceVerb}
          </span>
          {loDescription && (
            <span style={{ color: getDescColor(), marginLeft: '0.3vw', transition: 'color 0.15s ease' }}>
              {loDescription}
            </span>
          )}
        </span>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleLOExpand(lo.id)
            // Also activate the LO when expanding
            onSelect?.('lo', lo.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: getArrowColor(),
            cursor: 'pointer',
            padding: '0 0.3vw',
            fontSize: FONT.BUTTON,
            transition: 'color 0.15s ease',
            marginLeft: '0.3vw'
          }}
          title={isExpanded ? 'Collapse Topics' : 'Expand Topics'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>

        {/* Add Topic button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddTopic(lo.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: getPlusColor(),
            cursor: 'pointer',
            padding: '0 0.3vw',
            fontSize: FONT.BUTTON,
            transition: 'color 0.15s ease'
          }}
          title="Add Topic"
        >
          +
        </button>
      </div>

      {/* Topics (only visible when LO expanded) */}
      {isExpanded && (
        <div style={{ flex: 1, overflow: 'auto', padding: '0 0.3vw' }}>
          {loTopics.map((topic, topicIdx) => {
            const topicSubtopics = subtopics
              .filter(s => s.topicId === topic.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
            const isTopicExpanded = expandedTopics.has(topic.id)
            const hasSubtopics = topicSubtopics.length > 0

            return (
              <div key={topic.id}>
                {/* Topic Item */}
                <ScalarItem
                  item={topic}
                  type="topic"
                  serial={`${lo.order || loIndex + 1}.${topicIdx + 1}`}
                  depth={0}
                  isSelected={selection.type === 'topic' && selection.id === topic.id}
                  isEditing={selection.type === 'topic' && selection.id === topic.id && selection.mode === 'editing'}
                  isLinked={linkingMode.linkedElements?.has(`topic:${topic.id}`)}
                  isLinkSource={linkingMode.sourceElement?.type === 'topic' && linkingMode.sourceElement?.id === topic.id}
                  linkingModeActive={linkingMode.active}
                  isChildOfActiveLO={isActive}
                  hasExpandArrow={hasSubtopics || true}
                  isExpanded={isTopicExpanded}
                  onToggleExpand={() => onToggleTopicExpand(topic.id)}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onToggleLink={onToggleLink}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                />

                {/* Subtopics (only visible when Topic expanded) */}
                {isTopicExpanded && (
                  <>
                    {topicSubtopics.map((subtopic, subIdx) => (
                      <ScalarItem
                        key={subtopic.id}
                        item={subtopic}
                        type="subtopic"
                        serial={`${lo.order || loIndex + 1}.${topicIdx + 1}.${subIdx + 1}`}
                        depth={1}
                        isSelected={selection.type === 'subtopic' && selection.id === subtopic.id}
                        isEditing={selection.type === 'subtopic' && selection.id === subtopic.id && selection.mode === 'editing'}
                        isLinked={linkingMode.linkedElements?.has(`subtopic:${subtopic.id}`)}
                        isLinkSource={linkingMode.sourceElement?.type === 'subtopic' && linkingMode.sourceElement?.id === subtopic.id}
                        linkingModeActive={linkingMode.active}
                        isChildOfActiveLO={isActive}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onToggleLink={onToggleLink}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                      />
                    ))}

                    {/* Add Subtopic button */}
                    <button
                      onClick={() => onAddSubtopic(topic.id)}
                      style={{
                        marginLeft: '12px',
                        marginBottom: '0.5vh',
                        background: 'none',
                        border: 'none',
                        color: THEME.TEXT_DIM,
                        cursor: 'pointer',
                        fontSize: FONT.SERIAL,
                        opacity: 0.6
                      }}
                    >
                      + subtopic
                    </button>
                  </>
                )}
              </div>
            )
          })}

          {loTopics.length === 0 && (
            <span
              style={{
                fontSize: FONT.SERIAL,
                color: THEME.TEXT_DIM,
                fontStyle: 'italic',
                marginLeft: '4px'
              }}
            >
              No topics
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// EMPTY LO COLUMN PLACEHOLDER
// ============================================

function EmptyLOColumn({ loIndex }) {
  return (
    <div
      style={{
        width: COLUMN_WIDTH,
        minWidth: COLUMN_MIN_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Placeholder LO Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5vh 0.5vw',
          marginBottom: '0.5vh'
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.TEXT_DIM,
            marginRight: '0.3vw'
          }}
        >
          {loIndex + 1}:
        </span>
        <span
          style={{
            flex: 1,
            fontSize: FONT.ITEM,
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.TEXT_DIM,
            fontStyle: 'italic'
          }}
        >
          None entered
        </span>
      </div>
    </div>
  )
}

// ============================================
// ORPHANED ITEMS SECTION
// ============================================

function OrphanedItemsSection({
  orphanedTopics,
  orphanedSubtopics,
  selection,
  linkingMode,
  onSelect,
  onEdit,
  onToggleLink,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) {
  if (orphanedTopics.length === 0 && orphanedSubtopics.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '1vh', padding: '0 0.3vw' }}>
      <div
        style={{
          fontSize: FONT.SERIAL,
          color: THEME.RED,
          fontFamily: THEME.FONT_PRIMARY,
          marginBottom: '0.5vh',
          fontWeight: 500
        }}
      >
        ORPHANED ITEMS (drag to reassign)
      </div>
      {orphanedTopics.map((topic, idx) => (
        <ScalarItem
          key={topic.id}
          item={topic}
          type="topic"
          serial={`x.${idx + 1}`}
          depth={0}
          isSelected={selection.type === 'topic' && selection.id === topic.id}
          isEditing={selection.type === 'topic' && selection.id === topic.id && selection.mode === 'editing'}
          isLinked={linkingMode.linkedElements?.has(`topic:${topic.id}`)}
          isLinkSource={linkingMode.sourceElement?.type === 'topic' && linkingMode.sourceElement?.id === topic.id}
          linkingModeActive={linkingMode.active}
          isOrphaned={true}
          onSelect={onSelect}
          onEdit={onEdit}
          onToggleLink={onToggleLink}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
      {orphanedSubtopics.map((subtopic, idx) => (
        <ScalarItem
          key={subtopic.id}
          item={subtopic}
          type="subtopic"
          serial={`x.x.${idx + 1}`}
          depth={1}
          isSelected={selection.type === 'subtopic' && selection.id === subtopic.id}
          isEditing={selection.type === 'subtopic' && selection.id === subtopic.id && selection.mode === 'editing'}
          isLinked={linkingMode.linkedElements?.has(`subtopic:${subtopic.id}`)}
          isLinkSource={linkingMode.sourceElement?.type === 'subtopic' && linkingMode.sourceElement?.id === subtopic.id}
          linkingModeActive={linkingMode.active}
          isOrphaned={true}
          onSelect={onSelect}
          onEdit={onEdit}
          onToggleLink={onToggleLink}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

function ScalarDock({ width = '100%', height = '100%' }) {
  const {
    scalarData,
    canonicalData,
    selection,
    select,
    startEditing,
    clearSelection,
    addLearningObjective,
    addTopic,
    addSubtopic,
    updateScalarNode,
    deleteScalarNode,
    reorderTopic,
    reorderSubtopic,
    reorderLO,
    currentModule,
    scheduledLessons = [],
    unscheduledLessons = []
  } = useDesign()

  // UI State
  const [linkingMode, setLinkingMode] = useState({
    active: false,
    sourceElement: null,
    linkedElements: new Set()
  })

  const [deleteWarning, setDeleteWarning] = useState({
    active: false,
    elementType: null,
    elementId: null,
    elementTitle: null
  })

  const [expandedLOs, setExpandedLOs] = useState(new Set())
  const [expandedTopics, setExpandedTopics] = useState(new Set())
  const [activeLOId, setActiveLOId] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState(null) // 'lo' | 'lesson' | 'pc'
  const [addLOHovered, setAddLOHovered] = useState(false)

  // Data
  const module = useMemo(() => {
    return scalarData?.modules?.find(m => m.order === currentModule) || scalarData?.modules?.[0]
  }, [scalarData, currentModule])

  const learningObjectives = useMemo(() => {
    return module?.learningObjectives || []
  }, [module])

  const topics = useMemo(() => {
    return Object.values(canonicalData?.topics || {})
  }, [canonicalData])

  const subtopics = useMemo(() => {
    return Object.values(canonicalData?.subtopics || {})
  }, [canonicalData])

  // Orphaned items (no parent LO/Topic)
  const orphanedTopics = useMemo(() => {
    return topics.filter(t => !t.loId || t.loId === null)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [topics])

  const orphanedSubtopics = useMemo(() => {
    const validTopicIds = new Set(topics.map(t => t.id))
    return subtopics.filter(s => !s.topicId || !validTopicIds.has(s.topicId))
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [subtopics, topics])

  const allLessons = useMemo(() => {
    return [...scheduledLessons, ...unscheduledLessons]
  }, [scheduledLessons, unscheduledLessons])

  // Update selected column when selection changes
  useEffect(() => {
    if (selection.type === 'lo' || selection.type === 'topic' || selection.type === 'subtopic') {
      setSelectedColumn('lo')
      if (selection.type === 'lo') {
        setActiveLOId(selection.id)
      }
    } else if (selection.type === 'lesson') {
      setSelectedColumn('lesson')
      setActiveLOId(null)
    } else if (selection.type === 'pc') {
      setSelectedColumn('pc')
      setActiveLOId(null)
    } else {
      setSelectedColumn(null)
      setActiveLOId(null)
    }
  }, [selection])

  // Toggle handlers
  const toggleLOExpand = useCallback((loId) => {
    setExpandedLOs(prev => {
      const next = new Set(prev)
      if (next.has(loId)) {
        next.delete(loId)
      } else {
        next.add(loId)
      }
      return next
    })
  }, [])

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

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC - Exit linking mode, cancel delete, or clear selection
      if (e.key === 'Escape') {
        if (deleteWarning.active) {
          setDeleteWarning({ active: false, elementType: null, elementId: null, elementTitle: null })
          return
        }
        if (linkingMode.active) {
          setLinkingMode({ active: false, sourceElement: null, linkedElements: new Set() })
          return
        }
        clearSelection()
        setActiveLOId(null)
        setSelectedColumn(null)
        return
      }

      // ENTER - Confirm delete or exit linking mode
      if (e.key === 'Enter') {
        if (deleteWarning.active) {
          deleteScalarNode(deleteWarning.elementType, deleteWarning.elementId)
          setDeleteWarning({ active: false, elementType: null, elementId: null, elementTitle: null })
          clearSelection()
          return
        }
        if (linkingMode.active) {
          setLinkingMode({ active: false, sourceElement: null, linkedElements: new Set() })
          return
        }
      }

      // DELETE/BACKSPACE - Show delete warning
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.id && !selection.mode && !deleteWarning.active) {
        e.preventDefault()
        let title = 'Unknown'
        if (selection.type === 'lo') {
          const lo = learningObjectives.find(l => l.id === selection.id)
          title = lo?.description || lo?.title || 'Learning Objective'
        } else if (selection.type === 'topic') {
          const topic = topics.find(t => t.id === selection.id)
          title = topic?.title || 'Topic'
        } else if (selection.type === 'subtopic') {
          const subtopic = subtopics.find(s => s.id === selection.id)
          title = subtopic?.title || 'Subtopic'
        }
        setDeleteWarning({
          active: true,
          elementType: selection.type,
          elementId: selection.id,
          elementTitle: title
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [linkingMode.active, deleteWarning, selection, deleteScalarNode, clearSelection, learningObjectives, topics, subtopics])

  // Handlers
  const handleSelect = useCallback((type, id) => {
    select(type, id)
  }, [select])

  const handleEdit = useCallback((type, id) => {
    startEditing(type, id)
  }, [startEditing])

  const handleUpdate = useCallback((type, id, value) => {
    updateScalarNode(type, id, { title: value })
    select(type, id)
  }, [updateScalarNode, select])

  const handleDelete = useCallback((type, id) => {
    deleteScalarNode(type, id)
  }, [deleteScalarNode])

  const handleAddLO = useCallback(() => {
    addLearningObjective(module?.id)
  }, [addLearningObjective, module])

  const handleAddTopic = useCallback((loId) => {
    addTopic(loId)
  }, [addTopic])

  const handleAddSubtopic = useCallback((topicId) => {
    addSubtopic(topicId)
  }, [addSubtopic])

  // Toggle link handler (double-click enters linking mode)
  const handleToggleLink = useCallback((type, id) => {
    setLinkingMode(prev => {
      const elementKey = `${type}:${id}`

      if (!prev.active) {
        return {
          active: true,
          sourceElement: { type, id },
          linkedElements: new Set()
        }
      }

      if (prev.sourceElement?.type === type && prev.sourceElement?.id === id) {
        return { active: false, sourceElement: null, linkedElements: new Set() }
      }

      const newLinked = new Set(prev.linkedElements)
      if (newLinked.has(elementKey)) {
        newLinked.delete(elementKey)
      } else {
        newLinked.add(elementKey)
      }

      return { ...prev, linkedElements: newLinked }
    })
  }, [])

  // Drag-and-drop handlers
  const handleDragStart = useCallback((e, type, id, parentId) => {
    e.dataTransfer.setData('itemId', id)
    e.dataTransfer.setData('itemType', type)
    e.dataTransfer.setData('sourceParentId', parentId || 'null')
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e, targetType, targetId) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    const itemType = e.dataTransfer.getData('itemType')

    // Handle reordering
    if (itemType === 'topic' && targetType === 'topic') {
      // Get target topic's info to determine new order
      const targetTopic = topics.find(t => t.id === targetId)
      if (targetTopic) {
        reorderTopic(itemId, targetTopic.loId, targetTopic.order || 1)
      }
    } else if (itemType === 'subtopic' && targetType === 'subtopic') {
      const targetSubtopic = subtopics.find(s => s.id === targetId)
      if (targetSubtopic) {
        reorderSubtopic(itemId, targetSubtopic.topicId, targetSubtopic.order || 1)
      }
    }
  }, [topics, subtopics, reorderTopic, reorderSubtopic])

  const handleDropOnLOHeader = useCallback((e, targetLoId) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('itemId')
    const itemType = e.dataTransfer.getData('itemType')
    // Reassign topic (orphaned or from another LO) to this LO
    if (itemType === 'topic') {
      // Find the highest order in target LO and add after it
      const targetLOTopics = topics.filter(t => t.loId === targetLoId)
      const maxOrder = targetLOTopics.length > 0
        ? Math.max(...targetLOTopics.map(t => t.order || 0))
        : 0
      reorderTopic(itemId, targetLoId, maxOrder + 1)
    }
  }, [topics, reorderTopic])

  // Generate 5 LO column slots
  const loColumns = useMemo(() => {
    const columns = []
    for (let i = 0; i < 5; i++) {
      const lo = learningObjectives[i]
      columns.push({ lo, index: i })
    }
    return columns
  }, [learningObjectives])

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_DARK,
        overflow: 'hidden'
      }}
      data-testid="scalar-dock"
    >
      {/* Header Bar with +LO button on LEFT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 1vw',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          {/* +LO Button - Pill shape, dark grey default */}
          <button
            onClick={handleAddLO}
            onMouseEnter={() => setAddLOHovered(true)}
            onMouseLeave={() => setAddLOHovered(false)}
            style={{
              background: addLOHovered ? THEME.AMBER : THEME.TEXT_DIM,
              border: 'none',
              color: THEME.WHITE,
              cursor: 'pointer',
              padding: '0.6vh 1vw',
              fontSize: FONT.BUTTON,
              fontFamily: THEME.FONT_PRIMARY,
              borderRadius: '1.5vh',
              transition: 'all 0.2s ease'
            }}
            title="Add Learning Objective"
          >
            + LO
          </button>

          {linkingMode.active && (
            <span
              style={{
                fontSize: FONT.SERIAL,
                color: THEME.GREEN_BRIGHT,
                fontFamily: THEME.FONT_MONO,
                padding: '0.2vh 0.5vw',
                background: `${THEME.GREEN_BRIGHT}20`,
                borderRadius: '3px'
              }}
            >
              LINKING MODE (ESC to exit)
            </span>
          )}
        </div>
      </div>

      {/* Column Headers Row */}
      <div
        style={{
          display: 'flex',
          padding: '0 1vw',
          flexShrink: 0
        }}
      >
        {/* LEARNING OBJECTIVES header (spans 5 columns conceptually) */}
        <div
          style={{
            width: `calc(5 * ${COLUMN_WIDTH})`,
            minWidth: 5 * COLUMN_MIN_WIDTH,
            padding: '0.5vh 0.5vw',
            position: 'relative'
          }}
        >
          <span
            style={{
              fontSize: FONT.HEADER,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              letterSpacing: '0.08em',
              fontWeight: 500
            }}
          >
            LEARNING OBJECTIVES
          </span>
          {/* Selection underline */}
          {selectedColumn === 'lo' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '0.5vw',
                right: '0.5vw',
                height: '2px',
                background: THEME.AMBER,
                transition: 'all 0.15s ease'
              }}
            />
          )}
        </div>

        {/* LESSON TITLES header */}
        <div
          style={{
            width: COLUMN_WIDTH,
            minWidth: COLUMN_MIN_WIDTH,
            padding: '0.5vh 0.5vw',
            position: 'relative'
          }}
        >
          <span
            style={{
              fontSize: FONT.HEADER,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              letterSpacing: '0.08em',
              fontWeight: 500
            }}
          >
            LESSON TITLES
          </span>
          {selectedColumn === 'lesson' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '0.5vw',
                right: '0.5vw',
                height: '2px',
                background: THEME.AMBER,
                transition: 'all 0.15s ease'
              }}
            />
          )}
        </div>

        {/* PERFORMANCE CRITERIA header */}
        <div
          style={{
            width: COLUMN_WIDTH,
            minWidth: COLUMN_MIN_WIDTH,
            padding: '0.5vh 0.5vw',
            position: 'relative'
          }}
        >
          <span
            style={{
              fontSize: FONT.HEADER,
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.WHITE,
              letterSpacing: '0.08em',
              fontWeight: 500
            }}
          >
            PERFORMANCE CRITERIA
          </span>
          {selectedColumn === 'pc' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '0.5vw',
                right: '0.5vw',
                height: '2px',
                background: THEME.AMBER,
                transition: 'all 0.15s ease'
              }}
            />
          )}
        </div>
      </div>

      {/* Column Container - 7 columns */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '1vh 1vw'
        }}
      >
        {/* 5 LO Columns (always show 5, with placeholder if empty) */}
        {loColumns.map(({ lo, index }) => (
          lo ? (
            <LOColumn
              key={lo.id}
              lo={lo}
              loIndex={index}
              topics={topics}
              subtopics={subtopics}
              orphanedTopics={orphanedTopics}
              selection={selection}
              activeLOId={activeLOId}
              linkingMode={linkingMode}
              expandedLOs={expandedLOs}
              expandedTopics={expandedTopics}
              onToggleLOExpand={toggleLOExpand}
              onToggleTopicExpand={toggleTopicExpand}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onToggleLink={handleToggleLink}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddTopic={handleAddTopic}
              onAddSubtopic={handleAddSubtopic}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDropOnHeader={handleDropOnLOHeader}
            />
          ) : (
            <EmptyLOColumn key={`empty-${index}`} loIndex={index} />
          )
        ))}

        {/* Lesson Titles Column */}
        <div
          style={{
            width: COLUMN_WIDTH,
            minWidth: COLUMN_MIN_WIDTH,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ flex: 1, overflow: 'auto', padding: '0 0.3vw' }}>
            {allLessons.length === 0 ? (
              <span
                style={{
                  fontSize: FONT.ITEM,
                  color: THEME.TEXT_DIM,
                  fontStyle: 'italic'
                }}
              >
                No lessons
              </span>
            ) : (
              allLessons.map((lesson, idx) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={idx}
                  isSelected={selection.type === 'lesson' && selection.id === lesson.id}
                  isLinkSource={linkingMode.sourceElement?.type === 'lesson' && linkingMode.sourceElement?.id === lesson.id}
                  isLinked={linkingMode.linkedElements?.has(`lesson:${lesson.id}`)}
                  linkingModeActive={linkingMode.active}
                  onSelect={handleSelect}
                  onDoubleClick={() => {
                    if (linkingMode.active && linkingMode.sourceElement?.type === 'lesson' && linkingMode.sourceElement?.id === lesson.id) {
                      setLinkingMode({ active: false, sourceElement: null, linkedElements: new Set() })
                    } else {
                      setLinkingMode({
                        active: true,
                        sourceElement: { type: 'lesson', id: lesson.id },
                        linkedElements: new Set()
                      })
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Performance Criteria Column */}
        <div
          style={{
            width: COLUMN_WIDTH,
            minWidth: COLUMN_MIN_WIDTH,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ flex: 1, overflow: 'auto', padding: '0 0.3vw' }}>
            {canonicalData?.performanceCriteria && Object.values(canonicalData.performanceCriteria).length > 0 ? (
              Object.values(canonicalData.performanceCriteria).map((pc, idx) => (
                <PCItem
                  key={pc.id || idx}
                  pc={pc}
                  index={idx}
                  isSelected={selection.type === 'pc' && selection.id === pc.id}
                  isLinkSource={linkingMode.sourceElement?.type === 'pc' && linkingMode.sourceElement?.id === pc.id}
                  isLinked={linkingMode.linkedElements?.has(`pc:${pc.id}`)}
                  linkingModeActive={linkingMode.active}
                  onSelect={handleSelect}
                  onDoubleClick={() => handleToggleLink('pc', pc.id)}
                />
              ))
            ) : (
              <span
                style={{
                  fontSize: FONT.ITEM,
                  color: THEME.TEXT_DIM,
                  fontStyle: 'italic'
                }}
              >
                No criteria
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orphaned Items Section (at bottom of first LO column area) */}
      {(orphanedTopics.length > 0 || orphanedSubtopics.length > 0) && (
        <div style={{ padding: '0 1vw 1vh 1vw', flexShrink: 0 }}>
          <OrphanedItemsSection
            orphanedTopics={orphanedTopics}
            orphanedSubtopics={orphanedSubtopics}
            selection={selection}
            linkingMode={linkingMode}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onToggleLink={handleToggleLink}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
      )}

      {/* Status Bar */}
      <div
        style={{
          padding: '0.4vh 1vw',
          fontSize: FONT.SERIAL,
          color: THEME.TEXT_DIM,
          display: 'flex',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span>{learningObjectives.length} LO{learningObjectives.length !== 1 ? 's' : ''} | {topics.length} Topics | {subtopics.length} Subtopics</span>
        <span>Double-click to link | DEL to delete | Drag to reorder</span>
      </div>

      {/* Delete Warning Modal */}
      {deleteWarning.active && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: THEME.BG_DARK,
              border: `2px solid #FF4444`,
              borderRadius: '8px',
              padding: '2vh 2vw',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(255, 68, 68, 0.3)'
            }}
          >
            <p
              style={{
                color: '#FF4444',
                fontSize: '1.5vh',
                fontFamily: THEME.FONT_PRIMARY,
                fontWeight: 500,
                letterSpacing: '0.05em',
                margin: '0 0 1vh 0'
              }}
            >
              {deleteWarning.elementType?.toUpperCase()} will be permanently deleted.
            </p>
            <p
              style={{
                color: THEME.TEXT_SECONDARY,
                fontSize: '1.3vh',
                fontFamily: THEME.FONT_PRIMARY,
                margin: '0 0 2vh 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              "{deleteWarning.elementTitle}"
            </p>
            <p
              style={{
                color: THEME.WHITE,
                fontSize: '1.4vh',
                fontFamily: THEME.FONT_PRIMARY,
                fontWeight: 500,
                margin: 0
              }}
            >
              Press <span style={{ color: THEME.GREEN_BRIGHT }}>ENTER</span> to continue, or <span style={{ color: '#FF4444' }}>ESC</span> to exit
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScalarDock
