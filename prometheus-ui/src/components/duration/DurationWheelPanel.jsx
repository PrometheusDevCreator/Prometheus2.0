/**
 * DurationWheelPanel - Duration & Structure Configuration Panel
 *
 * NEW Layout:
 * - Left: Large LogarithmicDurationWheel (Hours/Days/Weeks combined)
 * - Right: Structure wheels stacked vertically (Modules, Semesters, Terms)
 *
 * Props:
 * - values: { hours, days, weeks, modules, semesters, terms, durationUnit }
 * - onChange: (field, newValue) => void
 * - onBatchChange: (updates) => void for multiple field updates
 */

import { useCallback } from 'react'
import LogarithmicDurationWheel from './LogarithmicDurationWheel'
import DurationWheel from './DurationWheel'
import { THEME } from '../../constants/theme'

function DurationWheelPanel({
  values = {
    hours: 0,
    days: 0,
    weeks: 0,
    modules: 0,
    semesters: 0,
    terms: 0,
    durationUnit: 'HOURS'
  },
  onChange,
  onBatchChange,
  showValidation = true
}) {
  // Determine current duration value and unit from values
  const getDurationValue = () => {
    if (values.weeks > 0) return { value: values.weeks, unit: 'WEEKS' }
    if (values.days > 0) return { value: values.days, unit: 'DAYS' }
    return { value: values.hours || 0, unit: 'HOURS' }
  }

  const { value: durationValue, unit: durationUnit } = getDurationValue()

  // Validation: at least one time value must be > 0
  const isValid = values.hours > 0 || values.days > 0 || values.weeks > 0

  // Handle individual wheel change
  const handleChange = useCallback((field, newValue) => {
    onChange?.(field, newValue)
  }, [onChange])

  // Handle logarithmic wheel change - updates the appropriate field based on unit
  const handleDurationChange = useCallback((newValue, newUnit) => {
    // Clear other duration fields and set the new one
    const updates = {
      hours: 0,
      days: 0,
      weeks: 0
    }

    if (newUnit === 'HOURS') {
      updates.hours = newValue
    } else if (newUnit === 'DAYS') {
      updates.days = newValue
    } else if (newUnit === 'WEEKS') {
      updates.weeks = newValue
    }

    // Use batch change if available, otherwise individual changes
    if (onBatchChange) {
      onBatchChange(updates)
    } else {
      onChange?.('hours', updates.hours)
      onChange?.('days', updates.days)
      onChange?.('weeks', updates.weeks)
    }
  }, [onChange, onBatchChange])

  // Calculate total duration for display
  const getTotalDuration = () => {
    if (values.weeks > 0) {
      return `${values.weeks} Week${values.weeks !== 1 ? 's' : ''}`
    }
    if (values.days > 0) {
      return `${values.days} Day${values.days !== 1 ? 's' : ''}`
    }
    if (values.hours > 0) {
      return `${values.hours} Hour${values.hours !== 1 ? 's' : ''}`
    }
    return 'Not set'
  }

  // Calculate structure for display
  const getStructure = () => {
    const parts = []
    if (values.modules > 0) {
      parts.push(`${values.modules}M`)
    }
    if (values.semesters > 0) {
      parts.push(`${values.semesters}S`)
    }
    if (values.terms > 0) {
      parts.push(`${values.terms}T`)
    }
    return parts.length > 0 ? parts.join(' / ') : 'None'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1vh',
        padding: '0.5vh 0'
      }}
    >
      {/* Main content: Large wheel left, structure wheels right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.5vw'
        }}
      >
        {/* Left: Large Logarithmic Duration Wheel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <LogarithmicDurationWheel
            value={durationValue}
            unit={durationUnit}
            onChange={handleDurationChange}
            size={135}
          />
          {/* Validation message */}
          {showValidation && !isValid && (
            <span
              style={{
                fontSize: '0.85vh',
                fontFamily: THEME.FONT_PRIMARY,
                color: '#ff6666',
                marginTop: '0.5vh',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            >
              * Required
            </span>
          )}
        </div>

        {/* Right: Structure wheels stacked vertically */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8vh',
            alignItems: 'center'
          }}
        >
          {/* Structure label */}
          <span
            style={{
              fontSize: '1vh',
              fontFamily: THEME.FONT_PRIMARY,
              letterSpacing: '0.15vh',
              color: THEME.AMBER,
              fontWeight: '500',
              marginBottom: '0.3vh'
            }}
          >
            STRUCTURE
          </span>

          {/* Modules wheel */}
          <DurationWheel
            value={values.modules}
            min={0}
            max={12}
            label="MODULES"
            onChange={(v) => handleChange('modules', v)}
            size={74}
            isStructure={true}
          />

          {/* Semesters wheel */}
          <DurationWheel
            value={values.semesters}
            min={0}
            max={6}
            label="SEMESTERS"
            onChange={(v) => handleChange('semesters', v)}
            size={74}
            isStructure={true}
          />

          {/* Terms wheel */}
          <DurationWheel
            value={values.terms}
            min={0}
            max={6}
            label="TERMS"
            onChange={(v) => handleChange('terms', v)}
            size={74}
            isStructure={true}
          />

          {/* Structure summary */}
          <span
            style={{
              fontSize: '0.9vh',
              fontFamily: THEME.FONT_MONO,
              color: THEME.TEXT_DIM,
              marginTop: '0.3vh'
            }}
          >
            {getStructure()}
          </span>
        </div>
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
          transition: 'color 0.2s ease'
        }}
      >
        Duration: {getTotalDuration()}
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
