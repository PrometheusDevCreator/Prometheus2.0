# Prometheus TODO

> **Tactical Task List**
>
> This is the active task backlog for Prometheus development.
> AI assistants should offer to update this file when tasks are identified or completed.
> For strategic ideas and future vision, see [IDEAS.md](IDEAS.md).

**Last Updated:** 2025-01-14
**Updated By:** Claude Code (CC)

---

## Active (Current Focus)

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| **SCALAR Bidirectional Sync Testing** | **HIGH** | **Ready for Manual Testing** | Sync implemented, needs user validation |
| Backend API integration | HIGH | Not Started | API scaffolded in `core/api/`, needs connection to UI |
| PKE Engine implementation | HIGH | Not Started | Core intelligence feature, `core/pke/` is placeholder |

---

## Backlog (Next Up)

| Task | Priority | Notes |
|------|----------|-------|
| OVERVIEW PlanningCanvas testing | MEDIUM | New component - needs validation |
| Generate page implementation | MEDIUM | Currently placeholder in `pages/Generate.jsx` |
| Consumer migration (LessonBlock) | LOW | Deferred from Phase 6 |
| Hierarchical design spec documentation | LOW | Global rules → App-specific rulesets |
| LO Bloom's validation enforcement | LOW | Validation exists in Define.jsx, not enforced |
| Responsive testing on laptop displays | LOW | Font scaling added, needs real device testing |

---

## Completed (Recent)

| Task | Completed | Notes |
|------|-----------|-------|
| SCALAR Bidirectional Sync Implementation | 2025-01-14 | 6 functions modified in DesignContext.jsx |
| OVERVIEW Planning Tools | 2025-01-14 | PlanningCanvas, Timeline, NoteBlock, ColorPalette |
| DESIGN Phase 6: System Testing | 2025-01-11 | 180 tests passed, all phases complete |
| DESIGN Phase 5: ScalarDock | 2025-01-11 | Tree-based SCALAR editor |
| DESIGN Phase 4: WorkDock | 2025-01-11 | Lesson dock with filtering |
| DESIGN Phase 3: WheelNav | 2025-01-11 | 5-level hierarchy navigation |
| DESIGN Phase 2: LessonCardPrimitive | 2025-01-11 | Unified lesson card component |
| DESIGN Phase 1: Canonical Data Model | 2025-01-11 | Normalized stores with deterministic numbering |
| FORMAT Page (All 6 Phases) | 2025-12-30 | TemplateContext, IndexedDB, all editors |
| Build page implementation | 2025-12-30 | Slide authoring, bidirectional sync |

---

## Task Log (Audit Trail)

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
