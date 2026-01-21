# Prometheus Doctrinal Review Report

**Date:** 2025-01-21
**Reviewer:** Claude Code (CC)
**Purpose:** Comprehensive doctrinal review prior to System Operational Check
**Status:** COMPLETE

---

## Executive Summary

This report presents findings from a top-down review of the Prometheus 2.0 repository, focusing on doctrinal file consistency, brief analysis, and preparation for a System Operational Check (SOC) on canonical data handling functions.

**Key Findings:**
- 6 discrepancies identified across doctrinal files (3 minor, 2 documentation gaps, 1 clarification needed)
- M5 milestone fully documented with comprehensive gate logs
- Canonical data model architecture is well-documented and consistently described
- System is ready for SOC verification

---

## Part 1: Doctrinal File Discrepancies

### 1.1 Date Inconsistencies in Testing Documentation

| File | Stated Date | Issue |
|------|-------------|-------|
| `Prometheus_Testing_Doctrine.txt` | 30 December 2025 | Body text |
| `Prometheus_Testing_Doctrine.txt` | 7 January 2026 | Addendum |
| `docs/TESTING.md` | 7 January 2026 | Last Updated |

**Assessment:** The addendum date (7 January 2026) appears to be a typo for 2025, given the current project timeline. The Testing Doctrine refers to a future date that has not yet occurred.

**Recommendation:** Correct to "7 January 2025" in both files.

**Severity:** Minor

---

### 1.2 Command Naming Convention Mismatch

| Source | Command Format |
|--------|----------------|
| `CLAUDE_PROTOCOL.md` Appendix C.2 | `/cc:context`, `/cc:handoff`, `/cc:resume`, `/cc:worktree`, `/cc:audit` |
| `.claude/commands/` directory | `context.md`, `handoff.md`, `resume.md`, `worktree.md`, `audit.md` |

**Assessment:** The protocol document references commands with a `/cc:` prefix, but the actual skill files do not include this prefix. Users following the protocol may attempt to invoke non-existent commands.

**Recommendation:** Update CLAUDE_PROTOCOL.md Appendix C.2 to reflect actual command names (without `/cc:` prefix), or rename command files to match documentation.

**Severity:** Minor - Cosmetic documentation issue

---

### 1.3 UI_DOCTRINE.md Incomplete Annexes

| Annex | Title | Status |
|-------|-------|--------|
| Annex A | Layout Mapping | `[PLACEHOLDER]` |
| Annex B | Page-Specific Content Zones | `[PLACEHOLDER]` |
| Annex C | Component Library Reference | `[PLACEHOLDER]` |

**Assessment:** Three annexes remain unpopulated despite UI_DOCTRINE.md being at version 2.1. These annexes would provide valuable reference for precise coordinate specifications.

**Recommendation:**
- Annex A: Populate after next visual verification session with Founder
- Annex B: Document as pages stabilize
- Annex C: Consider generating from code inspection

**Severity:** Documentation gap - Non-blocking

---

### 1.4 Design System Color Token Variance

| Document | Orange Accent | Notes |
|----------|---------------|-------|
| CLAUDE.md | `#FF6600` | Accent orange |
| UI_DOCTRINE.md | `#FF6600` | Text Highlight |
| Sarah Brief M5 | `#d4730c` | `THEME.AMBER` |
| CLAUDE.md | `#D65700` | Button gradient start |

**Assessment:** Multiple orange/amber tones are used across the system:
- `#FF6600` - Primary accent orange (bright)
- `#D65700` - Button gradient start (burnt orange)
- `#d4730c` - THEME.AMBER (similar to button gradient)

These are intentionally different colors serving different purposes, but the naming could be clearer.

**Recommendation:** Add a color token glossary to UI_DOCTRINE.md Section 5 clarifying when each orange variant is used.

**Severity:** Clarification needed - Not a conflict

---

### 1.5 IDEAS.md Staleness

| Metric | Value |
|--------|-------|
| Last Updated | 2025-12-21 |
| Days Since Update | ~30 days |
| Ideas Captured | 2 (Architecture Ideas only) |

**Assessment:** The IDEAS.md strategic parking lot has not been updated throughout the M4/M5 development phases. Several strategic considerations from briefs could be captured here.

**Recommendation:** Review briefs for strategic items to capture:
- Backend API connection approach
- PKE Engine architecture
- Performance Criteria CRUD design

**Severity:** Documentation gap - Housekeeping

---

### 1.6 README.md vs CLAUDE.md Depth

| File | Lines | Purpose |
|------|-------|---------|
| README.md | 38 | External overview |
| CLAUDE.md | 200+ | AI context (authoritative) |

**Assessment:** README.md provides minimal information compared to CLAUDE.md. External contributors would not understand the project structure without reading CLAUDE.md.

**Recommendation:** Consider expanding README.md with basic project structure or explicitly directing readers to CLAUDE.md.

**Severity:** Minor - Expected for internal project

---

## Part 2: Briefs Folder Analysis

### 2.1 Brief Inventory

| Category | Count | Date Range |
|----------|-------|------------|
| Sarah Briefs | 15 | 2025-12-08 to 2025-01-20 |
| Phase Gate Logs | 12 | 2025-01-09 to 2025-01-20 |
| Status Documents | 3 | Various |
| Design Documents | 3 | Various |
| **Total** | **40** | |

### 2.2 Recent Development Timeline (from Briefs)

```
2025-01-20  M5 Comprehensive Brief (SARAH_BRIEF_M5_COMPREHENSIVE_2025-01-20.md)
            M5 Gate Log (M5_GATE_LOG.md)
            Phase F Gate Log (PHASE_F_GATE_LOG.md)

2025-01-19  Phase B/C/D/E Gate Logs
            M4 Gate Test Log (M4_GATE_TEST_LOG.md)

2025-01-15  Lesson Editor Redesign Brief

2025-01-14  SCALAR Bidirectional Sync Brief

2025-01-11  Phase 1-6 Test Logs
            Design Calm Wheel Survey
```

### 2.3 M5 Comprehensive Brief Summary

**Document:** `SARAH_BRIEF_M5_COMPREHENSIVE_2025-01-20.md`

This is an exceptionally thorough brief (575 lines) covering:

1. **Project Structure** - Complete repo overview
2. **Architecture** - Canonical data model with diagrams
3. **Phase History** - M4 through M5 Micro changes
4. **Component Inventory** - 9 pages, 30+ Design components, 2 contexts
5. **Technical Patterns** - Transactional editing, derived state, DEV ASSERTIONs
6. **Commit History** - 10 key commits documented
7. **Test Infrastructure** - Testing doctrine compliance
8. **Current State** - What works, what doesn't
9. **Recommendations** - Next session priorities

**Key Technical Architecture Points:**

```
CANONICAL DATA STORE
├── canonicalData.los         (Learning Objectives)
├── canonicalData.topics      (Topics)
├── canonicalData.subtopics   (Subtopics)
├── canonicalData.performanceCriteria (PCs)
└── lessons[]                 (Lesson objects with links)

TRANSACTIONAL MODEL
├── getLessonEditorModel()    (Canonical read)
└── saveLessonEditorModel()   (Atomic write)

CONSUMERS (All derive from canonical)
├── TimetableGrid
├── LessonEditorModal
├── ScalarDock
└── Linking Mode
```

**GUARDRAIL Implementation:**
- 7 GUARDRAIL comments placed in critical paths
- Prevents bypass of canonical patterns
- Located in DesignContext.jsx, LessonEditorModal.jsx, ScalarDock.jsx

---

## Part 3: SOC Preparation - Canonical Data Handling

### 3.1 Functions to Verify

Based on M5 documentation, the following canonical data handling functions require SOC verification:

#### Core Transactional Functions

| Function | File | Lines | Purpose |
|----------|------|-------|---------|
| `getLessonEditorModel(lessonId)` | DesignContext.jsx | 1774-1908 | Canonical read for lesson hydration |
| `saveLessonEditorModel(lessonId, model)` | DesignContext.jsx | 1910-1960 | Atomic writeback of lesson data |

#### SCALAR State Functions

| Function | File | Purpose |
|----------|------|---------|
| `expandAllScalar()` | DesignContext.jsx | Expand all LOs/topics (writes to canonical) |
| `collapseAllScalar()` | DesignContext.jsx | Collapse all LOs/topics (writes to canonical) |
| `toggleScalarExpand()` | DesignContext.jsx | Individual expand/collapse |

#### Topic/Subtopic Functions

| Function | Purpose |
|----------|---------|
| `addTopicToLesson()` | Create topic linked to lesson and LO |
| `addSubtopicToLessonTopic()` | Create subtopic linked to topic |
| `updateTopicTitle()` | Update topic title in canonical |
| `updateSubtopicTitle()` | Update subtopic title in canonical |

#### LO Functions

| Function | File | Purpose |
|----------|------|---------|
| `setCanonicalLearningObjectives()` | DesignContext.jsx | Write LOs to canonical |
| (DEFINE.jsx `handleSave`) | Define.jsx | Writes LOs directly to canonicalData.los |

### 3.2 SOC Test Matrix

| Test ID | Category | Test Description | Expected Result |
|---------|----------|------------------|-----------------|
| SOC-CD-01 | Hydration | Open Lesson Editor on existing lesson | Model hydrated from canonical with correct fields |
| SOC-CD-02 | Hydration | Verify LO dropdown populated | Shows LOs from canonicalData.los with verb + description |
| SOC-CD-03 | Transactional | Modify title, click CANCEL | Title reverts, no canonical write |
| SOC-CD-04 | Transactional | Modify title, click SAVE | Title persists in Timetable, SCALAR, and re-open |
| SOC-CD-05 | Topic Create | Click + next to TOPICS | Topic created in canonical with serial number |
| SOC-CD-06 | Subtopic Create | Click + next to SUB TOPICS | Subtopic created linked to topic |
| SOC-CD-07 | Persistence | Close and reopen Lesson Editor | All topics/subtopics persist |
| SOC-CD-08 | SCALAR Sync | Edit topic title in Lesson Editor | Title updates in SCALAR column immediately |
| SOC-CD-09 | Expand All | Click "Display All" in SCALAR | All LOs and topics expand, canonical state updated |
| SOC-CD-10 | Collapse All | Click "Collapse All" in SCALAR | All LOs and topics collapse, canonical state updated |
| SOC-CD-11 | Timetable Reactivity | Change lesson time, save | Timetable block moves to new position |
| SOC-CD-12 | Timetable Reactivity | Change lesson type, save | Timetable block color changes |
| SOC-CD-13 | DEFINE LO Write | Edit LO in Define page, save | LO appears in Design page OutlinePlanner |
| SOC-CD-14 | Cross-View | Create topic in Lesson Editor | Topic appears in SCALAR hierarchy |
| SOC-CD-15 | Linking Mode | Link LO to lesson | Lesson shows LO link in editor and SCALAR |

### 3.3 Console Log Markers to Watch

| Marker | Indicates |
|--------|-----------|
| `[PHASE_F]` | Transactional model operations |
| `[CANONICAL]` | Canonical data store writes |
| `[M5_TIMETABLE_REACTIVITY]` | Timetable state changes |
| `[M5_TIMETABLE_REACTIVITY_MISMATCH]` | Prop/canonical drift (should NOT appear) |
| `[M5_SCALAR_EXPAND_ALL]` | Expand all operation |
| `[M5_SCALAR_COLLAPSE_ALL]` | Collapse all operation |
| `[M4_FALLBACK_WARNING]` | Derivation fallback (should NOT appear) |

### 3.4 Files to Verify During SOC

| File | Critical Lines | What to Check |
|------|----------------|---------------|
| DesignContext.jsx | 1774-1960 | Transactional functions exist with GUARDRAIL comments |
| DesignContext.jsx | 2238-2290 | expandAllScalar/collapseAllScalar write to canonical |
| LessonEditorModal.jsx | 231-316 | Hydration via getLessonEditorModel |
| LessonEditorModal.jsx | 351-438 | Save via saveLessonEditorModel |
| ScalarDock.jsx | 962-1001 | Derived expand state (useMemo, not useState) |
| LessonBlock.jsx | 80-113 | DEV ASSERTION for reactivity mismatch |
| TimetableGrid.jsx | 71-90 | Debug log for timetable reactivity |

### 3.5 GUARDRAIL Verification Checklist

Run grep to verify all 7 GUARDRAILs are in place:

```bash
grep -r "GUARDRAIL \[M5.7\]" prometheus-ui/src/
```

Expected results:
- [ ] DesignContext.jsx:1780 - `getLessonEditorModel` canonical read
- [ ] DesignContext.jsx:1921 - `saveLessonEditorModel` transactional write
- [ ] DesignContext.jsx:2239 - `expandAllScalar` canonical expand
- [ ] DesignContext.jsx:2266 - `collapseAllScalar` canonical collapse
- [ ] LessonEditorModal.jsx:232 - Hydration via canonical
- [ ] LessonEditorModal.jsx:352 - Save via canonical
- [ ] ScalarDock.jsx:965 - Derived expand state

---

## Part 4: Recommendations

### Immediate Actions (Before SOC)

1. **Verify build succeeds:** `npm run build` in prometheus-ui
2. **Verify dev server starts:** `npm run dev` returns HTTP 200
3. **Check for console errors:** Browser dev tools should be clean

### During SOC

1. Execute all 15 tests in SOC Test Matrix (Section 3.2)
2. Verify all 7 GUARDRAILs present (Section 3.5)
3. Watch for warning markers in console (Section 3.3)
4. Document any deviations in SOC report

### Post-SOC

1. Correct Testing Doctrine date discrepancy
2. Update CLAUDE_PROTOCOL.md command naming
3. Consider populating UI_DOCTRINE annexes
4. Update IDEAS.md with strategic backlog items

---

## Appendix A: Document Cross-Reference Matrix

| Topic | CLAUDE.md | CLAUDE_PROTOCOL.md | UI_DOCTRINE.md | STATUS.md | Sarah Brief M5 |
|-------|-----------|-------------------|----------------|-----------|----------------|
| Viewport baseline | 1890x940 | 1890x940 | 1890x940 | 1890x940 | 1890x940 |
| Canonical data model | N/A | N/A | N/A | Described | Detailed |
| Testing doctrine | Referenced | Referenced | N/A | N/A | Summarized |
| Color system | Listed | Listed | Detailed | N/A | THEME tokens |
| Project structure | Detailed | Summarized | N/A | N/A | Detailed |

**Consistency:** All documents align on viewport baseline and core structure.

---

*Report generated: 2025-01-21*
*Reviewer: Claude Code (CC)*
*Next Action: Founder approval to proceed with SOC execution*
