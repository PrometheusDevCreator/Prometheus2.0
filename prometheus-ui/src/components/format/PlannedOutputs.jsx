/**
 * PlannedOutputs.jsx - "More Outputs" Placeholder Section
 *
 * FORMAT Page Component
 *
 * CORRECTION #7: "More Outputs" is DISPLAY-ONLY in MVP.
 * - No upload, no mapping, no navigation
 * - Shows greyed placeholders with "PLANNED" badges
 * - Prevents helpful-but-dangerous enthusiasm during implementation
 */

import { THEME } from '../../constants/theme'
import { OUTPUT_TYPES } from '../../contexts/TemplateContext'

function PlannedOutputs() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 0'
      }}
    >
      {/* Section Label */}
      <div
        style={{
          fontSize: '10px',
          letterSpacing: '3px',
          color: THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY
        }}
      >
        MORE OUTPUTS
      </div>

      {/* Planned Output Items */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        {OUTPUT_TYPES.PLANNED.map((output) => (
          <PlannedOutputItem
            key={output.id}
            label={output.label}
            status={output.status}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * PlannedOutputItem - Individual planned output placeholder
 * CORRECTION #7: Completely non-interactive
 */
function PlannedOutputItem({ label, status }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.4,
        cursor: 'default' // Explicitly not clickable
      }}
    >
      {/* Icon placeholder */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '8px',
          background: THEME.BG_PANEL || '#1a1a1a',
          border: `1px solid ${THEME.BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <PlannedIcon />
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '8px',
          letterSpacing: '1px',
          color: THEME.TEXT_MUTED,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center',
          maxWidth: 70
        }}
      >
        {label}
      </div>

      {/* Status Badge */}
      <div
        style={{
          fontSize: '7px',
          letterSpacing: '1px',
          color: THEME.TEXT_MUTED,
          fontFamily: THEME.FONT_MONO,
          padding: '2px 6px',
          background: THEME.BG_DARK,
          borderRadius: '2px'
        }}
      >
        {status}
      </div>
    </div>
  )
}

/**
 * PlannedIcon - Simple placeholder icon for planned outputs
 */
function PlannedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={THEME.TEXT_MUTED} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12" y2="16" strokeLinecap="round" />
    </svg>
  )
}

export default PlannedOutputs
