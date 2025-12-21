# DESIGN PAGE — IMPLEMENTATION PLAN

**For Review By:** Sarah (Controller)
**Prepared By:** Claude Code (CC)
**Date:** 2025-12-21
**Status:** AWAITING APPROVAL

---

## 1. EXECUTIVE SUMMARY

Complete reimplementation of the DESIGN section working area with bidirectional authoring capability. Users can edit from either the Lesson Editor panel OR the Timetable grid, with changes propagating instantly between both views.

**Scope:** Content zone only (between header and footer lines)
**Out of Scope:** Header, footer, Home/Analytics buttons, DELETE/CLEAR/SAVE buttons

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│ NAVIGATION BAR                                              │
│ [Section Label] [Module ‹›] [Week ‹›]    [TIMETABLE][SCALAR]│
├──────────────────┬──────────────────────────────────────────┤
│ LESSON EDITOR    │ WORKSPACE                                │
│ (~20% width)     │ (~80% width)                             │
│                  │                                          │
│ - Selected item  │ TAB: TIMETABLE                           │
│ - Editable fields│   - Time controls                        │
│ - Topics list    │   - Day grid with lesson blocks          │
│ - LOs list       │   - Lesson Library                       │
│ - Legend         │                                          │
│                  │ TAB: SCALAR                               │
│ [Collapsible]    │   - Hierarchical tree view               │
│                  │   - Module > LO > Topic > Subtopic       │
├──────────────────┴──────────────────────────────────────────┤
│ PKE INTERFACE BAR                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. KEY DESIGN DECISIONS

| Decision | Resolution | Rationale |
|----------|------------|-----------|
| Editor on SCALAR tab | Shows selected LO/Topic data | Unified editing experience |
| LO-to-Lesson assignment | Checkbox list in Editor | Simpler than drag-drop |
| DAY view | Single day displayed | Clean, focused view |
| WEEK view | 7-day row display | Full week context |
| MODULE view | All days compressed | Module-level overview |
| Panel collapse | Toggle button + edge tab | Discoverable expansion |
| Break blocks | Title + duration only | Simpler than full lessons |
| Week definition | 5 working days | Standard default |
| PKE position | Bottom, full width, above Library | Consistent with other pages |
| Custom lesson type colors | 8-10 predefined palette | Theme compliance |
| Context menus | Custom styled | Visual consistency |

---

## 4. DATA MODEL

### 4.1 Lesson Object
```javascript
{
  id: string,
  title: string,
  type: 'instructor-led' | 'discussion' | 'project' | 'practical' |
        'seminar' | 'online' | 'admin' | 'assessment' | 'break' | string,
  duration: number,          // minutes
  startTime: string,         // "0900"
  day: number,               // 1-based
  week: number,              // 1-based
  module: number,            // 1-based
  topics: TopicReference[],
  learningObjectives: string[], // LO IDs (checkbox selection)
  scheduled: boolean,        // true = on timetable, false = in library
  saved: boolean             // true = in saved library
}
```

### 4.2 Scalar Hierarchy
```javascript
Module
├── LearningObjective[]
    ├── Topic[]
        └── Subtopic[]
```

All items have `id`, `title`, `parentId`, `order` (for drag reordering).

### 4.3 State Management
- Single source of truth for all lesson/scalar data
- Editor and Timetable are views into same state
- Changes immediate (no "apply" step)
- SAVE button commits to persistent storage (existing footer, out of scope)

---

## 5. COMPONENT STRUCTURE

### 5.1 New Components

| Component | Purpose |
|-----------|---------|
| `DesignPage.jsx` | Main container, state management |
| `DesignNavBar.jsx` | Section label, module/week controls, tabs |
| `LessonEditor.jsx` | Left panel with all editing fields |
| `TimetableWorkspace.jsx` | Timetable tab content |
| `TimeControls.jsx` | Slider and info display |
| `TimetableGrid.jsx` | Day rows and time columns |
| `LessonBlock.jsx` | Draggable/resizable lesson block |
| `LessonLibrary.jsx` | Unscheduled/Saved tabs with cards |
| `LessonCard.jsx` | Draggable library item |
| `ScalarWorkspace.jsx` | Scalar tab content |
| `ScalarTree.jsx` | Hierarchical tree with drag-reorder |
| `ScalarNode.jsx` | Individual tree node (Module/LO/Topic/Subtopic) |
| `DeleteConfirmModal.jsx` | Reassign/delete children dialog |

### 5.2 Modified Components

| Component | Changes |
|-----------|---------|
| `App.jsx` | Route to new DesignPage |
| `Footer.jsx` | Ensure PKE interface compatible |

### 5.3 Deprecated (to remove after migration)

| Component | Replacement |
|-----------|-------------|
| `OutlinePlanner.jsx` | `TimetableWorkspace.jsx` |
| `Scalar.jsx` | `ScalarWorkspace.jsx` |
| `ScalarManager.jsx` | `ScalarTree.jsx` |
| `ScalarViewer.jsx` | Merged into `ScalarTree.jsx` |

---

## 6. INTERACTION STATES

### 6.1 Lesson Block States

| State | Trigger | Visual |
|-------|---------|--------|
| Idle | Default | Standard border |
| Hover | Mouse over | Border brightens |
| Selected | Single click | Accent border + subtle glow |
| Editing | Double-click | Accent border + stronger glow + "EDITING" label |

**Rule:** Exactly ONE block may be Selected or Editing at any time.

### 6.2 Bidirectional Sync Matrix

| Action in... | Updates in... |
|--------------|---------------|
| Editor: title change | Block title |
| Editor: duration change | Block width |
| Editor: type change | Block color |
| Block: drag resize | Editor duration |
| Block: inline title edit | Editor title |
| Block: context menu type | Editor dropdown |

---

## 7. IMPLEMENTATION PHASES

### Phase 1: Foundation
- [ ] Create `DesignPage.jsx` with state structure
- [ ] Create `DesignNavBar.jsx` with tabs (non-functional)
- [ ] Create `LessonEditor.jsx` shell (collapsible panel)
- [ ] Establish data model and context provider
- **Deliverable:** Basic layout renders, tabs switch views

### Phase 2: Timetable Core
- [ ] Create `TimetableGrid.jsx` with time header
- [ ] Create `LessonBlock.jsx` with states (idle/hover/selected/editing)
- [ ] Implement single-selection logic
- [ ] Wire Editor ↔ Block selection binding
- **Deliverable:** Blocks display, clicking selects, Editor shows data

### Phase 3: Timetable Interactions
- [ ] Implement block drag-to-move
- [ ] Implement block edge drag-to-resize (30-min snap)
- [ ] Create `TimeControls.jsx` with range slider
- [ ] Implement view toggle (DAY/WEEK/MODULE)
- **Deliverable:** Full timetable interaction

### Phase 4: Lesson Library
- [ ] Create `LessonLibrary.jsx` with tabs
- [ ] Create `LessonCard.jsx` (draggable)
- [ ] Implement drag-from-library-to-grid
- [ ] Implement "Save to Library" flow
- **Deliverable:** Library fully functional

### Phase 5: Scalar Tab
- [ ] Create `ScalarWorkspace.jsx` with controls
- [ ] Create `ScalarTree.jsx` with expand/collapse
- [ ] Create `ScalarNode.jsx` with visual hierarchy
- [ ] Implement drag-reorder with auto-renumbering
- [ ] Create `DeleteConfirmModal.jsx`
- [ ] Wire Editor to show selected LO/Topic data
- **Deliverable:** Scalar tab fully functional

### Phase 6: Polish & Integration
- [ ] Verify bidirectional sync complete
- [ ] Context menu implementation
- [ ] Custom lesson type creation
- [ ] Legend component
- [ ] PKE positioning finalization
- [ ] Deprecate old components
- **Deliverable:** Production-ready DESIGN section

---

## 8. STYLING APPROACH

All values from existing constants:
- Colors: `constants/theme.js` (THEME object)
- Layout: `constants/layout.js` (LAYOUT object)
- No hardcoded hex values or pixel dimensions in components

**New tokens to add (if needed):**
- Lesson type semantic colors (may already exist)
- Block state styles (glow, border variants)

---

## 9. RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex state sync bugs | Medium | High | Single source of truth pattern, extensive testing |
| Drag-drop performance | Low | Medium | Use react-dnd or similar optimized library |
| Auto-renumbering edge cases | Medium | Medium | Thorough unit tests for hierarchy operations |
| Breaking existing functionality | Low | High | Phase approach with deprecation, not deletion |

---

## 10. DEPENDENCIES

- React DnD or equivalent (for drag operations)
- Existing theme/layout constants
- Existing Footer/Header components (unchanged)

---

## 11. SUCCESS CRITERIA

1. User can create lesson in Editor → appears in Library
2. User can drag lesson to Timetable → block appears correctly sized/colored
3. User can edit in Editor → Timetable updates instantly
4. User can resize block → Editor duration updates instantly
5. User can switch to SCALAR → see full hierarchy
6. User can drag-reorder in SCALAR → numbers auto-update
7. All styling matches existing Prometheus design language
8. No regressions to Header, Footer, or other pages

---

## 12. APPROVAL REQUEST

**Requested Action:** Sarah to review and approve this implementation plan.

Upon approval, CC will proceed with Phase 1 implementation.

**Founder Clarifications Incorporated:**
- Editor shows LO/Topic data on SCALAR tab ✓
- LO assignment via checkbox in Editor ✓
- DAY view = single day ✓
- All recommended defaults accepted ✓

---

*Document prepared for Controller review.*
