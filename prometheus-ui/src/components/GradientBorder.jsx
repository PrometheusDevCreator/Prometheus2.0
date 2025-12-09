/**
 * GradientBorder - Shared gradient border wrapper component
 * 
 * Provides consistent gradient border styling for input fields across the application.
 * Defined as a stable component to prevent re-renders that cause focus loss.
 * 
 * A7: Gradient now has lightest point centered horizontally on top/bottom borders,
 * fading darker toward both left and right ends.
 * 
 * B10: Supports isActive prop for burnt orange (#FF6600) highlight on hover/focus.
 */
function GradientBorder({ children, className = '', isActive = false }) {
  // A7: New gradient style - lightest at center, darker toward ends
  // Using linear gradient from left to right: dark -> light (center) -> dark
  const defaultGradient = 'linear-gradient(to right, #3b3838, #767171 25%, #ffffff 50%, #767171 75%, #3b3838)'
  
  // B10: Burnt orange solid border when active (hover/focus)
  const activeStyle = '#FF6600'
  
  return (
    <div 
      className={`p-[1px] rounded-[4px] ${className}`}
      style={{
        background: isActive ? activeStyle : defaultGradient
      }}
    >
      {children}
    </div>
  )
}

export default GradientBorder
