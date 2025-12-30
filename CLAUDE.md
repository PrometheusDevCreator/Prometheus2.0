# CLAUDE.md - Prometheus Project Context

> **⚠️ PROTOCOL REFERENCE (MANDATORY)**
>
> This project uses the **CLAUDE_PROTOCOL.md** standard operating procedure.
> CC must read and follow `CLAUDE_PROTOCOL.md` before executing any task.
> Reference: `/CLAUDE_PROTOCOL.md` (Project Root)

> **⚠️ UI DOCTRINE (MANDATORY)**
>
> Immutable frame elements are defined in **UI_DOCTRINE.md**.
> CC must not modify doctrinal elements without Founder approval.
> Reference: `/UI_DOCTRINE.md` (Project Root)

> **⚠️ PLAYWRIGHT CONFIGURATION (MANDATORY)**
>
> All Playwright/browser operations must follow `PLAYWRIGHT_CONFIG.md`
>
> **Implementation Baseline:** 1890 × 940 (usable viewport)
>
> Before ANY screenshot or coordinate measurement:
> 1. Set viewport: `setViewportSize({ width: 1890, height: 940 })`
> 2. Verify dimensions match
> 3. Report viewport in response
>
> **Conversion factors (1890×940):**
> - Horizontal: 1vw = 18.9px
> - Vertical: 1vh = 9.4px
>
> Reference: `/PLAYWRIGHT_CONFIG.md` (Project Root)

> **📋 STATUS & TASKS**
>
> Before starting work, check current project state:
> - **Status:** `docs/STATUS.md` - Current system state, recent changes
> - **TODO:** `docs/TODO.md` - Active task backlog
> - **Ideas:** `docs/IDEAS.md` - Strategic ideas parking lot
>
> Update these files as work progresses. Offer to add ideas when Founder mentions them.

> **🧪 TESTING RESPONSIBILITIES (MANDATORY)**
>
> CC must execute testing per the **Prometheus Testing Doctrine**:
> - **Minor Tests (MTs):** Run continuously during implementation
> - **Implementation Tests (ITs):** Run at end of each Task Order or Phase
> - **System Operator Checks (SOCs):** Run ONLY when Founder explicitly orders
>
> Testing is binding, not advisory. See `docs/Prometheus_Testing_Doctrine.txt`

---

## Project Overview

**Prometheus** is a hierarchical, AI-assisted courseware and knowledge engine ecosystem.

### Core Team Roles

| Role | Name | Responsibility |
|------|------|----------------|
| **Founder** | Matthew | Mission owner, final authority |
| **Controller** | Sarah | Architect, strategist, reviewer, long-term memory |
| **Engineer** | Claude Code (CC) | Large-scale repo changes, new features |
| **Fixer** | Codex/Cursor | Small edits, quick refactors, in-editor changes |
| **Memory Layer** | PKE | Promethean Knowledge Engine; structured memory and retrieval |
| **Control Tower** | Orchestrator | Multi-agent orchestration logic |

---

## Current Development Status

> **For detailed current status, see `docs/STATUS.md`**

**Phase:** UI Stable / Backend Pending
**UI Status:** React frontend STABLE - Login, Navigate, Define (LOCKED), Design pages functional
**Backend Status:** Scaffolded (API stub exists, not connected to UI)
**PKE Status:** Placeholder only (not implemented)
**Orchestrator Status:** Scaffolded (agent adapters defined)

---

## Actual Project Structure

```
Prometheus2.0/
│
├── CLAUDE.md                    # THIS FILE - Project context for CC
├── CLAUDE_PROTOCOL.md           # Task execution protocol (MANDATORY READ)
├── UI_DOCTRINE.md               # Immutable UI frame definitions (MANDATORY READ)
├── README.md                    # Project overview
│
├── core/                        # PKE, generation engine and API
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py             # FastAPI application entry point
│   ├── formatting/
│   │   └── __init__.py         # [PLACEHOLDER]
│   ├── generation/
│   │   └── __init__.py         # [PLACEHOLDER]
│   ├── importers/
│   │   ├── __init__.py
│   │   └── scalar_xlsx.py      # SCALAR spreadsheet importer
│   ├── models/
│   │   ├── __init__.py
│   │   └── course.py           # Course data models
│   ├── pke/
│   │   └── __init__.py         # [PLACEHOLDER] - Knowledge Engine
│   └── README.md
│
├── docs/                        # Architecture, governance, memory, workflows
│   ├── architecture-overview.md
│   ├── chronicle-schema.md
│   ├── chronicle-system.md
│   ├── import-scalar.md
│   ├── memory-framework.md
│   ├── prometheus-constitution.md
│   ├── Prometheus_Development_Order_v1.docx
│   ├── safety-governance.md
│   ├── workflows-overview.md
│   └── briefs/                  # Sarah briefing documents
│       └── [audit and status briefs]
│
├── orchestrator/                # Multi-agent orchestration logic
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── claude_adapter.py   # Claude Code integration
│   │   ├── sarah_adapter.py    # Sarah (Controller) integration
│   │   └── tools_adapter.py    # Tool integrations
│   ├── chronicle_agent.py      # Chronicle/logging agent
│   ├── logs/                    # [EMPTY] - Runtime logs
│   ├── routes/
│   │   └── __init__.py         # [PLACEHOLDER]
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task_schema_example.yaml
│   └── README.md
│
├── prometheus-ui/               # React frontend (PRIMARY UI)
│   ├── dist/                    # Built production files
│   ├── src/
│   │   ├── App.jsx             # Main app with routing
│   │   ├── App.css
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css
│   │   ├── assets/
│   │   │   ├── PKE_Button.png
│   │   │   ├── prometheus-logo.png
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── DebugGrid.jsx      # Toggle with Ctrl+G
│   │   │   ├── GradientBorder.jsx # Reusable border component
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── PKEInterface.jsx
│   │   │   └── StatusBar.jsx
│   │   ├── constants/
│   │   │   └── layout.js          # Layout constants (grid, dimensions)
│   │   └── pages/
│   │       ├── Describe.jsx       # Define page (Course Information)
│   │       └── Design.jsx         # Design page (Course Content Scalar)
│   ├── MOCKUP_SPECS.md         # Design specifications from mockups
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
└── ui/                          # Prototypes and design assets
    ├── Mockups/
    │   ├── 2.0 Mockup.pptx     # Original PowerPoint mockups
    │   ├── 2.0 Mockup.zip
    │   ├── pptx_extracted/     # Extracted mockup contents
    │   └── Prometheus SilverGreen Logo.png
    ├── streamlit-prototype/
    │   └── app.py              # Streamlit prototype
    └── README.md
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `CLAUDE_PROTOCOL.md` | **MANDATORY** - Task execution protocol |
| `UI_DOCTRINE.md` | **MANDATORY** - Immutable UI frame definitions |
| `PLAYWRIGHT_CONFIG.md` | **MANDATORY** - Viewport/screenshot standards |
| `docs/STATUS.md` | **CHECK FIRST** - Current system state |
| `docs/TODO.md` | **CHECK FIRST** - Active task backlog |
| `docs/IDEAS.md` | Strategic ideas parking lot |
| `docs/ui/GRID_REFERENCE.md` | Grid coordinate system (1890×940 baseline) |
| `prometheus-ui/MOCKUP_SPECS.md` | Exact measurements from PowerPoint mockups |
| `docs/prometheus-constitution.md` | Core governance principles |
| `docs/architecture-overview.md` | System architecture |
| `core/api/main.py` | Backend API entry point |
| `prometheus-ui/src/App.jsx` | Frontend main application |

---

## Design System

| Element | Value |
|---------|-------|
| Background | `#0d0d0d` |
| Panel background | `#1a1a1a` |
| Text primary | `#f2f2f2` |
| Text muted | `#767171` |
| Accent green | `#00FF00` |
| Accent orange | `#FF6600` |
| Button gradient | `#D65700 → #763000` |
| Border gradient | `#767171 → #ffffff` |
| PKE gold | `#BF9000` |
| Font primary | Candara, Calibri, sans-serif |
| Font mono | Cascadia Code, monospace |

---

## Working Directories

### Frontend Development
```
cd prometheus-ui
npm install
npm run dev
```

### Backend Development
```
cd core
# Python environment setup required
```

---

## Important Notes

1. **Primary UI is `prometheus-ui/`** - Not the `ui/` folder (which contains prototypes only)
2. **UI_DOCTRINE.md defines immutable frames** - Read before any UI work; do not modify doctrinal elements without Founder approval
3. **Many folders are scaffolded** - `__init__.py` placeholders indicate planned functionality
4. **Documentation lives in `docs/`** - Check here for architectural decisions
5. **Sarah Briefs go in `docs/briefs/`** - Status reports and audit documents

---

## Known Gaps

> **For current task backlog, see `docs/TODO.md`**

| Gap | Location | Priority |
|-----|----------|----------|
| PKE Engine | `core/pke/` | HIGH |
| Backend API connection | `core/api/` | HIGH |
| Generation Engine | `core/generation/` | MEDIUM |
| Formatting Engine | `core/formatting/` | MEDIUM |
| Build/Format/Generate pages | `prometheus-ui/src/pages/` | MEDIUM |

---

*Last Updated: 2025-12-21*
*Updated By: Claude Code (CC) - Documentation Overhaul*

