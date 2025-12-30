/**
 * OverviewHeader - Course Information Display for OVERVIEW Tab
 *
 * Displays:
 * - Course title in luminous green (#00FF00)
 * - Course description (editable)
 * - Learning Objectives list (editable)
 */

import { useState } from 'react'
import { THEME } from '../../../constants/theme'

function OverviewHeader({
  courseData = {},
  onUpdateDescription,
  onUpdateObjectives
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
        padding: '1.5vh 2vw',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_PANEL
      }}
    >
      {/* Course Title - Luminous Green (glow removed per request) */}
      <h2
        style={{
          fontFamily: THEME.FONT_PRIMARY,
          fontSize: '2.75vh',  // Increased from 2.2vh (+25%)
          fontWeight: 600,
          color: THEME.GREEN_BRIGHT,
          letterSpacing: '0.1em',
          margin: 0,
          marginBottom: '1vh'
          // textShadow removed per request
        }}
      >
        {courseData.title || 'UNTITLED COURSE'}
      </h2>

      <div style={{ display: 'flex', gap: '2vw' }}>
        {/* Description */}
        <div style={{ flex: 1 }}>
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

        {/* Learning Objectives Summary */}
        <div style={{ width: '30%' }}>
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
