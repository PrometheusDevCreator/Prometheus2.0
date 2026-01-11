/**
 * WheelNav.jsx - Central Hierarchy Navigation Wheel
 *
 * PHASE 3 - WHEEL NAVIGATION
 *
 * A central navigation wheel for navigating the course hierarchy:
 * Module → Learning Objective → Topic → Subtopic → Lesson
 *
 * Visual Structure:
 * ┌─────────────────────────────────────────┐
 * │           BREADCRUMB PATH               │
 * │      Module 1 > LO 1.2 > Topic 1.2.1    │
 * ├─────────────────────────────────────────┤
 * │                                         │
 * │         ┌───────────────┐               │
 * │         │   CURRENT     │               │
 * │    ◄    │    LEVEL      │    ►          │
 * │         │   SELECTOR    │               │
 * │         └───────────────┘               │
 * │                                         │
 * │              ▲  ▼                       │
 * │         LEVEL CONTROLS                  │
 * └─────────────────────────────────────────┘
 *
 * Hierarchy Levels:
 * 0 - Module
 * 1 - Learning Objective
 * 2 - Topic
 * 3 - Subtopic
 * 4 - Lesson
 *
 * Keyboard Controls:
 * - Left/Right: Navigate siblings at current level
 * - Up: Go to parent level
 * - Down: Go to first child
 * - Enter: Select/activate current item
 * - Escape: Clear selection / go to root
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { THEME, ANIMATION } from '../constants/theme'

// ============================================
// HIERARCHY LEVEL DEFINITIONS
// ============================================
const HIERARCHY_LEVELS = [
  { id: 'module', label: 'MODULE', plural: 'MODULES', color: THEME.AMBER },
  { id: 'lo', label: 'LO', plural: 'LEARNING OBJECTIVES', color: '#4CAF50' },
  { id: 'topic', label: 'TOPIC', plural: 'TOPICS', color: '#2196F3' },
  { id: 'subtopic', label: 'SUBTOPIC', plural: 'SUBTOPICS', color: '#9C27B0' },
  { id: 'lesson', label: 'LESSON', plural: 'LESSONS', color: '#FF9800' }
]

// ============================================
// MAIN COMPONENT
// ============================================
function WheelNav({
  // Current selection state
  currentLevel = 0,           // 0-4 (module to lesson)
  currentPath = [],           // Array of { level, id, label } from root to current

  // Items at current level
  items = [],                 // Array of { id, label, serial?, hasChildren? }
  selectedItemId = null,      // Currently selected item ID

  // Navigation callbacks
  onSelectItem,               // (id) => void - Select item at current level
  onNavigateUp,               // () => void - Go to parent level
  onNavigateDown,             // (id) => void - Go into selected item's children
  onNavigateToLevel,          // (levelIndex) => void - Jump to specific level
  onBreadcrumbClick,          // (pathIndex) => void - Click on breadcrumb segment

  // Display options
  showBreadcrumbs = true,
  showLevelIndicator = true,
  showItemCount = true,
  compact = false,

  // Styling
  width = 400,
  height = 300
}) {
  const containerRef = useRef(null)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Get current level info
  const levelInfo = HIERARCHY_LEVELS[currentLevel] || HIERARCHY_LEVELS[0]
  const canGoUp = currentLevel > 0
  const canGoDown = items.some(item => item.hasChildren)

  // Find selected item index
  const selectedIndex = useMemo(() => {
    if (!selectedItemId) return -1
    return items.findIndex(item => item.id === selectedItemId)
  }, [items, selectedItemId])

  // Update focused index when selection changes
  useEffect(() => {
    if (selectedIndex >= 0) {
      setFocusedIndex(selectedIndex)
    }
  }, [selectedIndex])

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current?.contains(document.activeElement) &&
          document.activeElement !== containerRef.current) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(0, prev - 1))
          break

        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex(prev => Math.min(items.length - 1, prev + 1))
          break

        case 'ArrowUp':
          e.preventDefault()
          if (canGoUp) {
            onNavigateUp?.()
          }
          break

        case 'ArrowDown':
          e.preventDefault()
          if (canGoDown && selectedItemId) {
            onNavigateDown?.(selectedItemId)
          }
          break

        case 'Enter':
        case ' ':
          e.preventDefault()
          if (items[focusedIndex]) {
            onSelectItem?.(items[focusedIndex].id)
          }
          break

        case 'Escape':
          e.preventDefault()
          if (currentLevel > 0) {
            onNavigateToLevel?.(0)
          }
          break

        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break

        case 'End':
          e.preventDefault()
          setFocusedIndex(items.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, focusedIndex, canGoUp, canGoDown, selectedItemId, currentLevel, onSelectItem, onNavigateUp, onNavigateDown, onNavigateToLevel])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        width: compact ? 'auto' : width,
        minWidth: compact ? 200 : width,
        height: compact ? 'auto' : height,
        minHeight: compact ? 150 : height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: compact ? '1vh' : '2vh',
        background: THEME.BG_PANEL,
        border: `1px solid ${THEME.BORDER}`,
        borderRadius: '1vh',
        outline: 'none',
        gap: '1vh'
      }}
      role="navigation"
      aria-label="Course hierarchy navigation"
    >
      {/* Breadcrumb Path */}
      {showBreadcrumbs && currentPath.length > 0 && (
        <Breadcrumbs
          path={currentPath}
          onBreadcrumbClick={onBreadcrumbClick}
          compact={compact}
        />
      )}

      {/* Level Indicator */}
      {showLevelIndicator && (
        <LevelIndicator
          currentLevel={currentLevel}
          levelInfo={levelInfo}
          canGoUp={canGoUp}
          canGoDown={canGoDown}
          onNavigateUp={onNavigateUp}
          compact={compact}
        />
      )}

      {/* Main Selector Wheel */}
      <ItemSelector
        items={items}
        selectedItemId={selectedItemId}
        focusedIndex={focusedIndex}
        hoveredItem={hoveredItem}
        levelColor={levelInfo.color}
        onSelectItem={onSelectItem}
        onNavigateDown={onNavigateDown}
        onHover={setHoveredItem}
        compact={compact}
      />

      {/* Item Count */}
      {showItemCount && items.length > 0 && (
        <div
          style={{
            fontSize: compact ? '1.1vh' : '1.3vh',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_MONO
          }}
        >
          {items.length} {items.length === 1 ? levelInfo.label : levelInfo.plural}
        </div>
      )}

      {/* Navigation Controls */}
      <NavigationControls
        canGoUp={canGoUp}
        canGoDown={canGoDown && selectedItemId}
        selectedItem={items.find(i => i.id === selectedItemId)}
        onNavigateUp={onNavigateUp}
        onNavigateDown={() => selectedItemId && onNavigateDown?.(selectedItemId)}
        compact={compact}
      />
    </div>
  )
}

// ============================================
// BREADCRUMBS COMPONENT
// ============================================
function Breadcrumbs({ path, onBreadcrumbClick, compact }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5vw',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
      }}
      role="navigation"
      aria-label="Breadcrumb"
    >
      {path.map((segment, index) => {
        const isLast = index === path.length - 1
        const levelInfo = HIERARCHY_LEVELS[segment.level] || HIERARCHY_LEVELS[0]

        return (
          <div key={`${segment.level}-${segment.id}`} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => onBreadcrumbClick?.(index)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.3vh 0.5vw',
                borderRadius: '0.3vh',
                cursor: 'pointer',
                fontSize: compact ? '1.1vh' : '1.3vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: isLast ? levelInfo.color : THEME.TEXT_PRIMARY,
                fontWeight: isLast ? 500 : 400,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLast) e.currentTarget.style.background = THEME.BG_DARK
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {segment.serial ? `${segment.serial} ` : ''}{segment.label}
            </button>

            {!isLast && (
              <span style={{ color: THEME.TEXT_DIM, fontSize: compact ? '1.1vh' : '1.3vh' }}>
                {' > '}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// LEVEL INDICATOR COMPONENT
// ============================================
function LevelIndicator({ currentLevel, levelInfo, canGoUp, canGoDown, onNavigateUp, compact }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1vw'
      }}
    >
      {/* Up Arrow */}
      <button
        onClick={onNavigateUp}
        disabled={!canGoUp}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.3vh 0.5vw',
          fontSize: compact ? '1.5vh' : '2vh',
          color: canGoUp ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
          cursor: canGoUp ? 'pointer' : 'default',
          opacity: canGoUp ? 1 : 0.3,
          transition: 'color 0.15s ease'
        }}
        aria-label="Navigate up"
      >
        ▲
      </button>

      {/* Level Badge */}
      <div
        style={{
          padding: compact ? '0.5vh 1vw' : '0.8vh 1.5vw',
          background: `${levelInfo.color}20`,
          border: `1px solid ${levelInfo.color}`,
          borderRadius: '2vh',
          fontSize: compact ? '1.3vh' : '1.6vh',
          fontFamily: THEME.FONT_PRIMARY,
          fontWeight: 500,
          color: levelInfo.color,
          letterSpacing: '0.1vw',
          textTransform: 'uppercase'
        }}
      >
        {levelInfo.label}
      </div>

      {/* Down Arrow (placeholder for balance) */}
      <div
        style={{
          padding: '0.3vh 0.5vw',
          fontSize: compact ? '1.5vh' : '2vh',
          color: canGoDown ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
          opacity: canGoDown ? 1 : 0.3
        }}
      >
        ▼
      </div>
    </div>
  )
}

// ============================================
// ITEM SELECTOR COMPONENT
// ============================================
function ItemSelector({
  items,
  selectedItemId,
  focusedIndex,
  hoveredItem,
  levelColor,
  onSelectItem,
  onNavigateDown,
  onHover,
  compact
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '2vh',
          color: THEME.TEXT_DIM,
          fontSize: compact ? '1.2vh' : '1.4vh',
          fontFamily: THEME.FONT_PRIMARY,
          fontStyle: 'italic'
        }}
      >
        No items at this level
      </div>
    )
  }

  // Determine display mode based on item count
  const displayMode = items.length <= 5 ? 'buttons' : 'list'

  if (displayMode === 'buttons') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8vw',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
        role="listbox"
        aria-label="Items"
      >
        {items.map((item, index) => {
          const isSelected = item.id === selectedItemId
          const isFocused = index === focusedIndex
          const isHovered = item.id === hoveredItem

          return (
            <button
              key={item.id}
              onClick={() => onSelectItem?.(item.id)}
              onDoubleClick={() => item.hasChildren && onNavigateDown?.(item.id)}
              onMouseEnter={() => onHover?.(item.id)}
              onMouseLeave={() => onHover?.(null)}
              role="option"
              aria-selected={isSelected}
              style={{
                padding: compact ? '0.6vh 1vw' : '1vh 1.5vw',
                background: isSelected
                  ? `${levelColor}30`
                  : isHovered || isFocused
                    ? THEME.BG_DARK
                    : 'transparent',
                border: isSelected
                  ? `2px solid ${levelColor}`
                  : isFocused
                    ? `2px solid ${THEME.AMBER}`
                    : `1px solid ${THEME.BORDER}`,
                borderRadius: '0.5vh',
                fontSize: compact ? '1.2vh' : '1.4vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: isSelected ? levelColor : THEME.TEXT_PRIMARY,
                fontWeight: isSelected ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5vw'
              }}
            >
              {item.serial && (
                <span style={{ fontFamily: THEME.FONT_MONO, opacity: 0.7 }}>
                  {item.serial}
                </span>
              )}
              <span>{item.label}</span>
              {item.hasChildren && (
                <span style={{ fontSize: '0.9em', opacity: 0.5 }}>▸</span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // List mode for many items
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        border: `1px solid ${THEME.BORDER}`,
        borderRadius: '0.5vh',
        background: THEME.BG_DARK
      }}
      role="listbox"
      aria-label="Items"
    >
      {items.map((item, index) => {
        const isSelected = item.id === selectedItemId
        const isFocused = index === focusedIndex
        const isHovered = item.id === hoveredItem

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem?.(item.id)}
            onDoubleClick={() => item.hasChildren && onNavigateDown?.(item.id)}
            onMouseEnter={() => onHover?.(item.id)}
            onMouseLeave={() => onHover?.(null)}
            role="option"
            aria-selected={isSelected}
            style={{
              padding: compact ? '0.6vh 1vw' : '0.8vh 1.2vw',
              background: isSelected
                ? `${levelColor}20`
                : isHovered || isFocused
                  ? THEME.BG_PANEL
                  : 'transparent',
              borderLeft: isSelected
                ? `3px solid ${levelColor}`
                : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1vw',
              transition: 'all 0.1s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
              {item.serial && (
                <span
                  style={{
                    fontFamily: THEME.FONT_MONO,
                    fontSize: compact ? '1.1vh' : '1.2vh',
                    color: isSelected ? levelColor : THEME.TEXT_DIM,
                    minWidth: '3vw'
                  }}
                >
                  {item.serial}
                </span>
              )}
              <span
                style={{
                  fontSize: compact ? '1.2vh' : '1.3vh',
                  fontFamily: THEME.FONT_PRIMARY,
                  color: isSelected ? levelColor : THEME.TEXT_PRIMARY,
                  fontWeight: isSelected ? 500 : 400
                }}
              >
                {item.label}
              </span>
            </div>
            {item.hasChildren && (
              <span
                style={{
                  fontSize: '1vh',
                  color: THEME.TEXT_DIM
                }}
              >
                ▸
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// NAVIGATION CONTROLS COMPONENT
// ============================================
function NavigationControls({
  canGoUp,
  canGoDown,
  selectedItem,
  onNavigateUp,
  onNavigateDown,
  compact
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1vw',
        marginTop: 'auto'
      }}
    >
      {/* Back/Up Button */}
      <button
        onClick={onNavigateUp}
        disabled={!canGoUp}
        style={{
          padding: compact ? '0.5vh 1vw' : '0.8vh 1.5vw',
          background: canGoUp ? THEME.BG_DARK : 'transparent',
          border: `1px solid ${canGoUp ? THEME.BORDER_LIGHT : THEME.BORDER}`,
          borderRadius: '0.4vh',
          fontSize: compact ? '1.1vh' : '1.3vh',
          fontFamily: THEME.FONT_PRIMARY,
          color: canGoUp ? THEME.TEXT_PRIMARY : THEME.TEXT_DIM,
          cursor: canGoUp ? 'pointer' : 'default',
          opacity: canGoUp ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3vw',
          transition: 'all 0.15s ease'
        }}
      >
        <span>◄</span>
        <span>BACK</span>
      </button>

      {/* Drill Down Button */}
      <button
        onClick={onNavigateDown}
        disabled={!canGoDown}
        style={{
          padding: compact ? '0.5vh 1vw' : '0.8vh 1.5vw',
          background: canGoDown ? THEME.AMBER_DARK : 'transparent',
          border: `1px solid ${canGoDown ? THEME.AMBER : THEME.BORDER}`,
          borderRadius: '0.4vh',
          fontSize: compact ? '1.1vh' : '1.3vh',
          fontFamily: THEME.FONT_PRIMARY,
          color: canGoDown ? THEME.WHITE : THEME.TEXT_DIM,
          cursor: canGoDown ? 'pointer' : 'default',
          opacity: canGoDown ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3vw',
          transition: 'all 0.15s ease'
        }}
      >
        <span>DRILL</span>
        <span>►</span>
      </button>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================
export default WheelNav
export { HIERARCHY_LEVELS }
