/**
 * OutputNode.jsx - Radial Output Type Node
 *
 * FORMAT Page Component
 *
 * Displays:
 * - Output type icon
 * - Status indicator (CORRECTION #6: computed from TemplateSpec only)
 * - Hover/selection states
 *
 * Status Colors:
 * - none (grey): No template uploaded
 * - loaded (amber): Template uploaded, not mapped
 * - mapped (green): Template mapped
 */

import { THEME } from '../../constants/theme'

// Icons for each output type (simple SVG paths)
const OUTPUT_ICONS = {
  presentation: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  timetable: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="9" y1="4" x2="9" y2="22" />
      <line x1="15" y1="4" x2="15" y2="22" />
      <line x1="3" y1="16" x2="21" y2="16" />
    </svg>
  ),
  lesson_plan: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  ),
  qa_form: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}

function OutputNode({
  type,
  label,
  status = 'none',
  isSelected = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style = {}
}) {
  // CORRECTION #6: Status colors computed from TemplateSpec state only
  const getStatusColor = () => {
    switch (status) {
      case 'mapped': return THEME.GREEN_BRIGHT
      case 'loaded': return THEME.AMBER
      case 'none':
      default: return '#666666'
    }
  }

  // Border and glow based on selection/hover state
  const getBorderColor = () => {
    if (isSelected) return THEME.AMBER
    if (isHovered) return THEME.AMBER
    return THEME.AMBER_DARK
  }

  const getGlowStyle = () => {
    if (isSelected) {
      return `0 0 20px ${THEME.AMBER}60, 0 0 40px ${THEME.AMBER}30`
    }
    if (isHovered) {
      return `0 0 15px ${THEME.AMBER}40`
    }
    return 'none'
  }

  const statusColor = getStatusColor()
  const borderColor = getBorderColor()
  const glowStyle = getGlowStyle()

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        ...style,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${THEME.BG_PANEL || '#1a1a1a'} 0%, ${THEME.BG_DARK} 100%)`,
        border: `2px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: glowStyle
      }}
    >
      {/* Icon */}
      <div
        style={{
          color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_DIM,
          transition: 'color 0.2s ease'
        }}
      >
        {OUTPUT_ICONS[type]}
      </div>

      {/* Status dot */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          right: 6,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: statusColor,
          boxShadow: status !== 'none' ? `0 0 6px ${statusColor}` : 'none'
        }}
      />

      {/* Label (positioned below node) */}
      <div
        style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '9px',
          letterSpacing: '1px',
          color: isSelected || isHovered ? THEME.AMBER : THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY,
          transition: 'color 0.2s ease'
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default OutputNode
