/**
 * ScalarDock.jsx - Left Dock Tree View
 *
 * Phase 4: Calm Wheel Integration
 *
 * Replaces ScalarWorkspace (SCALAR tab) functionality.
 * Displays hierarchical tree: LO -> Topic -> Subtopic
 *
 * Features:
 * - Tree navigation with expand/collapse
 * - Inline editing
 * - Filters by WheelNav hierarchy selection
 * - Cross-highlights with WheelNav selection
 * - PC badge display
 * - Add/delete operations
 */

import { useState, useCallback, useMemo } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import { CANONICAL_FLAGS } from '../../utils/canonicalAdapter'

// ============================================
// CONSTANTS
// ============================================

const FONT = {
  HEADER: '1.8vh',
  ITEM: '1.5vh',
  SERIAL: '1.3vh',
  BUTTON: '1.2vh'
}

const INDENT = {
  LO: 0,
  TOPIC: 16,
  SUBTOPIC: 32
}

// ============================================
// TREE ITEM COMPONENT
// ============================================

function TreeItem({
  item,
  type,
  serial,
  indent,
  isSelected,
  isEditing,
  isHighlighted,
  hasChildren,
  isExpanded,
  pcBadges,
  onSelect,
  onEdit,
  onToggleExpand,
  onAdd,
  onDelete,
  onUpdate
}) {
  const [editValue, setEditValue] = useState(item.title || item.description || '')

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    onEdit?.(type, item.id)
  }, [onEdit, type, item.id])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onUpdate?.(type, item.id, editValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(item.title || item.description || '')
      onSelect?.(type, item.id) // Exit edit mode
    }
  }, [onUpdate, onSelect, type, item.id, editValue, item.title, item.description])

  const handleBlur = useCallback(() => {
    onUpdate?.(type, item.id, editValue)
  }, [onUpdate, type, item.id, editValue])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.4vh 0.5vw',
        paddingLeft: `calc(0.5vw + ${indent}px)`,
        background: isSelected
          ? `${THEME.ACCENT}20`
          : isHighlighted
            ? `${THEME.AMBER}15`
            : 'transparent',
        borderLeft: isSelected
          ? `3px solid ${THEME.ACCENT}`
          : '3px solid transparent',
        cursor: 'pointer',
        transition: 'background 0.15s'
      }}
      onClick={() => onSelect?.(type, item.id)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Expand/Collapse Toggle */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.(item.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.TEXT_DIM,
            cursor: 'pointer',
            padding: '0 0.3vw',
            fontSize: FONT.ITEM
          }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      )}

      {/* Spacer if no children */}
      {!hasChildren && (
        <span style={{ width: '1.2vw', display: 'inline-block' }} />
      )}

      {/* Serial Number */}
      {serial && (
        <span
          style={{
            fontSize: FONT.SERIAL,
            color: serial.startsWith('x.') ? THEME.RED : THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO,
            marginRight: '0.5vw',
            minWidth: '3vw'
          }}
        >
          {serial}
        </span>
      )}

      {/* Title/Label */}
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
            border: `1px solid ${THEME.ACCENT}`,
            color: THEME.WHITE,
            fontSize: FONT.ITEM,
            fontFamily: THEME.FONT_PRIMARY,
            padding: '0.2vh 0.3vw',
            outline: 'none'
          }}
        />
      ) : (
        <span
          style={{
            flex: 1,
            fontSize: FONT.ITEM,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {item.title || item.description || item.text || 'Untitled'}
        </span>
      )}

      {/* PC Badges */}
      {pcBadges && pcBadges.length > 0 && (
        <div style={{ display: 'flex', gap: '2px', marginLeft: '0.3vw' }}>
          {pcBadges.map((pc, idx) => (
            <span
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: pc.color || THEME.ACCENT
              }}
              title={pc.text || `PC ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Add Child Button */}
      {type !== 'subtopic' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAdd?.(type, item.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: THEME.ACCENT,
            cursor: 'pointer',
            padding: '0 0.2vw',
            fontSize: FONT.BUTTON,
            opacity: 0.6
          }}
          title={type === 'lo' ? 'Add Topic' : 'Add Subtopic'}
        >
          +
        </button>
      )}

      {/* Delete Button */}
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
          opacity: 0.6
        }}
        title="Delete"
      >
        ×
      </button>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

function ScalarDock({ width = '100%', height = '100%' }) {
  const {
    // Data
    scalarData,
    canonicalData,
    // Selection
    selection,
    select,
    startEditing,
    clearSelection,
    // Hierarchy navigation
    hierarchyNav,
    // Scalar operations
    addLearningObjective,
    addTopic,
    addSubtopic,
    updateScalarNode,
    deleteScalarNode,
    // Helpers
    getCanonicalTopicSerial,
    getCanonicalSubtopicSerial,
    getLinkedPCsWithColor,
    isItemHighlighted,
    // Current module
    currentModule
  } = useDesign()

  // Local expand state
  const [expandedItems, setExpandedItems] = useState(new Set())

  // Toggle expand for an item
  const toggleExpand = useCallback((itemId) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  // Get module data
  const module = useMemo(() => {
    return scalarData?.modules?.find(m => m.order === currentModule) || scalarData?.modules?.[0]
  }, [scalarData, currentModule])

  // Build tree data from canonical/scalar data
  const treeData = useMemo(() => {
    if (!module) return []

    const { los, topics, subtopics } = canonicalData
    const items = []

    // Get LOs for this module
    const moduleLOs = module.learningObjectives || []

    moduleLOs.forEach(lo => {
      // Check if filtered by hierarchy nav
      const isFiltered = hierarchyNav.filterId &&
        hierarchyNav.currentLevel > 1 &&
        hierarchyNav.filterId !== lo.id

      if (isFiltered) return

      items.push({
        type: 'lo',
        item: lo,
        serial: String(lo.order),
        indent: INDENT.LO,
        hasChildren: true
      })

      // Get topics for this LO
      const loTopics = Object.values(topics)
        .filter(t => t.loId === lo.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      if (expandedItems.has(lo.id)) {
        loTopics.forEach(topic => {
          // Check if filtered by hierarchy nav at topic level
          const isTopicFiltered = hierarchyNav.filterId &&
            hierarchyNav.currentLevel > 2 &&
            hierarchyNav.filterId !== topic.id

          if (isTopicFiltered) return

          const topicSerial = getCanonicalTopicSerial(topic.id)
          const topicSubtopics = Object.values(subtopics)
            .filter(s => s.topicId === topic.id)

          items.push({
            type: 'topic',
            item: topic,
            serial: topicSerial,
            indent: INDENT.TOPIC,
            hasChildren: topicSubtopics.length > 0
          })

          // Get subtopics for this topic
          if (expandedItems.has(topic.id)) {
            topicSubtopics
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .forEach(subtopic => {
                const subtopicSerial = getCanonicalSubtopicSerial(subtopic.id)

                items.push({
                  type: 'subtopic',
                  item: subtopic,
                  serial: subtopicSerial,
                  indent: INDENT.SUBTOPIC,
                  hasChildren: false
                })
              })
          }
        })
      }
    })

    // Add unlinked topics (x.N numbering)
    const unlinkedTopics = Object.values(topics)
      .filter(t => !t.loId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    if (unlinkedTopics.length > 0) {
      // Only show if not filtered to a specific LO
      const showUnlinked = !hierarchyNav.filterId || hierarchyNav.currentLevel <= 1

      if (showUnlinked) {
        unlinkedTopics.forEach(topic => {
          const topicSerial = getCanonicalTopicSerial(topic.id)
          const topicSubtopics = Object.values(subtopics)
            .filter(s => s.topicId === topic.id)

          items.push({
            type: 'topic',
            item: topic,
            serial: topicSerial,
            indent: INDENT.TOPIC,
            hasChildren: topicSubtopics.length > 0
          })

          if (expandedItems.has(topic.id)) {
            topicSubtopics
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .forEach(subtopic => {
                const subtopicSerial = getCanonicalSubtopicSerial(subtopic.id)

                items.push({
                  type: 'subtopic',
                  item: subtopic,
                  serial: subtopicSerial,
                  indent: INDENT.SUBTOPIC,
                  hasChildren: false
                })
              })
          }
        })
      }
    }

    return items
  }, [module, canonicalData, expandedItems, hierarchyNav, getCanonicalTopicSerial, getCanonicalSubtopicSerial])

  // Handlers
  const handleSelect = useCallback((type, id) => {
    select(type, id)
  }, [select])

  const handleEdit = useCallback((type, id) => {
    startEditing(type, id)
  }, [startEditing])

  const handleUpdate = useCallback((type, id, value) => {
    updateScalarNode(type, id, { title: value })
    select(type, id) // Exit edit mode
  }, [updateScalarNode, select])

  const handleAdd = useCallback((parentType, parentId) => {
    if (parentType === 'lo') {
      addTopic(parentId)
      // Auto-expand parent
      setExpandedItems(prev => new Set([...prev, parentId]))
    } else if (parentType === 'topic') {
      addSubtopic(parentId)
      setExpandedItems(prev => new Set([...prev, parentId]))
    }
  }, [addTopic, addSubtopic])

  const handleDelete = useCallback((type, id) => {
    deleteScalarNode(type, id)
  }, [deleteScalarNode])

  const handleAddLO = useCallback(() => {
    addLearningObjective(module?.id)
  }, [addLearningObjective, module])

  // Don't render if feature flag is disabled
  if (!CANONICAL_FLAGS.SCALAR_DOCK_ENABLED) {
    return null
  }

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background: THEME.BG_PANEL,
        borderRight: `1px solid ${THEME.BORDER}`,
        overflow: 'hidden'
      }}
      data-testid="scalar-dock"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 0.8vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          flexShrink: 0
        }}
      >
        <span
          style={{
            fontSize: FONT.HEADER,
            color: THEME.WHITE,
            fontFamily: THEME.FONT_PRIMARY,
            fontWeight: 500,
            letterSpacing: '0.05vw'
          }}
        >
          SCALAR
        </span>
        <button
          onClick={handleAddLO}
          style={{
            background: 'none',
            border: `1px solid ${THEME.ACCENT}`,
            color: THEME.ACCENT,
            cursor: 'pointer',
            padding: '0.3vh 0.5vw',
            fontSize: FONT.BUTTON,
            borderRadius: '2px'
          }}
          title="Add Learning Objective"
        >
          + LO
        </button>
      </div>

      {/* Tree Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5vh 0'
        }}
      >
        {treeData.length === 0 ? (
          <div
            style={{
              padding: '2vh 1vw',
              color: THEME.TEXT_DIM,
              fontSize: FONT.ITEM,
              fontStyle: 'italic',
              textAlign: 'center'
            }}
          >
            No items. Click + LO to add a Learning Objective.
          </div>
        ) : (
          treeData.map(({ type, item, serial, indent, hasChildren }) => (
            <TreeItem
              key={`${type}-${item.id}`}
              item={item}
              type={type}
              serial={serial}
              indent={indent}
              isSelected={selection.type === type && selection.id === item.id}
              isEditing={selection.type === type && selection.id === item.id && selection.mode === 'editing'}
              isHighlighted={isItemHighlighted(type, item.id)}
              hasChildren={hasChildren}
              isExpanded={expandedItems.has(item.id)}
              pcBadges={getLinkedPCsWithColor(type, item.id)}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onToggleExpand={toggleExpand}
              onAdd={handleAdd}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '0.4vh 0.8vw',
          borderTop: `1px solid ${THEME.BORDER}`,
          fontSize: FONT.BUTTON,
          color: THEME.TEXT_DIM,
          display: 'flex',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <span>{treeData.length} items</span>
        {hierarchyNav.filterId && (
          <span style={{ color: THEME.AMBER }}>Filtered</span>
        )}
      </div>
    </div>
  )
}

export default ScalarDock
