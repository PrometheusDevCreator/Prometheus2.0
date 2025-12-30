/**
 * XLSXMappingEditor.jsx - XLSX Timetable Mapping UI
 *
 * FORMAT Page Component
 *
 * CORRECTION #5: MVP is POSITIONAL ONLY.
 * - Sheet selection
 * - Anchor configuration (Day column, Time row)
 * - Styling rules (type-to-color mapping) DEFERRED to later phase
 *
 * All mutations go through TemplateContext.updateXLSXMapping()
 */

import { useState, useCallback, useEffect } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'

// Column letters for dropdown
const COLUMN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function XLSXMappingEditor() {
  const {
    activeProfile,
    updateXLSXMapping,
    checkMapping
  } = useTemplate()

  // Local state for editing
  const [timetableSheet, setTimetableSheet] = useState('')
  const [dayColumnAnchor, setDayColumnAnchor] = useState('A')
  const [timeRowAnchor, setTimeRowAnchor] = useState(1)
  const [dataStartRow, setDataStartRow] = useState(2)
  const [dataEndColumn, setDataEndColumn] = useState('G')

  // Get analysis data from profile
  const analysis = activeProfile?.analysis?.xlsx
  const existingMapping = activeProfile?.mapping?.xlsx
  const sheets = analysis?.sheets || []

  // Initialize from existing mapping
  useEffect(() => {
    if (existingMapping) {
      setTimetableSheet(existingMapping.timetableSheet || '')
      setDayColumnAnchor(existingMapping.anchors?.dayColumn || 'A')
      setTimeRowAnchor(existingMapping.anchors?.timeRow || 1)
      setDataStartRow(existingMapping.anchors?.dataStartRow || 2)
      setDataEndColumn(existingMapping.anchors?.dataEndColumn || 'G')
    }
  }, [existingMapping])

  // Save mapping to context
  const saveMapping = useCallback(async (updates) => {
    const newMapping = {
      timetableSheet: updates.timetableSheet ?? timetableSheet,
      anchors: {
        dayColumn: updates.dayColumn ?? dayColumnAnchor,
        timeRow: updates.timeRow ?? timeRowAnchor,
        dataStartRow: updates.dataStartRow ?? dataStartRow,
        dataEndColumn: updates.dataEndColumn ?? dataEndColumn
      }
    }
    await updateXLSXMapping(newMapping)
  }, [timetableSheet, dayColumnAnchor, timeRowAnchor, dataStartRow, dataEndColumn, updateXLSXMapping])

  // Handle sheet change
  const handleSheetChange = useCallback((sheetName) => {
    setTimetableSheet(sheetName)
    saveMapping({ timetableSheet: sheetName })
  }, [saveMapping])

  // Handle anchor changes
  const handleDayColumnChange = useCallback((col) => {
    setDayColumnAnchor(col)
    saveMapping({ dayColumn: col })
  }, [saveMapping])

  const handleTimeRowChange = useCallback((row) => {
    const rowNum = parseInt(row, 10) || 1
    setTimeRowAnchor(rowNum)
    saveMapping({ timeRow: rowNum })
  }, [saveMapping])

  const handleDataStartRowChange = useCallback((row) => {
    const rowNum = parseInt(row, 10) || 2
    setDataStartRow(rowNum)
    saveMapping({ dataStartRow: rowNum })
  }, [saveMapping])

  const handleDataEndColumnChange = useCallback((col) => {
    setDataEndColumn(col)
    saveMapping({ dataEndColumn: col })
  }, [saveMapping])

  // Check mapping status
  const mappingStatus = checkMapping('timetable')

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
          Upload an XLSX template to configure mapping
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
      {/* Section 1: Sheet Selection */}
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '1px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '8px'
          }}
        >
          TARGET SHEET
        </div>

        <select
          value={timetableSheet}
          onChange={(e) => handleSheetChange(e.target.value)}
          style={{
            width: '100%',
            height: '32px',
            background: THEME.BG_PANEL,
            border: `1px solid ${THEME.BORDER}`,
            borderRadius: '4px',
            color: THEME.TEXT_PRIMARY,
            fontSize: '11px',
            fontFamily: THEME.FONT_MONO,
            padding: '0 10px',
            cursor: 'pointer'
          }}
        >
          <option value="">-- Select Sheet --</option>
          {sheets.map((sheet) => (
            <option key={sheet.name} value={sheet.name}>
              {sheet.name} ({sheet.rowCount} rows x {sheet.columnCount} cols)
            </option>
          ))}
        </select>
      </div>

      {/* Section 2: Anchor Configuration */}
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '1px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '12px'
          }}
        >
          ANCHOR POSITIONS
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}
        >
          {/* Day Column */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                marginBottom: '4px'
              }}
            >
              Day Column
            </label>
            <select
              value={dayColumnAnchor}
              onChange={(e) => handleDayColumnChange(e.target.value)}
              style={{
                width: '100%',
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
              {COLUMN_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  Column {letter}
                </option>
              ))}
            </select>
          </div>

          {/* Time Row */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                marginBottom: '4px'
              }}
            >
              Time Header Row
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={timeRowAnchor}
              onChange={(e) => handleTimeRowChange(e.target.value)}
              style={{
                width: '100%',
                height: '28px',
                background: THEME.BG_PANEL,
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '3px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '10px',
                fontFamily: THEME.FONT_MONO,
                padding: '0 8px'
              }}
            />
          </div>

          {/* Data Start Row */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                marginBottom: '4px'
              }}
            >
              Data Start Row
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={dataStartRow}
              onChange={(e) => handleDataStartRowChange(e.target.value)}
              style={{
                width: '100%',
                height: '28px',
                background: THEME.BG_PANEL,
                border: `1px solid ${THEME.BORDER}`,
                borderRadius: '3px',
                color: THEME.TEXT_PRIMARY,
                fontSize: '10px',
                fontFamily: THEME.FONT_MONO,
                padding: '0 8px'
              }}
            />
          </div>

          {/* Data End Column */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                color: THEME.TEXT_MUTED,
                fontFamily: THEME.FONT_MONO,
                marginBottom: '4px'
              }}
            >
              Data End Column
            </label>
            <select
              value={dataEndColumn}
              onChange={(e) => handleDataEndColumnChange(e.target.value)}
              style={{
                width: '100%',
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
              {COLUMN_LETTERS.map((letter) => (
                <option key={letter} value={letter}>
                  Column {letter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Visual Preview (simplified) */}
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '1px',
            color: THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            marginBottom: '8px'
          }}
        >
          RANGE PREVIEW
        </div>

        <div
          style={{
            padding: '10px',
            background: THEME.BG_PANEL,
            borderRadius: '4px',
            border: `1px solid ${THEME.BORDER}`,
            fontFamily: THEME.FONT_MONO,
            fontSize: '11px',
            color: THEME.AMBER
          }}
        >
          {timetableSheet ? (
            <>
              <span style={{ color: THEME.TEXT_SECONDARY }}>Sheet: </span>
              {timetableSheet}
              <br />
              <span style={{ color: THEME.TEXT_SECONDARY }}>Header: </span>
              {dayColumnAnchor}{timeRowAnchor}:{dataEndColumn}{timeRowAnchor}
              <br />
              <span style={{ color: THEME.TEXT_SECONDARY }}>Data: </span>
              {dayColumnAnchor}{dataStartRow}:{dataEndColumn}...
            </>
          ) : (
            <span style={{ color: THEME.TEXT_MUTED }}>Select a sheet to preview range</span>
          )}
        </div>
      </div>

      {/* CORRECTION #5: Styling Deferred Notice */}
      <div
        style={{
          padding: '12px',
          borderBottom: `1px solid ${THEME.BORDER}`
        }}
      >
        <div
          style={{
            padding: '10px',
            background: `${THEME.TEXT_MUTED}10`,
            borderRadius: '4px',
            border: `1px dashed ${THEME.BORDER}`,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '9px',
              letterSpacing: '1px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_PRIMARY,
              marginBottom: '4px'
            }}
          >
            STYLING CONFIGURATION
          </div>
          <div
            style={{
              fontSize: '9px',
              color: THEME.TEXT_MUTED,
              fontFamily: THEME.FONT_MONO
            }}
          >
            Type-to-color mapping available in future phase
          </div>
        </div>
      </div>

      {/* Check Mapping Button */}
      <div
        style={{
          padding: '12px'
        }}
      >
        <CheckMappingButton status={mappingStatus} />
      </div>
    </div>
  )
}

/**
 * CheckMappingButton - Same pattern as PPTXMappingEditor
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

export default XLSXMappingEditor
