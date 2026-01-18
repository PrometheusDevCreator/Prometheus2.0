/**
 * DesignContext.jsx - Single Source of Truth for DESIGN Section
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 1
 *
 * Provides:
 * - Lesson data (shared between Timetable and Editor)
 * - Scalar hierarchy (Module > LO > Topic > Subtopic)
 * - Selection state (exactly one item selected/editing at a time)
 * - Bidirectional sync: changes propagate instantly between views
 *
 * HARD CONTRACT: Bidirectional Sync Matrix
 * - Editor title change -> Block title updates
 * - Editor duration change -> Block width updates
 * - Editor type change -> Block color updates
 * - Block drag resize -> Editor duration updates
 * - Block inline title edit -> Editor field updates
 * - Block context menu type -> Editor dropdown updates
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

// Canonical data adapter - Phase 1 Foundation
import {
  CANONICAL_FLAGS,
  canonicalLog,
  deriveScalarDataFromCanonical,
  migrateToCanonical,
  canonicalAddLO,
  canonicalAddTopic,
  canonicalAddSubtopic,
  canonicalUpdate,
  canonicalDelete,
  canonicalMoveTopic,
  computeTopicSerial as adapterComputeTopicSerial,
  computeSubtopicSerial as adapterComputeSubtopicSerial
} from '../utils/canonicalAdapter'

// ============================================
// DEBUG INSTRUMENTATION - Hierarchy Linking & Numbering
// ============================================
const DEBUG_HIERARCHY = true // Set to false to disable debug logging

const debugLog = (action, data) => {
  if (!DEBUG_HIERARCHY) return
  const timestamp = new Date().toISOString().slice(11, 23)
  console.group(`🔧 [${timestamp}] ${action}`)
  console.log('Data:', data)
  console.trace('Stack trace')
  console.groupEnd()
}

// Compute topic serial number for debugging
const computeTopicSerialDebug = (topic, loOrder) => {
  if (!topic) return 'NULL_TOPIC'
  if (loOrder != null && loOrder > 0) {
    return `${loOrder}.${topic.order || '?'}`
  }
  return `x.${topic.order || '?'}`
}

// Compute subtopic serial number for debugging
const computeSubtopicSerialDebug = (subtopic, topicSerial) => {
  if (!subtopic) return 'NULL_SUBTOPIC'
  return `${topicSerial}.${subtopic.order || '?'}`
}

// ============================================
// CANONICAL SERIAL COMPUTATION (Deterministic Numbering)
// Serial numbers are ALWAYS computed from structure, never stored
// ============================================

/**
 * Compute topic serial number from canonical data
 * @param {Object} topic - Topic object with { id, loId, order }
 * @param {Object} losMap - Map of LO id -> LO object
 * @param {Object} topicsMap - Map of topic id -> topic object
 * @returns {string} Serial like "1.2" or "x.3"
 */
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

/**
 * Compute subtopic serial number from canonical data
 * @param {Object} subtopic - Subtopic object with { id, topicId, order }
 * @param {Object} topicsMap - Map of topic id -> topic object
 * @param {Object} losMap - Map of LO id -> LO object
 * @param {Object} subtopicsMap - Map of subtopic id -> subtopic object
 * @returns {string} Serial like "1.2.3" or "x.1.2"
 */
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

/**
 * Recalculate order numbers for all topics in a group
 * @param {Object} topicsMap - Map of topic id -> topic object (will be mutated)
 * @param {string|null} loId - LO ID or null for unlinked group
 */
function recalculateCanonicalGroupOrders(topicsMap, loId) {
  const groupTopics = Object.values(topicsMap)
    .filter(t => t.loId === loId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  groupTopics.forEach((topic, idx) => {
    topicsMap[topic.id] = { ...topic, order: idx + 1 }
  })
}

// ============================================
// DATA MODEL TYPES (for reference)
// ============================================
/**
 * Lesson {
 *   id: string,
 *   title: string,
 *   type: string,        // 'instructor-led' | 'discussion' | 'project' | etc.
 *   duration: number,    // minutes
 *   startTime: string,   // "0900"
 *   day: number,         // 1-based
 *   week: number,        // 1-based
 *   module: number,      // 1-based
 *   topics: TopicRef[],
 *   learningObjectives: string[],  // LO IDs
 *   scheduled: boolean,  // true = on timetable
 *   saved: boolean       // true = in saved library
 * }
 *
 * LearningObjective {
 *   id: string,
 *   moduleId: string,
 *   verb: string,        // EXPLAIN, IDENTIFY, etc.
 *   description: string,
 *   order: number
 * }
 *
 * Topic {
 *   id: string,
 *   loId: string,        // parent LO
 *   title: string,
 *   order: number
 * }
 *
 * Subtopic {
 *   id: string,
 *   topicId: string,     // parent Topic
 *   title: string,
 *   order: number
 * }
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

// Convert time string "0900" to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const hour = parseInt(timeStr.slice(0, 2)) || 0
  const min = parseInt(timeStr.slice(2, 4)) || 0
  return hour * 60 + min
}

// Convert minutes from midnight to time string "0900"
function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60) % 24
  const min = minutes % 60
  return `${hour.toString().padStart(2, '0')}${min.toString().padStart(2, '0')}`
}

// Snap minutes to 5-minute grid
function snapToGrid(minutes, gridSize = 5) {
  return Math.round(minutes / gridSize) * gridSize
}

// ============================================
// SLIDE TYPES - 6 types for BUILD page (Correction #2)
// ============================================
export const SLIDE_TYPES = [
  { id: 'agenda', name: 'Agenda', label: 'AGENDA' },
  { id: 'summary', name: 'Summary', label: 'SUMMARY' },
  { id: 'lesson_title', name: 'Lesson Title', label: 'LESSON TITLE' },
  { id: 'user_defined_1', name: 'User Defined 1', label: 'USER DEFINED 1' },
  { id: 'user_defined_2', name: 'User Defined 2', label: 'USER DEFINED 2' },
  { id: 'user_defined_3', name: 'User Defined 3', label: 'USER DEFINED 3' }
]

// ============================================
// DEFAULT SLIDE FACTORY (Correction #1 - 1 default slide per lesson)
// ============================================
const createDefaultSlide = () => ({
  id: `slide-${Date.now()}`,
  type: 'lesson_title',
  contentBlocks: [
    { subtopicId: null, text: '' },
    { subtopicId: null, text: '' },
    { subtopicId: null, text: '' },
    { subtopicId: null, text: '' },
    { subtopicId: null, text: '' }
  ],
  instructorNotes: ''
})

// ============================================
// LESSON TYPES - 6 types per Phase 2-6 redesign
// ============================================
export const LESSON_TYPES = [
  // Phase 2-6 Redesign: Reduced to 6 types, displayed as colored circles
  { id: 'instructor-led', name: 'Instructor Led', label: 'Instructor Led', color: '#FF6600' },  // Orange/Red
  { id: 'group', name: 'Group', label: 'Group', color: '#00BFFF' },                             // Blue
  { id: 'student-led', name: 'Student Led', label: 'Student Led', color: '#00FF00' },          // Green
  { id: 'assessment', name: 'Assessment', label: 'Assessment', color: '#9C27B0' },             // Purple
  { id: 'admin', name: 'Admin', label: 'Admin', color: '#FFFFFF' },                            // White
  { id: 'break', name: 'Break', label: 'Break', color: '#FFD700' }                             // Yellow
]

// ============================================
// PC COLORS - Distinctive colors for Performance Criteria
// ============================================
export const PC_COLORS = [
  '#00FF00',  // Luminous Green (first PC)
  '#00BFFF',  // Deep Sky Blue
  '#FF00FF',  // Magenta
  '#FFD700',  // Gold
  '#FF4444',  // Red
  '#FF6600',  // Orange
  '#00FFFF',  // Cyan
  '#FFFFFF'   // White
]

// ============================================
// CONTEXT DEFINITION
// ============================================
const DesignContext = createContext(null)

// ============================================
// PROVIDER COMPONENT
// ============================================
export function DesignProvider({ children, courseData, setCourseData, timetableData, setTimetableData }) {
  // --------------------------------------------
  // NAVIGATION STATE
  // --------------------------------------------
  const [activeTab, setActiveTab] = useState('timetable') // 'overview' | 'timetable' | 'scalar' - TIMETABLE is default
  const [viewMode, setViewMode] = useState('week') // 'day' | 'week' | 'module'
  const [currentModule, setCurrentModule] = useState(1)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [currentDay, setCurrentDay] = useState(1)

  // --------------------------------------------
  // LIFTED STATE FROM APP.JSX (persists across page navigation)
  // Lessons and overviewBlocks are now managed by App.jsx for persistence
  // --------------------------------------------
  const lessons = timetableData?.lessons || []
  const overviewBlocks = timetableData?.overviewBlocks || []

  // Wrapper to update lessons in App.jsx state
  const setLessons = useCallback((updater) => {
    setTimetableData(prev => ({
      ...prev,
      lessons: typeof updater === 'function' ? updater(prev.lessons || []) : updater
    }))
  }, [setTimetableData])

  // Wrapper to update overviewBlocks in App.jsx state
  const setOverviewBlocks = useCallback((updater) => {
    setTimetableData(prev => ({
      ...prev,
      overviewBlocks: typeof updater === 'function' ? updater(prev.overviewBlocks || []) : updater
    }))
  }, [setTimetableData])

  // --------------------------------------------
  // OVERVIEW PLANNING STATE (Phase 2-6 Redesign)
  // Timelines and NoteBlocks for visual course planning
  // --------------------------------------------
  const overviewPlanningState = timetableData?.overviewPlanningState || {
    timelines: [],
    notes: [],
    colorLabels: {}
  }

  // Add a new timeline
  const addPlanningTimeline = useCallback((timeline) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        timelines: [...(prev.overviewPlanningState?.timelines || []), timeline]
      }
    }))
  }, [setTimetableData])

  // Remove a timeline
  const removePlanningTimeline = useCallback((timelineId) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        timelines: (prev.overviewPlanningState?.timelines || []).filter(t => t.id !== timelineId)
      }
    }))
  }, [setTimetableData])

  // Update a timeline
  const updatePlanningTimeline = useCallback((timelineId, updates) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        timelines: (prev.overviewPlanningState?.timelines || []).map(t =>
          t.id === timelineId ? { ...t, ...updates } : t
        )
      }
    }))
  }, [setTimetableData])

  // Add a new note
  const addPlanningNote = useCallback((note) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        notes: [...(prev.overviewPlanningState?.notes || []), note]
      }
    }))
  }, [setTimetableData])

  // Remove a note
  const removePlanningNote = useCallback((noteId) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        notes: (prev.overviewPlanningState?.notes || []).filter(n => n.id !== noteId)
      }
    }))
  }, [setTimetableData])

  // Update a note
  const updatePlanningNote = useCallback((noteId, updates) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        notes: (prev.overviewPlanningState?.notes || []).map(n =>
          n.id === noteId ? { ...n, ...updates } : n
        )
      }
    }))
  }, [setTimetableData])

  // Update a color label
  const updatePlanningColorLabel = useCallback((colorIndex, label) => {
    setTimetableData(prev => ({
      ...prev,
      overviewPlanningState: {
        ...(prev.overviewPlanningState || { timelines: [], notes: [], colorLabels: {} }),
        colorLabels: {
          ...(prev.overviewPlanningState?.colorLabels || {}),
          [colorIndex]: label
        }
      }
    }))
  }, [setTimetableData])

  // --------------------------------------------
  // SCALAR HIERARCHY STATE
  // Module > LearningObjective > Topic > Subtopic
  // --------------------------------------------

  // Helper to convert courseData.learningObjectives (strings) to scalar format
  const convertCourseDataLOs = useCallback((loStrings) => {
    if (!loStrings || loStrings.length === 0) return []
    return loStrings
      .filter(lo => lo && lo.trim().length > 0)
      .map((loText, idx) => {
        const words = loText.trim().split(/\s+/)
        const verb = words[0]?.toUpperCase() || 'IDENTIFY'
        const description = words.slice(1).join(' ') || ''
        return {
          id: `lo-define-${idx + 1}`,
          verb,
          description,
          order: idx + 1,
          expanded: true,
          topics: []
        }
      })
  }, [])

  // Initialize scalarData from courseData if available
  const initialLOs = useMemo(() => {
    if (courseData?.learningObjectives?.length > 0) {
      return convertCourseDataLOs(courseData.learningObjectives)
    }
    // Fallback to default LO
    return [{
      id: 'lo-1-1',
      verb: 'EXPLAIN',
      description: 'the fundamentals of the subject',
      order: 1,
      expanded: true,
      topics: [
        {
          id: 'topic-1-1-1',
          title: 'Introduction to Core Concepts',
          order: 1,
          expanded: false,
          subtopics: []
        }
      ]
    }]
  }, [courseData?.learningObjectives, convertCourseDataLOs])

  const [scalarData, setScalarData] = useState({
    modules: [
      {
        id: 'module-1',
        name: 'Module 1',
        order: 1,
        expanded: true,
        learningObjectives: initialLOs
      }
    ],
    // Unlinked topics (not assigned to any LO) - display as x.1, x.2, etc.
    unlinkedTopics: [],
    // Performance Criteria - tagging system across hierarchy
    performanceCriteria: []
  })

  // --------------------------------------------
  // CANONICAL DATA STORE (Normalized - Single Source of Truth)
  // This is the authoritative store for hierarchy elements
  // Serial numbers are COMPUTED from this, never stored
  // --------------------------------------------
  const [canonicalData, setCanonicalData] = useState({
    los: {},        // { [loId]: { id, moduleId, verb, description, order } }
    topics: {},     // { [topicId]: { id, loId|null, title, order } }
    subtopics: {},  // { [subtopicId]: { id, topicId, title, order } }
    // Phase 3: Performance Criteria added to canonical
    performanceCriteria: {}, // { [pcId]: { id, name, order, color, linkedItems: { los, topics, subtopics, lessons } } }
    // Lesson associations via junction arrays
    lessonLOs: [],      // [{ lessonId, loId, isPrimary }]
    lessonTopics: [],   // [{ lessonId, topicId }]
    lessonSubtopics: [] // [{ lessonId, subtopicId }]
  })

  // Initialize canonical store from scalarData on mount
  useEffect(() => {
    const los = {}
    const topics = {}
    const subtopics = {}

    // Migrate from scalarData structure
    scalarData.modules.forEach(module => {
      ;(module.learningObjectives || []).forEach(lo => {
        los[lo.id] = {
          id: lo.id,
          moduleId: module.id,
          verb: lo.verb,
          description: lo.description,
          order: lo.order
        }

        ;(lo.topics || []).forEach((topic, tIdx) => {
          topics[topic.id] = {
            id: topic.id,
            loId: lo.id,
            title: topic.title,
            order: topic.order || tIdx + 1,
            expanded: topic.expanded || false
          }

          ;(topic.subtopics || []).forEach((sub, sIdx) => {
            subtopics[sub.id] = {
              id: sub.id,
              topicId: topic.id,
              title: sub.title,
              order: sub.order || sIdx + 1
            }
          })
        })
      })
    })

    // Migrate unlinked topics
    ;(scalarData.unlinkedTopics || []).forEach((topic, tIdx) => {
      topics[topic.id] = {
        id: topic.id,
        loId: null,
        title: topic.title,
        order: topic.order || tIdx + 1,
        expanded: topic.expanded || false
      }

      ;(topic.subtopics || []).forEach((sub, sIdx) => {
        subtopics[sub.id] = {
          id: sub.id,
          topicId: topic.id,
          title: sub.title,
          order: sub.order || sIdx + 1
        }
      })
    })

    // Phase 3: Migrate Performance Criteria
    const performanceCriteria = {}
    ;(scalarData.performanceCriteria || []).forEach(pc => {
      performanceCriteria[pc.id] = {
        id: pc.id,
        name: pc.name,
        order: pc.order,
        color: pc.color,
        linkedItems: pc.linkedItems || { los: [], topics: [], subtopics: [], lessons: [] }
      }
    })

    if (Object.keys(los).length > 0 || Object.keys(topics).length > 0 || Object.keys(performanceCriteria).length > 0) {
      debugLog('CANONICAL_STORE_INITIALIZED', {
        loCount: Object.keys(los).length,
        topicCount: Object.keys(topics).length,
        subtopicCount: Object.keys(subtopics).length,
        pcCount: Object.keys(performanceCriteria).length,
        los: Object.values(los).map(l => `${l.order}. ${l.verb}`),
        topics: Object.values(topics).map(t => `${t.id}: loId=${t.loId}, order=${t.order}`)
      })
      setCanonicalData(prev => ({ ...prev, los, topics, subtopics, performanceCriteria }))
    }
  }, []) // Run once on mount

  // Sync canonicalData when scalarData.modules changes (handles courseData updates)
  useEffect(() => {
    const los = {}
    const topics = {}
    const subtopics = {}

    // Re-sync from scalarData structure
    scalarData.modules.forEach(module => {
      ;(module.learningObjectives || []).forEach(lo => {
        los[lo.id] = {
          id: lo.id,
          moduleId: module.id,
          verb: lo.verb,
          description: lo.description,
          title: lo.title || `${lo.verb} ${lo.description}`,
          order: lo.order
        }

        ;(lo.topics || []).forEach((topic, tIdx) => {
          topics[topic.id] = {
            id: topic.id,
            loId: lo.id,
            title: topic.title,
            order: topic.order || tIdx + 1,
            expanded: topic.expanded || false
          }

          ;(topic.subtopics || []).forEach((sub, sIdx) => {
            subtopics[sub.id] = {
              id: sub.id,
              topicId: topic.id,
              title: sub.title,
              order: sub.order || sIdx + 1
            }
          })
        })
      })
    })

    // Update canonical store if there are LOs
    if (Object.keys(los).length > 0) {
      setCanonicalData(prev => ({ ...prev, los, topics, subtopics }))
    }
  }, [scalarData.modules]) // Re-run when modules change

  // Phase 2: hierarchyData sync effect REMOVED
  // hierarchyData no longer exists in timetableData (App.jsx)
  // LessonEditorModal now reads directly from canonicalData via useDesign() context

  // --------------------------------------------
  // PHASE 1: DERIVE LEGACY scalarData FROM CANONICAL
  // This provides backward compatibility during transition
  // When CANONICAL_FLAGS.DERIVE_LEGACY is true, scalarData is computed
  // --------------------------------------------
  const derivedScalarData = useMemo(() => {
    if (!CANONICAL_FLAGS.DERIVE_LEGACY) return null

    // Only derive if canonical has data
    if (Object.keys(canonicalData.los).length === 0 &&
        Object.keys(canonicalData.topics).length === 0) {
      return null
    }

    // Get modules from existing scalarData (modules are not in canonical yet)
    const modules = scalarData.modules.map(m => ({
      id: m.id,
      name: m.name,
      order: m.order,
      expanded: m.expanded
    }))

    // Phase 3: Read PC from canonical (object → array for derivation)
    const pcArray = Object.values(canonicalData.performanceCriteria || {})

    const derived = deriveScalarDataFromCanonical(
      canonicalData,
      modules,
      pcArray
    )

    if (derived) {
      canonicalLog('DERIVED_SCALAR_DATA', {
        moduleCount: derived.modules?.length,
        loCount: Object.keys(canonicalData.los).length,
        topicCount: Object.keys(canonicalData.topics).length,
        pcCount: pcArray.length
      })
    }

    return derived
  }, [canonicalData, scalarData.modules])

  // Use derived data if available, otherwise fall back to legacy
  const effectiveScalarData = derivedScalarData || scalarData

  // Computed: Get topic serial from canonical store
  const getCanonicalTopicSerial = useCallback((topicId) => {
    const topic = canonicalData.topics[topicId]
    if (!topic) return '?.?'
    return computeTopicSerial(topic, canonicalData.los, canonicalData.topics)
  }, [canonicalData])

  // Computed: Get subtopic serial from canonical store
  const getCanonicalSubtopicSerial = useCallback((subtopicId) => {
    const subtopic = canonicalData.subtopics[subtopicId]
    if (!subtopic) return '?.?.?'
    return computeSubtopicSerial(subtopic, canonicalData.topics, canonicalData.los, canonicalData.subtopics)
  }, [canonicalData])

  // Highlighted items for cross-column highlighting in Scalar
  const [highlightedItems, setHighlightedItems] = useState({
    los: new Set(),
    topics: new Set(),
    subtopics: new Set(),
    lessons: new Set()
  })

  // --------------------------------------------
  // MULTI-SELECTION STATE (for SHIFT+click bulk operations)
  // --------------------------------------------
  const [multiSelection, setMultiSelection] = useState({
    items: [],      // Array of { type, id }
    active: false   // Whether multi-selection mode is active
  })

  // --------------------------------------------
  // BUILD PAGE STATE (for slide authoring)
  // --------------------------------------------
  const [buildSelection, setBuildSelection] = useState({
    moduleId: null,
    lessonId: null,
    topicId: null,
    slideIndex: 0
  })

  // Toggle item in multi-selection
  const toggleMultiSelect = useCallback((type, id) => {
    setMultiSelection(prev => {
      const existingIndex = prev.items.findIndex(i => i.type === type && i.id === id)
      if (existingIndex >= 0) {
        // Remove item if already selected
        return {
          items: prev.items.filter((_, i) => i !== existingIndex),
          active: prev.items.length > 1
        }
      }
      // Add item to selection
      return {
        items: [...prev.items, { type, id }],
        active: true
      }
    })
  }, [])

  // Clear multi-selection
  const clearMultiSelection = useCallback(() => {
    setMultiSelection({ items: [], active: false })
  }, [])

  // Check if item is in multi-selection
  const isMultiSelected = useCallback((type, id) => {
    return multiSelection.items.some(i => i.type === type && i.id === id)
  }, [multiSelection.items])

  // Helper: Check if a topic number is unallocated (starts with 'x.')
  const isUnallocatedNumber = useCallback((number) => {
    return number?.startsWith('x.') || false
  }, [])

  // --------------------------------------------
  // UNIVERSAL LINKING (SHIFT+click any element to any element)
  // --------------------------------------------
  const [linkingSource, setLinkingSource] = useState(null) // { type, id, name }
  const [sessionLinkedElements, setSessionLinkedElements] = useState([]) // Elements linked in current session

  // Clear linking source and session linked elements
  const clearLinkingSource = useCallback(() => {
    setLinkingSource(null)
    setSessionLinkedElements([])
  }, [])

  // Check if an element is part of the current linking session (source or linked)
  const isSessionLinked = useCallback((type, id) => {
    if (linkingSource && linkingSource.type === type && linkingSource.id === id) {
      return true
    }
    return sessionLinkedElements.some(el => el.type === type && el.id === id)
  }, [linkingSource, sessionLinkedElements])

  // Sync scalarData when courseData.learningObjectives changes
  useEffect(() => {
    if (courseData?.learningObjectives?.length > 0) {
      const newLOs = convertCourseDataLOs(courseData.learningObjectives)
      setScalarData(prev => ({
        ...prev,
        modules: prev.modules.map((module, idx) =>
          idx === 0
            ? { ...module, learningObjectives: newLOs }
            : module
        )
      }))
    }
  }, [courseData?.learningObjectives, convertCourseDataLOs])

  // --------------------------------------------
  // SELECTION STATE (exactly one at a time)
  // --------------------------------------------
  const [selection, setSelection] = useState({
    type: 'lesson',       // 'lesson' | 'lo' | 'topic' | 'subtopic' | null
    id: 'lesson-1',
    mode: 'selected'      // 'selected' | 'editing'
  })

  // --------------------------------------------
  // HIERARCHY NAVIGATION STATE (Phase 4: Calm Wheel)
  // --------------------------------------------
  const [hierarchyNav, setHierarchyNav] = useState({
    currentLevel: 0,      // 0=module, 1=lo, 2=topic, 3=subtopic, 4=lesson
    path: [],             // Breadcrumb: [{ level, id, label, serial }]
    filterId: null        // ID of item filtering lower levels
  })

  const [wheelNavCollapsed, setWheelNavCollapsed] = useState(false)

  // --------------------------------------------
  // EDITOR PANEL STATE
  // --------------------------------------------
  const [editorCollapsed, setEditorCollapsed] = useState(true)

  // --------------------------------------------
  // LESSON OPERATIONS (Bidirectional Sync)
  // --------------------------------------------

  // Update lesson - single function for all updates
  const updateLesson = useCallback((lessonId, updates) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    ))
  }, [])

  // Create new lesson
  const createLesson = useCallback((initialData = {}) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'NEW LESSON',
      type: 'instructor-led',
      duration: 60,
      startTime: '0900',
      day: currentDay,
      week: currentWeek,
      module: currentModule,
      topics: [],
      learningObjectives: [],
      scheduled: false,  // Starts in library
      saved: false,
      ...initialData
    }
    setLessons(prev => [...prev, newLesson])
    setSelection({ type: 'lesson', id: newLesson.id, mode: 'editing' })
    return newLesson.id
  }, [currentDay, currentWeek, currentModule])

  // Delete lesson
  const deleteLesson = useCallback((lessonId) => {
    setLessons(prev => {
      const remaining = prev.filter(l => l.id !== lessonId)
      // If deleted lesson was selected, select first remaining
      if (selection.id === lessonId && remaining.length > 0) {
        setSelection({ type: 'lesson', id: remaining[0].id, mode: 'selected' })
      } else if (remaining.length === 0) {
        setSelection({ type: null, id: null, mode: null })
      }
      return remaining
    })
  }, [selection.id])

  // Duplicate lesson
  const duplicateLesson = useCallback((lessonId) => {
    const source = lessons.find(l => l.id === lessonId)
    if (!source) return null

    const newLesson = {
      ...source,
      id: `lesson-${Date.now()}`,
      title: `${source.title} (Copy)`,
      scheduled: false
    }
    setLessons(prev => [...prev, newLesson])
    return newLesson.id
  }, [lessons])

  // Schedule lesson (move from library to timetable)
  const scheduleLesson = useCallback((lessonId, day, startTime) => {
    updateLesson(lessonId, { scheduled: true, day, startTime })
  }, [updateLesson])

  // Unschedule lesson (move from timetable to library)
  const unscheduleLesson = useCallback((lessonId) => {
    updateLesson(lessonId, { scheduled: false })
  }, [updateLesson])

  // Save lesson to library
  const saveToLibrary = useCallback((lessonId) => {
    updateLesson(lessonId, { saved: true })
  }, [updateLesson])

  // Helper: Get LO order from scalar data
  const getLOOrder = useCallback((loId) => {
    if (!loId) return null
    for (const module of scalarData.modules) {
      const lo = module.learningObjectives.find(l => l.id === loId)
      if (lo) return lo.order
    }
    return null
  }, [scalarData])

  // Helper: Get LO by ID from scalar data
  const getLOById = useCallback((loId) => {
    if (!loId) return null
    for (const module of scalarData.modules) {
      const lo = module.learningObjectives.find(l => l.id === loId)
      if (lo) return lo
    }
    return null
  }, [scalarData])

  // Helper: Calculate display number for a topic
  // Returns "x.N" for unlinked, "{loOrder}.N" for linked
  const calculateTopicNumber = useCallback((topic, allTopicsInGroup, loOrder) => {
    if (!loOrder) {
      // Unlinked topic - x.{order}
      const order = topic.order || (allTopicsInGroup.findIndex(t => t.id === topic.id) + 1)
      return `x.${order}`
    }
    // Linked topic - {loOrder}.{order}
    const order = topic.order || (allTopicsInGroup.findIndex(t => t.id === topic.id) + 1)
    return `${loOrder}.${order}`
  }, [])

  // Helper: Calculate display number for a subtopic
  const calculateSubtopicNumber = useCallback((subtopic, parentTopicNumber) => {
    const order = subtopic.order || 1
    return `${parentTopicNumber}.${order}`
  }, [])

  // Recalculate order numbers for all topics in a group (same loId or all unlinked)
  const recalculateGroupOrders = useCallback((loId) => {
    setScalarData(prev => {
      const newData = { ...prev }

      if (loId === null) {
        // Recalculate unlinked topics
        newData.unlinkedTopics = (prev.unlinkedTopics || []).map((topic, idx) => ({
          ...topic,
          order: idx + 1
        }))
        return newData
      }

      // Recalculate topics for specific LO
      newData.modules = prev.modules.map(module => ({
        ...module,
        learningObjectives: module.learningObjectives.map(lo => {
          if (lo.id !== loId) return lo
          return {
            ...lo,
            topics: (lo.topics || []).map((topic, idx) => ({
              ...topic,
              order: idx + 1
            }))
          }
        })
      }))
      return newData
    })
  }, [])

  // Toggle topic-LO link: if linked to this LO, unlink; otherwise link to this LO
  const toggleTopicLOLink = useCallback((topicId, targetLoId) => {
    debugLog('TOGGLE_TOPIC_LO_LINK_START', { topicId, targetLoId })

    // Update canonical store FIRST (authoritative)
    setCanonicalData(prev => {
      const topic = prev.topics[topicId]
      if (!topic) {
        debugLog('TOGGLE_CANONICAL_TOPIC_NOT_FOUND', { topicId })
        return prev
      }

      const sourceLoId = topic.loId
      const newTopics = { ...prev.topics }

      // Determine action: if currently linked to targetLoId, unlink; otherwise link
      if (sourceLoId === targetLoId) {
        // Unlink: set loId to null
        const unlinkedCount = Object.values(prev.topics).filter(t => t.loId === null).length
        newTopics[topicId] = { ...topic, loId: null, order: unlinkedCount + 1 }
        debugLog('TOGGLE_CANONICAL_UNLINKED', {
          topicId,
          previousLoId: sourceLoId,
          newOrder: unlinkedCount + 1,
          newSerial: computeTopicSerial(newTopics[topicId], prev.los, newTopics)
        })
      } else {
        // Link to targetLoId
        const targetLoTopics = Object.values(prev.topics).filter(t => t.loId === targetLoId)
        newTopics[topicId] = { ...topic, loId: targetLoId, order: targetLoTopics.length + 1 }
        debugLog('TOGGLE_CANONICAL_LINKED', {
          topicId,
          previousLoId: sourceLoId,
          targetLoId,
          newOrder: targetLoTopics.length + 1,
          newSerial: computeTopicSerial(newTopics[topicId], prev.los, newTopics)
        })
      }

      // Recalculate orders for source group
      if (sourceLoId !== null) {
        recalculateCanonicalGroupOrders(newTopics, sourceLoId)
      } else {
        recalculateCanonicalGroupOrders(newTopics, null)
      }

      return { ...prev, topics: newTopics }
    })

    // Legacy write - kept for backward compatibility during transition
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev }
        let topicToMove = null
        let sourceLoId = null
        let wasUnlinked = false
        let sourceLoOrder = null

        // First, find and remove the topic from its current location
        // Check in unlinked topics
        const unlinkedIdx = (prev.unlinkedTopics || []).findIndex(t => t.id === topicId)
        if (unlinkedIdx !== -1) {
          topicToMove = { ...(prev.unlinkedTopics || [])[unlinkedIdx] }
          newData.unlinkedTopics = (prev.unlinkedTopics || []).filter(t => t.id !== topicId)
          wasUnlinked = true
        }

        // Check in LO topics
        if (!topicToMove) {
          newData.modules = prev.modules.map(module => ({
            ...module,
            learningObjectives: module.learningObjectives.map(lo => {
              const topicIdx = (lo.topics || []).findIndex(t => t.id === topicId)
              if (topicIdx !== -1) {
                topicToMove = { ...lo.topics[topicIdx] }
                sourceLoId = lo.id
                sourceLoOrder = lo.order
                return {
                  ...lo,
                  topics: lo.topics.filter(t => t.id !== topicId).map((t, idx) => ({ ...t, order: idx + 1 }))
                }
              }
              return lo
            })
          }))
        }

        if (!topicToMove) {
          return prev
        }

        // Determine action: if currently linked to targetLoId, unlink; otherwise link to targetLoId
        if (sourceLoId === targetLoId) {
          // Currently linked to this LO - unlink (move to unlinkedTopics)
          topicToMove.loId = null
          topicToMove.order = (newData.unlinkedTopics || []).length + 1
          newData.unlinkedTopics = [...(newData.unlinkedTopics || []), topicToMove]
        } else {
          // Link to targetLoId
          topicToMove.loId = targetLoId
          newData.modules = newData.modules.map(module => ({
            ...module,
            learningObjectives: module.learningObjectives.map(lo => {
              if (lo.id !== targetLoId) return lo
              const newOrder = (lo.topics || []).length + 1
              topicToMove.order = newOrder
              return {
                ...lo,
                topics: [...(lo.topics || []), topicToMove]
              }
            })
          }))
        }

        // Recalculate orders for unlinked topics
        newData.unlinkedTopics = (newData.unlinkedTopics || []).map((t, idx) => ({ ...t, order: idx + 1 }))

        return newData
      })
    }
  }, [])

  // Unlink topic from its LO (move to unlinked group)
  // Phase 2: Updated to write to canonical first
  const unlinkTopic = useCallback((topicId) => {
    // Write to canonical first
    setCanonicalData(prev => {
      const topic = prev.topics[topicId]
      if (!topic || topic.loId === null) return prev

      const newTopics = { ...prev.topics }
      const sourceLoId = topic.loId

      // Calculate new order for unlinked group
      const unlinkedCount = Object.values(prev.topics).filter(t => t.loId === null).length

      // Unlink the topic
      newTopics[topicId] = { ...topic, loId: null, order: unlinkedCount + 1 }

      // Recalculate orders for topics remaining in source LO
      const sourceTopics = Object.values(newTopics)
        .filter(t => t.loId === sourceLoId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
      sourceTopics.forEach((t, idx) => {
        newTopics[t.id] = { ...newTopics[t.id], order: idx + 1 }
      })

      return { ...prev, topics: newTopics }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev }
        let topicToMove = null

        // Find and remove topic from its LO
        newData.modules = prev.modules.map(module => ({
          ...module,
          learningObjectives: module.learningObjectives.map(lo => {
            const topicIdx = (lo.topics || []).findIndex(t => t.id === topicId)
            if (topicIdx !== -1) {
              topicToMove = { ...lo.topics[topicIdx], loId: null }
              return {
                ...lo,
                topics: lo.topics.filter(t => t.id !== topicId).map((t, idx) => ({ ...t, order: idx + 1 }))
              }
            }
            return lo
          })
        }))

        if (topicToMove) {
          topicToMove.order = (prev.unlinkedTopics || []).length + 1
          newData.unlinkedTopics = [...(prev.unlinkedTopics || []), topicToMove]
        }

        return topicToMove ? newData : prev
      })
    }
  }, [])

  // Link topic to an LO (move from unlinked or another LO)
  // Phase 2: Updated to write to canonical first
  const linkTopicToLO = useCallback((topicId, targetLoId) => {
    // Write to canonical first
    setCanonicalData(prev => {
      const topic = prev.topics[topicId]
      if (!topic) return prev
      if (topic.loId === targetLoId) return prev // Already in target LO

      const newTopics = { ...prev.topics }
      const sourceLoId = topic.loId

      // Calculate new order for target LO
      const targetLOTopicsCount = Object.values(prev.topics).filter(t => t.loId === targetLoId).length

      // Link the topic to target LO
      newTopics[topicId] = { ...topic, loId: targetLoId, order: targetLOTopicsCount + 1 }

      // Recalculate orders for source group (unlinked or LO)
      if (sourceLoId === null) {
        // Was unlinked, renumber unlinked topics
        const unlinkedTopics = Object.values(newTopics)
          .filter(t => t.loId === null && t.id !== topicId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        unlinkedTopics.forEach((t, idx) => {
          newTopics[t.id] = { ...newTopics[t.id], order: idx + 1 }
        })
      } else {
        // Was in another LO, renumber that LO's topics
        const sourceTopics = Object.values(newTopics)
          .filter(t => t.loId === sourceLoId && t.id !== topicId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        sourceTopics.forEach((t, idx) => {
          newTopics[t.id] = { ...newTopics[t.id], order: idx + 1 }
        })
      }

      return { ...prev, topics: newTopics }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev }
        let topicToMove = null

        // Check in unlinked topics first
        const unlinkedIdx = (prev.unlinkedTopics || []).findIndex(t => t.id === topicId)
        if (unlinkedIdx !== -1) {
          topicToMove = { ...(prev.unlinkedTopics || [])[unlinkedIdx] }
          newData.unlinkedTopics = (prev.unlinkedTopics || [])
            .filter(t => t.id !== topicId)
            .map((t, idx) => ({ ...t, order: idx + 1 }))
        }

        // Check in other LO topics
        if (!topicToMove) {
          newData.modules = prev.modules.map(module => ({
            ...module,
            learningObjectives: module.learningObjectives.map(lo => {
              const topicIdx = (lo.topics || []).findIndex(t => t.id === topicId)
              if (topicIdx !== -1 && lo.id !== targetLoId) {
                topicToMove = { ...lo.topics[topicIdx] }
                return {
                  ...lo,
                  topics: lo.topics.filter(t => t.id !== topicId).map((t, idx) => ({ ...t, order: idx + 1 }))
                }
              }
              return lo
            })
          }))
        }

        if (!topicToMove) return prev // Already in target LO or not found

        // Add to target LO
        topicToMove.loId = targetLoId
        newData.modules = (newData.modules || prev.modules).map(module => ({
          ...module,
          learningObjectives: module.learningObjectives.map(lo => {
            if (lo.id !== targetLoId) return lo
            topicToMove.order = (lo.topics || []).length + 1
            return {
              ...lo,
              topics: [...(lo.topics || []), topicToMove]
            }
          })
        }))

        return newData
      })
    }
  }, [])

  // Helper: Recalculate topic numbers for a lesson based on LO assignment
  const recalculateLessonTopicNumbers = useCallback((lessons, lessonId) => {
    return lessons.map(lesson => {
      if (lesson.id !== lessonId) return lesson

      const primaryLOId = lesson.learningObjectives?.[0] || null
      const loOrder = getLOOrder(primaryLOId)

      // If no LO assigned, use "x.1", "x.2" sequential numbering (unallocated)
      if (!loOrder) {
        return {
          ...lesson,
          topics: (lesson.topics || []).map((t, idx) => ({
            ...t,
            number: `x.${idx + 1}`,  // Sequential x.1, x.2, x.3 etc
            loId: null,
            // Also update subtopics to use x.N.M numbering
            subtopics: (t.subtopics || []).map((s, subIdx) => ({
              ...s,
              number: `x.${idx + 1}.${subIdx + 1}`  // x.1.1, x.1.2 etc
            }))
          }))
        }
      }

      // Calculate sequential numbers based on LO and position
      // Find max topic number for this LO in earlier lessons (by day, startTime)
      let baseTopicNum = 0
      lessons.forEach(l => {
        if (l.id === lessonId) return // Skip current lesson
        const loPrimary = l.learningObjectives?.[0]
        if (loPrimary === primaryLOId) {
          // Check if this lesson comes before current lesson
          const isBefore = (l.day < lesson.day) ||
            (l.day === lesson.day && (l.startTime || '0000') < (lesson.startTime || '0000'))
          if (isBefore) {
            l.topics?.forEach(t => {
              const match = t.number?.match(/^\d+\.(\d+)$/)
              if (match) {
                baseTopicNum = Math.max(baseTopicNum, parseInt(match[1]))
              }
            })
          }
        }
      })

      // Renumber topics sequentially (and their subtopics)
      return {
        ...lesson,
        topics: (lesson.topics || []).map((t, idx) => {
          const topicNumber = `${loOrder}.${baseTopicNum + idx + 1}`
          return {
            ...t,
            number: topicNumber,
            loId: primaryLOId,
            // Update subtopics to use LO.Topic.Subtopic numbering
            subtopics: (t.subtopics || []).map((s, subIdx) => ({
              ...s,
              number: `${topicNumber}.${subIdx + 1}`  // e.g., 1.3.1, 1.3.2
            }))
          }
        })
      }
    })
  }, [getLOOrder])

  // Toggle LO assignment for a lesson (with topic renumbering)
  const toggleLessonLO = useCallback((lessonId, loId) => {
    setLessons(prev => {
      // First toggle the LO
      const updated = prev.map(lesson => {
        if (lesson.id !== lessonId) return lesson
        const currentLOs = lesson.learningObjectives || []
        const hasLO = currentLOs.includes(loId)
        return {
          ...lesson,
          learningObjectives: hasLO
            ? currentLOs.filter(id => id !== loId)
            : [...currentLOs, loId]
        }
      })

      // Then recalculate topic numbers for this lesson
      return recalculateLessonTopicNumbers(updated, lessonId)
    })
  }, [recalculateLessonTopicNumbers])

  // Add topic to a lesson (with LO-based numbering and Scalar auto-sync)
  const addTopicToLesson = useCallback((lessonId, topicTitle = 'New Topic') => {
    const timestamp = Date.now()
    const lessonTopicId = `topic-lesson-${timestamp}`
    const scalarTopicId = `topic-scalar-${timestamp}`

    // Read current lesson to get LO info (lessons state is stable for this read)
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) {
      debugLog('ADD_TOPIC_TO_LESSON_FAILED', { lessonId, reason: 'Lesson not found' })
      return
    }

    const primaryLOId = lesson.learningObjectives?.[0] || null
    const loOrder = getLOOrder(primaryLOId)

    debugLog('ADD_TOPIC_TO_LESSON_START', {
      lessonId,
      lessonTitle: lesson.title,
      primaryLOId,
      loOrder,
      allLessonLOs: lesson.learningObjectives,
      existingTopicCount: (lesson.topics || []).length
    })

    // Update lessons state
    setLessons(prev => {
      const currentLesson = prev.find(l => l.id === lessonId)
      if (!currentLesson) return prev

      // If no LO assigned, use sequential "x.N" numbering (no Scalar sync)
      if (!loOrder) {
        const existingTopicCount = (currentLesson.topics || []).length
        const newTopic = {
          id: lessonTopicId,
          title: topicTitle,
          number: `x.${existingTopicCount + 1}`,  // Sequential: x.1, x.2, x.3 etc
          loId: null,
          scalarTopicId: null,
          subtopics: []
        }
        debugLog('ADD_TOPIC_TO_LESSON_UNLINKED', {
          topicId: lessonTopicId,
          topicTitle,
          number: newTopic.number,
          reason: 'No LO assigned to lesson'
        })
        return prev.map(l =>
          l.id === lessonId
            ? { ...l, topics: [...(l.topics || []), newTopic] }
            : l
        )
      }

      // Calculate next topic number for this LO across all lessons
      let maxTopicNum = 0
      const scannedLessons = []
      prev.forEach(l => {
        const loPrimary = l.learningObjectives?.[0]
        if (loPrimary === primaryLOId) {
          const isSameOrBefore = (l.day < currentLesson.day) ||
            (l.day === currentLesson.day && (l.startTime || '0000') <= (currentLesson.startTime || '0000'))
          if (isSameOrBefore) {
            const topicsFound = []
            l.topics?.forEach(t => {
              const match = t.number?.match(/^\d+\.(\d+)$/)
              if (match) {
                const num = parseInt(match[1])
                maxTopicNum = Math.max(maxTopicNum, num)
                topicsFound.push({ number: t.number, parsed: num })
              }
            })
            scannedLessons.push({
              lessonId: l.id,
              lessonTitle: l.title,
              day: l.day,
              startTime: l.startTime,
              topicsFound
            })
          }
        }
      })

      const newTopic = {
        id: lessonTopicId,
        title: topicTitle,
        number: `${loOrder}.${maxTopicNum + 1}`,
        loId: primaryLOId,
        scalarTopicId: scalarTopicId
      }

      debugLog('ADD_TOPIC_TO_LESSON_LINKED', {
        topicId: lessonTopicId,
        scalarTopicId,
        topicTitle,
        number: newTopic.number,
        loOrder,
        maxTopicNumFound: maxTopicNum,
        scannedLessons,
        totalLessonsWithSameLO: scannedLessons.length
      })

      return prev.map(l =>
        l.id === lessonId
          ? { ...l, topics: [...(l.topics || []), newTopic] }
          : l
      )
    })

    // PHASE 1: Sync to canonical data store (ScalarDock reads from here)
    // Always add to canonical, whether LO is assigned or not
    setCanonicalData(prev => canonicalAddTopic(prev, {
      id: scalarTopicId,
      loId: primaryLOId, // null if no LO assigned - will show as orphan
      title: topicTitle
    }))

    // Legacy sync to Scalar (for backward compatibility)
    if (loOrder && primaryLOId) {
      setScalarData(prev => {
        const newData = { ...prev, modules: [...prev.modules] }

        for (let m = 0; m < newData.modules.length; m++) {
          const module = { ...newData.modules[m] }
          newData.modules[m] = module
          module.learningObjectives = [...module.learningObjectives]

          for (let l = 0; l < module.learningObjectives.length; l++) {
            const lo = { ...module.learningObjectives[l] }
            module.learningObjectives[l] = lo

            if (lo.id === primaryLOId) {
              lo.topics = [...lo.topics]
              const newScalarTopic = {
                id: scalarTopicId,
                title: topicTitle,
                order: lo.topics.length + 1,
                expanded: false,
                subtopics: []
              }
              lo.topics.push(newScalarTopic)
              return newData
            }
          }
        }
        return prev
      })
    }
  }, [lessons, getLOOrder])

  // Remove topic from a lesson (checks both id and scalarTopicId)
  const removeTopicFromLesson = useCallback((lessonId, topicId) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId
        ? { ...lesson, topics: (lesson.topics || []).filter(t => t.id !== topicId && t.scalarTopicId !== topicId) }
        : lesson
    ))
  }, [])

  // Update topic in a lesson (with Scalar auto-sync)
  const updateLessonTopic = useCallback((lessonId, topicId, updates) => {
    // First update the lesson topic
    setLessons(prev => {
      const lesson = prev.find(l => l.id === lessonId)
      if (!lesson) return prev

      const topic = (lesson.topics || []).find(t => t.id === topicId)
      const scalarTopicId = topic?.scalarTopicId

      // PHASE 1: Sync to canonical data store
      if (scalarTopicId && updates.title) {
        setCanonicalData(prevCanonical => canonicalUpdate(prevCanonical, 'topic', scalarTopicId, { title: updates.title }))
      }

      // Legacy: If there's a linked scalar topic and title is being updated, sync to scalar
      if (scalarTopicId && updates.title) {
        setScalarData(prevScalar => {
          const newData = { ...prevScalar, modules: [...prevScalar.modules] }

          for (let m = 0; m < newData.modules.length; m++) {
            const module = { ...newData.modules[m] }
            newData.modules[m] = module
            module.learningObjectives = [...module.learningObjectives]

            for (let l = 0; l < module.learningObjectives.length; l++) {
              const lo = { ...module.learningObjectives[l] }
              module.learningObjectives[l] = lo
              lo.topics = [...lo.topics]

              for (let t = 0; t < lo.topics.length; t++) {
                if (lo.topics[t].id === scalarTopicId) {
                  lo.topics[t] = { ...lo.topics[t], title: updates.title }
                  return newData
                }
              }
            }
          }
          return prevScalar
        })
      }

      return prev.map(lesson =>
        lesson.id === lessonId
          ? {
              ...lesson,
              topics: (lesson.topics || []).map(t =>
                t.id === topicId ? { ...t, ...updates } : t
              )
            }
          : lesson
      )
    })
  }, [])

  // Add subtopic to a lesson topic (with Scalar auto-sync)
  const addSubtopicToLessonTopic = useCallback((lessonId, topicId, subtopicTitle = 'New Subtopic') => {
    const timestamp = Date.now()
    const lessonSubtopicId = `subtopic-lesson-${timestamp}`
    const scalarSubtopicId = `subtopic-scalar-${timestamp}`

    setLessons(prev => {
      const lesson = prev.find(l => l.id === lessonId)
      if (!lesson) return prev

      const topic = (lesson.topics || []).find(t => t.id === topicId)
      if (!topic) return prev

      // Get the topic number prefix for subtopic numbering
      const topicNumber = topic.number || 'x.1'
      const isUnallocated = topicNumber.startsWith('x.')
      const scalarTopicId = topic.scalarTopicId

      // Calculate next subtopic number (sequential within this topic)
      const existingSubtopics = topic.subtopics || []
      const nextSubNum = existingSubtopics.length + 1

      const newSubtopic = {
        id: lessonSubtopicId,
        title: subtopicTitle,
        number: `${topicNumber}.${nextSubNum}`,  // e.g., "1.2.3" or "x.1.1"
        scalarSubtopicId: !isUnallocated && scalarTopicId ? scalarSubtopicId : null // Link to scalar only if allocated
      }

      // PHASE 1: Sync to canonical data store (ScalarDock reads from here)
      // Use scalarTopicId as the topicId in canonical store
      if (scalarTopicId) {
        setCanonicalData(prev => canonicalAddSubtopic(prev, {
          id: scalarSubtopicId,
          topicId: scalarTopicId,
          title: subtopicTitle
        }))
      }

      // Legacy sync: Add subtopic to scalar if parent topic has a scalar link
      if (scalarTopicId) {
        setScalarData(prevScalar => {
          const newData = { ...prevScalar, modules: [...prevScalar.modules] }

          for (let m = 0; m < newData.modules.length; m++) {
            const module = { ...newData.modules[m] }
            newData.modules[m] = module
            module.learningObjectives = [...module.learningObjectives]

            for (let l = 0; l < module.learningObjectives.length; l++) {
              const lo = { ...module.learningObjectives[l] }
              module.learningObjectives[l] = lo
              lo.topics = [...lo.topics]

              for (let t = 0; t < lo.topics.length; t++) {
                const scalarTopic = { ...lo.topics[t] }
                lo.topics[t] = scalarTopic

                if (scalarTopic.id === scalarTopicId) {
                  scalarTopic.subtopics = [...(scalarTopic.subtopics || [])]
                  const newScalarSubtopic = {
                    id: scalarSubtopicId,
                    title: subtopicTitle,
                    order: scalarTopic.subtopics.length + 1
                  }
                  scalarTopic.subtopics.push(newScalarSubtopic)
                  scalarTopic.expanded = true
                  return newData
                }
              }
            }
          }
          return prevScalar
        })
      }

      return prev.map(l =>
        l.id === lessonId
          ? {
              ...l,
              topics: (l.topics || []).map(t =>
                t.id === topicId
                  ? { ...t, subtopics: [...(t.subtopics || []), newSubtopic] }
                  : t
              )
            }
          : l
      )
    })
  }, [])

  // Remove subtopic from a lesson topic
  const removeSubtopicFromLessonTopic = useCallback((lessonId, topicId, subtopicId) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      return {
        ...lesson,
        topics: (lesson.topics || []).map(t =>
          t.id === topicId
            ? { ...t, subtopics: (t.subtopics || []).filter(s => s.id !== subtopicId) }
            : t
        )
      }
    }))
  }, [])

  // Update subtopic in a lesson topic (with Scalar auto-sync)
  const updateLessonSubtopic = useCallback((lessonId, topicId, subtopicId, updates) => {
    setLessons(prev => {
      const lesson = prev.find(l => l.id === lessonId)
      if (!lesson) return prev

      const topic = (lesson.topics || []).find(t => t.id === topicId)
      if (!topic) return prev

      const subtopic = (topic.subtopics || []).find(s => s.id === subtopicId)
      const scalarSubtopicId = subtopic?.scalarSubtopicId

      // PHASE 1: Sync to canonical data store
      if (scalarSubtopicId && updates.title) {
        setCanonicalData(prevCanonical => canonicalUpdate(prevCanonical, 'subtopic', scalarSubtopicId, { title: updates.title }))
      }

      // Legacy: If there's a linked scalar subtopic and title is being updated, sync to scalar
      if (scalarSubtopicId && updates.title) {
        setScalarData(prevScalar => {
          const newData = { ...prevScalar, modules: [...prevScalar.modules] }

          for (let m = 0; m < newData.modules.length; m++) {
            const module = { ...newData.modules[m] }
            newData.modules[m] = module
            module.learningObjectives = [...module.learningObjectives]

            for (let l = 0; l < module.learningObjectives.length; l++) {
              const lo = { ...module.learningObjectives[l] }
              module.learningObjectives[l] = lo
              lo.topics = [...lo.topics]

              for (let t = 0; t < lo.topics.length; t++) {
                const scalarTopic = { ...lo.topics[t] }
                lo.topics[t] = scalarTopic
                scalarTopic.subtopics = [...(scalarTopic.subtopics || [])]

                for (let s = 0; s < scalarTopic.subtopics.length; s++) {
                  if (scalarTopic.subtopics[s].id === scalarSubtopicId) {
                    scalarTopic.subtopics[s] = { ...scalarTopic.subtopics[s], title: updates.title }
                    return newData
                  }
                }
              }
            }
          }
          return prevScalar
        })
      }

      return prev.map(l => {
        if (l.id !== lessonId) return l
        return {
          ...l,
          topics: (l.topics || []).map(t =>
            t.id === topicId
              ? {
                  ...t,
                  subtopics: (t.subtopics || []).map(s =>
                    s.id === subtopicId ? { ...s, ...updates } : s
                  )
                }
              : t
          )
        }
      })
    })
  }, [])

  // --------------------------------------------
  // SHARED UPDATE HELPERS (Corrections #3, #4 - Single Source of Truth)
  // Both DESIGN and BUILD use these for edits
  // --------------------------------------------

  // Update lesson title (shared helper for both pages)
  const updateLessonTitle = useCallback((lessonId, title) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId ? { ...lesson, title } : lesson
    ))
  }, [])

  // Update topic title in lesson (with Scalar auto-sync)
  const updateTopicTitle = useCallback((topicId, title) => {
    // Update in lessons
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      topics: (lesson.topics || []).map(t =>
        t.id === topicId || t.scalarTopicId === topicId
          ? { ...t, title }
          : t
      )
    })))

    // Update in scalar data
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }
      for (let m = 0; m < newData.modules.length; m++) {
        const module = { ...newData.modules[m] }
        newData.modules[m] = module
        module.learningObjectives = [...module.learningObjectives]
        for (let l = 0; l < module.learningObjectives.length; l++) {
          const lo = { ...module.learningObjectives[l] }
          module.learningObjectives[l] = lo
          lo.topics = [...lo.topics]
          for (let t = 0; t < lo.topics.length; t++) {
            if (lo.topics[t].id === topicId) {
              lo.topics[t] = { ...lo.topics[t], title }
              return newData
            }
          }
        }
      }
      return prev
    })
  }, [])

  // Update subtopic title in lesson (with Scalar auto-sync)
  const updateSubtopicTitle = useCallback((subtopicId, title) => {
    // Update in lessons
    setLessons(prev => prev.map(lesson => ({
      ...lesson,
      topics: (lesson.topics || []).map(topic => ({
        ...topic,
        subtopics: (topic.subtopics || []).map(s =>
          s.id === subtopicId || s.scalarSubtopicId === subtopicId
            ? { ...s, title }
            : s
        )
      }))
    })))

    // Update in scalar data
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }
      for (let m = 0; m < newData.modules.length; m++) {
        const module = { ...newData.modules[m] }
        newData.modules[m] = module
        module.learningObjectives = [...module.learningObjectives]
        for (let l = 0; l < module.learningObjectives.length; l++) {
          const lo = { ...module.learningObjectives[l] }
          module.learningObjectives[l] = lo
          lo.topics = [...lo.topics]
          for (let t = 0; t < lo.topics.length; t++) {
            const topic = { ...lo.topics[t] }
            lo.topics[t] = topic
            topic.subtopics = [...(topic.subtopics || [])]
            for (let s = 0; s < topic.subtopics.length; s++) {
              if (topic.subtopics[s].id === subtopicId) {
                topic.subtopics[s] = { ...topic.subtopics[s], title }
                return newData
              }
            }
          }
        }
      }
      return prev
    })
  }, [])

  // Update learning objective (Correction #3: updates lesson.learningObjectives, NOT scalarData)
  const updateLearningObjectiveText = useCallback((lessonId, loIndex, text) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const newLOs = [...(lesson.learningObjectives || [])]
      if (loIndex >= 0 && loIndex < newLOs.length) {
        newLOs[loIndex] = text
      }
      return { ...lesson, learningObjectives: newLOs }
    }))
  }, [])

  // --------------------------------------------
  // SLIDE OPERATIONS (for BUILD page)
  // --------------------------------------------

  // Ensure lesson has at least one slide (Correction #1: 1 default slide per lesson on first entry)
  const ensureLessonHasDefaultSlide = useCallback((lessonId) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      if (lesson.slides && lesson.slides.length > 0) return lesson
      // Create default slide
      return { ...lesson, slides: [createDefaultSlide()] }
    }))
  }, [])

  // Add new slide to lesson (Correction #1: explicit creation only)
  const addSlideToLesson = useCallback((lessonId, slideType = 'lesson_title') => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      type: slideType,
      contentBlocks: [
        { subtopicId: null, text: '' },
        { subtopicId: null, text: '' },
        { subtopicId: null, text: '' },
        { subtopicId: null, text: '' },
        { subtopicId: null, text: '' }
      ],
      instructorNotes: ''
    }

    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      return { ...lesson, slides: [...(lesson.slides || []), newSlide] }
    }))

    return newSlide.id
  }, [])

  // Duplicate slide in lesson
  const duplicateSlide = useCallback((lessonId, slideIndex) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const slides = lesson.slides || []
      if (slideIndex < 0 || slideIndex >= slides.length) return lesson

      const sourceSlide = slides[slideIndex]
      const newSlide = {
        ...sourceSlide,
        id: `slide-${Date.now()}`,
        contentBlocks: sourceSlide.contentBlocks.map(block => ({ ...block }))
      }

      const newSlides = [...slides]
      newSlides.splice(slideIndex + 1, 0, newSlide)
      return { ...lesson, slides: newSlides }
    }))
  }, [])

  // Update slide type
  const updateSlideType = useCallback((lessonId, slideIndex, newType) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const slides = [...(lesson.slides || [])]
      if (slideIndex >= 0 && slideIndex < slides.length) {
        slides[slideIndex] = { ...slides[slideIndex], type: newType }
      }
      return { ...lesson, slides }
    }))
  }, [])

  // Update slide content block
  const updateSlideContentBlock = useCallback((lessonId, slideIndex, blockIndex, updates) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const slides = [...(lesson.slides || [])]
      if (slideIndex >= 0 && slideIndex < slides.length) {
        const slide = { ...slides[slideIndex] }
        const blocks = [...slide.contentBlocks]
        if (blockIndex >= 0 && blockIndex < blocks.length) {
          blocks[blockIndex] = { ...blocks[blockIndex], ...updates }
        }
        slide.contentBlocks = blocks
        slides[slideIndex] = slide
      }
      return { ...lesson, slides }
    }))
  }, [])

  // Update slide instructor notes (Correction #7: explicit field)
  const updateSlideInstructorNotes = useCallback((lessonId, slideIndex, notes) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const slides = [...(lesson.slides || [])]
      if (slideIndex >= 0 && slideIndex < slides.length) {
        slides[slideIndex] = { ...slides[slideIndex], instructorNotes: notes }
      }
      return { ...lesson, slides }
    }))
  }, [])

  // Delete slide from lesson
  const deleteSlide = useCallback((lessonId, slideIndex) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const slides = [...(lesson.slides || [])]
      if (slideIndex >= 0 && slideIndex < slides.length) {
        slides.splice(slideIndex, 1)
      }
      // Ensure at least one slide remains
      if (slides.length === 0) {
        slides.push(createDefaultSlide())
      }
      return { ...lesson, slides }
    }))
  }, [])

  // Erase content block text (Correction #5: UI action only, sets text = "")
  const eraseSlideContentBlock = useCallback((lessonId, slideIndex, blockIndex) => {
    updateSlideContentBlock(lessonId, slideIndex, blockIndex, { text: '' })
  }, [updateSlideContentBlock])

  // --------------------------------------------
  // PROGRESS CALCULATION (Correction #6 - 3 primary columns + instructorNotes only)
  // --------------------------------------------

  const calculateLessonProgress = useCallback((lesson) => {
    if (!lesson?.slides?.length) return 0

    let totalFields = 0
    let populatedFields = 0

    lesson.slides.forEach(slide => {
      // Count ONLY 3 primary content blocks (Correction #6)
      slide.contentBlocks.slice(0, 3).forEach(block => {
        totalFields++
        if (block.text?.trim()) populatedFields++
      })
      // Count instructor notes
      totalFields++
      if (slide.instructorNotes?.trim()) populatedFields++
    })

    return totalFields > 0 ? Math.round((populatedFields / totalFields) * 100) : 0
  }, [])

  // Get all subtopics for a lesson (for BUILD dropdown population)
  const getLessonSubtopics = useCallback((lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (!lesson) return []

    const subtopics = []
    ;(lesson.topics || []).forEach(topic => {
      ;(topic.subtopics || []).forEach(subtopic => {
        subtopics.push({
          id: subtopic.id || subtopic.scalarSubtopicId,
          title: subtopic.title,
          topicTitle: topic.title,
          number: subtopic.number
        })
      })
    })
    return subtopics
  }, [lessons])

  // --------------------------------------------
  // DRAG OPERATIONS (Phase 3)
  // --------------------------------------------

  // Move lesson to new day/time
  const moveLesson = useCallback((lessonId, newDay, newStartTime) => {
    updateLesson(lessonId, {
      day: newDay,
      startTime: newStartTime,
      scheduled: true
    })
  }, [updateLesson])

  // Resize lesson duration (snaps to 5-min increments)
  const resizeLesson = useCallback((lessonId, newDuration) => {
    // Snap to 5-minute increments
    const snappedDuration = Math.round(newDuration / 5) * 5
    // Minimum 5 minutes, maximum 480 minutes (8 hours)
    const clampedDuration = Math.max(5, Math.min(480, snappedDuration))
    updateLesson(lessonId, { duration: clampedDuration })
  }, [updateLesson])

  // Check for collision with other lessons
  const checkCollision = useCallback((lessonId, day, startTime, duration) => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + duration

    return lessons.some(lesson => {
      if (lesson.id === lessonId || lesson.day !== day || !lesson.scheduled) return false
      const lessonStart = timeToMinutes(lesson.startTime)
      const lessonEnd = lessonStart + lesson.duration
      return startMinutes < lessonEnd && endMinutes > lessonStart
    })
  }, [lessons])

  // Find next available slot on a day
  const findAvailableSlot = useCallback((day, preferredStartTime, duration) => {
    const dayLessons = lessons
      .filter(l => l.day === day && l.scheduled)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

    let startMinutes = timeToMinutes(preferredStartTime)

    for (const lesson of dayLessons) {
      const lessonStart = timeToMinutes(lesson.startTime)
      const lessonEnd = lessonStart + lesson.duration

      if (startMinutes + duration <= lessonStart) {
        // Fits before this lesson
        return minutesToTime(startMinutes)
      }

      if (startMinutes < lessonEnd) {
        // Overlaps, move after this lesson
        startMinutes = lessonEnd
      }
    }

    return minutesToTime(startMinutes)
  }, [lessons])

  // --------------------------------------------
  // SCALAR OPERATIONS
  // --------------------------------------------

  // Toggle expand/collapse for any scalar node
  const toggleScalarExpand = useCallback((nodeType, nodeId) => {
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

      for (let m = 0; m < newData.modules.length; m++) {
        const module = { ...newData.modules[m] }
        newData.modules[m] = module

        if (nodeType === 'module' && module.id === nodeId) {
          module.expanded = !module.expanded
          return newData
        }

        module.learningObjectives = [...module.learningObjectives]
        for (let l = 0; l < module.learningObjectives.length; l++) {
          const lo = { ...module.learningObjectives[l] }
          module.learningObjectives[l] = lo

          if (nodeType === 'lo' && lo.id === nodeId) {
            lo.expanded = !lo.expanded
            return newData
          }

          lo.topics = [...lo.topics]
          for (let t = 0; t < lo.topics.length; t++) {
            const topic = { ...lo.topics[t] }
            lo.topics[t] = topic

            if (nodeType === 'topic' && topic.id === nodeId) {
              topic.expanded = !topic.expanded
              return newData
            }
          }
        }
      }
      return newData
    })
  }, [])

  // Add new LO to a module
  const addLearningObjective = useCallback((moduleId) => {
    const loId = `lo-${Date.now()}`

    // PHASE 1: Write to canonical store FIRST (source of truth)
    setCanonicalData(prev => canonicalAddLO(prev, {
      id: loId,
      moduleId: moduleId,
      verb: 'IDENTIFY',
      description: 'new learning objective'
    }))

    // Legacy write - kept for backward compatibility during transition
    // Will be removed when CANONICAL_FLAGS.LEGACY_STORE_REMOVED = true
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev, modules: [...prev.modules] }
        const moduleIndex = newData.modules.findIndex(m => m.id === moduleId)
        if (moduleIndex === -1) return prev

        const module = { ...newData.modules[moduleIndex] }
        newData.modules[moduleIndex] = module
        module.learningObjectives = [...module.learningObjectives]

        const newLO = {
          id: loId,
          verb: 'IDENTIFY',
          description: 'new learning objective',
          order: module.learningObjectives.length + 1,
          expanded: true,
          topics: []
        }
        module.learningObjectives.push(newLO)
        return newData
      })
    }

    // Return the new LO ID for auto-selection
    return loId
  }, [])

  // Add new Topic to an LO (or unlinked if loId is null)
  const addTopic = useCallback((loId) => {
    const topicId = `topic-${Date.now()}`
    debugLog('ADD_TOPIC_START', { loId, topicId, action: 'Creating new topic' })

    // PHASE 1: Write to canonical store FIRST (source of truth)
    setCanonicalData(prev => canonicalAddTopic(prev, {
      id: topicId,
      loId: loId,
      title: 'New Topic'
    }))

    // Legacy write - kept for backward compatibility during transition
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev, modules: [...prev.modules] }

        // If no loId provided, add to unlinkedTopics
        if (!loId) {
          const newTopic = {
            id: topicId,
            title: 'New Topic',
            order: (prev.unlinkedTopics || []).length + 1,
            loId: null,
            expanded: false,
            subtopics: []
          }
          return {
            ...newData,
            unlinkedTopics: [...(prev.unlinkedTopics || []), newTopic]
          }
        }

        // Otherwise add to the specified LO
        for (let m = 0; m < newData.modules.length; m++) {
          const module = { ...newData.modules[m] }
          newData.modules[m] = module
          module.learningObjectives = [...module.learningObjectives]

          for (let l = 0; l < module.learningObjectives.length; l++) {
            const lo = { ...module.learningObjectives[l] }
            module.learningObjectives[l] = lo

            if (lo.id === loId) {
              lo.topics = [...lo.topics]
              const newTopic = {
                id: topicId,
                title: 'New Topic',
                order: lo.topics.length + 1,
                loId: lo.id,
                expanded: false,
                subtopics: []
              }
              lo.topics.push(newTopic)
              return newData
            }
          }
        }
        return prev
      })
    }

    // Return the new topic ID for auto-selection/expansion
    return topicId
  }, [])

  // Add new Subtopic to a Topic
  const addSubtopic = useCallback((topicId) => {
    const subtopicId = `subtopic-${Date.now()}`

    // PHASE 1: Write to canonical store FIRST (source of truth)
    setCanonicalData(prev => canonicalAddSubtopic(prev, {
      id: subtopicId,
      topicId: topicId,
      title: 'New Subtopic'
    }))

    // Legacy write - kept for backward compatibility during transition
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

      // Check unlinked topics first
      const unlinkedIdx = (prev.unlinkedTopics || []).findIndex(t => t.id === topicId)
      if (unlinkedIdx !== -1) {
        newData.unlinkedTopics = [...(prev.unlinkedTopics || [])]
        const topic = { ...newData.unlinkedTopics[unlinkedIdx] }
        topic.subtopics = [...(topic.subtopics || [])]
        topic.subtopics.push({
          id: subtopicId,
          title: 'New Subtopic',
          order: topic.subtopics.length + 1
        })
        topic.expanded = true
        newData.unlinkedTopics[unlinkedIdx] = topic
        return newData
      }

      for (let m = 0; m < newData.modules.length; m++) {
        const module = { ...newData.modules[m] }
        newData.modules[m] = module
        module.learningObjectives = [...module.learningObjectives]

        for (let l = 0; l < module.learningObjectives.length; l++) {
          const lo = { ...module.learningObjectives[l] }
          module.learningObjectives[l] = lo
          lo.topics = [...lo.topics]

          for (let t = 0; t < lo.topics.length; t++) {
            const topic = { ...lo.topics[t] }
            lo.topics[t] = topic

            if (topic.id === topicId) {
              topic.subtopics = [...(topic.subtopics || [])]
              const newSubtopic = {
                id: subtopicId,
                title: 'New Subtopic',
                order: topic.subtopics.length + 1
              }
              topic.subtopics.push(newSubtopic)
              topic.expanded = true
              return newData
            }
          }
        }
      }
      return prev
      })
    }

    // Return the new subtopic ID for auto-selection/expansion
    return subtopicId
  }, [])

  // Update scalar node (LO, Topic, or Subtopic) with cross-app syncing
  const updateScalarNode = useCallback((nodeType, nodeId, updates) => {
    // PHASE 1: Write to canonical store FIRST (source of truth)
    setCanonicalData(prev => canonicalUpdate(prev, nodeType, nodeId, updates))

    // BIDIRECTIONAL SYNC: Update lessons that have linked topics/subtopics
    if (nodeType === 'topic' && updates.title) {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).map(t =>
          t.scalarTopicId === nodeId ? { ...t, title: updates.title } : t
        )
      })))
    }
    if (nodeType === 'subtopic' && updates.title) {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).map(topic => ({
          ...topic,
          subtopics: (topic.subtopics || []).map(s =>
            s.scalarSubtopicId === nodeId ? { ...s, title: updates.title } : s
          )
        }))
      })))
    }

    // Legacy write - kept for backward compatibility during transition
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

      // Also check unlinked topics
      if (nodeType === 'topic') {
        const unlinkedIdx = (prev.unlinkedTopics || []).findIndex(t => t.id === nodeId)
        if (unlinkedIdx !== -1) {
          newData.unlinkedTopics = [...(prev.unlinkedTopics || [])]
          newData.unlinkedTopics[unlinkedIdx] = { ...newData.unlinkedTopics[unlinkedIdx], ...updates }
          return newData
        }
      }

      for (let m = 0; m < newData.modules.length; m++) {
        const module = { ...newData.modules[m] }
        newData.modules[m] = module
        module.learningObjectives = [...module.learningObjectives]

        for (let l = 0; l < module.learningObjectives.length; l++) {
          const lo = { ...module.learningObjectives[l] }
          module.learningObjectives[l] = lo

          if (nodeType === 'lo' && lo.id === nodeId) {
            Object.assign(lo, updates)
            return newData
          }

          lo.topics = [...lo.topics]
          for (let t = 0; t < lo.topics.length; t++) {
            const topic = { ...lo.topics[t] }
            lo.topics[t] = topic

            if (nodeType === 'topic' && topic.id === nodeId) {
              Object.assign(topic, updates)
              return newData
            }

            topic.subtopics = [...(topic.subtopics || [])]
            for (let s = 0; s < topic.subtopics.length; s++) {
              const subtopic = { ...topic.subtopics[s] }
              topic.subtopics[s] = subtopic

              if (nodeType === 'subtopic' && subtopic.id === nodeId) {
                Object.assign(subtopic, updates)
                return newData
              }
            }
          }
        }
      }
        return prev
      })
    }

    // CROSS-APP SYNC: Sync LO updates to courseData.learningObjectives
    if (nodeType === 'lo' && (updates.verb || updates.description)) {
      // Find the LO in scalarData to get its current data
      let targetLO = null
      for (const module of effectiveScalarData.modules) {
        const found = module.learningObjectives.find(lo => lo.id === nodeId)
        if (found) {
          targetLO = found
          break
        }
      }

      if (targetLO && setCourseData) {
        const newVerb = updates.verb || targetLO.verb
        const newDesc = updates.description || targetLO.description
        const newLoText = `${newVerb} ${newDesc}`.trim()
        const oldLoText = `${targetLO.verb} ${targetLO.description}`.trim()

        setCourseData(prev => {
          if (!prev.learningObjectives) return prev
          const newLOs = prev.learningObjectives.map(loText => {
            // Match by exact text or by position (order)
            if (loText === oldLoText) {
              return newLoText
            }
            return loText
          })
          return { ...prev, learningObjectives: newLOs }
        })
      }
    }

    // CROSS-APP SYNC: Sync Topic title updates to lessons
    if (nodeType === 'topic' && updates.title) {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).map(t => {
          // Match by scalarTopicId or by id
          if (t.scalarTopicId === nodeId || t.id === nodeId) {
            return { ...t, title: updates.title }
          }
          return t
        })
      })))
    }

    // CROSS-APP SYNC: Sync Subtopic title updates to lessons
    if (nodeType === 'subtopic' && updates.title) {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).map(topic => ({
          ...topic,
          subtopics: (topic.subtopics || []).map(s => {
            if (s.scalarSubtopicId === nodeId || s.id === nodeId) {
              return { ...s, title: updates.title }
            }
            return s
          })
        }))
      })))
    }
  }, [scalarData.modules, setCourseData, setLessons])

  // Delete scalar node
  const deleteScalarNode = useCallback((nodeType, nodeId) => {
    // PHASE 1: Write to canonical store FIRST (source of truth)
    setCanonicalData(prev => canonicalDelete(prev, nodeType, nodeId))

    // BIDIRECTIONAL SYNC: Remove from lessons that have linked topics/subtopics
    if (nodeType === 'topic') {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).filter(t => t.scalarTopicId !== nodeId && t.id !== nodeId)
      })))
    }
    if (nodeType === 'subtopic') {
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        topics: (lesson.topics || []).map(topic => ({
          ...topic,
          subtopics: (topic.subtopics || []).filter(s => s.scalarSubtopicId !== nodeId && s.id !== nodeId)
        }))
      })))
    }

    // Legacy write - kept for backward compatibility during transition
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev, modules: [...prev.modules] }

        // Check for unlinked topic first
        if (nodeType === 'topic') {
          const unlinkedIdx = (prev.unlinkedTopics || []).findIndex(t => t.id === nodeId)
          if (unlinkedIdx !== -1) {
            newData.unlinkedTopics = (prev.unlinkedTopics || [])
              .filter(t => t.id !== nodeId)
              .map((t, idx) => ({ ...t, order: idx + 1 }))
            return newData
          }
        }

        for (let m = 0; m < newData.modules.length; m++) {
          const module = { ...newData.modules[m] }
          newData.modules[m] = module
          module.learningObjectives = [...module.learningObjectives]

          if (nodeType === 'lo') {
            const loIndex = module.learningObjectives.findIndex(lo => lo.id === nodeId)
            if (loIndex !== -1) {
              module.learningObjectives.splice(loIndex, 1)
              // Renumber
              module.learningObjectives.forEach((lo, idx) => lo.order = idx + 1)
              return newData
            }
          }

          for (let l = 0; l < module.learningObjectives.length; l++) {
            const lo = { ...module.learningObjectives[l] }
            module.learningObjectives[l] = lo
            lo.topics = [...lo.topics]

            if (nodeType === 'topic') {
              const topicIndex = lo.topics.findIndex(t => t.id === nodeId)
              if (topicIndex !== -1) {
                lo.topics.splice(topicIndex, 1)
                lo.topics.forEach((t, idx) => t.order = idx + 1)
                return newData
              }
            }

            for (let t = 0; t < lo.topics.length; t++) {
              const topic = { ...lo.topics[t] }
              lo.topics[t] = topic
              topic.subtopics = [...(topic.subtopics || [])]

              if (nodeType === 'subtopic') {
                const subIndex = topic.subtopics.findIndex(s => s.id === nodeId)
                if (subIndex !== -1) {
                  topic.subtopics.splice(subIndex, 1)
                  topic.subtopics.forEach((s, idx) => s.order = idx + 1)
                  return newData
                }
              }
            }
          }
        }
        return prev
      })
    }
  }, [])

  // Reorder topic within its parent LO or move to a different LO
  const reorderTopic = useCallback((topicId, targetLoId, newOrder) => {
    setCanonicalData(prev => {
      const topic = prev.topics[topicId]
      if (!topic) return prev

      const newTopics = { ...prev.topics }

      // If moving to a different LO
      if (topic.loId !== targetLoId) {
        // Update topic's loId
        newTopics[topicId] = { ...topic, loId: targetLoId, order: newOrder }
      } else {
        // Reorder within same LO
        const siblingTopics = Object.values(prev.topics)
          .filter(t => t.loId === topic.loId && t.id !== topicId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))

        // Insert at new position and renumber
        siblingTopics.splice(newOrder - 1, 0, { ...topic })
        siblingTopics.forEach((t, idx) => {
          newTopics[t.id] = { ...newTopics[t.id], order: idx + 1 }
        })
      }

      return { ...prev, topics: newTopics }
    })

    // Legacy update for backward compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        // Simplified - just trigger a re-render
        return { ...prev }
      })
    }
  }, [])

  // Reorder subtopic within its parent topic or move to a different topic
  const reorderSubtopic = useCallback((subtopicId, targetTopicId, newOrder) => {
    setCanonicalData(prev => {
      const subtopic = prev.subtopics[subtopicId]
      if (!subtopic) return prev

      const newSubtopics = { ...prev.subtopics }

      // If moving to a different topic
      if (subtopic.topicId !== targetTopicId) {
        newSubtopics[subtopicId] = { ...subtopic, topicId: targetTopicId, order: newOrder }
      } else {
        // Reorder within same topic
        const siblingSubtopics = Object.values(prev.subtopics)
          .filter(s => s.topicId === subtopic.topicId && s.id !== subtopicId)
          .sort((a, b) => (a.order || 0) - (b.order || 0))

        siblingSubtopics.splice(newOrder - 1, 0, { ...subtopic })
        siblingSubtopics.forEach((s, idx) => {
          newSubtopics[s.id] = { ...newSubtopics[s.id], order: idx + 1 }
        })
      }

      return { ...prev, subtopics: newSubtopics }
    })

    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => ({ ...prev }))
    }
  }, [])

  // Reorder LO within module
  const reorderLO = useCallback((loId, newOrder) => {
    setCanonicalData(prev => {
      const lo = prev.los[loId]
      if (!lo) return prev

      const newLOs = { ...prev.los }
      const siblingLOs = Object.values(prev.los)
        .filter(l => l.moduleId === lo.moduleId && l.id !== loId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      siblingLOs.splice(newOrder - 1, 0, { ...lo })
      siblingLOs.forEach((l, idx) => {
        newLOs[l.id] = { ...newLOs[l.id], order: idx + 1 }
      })

      return { ...prev, los: newLOs }
    })

    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const newData = { ...prev, modules: [...prev.modules] }
        for (let m = 0; m < newData.modules.length; m++) {
          const module = { ...newData.modules[m] }
          newData.modules[m] = module
          module.learningObjectives = [...module.learningObjectives]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        }
        return newData
      })
    }
  }, [])

  // --------------------------------------------
  // PERFORMANCE CRITERIA OPERATIONS
  // --------------------------------------------

  // Add new Performance Criteria (with color assignment)
  // Phase 3: Canonical-first write
  const addPerformanceCriteria = useCallback((name) => {
    const pcId = `pc-${Date.now()}`

    // Write to canonical FIRST
    setCanonicalData(prev => {
      const pcCount = Object.keys(prev.performanceCriteria || {}).length
      const colorIndex = pcCount % PC_COLORS.length
      const newPC = {
        id: pcId,
        name: name || `PC${pcCount + 1}`,
        order: pcCount + 1,
        color: PC_COLORS[colorIndex],
        linkedItems: { los: [], topics: [], subtopics: [], lessons: [] }
      }
      console.log('[CANONICAL] ADD_PC', { pcId, name: newPC.name })
      return {
        ...prev,
        performanceCriteria: { ...prev.performanceCriteria, [pcId]: newPC }
      }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => {
        const colorIndex = (prev.performanceCriteria?.length || 0) % PC_COLORS.length
        const newPC = {
          id: pcId,
          name: name || `PC${(prev.performanceCriteria?.length || 0) + 1}`,
          order: (prev.performanceCriteria?.length || 0) + 1,
          color: PC_COLORS[colorIndex],
          linkedItems: { los: [], topics: [], subtopics: [], lessons: [] }
        }
        return {
          ...prev,
          performanceCriteria: [...(prev.performanceCriteria || []), newPC]
        }
      })
    }
  }, [])

  // Update Performance Criteria
  // Phase 3: Canonical-first write
  const updatePerformanceCriteria = useCallback((pcId, updates) => {
    // Write to canonical FIRST
    setCanonicalData(prev => {
      if (!prev.performanceCriteria[pcId]) return prev
      console.log('[CANONICAL] UPDATE_PC', { pcId, updates })
      return {
        ...prev,
        performanceCriteria: {
          ...prev.performanceCriteria,
          [pcId]: { ...prev.performanceCriteria[pcId], ...updates }
        }
      }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => ({
        ...prev,
        performanceCriteria: (prev.performanceCriteria || []).map(pc =>
          pc.id === pcId ? { ...pc, ...updates } : pc
        )
      }))
    }
  }, [])

  // Delete Performance Criteria
  // Phase 3: Canonical-first write
  const deletePerformanceCriteria = useCallback((pcId) => {
    // Write to canonical FIRST
    setCanonicalData(prev => {
      if (!prev.performanceCriteria[pcId]) return prev
      console.log('[CANONICAL] DELETE_PC', { pcId })
      const { [pcId]: deleted, ...remaining } = prev.performanceCriteria
      // Renumber remaining PCs
      const renumbered = {}
      Object.values(remaining)
        .sort((a, b) => a.order - b.order)
        .forEach((pc, idx) => {
          renumbered[pc.id] = { ...pc, order: idx + 1 }
        })
      return { ...prev, performanceCriteria: renumbered }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => ({
        ...prev,
        performanceCriteria: (prev.performanceCriteria || [])
          .filter(pc => pc.id !== pcId)
          .map((pc, idx) => ({ ...pc, order: idx + 1 }))
      }))
    }
  }, [])

  // Link an item to a Performance Criteria
  // Phase 3: Canonical-first write
  const linkItemToPC = useCallback((pcId, itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`

    // Write to canonical FIRST
    setCanonicalData(prev => {
      const pc = prev.performanceCriteria[pcId]
      if (!pc) return prev
      if (pc.linkedItems[typeKey]?.includes(itemId)) return prev // Already linked
      console.log('[CANONICAL] LINK_TO_PC', { pcId, itemType, itemId })
      return {
        ...prev,
        performanceCriteria: {
          ...prev.performanceCriteria,
          [pcId]: {
            ...pc,
            linkedItems: {
              ...pc.linkedItems,
              [typeKey]: [...(pc.linkedItems[typeKey] || []), itemId]
            }
          }
        }
      }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => ({
        ...prev,
        performanceCriteria: (prev.performanceCriteria || []).map(pc => {
          if (pc.id !== pcId) return pc
          if (pc.linkedItems[typeKey]?.includes(itemId)) return pc
          return {
            ...pc,
            linkedItems: {
              ...pc.linkedItems,
              [typeKey]: [...(pc.linkedItems[typeKey] || []), itemId]
            }
          }
        })
      }))
    }
  }, [])

  // Unlink an item from a Performance Criteria
  // Phase 3: Canonical-first write
  const unlinkItemFromPC = useCallback((pcId, itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`

    // Write to canonical FIRST
    setCanonicalData(prev => {
      const pc = prev.performanceCriteria[pcId]
      if (!pc) return prev
      console.log('[CANONICAL] UNLINK_FROM_PC', { pcId, itemType, itemId })
      return {
        ...prev,
        performanceCriteria: {
          ...prev.performanceCriteria,
          [pcId]: {
            ...pc,
            linkedItems: {
              ...pc.linkedItems,
              [typeKey]: (pc.linkedItems[typeKey] || []).filter(id => id !== itemId)
            }
          }
        }
      }
    })

    // Legacy write for M3 compatibility
    if (!CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
      setScalarData(prev => ({
        ...prev,
        performanceCriteria: (prev.performanceCriteria || []).map(pc => {
          if (pc.id !== pcId) return pc
          return {
            ...pc,
            linkedItems: {
              ...pc.linkedItems,
              [typeKey]: (pc.linkedItems[typeKey] || []).filter(id => id !== itemId)
            }
          }
        })
      }))
    }
  }, [])

  // Get linked PCs for an item (returns array of PC names for badge display)
  // Phase 3: Read from canonical
  const getLinkedPCs = useCallback((itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
    return Object.values(canonicalData.performanceCriteria || {})
      .filter(pc => pc.linkedItems[typeKey]?.includes(itemId))
      .map(pc => pc.name)
  }, [canonicalData.performanceCriteria])

  // Get linked PCs with full info (including color)
  // Phase 3: Read from canonical
  const getLinkedPCsWithColor = useCallback((itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
    return Object.values(canonicalData.performanceCriteria || {})
      .filter(pc => pc.linkedItems[typeKey]?.includes(itemId))
      .map(pc => ({ name: pc.name, color: pc.color || '#00FF00', id: pc.id }))
  }, [canonicalData.performanceCriteria])

  // --------------------------------------------
  // BULK OPERATIONS (for multi-selection)
  // --------------------------------------------

  // Bulk link all selected items to a PC
  const bulkLinkToPC = useCallback((pcId) => {
    multiSelection.items.forEach(({ type, id }) => {
      linkItemToPC(pcId, type, id)
    })
  }, [multiSelection.items, linkItemToPC])

  // Bulk unlink all selected items from a PC
  const bulkUnlinkFromPC = useCallback((pcId) => {
    multiSelection.items.forEach(({ type, id }) => {
      unlinkItemFromPC(pcId, type, id)
    })
  }, [multiSelection.items, unlinkItemFromPC])

  // Bulk delete all selected items
  const bulkDelete = useCallback(() => {
    multiSelection.items.forEach(({ type, id }) => {
      if (type === 'lesson') {
        deleteLesson(id)
      } else {
        deleteScalarNode(type, id)
      }
    })
    clearMultiSelection()
  }, [multiSelection.items, deleteLesson, deleteScalarNode, clearMultiSelection])

  // --------------------------------------------
  // UNIVERSAL ELEMENT LINKING
  // --------------------------------------------

  // Link two elements together based on their types
  // Returns true if link was created, false if not possible
  const linkElements = useCallback((source, target) => {
    if (!source || !target) return false

    const { type: srcType, id: srcId } = source
    const { type: tgtType, id: tgtId } = target

    // Same type - can't link to itself
    if (srcType === tgtType && srcId === tgtId) return false

    // Helper to get lesson by id
    const getLesson = (id) => lessons.find(l => l.id === id)

    // LO ↔ Lesson linking
    if ((srcType === 'lo' && tgtType === 'lesson') || (srcType === 'lesson' && tgtType === 'lo')) {
      const lessonId = srcType === 'lesson' ? srcId : tgtId
      const loId = srcType === 'lo' ? srcId : tgtId
      toggleLessonLO(lessonId, loId)
      return true
    }

    // Topic ↔ Lesson linking (add topic to lesson's topics array)
    if ((srcType === 'topic' && tgtType === 'lesson') || (srcType === 'lesson' && tgtType === 'topic')) {
      const lessonId = srcType === 'lesson' ? srcId : tgtId
      const topicId = srcType === 'topic' ? srcId : tgtId

      // Find the topic in scalar data to get its title
      let topicTitle = 'Topic'
      for (const module of scalarData.modules) {
        for (const lo of module.learningObjectives) {
          const topic = lo.topics?.find(t => t.id === topicId)
          if (topic) {
            topicTitle = topic.title
            break
          }
        }
      }

      // Check if topic is already linked to this lesson
      const lesson = getLesson(lessonId)
      const alreadyLinked = lesson?.topics?.some(t => t.scalarTopicId === topicId || t.id === topicId)

      if (alreadyLinked) {
        // Unlink - remove the topic from lesson
        removeTopicFromLesson(lessonId, topicId)
      } else {
        // Link - add topic reference to lesson
        setLessons(prev => prev.map(l => {
          if (l.id !== lessonId) return l
          const newTopicRef = {
            id: `topic-ref-${Date.now()}`,
            scalarTopicId: topicId,
            title: topicTitle,
            number: 'x.1', // Will be recalculated
            subtopics: []
          }
          return { ...l, topics: [...(l.topics || []), newTopicRef] }
        }))
      }
      return true
    }

    // Subtopic ↔ Lesson linking
    if ((srcType === 'subtopic' && tgtType === 'lesson') || (srcType === 'lesson' && tgtType === 'subtopic')) {
      // For subtopics, we would need to add the parent topic first
      // This is a more complex operation - for now, provide feedback
      console.log('Subtopic-Lesson linking: Add the parent topic first')
      return false
    }

    // PC ↔ any element linking (existing functionality)
    if (srcType === 'pc' || tgtType === 'pc') {
      const pcId = srcType === 'pc' ? srcId : tgtId
      const otherType = srcType === 'pc' ? tgtType : srcType
      const otherId = srcType === 'pc' ? tgtId : srcId

      // Check if already linked (Phase 3: read from canonical)
      const linkedPCs = getLinkedPCs(otherType, otherId)
      const pc = canonicalData.performanceCriteria?.[pcId]
      const isLinked = pc && linkedPCs.includes(pc.name)

      if (isLinked) {
        unlinkItemFromPC(pcId, otherType, otherId)
      } else {
        linkItemToPC(pcId, otherType, otherId)
      }
      return true
    }

    // Topic ↔ LO linking (move/assign topic to LO)
    if ((srcType === 'topic' && tgtType === 'lo') || (srcType === 'lo' && tgtType === 'topic')) {
      // This would involve moving a topic from one LO to another
      // Complex operation that requires more context
      console.log('Topic-LO reassignment not yet implemented')
      return false
    }

    return false
  }, [lessons, scalarData.modules, canonicalData.performanceCriteria, toggleLessonLO,
      removeTopicFromLesson, getLinkedPCs, linkItemToPC, unlinkItemFromPC, setLessons])

  // Handle SHIFT+click for universal linking - sets source
  const handleShiftClickLink = useCallback((type, id, name) => {
    // SHIFT+click always sets/changes the source
    setLinkingSource({ type, id, name: name || `${type} ${id}` })
    setSessionLinkedElements([]) // Clear previous session's linked elements
    return { action: 'source_set', source: { type, id } }
  }, [])

  // Link target element to current source (called on regular click in linking mode)
  const linkToSource = useCallback((type, id, name) => {
    if (!linkingSource) return { action: 'no_source' }

    // Don't link to self
    if (linkingSource.type === type && linkingSource.id === id) {
      return { action: 'self_click' }
    }

    const target = { type, id, name: name || `${type} ${id}` }
    const success = linkElements(linkingSource, target)

    if (success) {
      // Add to session linked elements for green highlighting
      setSessionLinkedElements(prev => {
        // Avoid duplicates
        if (prev.some(el => el.type === type && el.id === id)) {
          return prev
        }
        return [...prev, target]
      })
    }

    // Keep linking mode active - don't clear source
    return { action: success ? 'linked' : 'failed', source: linkingSource, target }
  }, [linkingSource, linkElements])

  // --------------------------------------------
  // CROSS-COLUMN HIGHLIGHTING
  // --------------------------------------------

  // Set highlighted items based on clicked item
  // NOTE: The clicked item itself is NOT added to highlights (it gets ORANGE via isSelected)
  // Only related items are highlighted (GREEN)
  const updateHighlightedItems = useCallback((itemType, itemId) => {
    const newHighlights = {
      los: new Set(),
      topics: new Set(),
      subtopics: new Set(),
      lessons: new Set()
    }

    // Helper to find relationships in scalar data
    const findRelationships = () => {
      for (const module of scalarData.modules) {
        for (const lo of module.learningObjectives) {
          if (itemType === 'lo' && lo.id === itemId) {
            // Clicked LO → highlight all its Topics, Subtopics, and linked Lessons (NOT the LO itself)
            lo.topics?.forEach(topic => {
              newHighlights.topics.add(topic.id)
              topic.subtopics?.forEach(sub => newHighlights.subtopics.add(sub.id))
            })
            // Find lessons that have this LO
            lessons.forEach(lesson => {
              if (lesson.learningObjectives?.includes(lo.id)) {
                newHighlights.lessons.add(lesson.id)
              }
            })
            return
          }

          for (const topic of lo.topics || []) {
            if (itemType === 'topic' && topic.id === itemId) {
              // Clicked Topic → highlight parent LO, all Subtopics, and linked Lessons (NOT the topic itself)
              newHighlights.los.add(lo.id)
              topic.subtopics?.forEach(sub => newHighlights.subtopics.add(sub.id))
              // Find lessons that have this topic
              lessons.forEach(lesson => {
                if (lesson.topics?.some(t => t.scalarTopicId === topic.id || t.id === topic.id)) {
                  newHighlights.lessons.add(lesson.id)
                }
              })
              return
            }

            for (const subtopic of topic.subtopics || []) {
              if (itemType === 'subtopic' && subtopic.id === itemId) {
                // Clicked Subtopic → highlight parent Topic, grandparent LO, and linked Lessons (NOT the subtopic itself)
                newHighlights.los.add(lo.id)
                newHighlights.topics.add(topic.id)
                // Find lessons that have this subtopic
                lessons.forEach(lesson => {
                  lesson.topics?.forEach(t => {
                    if (t.subtopics?.some(s => s.scalarSubtopicId === subtopic.id || s.id === subtopic.id)) {
                      newHighlights.lessons.add(lesson.id)
                    }
                  })
                })
                return
              }
            }
          }
        }
      }
    }

    // Handle lesson click
    if (itemType === 'lesson') {
      const lesson = lessons.find(l => l.id === itemId)
      if (lesson) {
        // Don't add the lesson itself to highlights (it gets ORANGE via isSelected)
        // Highlight all LOs assigned to this lesson
        lesson.learningObjectives?.forEach(loId => newHighlights.los.add(loId))
        // Highlight all topics and subtopics
        lesson.topics?.forEach(topic => {
          if (topic.scalarTopicId) newHighlights.topics.add(topic.scalarTopicId)
          if (topic.id) newHighlights.topics.add(topic.id)
          topic.subtopics?.forEach(sub => {
            if (sub.scalarSubtopicId) newHighlights.subtopics.add(sub.scalarSubtopicId)
            if (sub.id) newHighlights.subtopics.add(sub.id)
          })
        })
      }
    } else {
      findRelationships()
    }

    setHighlightedItems(newHighlights)
  }, [scalarData.modules, lessons])

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    setHighlightedItems({
      los: new Set(),
      topics: new Set(),
      subtopics: new Set(),
      lessons: new Set()
    })
  }, [])

  // Check if an item is highlighted
  const isItemHighlighted = useCallback((itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
    return highlightedItems[typeKey]?.has(itemId) || false
  }, [highlightedItems])

  // Create lesson from Scalar (for Lesson Titles column)
  const createLessonFromScalar = useCallback((title) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: title || 'NEW LESSON',
      type: 'instructor-led',
      duration: 60,
      startTime: null,  // No time assigned yet
      day: null,        // No day assigned yet
      week: currentWeek,
      module: currentModule,
      topics: [],
      learningObjectives: [],
      scheduled: true,  // Show in Scalar column immediately
      saved: false
    }
    setLessons(prev => [...prev, newLesson])
    return newLesson.id
  }, [currentWeek, currentModule])

  // Get selected scalar item
  const selectedScalarItem = useMemo(() => {
    if (!selection.type || selection.type === 'lesson') return null

    for (const module of scalarData.modules) {
      for (const lo of module.learningObjectives) {
        if (selection.type === 'lo' && lo.id === selection.id) {
          return { type: 'lo', data: lo, moduleId: module.id }
        }
        for (const topic of lo.topics) {
          if (selection.type === 'topic' && topic.id === selection.id) {
            return { type: 'topic', data: topic, loId: lo.id, moduleId: module.id }
          }
          for (const subtopic of topic.subtopics || []) {
            if (selection.type === 'subtopic' && subtopic.id === selection.id) {
              return { type: 'subtopic', data: subtopic, topicId: topic.id, loId: lo.id, moduleId: module.id }
            }
          }
        }
      }
    }
    return null
  }, [selection, scalarData])

  // --------------------------------------------
  // SELECTION OPERATIONS
  // --------------------------------------------

  const select = useCallback((type, id) => {
    setSelection({ type, id, mode: 'selected' })
  }, [])

  const startEditing = useCallback((type, id) => {
    setSelection({ type, id, mode: 'editing' })
  }, [])

  const clearSelection = useCallback(() => {
    setSelection({ type: null, id: null, mode: null })
  }, [])

  // --------------------------------------------
  // CLEAR ALL DESIGN STATE (Reset for new course)
  // --------------------------------------------
  const clearDesignState = useCallback(() => {
    // Clear timetable data (lessons, overviewBlocks)
    setTimetableData({
      lessons: [],
      overviewBlocks: [],
      overviewPlanningState: {
        timelines: [],
        notes: [],
        colorLabels: {}
      }
    })

    // Reset scalar data to empty structure
    setScalarData({
      modules: [{
        id: 'module-1',
        name: 'Module 1',
        order: 1,
        expanded: true,
        learningObjectives: []
      }],
      unlinkedTopics: [],
      performanceCriteria: []
    })

    // Clear canonical data store (Phase 3: includes performanceCriteria)
    setCanonicalData({
      los: {},
      topics: {},
      subtopics: {},
      performanceCriteria: {},
      lessonLOs: [],
      lessonTopics: [],
      lessonSubtopics: []
    })

    // Clear selection state
    setSelection({ type: null, id: null, mode: null })
    setMultiSelection([])
    setLinkingSource(null)
    setHighlightedItems([])

    // Reset navigation state
    setActiveTab('timetable')
    setCurrentWeek(1)
    setCurrentDay(1)
    setCurrentModule(1)
    setHierarchyNav({ currentLevel: 0, path: [], filterId: null })

    console.log('Design state cleared')
  }, [setTimetableData])

  // --------------------------------------------
  // HIERARCHY NAVIGATION (Phase 4: Calm Wheel)
  // --------------------------------------------

  // Get item info for hierarchy level
  const getHierarchyItem = useCallback((level, itemId) => {
    const { los, topics, subtopics } = canonicalData

    switch (level) {
      case 0: // Module
        return { id: itemId, label: 'Module 1', serial: '1' }
      case 1: // LO
        const lo = los[itemId]
        return lo ? { id: itemId, label: lo.description, serial: String(lo.order) } : null
      case 2: // Topic
        const topic = topics[itemId]
        if (!topic) return null
        const topicSerial = getCanonicalTopicSerial(itemId)
        return { id: itemId, label: topic.title, serial: topicSerial }
      case 3: // Subtopic
        const subtopic = subtopics[itemId]
        if (!subtopic) return null
        const subtopicSerial = getCanonicalSubtopicSerial(itemId)
        return { id: itemId, label: subtopic.title, serial: subtopicSerial }
      case 4: // Lesson
        const lesson = lessons.find(l => l.id === itemId)
        return lesson ? { id: itemId, label: lesson.title, serial: null } : null
      default:
        return null
    }
  }, [canonicalData, lessons, getCanonicalTopicSerial, getCanonicalSubtopicSerial])

  // Navigate hierarchy down (drill into selected item)
  const navigateDown = useCallback((itemId) => {
    const { currentLevel, path } = hierarchyNav
    if (currentLevel >= 4) return // Can't go deeper than lessons

    const item = getHierarchyItem(currentLevel, itemId)
    if (!item) return

    setHierarchyNav({
      currentLevel: currentLevel + 1,
      path: [...path, { level: currentLevel, id: itemId, label: item.label, serial: item.serial }],
      filterId: itemId
    })
  }, [hierarchyNav, getHierarchyItem])

  // Navigate hierarchy up (go to parent level)
  const navigateUp = useCallback(() => {
    const { currentLevel, path } = hierarchyNav
    if (currentLevel === 0) return

    const newPath = path.slice(0, -1)
    const parentItem = newPath[newPath.length - 1]

    setHierarchyNav({
      currentLevel: currentLevel - 1,
      path: newPath,
      filterId: parentItem?.id || null
    })
  }, [hierarchyNav])

  // Navigate to specific level (breadcrumb click)
  const navigateToLevel = useCallback((level) => {
    const { path } = hierarchyNav
    const newPath = path.slice(0, level)
    const targetItem = newPath[newPath.length - 1]

    setHierarchyNav({
      currentLevel: level,
      path: newPath,
      filterId: targetItem?.id || null
    })
  }, [hierarchyNav])

  // Toggle WheelNav collapse
  const toggleWheelNav = useCallback(() => {
    setWheelNavCollapsed(prev => !prev)
  }, [])

  // --------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------

  // Get currently selected lesson
  const selectedLesson = useMemo(() => {
    if (selection.type !== 'lesson') return null
    return lessons.find(l => l.id === selection.id) || null
  }, [selection, lessons])

  // Get scheduled lessons (on timetable)
  const scheduledLessons = useMemo(() =>
    lessons.filter(l => l.scheduled),
    [lessons]
  )

  // Get unscheduled lessons (removed from timetable - show in Unallocated area)
  const unscheduledLessons = useMemo(() =>
    lessons.filter(l => !l.scheduled),
    [lessons]
  )

  // Get saved lessons (in saved library)
  const savedLessons = useMemo(() =>
    lessons.filter(l => l.saved),
    [lessons]
  )

  // --------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------
  const value = useMemo(() => ({
    // Navigation
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    currentModule,
    setCurrentModule,
    currentWeek,
    setCurrentWeek,
    currentDay,
    setCurrentDay,

    // Hierarchy Navigation (Phase 4: Calm Wheel)
    hierarchyNav,
    navigateDown,
    navigateUp,
    navigateToLevel,
    wheelNavCollapsed,
    toggleWheelNav,

    // Overview
    overviewBlocks,
    setOverviewBlocks,

    // Overview Planning (Phase 2-6 Redesign)
    overviewPlanningState,
    addPlanningTimeline,
    removePlanningTimeline,
    updatePlanningTimeline,
    addPlanningNote,
    removePlanningNote,
    updatePlanningNote,
    updatePlanningColorLabel,

    // Lessons
    lessons,
    selectedLesson,
    scheduledLessons,
    unscheduledLessons,
    savedLessons,
    updateLesson,
    createLesson,
    deleteLesson,
    duplicateLesson,
    scheduleLesson,
    unscheduleLesson,
    saveToLibrary,
    toggleLessonLO,
    addTopicToLesson,
    removeTopicFromLesson,
    updateLessonTopic,
    addSubtopicToLessonTopic,
    removeSubtopicFromLessonTopic,
    updateLessonSubtopic,

    // Scalar (effectiveScalarData provides derived data from canonical when available)
    scalarData: effectiveScalarData,
    setScalarData,
    selectedScalarItem,
    toggleScalarExpand,
    addLearningObjective,
    addTopic,
    addSubtopic,
    createLessonFromScalar,

    // Canonical data store (normalized - single source of truth)
    canonicalData,
    setCanonicalData,
    getCanonicalTopicSerial,
    getCanonicalSubtopicSerial,

    // Topic linking/unlinking
    toggleTopicLOLink,
    unlinkTopic,
    linkTopicToLO,
    recalculateGroupOrders,
    calculateTopicNumber,
    calculateSubtopicNumber,
    getLOById,

    // Performance Criteria
    addPerformanceCriteria,
    updatePerformanceCriteria,
    deletePerformanceCriteria,
    linkItemToPC,
    unlinkItemFromPC,
    getLinkedPCs,
    getLinkedPCsWithColor,

    // Multi-selection (for SHIFT+click bulk operations)
    multiSelection,
    toggleMultiSelect,
    clearMultiSelection,
    isMultiSelected,
    bulkLinkToPC,
    bulkUnlinkFromPC,
    bulkDelete,

    // Universal linking (SHIFT+click any element to any element)
    linkingSource,
    setLinkingSource,
    clearLinkingSource,
    linkElements,
    handleShiftClickLink,
    linkToSource,
    sessionLinkedElements,
    isSessionLinked,

    // Helper functions
    isUnallocatedNumber,

    // Cross-column highlighting
    highlightedItems,
    updateHighlightedItems,
    clearHighlights,
    isItemHighlighted,
    updateScalarNode,
    deleteScalarNode,
    reorderTopic,
    reorderSubtopic,
    reorderLO,

    // Selection
    selection,
    select,
    startEditing,
    clearSelection,

    // Clear all Design state (for CLEAR button)
    clearDesignState,

    // Editor
    editorCollapsed,
    setEditorCollapsed,

    // Drag operations
    moveLesson,
    resizeLesson,
    checkCollision,
    findAvailableSlot,

    // Course data (from parent)
    courseData,
    setCourseData,

    // Shared update helpers (Corrections #3, #4)
    updateLessonTitle,
    updateTopicTitle,
    updateSubtopicTitle,
    updateLearningObjectiveText,

    // Build page state
    buildSelection,
    setBuildSelection,

    // Slide operations (BUILD page)
    ensureLessonHasDefaultSlide,
    addSlideToLesson,
    duplicateSlide,
    updateSlideType,
    updateSlideContentBlock,
    updateSlideInstructorNotes,
    deleteSlide,
    eraseSlideContentBlock,
    calculateLessonProgress,
    getLessonSubtopics,

    // Constants
    LESSON_TYPES,
    SLIDE_TYPES,
    PC_COLORS
  }), [
    activeTab, viewMode, currentModule, currentWeek, currentDay, overviewBlocks,
    // Overview Planning (Phase 2-6)
    overviewPlanningState, addPlanningTimeline, removePlanningTimeline, updatePlanningTimeline,
    addPlanningNote, removePlanningNote, updatePlanningNote, updatePlanningColorLabel,
    // Hierarchy navigation (Phase 4)
    hierarchyNav, navigateDown, navigateUp, navigateToLevel, wheelNavCollapsed, toggleWheelNav,
    lessons, selectedLesson, scheduledLessons, unscheduledLessons, savedLessons,
    updateLesson, createLesson, deleteLesson, duplicateLesson,
    scheduleLesson, unscheduleLesson, saveToLibrary, toggleLessonLO,
    addTopicToLesson, removeTopicFromLesson, updateLessonTopic,
    addSubtopicToLessonTopic, removeSubtopicFromLessonTopic, updateLessonSubtopic,
    moveLesson, resizeLesson, checkCollision, findAvailableSlot,
    effectiveScalarData, selectedScalarItem, toggleScalarExpand,
    addLearningObjective, addTopic, addSubtopic, updateScalarNode, deleteScalarNode,
    reorderTopic, reorderSubtopic, reorderLO, createLessonFromScalar,
    // Canonical data store
    canonicalData, getCanonicalTopicSerial, getCanonicalSubtopicSerial,
    toggleTopicLOLink, unlinkTopic, linkTopicToLO, recalculateGroupOrders,
    calculateTopicNumber, calculateSubtopicNumber, getLOById,
    addPerformanceCriteria, updatePerformanceCriteria, deletePerformanceCriteria,
    linkItemToPC, unlinkItemFromPC, getLinkedPCs, getLinkedPCsWithColor,
    multiSelection, toggleMultiSelect, clearMultiSelection, isMultiSelected,
    bulkLinkToPC, bulkUnlinkFromPC, bulkDelete,
    linkingSource, clearLinkingSource, linkElements, handleShiftClickLink, linkToSource, sessionLinkedElements, isSessionLinked,
    isUnallocatedNumber,
    highlightedItems, updateHighlightedItems, clearHighlights, isItemHighlighted,
    selection, select, startEditing, clearSelection, clearDesignState,
    editorCollapsed, courseData, setCourseData,
    // Shared update helpers
    updateLessonTitle, updateTopicTitle, updateSubtopicTitle, updateLearningObjectiveText,
    // Build page state and operations
    buildSelection, ensureLessonHasDefaultSlide, addSlideToLesson, duplicateSlide,
    updateSlideType, updateSlideContentBlock, updateSlideInstructorNotes,
    deleteSlide, eraseSlideContentBlock, calculateLessonProgress, getLessonSubtopics
  ])

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================
export function useDesign() {
  const context = useContext(DesignContext)
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return context
}

export default DesignContext
