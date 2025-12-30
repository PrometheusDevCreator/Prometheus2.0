/**
 * TemplateHub.jsx - Central Radial Hub for FORMAT Page
 *
 * Displays:
 * - Central "TEMPLATES" hub circle
 * - Four primary output nodes (Presentation, Timetable, Lesson Plan, QA Form)
 * - Radial layout with connecting lines
 *
 * Visual Design:
 * - Follows NavWheel/WheelBase patterns
 * - Amber gradient borders, green glow on mapped
 */

import { useState, useCallback } from 'react'
import { THEME } from '../../constants/theme'
import { useTemplate } from '../../contexts/TemplateContext'
import OutputNode from './OutputNode'

// Hub dimensions
const HUB_SIZE = 120
const NODE_RADIUS = 160
const NODE_SIZE = 80
const CANVAS_SIZE = 450

// Output positions (radial, from center)
const OUTPUT_POSITIONS = [
  { type: 'presentation', angle: -90, label: 'PRESENTATION' },   // Top
  { type: 'timetable', angle: 0, label: 'TIMETABLE' },           // Right
  { type: 'lesson_plan', angle: 180, label: 'LESSON PLAN' },     // Left
  { type: 'qa_form', angle: 90, label: 'QA FORM' }               // Bottom
]

function TemplateHub() {
  const { selectedOutput, setSelectedOutput, getOutputStatus } = useTemplate()
  const [hoveredOutput, setHoveredOutput] = useState(null)

  // Calculate node position from angle
  const getNodePosition = useCallback((angle) => {
    const radians = angle * (Math.PI / 180)
    const x = Math.cos(radians) * NODE_RADIUS
    const y = Math.sin(radians) * NODE_RADIUS
    return { x, y }
  }, [])

  // Handle output selection
  const handleOutputClick = useCallback((outputType) => {
    setSelectedOutput(outputType === selectedOutput ? null : outputType)
  }, [selectedOutput, setSelectedOutput])

  const centerX = CANVAS_SIZE / 2
  const centerY = CANVAS_SIZE / 2

  return (
    <div
      style={{
        position: 'relative',
        width: CANVAS_SIZE,
        height: CANVAS_SIZE
      }}
    >
      {/* SVG for connecting lines and decorative elements */}
      <svg
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      >
        {/* Outer decorative ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={NODE_RADIUS + NODE_SIZE / 2 + 20}
          fill="none"
          stroke={THEME.AMBER_DARKEST}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Connecting lines to each output */}
        {OUTPUT_POSITIONS.map(({ type, angle }) => {
          const pos = getNodePosition(angle)
          const status = getOutputStatus(type)
          const lineColor = status === 'mapped' ? THEME.GREEN_BRIGHT :
                           status === 'loaded' ? THEME.AMBER :
                           THEME.AMBER_DARKEST

          return (
            <line
              key={type}
              x1={centerX}
              y1={centerY}
              x2={centerX + pos.x}
              y2={centerY + pos.y}
              stroke={lineColor}
              strokeWidth="1"
              opacity="0.4"
            />
          )
        })}

        {/* Central hub glow filter */}
        <defs>
          <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Central Hub Circle */}
      <div
        style={{
          position: 'absolute',
          left: centerX - HUB_SIZE / 2,
          top: centerY - HUB_SIZE / 2,
          width: HUB_SIZE,
          height: HUB_SIZE,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${THEME.BG_PANEL || '#1a1a1a'} 0%, ${THEME.BG_DARK} 100%)`,
          border: `2px solid ${THEME.AMBER_DARK}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 30px ${THEME.AMBER_DARKEST}40`
        }}
      >
        {/* Hub icon/label */}
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '3px',
            color: THEME.AMBER,
            fontFamily: THEME.FONT_PRIMARY,
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          TEMPLATES
        </div>
      </div>

      {/* Output Nodes */}
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
