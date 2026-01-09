/**
 * OverviewHeader - Course Information Display for OVERVIEW Tab
 *
 * Layout (3 columns):
 * - DESCRIPTION (25% width, reduced by ~50%)
 * - ADD COURSE ELEMENT (center, buttons for TERM/MODULE/WEEK/DAY)
 * - LEARNING OBJECTIVES (30% width)
 */

import { useState } from 'react'
import { THEME } from '../../../constants/theme'

// Block type colors (matching LearningBlock/CourseLine)
const BLOCK_TYPES = {
  TERM: { color: '#e8a33a' },
  MODULE: { color: '#d4730c' },
  WEEK: { color: '#8B4513' },
  DAY: { color: '#5a3000' }
}

/**
 * CourseElementButton - Individual button for adding course elements
 *
 * Styling: Burnt orange border and text (solid color, no gradient)
 * Hover: Changes to luminous green
 */
function CourseElementButton({ type, onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '0.6vh 1vw',
        fontSize: '1.25vh',
        fontFamily: THEME.FONT_PRIMARY,
        letterSpacing: '0.05em',
        color: isHovered ? THEME.GREEN_BRIGHT : THEME.AMBER,
        background: 'transparent',
        border: `1px solid ${isHovered ? THEME.GREEN_BRIGHT : THEME.AMBER}`,
        borderRadius: '1.5vh',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      +{type}
    </button>
  )
}

function OverviewHeader({
  courseData = {},
  onUpdateDescription,
  onUpdateObjectives,
  onAddBlock  // Callback to add course elements (TERM, MODULE, WEEK, DAY)
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
      <div style={{ display: 'flex', gap: '2vw', alignItems: 'flex-start' }}>
        {/* Column 1: Description (reduced to ~25% width) */}
        <div style={{ width: '25%', flexShrink: 0 }}>
          <label
            style={{
              fontSize: '1.375vh',  // Increased from 1.1vh (+25%)
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
                fontSize: '1.5vh',  // Increased from 1.2vh (+25%)
                color: THEME.WHITE,
                background: THEME.BG_INPUT,
                border: `1px solid ${THEME.AMBER}`,
                borderRadius: '1.5vh',  // Match action button style
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
                fontSize: '1.5vh',  // Increased from 1.2vh (+25%)
                color: THEME.TEXT_SECONDARY,
                margin: 0,
                padding: '0.8vh 1vw',
                background: THEME.BG_INPUT,
                borderRadius: '1.5vh',  // Match action button style
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

        {/* Column 2: Add Course Element (center) - fully centered horizontally */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <label
            style={{
              fontSize: '1.375vh',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.15em',
              color: THEME.WHITE,
              display: 'block',
              marginBottom: '0.5vh',
              textAlign: 'center',
              width: '100%'
            }}
          >
            ADD COURSE ELEMENT
          </label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1vw', width: '100%' }}>
            {['TERM', 'MODULE', 'WEEK', 'DAY'].map((type) => (
              <CourseElementButton
                key={type}
                type={type}
                onClick={() => onAddBlock?.(type)}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Learning Objectives Summary */}
        <div style={{ width: '30%', flexShrink: 0 }}>
          <label
            style={{
              fontSize: '1.375vh',  // Increased from 1.1vh (+25%)
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.15em',
              color: THEME.AMBER,
              display: 'block',
              marginBottom: '0.5vh'
            }}
          >
            LEARNING OBJECTIVES ({courseData.learningObjectives?.filter(lo => lo.trim()).length || 0})
          </label>
          <div
            style={{
              padding: '0.8vh 1vw',
              background: THEME.BG_INPUT,
              borderRadius: '1.5vh',  // Match action button style
              minHeight: '6vh',
              maxHeight: '10vh',
              overflowY: 'auto'
            }}
          >
            {courseData.learningObjectives?.filter(lo => lo.trim()).map((lo, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '1.25vh',  // Increased from 1vh (+25%)
                  fontFamily: THEME.FONT_PRIMARY,
                  color: THEME.TEXT_SECONDARY,
                  marginBottom: '0.3vh',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5vw'
                }}
              >
                <span style={{ color: THEME.GREEN_BRIGHT, fontWeight: 600 }}>{idx + 1}.</span>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {lo}
                </span>
              </div>
            ))}
            {(!courseData.learningObjectives || courseData.learningObjectives.filter(lo => lo.trim()).length === 0) && (
              <span style={{ fontSize: '1.25vh', color: THEME.TEXT_DIM }}>
                No learning objectives defined
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewHeader
