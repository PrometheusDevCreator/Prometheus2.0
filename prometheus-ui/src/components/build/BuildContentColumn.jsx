/**
 * BuildContentColumn - Single Content Column
 *
 * Features:
 * - Subtopic dropdown selector
 * - Slide content text area
 * - Instructor Notes field (Correction #7: labeled "Instructor Notes" with tooltip)
 * - Keep/Erase buttons (Correction #5: UI actions only)
 *
 * Columns 4-5 are de-emphasized (opacity 0.6, narrower)
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function BuildContentColumn({
  columnIndex,
  isPrimary = true // Columns 0-2 are primary, 3-4 are optional
}) {
  const {
    lessons,
    buildSelection,
    getLessonSubtopics,
    updateSlideContentBlock,
    eraseSlideContentBlock,
    updateSlideInstructorNotes
  } = useDesign()

  const [showNotesTooltip, setShowNotesTooltip] = useState(false)

  // Get current slide data
  const currentLesson = lessons.find(l => l.id === buildSelection.lessonId)
  const currentSlide = currentLesson?.slides?.[buildSelection.slideIndex]
  const contentBlock = currentSlide?.contentBlocks?.[columnIndex] || { subtopicId: null, text: '' }

  // Get subtopics for dropdown
  const subtopics = buildSelection.lessonId ? getLessonSubtopics(buildSelection.lessonId) : []

  // Handle subtopic change
  const handleSubtopicChange = useCallback((subtopicId) => {
    if (buildSelection.lessonId) {
      updateSlideContentBlock(
        buildSelection.lessonId,
        buildSelection.slideIndex,
        columnIndex,
        { subtopicId: subtopicId || null }
      )
    }
  }, [buildSelection.lessonId, buildSelection.slideIndex, columnIndex, updateSlideContentBlock])

  // Handle content change
  const handleContentChange = useCallback((text) => {
    if (buildSelection.lessonId) {
      updateSlideContentBlock(
        buildSelection.lessonId,
        buildSelection.slideIndex,
        columnIndex,
        { text }
      )
    }
  }, [buildSelection.lessonId, buildSelection.slideIndex, columnIndex, updateSlideContentBlock])

  // Handle instructor notes change (only on column 0)
  const handleNotesChange = useCallback((notes) => {
    if (buildSelection.lessonId) {
      updateSlideInstructorNotes(
        buildSelection.lessonId,
        buildSelection.slideIndex,
        notes
      )
    }
  }, [buildSelection.lessonId, buildSelection.slideIndex, updateSlideInstructorNotes])

  // Handle erase (Correction #5: sets text = "")
  const handleErase = useCallback(() => {
    if (buildSelection.lessonId) {
      eraseSlideContentBlock(
        buildSelection.lessonId,
        buildSelection.slideIndex,
        columnIndex
      )
    }
  }, [buildSelection.lessonId, buildSelection.slideIndex, columnIndex, eraseSlideContentBlock])

  // Keep is a no-op per Correction #5
  const handleKeep = useCallback(() => {
    // No-op - content remains as is
  }, [])

  const isDisabled = !buildSelection.lessonId || !currentSlide

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '8px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${THEME.BORDER}`,
        borderRadius: '1.85vh',  // Match action button style
        opacity: isPrimary ? 1 : 0.6,
        flex: isPrimary ? 1 : 0.8,
        minWidth: isPrimary ? '180px' : '140px'
      }}
    >
      {/* Column Header */}
      <div
        style={{
          fontSize: '1.09vh',  // Was 0.875vh, +25% again
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_DIM,
          letterSpacing: '0.1vh',
          textAlign: 'center',
          borderBottom: `1px solid ${THEME.BORDER}`,
          paddingBottom: '4px'
        }}
      >
        {isPrimary ? `COLUMN ${columnIndex + 1}` : `OPT ${columnIndex - 2}`}
      </div>

      {/* Subtopic Selector */}
      <select
        value={contentBlock.subtopicId || ''}
        onChange={(e) => handleSubtopicChange(e.target.value)}
        disabled={isDisabled}
        style={{
          padding: '4px 8px',
          fontSize: '1.175vh',  // Was 0.94vh, +25% again
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.TEXT_PRIMARY,
          background: THEME.BG_DARK,
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '1vh',  // Proportional inner border-radius
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1
        }}
      >
        <option value="">Select Subtopic</option>
        {subtopics.map(s => (
          <option key={s.id} value={s.id}>
            {s.number ? `${s.number} - ` : ''}{s.title}
          </option>
        ))}
      </select>

      {/* Content Text Area */}
      <textarea
        value={contentBlock.text || ''}
        onChange={(e) => handleContentChange(e.target.value)}
        disabled={isDisabled}
        placeholder="Enter slide content..."
        style={{
          flex: 1,
          minHeight: '120px',
          padding: '8px',
          fontSize: '1.25vh',  // Was 1vh, +25% again
          fontFamily: THEME.FONT_PRIMARY,
          color: THEME.TEXT_PRIMARY,
          background: THEME.BG_DARK,
          border: `1px solid ${THEME.BORDER}`,
          borderRadius: '1.5vh',  // Match action button style
          resize: 'vertical',
          outline: 'none',
          cursor: isDisabled ? 'not-allowed' : 'text',
          opacity: isDisabled ? 0.5 : 1
        }}
        onFocus={(e) => {
          if (!isDisabled) {
            e.target.style.borderColor = THEME.GREEN_BRIGHT
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = THEME.BORDER
        }}
      />

      {/* Instructor Notes (only on column 0) */}
      {columnIndex === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative'
            }}
          >
            <span
              style={{
                fontSize: '1.01vh',  // Was 0.81vh, +25% again
                fontFamily: THEME.FONT_MONO,
                color: THEME.TEXT_DIM,
                letterSpacing: '0.05vh'
              }}
            >
              INSTRUCTOR NOTES
            </span>
            <span
              style={{
                fontSize: '1.09vh',  // Was 0.875vh, +25% again
                color: THEME.TEXT_MUTED,
                cursor: 'help',
                position: 'relative'
              }}
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
            >
              (?)
              {showNotesTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 8px',
                    fontSize: '1.01vh',  // Was 0.81vh, +25% again
                    fontFamily: THEME.FONT_PRIMARY,
                    color: THEME.TEXT_PRIMARY,
                    background: THEME.BG_DARK,
                    border: `1px solid ${THEME.BORDER}`,
                    borderRadius: '1vh',  // Proportional inner border-radius
                    whiteSpace: 'nowrap',
                    zIndex: 100
                  }}
                >
                  Not shown on slides
                </div>
              )}
            </span>
          </div>
          <textarea
            value={currentSlide?.instructorNotes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={isDisabled}
            placeholder="Notes for instructor..."
            style={{
              minHeight: '60px',
              padding: '6px',
              fontSize: '1.175vh',  // Was 0.94vh, +25% again
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.AMBER,
              background: 'rgba(212, 115, 12, 0.1)',
              border: `1px solid ${THEME.AMBER_DARK}`,
              borderRadius: '1.5vh',  // Match action button style
              resize: 'vertical',
              outline: 'none',
              cursor: isDisabled ? 'not-allowed' : 'text',
              opacity: isDisabled ? 0.5 : 1
            }}
            onFocus={(e) => {
              if (!isDisabled) {
                e.target.style.borderColor = THEME.AMBER
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = THEME.AMBER_DARK
            }}
          />
        </div>
      )}

      {/* Keep/Erase Actions (Correction #5: UI actions only) */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'flex-end',
          marginTop: '4px'
        }}
      >
        <button
          onClick={handleKeep}
          disabled={isDisabled}
          style={{
            padding: '2px 8px',
            fontSize: '1.01vh',  // Was 0.81vh, +25% again
            fontFamily: THEME.FONT_MONO,
            color: THEME.TEXT_DIM,
            background: 'transparent',
            border: `1px solid ${THEME.BORDER}`,
            borderRadius: '1vh',  // Proportional inner border-radius
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.3 : 0.7,
            transition: 'all 0.2s ease'
          }}
          title="Keep content (no action)"
        >
          KEEP
        </button>
        <button
          onClick={handleErase}
          disabled={isDisabled}
          style={{
            padding: '2px 8px',
            fontSize: '1.01vh',  // Was 0.81vh, +25% again
            fontFamily: THEME.FONT_MONO,
            color: '#ff6666',
            background: 'transparent',
            border: `1px solid #ff666666`,
            borderRadius: '1vh',  // Proportional inner border-radius
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.3 : 0.7,
            transition: 'all 0.2s ease'
          }}
          title="Erase content"
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.target.style.background = '#ff6666'
              e.target.style.color = THEME.BG_DARK
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = '#ff6666'
          }}
        >
          ERASE
        </button>
      </div>
    </div>
  )
}

export default BuildContentColumn
