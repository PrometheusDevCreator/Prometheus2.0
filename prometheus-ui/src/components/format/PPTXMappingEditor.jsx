/**
 * PPTXMappingEditor.jsx - PPTX-Specific Mapping UI
 *
 * FORMAT Page Component
 *
 * Provides:
 * - Slide type → layout assignment dropdowns
 * - Placeholder → content source mapping
 * - Running order rules configuration
 * - "Check Mapping" button (CORRECTION #3: informational, not gating)
 *
 * All mutations go through TemplateContext.updatePPTXMapping()
 */

import { useState, useCallback, useEffect } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate, SLIDE_TYPES, CONTENT_SOURCES } from '../../contexts/TemplateContext'

// Running order rule options
const RUNNING_ORDER_RULES = [
  { id: 'start_with_agenda', label: 'Start with Agenda slide', description: 'First slide is always Agenda' },
  { id: 'end_with_summary', label: 'End with Summary slide', description: 'Last slide is always Summary' },
  { id: 'title_before_content', label: 'Title before content', description: 'Lesson title precedes content slides' },
  { id: 'auto_breaks', label: 'Auto-insert break slides', description: 'Insert breaks at configured intervals' }
]

function PPTXMappingEditor() {
  const {
    activeProfile,
    updatePPTXMapping,
    checkMapping
  } = useTemplate()

  // Local state for editing (synced to context on change)
  const [slideTypeToLayout, setSlideTypeToLayout] = useState({})
  const [placeholderMap, setPlaceholderMap] = useState({})
  const [runningOrder, setRunningOrder] = useState([])
  const [expandedSection, setExpandedSection] = useState('slide-types')

  // Get analysis data from profile
  const analysis = activeProfile?.analysis?.pptx
  const existingMapping = activeProfile?.mapping?.pptx
  const layouts = analysis?.layouts || []
  const placeholders = analysis?.placeholders || []

  // Initialize from existing mapping
  useEffect(() => {
    if (existingMapping) {
      setSlideTypeToLayout(existingMapping.slideTypeToLayout || {})
      setPlaceholderMap(existingMapping.placeholderMap || {})
      setRunningOrder(existingMapping.runningOrder || [])
    }
  }, [existingMapping])

  // Save mapping to context
  const saveMapping = useCallback(async (updates) => {
    const newMapping = {
      slideTypeToLayout: updates.slideTypeToLayout ?? slideTypeToLayout,
      placeholderMap: updates.placeholderMap ?? placeholderMap,
      runningOrder: updates.runningOrder ?? runningOrder
    }
    await updatePPTXMapping(newMapping)
  }, [slideTypeToLayout, placeholderMap, runningOrder, updatePPTXMapping])

  // Handle slide type to layout change
  const handleLayoutChange = useCallback((slideTypeId, layoutId) => {
    const updated = {
      ...slideTypeToLayout,
      [slideTypeId]: layoutId || null
    }
    setSlideTypeToLayout(updated)
    saveMapping({ slideTypeToLayout: updated })
  }, [slideTypeToLayout, saveMapping])

  // Handle placeholder mapping change
  const handlePlaceholderChange = useCallback((layoutId, placeholderIndex, contentSourceId) => {
    const key = `${layoutId}:${placeholderIndex}`
    const updated = {
      ...placeholderMap,
      [key]: contentSourceId || null
    }
    setPlaceholderMap(updated)
    saveMapping({ placeholderMap: updated })
  }, [placeholderMap, saveMapping])

  // Handle running order rule toggle
  const handleRunningOrderToggle = useCallback((ruleId) => {
    const updated = runningOrder.includes(ruleId)
      ? runningOrder.filter(id => id !== ruleId)
      : [...runningOrder, ruleId]
    setRunningOrder(updated)
    saveMapping({ runningOrder: updated })
  }, [runningOrder, saveMapping])

  // Toggle section
  const toggleSection = useCallback((sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId)
  }, [])

  // Check mapping status
  const mappingStatus = checkMapping('presentation')

  if (!analysis) {
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
            letterSpacing: '1px',
            color: THEME.TEXT_MUTED,
            fontFamily: THEME.FONT_PRIMARY
          }}
        >
          Upload a PPTX template to configure mapping
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Section 1: Slide Type to Layout Mapping */}
      <CollapsibleSection
        title="SLIDE TYPE LAYOUTS"
        subtitle={`${Object.keys(slideTypeToLayout).filter(k => slideTypeToLayout[k]).length}/${SLIDE_TYPES.length} mapped`}
        isExpanded={expandedSection === 'slide-types'}
        onToggle={() => toggleSection('slide-types')}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {SLIDE_TYPES.map((slideType) => (
            <div
              key={slideType.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '120px',
                  fontSize: '10px',
                  color: THEME.TEXT_SECONDARY,
                  fontFamily: THEME.FONT_PRIMARY,
                  flexShrink: 0
                }}
              >
                {slideType.label}
              </div>
              <select
                value={slideTypeToLayout[slideType.id] || ''}
                onChange={(e) => handleLayoutChange(slideType.id, e.target.value)}
                style={{
                  flex: 1,
                  height: '28px',
                  background: THEME.BG_PANEL,
                  border: `1px solid ${THEME.BORDER}`,
                  borderRadius: '3px',
                  color: THEME.TEXT_PRIMARY,
                  fontSize: '10px',
                  fontFamily: THEME.FONT_MONO,
                  padding: '0 8px',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select Layout --</option>
                {layouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name} ({layout.placeholderCount} placeholders)
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Section 2: Placeholder Content Mapping */}
      <CollapsibleSection
        title="PLACEHOLDER CONTENT"
        subtitle={`${Object.keys(placeholderMap).filter(k => placeholderMap[k]).length} configured`}
        isExpanded={expandedSection === 'placeholders'}
        onToggle={() => toggleSection('placeholders')}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {layouts.filter(layout =>
            Object.values(slideTypeToLayout).includes(layout.id)
          ).map((layout) => {
            const layoutPlaceholders = placeholders.filter(p => p.layoutId === layout.id)

            return (
              <div key={layout.id}>
                <div
                  style={{
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: THEME.AMBER,
                    fontFamily: THEME.FONT_PRIMARY,
                    marginBottom: '6px',
                    paddingBottom: '4px',
                    borderBottom: `1px solid ${THEME.BORDER}`
                  }}
                >
                  {layout.name.toUpperCase()}
                </div>

                {layoutPlaceholders.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      paddingLeft: '8px'
                    }}
                  >
                    {layoutPlaceholders.map((placeholder) => {
                      const key = `${layout.id}:${placeholder.index}`
                      return (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div
                            style={{
                              width: '80px',
                              fontSize: '9px',
                              color: THEME.TEXT_MUTED,
                              fontFamily: THEME.FONT_MONO,
                              flexShrink: 0
                            }}
                          >
                            [{placeholder.type}]
                          </div>
                          <select
                            value={placeholderMap[key] || ''}
                            onChange={(e) => handlePlaceholderChange(layout.id, placeholder.index, e.target.value)}
                            style={{
                              flex: 1,
                              height: '26px',
                              background: THEME.BG_PANEL,
                              border: `1px solid ${THEME.BORDER}`,
                              borderRadius: '3px',
                              color: THEME.TEXT_PRIMARY,
                              fontSize: '9px',
                              fontFamily: THEME.FONT_MONO,
                              padding: '0 6px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">-- Select Content --</option>
                            {CONTENT_SOURCES.map((source) => (
                              <option key={source.id} value={source.id}>
                                {source.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '9px',
                      color: THEME.TEXT_MUTED,
                      fontFamily: THEME.FONT_MONO,
                      paddingLeft: '8px'
                    }}
                  >
                    No placeholders in this layout
                  </div>
                )}
              </div>
            )
          })}

          {Object.values(slideTypeToLayout).filter(Boolean).length === 0 && (
            <div
              style={{
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                textAlign: 'center',
                padding: '8px'
              }}
            >
              Map slide types to layouts first
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 3: Running Order Rules */}
      <CollapsibleSection
        title="RUNNING ORDER"
        subtitle={`${runningOrder.length} rules active`}
        isExpanded={expandedSection === 'running-order'}
        onToggle={() => toggleSection('running-order')}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {RUNNING_ORDER_RULES.map((rule) => {
            const isActive = runningOrder.includes(rule.id)
            return (
              <div
                key={rule.id}
                onClick={() => handleRunningOrderToggle(rule.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px',
                  background: isActive ? `${THEME.AMBER}10` : 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '3px',
                    border: `1px solid ${isActive ? THEME.AMBER : THEME.BORDER}`,
                    background: isActive ? THEME.AMBER : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}
                >
                  {isActive && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={THEME.BG_DARK} strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isActive ? THEME.TEXT_PRIMARY : THEME.TEXT_SECONDARY,
                      fontFamily: THEME.FONT_PRIMARY,
                      marginBottom: '2px'
                    }}
                  >
                    {rule.label}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: THEME.TEXT_MUTED,
                      fontFamily: THEME.FONT_MONO
                    }}
                  >
                    {rule.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Check Mapping Button (CORRECTION #3) */}
      <div
        style={{
          padding: '12px',
          borderTop: `1px solid ${THEME.BORDER}`
        }}
      >
        <CheckMappingButton status={mappingStatus} />
      </div>
    </div>
  )
}

/**
 * CollapsibleSection - Expandable section container
 */
function CollapsibleSection({ title, subtitle, isExpanded, onToggle, children }) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${THEME.BORDER}`
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          cursor: 'pointer',
          background: isExpanded ? `${THEME.AMBER}08` : 'transparent',
          transition: 'background 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              fontSize: '10px',
              letterSpacing: '1px',
              color: isExpanded ? THEME.AMBER : THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO
              }}
            >
              ({subtitle})
            </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isExpanded ? THEME.AMBER : THEME.TEXT_DIM}
          strokeWidth="2"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          style={{
            padding: '12px'
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * CheckMappingButton - Informational check button (CORRECTION #3)
 * Does NOT gate anything - just provides feedback
 */
function CheckMappingButton({ status }) {
  const [showFeedback, setShowFeedback] = useState(false)

  const handleCheck = () => {
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 3000)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <button
        onClick={handleCheck}
        style={{
          width: '100%',
          height: '32px',
          background: status.valid
            ? `linear-gradient(180deg, ${THEME.GREEN_DARK || '#1a4d1a'} 0%, ${THEME.GREEN_DARKEST || '#0d260d'} 100%)`
            : `linear-gradient(180deg, ${THEME.AMBER_DARK} 0%, ${THEME.AMBER_DARKEST} 100%)`,
          border: `1px solid ${status.valid ? THEME.GREEN_BRIGHT : THEME.AMBER}`,
          borderRadius: '4px',
          color: THEME.TEXT_PRIMARY,
          fontSize: '10px',
          letterSpacing: '2px',
          fontFamily: THEME.FONT_PRIMARY,
          cursor: 'pointer',
          transition: 'opacity 0.15s ease'
        }}
      >
        CHECK MAPPING
      </button>

      {/* Feedback Display */}
      {showFeedback && (
        <div
          style={{
            padding: '8px 12px',
            background: status.valid ? `${THEME.GREEN_BRIGHT}15` : `${THEME.AMBER}15`,
            borderRadius: '4px',
            border: `1px solid ${status.valid ? THEME.GREEN_BRIGHT : THEME.AMBER}30`
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: status.valid ? THEME.GREEN_BRIGHT : THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              marginBottom: status.issues?.length > 0 ? '6px' : 0
            }}
          >
            {status.valid ? 'Mapping configuration complete' : 'Mapping incomplete'}
          </div>
          {status.issues?.length > 0 && (
            <div
              style={{
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO
              }}
            >
              {status.issues.map((issue, i) => (
                <div key={i}>- {issue}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PPTXMappingEditor
