# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-01-14
**Last Session By:** Claude Code (CC)

---

## Quick Summary

- **UI:** Stable and complete for current pages (Login, Navigate, Define, Design, BUILD, FORMAT)
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
| 2025-01-14 | CC | **SCALAR Bidirectional Sync**: 6 functions modified in DesignContext.jsx for Topic/Subtopic sync |
| 2025-01-14 | CC | **OVERVIEW Planning Tools**: PlanningCanvas, Timeline, NoteBlock, ColorPalette, CourseElementBar |
| 2025-01-11 | CC | Phase 6 System Testing: 180 tests passed, all Calm Wheel phases complete |
| 2025-01-11 | CC | Phase 2-6 Integration: Canonical store, LessonCardPrimitive, WheelNav, ScalarDock, WorkDock |
| 2025-01-09 | CC | Comprehensive status report, testing framework operational |

---

## Latest Commit

```
commit 675d12f (feature/design-calm-wheel)
Date: 2025-01-14

feat(SCALAR): Bidirectional sync and OVERVIEW planning tools

- Implement bidirectional sync between LessonEditor and SCALAR
- Topics/Subtopics added in LessonEditor now appear in SCALAR
- Changes in SCALAR propagate back to lesson data
- Add PlanningCanvas, Timeline, NoteBlock for OVERVIEW
- 21 files changed, +4,441 / -1,450 lines
```

---

## Known Blockers

None currently.

---

## Technical Debt

| Item | Location | Priority |
|------|----------|----------|
| Backend not connected | `core/api/` | HIGH |
| PKE not implemented | `core/pke/` | HIGH |
| Consumer migration (LessonBlock) | `src/components/design/` | LOW |
| Deprecated files retained | `src/deprecated/` | LOW |

---

## Session Handoff Notes

*Important context for the next session:*

### SCALAR Bidirectional Sync (Implemented 2025-01-14)

**Root cause fixed:** Data store mismatch between LessonEditor and ScalarDock
- LessonEditor was writing to `lesson.topics` and `scalarData`
- ScalarDock was reading from `canonicalData.topics`
- Now synchronized via 6 modified functions in DesignContext.jsx

**Functions modified:**
1. `addTopicToLesson` - Now writes to canonicalData
2. `addSubtopicToLessonTopic` - Now writes to canonicalData
3. `updateLessonTopic` - Syncs to canonical
4. `updateLessonSubtopic` - Syncs to canonical
5. `updateScalarNode` - Propagates back to lessons
6. `deleteScalarNode` - Propagates deletes to lessons

### New OVERVIEW Components

| Component | Purpose |
|-----------|---------|
| `PlanningCanvas.jsx` | Infinite-pan canvas for course planning |
| `Timeline.jsx` | Unit-based timeline with duration bars |
| `NoteBlock.jsx` | Free-form planning notes |
| `ColorPalette.jsx` | Color label management |
| `CourseElementBar.jsx` | Element management toolbar |
| `TabSelector.jsx` | OVERVIEW/TIMETABLE switching |

### Testing Status

- Automated Playwright tests: PASSING
- Manual testing recommended for full CRUD validation
- Test files: `prometheus-ui/test_bidirectional_sync.py`, `test_scalar.py`

---

## Related Documents

- [TODO.md](TODO.md) - Active task backlog
- [IDEAS.md](IDEAS.md) - Strategic ideas parking lot
- [../CLAUDE.md](../CLAUDE.md) - AI entry point and project context
- [../UI_DOCTRINE.md](../UI_DOCTRINE.md) - Immutable UI frame definitions
- [../CLAUDE_PROTOCOL.md](../CLAUDE_PROTOCOL.md) - Task execution protocol
- [briefs/SARAH_BRIEF_scalar-bidirectional-sync_2025-01-14.md](briefs/SARAH_BRIEF_scalar-bidirectional-sync_2025-01-14.md) - Latest session brief

---

*This file is the authoritative status source. Historical snapshots are in `docs/briefs/`.*
