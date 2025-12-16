/**
 * Define Page - Slide 3 of Mockup 2.1
 *
 * Three-column layout:
 * - Left: DETAILS (Title, Thematic, Module, Duration, Level, Seniority)
 * - Center: DESCRIPTION (textarea + delivery buttons + toggles)
 * - Right: LEARNING OBJECTIVES (numbered list with + buttons)
 *
 * Features:
 * - Discrete-snap sliders for Level and Seniority
 * - Duration slider with unit dropdown
 * - Delivery mode toggle buttons
 * - Mini NavWheel in bottom-left
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { THEME, LEVEL_OPTIONS, SENIORITY_OPTIONS, DELIVERY_OPTIONS } from '../constants/theme'
import Slider from '../components/Slider'
import DurationSlider from '../components/DurationSlider'
import GradientBorder from '../components/GradientBorder'
import Footer from '../components/Footer'
import pkeButton from '../assets/PKE_Button.png'

// ============================================
// DEFINE LAYOUT TOKENS (Phase 3R)
// Consuming CSS variables from index.css :root
// ============================================
const D = {
  // spacing
  pad: 'var(--define-pad)',
  gapLg: 'var(--define-gap-lg)',
  gapMd: 'var(--define-gap-md)',
  gapSm: 'var(--define-gap-sm)',

  // sizing
  sliderW: 'var(--define-slider-w)',
  textareaMinH: 'var(--define-textarea-min-h)',

  // positioning
  pkeTop: 'var(--define-pke-top)',

  // typography
  fs18: 'var(--define-fs-18)',
  fs15: 'var(--define-fs-15)',
  fs14: 'var(--define-fs-14)',
}

// Bloom's Taxonomy verbs - defined at module level (static, never changes)
const BLOOMS_CATEGORIES = [
  { name: 'REMEMBER', verbs: ['DEFINE', 'DESCRIBE', 'IDENTIFY', 'LIST', 'NAME', 'RECALL', 'RECOGNIZE', 'STATE'] },
  { name: 'UNDERSTAND', verbs: ['CLASSIFY', 'COMPARE', 'CONTRAST', 'EXPLAIN', 'INTERPRET', 'PARAPHRASE', 'SUMMARIZE', 'DISCUSS'] },
  { name: 'APPLY', verbs: ['APPLY', 'DEMONSTRATE', 'EXECUTE', 'IMPLEMENT', 'OPERATE', 'PERFORM', 'SOLVE', 'USE'] },
  { name: 'ANALYZE', verbs: ['ANALYSE', 'ANALYZE', 'DIFFERENTIATE', 'DISTINGUISH', 'EXAMINE', 'INVESTIGATE', 'ORGANIZE', 'RELATE'] },
  { name: 'EVALUATE', verbs: ['APPRAISE', 'ASSESS', 'CRITIQUE', 'EVALUATE', 'JUDGE', 'JUSTIFY', 'RECOMMEND', 'SUPPORT'] },
  { name: 'CREATE', verbs: ['COMPOSE', 'CONSTRUCT', 'CREATE', 'DESIGN', 'DEVELOP', 'FORMULATE', 'GENERATE', 'PRODUCE'] }
]

// Flat list of all Bloom's verbs for validation
const BLOOMS_VERBS = BLOOMS_CATEGORIES.flatMap(cat => cat.verbs)

function Define({ onNavigate, courseData, setCourseData, courseLoaded, user, courseState, onSaveCountIncrement }) {
  const [isPKEActive, setIsPKEActive] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [hoveredField, setHoveredField] = useState(null)
  const [hoveredHeader, setHoveredHeader] = useState(null) // Track which column header is hovered
  const [activeColumn, setActiveColumn] = useState(null) // 'left' | 'center' | 'right' | null
  const [activeLOIndex, setActiveLOIndex] = useState(null) // Track which LO input is focused for verb insertion
  const [bloomsExpanded, setBloomsExpanded] = useState(false) // Bloom's Taxonomy section expanded state
  const [isContentTypeDragging, setIsContentTypeDragging] = useState(false) // Content Type slider drag state
  const contentTypeSliderRef = useRef(null) // Ref for Content Type slider track
  const [loConfirmedUpTo, setLoConfirmedUpTo] = useState(-1) // Track confirmed LOs (green) - index up to which are confirmed
  const [invalidLOPulse, setInvalidLOPulse] = useState(null) // Track which LO should show red pulse
  const loInputRefs = useRef({}) // Refs for LO inputs to handle focus

  // Delete workflow state
  const [deleteLoIndex, setDeleteLoIndex] = useState(null) // Which LO is being deleted
  const [deleteStep, setDeleteStep] = useState(null) // 'confirm' | 'keep-confirm' | 'delete-confirm'
  const [wastebinState, setWastebinState] = useState({}) // { [idx]: 'normal' | 'green' | 'red' }

  // Map field names to columns
  const getColumnForField = useCallback((field) => {
    if (!field) return null
    const leftFields = ['title', 'thematic', 'module', 'code', 'duration', 'durationUnit', 'level', 'seniority']
    const centerFields = ['description', 'qualification', 'accredited', 'certified', 'delivery']
    if (leftFields.includes(field)) return 'left'
    if (centerFields.includes(field)) return 'center'
    if (field.startsWith('lo-')) return 'right'
    return null
  }, [])

  // Handle field focus with column tracking
  const handleFieldFocus = useCallback((field) => {
    setFocusedField(field)
    const column = getColumnForField(field)
    if (column) setActiveColumn(column)
    // Track LO index for verb insertion
    if (field && field.startsWith('lo-')) {
      setActiveLOIndex(parseInt(field.split('-')[1]))
    }
  }, [getColumnForField])

  // Reset active column (called by action buttons)
  const resetActiveColumn = useCallback(() => {
    setActiveColumn(null)
    setFocusedField(null)
    setActiveLOIndex(null)
  }, [])

  // Form state
  const [formData, setFormData] = useState({
    title: courseData?.title || '',
    thematic: courseData?.thematic || '',
    module: courseData?.module || 1,
    code: courseData?.code || '',
    duration: courseData?.duration || 1,
    durationUnit: courseData?.durationUnit || 'Hours',
    level: courseData?.level || 'Foundational',
    seniority: courseData?.seniority || 'Junior',
    description: courseData?.description || '',
    deliveryModes: courseData?.deliveryModes || [],
    contentType: courseData?.contentType || 50, // 0=100% Theory, 100=100% Practical, 50=balanced
    qualification: courseData?.qualification || false,
    accredited: courseData?.accredited || false,
    certified: courseData?.certified || false,
    learningObjectives: courseData?.learningObjectives || ['']
  })

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Toggle delivery mode
  const toggleDelivery = useCallback((mode) => {
    setFormData(prev => ({
      ...prev,
      deliveryModes: prev.deliveryModes.includes(mode)
        ? prev.deliveryModes.filter(m => m !== mode)
        : [...prev.deliveryModes, mode]
    }))
  }, [])

  // Check if LO starts with a Bloom's verb (uses module-level BLOOMS_VERBS)
  const validateBloomsVerb = useCallback((text) => {
    if (!text || text.trim().length === 0) return null // No validation for empty
    const firstWord = text.trim().split(/\s+/)[0].toUpperCase()
    return BLOOMS_VERBS.includes(firstWord)
  }, [])

  // Learning objectives handlers
  const updateLO = useCallback((index, value) => {
    setFormData(prev => {
      const newLOs = [...prev.learningObjectives]
      newLOs[index] = value
      return { ...prev, learningObjectives: newLOs }
    })
  }, [])

  // Auto-capitalize first word of LO on blur/Enter
  const capitalizeFirstWord = useCallback((index) => {
    setFormData(prev => {
      const newLOs = [...prev.learningObjectives]
      const text = newLOs[index]
      if (text && text.trim().length > 0) {
        const words = text.trim().split(/\s+/)
        words[0] = words[0].toUpperCase()
        newLOs[index] = words.join(' ')
      }
      return { ...prev, learningObjectives: newLOs }
    })
  }, [])

  // Validate and show red pulse if LO doesn't start with Bloom's verb
  const validateAndPulse = useCallback((index) => {
    const lo = formData.learningObjectives[index]
    if (lo && lo.trim().length > 0) {
      const isValid = validateBloomsVerb(lo)
      if (!isValid) {
        setInvalidLOPulse(index)
        setTimeout(() => setInvalidLOPulse(null), 600)
      }
    }
  }, [formData.learningObjectives, validateBloomsVerb])

  const addLO = useCallback(() => {
    // Get the last LO to validate
    const lastLO = formData.learningObjectives[formData.learningObjectives.length - 1]
    const isValid = validateBloomsVerb(lastLO)

    // If last LO has text but doesn't start with Bloom's verb, show red pulse and prevent adding
    if (lastLO && lastLO.trim().length > 0 && !isValid) {
      const lastIndex = formData.learningObjectives.length - 1
      setInvalidLOPulse(lastIndex)
      // Clear pulse after animation
      setTimeout(() => setInvalidLOPulse(null), 600)
      return
    }

    const newIndex = formData.learningObjectives.length
    setFormData(prev => {
      // Confirm all current LOs (turn green) before adding new one
      setLoConfirmedUpTo(prev.learningObjectives.length - 1)
      return {
        ...prev,
        learningObjectives: [...prev.learningObjectives, '']
      }
    })
    // Set active LO to the new one for verb insertion
    setActiveLOIndex(newIndex)
    // Focus the new input after render
    setTimeout(() => {
      loInputRefs.current[newIndex]?.focus()
    }, 50)
  }, [formData.learningObjectives, validateBloomsVerb])

  // Check if field is active
  const isFieldActive = useCallback((field) => {
    return focusedField === field || (focusedField === null && hoveredField === field)
  }, [focusedField, hoveredField])

  // Handle navigation (resets active column)
  const handleNavigate = useCallback((section) => {
    resetActiveColumn()
    onNavigate?.(section)
  }, [onNavigate, resetActiveColumn])

  // Check if any LO has invalid content (non-empty but doesn't start with Bloom's verb)
  const hasInvalidLOs = useCallback(() => {
    return formData.learningObjectives.some(lo => {
      if (!lo || lo.trim().length === 0) return false // Empty is OK
      return !validateBloomsVerb(lo)
    })
  }, [formData.learningObjectives, validateBloomsVerb])

  // Get indices of invalid LOs
  const getInvalidLOIndices = useCallback(() => {
    return formData.learningObjectives.reduce((indices, lo, idx) => {
      if (lo && lo.trim().length > 0 && !validateBloomsVerb(lo)) {
        indices.push(idx)
      }
      return indices
    }, [])
  }, [formData.learningObjectives, validateBloomsVerb])

  // Handle save (resets active column) - blocked if invalid LOs exist
  const handleSave = useCallback(() => {
    // Check for invalid LOs
    const invalidIndices = getInvalidLOIndices()
    if (invalidIndices.length > 0) {
      // Pulse all invalid LOs sequentially
      invalidIndices.forEach((idx, i) => {
        setTimeout(() => {
          setInvalidLOPulse(idx)
          setTimeout(() => setInvalidLOPulse(null), 600)
        }, i * 200)
      })
      return // Block save
    }

    setCourseData?.(formData)
    setIsPKEActive(false)
    // Confirm all LOs (turn green) on save
    setLoConfirmedUpTo(formData.learningObjectives.length - 1)
    onSaveCountIncrement?.()
    resetActiveColumn()
  }, [formData, setCourseData, onSaveCountIncrement, resetActiveColumn, getInvalidLOIndices])

  // Handle clear (resets active column)
  const handleClear = useCallback(() => {
    setFormData({
      title: '',
      thematic: '',
      module: 1,
      code: '',
      duration: 1,
      durationUnit: 'Hours',
      level: 'Foundational',
      seniority: 'Junior',
      description: '',
      deliveryModes: [],
      contentType: 50,
      qualification: false,
      accredited: false,
      certified: false,
      learningObjectives: ['']
    })
    setLoConfirmedUpTo(-1) // Reset LO confirmation state
    resetActiveColumn()
  }, [resetActiveColumn])

  // Handle delete (resets active column)
  const handleDelete = useCallback(() => {
    resetActiveColumn()
  }, [resetActiveColumn])

  // Handle wastebin click - initiates delete workflow via PKE
  const handleWastebinClick = useCallback((idx) => {
    if (deleteStep === null) {
      // First click - show initial warning in PKE
      setDeleteLoIndex(idx)
      setDeleteStep('confirm')
      setIsPKEActive(true)
    } else if (deleteLoIndex === idx) {
      // Second click on same wastebin - execute deletion
      if (deleteStep === 'keep-confirm') {
        // Keep topics/subtopics, delete LO only
        deleteLO(idx, false)
      } else if (deleteStep === 'delete-confirm') {
        // Delete LO and related topics/subtopics
        deleteLO(idx, true)
      }
      // Reset delete state
      setDeleteLoIndex(null)
      setDeleteStep(null)
      setWastebinState({})
      setIsPKEActive(false)
    }
  }, [deleteStep, deleteLoIndex])

  // Handle KEEP selection in PKE
  const handleKeepSelection = useCallback(() => {
    setDeleteStep('keep-confirm')
    setWastebinState(prev => ({ ...prev, [deleteLoIndex]: 'green' }))
  }, [deleteLoIndex])

  // Handle DELETE selection in PKE
  const handleDeleteSelection = useCallback(() => {
    setDeleteStep('delete-confirm')
    setWastebinState(prev => ({ ...prev, [deleteLoIndex]: 'red' }))
  }, [deleteLoIndex])

  // Cancel delete workflow
  const cancelDeleteWorkflow = useCallback(() => {
    setDeleteLoIndex(null)
    setDeleteStep(null)
    setWastebinState({})
    setIsPKEActive(false)
  }, [])

  // Delete LO function
  const deleteLO = useCallback((idx, deleteRelated) => {
    setFormData(prev => {
      const newLOs = prev.learningObjectives.filter((_, i) => i !== idx)
      // Ensure at least one LO remains
      if (newLOs.length === 0) newLOs.push('')
      return { ...prev, learningObjectives: newLOs }
    })
    // Adjust loConfirmedUpTo if needed
    if (idx <= loConfirmedUpTo) {
      setLoConfirmedUpTo(prev => Math.max(-1, prev - 1))
    }
    // TODO: Handle topics/subtopics based on deleteRelated flag
    // This will integrate with the DESIGN page Scalar functionality
  }, [loConfirmedUpTo])

  // Content Type slider drag handlers
  const handleContentTypeInteraction = useCallback((clientX) => {
    if (!contentTypeSliderRef.current) return
    const rect = contentTypeSliderRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    updateField('contentType', Math.round(Math.max(0, Math.min(100, percentage))))
    setActiveColumn('center')
  }, [updateField])

  const handleContentTypeMouseDown = useCallback((e) => {
    setIsContentTypeDragging(true)
    handleContentTypeInteraction(e.clientX)
  }, [handleContentTypeInteraction])

  const handleContentTypeMouseMove = useCallback((e) => {
    if (isContentTypeDragging) {
      handleContentTypeInteraction(e.clientX)
    }
  }, [isContentTypeDragging, handleContentTypeInteraction])

  const handleContentTypeMouseUp = useCallback(() => {
    setIsContentTypeDragging(false)
  }, [])

  // Add/remove global mouse listeners for Content Type slider drag
  useEffect(() => {
    if (isContentTypeDragging) {
      window.addEventListener('mousemove', handleContentTypeMouseMove)
      window.addEventListener('mouseup', handleContentTypeMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleContentTypeMouseMove)
      window.removeEventListener('mouseup', handleContentTypeMouseUp)
    }
  }, [isContentTypeDragging, handleContentTypeMouseMove, handleContentTypeMouseUp])

  // Thematic options
  const thematicOptions = [
    'Defence & Security',
    'Intelligence',
    'Policing',
    'Leadership & Management',
    'Crisis Response',
    'Resilience',
    'Personal Skills'
  ]

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
      {/* PKE Button - centered horizontally at Y:600 */}
      <div
        style={{
          position: 'absolute',
          top: D.pkeTop,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
      >
        <img
          src={pkeButton}
          alt="PKE"
          onClick={() => setIsPKEActive(!isPKEActive)}
          style={{
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            opacity: isPKEActive ? 1 : 0.7,
            transition: 'opacity 0.2s ease'
          }}
        />
      </div>

      {/* Main Content - Three Columns */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: D.gapLg,
          padding: D.pad,
          overflow: 'auto'
        }}
      >
        {/* LEFT COLUMN - DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: D.gapMd }}>
          <h2
            onMouseEnter={() => setHoveredHeader('left')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: D.fs18,
              letterSpacing: '4.5px',
              color: (activeColumn === 'left' || hoveredHeader === 'left') ? THEME.AMBER : THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px',
              cursor: 'default',
              transition: 'color 0.2s ease'
            }}
          >
            DETAILS
          </h2>

          {/* Title - nudged up 5px */}
          <div style={{ marginTop: '-5px' }}>
            <label style={labelStyle(isFieldActive('title'))}>Title</label>
            <GradientBorder isActive={isFieldActive('title')}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                onFocus={() => handleFieldFocus('title')}
                onBlur={() => setFocusedField(null)}
                onMouseEnter={() => setHoveredField('title')}
                onMouseLeave={() => setHoveredField(null)}
                style={inputStyle}
                placeholder="Enter course title..."
              />
            </GradientBorder>
          </div>

          {/* Thematic */}
          <div>
            <label style={labelStyle(isFieldActive('thematic'))}>Thematic</label>
            <GradientBorder isActive={isFieldActive('thematic')}>
              <select
                value={formData.thematic}
                onChange={(e) => updateField('thematic', e.target.value)}
                onFocus={() => handleFieldFocus('thematic')}
                onBlur={() => setFocusedField(null)}
                onMouseEnter={() => setHoveredField('thematic')}
                onMouseLeave={() => setHoveredField(null)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select...</option>
                {thematicOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </GradientBorder>
          </div>

          {/* Module + Code */}
          <div style={{ display: 'flex', gap: D.gapSm }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle(isFieldActive('module'))}>Module</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => { updateField('module', Math.max(1, formData.module - 1)); setActiveColumn('left') }}
                  style={moduleButtonStyle}
                  disabled={formData.module <= 1}
                >
                  −
                </button>
                <span style={{
                  color: THEME.AMBER,
                  fontFamily: THEME.FONT_MONO,
                  fontSize: 'clamp(13px, 0.75vw, 16px)',  /* D.fs18 reduced 20% */
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {formData.module}
                </span>
                <button
                  onClick={() => { updateField('module', formData.module + 1); setActiveColumn('left') }}
                  style={moduleButtonStyle}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ flex: 2 }}>
              <label style={labelStyle(isFieldActive('code'))}>Code</label>
              <GradientBorder isActive={isFieldActive('code')}>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => updateField('code', e.target.value)}
                  onFocus={() => handleFieldFocus('code')}
                  onBlur={() => setFocusedField(null)}
                  onMouseEnter={() => setHoveredField('code')}
                  onMouseLeave={() => setHoveredField(null)}
                  style={inputStyle}
                  placeholder="INT-001"
                />
              </GradientBorder>
            </div>
          </div>

          {/* Duration - preserved Y position */}
          <div style={{ marginTop: '15px' }}>
            <label style={{ ...labelStyle(isFieldActive('duration')), marginBottom: '4px' }}>Duration</label>
            <DurationSlider
              value={formData.duration}
              unit={formData.durationUnit}
              onChange={(val, unit) => {
                updateField('duration', val)
                updateField('durationUnit', unit)
                setActiveColumn('left')
              }}
              width={D.sliderW}
            />
          </div>

          {/* Level - 60px spacing */}
          <div style={{ marginTop: '5.56vh' }}>  {/* 60px @ 1080 */}
            <label style={labelStyle(isFieldActive('level'))}>Level</label>
            <Slider
              options={LEVEL_OPTIONS}
              value={formData.level}
              onChange={(val) => { updateField('level', val); setActiveColumn('left') }}
              width={D.sliderW}
              hideStepLabels
              alignBubble="right"
              bubbleTransparent
            />
          </div>

          {/* Seniority - 60px spacing */}
          <div style={{ marginTop: '5.56vh' }}>  {/* 60px @ 1080 */}
            <label style={labelStyle(isFieldActive('seniority'))}>Seniority</label>
            <Slider
              options={SENIORITY_OPTIONS}
              value={formData.seniority}
              onChange={(val) => { updateField('seniority', val); setActiveColumn('left') }}
              width={D.sliderW}
              highlightLast
              hideStepLabels
              alignBubble="right"
              bubbleTransparent
            />
          </div>

          {/* Content Type - 60px spacing */}
          <div style={{ marginTop: '5.56vh', width: D.sliderW }}>  {/* 60px @ 1080 */}
            <label style={{ ...labelStyle(isFieldActive('contentType')), marginBottom: '8px', display: 'block' }}>
              Content Type
            </label>
            {/* Slider track */}
            <div
              ref={contentTypeSliderRef}
              onMouseDown={handleContentTypeMouseDown}
              style={{
                position: 'relative',
                width: '100%',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* Track background - solid grey, no fill */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '4px',
                  background: THEME.BORDER_GREY,
                  borderRadius: '2px'
                }}
              />
              {/* Thumb - 50% larger (24px) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${formData.contentType}%`,
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: THEME.AMBER,
                  border: `2px solid ${THEME.BG_DARK}`,
                  boxShadow: '0 0 6px rgba(212, 115, 12, 0.3)',
                  zIndex: 2
                }}
              />
            </div>
            {/* Theory / Practical labels - burnt orange readouts */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}
            >
              <span style={{ fontSize: '13px', fontFamily: THEME.FONT_PRIMARY, color: THEME.TEXT_SECONDARY }}>
                Theory: <span style={{ color: THEME.AMBER }}>{100 - formData.contentType}%</span>
              </span>
              <span style={{ fontSize: '13px', fontFamily: THEME.FONT_PRIMARY, color: THEME.TEXT_SECONDARY }}>
                Practical: <span style={{ color: THEME.AMBER }}>{formData.contentType}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - SELECT COURSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: D.gapMd }}>
          <h2
            onMouseEnter={() => setHoveredHeader('center')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: D.fs18,
              letterSpacing: '4.5px',
              color: (activeColumn === 'center' || hoveredHeader === 'center') ? THEME.AMBER : THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px',
              cursor: 'default',
              transition: 'color 0.2s ease'
            }}
          >
            SELECT COURSE
          </h2>

          {/* Course Description section - top border at Y=365, aligns with Thematic dropdown bottom */}
          <div style={{ marginTop: '17.13vh', width: '100%' }}>  {/* 185px @ 1080 to reach Y=365 */}
            {/* DESCRIPTION heading - turns orange when children focused */}
            <label
              style={{
                display: 'block',
                fontSize: D.fs18,
                letterSpacing: '4.5px',
                color: activeColumn === 'center' ? THEME.AMBER : THEME.WHITE,
                fontFamily: THEME.FONT_PRIMARY,
                marginBottom: '12px',
                cursor: 'default',
                transition: 'color 0.2s ease'
              }}
            >
              DESCRIPTION
            </label>
            <GradientBorder isActive={isFieldActive('description')}>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                onFocus={() => handleFieldFocus('description')}
                onBlur={() => setFocusedField(null)}
                onMouseEnter={() => setHoveredField('description')}
                onMouseLeave={() => setHoveredField(null)}
                style={{
                  ...inputStyle,
                  minHeight: D.textareaMinH,
                  resize: 'vertical'
                }}
                placeholder="Enter course description..."
              />
            </GradientBorder>
          </div>

          {/* Delivery Mode Buttons */}
          <div>
            <label style={{ ...labelStyle(false), marginBottom: '12px', display: 'block' }}>
              Delivery
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DELIVERY_OPTIONS.map(mode => {
                const isSelected = formData.deliveryModes.includes(mode)
                return (
                  <button
                    key={mode}
                    onClick={() => { toggleDelivery(mode); setActiveColumn('center') }}
                    style={{
                      padding: '12px 14px',
                      fontSize: D.fs14,
                      letterSpacing: '2px',
                      fontFamily: THEME.FONT_PRIMARY,
                      background: isSelected ? THEME.GRADIENT_BUTTON : 'transparent',
                      border: `1px solid ${isSelected ? THEME.AMBER : THEME.BORDER}`,
                      borderRadius: '16px',
                      color: isSelected ? THEME.WHITE : THEME.TEXT_SECONDARY,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {mode}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggle Options */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', width: '100%' }}>
            {[
              { key: 'qualification', label: 'Qualification' },
              { key: 'accredited', label: 'Accredited' },
              { key: 'certified', label: 'Certified' }
            ].map(toggle => (
              <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => { updateField(toggle.key, !formData[toggle.key]); setActiveColumn('center') }}
                  style={{
                    width: '54px',
                    height: '24px',
                    borderRadius: '12px',
                    background: formData[toggle.key] ? THEME.AMBER : THEME.BORDER_GREY,
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: formData[toggle.key] ? '30px' : '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: THEME.WHITE,
                      transition: 'left 0.2s ease'
                    }}
                  />
                </button>
                <span style={{ fontSize: D.fs15, color: THEME.TEXT_SECONDARY, fontFamily: THEME.FONT_PRIMARY }}>
                  {toggle.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - LEARNING OBJECTIVES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: D.gapMd }}>
          <h2
            onMouseEnter={() => setHoveredHeader('right')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: D.fs18,
              letterSpacing: '4.5px',
              color: (activeColumn === 'right' || hoveredHeader === 'right') ? THEME.AMBER : THEME.WHITE,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px',
              cursor: 'default',
              transition: 'color 0.2s ease'
            }}
          >
            LEARNING OBJECTIVES
          </h2>

          {/* LO List - marginTop aligns with Title input in column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: D.gapSm, marginTop: '24px' }}>
            {formData.learningObjectives.map((lo, idx) => {
              const isValid = validateBloomsVerb(lo)
              const isPulsing = invalidLOPulse === idx
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* LO number - burnt orange until confirmed ('+' or 'Save' pressed), then green */}
                  <span
                    style={{
                      fontSize: D.fs14,
                      fontFamily: THEME.FONT_MONO,
                      fontWeight: 600,
                      color: idx <= loConfirmedUpTo ? '#00FF00' : THEME.AMBER,
                      minWidth: '18px',
                      textAlign: 'center',
                      flexShrink: 0,
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <GradientBorder
                      isActive={isFieldActive(`lo-${idx}`)}
                      pulseRed={isPulsing}
                      isInvalid={isValid === false}
                    >
                      <input
                        ref={el => loInputRefs.current[idx] = el}
                        type="text"
                        value={lo}
                        onChange={(e) => updateLO(idx, e.target.value)}
                        onFocus={() => handleFieldFocus(`lo-${idx}`)}
                        onBlur={() => {
                          capitalizeFirstWord(idx)
                          // Validate after a short delay to allow capitalize to complete
                          setTimeout(() => validateAndPulse(idx), 50)
                          setFocusedField(null)
                          // Mark this LO as confirmed on blur (if not already)
                          if (idx > loConfirmedUpTo) {
                            setLoConfirmedUpTo(idx)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            capitalizeFirstWord(idx)
                            setTimeout(() => validateAndPulse(idx), 50)
                            // Mark as confirmed on Enter
                            if (idx > loConfirmedUpTo) {
                              setLoConfirmedUpTo(idx)
                            }
                            e.target.blur()
                          }
                        }}
                        onMouseEnter={() => setHoveredField(`lo-${idx}`)}
                        onMouseLeave={() => setHoveredField(null)}
                        style={{
                          ...inputStyle,
                          // Make text transparent when showing overlay (confirmed + valid + not focused)
                          color: (idx <= loConfirmedUpTo && isValid && focusedField !== `lo-${idx}` && lo.trim())
                            ? 'transparent'
                            : THEME.WHITE
                        }}
                        placeholder="Enter Learning Objective"
                      />
                      {/* Overlay for green verb display when confirmed and valid */}
                      {idx <= loConfirmedUpTo && isValid && focusedField !== `lo-${idx}` && lo.trim() && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            padding: '14px 16px',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: D.fs14,
                            fontFamily: THEME.FONT_PRIMARY,
                            letterSpacing: '2px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ color: '#00FF00' }}>
                            {lo.trim().split(/\s+/)[0]}
                          </span>
                          <span style={{ color: THEME.WHITE }}>
                            {lo.trim().includes(' ') ? ' ' + lo.trim().split(/\s+/).slice(1).join(' ') : ''}
                          </span>
                        </div>
                      )}
                    </GradientBorder>
                  </div>
                  {/* Wastebin or + button - 15px gap from input */}
                  <div style={{ width: '32px', flexShrink: 0, display: 'flex', justifyContent: 'center', marginLeft: '7px' }}>
                    {idx === formData.learningObjectives.length - 1 ? (
                      <button onClick={addLO} style={smallButtonStyle}>+</button>
                    ) : (
                      <WastebinIcon
                        onClick={() => handleWastebinClick(idx)}
                        colorState={wastebinState[idx] || 'normal'}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bloom's Taxonomy expandable section */}
          <div
            style={{
              fontSize: D.fs14,
              fontFamily: THEME.FONT_PRIMARY,
              marginTop: '8px',
              letterSpacing: '1px',
              lineHeight: '1.6'
            }}
          >
            {/* Header - clickable to expand (font increased by 2pts to 14px) */}
            <div
              onClick={() => setBloomsExpanded(prev => !prev)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginBottom: bloomsExpanded ? '12px' : '0'
              }}
            >
              <span style={{ color: THEME.AMBER, transition: 'color 0.2s ease' }}>
                BLOOM'S TAXONOMY
              </span>
              <span style={{ color: THEME.TEXT_DIM }}>: Performance Verbs</span>
              <span style={{
                marginLeft: '8px',
                color: THEME.TEXT_DIM,
                fontSize: '10px',
                transform: bloomsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▼
              </span>
            </div>

            {/* Expandable verbs section */}
            {bloomsExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingLeft: '8px',
                borderLeft: `2px solid ${THEME.BORDER}`
              }}>
                {BLOOMS_CATEGORIES.map(category => (
                  <div key={category.name}>
                    {/* Category heading - font 11px, color white */}
                    <div style={{
                      fontSize: '11px',
                      color: THEME.WHITE,
                      marginBottom: '4px',
                      letterSpacing: '2px'
                    }}>
                      {category.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {category.verbs.map(verb => (
                        <BloomVerbButton
                          key={verb}
                          verb={verb}
                          onInsert={() => {
                            // Insert verb into the active LO (or the last one if none active)
                            const targetIndex = activeLOIndex !== null ? activeLOIndex : formData.learningObjectives.length - 1
                            if (targetIndex >= 0 && targetIndex < formData.learningObjectives.length) {
                              const currentLOs = [...formData.learningObjectives]
                              const currentText = currentLOs[targetIndex] || ''
                              // Always include trailing space after verb for user to continue typing
                              currentLOs[targetIndex] = currentText ? `${verb} ${currentText}` : `${verb} `
                              setFormData(prev => ({ ...prev, learningObjectives: currentLOs }))
                              // Focus the target input and position cursor at end after insertion
                              setTimeout(() => {
                                const input = loInputRefs.current[targetIndex]
                                if (input) {
                                  input.focus()
                                  // Position cursor at end of inserted text
                                  const len = input.value.length
                                  input.setSelectionRange(len, len)
                                }
                              }, 50)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shared Footer Component */}
      <Footer
        currentSection="define"
        onNavigate={handleNavigate}
        isPKEActive={isPKEActive}
        onPKEToggle={setIsPKEActive}
        onSave={handleSave}
        onClear={handleClear}
        onDelete={handleDelete}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={15}
        // Delete workflow props for LO deletion
        deleteLoNumber={deleteLoIndex !== null ? deleteLoIndex + 1 : null}
        deleteStep={deleteStep}
        onDeleteKeep={handleKeepSelection}
        onDeleteConfirm={handleDeleteSelection}
        onDeleteCancel={cancelDeleteWorkflow}
      />
    </div>
  )
}

// BloomVerbButton - Individual verb button with hover state
// Font size 11px, color light grey (TEXT_SECONDARY), hover amber
function BloomVerbButton({ verb, onInsert }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onInsert}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '2px 6px',
        fontSize: '11px',
        fontFamily: THEME.FONT_MONO,
        letterSpacing: '1px',
        color: isHovered ? THEME.AMBER : THEME.TEXT_SECONDARY,
        cursor: 'pointer',
        transition: 'color 0.2s ease'
      }}
    >
      {verb}
    </button>
  )
}

// WastebinIcon - SVG wastebin for LO deletion
// colorState: 'normal' (burnt orange), 'green', 'red'
function WastebinIcon({ onClick, colorState = 'normal', style = {} }) {
  const [isHovered, setIsHovered] = useState(false)

  // Determine fill color based on state
  let fillColor = THEME.AMBER // burnt orange by default
  if (colorState === 'green') fillColor = '#00FF00'
  else if (colorState === 'red') fillColor = '#ff3333'

  // Pulse animation for green/red states
  const isPulsing = colorState === 'green' || colorState === 'red'

  return (
    <svg
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        cursor: 'pointer',
        opacity: isHovered ? 1 : 0.7,
        transition: 'opacity 0.2s ease',
        animation: isPulsing ? 'wastebinPulse 1.5s ease-in-out infinite' : 'none',
        ...style
      }}
    >
      {/* Lid */}
      <rect x="0" y="0" width="18" height="3" rx="1" fill={fillColor} />
      {/* Handle on lid */}
      <rect x="6" y="-2" width="6" height="3" rx="1" fill={fillColor} />
      {/* Body */}
      <path
        d="M2 4L3 18C3 19.1 3.9 20 5 20H13C14.1 20 15 19.1 15 18L16 4H2Z"
        fill={fillColor}
      />
      {/* Vertical lines on body */}
      <line x1="6" y1="7" x2="6" y2="17" stroke={THEME.BG_DARK} strokeWidth="1.5" />
      <line x1="9" y1="7" x2="9" y2="17" stroke={THEME.BG_DARK} strokeWidth="1.5" />
      <line x1="12" y1="7" x2="12" y2="17" stroke={THEME.BG_DARK} strokeWidth="1.5" />
      {/* Inject pulse animation keyframes */}
      {isPulsing && (
        <style>{`
          @keyframes wastebinPulse {
            0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 2px ${fillColor}); }
            50% { opacity: 1; filter: drop-shadow(0 0 8px ${fillColor}); }
          }
        `}</style>
      )}
    </svg>
  )
}

// Style helpers
const labelStyle = (isActive) => ({
  display: 'block',
  fontSize: D.fs15,
  letterSpacing: '3px',
  color: isActive ? THEME.AMBER : THEME.TEXT_SECONDARY,  /* Match Delivery button style */
  fontFamily: THEME.FONT_PRIMARY,
  marginBottom: '9px',
  transition: 'color 0.2s ease'
})

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  background: THEME.BG_INPUT,
  border: 'none',
  borderRadius: '20px',
  color: THEME.WHITE,
  fontSize: D.fs14,
  fontFamily: THEME.FONT_PRIMARY,
  letterSpacing: '2px',
  outline: 'none'
}

const smallButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.AMBER,
  fontSize: '25px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '0 8px',
  transition: 'color 0.2s ease'
}

const moduleButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: THEME.TEXT_SECONDARY,
  fontSize: '21px',
  cursor: 'pointer',
  padding: '4px 8px',
  transition: 'color 0.2s ease'
}

export default Define
