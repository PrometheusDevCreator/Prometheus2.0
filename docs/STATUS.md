# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-01-15
**Last Session By:** Claude Code (CC)

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
| 2025-01-15 | CC | **Lesson Editor Redesign**: Two-column layout, notes tabs, image upload, view destination tabs |
| 2025-01-14 | CC | **SCALAR Bidirectional Sync**: 6 functions modified in DesignContext.jsx for Topic/Subtopic sync |
| 2025-01-14 | CC | **OVERVIEW Planning Tools**: PlanningCanvas, Timeline, NoteBlock, ColorPalette, CourseElementBar |
| 2025-01-11 | CC | Phase 6 System Testing: 180 tests passed, all Calm Wheel phases complete |
| 2025-01-11 | CC | Phase 2-6 Integration: Canonical store, LessonCardPrimitive, WheelNav, ScalarDock, WorkDock |

---

## Latest Commit

```
commit 5410705 (feature/design-calm-wheel)
Date: 2025-01-15

feat(UI): Redesign LessonEditorModal with two-column professional layout

- Two-column design (left: form fields, right: notes/images)
- Slide Notes / Instructor Notes tabs with pagination
- Image drag-and-drop upload area
- View destination tabs: UNALLOCATED / TIMETABLE / SCALAR
- 1 file modified (+793 / -696 lines), 1 mockup added
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

### Lesson Editor Modal Redesign (2025-01-15)

**Complete rewrite** of `LessonEditorModal.jsx` with professional two-column layout:
- Left column: All form dropdowns (LO, Topics, Subtopics, Type, Times, PC)
- Right column: Notes tabs with pagination, Image drag-drop upload
- Bottom: View destination tabs, CANCEL/SAVE buttons

**Key state patterns:**
```javascript
const [activeNotesTab, setActiveNotesTab] = useState('slide')
const [activeViewTab, setActiveViewTab] = useState('timetable')
const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
const [slideNotes, setSlideNotes] = useState([''])
const [instructorNotes, setInstructorNotes] = useState([''])
```

**Testing completed:** All 14 manual tests passed via Playwright

### SCALAR Bidirectional Sync (Implemented 2025-01-14)

**Root cause fixed:** Data store mismatch between LessonEditor and ScalarDock
- Now synchronized via 6 modified functions in DesignContext.jsx

**Functions:** `addTopicToLesson`, `addSubtopicToLessonTopic`, `updateLessonTopic`, `updateLessonSubtopic`, `updateScalarNode`, `deleteScalarNode`

### Testing Status

- Lesson Editor Modal: All manual tests PASSING
- SCALAR Sync: Ready for user validation
- Test files: `prometheus-ui/test_bidirectional_sync.py`, `test_scalar.py`

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
