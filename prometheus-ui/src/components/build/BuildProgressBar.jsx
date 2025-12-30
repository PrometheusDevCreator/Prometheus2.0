/**
 * BuildProgressBar - Lesson Progress Indicator
 *
 * Progress Calculation (Correction #6):
 * - Counts ONLY 3 primary content blocks (columns 1-3)
 * - Counts instructorNotes
 * - Optional columns (4-5) do NOT affect progress
 */

import { useMemo } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function BuildProgressBar() {
  const { lessons, buildSelection, calculateLessonProgress } = useDesign()

  // Get current lesson
  const currentLesson = useMemo(() => {
    return lessons.find(l => l.id === buildSelection.lessonId)
  }, [lessons, buildSelection.lessonId])

  // Calculate progress
  const progress = useMemo(() => {
    return currentLesson ? calculateLessonProgress(currentLesson) : 0
  }, [currentLesson, calculateLessonProgress])

  // Progress color based on percentage
  const progressColor = useMemo(() => {
    if (progress >= 80) return THEME.GREEN_BRIGHT
    if (progress >= 50) return THEME.AMBER
    if (progress >= 20) return '#FF8800'
    return THEME.TEXT_DIM
  }, [progress])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 20px',
        borderTop: `1px solid ${THEME.BORDER}`,
        background: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '1.09vh',  // Was 0.875vh, +25% again
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_DIM,
          letterSpacing: '0.1vh'
        }}
      >
        LESSON PROGRESS:
      </span>

      {/* Progress Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: '300px',
          height: '8px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '1vh',  // Proportional inner border-radius
          overflow: 'hidden',
          border: `1px solid ${THEME.BORDER}`
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: progressColor,
            transition: 'all 0.3s ease',
            boxShadow: progress > 0 ? `0 0 8px ${progressColor}40` : 'none'
          }}
        />
      </div>

      {/* Percentage */}
      <span
        style={{
          fontSize: '1.325vh',  // Was 1.06vh, +25% again
          fontFamily: THEME.FONT_MONO,
          color: progressColor,
          minWidth: '40px',
          textAlign: 'right'
        }}
      >
        {progress}%
      </span>

      {/* Slide count indicator */}
      {currentLesson && (
        <span
          style={{
            fontSize: '1.09vh',  // Was 0.875vh, +25% again
            fontFamily: THEME.FONT_MONO,
            color: THEME.TEXT_DIM,
            marginLeft: '12px'
          }}
        >
          ({currentLesson.slides?.length || 0} slides)
        </span>
      )}
    </div>
  )
}

export default BuildProgressBar
