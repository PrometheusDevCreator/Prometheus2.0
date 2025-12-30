# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-12-30
**Last Session By:** Claude Code (CC)

---

## Quick Summary

- **UI:** Stable and complete for current pages (Login, Navigate, Define, Design, BUILD)
- **Backend:** Scaffolded only - API structure exists but not connected
- **PKE Engine:** Placeholder - not yet implemented
- **Documentation:** Overhauled 2025-12-21 - now properly structured

---

## Component Status

| Component | State | Last Change | Notes |
|-----------|-------|-------------|-------|
| **prometheus-ui** | STABLE | 2025-12-30 | React frontend functional |
| **Login page** | COMPLETE | 2025-12-15 | Click-to-login implemented |
| **Navigate page** | COMPLETE | 2025-12-15 | NavWheel navigation working |
| **Define page** | UPDATED | 2025-12-30 | Wheel layout refined, Module Name removed |
| **Design - Overview** | ENHANCED | 2025-12-30 | Hierarchical blocks with nesting, duration snapping, smooth drag |
| **Design - Timetable** | ENHANCED | 2025-12-30 | BREAK lessons exempt from LO requirements, data persistence |
| **Design - Scalar** | FUNCTIONAL | 2025-12-15 | Manager/Viewer tabs, 3-column hierarchy |
| **Build page** | ENHANCED | 2025-12-30 | Slide authoring, bidirectional sync, shared timetable data |
| **Format page** | PLACEHOLDER | - | Footer integrated only |
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
| 2025-12-30 | CC | OVERVIEW hierarchical blocks: duration snapping, nesting, smooth drag; Timetable persistence; BREAK lesson fixes; LO dropdown improvements |
| 2025-12-30 | CC | BUILD page implementation with slide authoring, bidirectional sync |
| 2025-12-30 | CC | Define page wheel refinements, Design page Overview enhancements |
| 2025-12-29 | CC | Rotational wheels, resizable OVERVIEW blocks, TIMETABLE reference bars |
| 2025-12-21 | CC | Documentation overhaul: TODO.md, IDEAS.md, STATUS.md restructured |

---

## Known Blockers

None currently.

---

## Technical Debt

| Item | Location | Priority |
|------|----------|----------|
| Deprecated files retained | `src/deprecated/` | LOW |
| Backend not connected | `core/api/` | HIGH |
| PKE not implemented | `core/pke/` | HIGH |
| Content Type storage missing | `Define.jsx` | MEDIUM |

---

## Session Handoff Notes

*Important context for the next session:*

### OVERVIEW Block Behavior (Implemented)
- Block-type-specific duration increments: TERM=weeks, WEEK=days, DAY=hours, LESSON=15min, MODULE=days
- Hierarchical nesting with NESTING_RULES validation
- Auto-scaling when blocks nested into parents
- Progressive border colors based on nesting depth
- Smooth drag with global window event listeners (fixes "stuck" dragging)
- Child blocks move with parent during drag operations

### Timetable Data Persistence (Implemented)
- `timetableData` state lifted to App.jsx (contains lessons + overviewBlocks)
- DesignContext uses wrapper functions to sync changes back to App.jsx
- Data persists when navigating between DESIGN, BUILD, and other pages

### BREAK Lesson Handling (Implemented)
- BREAK lessons exempt from LO/Topic/Subtopic requirements
- No red border warning for missing LO on BREAK cards
- LO/Topic/Subtopic fields hidden in LessonEditor for BREAK type

### LO Dropdown Improvements (Implemented)
- Removed italicised "Select LO" placeholder text
- Dropdown closes after selection (allows multiple selections via reopening)

### BUILD Page State
- Slides belong to lessons; bidirectional sync between BUILD and DESIGN pages
- Explicit "+ New Slide" button required (no auto-creation on navigation)
- Progress counts only 3 primary columns + instructor notes per slide
- Format and Generate pages remain placeholders

---

## Related Documents

- [TODO.md](TODO.md) - Active task backlog
- [IDEAS.md](IDEAS.md) - Strategic ideas parking lot
- [../CLAUDE.md](../CLAUDE.md) - AI entry point and project context
- [../UI_DOCTRINE.md](../UI_DOCTRINE.md) - Immutable UI frame definitions
- [../CLAUDE_PROTOCOL.md](../CLAUDE_PROTOCOL.md) - Task execution protocol

---

*This file is the authoritative status source. Historical snapshots are in `docs/briefs/`.*
