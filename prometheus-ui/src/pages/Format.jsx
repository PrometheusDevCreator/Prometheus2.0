/**
 * Format Page - Template Mapping Engine
 *
 * CCO-FORMAT-HUB-001: Layout updated per Controller Change Order
 *
 * PURPOSE:
 * - Import proprietary templates (PPTX, XLSX, DOCX)
 * - Analyse templates
 * - Map Prometheus content structures to template structures
 * - Save, recall, and manage Template Profiles
 * - Prepare outputs for GENERATE stage
 *
 * FORMAT does NOT:
 * - Edit course content (DEFINE / DESIGN / BUILD)
 * - Generate final outputs (GENERATE)
 * - Invoke PKE or AI logic
 *
 * ARCHITECTURE:
 * - Uses TemplateContext (separate from DesignContext)
 * - TemplateContext is AUTHORITATIVE for all template state (CORRECTION #1)
 * - IndexedDB for local persistence
 */

import { useCallback } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'
import { TemplateProvider, useTemplate } from '../contexts/TemplateContext'

// Format components
import FormatWheel from '../components/format/FormatWheel'
import TemplateSelector from '../components/format/TemplateSelector'
import FormatToolPanel from '../components/format/FormatToolPanel'
import OutputConfigPanel from '../components/format/OutputConfigPanel'

// Planned output placeholder data
const PLANNED_OUTPUTS = [
  { id: 'learner_handbook', label: 'LEARNER HANDBOOK' },
  { id: 'assessments', label: 'ASSESSMENTS' },
  { id: 'course_info_sheet', label: 'COURSE INFO SHEET' },
  { id: 'user_defined', label: 'USER DEFINED' }
]

/**
 * PlannedOutputNode - Individual placeholder node for left sidebar
 * Display-only, muted styling, no interaction
 */
function PlannedOutputNode({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        opacity: 0.35,
        cursor: 'default',
        pointerEvents: 'none'
      }}
    >
      {/* Circular placeholder */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: THEME.BG_PANEL || '#1a1a1a',
          border: `1px solid ${THEME.BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={THEME.TEXT_MUTED} strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" strokeLinecap="round" />
        </svg>
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '8px',
          letterSpacing: '1px',
          color: THEME.TEXT_MUTED,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center',
          maxWidth: 70,
          lineHeight: 1.3
        }}
      >
        {label}
      </div>

      {/* PLANNED badge */}
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
        PLANNED
      </div>
    </div>
  )
}

/**
 * LeftSidePlaceholders - Vertical column of planned outputs
 * CCO: ~150px from left edge, vertically aligned, evenly spaced
 */
function LeftSidePlaceholders() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        zIndex: 5
      }}
    >
      {PLANNED_OUTPUTS.map((output) => (
        <PlannedOutputNode key={output.id} label={output.label} />
      ))}
    </div>
  )
}

/**
 * FormatContent - Inner content component (inside TemplateProvider)
 *
 * PROGRESSIVE DISCLOSURE:
 * - Initial state: Only wheel + SELECT TEMPLATE visible
 * - Wheel option click: Reveals left tool panel (UPLOAD, MAKE TEMPLATE, CONVERT)
 */
function FormatContent({ onNavigate, user, courseState, exitPending }) {
  const { isLoading, error, clearError, selectedOutput } = useTemplate()

  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: THEME.BG_DARK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            letterSpacing: '3px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          LOADING TEMPLATES...
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: THEME.BG_DARK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Error Banner */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px 16px',
            background: '#FF444420',
            borderBottom: '1px solid #FF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: '#FF4444',
              fontFamily: THEME.FONT_MONO
            }}
          >
            {error}
          </span>
          <button
            onClick={clearError}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FF4444',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Format Wheel - 525px, same as NavigateWheel per Controller directive */}
        <FormatWheel onNavigate={handleNavigate} />

        {/* Template Selector - below wheel on centerline */}
        <div
          style={{
            position: 'fixed',
            left: '50%',
            top: 'calc(50% + 220px)',
            transform: 'translateX(-50%)',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <TemplateSelector />
        </div>

        {/* Left Tool Panel - appears when wheel option is selected */}
        <FormatToolPanel
          isVisible={!!selectedOutput}
          selectedOutput={selectedOutput}
        />

        {/* Left-Side Placeholder Outputs - hidden until tool panel actions complete */}
        {/* <LeftSidePlaceholders /> */}

        {/* Right Panel - hidden until configuration needed */}
        {/* <OutputConfigPanel /> */}
      </div>

      {/* Footer */}
      <Footer
        currentSection="format"
        onNavigate={handleNavigate}
        isPKEActive={false}
        onPKEToggle={() => {}}
        onSave={() => {}}
        onClear={() => {}}
        onDelete={() => {}}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={0}
        exitPending={exitPending}
      />
    </div>
  )
}

/**
 * Format Page - Wrapped with TemplateProvider
 *
 * CORRECTION #1: TemplateProvider is AUTHORITATIVE.
 * App.jsx only provides this wrapper - it does NOT manipulate templateData.
 */
function Format({ onNavigate, courseLoaded, user, courseState, exitPending }) {
  return (
    <TemplateProvider>
      <FormatContent
        onNavigate={onNavigate}
        user={user}
        courseState={courseState}
        exitPending={exitPending}
      />
    </TemplateProvider>
  )
}

export default Format
