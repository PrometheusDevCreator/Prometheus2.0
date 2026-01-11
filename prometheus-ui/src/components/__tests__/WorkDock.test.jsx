/**
 * Unit Tests for WorkDock Component
 *
 * PHASE 4 - WORK DOCK
 *
 * Tests the right dock lesson display component:
 * - Lesson rendering using LessonCardPrimitive
 * - Selection and highlighting
 * - Hierarchy filtering
 * - Drag/drop operations
 * - Feature flag behavior
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorkDock from '../design/WorkDock'

// ============================================
// MOCK DATA
// ============================================

const mockLessons = [
  {
    id: 'lesson-1',
    title: 'Scheduled Lesson 1',
    type: 'instructor-led',
    duration: 60,
    scheduled: true,
    learningObjectives: ['lo-1'],
    topics: [{ id: 'topic-1', title: 'Topic 1' }]
  },
  {
    id: 'lesson-2',
    title: 'Scheduled Lesson 2',
    type: 'discussion',
    duration: 30,
    scheduled: true,
    learningObjectives: ['lo-2'],
    topics: []
  },
  {
    id: 'lesson-3',
    title: 'Unscheduled Lesson',
    type: 'practical',
    duration: 90,
    scheduled: false,
    learningObjectives: ['lo-1'],
    topics: [{ id: 'topic-1', title: 'Topic 1' }]
  }
]

const mockContextValue = {
  lessons: mockLessons,
  scheduledLessons: mockLessons.filter(l => l.scheduled),
  unscheduledLessons: mockLessons.filter(l => !l.scheduled),
  selection: { type: null, id: null, mode: null },
  select: vi.fn(),
  hierarchyNav: { currentLevel: 0, path: [], filterId: null },
  canonicalData: { los: {}, topics: {}, subtopics: {} },
  scheduleLesson: vi.fn(),
  unscheduleLesson: vi.fn(),
  deleteLesson: vi.fn(),
  updateLesson: vi.fn()
}

// Mock the useDesign hook
vi.mock('../../contexts/DesignContext', async () => {
  const actual = await vi.importActual('../../contexts/DesignContext')
  return {
    ...actual,
    useDesign: () => mockContextValue
  }
})

// Mock CANONICAL_FLAGS - enabled by default for tests
vi.mock('../../utils/canonicalAdapter', () => ({
  CANONICAL_FLAGS: {
    SCALAR_DOCK_ENABLED: true,
    WORK_DOCK_ENABLED: true
  }
}))

// Mock LessonCardPrimitive to simplify testing
vi.mock('../LessonCardPrimitive', () => ({
  default: ({ lesson, isSelected, onSelect, onDragStart, onDragEnd }) => (
    <div
      data-testid={`lesson-card-${lesson.id}`}
      data-selected={isSelected}
      onClick={onSelect}
      draggable
      onDragStart={(e) => onDragStart?.(e, lesson)}
      onDragEnd={onDragEnd}
    >
      {lesson.title}
    </div>
  )
}))

// ============================================
// TESTS
// ============================================

describe('WorkDock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset context values
    mockContextValue.selection = { type: null, id: null, mode: null }
    mockContextValue.hierarchyNav = { currentLevel: 0, path: [], filterId: null }
  })

  // ============================================
  // BASIC RENDERING
  // ============================================

  describe('Basic Rendering', () => {
    test('renders without crashing', () => {
      render(<WorkDock />)
      expect(screen.getByTestId('work-dock')).toBeInTheDocument()
    })

    test('renders header with LESSONS title', () => {
      render(<WorkDock />)
      expect(screen.getByText('LESSONS')).toBeInTheDocument()
    })

    test('renders total lesson count', () => {
      render(<WorkDock />)
      expect(screen.getByText('3 total')).toBeInTheDocument()
    })

    test('renders scheduled section', () => {
      render(<WorkDock />)
      expect(screen.getByText('SCHEDULED')).toBeInTheDocument()
    })

    test('renders unscheduled section', () => {
      render(<WorkDock />)
      expect(screen.getByText('UNSCHEDULED')).toBeInTheDocument()
    })

    test('renders lesson cards', () => {
      render(<WorkDock />)
      expect(screen.getByTestId('lesson-card-lesson-1')).toBeInTheDocument()
      expect(screen.getByTestId('lesson-card-lesson-2')).toBeInTheDocument()
      expect(screen.getByTestId('lesson-card-lesson-3')).toBeInTheDocument()
    })

    test('renders empty state when no lessons', () => {
      mockContextValue.lessons = []
      mockContextValue.scheduledLessons = []
      mockContextValue.unscheduledLessons = []

      render(<WorkDock />)
      expect(screen.getByText(/No lessons created yet/i)).toBeInTheDocument()

      // Restore
      mockContextValue.lessons = mockLessons
      mockContextValue.scheduledLessons = mockLessons.filter(l => l.scheduled)
      mockContextValue.unscheduledLessons = mockLessons.filter(l => !l.scheduled)
    })

    test('renders status bar with counts', () => {
      render(<WorkDock />)
      expect(screen.getByText(/2 scheduled, 1 unscheduled/)).toBeInTheDocument()
    })
  })

  // ============================================
  // SELECTION
  // ============================================

  describe('Selection', () => {
    test('calls select when lesson card is clicked', async () => {
      const user = userEvent.setup()
      render(<WorkDock />)

      await user.click(screen.getByTestId('lesson-card-lesson-1'))
      expect(mockContextValue.select).toHaveBeenCalledWith('lesson', 'lesson-1')
    })

    test('passes isSelected to lesson card', () => {
      mockContextValue.selection = { type: 'lesson', id: 'lesson-1', mode: 'selected' }

      render(<WorkDock />)
      const card = screen.getByTestId('lesson-card-lesson-1')
      expect(card).toHaveAttribute('data-selected', 'true')

      // Restore
      mockContextValue.selection = { type: null, id: null, mode: null }
    })
  })

  // ============================================
  // HIERARCHY FILTERING
  // ============================================

  describe('Hierarchy Filtering', () => {
    test('shows filtered indicator when filter is active', () => {
      mockContextValue.hierarchyNav = { currentLevel: 1, path: [], filterId: 'lo-1' }

      render(<WorkDock />)
      expect(screen.getByText('Filtered')).toBeInTheDocument()

      // Restore
      mockContextValue.hierarchyNav = { currentLevel: 0, path: [], filterId: null }
    })

    test('filters lessons by LO', () => {
      mockContextValue.hierarchyNav = { currentLevel: 1, path: [], filterId: 'lo-1' }

      render(<WorkDock />)

      // Lessons with lo-1 should be visible
      expect(screen.getByText('Scheduled Lesson 1')).toBeInTheDocument()
      expect(screen.getByText('Unscheduled Lesson')).toBeInTheDocument()

      // Lesson with lo-2 should NOT be visible
      expect(screen.queryByText('Scheduled Lesson 2')).not.toBeInTheDocument()

      // Restore
      mockContextValue.hierarchyNav = { currentLevel: 0, path: [], filterId: null }
    })

    test('filters lessons by Topic', () => {
      mockContextValue.hierarchyNav = { currentLevel: 2, path: [], filterId: 'topic-1' }

      render(<WorkDock />)

      // Lessons with topic-1 should be visible
      expect(screen.getByText('Scheduled Lesson 1')).toBeInTheDocument()
      expect(screen.getByText('Unscheduled Lesson')).toBeInTheDocument()

      // Lesson without topic-1 should NOT be visible
      expect(screen.queryByText('Scheduled Lesson 2')).not.toBeInTheDocument()

      // Restore
      mockContextValue.hierarchyNav = { currentLevel: 0, path: [], filterId: null }
    })

    test('shows empty state when filter matches no lessons', () => {
      mockContextValue.hierarchyNav = { currentLevel: 1, path: [], filterId: 'lo-nonexistent' }

      render(<WorkDock />)
      expect(screen.getByText(/No lessons match the current filter/i)).toBeInTheDocument()

      // Restore
      mockContextValue.hierarchyNav = { currentLevel: 0, path: [], filterId: null }
    })
  })

  // ============================================
  // DRAG AND DROP
  // ============================================

  describe('Drag and Drop', () => {
    test('lesson cards are draggable', () => {
      render(<WorkDock />)
      const card = screen.getByTestId('lesson-card-lesson-1')
      expect(card).toHaveAttribute('draggable', 'true')
    })

    test('calls unscheduleLesson when scheduled lesson is dropped in dock', () => {
      render(<WorkDock />)

      const dock = screen.getByTestId('work-dock')
      const contentArea = dock.querySelector('[style*="overflow: auto"]')

      // Simulate drop event
      fireEvent.drop(contentArea, {
        dataTransfer: {
          getData: (key) => {
            if (key === 'lessonId') return 'lesson-1'
            if (key === 'dragType') return 'move'
            return ''
          }
        }
      })

      expect(mockContextValue.unscheduleLesson).toHaveBeenCalledWith('lesson-1')
    })

    test('does not unschedule on schedule drag type', () => {
      render(<WorkDock />)

      const dock = screen.getByTestId('work-dock')
      const contentArea = dock.querySelector('[style*="overflow: auto"]')

      // Simulate drop event with schedule type
      fireEvent.drop(contentArea, {
        dataTransfer: {
          getData: (key) => {
            if (key === 'lessonId') return 'lesson-3'
            if (key === 'dragType') return 'schedule'
            return ''
          }
        }
      })

      expect(mockContextValue.unscheduleLesson).not.toHaveBeenCalled()
    })
  })

  // ============================================
  // SECTION COUNTS
  // ============================================

  describe('Section Counts', () => {
    test('displays correct count badges', () => {
      render(<WorkDock />)

      // Find count badges
      const scheduledSection = screen.getByText('SCHEDULED').closest('div')
      const unscheduledSection = screen.getByText('UNSCHEDULED').closest('div')

      expect(scheduledSection).toHaveTextContent('2')
      expect(unscheduledSection).toHaveTextContent('1')
    })
  })

  // ============================================
  // USES LESSON CARD PRIMITIVE
  // ============================================

  describe('LessonCardPrimitive Usage', () => {
    test('renders LessonCardPrimitive for each lesson', () => {
      render(<WorkDock />)

      // Our mock renders with test IDs
      expect(screen.getByTestId('lesson-card-lesson-1')).toBeInTheDocument()
      expect(screen.getByTestId('lesson-card-lesson-2')).toBeInTheDocument()
      expect(screen.getByTestId('lesson-card-lesson-3')).toBeInTheDocument()
    })
  })
})

console.log('All WorkDock tests defined. Run with: npm test')
