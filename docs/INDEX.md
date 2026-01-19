# Prometheus Documentation Index

**Version:** 1.0
**Created:** 2025-01-18
**Last Verified:** 2025-01-18
**Maintained By:** Claude Code (CC)

---

## Purpose

This is the **master index** of all Prometheus documentation. It serves as the single reference point for locating authoritative specifications, operational documents, and historical records.

**Indexing Rules:**
- All new documentation must be added to this index
- Status must be updated when documents change
- DEPRECATED documents must be moved to Archive section

---

## 1. Root-Level Governance Documents

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `/CLAUDE.md` | AI assistant entry point and project context | ACTIVE | 2025-01-18 |
| `/CLAUDE_PROTOCOL.md` | Task execution protocol (MANDATORY) | ACTIVE | 2025-01-18 |
| `/UI_DOCTRINE.md` | Immutable UI frame definitions (MANDATORY) | ACTIVE | 2025-01-18 |
| `/PLAYWRIGHT_CONFIG.md` | Viewport and screenshot standards (MANDATORY) | ACTIVE | 2025-01-18 |
| `/README.md` | Project overview | ACTIVE | 2025-01-18 |

---

## 2. Core Operational Documents

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/STATUS.md` | **Authoritative** current system state | ACTIVE | 2025-01-18 |
| `docs/TODO.md` | Active task backlog | ACTIVE | 2025-01-18 |
| `docs/IDEAS.md` | Strategic ideas parking lot | ACTIVE | 2025-01-18 |
| `docs/ISSUES_LOG.md` | Issue tracking log | ACTIVE | 2025-01-18 |
| `docs/SESSION_CHECKLIST.md` | End-of-session verification gate | ACTIVE | 2025-01-18 |

---

## 3. Data Model Specifications

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/COURSE_DATA_CONTRACT.md` | **AUTHORITATIVE** canonical course data model | ACTIVE | 2025-01-18 |

---

## 3.1 Diagnostic Documents (docs/diagnostics/)

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/diagnostics/state-map.md` | All state stores, readers, writers, rehydration | ACTIVE | 2025-01-18 |
| `docs/diagnostics/mutation-map.md` | All mutation paths by entity type | ACTIVE | 2025-01-18 |
| `docs/diagnostics/fix-plan.md` | Canonical model alignment remediation plan | PENDING APPROVAL | 2025-01-18 |

---

## 4. Architecture & System Design

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/architecture-overview.md` | System architecture overview | ACTIVE | 2025-01-18 |
| `docs/memory-framework.md` | PKE memory framework design | ACTIVE | 2025-01-18 |
| `docs/workflows-overview.md` | Workflow patterns | ACTIVE | 2025-01-18 |
| `docs/chronicle-system.md` | Chronicle logging system design | ACTIVE | 2025-01-18 |
| `docs/chronicle-schema.md` | Chronicle data schema | ACTIVE | 2025-01-18 |
| `docs/import-scalar.md` | SCALAR import specifications | ACTIVE | 2025-01-18 |

---

## 5. Governance & Safety

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/prometheus-constitution.md` | Core governance principles | ACTIVE | 2025-01-18 |
| `docs/safety-governance.md` | Safety and governance framework | ACTIVE | 2025-01-18 |

---

## 6. Testing Documentation

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/Prometheus_Testing_Doctrine.txt` | Testing doctrine (MT/IT/SOC) | ACTIVE | 2025-01-18 |
| `docs/TESTING.md` | Testing procedures and guidelines | ACTIVE | 2025-01-18 |

---

## 7. UI Reference Documents

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `docs/ui/GRID_REFERENCE.md` | Grid coordinate system (1890x940 baseline) | ACTIVE | 2025-01-18 |
| `docs/ui/FORMAT_Task_Order_v2.txt` | FORMAT page task order | ACTIVE | 2025-01-18 |
| `docs/FONT_MAP.md` | Typography specifications | ACTIVE | 2025-01-18 |
| `docs/KEYBOARD_SHORTCUTS.md` | Keyboard shortcuts reference | ACTIVE | 2025-01-18 |
| `docs/UI_VERIFICATION_CHECKLIST.md` | UI verification checklist | ACTIVE | 2025-01-18 |
| `docs/SCALING_DIAGNOSTIC_REPORT.md` | Scaling diagnostic report | ACTIVE | 2025-01-18 |
| `prometheus-ui/MOCKUP_SPECS.md` | PowerPoint mockup measurements | ACTIVE | 2025-01-18 |

---

## 8. Session Briefs (docs/briefs/)

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `SARAH_BRIEF_lesson-editor-redesign_2025-01-15.md` | Lesson Editor redesign session | ACTIVE | 2025-01-18 |
| `SARAH_BRIEF_scalar-bidirectional-sync_2025-01-14.md` | SCALAR sync implementation | ACTIVE | 2025-01-18 |
| `SARAH_BRIEF_status-update_2025-01-09.md` | Status update session | ACTIVE | 2025-01-18 |
| `SARAH_BRIEF_format-page-implementation_2025-12-30.md` | FORMAT page implementation | ACTIVE | 2025-01-18 |
| `SARAH_BRIEF_overview-timetable-enhancements_2025-12-30.md` | OVERVIEW/TIMETABLE enhancements | ACTIVE | 2025-01-18 |
| `SARAH_BRIEF_wheel-ui-refinements_2025-12-30.md` | Wheel UI refinements | ACTIVE | 2025-01-18 |
| `DESIGN_CALM_WHEEL_SURVEY.md` | Design Calm Wheel survey | ACTIVE | 2025-01-18 |
| `DESIGN_PAGE_IMPLEMENTATION_PLAN.md` | Design page implementation plan | ACTIVE | 2025-01-18 |
| `PHASE1_TEST_LOG.md` | Phase 1 test log | ACTIVE | 2025-01-18 |
| `PHASE2_TEST_LOG.md` | Phase 2 test log | ACTIVE | 2025-01-18 |
| `PHASE3_TEST_LOG.md` | Phase 3 test log | ACTIVE | 2025-01-18 |
| `PHASE4_INTEGRATION_CONTRACT.md` | Phase 4 integration contract | ACTIVE | 2025-01-18 |
| `PHASE4_TEST_LOG.md` | Phase 4 test log | ACTIVE | 2025-01-18 |
| `PHASE5_TEST_LOG.md` | Phase 5 test log | ACTIVE | 2025-01-18 |
| `PHASE6_TEST_LOG.md` | Phase 6 test log | ACTIVE | 2025-01-18 |
| `SARAH_PHASE3_REPORT.md` | Sarah Phase 3 report | ACTIVE | 2025-01-18 |
| `M4_GATE_TEST_LOG.md` | **M4 Migration gate test log** | ACTIVE | 2025-01-19 |

*Older briefs (2025-12-08 to 2025-12-15) retained for historical reference.*

---

## 9. Refactor Baseline (docs/refactor-baseline/)

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `PIXEL_MAP.md` | Pixel mapping reference | ACTIVE | 2025-01-18 |
| `LAYOUT_CONSTANT_AUDIT.md` | Layout constants audit | ACTIVE | 2025-01-18 |
| `TASKING_ORDER_Grid_Upgrade.md` | Grid upgrade task order | ACTIVE | 2025-01-18 |
| `Baseline/` | Baseline screenshots (1920x1080) | REFERENCE | 2025-01-18 |
| `Phase 1-2/` | Phase 1-2 screenshots | REFERENCE | 2025-01-18 |
| `Phase 3/` | Phase 3 screenshots | REFERENCE | 2025-01-18 |
| `Phase4FounderTest/` | Phase 4 founder test screenshots | REFERENCE | 2025-01-18 |

---

## 10. Component READMEs

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `core/README.md` | Core module documentation | ACTIVE | 2025-01-18 |
| `orchestrator/README.md` | Orchestrator module documentation | ACTIVE | 2025-01-18 |
| `prometheus-ui/README.md` | Frontend module documentation | ACTIVE | 2025-01-18 |
| `ui/README.md` | UI prototypes documentation | ACTIVE | 2025-01-18 |

---

## 11. Claude Code Optimisation

> **SELECTIVE ADOPTION (M4.5)**
>
> Non-executable reference materials adopted as ACTIVE documentation.
> Hooks, settings.json, and install.sh remain REFERENCE ONLY.
> See CLAUDE_PROTOCOL.md Appendix C for usage.

### 11.1 Adopted Materials (ACTIVE)

| File | Purpose | Status | Last Verified |
|------|---------|--------|---------------|
| `.planning/STATE.md` | Session state template | ACTIVE | 2025-01-19 |
| `.claude/commands/context.md` | Context analysis command | ACTIVE | 2025-01-19 |
| `.claude/commands/handoff.md` | Session handoff command | ACTIVE | 2025-01-19 |
| `.claude/commands/resume.md` | Session resume command | ACTIVE | 2025-01-19 |
| `.claude/commands/worktree.md` | Parallel branch command | ACTIVE | 2025-01-19 |
| `.claude/commands/audit.md` | Project audit command | ACTIVE | 2025-01-19 |
| `.claude/rules/python-files.md` | Python coding standards | ACTIVE | 2025-01-19 |
| `.claude/rules/typescript-files.md` | TypeScript/React standards | ACTIVE | 2025-01-19 |
| `.claude/rules/html-files.md` | HTML dashboard standards | ACTIVE | 2025-01-19 |

### 11.2 Reference Materials (NOT ADOPTED)

| File | Purpose | Status | Source |
|------|---------|--------|--------|
| `docs/cc/CLAUDE_CODE_GUIDE.md` | Universal development protocol concepts | REFERENCE ONLY | External (Claude) |
| `docs/cc/IMPLEMENTATION-GUIDE.md` | Installation and workflow guide | REFERENCE ONLY | External (Claude) |
| `docs/cc/optimization-package/install.sh` | Installation script | REFERENCE ONLY | External (Claude) |
| `docs/cc/optimization-package/.claude/settings.json` | Permissions config | REFERENCE ONLY | External (Claude) |
| `docs/cc/optimization-package/.claude/hooks/` | Hook scripts | REFERENCE ONLY | External (Claude) |

### 11.3 Optimization Package Structure (Reference)

```
docs/cc/optimization-package/
├── CLAUDE_CODE_GUIDE.md          (REFERENCE ONLY)
├── IMPLEMENTATION-GUIDE.md       (REFERENCE ONLY)
├── install.sh                    (REFERENCE ONLY — NOT EXECUTABLE)
├── .planning/
│   └── STATE.md                  (ADOPTED → /.planning/STATE.md)
└── .claude/
    ├── settings.json             (REFERENCE ONLY)
    ├── hooks/                    (REFERENCE ONLY)
    ├── rules/                    (ADOPTED → /.claude/rules/)
    └── commands/                 (ADOPTED → /.claude/commands/)
```

**Integration Status:** SELECTIVE ADOPTION — Per M4.5 Task Order (2025-01-19)

---

## 12. Archive (DEPRECATED/SUPERSEDED)

| File | Purpose | Status | Superseded By | Date Archived |
|------|---------|--------|---------------|---------------|
| `/STATUS.md` | Root-level status (redirect only) | DEPRECATED | `docs/STATUS.md` | 2025-01-18 |
| `docs/CANONICAL_DATA_MODEL.md` | Original canonical model proposal | SUPERSEDED | `docs/COURSE_DATA_CONTRACT.md` | 2025-01-18 |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2 | 2025-01-19 | CC | M4.5: Selective CC Optimisation Adoption (state template, runbooks, rules) |
| 1.1 | 2025-01-18 | CC | Added Claude Code Optimisation (Reference) section |
| 1.0 | 2025-01-18 | CC | Initial index creation per Task Order |

---

*This index is maintained per CLAUDE_PROTOCOL.md requirements.*
