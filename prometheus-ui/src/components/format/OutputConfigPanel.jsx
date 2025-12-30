/**
 * OutputConfigPanel.jsx - Right-Side Configuration Panel
 *
 * FORMAT Page Component
 *
 * Contains:
 * - ProfileSelector (profile management)
 * - ReformatToolPanel (utility launcher)
 *
 * Displays when an output is selected:
 * - Template status
 * - Upload/Replace/Clear actions
 * - Link to mapping interface (Phase 4+)
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import ProfileSelector from './ProfileSelector'
import ProfileManagerModal from './ProfileManagerModal'
import ReformatToolPanel from './ReformatToolPanel'
import MappingPanel from './MappingPanel'

function OutputConfigPanel() {
  const {
    selectedOutput,
    activeProfile,
    getOutputStatus,
    uploadTemplate,
    clearTemplate,
    isAnalyzing,
    analysisProgress
  } = useTemplate()

  const [modalMode, setModalMode] = useState(null)
  const [modalProfileId, setModalProfileId] = useState(null)

  // File input ref for template upload
  const [fileInputKey, setFileInputKey] = useState(0)

  // Show modal for rename/new
  const handleShowModal = useCallback((mode, profileId = null) => {
    setModalMode(mode)
    setModalProfileId(profileId)
  }, [])

  // Close modal
  const handleCloseModal = useCallback(() => {
    setModalMode(null)
    setModalProfileId(null)
  }, [])

  // Handle file upload
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedOutput) return

    await uploadTemplate(selectedOutput, file)
    setFileInputKey(prev => prev + 1) // Reset file input
  }, [selectedOutput, uploadTemplate])

  // Handle clear
  const handleClear = useCallback(async () => {
    if (selectedOutput) {
      await clearTemplate(selectedOutput)
    }
  }, [selectedOutput, clearTemplate])

  // Get file accept type based on output
  const getFileAccept = () => {
    switch (selectedOutput) {
      case 'presentation': return '.pptx'
      case 'timetable': return '.xlsx'
      case 'lesson_plan':
      case 'qa_form': return '.docx'
      default: return '*'
    }
  }

  const status = selectedOutput ? getOutputStatus(selectedOutput) : 'none'

  return (
    <div
      style={{
        width: '350px',
        height: '100%',
        background: THEME.BG_PANEL || '#1a1a1a',
        borderLeft: `1px solid ${THEME.BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        gap: '24px',
        overflowY: 'auto'
      }}
    >
      {/* Profile Selector Section */}
      <ProfileSelector onShowModal={handleShowModal} />

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: THEME.BORDER,
          margin: '0 -20px'
        }}
      />

      {/* Output Configuration Section */}
      {selectedOutput ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Section Label */}
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '2px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              textAlign: 'center'
            }}
          >
            OUTPUT CONFIGURATION
          </div>

          {/* Selected Output Display */}
          <div
            style={{
              fontSize: '14px',
              letterSpacing: '3px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              textAlign: 'center'
            }}
          >
            {selectedOutput.toUpperCase().replace('_', ' ')}
          </div>

          {/* Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: status === 'mapped' ? THEME.GREEN_BRIGHT :
                           status === 'loaded' ? THEME.AMBER :
                           '#666666'
              }}
            />
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '1px',
                color: THEME.TEXT_DIM,
                fontFamily: THEME.FONT_MONO
              }}
            >
              {status === 'mapped' ? 'MAPPED' :
               status === 'loaded' ? 'LOADED' :
               'NO TEMPLATE'}
            </span>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div
                style={{
                  height: '4px',
                  background: THEME.BG_DARK,
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${analysisProgress}%`,
                    height: '100%',
                    background: THEME.AMBER,
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: THEME.TEXT_DIM,
                  textAlign: 'center',
                  fontFamily: THEME.FONT_MONO
                }}
              >
                Analyzing... {analysisProgress}%
              </div>
            </div>
          )}

          {/* Upload Button */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px',
              background: status === 'none'
                ? `linear-gradient(180deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST} 100%)`
                : 'transparent',
              border: `1px solid ${THEME.AMBER_DARK}`,
              borderRadius: '4px',
              color: THEME.TEXT_PRIMARY,
              fontSize: '10px',
              letterSpacing: '2px',
              fontFamily: THEME.FONT_PRIMARY,
              cursor: isAnalyzing ? 'wait' : 'pointer',
              opacity: isAnalyzing ? 0.5 : 1
            }}
          >
            {status === 'none' ? 'UPLOAD TEMPLATE' : 'REPLACE TEMPLATE'}
            <input
              key={fileInputKey}
              type="file"
              accept={getFileAccept()}
              onChange={handleFileSelect}
              disabled={isAnalyzing}
              style={{ display: 'none' }}
            />
          </label>

          {/* Clear Button (only show if template loaded) */}
          {status !== 'none' && (
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              style={{
                height: '36px',
                background: 'transparent',
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '4px',
                color: THEME.TEXT_SECONDARY,
                fontSize: '10px',
                letterSpacing: '2px',
                fontFamily: THEME.FONT_PRIMARY,
                cursor: isAnalyzing ? 'wait' : 'pointer',
                opacity: isAnalyzing ? 0.5 : 1
              }}
            >
              CLEAR TEMPLATE
            </button>
          )}

          {/* Mapping Panel - Shows when template is loaded */}
          {(status === 'loaded' || status === 'mapped') && (
            <MappingPanel />
          )}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: THEME.TEXT_MUTED,
              fontFamily: THEME.FONT_PRIMARY,
              lineHeight: 1.6
            }}
          >
            Select an output type<br />
            to configure templates
          </div>
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: THEME.BORDER,
          margin: '0 -20px',
          marginTop: 'auto'
        }}
      />

      {/* Reformat Tool Section */}
      <ReformatToolPanel />

      {/* Profile Manager Modal */}
      {modalMode && (
        <ProfileManagerModal
          mode={modalMode}
          profileId={modalProfileId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default OutputConfigPanel
