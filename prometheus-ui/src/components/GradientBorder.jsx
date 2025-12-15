/**
 * GradientBorder - Shared gradient border wrapper component
 *
 * Provides consistent gradient border styling for input fields across the application.
 * Defined as a stable component to prevent re-renders that cause focus loss.
 *
 * A3 Fix: Gradient border with proper colors:
 * - 1px border thickness (flat, no bevel)
 * - Rounded corners (rounded-[20px]) — matches input border-radius
 * - Gradient: darkest #767171 at ends, lightest #FFFFFF at center
 *
 * B10: Supports isActive prop for burnt orange (#FF6600) highlight on hover/focus.
 * pulseRed: When true, shows a quick red pulse animation for validation errors.
 * isInvalid: When true, shows persistent bright red border for invalid state.
 */
function GradientBorder({ children, className = '', isActive = false, pulseRed = false, isInvalid = false }) {
  // A3: Gradient - lightest (#FFFFFF) at center, darkest (#767171) at ends
  const defaultGradient = 'linear-gradient(to right, #767171, #ffffff 50%, #767171)'

  // B10: Burnt orange solid border when active (hover/focus)
  const activeColor = '#FF6600'

  // Red color for validation errors
  const redColor = '#c0392b'

  // Bright red for persistent invalid state
  const invalidColor = '#ff3333'

  // Determine background color (priority: pulseRed > isInvalid > isActive > default)
  let background = defaultGradient
  if (pulseRed) {
    background = redColor
  } else if (isInvalid) {
    background = invalidColor
  } else if (isActive) {
    background = activeColor
  }

  return (
    <div
      className={`p-[1px] rounded-[20px] ${className}`}
      style={{
        background,
        animation: pulseRed ? 'redPulse 0.3s ease-in-out 2' : 'none',
        boxShadow: pulseRed ? `0 0 10px ${redColor}` : (isInvalid ? `0 0 6px ${invalidColor}` : 'none'),
        transition: 'box-shadow 0.2s ease, background 0.2s ease'
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
