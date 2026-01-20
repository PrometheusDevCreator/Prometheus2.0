# Prometheus TODO

> **Tactical Task List**
>
> This is the active task backlog for Prometheus development.
> AI assistants should offer to update this file when tasks are identified or completed.
> For strategic ideas and future vision, see [IDEAS.md](IDEAS.md).

**Last Updated:** 2025-01-20
**Updated By:** Claude Code (CC)

---

## Active (Current Focus)

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Backend API integration | HIGH | Not Started | API scaffolded in `core/api/`, needs connection to UI |
| PKE Engine implementation | HIGH | Not Started | Core intelligence feature, `core/pke/` is placeholder |
| Performance Criteria CRUD | MEDIUM | Not Started | PC editing in LessonEditor/SCALAR |
| Generate page implementation | MEDIUM | Not Started | Currently placeholder in `pages/Generate.jsx` |

---

## Backlog (Next Up)

| Task | Priority | Notes |
|------|----------|-------|
| OVERVIEW PlanningCanvas testing | MEDIUM | New component - needs validation |
| Consumer migration (LessonBlock) | LOW | Deferred from Phase 6 |
| Hierarchical design spec documentation | LOW | Global rules → App-specific rulesets |
| LO Bloom's validation enforcement | LOW | Validation exists in Define.jsx, not enforced |
| Responsive testing on laptop displays | LOW | Font scaling added, needs real device testing |

---

## Completed (Recent)

| Task | Completed | Notes |
|------|-----------|-------|
| **Phase F: Lesson Editor Transactional Lockdown** | 2025-01-20 | getLessonEditorModel, saveLessonEditorModel, atomic save/cancel |
| **Phase E: Canonical LO Authoring Lockdown** | 2025-01-19 | DEFINE writes to canonical, Phase B sync removed |
| **Phase D: Lesson-Centric Linking** | 2025-01-19 | preferredLOId parameter, loId propagation |
| **Phase C: Inline Edit + Create-Then-Edit** | 2025-01-19 | Double-click edit, auto-focus on create |
| **Phase B: LO Rendering Fix** | 2025-01-19 | LessonEditor reads from canonicalData.los |
| **Lesson Editor Modal Redesign** | 2025-01-15 | Two-column layout, notes tabs, image upload |
| SCALAR Bidirectional Sync Implementation | 2025-01-14 | 6 functions modified in DesignContext.jsx |
| OVERVIEW Planning Tools | 2025-01-14 | PlanningCanvas, Timeline, NoteBlock, ColorPalette |
| DESIGN Phase 6: System Testing | 2025-01-11 | 180 tests passed, all phases complete |
| DESIGN Phase 5: ScalarDock | 2025-01-11 | Tree-based SCALAR editor |
| DESIGN Phase 4: WorkDock | 2025-01-11 | Lesson dock with filtering |

---

## Task Log (Audit Trail)

### 2025-01-20 Session

| Time | Task | Action | Commit |
|------|------|--------|--------|
| Session Start | Phase F Implementation | Lesson Editor Transactional Lockdown | `b966176` |
| - | getLessonEditorModel | Added to DesignContext.jsx (Lines 1774-1908) | - |
| - | saveLessonEditorModel | Added to DesignContext.jsx (Lines 1910-1960) | - |
| - | LessonEditorModal rewrite | Hydration + save with transactional model | - |
| - | Phase F Testing | All F1-F5 objectives verified via Playwright | - |
| Session End | Gate Log | Created PHASE_F_GATE_LOG.md | - |

### 2025-01-19 Session

| Time | Task | Action | Commit |
|------|------|--------|--------|
| Session Start | Phase B/C/D Implementation | LO rendering fix, inline edit, lesson-centric linking | `a52a0e8` |
| - | Phase E Implementation | Canonical LO authoring lockdown | `414ea15` |
| - | DEFINE rewrite | handleSave writes directly to canonicalData.los | - |
| - | OutlinePlanner rewrite | Reads from canonicalData.los instead of courseData | - |
| - | Phase B sync removal | Removed 42 lines of sync code from DesignContext | - |
| Session End | Gate Logs | Created PHASE_B/C/D/E_GATE_LOG.md | - |

### 2025-01-15 Session

| Time | Task | Action | Commit |
|------|------|--------|--------|
| Session Start | Skills Development | Created 7 Claude Code skills for Prometheus | `18adb8b` |
| - | Lesson Editor Redesign | Complete rewrite of LessonEditorModal.jsx | - |
| - | Mockup Implementation | Two-column layout, notes tabs, image upload | - |
| - | Manual Testing | 14 Playwright tests passed | - |
| Session End | Commit & Document | Created Sarah Brief, updated docs | `5410705` |

### 2025-01-14 Session

| Time | Task | Action | Commit |
|------|------|--------|--------|
| Session Start | SCALAR Sync Investigation | Identified data store mismatch | - |
| - | Bidirectional Sync | Modified 6 functions in DesignContext.jsx | - |
| - | OVERVIEW Tools | Added PlanningCanvas, Timeline, NoteBlock | - |
| - | Testing | Ran Playwright automated tests | - |
| Session End | Commit & Document | Created Sarah Brief, updated docs | `675d12f` |

### 2025-01-11 Session

| Time | Task | Action | Commit |
|------|------|--------|--------|
| Session | Phase 6 System Testing | 180 tests passed | See PHASE6_TEST_LOG.md |
| Session | Phase 2-6 Integration | Calm Wheel Design/Build | `a4e2a85` |

---

## How to Use This File

**AI Assistants (CC, Codex, Cursor):**
- When starting a session, check this file for current priorities
- When completing a task, move it to "Completed" with date
- When identifying new work, ask: "Shall I add this to TODO.md?"
- Keep Active section to 3-5 items maximum
- Log significant work in the Task Log section for auditing

**Founder:**
- Review and reprioritise as needed
- Move items from IDEAS.md when ready to implement
- Mark items as blocked if dependencies exist

---

*This file is referenced by CLAUDE.md for session context.*
