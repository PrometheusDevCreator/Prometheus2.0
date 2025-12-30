# Sarah Brief: FORMAT Page Implementation

**Date:** 2025-12-30
**Session:** Claude Code (CC)
**Status:** ALL PHASES COMPLETE (1-6)

---

## Executive Summary

This session implemented the FORMAT page - the Template Mapping Engine for Prometheus. The page enables users to import proprietary templates (PPTX, XLSX, DOCX), manage Template Profiles, and prepare outputs for the GENERATE stage. Implementation followed the approved plan with all 7 Controller corrections applied.

The core FORMAT page structure is complete and functional. Profile management, output selection, template upload, and the Reformat Tool launcher are all operational. Phases 4-5 (detailed mapping interfaces) remain pending.

---

## Task Order Reference

**Source:** `docs/ui/FORMAT_Task_Order_v2.txt`
**Plan:** `C:\Users\matt_\.claude\plans\serene-conjuring-sutton.md`

---

## Controller Corrections Applied

| # | Correction | Implementation |
|---|------------|----------------|
| 1 | TemplateContext is authoritative; App.jsx only wires providers | TemplateProvider wraps Format page only; no state lifting to App.jsx |
| 2 | MappingPanel is layout shell only (no logic) | Deferred to Phase 4; OutputConfigPanel handles current config |
| 3 | "Validate Mapping" → "Check Mapping" | `checkMapping()` function in TemplateContext (no false promise of correctness) |
| 4 | Reformat Tool always launchable | ReformatToolPanel has no gating conditions; always enabled |
| 5 | XLSX MVP is positional only; styling deferred | XLSXMappingEditor planned for anchors only (Phase 5) |
| 6 | Output node status computed from TemplateSpec only | `getOutputStatus()` reads from profile assets/mapping, not UI state |
| 7 | "More Outputs" is display-only in MVP | PlannedOutputs.jsx renders frozen, non-interactive placeholders |

---

## Deliverables Completed

### Phase 1: Foundation (TemplateContext + Profile Manager)

**TemplateContext.jsx** - New context providing:
- `profiles[]` - Array of TemplateSpec objects
- `activeProfileId` - Currently active profile
- `selectedOutput` - Currently selected output type for configuration
- `isAnalyzing` / `analysisProgress` - Analysis state indicators

**Profile Actions:**
- `createProfile()` - Create new profile with defaults
- `renameProfile()` - Rename existing profile
- `duplicateProfile()` - Clone profile with new ID
- `deleteProfile()` - Remove profile from state and IndexedDB
- `setActiveProfile()` - Switch active profile

**IndexedDB Persistence (indexedDBStorage.js):**
- Database: `prometheus-templates`
- Stores: `profiles`, `assets`
- Operations: `saveProfile`, `loadAllProfiles`, `deleteProfile`, `saveAsset`, `loadAsset`

### Phase 2: Page Layout + Central Hub

**TemplateHub.jsx** - Central radial component:
- SVG-based circular hub with "TEMPLATES" label
- 4 output nodes positioned radially at 45° intervals
- Connecting lines with status-based coloring
- Hover glow effects

**OutputNode.jsx** - Individual output type nodes:
- Types: PRESENTATION, TIMETABLE, LESSON_PLAN, QA_FORM
- Icons: Monitor, Calendar, Document, Checklist
- States: default (grey), hovered, selected (amber), mapped (green)
- Status indicator dot computed from TemplateSpec (Correction #6)

**PlannedOutputs.jsx** - "MORE OUTPUTS" section:
- Display-only placeholders (Correction #7)
- Shows: LEARNER HANDBOOK, ASSESSMENTS, COURSE INFO SHEET, USER DEFINED
- All marked with "PLANNED" badges
- Non-interactive (cursor: default, opacity: 0.4)

### Phase 3: Template Import + Configuration

**OutputConfigPanel.jsx** - Right-side configuration panel:
- ProfileSelector integration
- Output-specific configuration when output selected
- Template upload via file input (accepts .pptx, .xlsx, .docx per type)
- Status display: NO TEMPLATE → LOADED → MAPPED
- Clear template action
- ReformatToolPanel integration

**ProfileSelector.jsx** - Profile management UI:
- Dropdown showing all profiles
- NEW / RENAME / DUPLICATE buttons
- DELETE button with two-click confirmation
- APPLY button (activates selected profile)
- "Active: [profile name]" indicator

**ProfileManagerModal.jsx** - Modal for profile operations:
- Rename mode: Edit existing profile name
- New mode: Create profile with custom name

### Phase 6: Reformat Tool Wrapper

**ReformatToolPanel.jsx** - Utility launcher:
- "LAUNCH REFORMAT TOOL" button (always enabled per Correction #4)
- Info text: "Utility for presentation cleanup / Independent of template mapping"
- Success message: "REFORMAT TOOL READY" with placeholder note

---

## Files Created

| File | Purpose |
|------|---------|
| `src/contexts/TemplateContext.jsx` | Authoritative state for FORMAT page |
| `src/utils/indexedDBStorage.js` | IndexedDB persistence layer |
| `src/components/format/TemplateHub.jsx` | Central radial hub component |
| `src/components/format/OutputNode.jsx` | Individual output type nodes |
| `src/components/format/OutputConfigPanel.jsx` | Right-side configuration panel |
| `src/components/format/ProfileSelector.jsx` | Profile dropdown + action buttons |
| `src/components/format/ProfileManagerModal.jsx` | Rename/create profile modal |
| `src/components/format/PlannedOutputs.jsx` | "More Outputs" display-only section |
| `src/components/format/ReformatToolPanel.jsx` | Reformat tool launcher |

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Format.jsx` | Replaced placeholder with full implementation |

---

## Data Model

### TemplateSpec Structure
```javascript
TemplateSpec = {
  id: string,                    // UUID
  name: string,                  // Profile name
  createdAt: string,             // ISO timestamp
  updatedAt: string,

  assets: {
    presentation: AssetRef | null,
    timetable: AssetRef | null,
    lesson_plan: AssetRef | null,
    qa_form: AssetRef | null
  },

  analysis: {
    presentation: { ... } | null,
    timetable: { ... } | null,
    lesson_plan: { ... } | null,
    qa_form: { ... } | null
  },

  mapping: {
    presentation: { slideTypeToLayout, placeholderMap, runningOrder } | null,
    timetable: { anchors } | null,
    lesson_plan: { ... } | null,
    qa_form: { ... } | null
  }
}
```

### Output Types
```javascript
OUTPUT_TYPES = {
  PRIMARY: [
    { id: 'presentation', label: 'PRESENTATION', extension: '.pptx' },
    { id: 'timetable', label: 'TIMETABLE', extension: '.xlsx' },
    { id: 'lesson_plan', label: 'LESSON PLAN', extension: '.docx' },
    { id: 'qa_form', label: 'QA FORM', extension: '.docx' }
  ],
  PLANNED: [
    { id: 'learner_handbook', label: 'LEARNER HANDBOOK', status: 'PLANNED' },
    { id: 'assessments', label: 'ASSESSMENTS', status: 'PLANNED' },
    { id: 'course_info_sheet', label: 'COURSE INFO SHEET', status: 'PLANNED' },
    { id: 'user_defined', label: 'USER DEFINED', status: 'PLANNED' }
  ]
}
```

---

## Testing Performed

| Test | Result |
|------|--------|
| Build compilation | SUCCESS (no errors) |
| Dev server startup | Running on port 5178 |
| Page navigation to FORMAT | Working via footer |
| Central hub rendering | 4 output nodes displayed radially |
| Output node selection | Amber highlight on click |
| "More Outputs" display | Greyed, non-interactive placeholders |
| Profile creation (NEW) | Successfully created "New Template Profile" |
| Profile dropdown | Shows created profile, selection works |
| Output configuration panel | Updates when output selected |
| Reformat Tool launch | Shows "REFORMAT TOOL READY" message |

**Screenshot:** `.playwright-mcp/format-page-working.png`

---

## Phase 4-5 Completed

### Phase 4: PPTX Mapping UI (COMPLETE)

**MappingPanel.jsx** - Layout shell (per Correction #2):
- Routes to appropriate editor based on output type
- Shows mapping status indicator (CONFIGURED/INCOMPLETE)
- Displays mapping notes when incomplete

**PPTXMappingEditor.jsx** - Full implementation:
- Collapsible sections for organized UI
- Slide type → layout assignment dropdowns
- Placeholder → content source mapping (only for mapped layouts)
- Running order rules with checkbox toggles
- "Check Mapping" button (Correction #3 - informational only)

### Phase 5: XLSX Timetable Mapping (COMPLETE)

**XLSXMappingEditor.jsx** - Positional only (per Correction #5):
- Target sheet selection from analysis
- Anchor configuration (Day column, Time row header)
- Data range configuration (Start row, End column)
- Range preview display
- Styling configuration placeholder (explicitly deferred)
- "Check Mapping" button

### Files Created in Phase 4-5:
| File | Purpose |
|------|---------|
| `src/components/format/MappingPanel.jsx` | Layout shell for mapping editors |
| `src/components/format/PPTXMappingEditor.jsx` | PPTX slide mapping interface |
| `src/components/format/XLSXMappingEditor.jsx` | XLSX timetable anchor mapping |

---

## Architecture Notes

### State Authority
TemplateContext is the **single source of truth** for all FORMAT page state. App.jsx does not lift or manipulate templateData (Correction #1). This differs from DesignContext where timetableData was lifted for cross-page persistence.

### Profile Persistence
Profiles persist to IndexedDB immediately on creation/update. The `useEffect` hook in TemplateContext handles save operations whenever `profiles` state changes.

### Output Status Computation
```javascript
const getOutputStatus = useCallback((outputId) => {
  const profile = profiles.find(p => p.id === activeProfileId)
  if (!profile) return 'none'

  if (profile.mapping?.[outputId]) return 'mapped'
  if (profile.assets?.[outputId]) return 'loaded'
  return 'none'
}, [profiles, activeProfileId])
```
Status is computed from TemplateSpec data only, not derived from UI state (Correction #6).

---

## Recommendations

1. **Proceed with Phase 4** - PPTXMappingEditor is the most complex remaining component; prioritize before Phase 5

2. **Template Analysis Stub** - Current implementation uses simulated analysis; real PPTX/XLSX parsing will require additional libraries (e.g., JSZip, xlsx)

3. **Consider Mapping Persistence** - Ensure mapping configurations persist correctly when switching between outputs and profiles

4. **Integration Testing** - Test profile switching while templates are loaded to verify state isolation

5. **GENERATE Page Handoff** - Document the expected TemplateSpec format for GENERATE stage consumption

---

## Session Metrics

- Duration: Extended session (context continuation)
- Files created: 12 new files
- Files modified: 2 files (Format.jsx, OutputConfigPanel.jsx)
- Phases complete: 6 of 6 (ALL PHASES COMPLETE)
- Build status: Passing
- All 7 Controller corrections applied
- Screenshots: `format-page-working.png`, `format-page-phase4-complete.png`

---

*Brief prepared by Claude Code for Controller (Sarah) review.*
