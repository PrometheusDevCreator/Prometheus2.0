# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-01-20
**Last Session By:** Claude Code (CC)

---

## Migration Phase Status

> **PHASE E COMPLETE - 2025-01-19**
>
> **Declared Migration Phase:** M4 + Phase E (Canonical LO Authoring Lockdown)
>
> **Actual Compliance:** FULL - DEFINE writes directly to canonical, Phase B sync removed

| Flag | Expected | Actual | Compliant |
|------|----------|--------|-----------|
| WRITE_TO_CANONICAL | true | true | YES |
| READ_FROM_CANONICAL | true | true | YES |
| DERIVE_LEGACY | true | true | YES |
| LEGACY_STORE_REMOVED | true | true | YES |

**Phase 4 (M4) Changes Applied:**
- `LEGACY_STORE_REMOVED` flag set to true in canonicalAdapter.js
- `effectiveScalarData` now uses useMemo with M4 fallback warning
- `updateTopicTitle` and `updateSubtopicTitle` now write to canonical
- `toggleScalarExpand` updated to write lo/topic expanded state to canonical
- All guarded `setScalarData` calls now skip (flag is true)
- Build verified: SUCCESS
- Dev server verified: HTTP 200

**Phase B/C/D/E/F Changes Applied (2025-01-19 to 2025-01-20):**

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase B** | LO Rendering Fix - LessonEditor reads from canonicalData.los | COMPLETE |
| **Phase C** | Inline Edit + Create-Then-Edit UX | COMPLETE |
| **Phase D** | Lesson-Centric Linking + loId Propagation | COMPLETE |
| **Phase E** | Canonical LO Authoring Lockdown | COMPLETE |
| **Phase F** | Lesson Editor Transactional Lockdown | COMPLETE |

**Phase E Details:**
- DEFINE.jsx now writes LOs directly to `canonicalData.los` on Save
- OutlinePlanner.jsx rewired to read from `canonicalData.los` (not courseData)
- Phase B sync effects REMOVED (42 lines deleted from DesignContext.jsx)
- `courseData.learningObjectives` no longer used as rendering source
- Grep-proof: See `docs/briefs/PHASE_E_GATE_LOG.md`

**Phase F Details (2025-01-20):**
- `getLessonEditorModel(lessonId)` implemented - returns complete lesson model from canonical
- `saveLessonEditorModel(lessonId, model)` implemented - atomic writeback of all fields
- LessonEditorModal hydrates from canonical on open, stores originalModel for cancel
- CANCEL restores original state, SAVE commits all fields atomically
- Topics/subtopics persist across close/reopen cycles
- Deletion policy: Option A (children become orphans, no cascading)
- Gate Log: See `docs/briefs/PHASE_F_GATE_LOG.md`

**Phase 3 Fixes (Previous):**
- Performance Criteria added to canonicalData structure
- 5 PC functions updated to canonical-first: addPC, updatePC, deletePC, linkItemToPC, unlinkItemFromPC
- 4 PC reader functions updated to read from canonical
- ScalarColumns.jsx updated to read PC from canonical
- clearDesignState updated to reset performanceCriteria

**Phase 2 Fixes (Previous):**
- DesignProvider lifted to App.jsx level (single context instance)
- App.jsx `handleAddTopic/Subtopic/PC` handlers REMOVED
- `hierarchyData` store REMOVED from `timetableData`
- LessonEditorModal now uses `useDesign()` context for canonical actions
- `unlinkTopic`, `linkTopicToLO` updated to write canonical first

**Evidence:** See `docs/briefs/M4_GATE_TEST_LOG.md` for M4 verification

---

## M4 Architecture Clarification

> **"Legacy Store Removed" vs "Derived Scalar View"**

### What M4 Means

**LEGACY_STORE_REMOVED = true** means:
1. All **writes** go to `canonicalData` (los, topics, subtopics, performanceCriteria)
2. The `scalarData` state is now a **derived view**, not a source of truth
3. 16 legacy write paths are **guarded and inactive**

### What Still Exists (by Design)

| State | Purpose | Status |
|-------|---------|--------|
| `canonicalData` | Source of truth for LO/Topic/Subtopic/PC | AUTHORITATIVE |
| `scalarData` | Module structure + derived scalar view | DERIVED (read-only) |
| `effectiveScalarData` | Computed from canonical via derivation | COMPUTED |

### Why `scalarData` State Remains

The `scalarData` useState still exists because:
1. **Module structure** is not yet in canonical (modules define the course hierarchy skeleton)
2. **Module expand/collapse state** is UI state stored locally
3. **Derivation needs the module template** to populate with canonical data

### Data Flow Diagram

```
User Action
    │
    ▼
setCanonicalData()  ←── ALL WRITES GO HERE
    │
    ▼
canonicalData (los, topics, subtopics, PC)
    │
    ▼ (derivation via deriveScalarDataFromCanonical)
    │
effectiveScalarData = derivedScalarData || scalarData
    │
    ▼ (fallback only during initial hydration)
    │
UI Components read effectiveScalarData
```

### M4 Guarantees

1. No component can write directly to `scalarData` for LO/Topic/Subtopic/PC
2. `effectiveScalarData` always reflects canonical state after hydration
3. Console warning logged if fallback occurs (M4_FALLBACK_WARNING)

---

## Quick Summary

- **UI:** Stable and complete for current pages (Login, Navigate, Define, Design, BUILD, FORMAT)
- **Lesson Editor:** Redesigned with two-column professional layout, notes tabs, image upload
- **SCALAR Tab:** Bidirectional sync implemented - Topics/Subtopics sync between LessonEditor and SCALAR
- **OVERVIEW Tab:** New planning canvas with Timeline and NoteBlock components
- **Backend:** Scaffolded only - API structure exists but not connected
- **PKE Engine:** Placeholder - not yet implemented

---

## Component Status

| Component | State | Last Change | Notes |
|-----------|-------|-------------|-------|
| **prometheus-ui** | STABLE | 2025-01-14 | React frontend functional |
| **Login page** | COMPLETE | 2025-12-15 | Click-to-login implemented |
| **Navigate page** | COMPLETE | 2025-01-14 | NavWheel navigation working, tooltip refinements |
| **Define page** | STABLE | 2025-12-30 | Wheel layout refined, Module Name removed |
| **Design - Overview** | ENHANCED | 2025-01-14 | New PlanningCanvas, Timeline, NoteBlock components |
| **Design - Timetable** | ENHANCED | 2025-01-14 | TimeControls, TimetableGrid refinements |
| **Design - Scalar** | ENHANCED | 2025-01-14 | **Bidirectional sync with LessonEditor** |
| **Lesson Editor Modal** | REDESIGNED | 2025-01-15 | **Two-column layout, notes tabs, image upload** |
| **Build page** | STABLE | 2025-12-30 | Slide authoring, bidirectional sync |
| **Format page** | COMPLETE | 2025-12-30 | All 6 phases complete |
| **Generate page** | PLACEHOLDER | - | Not implemented |
| **core/api** | SCAFFOLDED | - | FastAPI structure, not connected |
| **core/pke** | PLACEHOLDER | - | Not implemented |
| **orchestrator** | SCAFFOLDED | - | Agent adapters defined |

---

## Implementation Baseline

| Parameter | Value |
|-----------|-------|
| Usable Viewport | 1890 × 940 |
| Display Reference | 1920 × 1080 @ 100% scale |
| Grid Origin | Centre (945, 470) |
| Coordinate System | Centre-origin Cartesian |

*See UI_DOCTRINE.md and PLAYWRIGHT_CONFIG.md for full specifications.*

---

## Recent Changes (Last 5 Sessions)

| Date | Session | Key Changes |
|------|---------|-------------|
| 2025-01-20 | CC | **Phase F Complete**: Lesson Editor Transactional Lockdown - getLessonEditorModel, saveLessonEditorModel, atomic save/cancel |
| 2025-01-19 | CC | **Phase B/C/D/E Complete**: LO rendering fix, inline edit, lesson-centric linking, canonical LO authoring lockdown |
| 2025-01-19 | CC | **Phase 4 (M4) Complete**: Legacy store removed, all writes go to canonical, effectiveScalarData derived only |
| 2025-01-18 | CC | **Phase 3 Behavioural Fix**: SCALAR '+ Lesson' button fixed to add lesson without view switch or clear |
| 2025-01-18 | CC | **Phase 2-3 Complete**: Canonical model alignment, PC added to canonical, all write/read paths verified |

---

## Latest Commits

```
commit 414ea15 (main)
Date: 2025-01-19

feat(DEFINE): Phase E - Canonical LO Authoring Lockdown

- DEFINE writes LOs directly to canonicalData.los on Save
- OutlinePlanner rewired to read from canonicalData.los
- Phase B sync effects removed (42 lines deleted)
- 4 files changed, 339 insertions(+), 51 deletions(-)

commit a52a0e8
Date: 2025-01-19

feat(LessonEditor): Phase B/C/D - LO rendering fix + inline editing + loId propagation

- Phase B: LessonEditor reads LOs from canonicalData.los
- Phase C: Inline edit with create-then-edit UX, double-click to edit
- Phase D: Lesson-centric linking with preferredLOId parameter
- 6 files changed, 1064 insertions(+), 32 deletions(-)
```

---

## Known Blockers

None currently.

---

## Technical Debt

| Item | Location | Priority | Status |
|------|----------|----------|--------|
| ~~Non-canonical write paths~~ | App.jsx | ~~CRITICAL~~ | FIXED (Phase 2) |
| ~~Dual-store sync issues~~ | DesignContext.jsx | ~~CRITICAL~~ | FIXED (Phase 2) |
| ~~PC scalar-only writes~~ | DesignContext.jsx | ~~CRITICAL~~ | FIXED (Phase 3) |
| Backend not connected | `core/api/` | HIGH | Open |
| PKE not implemented | `core/pke/` | HIGH | Open |
| Consumer migration (LessonBlock) | `src/components/design/` | LOW | Open |
| Deprecated files retained | `src/deprecated/` | LOW | Open |

---

## Session Handoff Notes

*Important context for the next session:*

### Phase F Complete (2025-01-20)

**Lesson Editor Transactional Lockdown:**
- `getLessonEditorModel(lessonId)` in DesignContext.jsx (Lines 1774-1908):
  - Returns complete lesson model with core fields, links (loIds, topicIds, subtopicIds, pcIds), resolved display objects
  - Reads from canonical data stores
- `saveLessonEditorModel(lessonId, model)` in DesignContext.jsx (Lines 1910-1960):
  - Atomic writeback of all fields to lessons state
  - No partial writes, no silent field drops
- LessonEditorModal.jsx changes:
  - Hydrates from canonical on modal open
  - Stores originalModel for CANCEL functionality
  - CANCEL restores original state without writes
  - SAVE commits all fields atomically

**Tested Behaviors:**
- F1: Hydration from canonical verified with console logs
- F2: Title editing - CANCEL reverts, SAVE persists
- F3: Complete writeback - all fields saved atomically
- F4: Topic/subtopic persistence across close/reopen
- F5: Deletion policy - Option A (no cascading deletes)

**Gate Log:** See `docs/briefs/PHASE_F_GATE_LOG.md`

### Phase B/C/D/E Complete (2025-01-19)

**Phase B - LO Rendering Fix:**
- LessonEditorModal now reads LOs from `canonicalData.los` instead of courseData
- LO dropdown populated from canonical objects with verb + description

**Phase C - Inline Edit + Create-Then-Edit:**
- Double-click on Topic/Subtopic enters inline edit mode
- '+' button creates item AND immediately enters edit mode with auto-focus
- ENTER commits, ESC cancels
- Cross-view reflection: SCALAR updates live when titles change

**Phase D - Lesson-Centric Linking:**
- `addTopicToLesson` now accepts `preferredLOId` parameter
- Topics created from LessonEditor get valid `loId` from selected LO
- Topics appear correctly numbered in SCALAR (e.g., "1.1 New Topic")

**Phase E - Canonical LO Authoring Lockdown:**
- DEFINE.jsx `handleSave` writes directly to `canonicalData.los`
- OutlinePlanner.jsx reads from `canonicalData.los`
- Phase B sync effects REMOVED (42 lines deleted)
- `courseData.learningObjectives` no longer used as rendering source

**Gate Logs:** See `docs/briefs/PHASE_B_GATE_LOG.md`, `PHASE_C_GATE_LOG.md`, `PHASE_D_GATE_LOG.md`, `PHASE_E_GATE_LOG.md`, `PHASE_F_GATE_LOG.md`

### Phase 3 Behavioural Fix (2025-01-18)

**SCALAR '+ Lesson' Button Fixed:**
- **Issue:** Clicking "+" next to LESSON TITLES triggered `clearDesignState()` and switched view to TIMETABLE
- **Root Cause:** ScalarDock.jsx used `onAddLesson` prop from Design.jsx which called `handleAddLessonFromScalar()` - this function incorrectly cleared state
- **Fix:** Changed ScalarDock.jsx button to use `createLessonFromScalar('NEW LESSON')` directly from DesignContext
- **File Modified:** `src/components/design/ScalarDock.jsx` (lines 906, 1383)

**Behavioural Tests:** All 4 tests now PASS:
1. CLEAR persistence ✓
2. Cross-view persistence ✓
3. SCALAR '+ Lesson' behaviour ✓ (Fixed)
4. LINK MODE persistence ✓

**Evidence:** See `docs/briefs/PHASE3_BEHAVIOUR_TEST_LOG.md`

### UI Polish Session (2025-01-16)

**'+' Button Additions:**
- SCALAR column headers: LEARNING OBJECTIVES, LESSON TITLES, PERFORMANCE CRITERIA
- Lesson Editor dropdowns: TOPICS, SUB TOPICS, PERFORMANCE CRITERIA
- All styled burnt orange (#FF6600), hover to white

**LESSON LIBRARY Rename:**
- `UnallocatedLessonsPanel.jsx` label changed from "Unallocated" to "LESSON LIBRARY"

**LINKING MODE Update:**
- Multi-line instructions, positioned right side of SCALAR header

### Lesson Editor Modal Redesign (2025-01-15)

**Complete rewrite** of `LessonEditorModal.jsx` with professional two-column layout:
- Left column: All form dropdowns (LO, Topics, Subtopics, Type, Times, PC)
- Right column: Notes tabs with pagination, Image drag-drop upload
- Bottom: View destination tabs, CANCEL/SAVE buttons

**Testing completed:** All 14 manual tests passed via Playwright

### SCALAR Bidirectional Sync (Implemented 2025-01-14)

**Root cause fixed:** Data store mismatch between LessonEditor and ScalarDock
- Now synchronized via 6 modified functions in DesignContext.jsx

**Functions:** `addTopicToLesson`, `addSubtopicToLessonTopic`, `updateLessonTopic`, `updateLessonSubtopic`, `updateScalarNode`, `deleteScalarNode`

### Testing Status

- Phase 3 Behavioural Tests: All 4 tests PASSING
- Lesson Editor Modal: All manual tests PASSING
- SCALAR Sync: Validated and working
- Test files: `prometheus-ui/test_bidirectional_sync.py`, `test_scalar.py`
- Test logs: `docs/briefs/PHASE3_GATE_TEST_LOG.md`, `docs/briefs/PHASE3_BEHAVIOUR_TEST_LOG.md`

---

## Related Documents

- [TODO.md](TODO.md) - Active task backlog
- [IDEAS.md](IDEAS.md) - Strategic ideas parking lot
- [../CLAUDE.md](../CLAUDE.md) - AI entry point and project context
- [../UI_DOCTRINE.md](../UI_DOCTRINE.md) - Immutable UI frame definitions
- [../CLAUDE_PROTOCOL.md](../CLAUDE_PROTOCOL.md) - Task execution protocol
- [briefs/SARAH_BRIEF_lesson-editor-redesign_2025-01-15.md](briefs/SARAH_BRIEF_lesson-editor-redesign_2025-01-15.md) - Latest session brief

---

*This file is the authoritative status source. Historical snapshots are in `docs/briefs/`.*
