# Fix Plan - Canonical Model Alignment

**Version:** 1.0
**Created:** 2025-01-18
**Purpose:** Remediation plan for canonical model violations
**Status:** AWAITING APPROVAL - Phase 2 Task Order

---

## Executive Summary

This plan addresses the violations identified in Phase 1 by:
1. Lifting `DesignProvider` to App.jsx level (single context instance)
2. Removing non-canonical write paths in App.jsx
3. Eliminating `hierarchyData` as a separate writable store
4. Completing partial canonical writes in DesignContext

**Risk Level:** MEDIUM - Architectural change with clear rollback path
**Estimated Files Changed:** 6

---

## 1. Root Cause Analysis

### 1.1 Why Violations Exist

The `LessonEditorModal` is rendered at the App.jsx level (line 747), **outside** the `DesignProvider` context:

```
App.jsx
├── renderPage()
│   ├── Design.jsx
│   │   └── <DesignProvider>  ← Context only available here
│   │       └── (Design content)
│   │       └── </DesignProvider>
│   └── (other pages)
└── <LessonEditorModal />     ← OUTSIDE context, cannot access actions
```

To give the modal access to data, App.jsx:
1. Created `timetableData.hierarchyData` as a **duplicate store**
2. Created `handleAddTopic/Subtopic/PC` handlers that write to this duplicate
3. DesignContext syncs canonical → hierarchyData, but **not the reverse**

This breaks the single-source-of-truth principle.

### 1.2 Why Partial Canonical Writes Exist

Some functions were updated during the M3 migration but others were missed:

| Function | Writes To | Should Write To |
|----------|-----------|-----------------|
| `toggleTopicLOLink` | canonical + scalarData | canonical only ✓ |
| `unlinkTopic` | scalarData only | canonical only |
| `linkTopicToLO` | scalarData only | canonical only |
| `reorderTopic` | scalarData only | canonical only |
| `reorderSubtopic` | scalarData only | canonical only |
| `reorderLO` | scalarData only | canonical only |

---

## 2. Proposed Solution

### 2.1 Architecture Change: Lift DesignProvider

**Before:**
```
App.jsx
├── <Header />
├── renderPage() → <Design> → <DesignProvider>...</DesignProvider>
└── <LessonEditorModal /> ← No context access
```

**After:**
```
App.jsx
└── <DesignProvider>
    ├── <Header />
    ├── renderPage() → <Design>...</Design>
    └── <LessonEditorModal /> ← Has context access
    </DesignProvider>
```

**Benefits:**
- Single context instance for entire app
- All components can access canonical actions
- No prop drilling for hierarchy mutations
- State persists correctly across page navigation

### 2.2 Remove Non-Canonical Handlers

**Delete from App.jsx:**
- `handleAddTopic` (lines 288-309)
- `handleAddSubtopic` (lines 312-338)
- `handleAddPC` (lines 340-363)

**Replace in LessonEditorModal:**
- Import `useDesign` from DesignContext
- Call `addTopic`, `addSubtopic`, `addPerformanceCriteria` directly

### 2.3 Eliminate hierarchyData Duplication

**Remove from App.jsx `timetableData`:**
```javascript
// BEFORE
const [timetableData, setTimetableData] = useState({
  lessons: [...],
  overviewBlocks: [],
  hierarchyData: {     // ← REMOVE THIS
    los: {},
    topics: {},
    subtopics: {}
  }
})

// AFTER
const [timetableData, setTimetableData] = useState({
  lessons: [...],
  overviewBlocks: []
  // hierarchyData removed - read from canonical via context
})
```

**Update consumers:**
- `LessonEditorModal` reads from `useDesign()` instead of `timetableData.hierarchyData`
- `enrichedCourseData` derives from canonical via context

### 2.4 Complete Partial Canonical Writes

**Update in DesignContext.jsx:**

| Function | Current | Fix |
|----------|---------|-----|
| `unlinkTopic` | setScalarData only | Add setCanonicalData |
| `linkTopicToLO` | setScalarData only | Add setCanonicalData |
| `reorderTopic` | setScalarData only | Add setCanonicalData |
| `reorderSubtopic` | setScalarData only | Add setCanonicalData |
| `reorderLO` | setScalarData only | Add setCanonicalData |

---

## 3. Implementation Plan

### 3.1 Step 1: Lift DesignProvider (App.jsx)

**File:** `src/App.jsx`

**Changes:**
1. Import `DesignProvider` from contexts
2. Wrap entire app content in `<DesignProvider>`
3. Pass required props (`courseData`, `setCourseData`, `timetableData`, `setTimetableData`)

```javascript
// App.jsx
import { DesignProvider } from './contexts/DesignContext'

function App() {
  // ... existing state ...

  return (
    <DesignProvider
      courseData={courseData}
      setCourseData={setCourseData}
      timetableData={timetableData}
      setTimetableData={setTimetableData}
    >
      <div style={{ /* existing styles */ }}>
        {/* All existing content */}
      </div>
    </DesignProvider>
  )
}
```

### 3.2 Step 2: Remove Nested DesignProviders

**Files:** `src/pages/Design.jsx`, `src/pages/Build.jsx`

**Changes:**
1. Remove `<DesignProvider>` wrapper (now at App level)
2. Keep `useDesign()` usage (still works)
3. Remove provider props (now passed at App level)

```javascript
// Design.jsx - BEFORE
export default function Design({ courseData, setCourseData, timetableData, setTimetableData, ... }) {
  return (
    <DesignProvider courseData={courseData} ...>
      <DesignInner ... />
    </DesignProvider>
  )
}

// Design.jsx - AFTER
export default function Design({ ... }) {
  return <DesignInner ... />
}
```

### 3.3 Step 3: Update LessonEditorModal

**File:** `src/components/LessonEditorModal.jsx`

**Changes:**
1. Import `useDesign` from DesignContext
2. Remove `onAddTopic`, `onAddSubtopic`, `onAddPC` props
3. Call context actions directly

```javascript
// LessonEditorModal.jsx - BEFORE
function LessonEditorModal({ onAddTopic, onAddSubtopic, onAddPC, ... }) {
  // Uses props

// LessonEditorModal.jsx - AFTER
import { useDesign } from '../contexts/DesignContext'

function LessonEditorModal({ ... }) {
  const { addTopic, addSubtopic, addPerformanceCriteria, canonicalData } = useDesign()

  // Read hierarchy from canonicalData instead of timetableData.hierarchyData
  const topics = Object.values(canonicalData.topics)
  const subtopics = Object.values(canonicalData.subtopics)
```

### 3.4 Step 4: Remove App.jsx Handlers and hierarchyData

**File:** `src/App.jsx`

**Changes:**
1. Delete `handleAddTopic`, `handleAddSubtopic`, `handleAddPC` functions
2. Remove `hierarchyData` from `timetableData` initial state
3. Remove sync effect that populates hierarchyData
4. Update `enrichedCourseData` to read from context (or compute inline)

### 3.5 Step 5: Complete Canonical Writes

**File:** `src/contexts/DesignContext.jsx`

**Changes for each function:**

```javascript
// unlinkTopic - ADD canonical write
const unlinkTopic = useCallback((topicId) => {
  // ADD: Update canonical first
  setCanonicalData(prev => {
    const topic = prev.topics[topicId]
    if (!topic || !topic.loId) return prev

    const newTopics = { ...prev.topics }
    const unlinkedCount = Object.values(prev.topics).filter(t => t.loId === null).length
    newTopics[topicId] = { ...topic, loId: null, order: unlinkedCount + 1 }

    // Recalculate source group orders
    recalculateCanonicalGroupOrders(newTopics, topic.loId)

    return { ...prev, topics: newTopics }
  })

  // KEEP: Legacy write for M3 compatibility
  setScalarData(prev => { /* existing logic */ })
}, [])
```

Similar pattern for `linkTopicToLO`, `reorderTopic`, `reorderSubtopic`, `reorderLO`.

### 3.6 Step 6: Remove DesignContext Sync Effect

**File:** `src/contexts/DesignContext.jsx`

**Remove:** Effect at lines 594-603 that syncs to `timetableData.hierarchyData`

```javascript
// DELETE this effect - hierarchyData no longer exists
useEffect(() => {
  const { los, topics, subtopics } = canonicalData
  if (Object.keys(los).length > 0 || ...) {
    setTimetableData(prev => ({
      ...prev,
      hierarchyData: { los, topics, subtopics }
    }))
  }
}, [canonicalData, setTimetableData])
```

---

## 4. Files Modified

| File | Changes | Risk |
|------|---------|------|
| `src/App.jsx` | Wrap with DesignProvider, remove handlers, remove hierarchyData | MEDIUM |
| `src/pages/Design.jsx` | Remove DesignProvider wrapper | LOW |
| `src/pages/Build.jsx` | Remove DesignProvider wrapper | LOW |
| `src/components/LessonEditorModal.jsx` | Use context instead of props | MEDIUM |
| `src/contexts/DesignContext.jsx` | Complete canonical writes, remove sync effect | MEDIUM |

**Total: 5 files**

---

## 5. Why This Fixes the Violations

### 5.1 Eliminates Non-Canonical Writes

| Violation | Fix |
|-----------|-----|
| App.jsx `handleAddTopic` | Deleted - modal calls canonical action |
| App.jsx `handleAddSubtopic` | Deleted - modal calls canonical action |
| App.jsx `handleAddPC` | Deleted - modal calls canonical action |

### 5.2 Completes Canonical Writes

| Violation | Fix |
|-----------|-----|
| `unlinkTopic` scalarData only | Added canonicalData write |
| `linkTopicToLO` scalarData only | Added canonicalData write |
| `reorderTopic` scalarData only | Added canonicalData write |
| `reorderSubtopic` scalarData only | Added canonicalData write |
| `reorderLO` scalarData only | Added canonicalData write |

### 5.3 Eliminates Dual-Store Syndrome

| Before | After |
|--------|-------|
| canonicalData (DesignContext) | canonicalData (DesignContext) - AUTHORITATIVE |
| scalarData (DesignContext) | scalarData (DesignContext) - DERIVED |
| hierarchyData (App.jsx) | **REMOVED** |

---

## 6. Why This Does Not Introduce New Drift

### 6.1 Single Write Path Enforced

All mutations now flow through DesignContext canonical actions:

```
User Action → DesignContext Action → canonicalData → (derived) scalarData
                                                   → (derived) UI views
```

No component can bypass this path because:
- `setCanonicalData` is internal to DesignContext
- Only exported actions modify it
- Props no longer provide mutation shortcuts

### 6.2 View Purity Maintained

Pages remain pure views:
- DEFINE: Writes to `courseData` (separate, valid store for metadata)
- SCALAR: Reads from `effectiveScalarData`, writes via canonical actions
- TIMETABLE: Reads lessons, writes via lesson actions
- LESSON EDITOR: Reads from canonical, writes via canonical actions

### 6.3 Migration Phase Compatible

This fix is compatible with M3 (Derive Legacy):
- `DERIVE_LEGACY: true` - scalarData still derived from canonical
- `LEGACY_STORE_REMOVED: false` - scalarData still exists for compatibility
- Future M4 migration will only need to remove scalarData derivation

---

## 7. Store Retention Summary

| Store | Status | Reason |
|-------|--------|--------|
| `canonicalData` | **RETAIN** | Single source of truth |
| `scalarData` | **RETAIN** | Legacy compatibility (M3), derived from canonical |
| `hierarchyData` | **REMOVE** | Duplicate, violation source |
| `courseData` | **RETAIN** | Course metadata (separate domain) |
| `timetableData.lessons` | **RETAIN** | Lesson scheduling data |
| `timetableData.overviewBlocks` | **RETAIN** | Overview planning data |

---

## 8. Rollback Plan

If issues are discovered after implementation:

1. Revert commits (single PR expected)
2. All changes are additive/subtractive with no data migration
3. No persistent storage affected (all in-memory)

---

## 9. Acceptance Criteria

After implementation:

| Criterion | Test |
|-----------|------|
| Modal "+" Topic works | Add topic from modal, appears in SCALAR |
| Modal "+" Subtopic works | Add subtopic from modal, appears in SCALAR |
| Modal "+" PC works | Add PC from modal, appears in SCALAR |
| SCALAR "+" Topic works | Add topic from SCALAR, appears everywhere |
| Link mode works | SHIFT+click links topic to LO |
| Reorder works | Drag-reorder updates canonical |
| CLEAR works | Resets all state, persists across navigation |
| No console errors | Clean console after all operations |

---

*This plan requires Founder approval before implementation.*
