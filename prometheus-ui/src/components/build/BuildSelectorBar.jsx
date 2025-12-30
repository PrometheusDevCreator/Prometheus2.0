/**
 * BuildSelectorBar - Module/Lesson/Topic Selection + LO Summary
 *
 * Provides dropdown cascade for navigating course structure:
 * Module -> Lesson -> Topic
 *
 * Also displays editable Learning Objectives summary
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'

function BuildSelectorBar() {
  const {
    lessons,
    scalarData,
    buildSelection,
    setBuildSelection,
    ensureLessonHasDefaultSlide,
    updateLearningObjectiveText
  } = useDesign()

  const [editingLO, setEditingLO] = useState(null) // { index, text }

  // Get modules from scalar data
  const modules = useMemo(() => {
    return scalarData?.modules || []
  }, [scalarData])

  // Filter lessons by selected module
  const filteredLessons = useMemo(() => {
    if (!buildSelection.moduleId) return lessons
    const moduleIndex = modules.findIndex(m => m.id === buildSelection.moduleId)
    if (moduleIndex === -1) return lessons
    return lessons.filter(l => l.module === moduleIndex + 1)
  }, [lessons, buildSelection.moduleId, modules])

  // Get selected lesson
  const selectedLesson = useMemo(() => {
    if (!buildSelection.lessonId) return null
    return lessons.find(l => l.id === buildSelection.lessonId) || null
  }, [lessons, buildSelection.lessonId])

  // Get topics from selected lesson
  const lessonTopics = useMemo(() => {
    if (!selectedLesson) return []
    return selectedLesson.topics || []
  }, [selectedLesson])

  // Get LOs from selected lesson
  const lessonLOs = useMemo(() => {
    if (!selectedLesson) return []
    return selectedLesson.learningObjectives || []
  }, [selectedLesson])

  // Handle module change
  const handleModuleChange = useCallback((moduleId) => {
    setBuildSelection(prev => ({
      ...prev,
      moduleId,
      lessonId: null,
      topicId: null,
      slideIndex: 0
    }))
  }, [setBuildSelection])

  // Handle lesson change
  const handleLessonChange = useCallback((lessonId) => {
    if (lessonId) {
      // Ensure lesson has default slide on first BUILD entry (Correction #1)
      ensureLessonHasDefaultSlide(lessonId)
    }
    setBuildSelection(prev => ({
      ...prev,
      lessonId,
      topicId: null,
      slideIndex: 0
    }))
  }, [setBuildSelection, ensureLessonHasDefaultSlide])

  // Handle topic change
  const handleTopicChange = useCallback((topicId) => {
    setBuildSelection(prev => ({
      ...prev,
      topicId
    }))
  }, [setBuildSelection])

  // Handle LO edit start
  const handleLODoubleClick = useCallback((index, text) => {
    setEditingLO({ index, text })
  }, [])

  // Handle LO edit save
  const handleLOSave = useCallback(() => {
    if (editingLO && buildSelection.lessonId) {
      updateLearningObjectiveText(buildSelection.lessonId, editingLO.index, editingLO.text)
    }
    setEditingLO(null)
  }, [editingLO, buildSelection.lessonId, updateLearningObjectiveText])

  // Dropdown style - font size +50% total (2x 25%), border-radius matched to action buttons
  const dropdownStyle = {
    padding: '6px 12px',
    fontSize: '1.325vh',  // Was 1.06vh, +25% again
    fontFamily: THEME.FONT_PRIMARY,
    color: THEME.TEXT_PRIMARY,
    background: THEME.BG_DARK,
    border: `1px solid ${THEME.BORDER}`,
    borderRadius: '1.5vh',  // Match action button style
    cursor: 'pointer',
    minWidth: '150px',
    outline: 'none'
  }

  const labelStyle = {
    fontSize: '1.09vh',  // Was 0.875vh, +25% again
    fontFamily: THEME.FONT_MONO,
    color: THEME.TEXT_DIM,
    letterSpacing: '0.1vh',
    marginBottom: '4px'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        padding: '12px 20px',
        borderBottom: `1px solid ${THEME.BORDER}`,
        background: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Module Selector */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={labelStyle}>MODULE</span>
        <select
          value={buildSelection.moduleId || ''}
          onChange={(e) => handleModuleChange(e.target.value || null)}
          style={dropdownStyle}
        >
          <option value="">All Modules</option>
          {modules.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Lesson Selector */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={labelStyle}>LESSON</span>
        <select
          value={buildSelection.lessonId || ''}
          onChange={(e) => handleLessonChange(e.target.value || null)}
          style={dropdownStyle}
        >
          <option value="">Select Lesson</option>
          {filteredLessons.map(l => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
      </div>

      {/* Topic Selector */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={labelStyle}>TOPIC</span>
        <select
          value={buildSelection.topicId || ''}
          onChange={(e) => handleTopicChange(e.target.value || null)}
          style={dropdownStyle}
          disabled={!buildSelection.lessonId}
        >
          <option value="">All Topics</option>
          {lessonTopics.map(t => (
            <option key={t.id} value={t.id}>
              {t.number ? `${t.number} - ` : ''}{t.title}
            </option>
          ))}
        </select>
      </div>

      {/* LO Summary - Editable */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
        <span style={labelStyle}>LEARNING OBJECTIVES</span>
        <div
          style={{
            padding: '6px 12px',
            fontSize: '1.25vh',  // Was 1vh, +25% again
            fontFamily: THEME.FONT_PRIMARY,
            color: lessonLOs.length > 0 ? THEME.TEXT_SECONDARY : THEME.TEXT_DIM,
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${THEME.BORDER}`,
            borderRadius: '1.5vh',  // Match action button style
            minHeight: '32px',
            maxHeight: '60px',
            overflowY: 'auto'
          }}
        >
          {lessonLOs.length === 0 ? (
            <span style={{ fontStyle: 'italic' }}>No LOs assigned to this lesson</span>
          ) : (
            lessonLOs.map((lo, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2px 0',
                  cursor: 'text',
                  borderBottom: idx < lessonLOs.length - 1 ? `1px solid ${THEME.BORDER}` : 'none'
                }}
                onDoubleClick={() => handleLODoubleClick(idx, lo)}
              >
                {editingLO && editingLO.index === idx ? (
                  <input
                    type="text"
                    value={editingLO.text}
                    onChange={(e) => setEditingLO(prev => ({ ...prev, text: e.target.value }))}
                    onBlur={handleLOSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLOSave()
                      if (e.key === 'Escape') setEditingLO(null)
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      fontSize: '1.25vh',  // Was 1vh, +25% again
                      fontFamily: THEME.FONT_PRIMARY,
                      color: THEME.TEXT_PRIMARY,
                      background: THEME.BG_DARK,
                      border: `1px solid ${THEME.GREEN_BRIGHT}`,
                      borderRadius: '0.5vh',  // Proportional inner border-radius
                      outline: 'none'
                    }}
                  />
                ) : (
                  <span>{lo}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildSelectorBar
