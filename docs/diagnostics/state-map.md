# State Map - Prometheus 2.0

**Version:** 1.0
**Created:** 2025-01-18
**Purpose:** Document all state stores, readers, writers, and rehydration points as-built
**Status:** DIAGNOSTIC - Phase 1 Task Order

---

## Executive Summary

The codebase has **multiple overlapping state stores** for course hierarchy data, creating synchronization issues and potential data loss. The architecture appears to be in a partial migration state (Phase M3) but with non-compliant write paths.

---

## 1. Primary State Stores

### 1.1 App.jsx State (Global Application State)

| State Variable | Type | Purpose | Location |
|----------------|------|---------|----------|
| `isAuthenticated` | boolean | Login state | App.jsx:62 |
| `currentUser` | object | User data | App.jsx:63 |
| `currentPage` | string | Current page route | App.jsx:66 |
| `showDebugGrid` | boolean | Debug grid visibility | App.jsx:70 |
| `courseData` | object | Course metadata | App.jsx:73-89 |
| `courseLoaded` | boolean | Course load status | App.jsx:90 |
| `timetableData` | object | **Lessons + hierarchyData** | App.jsx:94-118 |
| `courseState` | object | Save tracking | App.jsx:121-124 |
| `exitPending` | boolean | Exit workflow state | App.jsx:129 |
| `lessonEditorOpen` | boolean | Modal visibility | App.jsx:132 |
| `editingLessonId` | string | Modal target lesson | App.jsx:133 |
| `selectedLessonId` | string | Selected lesson | App.jsx:136 |

#### 1.1.1 courseData Structure
```javascript
{
  title: '',
  thematic: '',
  module: 0,
  moduleTitles: [],
  code: '',
  duration: 1,
  durationUnit: 'Hours',
  level: 'Foundational',
  seniority: 'All',
  description: '',
  deliveryModes: [],
  qualification: false,
  accredited: false,
  certified: false,
  learningObjectives: ['']  // STRING array (not objects)
}
```

#### 1.1.2 timetableData Structure
```javascript
{
  lessons: [{ id, title, type, duration, topics[], learningObjectives[], ... }],
  overviewBlocks: [],
  hierarchyData: {
    los: {},        // Duplicates canonicalData.los
    topics: {},     // Duplicates canonicalData.topics
    subtopics: {}   // Duplicates canonicalData.subtopics
  }
}
```

---

### 1.2 DesignContext.jsx State (Design Section State)

| State Variable | Type | Purpose | Location |
|----------------|------|---------|----------|
| `activeTab` | string | 'overview'\|'timetable'\|'scalar' | DesignContext.jsx:275 |
| `viewMode` | string | 'day'\|'week'\|'module' | DesignContext.jsx:276 |
| `currentModule` | number | Current module index | DesignContext.jsx:277 |
| `currentWeek` | number | Current week index | DesignContext.jsx:278 |
| `currentDay` | number | Current day index | DesignContext.jsx:279 |
| `scalarData` | object | **Legacy nested hierarchy** | DesignContext.jsx:447-461 |
| `canonicalData` | object | **Normalized hierarchy (AUTHORITATIVE)** | DesignContext.jsx:468-476 |
| `highlightedItems` | object | Cross-column highlights | DesignContext.jsx:662-667 |
| `multiSelection` | object | Multi-select state | DesignContext.jsx:672-675 |
| `buildSelection` | object | Build page selection | DesignContext.jsx:680-685 |
| `linkingSource` | object | Link mode source | DesignContext.jsx:724 |
| `sessionLinkedElements` | array | Session link tracking | DesignContext.jsx:725 |
| `selection` | object | Current selection | DesignContext.jsx:759-763 |
| `hierarchyNav` | object | WheelNav state | DesignContext.jsx:768-772 |
| `wheelNavCollapsed` | boolean | Nav collapse state | DesignContext.jsx:774 |
| `editorCollapsed` | boolean | Editor panel state | DesignContext.jsx:779 |

#### 1.2.1 scalarData Structure (LEGACY)
```javascript
{
  modules: [{
    id, name, order, expanded,
    learningObjectives: [{
      id, verb, description, order, expanded,
      topics: [{
        id, title, order, loId, expanded,
        subtopics: [{ id, title, order }]
      }]
    }]
  }],
  unlinkedTopics: [{ id, title, order, subtopics[] }],
  performanceCriteria: []
}
```

#### 1.2.2 canonicalData Structure (AUTHORITATIVE)
```javascript
{
  los: { [id]: { id, moduleId, verb, description, order } },
  topics: { [id]: { id, loId, title, order, expanded } },
  subtopics: { [id]: { id, topicId, title, order } },
  lessonLOs: [{ lessonId, loId, isPrimary }],
  lessonTopics: [{ lessonId, topicId }],
  lessonSubtopics: [{ lessonId, subtopicId }]
}
```

---

### 1.3 Other Context State

| Context | State | Purpose | Location |
|---------|-------|---------|----------|
| `TemplateContext` | Template state | FORMAT page templates | contexts/TemplateContext.jsx |
| `GridContext` | Grid overlay | Debug grid state | components/DevTools/GridContext.jsx |

---

## 2. Readers (Who Consumes Each Store)

### 2.1 courseData Readers

| Consumer | Read Path | Purpose |
|----------|-----------|---------|
| Header.jsx | `courseData.title` | Display course title |
| Define.jsx | All fields | Form population |
| LessonEditorModal.jsx | `enrichedCourseData.learningObjectives` | LO dropdown |
| enrichedCourseData (App.jsx) | Transforms to objects | Combines with hierarchyData |

### 2.2 timetableData Readers

| Consumer | Read Path | Purpose |
|----------|-----------|---------|
| DesignContext.jsx | `timetableData.lessons` | Lesson list |
| DesignContext.jsx | `timetableData.overviewBlocks` | Overview blocks |
| LessonEditorModal.jsx | `timetableData.hierarchyData` | Topic/Subtopic dropdowns |
| App.jsx | `timetableData.hierarchyData.los` | enrichedCourseData |
| App.jsx | `timetableData.hierarchyData.topics` | enrichedCourseData |
| App.jsx | `timetableData.hierarchyData.subtopics` | enrichedCourseData |

### 2.3 scalarData Readers

| Consumer | Read Path | Purpose |
|----------|-----------|---------|
| ScalarDock.jsx | `effectiveScalarData` | Hierarchy tree display |
| ScalarColumns.jsx | `effectiveScalarData` | Column-based display |
| WheelNav.jsx | `effectiveScalarData` | Hierarchy navigation |

### 2.4 canonicalData Readers

| Consumer | Read Path | Purpose |
|----------|-----------|---------|
| DesignContext (internal) | `canonicalData.los`, etc. | Serial computation |
| derivedScalarData (computed) | Full canonical | Derive legacy format |
| sync effect | Full canonical | Push to hierarchyData |

---

## 3. Writers (Who Mutates Each Store)

### 3.1 courseData Writers

| Writer | Function | Trigger |
|--------|----------|---------|
| Define.jsx | `setCourseData` | Form field changes |
| App.jsx | `handleSystemClear` | CLEAR button |

### 3.2 timetableData Writers

| Writer | Function | Trigger | **VIOLATION** |
|--------|----------|---------|---------------|
| DesignContext.jsx | `setLessons` wrapper | Lesson CRUD | OK |
| DesignContext.jsx | sync effect | canonicalData changes | OK |
| **App.jsx** | `handleAddTopic` | Modal "+" button | **BYPASSES CANONICAL** |
| **App.jsx** | `handleAddSubtopic` | Modal "+" button | **BYPASSES CANONICAL** |
| **App.jsx** | `handleAddPC` | Modal "+" button | **BYPASSES CANONICAL** |
| App.jsx | `handleSystemClear` | CLEAR button | OK (full reset) |
| App.jsx | `handleCreateLesson` | Modal create | OK |
| App.jsx | `handleUpdateLesson` | Modal save | OK |

### 3.3 scalarData Writers

| Writer | Function | Trigger |
|--------|----------|---------|
| DesignContext.jsx | `setScalarData` | Legacy compatibility writes |
| DesignContext.jsx | courseData sync effect | LO changes from DEFINE |
| DesignContext.jsx | `toggleTopicLOLink` | Link mode (dual write) |
| DesignContext.jsx | `unlinkTopic` | Unlink action |
| DesignContext.jsx | `linkTopicToLO` | Link action |

### 3.4 canonicalData Writers

| Writer | Function | Trigger |
|--------|----------|---------|
| DesignContext.jsx | mount effect | Initial migration |
| DesignContext.jsx | scalarData.modules sync | LO changes |
| DesignContext.jsx | `addTopic` | SCALAR "+" |
| DesignContext.jsx | `addSubtopic` | SCALAR "+" |
| DesignContext.jsx | `toggleTopicLOLink` | Link mode |
| DesignContext.jsx | `updateScalarNode` | Inline edit |
| DesignContext.jsx | `deleteScalarNode` | Delete action |

---

## 4. Rehydration Points

### 4.1 Mount Effects

| Effect | Location | Trigger | Action |
|--------|----------|---------|--------|
| scalarData → canonicalData | DesignContext.jsx:479-546 | Component mount | Migrate legacy to canonical |
| scalarData.modules sync | DesignContext.jsx:549-591 | `scalarData.modules` change | Re-sync canonical |
| canonicalData → hierarchyData | DesignContext.jsx:594-603 | `canonicalData` change | Push to App.jsx |
| courseData.LOs → scalarData | DesignContext.jsx:741-754 | `courseData.learningObjectives` change | Update scalar LOs |

### 4.2 Storage

| Storage | Usage | Location |
|---------|-------|----------|
| localStorage | **NONE** | N/A |
| sessionStorage | **NONE** | N/A |

**FINDING:** No persistent storage is used. All state is in-memory only.

### 4.3 Routing / Navigation

| Trigger | Effect |
|---------|--------|
| Page navigation | State persists (lifted to App.jsx) |
| CLEAR button | Full state reset |
| Exit (logo double-click) | Full state reset + logout |

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App.jsx                                     │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │ courseData  │  │  timetableData   │  │ courseState, auth, nav     │  │
│  │ (strings)   │  │  ├─ lessons[]    │  │                            │  │
│  │             │  │  ├─ overviewBlks │  │                            │  │
│  │             │  │  └─ hierarchyData│◄─┼─── handleAddTopic/Subtopic │  │
│  └──────┬──────┘  └────────┬─────────┘  │    (BYPASSES CANONICAL!)   │  │
│         │                  │            └────────────────────────────┘  │
└─────────┼──────────────────┼────────────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DesignContext.jsx                               │
│  ┌──────────────────┐    ┌──────────────────┐                           │
│  │   scalarData     │◄───│  canonicalData   │◄── AUTHORITATIVE WRITES   │
│  │   (LEGACY)       │    │  (NORMALIZED)    │                           │
│  │   - nested       │    │  - los{}         │                           │
│  │   - modules[]    │sync│  - topics{}      │                           │
│  │   - unlinkedTops │◄───│  - subtopics{}   │                           │
│  └────────┬─────────┘    └────────┬─────────┘                           │
│           │                       │                                      │
│           ▼                       │ sync                                 │
│  ┌──────────────────┐             ▼                                      │
│  │ effectiveScalar  │    ┌──────────────────┐                           │
│  │ (derived OR      │    │ timetableData.   │                           │
│  │  legacy)         │    │ hierarchyData    │                           │
│  └────────┬─────────┘    │ (App.jsx state)  │                           │
│           │              └──────────────────┘                           │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │  UI Components │
    │  ScalarDock    │
    │  WheelNav      │
    │  LessonEditor  │
    └───────────────┘
```

---

## 6. Critical Findings

### 6.1 Violation: Non-Canonical Write Paths

**App.jsx lines 288-362** contain handlers that write directly to `timetableData.hierarchyData`, bypassing the canonical store:

```javascript
// App.jsx:288-308 - BYPASSES CANONICAL
const handleAddTopic = useCallback(() => {
  const newTopic = { ... }
  setTimetableData(prev => ({
    ...prev,
    hierarchyData: {
      ...prev.hierarchyData,
      topics: { ...prev.hierarchyData?.topics, [newTopic.id]: newTopic }
    }
  }))
}, [...])
```

These handlers are connected to the "+" buttons in LessonEditorModal.jsx.

### 6.2 Dual-Store Syndrome

The system maintains **three overlapping stores** for the same data:

1. `canonicalData` (DesignContext) - intended authoritative
2. `scalarData` (DesignContext) - legacy nested format
3. `timetableData.hierarchyData` (App.jsx) - copy for modal access

Sync effects attempt to keep these aligned, but:
- Writes to hierarchyData don't flow back to canonical
- Race conditions can occur during rapid updates

### 6.3 No Persistence

All state is in-memory. A page refresh loses all data. CLEAR works by resetting state objects, but since there's no storage rehydration, this should work correctly.

---

## 7. Recommendations (For Phase 2)

1. **Remove non-canonical write paths** in App.jsx
2. **Eliminate hierarchyData** duplication - read from canonical via context
3. **Consider single store** with derived views instead of dual scalarData/canonicalData
4. **Add localStorage persistence** if session persistence is desired

---

*This document is diagnostic only. No fixes implemented per Task Order Phase 1 rules.*
