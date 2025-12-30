/**
 * TemplateHub.jsx - Central Radial Hub for FORMAT Page
 *
 * CCO-FORMAT-HUB-001: Aligned with Navigation Hub
 *
 * Changes from original:
 * - Identical size, stroke width, typography, glow to NavWheel
 * - Centre label is GENERATE (navigates to GENERATE page only)
 * - Output nodes at NE/SE/SW/NW (45°, 135°, 225°, 315°)
 * - Reuses NavWheel visual patterns
 */

import { useState, useCallback } from 'react'
import { THEME, ANIMATION } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import OutputNode from './OutputNode'

// Use same dimensions as NavWheel expanded state
const WHEEL_SIZE = ANIMATION.WHEEL_EXPANDED_SIZE || 280
const CENTER_SIZE = 70
const LABEL_RADIUS = 100
const NODE_SIZE = 70

// Output positions at NE/SE/SW/NW (diagonal positions)
const OUTPUT_POSITIONS = [
  { type: 'presentation', angle: 45, label: 'PRESENTATION' },   // NE
  { type: 'timetable', angle: 135, label: 'TIMETABLE' },        // SE
  { type: 'lesson_plan', angle: 225, label: 'LESSON PLAN' },    // SW
  { type: 'qa_form', angle: 315, label: 'QA FORM' }             // NW
]

function TemplateHub({ onNavigate }) {
  const { selectedOutput, setSelectedOutput, getOutputStatus } = useTemplate()
  const [hoveredOutput, setHoveredOutput] = useState(null)
  const [centerHovered, setCenterHovered] = useState(false)

  // Calculate node position from angle (same as NavWheel)
  const getNodePosition = useCallback((angle) => {
    const radians = (angle - 90) * (Math.PI / 180) // -90 to start from top
    const x = Math.cos(radians) * LABEL_RADIUS
    const y = Math.sin(radians) * LABEL_RADIUS
    return { x, y }
  }, [])

  // Handle output selection
  const handleOutputClick = useCallback((outputType) => {
    setSelectedOutput(outputType === selectedOutput ? null : outputType)
  }, [selectedOutput, setSelectedOutput])

  // Handle centre click - navigate to GENERATE
  const handleCenterClick = useCallback(() => {
    if (onNavigate) {
      onNavigate('generate')
    }
  }, [onNavigate])

  const centerX = WHEEL_SIZE / 2
  const centerY = WHEEL_SIZE / 2

  return (
    <div
      style={{
        position: 'relative',
        width: WHEEL_SIZE,
        height: WHEEL_SIZE
      }}
    >
      {/* SVG for rings and decorative elements - matches NavWheel */}
      <svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <defs>
          <linearGradient id="formatRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={THEME.AMBER_DARKEST} />
            <stop offset="50%" stopColor={THEME.AMBER_DARK} />
            <stop offset="100%" stopColor={THEME.AMBER_DARKEST} />
          </linearGradient>
        </defs>

        {/* Outer decorative ring - matches NavWheel */}
        <circle
          cx={centerX}
          cy={centerY}
          r={WHEEL_SIZE / 2 - 2}
          fill="none"
          stroke="url(#formatRingGrad)"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Inner track circle - matches NavWheel */}
        <circle
          cx={centerX}
          cy={centerY}
          r={LABEL_RADIUS}
          fill="none"
          stroke={THEME.BORDER}
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Tick marks at output positions - matches NavWheel */}
        {OUTPUT_POSITIONS.map(({ type, angle }) => {
          const radians = angle * (Math.PI / 180)
          const innerR = WHEEL_SIZE / 2 - 12
          const outerR = WHEEL_SIZE / 2 - 4
          return (
            <line
              key={`tick-${type}`}
              x1={centerX + innerR * Math.sin(radians)}
              y1={centerY - innerR * Math.cos(radians)}
              x2={centerX + outerR * Math.sin(radians)}
              y2={centerY - outerR * Math.cos(radians)}
              stroke={THEME.AMBER_DARKEST}
              strokeWidth="2"
            />
          )
        })}

        {/* Connecting lines to each output */}
        {OUTPUT_POSITIONS.map(({ type, angle }) => {
          const pos = getNodePosition(angle)
          const status = getOutputStatus(type)
          const isSelected = selectedOutput === type
          const lineColor = status === 'mapped' ? THEME.GREEN_BRIGHT :
                           status === 'loaded' ? THEME.AMBER :
                           isSelected ? THEME.AMBER :
                           THEME.AMBER_DARKEST

          return (
            <line
              key={`line-${type}`}
              x1={centerX}
              y1={centerY}
              x2={centerX + pos.x}
              y2={centerY + pos.y}
              stroke={lineColor}
              strokeWidth="1"
              opacity={isSelected ? "0.6" : "0.3"}
            />
          )
        })}

        {/* Direction arrows at output positions - matches NavWheel */}
        {OUTPUT_POSITIONS.map(({ type, angle }) => {
          const arrowRadius = WHEEL_SIZE / 2 - 25
          const radians = (angle - 90) * (Math.PI / 180)
          const x = centerX + Math.cos(radians) * arrowRadius
          const y = centerY + Math.sin(radians) * arrowRadius

          const arrowSize = 8
          const arrowAngle = angle * (Math.PI / 180)
          const status = getOutputStatus(type)
          const isSelected = selectedOutput === type

          return (
            <polygon
              key={`arrow-${type}`}
              points={`
                ${x + Math.sin(arrowAngle) * arrowSize},${y - Math.cos(arrowAngle) * arrowSize}
                ${x - Math.cos(arrowAngle) * arrowSize / 2 - Math.sin(arrowAngle) * arrowSize / 2},${y - Math.sin(arrowAngle) * arrowSize / 2 + Math.cos(arrowAngle) * arrowSize / 2}
                ${x + Math.cos(arrowAngle) * arrowSize / 2 - Math.sin(arrowAngle) * arrowSize / 2},${y + Math.sin(arrowAngle) * arrowSize / 2 + Math.cos(arrowAngle) * arrowSize / 2}
              `}
              fill={isSelected || status === 'mapped' ? THEME.AMBER : THEME.AMBER_DARK}
              opacity="0.8"
            />
          )
        })}
      </svg>

      {/* Center Hub - GENERATE - matches NavWheel center styling */}
      <div
        onClick={handleCenterClick}
        onMouseEnter={() => setCenterHovered(true)}
        onMouseLeave={() => setCenterHovered(false)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: CENTER_SIZE,
          height: CENTER_SIZE,
          borderRadius: '50%',
          background: THEME.BG_DARK,
          border: `2px solid ${centerHovered ? THEME.AMBER : THEME.AMBER_DARK}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 10,
          boxShadow: centerHovered ? `0 0 20px rgba(212, 115, 12, 0.4)` : `0 0 20px rgba(212, 115, 12, 0.2)`
        }}
      >
        <div
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: centerHovered ? THEME.AMBER : THEME.TEXT_DIM,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center',
            transition: 'color 0.3s ease'
          }}
        >
          GENERATE
        </div>
      </div>

      {/* Output Nodes at diagonal positions */}
      {OUTPUT_POSITIONS.map(({ type, angle, label }) => {
        const pos = getNodePosition(angle)
        const status = getOutputStatus(type)
        const isSelected = selectedOutput === type
        const isHovered = hoveredOutput === type

        return (
          <OutputNode
            key={type}
            type={type}
            label={label}
            status={status}
            isSelected={isSelected}
            isHovered={isHovered}
            onClick={() => handleOutputClick(type)}
            onMouseEnter={() => setHoveredOutput(type)}
            onMouseLeave={() => setHoveredOutput(null)}
            style={{
              position: 'absolute',
              left: centerX + pos.x - NODE_SIZE / 2,
              top: centerY + pos.y - NODE_SIZE / 2,
              width: NODE_SIZE,
              height: NODE_SIZE
            }}
          />
        )
      })}
    </div>
  )
}

export default TemplateHub
