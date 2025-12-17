# Prometheus 2.0 Directory Audit Report

**Date:** 17 December 2025
**Auditor:** Claude Code (CC)
**Branch:** refactor/responsive-ui

---

## 1. Directory Structure Map

```
Prometheus2.0/
│
├── .claude/                              # Claude Code configuration
│   └── settings.local.json
│
├── .playwright-mcp/                      # [NEW] Playwright MCP server data
│
├── CLAUDE.md                             # Project context for CC
├── CLAUDE_PROTOCOL.md                    # Task execution protocol
├── UI_DOCTRINE.md                        # Immutable UI frame definitions
├── README.md                             # Project overview
├── STATUS.md                             # [REVIEW] May be outdated
│
├── founder_audits/                       # [NEW] Founder audit reports
│   ├── GRID_IMPLEMENTATION_REPORT_2025-12-17.md
│   └── DIRECTORY_AUDIT_2025-12-17.md (this file)
│
├── core/                                 # Backend (Python)
│   ├── README.md
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py                       # FastAPI entry point
│   ├── formatting/
│   │   └── __init__.py                   # [PLACEHOLDER]
│   ├── generation/
│   │   └── __init__.py                   # [PLACEHOLDER]
│   ├── importers/
│   │   ├── __init__.py
│   │   └── scalar_xlsx.py                # SCALAR spreadsheet importer
│   ├── models/
│   │   ├── __init__.py
│   │   └── course.py                     # Course data models
│   └── pke/
│       └── __init__.py                   # [PLACEHOLDER] Knowledge Engine
│
├── docs/                                 # Documentation
│   ├── architecture-overview.md
│   ├── chronicle-schema.md
│   ├── chronicle-system.md
│   ├── import-scalar.md
│   ├── ISSUES_LOG.md
│   ├── memory-framework.md
│   ├── prometheus-constitution.md
│   ├── safety-governance.md
│   ├── SCALING_DIAGNOSTIC_REPORT.md      # Phase 4 diagnostic
│   ├── workflows-overview.md
│   │
│   ├── briefs/                           # Sarah briefing documents
│   │   ├── CUB_2025-12-12.md
│   │   ├── Refactor_Authorisation_ 2025_12_15.md  # [NOTE] Space in filename
│   │   ├── SARAH_BRIEF_audit_2025-12-08.md
│   │   ├── SARAH_BRIEF_course-info-final_2025-12-13.md
│   │   ├── SARAH_BRIEF_describe-phase2_2025-12-08.md
│   │   ├── SARAH_BRIEF_describe-refinements_2025-12-08.md
│   │   ├── SARAH_BRIEF_design-phase1_2025-12-08.md
│   │   ├── SARAH_BRIEF_design-phase1-complete_2025-12-09.md
│   │   ├── SARAH_BRIEF_footer-ui-refinements_2025-12-13.md
│   │   ├── SARAH_BRIEF_grid-system_2025-12-08.md
│   │   └── STATUS_2025-12-15.md
│   │
│   ├── refactor-baseline/                # UI refactor reference materials
│   │   ├── LAYOUT_CONSTANT_AUDIT.md
│   │   ├── PIXEL_MAP.md
│   │   ├── TASKING_ORDER_Grid_Upgrade.md
│   │   ├── useScaleToFit_original.txt
│   │   ├── Baseline/                     # Baseline screenshots (8 files)
│   │   ├── Phase 1-2/                    # Phase 1-2 screenshots + completion doc
│   │   ├── Phase 3/                      # Phase 3 screenshots + completion doc
│   │   ├── Phase4FounderTest/            # [NEW] Founder test screenshots
│   │   └── screenshots/                  # Additional screenshots
│   │
│   └── ui/
│       └── GRID_REFERENCE.md             # Grid system reference
│
├── orchestrator/                         # Multi-agent orchestration
│   ├── README.md
│   ├── chronicle_agent.py
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── claude_adapter.py             # Claude Code integration
│   │   ├── sarah_adapter.py              # Sarah (Controller) integration
│   │   └── tools_adapter.py              # Tool integrations
│   ├── logs/                             # [EMPTY] Runtime logs
│   ├── routes/
│   │   └── __init__.py                   # [PLACEHOLDER]
│   └── schemas/
│       ├── __init__.py
│       └── task_schema_example.yaml
│
├── prometheus-ui/                        # React frontend (PRIMARY)
│   ├── README.md
│   ├── MOCKUP_SPECS.md                   # Design specifications
│   ├── package.json
│   ├── package-lock.json
│   ├── eslint.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── quick-capture.js                  # [REVIEW] Utility script
│   │
│   ├── .claude/
│   │   └── settings.local.json
│   │
│   ├── .vite/                            # Vite cache (auto-generated)
│   │   ├── deps/
│   │   └── deps_temp_*/
│   │
│   ├── dist/                             # Built production files
│   │   └── assets/
│   │       ├── index-*.js
│   │       └── index-*.css
│   │
│   └── src/
│       ├── App.jsx                       # Main app with routing & scaling
│       ├── App.css                       # [EMPTY] - uses Tailwind
│       ├── main.jsx                      # React entry point
│       ├── index.css                     # Global styles, animations
│       │
│       ├── assets/
│       │   ├── PKE_Button.png
│       │   ├── prometheus-logo.png
│       │   ├── burntorangelogo.png
│       │   ├── Break_Symbol.png
│       │   └── react.svg                 # [LEGACY] Default Vite asset
│       │
│       ├── components/
│       │   ├── DebugGrid.jsx             # [LEGACY] Old grid - replaced by DevTools
│       │   ├── DevTools/                 # [NEW] Enhanced grid system
│       │   │   ├── index.js
│       │   │   ├── GridContext.jsx
│       │   │   ├── GridOverlay.jsx
│       │   │   ├── CoordinatePanel.jsx
│       │   │   ├── PinSystem.jsx
│       │   │   ├── MeasurementMode.jsx
│       │   │   └── DebugGridController.jsx
│       │   ├── DurationSlider.jsx
│       │   ├── Footer.jsx
│       │   ├── GradientBorder.jsx
│       │   ├── Header.jsx
│       │   ├── LessonBubble.jsx
│       │   ├── Navigation.jsx            # [LEGACY] Replaced by NavWheel
│       │   ├── NavWheel.jsx
│       │   ├── PKEInterface.jsx
│       │   ├── ScalarManager.jsx
│       │   ├── ScalarViewer.jsx
│       │   ├── Slider.jsx
│       │   └── StatusBar.jsx             # [LEGACY] Functionality in Footer
│       │
│       ├── constants/
│       │   ├── layout.js                 # Layout constants (grid, dimensions)
│       │   └── theme.js                  # Colors, fonts, gradients
│       │
│       ├── deprecated/                   # Explicitly deprecated code
│       │   ├── Describe.jsx              # Old Define page
│       │   └── Design.jsx                # Old Design page
│       │
│       └── pages/
│           ├── Build.jsx                 # [PLACEHOLDER]
│           ├── Define.jsx                # Course Information (LOCKED)
│           ├── Format.jsx                # [PLACEHOLDER]
│           ├── Generate.jsx              # [PLACEHOLDER]
│           ├── Login.jsx
│           ├── Navigate.jsx              # NavWheel page
│           ├── OutlinePlanner.jsx        # Design - Overview tab
│           └── Scalar.jsx                # Design - Scalar tab
│
├── ui/                                   # Prototypes & design assets
│   ├── README.md
│   ├── Mockups/                          # PowerPoint mockups
│   │   ├── 2.0 Mockup.pptx
│   │   ├── 2.0 Mockup.zip
│   │   ├── pptx_extracted/
│   │   └── Prometheus SilverGreen Logo.png
│   └── streamlit-prototype/
│       └── app.py                        # [LEGACY] Streamlit prototype
│
└── nul                                   # [DELETE] Likely accidental file
```

---

## 2. File Status Classifications

### 2.1 LEGACY Files (Recommend Removal or Archive)

| File | Location | Reason | Action |
|------|----------|--------|--------|
| `DebugGrid.jsx` | `prometheus-ui/src/components/` | Replaced by DevTools/DebugGridController | ARCHIVE to deprecated/ |
| `Navigation.jsx` | `prometheus-ui/src/components/` | Replaced by NavWheel.jsx | ARCHIVE to deprecated/ |
| `StatusBar.jsx` | `prometheus-ui/src/components/` | Functionality moved to Footer.jsx | ARCHIVE to deprecated/ |
| `react.svg` | `prometheus-ui/src/assets/` | Default Vite template asset, unused | DELETE |
| `app.py` | `ui/streamlit-prototype/` | Old Streamlit prototype, superseded | ARCHIVE or DELETE |
| `nul` | Project root | Accidental file (Windows null device redirect) | DELETE |

### 2.2 PLACEHOLDER Files (Empty/Scaffolded)

| File | Location | Status |
|------|----------|--------|
| `__init__.py` | `core/formatting/` | Empty - awaiting implementation |
| `__init__.py` | `core/generation/` | Empty - awaiting implementation |
| `__init__.py` | `core/pke/` | Empty - awaiting PKE engine |
| `__init__.py` | `orchestrator/routes/` | Empty - awaiting API routes |
| `Build.jsx` | `prometheus-ui/src/pages/` | Placeholder with Footer only |
| `Format.jsx` | `prometheus-ui/src/pages/` | Placeholder with Footer only |
| `Generate.jsx` | `prometheus-ui/src/pages/` | Placeholder with Footer only |
| `App.css` | `prometheus-ui/src/` | Empty - using Tailwind |

### 2.3 Files Requiring Updates

| File | Issue | Recommended Action |
|------|-------|-------------------|
| `STATUS.md` | Root level, likely outdated | Update or consolidate with docs/briefs/ |
| `Refactor_Authorisation_ 2025_12_15.md` | Space in filename | Rename to `Refactor_Authorisation_2025_12_15.md` |
| `quick-capture.js` | Utility script, unclear if current | Review if still needed |
| `CLAUDE_PROTOCOL.md` | Missing grid affirmation protocol | Add Section 7.4 per TASKING_ORDER |
| `UI_DOCTRINE.md` | Missing baseline reference | Add baseline resolution specs |

### 2.4 New/Untracked Files (Not in Git)

| File/Folder | Status | Action |
|-------------|--------|--------|
| `.playwright-mcp/` | MCP server data | Add to .gitignore |
| `docs/SCALING_DIAGNOSTIC_REPORT.md` | Phase 4 report | COMMIT |
| `docs/ui/` folder | New grid reference | COMMIT |
| `docs/refactor-baseline/Phase4FounderTest/` | Test screenshots | COMMIT or review |
| `prometheus-ui/src/components/DevTools/` | New grid system | COMMIT |
| `founder_audits/` | This audit | COMMIT |
| `nul` | Accidental file | DELETE before commit |

---

## 3. Duplicate/Redundant Content Analysis

### 3.1 Functional Overlaps

| Current | Redundant | Notes |
|---------|-----------|-------|
| `DevTools/DebugGridController.jsx` | `DebugGrid.jsx` | Old grid system superseded |
| `Footer.jsx` | `StatusBar.jsx` | Footer contains status bar functionality |
| `NavWheel.jsx` | `Navigation.jsx` | Old navigation component |
| `Define.jsx` | `deprecated/Describe.jsx` | Already in deprecated folder |
| `OutlinePlanner.jsx` | `deprecated/Design.jsx` | Already in deprecated folder |

### 3.2 Documentation Overlaps

| File 1 | File 2 | Overlap |
|--------|--------|---------|
| `CLAUDE.md` | `prometheus-ui/README.md` | Project structure described in both |
| `STATUS.md` | `docs/briefs/STATUS_*.md` | Status tracking in multiple places |
| `MOCKUP_SPECS.md` | `docs/refactor-baseline/PIXEL_MAP.md` | UI measurements |

---

## 4. Directory Health Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total source files | 94 | Healthy |
| Legacy files identified | 6 | Needs cleanup |
| Placeholder files | 8 | Expected (early dev) |
| Files needing updates | 5 | Minor |
| Untracked files | 7 | Need review |
| Empty directories | 1 (orchestrator/logs/) | Expected |

---

## 5. Recommendations

### 5.1 Immediate Actions (Before Next Commit)

1. **DELETE** `nul` file from project root
2. **ADD** `.playwright-mcp/` to `.gitignore`
3. **COMMIT** all DevTools files
4. **COMMIT** Phase 4 diagnostic reports

### 5.2 Short-Term Cleanup (This Week)

1. **ARCHIVE** legacy components to `deprecated/`:
   - `DebugGrid.jsx`
   - `Navigation.jsx`
   - `StatusBar.jsx`
2. **DELETE** `react.svg` (unused Vite default)
3. **RENAME** `Refactor_Authorisation_ 2025_12_15.md` (remove space)
4. **UPDATE** root `STATUS.md` or remove in favor of briefs system

### 5.3 Documentation Updates (Soon)

1. Update `CLAUDE_PROTOCOL.md` with grid affirmation protocol
2. Update `UI_DOCTRINE.md` with baseline reference (1920x1080, 100%, 100%)
3. Create `UI_SPEC_SHEET.md` for element positioning reference
4. Consolidate status reporting to single system

### 5.4 Future Consideration

1. **ui/streamlit-prototype/**: Archive or delete when no longer needed for reference
2. **docs/refactor-baseline/**: Consider archiving Phase 1-3 folders once refactor complete
3. **prometheus-ui/.vite/**: Ensure in .gitignore (build cache)

---

## 6. Git Status Summary

**Current Branch:** `refactor/responsive-ui`
**Main Branch:** `main`

### Modified (Staged/Unstaged):
- `.claude/settings.local.json`
- `prometheus-ui/src/App.jsx`
- `prometheus-ui/src/index.css`
- `prometheus-ui/src/pages/Navigate.jsx`

### Untracked:
- `.playwright-mcp/`
- `docs/SCALING_DIAGNOSTIC_REPORT.md`
- `docs/ui/`
- `docs/refactor-baseline/Phase4FounderTest/`
- `founder_audits/`
- `nul`
- `prometheus-ui/src/components/DevTools/`

---

*Audit Generated: 2025-12-17*
*Auditor: Claude Code (CC)*

**END OF AUDIT**
