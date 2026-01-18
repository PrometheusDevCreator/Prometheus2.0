/**
 * TabSelector.jsx - Tab Navigation for DESIGN Section
 *
 * Phase 2-6: Calm Wheel Design/Build Integration
 *
 * Displays 3 lozenge buttons for tab selection:
 * - OVERVIEW
 * - TIMETABLE (centered on UI centerline)
 * - SCALAR
 *
 * Styling:
 * - Default: Dark grey background, grey text
 * - Hover/Selected: Luminous green border and text
 * - Size matches DELETE/CLEAR/SAVE action buttons
 */

import { useState } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'timetable', label: 'TIMETABLE' },
  { id: 'scalar', label: 'SCALAR' }
]

function TabButton({ id, label, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  const isHighlighted = isActive || isHovered

  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '1.3vh 1.88vw',
        fontSize: '1.39vh',
        fontFamily: THEME.FONT_PRIMARY,
        fontWeight: 500,
        letterSpacing: '0.1em',
        color: isHighlighted ? THEME.GREEN_BRIGHT : THEME.TEXT_SECONDARY,
        background: THEME.BG_PANEL,
        border: `1px solid ${isHighlighted ? THEME.GREEN_BRIGHT : 'transparent'}`,
        borderRadius: '1.85vh',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textTransform: 'uppercase',
        minWidth: '8vw'
      }}
    >
      {label}
    </button>
  )
}

function TabSelector() {
  const { activeTab, setActiveTab } = useDesign()

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5vw',
        padding: '1vh 0',
        background: THEME.BG_DARK,
        borderBottom: `1px solid ${THEME.BORDER}`
      }}
    >
      {TABS.map((tab) => (
        <TabButton
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onClick={handleTabClick}
        />
      ))}
    </div>
  )
}

export default TabSelector
