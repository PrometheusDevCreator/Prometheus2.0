/**
 * GradientBorder - Shared border wrapper component for input fields
 *
 * Provides consistent border styling for input fields across the application.
 * Defined as a stable component to prevent re-renders that cause focus loss.
 *
 * Border States:
 * - Default (empty): Dark border (#1f1f1f) matching Delivery Method buttons
 * - hasValue (data entered): Light grey (#767171), 0.5px thickness
 * - isActive (hover/focus): Burnt orange (#FF6600)
 * - isInvalid: Bright red (#ff3333) with glow
 * - pulseRed: Red pulse animation for validation errors
 */
function GradientBorder({ children, className = '', isActive = false, pulseRed = false, isInvalid = false, hasValue = false }) {
  // Default: Match Delivery Method button border (#1f1f1f)
  const defaultBorder = '#1f1f1f'

  // After data entry: Light grey, no gradient
  const hasValueBorder = '#767171'

  // B10: Burnt orange solid border when active (hover/focus)
  const activeColor = '#FF6600'

  // Red color for validation errors
  const redColor = '#c0392b'

  // Bright red for persistent invalid state
  const invalidColor = '#ff3333'

  // Determine background color (priority: pulseRed > isInvalid > isActive > hasValue > default)
  let background = defaultBorder
  if (pulseRed) {
    background = redColor
  } else if (isInvalid) {
    background = invalidColor
  } else if (isActive) {
    background = activeColor
  } else if (hasValue) {
    background = hasValueBorder
  }

  // Use thinner border (0.5px) when hasValue is true and not active/error
  const useThinner = hasValue && !isActive && !pulseRed && !isInvalid
  const paddingClass = useThinner ? 'p-[0.5px]' : 'p-[1px]'

  return (
    <div
      className={`${paddingClass} rounded-[20px] ${className}`}
      style={{
        background,
        animation: pulseRed ? 'redPulse 0.3s ease-in-out 2' : 'none',
        boxShadow: pulseRed ? `0 0 10px ${redColor}` : (isInvalid ? `0 0 6px ${invalidColor}` : 'none'),
        transition: 'box-shadow 0.2s ease, background 0.2s ease, padding 0.2s ease'
      }}
    >
      {children}
      {/* Inject keyframes for red pulse animation */}
      {pulseRed && (
        <style>{`
          @keyframes redPulse {
            0%, 100% { box-shadow: 0 0 5px ${redColor}; }
            50% { box-shadow: 0 0 15px ${redColor}, 0 0 20px ${redColor}; }
          }
        `}</style>
      )}
    </div>
  )
}

export default GradientBorder
