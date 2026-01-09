# DESIGN Calm Wheel Survey Report

**Date:** 2025-01-10
**Branch:** `feature/design-calm-wheel`
**Author:** Claude Code (CC)
**Status:** SURVEY COMPLETE - AWAITING APPROVAL TO EXECUTE

---

## Executive Summary

This survey documents the current state of the DESIGN and BUILD pages, identifies why Scalar linking "doesn't work properly", and prepares the groundwork for implementing the "Calm Wheel with Dual Docks" architecture.

**Key Finding:** The Scalar linking fails due to **dual data stores** (`scalarData` + `canonicalData`) that update independently, combined with **lesson-local topics** that may or may not sync to Scalar. This creates state divergence and inconsistent numbering.

---

## 1. Component Inventory

### 1.1 Design Page Components (19 files)

| Component | Location | Purpose |
|-----------|----------|---------|
| `Design.jsx` | `pages/` | Main container, wraps with DesignProvider |
| `DesignNavBar.jsx` | `components/design/` | Tab navigation (OVERVIEW \| TIMETABLE \| SCALAR) |
| `OverviewWorkspace.jsx` | `components/design/overview/` | Container for overview canvas |
| `OverviewHeader.jsx` | `components/design/overview/` | Course info display (3 columns) |
| `OverviewCanvas.jsx` | `components/design/overview/` | Sketching area with learning blocks |
| `CourseLine.jsx` | `components/design/overview/` | Course timeline visualization |
| `LessonMarker.jsx` | `components/design/overview/` | Lesson markers on course line |
| `OverviewLessonCard.jsx` | `components/design/overview/` | Lesson cards in overview |
| `LearningBlock.jsx` | `components/design/overview/` | Draggable learning blocks |
| `TimetableWorkspace.jsx` | `components/design/` | Timetable view container |
| `TimetableGrid.jsx` | `components/design/` | Time-based grid display |
| `TimeControls.jsx` | `components/design/` | Time navigation controls |
| `LessonBlock.jsx` | `components/design/` | Draggable/resizable timetable card |
| `LessonCard.jsx` | `components/design/` | Library panel lesson card |
| `UnallocatedLessonsPanel.jsx` | `components/design/` | Unallocated lessons UI |
| `LessonEditor.jsx` | `components/design/` | Lesson editing panel |
| `ScalarWorkspace.jsx` | `components/design/` | Multi-column scalar container |
| `ScalarColumns.jsx` | `components/design/` | 4-column view (LOs, Lessons, Topics, PCs) |
| `ScalarTree.jsx` / `ScalarNode.jsx` | `components/design/` | Tree-based scalar view |

### 1.2 Build Page Components (5 files)

| Component | Location | Purpose |
|-----------|----------|---------|
| `Build.jsx` | `pages/` | Main container, wraps with DesignProvider |
| `BuildSelectorBar.jsx` | `components/build/` | Module/Lesson/Topic dropdowns |
| `BuildSlideTypeBar.jsx` | `components/build/` | Slide type selection |
| `BuildSlideNav.jsx` | `components/build/` | Slide navigation |
| `BuildContentColumns.jsx` | `components/build/` | 5 content columns |

### 1.3 Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `LessonEditorModal.jsx` | `components/` | Global lesson editor modal |
| `LessonEditorLozenge.jsx` | `components/` | Toggle button for editor modal |
| `StatusCircle.jsx` | `components/` | Reusable status indicator |

---

## 2. Lesson Card Implementations (4 Variants)

**CRITICAL:** These are NOT shared primitives - they are separate implementations.

| Variant | File | Context | Features |
|---------|------|---------|----------|
| **Library Card** | `LessonCard.jsx` | Library panel | Drag-to-schedule, type color, duration |
| **Timetable Block** | `LessonBlock.jsx` | Timetable grid | Drag-to-move, resize, inline edit, context menu |
| **Overview Card** | `OverviewLessonCard.jsx` | Overview canvas | Position-based, delete button |
| **Lesson Marker** | `LessonMarker.jsx` | Course line | Minimal, position indicator |

### Shared Properties Across Variants:
- `lesson.id`
- `lesson.title`
- `lesson.type` (maps to `LESSON_TYPES` for color)
- `lesson.duration`

### Variant-Specific Properties:
- `LessonBlock`: `startTime`, `day`, resize handles, context menu
- `LessonCard`: `saved` indicator, drag handle
- `OverviewLessonCard`: absolute positioning (`x`, `y`)

---

## 3. State Ownership Map

### 3.1 App.jsx (Top-Level)

```
App.jsx owns:
├── timetableData: { lessons[], overviewBlocks[] }
├── courseData: { title, code, duration, learningObjectives[], ... }
├── courseState: { startDate, saveCount }
├── lessonEditorOpen: boolean
├── editingLessonId: string | null
└── selectedLessonId: string | null
```

**Persistence:** State persists across page navigation (Define ↔ Design ↔ Build).

### 3.2 DesignContext (Design/Build Pages)

```
DesignContext owns:
├── Navigation
│   ├── activeTab: 'overview' | 'timetable' | 'scalar'
│   ├── viewMode: 'day' | 'week' | 'module'
│   └── currentModule, currentWeek, currentDay
│
├── Scalar Hierarchy (LEGACY)
│   └── scalarData: {
│       modules: [{
│         id, name, order, expanded,
│         learningObjectives: [{
│           id, verb, description, order, expanded,
│           topics: [{ id, title, order, expanded, subtopics: [...] }]
│         }]
│       }],
│       unlinkedTopics: [],
│       performanceCriteria: []
│     }
│
├── Canonical Data Store (NEWER)
│   └── canonicalData: {
│       los: { [loId]: { id, moduleId, verb, description, order } },
│       topics: { [topicId]: { id, loId|null, title, order } },
│       subtopics: { [subtopicId]: { id, topicId, title, order } },
│       lessonLOs: [], lessonTopics: [], lessonSubtopics: []
│     }
│
├── Selection
│   ├── selection: { type, id, mode }
│   ├── highlightedItems: { los, topics, subtopics, lessons }
│   └── multiSelection: { items[], active }
│
├── Linking
│   ├── linkingSource: { type, id, name } | null
│   └── sessionLinkedElements: []
│
└── Build Page
    └── buildSelection: { moduleId, lessonId, topicId, slideIndex }
```

### 3.3 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.jsx                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │ timetableData   │  │ courseData      │  │ courseState    │   │
│  │ ├─ lessons[]    │  │ ├─ title        │  │ ├─ saveCount   │   │
│  │ └─ overview[]   │  │ └─ LOs[]        │  │ └─ startDate   │   │
│  └────────┬────────┘  └────────┬────────┘  └────────────────┘   │
│           │                    │                                 │
│           ▼                    ▼                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              DesignProvider (wraps Design & Build)          │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                   │ │
│  │  │ scalarData      │  │ canonicalData   │  ← DUAL STORES!   │ │
│  │  │ (nested)        │  │ (normalized)    │                   │ │
│  │  └────────┬────────┘  └────────┬────────┘                   │ │
│  │           │                    │                             │ │
│  │           └──────────┬─────────┘                             │ │
│  │                      ▼                                       │ │
│  │              ⚠️ SYNC GAP ⚠️                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. SCALAR LINKING DIAGNOSIS

### 4.1 Root Cause: Dual Data Stores

The system maintains **two separate representations** of the same hierarchy:

| Store | Structure | Used By |
|-------|-----------|---------|
| `scalarData` | Nested (modules > LOs > topics > subtopics) | ScalarWorkspace, ScalarColumns |
| `canonicalData` | Normalized maps (los{}, topics{}, subtopics{}) | Serial number computation |

**Problem:** These stores update independently via separate `useState` calls.

### 4.2 Evidence: `toggleTopicLOLink()` (DesignContext.jsx:716-831)

```javascript
// Line 719: Update canonical store FIRST
setCanonicalData(prev => {
  // ... modifies prev.topics[topicId].loId
  return { ...prev, topics: newTopics }
})

// Line 764: THEN update legacy scalarData SEPARATELY
setScalarData(prev => {
  // ... separate logic to find and move topic
  return newData
})
```

**Issue:** Two independent state updates that may not complete atomically. React batching helps, but logic divergence can occur.

### 4.3 Evidence: Topic Numbering Inconsistencies

Three different methods compute topic numbers:

1. **`computeTopicSerial()`** (DesignContext.jsx:64-85) - Canonical store method
2. **`calculateTopicNumber()`** (DesignContext.jsx:665-674) - Legacy method
3. **Inline computation** (ScalarColumns.jsx:887-891) - Fallback in component

```javascript
// ScalarColumns.jsx:887-891
const topicNumber = getCanonicalTopicSerial
  ? getCanonicalTopicSerial(topic.id)
  : (topic.loOrder != null
      ? `${topic.loOrder}.${topic.order}`
      : `x.${topic.order || 1}`)
```

**Issue:** If `getCanonicalTopicSerial` fails to find the topic (ID mismatch), fallback uses different data.

### 4.4 Evidence: Lesson Topics vs Scalar Topics

When adding a topic via LessonEditor:

```javascript
// DesignContext.jsx:1006-1145
const addTopicToLesson = useCallback((lessonId, topicTitle) => {
  const lessonTopicId = `topic-lesson-${timestamp}`
  const scalarTopicId = `topic-scalar-${timestamp}`

  // Creates topic in lesson with scalarTopicId reference
  // Creates topic in scalarData with scalarTopicId as its ID
  // BUT: canonicalData is NOT updated here!
})
```

**Issue:** New topics from LessonEditor exist in `lessons[].topics` and `scalarData`, but NOT in `canonicalData`.

### 4.5 Evidence: ScalarColumns Topic Merging (ScalarColumns.jsx:95-193)

```javascript
// ScalarColumns.jsx:89-90
const scalarTopics = [...linkedScalarTopics, ...unlinkedScalarTopics]

// ScalarColumns.jsx:95-193 - lessonTopics computed separately
const lessonTopics = useMemo(() => {
  const scalarTopicIds = new Set(scalarTopics.map(t => t.id))
  // ... finds topics in lessons NOT in scalar
})

// ScalarColumns.jsx:196
const allTopics = [...scalarTopics, ...lessonTopics]
```

**Issue:** This merging can produce duplicate-looking entries if IDs don't match exactly.

### 4.6 Summary of Failure Modes

| Mode | Trigger | Symptom |
|------|---------|---------|
| **State Divergence** | SHIFT+click linking | canonicalData and scalarData show different topic-LO associations |
| **Missing Canonical Entry** | Add topic via LessonEditor | Topic shows in Scalar but `getCanonicalTopicSerial()` returns `?.?` |
| **ID Mismatch** | Topic created with `scalarTopicId` reference | Duplicate topics appear in merged `allTopics` |
| **Order Drift** | Reordering topics | `topic.order` in scalarData may not match canonical computed order |

---

## 5. Architectural Issues for Calm Wheel Design

### 5.1 Current Pain Points

1. **No Single Source of Truth** - Scalar data exists in 3 places (scalarData, canonicalData, lesson.topics)
2. **Tab-Based Fragmentation** - OVERVIEW, TIMETABLE, SCALAR are siloed views with weak cross-linking
3. **Multiple Lesson Card Implementations** - 4 separate components, not reusable
4. **State Scattered Across Providers** - App.jsx + DesignContext split responsibility awkwardly

### 5.2 What Option A (Dual Docks) Must Address

| Requirement | Current State | Required Change |
|-------------|---------------|-----------------|
| Single source of truth | 3 stores | Consolidate to canonical store only |
| WheelNav as selector only | N/A (no wheel) | New component, stateless navigation |
| Shared Lesson Cards | 4 implementations | Extract to `<LessonCard variant="..." />` |
| ScalarDock with live editing | ScalarColumns has editing | Extract to dock with immediate sync |
| WorkDock tabs | Tab bar exists | Refactor into dock pattern |

---

## 6. Files Requiring Modification

### 6.1 Critical Path (Must Change)

| File | Change Type | Rationale |
|------|-------------|-----------|
| `DesignContext.jsx` | REFACTOR | Eliminate `scalarData`, use `canonicalData` only |
| `ScalarColumns.jsx` | REFACTOR | Remove lessonTopics merging, read from canonical only |
| `Design.jsx` | REFACTOR | New layout: WheelNav + ScalarDock + WorkDock |
| `LessonBlock.jsx` | EXTRACT | Create shared `<LessonCard>` primitive |
| `LessonCard.jsx` | MERGE | Into shared primitive |

### 6.2 Secondary (Should Change)

| File | Change Type | Rationale |
|------|-------------|-----------|
| `Build.jsx` | UPDATE | Use shared LessonCard primitive |
| `App.jsx` | SIMPLIFY | Remove redundant state if lifted to context |
| `ScalarWorkspace.jsx` | DEPRECATE | Replace with ScalarDock |
| `TimetableWorkspace.jsx` | REFACTOR | Move into WorkDock |

### 6.3 New Files Required

| File | Purpose |
|------|---------|
| `components/WheelNav.jsx` | Central hierarchy navigation wheel |
| `components/ScalarDock.jsx` | Left dock with tree, search, editor |
| `components/WorkDock.jsx` | Right dock with Lesson Cards, Timetable tabs |
| `components/LessonCardPrimitive.jsx` | Shared lesson card component |

---

## 7. Recommended Execution Phases

### Phase 1: Foundation (No UI Change)
- Consolidate data stores (eliminate scalarData, canonicalData only)
- Ensure all topic/subtopic operations use canonical store
- Add comprehensive debug logging

### Phase 2: Shared Primitives
- Extract LessonCard into shared primitive
- Create variants: `library`, `timetable`, `overview`, `compact`
- Update all consumers

### Phase 3: WheelNav Component
- Build central wheel for hierarchy navigation
- Implement breadcrumbs
- Add keyboard accessibility

### Phase 4: Dock Layout
- Create ScalarDock (left)
- Create WorkDock (right)
- Wire to WheelNav

### Phase 5: Integration
- Replace Design.jsx layout
- Update Build.jsx to use shared components
- Verify data consistency

### Phase 6: Testing
- MTs per component
- ITs per phase
- SOC for full flow

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| State migration breaks existing data | HIGH | HIGH | Add migration layer, preserve old keys |
| Wheel navigation confuses users | MEDIUM | MEDIUM | Clear breadcrumbs, keyboard support |
| Performance regression on large courses | MEDIUM | HIGH | Profile before/after, optimize canonical lookups |
| Build page breaks during refactor | HIGH | MEDIUM | Maintain DesignProvider interface |

---

## 9. Approval Checklist

Before proceeding to execution:

- [ ] Founder confirms understanding of Scalar linking issues
- [ ] Phase sequence approved
- [ ] Risk mitigations acceptable
- [ ] Branch `feature/design-calm-wheel` is correct starting point

---

**STOP RULE IN EFFECT**

This survey is complete. No coding will begin until explicit approval is received.

---

*Survey prepared by Claude Code (CC) for Controller (Sarah) review.*
*Report generated: 2025-01-10*
