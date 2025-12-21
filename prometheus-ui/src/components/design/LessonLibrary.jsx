/**
 * LessonLibrary.jsx - Lesson Library Panel
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 4
 *
 * Contains:
 * - Header with tabs (UNSCHEDULED / SAVED)
 * - New Lesson button
 * - Scrollable card container
 * - Context menu for lesson actions
 *
 * Tabs:
 * - UNSCHEDULED: Lessons created but not on timetable
 * - SAVED: Lessons saved as templates
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import LessonCard from './LessonCard'

function LessonLibrary() {
  const {
    createLesson,
    unscheduledLessons,
    savedLessons,
    saveToLibrary,
    deleteLesson,
    duplicateLesson
  } = useDesign()

  const [activeTab, setActiveTab] = useState('unscheduled')
  const [contextMenu, setContextMenu] = useState(null)

  const currentLessons = activeTab === 'unscheduled' ? unscheduledLessons : savedLessons

  // Handle add lesson button
  const handleAddLesson = useCallback(() => {
    createLesson({ scheduled: false })
  }, [createLesson])

  // Handle context menu open
  const handleContextMenu = useCallback((e, lesson) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      lesson
    })
  }, [])

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // Context menu actions
  const handleSaveToLibrary = useCallback(() => {
    if (contextMenu?.lesson) {
      saveToLibrary(contextMenu.lesson.id)
    }
    closeContextMenu()
  }, [contextMenu, saveToLibrary, closeContextMenu])

  const handleDuplicate = useCallback(() => {
    if (contextMenu?.lesson) {
      duplicateLesson(contextMenu.lesson.id)
    }
    closeContextMenu()
  }, [contextMenu, duplicateLesson, closeContextMenu])

  const handleDelete = useCallback(() => {
    if (contextMenu?.lesson) {
      deleteLesson(contextMenu.lesson.id)
    }
    closeContextMenu()
  }, [contextMenu, deleteLesson, closeContextMenu])

  return (
    <div
      style={{
        borderTop: `1px solid ${THEME.BORDER}`,
        background: THEME.BG_PANEL,
        flexShrink: 0
      }}
      onClick={closeContextMenu}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 1vw',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <span
            style={{
              fontSize: '1.2vh',
              letterSpacing: '0.1vw',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              textTransform: 'uppercase'
            }}
          >
            Lesson Library
          </span>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5vw' }}>
            <LibraryTab
              label="UNSCHEDULED"
              active={activeTab === 'unscheduled'}
              count={unscheduledLessons.length}
              onClick={() => setActiveTab('unscheduled')}
            />
            <LibraryTab
              label="SAVED"
              active={activeTab === 'saved'}
              count={savedLessons.length}
              onClick={() => setActiveTab('saved')}
            />
          </div>
        </div>

        {/* Add Lesson Button */}
        <button
          onClick={handleAddLesson}
          style={{
            background: 'transparent',
            border: `1px dashed ${THEME.AMBER}`,
            borderRadius: '0.5vh',
            color: THEME.AMBER,
            fontSize: '1.1vh',
            padding: '0.5vh 1vw',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3vw',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = THEME.AMBER
            e.target.style.color = THEME.BG_DARK
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = THEME.AMBER
          }}
        >
          <span style={{ fontSize: '1.3vh' }}>+</span>
          New Lesson
        </button>
      </div>

      {/* Library Content */}
      <div
        style={{
          display: 'flex',
          gap: '0.8vw',
          padding: '1vh 1vw',
          overflowX: 'auto',
          minHeight: '8vh'
        }}
      >
        {currentLessons.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: THEME.TEXT_DIM,
              fontSize: '1.1vh',
              fontStyle: 'italic'
            }}
          >
            {activeTab === 'unscheduled'
              ? 'No unscheduled lessons. Create a new lesson or drag one off the timetable.'
              : 'No saved lessons. Right-click a lesson and select "Save to Library".'}
          </div>
        ) : (
          currentLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          lesson={contextMenu.lesson}
          onSaveToLibrary={handleSaveToLibrary}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LibraryTab({ label, active, count, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? THEME.BG_DARK : 'transparent',
        border: `1px solid ${active ? THEME.BORDER_LIGHT : THEME.BORDER}`,
        borderRadius: '0.4vh',
        color: active ? THEME.WHITE : hovered ? THEME.AMBER : THEME.TEXT_DIM,
        fontSize: '1vh',
        padding: '0.4vh 0.8vw',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3vw',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
      {count > 0 && (
        <span
          style={{
            background: active ? THEME.AMBER : THEME.TEXT_DIM,
            color: THEME.BG_DARK,
            borderRadius: '0.3vh',
            padding: '0 0.3vw',
            fontSize: '0.9vh',
            fontWeight: 500
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function ContextMenu({ x, y, lesson, onSaveToLibrary, onDuplicate, onDelete, onClose }) {
  // Prevent menu from going off-screen
  const adjustedX = Math.min(x, window.innerWidth - 180)
  const adjustedY = Math.min(y, window.innerHeight - 150)

  return (
    <>
      {/* Backdrop to capture clicks */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        style={{
          position: 'fixed',
          top: adjustedY,
          left: adjustedX,
          background: THEME.BG_PANEL,
          border: `1px solid ${THEME.BORDER_LIGHT}`,
          borderRadius: '0.5vh',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          zIndex: 1000,
          minWidth: '10vw',
          overflow: 'hidden'
        }}
      >
        <ContextMenuItem
          label="Schedule"
          hint="Drag to timetable"
          disabled
        />
        {!lesson.saved && (
          <ContextMenuItem
            label="Save to Library"
            onClick={onSaveToLibrary}
          />
        )}
        <ContextMenuItem
          label="Duplicate"
          onClick={onDuplicate}
        />
        <div style={{ height: '1px', background: THEME.BORDER, margin: '0.3vh 0' }} />
        <ContextMenuItem
          label="Delete"
          onClick={onDelete}
          danger
        />
      </div>
    </>
  )
}

function ContextMenuItem({ label, hint, onClick, disabled, danger }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.8vh 1vw',
        fontSize: '1.1vh',
        fontFamily: THEME.FONT_PRIMARY,
        color: disabled
          ? THEME.TEXT_DIM
          : danger
            ? hovered ? '#ff6666' : '#cc4444'
            : hovered ? THEME.WHITE : THEME.TEXT_PRIMARY,
        background: hovered && !disabled ? THEME.BG_DARK : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.15s ease'
      }}
    >
      <span>{label}</span>
      {hint && (
        <span style={{ fontSize: '0.9vh', color: THEME.TEXT_DIM, marginLeft: '1vw' }}>
          {hint}
        </span>
      )}
    </div>
  )
}

export default LessonLibrary
