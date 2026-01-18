# Course Data Contract

**Version:** 1.0
**Date:** 2025-01-10
**Status:** ACTIVE
**Author:** Claude Code (CC)
**Approved By:** Founder (Matthew)

---

## 1. Purpose

This document defines the **canonical data model** for Prometheus course structure. It establishes:
- The single source of truth for all course hierarchy data
- ID generation rules
- Numbering invariants
- Migration approach from legacy stores

**BINDING:** All code changes must conform to this contract.

---

## 2. Canonical Data Model

### 2.1 Top-Level Structure

```typescript
interface CanonicalCourseData {
  // Learning Objectives (keyed by ID)
  los: Record<string, LearningObjective>

  // Topics (keyed by ID)
  topics: Record<string, Topic>

  // Subtopics (keyed by ID)
  subtopics: Record<string, Subtopic>

  // Junction tables for lesson associations
  lessonLOs: LessonLOAssociation[]
  lessonTopics: LessonTopicAssociation[]
  lessonSubtopics: LessonSubtopicAssociation[]
}
```

### 2.2 Entity Definitions

```typescript
interface LearningObjective {
  id: string              // Unique identifier (see ID Rules)
  moduleId: string        // Parent module ID
  verb: string            // Bloom's verb (EXPLAIN, IDENTIFY, etc.)
  description: string     // LO description text
  order: number           // 1-based position within module
}

interface Topic {
  id: string              // Unique identifier
  loId: string | null     // Parent LO ID (null = unallocated)
  title: string           // Topic title
  order: number           // 1-based position within LO (or within unallocated group)
}

interface Subtopic {
  id: string              // Unique identifier
  topicId: string         // Parent Topic ID (required)
  title: string           // Subtopic title
  order: number           // 1-based position within Topic
}
```

### 2.3 Junction Tables

```typescript
interface LessonLOAssociation {
  lessonId: string
  loId: string
  isPrimary: boolean      // First LO is primary (determines topic numbering)
}

interface LessonTopicAssociation {
  lessonId: string
  topicId: string
}

interface LessonSubtopicAssociation {
  lessonId: string
  subtopicId: string
}
```

---

## 3. ID Rules

### 3.1 ID Format

| Entity | Format | Example |
|--------|--------|---------|
| Learning Objective | `lo-{source}-{number}` | `lo-define-1`, `lo-scalar-3` |
| Topic | `topic-{source}-{timestamp}` | `topic-scalar-1704844800000` |
| Subtopic | `subtopic-{source}-{timestamp}` | `subtopic-editor-1704844800001` |
| Lesson | `lesson-{timestamp}` | `lesson-1704844800000` |
| Module | `module-{number}` | `module-1` |

### 3.2 ID Source Tags

| Source | Meaning |
|--------|---------|
| `define` | Created from DEFINE page LO input |
| `scalar` | Created in SCALAR view |
| `editor` | Created via LessonEditor modal |
| `import` | Created from XLSX import |

### 3.3 ID Invariants

1. **IDs are immutable** - Once created, an ID never changes
2. **IDs are globally unique** - No two entities share an ID (timestamp ensures this)
3. **IDs survive linking/unlinking** - Moving a topic between LOs preserves its ID
4. **IDs are the primary key** - All lookups use ID, never computed serial numbers

---

## 4. Numbering Invariants

### 4.1 Serial Number Format

| Entity | Format | Example |
|--------|--------|---------|
| LO | `{loOrder}` | `1`, `2`, `3` |
| Allocated Topic | `{loOrder}.{topicOrder}` | `1.1`, `1.2`, `2.1` |
| Unallocated Topic | `x.{topicOrder}` | `x.1`, `x.2` |
| Subtopic | `{topicSerial}.{subtopicOrder}` | `1.2.1`, `x.1.3` |

### 4.2 Numbering Rules

1. **Serial numbers are COMPUTED, never stored**
   ```javascript
   // CORRECT: Compute on read
   const serial = computeTopicSerial(topic, losMap, topicsMap)

   // WRONG: Store serial as property
   topic.serial = '1.2'  // ❌ Never do this
   ```

2. **Order is 1-based position within parent**
   - LO order: Position within module
   - Topic order: Position within LO (or within unallocated group)
   - Subtopic order: Position within Topic

3. **Order recalculates on structural changes**
   - When a topic moves between LOs, orders recalculate in both source and target groups
   - Deletion triggers order recalculation for remaining siblings

4. **Unallocated topics use `x.` prefix**
   - `loId === null` → topic is unallocated
   - Unallocated topics form their own group with independent ordering

### 4.3 Canonical Serial Computation

```javascript
function computeTopicSerial(topic, losMap, topicsMap) {
  if (!topic) return '?.?'

  if (!topic.loId) {
    // Unallocated: x.{orderWithinUnallocated}
    const unlinkedTopics = Object.values(topicsMap)
      .filter(t => t.loId === null)
      .sort((a, b) => a.order - b.order)
    const idx = unlinkedTopics.findIndex(t => t.id === topic.id)
    return `x.${idx >= 0 ? idx + 1 : topic.order}`
  }

  // Allocated: {loOrder}.{orderWithinLO}
  const lo = losMap[topic.loId]
  if (!lo) return `?.${topic.order}`

  const loTopics = Object.values(topicsMap)
    .filter(t => t.loId === topic.loId)
    .sort((a, b) => a.order - b.order)
  const idx = loTopics.findIndex(t => t.id === topic.id)
  return `${lo.order}.${idx >= 0 ? idx + 1 : topic.order}`
}

function computeSubtopicSerial(subtopic, topicsMap, losMap, subtopicsMap) {
  if (!subtopic) return '?.?.?'

  const parentTopic = topicsMap[subtopic.topicId]
  if (!parentTopic) return `?.?.${subtopic.order}`

  const topicSerial = computeTopicSerial(parentTopic, losMap, topicsMap)

  const siblingSubtopics = Object.values(subtopicsMap)
    .filter(s => s.topicId === subtopic.topicId)
    .sort((a, b) => a.order - b.order)
  const idx = siblingSubtopics.findIndex(s => s.id === subtopic.id)

  return `${topicSerial}.${idx >= 0 ? idx + 1 : subtopic.order}`
}
```

---

## 5. Migration Approach

### 5.1 Strategy: "Read Both / Write One"

During the transition period:
- **WRITES** go to canonical store only
- **READS** try canonical first, fall back to legacy

```
┌─────────────────────────────────────────────────────────┐
│                    WRITE PATH                           │
│  User Action → canonicalData ONLY                       │
│                    ↓                                    │
│            Adapter derives legacy view                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    READ PATH                            │
│  Component → getCanonicalData()                         │
│                    ↓                                    │
│            If found → return                            │
│            If not → check legacy → migrate on read      │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Adapter Functions

```javascript
// Derive legacy scalarData structure from canonical store
function deriveScalarDataFromCanonical(canonical, modules) {
  return {
    modules: modules.map(module => ({
      ...module,
      learningObjectives: Object.values(canonical.los)
        .filter(lo => lo.moduleId === module.id)
        .sort((a, b) => a.order - b.order)
        .map(lo => ({
          ...lo,
          expanded: true,
          topics: Object.values(canonical.topics)
            .filter(t => t.loId === lo.id)
            .sort((a, b) => a.order - b.order)
            .map(topic => ({
              ...topic,
              expanded: false,
              subtopics: Object.values(canonical.subtopics)
                .filter(s => s.topicId === topic.id)
                .sort((a, b) => a.order - b.order)
            }))
        }))
    })),
    unlinkedTopics: Object.values(canonical.topics)
      .filter(t => t.loId === null)
      .sort((a, b) => a.order - b.order)
      .map(topic => ({
        ...topic,
        expanded: false,
        subtopics: Object.values(canonical.subtopics)
          .filter(s => s.topicId === topic.id)
          .sort((a, b) => a.order - b.order)
      })),
    performanceCriteria: [] // Migrated separately
  }
}

// Migrate legacy scalarData entry to canonical on first access
function migrateToCanonical(legacyItem, type, canonical) {
  if (canonical[type + 's'][legacyItem.id]) {
    return canonical[type + 's'][legacyItem.id] // Already migrated
  }

  // Add to canonical store
  const canonicalEntry = {
    id: legacyItem.id,
    ...extractCanonicalFields(legacyItem, type)
  }

  return canonicalEntry
}
```

### 5.3 Migration Phases

| Phase | Action | Rollback Safe |
|-------|--------|---------------|
| **M1** | Add adapter layer, canonical writes | YES - legacy still works |
| **M2** | Migrate existing data on load | YES - original preserved |
| **M3** | Remove legacy reads | YES - adapter derives |
| **M4** | Remove legacy store entirely | NO - point of no return |

### 5.4 Feature Flags

```javascript
const CANONICAL_FLAGS = {
  WRITE_TO_CANONICAL: true,      // Phase M1: All writes go to canonical
  READ_FROM_CANONICAL: true,     // Phase M2: Prefer canonical reads
  DERIVE_LEGACY: true,           // Phase M3: Derive legacy from canonical
  LEGACY_STORE_REMOVED: false    // Phase M4: Legacy store deleted
}
```

---

## 6. Validation Rules

### 6.1 Entity Validation

```javascript
const validators = {
  lo: (lo) => {
    assert(lo.id, 'LO must have ID')
    assert(lo.moduleId, 'LO must have moduleId')
    assert(lo.verb, 'LO must have verb')
    assert(lo.order > 0, 'LO order must be positive')
  },

  topic: (topic) => {
    assert(topic.id, 'Topic must have ID')
    assert(topic.title, 'Topic must have title')
    assert(topic.order > 0, 'Topic order must be positive')
    // loId can be null (unallocated)
  },

  subtopic: (subtopic) => {
    assert(subtopic.id, 'Subtopic must have ID')
    assert(subtopic.topicId, 'Subtopic must have topicId')
    assert(subtopic.title, 'Subtopic must have title')
    assert(subtopic.order > 0, 'Subtopic order must be positive')
  }
}
```

### 6.2 Referential Integrity

```javascript
function validateReferentialIntegrity(canonical) {
  const errors = []

  // All topics with loId must reference existing LO
  Object.values(canonical.topics).forEach(topic => {
    if (topic.loId && !canonical.los[topic.loId]) {
      errors.push(`Topic ${topic.id} references non-existent LO ${topic.loId}`)
    }
  })

  // All subtopics must reference existing Topic
  Object.values(canonical.subtopics).forEach(sub => {
    if (!canonical.topics[sub.topicId]) {
      errors.push(`Subtopic ${sub.id} references non-existent Topic ${sub.topicId}`)
    }
  })

  return errors
}
```

---

## 7. Testing Requirements

### 7.1 Unit Tests (MTs)

| Test | Description |
|------|-------------|
| `computeTopicSerial_allocated` | Verify `{loOrder}.{topicOrder}` format |
| `computeTopicSerial_unallocated` | Verify `x.{topicOrder}` format |
| `computeSubtopicSerial` | Verify `{topicSerial}.{subtopicOrder}` format |
| `orderRecalculation_onMove` | Orders update when topic moves between LOs |
| `orderRecalculation_onDelete` | Orders compact when sibling deleted |
| `idImmutability` | IDs don't change on structural operations |

### 7.2 Integration Tests (ITs)

| Test | Description |
|------|-------------|
| `addTopicFromEditor_syncsToCanonical` | LessonEditor topic appears in canonical store |
| `shiftClickLink_updatesCanonical` | SHIFT+click linking updates canonical only |
| `scalarDisplay_matchesCanonical` | ScalarColumns displays canonical data |
| `buildPage_readsCanonical` | Build page dropdowns use canonical data |

### 7.3 System Tests (SOCs)

| Test | Description |
|------|-------------|
| `fullFlow_defineToScalar` | LO from Define appears correctly numbered in Scalar |
| `fullFlow_lessonEditorToScalar` | Topic from LessonEditor appears in Scalar |
| `fullFlow_linkUnlink` | Topic linking/unlinking maintains integrity |

---

## 8. Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2025-01-10 | Initial contract definition |

---

*This document is binding for all course data operations in Prometheus 2.0.*
