/**
 * LessonEditorLozenge - Lesson Editor Button
 *
 * Lozenge/pill-shaped button that opens the Lesson Editor modal.
 * Positioned between < and > navigation arrows in the Footer.
 *
 * Styling:
 * - Font size: 1.18vh (15% smaller than PKE placeholder)
 * - Font color: White
 * - Border: Burnt orange
 * - Shape: Pill/lozenge with border-radius
 * - Orange glow on hover/selection
 */

import { useState } from 'react'
import { THEME } from '../constants/theme'

function LessonEditorLozenge({
  isActive = false,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Show glow on hover or when active
  const showGlow = isHovered || isActive

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isActive ? 'rgba(212, 115, 12, 0.15)' : 'transparent',
        border: `1px solid ${THEME.AMBER}`, // Always burnt orange border
        borderRadius: '1.57vh', // 15% smaller (was 1.85vh)
        padding: '0.6vh 1.5vw', // 15% smaller height (was 0.7vh)
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        // Orange glow on hover/selection
        boxShadow: showGlow ? `0 0 12px ${THEME.AMBER}60, 0 0 4px ${THEME.AMBER}40` : 'none'
      }}
    >
      <span
        style={{
          fontSize: '1.18vh', // 15% smaller (was 1.39vh)
          letterSpacing: '0.16vw', // 3px @ 1920
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.WHITE,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}
      >
        Lesson Editor
      </span>
    </button>
  )
}

export default LessonEditorLozenge
