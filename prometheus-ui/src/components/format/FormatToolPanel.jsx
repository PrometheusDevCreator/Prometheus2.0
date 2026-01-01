/**
 * FormatToolPanel - Left-side tool panel for FORMAT page
 *
 * Progressive disclosure:
 * 1. Initially hidden
 * 2. Appears when wheel option is selected (HANDBOOK, LESSON PLAN, etc.)
 * 3. UPLOAD click reveals DRAG FILE/BROWSE lozenge
 * 4. CONVERT click reveals file type buttons
 * 5. File type click reveals 'Select Template' lozenge
 *
 * Layout per observations:
 * - UPLOAD and MAKE TEMPLATE positioned UP 400px total
 * - CONVERT positioned lower (DOWN 150px)
 * - Main buttons 30% larger (78px)
 * - File type buttons 25% larger (63px) with metallic gradient borders
 * - DRAG FILE/BROWSE is lozenge shape (half PKE size)
 * - Select Template is lozenge shape (50% of footer buttons)
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'

// Button sizes
const MAIN_BUTTON_SIZE = 78  // 60px + 30%
const FILE_BUTTON_SIZE = 63  // 50px + 25%

// PKE lozenge gradient for borders
const PKE_GRADIENT = 'linear-gradient(to right, #3b3838, #767171 25%, #ffffff 50%, #767171 75%, #3b3838)'

// File type colors with metallic gradients
const FILE_COLORS = {
  docx: {
    solid: '#2B579A',  // Microsoft Word blue
    gradient: 'linear-gradient(135deg, #1a3d6e, #2B579A 30%, #5a8fd4 50%, #2B579A 70%, #1a3d6e)'
  },
  pptx: {
    solid: '#D24726',  // Microsoft PowerPoint red
    gradient: 'linear-gradient(135deg, #8a2a14, #D24726 30%, #f06d4d 50%, #D24726 70%, #8a2a14)'
  },
  excel: {
    solid: '#217346',  // Microsoft Excel green
    gradient: 'linear-gradient(135deg, #144a2c, #217346 30%, #3cb371 50%, #217346 70%, #144a2c)'
  },
  txt: {
    solid: '#6e6e6e',  // Grey
    gradient: 'linear-gradient(135deg, #3d3d3d, #6e6e6e 30%, #9e9e9e 50%, #6e6e6e 70%, #3d3d3d)'
  }
}

/**
 * CircleButton - Reusable circle button component with glow effects
 */
function CircleButton({
  label,
  onClick,
  isActive = false,
  color = THEME.AMBER,
  size = MAIN_BUTTON_SIZE,
  fontSize = 11,
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${isActive || isHovered ? color : THEME.AMBER_DARK}`,
        background: isActive ? `${color}20` : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isActive
          ? `0 0 25px ${color}60, 0 0 50px ${color}30`
          : isHovered
            ? `0 0 20px ${color}50`
            : 'none',
        ...style
      }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`,
          letterSpacing: '1px',
          color: isActive || isHovered ? color : THEME.TEXT_DIM,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center',
          lineHeight: 1.2,
          padding: '4px'
        }}
      >
        {label}
      </span>
    </div>
  )
}

/**
 * LozengeBrowseButton - Lozenge-shaped DRAG FILE/BROWSE button
 * Half the size of PKE window (454x38 from 908x76)
 */
function LozengeBrowseButton({
  onClick,
  isVisible = true
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (!isVisible) return null

  // Half PKE size: 454x38, borderRadius 19
  const width = 160  // Smaller for practical UI
  const height = 38
  const borderRadius = height / 2

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        padding: '1px',
        background: isHovered ? THEME.AMBER : PKE_GRADIENT,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        boxShadow: isHovered ? `0 0 15px ${THEME.AMBER}50` : 'none'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: THEME.BG_DARK,
          borderRadius: `${borderRadius - 1}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            letterSpacing: '0.5px',
            color: isHovered ? THEME.AMBER : THEME.TEXT_MUTED,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          DRAG FILE / BROWSE
        </span>
      </div>
    </div>
  )
}

/**
 * FileTypeButton - Colored file type button with metallic gradient border
 */
function FileTypeButton({
  label,
  onClick,
  colorKey,
  isActive = false,
  isVisible = true,
  size = FILE_BUTTON_SIZE
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = FILE_COLORS[colorKey]

  if (!isVisible) return null

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: '2px',
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isActive
          ? `0 0 20px ${colors.solid}80, 0 0 40px ${colors.solid}40`
          : isHovered
            ? `0 0 15px ${colors.solid}60`
            : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: isActive ? `${colors.solid}30` : THEME.BG_DARK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.5px',
            color: isActive ? '#FFFFFF' : isHovered ? colors.solid : THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center'
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

/**
 * LozengeSelectButton - 'Select Template' lozenge button (50% of footer buttons)
 * Aligned horizontally with parent file type button
 */
function LozengeSelectButton({
  colorKey,
  isVisible = true,
  onClick
}) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = FILE_COLORS[colorKey]

  if (!isVisible) return null

  // 75% of footer button size (50% base + 50% increase)
  // Footer: padding '1.3vh 1.88vw', borderRadius '1.85vh'
  // At 75%: approximately 105px wide, 36px tall
  const width = 105
  const height = 36
  const borderRadius = height / 2

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        border: `1px solid ${isHovered ? colors.solid : THEME.BORDER}`,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
        boxShadow: isHovered ? `0 0 12px ${colors.solid}50` : 'none'
      }}
    >
      <span
        style={{
          fontSize: '11px',
          letterSpacing: '0.5px',
          color: isHovered ? colors.solid : THEME.TEXT_MUTED,
          fontFamily: THEME.FONT_PRIMARY,
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        Select Template
      </span>
    </div>
  )
}

function FormatToolPanel({ isVisible, selectedOutput }) {
  // Progressive disclosure state
  const [uploadActive, setUploadActive] = useState(false)
  const [convertActive, setConvertActive] = useState(false)
  const [activeFileType, setActiveFileType] = useState(null) // 'docx' | 'pptx' | 'excel' | 'txt'

  // Gap between file type buttons
  const FILE_BUTTON_GAP = 12

  // Handle UPLOAD click
  const handleUploadClick = useCallback(() => {
    setUploadActive(!uploadActive)
  }, [uploadActive])

  // Handle CONVERT click
  const handleConvertClick = useCallback(() => {
    setConvertActive(!convertActive)
    if (convertActive) {
      setActiveFileType(null) // Reset file type when closing
    }
  }, [convertActive])

  // Handle file type click
  const handleFileTypeClick = useCallback((type) => {
    setActiveFileType(activeFileType === type ? null : type)
  }, [activeFileType])

  if (!isVisible) return null

  // Calculate horizontal offset for lozenge to align with parent button center
  const getLozengeOffset = (fileType) => {
    const baseOffset = MAIN_BUTTON_SIZE + FILE_BUTTON_GAP // After CONVERT button
    const fileTypeIndex = ['docx', 'pptx', 'excel'].indexOf(fileType)
    if (fileTypeIndex === -1) return 0

    // Center the lozenge under its parent button
    const lozengeWidth = 105
    const buttonCenterOffset = (FILE_BUTTON_SIZE - lozengeWidth) / 2
    return baseOffset + (fileTypeIndex * (FILE_BUTTON_SIZE + FILE_BUTTON_GAP)) + buttonCenterOffset
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* UPLOAD and MAKE TEMPLATE group - positioned UP 300px from center */}
      <div
        style={{
          position: 'absolute',
          top: -300,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Row 1: UPLOAD + DRAG FILE/BROWSE lozenge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CircleButton
            label="UPLOAD"
            onClick={handleUploadClick}
            isActive={uploadActive}
          />
          <LozengeBrowseButton
            isVisible={uploadActive}
            onClick={() => {}}
          />
        </div>

        {/* Row 2: MAKE TEMPLATE */}
        <CircleButton
          label={<>MAKE<br />TEMPLATE</>}
          onClick={() => {}}
        />
      </div>

      {/* CONVERT group - positioned DOWN 150px from center */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: `${FILE_BUTTON_GAP}px` }}>
          <CircleButton
            label="CONVERT"
            onClick={handleConvertClick}
            isActive={convertActive}
          />

          {/* File type buttons with metallic gradient borders */}
          <FileTypeButton
            label="To DOCX"
            colorKey="docx"
            isVisible={convertActive}
            isActive={activeFileType === 'docx'}
            onClick={() => handleFileTypeClick('docx')}
          />
          <FileTypeButton
            label="To PPTX"
            colorKey="pptx"
            isVisible={convertActive}
            isActive={activeFileType === 'pptx'}
            onClick={() => handleFileTypeClick('pptx')}
          />
          <FileTypeButton
            label="To EXCEL"
            colorKey="excel"
            isVisible={convertActive}
            isActive={activeFileType === 'excel'}
            onClick={() => handleFileTypeClick('excel')}
          />
          <FileTypeButton
            label="To TXT"
            colorKey="txt"
            isVisible={convertActive}
            isActive={activeFileType === 'txt'}
            onClick={() => handleFileTypeClick('txt')}
          />
        </div>

        {/* Select Template lozenges - align horizontally with parent file type button */}
        {convertActive && activeFileType && activeFileType !== 'txt' && (
          <div
            style={{
              position: 'relative',
              height: 34,
              marginTop: '8px'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: getLozengeOffset(activeFileType),
                top: 0
              }}
            >
              <LozengeSelectButton
                colorKey={activeFileType}
                isVisible={true}
                onClick={() => {}}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormatToolPanel
