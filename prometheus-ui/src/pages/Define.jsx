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

import { useState, useCallback } from 'react'
import { THEME, LEVEL_OPTIONS, SENIORITY_OPTIONS, DURATION_UNITS, DURATION_MAX, DELIVERY_OPTIONS } from '../constants/theme'
import Slider from '../components/Slider'
import GradientBorder from '../components/GradientBorder'
import Footer from '../components/Footer'
import pkeButton from '../assets/PKE_Button.png'

function Define({ onNavigate, courseData, setCourseData, courseLoaded, user, courseState, onSaveCountIncrement }) {
  const [isPKEActive, setIsPKEActive] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [hoveredField, setHoveredField] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    title: courseData?.title || '',
    thematic: courseData?.thematic || '',
    module: courseData?.module || 1,
    code: courseData?.code || '',
    duration: courseData?.duration || 0,
    durationUnit: courseData?.durationUnit || 'DAYS',
    level: courseData?.level || 'FOUNDATIONAL',
    seniority: courseData?.seniority || 'JUNIOR',
    description: courseData?.description || '',
    deliveryModes: courseData?.deliveryModes || [],
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
    setFormData(prev => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, '']
    }))
  }, [])

  // Check if field is active
  const isFieldActive = useCallback((field) => {
    return focusedField === field || (focusedField === null && hoveredField === field)
  }, [focusedField, hoveredField])

  // Handle navigation
  const handleNavigate = useCallback((section) => {
    onNavigate?.(section)
  }, [onNavigate])

  // Handle save
  const handleSave = useCallback(() => {
    setCourseData?.(formData)
    setIsPKEActive(false)
    onSaveCountIncrement?.()
  }, [formData, setCourseData, onSaveCountIncrement])

  // Bloom's Taxonomy verbs for validation
  const bloomsVerbs = [
    // Remember
    'DEFINE', 'DESCRIBE', 'IDENTIFY', 'LIST', 'NAME', 'RECALL', 'RECOGNIZE', 'STATE',
    // Understand
    'CLASSIFY', 'COMPARE', 'CONTRAST', 'EXPLAIN', 'INTERPRET', 'PARAPHRASE', 'SUMMARIZE', 'DISCUSS',
    // Apply
    'APPLY', 'DEMONSTRATE', 'EXECUTE', 'IMPLEMENT', 'OPERATE', 'PERFORM', 'SOLVE', 'USE',
    // Analyze
    'ANALYSE', 'ANALYZE', 'DIFFERENTIATE', 'DISTINGUISH', 'EXAMINE', 'INVESTIGATE', 'ORGANIZE', 'RELATE',
    // Evaluate
    'APPRAISE', 'ASSESS', 'CRITIQUE', 'EVALUATE', 'JUDGE', 'JUSTIFY', 'RECOMMEND', 'SUPPORT',
    // Create
    'COMPOSE', 'CONSTRUCT', 'CREATE', 'DESIGN', 'DEVELOP', 'FORMULATE', 'GENERATE', 'PRODUCE'
  ]

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
      {/* PKE Button - positioned top right of content area */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '60px',
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
          padding: '20px 60px 120px 60px', // 20px top padding to move content down
          overflow: 'auto'
        }}
      >
        {/* LEFT COLUMN - DETAILS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2
            style={{
              fontSize: '18px',
              letterSpacing: '4.5px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px'
            }}
          >
            DETAILS
          </h2>

          {/* Title */}
          <div>
            <label style={labelStyle(isFieldActive('title'))}>Title</label>
            <GradientBorder isActive={isFieldActive('title')}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                onFocus={() => setFocusedField('title')}
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
                onFocus={() => setFocusedField('thematic')}
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
                  onClick={() => updateField('module', Math.max(1, formData.module - 1))}
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
                  onClick={() => updateField('module', formData.module + 1)}
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
                  onFocus={() => setFocusedField('code')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle}
                  placeholder="INT-001"
                />
              </GradientBorder>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={{ ...labelStyle(isFieldActive('duration')), marginBottom: '4px' }}>Duration</label>
            <div style={{ display: 'flex', flexDirection: 'column', width: '320px' }}>
              <Slider
                continuous
                value={formData.duration}
                min={0}
                max={DURATION_MAX[formData.durationUnit]}
                onChange={(val) => updateField('duration', val)}
                showBubble={false}
                width={320}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '4px'
                }}
              >
                <span style={{ color: '#d0d0d0', fontFamily: THEME.FONT_MONO, fontSize: '17px' }}>
                  {formData.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Level */}
          <div style={{ marginTop: '10px' }}>
            <label style={labelStyle(isFieldActive('level'))}>Level</label>
            <Slider
              options={LEVEL_OPTIONS}
              value={formData.level}
              onChange={(val) => updateField('level', val)}
              width={320}
              hideStepLabels
              alignBubble="right"
              bubbleTransparent
            />
          </div>

          {/* Seniority */}
          <div>
            <label style={labelStyle(isFieldActive('seniority'))}>Seniority</label>
            <Slider
              options={SENIORITY_OPTIONS}
              value={formData.seniority}
              onChange={(val) => updateField('seniority', val)}
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
            style={{
              fontSize: '18px',
              letterSpacing: '4.5px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px'
            }}
          >
            DESCRIPTION
          </h2>

          {/* Description Textarea */}
          <GradientBorder isActive={isFieldActive('description')}>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              onFocus={() => setFocusedField('description')}
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

          {/* Delivery Mode Buttons */}
          <div>
            <label style={{ ...labelStyle(false), marginBottom: '12px', display: 'block' }}>
              Delivery
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DELIVERY_OPTIONS.map(mode => {
                const isSelected = formData.deliveryModes.includes(mode)
                return (
                  <button
                    key={mode}
                    onClick={() => toggleDelivery(mode)}
                    style={{
                      padding: '12px 21px',
                      fontSize: '14px',
                      letterSpacing: '2px',
                      fontFamily: THEME.FONT_PRIMARY,
                      background: isSelected ? THEME.GRADIENT_BUTTON : 'transparent',
                      border: `1px solid ${isSelected ? THEME.AMBER : THEME.BORDER}`,
                      borderRadius: '3px',
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
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            {[
              { key: 'qualification', label: 'Qualification' },
              { key: 'accredited', label: 'Accredited' },
              { key: 'certified', label: 'Certified' }
            ].map(toggle => (
              <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateField(toggle.key, !formData[toggle.key])}
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
            style={{
              fontSize: '18px',
              letterSpacing: '4.5px',
              color: THEME.AMBER,
              fontFamily: THEME.FONT_PRIMARY,
              borderBottom: `1px solid ${THEME.BORDER}`,
              paddingBottom: '8px',
              marginBottom: '8px'
            }}
          >
            LEARNING OBJECTIVES
          </h2>

          {/* LO List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formData.learningObjectives.map((lo, idx) => {
              const isValid = validateBloomsVerb(lo)
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* LO number with validation indicator */}
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isValid === null
                        ? THEME.AMBER_DARK
                        : isValid
                          ? THEME.GREEN_DARK || '#1a4d1a'
                          : THEME.RED_DARK || '#4d1a1a',
                      border: isValid === null
                        ? 'none'
                        : `2px solid ${isValid ? THEME.GREEN_LIGHT : THEME.RED_LIGHT}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: THEME.WHITE,
                      fontFamily: THEME.FONT_MONO,
                      flexShrink: 0,
                      transition: 'all 0.3s ease'
                    }}
                    title={isValid === null ? 'Enter learning objective' : isValid ? 'Valid Bloom\'s verb' : 'Start with a Bloom\'s verb'}
                  >
                    {idx + 1}
                  </span>
                  <GradientBorder isActive={isFieldActive(`lo-${idx}`)} className="flex-1">
                    <input
                      type="text"
                      value={lo}
                      onChange={(e) => updateLO(idx, e.target.value)}
                      onFocus={() => setFocusedField(`lo-${idx}`)}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...inputStyle,
                        borderLeft: isValid === false ? `3px solid ${THEME.RED_LIGHT}` : 'none'
                      }}
                      placeholder={idx === 0 ? "EXPLAIN something..." : "Enter learning objective..."}
                    />
                  </GradientBorder>
                  {idx === formData.learningObjectives.length - 1 && (
                    <button onClick={addLO} style={smallButtonStyle}>+</button>
                  )}
                </div>
              )
            })}
          </div>

          {/* CLO hint with Bloom's verb examples */}
          <div
            style={{
              fontSize: '12px',
              color: THEME.TEXT_DIM,
              fontFamily: THEME.FONT_MONO,
              marginTop: '8px',
              letterSpacing: '1px',
              lineHeight: '1.6'
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: THEME.AMBER }}>TIP:</span> Start with a Bloom's verb
            </div>
            <div style={{ fontSize: '7px', color: THEME.TEXT_MUTED }}>
              REMEMBER: Define, Identify, List | UNDERSTAND: Explain, Describe, Compare<br/>
              APPLY: Apply, Demonstrate, Solve | ANALYZE: Analyse, Examine, Investigate<br/>
              EVALUATE: Assess, Critique, Justify | CREATE: Design, Develop, Produce
            </div>
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
        onClear={() => {
          setFormData({
            title: '',
            thematic: '',
            module: 1,
            code: '',
            duration: 0,
            durationUnit: 'DAYS',
            level: 'FOUNDATIONAL',
            seniority: 'JUNIOR',
            description: '',
            deliveryModes: [],
            qualification: false,
            accredited: false,
            certified: false,
            learningObjectives: ['']
          })
        }}
        onDelete={() => {}}
        user={user || { name: '---' }}
        courseState={courseState || { startDate: null, saveCount: 0 }}
        progress={15}
      />
    </div>
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
  borderRadius: '4px',
  color: THEME.TEXT_PRIMARY,
  fontSize: '18px',
  fontFamily: THEME.FONT_MONO,
  outline: 'none'
}

const smallButtonStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: THEME.AMBER_DARK,
  border: 'none',
  color: THEME.WHITE,
  fontSize: '21px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s ease'
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
