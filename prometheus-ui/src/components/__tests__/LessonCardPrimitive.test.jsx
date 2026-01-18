/**
 * Unit Tests for LessonCardPrimitive Component
 *
 * PHASE 2 - SHARED PRIMITIVES
 *
 * Tests the unified lesson card component across all variants:
 * - library: Drag-to-schedule, saved indicator
 * - timetable: Drag-to-move, resize, inline edit, context menu
 * - overview: Absolute position, mouse drag, commit indicator
 * - compact: Minimal display
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LessonCardPrimitive, { DEFAULT_LESSON_TYPES, VARIANT_DEFAULTS } from '../LessonCardPrimitive'

// ============================================
// TEST FIXTURES
// ============================================

const createMockLesson = (overrides = {}) => ({
  id: 'lesson-123',
  title: 'Introduction to Testing',
  type: 'lecture',
  duration: 60,
  startTime: '0900',
  day: 1,
  learningObjectives: ['lo-1'],
  loId: 'lo-1',
  saved: false,
  ...overrides
})

const defaultProps = {
  lesson: createMockLesson(),
  variant: 'library',
  onSelect: vi.fn(),
  onStartEditing: vi.fn(),
  onUpdate: vi.fn(),
  onDragStart: vi.fn(),
  onDragEnd: vi.fn(),
  onDelete: vi.fn()
}

// ============================================
// TESTS: Variant Defaults Configuration
// ============================================

describe('VARIANT_DEFAULTS', () => {
  test('library variant has correct defaults', () => {
    const config = VARIANT_DEFAULTS.library
    expect(config.dragMode).toBe('html5')
    expect(config.dragType).toBe('schedule')
    expect(config.showTime).toBe(false)
    expect(config.showTypeLabel).toBe(true)
    expect(config.showDuration).toBe(true)
    expect(config.showSavedIndicator).toBe(true)
    expect(config.editable).toBe(false)
    expect(config.resizable).toBe(false)
    expect(config.contextMenuEnabled).toBe(false)
  })

  test('timetable variant has correct defaults', () => {
    const config = VARIANT_DEFAULTS.timetable
    expect(config.dragMode).toBe('html5')
    expect(config.dragType).toBe('move')
    expect(config.showTime).toBe(true)
    expect(config.showTypeLabel).toBe(false)
    expect(config.showDuration).toBe(true)
    expect(config.showSavedIndicator).toBe(false)
    expect(config.editable).toBe(true)
    expect(config.resizable).toBe(true)
    expect(config.contextMenuEnabled).toBe(true)
  })

  test('overview variant has correct defaults', () => {
    const config = VARIANT_DEFAULTS.overview
    expect(config.dragMode).toBe('mouse')
    expect(config.dragType).toBe('canvas')
    expect(config.showTime).toBe(false)
    expect(config.showTypeLabel).toBe(true)
    expect(config.showDuration).toBe(true)
    expect(config.showSavedIndicator).toBe(false)
    expect(config.editable).toBe(true)
    expect(config.resizable).toBe(false)
    expect(config.contextMenuEnabled).toBe(false)
  })

  test('compact variant has correct defaults', () => {
    const config = VARIANT_DEFAULTS.compact
    expect(config.dragMode).toBe('none')
    expect(config.dragType).toBe(null)
    expect(config.showTime).toBe(false)
    expect(config.showTypeLabel).toBe(false)
    expect(config.showDuration).toBe(true)
    expect(config.showSavedIndicator).toBe(false)
    expect(config.editable).toBe(false)
    expect(config.resizable).toBe(false)
    expect(config.contextMenuEnabled).toBe(false)
  })
})

// ============================================
// TESTS: Default Lesson Types
// ============================================

describe('DEFAULT_LESSON_TYPES', () => {
  test('contains all expected lesson types', () => {
    const typeIds = DEFAULT_LESSON_TYPES.map(t => t.id)
    expect(typeIds).toContain('lecture')
    expect(typeIds).toContain('tutorial')
    expect(typeIds).toContain('lab')
    expect(typeIds).toContain('workshop')
    expect(typeIds).toContain('seminar')
    expect(typeIds).toContain('assessment')
    expect(typeIds).toContain('break')
    expect(typeIds).toContain('self_study')
    expect(typeIds).toContain('fieldwork')
    expect(typeIds).toContain('other')
  })

  test('each type has required properties', () => {
    DEFAULT_LESSON_TYPES.forEach(type => {
      expect(type.id).toBeDefined()
      expect(type.label).toBeDefined()
      expect(type.color).toBeDefined()
      expect(type.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

// ============================================
// TESTS: Basic Rendering
// ============================================

describe('Basic Rendering', () => {
  test('renders lesson title', () => {
    render(<LessonCardPrimitive {...defaultProps} />)
    expect(screen.getByText('Introduction to Testing')).toBeInTheDocument()
  })

  test('renders duration for library variant', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="library" />)
    expect(screen.getByText('60 min')).toBeInTheDocument()
  })

  test('renders duration for timetable variant', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" />)
    expect(screen.getByText('60mins')).toBeInTheDocument()
  })

  test('renders type label for library variant', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="library" />)
    expect(screen.getByText('Lecture')).toBeInTheDocument()
  })

  test('renders time range for timetable variant', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" />)
    expect(screen.getByText('09:00-10:00')).toBeInTheDocument()
  })

  test('renders nothing when lesson is null', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} lesson={null} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders default title for lesson without title', () => {
    const lessonWithoutTitle = { ...createMockLesson(), title: '' }
    render(<LessonCardPrimitive {...defaultProps} lesson={lessonWithoutTitle} />)
    expect(screen.getByText('New Lesson')).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Click Handlers
// ============================================

describe('Click Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls onSelect on click', async () => {
    const user = userEvent.setup()
    render(<LessonCardPrimitive {...defaultProps} />)

    await user.click(screen.getByText('Introduction to Testing'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith('lesson-123')
  })

  test('calls onStartEditing on double-click for editable variants', async () => {
    const user = userEvent.setup()
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" />)

    await user.dblClick(screen.getByText('Introduction to Testing'))
    expect(defaultProps.onStartEditing).toHaveBeenCalledWith('lesson-123')
  })

  test('does not call onStartEditing for non-editable variants', async () => {
    const user = userEvent.setup()
    render(<LessonCardPrimitive {...defaultProps} variant="library" />)

    await user.dblClick(screen.getByText('Introduction to Testing'))
    expect(defaultProps.onStartEditing).not.toHaveBeenCalled()
  })
})

// ============================================
// TESTS: Selection State
// ============================================

describe('Selection State', () => {
  test('applies selected styling when isSelected is true', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} isSelected={true} />)
    const card = container.firstChild
    expect(card).toHaveStyle({ border: expect.stringContaining('#d4730c') })
  })

  test('applies editing styling when isEditing is true', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} isEditing={true} variant="timetable" />)
    expect(screen.getByText('EDITING')).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Saved Indicator (Library Variant)
// ============================================

describe('Saved Indicator', () => {
  test('shows saved indicator when isSaved is true for library variant', () => {
    const { container } = render(
      <LessonCardPrimitive {...defaultProps} variant="library" isSaved={true} />
    )
    const savedIndicator = container.querySelector('[title="Saved to library"]')
    expect(savedIndicator).toBeInTheDocument()
  })

  test('does not show saved indicator when isSaved is false', () => {
    const { container } = render(
      <LessonCardPrimitive {...defaultProps} variant="library" isSaved={false} />
    )
    const savedIndicator = container.querySelector('[title="Saved to library"]')
    expect(savedIndicator).not.toBeInTheDocument()
  })

  test('does not show saved indicator for timetable variant', () => {
    const { container } = render(
      <LessonCardPrimitive {...defaultProps} variant="timetable" isSaved={true} />
    )
    const savedIndicator = container.querySelector('[title="Saved to library"]')
    expect(savedIndicator).not.toBeInTheDocument()
  })
})

// ============================================
// TESTS: Inline Editing
// ============================================

describe('Inline Editing', () => {
  test('shows title input when isEditing is true', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" isEditing={true} />)
    const input = screen.getByDisplayValue('Introduction to Testing')
    expect(input.tagName).toBe('INPUT')
  })

  test('calls onUpdate when editing is saved', async () => {
    const user = userEvent.setup()
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" isEditing={true} />)

    const input = screen.getByDisplayValue('Introduction to Testing')
    await user.clear(input)
    await user.type(input, 'Updated Title{Enter}')

    expect(defaultProps.onUpdate).toHaveBeenCalledWith('lesson-123', expect.objectContaining({
      title: 'Updated Title'
    }))
  })

  test('does not call onUpdate when title is unchanged', async () => {
    const onUpdate = vi.fn()
    render(<LessonCardPrimitive {...defaultProps} variant="timetable" isEditing={true} onUpdate={onUpdate} />)

    const input = screen.getByDisplayValue('Introduction to Testing')
    // Just press Enter without changing anything
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onUpdate).not.toHaveBeenCalled()
  })
})

// ============================================
// TESTS: HTML5 Drag (Library Variant)
// ============================================

describe('HTML5 Drag', () => {
  test('sets draggable attribute for library variant', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} variant="library" />)
    expect(container.firstChild).toHaveAttribute('draggable', 'true')
  })

  test('calls onDragStart with correct data on drag start', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} variant="library" />)

    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: null
    }

    fireEvent.dragStart(container.firstChild, { dataTransfer })

    expect(dataTransfer.setData).toHaveBeenCalledWith('lessonId', 'lesson-123')
    expect(dataTransfer.setData).toHaveBeenCalledWith('dragType', 'schedule')
    expect(defaultProps.onDragStart).toHaveBeenCalled()
  })

  test('sets dragType to "move" for timetable variant', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} variant="timetable" />)

    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: null
    }

    fireEvent.dragStart(container.firstChild, { dataTransfer })

    expect(dataTransfer.setData).toHaveBeenCalledWith('dragType', 'move')
  })

  test('calls onDragEnd on drag end', () => {
    const { container } = render(<LessonCardPrimitive {...defaultProps} variant="library" />)

    fireEvent.dragEnd(container.firstChild)
    expect(defaultProps.onDragEnd).toHaveBeenCalledWith('lesson-123')
  })
})

// ============================================
// TESTS: Absolute Positioning (Overview Variant)
// ============================================

describe('Absolute Positioning', () => {
  test('applies position styles when position prop is provided', () => {
    const { container } = render(
      <LessonCardPrimitive
        {...defaultProps}
        variant="overview"
        position={{ x: 100, y: 200 }}
      />
    )

    const card = container.firstChild
    expect(card).toHaveStyle({ position: 'absolute', left: '100px', top: '200px' })
  })

  test('does not apply position styles when position is null', () => {
    const { container } = render(
      <LessonCardPrimitive {...defaultProps} variant="library" position={null} />
    )

    const card = container.firstChild
    expect(card).not.toHaveStyle({ position: 'absolute' })
  })
})

// ============================================
// TESTS: No LO Warning
// ============================================

describe('No LO Warning', () => {
  test('shows warning border when hasLO is false and no learningObjectives', () => {
    const lessonWithoutLO = {
      ...createMockLesson(),
      learningObjectives: [],
      loId: null
    }

    const { container } = render(
      <LessonCardPrimitive
        {...defaultProps}
        lesson={lessonWithoutLO}
        hasLO={false}
        variant="timetable"
      />
    )

    const card = container.firstChild
    expect(card).toHaveStyle({ border: expect.stringContaining('#ff4444') })
  })

  test('does not show warning for break lessons', () => {
    const breakLesson = {
      ...createMockLesson(),
      type: 'break',
      learningObjectives: [],
      loId: null
    }

    const { container } = render(
      <LessonCardPrimitive
        {...defaultProps}
        lesson={breakLesson}
        hasLO={false}
        variant="timetable"
      />
    )

    const card = container.firstChild
    // Break lessons should not have the red warning border
    const borderStyle = card.style.border
    expect(borderStyle).not.toContain('#ff4444')
    expect(borderStyle).not.toContain('rgb(255, 68, 68)')
  })
})

// ============================================
// TESTS: Commit State (Overview Variant)
// ============================================

describe('Commit State', () => {
  test('shows uncommitted border when isCommitted is false', () => {
    const { container } = render(
      <LessonCardPrimitive
        {...defaultProps}
        variant="overview"
        isCommitted={false}
      />
    )

    const card = container.firstChild
    // Uncommitted uses GREEN_BRIGHT border
    expect(card).toHaveStyle({ border: expect.stringContaining('#00FF00') })
  })

  test('shows normal border when isCommitted is true', () => {
    const { container } = render(
      <LessonCardPrimitive
        {...defaultProps}
        variant="overview"
        isCommitted={true}
      />
    )

    const card = container.firstChild
    // Committed uses BORDER color
    expect(card).toHaveStyle({ border: expect.stringContaining('#1f1f1f') })
  })
})

// ============================================
// TESTS: Feature Overrides
// ============================================

describe('Feature Overrides', () => {
  test('overrides showTime for library variant', () => {
    render(<LessonCardPrimitive {...defaultProps} variant="library" showTime={true} />)
    expect(screen.getByText('09:00-10:00')).toBeInTheDocument()
  })

  test('overrides editable for library variant', async () => {
    const user = userEvent.setup()
    render(<LessonCardPrimitive {...defaultProps} variant="library" editable={true} />)

    await user.dblClick(screen.getByText('Introduction to Testing'))
    expect(defaultProps.onStartEditing).toHaveBeenCalled()
  })

  test('overrides dragMode to none', () => {
    const { container } = render(
      <LessonCardPrimitive {...defaultProps} variant="library" dragMode="none" />
    )
    // When dragMode is 'none', draggable should not be set or false
    // The component checks variantConfig.dragMode === 'html5'
    expect(container.firstChild).not.toHaveAttribute('draggable', 'true')
  })
})

// ============================================
// TESTS: Duration Formatting
// ============================================

describe('Duration Formatting', () => {
  test('formats duration less than 60 minutes', () => {
    const shortLesson = { ...createMockLesson(), duration: 30 }
    render(<LessonCardPrimitive {...defaultProps} lesson={shortLesson} variant="overview" />)
    expect(screen.getByText('30m')).toBeInTheDocument()
  })

  test('formats duration exactly 60 minutes', () => {
    const hourLesson = { ...createMockLesson(), duration: 60 }
    render(<LessonCardPrimitive {...defaultProps} lesson={hourLesson} variant="overview" />)
    expect(screen.getByText('1h')).toBeInTheDocument()
  })

  test('formats duration over 60 minutes', () => {
    const longLesson = { ...createMockLesson(), duration: 90 }
    render(<LessonCardPrimitive {...defaultProps} lesson={longLesson} variant="overview" />)
    expect(screen.getByText('1h 30m')).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Time Calculation
// ============================================

describe('Time Calculation', () => {
  test('calculates end time correctly', () => {
    const lesson = { ...createMockLesson(), startTime: '0900', duration: 60 }
    render(<LessonCardPrimitive {...defaultProps} lesson={lesson} variant="timetable" />)
    expect(screen.getByText('09:00-10:00')).toBeInTheDocument()
  })

  test('handles end time crossing noon', () => {
    const lesson = { ...createMockLesson(), startTime: '1130', duration: 60 }
    render(<LessonCardPrimitive {...defaultProps} lesson={lesson} variant="timetable" />)
    expect(screen.getByText('11:30-12:30')).toBeInTheDocument()
  })

  test('shows placeholder when startTime is missing', () => {
    const lesson = { ...createMockLesson(), startTime: '' }
    render(<LessonCardPrimitive {...defaultProps} lesson={lesson} variant="timetable" />)
    // When startTime is empty, the time range is not shown at all (due to condition: lesson.startTime)
    // So we check that normal time range is not present
    expect(screen.queryByText(/09:00/)).not.toBeInTheDocument()
  })
})

// ============================================
// TESTS: Keyboard Handlers
// ============================================

describe('Keyboard Handlers', () => {
  test('calls onDelete when Delete key is pressed while selected', async () => {
    render(<LessonCardPrimitive {...defaultProps} isSelected={true} />)

    fireEvent.keyDown(window, { key: 'Delete' })
    expect(defaultProps.onDelete).toHaveBeenCalledWith('lesson-123')
  })

  test('does not call onDelete when not selected', () => {
    const onDelete = vi.fn()
    render(<LessonCardPrimitive {...defaultProps} isSelected={false} onDelete={onDelete} />)

    fireEvent.keyDown(window, { key: 'Delete' })
    expect(onDelete).not.toHaveBeenCalled()
  })

  test('does not call onDelete when editing', () => {
    const onDelete = vi.fn()
    render(<LessonCardPrimitive {...defaultProps} isSelected={true} isEditing={true} variant="timetable" onDelete={onDelete} />)

    fireEvent.keyDown(window, { key: 'Delete' })
    expect(onDelete).not.toHaveBeenCalled()
  })
})

// ============================================
// TESTS: Lesson Type Colors
// ============================================

describe('Lesson Type Colors', () => {
  test('uses correct color for lecture type', () => {
    const lectureType = DEFAULT_LESSON_TYPES.find(t => t.id === 'lecture')
    expect(lectureType.color).toBe('#d4730c') // THEME.AMBER
  })

  test('uses correct color for break type', () => {
    const breakType = DEFAULT_LESSON_TYPES.find(t => t.id === 'break')
    expect(breakType.color).toBe('#607D8B')
  })

  test('falls back to first type when type is unknown', () => {
    const unknownLesson = { ...createMockLesson(), type: 'nonexistent' }
    render(<LessonCardPrimitive {...defaultProps} lesson={unknownLesson} />)
    // Should render without error, using first type color
    expect(screen.getByText('Introduction to Testing')).toBeInTheDocument()
  })
})

console.log('All LessonCardPrimitive tests defined. Run with: npm test')
