# Mutation Map - Prometheus 2.0

**Version:** 1.0
**Created:** 2025-01-18
**Purpose:** Document all mutation paths for each entity type
**Status:** DIAGNOSTIC - Phase 1 Task Order

---

## Executive Summary

This document maps every mutation path (create, edit, delete, reorder, link/unlink) for each entity type. **Critical finding:** Some mutations bypass the canonical store, violating the single-source-of-truth principle.

---

## 1. Learning Objectives (LOs)

### 1.1 Create Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| DEFINE page input | `setCourseData` | Define.jsx | courseData.learningObjectives (strings) | N/A - strings |
| SCALAR "+" button | `addLearningObjective` | DesignContext.jsx:1982 | canonicalData.los + scalarData | **YES** |

### 1.2 Edit Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| DEFINE page edit | `setCourseData` | Define.jsx | courseData.learningObjectives | N/A |
| SCALAR inline edit | `updateScalarNode('lo', ...)` | DesignContext.jsx:2157 | canonicalData.los + scalarData | **YES** |
| Lesson text field | `updateLearningObjectiveText` | DesignContext.jsx:1702 | lessons[].learningObjectives (strings) | NO (lesson-local) |

### 1.3 Delete Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR delete | `deleteScalarNode('lo', ...)` | DesignContext.jsx:2302 | canonicalData.los + scalarData | **YES** |

### 1.4 Reorder Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR drag | `reorderLO` | DesignContext.jsx:2458 | scalarData only | **NO** |

### 1.5 Link/Unlink Paths

| Path | Function | Location | Notes |
|------|----------|----------|-------|
| N/A | LOs don't link | - | LOs are top-level parents |

---

## 2. Topics

### 2.1 Create Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR "+" button | `addTopic` | DesignContext.jsx:2023 | canonicalData.topics + scalarData | **YES** |
| Lesson Editor "+" | `addTopicToLesson` | DesignContext.jsx:1223 | canonicalData.topics + scalarData + lessons | **YES** |
| **Modal "+" button** | `handleAddTopic` | **App.jsx:288** | timetableData.hierarchyData.topics | **NO - VIOLATION** |

### 2.2 Edit Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR inline edit | `updateScalarNode('topic', ...)` | DesignContext.jsx:2157 | canonicalData + scalarData | **YES** |
| SCALAR inline edit | `updateTopicTitle` | DesignContext.jsx:1624 | canonicalData + scalarData | **YES** |
| Lesson Editor edit | `updateLessonTopic` | DesignContext.jsx:1382 | lessons + canonicalData + scalarData | **YES** |

### 2.3 Delete Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR delete | `deleteScalarNode('topic', ...)` | DesignContext.jsx:2302 | canonicalData + scalarData | **YES** |
| Lesson Editor remove | `removeTopicFromLesson` | DesignContext.jsx:1373 | lessons only | NO (lesson-local) |

### 2.4 Reorder Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR drag | `reorderTopic` | DesignContext.jsx:2390 | scalarData only | **NO** |

### 2.5 Link/Unlink Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SHIFT+click (toggle) | `toggleTopicLOLink` | DesignContext.jsx:930 | canonicalData + scalarData | **YES** |
| Unlink action | `unlinkTopic` | DesignContext.jsx:1052 | scalarData only | **NO** |
| Link action | `linkTopicToLO` | DesignContext.jsx:1083 | scalarData only | **NO** |

---

## 3. Subtopics

### 3.1 Create Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR "+" button | `addSubtopic` | DesignContext.jsx:2089 | canonicalData + scalarData | **YES** |
| Lesson Editor "+" | `addSubtopicToLessonTopic` | DesignContext.jsx:1437 | canonicalData + scalarData + lessons | **YES** |
| **Modal "+" button** | `handleAddSubtopic` | **App.jsx:311** | timetableData.hierarchyData.subtopics | **NO - VIOLATION** |

### 3.2 Edit Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR inline edit | `updateScalarNode('subtopic', ...)` | DesignContext.jsx:2157 | canonicalData + scalarData | **YES** |
| SCALAR inline edit | `updateSubtopicTitle` | DesignContext.jsx:1659 | canonicalData + scalarData | **YES** |
| Lesson Editor edit | `updateLessonSubtopic` | DesignContext.jsx:1543 | lessons + canonicalData + scalarData | **YES** |

### 3.3 Delete Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR delete | `deleteScalarNode('subtopic', ...)` | DesignContext.jsx:2302 | canonicalData + scalarData | **YES** |
| Lesson Editor remove | `removeSubtopicFromLessonTopic` | DesignContext.jsx:1528 | lessons only | NO (lesson-local) |

### 3.4 Reorder Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR drag | `reorderSubtopic` | DesignContext.jsx:2427 | scalarData only | **NO** |

### 3.5 Link/Unlink Paths

| Path | Function | Location | Notes |
|------|----------|----------|-------|
| N/A | Subtopics don't link independently | - | Bound to parent topic |

---

## 4. Lessons

### 4.1 Create Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| Timetable "+" | `createLesson` | DesignContext.jsx:793 | lessons (via setLessons) | N/A |
| Modal create | `handleCreateLesson` | App.jsx:254 | timetableData.lessons | N/A |

### 4.2 Edit Paths

| Path | Function | Location | Target Store |
|------|----------|----------|--------------|
| Modal save | `handleUpdateLesson` | App.jsx:278 | timetableData.lessons |
| Timetable drag | `updateLesson` | DesignContext.jsx:786 | lessons |
| Title edit | `updateLessonTitle` | DesignContext.jsx:1617 | lessons |

### 4.3 Delete Paths

| Path | Function | Location | Target Store |
|------|----------|----------|--------------|
| Context menu | `deleteLesson` | DesignContext.jsx:815 | lessons |
| Multi-select delete | `deleteMultiSelected` | DesignContext.jsx:2610 | lessons |

### 4.4 Schedule/Unschedule Paths

| Path | Function | Location | Target Store |
|------|----------|----------|--------------|
| Drag to timetable | `scheduleLesson` | DesignContext.jsx:844 | lessons |
| Context menu | `unscheduleLesson` | DesignContext.jsx:849 | lessons |

### 4.5 LO Link Paths

| Path | Function | Location | Target Store |
|------|----------|----------|--------------|
| Toggle LO | `toggleLessonLO` | DesignContext.jsx:1202 | lessons |

---

## 5. Performance Criteria (PCs)

### 5.1 Create Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| SCALAR "+" button | `addPerformanceCriteria` | DesignContext.jsx:2495 | scalarData.performanceCriteria | **NO** |
| **Modal "+" button** | `handleAddPC` | **App.jsx:339** | timetableData.hierarchyData.performanceCriteria | **NO - VIOLATION** |

### 5.2 Edit Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| PC editor | `updatePerformanceCriteria` | DesignContext.jsx:2518 | scalarData.performanceCriteria | **NO** |

### 5.3 Delete Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| PC delete | `deletePerformanceCriteria` | DesignContext.jsx:2528 | scalarData.performanceCriteria | **NO** |

### 5.4 Link/Unlink Paths

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| Tag item | `linkItemToPC` | DesignContext.jsx:2538 | scalarData.performanceCriteria | **NO** |
| Untag item | `unlinkItemFromPC` | DesignContext.jsx:2557 | scalarData.performanceCriteria | **NO** |

---

## 6. Universal Linking System

### 6.1 SHIFT+Click Linking

| Path | Function | Location | Target Store | Canonical? |
|------|----------|----------|--------------|------------|
| Source selection | `linkToSource` | DesignContext.jsx:2735 | linkingSource state | N/A |
| Target linking | `linkElements` | DesignContext.jsx:2626 | Depends on element types | Varies |
| Topic→LO | via `toggleTopicLOLink` | DesignContext.jsx:930 | canonicalData + scalarData | **YES** |

---

## 7. Violation Summary

### 7.1 Non-Canonical Write Paths (VIOLATIONS)

| Function | Location | Target | Should Write To |
|----------|----------|--------|-----------------|
| `handleAddTopic` | App.jsx:288 | hierarchyData.topics | canonicalData.topics |
| `handleAddSubtopic` | App.jsx:311 | hierarchyData.subtopics | canonicalData.subtopics |
| `handleAddPC` | App.jsx:339 | hierarchyData.performanceCriteria | scalarData.performanceCriteria |

### 7.2 Partial Canonical Writes (INCOMPLETE)

| Function | Location | Issue |
|----------|----------|-------|
| `unlinkTopic` | DesignContext.jsx:1052 | Writes scalarData only, not canonical |
| `linkTopicToLO` | DesignContext.jsx:1083 | Writes scalarData only, not canonical |
| `reorderTopic` | DesignContext.jsx:2390 | Writes scalarData only, not canonical |
| `reorderSubtopic` | DesignContext.jsx:2427 | Writes scalarData only, not canonical |
| `reorderLO` | DesignContext.jsx:2458 | Writes scalarData only, not canonical |

### 7.3 Performance Criteria (NOT IN CANONICAL)

Performance Criteria are stored in `scalarData.performanceCriteria` only. They are not part of the canonical model per COURSE_DATA_CONTRACT.md. This may be intentional but needs clarification.

---

## 8. Data Flow Diagram (Mutations)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                    │
├────────────────────────────────────────────────────────────────────────┤
│  DEFINE Page    │  SCALAR View   │  Lesson Editor  │  Modal "+" Btns   │
│  (LO strings)   │  (+, edit, del)│  (topic ops)    │  (add T/S/PC)     │
└────────┬────────┴───────┬────────┴────────┬────────┴────────┬──────────┘
         │                │                 │                 │
         ▼                ▼                 ▼                 ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐
│  setCourseData │ │ addTopic     │ │addTopicTo-   │ │ handleAddTopic     │
│                │ │ addSubtopic  │ │Lesson        │ │ handleAddSubtopic  │
│                │ │ updateScalar │ │addSubtopicTo-│ │ handleAddPC        │
│                │ │ deleteScalar │ │LessonTopic   │ │                    │
└────────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────────┬──────────┘
         │                │                │                   │
         │                │  CANONICAL     │ CANONICAL         │ BYPASSES
         │                │  WRITES        │ WRITES            │ CANONICAL!
         ▼                ▼                ▼                   ▼
┌────────────────────────────────────────────────┐  ┌────────────────────┐
│              DesignContext.jsx                  │  │     App.jsx        │
│  ┌──────────────────┐  ┌──────────────────┐    │  │ timetableData.     │
│  │  canonicalData   │◄─│   scalarData     │    │  │ hierarchyData      │
│  │  (AUTHORITATIVE) │  │   (LEGACY)       │    │  │ (DUPLICATE)        │
│  └─────────┬────────┘  └──────────────────┘    │  └─────────┬──────────┘
│            │                                    │            │
│            │ sync effect                        │            │ NO SYNC
│            ▼                                    │            │ BACK!
│  ┌──────────────────┐                          │            │
│  │ timetableData.   │──────────────────────────┼────────────┘
│  │ hierarchyData    │                          │
│  │ (App.jsx state)  │                          │
│  └──────────────────┘                          │
└────────────────────────────────────────────────┘
```

---

## 9. Recommendations (For Phase 2)

1. **Remove App.jsx handlers** - Route all hierarchy mutations through DesignContext
2. **Complete canonical writes** - Update `unlinkTopic`, `linkTopicToLO`, `reorderX` functions
3. **Clarify PC model** - Either add PCs to canonical or document as separate store
4. **Eliminate hierarchyData** - Read directly from canonical via context

---

*This document is diagnostic only. No fixes implemented per Task Order Phase 1 rules.*
