/**
 * BuildSlideNav - Slide Navigation Controls
 *
 * Features (per Correction #1):
 * - Left/Right arrows (navigate existing slides only, no auto-create)
 * - Slide counter (e.g., "1/3")
 * - "+ New Slide" button (explicit creation only)
 * - "Duplicate" button
 * - Visual indicator for populated slides
 */

import { useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function BuildSlideNav() {
  const {
    lessons,
    buildSelection,
    setBuildSelection,
    addSlideToLesson,
    duplicateSlide
  } = useDesign()

  // Get current lesson and slides
  const currentLesson = lessons.find(l => l.id === buildSelection.lessonId)
  const slides = currentLesson?.slides || []
  const slideCount = slides.length
  const currentIndex = buildSelection.slideIndex

  // Check if slide has content (for populated indicator)
  const isSlidePopulated = useCallback((slide) => {
    if (!slide) return false
    const hasContent = slide.contentBlocks?.some(b => b.text?.trim())
    const hasNotes = slide.instructorNotes?.trim()
    return hasContent || hasNotes
  }, [])

  // Navigate to previous slide
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setBuildSelection(prev => ({
        ...prev,
        slideIndex: prev.slideIndex - 1
      }))
    }
  }, [currentIndex, setBuildSelection])

  // Navigate to next slide (no auto-create per Correction #1)
  const handleNext = useCallback(() => {
    if (currentIndex < slideCount - 1) {
      setBuildSelection(prev => ({
        ...prev,
        slideIndex: prev.slideIndex + 1
      }))
    }
  }, [currentIndex, slideCount, setBuildSelection])

  // Create new slide (explicit action per Correction #1)
  const handleNewSlide = useCallback(() => {
    if (buildSelection.lessonId) {
      addSlideToLesson(buildSelection.lessonId)
      // Navigate to new slide
      setBuildSelection(prev => ({
        ...prev,
        slideIndex: slideCount
      }))
    }
  }, [buildSelection.lessonId, addSlideToLesson, slideCount, setBuildSelection])

  // Duplicate current slide
  const handleDuplicate = useCallback(() => {
    if (buildSelection.lessonId && currentIndex >= 0) {
      duplicateSlide(buildSelection.lessonId, currentIndex)
      // Navigate to duplicated slide
      setBuildSelection(prev => ({
        ...prev,
        slideIndex: prev.slideIndex + 1
      }))
    }
  }, [buildSelection.lessonId, currentIndex, duplicateSlide, setBuildSelection])

  const buttonStyle = {
    padding: '6px 12px',
    fontSize: '0.8vh',
    fontFamily: THEME.FONT_MONO,
    color: THEME.TEXT_SECONDARY,
    background: 'transparent',
    border: `1px solid ${THEME.BORDER}`,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }

  const arrowStyle = {
    ...buttonStyle,
    padding: '6px 10px',
    fontSize: '1.2vh'
  }

  const disabledStyle = {
    opacity: 0.3,
    cursor: 'not-allowed'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px 20px',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: 'rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* Navigation Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handlePrev}
          disabled={!buildSelection.lessonId || currentIndex <= 0}
          style={{
            ...arrowStyle,
            ...((!buildSelection.lessonId || currentIndex <= 0) && disabledStyle)
          }}
          onMouseEnter={(e) => {
            if (buildSelection.lessonId && currentIndex > 0) {
              e.target.style.borderColor = THEME.AMBER
              e.target.style.color = THEME.AMBER
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = THEME.BORDER
            e.target.style.color = THEME.TEXT_SECONDARY
          }}
        >
          ←
        </button>

        {/* Slide Counter with Populated Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 8px'
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              onClick={() => {
                if (buildSelection.lessonId) {
                  setBuildSelection(prev => ({ ...prev, slideIndex: idx }))
                }
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: idx === currentIndex
                  ? THEME.AMBER
                  : isSlidePopulated(slide)
                    ? THEME.GREEN_BRIGHT
                    : THEME.BORDER,
                border: idx === currentIndex ? `2px solid ${THEME.AMBER}` : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={`Slide ${idx + 1}${isSlidePopulated(slide) ? ' (has content)' : ''}`}
            />
          ))}
        </div>

        {/* Numeric Counter */}
        <span
          style={{
            fontSize: '0.9vh',
            fontFamily: THEME.FONT_MONO,
            color: THEME.TEXT_SECONDARY,
            minWidth: '40px',
            textAlign: 'center'
          }}
        >
          {slideCount > 0 ? `${currentIndex + 1}/${slideCount}` : '0/0'}
        </span>

        <button
          onClick={handleNext}
          disabled={!buildSelection.lessonId || currentIndex >= slideCount - 1}
          style={{
            ...arrowStyle,
            ...((!buildSelection.lessonId || currentIndex >= slideCount - 1) && disabledStyle)
          }}
          onMouseEnter={(e) => {
            if (buildSelection.lessonId && currentIndex < slideCount - 1) {
              e.target.style.borderColor = THEME.AMBER
              e.target.style.color = THEME.AMBER
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = THEME.BORDER
            e.target.style.color = THEME.TEXT_SECONDARY
          }}
        >
          →
        </button>
      </div>

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '24px',
          background: THEME.BORDER,
          margin: '0 8px'
        }}
      />

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleNewSlide}
          disabled={!buildSelection.lessonId}
          style={{
            ...buttonStyle,
            color: THEME.GREEN_BRIGHT,
            borderColor: THEME.GREEN_BRIGHT,
            ...(!buildSelection.lessonId && disabledStyle)
          }}
          onMouseEnter={(e) => {
            if (buildSelection.lessonId) {
              e.target.style.background = THEME.GREEN_BRIGHT
              e.target.style.color = THEME.BG_DARK
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = THEME.GREEN_BRIGHT
          }}
        >
          + New Slide
        </button>

        <button
          onClick={handleDuplicate}
          disabled={!buildSelection.lessonId || slideCount === 0}
          style={{
            ...buttonStyle,
            ...(!buildSelection.lessonId || slideCount === 0 ? disabledStyle : {})
          }}
          onMouseEnter={(e) => {
            if (buildSelection.lessonId && slideCount > 0) {
              e.target.style.borderColor = THEME.AMBER
              e.target.style.color = THEME.AMBER
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = THEME.BORDER
            e.target.style.color = THEME.TEXT_SECONDARY
          }}
        >
          Duplicate
        </button>
      </div>
    </div>
  )
}

export default BuildSlideNav
