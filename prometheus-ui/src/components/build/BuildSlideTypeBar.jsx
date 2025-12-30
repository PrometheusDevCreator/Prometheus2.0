/**
 * BuildSlideTypeBar - Slide Type Selection
 *
 * 6 slide types (Correction #2 - no 'subtopic'):
 * - Agenda
 * - Summary
 * - Lesson Title
 * - User Defined 1
 * - User Defined 2
 * - User Defined 3
 */

import { useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign, SLIDE_TYPES } from '../../contexts/DesignContext'

function BuildSlideTypeBar() {
  const {
    lessons,
    buildSelection,
    updateSlideType
  } = useDesign()

  // Get current slide
  const currentLesson = lessons.find(l => l.id === buildSelection.lessonId)
  const currentSlide = currentLesson?.slides?.[buildSelection.slideIndex]
  const currentType = currentSlide?.type || 'lesson_title'

  // Handle type selection
  const handleTypeSelect = useCallback((typeId) => {
    if (buildSelection.lessonId && buildSelection.slideIndex >= 0) {
      updateSlideType(buildSelection.lessonId, buildSelection.slideIndex, typeId)
    }
  }, [buildSelection.lessonId, buildSelection.slideIndex, updateSlideType])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: 'rgba(0, 0, 0, 0.1)'
      }}
    >
      <span
        style={{
          fontSize: '0.7vh',
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_DIM,
          letterSpacing: '0.1vh',
          marginRight: '12px'
        }}
      >
        SLIDE TYPE:
      </span>
      {SLIDE_TYPES.map(type => (
        <button
          key={type.id}
          onClick={() => handleTypeSelect(type.id)}
          disabled={!buildSelection.lessonId}
          style={{
            padding: '4px 12px',
            fontSize: '0.75vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.05vh',
            color: currentType === type.id ? THEME.BG_DARK : THEME.TEXT_SECONDARY,
            background: currentType === type.id ? THEME.AMBER : 'transparent',
            border: `1px solid ${currentType === type.id ? THEME.AMBER : THEME.BORDER}`,
            borderRadius: '4px',
            cursor: buildSelection.lessonId ? 'pointer' : 'not-allowed',
            opacity: buildSelection.lessonId ? 1 : 0.5,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentType !== type.id && buildSelection.lessonId) {
              e.target.style.borderColor = THEME.AMBER
              e.target.style.color = THEME.AMBER
            }
          }}
          onMouseLeave={(e) => {
            if (currentType !== type.id) {
              e.target.style.borderColor = THEME.BORDER
              e.target.style.color = THEME.TEXT_SECONDARY
            }
          }}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}

export default BuildSlideTypeBar
