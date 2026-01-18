# Canonical Data Model - Prometheus Hierarchy

> **SUPERSEDED**
>
> This document has been **superseded** by `COURSE_DATA_CONTRACT.md` (v1.0, 2025-01-10).
>
> **Authoritative specification:** [`docs/COURSE_DATA_CONTRACT.md`](COURSE_DATA_CONTRACT.md)
>
> This file is retained for historical reference only. Do not use for implementation.
>
> **Archived:** 2025-01-18

---

**Date:** 2026-01-03
**Status:** ~~Implementation Proposal~~ **SUPERSEDED**
**Directive:** Founder Authority - Deterministic Numbering System

---

## Problem Statement

Current implementation stores topics/subtopics in multiple locations with duplicated data:
1. `scalarData.modules[].learningObjectives[].topics[]` - nested under LOs
2. `scalarData.unlinkedTopics[]` - separate array for unlinked
3. `lessons[].topics[]` - duplicated references with own numbering

This causes:
- **Numbering drift**: Topic 1.1 → 2.1 jumps despite single LO
- **Sync failures**: Edits in one location don't propagate
- **Race conditions**: Multiple setState calls create inconsistent state

---

## Canonical Data Model

### Normalized Store Structure

```javascript
const canonicalStore = {
  // Learning Objectives - keyed by ID
  los: {
    'lo-1': { id: 'lo-1', moduleId: 'mod-1', verb: 'EXPLAIN', description: '...', order: 1 },
    'lo-2': { id: 'lo-2', moduleId: 'mod-1', verb: 'IDENTIFY', description: '...', order: 2 }
  },

  // Topics - keyed by ID, with loId foreign key (null = unlinked)
  topics: {
    'topic-1': { id: 'topic-1', loId: 'lo-1', title: 'Introduction', order: 1 },
    'topic-2': { id: 'topic-2', loId: 'lo-1', title: 'Core Concepts', order: 2 },
    'topic-3': { id: 'topic-3', loId: null, title: 'Misc Notes', order: 1 }  // unlinked
  },

  // Subtopics - keyed by ID, with topicId foreign key
  subtopics: {
    'sub-1': { id: 'sub-1', topicId: 'topic-1', title: 'Overview', order: 1 },
    'sub-2': { id: 'sub-2', topicId: 'topic-1', title: 'History', order: 2 }
  },

  // Lessons - keyed by ID
  lessons: {
    'lesson-1': {
      id: 'lesson-1',
      title: 'Lesson 1',
      type: 'instructor-led',
      duration: 60,
      // ... scheduling fields
    }
  },

  // Junction tables for many-to-many relationships
  lessonLOs: [
    { lessonId: 'lesson-1', loId: 'lo-1', isPrimary: true }
  ],

  lessonTopics: [
    { lessonId: 'lesson-1', topicId: 'topic-1' },
    { lessonId: 'lesson-1', topicId: 'topic-2' }
  ],

  lessonSubtopics: [
    { lessonId: 'lesson-1', subtopicId: 'sub-1' }
  ]
}
```

---

## Deterministic Numbering Rules

### Topic Serial Number

```javascript
function computeTopicSerial(topic, los, allTopics) {
  if (!topic.loId) {
    // Unlinked: x.{orderWithinUnlinked}
    const unlinkedTopics = Object.values(allTopics)
      .filter(t => t.loId === null)
      .sort((a, b) => a.order - b.order)
    const idx = unlinkedTopics.findIndex(t => t.id === topic.id)
    return `x.${idx + 1}`
  }

  // Linked: {loOrder}.{orderWithinLO}
  const lo = los[topic.loId]
  if (!lo) return `?.${topic.order}`

  const loTopics = Object.values(allTopics)
    .filter(t => t.loId === topic.loId)
    .sort((a, b) => a.order - b.order)
  const idx = loTopics.findIndex(t => t.id === topic.id)
  return `${lo.order}.${idx + 1}`
}
```

### Subtopic Serial Number

```javascript
function computeSubtopicSerial(subtopic, topics, los, allTopics, allSubtopics) {
  const parentTopic = topics[subtopic.topicId]
  if (!parentTopic) return `?.?.${subtopic.order}`

  const topicSerial = computeTopicSerial(parentTopic, los, allTopics)

  const siblingSubtopics = Object.values(allSubtopics)
    .filter(s => s.topicId === subtopic.topicId)
    .sort((a, b) => a.order - b.order)
  const idx = siblingSubtopics.findIndex(s => s.id === subtopic.id)

  return `${topicSerial}.${idx + 1}`
}
```

---

## Order Recalculation on Link/Unlink

### When Topic Links to LO

```javascript
function linkTopicToLO(topicId, targetLoId, store) {
  const topic = store.topics[topicId]
  const sourceLoId = topic.loId

  // 1. Get current topics in target LO
  const targetLoTopics = Object.values(store.topics)
    .filter(t => t.loId === targetLoId)
    .sort((a, b) => a.order - b.order)

  // 2. Assign next order in target LO
  const newOrder = targetLoTopics.length + 1

  // 3. Update topic
  store.topics[topicId] = { ...topic, loId: targetLoId, order: newOrder }

  // 4. Recalculate orders in source group
  recalculateGroupOrders(store, sourceLoId)
}
```

### When Topic Unlinks from LO

```javascript
function unlinkTopic(topicId, store) {
  const topic = store.topics[topicId]
  const sourceLoId = topic.loId

  // 1. Get current unlinked topics
  const unlinkedTopics = Object.values(store.topics)
    .filter(t => t.loId === null)
    .sort((a, b) => a.order - b.order)

  // 2. Assign next order in unlinked group
  const newOrder = unlinkedTopics.length + 1

  // 3. Update topic
  store.topics[topicId] = { ...topic, loId: null, order: newOrder }

  // 4. Recalculate orders in source LO
  recalculateGroupOrders(store, sourceLoId)
}
```

### Recalculate Group Orders

```javascript
function recalculateGroupOrders(store, loId) {
  // Get all topics in this group
  const groupTopics = Object.values(store.topics)
    .filter(t => t.loId === loId)
    .sort((a, b) => a.order - b.order)

  // Reassign sequential orders: 1, 2, 3...
  groupTopics.forEach((topic, idx) => {
    store.topics[topic.id] = { ...topic, order: idx + 1 }
  })
}
```

---

## Migration Strategy

### Phase 1: Add Canonical Store

```javascript
// In DesignContext.jsx, add alongside existing state:
const [canonicalData, setCanonicalData] = useState({
  los: {},
  topics: {},
  subtopics: {},
  lessons: {},
  lessonLOs: [],
  lessonTopics: [],
  lessonSubtopics: []
})
```

### Phase 2: Migrate Existing Data on Mount

```javascript
useEffect(() => {
  // Convert scalarData.modules[].learningObjectives to los + topics
  const los = {}
  const topics = {}
  const subtopics = {}

  scalarData.modules.forEach(module => {
    module.learningObjectives.forEach(lo => {
      los[lo.id] = {
        id: lo.id,
        moduleId: module.id,
        verb: lo.verb,
        description: lo.description,
        order: lo.order
      }

      ;(lo.topics || []).forEach(topic => {
        topics[topic.id] = {
          id: topic.id,
          loId: lo.id,
          title: topic.title,
          order: topic.order
        }

        ;(topic.subtopics || []).forEach(sub => {
          subtopics[sub.id] = {
            id: sub.id,
            topicId: topic.id,
            title: sub.title,
            order: sub.order
          }
        })
      })
    })
  })

  // Migrate unlinked topics
  ;(scalarData.unlinkedTopics || []).forEach(topic => {
    topics[topic.id] = {
      id: topic.id,
      loId: null,
      title: topic.title,
      order: topic.order
    }
  })

  setCanonicalData({ los, topics, subtopics, lessons: {}, lessonLOs: [], lessonTopics: [], lessonSubtopics: [] })
}, [])
```

### Phase 3: Derive Display Data

```javascript
// Computed values derived from canonical store
const scalarDisplayData = useMemo(() => {
  const modules = [{
    id: 'module-1',
    name: 'Module 1',
    order: 1,
    expanded: true,
    learningObjectives: Object.values(canonicalData.los)
      .sort((a, b) => a.order - b.order)
      .map(lo => ({
        ...lo,
        serial: lo.order,
        expanded: true,
        topics: Object.values(canonicalData.topics)
          .filter(t => t.loId === lo.id)
          .sort((a, b) => a.order - b.order)
          .map(topic => ({
            ...topic,
            serial: computeTopicSerial(topic, canonicalData.los, canonicalData.topics),
            expanded: false,
            subtopics: Object.values(canonicalData.subtopics)
              .filter(s => s.topicId === topic.id)
              .sort((a, b) => a.order - b.order)
              .map(sub => ({
                ...sub,
                serial: computeSubtopicSerial(sub, canonicalData.topics, canonicalData.los, canonicalData.topics, canonicalData.subtopics)
              }))
          }))
      }))
  }]

  const unlinkedTopics = Object.values(canonicalData.topics)
    .filter(t => t.loId === null)
    .sort((a, b) => a.order - b.order)
    .map(topic => ({
      ...topic,
      serial: computeTopicSerial(topic, canonicalData.los, canonicalData.topics)
    }))

  return { modules, unlinkedTopics }
}, [canonicalData])
```

---

## Invariants to Enforce

1. **No duplicate IDs** - Each entity has unique ID across its type
2. **Valid foreign keys** - `loId` must reference existing LO or be null
3. **Sequential orders** - Within each group, orders are 1, 2, 3... with no gaps
4. **Deterministic serials** - Serial numbers computed from structure, never stored
5. **Single source of truth** - UI reads from derived display data, writes to canonical store

---

## API Surface

```javascript
// Canonical store mutations
addLO(moduleId, verb, description)
updateLO(loId, updates)
deleteLO(loId)
reorderLO(loId, newOrder)

addTopic(title, loId = null)
updateTopic(topicId, updates)
deleteTopic(topicId)
linkTopicToLO(topicId, loId)
unlinkTopic(topicId)

addSubtopic(topicId, title)
updateSubtopic(subtopicId, updates)
deleteSubtopic(subtopicId)

// Junction table mutations
linkLessonToLO(lessonId, loId, isPrimary = false)
unlinkLessonFromLO(lessonId, loId)
linkLessonToTopic(lessonId, topicId)
unlinkLessonFromTopic(lessonId, topicId)

// Computed selectors
getTopicSerial(topicId)
getSubtopicSerial(subtopicId)
getTopicsForLO(loId)
getSubtopicsForTopic(topicId)
getLessonsForTopic(topicId)
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `DesignContext.jsx` | Add canonical store, migration, selectors, mutations |
| `ScalarColumns.jsx` | Read from derived display data, call canonical mutations |
| `LessonEditorModal.jsx` | Use junction tables for lesson-topic links |

---

*Implementation follows this specification*
