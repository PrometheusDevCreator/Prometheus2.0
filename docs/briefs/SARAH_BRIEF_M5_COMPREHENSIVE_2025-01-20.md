# Sarah Brief: M5 Comprehensive Status Report

**Date:** 2025-01-20
**Session:** Claude Code (CC)
**Type:** Comprehensive System State Report
**Purpose:** Full context handoff for ongoing development

---

## Executive Summary

This brief provides complete context for Prometheus 2.0 development through M5 completion. The system has evolved from a dual-store architecture with sync issues to a fully canonical data model with transactional editing, defensive guardrails, and verified reactivity guarantees.

**Key Milestones Completed:**
- M4: Legacy store removal and canonical-first architecture
- Phase B/C/D/E: Lesson Editor rendering, inline editing, lesson-centric linking, LO authoring lockdown
- Phase F: Transactional editing model with atomic save/cancel
- M5: Canonical linking, hydration, reactivity, and bypass prevention guardrails
- M5 Micro: UX spec alignment (Display All toggle, Linking Mode position)

**System State:** UI Stable, Canonical Data Model Complete, Backend Pending

---

## 1. Project Structure

### 1.1 Repository Overview

```
Prometheus2.0/
├── CLAUDE.md                    # AI entry point and project context
├── CLAUDE_PROTOCOL.md           # Task execution protocol
├── UI_DOCTRINE.md               # Immutable UI frame definitions
├── PLAYWRIGHT_CONFIG.md         # Viewport/screenshot standards (1890×940)
│
├── core/                        # Backend (SCAFFOLDED - not connected)
│   ├── api/main.py             # FastAPI application
│   ├── pke/                    # PKE Engine (PLACEHOLDER)
│   └── models/course.py        # Data models
│
├── docs/
│   ├── STATUS.md               # Authoritative system state
│   ├── TODO.md                 # Active task backlog
│   ├── IDEAS.md                # Strategic ideas parking lot
│   └── briefs/                 # 39 brief/log documents
│
├── orchestrator/                # Multi-agent orchestration (SCAFFOLDED)
│
└── prometheus-ui/               # React Frontend (PRIMARY)
    ├── src/
    │   ├── App.jsx             # Main app with routing
    │   ├── contexts/
    │   │   ├── DesignContext.jsx    # 3,749 lines - Core state management
    │   │   └── TemplateContext.jsx  # Format page state
    │   ├── components/
    │   │   ├── LessonEditorModal.jsx     # 1,750 lines - Lesson editing
    │   │   ├── design/
    │   │   │   ├── ScalarDock.jsx        # 1,810 lines - SCALAR hierarchy
    │   │   │   ├── TimetableGrid.jsx     # Timetable visualization
    │   │   │   ├── LessonBlock.jsx       # Timetable lesson cards
    │   │   │   └── overview/             # Planning canvas components
    │   │   └── [60+ other components]
    │   └── pages/
    │       ├── Login.jsx       # COMPLETE
    │       ├── Navigate.jsx    # COMPLETE
    │       ├── Define.jsx      # STABLE
    │       ├── Design.jsx      # ENHANCED
    │       ├── Build.jsx       # STABLE
    │       ├── Format.jsx      # COMPLETE
    │       └── Generate.jsx    # PLACEHOLDER
    └── dist/                    # Production build (467 kB JS)
```

### 1.2 File Size Summary (Key Files)

| File | Lines | Purpose |
|------|-------|---------|
| DesignContext.jsx | 3,749 | Canonical data store, transactional model, all state management |
| ScalarDock.jsx | 1,810 | SCALAR hierarchy view with LO/Topic/Subtopic columns |
| LessonEditorModal.jsx | 1,750 | Two-column lesson editor with notes, images, linking |
| TimetableGrid.jsx | 400+ | Timetable with day rows and time headers |
| LessonBlock.jsx | 350+ | Individual timetable lesson blocks |

---

## 2. Architecture: Canonical Data Model

### 2.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CANONICAL DATA STORE                            │
│                    (DesignContext.jsx)                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ lessons[]    │  │canonicalData │  │canonicalData │  │canonical│ │
│  │ (lesson      │  │  .los{}      │  │  .topics{}   │  │Data.pcs │ │
│  │  objects)    │  │              │  │  .subtopics{}│  │  {}     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │
│         │                 │                 │                │      │
└─────────┼─────────────────┼─────────────────┼────────────────┼──────┘
          │                 │                 │                │
          │    ┌────────────┴─────────────────┴────────────────┘
          │    │
          │    ▼
          │  ┌─────────────────────────────────────┐
          │  │     TRANSACTIONAL MODEL API         │
          │  │  ┌─────────────────────────────┐    │
          │  │  │ getLessonEditorModel(id)    │◄───┼─── READ (hydration)
          │  │  │ saveLessonEditorModel(id,m) │◄───┼─── WRITE (atomic)
          │  │  └─────────────────────────────┘    │
          │  └─────────────────────────────────────┘
          │                   │
    ┌─────┴─────┐    ┌───────┴───────┐    ┌─────────────┐
    │           │    │               │    │             │
    ▼           ▼    ▼               ▼    ▼             ▼
┌─────────┐ ┌─────────┐ ┌───────────┐ ┌─────────────────┐
│Timetable│ │ Lesson  │ │  Linking  │ │   SCALAR Dock   │
│  Grid   │ │ Editor  │ │   Mode    │ │                 │
│         │ │  Modal  │ │           │ │ expandedLOs     │
│ lessons │ │         │ │ loIds,    │ │ expandedTopics  │
│ prop    │ │ hydrate │ │ topicIds, │ │ (derived from   │
│         │ │ on open │ │ pcIds     │ │  canonical)     │
└─────────┘ └─────────┘ └───────────┘ └─────────────────┘
```

### 2.2 State Stores

| Store | Type | Purpose | Status |
|-------|------|---------|--------|
| `canonicalData.los` | Object | Learning Objectives by ID | AUTHORITATIVE |
| `canonicalData.topics` | Object | Topics by ID (with loId reference) | AUTHORITATIVE |
| `canonicalData.subtopics` | Object | Subtopics by ID (with topicId reference) | AUTHORITATIVE |
| `canonicalData.performanceCriteria` | Object | Performance Criteria by ID | AUTHORITATIVE |
| `lessons` | Array | Lesson objects with links | AUTHORITATIVE |
| `scalarData` | Object | Module structure + UI state | DERIVED (read-only) |
| `effectiveScalarData` | Computed | Derived from canonical via `deriveScalarDataFromCanonical` | COMPUTED |

### 2.3 Canonical Flags

```javascript
// canonicalAdapter.js
export const CANONICAL_FLAGS = {
  WRITE_TO_CANONICAL: true,      // All writes go to canonical
  READ_FROM_CANONICAL: true,     // UI reads from canonical
  DERIVE_LEGACY: true,           // Legacy view derived from canonical
  LEGACY_STORE_REMOVED: true     // M4: No direct scalar writes
}
```

---

## 3. Phase History

### 3.1 M4: Legacy Store Removal (2025-01-19)

**Objective:** Remove dual-store architecture, make canonical the single source of truth.

**Changes:**
- `LEGACY_STORE_REMOVED` flag set to `true`
- All 16 legacy write paths guarded
- `effectiveScalarData` now uses `useMemo` with canonical derivation
- Topic/subtopic title updates write to canonical
- `toggleScalarExpand` writes to canonical

**Evidence:** `docs/briefs/M4_GATE_TEST_LOG.md`

### 3.2 Phases B/C/D (2025-01-19)

| Phase | Description | Key Changes |
|-------|-------------|-------------|
| **B** | LO Rendering Fix | LessonEditorModal reads LOs from `canonicalData.los` |
| **C** | Inline Edit + Create-Then-Edit | Double-click edit, '+' creates and enters edit mode |
| **D** | Lesson-Centric Linking | `addTopicToLesson` accepts `preferredLOId`, loId propagation |

**Evidence:** `docs/briefs/PHASE_B_GATE_LOG.md`, `PHASE_C_GATE_LOG.md`, `PHASE_D_GATE_LOG.md`

### 3.3 Phase E: Canonical LO Authoring Lockdown (2025-01-19)

**Objective:** Make DEFINE page write directly to canonical, remove Phase B sync.

**Changes:**
- `Define.jsx` `handleSave` writes LOs directly to `canonicalData.los`
- `OutlinePlanner.jsx` reads from `canonicalData.los`
- Removed 42 lines of Phase B sync code from DesignContext.jsx
- `courseData.learningObjectives` no longer used as rendering source

**Evidence:** `docs/briefs/PHASE_E_GATE_LOG.md`

### 3.4 Phase F: Lesson Editor Transactional Lockdown (2025-01-20)

**Objective:** Implement atomic read/write for lesson editing with cancel functionality.

**Key Functions:**

```javascript
// DesignContext.jsx

/**
 * getLessonEditorModel(lessonId) - Lines 1774-1908
 * Returns complete lesson model from canonical:
 * - Core fields: title, type, duration, startTime, day, week, module
 * - Links: loIds, topicIds, subtopicIds, pcIds
 * - Resolved objects for display
 */

/**
 * saveLessonEditorModel(lessonId, model) - Lines 1910-1960
 * Atomic writeback of all fields:
 * - No partial writes, no silent field drops
 * - Updates lessons state directly
 */
```

**LessonEditorModal.jsx Changes:**
- Hydrates from canonical on modal open (stores `originalModel`)
- CANCEL restores `originalModel` without writes
- SAVE calls `saveLessonEditorModel` for atomic commit

**Evidence:** `docs/briefs/PHASE_F_GATE_LOG.md`

### 3.5 M5: Canonical Linking, Hydration & Reactivity (2025-01-20)

**15 Objectives Completed:**

| Task | Description | Implementation |
|------|-------------|----------------|
| M5.1 | Canonical Link Contract Audit | All consumers identified |
| M5.2 | Additive & Persistent Linking | `persistPreviousLinks` in editor |
| M5.3 | Linking Mode Canonical Hydration | Uses `getLessonEditorModel` |
| M5.4 | Serial Number Visibility | Format `1.2.3` in editor |
| M5.5 | Timetable Reactivity Guarantee | DEV ASSERTION added |
| M5.6 | Scalar Expand/Collapse | Derived from `canonicalData` |
| M5.7 | Guardrails & Bypass Prevention | 7 GUARDRAIL comments |

**GUARDRAIL Comments (7 total):**

| File | Line | Purpose |
|------|------|---------|
| DesignContext.jsx | 1780 | `getLessonEditorModel` - canonical read path |
| DesignContext.jsx | 1921 | `saveLessonEditorModel` - transactional write path |
| DesignContext.jsx | 2239 | `expandAllScalar` - canonical expand state |
| DesignContext.jsx | 2266 | `collapseAllScalar` - canonical collapse state |
| LessonEditorModal.jsx | 232 | Hydration via canonical read |
| LessonEditorModal.jsx | 352/390 | Save via canonical write |
| ScalarDock.jsx | 965 | Derived expand state from canonical |

**DEV ASSERTIONs:**

| File | Line | Assertion |
|------|------|-----------|
| TimetableGrid.jsx | 77 | `[M5_TIMETABLE_REACTIVITY]` debug log |
| LessonBlock.jsx | 107 | `[M5_TIMETABLE_REACTIVITY_MISMATCH]` warning |

**Evidence:** `docs/briefs/M5_GATE_LOG.md`

### 3.6 M5 Micro: UX Spec Alignment (2025-01-20)

**M5.6a: Display All / Collapse All Toggle**
- Replaced dual buttons (▼ ALL / ▲ ALL) with single text toggle
- Label alternates: "Display All" ↔ "Collapse All"
- Grey when inactive (`THEME.TEXT_DIM`), burnt orange when active (`THEME.AMBER`)
- Placed in row above "LEARNING OBJECTIVES" header

**M5.6b: Linking Mode Label Position**
- Moved from `top: '1vh'` to `top: 'calc(1vh - 50px)'`

**Timetable Behaviour Confirmation:**
- Added annotation: `// Timetable updates are commit-on-save by design (Founder decision)`
- No live-preview reactivity

---

## 4. Component Inventory

### 4.1 Pages (9 total)

| Page | Status | Description |
|------|--------|-------------|
| Login.jsx | COMPLETE | Click-to-login, routes to Navigate |
| Navigate.jsx | COMPLETE | NavWheel navigation hub |
| Define.jsx | STABLE | Course info form, LO authoring |
| Design.jsx | ENHANCED | OVERVIEW, TIMETABLE, SCALAR tabs |
| Build.jsx | STABLE | Slide authoring |
| Format.jsx | COMPLETE | Template mapping, 6 phases complete |
| Generate.jsx | PLACEHOLDER | Not implemented |
| Scalar.jsx | DEPRECATED | Old scalar view |
| OutlinePlanner.jsx | ACTIVE | LO outline from canonical |

### 4.2 Design Page Components (30+)

**Core:**
- `ScalarDock.jsx` - SCALAR hierarchy (LO, Topics, Subtopics columns)
- `TimetableGrid.jsx` - Day rows with time headers
- `TimetableWorkspace.jsx` - Timetable container with controls
- `LessonBlock.jsx` - Individual timetable blocks
- `WorkDock.jsx` - Lesson library (unallocated lessons)
- `LessonEditorModal.jsx` - Two-column lesson editing

**Overview:**
- `OverviewWorkspace.jsx` - OVERVIEW tab container
- `OverviewCanvas.jsx` - Hierarchical blocks
- `PlanningCanvas.jsx` - Planning tools
- `Timeline.jsx` - Time visualization
- `NoteBlock.jsx` - Note components
- `ColorPalette.jsx` - Color picker

**Navigation:**
- `DesignNavBar.jsx` - OVERVIEW | TIMETABLE | SCALAR tabs
- `TabSelector.jsx` - Tab navigation
- `TimeControls.jsx` - Week/day selection

### 4.3 Shared Components

| Component | Purpose |
|-----------|---------|
| NavWheel.jsx | Navigation wheel |
| Header.jsx | Page header with navigation |
| Footer.jsx | Status bar area |
| PKEInterface.jsx | PKE chat interface (placeholder) |
| GradientBorder.jsx | Styled borders |
| StatusCircle.jsx | Status indicators |
| LessonEditorLozenge.jsx | Floating lesson editor button |

### 4.4 Contexts (2)

| Context | Lines | Scope |
|---------|-------|-------|
| DesignContext.jsx | 3,749 | All Design page state, canonical stores |
| TemplateContext.jsx | ~500 | Format page template management |

---

## 5. Key Technical Patterns

### 5.1 Transactional Editing

```javascript
// Pattern: Hydrate on open, store original, commit on save

// 1. On modal open
const model = getLessonEditorModel(lessonId)
setOriginalModel(model)  // For cancel functionality
setFormData(/* populate from model */)

// 2. On CANCEL
// Simply close modal - originalModel preserved

// 3. On SAVE
saveLessonEditorModel(lessonId, {
  title: formData.title,
  type: formData.lessonType,
  // ... all fields atomically
})
```

### 5.2 Derived State from Canonical

```javascript
// Pattern: useMemo from canonicalData, not useState

// GUARDRAIL [M5.7]: Do NOT replace with useState
const expandedLOs = useMemo(() => {
  const expanded = new Set()
  if (canonicalData?.los) {
    Object.entries(canonicalData.los).forEach(([loId, lo]) => {
      if (lo.expanded) expanded.add(loId)
    })
  }
  return expanded
}, [canonicalData?.los])
```

### 5.3 DEV ASSERTIONs

```javascript
// Pattern: Development-mode checks for data consistency

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const canonicalLesson = lessons.find(l => l.id === lesson.id)
    if (canonicalLesson && canonicalLesson.startTime !== lesson.startTime) {
      console.warn('[M5_TIMETABLE_REACTIVITY_MISMATCH]', {
        lessonId: lesson.id,
        propValue: lesson.startTime,
        canonicalValue: canonicalLesson.startTime
      })
    }
  }
}, [lesson, lessons])
```

### 5.4 GUARDRAIL Comments

```javascript
// Pattern: Block-level comments preventing future regression

/**
 * GUARDRAIL [M5.7]: This is the ONLY read path for lesson editor hydration.
 * Do NOT read directly from selectedLesson props for existing lessons.
 * The transactional model ensures consistent canonical snapshot.
 */
const getLessonEditorModel = useCallback((lessonId) => {
  // ...
}, [lessons, canonicalData])
```

---

## 6. Commit History (Key Commits)

| Commit | Date | Description |
|--------|------|-------------|
| `1be6ba1` | 2025-01-20 | fix(M5): UX Spec Alignment - Display All toggle and Linking Mode position |
| `207a2fd` | 2025-01-20 | feat(M5): Canonical Linking, Hydration & Reactivity |
| `38ddf84` | 2025-01-20 | feat(LessonEditor): Phase F - Transactional Lockdown |
| `414ea15` | 2025-01-19 | feat(DEFINE): Phase E - Canonical LO Authoring Lockdown |
| `a52a0e8` | 2025-01-19 | feat(LessonEditor): Phase B/C/D - LO rendering fix + inline editing |
| `6c54c8a` | 2025-01-19 | feat(M4.5): Selective CC Optimisation Adoption |
| `4a4d5b8` | 2025-01-19 | feat(M4): Complete canonical data migration - legacy store removed |
| `5410705` | 2025-01-15 | feat(UI): Redesign LessonEditorModal with two-column layout |
| `675d12f` | 2025-01-14 | feat(SCALAR): Bidirectional sync and OVERVIEW planning tools |
| `a4e2a85` | 2025-01-11 | feat(Phase 2-6): Calm Wheel Design/Build integration |

---

## 7. Test Infrastructure

### 7.1 Testing Doctrine

| Level | When | Scope |
|-------|------|-------|
| Minor Tests (MTs) | Continuous during implementation | Unit/component |
| Implementation Tests (ITs) | End of Task Order/Phase | Integration |
| System Operator Checks (SOCs) | Founder-ordered only | Full system |

### 7.2 Test Files

| File | Purpose |
|------|---------|
| `test_bidirectional_sync.py` | SCALAR sync verification |
| `test_scalar.py` | SCALAR component tests |
| `prometheus-ui/coverage/` | Coverage reports |
| `prometheus-ui/playwright-report/` | Playwright test reports |

### 7.3 Gate Logs

All phases have corresponding gate logs in `docs/briefs/`:
- `M4_GATE_TEST_LOG.md`
- `PHASE_B_GATE_LOG.md`
- `PHASE_C_GATE_LOG.md`
- `PHASE_D_GATE_LOG.md`
- `PHASE_E_GATE_LOG.md`
- `PHASE_F_GATE_LOG.md`
- `M5_GATE_LOG.md`

---

## 8. Current State

### 8.1 What Works

| Feature | Status | Confidence |
|---------|--------|------------|
| Login → Navigate → Define flow | Working | HIGH |
| DEFINE page LO authoring | Working | HIGH |
| DESIGN OVERVIEW tab | Working | HIGH |
| DESIGN TIMETABLE tab | Working | HIGH |
| DESIGN SCALAR tab | Working | HIGH |
| Lesson Editor modal | Working | HIGH |
| SCALAR bidirectional sync | Working | HIGH |
| Transactional save/cancel | Working | HIGH |
| Canonical data derivation | Working | HIGH |
| BUILD page slide authoring | Working | MEDIUM |
| FORMAT page template mapping | Working | HIGH |

### 8.2 What Doesn't Work / Not Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| GENERATE page | PLACEHOLDER | Not implemented |
| Backend API connection | SCAFFOLDED | FastAPI exists but not connected |
| PKE Engine | PLACEHOLDER | Core intelligence feature pending |
| Performance Criteria CRUD | PARTIAL | Read works, full CRUD needed |
| Data persistence | NONE | All data in-memory only |

### 8.3 Technical Debt

| Item | Priority | Location |
|------|----------|----------|
| Backend not connected | HIGH | `core/api/` |
| PKE not implemented | HIGH | `core/pke/` |
| Consumer migration (LessonBlock) | LOW | Deferred |
| Deprecated files retained | LOW | `src/deprecated/` |

---

## 9. Active Priorities

From `docs/TODO.md`:

| Task | Priority | Status |
|------|----------|--------|
| Backend API integration | HIGH | Not Started |
| PKE Engine implementation | HIGH | Not Started |
| Performance Criteria CRUD | MEDIUM | Not Started |
| Generate page implementation | MEDIUM | Not Started |

---

## 10. Recommendations for Next Session

### 10.1 Immediate Actions

1. **Update STATUS.md** with M5 completion details
2. **Run SOC** to verify full system stability
3. **Consider M6 scope** - Backend API connection or Generate page

### 10.2 Short-Term Focus

1. **Backend API Connection** - Enable data persistence
2. **PC CRUD in Editor** - Complete Performance Criteria editing
3. **Generate Page** - Basic implementation

### 10.3 Technical Recommendations

1. **Maintain GUARDRAIL discipline** - Add comments when touching canonical paths
2. **Use transactional model** - Always use `getLessonEditorModel`/`saveLessonEditorModel` for lesson editing
3. **Derive, don't store** - UI state should derive from canonical via `useMemo`

---

## 11. Quick Reference

### 11.1 Key Files for Any Editing

| Task | Primary File | Key Lines |
|------|--------------|-----------|
| Lesson data read | DesignContext.jsx | 1774-1908 (`getLessonEditorModel`) |
| Lesson data write | DesignContext.jsx | 1910-1960 (`saveLessonEditorModel`) |
| SCALAR expand/collapse | DesignContext.jsx | 2238-2290 (`expandAllScalar`, `collapseAllScalar`) |
| Lesson Editor form | LessonEditorModal.jsx | 231-316 (hydration), 351-438 (save) |
| SCALAR hierarchy | ScalarDock.jsx | 962-1001 (derived state) |
| Timetable reactivity | TimetableGrid.jsx | 71-90 (debug log) |
| Timetable blocks | LessonBlock.jsx | 80-113 (DEV ASSERTION) |

### 11.2 Console Log Markers

| Marker | Purpose |
|--------|---------|
| `[PHASE_F]` | Transactional model operations |
| `[M5_TIMETABLE_REACTIVITY]` | Timetable state changes |
| `[M5_TIMETABLE_REACTIVITY_MISMATCH]` | Prop/canonical drift warning |
| `[M5_SCALAR_EXPAND_ALL]` | Expand all operation |
| `[M5_SCALAR_COLLAPSE_ALL]` | Collapse all operation |
| `[M4_FALLBACK_WARNING]` | Derivation fallback (should not appear) |

### 11.3 Design System Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `THEME.AMBER` | `#d4730c` | Active/selected states, burnt orange |
| `THEME.TEXT_DIM` | `#6e6e6e` | Inactive text, secondary |
| `THEME.GREEN_BRIGHT` | `#00FF00` | Linking mode active |
| `THEME.WHITE` | `#f0f0f0` | Primary text, hover states |
| `THEME.BG_BASE` | `#080808` | Background |

---

*Brief prepared by Claude Code (CC) for Controller (Sarah) review.*
*Report generated: 2025-01-20*
*Total commits in scope: 30+*
*Key files surveyed: 15+*
*Lines of code in key files: 7,300+*
