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
  // --------------------------------------------
  const [scalarData, setScalarData] = useState({
    modules: [
      {
        id: 'module-1',
        name: 'Module 1',
        order: 1,
        learningObjectives: []
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

    // Scalar
    scalarData,
    setScalarData,

    // Selection
    selection,
    select,
    startEditing,
    clearSelection,

    // Editor
    editorCollapsed,
    setEditorCollapsed,

    // Course data (from parent)
    courseData,
    setCourseData,

    // Constants
    LESSON_TYPES
  }), [
    activeTab, viewMode, currentModule, currentWeek, currentDay,
    lessons, selectedLesson, scheduledLessons, unscheduledLessons, savedLessons,
    updateLesson, createLesson, deleteLesson, duplicateLesson,
    scheduleLesson, unscheduleLesson, saveToLibrary,
    scalarData, selection, select, startEditing, clearSelection,
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
