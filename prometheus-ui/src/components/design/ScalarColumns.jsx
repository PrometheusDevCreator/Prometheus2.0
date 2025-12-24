/**
 * ScalarColumns.jsx - Multi-Column Scalar View
 *
 * Displays 5 columns:
 * - Learning Objectives
 * - Topics
 * - Subtopics
 * - Lesson Titles
 * - Performance Criteria
 *
 * Features:
 * - Cross-column highlighting on click
 * - PC badges on linked items
 * - Inline editing
 * - Add/delete functionality
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

// Font sizes - 75% larger than original
const FONT = {
  HEADER: '2.45vh',      // was 1.4vh
  NUMBER: '1.75vh',      // was 1.0vh
  LABEL: '1.9vh',        // was 1.1vh
  BADGE: '1.4vh',        // was 0.8vh
  BUTTON: '1.6vh'        // was 0.9vh
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
    updateHighlightedItems,
    clearHighlights,
    isItemHighlighted,
    getLinkedPCs,
    select,
    selection,
    updateScalarNode,
    deleteScalarNode,
    linkItemToPC,
    unlinkItemFromPC,
    deletePerformanceCriteria
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

  // Handle item click for highlighting
  const handleItemClick = useCallback((type, id) => {
    select(type, id)
    updateHighlightedItems(type, id)
  }, [select, updateHighlightedItems])

  // Handle background click to clear
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      clearHighlights()
    }
  }, [clearHighlights])

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        gap: '1px',
        background: THEME.BORDER,
        overflow: 'hidden'
      }}
      onClick={handleBackgroundClick}
    >
      {/* Learning Objectives Column */}
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
            pcBadges={getLinkedPCs('lo', lo.id)}
            onClick={() => handleItemClick('lo', lo.id)}
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

      {/* Topics Column */}
      <ScalarColumn
        title="Topics"
        items={allTopics}
        renderItem={(topic) => (
          <ScalarColumnItem
            key={topic.id}
            id={topic.id}
            type="topic"
            number={`${topic.loOrder}.${topic.order}`}
            label={topic.title}
            isHighlighted={isItemHighlighted('topic', topic.id)}
            isSelected={selection.type === 'topic' && selection.id === topic.id}
            pcBadges={getLinkedPCs('topic', topic.id)}
            onClick={() => handleItemClick('topic', topic.id)}
            onUpdate={(updates) => updateScalarNode('topic', topic.id, updates)}
            onDelete={() => deleteScalarNode('topic', topic.id)}
            performanceCriteria={performanceCriteria}
            onLinkToPC={(pcId) => linkItemToPC(pcId, 'topic', topic.id)}
            onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'topic', topic.id)}
          />
        )}
        onAdd={() => {
          // Add to first LO if available
          if (learningObjectives.length > 0) {
            addTopic(learningObjectives[0].id)
          }
        }}
        addLabel="+ Topic"
        accentColor="#4a9eff"
      />

      {/* Subtopics Column */}
      <ScalarColumn
        title="Subtopics"
        items={allSubtopics}
        renderItem={(sub) => (
          <ScalarColumnItem
            key={sub.id}
            id={sub.id}
            type="subtopic"
            number={`${sub.loOrder}.${sub.topicOrder}.${sub.order}`}
            label={sub.title}
            isHighlighted={isItemHighlighted('subtopic', sub.id)}
            isSelected={selection.type === 'subtopic' && selection.id === sub.id}
            pcBadges={getLinkedPCs('subtopic', sub.id)}
            onClick={() => handleItemClick('subtopic', sub.id)}
            onUpdate={(updates) => updateScalarNode('subtopic', sub.id, updates)}
            onDelete={() => deleteScalarNode('subtopic', sub.id)}
            performanceCriteria={performanceCriteria}
            onLinkToPC={(pcId) => linkItemToPC(pcId, 'subtopic', sub.id)}
            onUnlinkFromPC={(pcId) => unlinkItemFromPC(pcId, 'subtopic', sub.id)}
          />
        )}
        onAdd={() => {
          // Add to first topic if available
          if (allTopics.length > 0) {
            addSubtopic(allTopics[0].id)
          }
        }}
        addLabel="+ Subtopic"
        accentColor="#9b59b6"
      />

      {/* Lesson Titles Column */}
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
            pcBadges={getLinkedPCs('lesson', lesson.id)}
            onClick={() => handleItemClick('lesson', lesson.id)}
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

      {/* Performance Criteria Column */}
      <PCColumn
        performanceCriteria={performanceCriteria}
        scalarData={scalarData}
        scheduledLessons={scheduledLessons}
        onAdd={() => addPerformanceCriteria()}
        onDelete={deletePerformanceCriteria}
        onUnlink={unlinkItemFromPC}
        onItemClick={handleItemClick}
      />
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
              borderRadius: '0.5vh',
              color: accentColor,
              fontSize: FONT.BUTTON,
              padding: '0.4vh 0.6vw',
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
// SCALAR COLUMN ITEM COMPONENT
// ============================================

function ScalarColumnItem({
  id,
  type,
  number,
  label,
  isHighlighted,
  isSelected,
  pcBadges = [],
  onClick,
  onUpdate,
  onDelete,
  typeColor,
  performanceCriteria = [],
  onLinkToPC,
  onUnlinkFromPC
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const [showContextMenu, setShowContextMenu] = useState(null)
  const [hovered, setHovered] = useState(false)

  // Handle double-click to edit
  const handleDoubleClick = useCallback(() => {
    if (onUpdate) {
      setEditValue(label)
      setIsEditing(true)
    }
  }, [label, onUpdate])

  // Handle save edit
  const handleSave = useCallback(() => {
    if (type === 'lo') {
      // Parse verb and description for LOs
      const words = editValue.trim().split(/\s+/)
      const verb = words[0]?.toUpperCase() || 'IDENTIFY'
      const description = words.slice(1).join(' ') || ''
      onUpdate?.({ verb, description })
    } else {
      onUpdate?.({ title: editValue })
    }
    setIsEditing(false)
  }, [editValue, type, onUpdate])

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

  // Highlight styling
  const highlightBg = isHighlighted
    ? 'rgba(212, 115, 12, 0.15)'
    : isSelected
      ? 'rgba(212, 115, 12, 0.08)'
      : hovered
        ? 'rgba(255, 255, 255, 0.03)'
        : 'transparent'

  const highlightBorder = isHighlighted || isSelected
    ? `1px solid ${THEME.AMBER}`
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
          borderRadius: '0.4vh',
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

        {/* Number */}
        {number && (
          <span
            style={{
              fontSize: FONT.NUMBER,
              fontFamily: THEME.FONT_MONO,
              color: THEME.AMBER,
              fontWeight: 500,
              flexShrink: 0,
              minWidth: '3vw'
            }}
          >
            {number}
          </span>
        )}

        {/* Label or Edit Input */}
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
            {label}
          </span>
        )}

        {/* PC Badges */}
        {pcBadges.length > 0 && (
          <div style={{ display: 'flex', gap: '0.2vw', flexShrink: 0 }}>
            {pcBadges.map(pcName => (
              <span
                key={pcName}
                style={{
                  fontSize: FONT.BADGE,
                  fontFamily: THEME.FONT_MONO,
                  color: THEME.AMBER,
                  background: 'rgba(212, 115, 12, 0.3)',
                  padding: '0.1vh 0.3vw',
                  borderRadius: '0.3vh'
                }}
              >
                {pcName}
              </span>
            ))}
          </div>
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
          linkedPCs={pcBadges}
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
  onDelete,
  onUnlink,
  onItemClick
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
            borderRadius: '0.5vh',
            color: THEME.AMBER,
            fontSize: FONT.BUTTON,
            padding: '0.4vh 0.6vw',
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
              onDelete={() => onDelete(pc.id)}
              onUnlink={(itemType, itemId) => onUnlink(pc.id, itemType, itemId)}
              onItemClick={onItemClick}
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

function PCItem({ pc, scalarData, scheduledLessons, onDelete, onUnlink, onItemClick }) {
  const [expanded, setExpanded] = useState(true)

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
        background: 'rgba(212, 115, 12, 0.08)',
        borderRadius: '0.5vh',
        border: `1px solid ${THEME.BORDER}`
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
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand toggle */}
        <span
          style={{
            fontSize: FONT.NUMBER,
            color: THEME.TEXT_DIM,
            width: '1.5vh'
          }}
        >
          {hasItems ? (expanded ? '−' : '+') : '○'}
        </span>

        {/* PC Name */}
        <span
          style={{
            flex: 1,
            fontSize: FONT.LABEL,
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.AMBER,
            fontWeight: 500
          }}
        >
          {pc.name}
        </span>

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
