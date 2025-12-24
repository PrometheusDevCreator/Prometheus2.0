/**
 * ScalarWorkspace.jsx - Scalar Tab Content
 *
 * REDESIGNED: Multi-Column View
 *
 * Displays 5 columns:
 * - Learning Objectives
 * - Topics
 * - Subtopics
 * - Lesson Titles
 * - Performance Criteria
 *
 * Features:
 * - Cross-column highlighting on click
 * - PC badges on linked items
 * - Inline editing
 * - Add/delete functionality
 * - 75% larger fonts
 */

import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import ScalarColumns from './ScalarColumns'

function ScalarWorkspace() {
  const { scalarData, currentModule } = useDesign()

  // Get current module data
  const module = scalarData.modules.find(m => m.order === currentModule) || scalarData.modules[0]

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: THEME.BG_DARK
      }}
    >
      {/* Module Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8vh 1.5vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <span
            style={{
              fontSize: '2vh',
              letterSpacing: '0.1vw',
              color: THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              fontWeight: 500
            }}
          >
            {module?.name || 'Module 1'}
          </span>
          <span
            style={{
              fontSize: '1.5vh',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO
            }}
          >
            {module?.learningObjectives?.length || 0} LOs
          </span>
        </div>
      </div>

      {/* Multi-Column View */}
      {module ? (
        <ScalarColumns module={module} />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: THEME.TEXT_DIM,
            fontSize: '1.8vh',
            fontStyle: 'italic'
          }}
        >
          No module data available
        </div>
      )}
    </div>
  )
}

export default ScalarWorkspace
