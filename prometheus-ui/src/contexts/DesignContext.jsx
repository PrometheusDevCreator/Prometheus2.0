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

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

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

// Snap minutes to 30-minute grid
function snapToGrid(minutes, gridSize = 30) {
  return Math.round(minutes / gridSize) * gridSize
}

// ============================================
// LESSON TYPES
// ============================================
export const LESSON_TYPES = [
  { id: 'instructor-led', label: 'Instructor Led', color: '#D65700' },
  { id: 'discussion', label: 'Group Discussion', color: '#2E7D32' },
  { id: 'project', label: 'Group Project', color: '#1565C0' },
  { id: 'practical', label: 'Practical', color: '#6A1B9A' },
  { id: 'seminar', label: 'Seminar', color: '#00838F' },
  { id: 'online', label: 'Online', color: '#558B2F' },
  { id: 'admin', label: 'Admin', color: '#5D4037' },
  { id: 'assessment', label: 'Assessment', color: '#C62828' },
  { id: 'break', label: 'Break', color: '#616161' }
]

// ============================================
// CONTEXT DEFINITION
// ============================================
const DesignContext = createContext(null)

// ============================================
// PROVIDER COMPONENT
// ============================================
export function DesignProvider({ children, courseData, setCourseData }) {
  // --------------------------------------------
  // NAVIGATION STATE
  // --------------------------------------------
  const [activeTab, setActiveTab] = useState('timetable') // 'timetable' | 'scalar'
  const [viewMode, setViewMode] = useState('day') // 'day' | 'week' | 'module'
  const [currentModule, setCurrentModule] = useState(1)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [currentDay, setCurrentDay] = useState(1)

  // --------------------------------------------
  // LESSON STATE (Single Source of Truth)
  // --------------------------------------------
  const [lessons, setLessons] = useState([
    {
      id: 'lesson-1',
      title: 'INTRODUCTION',
      type: 'instructor-led',
      duration: 60,
      startTime: '0900',
      day: 1,
      week: 1,
      module: 1,
      topics: [],
      learningObjectives: [],
      scheduled: true,
      saved: false
    }
  ])

  // --------------------------------------------
  // SCALAR HIERARCHY STATE
  // Module > LearningObjective > Topic > Subtopic
  // --------------------------------------------
  const [scalarData, setScalarData] = useState({
    modules: [
      {
        id: 'module-1',
        name: 'Module 1',
        order: 1,
        expanded: true,
        learningObjectives: [
          {
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
          }
        ]
      }
    ]
  })

  // --------------------------------------------
  // SELECTION STATE (exactly one at a time)
  // --------------------------------------------
  const [selection, setSelection] = useState({
    type: 'lesson',       // 'lesson' | 'lo' | 'topic' | 'subtopic' | null
    id: 'lesson-1',
    mode: 'selected'      // 'selected' | 'editing'
  })

  // --------------------------------------------
  // EDITOR PANEL STATE
  // --------------------------------------------
  const [editorCollapsed, setEditorCollapsed] = useState(false)

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

  // Toggle LO assignment for a lesson
  const toggleLessonLO = useCallback((lessonId, loId) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      const currentLOs = lesson.learningObjectives || []
      const hasLO = currentLOs.includes(loId)
      return {
        ...lesson,
        learningObjectives: hasLO
          ? currentLOs.filter(id => id !== loId)
          : [...currentLOs, loId]
      }
    }))
  }, [])

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

  // Resize lesson duration (snaps to 30-min increments)
  const resizeLesson = useCallback((lessonId, newDuration) => {
    // Snap to 30-minute increments
    const snappedDuration = Math.round(newDuration / 30) * 30
    // Minimum 30 minutes, maximum 480 minutes (8 hours)
    const clampedDuration = Math.max(30, Math.min(480, snappedDuration))
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
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }
      const moduleIndex = newData.modules.findIndex(m => m.id === moduleId)
      if (moduleIndex === -1) return prev

      const module = { ...newData.modules[moduleIndex] }
      newData.modules[moduleIndex] = module
      module.learningObjectives = [...module.learningObjectives]

      const newLO = {
        id: `lo-${Date.now()}`,
        verb: 'IDENTIFY',
        description: 'new learning objective',
        order: module.learningObjectives.length + 1,
        expanded: true,
        topics: []
      }
      module.learningObjectives.push(newLO)
      return newData
    })
  }, [])

  // Add new Topic to an LO
  const addTopic = useCallback((loId) => {
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

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
              id: `topic-${Date.now()}`,
              title: 'New Topic',
              order: lo.topics.length + 1,
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
  }, [])

  // Add new Subtopic to a Topic
  const addSubtopic = useCallback((topicId) => {
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

            if (topic.id === topicId) {
              topic.subtopics = [...topic.subtopics]
              const newSubtopic = {
                id: `subtopic-${Date.now()}`,
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
  }, [])

  // Update scalar node (LO, Topic, or Subtopic)
  const updateScalarNode = useCallback((nodeType, nodeId, updates) => {
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

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
  }, [])

  // Delete scalar node
  const deleteScalarNode = useCallback((nodeType, nodeId) => {
    setScalarData(prev => {
      const newData = { ...prev, modules: [...prev.modules] }

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
  }, [])

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

  // Get unscheduled lessons (in library)
  const unscheduledLessons = useMemo(() =>
    lessons.filter(l => !l.scheduled && !l.saved),
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

    // Scalar
    scalarData,
    setScalarData,
    selectedScalarItem,
    toggleScalarExpand,
    addLearningObjective,
    addTopic,
    addSubtopic,
    updateScalarNode,
    deleteScalarNode,

    // Selection
    selection,
    select,
    startEditing,
    clearSelection,

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

    // Constants
    LESSON_TYPES
  }), [
    activeTab, viewMode, currentModule, currentWeek, currentDay,
    lessons, selectedLesson, scheduledLessons, unscheduledLessons, savedLessons,
    updateLesson, createLesson, deleteLesson, duplicateLesson,
    scheduleLesson, unscheduleLesson, saveToLibrary, toggleLessonLO,
    moveLesson, resizeLesson, checkCollision, findAvailableSlot,
    scalarData, selectedScalarItem, toggleScalarExpand,
    addLearningObjective, addTopic, addSubtopic, updateScalarNode, deleteScalarNode,
    selection, select, startEditing, clearSelection,
    editorCollapsed, courseData, setCourseData
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
