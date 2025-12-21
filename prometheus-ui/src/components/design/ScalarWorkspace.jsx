/**
 * ScalarWorkspace.jsx - Scalar Tab Content
 *
 * APPROVED IMPLEMENTATION PLAN - Phase 5
 *
 * Displays hierarchical tree view:
 * Module > Learning Objective > Topic > Subtopic
 *
 * Features:
 * - Expand/collapse nodes
 * - Add new items at each level
 * - Select items to edit in Editor panel
 * - Visual hierarchy with indentation and connectors
 */

import { THEME } from '../../constants/theme'
import { useDesign } from '../../contexts/DesignContext'
import ScalarTree from './ScalarTree'

function ScalarWorkspace() {
  const { scalarData, currentModule, addLearningObjective } = useDesign()

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
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1vh 1.5vw',
          borderBottom: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <span
            style={{
              fontSize: '1.4vh',
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
              fontSize: '1.1vh',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO
            }}
          >
            {module?.learningObjectives?.length || 0} LOs
          </span>
        </div>

        <button
          onClick={() => module && addLearningObjective(module.id)}
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
        >
          <span style={{ fontSize: '1.3vh' }}>+</span>
          Add LO
        </button>
      </div>

      {/* Tree View */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1vh 1vw'
        }}
      >
        {module ? (
          <ScalarTree module={module} />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: THEME.TEXT_DIM,
              fontSize: '1.2vh',
              fontStyle: 'italic'
            }}
          >
            No module data available
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '2vw',
          padding: '0.8vh 1.5vw',
          borderTop: `1px solid ${THEME.BORDER}`,
          background: THEME.BG_PANEL
        }}
      >
        <LegendItem label="Learning Objective" color={THEME.AMBER} />
        <LegendItem label="Topic" color="#4a9eff" />
        <LegendItem label="Subtopic" color="#9b59b6" />
      </div>
    </div>
  )
}

function LegendItem({ label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4vw' }}>
      <div
        style={{
          width: '0.8vh',
          height: '0.8vh',
          borderRadius: '50%',
          background: color
        }}
      />
      <span
        style={{
          fontSize: '1vh',
          color: THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default ScalarWorkspace
