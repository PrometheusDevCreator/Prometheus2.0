/**
 * MappingPanel.jsx - Mapping Interface Layout Shell
 *
 * FORMAT Page Component
 *
 * CORRECTION #2: This component is PURELY PRESENTATIONAL.
 * - No analysis logic
 * - No persistence logic
 * - No validation logic
 * - Just routes to appropriate mapping editor based on output type
 *
 * All mapping mutations go through TemplateContext actions.
 */

import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import PPTXMappingEditor from './PPTXMappingEditor'
import XLSXMappingEditor from './XLSXMappingEditor'

function MappingPanel() {
  const {
    selectedOutput,
    activeProfile,
    getOutputStatus,
    checkMapping
  } = useTemplate()

  // Only show when an output is selected and has a loaded template
  const status = selectedOutput ? getOutputStatus(selectedOutput) : 'none'

  if (!selectedOutput || status === 'none') {
    return null
  }

  // Get appropriate editor based on output type
  const renderEditor = () => {
    switch (selectedOutput) {
      case 'presentation':
        return <PPTXMappingEditor />

      case 'timetable':
        return <XLSXMappingEditor />

      case 'lesson_plan':
      case 'qa_form':
        // DOCX editor placeholder (Phase 6+)
        return (
          <div
            style={{
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '2px',
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_PRIMARY,
                marginBottom: '8px'
              }}
            >
              DOCUMENT MAPPING
            </div>
            <div
              style={{
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO
              }}
            >
              Available in future phase
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // CORRECTION #3: Check Mapping (informational only, not gating)
  const mappingCheck = checkMapping(selectedOutput)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '16px'
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          MAPPING CONFIGURATION
        </div>

        {/* Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: mappingCheck.valid ? THEME.GREEN_BRIGHT : THEME.AMBER
            }}
          />
          <span
            style={{
              fontSize: '9px',
              letterSpacing: '1px',
              color: mappingCheck.valid ? THEME.GREEN_BRIGHT : THEME.AMBER,
              fontFamily: THEME.FONT_MONO
            }}
          >
            {mappingCheck.valid ? 'CONFIGURED' : 'INCOMPLETE'}
          </span>
        </div>
      </div>

      {/* Mapping Editor Container */}
      <div
        style={{
          background: THEME.BG_DARK,
          borderRadius: '4px',
          border: `1px solid ${THEME.BORDER}`,
          overflow: 'hidden'
        }}
      >
        {renderEditor()}
      </div>

      {/* Issues List (if any) */}
      {!mappingCheck.valid && mappingCheck.issues.length > 0 && (
        <div
          style={{
            padding: '8px 12px',
            background: `${THEME.AMBER}10`,
            borderRadius: '4px',
            border: `1px solid ${THEME.AMBER}30`
          }}
        >
          <div
            style={{
              fontSize: '9px',
              letterSpacing: '1px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              marginBottom: '6px'
            }}
          >
            MAPPING NOTES
          </div>
          {mappingCheck.issues.map((issue, i) => (
            <div
              key={i}
              style={{
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                paddingLeft: '8px',
                marginBottom: '2px'
              }}
            >
              - {issue}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MappingPanel
