/**
 * Unit Tests for Hierarchy Numbering & Linking Logic
 *
 * Tests the canonical data model's deterministic serial numbering:
 * - Topic serials: linked ({loOrder}.{order}) vs unlinked (x.{order})
 * - Subtopic serials: {topicSerial}.{order}
 * - Order recalculation on link/unlink
 *
 * DELIVERABLE D: Prometheus Hierarchy Linking Fix
 */

// Copy of canonical serial computation functions for testing
// (In production, these would be imported from DesignContext)

function computeTopicSerial(topic, losMap, topicsMap) {
  if (!topic) return '?.?'

  if (!topic.loId) {
    // Unlinked topic: x.{orderWithinUnlinked}
    const unlinkedTopics = Object.values(topicsMap)
      .filter(t => t.loId === null)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    const idx = unlinkedTopics.findIndex(t => t.id === topic.id)
    return `x.${idx >= 0 ? idx + 1 : topic.order || 1}`
  }

  // Linked topic: {loOrder}.{orderWithinLO}
  const lo = losMap[topic.loId]
  if (!lo) return `?.${topic.order || 1}`

  const loTopics = Object.values(topicsMap)
    .filter(t => t.loId === topic.loId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
  const idx = loTopics.findIndex(t => t.id === topic.id)
  return `${lo.order}.${idx >= 0 ? idx + 1 : topic.order || 1}`
}

function computeSubtopicSerial(subtopic, topicsMap, losMap, subtopicsMap) {
  if (!subtopic) return '?.?.?'

  const parentTopic = topicsMap[subtopic.topicId]
  if (!parentTopic) return `?.?.${subtopic.order || 1}`

  const topicSerial = computeTopicSerial(parentTopic, losMap, topicsMap)

  const siblingSubtopics = Object.values(subtopicsMap)
    .filter(s => s.topicId === subtopic.topicId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
  const idx = siblingSubtopics.findIndex(s => s.id === subtopic.id)

  return `${topicSerial}.${idx >= 0 ? idx + 1 : subtopic.order || 1}`
}

function recalculateCanonicalGroupOrders(topicsMap, loId) {
  const groupTopics = Object.values(topicsMap)
    .filter(t => t.loId === loId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  groupTopics.forEach((topic, idx) => {
    topicsMap[topic.id] = { ...topic, order: idx + 1 }
  })
}

// ============================================
// TEST DATA FIXTURES
// ============================================

const createTestData = () => ({
  los: {
    'lo-1': { id: 'lo-1', order: 1, verb: 'EXPLAIN', description: 'fundamentals' },
    'lo-2': { id: 'lo-2', order: 2, verb: 'IDENTIFY', description: 'components' },
    'lo-3': { id: 'lo-3', order: 3, verb: 'DEMONSTRATE', description: 'skills' }
  },
  topics: {
    'topic-1': { id: 'topic-1', loId: 'lo-1', title: 'Introduction', order: 1 },
    'topic-2': { id: 'topic-2', loId: 'lo-1', title: 'Core Concepts', order: 2 },
    'topic-3': { id: 'topic-3', loId: 'lo-2', title: 'Components A', order: 1 },
    'topic-4': { id: 'topic-4', loId: null, title: 'Misc Notes', order: 1 },
    'topic-5': { id: 'topic-5', loId: null, title: 'Unassigned', order: 2 }
  },
  subtopics: {
    'sub-1': { id: 'sub-1', topicId: 'topic-1', title: 'Overview', order: 1 },
    'sub-2': { id: 'sub-2', topicId: 'topic-1', title: 'History', order: 2 },
    'sub-3': { id: 'sub-3', topicId: 'topic-2', title: 'Definitions', order: 1 },
    'sub-4': { id: 'sub-4', topicId: 'topic-4', title: 'Note 1', order: 1 }
  }
})

// ============================================
// TESTS: computeTopicSerial
// ============================================

describe('computeTopicSerial', () => {
  test('linked topic returns {loOrder}.{topicOrder}', () => {
    const { los, topics } = createTestData()

    // Topic 1 is linked to LO 1, order 1 -> "1.1"
    expect(computeTopicSerial(topics['topic-1'], los, topics)).toBe('1.1')

    // Topic 2 is linked to LO 1, order 2 -> "1.2"
    expect(computeTopicSerial(topics['topic-2'], los, topics)).toBe('1.2')

    // Topic 3 is linked to LO 2, order 1 -> "2.1"
    expect(computeTopicSerial(topics['topic-3'], los, topics)).toBe('2.1')
  })

  test('unlinked topic returns x.{order}', () => {
    const { los, topics } = createTestData()

    // Topic 4 is unlinked, order 1 -> "x.1"
    expect(computeTopicSerial(topics['topic-4'], los, topics)).toBe('x.1')

    // Topic 5 is unlinked, order 2 -> "x.2"
    expect(computeTopicSerial(topics['topic-5'], los, topics)).toBe('x.2')
  })

  test('null topic returns ?.?', () => {
    const { los, topics } = createTestData()
    expect(computeTopicSerial(null, los, topics)).toBe('?.?')
  })

  test('topic with missing LO returns ?.{order}', () => {
    const { los, topics } = createTestData()
    const orphanTopic = { id: 'orphan', loId: 'nonexistent-lo', title: 'Orphan', order: 3 }
    expect(computeTopicSerial(orphanTopic, los, topics)).toBe('?.3')
  })

  test('serial is deterministic based on position not stored order', () => {
    const { los, topics } = createTestData()

    // Even if we mess up the stored order, serial should be based on sorted position
    topics['topic-1'].order = 99  // Wrong stored order
    topics['topic-2'].order = 1   // Wrong stored order

    // Sorting by stored order: topic-2 (1) comes before topic-1 (99)
    // So topic-2 should be 1.1, topic-1 should be 1.2
    expect(computeTopicSerial(topics['topic-2'], los, topics)).toBe('1.1')
    expect(computeTopicSerial(topics['topic-1'], los, topics)).toBe('1.2')
  })
})

// ============================================
// TESTS: computeSubtopicSerial
// ============================================

describe('computeSubtopicSerial', () => {
  test('subtopic of linked topic returns {loOrder}.{topicOrder}.{subtopicOrder}', () => {
    const { los, topics, subtopics } = createTestData()

    // Sub 1 under Topic 1 (1.1) -> "1.1.1"
    expect(computeSubtopicSerial(subtopics['sub-1'], topics, los, subtopics)).toBe('1.1.1')

    // Sub 2 under Topic 1 (1.1) -> "1.1.2"
    expect(computeSubtopicSerial(subtopics['sub-2'], topics, los, subtopics)).toBe('1.1.2')

    // Sub 3 under Topic 2 (1.2) -> "1.2.1"
    expect(computeSubtopicSerial(subtopics['sub-3'], topics, los, subtopics)).toBe('1.2.1')
  })

  test('subtopic of unlinked topic returns x.{topicOrder}.{subtopicOrder}', () => {
    const { los, topics, subtopics } = createTestData()

    // Sub 4 under Topic 4 (x.1) -> "x.1.1"
    expect(computeSubtopicSerial(subtopics['sub-4'], topics, los, subtopics)).toBe('x.1.1')
  })

  test('null subtopic returns ?.?.?', () => {
    const { los, topics, subtopics } = createTestData()
    expect(computeSubtopicSerial(null, topics, los, subtopics)).toBe('?.?.?')
  })

  test('subtopic with missing parent topic returns ?.?.{order}', () => {
    const { los, topics, subtopics } = createTestData()
    const orphanSub = { id: 'orphan-sub', topicId: 'nonexistent', title: 'Orphan', order: 1 }
    expect(computeSubtopicSerial(orphanSub, topics, los, subtopics)).toBe('?.?.1')
  })
})

// ============================================
// TESTS: recalculateCanonicalGroupOrders
// ============================================

describe('recalculateCanonicalGroupOrders', () => {
  test('recalculates orders for linked topics in LO', () => {
    const topics = {
      'a': { id: 'a', loId: 'lo-1', order: 5, title: 'A' },
      'b': { id: 'b', loId: 'lo-1', order: 1, title: 'B' },
      'c': { id: 'c', loId: 'lo-1', order: 10, title: 'C' },
      'd': { id: 'd', loId: 'lo-2', order: 1, title: 'D' } // Different LO, shouldn't change
    }

    recalculateCanonicalGroupOrders(topics, 'lo-1')

    // After sorting by order and reassigning: B(1) -> 1, A(5) -> 2, C(10) -> 3
    expect(topics['b'].order).toBe(1)
    expect(topics['a'].order).toBe(2)
    expect(topics['c'].order).toBe(3)

    // D should be unchanged
    expect(topics['d'].order).toBe(1)
  })

  test('recalculates orders for unlinked topics', () => {
    const topics = {
      'a': { id: 'a', loId: null, order: 3, title: 'A' },
      'b': { id: 'b', loId: null, order: 1, title: 'B' },
      'c': { id: 'c', loId: 'lo-1', order: 1, title: 'C' } // Linked, shouldn't change
    }

    recalculateCanonicalGroupOrders(topics, null)

    // After sorting: B(1) -> 1, A(3) -> 2
    expect(topics['b'].order).toBe(1)
    expect(topics['a'].order).toBe(2)

    // C should be unchanged
    expect(topics['c'].order).toBe(1)
  })

  test('handles empty group gracefully', () => {
    const topics = {
      'a': { id: 'a', loId: 'lo-1', order: 1, title: 'A' }
    }

    // Recalculate for LO that has no topics
    recalculateCanonicalGroupOrders(topics, 'lo-nonexistent')

    // A should be unchanged
    expect(topics['a'].order).toBe(1)
  })
})

// ============================================
// TESTS: Link/Unlink Scenarios
// ============================================

describe('Link/Unlink Scenarios', () => {
  test('linking topic to LO updates serial correctly', () => {
    const { los, topics } = createTestData()

    // Before: topic-4 is unlinked -> "x.1"
    expect(computeTopicSerial(topics['topic-4'], los, topics)).toBe('x.1')

    // Simulate linking to LO 3 (which has no topics yet)
    topics['topic-4'] = { ...topics['topic-4'], loId: 'lo-3', order: 1 }

    // After: topic-4 is linked to LO 3 -> "3.1"
    expect(computeTopicSerial(topics['topic-4'], los, topics)).toBe('3.1')
  })

  test('unlinking topic from LO updates serial correctly', () => {
    const { los, topics } = createTestData()

    // Before: topic-1 is linked to LO 1 -> "1.1"
    expect(computeTopicSerial(topics['topic-1'], los, topics)).toBe('1.1')

    // Simulate unlinking
    topics['topic-1'] = { ...topics['topic-1'], loId: null, order: 3 }

    // After: topic-1 is unlinked -> should be x.3 based on position
    // Note: order is 3, so it sorts after existing unlinked topics
    const unlinkedTopics = Object.values(topics).filter(t => t.loId === null)
    expect(unlinkedTopics.length).toBe(3) // topic-1, topic-4, topic-5

    // Recalculate to fix orders
    recalculateCanonicalGroupOrders(topics, null)

    // Now serials should be sequential
    const serials = unlinkedTopics.map(t => computeTopicSerial(t, los, topics)).sort()
    expect(serials).toEqual(['x.1', 'x.2', 'x.3'])
  })

  test('moving topic between LOs updates serials for both groups', () => {
    const { los, topics } = createTestData()

    // Before: topic-1 and topic-2 are under LO 1
    expect(computeTopicSerial(topics['topic-1'], los, topics)).toBe('1.1')
    expect(computeTopicSerial(topics['topic-2'], los, topics)).toBe('1.2')

    // topic-3 is under LO 2
    expect(computeTopicSerial(topics['topic-3'], los, topics)).toBe('2.1')

    // Move topic-1 from LO 1 to LO 2
    topics['topic-1'] = { ...topics['topic-1'], loId: 'lo-2', order: 2 }

    // Recalculate both groups
    recalculateCanonicalGroupOrders(topics, 'lo-1')
    recalculateCanonicalGroupOrders(topics, 'lo-2')

    // After: LO 1 should only have topic-2 -> "1.1"
    expect(computeTopicSerial(topics['topic-2'], los, topics)).toBe('1.1')

    // LO 2 should have topic-3 and topic-1 in order
    // topic-3 (order 1) -> "2.1", topic-1 (order 2) -> "2.2"
    expect(computeTopicSerial(topics['topic-3'], los, topics)).toBe('2.1')
    expect(computeTopicSerial(topics['topic-1'], los, topics)).toBe('2.2')
  })
})

// ============================================
// TESTS: Edge Cases
// ============================================

describe('Edge Cases', () => {
  test('empty topics map returns valid serial for unlinked topic', () => {
    const los = {}
    const topics = {
      'solo': { id: 'solo', loId: null, title: 'Solo', order: 1 }
    }

    expect(computeTopicSerial(topics['solo'], los, topics)).toBe('x.1')
  })

  test('single topic in LO gets serial 1', () => {
    const los = { 'lo-1': { id: 'lo-1', order: 1 } }
    const topics = {
      'solo': { id: 'solo', loId: 'lo-1', title: 'Solo', order: 1 }
    }

    expect(computeTopicSerial(topics['solo'], los, topics)).toBe('1.1')
  })

  test('topics with same order are handled deterministically', () => {
    const los = { 'lo-1': { id: 'lo-1', order: 1 } }
    const topics = {
      'a': { id: 'a', loId: 'lo-1', title: 'A', order: 1 },
      'b': { id: 'b', loId: 'lo-1', title: 'B', order: 1 },
      'c': { id: 'c', loId: 'lo-1', title: 'C', order: 1 }
    }

    // Even with same order, they should get distinct serials based on sort stability
    const serials = Object.values(topics).map(t => computeTopicSerial(t, los, topics))
    const uniqueSerials = new Set(serials)

    // All serials should be unique
    expect(uniqueSerials.size).toBe(3)
  })

  test('deeply nested subtopic serial is correct', () => {
    const los = { 'lo-1': { id: 'lo-1', order: 5 } }
    const topics = { 't1': { id: 't1', loId: 'lo-1', title: 'T1', order: 3 } }
    const subtopics = { 's1': { id: 's1', topicId: 't1', title: 'S1', order: 7 } }

    // Serial should be 5.1.1 (LO order 5, topic is first in its LO, subtopic is first)
    expect(computeSubtopicSerial(subtopics['s1'], topics, los, subtopics)).toBe('5.1.1')
  })
})

console.log('All tests defined. Run with: npm test')
