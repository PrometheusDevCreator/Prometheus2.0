/**
 * DurationWheelPanel - Duration, Level/Seniority & Structure Configuration
 *
 * 2-Row Layout:
 * - Top Row: Level (left), Content (center), Seniority (right)
 * - Bottom Row: Modules (left), Duration (center), Semesters/Terms (right)
 *   All centers aligned horizontally
 *
 * Features:
 * - Toggle to swap between Semesters and Terms wheel
 *
 * Validation:
 * - Duration + Level + Seniority are REQUIRED
 * - Structure (Module/Semester/Term) is OPTIONAL (default 0)
 */

import { useState, useCallback } from 'react'
import LogarithmicDurationWheel from './LogarithmicDurationWheel'
import CategoricalWheel from './CategoricalWheel'
import ContentWheel from './ContentWheel'
import DurationWheel from './DurationWheel'
import { THEME, LEVEL_OPTIONS, SENIORITY_OPTIONS } from '../../constants/theme'

// Wheel sizes
const SIZE_DURATION = 93     // Main duration wheel (reduced 15%)
const SIZE_LEVEL = 86        // Level, Content, Seniority wheels
const SIZE_STRUCTURE = 58    // Modules, Semesters/Terms wheels

// Layout spacing
const ROW_GAP = 12           // Gap between rows
const HORIZONTAL_OFFSET = 100 // Offset for outer wheels

function DurationWheelPanel({
  values = {
    hours: 0,
    days: 0,
    weeks: 0,
    level: '',
    seniority: '',
    contentType: 50,  // 0=100% Theory, 100=100% Practical, 50=balanced
    modules: 0,
    semesters: 0,
    terms: 0,
    durationUnit: 'HOURS'
  },
  onChange,
  onBatchChange,
  showValidation = true
}) {
  // Toggle state: false = Semesters, true = Terms
  const [showTerms, setShowTerms] = useState(false)

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

  // Handle toggle between Semesters and Terms
  const handleToggleStructureType = useCallback(() => {
    setShowTerms(prev => !prev)
  }, [])

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
    if (showTerms) {
      if (values.terms > 0) parts.push(`${values.terms}T`)
    } else {
      if (values.semesters > 0) parts.push(`${values.semesters}S`)
    }
    return parts.length > 0 ? parts.join('/') : '---'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${ROW_GAP}px`,
        padding: '0.5vh 0'
      }}
    >
      {/* ROW 1 (TOP): Level, Content, Seniority wheels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '16px'
        }}
      >
        {/* Level wheel - offset LEFT */}
        <div style={{ marginRight: `${HORIZONTAL_OFFSET}px` }}>
          <CategoricalWheel
            value={values.level}
            options={LEVEL_OPTIONS}
            label="LEVEL"
            onChange={(v) => handleChange('level', v)}
            size={SIZE_LEVEL}
            required={true}
          />
        </div>
        <ContentWheel
          value={values.contentType}
          onChange={(v) => handleChange('contentType', v)}
          size={SIZE_LEVEL}
        />
        {/* Seniority wheel - offset RIGHT */}
        <div style={{ marginLeft: `${HORIZONTAL_OFFSET}px` }}>
          <CategoricalWheel
            value={values.seniority}
            options={SENIORITY_OPTIONS}
            label="SENIORITY"
            onChange={(v) => handleChange('seniority', v)}
            size={SIZE_LEVEL}
            required={true}
          />
        </div>
      </div>

      {/* ROW 2 (BOTTOM): Modules | Duration | Semesters/Terms - all centers aligned */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {/* Modules wheel - offset LEFT to align below Level */}
        <div style={{
          marginRight: `${HORIZONTAL_OFFSET - 20}px`,
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <DurationWheel
            value={values.modules}
            min={0}
            max={12}
            label="MODULES"
            onChange={(v) => handleChange('modules', v)}
            size={SIZE_STRUCTURE}
            isStructure={true}
          />
        </div>

        {/* Duration wheel - centered */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

        {/* Semesters/Terms wheel - offset RIGHT to align below Seniority */}
        <div style={{
          marginLeft: `${HORIZONTAL_OFFSET - 20}px`,
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {showTerms ? (
            <DurationWheel
              value={values.terms}
              min={0}
              max={6}
              label="TERMS"
              onChange={(v) => handleChange('terms', v)}
              size={SIZE_STRUCTURE}
              isStructure={true}
            />
          ) : (
            <DurationWheel
              value={values.semesters}
              min={0}
              max={6}
              label="SEMESTERS"
              onChange={(v) => handleChange('semesters', v)}
              size={SIZE_STRUCTURE}
              isStructure={true}
            />
          )}
          {/* Toggle button */}
          <button
            onClick={handleToggleStructureType}
            style={{
              marginTop: '4px',
              padding: '2px 8px',
              fontSize: '0.75vh',
              fontFamily: THEME.FONT_PRIMARY,
              color: THEME.TEXT_DIM,
              background: 'transparent',
              border: `1px solid ${THEME.BORDER}`,
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = THEME.AMBER
              e.target.style.color = THEME.AMBER
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = THEME.BORDER
              e.target.style.color = THEME.TEXT_DIM
            }}
          >
            ↔ {showTerms ? 'SEM' : 'TERM'}
          </button>
        </div>
      </div>

      {/* Structure summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: '0.8vh',
          fontFamily: THEME.FONT_MONO,
          color: THEME.TEXT_DIM
        }}
      >
        {getStructure()}
      </div>

      {/* Summary Row - compact */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5vw',
          fontSize: '0.9vh',
          fontFamily: THEME.FONT_MONO,
          padding: '0.3vh 0',
          borderTop: `1px solid ${THEME.BORDER}`,
          marginTop: '0.3vh'
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

      {/* Validation message - compact */}
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
          * Duration, Level and Seniority required
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
