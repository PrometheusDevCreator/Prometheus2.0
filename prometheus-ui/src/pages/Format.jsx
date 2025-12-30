/**
 * Format Page - Template Mapping Engine
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

import { useState, useCallback } from 'react'
import { THEME } from '../constants/theme'
import Footer from '../components/Footer'
import { TemplateProvider, useTemplate } from '../contexts/TemplateContext'

// Format components
import TemplateHub from '../components/format/TemplateHub'
import OutputConfigPanel from '../components/format/OutputConfigPanel'
import PlannedOutputs from '../components/format/PlannedOutputs'

/**
 * FormatContent - Inner content component (inside TemplateProvider)
 */
function FormatContent({ onNavigate, user, courseState, exitPending }) {
  const { isLoading, error, clearError } = useTemplate()

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
          overflow: 'hidden'
        }}
      >
        {/* Left/Center Area - Hub and Planned Outputs */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Template Hub - Central radial component */}
          <TemplateHub />

          {/* More Outputs - Planned placeholders */}
          <PlannedOutputs />
        </div>

        {/* Right Panel - Configuration */}
        <OutputConfigPanel />
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
