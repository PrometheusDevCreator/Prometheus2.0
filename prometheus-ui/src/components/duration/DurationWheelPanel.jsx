/**
 * DurationWheelPanel - 6-Wheel Duration Configuration Panel
 *
 * Layout: 2 rows x 3 wheels
 *
 * Row 1 (Time Duration - at least one required):
 * - HOURS (1-12)
 * - DAYS (1-30)
 * - WEEKS (1-52, shows "Month X" if > 4)
 *
 * Row 2 (Structure - all optional, default 0):
 * - MODULES (0-12)
 * - SEMESTERS (0-6)
 * - TERMS (0-6)
 *
 * Props:
 * - values: { hours, days, weeks, modules, semesters, terms }
 * - onChange: (field, newValue) => void
 * - onBatchChange: (updates) => void for multiple field updates
 */

import { useCallback } from 'react'
import DurationWheel from './DurationWheel'
import { THEME } from '../../constants/theme'

function DurationWheelPanel({
  values = {
    hours: 0,
    days: 0,
    weeks: 0,
    modules: 0,
    semesters: 0,
    terms: 0
  },
  onChange,
  onBatchChange,
  showValidation = true
}) {
  // Validation: at least one time value must be > 0
  const isValid = values.hours > 0 || values.days > 0 || values.weeks > 0

  // Handle individual wheel change
  const handleChange = useCallback((field, newValue) => {
    onChange?.(field, newValue)
  }, [onChange])

  // Calculate total duration for display
  const getTotalDuration = () => {
    const parts = []
    if (values.weeks > 0) {
      parts.push(`${values.weeks} Week${values.weeks !== 1 ? 's' : ''}`)
    }
    if (values.days > 0) {
      parts.push(`${values.days} Day${values.days !== 1 ? 's' : ''}`)
    }
    if (values.hours > 0) {
      parts.push(`${values.hours} Hour${values.hours !== 1 ? 's' : ''}`)
    }
    return parts.length > 0 ? parts.join(' + ') : 'Not set'
  }

  // Calculate structure for display
  const getStructure = () => {
    const parts = []
    if (values.modules > 0) {
      parts.push(`${values.modules} Module${values.modules !== 1 ? 's' : ''}`)
    }
    if (values.semesters > 0) {
      parts.push(`${values.semesters} Semester${values.semesters !== 1 ? 's' : ''}`)
    }
    if (values.terms > 0) {
      parts.push(`${values.terms} Term${values.terms !== 1 ? 's' : ''}`)
    }
    return parts.length > 0 ? parts.join(', ') : 'None'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.8vh',
        padding: '1vh 0'
      }}
    >
      {/* Section Header: Duration */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.5vh'
        }}
      >
        <span
          style={{
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.2vh',
            color: THEME.AMBER,
            fontWeight: '500'
          }}
        >
          DURATION
        </span>
        {showValidation && !isValid && (
          <span
            style={{
              fontSize: '0.9vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: '#ff6666',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            * At least one required
          </span>
        )}
      </div>

      {/* Row 1: Time Duration Wheels (-20% size = 89px) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1.5vw'
        }}
      >
        <DurationWheel
          value={values.hours}
          min={0}
          max={12}
          label="HOURS"
          onChange={(v) => handleChange('hours', v)}
          size={89}
        />
        <DurationWheel
          value={values.days}
          min={0}
          max={30}
          label="DAYS"
          onChange={(v) => handleChange('days', v)}
          size={89}
        />
        <DurationWheel
          value={values.weeks}
          min={0}
          max={52}
          label="WEEKS"
          onChange={(v) => handleChange('weeks', v)}
          showMonthLabel={true}
          size={89}
        />
      </div>

      {/* Duration Summary */}
      <div
        style={{
          fontSize: '1vh',
          fontFamily: THEME.FONT_MONO,
          color: isValid ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM,
          textAlign: 'center',
          padding: '0.5vh 0',
          borderTop: `1px solid ${THEME.BORDER}`,
          borderBottom: `1px solid ${THEME.BORDER}`,
          transition: 'color 0.2s ease'
        }}
      >
        Total: {getTotalDuration()}
      </div>

      {/* Section Header: Structure */}
      <div
        style={{
          marginTop: '0.45vh'
        }}
      >
        <span
          style={{
            fontSize: '1.2vh',
            fontFamily: THEME.FONT_PRIMARY,
            letterSpacing: '0.2vh',
            color: THEME.AMBER,
            fontWeight: '500'
          }}
        >
          STRUCTURE
        </span>
        <span
          style={{
            fontSize: '0.9vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: THEME.TEXT_DIM,
            marginLeft: '1vw'
          }}
        >
          (optional)
        </span>
      </div>

      {/* Row 2: Structure Wheels (-35% size = 74px, grey until hover) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1.5vw'
        }}
      >
        <DurationWheel
          value={values.modules}
          min={0}
          max={12}
          label="MODULES"
          onChange={(v) => handleChange('modules', v)}
          size={74}
          isStructure={true}
        />
        <DurationWheel
          value={values.semesters}
          min={0}
          max={6}
          label="SEMESTERS"
          onChange={(v) => handleChange('semesters', v)}
          size={74}
          isStructure={true}
        />
        <DurationWheel
          value={values.terms}
          min={0}
          max={6}
          label="TERMS"
          onChange={(v) => handleChange('terms', v)}
          size={74}
          isStructure={true}
        />
      </div>

      {/* Structure Summary */}
      <div
        style={{
          fontSize: '1vh',
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_SECONDARY,
          textAlign: 'center',
          padding: '0.5vh 0'
        }}
      >
        Structure: {getStructure()}
      </div>

      {/* Pulse animation for validation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}

export default DurationWheelPanel
