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
// LESSON TYPES - 10 types per DESIGN_Page mockup
// ============================================
export const LESSON_TYPES = [
  // Row 1
  { id: 'instructor-led', name: 'Instructor Led', label: 'Instructor Led', color: '#FF6600' },
  { id: 'group-discussion', name: 'Group Discussion', label: 'Group Discussion', color: '#00FF00' },
  { id: 'practical', name: 'Practical', label: 'Practical', color: '#00BFFF' },
  { id: 'assessment', name: 'Assessment', label: 'Assessment', color: '#FF4444' },
  { id: 'break', name: 'Break', label: 'Break', color: '#FFD700' },
  // Row 2
  { id: 'student-led', name: 'Student Led', label: 'Student Led', color: '#FFFFFF' },
  { id: 'research', name: 'Research', label: 'Research', color: '#00FF00' },
  { id: 'external-lecturer', name: 'External Lecturer', label: 'External Lecturer', color: '#FF6600' },
  { id: 'admin', name: 'Admin', label: 'Admin', color: '#FFD700' },
  { id: 'user-defined', name: 'User Defined', label: 'User Defined', color: '#FF00FF' }
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
  const [viewMode, setViewMode] = useState('week') // 'day' | 'week' | 'module'
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
    // Performance Criteria - tagging system across hierarchy
    performanceCriteria: []
  })

  // Highlighted items for cross-column highlighting in Scalar
  const [highlightedItems, setHighlightedItems] = useState({
    los: new Set(),
    topics: new Set(),
    subtopics: new Set(),
    lessons: new Set()
  })

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

  // Helper: Recalculate topic numbers for a lesson based on LO assignment
  const recalculateLessonTopicNumbers = useCallback((lessons, lessonId) => {
    return lessons.map(lesson => {
      if (lesson.id !== lessonId) return lesson

      const primaryLOId = lesson.learningObjectives?.[0] || null
      const loOrder = getLOOrder(primaryLOId)

      // If no LO assigned, set all topics to "x.x"
      if (!loOrder) {
        return {
          ...lesson,
          topics: (lesson.topics || []).map((t, idx) => ({
            ...t,
            number: 'x.x',
            loId: null
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

      // Renumber topics sequentially
      return {
        ...lesson,
        topics: (lesson.topics || []).map((t, idx) => ({
          ...t,
          number: `${loOrder}.${baseTopicNum + idx + 1}`,
          loId: primaryLOId
        }))
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
    if (!lesson) return

    const primaryLOId = lesson.learningObjectives?.[0] || null
    const loOrder = getLOOrder(primaryLOId)

    // Update lessons state
    setLessons(prev => {
      const currentLesson = prev.find(l => l.id === lessonId)
      if (!currentLesson) return prev

      // If no LO assigned, use "x.x" placeholder (no Scalar sync)
      if (!loOrder) {
        const newTopic = {
          id: lessonTopicId,
          title: topicTitle,
          number: 'x.x',
          loId: null,
          scalarTopicId: null
        }
        return prev.map(l =>
          l.id === lessonId
            ? { ...l, topics: [...(l.topics || []), newTopic] }
            : l
        )
      }

      // Calculate next topic number for this LO across all lessons
      let maxTopicNum = 0
      prev.forEach(l => {
        const loPrimary = l.learningObjectives?.[0]
        if (loPrimary === primaryLOId) {
          const isSameOrBefore = (l.day < currentLesson.day) ||
            (l.day === currentLesson.day && (l.startTime || '0000') <= (currentLesson.startTime || '0000'))
          if (isSameOrBefore) {
            l.topics?.forEach(t => {
              const match = t.number?.match(/^\d+\.(\d+)$/)
              if (match) {
                maxTopicNum = Math.max(maxTopicNum, parseInt(match[1]))
              }
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

      return prev.map(l =>
        l.id === lessonId
          ? { ...l, topics: [...(l.topics || []), newTopic] }
          : l
      )
    })

    // Sync to Scalar separately (only if LO is assigned)
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

  // Remove topic from a lesson
  const removeTopicFromLesson = useCallback((lessonId, topicId) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId
        ? { ...lesson, topics: (lesson.topics || []).filter(t => t.id !== topicId) }
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

      // If there's a linked scalar topic and title is being updated, sync to scalar
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
      const topicNumber = topic.number || 'x.x'
      const hasValidNumber = topicNumber !== 'x.x'
      const scalarTopicId = topic.scalarTopicId

      // Calculate next subtopic number
      const existingSubtopics = topic.subtopics || []
      let maxSubNum = 0
      existingSubtopics.forEach(s => {
        const match = s.number?.match(/\d+\.\d+\.(\d+)$/)
        if (match) {
          maxSubNum = Math.max(maxSubNum, parseInt(match[1]))
        }
      })

      const newSubtopic = {
        id: lessonSubtopicId,
        title: subtopicTitle,
        number: hasValidNumber ? `${topicNumber}.${maxSubNum + 1}` : 'x.x.x',
        scalarSubtopicId: scalarTopicId ? scalarSubtopicId : null // Link to scalar if parent topic is linked
      }

      // Auto-sync: Add subtopic to scalar if parent topic has a scalar link
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

      // If there's a linked scalar subtopic and title is being updated, sync to scalar
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

  // --------------------------------------------
  // PERFORMANCE CRITERIA OPERATIONS
  // --------------------------------------------

  // Add new Performance Criteria
  const addPerformanceCriteria = useCallback((name) => {
    setScalarData(prev => {
      const newPC = {
        id: `pc-${Date.now()}`,
        name: name || `PC${(prev.performanceCriteria?.length || 0) + 1}`,
        order: (prev.performanceCriteria?.length || 0) + 1,
        linkedItems: {
          los: [],
          topics: [],
          subtopics: [],
          lessons: []
        }
      }
      return {
        ...prev,
        performanceCriteria: [...(prev.performanceCriteria || []), newPC]
      }
    })
  }, [])

  // Update Performance Criteria
  const updatePerformanceCriteria = useCallback((pcId, updates) => {
    setScalarData(prev => ({
      ...prev,
      performanceCriteria: (prev.performanceCriteria || []).map(pc =>
        pc.id === pcId ? { ...pc, ...updates } : pc
      )
    }))
  }, [])

  // Delete Performance Criteria
  const deletePerformanceCriteria = useCallback((pcId) => {
    setScalarData(prev => ({
      ...prev,
      performanceCriteria: (prev.performanceCriteria || [])
        .filter(pc => pc.id !== pcId)
        .map((pc, idx) => ({ ...pc, order: idx + 1 }))
    }))
  }, [])

  // Link an item to a Performance Criteria
  const linkItemToPC = useCallback((pcId, itemType, itemId) => {
    setScalarData(prev => ({
      ...prev,
      performanceCriteria: (prev.performanceCriteria || []).map(pc => {
        if (pc.id !== pcId) return pc
        const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
        if (pc.linkedItems[typeKey]?.includes(itemId)) return pc // Already linked
        return {
          ...pc,
          linkedItems: {
            ...pc.linkedItems,
            [typeKey]: [...(pc.linkedItems[typeKey] || []), itemId]
          }
        }
      })
    }))
  }, [])

  // Unlink an item from a Performance Criteria
  const unlinkItemFromPC = useCallback((pcId, itemType, itemId) => {
    setScalarData(prev => ({
      ...prev,
      performanceCriteria: (prev.performanceCriteria || []).map(pc => {
        if (pc.id !== pcId) return pc
        const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
        return {
          ...pc,
          linkedItems: {
            ...pc.linkedItems,
            [typeKey]: (pc.linkedItems[typeKey] || []).filter(id => id !== itemId)
          }
        }
      })
    }))
  }, [])

  // Get linked PCs for an item (returns array of PC names for badge display)
  const getLinkedPCs = useCallback((itemType, itemId) => {
    const typeKey = itemType === 'lo' ? 'los' : `${itemType}s`
    return (scalarData.performanceCriteria || [])
      .filter(pc => pc.linkedItems[typeKey]?.includes(itemId))
      .map(pc => pc.name)
  }, [scalarData.performanceCriteria])

  // --------------------------------------------
  // CROSS-COLUMN HIGHLIGHTING
  // --------------------------------------------

  // Set highlighted items based on clicked item
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
            // Clicked LO → highlight all its Topics, Subtopics, and linked Lessons
            newHighlights.los.add(lo.id)
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
              // Clicked Topic → highlight parent LO, all Subtopics, and linked Lessons
              newHighlights.los.add(lo.id)
              newHighlights.topics.add(topic.id)
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
                // Clicked Subtopic → highlight parent Topic, grandparent LO, and linked Lessons
                newHighlights.los.add(lo.id)
                newHighlights.topics.add(topic.id)
                newHighlights.subtopics.add(subtopic.id)
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
        newHighlights.lessons.add(lesson.id)
        // Highlight all LOs assigned to this lesson
        lesson.learningObjectives?.forEach(loId => newHighlights.los.add(loId))
        // Highlight all topics and subtopics
        lesson.topics?.forEach(topic => {
          if (topic.scalarTopicId) newHighlights.topics.add(topic.scalarTopicId)
          topic.subtopics?.forEach(sub => {
            if (sub.scalarSubtopicId) newHighlights.subtopics.add(sub.scalarSubtopicId)
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
      startTime: '0900',
      day: currentDay,
      week: currentWeek,
      module: currentModule,
      topics: [],
      learningObjectives: [],
      scheduled: false,  // Starts unscheduled, available in library
      saved: false
    }
    setLessons(prev => [...prev, newLesson])
    return newLesson.id
  }, [currentDay, currentWeek, currentModule])

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
    addTopicToLesson,
    removeTopicFromLesson,
    updateLessonTopic,
    addSubtopicToLessonTopic,
    removeSubtopicFromLessonTopic,
    updateLessonSubtopic,

    // Scalar
    scalarData,
    setScalarData,
    selectedScalarItem,
    toggleScalarExpand,
    addLearningObjective,
    addTopic,
    addSubtopic,
    createLessonFromScalar,

    // Performance Criteria
    addPerformanceCriteria,
    updatePerformanceCriteria,
    deletePerformanceCriteria,
    linkItemToPC,
    unlinkItemFromPC,
    getLinkedPCs,

    // Cross-column highlighting
    highlightedItems,
    updateHighlightedItems,
    clearHighlights,
    isItemHighlighted,
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
    addTopicToLesson, removeTopicFromLesson, updateLessonTopic,
    addSubtopicToLessonTopic, removeSubtopicFromLessonTopic, updateLessonSubtopic,
    moveLesson, resizeLesson, checkCollision, findAvailableSlot,
    scalarData, selectedScalarItem, toggleScalarExpand,
    addLearningObjective, addTopic, addSubtopic, updateScalarNode, deleteScalarNode,
    createLessonFromScalar,
    addPerformanceCriteria, updatePerformanceCriteria, deletePerformanceCriteria,
    linkItemToPC, unlinkItemFromPC, getLinkedPCs,
    highlightedItems, updateHighlightedItems, clearHighlights, isItemHighlighted,
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
