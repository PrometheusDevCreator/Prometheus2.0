/**
 * Unit Tests for WheelNav Component
 *
 * PHASE 3 - WHEEL NAVIGATION
 *
 * Tests the hierarchy navigation wheel component:
 * - Level navigation (up/down)
 * - Item selection
 * - Keyboard navigation
 * - Breadcrumb display and interaction
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WheelNav, { HIERARCHY_LEVELS } from '../WheelNav'

// ============================================
// TEST FIXTURES
// ============================================

const createMockItems = (count = 3, hasChildren = true) =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    label: `Item ${i + 1}`,
    serial: `1.${i + 1}`,
    hasChildren
  }))

const createMockPath = (levels = 2) =>
  Array.from({ length: levels }, (_, i) => ({
    level: i,
    id: `path-${i}`,
    label: HIERARCHY_LEVELS[i].label,
    serial: i === 0 ? '1' : `1.${i}`
  }))

const defaultProps = {
  currentLevel: 0,
  currentPath: [],
  items: createMockItems(),
  selectedItemId: null,
  onSelectItem: vi.fn(),
  onNavigateUp: vi.fn(),
  onNavigateDown: vi.fn(),
  onNavigateToLevel: vi.fn(),
  onBreadcrumbClick: vi.fn()
}

// ============================================
// TESTS: Hierarchy Levels Configuration
// ============================================

describe('HIERARCHY_LEVELS', () => {
  test('contains 5 hierarchy levels', () => {
    expect(HIERARCHY_LEVELS).toHaveLength(5)
  })

  test('has correct level order', () => {
    const ids = HIERARCHY_LEVELS.map(l => l.id)
    expect(ids).toEqual(['module', 'lo', 'topic', 'subtopic', 'lesson'])
  })

  test('each level has required properties', () => {
    HIERARCHY_LEVELS.forEach(level => {
      expect(level.id).toBeDefined()
      expect(level.label).toBeDefined()
      expect(level.plural).toBeDefined()
      expect(level.color).toBeDefined()
    })
  })
})

// ============================================
// TESTS: Basic Rendering
// ============================================

describe('Basic Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders without crashing', () => {
    render(<WheelNav {...defaultProps} />)
    expect(screen.getByRole('navigation', { name: /course hierarchy/i })).toBeInTheDocument()
  })

  test('renders current level indicator', () => {
    render(<WheelNav {...defaultProps} currentLevel={0} />)
    expect(screen.getByText('MODULE')).toBeInTheDocument()
  })

  test('renders different level names', () => {
    const { rerender } = render(<WheelNav {...defaultProps} currentLevel={1} />)
    expect(screen.getByText('LO')).toBeInTheDocument()

    rerender(<WheelNav {...defaultProps} currentLevel={2} />)
    expect(screen.getByText('TOPIC')).toBeInTheDocument()

    rerender(<WheelNav {...defaultProps} currentLevel={3} />)
    expect(screen.getByText('SUBTOPIC')).toBeInTheDocument()

    rerender(<WheelNav {...defaultProps} currentLevel={4} />)
    expect(screen.getByText('LESSON')).toBeInTheDocument()
  })

  test('renders item count', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(5)} />)
    expect(screen.getByText('5 MODULES')).toBeInTheDocument()
  })

  test('renders singular item count', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(1)} />)
    expect(screen.getByText('1 MODULE')).toBeInTheDocument()
  })

  test('renders empty state message', () => {
    render(<WheelNav {...defaultProps} items={[]} />)
    expect(screen.getByText(/no items at this level/i)).toBeInTheDocument()
  })

  test('renders all items as buttons when count <= 5', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(3)} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Breadcrumbs
// ============================================

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders breadcrumb path', () => {
    render(<WheelNav {...defaultProps} currentPath={createMockPath(2)} />)
    // Check for breadcrumb navigation element with proper content
    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumbNav).toBeInTheDocument()
    // Check it contains the path segments
    expect(breadcrumbNav).toHaveTextContent(/MODULE/)
    expect(breadcrumbNav).toHaveTextContent(/LO/)
  })

  test('renders breadcrumb separators', () => {
    render(<WheelNav {...defaultProps} currentPath={createMockPath(3)} />)
    const separators = screen.getAllByText('>')
    expect(separators.length).toBeGreaterThan(0)
  })

  test('calls onBreadcrumbClick when breadcrumb is clicked', async () => {
    const user = userEvent.setup()
    const onBreadcrumbClick = vi.fn()
    render(
      <WheelNav
        {...defaultProps}
        currentPath={createMockPath(3)}
        onBreadcrumbClick={onBreadcrumbClick}
      />
    )

    // Click the first breadcrumb (MODULE)
    await user.click(screen.getByRole('button', { name: /module/i }))
    expect(onBreadcrumbClick).toHaveBeenCalledWith(0)
  })

  test('does not render breadcrumbs when path is empty', () => {
    render(<WheelNav {...defaultProps} currentPath={[]} />)
    expect(screen.queryByText('>')).not.toBeInTheDocument()
  })

  test('hides breadcrumbs when showBreadcrumbs is false', () => {
    render(
      <WheelNav
        {...defaultProps}
        currentPath={createMockPath(2)}
        showBreadcrumbs={false}
      />
    )
    // Breadcrumb navigation should not exist
    const breadcrumbNav = screen.queryByRole('navigation', { name: /breadcrumb/i })
    expect(breadcrumbNav).not.toBeInTheDocument()
  })
})

// ============================================
// TESTS: Item Selection
// ============================================

describe('Item Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('calls onSelectItem when item is clicked', async () => {
    const user = userEvent.setup()
    const onSelectItem = vi.fn()
    render(<WheelNav {...defaultProps} onSelectItem={onSelectItem} />)

    await user.click(screen.getByText('Item 1'))
    expect(onSelectItem).toHaveBeenCalledWith('item-1')
  })

  test('highlights selected item', () => {
    render(<WheelNav {...defaultProps} selectedItemId="item-2" />)
    const item2Button = screen.getByRole('option', { selected: true })
    expect(item2Button).toHaveTextContent('Item 2')
  })

  test('calls onNavigateDown on double-click when item has children', async () => {
    const user = userEvent.setup()
    const onNavigateDown = vi.fn()
    render(
      <WheelNav
        {...defaultProps}
        items={createMockItems(3, true)}
        onNavigateDown={onNavigateDown}
      />
    )

    await user.dblClick(screen.getByText('Item 1'))
    expect(onNavigateDown).toHaveBeenCalledWith('item-1')
  })

  test('does not call onNavigateDown on double-click when item has no children', async () => {
    const user = userEvent.setup()
    const onNavigateDown = vi.fn()
    render(
      <WheelNav
        {...defaultProps}
        items={createMockItems(3, false)}
        onNavigateDown={onNavigateDown}
      />
    )

    await user.dblClick(screen.getByText('Item 1'))
    expect(onNavigateDown).not.toHaveBeenCalled()
  })
})

// ============================================
// TESTS: Navigation Controls
// ============================================

describe('Navigation Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('BACK button is disabled at root level', () => {
    render(<WheelNav {...defaultProps} currentLevel={0} />)
    const backButton = screen.getByRole('button', { name: /back/i })
    expect(backButton).toBeDisabled()
  })

  test('BACK button is enabled when not at root', () => {
    render(<WheelNav {...defaultProps} currentLevel={1} />)
    const backButton = screen.getByRole('button', { name: /back/i })
    expect(backButton).not.toBeDisabled()
  })

  test('calls onNavigateUp when BACK button is clicked', async () => {
    const user = userEvent.setup()
    const onNavigateUp = vi.fn()
    render(<WheelNav {...defaultProps} currentLevel={1} onNavigateUp={onNavigateUp} />)

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onNavigateUp).toHaveBeenCalled()
  })

  test('DRILL button is disabled when no item is selected', () => {
    render(<WheelNav {...defaultProps} selectedItemId={null} />)
    const drillButton = screen.getByRole('button', { name: /drill/i })
    expect(drillButton).toBeDisabled()
  })

  test('DRILL button is enabled when item with children is selected', () => {
    render(
      <WheelNav
        {...defaultProps}
        items={createMockItems(3, true)}
        selectedItemId="item-1"
      />
    )
    const drillButton = screen.getByRole('button', { name: /drill/i })
    expect(drillButton).not.toBeDisabled()
  })

  test('calls onNavigateDown when DRILL button is clicked', async () => {
    const user = userEvent.setup()
    const onNavigateDown = vi.fn()
    render(
      <WheelNav
        {...defaultProps}
        items={createMockItems(3, true)}
        selectedItemId="item-1"
        onNavigateDown={onNavigateDown}
      />
    )

    await user.click(screen.getByRole('button', { name: /drill/i }))
    expect(onNavigateDown).toHaveBeenCalledWith('item-1')
  })
})

// ============================================
// TESTS: Keyboard Navigation
// ============================================

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('ArrowUp calls onNavigateUp when not at root', () => {
    const onNavigateUp = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} currentLevel={1} onNavigateUp={onNavigateUp} />
    )

    // Focus the container
    container.firstChild.focus()
    fireEvent.keyDown(window, { key: 'ArrowUp' })

    expect(onNavigateUp).toHaveBeenCalled()
  })

  test('ArrowUp does nothing at root level', () => {
    const onNavigateUp = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} currentLevel={0} onNavigateUp={onNavigateUp} />
    )

    container.firstChild.focus()
    fireEvent.keyDown(window, { key: 'ArrowUp' })

    expect(onNavigateUp).not.toHaveBeenCalled()
  })

  test('ArrowDown calls onNavigateDown with selected item', () => {
    const onNavigateDown = vi.fn()
    const { container } = render(
      <WheelNav
        {...defaultProps}
        items={createMockItems(3, true)}
        selectedItemId="item-1"
        onNavigateDown={onNavigateDown}
      />
    )

    container.firstChild.focus()
    fireEvent.keyDown(window, { key: 'ArrowDown' })

    expect(onNavigateDown).toHaveBeenCalledWith('item-1')
  })

  test('Enter selects focused item', () => {
    const onSelectItem = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} onSelectItem={onSelectItem} />
    )

    container.firstChild.focus()
    // First item should be focused by default
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith('item-1')
  })

  test('Space selects focused item', () => {
    const onSelectItem = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} onSelectItem={onSelectItem} />
    )

    container.firstChild.focus()
    fireEvent.keyDown(window, { key: ' ' })

    expect(onSelectItem).toHaveBeenCalledWith('item-1')
  })

  test('Escape navigates to root level', () => {
    const onNavigateToLevel = vi.fn()
    const { container } = render(
      <WheelNav
        {...defaultProps}
        currentLevel={2}
        onNavigateToLevel={onNavigateToLevel}
      />
    )

    container.firstChild.focus()
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onNavigateToLevel).toHaveBeenCalledWith(0)
  })

  test('Home moves focus to first item', () => {
    const onSelectItem = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} items={createMockItems(5)} onSelectItem={onSelectItem} />
    )

    container.firstChild.focus()
    // Move focus right a few times
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // Go home
    fireEvent.keyDown(window, { key: 'Home' })
    // Select
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith('item-1')
  })

  test('End moves focus to last item', () => {
    const onSelectItem = vi.fn()
    const { container } = render(
      <WheelNav {...defaultProps} items={createMockItems(5)} onSelectItem={onSelectItem} />
    )

    container.firstChild.focus()
    // Go to end
    fireEvent.keyDown(window, { key: 'End' })
    // Select
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(onSelectItem).toHaveBeenCalledWith('item-5')
  })
})

// ============================================
// TESTS: Compact Mode
// ============================================

describe('Compact Mode', () => {
  test('renders in compact mode', () => {
    render(<WheelNav {...defaultProps} compact={true} />)
    expect(screen.getByRole('navigation', { name: /course hierarchy/i })).toBeInTheDocument()
  })

  test('renders items in compact mode', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(3)} compact={true} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Display Options
// ============================================

describe('Display Options', () => {
  test('hides level indicator when showLevelIndicator is false', () => {
    render(<WheelNav {...defaultProps} showLevelIndicator={false} />)
    // Level indicator has up/down arrows and level badge
    expect(screen.queryByText('▲')).not.toBeInTheDocument()
  })

  test('hides item count when showItemCount is false', () => {
    render(<WheelNav {...defaultProps} showItemCount={false} />)
    expect(screen.queryByText(/3 modules/i)).not.toBeInTheDocument()
  })
})

// ============================================
// TESTS: Serial Numbers
// ============================================

describe('Serial Numbers', () => {
  test('displays item serial numbers', () => {
    render(<WheelNav {...defaultProps} />)
    expect(screen.getByText('1.1')).toBeInTheDocument()
    expect(screen.getByText('1.2')).toBeInTheDocument()
    expect(screen.getByText('1.3')).toBeInTheDocument()
  })

  test('displays breadcrumb serials', () => {
    const pathWithSerials = [
      { level: 0, id: 'mod-1', label: 'Module 1', serial: '1' },
      { level: 1, id: 'lo-1', label: 'LO 1', serial: '1.2' }
    ]
    render(<WheelNav {...defaultProps} currentPath={pathWithSerials} />)
    expect(screen.getByText(/1 Module 1/)).toBeInTheDocument()
    expect(screen.getByText(/1\.2 LO 1/)).toBeInTheDocument()
  })
})

// ============================================
// TESTS: Children Indicator
// ============================================

describe('Children Indicator', () => {
  test('shows children indicator for items with hasChildren', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(3, true)} />)
    const indicators = screen.getAllByText('▸')
    expect(indicators.length).toBeGreaterThan(0)
  })

  test('does not show children indicator for items without children', () => {
    render(<WheelNav {...defaultProps} items={createMockItems(3, false)} />)
    expect(screen.queryByText('▸')).not.toBeInTheDocument()
  })
})

console.log('All WheelNav tests defined. Run with: npm test')
