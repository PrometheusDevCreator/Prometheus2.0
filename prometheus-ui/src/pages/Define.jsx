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

  // Learning objectives handlers
  const updateLO = useCallback((index, value) => {
    setFormData(prev => {
      const newLOs = [...prev.learningObjectives]
      newLOs[index] = value
      return { ...prev, learningObjectives: newLOs }
    })
  }, [])

  const addLO = useCallback(() => {
    setFormData(prev => {
      // Confirm all current LOs (turn green) before adding new one
      setLoConfirmedUpTo(prev.learningObjectives.length - 1)
      return {
        ...prev,
        learningObjectives: [...prev.learningObjectives, '']
      }
    })
  }, [])

  // Check if field is active
  const isFieldActive = useCallback((field) => {
    return focusedField === field || (focusedField === null && hoveredField === field)
  }, [focusedField, hoveredField])

  // Handle navigation (resets active column)
  const handleNavigate = useCallback((section) => {
    resetActiveColumn()
    onNavigate?.(section)
  }, [onNavigate, resetActiveColumn])

  // Handle save (resets active column)
  const handleSave = useCallback(() => {
    setCourseData?.(formData)
    setIsPKEActive(false)
    // Confirm all LOs (turn green) on save
    setLoConfirmedUpTo(formData.learningObjectives.length - 1)
    onSaveCountIncrement?.()
    resetActiveColumn()
  }, [formData, setCourseData, onSaveCountIncrement, resetActiveColumn])

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

  // Bloom's Taxonomy verbs categorized
  const bloomsCategories = [
    { name: 'REMEMBER', verbs: ['DEFINE', 'DESCRIBE', 'IDENTIFY', 'LIST', 'NAME', 'RECALL', 'RECOGNIZE', 'STATE'] },
    { name: 'UNDERSTAND', verbs: ['CLASSIFY', 'COMPARE', 'CONTRAST', 'EXPLAIN', 'INTERPRET', 'PARAPHRASE', 'SUMMARIZE', 'DISCUSS'] },
    { name: 'APPLY', verbs: ['APPLY', 'DEMONSTRATE', 'EXECUTE', 'IMPLEMENT', 'OPERATE', 'PERFORM', 'SOLVE', 'USE'] },
    { name: 'ANALYZE', verbs: ['ANALYSE', 'ANALYZE', 'DIFFERENTIATE', 'DISTINGUISH', 'EXAMINE', 'INVESTIGATE', 'ORGANIZE', 'RELATE'] },
    { name: 'EVALUATE', verbs: ['APPRAISE', 'ASSESS', 'CRITIQUE', 'EVALUATE', 'JUDGE', 'JUSTIFY', 'RECOMMEND', 'SUPPORT'] },
    { name: 'CREATE', verbs: ['COMPOSE', 'CONSTRUCT', 'CREATE', 'DESIGN', 'DEVELOP', 'FORMULATE', 'GENERATE', 'PRODUCE'] }
  ]

  // Flat list of all Bloom's verbs for validation
  const bloomsVerbs = bloomsCategories.flatMap(cat => cat.verbs)

  // Check if LO starts with a Bloom's verb
  const validateBloomsVerb = useCallback((text) => {
    if (!text || text.trim().length === 0) return null // No validation for empty
    const firstWord = text.trim().split(/\s+/)[0].toUpperCase()
    return bloomsVerbs.includes(firstWord)
  }, [])

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
          top: '730px',
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
          gap: '40px',
          padding: '40px 60px 120px 60px', // 40px top padding to clear COURSE INFORMATION label
          overflow: 'auto'
        }}
      >
        {/* LEFT COLUMN - DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2
            onMouseEnter={() => setHoveredHeader('left')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: '18px',
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
          <div style={{ display: 'flex', gap: '12px' }}>
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
                  fontSize: '18px',
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

          {/* Duration - 15px gap from Module/Code above */}
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
              width={320}
            />
          </div>

          {/* Level - reduced spacing */}
          <div style={{ marginTop: '0px' }}>
            <label style={labelStyle(isFieldActive('level'))}>Level</label>
            <Slider
              options={LEVEL_OPTIONS}
              value={formData.level}
              onChange={(val) => { updateField('level', val); setActiveColumn('left') }}
              width={320}
              hideStepLabels
              alignBubble="right"
              bubbleTransparent
            />
          </div>

          {/* Seniority - reduced spacing */}
          <div style={{ marginTop: '-10px' }}>
            <label style={labelStyle(isFieldActive('seniority'))}>Seniority</label>
            <Slider
              options={SENIORITY_OPTIONS}
              value={formData.seniority}
              onChange={(val) => { updateField('seniority', val); setActiveColumn('left') }}
              width={320}
              highlightLast
              hideStepLabels
              alignBubble="right"
              bubbleTransparent
            />
          </div>
        </div>

        {/* CENTER COLUMN - DESCRIPTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2
            onMouseEnter={() => setHoveredHeader('center')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: '18px',
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
            DESCRIPTION
          </h2>

          {/* Description Textarea - marginTop aligns with Title input in column 1 */}
          <div style={{ marginTop: '24px', width: '100%' }}>
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
                  minHeight: '200px',
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
                      fontSize: '14px',
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

          {/* Content Type Slider */}
          <div style={{ marginTop: '20px', width: '100%' }}>
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
            {/* Theory / Practical labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}
            >
              <span style={{ fontSize: '13px', fontFamily: THEME.FONT_PRIMARY, color: THEME.TEXT_SECONDARY }}>
                Theory: <span style={{ color: '#00FF00' }}>{100 - formData.contentType}%</span>
              </span>
              <span style={{ fontSize: '13px', fontFamily: THEME.FONT_PRIMARY, color: THEME.TEXT_SECONDARY }}>
                Practical: <span style={{ color: '#00FF00' }}>{formData.contentType}%</span>
              </span>
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
                <span style={{ fontSize: '15px', color: THEME.TEXT_SECONDARY, fontFamily: THEME.FONT_PRIMARY }}>
                  {toggle.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - LEARNING OBJECTIVES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2
            onMouseEnter={() => setHoveredHeader('right')}
            onMouseLeave={() => setHoveredHeader(null)}
            style={{
              fontSize: '18px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            {formData.learningObjectives.map((lo, idx) => {
              const isValid = validateBloomsVerb(lo)
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* LO number - burnt orange until confirmed ('+' or 'Save' pressed), then green */}
                  <span
                    style={{
                      fontSize: '14px',
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
                  <GradientBorder isActive={isFieldActive(`lo-${idx}`)} className="flex-1">
                    <input
                      type="text"
                      value={lo}
                      onChange={(e) => updateLO(idx, e.target.value)}
                      onFocus={() => handleFieldFocus(`lo-${idx}`)}
                      onBlur={() => setFocusedField(null)}
                      onMouseEnter={() => setHoveredField(`lo-${idx}`)}
                      onMouseLeave={() => setHoveredField(null)}
                      style={{
                        ...inputStyle,
                        borderLeft: isValid === false ? `3px solid ${THEME.RED_LIGHT}` : 'none'
                      }}
                      placeholder={idx === 0 ? "EXPLAIN something..." : "Enter learning objective..."}
                    />
                  </GradientBorder>
                  {idx === formData.learningObjectives.length - 1 ? (
                    <button onClick={addLO} style={smallButtonStyle}>+</button>
                  ) : (
                    <div style={{ width: '41px', flexShrink: 0 }} /> /* Placeholder to maintain consistent width */
                  )}
                </div>
              )
            })}
          </div>

          {/* Bloom's Taxonomy expandable section */}
          <div
            style={{
              fontSize: '12px',
              fontFamily: THEME.FONT_PRIMARY,
              marginTop: '8px',
              letterSpacing: '1px',
              lineHeight: '1.6'
            }}
          >
            {/* Header - clickable to expand */}
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
                {bloomsCategories.map(category => (
                  <div key={category.name}>
                    <div style={{
                      fontSize: '10px',
                      color: THEME.TEXT_DIM,
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
                            // Verb insertion handled in Step 7
                            if (activeLOIndex !== null) {
                              const currentLOs = [...formData.learningObjectives]
                              const currentText = currentLOs[activeLOIndex] || ''
                              currentLOs[activeLOIndex] = currentText ? `${verb} ${currentText}` : verb
                              setFormData(prev => ({ ...prev, learningObjectives: currentLOs }))
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
      />
    </div>
  )
}

// BloomVerbButton - Individual verb button with hover state
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
        fontSize: '10px',
        fontFamily: THEME.FONT_MONO,
        letterSpacing: '1px',
        color: isHovered ? THEME.AMBER : THEME.TEXT_DIM,
        cursor: 'pointer',
        transition: 'color 0.2s ease'
      }}
    >
      {verb}
    </button>
  )
}

// Style helpers
const labelStyle = (isActive) => ({
  display: 'block',
  fontSize: '15px',
  letterSpacing: '3px',
  color: isActive ? THEME.AMBER : THEME.TEXT_DIM,
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
  fontSize: '14px',
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
