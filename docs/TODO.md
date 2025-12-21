# Prometheus TODO

> **Tactical Task List**
>
> This is the active task backlog for Prometheus development.
> AI assistants should offer to update this file when tasks are identified or completed.
> For strategic ideas and future vision, see [IDEAS.md](IDEAS.md).

**Last Updated:** 2025-12-21
**Updated By:** Claude Code (CC)

---

## Active (Current Focus)

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| **DESIGN Page Reimplementation** | **HIGH** | **Phase 4 COMPLETE** | Phase 5 (Scalar Tab) next. See `docs/briefs/DESIGN_PAGE_IMPLEMENTATION_PLAN.md` |
| Backend API integration | HIGH | Not Started | API scaffolded in `core/api/`, needs connection to UI |
| PKE Engine implementation | HIGH | Not Started | Core intelligence feature, `core/pke/` is placeholder |

---

## Backlog (Next Up)

| Task | Priority | Notes |
|------|----------|-------|
| Build page implementation | MEDIUM | Currently placeholder in `pages/Build.jsx` |
| Format page implementation | MEDIUM | Currently placeholder in `pages/Format.jsx` |
| Generate page implementation | MEDIUM | Currently placeholder in `pages/Generate.jsx` |
| Hierarchical design spec documentation | LOW | Global rules → App-specific rulesets (for future variants/bespoke products) |
| LO Bloom's validation enforcement | LOW | Validation exists in Define.jsx, not enforced |
| Responsive testing on laptop displays | LOW | Font scaling added, needs real device testing |

---

## Completed (Recent)

| Task | Completed | Notes |
|------|-----------|-------|
| DESIGN Phase 4: Lesson Library | 2025-12-21 | LessonLibrary, LessonCard, context menus, Save to Library |
| DESIGN Phase 3: Timetable Interactions | 2025-12-21 | Drag-to-move, resize, library drag, view toggle |
| DESIGN Phase 2: Timetable Core | 2025-12-21 | TimeControls, LessonBlock, TimetableGrid |
| DESIGN Phase 1: Foundation | 2025-12-21 | DesignContext, DesignNavBar, LessonEditor |
| Documentation architecture overhaul | 2025-12-21 | Created TODO.md, IDEAS.md, updated STATUS.md |
| Fix GRID_REFERENCE.md baseline | 2025-12-21 | Aligned to 1890x940 |
| Fix .claude/settings.local.json | 2025-12-21 | Removed malformed heredoc entries |
| Grid system implementation | 2025-12-18 | Verified working |
| DESIGN page tab navigation fix | 2025-12-15 | OVERVIEW/SCALAR switching |
| Define.jsx locked at 100% spec | 2025-12-13 | Course Information complete |

---

## How to Use This File

**AI Assistants (CC, Codex, Cursor):**
- When starting a session, check this file for current priorities
- When completing a task, move it to "Completed" with date
- When identifying new work, ask: "Shall I add this to TODO.md?"
- Keep Active section to 3-5 items maximum

**Founder:**
- Review and reprioritise as needed
- Move items from IDEAS.md when ready to implement
- Mark items as blocked if dependencies exist

---

*This file is referenced by CLAUDE.md for session context.*
