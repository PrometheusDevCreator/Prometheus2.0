/**
 * DurationWheelPanel - Duration, Level/Seniority & Structure Configuration
 *
 * 3-Column Layout:
 * - Left (100%): Large LogarithmicDurationWheel
 * - Middle (75%): Level and Seniority wheels
 * - Right (50%): Module, Semester, Term wheels
 *
 * Validation:
 * - Duration + Level + Seniority are REQUIRED
 * - Structure (Module/Semester/Term) is OPTIONAL (default 0)
 *
 * Vertical alignment: Duration center aligns with Semester center
 */

import { useCallback } from 'react'
import LogarithmicDurationWheel from './LogarithmicDurationWheel'
import CategoricalWheel from './CategoricalWheel'
import DurationWheel from './DurationWheel'
import { THEME, LEVEL_OPTIONS, SENIORITY_OPTIONS } from '../../constants/theme'

// Wheel sizes (relative to Duration = 100%)
const SIZE_DURATION = 135    // 100%
const SIZE_LEVEL = 101       // 75%
const SIZE_STRUCTURE = 68    // 50%

function DurationWheelPanel({
  values = {
    hours: 0,
    days: 0,
    weeks: 0,
    level: '',
    seniority: '',
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

  // Validation
  const hasDuration = values.hours > 0 || values.days > 0 || values.weeks > 0
  const hasLevel = values.level && LEVEL_OPTIONS.includes(values.level)
  const hasSeniority = values.seniority && SENIORITY_OPTIONS.includes(values.seniority)
  const isValid = hasDuration && hasLevel && hasSeniority

  // Handle individual wheel change
  const handleChange = useCallback((field, newValue) => {
    onChange?.(field, newValue)
  }, [onChange])

  // Handle logarithmic wheel change
  const handleDurationChange = useCallback((newValue, newUnit) => {
    const updates = { hours: 0, days: 0, weeks: 0 }

    if (newUnit === 'HOURS') updates.hours = newValue
    else if (newUnit === 'DAYS') updates.days = newValue
    else if (newUnit === 'WEEKS') updates.weeks = newValue

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
    if (values.weeks > 0) return `${values.weeks} Week${values.weeks !== 1 ? 's' : ''}`
    if (values.days > 0) return `${values.days} Day${values.days !== 1 ? 's' : ''}`
    if (values.hours > 0) return `${values.hours} Hour${values.hours !== 1 ? 's' : ''}`
    return 'Not set'
  }

  // Calculate structure for display
  const getStructure = () => {
    const parts = []
    if (values.modules > 0) parts.push(`${values.modules}M`)
    if (values.semesters > 0) parts.push(`${values.semesters}S`)
    if (values.terms > 0) parts.push(`${values.terms}T`)
    return parts.length > 0 ? parts.join('/') : '---'
  }

  // Gap calculations for alignment
  // Structure column height: 3 wheels * 68px + 2 gaps ≈ 250px
  // Duration wheel: 135px, so needs offset to center with middle structure wheel
  // Middle structure wheel center = (68 + gap + 68/2) from top
  const structureGap = 12
  const structureWheelHeight = SIZE_STRUCTURE + 20 // wheel + label

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8vh',
        padding: '0.5vh 0'
      }}
    >
      {/* Main 3-column layout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1vw'
        }}
      >
        {/* Column 1: Duration Wheel (100%) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: structureWheelHeight + structureGap - (SIZE_DURATION / 2) + (SIZE_STRUCTURE / 2)
          }}
        >
          <LogarithmicDurationWheel
            value={durationValue}
            unit={durationUnit}
            onChange={handleDurationChange}
            size={SIZE_DURATION}
          />
          {showValidation && !hasDuration && (
            <span style={{
              fontSize: '0.75vh',
              color: '#ff6666',
              marginTop: '2px'
            }}>
              *
            </span>
          )}
        </div>

        {/* Column 2: Level & Seniority (75%) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${structureGap}px`,
            marginTop: (structureWheelHeight + structureGap) / 2 - SIZE_LEVEL / 2
          }}
        >
          <CategoricalWheel
            value={values.level}
            options={LEVEL_OPTIONS}
            label="LEVEL"
            onChange={(v) => handleChange('level', v)}
            size={SIZE_LEVEL}
            required={true}
          />
          <CategoricalWheel
            value={values.seniority}
            options={SENIORITY_OPTIONS}
            label="SENIORITY"
            onChange={(v) => handleChange('seniority', v)}
            size={SIZE_LEVEL}
            required={true}
          />
        </div>

        {/* Column 3: Structure Wheels (50%) - Optional */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${structureGap}px`
          }}
        >
          {/* Optional label */}
          <span
            style={{
              fontSize: '0.8vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.TEXT_DIM,
              letterSpacing: '0.1vh',
              marginBottom: '-8px'
            }}
          >
            (optional)
          </span>

          <DurationWheel
            value={values.modules}
            min={0}
            max={12}
            label="MODULES"
            onChange={(v) => handleChange('modules', v)}
            size={SIZE_STRUCTURE}
            isStructure={true}
          />
          <DurationWheel
            value={values.semesters}
            min={0}
            max={6}
            label="SEMESTERS"
            onChange={(v) => handleChange('semesters', v)}
            size={SIZE_STRUCTURE}
            isStructure={true}
          />
          <DurationWheel
            value={values.terms}
            min={0}
            max={6}
            label="TERMS"
            onChange={(v) => handleChange('terms', v)}
            size={SIZE_STRUCTURE}
            isStructure={true}
          />

          {/* Structure summary */}
          <span
            style={{
              fontSize: '0.8vh',
              fontFamily: THEME.FONT_MONO,
              color: THEME.TEXT_DIM
            }}
          >
            {getStructure()}
          </span>
        </div>
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2vw',
          fontSize: '0.9vh',
          fontFamily: THEME.FONT_MONO,
          padding: '0.5vh 0',
          borderTop: `1px solid ${THEME.BORDER}`,
          marginTop: '0.5vh'
        }}
      >
        <span style={{ color: hasDuration ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM }}>
          {getTotalDuration()}
        </span>
        <span style={{ color: THEME.TEXT_DIM }}>|</span>
        <span style={{ color: hasLevel ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM }}>
          {values.level || '---'}
        </span>
        <span style={{ color: THEME.TEXT_DIM }}>|</span>
        <span style={{ color: hasSeniority ? THEME.GREEN_BRIGHT : THEME.TEXT_DIM }}>
          {values.seniority || '---'}
        </span>
      </div>

      {/* Validation message */}
      {showValidation && !isValid && (
        <div
          style={{
            fontSize: '0.8vh',
            fontFamily: THEME.FONT_PRIMARY,
            color: '#ff6666',
            textAlign: 'center',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        >
          * Duration, Level and Seniority are required
        </div>
      )}

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
