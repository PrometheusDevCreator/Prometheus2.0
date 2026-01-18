# Phase 4: Integration Contract

**Version:** 1.0
**Date:** 2025-01-10
**Author:** Claude Code (CC)
**Status:** PENDING APPROVAL

---

## 1. Executive Summary

This contract defines the integration architecture for Phase 4 of the Calm Wheel implementation:

| Component | Purpose | Replaces |
|-----------|---------|----------|
| **WheelNav** | Hierarchy navigation (5 levels) | New component |
| **ScalarDock** | Tree editing dock (left) | ScalarWorkspace (SCALAR tab) |
| **WorkDock** | Content display dock (right) | TimetableWorkspace (feature-flagged) |

**Layout Target:** WheelNav collapsible at ~20-25% width, docks fill remaining space.

---

## 2. Layout Specification

### 2.1 Viewport Division

```
┌─────────────────────────────────────────────────────────────────────┐
│ DESIGN NAV BAR (existing)                                           │
├────────────┬───────────────────────────────────────────────────────┤
│            │                                                        │
│  WHEELNAV  │              MAIN WORKSPACE                            │
│   (LEFT)   │                                                        │
│            │  ┌──────────────────┬──────────────────────────────┐  │
│  ~20-25%   │  │   SCALAR DOCK    │         WORK DOCK            │  │
│   width    │  │     (LEFT)       │         (RIGHT)               │  │
│            │  │                  │                               │  │
│ collapsible│  │   ~40% width     │        ~60% width             │  │
│            │  │                  │                               │  │
│            │  │   Tree editing   │     Content display           │  │
│            │  │                  │                               │  │
│            │  └──────────────────┴──────────────────────────────┘  │
│            │                                                        │
├────────────┴───────────────────────────────────────────────────────┤
│ FOOTER (existing)                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Width Allocations

| Component | Expanded | Collapsed |
|-----------|----------|-----------|
| WheelNav | 20-25% (~380-470px at 1890px) | ~40px (icon only) |
| ScalarDock | ~40% of remaining | ~40% of remaining |
| WorkDock | ~60% of remaining | ~60% of remaining |

### 2.3 Collapse Behavior

- **WheelNav collapse:** Reduces to thin strip with expand icon
- **ScalarDock:** Always visible when on SCALAR tab
- **WorkDock:** Visible when feature flag enabled

```javascript
// Collapse state
const [wheelNavCollapsed, setWheelNavCollapsed] = useState(false)

// Width calculation
const wheelNavWidth = wheelNavCollapsed ? 40 : '22%'
const workspaceWidth = wheelNavCollapsed ? 'calc(100% - 40px)' : '78%'
```

---

## 3. Selection Ownership Model

### 3.1 Single Selection Source of Truth

Selection state lives in `DesignContext`. All components read from and write to this single source.

```javascript
// Current selection state (from DesignContext)
const [selection, setSelection] = useState({
  type: 'lesson',       // 'module' | 'lo' | 'topic' | 'subtopic' | 'lesson' | null
  id: null,             // ID of selected item
  mode: 'selected'      // 'selected' | 'editing'
})
```

### 3.2 Hierarchy Selection (New)

For WheelNav, we need additional navigation state:

```javascript
// New: Hierarchy navigation state
const [hierarchyNav, setHierarchyNav] = useState({
  currentLevel: 0,      // 0=module, 1=lo, 2=topic, 3=subtopic, 4=lesson
  path: [],             // Breadcrumb: [{ level, id, label, serial }]
  filterId: null        // ID of item filtering lower levels
})
```

### 3.3 Selection Flow

```
User clicks in WheelNav
        │
        ▼
WheelNav.onSelectItem(id)
        │
        ▼
DesignContext.select(type, id)
        │
        ├──────────────────────────────────┐
        ▼                                  ▼
ScalarDock highlights                WorkDock filters
matching tree node                   to show related content
```

### 3.4 Selection Rules

| Action | Selection Effect | HierarchyNav Effect |
|--------|------------------|---------------------|
| Click item in WheelNav | `selection = { type, id, mode: 'selected' }` | `filterId = id` |
| Double-click/drill in WheelNav | No change to selection | `currentLevel++`, `path.push(item)` |
| Click BACK in WheelNav | No change to selection | `currentLevel--`, `path.pop()` |
| Click breadcrumb | `selection = { type: crumb.type, id: crumb.id }` | Navigate to crumb level |
| Click in ScalarDock | `selection = { type, id }` | Sync WheelNav path to match |
| Click in WorkDock | `selection = { type: 'lesson', id }` | No hierarchyNav change |

---

## 4. Data Flow Specification

### 4.1 Data Sources

All data flows from `DesignContext`:

```javascript
// Canonical data (source of truth)
const { canonicalData } = useDesign()

// Derived views
const { scalarData, effectiveScalarData } = useDesign()

// Lessons
const { lessons, scheduledLessons, unscheduledLessons } = useDesign()
```

### 4.2 WheelNav Data Flow

```javascript
// WheelNav receives filtered items based on current level and parent selection
function getWheelNavItems(level, parentId) {
  const { canonicalData } = useDesign()
  const { los, topics, subtopics } = canonicalData

  switch (level) {
    case 0: // Module
      return [{ id: 'module-1', label: 'Module 1', serial: '1', hasChildren: true }]

    case 1: // LO
      return Object.values(los)
        .sort((a, b) => a.order - b.order)
        .map(lo => ({
          id: lo.id,
          label: lo.description,
          serial: String(lo.order),
          hasChildren: Object.values(topics).some(t => t.loId === lo.id)
        }))

    case 2: // Topic
      const filteredTopics = Object.values(topics)
        .filter(t => !parentId || t.loId === parentId)
        .sort((a, b) => a.order - b.order)
      return filteredTopics.map(t => ({
        id: t.id,
        label: t.title,
        serial: computeTopicSerial(t, los, topics),
        hasChildren: Object.values(subtopics).some(s => s.topicId === t.id)
      }))

    case 3: // Subtopic
      const filteredSubtopics = Object.values(subtopics)
        .filter(s => !parentId || s.topicId === parentId)
        .sort((a, b) => a.order - b.order)
      return filteredSubtopics.map(s => ({
        id: s.id,
        label: s.title,
        serial: computeSubtopicSerial(s, topics, los, subtopics),
        hasChildren: lessons.some(l => l.subtopicId === s.id)
      }))

    case 4: // Lesson
      return lessons
        .filter(l => !parentId || l.subtopicId === parentId)
        .map(l => ({
          id: l.id,
          label: l.title,
          serial: null, // Lessons don't have serial numbers
          hasChildren: false
        }))
  }
}
```

### 4.3 ScalarDock Data Flow

```javascript
// ScalarDock receives full tree, filtered by hierarchyNav.filterId
function getScalarDockData(filterId, filterLevel) {
  const { scalarData, canonicalData } = useDesign()

  if (!filterId) {
    // No filter: show full tree
    return scalarData
  }

  // Filter tree to show only descendants of filterId
  return filterTreeByAncestor(scalarData, filterId, filterLevel)
}
```

### 4.4 WorkDock Data Flow

```javascript
// WorkDock receives lessons filtered by selection
function getWorkDockLessons(selection, hierarchyNav) {
  const { lessons } = useDesign()

  if (hierarchyNav.currentLevel === 4) {
    // At lesson level: show selected lesson details
    return lessons.filter(l => l.id === selection.id)
  }

  if (hierarchyNav.filterId) {
    // Filter lessons by hierarchy selection
    return filterLessonsByHierarchy(lessons, hierarchyNav)
  }

  // Default: show all lessons for current week/day
  return lessons
}
```

---

## 5. Component Boundaries

### 5.1 WheelNav (Phase 3 - Complete)

**Responsibility:** Hierarchy navigation only (stateless selector)

**Inputs:**
- `currentLevel`, `currentPath`, `items`, `selectedItemId`

**Outputs:**
- `onSelectItem`, `onNavigateUp`, `onNavigateDown`, `onBreadcrumbClick`

**Does NOT:**
- Manage its own state
- Directly modify data
- Handle editing

### 5.2 ScalarDock (Phase 4 - New)

**Responsibility:** Tree view with inline editing

**Features:**
- Displays LO → Topic → Subtopic tree
- Inline title editing
- Add/delete operations
- Cross-highlights with WheelNav selection
- PC badge display

**Inputs:**
- `treeData` (filtered by WheelNav selection)
- `selection` (from DesignContext)
- `onSelect`, `onEdit`, `onAdd`, `onDelete`

**Replaces:** `ScalarWorkspace` (SCALAR tab functionality)

### 5.3 WorkDock (Phase 4 - New)

**Responsibility:** Content display based on hierarchy context

**Features:**
- Lesson card display (using `LessonCardPrimitive`)
- Drag/drop for scheduling
- Context menu actions
- Time-based view when at lesson level

**Inputs:**
- `lessons` (filtered by hierarchy)
- `selection` (from DesignContext)
- Timetable configuration (startHour, endHour)

**Replaces:** `TimetableWorkspace` (feature-flagged, progressive)

**LessonCardPrimitive Requirement:**
All lesson displays in WorkDock MUST use `LessonCardPrimitive`. No new legacy consumers.

---

## 6. Feature Flag Strategy

### 6.1 New Flags

```javascript
// In canonicalAdapter.js
export const CANONICAL_FLAGS = {
  // Existing
  WRITE_TO_CANONICAL: true,
  READ_FROM_CANONICAL: true,
  DERIVE_LEGACY: true,
  LEGACY_STORE_REMOVED: false,
  DEBUG_LOGGING: true,

  // New for Phase 4
  WHEEL_NAV_ENABLED: true,       // Enable WheelNav component
  SCALAR_DOCK_ENABLED: true,     // Enable ScalarDock (replaces SCALAR tab)
  WORK_DOCK_ENABLED: false,      // Enable WorkDock (feature-flagged)
  WORK_DOCK_PROGRESSIVE: true    // Show WorkDock alongside TimetableWorkspace
}
```

### 6.2 Rollout Strategy

| Phase | WHEEL_NAV | SCALAR_DOCK | WORK_DOCK | WORK_DOCK_PROGRESSIVE |
|-------|-----------|-------------|-----------|----------------------|
| 4a | true | true | false | - |
| 4b | true | true | true | true |
| 4c | true | true | true | false |

### 6.3 Progressive WorkDock Replacement

When `WORK_DOCK_PROGRESSIVE = true`:

```javascript
// In Design.jsx or DesignPageContent
{activeTab === 'timetable' && (
  <>
    {CANONICAL_FLAGS.WORK_DOCK_ENABLED && CANONICAL_FLAGS.WORK_DOCK_PROGRESSIVE && (
      <WorkDock />
    )}
    <TimetableWorkspace />
  </>
)}
```

When `WORK_DOCK_PROGRESSIVE = false`:

```javascript
{activeTab === 'timetable' && (
  CANONICAL_FLAGS.WORK_DOCK_ENABLED
    ? <WorkDock />
    : <TimetableWorkspace />
)}
```

---

## 7. State Additions to DesignContext

### 7.1 New State

```javascript
// Add to DesignProvider
const [hierarchyNav, setHierarchyNav] = useState({
  currentLevel: 0,
  path: [],
  filterId: null
})

const [wheelNavCollapsed, setWheelNavCollapsed] = useState(false)
```

### 7.2 New Actions

```javascript
// Navigate hierarchy down
const navigateDown = useCallback((itemId) => {
  const { currentLevel, path } = hierarchyNav
  const item = getCurrentLevelItem(itemId)

  setHierarchyNav({
    currentLevel: currentLevel + 1,
    path: [...path, { level: currentLevel, id: itemId, label: item.label, serial: item.serial }],
    filterId: itemId
  })
}, [hierarchyNav])

// Navigate hierarchy up
const navigateUp = useCallback(() => {
  const { currentLevel, path } = hierarchyNav
  if (currentLevel === 0) return

  const newPath = path.slice(0, -1)
  const parentItem = newPath[newPath.length - 1]

  setHierarchyNav({
    currentLevel: currentLevel - 1,
    path: newPath,
    filterId: parentItem?.id || null
  })
}, [hierarchyNav])

// Navigate to specific level (breadcrumb click)
const navigateToLevel = useCallback((level) => {
  const { path } = hierarchyNav
  const newPath = path.slice(0, level)
  const targetItem = newPath[newPath.length - 1]

  setHierarchyNav({
    currentLevel: level,
    path: newPath,
    filterId: targetItem?.id || null
  })
}, [hierarchyNav])

// Toggle WheelNav collapse
const toggleWheelNav = useCallback(() => {
  setWheelNavCollapsed(prev => !prev)
}, [])
```

### 7.3 Context Value Additions

```javascript
// Add to context value
const value = useMemo(() => ({
  // ... existing values

  // Hierarchy navigation
  hierarchyNav,
  navigateDown,
  navigateUp,
  navigateToLevel,

  // WheelNav state
  wheelNavCollapsed,
  toggleWheelNav
}), [/* deps */])
```

---

## 8. File Creation Plan

| File | Purpose | Priority |
|------|---------|----------|
| `ScalarDock.jsx` | Tree editing dock | P0 |
| `ScalarDock.test.jsx` | Unit tests | P0 |
| `WorkDock.jsx` | Content display dock | P1 |
| `WorkDock.test.jsx` | Unit tests | P1 |
| `DesignContext.jsx` (update) | Add hierarchy state | P0 |
| `Design.jsx` (update) | Integrate new layout | P0 |
| `canonicalAdapter.js` (update) | Add new flags | P0 |

---

## 9. Test Requirements

### 9.1 ScalarDock Tests

- Renders tree structure
- Highlights selected item
- Filters by hierarchy selection
- Inline editing triggers onEdit
- Add button creates new item
- Delete button removes item
- PC badges display correctly

### 9.2 WorkDock Tests

- Renders lesson cards using LessonCardPrimitive
- Filters lessons by hierarchy selection
- Drag/drop schedules lesson
- Context menu actions work
- Respects feature flag

### 9.3 Integration Tests

- WheelNav selection updates ScalarDock highlight
- WheelNav navigation updates WorkDock filter
- ScalarDock selection syncs WheelNav path
- Selection persists across tab switches

---

## 10. Success Criteria

Phase 4 is complete when:

- [ ] ScalarDock replaces SCALAR tab functionality
- [ ] WorkDock renders with feature flag
- [ ] WheelNav integrates with new layout (~20-25% width, collapsible)
- [ ] Selection flows correctly between all components
- [ ] All new lesson displays use LessonCardPrimitive
- [ ] Unit tests pass for new components
- [ ] Build succeeds
- [ ] No regression in existing functionality

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ScalarDock regression | Preserve ScalarColumns internals, wrap in new container |
| TimetableWorkspace breakage | Feature flag progressive rollout |
| Selection state complexity | Clear ownership rules (Section 3) |
| Performance with large trees | Virtualize lists if >100 items |

---

## 12. Approval Checklist

- [ ] Layout specification approved
- [ ] Selection ownership model approved
- [ ] Data flow specification approved
- [ ] Feature flag strategy approved
- [ ] File creation plan approved
- [ ] Test requirements approved

---

**STOP RULE IN EFFECT** — Awaiting contract approval before JSX implementation.

---

*Contract prepared by Claude Code (CC)*
*Date: 2025-01-10*
