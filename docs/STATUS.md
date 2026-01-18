# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-01-18
**Last Session By:** Claude Code (CC)

---

## Migration Phase Status

> **PHASE 3 COMPLETE - 2025-01-18**
>
> **Declared Migration Phase:** M3 (Derive Legacy)
>
> **Actual Compliance:** FULL - All violations fixed, PC canonical-first

| Flag | Expected | Actual | Compliant |
|------|----------|--------|-----------|
| WRITE_TO_CANONICAL | true | true | YES |
| READ_FROM_CANONICAL | true | true | YES |
| DERIVE_LEGACY | true | true | YES |
| LEGACY_STORE_REMOVED | false | false | YES |

**Phase 3 Fixes Applied:**
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

**Evidence:** See `docs/briefs/PHASE3_GATE_TEST_LOG.md` for Phase 3 verification

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
| 2025-01-18 | CC | **Phase 3 Behavioural Fix**: SCALAR '+ Lesson' button fixed to add lesson without view switch or clear |
| 2025-01-18 | CC | **Phase 2-3 Complete**: Canonical model alignment, PC added to canonical, all write/read paths verified |
| 2025-01-18 | CC | **Phase 0-1 Diagnostics**: Documentation consolidation, state-map.md, mutation-map.md, migration phase determination |
| 2025-01-16 | CC | **UI Polish**: '+' buttons for SCALAR/Lesson Editor, LESSON LIBRARY rename, tooltip adjustments |
| 2025-01-15 | CC | **Lesson Editor Redesign**: Two-column layout, notes tabs, image upload, view destination tabs |

---

## Latest Commits

```
commit 2723a61 (feature/design-calm-wheel)
Date: 2025-01-16

feat(UI): Add + buttons, LESSON LIBRARY rename, and tooltip adjustments

- SCALAR: '+' buttons next to LEARNING OBJECTIVES, LESSON TITLES, PERFORMANCE CRITERIA headers
- SCALAR: LINKING MODE label with multi-line instructions (right-aligned)
- LESSON EDITOR: '+' buttons for TOPIC, SUB TOPICS, PERFORMANCE CRITERIA dropdowns
- TIMETABLE: Renamed "Unallocated" to "LESSON LIBRARY"
- NAV HUB: Tooltip positions adjusted (DESIGN/FORMAT UP 20px, BUILD UP 50px)
- 6 files modified

commit 79ca18a
Date: 2025-01-16

feat(UI): Navigation Hub tooltip positioning and OVERVIEW tab improvements
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
