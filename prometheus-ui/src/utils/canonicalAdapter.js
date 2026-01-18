/**
 * canonicalAdapter.js - Canonical Data Store Adapter
 *
 * Provides functions to:
 * 1. Derive legacy scalarData structure from canonical store
 * 2. Migrate legacy data to canonical format
 * 3. Compute serial numbers from canonical data
 *
 * Part of Phase 1: Foundation (Calm Wheel Implementation)
 * See: docs/COURSE_DATA_CONTRACT.md
 *
 * TRANSITION STRATEGY: "Read Both / Write One"
 * - All WRITES go to canonical store only
 * - All READS derive from canonical, with legacy fallback during migration
 */

// ============================================
// FEATURE FLAGS
// ============================================
export const CANONICAL_FLAGS = {
  // Phase 1-3: Canonical migration
  WRITE_TO_CANONICAL: true,      // Phase M1: All writes go to canonical
  READ_FROM_CANONICAL: true,     // Phase M2: Prefer canonical reads
  DERIVE_LEGACY: true,           // Phase M3: Derive legacy from canonical
  LEGACY_STORE_REMOVED: false,   // Phase M4: Legacy store deleted (not yet)
  DEBUG_LOGGING: true,           // Enable detailed logging during transition

  // Phase 4-5: Calm Wheel Integration
  WHEEL_NAV_ENABLED: true,       // Enable WheelNav component
  SCALAR_DOCK_ENABLED: true,     // Enable ScalarDock (replaces SCALAR tab)
  WORK_DOCK_ENABLED: true,       // Enable WorkDock (Phase 5: enabled)
  WORK_DOCK_PROGRESSIVE: true    // Show WorkDock alongside TimetableWorkspace
}

// ============================================
// DEBUG LOGGING
// ============================================
export function canonicalLog(action, data) {
  if (CANONICAL_FLAGS.DEBUG_LOGGING) {
    console.log(`[CANONICAL] ${action}:`, data)
  }
}

// ============================================
// SERIAL NUMBER COMPUTATION
// ============================================

/**
 * Compute topic serial number from canonical store
 * Format: "{loOrder}.{topicOrder}" or "x.{order}" for unallocated
 *
 * @param {Object} topic - Topic object with id, loId, order
 * @param {Object} losMap - Map of LO id -> LO object
 * @param {Object} topicsMap - Map of topic id -> topic object
 * @returns {string} Serial number (e.g., "1.2" or "x.1")
 */
export function computeTopicSerial(topic, losMap, topicsMap) {
  if (!topic) return '?.?'

  // Unallocated topic (no LO assignment)
  if (!topic.loId) {
    // Get all unlinked topics sorted by order
    const unlinkedTopics = Object.values(topicsMap)
      .filter(t => t.loId === null || t.loId === undefined)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const idx = unlinkedTopics.findIndex(t => t.id === topic.id)
    return `x.${idx >= 0 ? idx + 1 : topic.order || 1}`
  }

  // Allocated topic - get LO order
  const lo = losMap[topic.loId]
  if (!lo) return `?.${topic.order || 1}`

  // Get topics for this LO sorted by order
  const loTopics = Object.values(topicsMap)
    .filter(t => t.loId === topic.loId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const idx = loTopics.findIndex(t => t.id === topic.id)
  return `${lo.order}.${idx >= 0 ? idx + 1 : topic.order || 1}`
}

/**
 * Compute subtopic serial number from canonical store
 * Format: "{topicSerial}.{subtopicOrder}"
 *
 * @param {Object} subtopic - Subtopic object with id, topicId, order
 * @param {Object} topicsMap - Map of topic id -> topic object
 * @param {Object} losMap - Map of LO id -> LO object
 * @param {Object} subtopicsMap - Map of subtopic id -> subtopic object
 * @returns {string} Serial number (e.g., "1.2.3" or "x.1.1")
 */
export function computeSubtopicSerial(subtopic, topicsMap, losMap, subtopicsMap) {
  if (!subtopic) return '?.?.?'

  const parentTopic = topicsMap[subtopic.topicId]
  if (!parentTopic) return `?.?.${subtopic.order || 1}`

  const topicSerial = computeTopicSerial(parentTopic, losMap, topicsMap)

  // Get subtopics for this topic sorted by order
  const siblingSubtopics = Object.values(subtopicsMap)
    .filter(s => s.topicId === subtopic.topicId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const idx = siblingSubtopics.findIndex(s => s.id === subtopic.id)
  return `${topicSerial}.${idx >= 0 ? idx + 1 : subtopic.order || 1}`
}

// ============================================
// DERIVE LEGACY FROM CANONICAL
// ============================================

/**
 * Derive legacy scalarData structure from canonical store
 * This allows existing components to continue working during transition
 *
 * @param {Object} canonical - Canonical data store { los, topics, subtopics, ... }
 * @param {Array} modules - Array of module definitions
 * @param {Array} performanceCriteria - PC array (stored separately)
 * @returns {Object} Legacy scalarData structure
 */
export function deriveScalarDataFromCanonical(canonical, modules, performanceCriteria = []) {
  if (!canonical || !modules) {
    canonicalLog('DERIVE_SKIP', { reason: 'Missing canonical or modules' })
    return null
  }

  const losMap = canonical.los || {}
  const topicsMap = canonical.topics || {}
  const subtopicsMap = canonical.subtopics || {}

  // Build nested structure for each module
  const derivedModules = modules.map(module => {
    // Get LOs for this module, sorted by order
    const moduleLOs = Object.values(losMap)
      .filter(lo => lo.moduleId === module.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(lo => {
        // Get topics for this LO, sorted by order
        const loTopics = Object.values(topicsMap)
          .filter(t => t.loId === lo.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(topic => {
            // Get subtopics for this topic, sorted by order
            const topicSubtopics = Object.values(subtopicsMap)
              .filter(s => s.topicId === topic.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(sub => ({
                id: sub.id,
                title: sub.title,
                order: sub.order
              }))

            return {
              id: topic.id,
              title: topic.title,
              order: topic.order,
              loId: topic.loId,
              expanded: topic.expanded || false,
              subtopics: topicSubtopics
            }
          })

        return {
          id: lo.id,
          verb: lo.verb,
          description: lo.description,
          order: lo.order,
          expanded: lo.expanded !== false, // Default to expanded
          topics: loTopics
        }
      })

    return {
      ...module,
      learningObjectives: moduleLOs
    }
  })

  // Get unlinked topics (loId is null/undefined)
  const unlinkedTopics = Object.values(topicsMap)
    .filter(t => t.loId === null || t.loId === undefined)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(topic => {
      const topicSubtopics = Object.values(subtopicsMap)
        .filter(s => s.topicId === topic.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(sub => ({
          id: sub.id,
          title: sub.title,
          order: sub.order
        }))

      return {
        id: topic.id,
        title: topic.title,
        order: topic.order,
        loId: null,
        expanded: topic.expanded || false,
        subtopics: topicSubtopics
      }
    })

  const derived = {
    modules: derivedModules,
    unlinkedTopics,
    performanceCriteria
  }

  canonicalLog('DERIVE_COMPLETE', {
    moduleCount: derivedModules.length,
    loCount: Object.keys(losMap).length,
    topicCount: Object.keys(topicsMap).length,
    subtopicCount: Object.keys(subtopicsMap).length,
    unlinkedTopicCount: unlinkedTopics.length
  })

  return derived
}

// ============================================
// MIGRATE LEGACY TO CANONICAL
// ============================================

/**
 * Migrate legacy scalarData to canonical format
 * Called once during initial load if canonical store is empty
 *
 * @param {Object} legacyScalarData - Legacy nested scalarData structure
 * @returns {Object} Canonical data store { los, topics, subtopics }
 */
export function migrateToCanonical(legacyScalarData) {
  if (!legacyScalarData) {
    return { los: {}, topics: {}, subtopics: {}, lessonLOs: [], lessonTopics: [], lessonSubtopics: [] }
  }

  const los = {}
  const topics = {}
  const subtopics = {}

  // Process modules -> LOs -> Topics -> Subtopics
  ;(legacyScalarData.modules || []).forEach(module => {
    ;(module.learningObjectives || []).forEach(lo => {
      // Migrate LO
      los[lo.id] = {
        id: lo.id,
        moduleId: module.id,
        verb: lo.verb || '',
        description: lo.description || '',
        order: lo.order || 1
      }

      // Migrate Topics under this LO
      ;(lo.topics || []).forEach(topic => {
        topics[topic.id] = {
          id: topic.id,
          loId: lo.id,
          title: topic.title || '',
          order: topic.order || 1,
          expanded: topic.expanded || false
        }

        // Migrate Subtopics under this Topic
        ;(topic.subtopics || []).forEach(sub => {
          subtopics[sub.id] = {
            id: sub.id,
            topicId: topic.id,
            title: sub.title || '',
            order: sub.order || 1
          }
        })
      })
    })
  })

  // Process unlinked topics
  ;(legacyScalarData.unlinkedTopics || []).forEach(topic => {
    topics[topic.id] = {
      id: topic.id,
      loId: null,
      title: topic.title || '',
      order: topic.order || 1,
      expanded: topic.expanded || false
    }

    // Migrate Subtopics under unlinked topics
    ;(topic.subtopics || []).forEach(sub => {
      subtopics[sub.id] = {
        id: sub.id,
        topicId: topic.id,
        title: sub.title || '',
        order: sub.order || 1
      }
    })
  })

  canonicalLog('MIGRATE_COMPLETE', {
    loCount: Object.keys(los).length,
    topicCount: Object.keys(topics).length,
    subtopicCount: Object.keys(subtopics).length
  })

  return {
    los,
    topics,
    subtopics,
    lessonLOs: [],
    lessonTopics: [],
    lessonSubtopics: []
  }
}

// ============================================
// CANONICAL WRITE OPERATIONS
// ============================================

/**
 * Add a new LO to canonical store
 * @param {Object} canonical - Current canonical state
 * @param {Object} lo - New LO { id, moduleId, verb, description }
 * @returns {Object} Updated canonical state
 */
export function canonicalAddLO(canonical, lo) {
  // Calculate order (max existing + 1 for same module)
  const moduleLOs = Object.values(canonical.los).filter(l => l.moduleId === lo.moduleId)
  const order = moduleLOs.length + 1

  const newLO = {
    id: lo.id,
    moduleId: lo.moduleId,
    verb: lo.verb || 'IDENTIFY',
    description: lo.description || 'new learning objective',
    order
  }

  canonicalLog('ADD_LO', { loId: lo.id, moduleId: lo.moduleId, order })

  return {
    ...canonical,
    los: { ...canonical.los, [lo.id]: newLO }
  }
}

/**
 * Add a new Topic to canonical store
 * @param {Object} canonical - Current canonical state
 * @param {Object} topic - New topic { id, loId (can be null), title }
 * @returns {Object} Updated canonical state
 */
export function canonicalAddTopic(canonical, topic) {
  // Calculate order (max existing + 1 for same loId group)
  const groupTopics = Object.values(canonical.topics).filter(t => t.loId === topic.loId)
  const order = groupTopics.length + 1

  const newTopic = {
    id: topic.id,
    loId: topic.loId,
    title: topic.title || 'New Topic',
    order,
    expanded: false
  }

  canonicalLog('ADD_TOPIC', {
    topicId: topic.id,
    loId: topic.loId,
    order,
    serial: computeTopicSerial(newTopic, canonical.los, { ...canonical.topics, [topic.id]: newTopic })
  })

  return {
    ...canonical,
    topics: { ...canonical.topics, [topic.id]: newTopic }
  }
}

/**
 * Add a new Subtopic to canonical store
 * @param {Object} canonical - Current canonical state
 * @param {Object} subtopic - New subtopic { id, topicId, title }
 * @returns {Object} Updated canonical state
 */
export function canonicalAddSubtopic(canonical, subtopic) {
  // Calculate order (max existing + 1 for same topicId)
  const siblingSubtopics = Object.values(canonical.subtopics).filter(s => s.topicId === subtopic.topicId)
  const order = siblingSubtopics.length + 1

  const newSubtopic = {
    id: subtopic.id,
    topicId: subtopic.topicId,
    title: subtopic.title || 'New Subtopic',
    order
  }

  canonicalLog('ADD_SUBTOPIC', {
    subtopicId: subtopic.id,
    topicId: subtopic.topicId,
    order,
    serial: computeSubtopicSerial(newSubtopic, canonical.topics, canonical.los, { ...canonical.subtopics, [subtopic.id]: newSubtopic })
  })

  return {
    ...canonical,
    subtopics: { ...canonical.subtopics, [subtopic.id]: newSubtopic }
  }
}

/**
 * Update an entity in canonical store
 * @param {Object} canonical - Current canonical state
 * @param {string} entityType - 'lo', 'topic', or 'subtopic'
 * @param {string} entityId - Entity ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated canonical state
 */
export function canonicalUpdate(canonical, entityType, entityId, updates) {
  const storeKey = entityType === 'lo' ? 'los' : `${entityType}s`
  const store = canonical[storeKey]

  if (!store || !store[entityId]) {
    canonicalLog('UPDATE_NOT_FOUND', { entityType, entityId })
    return canonical
  }

  const updated = { ...store[entityId], ...updates }

  canonicalLog('UPDATE', { entityType, entityId, updates })

  return {
    ...canonical,
    [storeKey]: { ...store, [entityId]: updated }
  }
}

/**
 * Delete an entity from canonical store (with order recalculation)
 * @param {Object} canonical - Current canonical state
 * @param {string} entityType - 'lo', 'topic', or 'subtopic'
 * @param {string} entityId - Entity ID
 * @returns {Object} Updated canonical state
 */
export function canonicalDelete(canonical, entityType, entityId) {
  const storeKey = entityType === 'lo' ? 'los' : `${entityType}s`
  const store = { ...canonical[storeKey] }

  if (!store[entityId]) {
    canonicalLog('DELETE_NOT_FOUND', { entityType, entityId })
    return canonical
  }

  // Get the entity before deletion to know its group
  const entity = store[entityId]
  delete store[entityId]

  // Recalculate orders for siblings
  if (entityType === 'lo') {
    // Recalculate orders for LOs in same module
    const moduleLOs = Object.values(store)
      .filter(lo => lo.moduleId === entity.moduleId)
      .sort((a, b) => a.order - b.order)
    moduleLOs.forEach((lo, idx) => {
      store[lo.id] = { ...lo, order: idx + 1 }
    })
  } else if (entityType === 'topic') {
    // Recalculate orders for topics in same LO (or unlinked group)
    const groupTopics = Object.values(store)
      .filter(t => t.loId === entity.loId)
      .sort((a, b) => a.order - b.order)
    groupTopics.forEach((t, idx) => {
      store[t.id] = { ...t, order: idx + 1 }
    })

    // Also delete child subtopics
    const subtopicsStore = { ...canonical.subtopics }
    Object.keys(subtopicsStore).forEach(subId => {
      if (subtopicsStore[subId].topicId === entityId) {
        delete subtopicsStore[subId]
      }
    })

    canonicalLog('DELETE_TOPIC', { topicId: entityId, deletedSubtopics: true })

    return {
      ...canonical,
      [storeKey]: store,
      subtopics: subtopicsStore
    }
  } else if (entityType === 'subtopic') {
    // Recalculate orders for subtopics in same topic
    const siblingSubtopics = Object.values(store)
      .filter(s => s.topicId === entity.topicId)
      .sort((a, b) => a.order - b.order)
    siblingSubtopics.forEach((s, idx) => {
      store[s.id] = { ...s, order: idx + 1 }
    })
  }

  canonicalLog('DELETE', { entityType, entityId })

  return {
    ...canonical,
    [storeKey]: store
  }
}

/**
 * Move a topic to a different LO (or unlink it)
 * @param {Object} canonical - Current canonical state
 * @param {string} topicId - Topic ID to move
 * @param {string|null} targetLoId - Target LO ID (null to unlink)
 * @returns {Object} Updated canonical state
 */
export function canonicalMoveTopic(canonical, topicId, targetLoId) {
  const topic = canonical.topics[topicId]
  if (!topic) {
    canonicalLog('MOVE_TOPIC_NOT_FOUND', { topicId })
    return canonical
  }

  const sourceLoId = topic.loId

  // If already in target, no change needed
  if (sourceLoId === targetLoId) {
    canonicalLog('MOVE_TOPIC_NO_CHANGE', { topicId, loId: targetLoId })
    return canonical
  }

  const topics = { ...canonical.topics }

  // Calculate new order in target group
  const targetGroupTopics = Object.values(topics).filter(t => t.loId === targetLoId && t.id !== topicId)
  const newOrder = targetGroupTopics.length + 1

  // Update the topic
  topics[topicId] = { ...topic, loId: targetLoId, order: newOrder }

  // Recalculate orders in source group (if not null)
  if (sourceLoId !== null) {
    const sourceGroupTopics = Object.values(topics)
      .filter(t => t.loId === sourceLoId)
      .sort((a, b) => a.order - b.order)
    sourceGroupTopics.forEach((t, idx) => {
      topics[t.id] = { ...t, order: idx + 1 }
    })
  }

  // Recalculate orders in unlinked group if moving to/from null
  const unlinkedTopics = Object.values(topics)
    .filter(t => t.loId === null)
    .sort((a, b) => a.order - b.order)
  unlinkedTopics.forEach((t, idx) => {
    topics[t.id] = { ...t, order: idx + 1 }
  })

  canonicalLog('MOVE_TOPIC', {
    topicId,
    from: sourceLoId,
    to: targetLoId,
    newOrder,
    newSerial: computeTopicSerial(topics[topicId], canonical.los, topics)
  })

  return {
    ...canonical,
    topics
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate canonical data integrity
 * @param {Object} canonical - Canonical data store
 * @returns {Array} Array of error strings (empty if valid)
 */
export function validateCanonical(canonical) {
  const errors = []

  // Check topic -> LO references
  Object.values(canonical.topics || {}).forEach(topic => {
    if (topic.loId && !canonical.los[topic.loId]) {
      errors.push(`Topic ${topic.id} references non-existent LO ${topic.loId}`)
    }
  })

  // Check subtopic -> Topic references
  Object.values(canonical.subtopics || {}).forEach(sub => {
    if (!canonical.topics[sub.topicId]) {
      errors.push(`Subtopic ${sub.id} references non-existent Topic ${sub.topicId}`)
    }
  })

  if (errors.length > 0) {
    canonicalLog('VALIDATION_ERRORS', errors)
  }

  return errors
}

// ============================================
// EXPORTS
// ============================================

export default {
  CANONICAL_FLAGS,
  canonicalLog,
  computeTopicSerial,
  computeSubtopicSerial,
  deriveScalarDataFromCanonical,
  migrateToCanonical,
  canonicalAddLO,
  canonicalAddTopic,
  canonicalAddSubtopic,
  canonicalUpdate,
  canonicalDelete,
  canonicalMoveTopic,
  validateCanonical
}
