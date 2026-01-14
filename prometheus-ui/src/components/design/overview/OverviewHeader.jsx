/**
 * OverviewHeader - DESCRIPTION Panel for OVERVIEW Tab
 *
 * Simplified layout - just DESCRIPTION window
 * Grey line (borderBottom) preserved per design spec.
 *
 * Timeline and Note elements are now in PlanningCanvas.
 */

import { useState } from 'react'
import { THEME } from '../../../constants/theme'

function OverviewHeader({
  courseData = {},
  onUpdateDescription
}) {
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editedDesc, setEditedDesc] = useState(courseData.description || '')

  const handleDescBlur = () => {
    setIsEditingDesc(false)
    if (editedDesc !== courseData.description) {
      onUpdateDescription?.(editedDesc)
    }
  }

  return (
    <div
      style={{
        padding: '1vh 2vw',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_DARK
      }}
    >
      {/* DESCRIPTION Window Only */}
      <div style={{ width: '25%' }}>
        <label
          style={{
            fontSize: '1.375vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.15em',
            color: THEME.AMBER,
            display: 'block',
            marginBottom: '0.5vh'
          }}
        >
          DESCRIPTION
        </label>
        {isEditingDesc ? (
          <textarea
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            onBlur={handleDescBlur}
            autoFocus
            style={{
              width: '100%',
              minHeight: '6vh',
              padding: '0.8vh 1vw',
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.5vh',
              color: THEME.WHITE,
              background: THEME.BG_INPUT,
              border: `1px solid ${THEME.AMBER}`,
              borderRadius: '1.5vh',
              resize: 'vertical'
            }}
          />
        ) : (
          <p
            onClick={() => {
              setEditedDesc(courseData.description || '')
              setIsEditingDesc(true)
            }}
            style={{
              fontFamily: THEME.FONT_PRIMARY,
              fontSize: '1.5vh',
              color: THEME.TEXT_SECONDARY,
              margin: 0,
              padding: '0.8vh 1vw',
              background: THEME.BG_INPUT,
              borderRadius: '1.5vh',
              minHeight: '6vh',
              cursor: 'text',
              border: `1px solid transparent`,
              transition: 'border-color 0.2s ease'
            }}
          >
            {courseData.description || 'Click to add description...'}
          </p>
        )}
      </div>
    </div>
  )
}

export default OverviewHeader
